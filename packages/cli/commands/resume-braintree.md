# Resume Brain Session

You are helping the user resume work on their BrainTree brain. This is the most important command because it is how every work session starts. Your goal is to give the user a crystal-clear picture of where they are and exactly what to do next. Do NOT just dump status. Be a strategic advisor.

## CRITICAL: User-Facing Language Rule

NEVER expose internal technical details to the user. This includes:
- Tool names (Read, Write, Edit, Glob, Grep, Bash, etc.)
- Terms like "frontmatter", "YAML", "JSON", "wikilink syntax", "tool call"
- Error messages from tools (rephrase them in plain English)
- Internal system architecture or implementation details

Present everything in simple, friendly language. If a tool fails, say something like "I had trouble loading your brain" not "Read tool returned an error."

## Phase 0: Brain Detection (MUST DO FIRST)

Your VERY FIRST action must be to locate the brain. Follow this sequence:

### Step 1: Check current directory tree

Use Bash to walk up from the current directory looking for a brain:
```bash
DIR="$PWD"; while [ "$DIR" != "/" ]; do
  [ -f "$DIR/.braintree/brain.json" ] && echo "FOUND:$DIR" && break
  [ -f "$DIR/BRAIN-INDEX.md" ] && echo "FOUND:$DIR" && break
  DIR=$(dirname "$DIR")
done
```

**If a brain is found in the current directory tree**:
1. Read `.braintree/brain.json` to get the brain name and ID
2. Read `~/.braintree-os/server.json` to check if the viewer server is running
3. If the server is running, show: "Found brain: **[Brain Name]**. View it at: **http://localhost:PORT/brains/BRAIN_ID**"
4. If no server, show: "Found brain: **[Brain Name]**"
5. Set the brain root directory and proceed to Step 0 below.

### Step 2: Fallback to global registry (only if Step 1 found nothing)

Read `~/.braintree-os/brains.json` for registered brains.

**If 0 brains registered**:
Tell the user: "No brains found. Run **/init-braintree** to create your first brain."
STOP HERE.

**If 1 brain registered**:
Auto-select it. Read its `.braintree/brain.json`, show: "Found brain: **[Brain Name]** at [path]."
Set the brain root directory and proceed.

**If multiple brains registered**:
List them with numbers and ask the user to pick:
```
Which brain would you like to work on?

1. My SaaS App (~/projects/my-saas/)
2. Marketing Hub (~/projects/marketing/)
3. PhD Research (~/research/phd/)
```

Wait for the user's choice. Set the brain root directory and proceed.

---

## Step 0: Session Awareness Check

Before loading brain context, check your current conversation history. If this session already has significant work done (files created, code written, plans discussed), the user likely needs to wrap up rather than resume.

**If this session already has substantial work**:
Tell the user: "It looks like you have already been working in this session. Would you like to wrap up first with /wrap-up-braintree to save your progress, or start fresh?"
Wait for their answer before proceeding.

**If this is a fresh session (no prior work)**: Proceed to Step 1.

## Step 1: Load Context

Gather the full picture by reading brain files:

1. Use Read on `BRAIN-INDEX.md` to understand the brain's structure, departments, and overall state.
2. Use Read on `CLAUDE.md` to load the brain's DNA. This tells you the brain's purpose, structure, conventions, and available agents. Internalize this context for the entire session.
3. Use Glob to find the latest handoff: `Handoffs/handoff-*.md` and sort by name to find the most recent one. Use Read on it to get the last session's summary, what was done, what was recommended next, and which files to focus on.
4. Use Read on `Execution-Plan/Execution-Plan.md` (or wherever the execution plan lives) to see overall progress across all phases and steps.
5. Use Glob to list top-level directories and understand the brain's folder structure: `*/` at the brain root.

## Step 2: Read Key Files

Based on the handoff's "files to read" recommendation, use Read on the 2-4 most important files for the current context. This gives you the detailed state, not just summaries.

## Step 3: Present Targeted Status

Present a focused status report. Structure it exactly like this:

### Last Session Recap
"In your last session (Session N), you [concise summary of what was accomplished]. You left off at [specific point]."

If there were blockers or open questions from the last session, highlight them here.

### Current Progress
Show a brief progress overview. Use ASCII progress bars for phases:
```
Phase 1: Setup        [========--] 80%  (7/9 steps)
Phase 2: Core Build   [===-------] 30%  (3/10 steps)
Phase 3: Launch       [----------]  0%  (0/5 steps)
```

### Recommended Next Steps
This is the most critical part. Be specific and actionable:

"The highest priority next step is **[Step X.Y: Title]** because [reason: it unblocks the most work / it is on the critical path / it was recommended in the last handoff]."

For each recommended step (up to 3), include:
- What the step involves (1-2 sentences)
- Which brain files are relevant (list specific paths)
- Estimated complexity (small / medium / large)

### Parallel Opportunities
If multiple unblocked steps can run simultaneously, highlight this: "Steps X.Y and X.Z can run in parallel if you want to tackle multiple things at once."

## Step 4: Ask What to Work On

Present the options as a numbered list the user can choose from:

- The first option should be the recommended highest-priority step (add "(Recommended)" to the label)
- Add 1-2 other unblocked steps as additional options
- Include an "Other" option for custom work

Example:
```
What would you like to work on?

1. Step 2.3: Build authentication system (Recommended)
2. Step 2.4: Write API integration tests
3. Step 3.1: Update documentation
4. Something else (tell me what you have in mind)
```

Wait for the user's choice before proceeding. Once they choose, dive into the work immediately.
