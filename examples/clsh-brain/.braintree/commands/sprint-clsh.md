Plan the sprint for week $ARGUMENTS of the clsh.dev build plan.

## 1. Read Execution Plan

Read `Execution-Plan.md` and identify:
- All steps scheduled for week $ARGUMENTS
- Current status of each (NOT STARTED, IN PROGRESS, COMPLETE)
- Dependencies between steps

## 2. Read Latest State

- Read the most recent handoff from `Handoffs/`
- Check overall progress percentage
- Identify any carryover from previous weeks

## 3. Map Parallel Groups

For this week's steps, group them by parallel execution:

```
Week $ARGUMENTS Parallel Execution Map:

Time →
────────────────────────────────────────────────────────────
Group A:  [Step X.X: name]  ──────►  [Step X.X: name]
          agent: [name]              agent: [name]
          worktree: [name]           worktree: [name]

Group B:  [Step X.X: name]  ──────────────────────────────►
          agent: [name]
          worktree: [name]
────────────────────────────────────────────────────────────
```

## 4. Output Sprint Plan

```
## Sprint — Week $ARGUMENTS

### Goals
- [What we aim to accomplish this week]

### Steps This Week

| Step | Agent | Parallel Group | Worktree | Blocked By | Status |
|------|-------|----------------|----------|------------|--------|
| X.X  | name  | [group]        | [name]   | [deps]     | Ready  |

### Team Configuration

For each parallel group, specify:
- Team name: `clsh-[phase][group]`
- Agents to spawn
- Worktree names
- Expected merge order

### Day-by-Day Breakdown
- **Day 1-2**: [parallel group A — spawn team, all agents work simultaneously]
- **Day 3**: [merge worktrees, resolve conflicts]
- **Day 4-5**: [parallel group B — spawn next team]

### Dependencies
- [what must complete before what]

### Risks
- [what could slow us down]
- [merge conflict risks between worktrees]
```

## 5. Ask User

- **Option A**: Start this sprint (spawn first parallel group team)
- **Option B**: Adjust the sprint plan
- **Option C**: Skip to a specific step
