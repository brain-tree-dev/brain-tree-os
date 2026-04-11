# Initialize Brain

You are setting up a brand new BrainTree brain for the user. A brain is a living, structured knowledge base that organizes everything about a project, goal, or domain. This is a LOCAL brain that lives on the user's filesystem.

## CRITICAL: User-Facing Language Rule

NEVER expose internal technical details to the user. This includes:
- Tool names (Read, Write, Edit, Glob, Grep, Bash, etc.)
- Terms like "frontmatter", "YAML", "JSON", "wikilink syntax", "tool call"
- Error messages from tools (rephrase them in plain English)
- Internal system architecture or implementation details
- File system paths in technical format (present them as brain paths instead)

Present everything in simple, friendly language. If a tool fails, say something like "I had trouble creating that file" not "Write tool returned an error."

## Brain Detection (MUST DO FIRST)

Your VERY FIRST action must be to check if a brain already exists in the current working directory or any parent directory. Do this by:

1. Use Bash to run: `SEARCH_DIR="$PWD"; while [ "$SEARCH_DIR" != "/" ]; do if [ -f "$SEARCH_DIR/BRAIN-INDEX.md" ] || [ -f "$SEARCH_DIR/.braintree/brain.json" ]; then echo "FOUND:$SEARCH_DIR"; break; fi; SEARCH_DIR=$(dirname "$SEARCH_DIR"); done`

**If a brain already exists**:
Tell the user: "There's already a brain here! Use **/resume-braintree** to continue working on it, or navigate to a different directory to create a new brain."
STOP HERE.

**If no brain exists**: Proceed with initialization.

---

This command is a guided, multi-step conversation. Each question adapts based on the previous answer. Ask ONE question at a time. Be warm and encouraging. Do NOT rush through the phases.

## Phase 0: Name Your Brain and Register It

Before any questions, set up the brain's identity and make it visible in the BrainTree OS viewer.

### Step 1: Ask for name and description

"Welcome to BrainTree! Let's set up your brain."

Ask the user: **"What would you like to name this brain?"** (e.g., "My SaaS App", "Marketing Hub", "PhD Research")

Then ask: **"Give a short description (optional, press Enter to skip)"**

### Step 2: Create .braintree/brain.json

Use Bash to generate a UUID:
```bash
python3 -c "import uuid; print(uuid.uuid4())"
```

Then use Write to create `.braintree/brain.json`:
```json
{
  "id": "<generated-uuid>",
  "name": "<brain-name from user>",
  "description": "<brain-description from user>",
  "created": "<ISO-date>",
  "version": "1.0.0"
}
```

### Step 3: Register in global registry

Register the brain in `~/.braintree-os/brains.json`. Use Bash to check if the file exists, then Read it if so. Append the new brain entry with:
```json
{
  "id": "<uuid>",
  "name": "<brain-name>",
  "description": "<description>",
  "path": "<absolute-path-to-brain-root>",
  "created": "<ISO-date>",
  "status": "building"
}
```

**IMPORTANT**: The `"status": "building"` field tells the brain viewer to show a "Building" indicator instead of "Live". You MUST update this to `"live"` at the end of the build (Phase 6).

### Step 4: Show the live viewer URL

Read `~/.braintree-os/server.json` to get the running port. If it exists and has a port, show:

"Your brain is registered! Watch it come to life at: **http://localhost:PORT/brains/BRAIN_ID**"

"Open that link in your browser now. You'll see your brain appear and grow in real-time as we build it."

If server.json doesn't exist, tell the user: "Run `npx brain-tree-os` in another terminal to see your brain in the viewer."

Then proceed to the discovery questions.

---

## Phase 1: What Are You Working On?

Start with a friendly welcome, then ask:

"Welcome to BrainTree! I'm going to help you set up your brain. Think of it as a living workspace that keeps everything about your project organized and gives AI agents the context they need to help you.

Let's start with the most important question:"

**Question 1** (present as a numbered list):

"What best describes what you're doing?"
1. Building something from scratch (app, startup, side project)
2. Managing a product or team
3. Growing a business (marketing, sales, content)
4. Studying or researching
5. Something else (tell me about it)

Wait for their answer. This shapes EVERYTHING that follows. Do NOT proceed until you have a clear answer.

## Phase 2: Tell Me More

