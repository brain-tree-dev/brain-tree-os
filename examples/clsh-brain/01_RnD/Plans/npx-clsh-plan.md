---
title: Plan — npx clsh-dev
tags: #clsh #plan #rnd
created: 2026-03-15
---

# Plan: `npx clsh-dev` One-Command Install

> Goal: `npx clsh-dev` starts the full clsh experience. One command, zero config.

## Current State

```
# Today (3 commands):
git clone https://github.com/my-claude-utils/clsh.git
cd clsh
npm install && npm run dev
```

## Target State

```
# After this plan (1 command):
npx clsh-dev

# Optional setup (for permanent URL):
npx clsh-dev setup
```

## Architecture

```
Published npm package: "clsh"
  ├── packages/cli/dist/index.js     ← bin entry (shebang, boots everything)
  ├── packages/agent/dist/           ← compiled backend
  ├── packages/web/dist/             ← pre-built React frontend (static files)
  └── node_modules/                  ← node-pty, better-sqlite3 (prebuilds)
```

The CLI imports and calls `main()` from `@clsh/agent`. The agent serves the pre-built web frontend from `@clsh/web/dist/` as static files (this already works in `server.ts:57-74`).

## What Already Exists

- `packages/cli/` — stub with `#!/usr/bin/env node`, `bin: { "clsh": "dist/index.js" }`, depends on `@clsh/agent`
- `packages/agent/src/server.ts` — already serves `packages/web/dist/` as static files with SPA fallback (lines 57-74)
- `packages/agent/src/config.ts` — loads `.env` from monorepo root via `import.meta.dirname` relative path
- `packages/web/` — Vite build outputs to `dist/`
- npm name `clsh` is **available** (404 on registry)

## Implementation Steps

### Step 1: Publish as `clsh` (not `@clsh/cli`)

Change `packages/cli/package.json`:
```json
{
  "name": "clsh",          // unscoped — enables `npx clsh-dev`
  "version": "0.1.0",
  "bin": {
    "clsh": "dist/index.js"
  },
  "dependencies": {
    "@clsh/agent": "*",
    "@clsh/web": "*"       // NEW — need the built frontend
  }
}
```

Why unscoped: `npx clsh-dev` only works with unscoped packages. `npx @clsh/cli` is ugly.

### Step 2: Export `main()` from Agent

In `packages/agent/src/index.ts`, export the boot function:
```typescript
export { main } from './index.js';
```

Also export a new `loadConfigFromFile()` in `config.ts` that reads `~/.clsh/config.json` (not just `.env`):
```typescript
export function loadConfig(): AgentConfig {
  // 1. Read ~/.clsh/config.json if it exists
  // 2. Read .env if it exists (current behavior)
  // 3. Environment variables override everything
  // Priority: env vars > .env > ~/.clsh/config.json > defaults
}
```

### Step 3: Fix Path Resolution

**Problem**: `config.ts` and `server.ts` use `import.meta.dirname` to resolve paths relative to the monorepo structure. When installed via npm, the directory structure is different:

```
Monorepo:         node_modules/@clsh/agent/dist/ → ../../web/dist   ✓ (sibling package)
npx install:      node_modules/clsh/node_modules/@clsh/agent/dist/  → ../../web/dist  ✗ (wrong path)
```

**Fix for server.ts (web dist path)**: The agent should look for the web dist in multiple locations:
```typescript
function findWebDist(): string | null {
  const candidates = [
    // Monorepo: packages/web/dist (relative to packages/agent/dist)
    join(import.meta.dirname, '..', '..', 'web', 'dist'),
    // npm: @clsh/web/dist (resolve from node_modules)
    // Use createRequire to find the package
  ];
  return candidates.find(p => existsSync(join(p, 'index.html'))) ?? null;
}
```

Better approach: have `@clsh/web` export its dist path:
```typescript
// packages/web/src/dist-path.ts
export const webDistPath = join(import.meta.dirname, '..', 'dist');
```

Then the agent imports it:
```typescript
import { webDistPath } from '@clsh/web/dist-path';
```

**Fix for config.ts (.env path)**: For `npx clsh-dev`, there's no `.env` file. Config comes from `~/.clsh/config.json`. The `.env` loading should be optional (try monorepo root, try cwd, skip if neither exists).

