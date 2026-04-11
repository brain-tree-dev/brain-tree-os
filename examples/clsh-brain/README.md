# clsh-brain

> The Obsidian vault that powered building [clsh.dev](https://clsh.dev) from zero to viral in 6 days.

## the problem

Every time you start a new Claude Code session, it forgets everything. Your architecture decisions, your product roadmap, which bugs you fixed yesterday, what's left on the sprint. You spend the first 10 minutes of every session re-explaining context that existed 30 minutes ago.

I got tired of it.

## the solution

I turned an Obsidian vault into a persistent brain for Claude Code. Not a prompt template. Not a system message. A full company structure with departments, execution plans, agent personas, and custom commands, all wired into Claude Code via `BRAIN.md` and the `.claude/` directory.

The result: 34 sessions across 6 days. Zero context loss between any of them. Claude picked up exactly where it left off every single time.

This is that vault.

## vault structure

```
clsh-brain/
├── .claude/
│   ├── agents/           # 7 AI agent personas (rnd-lead, backend-engineer, etc.)
│   └── commands/         # 8 custom slash commands (/resume, /wrap-up, etc.)
├── 00_Company/           # Identity, vision, mission
├── 01_RnD/               # Architecture decisions, frontend, backend, infra, devops
├── 02_Product/           # MVP definition, roadmap, features, UI spec
├── 03_Marketing/         # Social media, content, GTM, branding, SEO
├── 04_Community/         # Discord setup, GitHub community, growth
├── 05_Business/          # Competitors, market intel
├── 06_Legal/             # Licensing, privacy, security
├── Handoffs/             # Session handoff notes (context transfer between sessions)
├── Templates/            # Reusable note templates
├── BRAIN.md             # Main agent instructions (Claude Code reads this automatically)
├── Execution-Plan.md     # Step-by-step build plan with dependencies + parallel groups
└── VAULT-INDEX.md        # Navigation hub for the entire vault
```

## the commands

These live in `.claude/commands/` and are available as slash commands in Claude Code:

| Command | What it does |
|---------|-------------|
| `/resume` | Reads execution plan + latest handoff, identifies unblocked steps, suggests what to work on next |
| `/wrap-up` | Updates execution plan, vault files, creates handoff note for next session |
| `/plan [step]` | Plans implementation for a specific execution plan step |
| `/sprint [week]` | Plans a week's worth of work with parallel groups |
| `/status` | Dashboard view of progress across all departments |
| `/vault-sync` | Syncs vault files with latest project state |
| `/new-feature [name]` | Plans and implements a new feature end-to-end |
| `/bug-fix [bug]` | Structured debugging workflow |

## agent personas

Seven agent personas in `.braintree/agents/`, each specialized for their domain:

| Agent | Role |
|-------|------|
| `rnd-lead` | Technical architecture, coordinates all engineers |
| `backend-engineer` | Node.js, WebSocket, PTY management, auth |
| `frontend-engineer` | React, xterm.js, mobile UI, keyboard system |
| `devops-engineer` | CI/CD, GitHub Actions, Cloudflare, npm publishing |
| `product-manager` | MVP scope, roadmap, feature specs, sprint planning |
| `marketing-lead` | Content, social media, GTM, SEO, branding |
| `community-lead` | Discord, GitHub community, contributor onboarding |

Each persona knows its vault section, responsibilities, and technical context. When you spawn agents for parallel work, they stay in their lane.

## parallel execution

The execution plan supports spawning multiple agents to work simultaneously:

```
                    ┌─────────────────────────────────────┐
                    │          /resume identifies          │
                    │        unblocked parallel steps      │
                    └──────────────┬──────────────────────┘
                                   │
                    ┌──────────────┴──────────────────────┐
                    │          TeamCreate + TaskCreate      │
                    │       (one task per parallel step)    │
                    └──────────────┬──────────────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                     │
     ┌────────┴────────┐ ┌────────┴────────┐ ┌─────────┴───────┐
     │  backend-engineer│ │frontend-engineer│ │  devops-engineer │
     │  (worktree: be)  │ │ (worktree: fe)  │ │  (worktree: ops) │
     │                  │ │                 │ │                  │
     │  Step 1.2:       │ │  Step 2.1:      │ │  Step 3.1:       │
     │  Backend Core    │ │  UI Components  │ │  CI Pipeline     │
     └────────┬─────────┘ └────────┬────────┘ └─────────┬───────┘
              │                    │                     │
              └────────────────────┼─────────────────────┘
                                   │
                    ┌──────────────┴──────────────────────┐
                    │     Leader merges worktrees          │
                    │     Updates Execution-Plan.md        │
                    └─────────────────────────────────────┘
```

Each agent works in an isolated git worktree so they don't conflict. The leader merges everything back when they're done.

## the results

- **34 sessions** across 6 days (March 12-17, 2026)
- **92% complete** (23/25 execution plan steps)
- Full monorepo with 4 packages (agent, web, cli, landing)
- Published to npm (`npx clsh-dev`)
- Launched on all social platforms
- Reddit post went viral on r/ClaudeAI
- Phone-first terminal with custom keyboard, 6 skins, tmux persistence
- All security audit findings (4 critical, 9 high) resolved

## how to use this for YOUR project

1. **Clone this repo** into your project workspace
2. **Edit `BRAIN.md`** with your project's description, tech stack, and context
3. **Edit `VAULT-INDEX.md`** with your project's departments and status
4. **Edit `Execution-Plan.md`** with your build steps, dependencies, and parallel groups
5. **Customize the agents** in `.braintree/agents/` for your team structure
6. **Start a Claude Code session** in the vault directory
7. **Run `/resume`** to see what's next
8. **End every session with `/wrap-up`** to preserve context

The key insight: Claude Code automatically reads `BRAIN.md` when you open a session. That file points to the execution plan, which points to the departments, which point to the specific files. The entire vault becomes Claude's persistent memory.

## what's next

We're building something bigger. A platform that generates these brains automatically, lets you visualize them as interactive graphs, and integrates directly with Claude Code via MCP.

It's called [neurotree.ai](https://neurotree.ai). Sign up for early access.

## links

- [clsh.dev](https://clsh.dev) - the tool built with this brain
- [clsh on GitHub](https://github.com/my-claude-utils/clsh) - the source code
- [Blog: I gave Claude Code a brain](https://dev.to/nadav_avisrur/i-gave-claude-code-a-brain-heres-what-happened-3304) - the full story
- [neurotree.ai](https://neurotree.ai) - the platform (coming soon)