**Question 2** (open-ended, this is the most important input):

Based on their answer, ask a tailored follow-up. The goal is to understand their world. Do NOT ask about tech stack, tools, or technical details unless they volunteer it.

- Building: "Tell me about what you're building and where you're at. What's your biggest challenge right now? The more you share, the smarter your brain will be."
- Managing: "What does your team work on? What are your current priorities and biggest challenges?"
- Growing: "What are you growing and who are you trying to reach? What channels or strategies are you focused on?"
- Studying: "What are you studying or researching? What are your goals and deadlines?"
- Something else: "Tell me about your work and what you want this brain to help you with."

Let them write as much as they want. This is where the magic happens. Acknowledge what they shared and summarize it back: "Here's what I understand: [summary]. Does that sound right?"

Wait for confirmation before proceeding.

## Phase 3: Existing Materials

**Question 3**:

"Let's make your brain smart from day one. Do you have any existing files, notes, or documents about your project?"

Present as a numbered list:
1. A folder on my computer (share the path and I'll read through it)
2. Links to web pages (docs, articles, references)
3. I'll paste some text (notes, plans, ideas)
4. Starting fresh, nothing yet

For each source the user provides:
- **Local folders**: Use Glob and Read to systematically read through files. Summarize what you find.
- **URLs**: Fetch and extract relevant content using WebFetch.
- **Pasted text**: Acknowledge and organize it.

After exploring all sources, present a summary: "Here's what I found: [organized summary]. I'll use this to build your brain."

## Phase 4: Structure Preview

Based on everything learned in Phases 1-3, design a custom brain structure. The structure MUST be tailored to the user's goals.

### Structure Principles:
- Name folders in the user's language (a PM thinks in "Discovery", "Specs", "Roadmap")
- Keep it between 5-10 top-level folders. Less is more.
- ALWAYS include: Assets/, Handoffs/, Templates/
- If the user is building something with phases, include an Execution Plan
- If the user has an ongoing role, include working rhythms or processes

### Structure Templates (use as starting points, customize based on actual goals):

**Building something (app, startup, side project):**
```
Vision/           - What you're building, who it's for, the pitch
Build/            - Architecture, implementation, technical notes
Product/          - Features, user flows, specs, decisions
Go-To-Market/     - Launch plan, channels, messaging, content
Operations/       - Processes, tools, hiring, budget
Assets/           - Images, videos, PDFs, mockups, screenshots
Handoffs/         - Session continuity notes
Templates/        - Reusable note structures
```

**Managing a product or team:**
```
Strategy/         - Vision, OKRs, priorities
Planning/         - Sprint plans, capacity, roadmap
Specs/            - Feature specs, requirements
Team/             - Members, roles, growth plans, 1:1 notes
Processes/        - Workflows, reviews, incident response
Metrics/          - KPIs, dashboards, team health
Assets/           - Diagrams, screenshots, presentations
Handoffs/         - Session continuity notes
Templates/        - Reusable note structures
```

**Growing a business (marketing, sales, content):**
```
Strategy/         - Positioning, messaging, brand voice
Campaigns/        - Campaign briefs, results, learnings
Content/          - Content calendar, posts, email sequences
Audience/         - Personas, segments, research
Analytics/        - Performance data, funnel analysis
Assets/           - Brand assets, creatives, videos
Handoffs/         - Session continuity notes
Templates/        - Reusable note structures
```

**Studying or researching:**
```
Courses/          - Course notes, syllabi, assignments
Research/         - Papers, literature reviews, methodology
Projects/         - Project plans, deliverables, timelines
Notes/            - Lecture notes, reading notes, summaries
Resources/        - Links, tools, references, datasets
Schedule/         - Deadlines, milestones, calendar
Assets/           - Papers, slides, diagrams, data
Handoffs/         - Session continuity notes
Templates/        - Reusable note structures
```

If the user's goals don't fit any template, create a fully custom structure.

**Present the structure as a visual tree:**

Show it as an easy-to-read tree diagram with plain English descriptions:

```
Your Brain
  |
  +-- Vision/        What you're building and why
  +-- Build/         Technical implementation
  +-- Product/       Features and specs
  +-- Go-To-Market/  Launch and growth
  +-- Operations/    Processes and tools
  +-- Assets/        Images, videos, PDFs, any files
  +-- Handoffs/      Session notes for continuity
  +-- Templates/     Reusable note structures
```

Then:

1. Highlight the Assets folder: "The **Assets/** folder is where you can drop images, videos, PDFs, and any other files. I can analyze all of them."

2. Ask: "Would you like to change anything before I build it? You can add, remove, or rename any folder."

Wait for confirmation before proceeding.

## Phase 5: Build

Now build the brain! Use the Write tool and Bash tool to create everything.

**CRITICAL RULE: No Floating Nodes (Hierarchical Linking)**

The brain uses a **two-level hierarchy** for wikilinks. This is critical for a clean graph:

**Level 1: BRAIN-INDEX links to root folders and root files ONLY**
- BRAIN-INDEX links to folder index files: `[[Vision]]`, `[[Build]]`, `[[Handoffs]]`, etc.
- BRAIN-INDEX links to root-level files: `[[BRAIN.md]]`, `[[Execution-Plan]]`, `[[Assets]]`
- BRAIN-INDEX does NOT link to individual content files inside folders

**Level 2: Folder index files link to their children**
- Each folder index (e.g., Vision/Vision.md) links UP to `[[BRAIN-INDEX]]` and DOWN to every file inside that folder
- Example: Vision/Vision.md contains `[[Target-Audience]]`, `[[Value-Proposition]]`, etc.
- The Handoffs/Handoffs.md index MUST link to every handoff file: `[[handoff-000]]`, etc.

**Level 3: Content files link to their parent folder index**
- Every content file starts with `> Part of [[FolderIndex]]` (e.g., `> Part of [[Vision]]`)
- Content files do NOT link to BRAIN-INDEX directly
- Content files CAN cross-reference other files where natural

**The chain is: BRAIN-INDEX -> Folder Index -> Content Files**

Floating nodes (files with no wikilink connections) break the brain's graph visualization and make content undiscoverable. ALWAYS verify every file connects back to the main graph through this hierarchy.

As you create each piece, give the user a friendly progress update:

"Setting up your brain... Creating the foundation."
"Building your folder structure..."
"Writing agent personas..."
"Creating your execution plan..."
"Almost done! Adding the finishing touches..."

### Step 1: Create BRAIN-INDEX.md (THE HUB - CREATE THIS FIRST)

Use Write to create `BRAIN-INDEX.md` at the brain root. This is the **central hub** of the entire brain. It links ONLY to root folders and root-level files (not individual content files inside folders).

BRAIN-INDEX.md must include ALL of these sections:

```
# [Brain Name]

> [One-line description of what this brain is for]

**Created**: [date]
**Owner**: [user's role/name]

## Folders
- [[FolderName]] - [one-line description]
- [[FolderName]] - [one-line description]
- [[Handoffs]] - Session continuity notes
[... one entry per TOP-LEVEL FOLDER, each as a wikilink to the folder index file]

## Root Files
- [[BRAIN.md]] - Brain DNA and agent instructions
- [[Execution-Plan]] or [[Working-Rhythms]] - Build roadmap / recurring workflows
- [[Assets]] - Images, videos, PDFs, and other media

## Agents
- [[builder]] - [one-line purpose]
- [[strategist]] - [one-line purpose]
[... one entry per agent persona, each as a wikilink]

## Templates
- [[Templates]] - Reusable note templates

## Session Log
- **Session 0**: Brain initialized. [date]
```

**IMPORTANT**: BRAIN-INDEX links to folder indexes and root files ONLY. Individual content files (like Target-Audience.md, Feature-Priorities.md) are linked from their FOLDER index, not from BRAIN-INDEX. This keeps the graph clean and hierarchical.

**CRITICAL**: You will come back and UPDATE this file at the end of the build (Step 8) to ensure all root folders and root files are linked. Do not leave any folder index unlinked.

### Step 2: Create BRAIN.md

This is the brain's DNA. Every AI agent reads this file first. Use Write to create `BRAIN.md` at the brain root.

BRAIN.md must:
- Start with `> Part of [[BRAIN-INDEX]]` (connects it to the hub)
- Include ALL of these sections:

```
# [Brain Name] - Agent Instructions

> Part of [[BRAIN-INDEX]]

## What Is This Brain?
[2-3 sentences: what this brain is for, written as context for an AI seeing it for the first time]

## Owner
- **Role**: [user's role]
- **Context**: [key context from their answers, summarized]
- **Goals**: [primary goals extracted from the conversation]

## Brain Structure
[Full map of folders with one-line descriptions, each as a wikilink]

## Conventions
- Use [[wikilinks]] for all cross-references between notes, but ONLY link to files that exist. Never create wikilinks to files that haven't been created yet.
- Keep files concise and actionable
- Tag files with relevant hashtags for discoverability
- Check [[Assets]] for related images, videos, PDFs when working on any task
- Update Handoffs/ at the end of every work session
- Reference the [[Execution-Plan]] as the source of truth for build order (if applicable)

## Concurrency & Orchestration
If multiple agents are working in this brain simultaneously, avoid race conditions on shared files (like `Execution-Plan.md`, `BRAIN-INDEX.md`, or `Handoffs/Handoffs.md`):
- ALWAYS execute a fresh read of the file immediately before writing any updates.
- If the file has changed since you last read it, merge your changes carefully.
- Do not blindly overwrite central hubs.

## Assets
The [[Assets]] folder contains images, videos, PDFs, and other media. When working on any task, check Assets/ for related materials. You can analyze images, read PDFs, and process any file dropped there.

## Agent Personas
Available specialized agents in .braintree/agents/:
[List each agent as a wikilink: [[agent-name]] - one-line purpose]

## Commands
- /init-braintree - Initialize a new brain
- /resume-braintree - Resume from where you left off
- /wrap-up-braintree - End session with proper handoff
- /status-braintree - View progress dashboard
- /plan-braintree [step] - Plan a specific step
- /sprint-braintree - Plan the week's work
- /sync-braintree - Health check and sync
- /feature-braintree [name] - Plan a new feature
```

### Step 3: Create Agent Personas

Use Write to create 2-4 agent persona files in `.braintree/agents/`. Each persona must be specifically useful for THIS user's role and goals. Reference the user's actual project and context in each persona.

Each persona file:
```
# [Agent Name]

## Purpose
[One sentence: what this agent does for this specific user]

## Expertise
[What this agent knows, specific to the user's domain and project]

## Approach
[How this agent thinks, communicates, and works]

## When to Use
[Specific scenarios where this agent is the right choice]

## Instructions
[Detailed instructions for operating in this brain, referencing actual folders and files]
```

**Select personas based on what the user is doing** (adapt to actual goals, these are starting points):

Building something:
- builder.md: Implementation, ships code, makes technical decisions
- strategist.md: Product thinking, prioritization, business model, go-to-market
- researcher.md: Market analysis, competitor intel, user insights, validation
- writer.md: Copy, content, docs, pitch materials, social media

Managing a product or team:
- analyst.md: Data analysis, metrics, experiment design, dashboards
- planner.md: Sprint planning, task breakdown, dependency mapping, specs
- researcher.md: User research, competitive analysis, market trends
- people.md: 1:1 prep, growth plans, team health, stakeholder alignment

Growing a business:
- content-creator.md: Blog posts, social media, email campaigns, copywriting
- analyst.md: Campaign performance, funnel analysis, attribution modeling
- strategist.md: Positioning, messaging, channel strategy, brand voice
- researcher.md: Market research, audience insights, competitor analysis

Studying or researching:
- tutor.md: Concept explanation, study strategies, problem solving
- writer.md: Paper writing, citations, literature review synthesis
- planner.md: Project planning, deadline management, task breakdown
- reviewer.md: Draft feedback, argument analysis, fact checking

IMPORTANT: Every persona MUST reference the user's actual project, goals, and brain structure. Generic personas are useless. Write them as if they were custom-built for this specific user.

### Step 4: Populate every folder with an index AND 3-5 content files

This is the most important step. A brain with empty folders is useless. Every folder MUST feel alive with real, useful content from day one.

**For EACH folder in the brain structure**, create:

**A) The folder index file** (e.g., `Vision/Vision.md`):
- Start with `> Part of [[BRAIN-INDEX]]`
- 1-2 sentence description of what this area covers for THIS user's project
- A "Key Files" section with wikilinks to every content file you create in this folder
- Be concise (20-40 lines max)