### Step 4: Config System (`~/.clsh/config.json`)

New config file at `~/.clsh/config.json` (same directory as `clsh.db`, `jwt_secret`, `tmux.conf`):
```json
{
  "ngrokAuthtoken": "xxx",
  "ngrokStaticDomain": "your-name.ngrok-free.dev",
  "port": 4030
}
```

**Priority order** (highest wins):
1. Environment variables (`NGROK_AUTHTOKEN`, `PORT`, etc.)
2. `.env` file (if running from a cloned repo)
3. `~/.clsh/config.json` (persisted by `npx clsh-dev setup`)
4. Defaults (port 4030, SSH tunnel, etc.)

### Step 5: CLI Entry Point

`packages/cli/src/index.ts`:
```typescript
#!/usr/bin/env node
import { main } from '@clsh/agent';

const args = process.argv.slice(2);

if (args[0] === 'setup') {
  // Interactive setup wizard
  await runSetup();
} else {
  // Boot the server
  await main();
}
```

### Step 6: `npx clsh-dev setup` Wizard

Interactive prompts (using Node.js readline, no extra deps):

```
clsh setup

clsh works out of the box with a free SSH tunnel (localhost.run).
For a permanent URL that survives restarts, set up ngrok (free):

? Do you want to set up ngrok? (y/N)

  1. Sign up at https://ngrok.com (free)
  2. Copy your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken

? Paste your ngrok authtoken: xxxxxxxxxxxxxxxx
  Saved to ~/.clsh/config.json

  3. Get a free static domain at https://dashboard.ngrok.com/domains

? Paste your static domain (e.g. your-name.ngrok-free.dev): your-name.ngrok-free.dev
  Saved to ~/.clsh/config.json

  Done! Run `npx clsh-dev` to start with your permanent URL.
  Guide: https://github.com/my-claude-utils/clsh/blob/main/docs/ngrok-setup.md
```

### Step 7: Ngrok Setup Guide (`docs/ngrok-setup.md`)

A standalone guide in the repo explaining:
- What ngrok does and why it matters for clsh
- Free tier (1 static domain per account)
- Step-by-step setup with screenshots/links
- How it combines with tmux persistence for the "tap icon, Mac is there" experience
- Troubleshooting (interstitial page, authtoken location, static domain)

### Step 8: Build Pipeline for Publishing

The publish flow needs to:
1. Build `@clsh/web` (Vite) → `packages/web/dist/`
2. Build `@clsh/agent` (tsc) → `packages/agent/dist/`
3. Build `clsh` CLI (tsc) → `packages/cli/dist/`
4. Publish `clsh` to npm with all three packages bundled

**Option A: Publish all 3 packages separately** (`@clsh/agent`, `@clsh/web`, `clsh`)
- npm resolves dependencies automatically
- Each package versioned independently
- More complex, but standard for monorepos

**Option B: Bundle everything into the `clsh` package**
- Copy `packages/agent/dist/` and `packages/web/dist/` into `packages/cli/` at publish time
- Single package, simpler for users
- Harder to maintain

**Recommended: Option A** (separate packages). Use `turbo run build` then `npm publish` for each. The `clsh` package declares `@clsh/agent` and `@clsh/web` as dependencies with pinned versions.

### Step 9: Update README Quickstart

```markdown
## Quickstart

> **Requires [Node.js 20+](https://nodejs.org)** and macOS or Linux.

\```bash
npx clsh-dev
\```

A QR code prints to the console. Scan it on your phone. That's it.

### Permanent URL (optional)

For a static URL that survives restarts (perfect for PWA home screen):

\```bash
npx clsh-dev setup
\```

See the [ngrok setup guide](docs/ngrok-setup.md) for details.
```

## Copywriting: "3 commands" → "1 command"

The messaging changes from:
```
Old: "Clone. Install. Run. Real terminal on your phone in under a minute."
New: "One command. Real terminal on your phone."
```

Old quickstart:
```bash
git clone https://github.com/my-claude-utils/clsh.git
cd clsh
npm install
npm run dev
```

New quickstart:
```bash
npx clsh-dev
```

