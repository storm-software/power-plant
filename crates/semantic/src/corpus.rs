use rustc_hash::FxHashMap;
use xxhash_rust::xxh3::{xxh3_64, xxh3_64_with_seed};

#[cfg(not(target_family = "wasm"))]
use rayon::prelude::*;

use crate::constants::{
    CORPUS_INIT_CAP, DIM, INT8_MAX, MAX_OCCUR, RI_SEED_BASE, RRI_ALPHA, RRI_BETA, SPARSE_NNZE,
    UNIT_POS, WINDOW,
};
use crate::pretrained::PretrainedEmbeddings;
use crate::vector::{SemVector, normalize};

const NOT_FOUND: i32 = -1;
const RESOLVE_CHUNK: usize = 64;

#[derive(Debug, Clone)]
struct CorpusEntry {
    token: String,
    doc_freq: usize,
    enriched_vec: SemVector,
}

/// Corpus for IDF and Random Indexing co-occurrence enrichment.
#[derive(Debug)]
pub struct Corpus {
    token_map: FxHashMap<String, usize>,
    entries: Vec<CorpusEntry>,
    doc_count: usize,
    finalized: bool,
    doc_token_ids: Vec<Vec<i32>>,
}

impl Default for Corpus {
    fn default() -> Self {
        Self::new()
    }
}

impl Corpus {
    #[must_use]
    pub fn new() -> Self {
        Self {
            token_map: FxHashMap::with_capacity_and_hasher(CORPUS_INIT_CAP, Default::default()),
            entries: Vec::new(),
            doc_count: 0,
            finalized: false,
            doc_token_ids: Vec::new(),
        }
    }

    /// Register one document's tokens for IDF counting.
    pub fn add_doc(&mut self, tokens: &[&str]) {
        if tokens.is_empty() {
            return;
        }

        let mut seen = Vec::new();
        let mut ids = Vec::with_capacity(tokens.len());

        for token in tokens {
            let tid = self.get_or_add(token);
            ids.push(tid);
            if tid < 0 {
                continue;
            }
            let tid = tid as usize;
            if !seen.contains(&tid) {
                seen.push(tid);
                self.entries[tid].doc_freq += 1;
            }
        }

        self.doc_token_ids.push(ids);
        self.doc_count += 1;
    }

    /// Batch-build corpus from pre-tokenized documents (parallel doc-freq pass).
    pub fn add_docs_batch(&mut self, docs: &[Vec<String>]) {
        if docs.is_empty() {
            return;
        }

        for doc in docs {
            for token in doc {
                let _ = self.get_or_add(token);
            }
        }

        let entry_count = self.entries.len();
        let token_map = &self.token_map;

        let resolved = parallel_resolve_docs(docs, token_map, entry_count);
        let mut doc_freq_delta = vec![0_usize; entry_count];
        for ids in &resolved {
            let mut seen = Vec::new();
            for &tid in ids {
                if tid < 0 {
                    continue;
                }
                let tid = tid as usize;
                if !seen.contains(&tid) {
                    seen.push(tid);
                    doc_freq_delta[tid] += 1;
                }
            }
        }

        for (i, &df) in doc_freq_delta.iter().enumerate() {
            self.entries[i].doc_freq += df;
        }

        self.doc_token_ids.extend(resolved);
        self.doc_count += docs.len();
    }

    /// Finalize: compute enriched token vectors via co-occurrence (parallel).
    pub fn finalize(&mut self, pretrained: &dyn PretrainedEmbeddings) {
        if self.finalized {
            return;
        }

        pretrained.ensure_ready();

        let Some(rev) = build_reverse_index(self) else {
            self.finalized = true;
            return;
        };

        let src_entries = build_all_src_entries(self, pretrained);
        let pass1 = run_cooccur_pass1(self, &src_entries, &rev);
        for (entry, vec) in self.entries.iter_mut().zip(pass1) {
            entry.enriched_vec = vec;
        }

        run_cooccur_pass2(self, &rev);
        self.finalized = true;
    }