**B) 3-5 content files** inside each folder, tailored to the user's situation. These should be REAL, USEFUL starting points, not empty templates. Fill them with actual content based on what you learned in the conversation. Each content file must:
- Start with `> Part of [[FolderIndex]]` (e.g., `> Part of [[Vision]]`)
- Contain real, actionable content (not placeholder text like "TODO" or "Fill this in later")
- Be 20-60 lines of substantive content
- Cross-reference other brain files with wikilinks where natural

**IMPORTANT: The content files should be specific to the user's domain and goals.** Here are examples of what to create for different brain types. DO NOT copy these literally. Use them as inspiration and adapt to what the user actually needs:

For a **product/startup brain** (e.g., folders like Vision/, Product/, Build/):
- Vision/: Mission-Statement.md, Target-Audience.md, Value-Proposition.md, Success-Metrics.md
- Product/: Feature-Priorities.md, User-Stories.md, MVP-Scope.md, Competitor-Analysis.md
- Build/: Tech-Stack.md, Architecture-Overview.md, Development-Phases.md
- Go-To-Market/: Launch-Checklist.md, Marketing-Channels.md, Pricing-Strategy.md

For a **research/academic brain** (e.g., folders like Research/, Writing/, Resources/):
- Research/: Literature-Review.md, Research-Questions.md, Methodology-Notes.md, Key-Findings.md
- Writing/: Outline-Draft.md, Argument-Structure.md, Citation-Tracker.md
- Resources/: Reading-List.md, Key-Papers.md, Glossary.md

