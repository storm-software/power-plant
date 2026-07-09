use crate::constants::TOKEN_BUF_LEN;

fn is_token_delim(c: char) -> bool {
    matches!(
        c,
        '.' | '/' | '_' | '-' | ' ' | '(' | ')' | ',' | ':'
    )
}

fn is_camel_break(name: &[u8], i: usize) -> bool {
    if i == 0 {
        return false;
    }
    let c = name[i];
    let p = name[i - 1];
    c.is_ascii_uppercase() && p.is_ascii_lowercase()
}

fn flush_token(buf: &mut [u8], buffer_length: &mut usize, out: &mut Vec<String>) {
    if *buffer_length > 0 {
        let token = std::str::from_utf8(&buf[..*buffer_length])
            .unwrap_or("")
            .to_owned();
        if !token.is_empty() {
            out.push(token);
        }
    }
    *buffer_length = 0;
}

/// Split a name into tokens: camelCase, snake_case, dot.separated.
///
/// Tokens are lowercased. Common code abbreviations are expanded in-place
/// (e.g. `err` also adds `error`).
#[must_use]
pub fn tokenize(name: &str, max_out: usize) -> Vec<String> {
    if name.is_empty() || max_out == 0 {
        return Vec::new();
    }

    let name_bytes = name.as_bytes();
    let mut out = Vec::new();
    let mut buf = [0_u8; TOKEN_BUF_LEN];
    let mut buffer_length = 0_usize;

    for (i, &byte) in name_bytes.iter().enumerate() {
        if out.len() >= max_out {
            break;
        }
        let c = byte as char;
        let split = is_token_delim(c);
        let camel = is_camel_break(name_bytes, i);
        if split || camel {
            flush_token(&mut buf, &mut buffer_length, &mut out);
            if split {
                continue;
            }
        }
        if buffer_length < TOKEN_BUF_LEN - 1 && c.is_ascii_alphanumeric() {
            buf[buffer_length] = c.to_ascii_lowercase() as u8;
            buffer_length += 1;
        }
    }
    flush_token(&mut buf, &mut buffer_length, &mut out);

    expand_abbreviations(&mut out, max_out);
    out
}

fn expand_abbreviations(out: &mut Vec<String>, max_out: usize) {
    const ABBREVS: &[(&str, &str)] = &[
        ("err", "error"),
        ("exc", "exception"),
        ("ex", "exception"),
        ("ctx", "context"),
        ("cfg", "config"),
        ("conf", "configuration"),
        ("env", "environment"),
        ("opt", "option"),
        ("opts", "options"),
        ("req", "request"),
        ("res", "response"),
        ("resp", "response"),
        ("rsp", "response"),
        ("hdr", "header"),
        ("hdrs", "headers"),
        ("str", "string"),
        ("fmt", "format"),
        ("msg", "message"),
        ("txt", "text"),
        ("lbl", "label"),
        ("desc", "description"),
        ("buf", "buffer"),
        ("arr", "array"),
        ("vec", "vector"),
        ("lst", "list"),
        ("dict", "dictionary"),
        ("tbl", "table"),
        ("stk", "stack"),
        ("que", "queue"),
        ("fn", "function"),
        ("func", "function"),
        ("cb", "callback"),
        ("proc", "procedure"),
        ("ctor", "constructor"),
        ("dtor", "destructor"),
        ("db", "database"),
        ("col", "column"),
        ("stmt", "statement"),
        ("txn", "transaction"),
        ("trx", "transaction"),
        ("repo", "repository"),
        ("auth", "authentication"),
        ("authz", "authorization"),
        ("perm", "permission"),
        ("cred", "credential"),
        ("tok", "token"),
        ("pwd", "password"),
        ("val", "value"),
        ("num", "number"),
        ("int", "integer"),
        ("bool", "boolean"),
        ("flt", "float"),
        ("dbl", "double"),
        ("idx", "index"),
        ("iter", "iterator"),
        ("elem", "element"),
        ("cnt", "count"),
        ("len", "length"),
        ("sz", "size"),
        ("pos", "position"),
        ("off", "offset"),
        ("cap", "capacity"),
        ("init", "initialize"),
        ("deinit", "deinitialize"),
        ("alloc", "allocate"),
        ("dealloc", "deallocate"),
        ("del", "delete"),
        ("rm", "remove"),
        ("impl", "implementation"),
        ("iface", "interface"),
        ("abs", "abstract"),
        ("decl", "declaration"),
        ("param", "parameter"),
        ("arg", "argument"),
        ("attr", "attribute"),
        ("prop", "property"),
        ("ret", "return"),
        ("src", "source"),
        ("dst", "destination"),
        ("tgt", "target"),
        ("orig", "original"),
        ("prev", "previous"),
        ("cur", "current"),
        ("tmp", "temporary"),
        ("temp", "temporary"),
        ("conn", "connection"),
        ("sess", "session"),
        ("sock", "socket"),
        ("addr", "address"),
        ("url", "uniform"),
        ("srv", "server"),
        ("cli", "client"),
        ("svc", "service"),
        ("ep", "endpoint"),
        ("mgr", "manager"),
        ("ctrl", "controller"),
        ("hdlr", "handler"),
        ("sched", "scheduler"),
        ("disp", "dispatcher"),
        ("reg", "registry"),
        ("chan", "channel"),
        ("sem", "semaphore"),
        ("mtx", "mutex"),
        ("wg", "waitgroup"),
        ("sig", "signal"),
        ("evt", "event"),
        ("sub", "subscriber"),
        ("pub", "publisher"),
        ("spec", "specification"),
        ("mock", "mock"),
        ("stub", "stub"),
        ("assert", "assertion"),
        ("log", "logging"),
        ("lvl", "level"),
        ("dbg", "debug"),
        ("wrn", "warning"),
        ("inf", "info"),
        ("ts", "timestamp"),
        ("dur", "duration"),
        ("ttl", "timetolive"),
        ("ver", "version"),
        ("ns", "namespace"),
        ("pkg", "package"),
        ("mod", "module"),
        ("lib", "library"),
        ("dep", "dependency"),
        ("ref", "reference"),
        ("ptr", "pointer"),
        ("obj", "object"),
        ("doc", "document"),
        ("cmd", "command"),
        ("ops", "operations"),
        ("util", "utility"),
        ("hlp", "helper"),
        ("ext", "extension"),
    ];

    let orig_count = out.len();
    for t in 0..orig_count {
        if out.len() >= max_out {
            break;
        }
        let token = out[t].clone();
        for &(abbrev, expanded) in ABBREVS {
            if token == abbrev {
                out.push(expanded.to_owned());
                break;
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn snake_case_splits() {
        let tokens = tokenize("user_context", 16);
        assert_eq!(tokens, vec!["user", "context"]);
    }

    #[test]
    fn expands_err_abbreviation() {
        let tokens = tokenize("err", 8);
        assert!(tokens.contains(&"err".to_owned()));
        assert!(tokens.contains(&"error".to_owned()));
    }
}