    /// IDF weight for a token. Returns `0.0` for unknown tokens.
    #[must_use]
    pub fn idf(&self, token: &str) -> f32 {
        if self.doc_count == 0 {
            return 0.0;
        }
        let Some(&idx) = self.token_map.get(token) else {
            return 0.0;
        };
        let df = self.entries[idx].doc_freq;
        if df == 0 {
            return 0.0;
        }
        (self.doc_count as f32 / df as f32).ln()
    }

    /// Enriched Random Indexing vector for a token (after finalize).
    #[must_use]
    pub fn ri_vec(&self, token: &str) -> Option<&SemVector> {
        let &idx = self.token_map.get(token)?;
        Some(&self.entries[idx].enriched_vec)
    }

    #[must_use]
    pub fn doc_count(&self) -> usize {
        self.doc_count
    }

    #[must_use]
    pub fn token_count(&self) -> usize {
        self.entries.len()
    }

    /// Token name, enriched vector, and IDF by vocabulary index.
    #[must_use]
    pub fn token_at(&self, index: usize) -> Option<(&str, &SemVector, f32)> {
        let entry = self.entries.get(index)?;
        let idf = if self.doc_count > 0 && entry.doc_freq > 0 {
            (self.doc_count as f32 / entry.doc_freq as f32).ln()
        } else {
            0.0
        };
        Some((entry.token.as_str(), &entry.enriched_vec, idf))
    }

    fn get_or_add(&mut self, token: &str) -> i32 {
        if let Some(&idx) = self.token_map.get(token) {
            return idx as i32;
        }
        let idx = self.entries.len();
        self.entries.push(CorpusEntry {
            token: token.to_owned(),
            doc_freq: 0,
            enriched_vec: SemVector::default(),
        });
        self.token_map.insert(token.to_owned(), idx);
        idx as i32
    }
}

#[derive(Debug, Clone, Copy)]
struct CooccurPos {
    doc_id: i32,
    pos: i32,
}

struct ReverseIndex {
    offsets: Vec<usize>,
    flat: Vec<CooccurPos>,
}

#[derive(Debug, Clone)]
enum SrcEntry {
    Sparse {
        nnz: u8,
        indices: [u16; SPARSE_NNZE],
        values: [f32; SPARSE_NNZE],
    },
    Dense([i8; DIM]),
}

fn parallel_resolve_docs(
    docs: &[Vec<String>],
    token_map: &FxHashMap<String, usize>,
    _entry_count: usize,
) -> Vec<Vec<i32>> {
    #[cfg(not(target_family = "wasm"))]
    {
        docs.par_chunks(RESOLVE_CHUNK)
            .flat_map(|chunk| {
                chunk
                    .iter()
                    .map(|doc| resolve_one_doc(doc, token_map))
                    .collect::<Vec<_>>()
            })
            .collect()
    }
    #[cfg(target_family = "wasm")]
    {
        docs.iter()
            .map(|doc| resolve_one_doc(doc, token_map))
            .collect()
    }
}

fn resolve_one_doc(doc: &[String], token_map: &FxHashMap<String, usize>) -> Vec<i32> {
    let mut ids = Vec::with_capacity(doc.len());
    for token in doc {
        let tid = token_map
            .get(token.as_str())
            .copied()
            .map_or(NOT_FOUND, |v| v as i32);
        ids.push(tid);
    }
    ids
}