### High Priority (user-facing, published)

| # | File | What changes |
|---|------|-------------|
| 1 | `README.md` | Quickstart section (1 command), tagline, tunnel docs (`TUNNEL=ssh npx clsh-dev`) |
| 2 | `CONTRIBUTING.md` | Contributor quickstart (keep clone flow for contributors, add `npx` for users) |
| 3 | `apps/landing/index.html` | Meta tags, subtitle, quickstart section (1 command + copy button) |
| 4 | `apps/landing/demo.js` | Animated terminal typing: `npx clsh-dev` instead of `npm run dev` |
| 5 | `apps/demo-video/src/scenes/SceneCTA.tsx` | Command constants + tagline → `npx clsh-dev` + "One command. That's it." |
| 6 | `apps/demo-video/src/scenes/SceneSetupCTA.tsx` | 3 command constants → 1 command |
| 7 | `apps/demo-video/src/scenes/SceneDesktop.tsx` | 3 command constants → 1 command |
| 8 | `apps/demo-video/src/scenes/SceneDevServer.tsx` | `npm run dev` → `npx clsh-dev` in terminal |
| 9 | `apps/demo-video/src/scenes/SceneSetupGrid.tsx` | `$ npm run dev` → `$ npx clsh-dev` |
| 10 | `packages/web/src/components/AuthScreen.tsx` | Instruction: "Run npx clsh-dev on your Mac..." |
| 11 | `packages/web/src/demo/demo-scripts.ts` | Demo mode typing: `npx clsh-dev` |
| 12 | `.github/ISSUE_TEMPLATE/bug_report.yml` | Repro steps placeholder |
| 13 | `.github/pull_request_template.md` | Testing checklist |

### Medium Priority (vault marketing content)

| # | File |
|---|------|
| 14 | `03_Marketing/Content/hn-show-post.md` |
| 15 | `03_Marketing/Content/blog-launch-post.md` |
| 16 | `03_Marketing/Content/product-hunt-listing.md` |
| 17 | `03_Marketing/Content/reddit-posts.md` |
| 18 | `03_Marketing/Content/threads-posts.md` |
| 19 | `03_Marketing/Content/facebook-linkedin-posts.md` |
| 20 | `03_Marketing/Content/x-thread-how-i-built-clsh.md` |
| 21 | `03_Marketing/Content/story-the-2am-deploy.md` |
| 22 | `03_Marketing/Content/story-a-conversation-that-actually-happened.md` |
| 23 | `03_Marketing/Content/post-ideas-bank.md` |
| 24 | `03_Marketing/Content/Content.md` |
| 25 | `03_Marketing/Social-Media/channel-setup-guide.md` |
| 26 | `03_Marketing/Marketing.md` |

### Lower Priority (vault identity/product docs)

| # | File |
|---|------|
| 27 | `BRAIN.md` (vault) |
| 28 | `00_Company/Company.md` |
| 29 | `00_Company/Vision-Mission.md` |
| 30 | `02_Product/Vision.md` |
| 31 | `02_Product/MVP/MVP.md` |
| 32 | `02_Product/Features/Features.md` |
| 33 | `01_RnD/Infrastructure/Infrastructure.md` |

### Step 10: Re-render Remotion Videos

After updating scenes (SceneCTA, SceneSetupCTA, SceneDesktop, SceneDevServer, SceneSetupGrid):

```bash
cd apps/demo-video
npm run render          # renders both compositions
# Compress with ffmpeg
ffmpeg -i out/ClshDemo.mp4 -crf 28 -preset slow out/demo.mp4
ffmpeg -i out/SetupFlow.mp4 -crf 28 -preset slow out/setup-flow.mp4
```

Copy outputs:
- `out/demo.mp4` → `apps/landing/demo.mp4` (landing page video)
- `out/setup-flow.mp4` → `assets/setup-flow.mp4` (README GIF source)
- Reconvert GIF: `ffmpeg -i assets/setup-flow.mp4 -vf "fps=12,scale=360:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" assets/setup-flow.gif`

### Step 11: Redeploy Landing Page

```bash
cd ~/your-project-path
CLOUDFLARE_API_TOKEN=<token> npx wrangler pages deploy apps/landing --project-name clsh-dev --branch main
```

