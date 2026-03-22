# Wrap Up Brain Session

You are closing out a work session on the user's BrainTree brain. This is one of the most important commands because it ensures continuity between sessions. A good wrap-up means the next /resume-braintree will be seamless. A bad one means lost context and wasted time.

Your job: audit everything that happened, update the brain to reflect reality, and create a comprehensive handoff.

## CRITICAL: User-Facing Language Rule

NEVER expose internal technical details to the user. This includes:
- Tool names (Read, Write, Edit, Glob, Grep, Bash, etc.)
- Terms like "frontmatter", "YAML", "JSON", "wikilink syntax", "tool call"
- Error messages from tools (rephrase them in plain English)
- Internal system architecture or implementation details

Present everything in simple, friendly language. If a tool fails, say something like "I had trouble saving that update" not "Edit tool returned an error."

## Brain Detection (MUST DO FIRST)

Your VERY FIRST action must be to locate the brain. Do this by:

1. Use Bash to search for the brain root: `SEARCH_DIR="$PWD"; while [ "$SEARCH_DIR" != "/" ]; do if [ -f "$SEARCH_DIR/BRAIN-INDEX.md" ] || [ -f "$SEARCH_DIR/.braintree/brain.json" ]; then echo "FOUND:$SEARCH_DIR"; break; fi; SEARCH_DIR=$(dirname "$SEARCH_DIR"); done`

**If no brain found**:
Check `~/.braintree-os/brains.json` for registered brains. If found, present options. If nothing found, tell the user: "I couldn't find a brain to wrap up. Run **/init-braintree** to create one first."
STOP HERE.

**If a brain is found**: Set the brain root directory and proceed.

---

## Step 1: Audit the Session

Before writing anything, figure out what happened this session:

1. Review your conversation history to identify:
   - Files that were created or modified (in the brain or in the codebase)
   - Steps from the execution plan that progressed or completed
   - Decisions that were made and their rationale
   - Blockers that were discovered
   - Ideas or insights that came up
   - Any context the user shared that should be preserved

2. Use Glob on the brain root to see the current folder structure and identify which areas were touched.

## Step 2: Update Department Files

For each department/area that was touched during the session:

1. Use Read to read the department's index or relevant content files.
2. Use Edit or Write to update those files with:
   - New content created during the session (e.g., if you wrote marketing copy, save it to the Marketing folder)
   - Updated status information
   - Wikilinks ONLY to files that actually exist in the brain. NEVER create wikilinks to files that haven't been created yet.
   - Notes on decisions or changes made

Be thorough. If the session involved work across multiple areas (e.g., frontend code + marketing content + infrastructure setup), update ALL relevant files in the brain.

Examples:
- Built a landing page? Update Build/ with component details and Go-To-Market/ with copy/messaging.
- Wrote social media content for 5 platforms? Create or update files in Content/ for each platform.
- Set up CI/CD? Update Build/ or Operations/ with the pipeline details.
- Had a strategy discussion? Update Strategy/ or Product/ with the decisions.

## Step 3: Update Execution Plan

Use Read on the execution plan file, then use Edit to update it:

- Mark completed steps with status: `completed` and a brief note of what was done.
- Mark started-but-unfinished steps with status: `in_progress` and note what remains.
- Mark blocked steps with status: `blocked` and the reason.

## Step 4: Create Handoff

First, determine the next session number. Use Glob to find existing handoffs: `Handoffs/handoff-*.md` and determine the next number.

Then get the current date and time using Bash: `date "+%B %d, %Y at %I:%M %p"`

Use Write to create a new handoff file at `Handoffs/handoff-NNN.md`. The content MUST include all of these sections:

### Header
Start every handoff with:
1. `> Part of [[Handoffs]]` so the handoff links to its parent folder index (NOT directly to BRAIN-INDEX)
2. **Date and time**: Include as "**Date**: March 21, 2026 at 3:45 PM"

### Summary
A 2-3 sentence overview of the session.

### What Was Done
Bullet list of concrete accomplishments:
- Files created/modified (with paths)
- Features built or content created
- Configurations changed
- Issues resolved

### Decisions Made
Document any decisions and their rationale. Future sessions need to know WHY things were done a certain way.

### Blockers and Open Questions
Anything unresolved that the next session needs to address.

### Recommended Next Steps
Specific, actionable items for the next session. Ordered by priority. Include which files to read first and which execution plan steps to tackle.

### Files to Read on Resume
List the 3-5 most important files the next session should read to get up to speed quickly. Use wikilinks (`[[filename]]`) ONLY to files that actually exist in the brain.

## Step 5: Update Handoffs Index and BRAIN-INDEX

**Handoffs/Handoffs.md**: Use Read on Handoffs/Handoffs.md, then Edit to add a wikilink to the new handoff file (e.g., `[[handoff-001]]`) in the Session History section. This is CRITICAL to prevent floating nodes.

**BRAIN-INDEX.md**: Use Read on BRAIN-INDEX.md, then Edit to:
- Add a session log entry (Session N: [date at time] - [brief summary])
- Update any department status indicators if they changed
- Update progress percentage if applicable

## Step 6: Present Summary

Show the user a clean summary:
- Session number and duration
- Key accomplishments (bullet list)
- Brain files updated (count and list)
- Execution plan progress (before and after)
- What to do next session

End with: "Your brain is up to date. Run **/resume-braintree** next time to pick up right where you left off."