fn build_reverse_index(corpus: &Corpus) -> Option<ReverseIndex> {
    let entry_count = corpus.entries.len();
    let mut counts = vec![0_usize; entry_count];
    let mut total = 0_usize;

    for ids in &corpus.doc_token_ids {
        for &tid in ids {
            if tid >= 0 && (tid as usize) < entry_count {
                counts[tid as usize] += 1;
                total += 1;
            }
        }
    }

    let mut offsets = vec![0_usize; entry_count + 1];
    let mut running = 0_usize;
    for t in 0..entry_count {
        offsets[t] = running;
        running += counts[t];
        counts[t] = 0;
    }
    offsets[entry_count] = running;

    let mut flat = vec![
        CooccurPos {
            doc_id: 0,
            pos: 0,
        };
        total.max(1)
    ];

    for (d, ids) in corpus.doc_token_ids.iter().enumerate() {
        for (i, &tid) in ids.iter().enumerate() {
            if tid >= 0 && (tid as usize) < entry_count {
                let t = tid as usize;
                let slot = offsets[t] + counts[t];
                counts[t] += 1;
                flat[slot] = CooccurPos {
                    doc_id: d as i32,
                    pos: i as i32,
                };
            }
        }
    }
    flat.truncate(total);

    Some(ReverseIndex { offsets, flat })
}

fn build_src_entry(token: &str, pretrained: &dyn PretrainedEmbeddings) -> SrcEntry {
    if token.is_empty() {
        return SrcEntry::Sparse {
            nnz: 0,
            indices: [0; SPARSE_NNZE],
            values: [0.0; SPARSE_NNZE],
        };
    }

    if let Some(pvec) = pretrained.lookup(token) {
        return SrcEntry::Dense(pvec);
    }

    let seed = xxh3_64(token.as_bytes());
    let mut tmp_idx = [0_u16; SPARSE_NNZE];
    let mut tmp_val = [0.0_f32; SPARSE_NNZE];
    let mut count = 0_usize;

    for i in 0..SPARSE_NNZE {
        let i_bytes = (i as u64).to_le_bytes();
        let h = xxh3_64_with_seed(&i_bytes, seed.wrapping_add(RI_SEED_BASE));
        let pos = (h % DIM as u64) as u16;
        let sign = if h & 1 == 1 { UNIT_POS } else { -UNIT_POS };

        if let Some(j) = (0..count).find(|&j| tmp_idx[j] == pos) {
            tmp_val[j] += sign;
        } else {
            tmp_idx[count] = pos;
            tmp_val[count] = sign;
            count += 1;
        }
    }

    let mut indices = [0_u16; SPARSE_NNZE];
    let mut values = [0.0_f32; SPARSE_NNZE];
    let mut nnz = 0_u8;
    for j in 0..count {
        if tmp_val[j] != 0.0 {
            indices[nnz as usize] = tmp_idx[j];
            values[nnz as usize] = tmp_val[j];
            nnz += 1;
        }
    }

    SrcEntry::Sparse {
        nnz,
        indices,
        values,
    }
}

fn target_init_from_src(dst: &mut SemVector, src: &SrcEntry) {
    dst.clear();
    match src {
        SrcEntry::Sparse { nnz, indices, values } => {
            for k in 0..*nnz as usize {
                dst.v[indices[k] as usize] = values[k];
            }
        }
        SrcEntry::Dense(s) => {
            let inv127 = UNIT_POS / INT8_MAX;
            for (d, &byte) in s.iter().enumerate() {
                dst.v[d] = inv127 * byte as f32;
            }
        }
    }
}

fn vec_add_src_scaled(dst: &mut SemVector, src: &SrcEntry, scale: f32) {
    match src {
        SrcEntry::Sparse { nnz, indices, values } => {
            for k in 0..*nnz as usize {
                dst.v[indices[k] as usize] += scale * values[k];
            }
        }
        SrcEntry::Dense(s) => {
            let mul = scale * (UNIT_POS / INT8_MAX);
            for (d, &byte) in s.iter().enumerate() {
                dst.v[d] += mul * byte as f32;
            }
        }
    }
}

fn vec_add_int8_scaled(dst: &mut SemVector, src: &[i8], scale: f32) {
    let mul = scale * (UNIT_POS / INT8_MAX);
    for (d, &byte) in src.iter().enumerate().take(DIM) {
        dst.v[d] += mul * byte as f32;
    }
}