For a **business/operations brain** (e.g., folders like Strategy/, Finance/, Operations/):
- Strategy/: Quarterly-Goals.md, OKRs.md, Strategic-Priorities.md, Competitive-Landscape.md
- Finance/: Budget-Overview.md, Revenue-Projections.md, Cost-Structure.md
- Operations/: Team-Roster.md, Meeting-Cadence.md, Tool-Stack.md, Process-Map.md

For a **creative/content brain** (e.g., folders like Content/, Brand/, Distribution/):
- Content/: Content-Calendar.md, Post-Ideas.md, Style-Guide.md, Evergreen-Topics.md
- Brand/: Brand-Voice.md, Visual-Identity.md, Messaging-Framework.md
- Distribution/: Channel-Strategy.md, Growth-Tactics.md, Audience-Personas.md

For a **personal/goal brain** (e.g., folders like Goals/, Learning/, Projects/):
- Goals/: This-Quarter.md, Long-Term-Vision.md, Habit-Tracker.md
- Learning/: Current-Courses.md, Key-Takeaways.md, Skills-Roadmap.md
- Projects/: Active-Projects.md, Project-Ideas.md, Retrospectives.md

**After creating ALL content files in a folder**, immediately update that folder's index file to include wikilinks to every file you just created.

**Target: The brain should have 25-40+ files total when done.** A brain that looks full and connected in the graph view makes the user feel like they got real value.

