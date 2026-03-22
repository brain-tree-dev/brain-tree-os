# Brain Feature Planning

Help the user plan and track a new feature from idea through implementation using the brain as the source of truth.

## CRITICAL: User-Facing Language Rule

NEVER expose internal technical details to the user. This includes:
- Tool names (Read, Write, Edit, Glob, Grep, Bash, etc.)
- Terms like "frontmatter", "YAML", "JSON", "wikilink syntax", "tool call"
- Error messages from tools (rephrase them in plain English)
- Internal system architecture or implementation details

Present everything in simple, friendly language. If a tool fails, say something like "I had trouble searching your brain" not "Grep tool returned an error."

## Brain Detection (MUST DO FIRST)

Your VERY FIRST action must be to locate the brain. Do this by:

1. Use Bash to search for the brain root: `SEARCH_DIR="$PWD"; while [ "$SEARCH_DIR" != "/" ]; do if [ -f "$SEARCH_DIR/BRAIN-INDEX.md" ] || [ -f "$SEARCH_DIR/.braintree/brain.json" ]; then echo "FOUND:$SEARCH_DIR"; break; fi; SEARCH_DIR=$(dirname "$SEARCH_DIR"); done`

**If no brain found**:
Check `~/.braintree-os/brains.json` for registered brains. If found, present options. If nothing found, tell the user: "I couldn't find a brain. Run **/init-braintree** to create one first."
STOP HERE.

**If a brain is found**: Set the brain root directory and proceed.

---

## Step 1: Understand the Feature

Ask the user to describe the feature they want to build or add. Get:
- What it does (user-facing behavior)
- Why it matters (business/product value)
- Any technical constraints or preferences

If the user gave a description with the command (e.g., "/feature-braintree add dark mode"), use that as the starting point and ask clarifying questions only if needed.

## Step 2: Research Existing Context

Search the brain for anything related:

1. Use Grep to search all brain files for keywords from the feature description. Cast a wide net with multiple relevant terms.
2. Use Read on the top 3-5 matching files to understand existing context.
3. Use Read on the execution plan to see if this feature maps to an existing step or is entirely new.
4. Use Grep to find any files that link to relevant files (backlinks): search for `[[filename]]` patterns referencing the related files you found.

Summarize what you found: "Here is what your brain already knows about this area: [summary]. This feature [overlaps with / is independent of] existing work."

## Step 3: Create Feature Spec

Use Write to create a feature spec in the appropriate brain folder. Choose the folder that best fits:
- If the brain has a Product/ or Features/ folder, put it there
- If the brain has an Ideas/ or Projects/ folder, put it there
- Otherwise, create it in the most relevant folder

Name the file clearly: `Feature-[Name].md` (e.g., `Product/Feature-Dark-Mode.md`)

The spec should include:

```
# Feature: [Name]

> Part of [[FolderIndex]]

**Status**: Planning
**Priority**: [to be determined with user]
**Created**: [date]

## Summary
[One paragraph description of the feature]

## Motivation
[Why this feature matters. What problem it solves. What value it delivers.]

## User Stories
- As a [user type], I want to [action] so that [benefit]
- As a [user type], I want to [action] so that [benefit]
- As a [user type], I want to [action] so that [benefit]

## Requirements
- [ ] [Specific, testable requirement]
- [ ] [Specific, testable requirement]
- [ ] [Specific, testable requirement]

## Technical Approach
[High-level implementation plan. What needs to be built, what existing code/content to modify.]

## Dependencies
- [What this feature depends on (other features, infrastructure, content, etc.)]

## Open Questions
- [Anything still unclear that needs to be resolved]

## Related Files
- [[related-file-1]] - [why it's relevant]
- [[related-file-2]] - [why it's relevant]
```

Fill in as much as possible from the conversation and brain context. Leave Open Questions for things that genuinely need user input.

## Step 4: Update the Brain

1. If the feature maps to an existing execution plan step, use Edit on the execution plan to mark it as `in_progress` and reference the feature spec.
2. If it is a new feature not in the plan, ask the user: "This feature isn't in your current plan. Would you like me to add it as a new step?" If yes, use Edit on the execution plan to add it.
3. Use Read on the relevant folder's index file, then use Edit to add a wikilink to the new feature spec.
4. If the feature touches multiple brain areas, update each relevant folder index with a cross-reference.

## Step 5: Guide Implementation

Ask the user if they want to start implementing now. If yes:

1. Break the feature into implementation tasks (from the spec's technical approach).
2. Present them as a numbered checklist with effort estimates.
3. Work through each task, using the brain files for reference.
4. After completing significant parts, use Edit to update the feature spec's status and add implementation notes.

If no, confirm the spec is saved and suggest next steps: "The feature spec is saved. You can come back to it anytime. I would suggest tackling this in your next sprint, which you can plan with **/sprint-braintree**."

## Step 6: Wrap Up

When the feature work is done (or paused):

1. Use Edit to update the feature spec with current status and any implementation notes.
2. If applicable, use Edit on the execution plan to update the related step status.
3. Suggest running **/wrap-up-braintree** to create a proper handoff that captures the feature work.
