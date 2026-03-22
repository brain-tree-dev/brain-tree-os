# Brain Status Dashboard

Generate a comprehensive status dashboard for the user's BrainTree brain. This should feel like opening a project dashboard, giving an instant, visual overview of everything.

## CRITICAL: User-Facing Language Rule

NEVER expose internal technical details to the user. This includes:
- Tool names (Read, Write, Edit, Glob, Grep, Bash, etc.)
- Terms like "frontmatter", "YAML", "JSON", "wikilink syntax", "tool call"
- Error messages from tools (rephrase them in plain English)
- Internal system architecture or implementation details

Present everything in simple, friendly language. If a tool fails, say something like "I had trouble reading your brain" not "Glob tool returned an error."

## Brain Detection (MUST DO FIRST)

Your VERY FIRST action must be to locate the brain. Do this by:

1. Use Bash to search for the brain root: `SEARCH_DIR="$PWD"; while [ "$SEARCH_DIR" != "/" ]; do if [ -f "$SEARCH_DIR/BRAIN-INDEX.md" ] || [ -f "$SEARCH_DIR/.braintree/brain.json" ]; then echo "FOUND:$SEARCH_DIR"; break; fi; SEARCH_DIR=$(dirname "$SEARCH_DIR"); done`

**If no brain found**:
Check `~/.braintree-os/brains.json` for registered brains. If found, present options. If nothing found, tell the user: "I couldn't find a brain. Run **/init-braintree** to create one first."
STOP HERE.

**If a brain is found**: Set the brain root directory and proceed.

---

## Step 1: Gather Data

Gather the full picture by reading brain files and scanning the structure:

1. Use Read on `Execution-Plan/Execution-Plan.md` (or wherever the execution plan lives) for phase-by-phase progress.
2. Use Glob with pattern `**/*.md` at the brain root to get a full inventory of all markdown files.
3. Use Glob per top-level directory to count files per department/folder (e.g., `Vision/*.md`, `Build/*.md`, etc.).
4. Use Glob on `Handoffs/handoff-*.md` to get session history.
5. Use Read on `BRAIN-INDEX.md` to understand the overall structure.
6. Use Grep to scan for wikilinks across the brain: search for `\[\[` pattern to understand the graph connectivity.
7. Use Grep to find orphan indicators: search for files that do NOT contain `> Part of` (which would mean they might be disconnected).

## Step 2: Present the Dashboard

Format the output as a rich ASCII dashboard. Include all of these sections:

### Brain Info
Show the brain name, description, and creation date from `.braintree/brain.json` or BRAIN-INDEX.md.

### Execution Plan Progress
Show each phase with an ASCII progress bar and step counts. Parse the execution plan to count steps by status (completed, in_progress, not_started, blocked):
```
Phase 0: Foundation    [==========] 100%  (5/5 steps done)
Phase 1: Core Build    [======----]  60%  (6/10 steps done)
Phase 2: Launch Prep   [==--------]  20%  (2/10 steps done)
Phase 3: Post-Launch   [----------]   0%  (0/8 steps done)

Overall: [=====-----] 39% complete (13/33 steps)
```

If there is no execution plan (e.g., the brain uses Working Rhythms instead), show the rhythm status instead.

### Currently In Progress
List any steps with status "in_progress":
- Step X.Y: Title (started Session N)

### Blocked Steps
List any steps with status "blocked" and their blockers.

### Unblocked and Ready
List steps that have status "not_started" but whose dependencies are all completed. These can be started right now.

### Folder Overview
Show each folder with file count and a brief status:
```
Folder              Files  Status
Vision              4      Healthy
Build               12     Active (last updated Session 5)
Product             3      Needs attention
Go-To-Market        0      Empty
Operations          2      Minimal
Assets              0      Empty (drop files here!)
Handoffs            3      Up to date
Templates           3      Ready
```

### Knowledge Graph Stats
Calculate from the Grep scan:
- Total files (from Glob)
- Total wikilinks found (from Grep count)
- Approximate average connections per file
- Orphan files (files with no `> Part of` line and not BRAIN-INDEX.md)
- Most connected files (if determinable from wikilink frequency)

### Session Timeline
Show the last 5 sessions from handoffs (read the first few lines of each for the date and summary):
```
Session 5  (2026-03-22)  Built authentication flow
Session 4  (2026-03-21)  Set up database schema
Session 3  (2026-03-20)  Designed landing page
...
```

### Recommendations
Based on the data, suggest 1-2 actions:
- If there are orphan files, suggest linking them
- If a folder is empty, suggest populating it
- If progress has stalled on a phase, highlight the blocking steps
- If the user has not had a session recently, welcome them back
- If there are broken wikilinks, suggest running /sync-braintree
