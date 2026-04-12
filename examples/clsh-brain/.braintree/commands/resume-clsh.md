Resume clsh.dev development from where we left off. Follow ALL steps in order.

## 1. Read Execution Plan State

Read `Execution-Plan.md` and determine:
- Which steps are COMPLETE, IN PROGRESS, and NOT STARTED
- Current overall progress percentage
- Which parallel group we're in

## 2. Read Latest Handoff

Find the most recent file in `Handoffs/` (sort by date). Read it to understand:
- What was done last
- What's next
- Open questions or blockers
- Which steps were unblocked

## 3. Identify Parallelism Opportunities

Using the **Dependency Graph** in the Execution Plan, identify:
- All steps that are currently unblocked (all "Blocked By" dependencies are COMPLETE)
- Which of those unblocked steps can run in parallel (same parallel group)
- Which agents to spawn for each

## 4. Read Relevant Vault Files

For each unblocked step, read its department vault files:
- The department index (e.g., [[RnD]], [[Frontend]])
- Any subfolder indexes referenced in the step
- The technical plan `Docs/compass_artifact_*.md` for implementation details relevant to those steps

## 5. Output Resume Summary

Present this to the user:

```
## Where We Left Off

**Last session**: [date from handoff]
**Overall progress**: X% (Y/15 steps complete)
**Current phase**: Phase N — [name]

## Completed Steps
- [x] Step X.X: [name] — COMPLETE
- [x] Step X.X: [name] — COMPLETE

## Ready to Execute Now

### Parallel Group [ID] — [N] agents can run simultaneously

| Step | Agent | Worktree | Status |
|------|-------|----------|--------|
| X.X: [name] | [agent] | [worktree-name] | Ready |
| X.X: [name] | [agent] | [worktree-name] | Ready |

### Recommended Team Setup
Team name: `clsh-phase[N][letter]`
Agents to spawn:
1. `[agent-name]` → Step X.X (worktree: [name])
2. `[agent-name]` → Step X.X (worktree: [name])

## Blocked Steps (waiting on dependencies)
- Step X.X: [name] — blocked by Step X.X
```

## 6. Ask User How to Proceed

Present options:
- **Option A**: Spawn the full parallel team and execute all ready steps
- **Option B**: Work on a single specific step
- **Option C**: Review/adjust the execution plan first

If the user picks A, create the team with `TeamCreate`, create tasks with `TaskCreate`, and spawn agents with the `Task` tool using `team_name`, `subagent_type: "general-purpose"`, and `isolation: "worktree"` where specified in the execution plan.
