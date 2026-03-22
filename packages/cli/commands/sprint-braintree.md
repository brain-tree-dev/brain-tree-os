# Brain Sprint Planning

Help the user plan their week's work by organizing unblocked steps into a focused sprint. This brings structured agile-style planning to the brain.

## CRITICAL: User-Facing Language Rule

NEVER expose internal technical details to the user. This includes:
- Tool names (Read, Write, Edit, Glob, Grep, Bash, etc.)
- Terms like "frontmatter", "YAML", "JSON", "wikilink syntax", "tool call"
- Error messages from tools (rephrase them in plain English)
- Internal system architecture or implementation details

Present everything in simple, friendly language. If a tool fails, say something like "I had trouble loading your plan" not "Read tool returned an error."

## Brain Detection (MUST DO FIRST)

Your VERY FIRST action must be to locate the brain. Do this by:

1. Use Bash to search for the brain root: `SEARCH_DIR="$PWD"; while [ "$SEARCH_DIR" != "/" ]; do if [ -f "$SEARCH_DIR/BRAIN-INDEX.md" ] || [ -f "$SEARCH_DIR/.braintree/brain.json" ]; then echo "FOUND:$SEARCH_DIR"; break; fi; SEARCH_DIR=$(dirname "$SEARCH_DIR"); done`

**If no brain found**:
Check `~/.braintree-os/brains.json` for registered brains. If found, present options. If nothing found, tell the user: "I couldn't find a brain. Run **/init-braintree** to create one first."
STOP HERE.

**If a brain is found**: Set the brain root directory and proceed.

---

## Step 1: Gather Current State

1. Use Read on the execution plan file to get all steps, their statuses, and dependencies.
2. Use Glob on `Handoffs/handoff-*.md` and Read the latest one to see where the last session left off and what was recommended.
3. Use Glob on the brain's top-level directories to understand which areas are active.
4. Use Read on BRAIN-INDEX.md for overall context.

Analyze the execution plan to identify:
- **Unblocked steps**: Steps with status "not_started" whose dependencies are all "completed"
- **In-progress steps**: Steps already started that need to be finished
- **Blocked steps**: Steps waiting on something (note what they are waiting on)

## Step 2: Analyze and Group

For each unblocked and in-progress step, determine:
- **Effort estimate**: S (1-2 hours), M (half day), L (full day), XL (multi-day)
- **Priority**: Critical (blocks many things), High (on the main path), Medium (nice to have), Low (can wait)
- **Parallel group**: Which steps can run simultaneously without conflicts

To determine priority, check how many other steps depend on each unblocked step. Steps that unblock the most downstream work are Critical.

Group the steps into logical work blocks.

## Step 3: Propose the Sprint

Get the current date using Bash: `date "+%B %d, %Y"`

Present a sprint plan for the week. Format it clearly:

```
SPRINT PLAN: Week of [date]

Goal: [One sentence describing the sprint objective]

Day 1-2: [Theme]
  [ ] Step X.Y: Title (effort: M, priority: Critical)
  [ ] Step X.Z: Title (effort: S, priority: High)
      ^ Can run in parallel with X.Y

Day 3-4: [Theme]
  [ ] Step A.B: Title (effort: L, priority: High)
      Depends on: Step X.Y completion

Day 5: [Theme / Buffer]
  [ ] Step C.D: Title (effort: S, priority: Medium)
  [ ] Buffer time for overflow or unexpected work

Total effort: ~X steps across N parallel groups
```

Include:
- A clear sprint goal (what will be true at the end of the week)
- Logical grouping by theme or dependency
- Parallel execution opportunities highlighted
- Buffer time for unexpected work
- Any in-progress steps that should be finished first

## Step 4: Confirm and Save

Ask the user to review and adjust:
- "Would you like to add, remove, or reprioritize any steps?"
- "Is this the right amount of work for the week?"

Once confirmed:
1. Use Write to save the sprint plan to the brain. Create it as `Execution-Plan/Sprint-[date].md` (or in an appropriate location). Start with `> Part of [[Execution-Plan]]` to connect it to the graph.
2. Use Edit on the Execution-Plan index to add a wikilink to the new sprint file.
3. Summarize the sprint and wish the user a productive week.
4. Suggest starting with "/plan-braintree [first step]" to plan the first task in detail.
