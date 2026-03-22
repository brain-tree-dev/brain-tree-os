# Plan a Brain Step

Help the user plan the implementation of a specific execution plan step. This command breaks a high-level step into concrete, actionable tasks and prepares everything needed to execute.

## CRITICAL: User-Facing Language Rule

NEVER expose internal technical details to the user. This includes:
- Tool names (Read, Write, Edit, Glob, Grep, Bash, etc.)
- Terms like "frontmatter", "YAML", "JSON", "wikilink syntax", "tool call"
- Error messages from tools (rephrase them in plain English)
- Internal system architecture or implementation details

Present everything in simple, friendly language. If a tool fails, say something like "I had trouble reading that file" not "Read tool returned an error."

## Brain Detection (MUST DO FIRST)

Your VERY FIRST action must be to locate the brain. Do this by:

1. Use Bash to search for the brain root: `SEARCH_DIR="$PWD"; while [ "$SEARCH_DIR" != "/" ]; do if [ -f "$SEARCH_DIR/BRAIN-INDEX.md" ] || [ -f "$SEARCH_DIR/.braintree/brain.json" ]; then echo "FOUND:$SEARCH_DIR"; break; fi; SEARCH_DIR=$(dirname "$SEARCH_DIR"); done`

**If no brain found**:
Check `~/.braintree-os/brains.json` for registered brains. If found, present options. If nothing found, tell the user: "I couldn't find a brain. Run **/init-braintree** to create one first."
STOP HERE.

**If a brain is found**: Set the brain root directory and proceed.

---

## Step 1: Identify the Step

If the user specified a step (e.g., "/plan-braintree 2.3"), use that. Otherwise:

1. Use Read on the execution plan file to show available steps.
2. Identify which steps are ready to work on (status "not_started" with all dependencies completed).
3. Present the unblocked steps as a numbered list and ask the user which step they want to plan.

Wait for the user to choose before proceeding.

## Step 2: Gather Context

Once the step is identified:

1. Use Read on the execution plan to get the step's full details: title, description, dependencies, and current status.
2. Use Glob on the brain's top-level directories to see which folders are relevant.
3. Use Read on 2-4 relevant brain files that provide context for this step. For example:
   - The folder index for the area this step belongs to
   - Any existing specs or plans related to this step
   - The BRAIN-INDEX for overall context
4. If the step has dependencies, use Read on files related to completed prerequisite steps to understand what has already been built.
5. Use Grep to search the brain for any content related to the step's topic (search for key terms from the step title/description).

## Step 3: Create the Plan

Break the step down into concrete implementation tasks. For each task:

1. **Title**: What needs to be done (one sentence)
2. **Details**: How to do it (specific files to create/modify, tools to use, acceptance criteria)
3. **Effort**: Small (< 30 min) / Medium (30-90 min) / Large (> 90 min)
4. **Order**: Which tasks depend on others

Present the plan as a numbered checklist the user can review:

```
IMPLEMENTATION PLAN: Step X.Y - [Title]

Goal: [One sentence describing the desired outcome]

Tasks:
  [ ] 1. [Task title] (effort: S)
       Details: [specifics]
       Files: [relevant brain files]

  [ ] 2. [Task title] (effort: M)
       Details: [specifics]
       Depends on: Task 1

  [ ] 3. [Task title] (effort: S)
       Details: [specifics]
       Can run in parallel with Task 2

Total estimated effort: [X hours]
```

## Step 4: Save the Plan

1. Use Write to save the plan to the appropriate folder in the brain. Name the file clearly (e.g., `Build/Plan-Step-2.3-Auth-System.md`). Start the file with `> Part of [[FolderIndex]]` to connect it to the graph.
2. Use Edit on the execution plan to mark the step as `in_progress` and add a reference to the plan file.
3. Use Edit on the relevant folder's index file to add a wikilink to the new plan file.

## Step 5: Guide Execution

Ask the user if they want to start executing the plan now. If yes:
- Start with the first task
- Work through them sequentially (or suggest parallel execution if tasks are independent)
- After each task, check it off and move to the next

If no, confirm the plan is saved and they can come back to it later: "The plan is saved in your brain. You can come back to it anytime with **/resume-braintree**."
