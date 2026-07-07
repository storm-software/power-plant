use std::collections::HashMap;

/// Resolution outcome from the function registry.
#[derive(Debug, Clone, Default)]
pub struct Resolution {
    pub qualified_name: String,
    pub strategy: String,
    pub confidence: f64,
    pub candidate_count: usize,
}

impl Resolution {
    pub fn unresolved() -> Self {
        Self::default()
    }

    pub fn is_resolved(&self) -> bool {
        !self.qualified_name.is_empty()
    }
}

const CONF_IMPORT_MAP: f64 = 0.95;
const CONF_SAME_MODULE: f64 = 0.90;
const CONF_UNIQUE_NAME: f64 = 0.75;
const CONF_SUFFIX_MATCH: f64 = 0.55;

/// Callable / type symbol registry for call and usage resolution.
#[derive(Debug, Default)]
pub struct Registry {
    exact: HashMap<String, String>,
    by_name: HashMap<String, Vec<String>>,
}

impl Registry {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn len(&self) -> usize {
        self.exact.len()
    }

    pub fn add(&mut self, name: &str, qualified_name: &str, label: &str) {
        let _ = label;
        self.exact
            .insert(qualified_name.to_string(), label.to_string());
        self.by_name
            .entry(name.to_string())
            .or_default()
            .push(qualified_name.to_string());
    }

    pub fn exists(&self, qn: &str) -> bool {
        self.exact.contains_key(qn)
    }

    pub fn label_of(&self, qn: &str) -> Option<&str> {
        self.exact.get(qn).map(String::as_str)
    }

    pub fn find_by_name(&self, name: &str) -> &[String] {
        self.by_name
            .get(name)
            .map(Vec::as_slice)
            .unwrap_or(&[])
    }

    pub fn resolve(
        &self,
        callee_name: &str,
        module_qn: &str,
        import_map: &HashMap<String, String>,
    ) -> Resolution {
        if let Some(qn) = import_map.get(callee_name) {
            if self.exists(qn) {
                return Resolution {
                    qualified_name: qn.clone(),
                    strategy: "import_map".into(),
                    confidence: CONF_IMPORT_MAP,
                    candidate_count: 1,
                };
            }
        }

        let same_module = format!("{module_qn}.{callee_name}");
        if self.exists(&same_module) {
            return Resolution {
                qualified_name: same_module,
                strategy: "same_module".into(),
                confidence: CONF_SAME_MODULE,
                candidate_count: 1,
            };
        }

        let candidates = self.find_by_name(callee_name);
        if candidates.len() == 1 {
            return Resolution {
                qualified_name: candidates[0].clone(),
                strategy: "unique_name".into(),
                confidence: CONF_UNIQUE_NAME,
                candidate_count: 1,
            };
        }

        if candidates.len() > 1 {
            let suffix = format!(".{callee_name}");
            let mut reachable: Vec<&String> = candidates
                .iter()
                .filter(|qn| qn.ends_with(&suffix))
                .collect();
            if reachable.len() == 1 {
                return Resolution {
                    qualified_name: reachable[0].clone(),
                    strategy: "suffix_match".into(),
                    confidence: CONF_SUFFIX_MATCH,
                    candidate_count: 1,
                };
            }
            if reachable.is_empty() {
                reachable = candidates.iter().collect();
            }
            if let Some(qn) = reachable.first() {
                return Resolution {
                    qualified_name: (*qn).clone(),
                    strategy: "suffix_match".into(),
                    confidence: CONF_SUFFIX_MATCH,
                    candidate_count: reachable.len(),
                };
            }
        }

        Resolution::unresolved()
    }
}

pub fn confidence_band(score: f64) -> &'static str {
    if score >= 0.7 {
        "high"
    } else if score >= 0.45 {
        "medium"
    } else if score >= 0.25 {
        "speculative"
    } else {
        ""
    }
}
