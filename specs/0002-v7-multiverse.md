# 0002 - v7: adapt the portfolio to theme-6 (Multiverse)

**Status:** built
**Date:** 2026-10-22

## Goal

A fourth design of the same portfolio, on a new branch `v7`, built from the design
reference in `themes/theme-6/Multiverse.dc.html`. As with v3 and v4, the theme sets the
structure and the visual language; `data.js` supplies the content. The result is another
complete, deployable version of the site that a reader can compare against the others.

The theme's organising idea is versions and timelines: nested rotating polygons labelled
`v0` to `v3`, sections named Variants, Time travel, Nexus events, Constants and Portal.
Its stated subject is Delta Lake and Iceberg table time travel, which is not part of
Praveen's stack. The adaptation keeps the visual language and reframes the subject onto
work he has actually done.

## Non-goals

- **No Delta Lake or Iceberg claims.** They are absent from `current_skills.md` and from
  every project. The Time travel section is reframed, not reproduced.
- **No invented metrics.** The reference's Nexus events section is built around large
  figures. v7 fills that layout with named facts instead.
- **Not a change to content.** `data.js` gains fields for the new sections, but no
  existing summary, project, skill or employer text is rewritten. Any change to those
  belongs in its own spec.
- **Not a replacement for v3 or v4.** `v7` is another branch alongside them, deployed to
  `/v7/` by the existing workflow.
- **No change to `main`.** The branch is cut from `portfolio-v2`, matching how v3 and v4
  were started.

## Behaviour

### Sections

Six sections, five from the reference plus one the reference lacks.

| Section | Reference label | v7 content |
| --- | --- | --- |
| Hero | `DATA ENGINEER · ACROSS EVERY TIMELINE` | Name, role, `tagline` as the headline with one accented phrase, `summary`, two buttons, and the rotating `v0`-`v3` polygon diagram |
| 01 | `VARIANTS` | **Pipeline patterns.** Three chips: ETL, ELT, event-driven. Selecting one swaps a panel describing that pattern and naming the work where it was used |
| 02 | `TIME TRAVEL` | **Reframed:** a raw layer kept replayable, idempotent collision-safe re-runs, and a candidate schema rebuilt and validated before promotion. Drawn from the OMOP and Mindvalley work |
| 03 | `NEXUS EVENTS` | Four cards of **named facts**, not figures: OMOP CDM, L1/L2/L3 medallion, Neo4j graph, event-driven on S3 |
| 04 | `CONSTANTS` | Skills from `data.js`, as the reference's pill chips |
| 05 | `TIMELINE LOG` | **Not in the reference.** Work experience: roles with their projects. Built in the theme's visual language |
| 06 | `OPEN A PORTAL` | Contact panel with the radial mint glow |

The experience section is the one component with no counterpart in the reference. Without
it the site has no work history and the PDF is not a resume, so it is specified here
rather than improvised during the build.

### Outputs

- **Web page:** all six sections, the rotating diagram, chip-driven pattern switching.
- **PDF:** unchanged in substance from the other branches. Decoration stripped, standard
  `SUMMARY` / `WORK EXPERIENCE` / `SKILLS` / `EDUCATION` headings via `.print-title`,
  single column, every project bullet present.
- **DOCX:** unchanged. Built from the same `data.js` by the existing `buildResumeDocx()`.

### Design values

Taken from the reference, to live in `styles.css` tokens rather than being repeated:

- Ground `#0F0820`; panels `#1A1033`, `#150C2B`, `#120A27`; hairline `rgba(183,174,214,0.15)`
- Accent `#3FF0D2`, hover `#9FFBEA`; counter-accent `#FF5CA8`; third `#FFC857`
- Text `#F2ECFF`, muted `#B7AED6`
- Sora for display, Azeret Mono for labels and chips
- Section rhythm 96px, shell 1240px, `h2` `clamp(34px, 4.6vw, 58px)` at `-0.035em`
- Chips `min-height: 48px`, `999px` radius; cards `24px`; the portal panel `32px`
- Animations `spin`, `spinr`, `breathe`, `dash`, all disabled under `prefers-reduced-motion`

## Data shape

New fields. Existing fields are untouched.

```js
patterns: [
  { id: 'etl', label: 'ETL', headline: '...', detail: '...', where: 'OHDSI OMOP Standardisation' },
  { id: 'elt', label: 'ELT', headline: '...', detail: '...', where: 'Data Platform Modernisation' },
  { id: 'events', label: 'Event-driven', headline: '...', detail: '...', where: '...' }
],

replay: {
  headline: 'Every run is replayable.',
  points: [ 'raw kept partitioned and untouched', 'idempotent, collision-safe loads', 'candidate schema validated before promotion' ]
},

facts: [
  { v: 'OMOP CDM', l: 'standardised research data' },
  { v: 'L1/L2/L3', l: 'medallion layers' },
  { v: 'Neo4j', l: 'graph models from relational' },
  { v: 'S3 + EventBridge', l: 'event-driven orchestration' }
]
```

Every string above must trace to `resume-projects.md` or `current_skills.md`.

## Verification

- [x] `node check.js` passes, reporting 2 roles, 8 projects, 9 skill groups, 2 education
      entries, and both summary word counts.
- [x] `check.js` reports the three pattern chips and four fact cards, so a missing or
      malformed entry fails the check rather than rendering an empty section.
- [x] Switching pattern chips changes the panel: asserted by rendering each pattern id
      under the DOM stub and comparing output, as the ETL/ELT toggle was verified on v4.
- [x] No occurrence of `Delta` or `Iceberg` in any **rendered output**: the page's text
      content and the extracted text of the PDF. Source comments explaining why the
      reference's framing was not adopted are expected and do not count. Amended during
      the build: the original wording scanned source files, which would fail on the very
      comment that documents the decision.
- [x] The generated PDF contains `WORK EXPERIENCE` and every project bullet, and contains
      none of the section labels. **Verified visually**, by rasterising the pages: text
      extraction from this PDF returned nothing, so the automated grep was not usable.
      Previously the labels `VARIANTS`, `NEXUS EVENTS`, `CONSTANTS`, `OPEN A PORTAL`.
      Checked by generating headlessly and extracting the text.
- [x] The DOCX builds and is non-trivial in size, checked in a real browser, not only by
      the library loading.
- [x] `index.html` loads `docx` from unpkg, not jsDelivr. Checkable with grep, and the
      reason is recorded in `AGENTS.md`.
- [x] Light theme: the hero diagram, the pattern panel and the portal panel are all
      legible. Rendered in both themes and shown to Praveen; every colour is a token, so
      the failure mode v3 had cannot occur here.
- [x] Every asset path stays relative, so `/v7/` works as a subdirectory deploy.
      Checkable with grep for `src="/` and `href="/`.

## Resolved

1. **Hero headline:** `tagline` from `data.js`, with one phrase in the counter-accent.
   The reference's "One engineer. Infinite timelines." is not used. This is what the
   Behaviour section already specifies.
2. **Branch name:** `v7`, confirmed. Nothing is numbered 5 or 6; the gap is intentional.
3. **Experience placement:** stays at section 05, after Constants and before the portal.

No open questions remain.