Verify at https://clsh.dev that:
- New subtitle shows "One command" messaging
- Quickstart shows `npx clsh-dev` (single command, single copy button)
- Video plays with updated scenes
- Meta tags / OG description updated

## File Changes Summary

### Code (packages/)
| File | Change |
|------|--------|
| `packages/cli/package.json` | Rename to `clsh`, add `@clsh/web` dep, version 0.1.0 |
| `packages/cli/src/index.ts` | Full CLI: args parsing, `setup` wizard, boot `main()` |
| `packages/cli/src/setup.ts` | **NEW** — interactive setup wizard (readline) |
| `packages/agent/src/index.ts` | Export `main()` |
| `packages/agent/src/config.ts` | Add `~/.clsh/config.json` reading, fix `.env` path resolution |
| `packages/agent/src/server.ts` | Fix web dist path resolution for npm install |
| `packages/web/package.json` | Add `exports` field for dist path |
| `packages/web/src/components/AuthScreen.tsx` | Update instruction text |
| `packages/web/src/demo/demo-scripts.ts` | Update demo typing |

### Docs + Landing
| File | Change |
|------|--------|
| `README.md` | Quickstart → `npx clsh-dev`, update all `npm run dev` references |
| `CONTRIBUTING.md` | Keep clone flow for contributors, add `npx` for users |
| `docs/ngrok-setup.md` | **NEW** — standalone ngrok guide |
| `apps/landing/index.html` | Meta tags, subtitle, quickstart (1 command) |
| `apps/landing/demo.js` | Terminal typing animation |
| `.github/ISSUE_TEMPLATE/bug_report.yml` | Repro steps |
| `.github/pull_request_template.md` | Testing checklist |

### Remotion Video Scenes
| File | Change |
|------|--------|
| `apps/demo-video/src/scenes/SceneCTA.tsx` | 1 command + new tagline |
| `apps/demo-video/src/scenes/SceneSetupCTA.tsx` | 1 command |
| `apps/demo-video/src/scenes/SceneDesktop.tsx` | 1 command |
| `apps/demo-video/src/scenes/SceneDevServer.tsx` | `npx clsh-dev` |
| `apps/demo-video/src/scenes/SceneSetupGrid.tsx` | `npx clsh-dev` |

### Vault (marketing + identity — 20 files)
All "clone, install, run" / "three commands" → "one command" / `npx clsh-dev`

## Risks

1. **Native deps compilation**: `node-pty` and `better-sqlite3` ship prebuilds for common platforms. On uncommon platforms, users need Xcode CLT / build-essential. This is the same as any npm package with native deps.
2. **Package size**: The built web frontend adds ~2-5MB. Acceptable for a CLI tool.
3. **Path resolution**: The `import.meta.dirname` relative paths need careful fixing. This is the trickiest part.
4. **npm org**: Need to create the `@clsh` npm org to publish scoped packages, OR publish everything under the unscoped `clsh` name.
5. **Video render time**: Remotion render takes ~2-5 minutes per composition. Budget time for this.
6. **CONTRIBUTING.md**: Contributors still need clone + install. Keep both flows documented (npx for users, clone for contributors).

## Execution Order

### Phase A: Technical (code changes)
1. Fix path resolution in agent (config.ts + server.ts)
2. Add `~/.clsh/config.json` support to config.ts
3. Export `main()` from agent
4. Build CLI entry point with args parsing
5. Build setup wizard (`npx clsh-dev setup`)
6. Write ngrok guide doc (docs/ngrok-setup.md)
7. Test full `npx` flow locally

### Phase B: Copy + Media (can parallelize with late Phase A)
8. Update all codebase copy (README, landing, AuthScreen, demo-scripts, GitHub templates)
9. Update Remotion video scenes (5 files)
10. Re-render both videos (ClshDemo + SetupFlow)
11. Reconvert setup-flow GIF for README
12. Redeploy landing page to Cloudflare

### Phase C: Publish + Vault
13. Publish to npm
14. Update all vault marketing content (20 files)
15. Update vault identity/product docs (7 files)
16. Create GitHub Release v0.2.0