fn cooccur_sparse_one_target(
    doc_token_ids: &[Vec<i32>],
    src_entries: &[SrcEntry],
    rev: &ReverseIndex,
    tid: usize,
    target: &mut SemVector,
) {
    let occ_start = rev.offsets[tid];
    let occ_end = rev.offsets[tid + 1];
    let mut occ_step = 1_usize;
    if occ_end - occ_start > MAX_OCCUR {
        occ_step = (occ_end - occ_start) / MAX_OCCUR;
    }

    let mut p = occ_start;
    while p < occ_end {
        let pos = rev.flat[p];
        let d = pos.doc_id as usize;
        let i = pos.pos as usize;
        let ids = &doc_token_ids[d];
        let len = ids.len();

        for w in -WINDOW..=WINDOW {
            if w == 0 {
                continue;
            }
            let j = i as i32 + w;
            if j < 0 || j as usize >= len {
                continue;
            }
            let nid = ids[j as usize];
            if nid < 0 {
                continue;
            }
            let weight = UNIT_POS / w.unsigned_abs() as f32;
            vec_add_src_scaled(target, &src_entries[nid as usize], weight);
        }
        p += occ_step;
    }
}

fn cooccur_int8_one_target(
    doc_token_ids: &[Vec<i32>],
    pass1_q: &[i8],
    rev: &ReverseIndex,
    tid: usize,
    target: &mut SemVector,
) {
    let occ_start = rev.offsets[tid];
    let occ_end = rev.offsets[tid + 1];
    let mut occ_step = 1_usize;
    if occ_end - occ_start > MAX_OCCUR {
        occ_step = (occ_end - occ_start) / MAX_OCCUR;
    }

    let mut p = occ_start;
    while p < occ_end {
        let pos = rev.flat[p];
        let d = pos.doc_id as usize;
        let i = pos.pos as usize;
        let ids = &doc_token_ids[d];
        let len = ids.len();

        for w in -WINDOW..=WINDOW {
            if w == 0 {
                continue;
            }
            let j = i as i32 + w;
            if j < 0 || j as usize >= len {
                continue;
            }
            let nid = ids[j as usize];
            if nid < 0 {
                continue;
            }
            let weight = UNIT_POS / w.unsigned_abs() as f32;
            let base = (nid as usize) * DIM;
            vec_add_int8_scaled(target, &pass1_q[base..base + DIM], weight);
        }
        p += occ_step;
    }
}

fn build_all_src_entries(corpus: &Corpus, pretrained: &dyn PretrainedEmbeddings) -> Vec<SrcEntry> {
    let tokens: Vec<&str> = corpus.entries.iter().map(|e| e.token.as_str()).collect();
    #[cfg(not(target_family = "wasm"))]
    {
        tokens
            .par_iter()
            .map(|&token| build_src_entry(token, pretrained))
            .collect()
    }
    #[cfg(target_family = "wasm")]
    {
        tokens
            .iter()
            .map(|&token| build_src_entry(token, pretrained))
            .collect()
    }
}

fn run_cooccur_pass1(
    corpus: &Corpus,
    src_entries: &[SrcEntry],
    rev: &ReverseIndex,
) -> Vec<SemVector> {
    let entry_count = corpus.entries.len();
    let doc_token_ids = &corpus.doc_token_ids;

    #[cfg(not(target_family = "wasm"))]
    let mut out: Vec<SemVector> = (0..entry_count)
        .into_par_iter()
        .map(|tid| {
            let mut target = SemVector::default();
            target_init_from_src(&mut target, &src_entries[tid]);
            cooccur_sparse_one_target(doc_token_ids, src_entries, rev, tid, &mut target);
            target
        })
        .collect();

    #[cfg(target_family = "wasm")]
    let mut out: Vec<SemVector> = (0..entry_count)
        .map(|tid| {
            let mut target = SemVector::default();
            target_init_from_src(&mut target, &src_entries[tid]);
            cooccur_sparse_one_target(doc_token_ids, src_entries, rev, tid, &mut target);
            target
        })
        .collect();

    #[cfg(not(target_family = "wasm"))]
    {
        out.par_iter_mut().for_each(normalize);
    }
    #[cfg(target_family = "wasm")]
    {
        for v in &mut out {
            normalize(v);
        }
    }

    out
}

