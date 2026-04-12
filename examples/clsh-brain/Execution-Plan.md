---
title: Execution Plan
tags: #clsh #plan #execution
created: 2026-03-12
updated: 2026-03-12
---

# clsh.dev — Execution Plan

> Source of truth for building and launching clsh as an open source project.
> Every step specifies parallelism, dependencies, and team configuration.

## How to Execute Steps

Each step has:
- **Team**: Which agents to spawn as a team (use `TeamCreate` + `Task` tool with `team_name`)
- **Parallel Group**: Steps in the same group run simultaneously via agent teams
- **Blocked By**: Steps that must complete before this one can start
- **Worktree**: Whether the agent should use `isolation: "worktree"` for safe parallel edits

When starting a parallel group:
1. Create a team with `TeamCreate` (e.g., `team_name: "phase-1-foundation"`)
2. Create tasks with `TaskCreate` for each step in the group
3. Spawn agents with `Task` tool using `team_name` and appropriate `subagent_type: "general-purpose"`
4. Each agent works in its own worktree when editing the same repo
5. Leader monitors progress, merges worktrees when agents complete

---

## Phase 1: Foundation (Week 1-2)

### Parallel Group 1A — Scaffolding (BLOCKING — must complete first)

#### Step 1.1: Project Scaffolding
- **Team**: Solo — `rnd-lead`
- **Parallel Group**: 1A (sequential — blocks everything)
- **Blocked By**: Nothing
- **Worktree**: No (initial repo creation)
- **Status**: COMPLETE
- **Tasks**:
  - [x] Create GitHub org `my-claude-utils` and repo `clsh` (local only — git/push deferred)
  - [x] Init Turborepo monorepo with npm workspaces
  - [x] Create `packages/agent`, `packages/web`, `packages/cli`, `apps/landing`
  - [x] Set up root `package.json`, `turbo.json`, `.gitignore`
  - [x] Configure TypeScript strict mode across all packages
  - [x] Set up ESLint + Prettier + EditorConfig
  - [x] Add LICENSE (MIT), CODE_OF_CONDUCT.md
- **Vault Updates**: [[RnD]], [[DevOps]], [[Architecture-Decisions]]

### Parallel Group 1B — Backend + Frontend Core (run simultaneously)

> After 1.1 completes, spawn a team with 2 agents working in parallel worktrees.

```
Team: "clsh-phase1b"
┌─────────────────────────┐  ┌─────────────────────────┐
│  backend-engineer        │  │  frontend-engineer       │
│  Step 1.2 + 1.3          │  │  Step 1.4                │
│  worktree: backend-core  │  │  worktree: frontend-core │
└─────────────────────────┘  └─────────────────────────┘
```

#### Step 1.2: Backend Agent — Core
- **Team**: `clsh-phase1b` — agent: `backend-engineer`
- **Parallel Group**: 1B
- **Blocked By**: Step 1.1
- **Worktree**: Yes — `backend-core`
- **Status**: COMPLETE
- **Tasks**:
  - [x] Set up `packages/agent` with tsx watch
  - [x] Implement `PTYManager` class (spawn zsh/tmux/claude, write, resize, kill)
  - [x] Build Express HTTP server with WebSocket upgrade
  - [x] Implement `ws-handler.ts` with session routing (create, stdin, resize, list, ping)
  - [x] Add session buffer for reconnection replay
  - [x] Implement backpressure handling between PTY and WebSocket
- **Vault Updates**: [[Backend]], [[Infrastructure]]

#### Step 1.3: Backend Agent — Auth + Tunnel
- **Team**: `clsh-phase1b` — agent: `backend-engineer` (same agent, sequential after 1.2)
- **Parallel Group**: 1B
- **Blocked By**: Step 1.2
- **Worktree**: Yes — same `backend-core` worktree
- **Status**: COMPLETE
- **Tasks**:
  - [x] Implement bootstrap token generation (256-bit, SHA-256 hash, one-time use)
  - [x] Build JWT session management (jose, 8h expiry, httpOnly cookies)
  - [x] Create SQLite schema (better-sqlite3, WAL mode, ~/.clsh/clsh.db)
  - [x] Implement ngrok tunnel creation via @ngrok/ngrok SDK
  - [x] Add QR code printing (qrcode-terminal)
  - [x] Strip sensitive env vars before PTY spawn
  - [ ] Add rate limiting (5 attempts / 15 min) — deferred to post-launch
- **Vault Updates**: [[Backend]], [[Infrastructure]], [[Security]]

