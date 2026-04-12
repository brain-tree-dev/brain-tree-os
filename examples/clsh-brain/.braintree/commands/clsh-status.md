Check clsh.dev project status across all departments and execution progress.

## 1. Read Execution Plan

Read `Execution-Plan.md` and extract:
- Status of every step (NOT STARTED / IN PROGRESS / COMPLETE)
- Overall progress percentage
- Current parallel group
- Dependency graph state

## 2. Read Department Status

Read ALL department index files:
- `00_Company/Company.md`
- `01_RnD/RnD.md`
- `02_Product/Product.md`
- `03_Marketing/Marketing.md`
- `04_Community/Community.md`
- `05_Business/Business.md`
- `06_Legal/Legal.md`

Extract the "Status" field from each.

## 3. Read Latest Handoff

Read the most recent file in `Handoffs/` for session context.

## 4. Output Dashboard

```
## clsh.dev — Project Status

### Overall Progress: X% (Y/15 steps)

### Execution Plan

| Phase | Steps | Done | In Progress | % |
|-------|-------|------|-------------|---|
| 1. Foundation | 4 | ? | ? | ?% |
| 2. UI + Polish | 4 | ? | ? | ?% |
| 3. Launch Prep | 4 | ? | ? | ?% |
| 4. Launch | 3 | ? | ? | ?% |

### Step-by-Step Status

| Step | Name | Status | Agent | Blocked By |
|------|------|--------|-------|------------|
| 1.1 | Scaffolding | ? | rnd-lead | — |
| 1.2 | Backend Core | ? | backend-engineer | 1.1 |
| ... | ... | ... | ... | ... |

### Department Health

| Dept | Status | Key Highlight |
|------|--------|---------------|
| R&D | ? | ? |
| Product | ? | ? |
| Marketing | ? | ? |
| Community | ? | ? |
| Business | ? | ? |
| Legal | ? | ? |

### Currently Unblocked (Ready to Execute)
- Step X.X: [name] — agent: [name]

### Active Blockers
- [anything preventing progress]

### Social Channels
| Platform | Status |
|----------|--------|
| Discord | ? |
| X (Twitter) | ? |
| Instagram | ? |
| TikTok | ? |
| GitHub | ? |
| Product Hunt | ? |

### Next Milestones
1. [next major milestone]
2. [next major milestone]
```
