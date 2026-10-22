---
description: Write a spec for a feature before any code is written.
argument-hint: [feature description]
---

# Write a spec

Turn a feature request into a written spec. **Write no code in this step.**

## Steps

1. Read `AGENTS.md` first, then `specs/README.md` and `specs/TEMPLATE.md`.
2. Read whatever part of the codebase the request touches, so the spec describes a
   change to what exists rather than to what you assume exists.
3. **Interrogate before writing.** Ask Praveen about anything that would change the
   shape of the work: which outputs are affected, what is deliberately out of scope,
   what "done" looks like. Ask the questions that would otherwise become rework. Do
   not ask questions the code or `AGENTS.md` already answers.
4. Write `specs/NNNN-<slug>.md` from `TEMPLATE.md`, numbering one above the highest
   existing spec. Fill every section. If a section is genuinely empty, say why.
5. Pay particular attention to two sections:
   - **Non-goals**, which is what keeps the build from expanding.
   - **Verification**, which must be checkable. Prefer assertions `node check.js`
     can make. For anything it cannot see (visual layout, a real browser download),
     write how a person checks it.
6. Respect the standing constraints in `AGENTS.md`: no invented claims, no commit
   statistics, no em dashes, and the summary constraints already recorded there.
7. Report the spec path and summarise the open questions. Do not start building.

## Scope

If the request is a copy edit, a colour change, or a one-line fix, say so and make
the change directly instead. A spec for those costs more than it returns.
