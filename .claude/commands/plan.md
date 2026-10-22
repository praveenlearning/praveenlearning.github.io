---
description: Turn an agreed spec into an implementation plan, without writing code.
argument-hint: [path to spec file]
---

# Plan an implementation

Turn an agreed spec into a plan. **Write no code in this step.**

## Steps

1. Read the spec named in the arguments, then `AGENTS.md`.
2. Read every file the plan will touch. Do not plan against a remembered codebase.
3. Produce a plan covering:
   - **Files**, each with what changes in it and why.
   - **Order**, so that the tree is working at as many points as possible.
   - **Data shape**, confirming the spec's proposal survives contact with `data.js`,
     or proposing a better one and saying what changed.
   - **Risks**, specifically: the unguarded `querySelector` contract, the three
     outputs falling out of step, and anything that only shows up in print.
   - **Verification**, mapping each Verification line in the spec to the check that
     will prove it, and naming any that cannot be automated.
4. Flag anything in the spec that turns out to be wrong or unbuildable as stated.
   Propose the correction rather than quietly building something different.
5. Report the plan. Wait for approval before building.
