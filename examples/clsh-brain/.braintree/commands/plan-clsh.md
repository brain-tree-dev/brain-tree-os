Plan implementation for step $ARGUMENTS in the clsh.dev Execution Plan.

## 1. Find the Step

Read `Execution-Plan.md` and find the step matching "$ARGUMENTS".
If the step doesn't exist, list all available steps and ask the user to pick one.

## 2. Check Dependencies

Verify all steps in "Blocked By" are COMPLETE. If not, warn the user and show what's blocking.

## 3. Read Context

- Read the relevant vault files listed under "Vault Updates" for that step
- Read the technical plan in `Docs/compass_artifact_*.md` for implementation details
- Read any prerequisite vault files referenced in the step's instructions
- Read the agent persona file from `.braintree/agents/` for the assigned agent

## 4. Output Implementation Plan

```
## Step X.X: [Name]

**Agent**: [agent-name]
**Team**: [team-name from execution plan]
**Worktree**: [yes/no — worktree-name]
**Parallel Group**: [group ID — what else runs alongside this]
**Blocked By**: [dependencies — all COMPLETE ✓ or BLOCKED ✗]

### What This Step Accomplishes
[1-2 sentence summary]

### Files to Create/Modify
- `path/to/file.ts` — [what it does]
- `path/to/file.tsx` — [what it does]

### Step-by-Step Approach
1. [First thing to do]
2. [Second thing to do]
...

### Team Coordination
- [What other agents in the parallel group are doing]
- [Any shared files to be careful about]
- [Merge strategy for worktrees]

### Definition of Done
- [ ] [acceptance criterion 1]
- [ ] [acceptance criterion 2]

### After Completion
- Update Execution-Plan.md: mark step as COMPLETE
- Update vault files: [list]
- Newly unblocked steps: [list]
```

## 5. Ask User to Proceed

- **Option A**: Execute this step now (spawn agent if part of a team)
- **Option B**: Execute the full parallel group (spawn all agents)
- **Option C**: Adjust the plan first