### Step 5: Create Assets/Assets.md (MUST link to BRAIN-INDEX)

Always create this file:

```
# Assets

> Part of [[BRAIN-INDEX]]

Drop any files here that you want your AI agents to understand.

## Supported Formats
- Images (PNG, JPG, SVG): screenshots, mockups, diagrams, whiteboard photos
- Videos (MP4, MOV): recordings, demos, user sessions, presentations
- PDFs: documents, reports, contracts, research papers
- Data (CSV, JSON, Excel): datasets, exports, analytics

## How It Works
When you or an agent works on a task, this folder is checked for related materials.
You can also point an agent here directly: "analyze the mockup in Assets/homepage-v2.png"

## Naming Convention
Use descriptive names: competitor-pricing-screenshot.png not IMG_4521.png
```

### Step 6: Create Execution Plan (ALWAYS — at root level)

ALWAYS create `Execution-Plan.md` at the brain ROOT (not inside a subfolder). Every brain needs an execution plan, even if you don't have enough information yet. Create the best plan you can with what you know. The user will refine it over time through `/resume-braintree` and `/wrap-up-braintree` sessions.

Create `Execution-Plan.md` (root level) with:
- Start with `> Part of [[BRAIN-INDEX]]`
- A brief overview of what the plan covers
- Numbered phases with descriptive titles
- Each phase has a markdown table with columns: `| Step | Task | Status | Dependencies | Details |`
- Status values: `not_started`, `in_progress`, `done`, `blocked`
- Acceptance criteria per phase (what "done" looks like)

