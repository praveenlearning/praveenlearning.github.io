# Specs

One file per feature, written before the code, kept in step with it afterwards.

## Naming

`NNNN-short-slug.md`, numbered in order of creation. Numbers are never reused, so a
spec can be referenced by number in a commit message or a decision log entry.

## Lifecycle

1. `/spec <feature>` writes the spec. No code is written in this step.
2. `/plan specs/NNNN-*.md` turns it into an implementation plan. Still no code.
3. `/build specs/NNNN-*.md` implements it, runs `node check.js`, and reports each
   Verification item as met or not met.
4. The spec and the code that implements it land in the same commit.

## When a spec is worth writing

Write one when the change has structure: a new data shape, a new section, anything
affecting more than one of the three outputs (web page, PDF, DOCX), or anything whose
reasoning will be forgotten in a month.

Do not write one for copy edits, a colour change, or a single-line fix. The overhead
would exceed the value, and `AGENTS.md` already holds the standing rules.

## Keeping them honest

A spec that no longer matches the code is worse than no spec, because it is believed.
When behaviour changes, edit the spec in the same change. When a spec turns out to be
wrong, correct it rather than leaving the code to disagree with it silently.