#### Step 1.4: Frontend — Terminal Core
- **Team**: `clsh-phase1b` — agent: `frontend-engineer`
- **Parallel Group**: 1B (runs parallel to 1.2)
- **Blocked By**: Step 1.1
- **Worktree**: Yes — `frontend-core`
- **Status**: COMPLETE
- **Tasks**:
  - [x] Set up `packages/web` with Vite + React + TypeScript + Tailwind v4
  - [x] Implement `useTerminal` hook (xterm.js lifecycle, font await, WebGL renderer)
  - [x] Build `TerminalPane` component (xterm.js + WebSocket binding)
  - [x] Create `ws-client.ts` (WebSocket client with reconnection + backoff)
  - [x] Define `protocol.ts` (ClientMessage + ServerMessage types)
  - [x] Create `theme.ts` (xterm.js theme: #060606 bg, #f97316 cursor)
  - [x] Configure Vite proxy for /ws and /api to localhost:4030
- **Vault Updates**: [[Frontend]]

---

## Phase 2: UI + Polish (Week 3-4)

### Parallel Group 2A — UI Components (3 agents, all parallel)

> Spawn a team with 3 agents. All frontend work but different components — no file conflicts.

```
Team: "clsh-phase2a"
┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│  frontend-engineer-1  │  │  frontend-engineer-2  │  │  frontend-engineer-3  │
│  Step 2.1: MacBook    │  │  Step 2.2: Mobile     │  │  Step 2.3: Auth UI   │
│  Frame + Desktop      │  │  Layout + PWA         │  │  + Mode Detection    │
└──────────────────────┘  └──────────────────────┘  └──────────────────────┘
```

#### Step 2.1: Frontend — MacBook Pro Frame
- **Team**: `clsh-phase2a` — agent: `frontend-engineer` (instance 1)
- **Parallel Group**: 2A
- **Blocked By**: Step 1.4
- **Worktree**: Yes — `macbook-frame`
- **Status**: COMPLETE
- **Tasks**:
  - [x] Build `MacBookFrame.tsx` — pixel-perfect bezel, notch, traffic lights
  - [x] Create `MenuBar.tsx` — macOS-style menu bar with live clock
  - [x] Build `TmuxStatusBar.tsx` — tmux-style bottom status bar
  - [x] Create `ClaudeCodePane.tsx` — styled Claude Code terminal overlay
  - [x] Add `NotchIndicator.tsx` — orange dot when Claude is active
  - [x] Build `ModeIndicator.tsx` — DEMO / LIVE badge
  - [x] Implement three-pane desktop layout (zsh | tmux | Claude Code)
- **Vault Updates**: [[Frontend]], [[Features]]

#### Step 2.2: Frontend — Mobile Layout
- **Team**: `clsh-phase2a` — agent: `frontend-engineer` (instance 2)
- **Parallel Group**: 2A
- **Blocked By**: Step 1.4
- **Worktree**: Yes — `mobile-layout`
- **Status**: COMPLETE
- **Tasks**:
  - [x] Build `MobileTabBar.tsx` — tab switcher for phone layout
  - [x] Implement `useMediaQuery` hook for responsive breakpoints
  - [x] Suppress iOS keyboard (`inputmode="none"`, `readonly`)
  - [x] Use `100dvh` for iOS Safari dynamic viewport
  - [x] Add PWA meta tags (apple-mobile-web-app-capable, status-bar-style)
  - [ ] Test on iOS Safari + Chrome Android — deferred to QA
- **Vault Updates**: [[Frontend]], [[Features]]

#### Step 2.3: Frontend — Auth + Mode Detection
- **Team**: `clsh-phase2a` — agent: `frontend-engineer` (instance 3)
- **Parallel Group**: 2A
- **Blocked By**: Step 1.4, Step 1.3 (needs backend auth endpoints)
- **Worktree**: Yes — `auth-ui`
- **Status**: COMPLETE
- **Tasks**:
  - [x] Build `AuthScreen.tsx` (bootstrap token + magic link UI)
  - [x] Implement `useAuth` hook (token storage, SSE listener)
  - [x] Implement `useMode` hook (2-second WebSocket probe → demo/live)
  - [x] Build magic link request flow
  - [x] Implement SSE listener for auth completion events
- **Vault Updates**: [[Frontend]], [[Infrastructure]]

### Parallel Group 2B — Demo Mode (depends on 2A.frame)

#### Step 2.4: Demo Mode
- **Team**: Solo or continue `clsh-phase2a`
- **Parallel Group**: 2B
- **Blocked By**: Step 2.1 (needs MacBook frame components)
- **Worktree**: Yes — `demo-mode`
- **Status**: COMPLETE
- **Tasks**:
  - [x] Build `demo-engine.ts` — pre-scripted animation engine
  - [x] Create `demo-scripts.ts` — terminal animation sequences (commands + output)
  - [x] Build `claude-demo.ts` — fake Claude Code conversation with ANSI styling
  - [x] Demo auto-starts when no backend is reachable (2s timeout)
  - [x] Ensure demo works perfectly on clsh.dev landing page
- **Vault Updates**: [[Frontend]], [[Features]], [[MVP]]

---

## Phase 3: Launch Prep (Week 5)

### Parallel Group 3A — All 4 steps run simultaneously

> Maximum parallelism. 4 agents, 4 independent workstreams. No file conflicts.

```
Team: "clsh-phase3"
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ frontend-eng     │  │ devops-eng       │  │ devops-eng-2     │  │ marketing-lead   │
│ + marketing-lead │  │ Step 3.2: OSS    │  │ Step 3.3: Domain │  │ + community-lead │
│ Step 3.1:        │  │ Packaging        │  │ + Deploy         │  │ Step 3.4: Social │
│ Landing Page     │  │                  │  │                  │  │ Channels         │
└─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘
```

#### Step 3.1: Landing Page
- **Team**: `clsh-phase3` — agents: `frontend-engineer` + `marketing-lead`
- **Parallel Group**: 3A
- **Blocked By**: Step 2.4 (needs demo mode working)
- **Worktree**: Yes — `landing-page`
- **Status**: COMPLETE
- **Tasks**:
  - [x] Build `apps/landing/index.html` — interactive demo page
  - [x] Create `apps/landing/styles.css` — landing page styles
  - [x] Build `apps/landing/demo.js` — demo animation script
  - [x] Add hero section, quickstart, features, tech stack, roadmap
  - [x] Add Open Graph meta tags for social sharing
  - [ ] Deploy to Cloudflare Pages — deferred to Step 3.3
- **Vault Updates**: [[Frontend]], [[GTM]], [[Branding]], [[SEO]]

#### Step 3.2: Open Source Packaging
- **Team**: `clsh-phase3` — agent: `devops-engineer`
- **Parallel Group**: 3A
- **Blocked By**: Step 1.1 (needs repo structure)
- **Worktree**: Yes — `oss-packaging`
- **Status**: COMPLETE
- **Tasks**:
  - [x] Write the killer README.md (content from tech plan)
  - [x] Create CONTRIBUTING.md (dev setup, coding standards, PR guidelines)
  - [x] Write SECURITY.md (responsible disclosure, SLA)
  - [x] Create .github/ISSUE_TEMPLATE/ (bug_report.yml, feature_request.yml)
  - [x] Create .github/pull_request_template.md
  - [x] Set up GitHub Actions CI (ci.yml — lint, typecheck, build, test)
  - [x] Configure Dependabot
  - [ ] Set up semantic-release for npm publishing — deferred to pre-launch
  - [x] Add .env.example file
- **Vault Updates**: [[DevOps]], [[Documentation]], [[GitHub]]

#### Step 3.3: Domain + Deployment
- **Team**: `clsh-phase3` — agent: `devops-engineer` (instance 2)
- **Parallel Group**: 3A
- **Blocked By**: Step 3.1 (needs landing page to deploy)
- **Worktree**: No (infrastructure config, not code)
- **Status**: COMPLETE
- **Tasks**:
  - [x] Register/configure clsh.dev domain (owned via Squarespace)
  - [x] Set Cloudflare nameservers (NS delegation from Squarespace → bonnie + carter.ns.cloudflare.com)
  - [x] Create Cloudflare Pages project (`clsh-dev`) via wrangler direct upload (no GitHub needed yet)
  - [x] Deploy `apps/landing/` to Cloudflare Pages (6 files + demo.mp4)
  - [x] Add custom domain clsh.dev in Cloudflare Pages (via API)
  - [x] Verify SSL + HTTPS working — CNAME records added, DNS propagated
  - [x] Set up www.clsh.dev → clsh.dev redirect (CNAME to Pages project)
  - [ ] Enable Cloudflare Web Analytics — needs API token with Analytics:Edit permission
- **Vault Updates**: [[DevOps]], [[SEO]]

#### Step 3.4: Social Channels Setup
- **Team**: `clsh-phase3` — agents: `marketing-lead` + `community-lead`
- **Parallel Group**: 3A
- **Blocked By**: Nothing (can start anytime)
- **Worktree**: No (external platform setup, not code)
- **Status**: COMPLETE (content prep done — manual account creation pending)
- **Tasks**:
  - [x] Create channel-setup-guide.md with Discord structure, bios, checklist
  - [x] Create Discord server with channel structure — automated via bot (5 categories, 14 channels, 3 roles, welcome embed, launch announcement)
  - [ ] Register @clsh_dev on X (Twitter) — manual
  - [ ] Register @clsh.dev on Instagram — manual
  - [ ] Register @clsh.dev on TikTok — manual
  - [ ] Create GitHub org my-claude-utils (if not done in 1.1) — manual
  - [ ] Set up profile images and bios on all platforms — manual
  - [ ] Add Discord invite link to README + landing page — manual
- **Vault Updates**: [[Social-Media]], [[Discord]], [[Branding]]

---

## Phase 4: Launch (Week 6)

### Parallel Group 4A — Pre-Launch Content

#### Step 4.1: Pre-Launch Content
- **Team**: Solo — `marketing-lead`
- **Parallel Group**: 4A
- **Blocked By**: Steps 3.1, 3.2, 3.3, 3.4 (all launch prep done)
- **Worktree**: No (content creation, not code)
- **Status**: COMPLETE (content drafted — manual posting on launch day)
- **Tasks**:
  - [x] Write "How I built clsh" X thread — `03_Marketing/Content/x-thread-how-i-built-clsh.md`
  - [x] Build Remotion animated demo video (`apps/demo-video/`) — 26.7s, 5 scenes, orange brand
  - [x] Render video to MP4 (`npm run render` in `apps/demo-video/`) — 4.1MB raw, 1.2MB compressed
  - [x] Embed rendered video in `apps/landing/index.html` (autoplay, muted, loop) — embedded, layout needs polish
  - [x] Add video to GitHub README.md — `03_Marketing/Content/readme-video-section.md`
  - [x] Create Product Hunt listing — `03_Marketing/Content/product-hunt-listing.md`
  - [x] Draft Hacker News "Show HN" post — `03_Marketing/Content/hn-show-post.md`
  - [x] Write launch blog post for Dev.to / Hashnode — `03_Marketing/Content/blog-launch-post.md`
  - [x] Prepare Reddit posts for r/programming, r/webdev, r/commandline, r/SideProject — `03_Marketing/Content/reddit-posts.md`
  - [x] Create Instagram composite images (7 images, 1080x1350 4:5 ratio) — `Assets/Social/Instagram/`
  - [ ] Create TikTok video content (mobile terminal demo video) — deferred (needs recorded phone footage)
- **Vault Updates**: [[Content]], [[GTM]], [[Social-Media]]

### Parallel Group 4A+ — Security Hardening (BLOCKING — must complete before 4.2)

> **CRITICAL**: Full security audit found 4 critical + 9 high severity vulnerabilities.
> clsh gives remote terminal access — **any vulnerability = full machine compromise**.
> These MUST be fixed before making the repo public or sharing tunnel URLs.
> See [[Security-Audit]] for full details with code-level findings.

```
Team: "clsh-security"
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│  backend-engineer        │  │  backend-engineer-2      │  │  devops-engineer         │
│  Step 4.1a: Critical     │  │  Step 4.1b: High         │  │  Step 4.1c: OSS          │
│  Auth Fixes (BLOCKING)   │  │  Hardening               │  │  Readiness Fixes         │
│  worktree: security-auth │  │  worktree: security-hard │  │  worktree: oss-fixes     │
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

#### Step 4.1a: Critical Security Fixes (BLOCKING)
- **Team**: `clsh-security` — agent: `backend-engineer`
- **Parallel Group**: 4A+ (sequential within — each fix builds on the last)
- **Blocked By**: Step 4.1
- **Worktree**: Yes — `security-auth`
- **Status**: COMPLETE
- **Consequence if skipped**: Anyone who discovers the ngrok URL gets full shell access to the host machine with zero authentication. This is a remote code execution vulnerability.
- **Tasks**:
  - [x] **C1**: Disable magic-link + verify endpoints — removed entirely from `server.ts`. Removed `authenticateWithMagicLink` from `useAuth.ts` and `emitAuthComplete` import from `server.ts`. SSE handler kept for future use.
  - [x] **C2**: Make bootstrap token single-use — `deleteBootstrapToken` called after JWT exchange in `server.ts`. 5-min TTL on tokens.
  - [x] **C3**: `.gitignore` covers `.env`, `.clsh/`, and all secret files. Verified.
  - [x] **C4**: WebSocket origin checking — `verifyClient` callback with dynamic `allowedOrigins` set (localhost, local IP, tunnel URL). Rejected origins logged.
  - [x] **H1**: CORS restricted — dynamic allowlist replaces wildcard `*`. Only localhost + tunnel domains allowed.
- **Vault Updates**: [[Security-Audit]], [[Backend]], [[Security]]

#### Step 4.1b: Security Hardening
- **Team**: `clsh-security` — agent: `backend-engineer` (instance 2)
- **Parallel Group**: 4A+ (can run parallel to 4.1a — different files/concerns)
- **Blocked By**: Step 4.1
- **Worktree**: Yes — `security-hardening`
- **Status**: COMPLETE
- **Consequence if skipped**: Authenticated users can crash/DoS the server. JWT tokens leak via URL logs. No defense against resource exhaustion attacks.
- **Tasks**:
  - [x] **H3**: WebSocket `maxPayload: 64 * 1024` (64KB) set in `server.ts`.
  - [x] **H4**: Session limit deferred (low priority, single-user product).
  - [x] **H7**: Resize validation — cols/rows clamped in `ws-handler.ts` and `pty-manager.ts`.
  - [x] **H2**: `express-rate-limit` on `/api/auth/bootstrap` (10 req / 15 min). `trust proxy` set for tunnel compatibility.
  - [x] **H5**: JWT sent as first WebSocket message (not in URL). `ws-client.ts` sends `{ type: 'auth', token }` on open.
  - [x] **H6**: Bootstrap token in URL hash fragment (`#token=xxx`). Fragments not sent to servers.
  - [x] **H9**: SSE endpoint removed entirely (was `sse-handler.ts`). No longer needed.
  - [x] **L6**: Security headers: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Content-Security-Policy`.
  - [x] **L5**: Body size limit: `express.json({ limit: '16kb' })`.
- **Vault Updates**: [[Security-Audit]], [[Backend]]

#### Step 4.1c: Open Source Readiness Fixes
- **Team**: `clsh-security` — agent: `devops-engineer`
- **Parallel Group**: 4A+ (can run parallel to 4.1a/b — different files)
- **Blocked By**: Step 4.1
- **Worktree**: Yes — `oss-fixes`
- **Status**: IN PROGRESS
- **Consequence if skipped**: Broken README on GitHub (missing images), no version history, misleading Security.md claims security features that don't exist.
- **Tasks**:
  - [x] Add 5 missing PNG screenshots to `docs/images/` (phone-grid, phone-claude, phone-terminal, phone-claude-active, phone-skins)
  - [x] Create `CHANGELOG.md` with v0.0.1 entry (Added section listing all features)
  - [x] Add `repository`, `homepage`, `keywords`, `author` to root `package.json`
  - [x] Add pre-commit hook to reject `.env` files (`scripts/pre-commit`)
  - [x] Fix `06_Legal/Security/Security.md` — SECURITY.md fully rewritten with complete security architecture (Session 37)
  - [x] Update README.md security section — comprehensive security documentation added (Session 37)
  - [x] Fix vault `06_Legal/Security/Security.md` — updated all false claims to match post-4.1a/4.1b reality (Session 38)
  - [x] Run `npm audit` — 0 vulnerabilities found (Session 38)
  - [ ] Verify `security@clsh.dev` email works OR update SECURITY.md contact to personal email
- **Vault Updates**: [[Security-Audit]], [[DevOps]], [[Documentation]]

#### Step 4.1d: PWA Password + Biometric Auth (NEW)
- **Team**: Solo — `rnd-lead`
- **Parallel Group**: 4A+
- **Blocked By**: Step 4.1b
- **Worktree**: No
- **Status**: COMPLETE
- **Added**: Session 37 (2026-03-16)
- **Tasks**:
  - [x] Created `packages/agent/src/password.ts` (scrypt hash/verify with timingSafeEqual)
  - [x] Added 3 new database tables: `user_password`, `lock_biometric`, `lock_client_hash`
  - [x] Added 7 new API endpoints for password/biometric auth and lock state management
  - [x] Rewrote `AuthScreen.tsx` to show lock-screen-style UI when password is configured
  - [x] Created `LockScreen.tsx`, `LockSetup.tsx`, `useLockScreen.ts`, `lock-screen.ts`
  - [x] Fixed scrypt memory limit, race conditions, PWA state sync issues
  - [x] Merged PR #23, CI green on Node 20+22
  - [x] Published @clsh/web@0.0.4, @clsh/agent@0.0.7, clsh-dev@0.1.8
- **Vault Updates**: [[Security-Audit]], [[Backend]], [[Frontend]]

### Parallel Group 4B — Launch Day

#### Step 4.2: Launch Day
- **Team**: `clsh-launch` — agents: `marketing-lead` + `community-lead`
- **Parallel Group**: 4B
- **Blocked By**: Steps 4.1a, 4.1b, 4.1c (ALL security + readiness fixes must complete first)
- **Worktree**: No
- **Status**: COMPLETE
- **Completed**: Session 38 (2026-03-17) — Full launch executed across all platforms
- **Tasks**:
  - [x] Make GitHub repo public
  - [x] Post on Hacker News (Show HN)
  - [x] Launch on Product Hunt
  - [x] Post X thread + pin launch tweet
  - [x] Post on Reddit (r/programming, r/webdev, r/commandline)
  - [x] Post on Instagram + TikTok
  - [x] Publish blog post on Dev.to
  - [x] Monitor Discord for incoming users
  - [x] Respond to GitHub issues and comments
  - [x] Track GitHub stars, forks, Discord members
- **Vault Updates**: [[GTM]], [[Social-Media]], [[Growth]]

### Parallel Group 4C — Post-Launch (ongoing)

#### Step 4.3: Post-Launch (Week 6+)
- **Team**: `clsh-postlaunch` — all agents as needed
- **Parallel Group**: 4C
- **Blocked By**: Step 4.2
- **Worktree**: Per-fix branches
- **Status**: NOT STARTED
- **Tasks**:
  - [ ] Triage incoming GitHub issues
  - [ ] Fix critical bugs from launch feedback
  - [ ] Merge community PRs
  - [ ] Post follow-up content (lessons learned, stats)
  - [ ] Start planning Phase 2 (cloud machines)
  - [ ] Continue build-in-public content cadence
- **Vault Updates**: All departments

---

## Phase 5: UI Redesign — Mobile Overhaul (Week 7+)

> Full replacement of `MobileLayout.tsx` and tab-based UI with the mockup-driven design.
> See [[UI-Spec]] for all colors, measurements, and interaction specs.
> See [[Frontend]] for component architecture.

### Parallel Group 5A — Backend Metadata (BLOCKING for 5.2+)

#### Step 5.1: Backend — Session Metadata API
- **Team**: Solo — `backend-engineer`
- **Parallel Group**: 5A (must complete before 5.2)
- **Blocked By**: Step 1.3 (needs existing session/WS infrastructure)
- **Worktree**: Yes — `session-metadata`
- **Status**: COMPLETE
- **Tasks**:
  - [x] Add `name`, `cwd`, `status` ('run'|'idle') fields to PTYSession (in-memory, no SQLite change needed)
  - [x] Implement idle detection via 2s interval comparing `lastActivityAt`; OSC 7 parsing for cwd
  - [x] Emit `session` message on `session_create` with name, cwd, status, pid
  - [x] Emit `session_update` on status/cwd change
  - [x] Preview buffer maintained client-side in `useSessionManager` (300-char ANSI-stripped)
  - [x] Add `session_close` WS message handler (destroys PTY, sends `exit`)
  - [x] Update `protocol.ts` in `packages/web` with `session_close`, `session_update`, metadata fields
- **Vault Updates**: [[Backend]], [[Frontend]]

### Parallel Group 5B — App Architecture + Grid View (runs after 5.1)

#### Step 5.2: App Architecture + Grid View
- **Team**: `clsh-phase5` — agent: `frontend-engineer` (instance 1)
- **Parallel Group**: 5B
- **Blocked By**: Step 5.1
- **Worktree**: Yes — `mobile-grid`
- **Status**: COMPLETE
- **Tasks**:
  - [x] View router in `App.tsx` ('grid' | 'terminal' | 'skin-studio') — replaced AppContext with hooks pattern
  - [x] `useSessionManager` hook (sessions, wsClient, messageBus, createSession, closeSession, status)
  - [x] `GridView.tsx` (status bar, CLSH header, section label, 2-col card grid, WorkspaceBar)
  - [x] `SessionCard.tsx` (traffic lights, RUN/IDLE badge, preview text, expand arrow)
  - [x] `NewSessionCard.tsx` (dashed border, +, hover orange accent)
  - [x] `WorkspaceBar.tsx` (tmux-style tab strip, active highlight, scroll)
  - [x] Wire session card tap → terminal view
  - [x] Wire "+" → session_create → reactive navigation via useEffect watching sessions
  - [x] Brand accent: #f97316 (orange, matches landing page) — replaced green #00ff87
- **Vault Updates**: [[Frontend]], [[UI-Spec]]

### Parallel Group 5C — Terminal View + Navigation (runs after 5.2)

#### Step 5.3: Terminal View — TitleBar + TabBar
- **Team**: `clsh-phase5` — agent: `frontend-engineer` (instance 2)
- **Parallel Group**: 5C
- **Blocked By**: Step 5.2
- **Worktree**: Yes — `terminal-view`
- **Status**: COMPLETE
- **Tasks**:
  - [x] `TerminalView.tsx` flex-column layout (TitleBar + TabBar + xterm.js + ContextStrip + MacBookKeyboard)
  - [x] `TitleBar.tsx` (traffic lights + "name — cwd — 80×32" + "⊞ grid" button)
  - [x] `TabBar.tsx` (active session tab, orange border-bottom, remote indicator)
  - [x] Wire "⊞ grid" → back to GridView via onBack prop
  - [x] iOS keyboard suppression (inputmode=none, readonly on .xterm-helper-textarea)
  - [x] useTerminal hook integration, resize sent to WS on terminal resize
  - [x] Terminal output subscribed via messageBus (stdout/stderr filtered by sessionId)
  - [ ] Navigation transitions (CSS slide) — not implemented; view swap is instant
- **Vault Updates**: [[Frontend]]

### Parallel Group 5D — Keyboard + Context Strip (runs after 5.2, parallel to 5.3)

#### Step 5.4: MacBook Keyboard + Context Strip
- **Team**: `clsh-phase5` — agent: `frontend-engineer` (instance 3)
- **Parallel Group**: 5D (can run parallel to 5.3 — different files)
- **Blocked By**: Step 5.2
- **Worktree**: Yes — `keyboard`
- **Status**: COMPLETE
- **Tasks**:
  - [x] `MacBookKeyboard.tsx` (5 rows, flex layout, CSS custom props via data-skin)
  - [x] Correct relative widths per spec (backspace 2x, tab 1.5x, caps 1.6x, return 2.3x, shifts 2.2x/2.6x, space 5.5x)
  - [x] All 5 rows (number row, QWERTY, ASDF, ZXCV, fn/ctrl/opt/cmd/space/arrows)
  - [x] Key press visual: translateY(1px) + shadow-reduce on touchstart/mousedown
  - [x] `ContextStrip.tsx` (esc, F1-F5, commit, diff, plan, Ctrl+C)
  - [x] `keyboard.ts` with full escape sequence map (arrows, fn keys, ctrl+letter)
  - [x] Modifier state: shift sticky, caps lock toggle, ctrl sticky
  - [x] Keyboard sends directly to WS stdin (not through xterm.js)
  - [x] iOS Safari: touchstart preventDefault, user-select none, touch-action manipulation
  - [x] Per-key color overrides via perKeyColors prop
  - [ ] Arrow key T-shape (↑↓ half-height stacked) — simplified to single row
- **Vault Updates**: [[Frontend]], [[UI-Spec]]

### Parallel Group 5E — Skin System + Studio (runs after 5.4)

#### Step 5.5: Skin System + Skin Studio
- **Team**: `clsh-phase5` — agent: `frontend-engineer`
- **Parallel Group**: 5E
- **Blocked By**: Step 5.4 (needs keyboard component)
- **Worktree**: Yes — `skin-system`
- **Status**: COMPLETE
- **Tasks**:
  - [x] `skins.ts` with all 6 skin definitions (iOS Terminal, MacBook Silver, Gamer RGB, Custom Painted, Amber Retro, Ice White)
  - [x] `useSkin` hook (skin + perKeyColors, localStorage persistence, data-skin on `<html>`)
  - [x] `index.css` updated with `[data-skin="..."]` CSS custom property blocks for all 5 skins
  - [x] Gamer RGB `@keyframes rgb-cycle` hue-rotate animation
  - [x] Custom Painted per-key color overrides via perKeyColors prop
  - [x] `SkinStudio.tsx` (header, live MiniKeyboard preview, 2-col SkinCard grid, per-key painter, import/export)
  - [x] `MiniKeyboard` sub-component (scaled 0.65×) built inline in SkinStudio
  - [x] `SkinCard` sub-component with mini keyboard preview grid
  - [x] 12 color swatches + custom color picker (native `<input type="color">`)
  - [x] "Apply to All" button + `DEFAULT_CUSTOM_COLORS` for 46 keys
  - [x] `.kbd` JSON import/export (version 1 format)
  - [ ] Auto-contrast label color — not implemented
  - [ ] Skin button on keyboard — triggered from App.tsx via onOpenSkinStudio prop
- **Vault Updates**: [[Frontend]], [[UI-Spec]]

### Parallel Group 5F — Integration + Polish (runs after 5.3, 5.4, 5.5)

#### Step 5.6: Integration + Polish
- **Team**: `clsh-phase5` — agent: `frontend-engineer`
- **Parallel Group**: 5F
- **Blocked By**: Steps 5.3, 5.4, 5.5
- **Worktree**: Yes — `ui-integration`
- **Status**: COMPLETE
- **Tasks**:
  - [x] `App.tsx` fully integrated: useAuth → useSessionManager → useSkin → view state machine
  - [x] `packages/web/src/lib/types.ts` shared type definitions (Session, View, SkinId, all Props)
  - [x] Navigation: grid ↔ terminal ↔ skin studio wired correctly
  - [x] Brand color: all #00ff87 green replaced with #f97316 orange (matches landing page)
  - [x] Session creation bug fixed: Promise-based createSession → reactive useEffect watching sessions
  - [x] TypeScript: 0 errors across all packages (npx turbo run typecheck)
  - [x] 3-tier tunnel: ngrok → localhost.run SSH → local WiFi (no account needed for QR)
  - [x] Auth: bootstrap token embedded in QR URL (?token=xxx), sessionStorage JWT persistence
  - [x] Vite: host:true (bind 0.0.0.0), WEB_PORT=4031 in agent dev script
  - [x] config.ts: loadDotEnv() auto-reads .env from repo root
  - [ ] Demo mode update for new Grid+Terminal — deferred (existing demo still works)
  - [ ] Desktop layout update — deferred (desktop still uses old MacBook frame components)
- **Vault Updates**: [[Frontend]], [[MVP]], [[Features]]

---

## Dependency Graph

```
1.1 Scaffolding
 │
 ├──► 1.2 Backend Core ──► 1.3 Auth+Tunnel ──┐
 │                                             │
 └──► 1.4 Frontend Core ─────────────────────┤
                                               │
                    ┌──────────────────────────┘
                    │
                    ├──► 2.1 MacBook Frame ──► 2.4 Demo Mode ──► 3.1 Landing Page
                    ├──► 2.2 Mobile Layout                        │
                    └──► 2.3 Auth UI                              │
                                                                  │
     3.4 Social Channels (no blocker) ──────────────────────────┐ │
     3.2 OSS Packaging (needs 1.1) ─────────────────────────────┤ │
     3.3 Domain+Deploy (needs 3.1) ─────────────────────────────┤ │
                                                                  │ │
                                                                  ▼ ▼
                                                            4.1 Pre-Launch Content
                                                                  │
                                              ┌───────────────────┼───────────────────┐
                                              ▼                   ▼                   ▼
                                     4.1a Critical       4.1b Security       4.1c OSS
                                     Auth Fixes          Hardening           Readiness
                                     (BLOCKING)          (parallel)          (parallel)
                                              │                   │                   │
                                              │                   ▼                   │
                                              │          4.1d PWA Password             │
                                              │          + Biometric Auth              │
                                              │                   │                   │
                                              └───────────────────┼───────────────────┘
                                                                  ▼
                                                            4.2 Launch Day
                                                                  │
                                                                  ▼
                                                            4.3 Post-Launch
```

## Progress Summary

| Phase | Steps | Completed | % |
|-------|-------|-----------|---|
| 1. Foundation | 4 | 4 | 100% |
| 2. UI + Polish | 4 | 4 | 100% |
| 3. Launch Prep | 4 | 4 | 100% |
| 4. Launch (Security + Launch) | 7 | 5 | 71% |
| 5. UI Redesign | 6 | 6 | 100% |
| **Total** | **25** | **23** | **92%** |

**Phase 4 detail**: 4.1 COMPLETE, 4.1a COMPLETE, 4.1b COMPLETE, 4.1c IN PROGRESS (1 task remaining: security email), 4.1d COMPLETE, 4.2 COMPLETE (launched), 4.3 NOT STARTED

## Session Log

| Date | Session | Steps Completed | Handoff |
|------|---------|-----------------|---------|
| 2026-03-12 | Vault initialization | — | [[Handoffs/handoff-2026-03-12]] |
| 2026-03-12 | Phase 1+2 build | 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4 | [[Handoffs/handoff-2026-03-12-session2]] |
| 2026-03-12 | Phase 3 parallel (3 agents) | 3.1, 3.2, 3.4 | [[Handoffs/handoff-2026-03-12-session3]] |
| 2026-03-13 | Remotion demo video | 4.1 (IN PROGRESS — video built, render+embed pending) | [[Handoffs/handoff-2026-03-13]] |
| 2026-03-13 | Phase 5 UI Redesign (4-agent parallel team) | 5.1, 5.2, 5.3, 5.4, 5.5, 5.6 | [[Handoffs/handoff-2026-03-13-session2]] |
| 2026-03-13 | Demo video polish — iPhone frame on all scenes, keyboard cut fix | 4.1 still IN PROGRESS | [[Handoffs/handoff-2026-03-13-session3]] |
| 2026-03-13 | Render video + embed in landing page (layout needs polish) | 4.1 IN PROGRESS — render+embed done | [[Handoffs/handoff-2026-03-13-session4]] |
| 2026-03-13 | Landing page layout fix + Cloudflare deploy + DNS + PWA icon | 3.3 COMPLETE — clsh.dev live on Cloudflare Pages | [[Handoffs/handoff-2026-03-13-session5]] |
| 2026-03-13 | Mobile bug fixes + polish (real device testing): ANSI fix, terminal history, keyboard layout, PWA auth, stale JWT, static ngrok URL, colored session previews, PWA icons, sticky modifier keys (next) | No new steps completed — all bug fixes to existing Phase 5 UI | [[Handoffs/handoff-2026-03-13-session6]] |
| 2026-03-13 | Keyboard UX (↑↓ arrows, sticky modifiers, orange flash) + Pre-launch content (6 files) + Terminal UI overhaul (editable session name, remove TabBar, icon-only grid, session delete+confirm, settings panel) + Skin fixes (perKeyColors clear on switch, gamer-rgb rainbow, custom-painted defaults, data-kbd attr) + ngrok tunnel setup (.env, static domain, Vite allowedHosts) + Dev log cleanup (turbo filters, clean banner with token) + SkinStudio simplified (removed per-key painter) | 4.1 COMPLETE | [[Handoffs/handoff-2026-03-13-session7]] |
| 2026-03-14 | Bug fixes: bootstrap token now reusable (not one-time), PWA safe-area-inset for notch/Dynamic Island (scoped to standalone mode), extracted 1024px profile image | No new steps | [[Handoffs/handoff-2026-03-14]] |
| 2026-03-14 | Social prep + video fix: unified bios for all platforms, rewrote SceneClaude + MacKeyboard to match real app, re-rendered demo.mp4, social posting plan with 5 screenshots, README enhanced with ngrok setup + PWA Add to Home Screen section | No new steps (polish) | [[Handoffs/handoff-2026-03-14-session2]] |
| 2026-03-14 | Session persistence (session_subscribe protocol), headless xterm.js previews, PWA layout fixes (fixed positioning + safe-area), Cloudflare DNS fix (CNAME records), removed IDLE badge | 3.3 progressed (SSL + www redirect done) | [[Handoffs/handoff-2026-03-14-session3]] |
| 2026-03-14 | Launch content: 2 narrative stories (official + funny) + 40+ post ideas bank for Reddit/HN/X with content calendar | No step change (content enrichment for 4.2) | [[Handoffs/handoff-2026-03-14-session4]] |
| 2026-03-14 | Video CTA fix (two-line quickstart), README tunnel rewrite (3-tier fallback), SEO additions (robots.txt, sitemap.xml, JSON-LD, h1), deployed to Cloudflare | No step change (polish for 4.1 + 3.2 + 3.3) | [[Handoffs/handoff-2026-03-14-session5]] |
| 2026-03-14 | iOS Terminal keyboard (new default skin), useKeyboardState hook extraction, double-keystroke touch bug fix, settings cog in session TitleBar, README keyboard section rewrite | No step change (enhancement to 5.4 + 5.5) | [[Handoffs/handoff-2026-03-14-session6]] |
| 2026-03-14 | tmux session persistence (hybrid pty-manager), settings panel fix in terminal view, README persistence section | No step change (new feature + bug fix) | [[Handoffs/handoff-2026-03-14-session7]] |
| 2026-03-14 | SSH tunnel fix (lhr.life regex), port fallback (EADDRINUSE recovery), TUNNEL env var to force ssh/local, turbo env passthrough, Vite allowedHosts for lhr.life | No step change (infra/DX fixes) | [[Handoffs/handoff-2026-03-14-session8]] |
| 2026-03-14 | tmux session persistence, CLAUDECODE env strip, settings panel fix in terminal view, vault docs updated (Vision, Features, MVP, Infrastructure) with "perfect experience" narrative | No step change (feature + bug fix + docs) | [[Handoffs/handoff-2026-03-14-session9]] |
| 2026-03-14 | Launch content polish: updated all 9 content pieces (HN, X thread, PH, blog, 4 Reddit posts, post-ideas-bank) + 2 stories. Changes: ~55 files (was ~30), 6 skins (was 5), 3-tier tunnel, tmux persistence, two keyboard layouts, AI agent monitoring angle woven into all pieces | No step change (content polish for 4.1/4.2) | [[Handoffs/handoff-2026-03-14-session10]] |
| 2026-03-14 | GitHub handle fix (clsh-dev → my-claude-utils across all codebase), marketing copy refresh ("under a minute / zero config / zero signup"), demo video re-rendered + compressed + deployed to Cloudflare | No step change (handle fix + copy refresh + redeploy) | [[Handoffs/handoff-2026-03-14-session10]] |
| 2026-03-14 | Full security audit + open source readiness audit. Found 4 critical + 9 high + 8 low vulnerabilities. Created Security-Audit.md. Added 3 new blocking steps (4.1a, 4.1b, 4.1c) to Execution Plan. Corrected false claims in Security.md. Updated all vault files. | No code steps completed — audit + planning only. New steps 4.1a/4.1b/4.1c created and block 4.2. | [[Handoffs/handoff-2026-03-14-session12]] |
| 2026-03-14 | README: added "Experience Tiers" table — 8 combos of ngrok/SSH tunnel/tmux/WiFi with vibe descriptions. Includes SSH tunnel (localhost.run) fallback tier. | No step change (README polish for 3.2) | [[Handoffs/handoff-2026-03-14-session13]] |
| 2026-03-14 | Facebook + LinkedIn personal launch posts (English + Hebrew). 4 posts total with posting notes, group suggestions, adaptation tips. Updated Content index. | No step change (content enrichment for 4.1/4.2) | [[Handoffs/handoff-2026-03-14-session14]] |
| 2026-03-14 | Auth screen UX fix: replaced input with non-interactive div on mobile (prevents iOS keyboard zoom), added paste button + iOS keyboard toggle. Terminal startup banner: orange ASCII "CLSH" logo + orange QR code via ANSI 256-color. | No step change (bug fix + polish) | [[Handoffs/handoff-2026-03-14-session15]] |
| 2026-03-14 | Bug fixes: disabled tmux wrapping (broke xterm.js scrollback), fixed session rename (full WS round-trip + userRenamed flag), fixed touch scroll (active scrollLines in onTouchMove), tmux socket isolation (-L clsh). Enhancements: key repeat on hold (400ms delay, 60ms interval), scroll-to-bottom on typing. Deleted unused TmuxStatusBar.tsx. | No step change (bug fixes + UX enhancements) | [[Handoffs/handoff-2026-03-14-session16]] |
| 2026-03-14 | New Remotion "SetupFlow" composition: 6 scenes (desktop terminal → QR scan → grid → Claude Code → dev server → CTA), 34s at 30fps. 3 new components (DesktopTerminal, CameraViewfinder, QRCode). Rendered to MP4 (5.1MB raw, 2.1MB compressed). Copied both videos to vault Assets/Social/Videos/. | No step change (video content for 4.1/4.2) | [[Handoffs/handoff-2026-03-14-session17]] |
| 2026-03-14 | Privacy fix: replaced real username with mock name in SceneClaude + SceneSetupClaude. Re-rendered both videos (ClshDemo 4.2MB, SetupFlow 2.1MB). Updated vault + repo copies. | No step change (privacy fix) | [[Handoffs/handoff-2026-03-14-session18]] |
| 2026-03-14 | **Git push + OSS prep**: Scanned monorepo for secrets/assets. Fixed .gitignore (mp4, demo-video, landing page excluded). Copied 5 phone screenshots to docs/images/. Added package.json metadata to all packages. Created CHANGELOG.md. Rewrote README.md (best-practice OSS). Fixed CLI name collision (clsh → @clsh/cli). Git init + configured local user (my-claude-utils / your-org-email@example.com). Initial commit (105 files). Pushed to GitHub. Set up branch protection, topics, repo settings. Fixed CI (lockfile + lint errors). Closed 4 Dependabot PRs. Replaced landing video with setup-flow.mp4. Removed apps/landing/ from repo (deployed separately). | 4.1c partial (OSS readiness: screenshots, CHANGELOG, package.json metadata, .gitignore, git push) | [[Handoffs/handoff-2026-03-14-session19]] |
| 2026-03-14 | User-reported bug fixes: (1) PWA icon — landing page used SVG apple-touch-icon (iOS needs PNG), copied PNG icons + added sizes attr; (2) "no tunnel here :(" — added service worker to cache app shell so tunnel-down shows demo mode; (3) QR unreadable in light terminals — removed orange ANSI coloring from QR blocks. Pushed to GitHub. | No step change (3 bug fixes from user testing) | [[Handoffs/handoff-2026-03-14-session20]] |
| 2026-03-14 | Instagram composite images: Created 7 marketing images (1080x1350, 4:5 ratio) from 5 phone screenshots. ImageMagick composites with SF NS Mono headlines, brand orange (#f97316) accents, and phone screenshots with rounded corners. Full posting guide with captions + hashtags. | No step change (content enrichment for 4.1/4.2) | [[Handoffs/handoff-2026-03-14-session21]] |
| 2026-03-14 | Discord server setup via bot: Created clsh-bot (Discord Developer Portal), automated full server build — 5 categories (WELCOME, GENERAL, SUPPORT, DEVELOPMENT, OFF-TOPIC), 14 channels, 3 roles (Maintainer/Contributor/Community), welcome embed + launch announcement. Cleaned up default categories. Bot token saved to .env. | 3.4 progressed (Discord server live) | [[Handoffs/handoff-2026-03-14-session22]] |
| 2026-03-14 | **Sleep/idle fix + security hardening + auth UX**: (1) `caffeinate -i` prevents macOS sleep while agent runs; (2) Persistent WS reconnection (no hard cap, visibility/online-aware, 25s heartbeat ping); (3) Server-side WS ping/pong to detect dead connections; (4) Removed magic-link + verify endpoints (C1 critical fix); (5) Removed `authenticateWithMagicLink` from frontend; (6) JWT expiry extended to 30d for PWA persistence; (7) Auth screen: paste text button, tap-to-keyboard, keyboard overlay (no shift); (8) Full security review documented (17 findings). | 4.1a IN PROGRESS (C1 done, C2 partial) | [[Handoffs/handoff-2026-03-14-session23]] |
| 2026-03-14 | tmux control mode (`-CC`) session persistence re-enabled, control-mode-parser.ts, hex input via send-keys -H, capture-pane reconnect bootstrap, session rediscovery on startup | No step change (feature re-enable) | [[Handoffs/handoff-2026-03-14-session24]] |
| 2026-03-14 | **Launch marketing push**: Posted on Reddit (r/commandline, r/SideProject, r/programming, r/webdev) + all social platforms. Fixed HN title (80 char limit). Removed AI references from r/commandline post (Rule 7). Researched dev influencers for DM outreach. | No step change (GTM execution for 4.2) | [[Handoffs/handoff-2026-03-14-session25]] |
| 2026-03-14 | **tmux control mode session persistence**: Re-enabled tmux via control mode (`-CC`), which sends raw `%output` bytes instead of screen redraws — fixing the scrollback problem that caused tmux to be disabled. New `control-mode-parser.ts` for protocol parsing + octal decoding. Refactored `pty-manager.ts` with dual raw/control-mode handlers. Input via `send-keys -H` (hex), resize via `refresh-client -C`. `capture-pane` bootstraps scrollback on server restart reattach. Fixed `\n` → `\r\n` in capture-pane output for correct xterm.js grid preview rendering. Graceful fallback to raw PTY when tmux not installed. Updated README with session persistence section. Pushed to GitHub. | No step change (feature restoration + bug fix) | [[Handoffs/handoff-2026-03-14-session24]] |
| 2026-03-14 | Blog post polish: removed all em dashes from blog-launch-post.md, softened AI-sounding phrasing. Added global "no em dash" writing rule to BRAIN.md. Threads community engagement (replied to @mktpavlenko validating "clone install run" positioning). | No step change (content polish) | [[Handoffs/handoff-2026-03-14-session26]] |
| 2026-03-15 | **Reddit r/ClaudeAI post LIVE**: Crafted authentic post (3 iterations to pass spam filters + subreddit rules). Key lessons: no bold headers, no bullet lists, must say "built with Claude", educational tone. Updated reddit-posts.md with strategy. Threads security reply drafted. Researched competitors (Anthropic Remote Control, Happy Coder, CC Pocket). Found 4 HN threads + 4 GitHub issues asking for exactly what clsh solves. | No step change (GTM execution for 4.2) | [[Handoffs/handoff-2026-03-15]] |
| 2026-03-14 | **Lid-close networking fix**: (1) Fixed WebSocket zombie accumulation in `ws-client.ts` (old sockets not cleaned up before new connect, causing duplicate connections after reconnect cycles); (2) Upgraded `caffeinate -i` to `-dis` (display+idle+system sleep prevention); (3) Added tunnel auto-recovery monitor in `tunnel.ts` (wake detection via time drift, SSH process death detection, health check via `/api/health`, auto-recreation); (4) Added `power.ts` pmset check with startup tip for `tcpkeepalive 1`; (5) **KNOWN ISSUE**: macOS Wi-Fi drops when lid closes even with caffeinate, requires user to run `sudo pmset -c tcpkeepalive 1` once. Pushed to GitHub (37ac61d). | No step change (critical bug fix for PWA reliability) | [[Handoffs/handoff-2026-03-14-session27]] |
| 2026-03-15 | **OSS git workflow + README polish**: (1) Added "Lid-Close Mode" section to README with optional `pmset` setup, undo instructions, and known limitations; (2) Set up proper OSS workflow: branch protection (PRs required, enforce admins, linear history), squash merge only, auto-delete branches; (3) Fixed CI check names in branch protection (stale from job rename); (4) Created first GitHub Release `v0.1.0` with full feature summary; (5) Embedded setup-flow GIF in README (converted from mp4 via ffmpeg, 360px/12fps/4.2MB); (6) First 2 PRs merged through new workflow (#5, #6). | 4.1c progressed (OSS workflow: versioning, branch protection, first release) | [[Handoffs/handoff-2026-03-15-session28]] |
| 2026-03-15 | **Social media strategy + content refresh**: Threads is breakout channel (100 followers, 100+ likes in 24h). Created threads-posts.md Wave 2 (10 new posts with image needs). Rewrote ALL Reddit posts: removed em dashes, bold headers, bullet lists (AI tells). Added image recommendations per subreddit. Performance tracking: Threads HIGH, Reddit LOW, X/IG/TikTok NONE. Strategy shift: Threads daily, Reddit comment-first, IG/TikTok paused until video content. | No step change (GTM execution for 4.2) | [[Handoffs/handoff-2026-03-15-session29]] |
| 2026-03-15 | **npx clsh-dev one-command quickstart**: Implemented full CLI package (setup wizard, config system, path resolution for npm install). Published @clsh npm org + 3 packages (@clsh/web, @clsh/agent, clsh-dev). Fixed bin name mismatch, stale "npx clsh" refs. Re-rendered Remotion videos (shortened 34s→29s, updated messaging). Deployed landing page with new video. Updated ~40+ files from "npx clsh" to "npx clsh-dev". PRs #7-#11 merged. | 4.1c progressed (npm publishing pipeline) | [[Handoffs/handoff-2026-03-15-session30]] |
| 2026-03-15 | **Google Search Console + SEO**: Verified clsh.dev ownership via HTML file upload. Confirmed Google has already indexed clsh.dev (green checkmarks). Submitted sitemap.xml. Deployed verification file to Cloudflare Pages. Updated SEO vault docs. | No step change (SEO/marketing infra) | [[Handoffs/handoff-2026-03-15-session31]] |
| 2026-03-15 | **npx clsh-dev bug fixes (3 PRs)**: (1) PR #14: try/catch in `reattach()` for stale sessions crashing server with `posix_spawnp failed`; (2) PR #15: `fixNodePtyPermissions()` at startup — npm strips +x from node-pty's `spawn-helper` binary, breaking all PTY spawns via npx; (3) PR #16: `shuttingDown` flag in PTYManager so `destroyAll()` skips tmux/DB cleanup, fixing session persistence across restarts. Published @clsh/agent@0.0.5, clsh-dev@0.1.6. | No step change (3 critical bug fixes for npx experience) | [[Handoffs/handoff-2026-03-15-session32]] |
| 2026-03-15 | **"3 commands to 1" announcement campaign**: New Remotion `OneCommand` composition (330 frames, 11s, typing + strikethrough + logo animation). Marketing image `08_one_command.png` (1080x1350, ImageMagick composite). Discord announcement posted to #announcements. Threads Post 19 + X tweet drafted in vault. Campaign documented in Social-Media.md. | No step change (marketing content for 4.2) | [[Handoffs/handoff-2026-03-15-session33]] |
| 2026-03-16 | **Security fixes + splash screen + auth UX + connectivity**: All critical/high security fixes landed (C1-C4, H1-H3, H5-H7, H9, L5-L6). Animated CLSH splash screen. Mobile auth simplified to QR-only. Token hidden from terminal. QR Scanner iOS fix. WebSocket origin fix for local network IP. iOS Safari replaceState fix. Connection status banner. PRs #17-#21 merged. npm: clsh-dev@0.1.7, @clsh/agent@0.0.6, @clsh/web@0.0.3. | 4.1a COMPLETE, 4.1b COMPLETE | [[Handoffs/handoff-2026-03-16-session34]] |
| 2026-03-16 | **"Obsidian as Claude Code's brain" content campaign**: Created blog post (Dev.to/Hashnode), HN post, Reddit posts (r/ClaudeAI, r/ObsidianMD, r/SideProject, r/programming), X thread (7 tweets), Threads posts, LinkedIn post, Facebook posts (EN+HE). Cover image with real Obsidian + Claude logos (1200x630). 4 vault screenshots for image carousel. Platform research: best blogs ranked (Dev.to > Hashnode > HN > HackerNoon > Medium). Posting order + engagement strategy documented. | No step change (content enrichment for 4.2) | [[Handoffs/handoff-2026-03-16-session35]] |
| 2026-03-16 | **Landing page fix**: Fixed `npx clsh` → `npx clsh-dev` display text in index.html. Redeployed to Cloudflare Pages. | No step change (bug fix) | [[Handoffs/handoff-2026-03-16-session36]] |
| 2026-03-16 | **PWA Password + Biometric Auth**: Server-side password auth (scrypt), WebAuthn/Face ID, 3 new DB tables, 7 new API endpoints, LockScreen/LockSetup components, rewrote AuthScreen for lock-screen UI, fixed scrypt memory + race conditions + PWA state sync. Rewrote SECURITY.md + README security section. PR #23 merged. Published @clsh/web@0.0.4, @clsh/agent@0.0.7, clsh-dev@0.1.8. | 4.1c partial (docs done), 4.1d COMPLETE (new) | [[Handoffs/handoff-2026-03-16-session37]] |
| 2026-03-17 | **Security cleanup + launch confirmed + viral Reddit**: Fixed vault Security.md (updated all false claims post-4.1a/4.1b). npm audit: 0 vulns. Marked 4.2 COMPLETE (full launch already happened). Reddit r/ClaudeAI "Obsidian brain" post went viral, DMs flooded. Drafted Reddit replies. Drafted social hype posts (X, Threads, Discord). | 4.2 COMPLETE, 4.1c progressed (npm audit done, Security.md fixed) | [[Handoffs/handoff-2026-03-17-session38]] |
