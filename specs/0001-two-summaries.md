# 0001 - Two summaries, one for readers and one for filters

**Status:** built
**Date:** 2026-10-19

> Written after the fact, as a worked example of the shape a spec should take.
> Everything below describes behaviour that exists in the code today.

## Goal

The page and the resume have opposite audiences. A person landing on the site should
meet prose that reads well and leaves an impression. An applicant tracking system, or
a recruiter running a keyword search, needs density and exact tool names. One piece of
text cannot serve both without being worse at each.

## Non-goals

- Not two sets of facts. The two summaries say the same true things about the same
  career, and differ only in register and density.
- Not a user-facing toggle. The reader never chooses; the medium decides.
- Not a change to any other section. Projects, skills and experience are unaffected.

## Behaviour

- **Web page:** shows `summary`, the readable version.
- **PDF:** shows `summaryAts`, the keyword-dense version.
- **DOCX:** uses `summaryAts`.

Both are rendered into the DOM on every page load. `styles.css` hides the ATS variant
on screen and `print.css` swaps them, because print CSS can change which element is
visible but cannot change an element's text.

When `summaryAts` is absent, `atsSummary()` falls back to `summary`, so a half-finished
edit degrades to the readable version rather than blanking the PDF.

## Data shape

```js
summary:    'Senior Data Engineer with 6+ years ... load and reporting.',
summaryAts: 'Senior Data Engineer with 6+ years ... into data workflows.',
```

## Verification

- [x] `node check.js` reports both word counts, and warns if the two are identical.
- [x] Deleting `summaryAts` leaves the PDF showing the readable summary, not an empty
      section. Checked by removing the field and regenerating.
- [x] The generated PDF contains the keyword-dense text. Checked by generating it
      headlessly and reading the page.
- [x] The page shows the readable text. Checked in a browser.

## Open questions

None remaining. The constraints that came out of building this are recorded in
`AGENTS.md` under **Decisions**: no client or project names, no industry list, and no
opener that reads as a restriction on the roles being sought.
