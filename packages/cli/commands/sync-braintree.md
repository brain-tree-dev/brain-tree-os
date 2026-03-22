# Brain Sync

Audit and synchronize the brain's content to ensure everything is consistent, connected, and up to date. Think of this as a health check for the knowledge graph.

## CRITICAL: User-Facing Language Rule

NEVER expose internal technical details to the user. This includes:
- Tool names (Read, Write, Edit, Glob, Grep, Bash, etc.)
- Terms like "frontmatter", "YAML", "JSON", "wikilink syntax", "tool call"
- Error messages from tools (rephrase them in plain English)
- Internal system architecture or implementation details

Present everything in simple, friendly language. If a tool fails, say something like "I had trouble scanning your brain" not "Grep tool returned an error."

## Brain Detection (MUST DO FIRST)

Your VERY FIRST action must be to locate the brain. Do this by:

1. Use Bash to search for the brain root: `SEARCH_DIR="$PWD"; while [ "$SEARCH_DIR" != "/" ]; do if [ -f "$SEARCH_DIR/BRAIN-INDEX.md" ] || [ -f "$SEARCH_DIR/.braintree/brain.json" ]; then echo "FOUND:$SEARCH_DIR"; break; fi; SEARCH_DIR=$(dirname "$SEARCH_DIR"); done`

**If no brain found**:
Check `~/.braintree-os/brains.json` for registered brains. If found, present options. If nothing found, tell the user: "I couldn't find a brain. Run **/init-braintree** to create one first."
STOP HERE.

**If a brain is found**: Set the brain root directory and proceed.

---

## Step 1: Full Inventory

1. Use Glob with `**/*.md` at the brain root to get a complete list of all markdown files in the brain.
2. Use Glob per top-level directory to understand the folder structure.
3. Use Read on `BRAIN-INDEX.md` to get the expected structure (which folders and root files should exist).
4. Use Read on the execution plan file to check plan state.

## Step 2: Identify Issues

Analyze the data to find problems. For each check, use the appropriate tools:

### Orphan Files (Disconnected from the Graph)

Use Grep to search all `.md` files for the pattern `> Part of`. Files that do NOT contain this line (except BRAIN-INDEX.md itself) might be orphans.

For each potential orphan:
- Use Grep to check if ANY other file contains a wikilink to that file (search for `[[filename]]` without the .md extension)
- If no file links to it AND it does not link to anything, it is an orphan
- List each orphan file and suggest which parent file should link to it

### Broken Wikilinks

Use Grep to find all wikilinks across all brain files: search for the pattern `\[\[([^\]]+)\]\]`.

For each unique wikilink target found:
- Check if a corresponding `.md` file exists (use Glob to search for `**/[target].md`)
- If the target file does not exist, it is a broken wikilink
- List each broken link, which file contains it, and suggest creating the missing file or fixing the link

### Empty Folders

Use Glob to check each top-level folder for content files (not just the index):
- A folder with only its index file (e.g., `Vision/Vision.md` and nothing else) is functionally empty
- List each empty folder and suggest whether it should be populated or removed

### Stale Content

Use Read on a sample of files (folder indexes, execution plan) to check for:
- Files that reference steps marked as "not_started" that are actually completed
- Files with placeholder text ("TODO", "TBD", "Coming soon", "Fill this in later")
- Index files that do not reflect the actual files in their folder (compare index wikilinks against Glob results)

### Execution Plan Drift

Compare the execution plan status with reality:
- Use Glob on `Handoffs/handoff-*.md` and Read recent handoffs to see what was actually done
- Steps marked "in_progress" that may have been completed (based on handoff history)
- Steps marked "not_started" that have related content already created

### Index Consistency

For each folder index file:
- Use Read to get the wikilinks it contains
- Use Glob to get the actual files in that folder
- Flag any files that exist in the folder but are NOT linked from the index
- Flag any wikilinks in the index that point to files that do not exist

## Step 3: Fix Issues

For each issue found, take action:

1. **Orphan files**: Use Edit on the appropriate parent file (folder index or BRAIN-INDEX) to add wikilinks connecting the orphan. Also use Edit on the orphan file to add `> Part of [[ParentIndex]]` if missing.
2. **Broken links**: Either use Write to create the missing target file (with proper `> Part of` linking), or use Edit on the source file to fix or remove the broken link. Ask the user which approach they prefer for ambiguous cases.
3. **Empty folders**: Ask the user if they want to seed content or remove the folder. Do NOT delete without asking.
4. **Stale content**: Use Edit to update outdated files with current information. Replace placeholder text with actual content where possible, or flag it for the user.
5. **Plan drift**: Use Edit on the execution plan to correct any mismatched statuses based on handoff evidence.
6. **Index inconsistency**: Use Edit on index files to add missing wikilinks or remove broken ones.

Ask before making destructive changes (removing files or folders). Additive changes (adding links, creating missing files) can be done directly.

## Step 4: Report

Present a sync report:

```
BRAIN SYNC REPORT

Files scanned:    45
Issues found:     7
Issues fixed:     5
Issues remaining: 2 (need your input)

Orphan files:      2 found, 2 linked
Broken wikilinks:  3 found, 3 fixed
Empty folders:     1 found (awaiting your decision)
Stale content:     1 found, 0 fixed (need your input)
Index mismatches:  0 found
Plan drift:        0 found

Graph health: Good
  Files: 45  |  Links: 78  |  Avg connections: 3.5
```

### Remaining Issues (if any)
For each issue that needs user input, present it clearly with options:
- What the issue is
- What the options are (keep, fix, remove)

### Summary
End with a brief health assessment:
- "Your brain is in great shape!" (0-2 issues)
- "Your brain is mostly healthy, with a few things to tidy up." (3-5 issues)
- "Your brain needs some attention. I fixed what I could, but there are some decisions only you can make." (6+ issues)

Use Grep to verify that key terms (project name, product name, key concepts from CLAUDE.md) appear consistently across files. Flag any spelling inconsistencies.
