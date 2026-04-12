Wrap up the current clsh.dev work session. You MUST complete ALL of these steps — no shortcuts.

## 1. Summarize Session Work

Summarize all changes made in this session:
- Files created, modified, or deleted
- Decisions made
- Steps completed from the [[Execution-Plan]]
- Bugs fixed or issues discovered

## 2. Update Execution Plan (MANDATORY)

Open `Execution-Plan.md` and for EVERY step that was worked on:
- Change `NOT STARTED` → `IN PROGRESS` or `COMPLETE`
- Check off completed task checkboxes `- [x]`
- Update the **Progress Summary** table: recalculate completed counts and percentages
- Add an entry to the **Session Log** table at the bottom with today's date

If a step is now COMPLETE, also check: are any steps that were **Blocked By** this step now unblocked? Note them in the handoff.

## 3. Update Vault Department Files

For each department affected by this session's work:
- Update the "Status" field in the department index file
- Update the "Current State" in any subfolder index files touched
- Check off completed TODOs
- Add new TODOs discovered during work

## 4. Update VAULT-INDEX.md

- Update the department status table with current status per department
- Update the "Current Progress" section with overall percentage

## 5. Create Handoff Note (MANDATORY)

Create a new file: `Handoffs/handoff-YYYY-MM-DD.md` with this exact structure:

```markdown
---
title: Handoff — YYYY-MM-DD
tags: #handoff #clsh
date: YYYY-MM-DD
session_number: N
---

# Handoff — YYYY-MM-DD

## What Was Done
- [bullet points of completed work]

## Steps Completed
- [list of execution plan steps completed or progressed]

## Execution Plan Progress
- **Overall**: X% (Y/15 steps complete)
- **Current Phase**: Phase N — [name]

## Now Unblocked
- [list of steps that are now unblocked by today's work]

## What's Next
- [the next step(s) to tackle, with parallel group info]
- [which team/agents to spawn]

## Open Questions
- [anything unresolved]

## Files Updated
- [list of all vault files touched]
```

## 6. Verify Consistency

Quick check — does the execution plan percentage match the vault index percentage? If not, fix it.
