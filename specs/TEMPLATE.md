# NNNN - <title>

**Status:** draft | agreed | built
**Date:** YYYY-MM-DD

## Goal

One paragraph. What this gives the reader of the site, or the person applying for a
job with it. Not how it is built.

## Non-goals

What this deliberately does not do. The most useful section in the file: it is what
stops the work expanding while it is being built.

## Behaviour

What happens, from the outside. Cover each output that is affected:

- **Web page:**
- **PDF:**
- **DOCX:**

If an output is unaffected, say so explicitly rather than leaving it out.

## Data shape

New or changed fields in `data.js`, with an example. Keep it small enough to read.

```js
// example
```

## Verification

Checkable statements, one per line. Prefer things `node check.js` can assert. For
anything a script cannot see, say how a person checks it instead.

- [ ]
- [ ]

## Open questions

Anything that needs a decision before or during the build. Delete the section when
all of them are resolved, and record the durable ones in `AGENTS.md` under Decisions.
