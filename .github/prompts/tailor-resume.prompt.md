---
mode: agent
description: Tailor the resume in data.js for a specific job description, truthfully and ATS-first.
---

# Tailor the resume for a job description

Adapt the resume to a specific posting without overstating anything or changing the
page's structure.

## Inputs

- A job description pasted by the user, or a public job posting URL to fetch.
- The current content in `data.js`, which is the baseline being tailored.
- `resume-projects.md` and `current_skills.md`, the canonical source material. They
  live outside this repository and their location differs by machine, so ask where they
  are rather than assuming a path. Nothing may be claimed that these do not support. If
  they are not available here, say so and work from `data.js` alone.

## Steps

1. Read `AGENTS.md` first, then `data.js`. Do not start rewriting before you know what
   the baseline says.
2. Get the posting. Fetch the URL if given one, otherwise use the pasted text.
3. **Parse it as an ATS would.** Extract every keyword, skill and requirement it will
   scan for, grouped as: job title and title variants; hard skills, tools, languages,
   platforms and methodologies; domain terms; soft skills; qualifications such as years
   of experience, education and certifications. Mark each must-have or nice-to-have
   based on how the posting phrases it ("required" against "preferred"), repetition,
   and placement.
4. **Score the baseline.** Report the percentage of extracted terms already present in
   `data.js`, and list what is missing. Distinguish terms that are genuinely missing
   from the experience against terms present under different wording.
5. **Review positioning before rewriting.** Does `role` and `summary` present the kind
   of engineer this posting hires? Are there strong, relevant credentials buried in an
   older project that should move up into the summary or skills?
6. **Rewrite, truthfully.** Update `summary`, `summaryAts`, `skills` groups, and
   project `bullets` and `tech` to mirror the posting's language where the experience
   genuinely supports it. Prefer the posting's exact strings over synonyms. Never
   invent a title, a year of experience, a metric, or an achievement.
7. **Respect the two summaries.** `summary` stays readable for a human landing on the
   page; `summaryAts` carries the keyword density for the PDF and DOCX. Both must agree
   on facts. Keep the constraints already decided: no client or project names, no
   industry list, no opener that reads as a restriction, and nothing about the earlier
   full stack work.
8. Keep the layout. No redesign unless asked.
9. Use 25-35 role-specific terms naturally across summary, skills and bullets. Stop
   short of keyword stuffing: no repetition for its own sake, no term list wedged into
   a sentence, no term that does not fit the bullet it sits in.
10. Run the review checklist below and fix what fails.
11. Run `node check.js`. It must pass.
12. Report: the extracted term list, the before and after match rate, the positioning
    changes made, and any term you deliberately left out because the experience does
    not support it.
13. If Praveen corrected you or stated a preference along the way, record it in
    `AGENTS.md` under **Decisions**, and mirror any prompt change across
    `.claude/commands/` and `.github/prompts/`. See **Keeping this file current**.

## Variants

To keep a tailored version rather than overwrite the baseline, copy `data.js` to a
company-role shorthand in lowercase with hyphens, for example `stripe-data-platform.js`
or `atlassian-senior-data-engineer.js`, and point `index.html` at it while exporting.
Restore `data.js` afterwards so the published site keeps the general version. The
deliverables a recruiter sees are the DOCX and PDF, not the JS file.

## Review checklist

Read the result as the hiring manager for this specific role would.

- **Six second test.** The top of the page, name through summary, shows the current
  role, the years of experience, and the strongest relevant work at a glance.
- **Impact over responsibilities.** Bullets say what changed and why it mattered, using
  only metrics already in the source files or confirmed by Praveen. Never invented ones.
- **Relevance order.** The most relevant projects and skills come first. Bullets that
  do not help this application are trimmed.
- **Consistency.** Titles, dates, years of experience and technology names agree across
  the page, the PDF and the DOCX.
- **Match rate.** Re-score against the same term list. Every must-have the experience
  truthfully supports is present.
- **Stuffing check.** Flag any phrase where a term was forced in, and rewrite it
  naturally or drop the term.
- **House style.** No em dashes. No commit statistics or implementation counts. One
  line commit messages.
