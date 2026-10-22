---
mode: agent
description: Implement an agreed spec, verify it against its Verification list, and report.
---

# Build from a spec

Implement an agreed spec, verify it, and report honestly.

## Steps

1. Read the spec named in the arguments, then `AGENTS.md`, then the files involved.
2. Implement it. Stay inside the spec: anything outside Goal and Behaviour, or inside
   Non-goals, does not get built, even if it looks like an improvement. Note it
   instead and raise it at the end.
3. If the spec turns out to be wrong mid-build, stop and fix the spec first, then
   continue. Code and spec must not diverge, even temporarily.
4. Run `node check.js`. It must pass.
5. Check the outputs the spec says are affected:
   - **Web page:** serve it and look at it.
   - **PDF:** generate it headlessly and inspect it. `check.js` cannot see print.
   - **DOCX:** confirm it actually builds, not just that the library loaded.
6. Walk the Verification list and report each line as met or not met. Do not report a
   line as met because the code looks right. If something could not be verified, say
   so plainly rather than leaving it implied.
7. Update the spec: set Status to `built`, resolve or delete Open questions, and
   record any durable decision in `AGENTS.md` under **Decisions**.
8. Commit the spec and the code together, one short subject line.