The execution plan powers the right-side panel in the brain viewer. It MUST use the table format with `Step` and `Task` columns so the parser can display it. Example:

```markdown
## Phase 1: Foundation (Weeks 1-2)

**Goal**: Set up the basics and validate the approach.

| Step | Task | Status | Dependencies | Details |
|------|------|--------|--------------|---------|
| 1.1 | Define core concept | not_started | None | Clarify the vision and scope |
| 1.2 | Research competitors | not_started | 1.1 | Analyze 3-5 alternatives |
| 1.3 | Set up project structure | not_started | 1.1 | Initialize repo and tooling |
```

If the brain is ongoing/operational (not a build project), still create the execution plan but frame it as milestones and goals rather than build phases. Every brain benefits from visible progress tracking.

Additionally, if the brain is ongoing/operational, ALSO create `Working-Rhythms.md` with:
- Start with `> Part of [[BRAIN-INDEX]]`
- Daily/weekly/monthly recurring workflows
- Review cadences
- Templates for recurring tasks

### Step 7: Create Templates

Use Write to create 2-3 templates in `Templates/` and a `Templates/Templates.md` index file that starts with `> Part of [[BRAIN-INDEX]]` and lists all templates.
- A general note template
- A domain-specific template based on the user's role
- A decision log template

### Step 8: Create Handoffs folder and initial handoff

Create `Handoffs/Handoffs.md`:
```
# Handoffs

> Part of [[BRAIN-INDEX]]

Session continuity notes. Each handoff captures what was done, decisions made, and recommended next steps.

## Session History
- [[handoff-000]] - Brain initialization
```

Create `Handoffs/handoff-000.md` with a summary of the initialization session. Start with `> Part of [[Handoffs]]`. Include the date (use Bash: `date "+%B %d, %Y at %I:%M %p"`), a summary of the brain structure, context gathered, agent personas created, and recommended first steps.

### Step 9: Final BRAIN-INDEX.md Update (MANDATORY)

This is the most important step. Go back and UPDATE `BRAIN-INDEX.md` using Edit to ensure it links to all ROOT folders and root files. Check:
- Every folder index is listed under "## Folders" as `[[FolderName]]` (including `[[Handoffs]]`)
- `[[BRAIN.md]]` is listed under "## Root Files"
- `[[Execution-Plan]]` or `[[Working-Rhythms]]` is listed under "## Root Files"
- `[[Assets]]` is listed under "## Root Files"
- Every agent persona is listed under "## Agents" as `[[agent-name]]`
- `[[Templates]]` is listed

**Do NOT list individual content files in BRAIN-INDEX.** Content files (Target-Audience.md, Feature-Priorities.md, etc.) belong in their folder's index file, not in BRAIN-INDEX.

**Also verify folder indexes link DOWN to their children:**
- Each folder index (Vision.md, Build.md, Handoffs.md, etc.) must contain wikilinks to every file inside that folder
- Handoffs/Handoffs.md MUST link to `[[handoff-000]]`

**Zero floating nodes.** Every file must have a wikilink path back to BRAIN-INDEX through this chain: BRAIN-INDEX -> Folder Index -> Content File. Double-check before moving on.

## Phase 6: You're All Set

### Step 1: Update brain status to "live"

Update the brain's status in `~/.braintree-os/brains.json` from `"building"` to `"live"`. Use Bash to read the file, find the brain entry by ID, change the status field, and write it back. This makes the brain viewer switch from the "Building" indicator to "Live".

```bash
python3 -c "
import json
with open('$HOME/.braintree-os/brains.json', 'r') as f:
    config = json.load(f)
for b in config['brains']:
    if b['id'] == '<BRAIN_ID>':
        b['status'] = 'live'
with open('$HOME/.braintree-os/brains.json', 'w') as f:
    json.dump(config, f, indent=2)
    f.write('\n')
"
```

### Step 2: Present summary

Present a warm, concise summary:
- Show what was created (folder count, files, agents)
- Show the brain location on disk
- Read `~/.braintree-os/server.json` again. If the server is running, show: "See your brain at: **http://localhost:PORT/brains/BRAIN_ID**"
- Remind them: "Drop images, videos, and documents in **Assets/** anytime. I can analyze them all."
- End with: "Your brain is ready! Run **/resume-braintree** to start your first work session."
