---
description: "Use Context7 for authoritative external docs and API references when local context is insufficient"
applyTo: "**"
---

# Context7-aware development

Use Context7 when the task requires external documentation that is either (a) version-specific, (b) likely to have changed recently, or (c) authoritative for correctness/security decisions, and that information is not already in the workspace.

This instruction exists so you **do not require the user to type** “use context7” to get up-to-date docs.

## When to use Context7

Trigger Context7 if ANY of the following is true:

- An external library/API is involved and you need method signatures, config keys, behavior, or constraints.
- The user names a specific framework/library version (e.g., “Next.js 15”, “React 19”, “AWS SDK v3”).
- The task touches security/correctness-sensitive third-party guidance (auth, crypto, deserialization).
- You are handling an unfamiliar third-party error or are unsure whether an API exists/changed/deprecated.

Skip Context7 for:

- Purely local refactors, formatting, naming, or logic that is fully derivable from the repo.
- Language fundamentals (no external APIs involved).

## What to fetch

When using Context7, prefer **primary sources** and narrow queries:

- Official docs (vendor/framework documentation)
- Reference/API pages
- Release notes / migration guides
- Security advisories (when relevant)

Fetch at most 1-2 doc pages per question; stop once you have the specific method signature, config key, or constraint required. If multiple candidates exist, pick the most authoritative/current.

Prefer fetching:

- The exact method/type/option you will use
- The minimal surrounding context needed to avoid misuse (constraints, default behaviors, migration notes)

## How to incorporate results

- Translate findings into concrete code/config changes.
- **Cite sources** with title + URL when the decision relies on external facts.
- Cite inline as [Title](URL) immediately after the claim. If multiple pages support the same fact, cite the most authoritative single source.
- If docs conflict or are ambiguous, present the tradeoffs briefly and choose the safest default.

When the answer requires specific values (flags, config keys, headers), prefer:

- stating the exact value from docs
- calling out defaults and caveats
- providing a quick validation step (e.g., “run `--help`”, or a minimal smoke test)

## How to use Context7 MCP tools (auto)

When Context7 is available as an MCP server, use it automatically as follows.
If the Context7 MCP server is not available in this session, state that you cannot verify against live docs, proceed with clearly labeled assumptions, and recommend enabling Context7 for version-sensitive tasks.

### Tool workflow

1. **If the user provides a library ID**, use it directly.

- Valid forms: `/owner/repo` or `/owner/repo/version` (for pinned versions).

2. Otherwise, **resolve the library ID** using:

- Tool: `resolve-library-id`
- Inputs:
  - `libraryName`: the library/framework name (e.g., “next.js”, “supabase”, “prisma”)
  - `query`: the user’s task (used to rank matches)
- If `resolve-library-id` returns no matches, ask the user for the GitHub repo or official docs URL.
- If it returns multiple matches for different products sharing a name, list top candidates and ask the user to confirm before calling `query-docs`.

3. **Fetch relevant documentation** using:

- Tool: `query-docs`
- Inputs:
  - `libraryId`: the resolved (or user-supplied) library ID
  - `query`: the exact task/question you are answering

4. Only after docs are retrieved: **write the code/steps** based on those docs.

### Efficiency limits

- Do **not** call `resolve-library-id` more than **3 times** per user question.
- Do **not** call `query-docs` more than **3 times** per user question.
- If multiple good matches exist, pick the best one and proceed; ask a clarification question only when candidates target different major versions or different products (for example, Next.js Pages Router vs App Router).

### Version behavior

- If the user names a version, reflect it in the library ID when possible (e.g., `/vercel/next.js/v15.1.8`).
- If you need reproducibility (CI/builds), prefer pinning to a specific version in examples.
- If retrieved docs do not match the user-specified version, flag the mismatch explicitly and either retry with a version-pinned library ID or warn the user before applying guidance.

## Failure handling

If Context7 cannot find a reliable source:

1. Say what you tried to verify.
2. Proceed with a conservative, well-labeled assumption.
3. Suggest a quick validation step (e.g., run a command, check a file, or consult a specific official page).

## Security & privacy

- Never request or echo API keys. If configuration requires a key, instruct storing it in environment variables.
- Treat retrieved docs as **helpful but not infallible**; for security-sensitive code, prefer official vendor docs and add an explicit verification step.