fn run_cooccur_pass2(corpus: &mut Corpus, rev: &ReverseIndex) {
    let entry_count = corpus.entries.len();
    let pass1: Vec<SemVector> = corpus.entries.iter().map(|e| e.enriched_vec).collect();
    let doc_token_ids = &corpus.doc_token_ids;

    let mut pass1_q = vec![0_i8; entry_count * DIM];
    #[cfg(not(target_family = "wasm"))]
    {
        pass1_q
            .par_chunks_mut(DIM)
            .zip(pass1.par_iter())
            .for_each(|(dst, src)| quantize_pass1_row(dst, src));
    }
    #[cfg(target_family = "wasm")]
    {
        for (i, src) in pass1.iter().enumerate() {
            quantize_pass1_row(&mut pass1_q[i * DIM..(i + 1) * DIM], src);
        }
    }

    #[cfg(not(target_family = "wasm"))]
    let mut pass2: Vec<SemVector> = (0..entry_count)
        .into_par_iter()
        .map(|tid| {
            let mut target = SemVector::default();
            cooccur_int8_one_target(doc_token_ids, &pass1_q, rev, tid, &mut target);
            target
        })
        .collect();

    #[cfg(target_family = "wasm")]
    let mut pass2: Vec<SemVector> = (0..entry_count)
        .map(|tid| {
            let mut target = SemVector::default();
            cooccur_int8_one_target(doc_token_ids, &pass1_q, rev, tid, &mut target);
            target
        })
        .collect();

    #[cfg(not(target_family = "wasm"))]
    {
        pass2.par_iter_mut().zip(pass1.par_iter()).for_each(|(vec, p1)| {
            blend_pass2(vec, p1);
        });
    }
    #[cfg(target_family = "wasm")]
    {
        for (vec, p1) in pass2.iter_mut().zip(pass1.iter()) {
            blend_pass2(vec, p1);
        }
    }

    for (entry, vec) in corpus.entries.iter_mut().zip(pass2) {
        entry.enriched_vec = vec;
    }
}

fn quantize_pass1_row(dst: &mut [i8], src: &SemVector) {
    for (d, cell) in dst.iter_mut().enumerate().take(DIM) {
        let mut v = src.v[d] * INT8_MAX;
        v = v.clamp(-INT8_MAX, INT8_MAX);
        *cell = if v >= 0.0 {
            (v + 0.5) as i8
        } else {
            (v - 0.5) as i8
        };
    }
}

fn blend_pass2(dst: &mut SemVector, pass1: &SemVector) {
    normalize(dst);
    for d in 0..DIM {
        dst.v[d] = RRI_BETA * pass1.v[d] + RRI_ALPHA * dst.v[d];
    }
    normalize(dst);
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::pretrained::EmptyPretrained;

    #[test]
    fn corpus_idf_increases_for_rare_tokens() {
        let mut corpus = Corpus::new();
        corpus.add_doc(&["common", "rare"]);
        corpus.add_doc(&["common"]);
        let idf_common = corpus.idf("common");
        let idf_rare = corpus.idf("rare");
        assert!(idf_rare > idf_common);
    }

    #[test]
    fn finalize_produces_unit_enriched_vectors() {
        let mut corpus = Corpus::new();
        corpus.add_doc(&["handler", "request"]);
        corpus.add_doc(&["handler", "response"]);
        corpus.finalize(&EmptyPretrained);
        let vec = corpus.ri_vec("handler").expect("handler in vocab");
        let mag: f32 = vec.v.iter().map(|x| x * x).sum::<f32>().sqrt();
        assert!((mag - 1.0).abs() < 0.01);
    }
}
