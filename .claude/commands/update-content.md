---
description: Add or refresh a project, skill, or other content in data.js and keep the source Markdown in sync.
argument-hint: [what to add or update]
---

# Update resume content

Add or refresh content in `data.js`, keeping it in step with the canonical Markdown
source files.

## What this covers

- Adding a new project, or refreshing an existing one with recent work.
- Adding or removing a skill.
- Updating the summary, employers, education, or contact details.

## Steps

1. Read `docs/AGENTS.md`, then the part of `data.js` being changed.
2. Read the canonical source for whatever is changing:
   - skills: `current_skills.md`
   - projects: `resume-projects.md`
   Both live outside this repository and their location differs by machine, so ask
   where they are rather than assuming a path. If the new material is not in them yet,
   add it there too: the Markdown files and `data.js` must not drift apart. Where more
   than one copy of `current_skills.md` exists they are byte-identical by convention,
   so verify with `md5` after editing. If the files are not available here, say so and
   change `data.js` alone, noting what still needs syncing.
3. If the work is in a repository, read the repository as evidence before describing
   it. Prefer what the code and configuration actually show over recollection. Say
   plainly when something could not be verified.
4. Write the content:
   - Project bullets say what the system does and why it matters. Outcomes, not
     implementation tours.
   - No commit statistics, no counts of classes, migrations or modules, no
     percentage-of-codebase claims. Merge requests are often merged by other
     contributors, so git statistics understate the work.
   - No em dashes anywhere.
   - Keep `tech` arrays to what the project genuinely used.
5. A new project needs an `employer` matching a company in `experiences[]`, or it will
   not appear under the right role. `node check.js` reports any that do not match.
6. Role-level summaries in `experiences[]` stay above project detail: what the role was
   and how far responsibility extended, in data engineering terms, with no tool or
   client names. The projects beneath carry the specifics.
7. If the change affects how Praveen is positioned overall, consider whether `summary`
   and `summaryAts` should change too. They must stay consistent in facts, and keep
   their existing constraints: no client or project names in the summary, no industry
   list, no opener that reads as a restriction, nothing about the earlier full stack
   work.
6. Run `node docs/check.js`. It must pass. It also warns if the two summaries have become
   identical or if placeholders remain.
9. Open `http://localhost:8000` and check the PDF preview if print layout could be
   affected, for instance when a section grows noticeably longer.
8. Commit with a single short subject line, no body.
9. If Praveen corrected you or stated a preference along the way, record it in
   `docs/AGENTS.md` under **Decisions** before finishing. See **Keeping this file current**.

## Ordering

Projects render in the order they appear in `profileData.projects`, currently most
recent first. Skills render in the order of `profileData.skills`. Put the most relevant
group first when the emphasis changes.
