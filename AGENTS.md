# AGENTS.md

Guidance for AI agents working in this repository.

## Project overview

A GitHub Pages site holding Praveen Bathula's portfolio and resume. Plain HTML, CSS
and JavaScript served as-is. No build step, bundler, package manager, framework, or
dependency to install. The only external code is the `docx` library, loaded from a CDN
at runtime and only when someone clicks Download DOCX.

## Commands

Serve locally:

```
python3 -m http.server 8000
# open http://localhost:8000
```

Verify a change without a browser:

```
node check.js
```

`check.js` runs the real render path from `index.js` against `data.js` under a DOM
stub, prints what each section produced, and exits non-zero on a problem. Run it after
every content or render change. It does not check layout, CSS, or the DOCX build.

Regenerate a PDF headlessly (optional, the page's Download PDF button does the same
through the print dialog):

```
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless \
  --no-pdf-header-footer \
  --print-to-pdf="Praveen-Bathula-Resume.pdf" \
  http://localhost:8000
```

## Architecture

**All content lives in `data.js`, in one object called `profileData`.** Nothing else
holds resume content. `index.html` is a skeleton of empty containers; `index.js` fills
them imperatively on `DOMContentLoaded`. To change what the page says, edit `data.js`.
Never hand-write content into `index.html` and never edit a generated PDF or DOCX.

`profileData` fields: `name`, `role`, `contact`, `summary`, `summaryAts`, `highlights`,
`education[]`, `skills[]` (each `{category, items[]}`), `experiences[]` (employers),
`projects[]` (each `{name, client, role, duration, tech[], bullets[]}`).

**Three outputs, one data source.**

| Output   | Produced by                                  | Summary used |
|----------|----------------------------------------------|--------------|
| Web page | `render*` functions in `index.js`            | `summary`    |
| PDF      | the browser print dialog against `print.css` | `summaryAts` |
| DOCX     | `buildResumeDocx()` in `index.js`            | `summaryAts` |

`summary` is written to be read by a person landing on the page. `summaryAts` is
keyword-dense for an ATS or recruiter keyword filter. Both are rendered into the DOM;
`styles.css` hides `.profile-summary-ats` on screen and `print.css` swaps them, because
print CSS cannot change text content. `atsSummary()` falls back to `summary` when
`summaryAts` is absent. Keep the two consistent in facts; they differ only in register.

**Two stylesheets, two audiences.** `styles.css` is the screen: cards, two columns,
light and dark themes, chips. `print.css` is loaded via `<link media="print">` and
reshapes the same DOM for ATS parsing: single column, no cards, chips flattened to
comma-separated text, and `.profile-header` hidden in favour of `.ats-pre-header`, a
plain-text name/role/contact block placed first in the DOM so it is first in the PDF's
text stream. After changing `print.css`, check the *extracted* text order of the PDF by
selecting and copying from it, not just how it looks.

**The class-name contract.** `index.js` locates containers with `document.querySelector`
and these lookups are unguarded, so a missing container throws on null and silently
blanks every section after it. If you rename or delete a container in `index.html`,
update the matching call in `index.js`. The classes it requires:

`.profile-name` `.profile-role` `.profile-summary` `.profile-summary-ats`
`.contact-items` `.highlights` `.key-skills` `.all-experiences` `.all-education`
`.all-projects` `.ats-pre-header` `.theme-toggle` `.theme-toggle-label`
`.docx-download` `.pdf-download`

Run `node check.js` after any such change; it exists to catch exactly this.

## Source of truth for content

Two Markdown files hold the canonical material:

- `current_skills.md` - the skills list.
- `resume-projects.md` - the project write-ups.

They live outside this repository and their location differs by machine, so find them
rather than assuming a path. Ask Praveen where they are, or search upward from the
working directory. If more than one copy of `current_skills.md` turns up, they are kept
byte-identical by convention: check with `md5` and update every copy when one changes.

If neither file is available on this machine, say so and work from `data.js` plus what
Praveen states directly. Do not guess at their contents.

When content changes here, update the matching Markdown file, and vice versa. Never
introduce a claim in `data.js` that is not supported by those files or stated by
Praveen directly.

## Writing rules

- **Never invent.** No job titles, years of experience, metrics, technologies, or
  achievements that the source files do not support. If something is unverified, say so
  rather than writing it as fact.
- **No commit statistics or implementation counts** in any resume or profile text. No
  "15 transformers", no percentage-of-codebase claims. Merge requests are often merged
  by other contributors, so git stats understate the work and mislead. Describe what a
  system does and why it matters.
- **No em dashes.** Use a plain hyphen. This applies to page content, code comments,
  commit messages, and Markdown in this repo.
- **Outcomes over mechanisms** in project bullets: what changed and why it mattered.
- The summary carries no client or project names, no industry list, and no framing that
  reads as a restriction on the kind of role being sought. Specifics belong in Projects.
- Commit messages are a single short subject line, no body.

## Keeping this file current

Praveen's decisions are durable. When he makes one, record it here in the same change
that acts on it, so it does not have to be made twice.

What to record:

- A correction to something you wrote, and the reason behind it.
- A preference he states about wording, structure, tone, or workflow.
- A constraint he rejects or imposes, such as what the summary may not contain.
- An approach he chose when offered alternatives, with the alternative he turned down.

What not to record: one-off task details, anything already obvious from the code, and
anything you inferred rather than heard. If you are unsure whether a decision is
durable or specific to that moment, ask.

Where it goes:

- Repository-wide rules, content constraints, and writing style go in this file, under
  **Writing rules** or **Decisions** below.
- Rules about a specific workflow go in that workflow's file under `.claude/commands/`.
- **Mirror every prompt change.** `.claude/commands/<name>.md` and
  `.github/prompts/<name>.prompt.md` hold the same body and differ only in frontmatter.
  Changing one without the other leaves the two tools disagreeing.

Write the rule, not the anecdote. "The summary carries no industry list" is usable by
the next agent; "Praveen said the industries looked restrictive on 19 Oct" is not,
though the reason is worth one clause when it explains the rule.

## Decisions

Recorded as they are made, newest first.

**2026-10-19**

- The summary names no industries, no client or project names, and no specific cloud in
  its opening line. Each of those reads as a restriction on the roles being sought,
  rather than as evidence. Specifics belong in Projects, where they read as range.
- The summary says nothing about the earlier full stack work. The applications are for
  data engineering roles, and the closing line is the one a reader remembers. The full
  stack projects stay in the Projects list, where breadth is an asset.
- Two summaries, not one: `summary` readable for the web page, `summaryAts` keyword
  dense for the PDF and DOCX. Chosen over replacing the readable one outright, because
  the page and an ATS have opposite audiences.
- Content files are referred to by bare filename, never an absolute path. Paths differ
  by machine and this repository is meant to be editable from any of them.
- Skills are split between AI built into a data product (`AI / ML Integration`) and AI
  used in how the work gets done (`AI-Assisted Engineering`). A reader scanning for
  production RAG experience needs those kept apart.

## Deployment

GitHub Pages serves the default branch directly. Push and it redeploys. `.nojekyll`
disables Jekyll so files are served exactly as committed.
