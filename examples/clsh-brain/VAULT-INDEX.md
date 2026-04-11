---
title: Vault Index
tags: #clsh #index
created: 2026-03-12
updated: 2026-03-12
---

# clsh.dev — Vault Index

> Start here. This is the navigation hub for the entire project vault.

## What is clsh?

**clsh** is a phone-first, open-source tool that gives developers real terminal access to their machine from any device. The primary experience is on your phone — a pixel-perfect MacBook keyboard (not iOS keyboard), tmux session grids with zoom, and customizable keyboard skins. Desktop is also supported with a MacBook Pro frame and three-pane layout. See [[Vision]] for the full product vision.

## Quick Links

- [[Execution-Plan]] — Step-by-step build + launch plan (source of truth)
- [[Security-Audit]] — Pre-launch security audit (4 critical, 9 high findings)
- [[Company]] — Project overview
- [[BRAIN.md]] — Agent instructions

## Departments

| # | Department | Index | Status | Lead Agent |
|---|-----------|-------|--------|------------|
| 00 | Company | [[Company]] | Active | — |
| 01 | R&D | [[RnD]] | Phase 1+2+5 complete; **Security hardening COMPLETE** (4.1a + 4.1b done); **PWA password + biometric auth COMPLETE** (4.1d); Splash screen + auth UX overhaul; npx clsh-dev@0.1.8, @clsh/web@0.0.4, @clsh/agent@0.0.7; PRs #5-#23 merged; CI green | `rnd-lead` |
| 02 | Product | [[Product]] | Vision + MVP + Features updated with "perfect experience" (tmux persistence + ngrok static domain); all P1 phone features shipped | `product-manager` |
| 03 | Marketing | [[Marketing]] | **Reddit r/ClaudeAI post VIRAL** (DMs flooded, massive demand for Obsidian+Claude workflow). Hype posts drafted for X/Threads/Discord. All launch content ready. | `marketing-lead` |
| 04 | Community | [[Community]] | Discord LIVE (5 categories, 14 channels, 3 roles, bot automated); GitHub community planned | `community-lead` |
| 05 | Business | [[Business]] | Not started | `business-lead` |
| 06 | Legal | [[Legal]] | MIT licensed; security audit complete — all critical + high vulns FIXED (4.1a+4.1b); vault Security.md updated to reflect reality; npm audit clean (0 vulns); security email still pending | — |

## Source Documents

| Document | Location | Purpose |
|----------|----------|---------|
| Complete Technical Plan | `Docs/compass_artifact_*.md` | Full architecture, code, and roadmap |
| [[UI-Spec]] | `02_Product/UI-Spec.md` | Pixel-precise mobile UI spec (colors, sizes, interactions) from mockups |
| [[Frontend]] | `01_RnD/Frontend/Frontend.md` | Frontend architecture, component tree, keyboard system, skin system |
| [[Security-Audit]] | `01_RnD/Security-Audit.md` | Full pre-launch security audit with code-level findings |

## Handoffs

Session handoff notes live in `Handoffs/`. Latest: [[Handoffs/handoff-2026-03-17-session39]]


## Current Progress

**Overall:** 92% (23/25 steps complete)
**Current Phase:** Phase 4 — Post-Launch
**Security:** Steps 4.1a, 4.1b, 4.1d COMPLETE. Step 4.1c nearly done (1 task remaining: security email).
**Launch:** Step 4.2 COMPLETE. Full launch executed across all platforms. Reddit r/ClaudeAI post went viral.
**Immediate Next:** Finish 4.1c (security email) → Step 4.3 Post-Launch
**npm**: `@clsh` org on npmjs.com; packages: clsh-dev@0.1.8, @clsh/web@0.0.4, @clsh/agent@0.0.7
**Audit Report:** [[Security-Audit]] — full code-level findings with file paths and fix instructions
**GitHub:** https://github.com/my-claude-utils/clsh — public, CI green, branch protection on
**Deployment:** clsh.dev LIVE on Cloudflare Pages (www.clsh.dev redirect active, og-image.png deployed)
**Phone UI:** SHIPPED — Grid View → Terminal View → Skin Studio, iOS Terminal keyboard (default) + MacBook keyboard, 6 skins, editable session names, settings panel + cog in session view, ngrok remote access

## Key Decisions

- **Open source first** — MIT license, community-driven
- **Local-first MVP** — ngrok tunnel, no cloud infra needed
- **Future monetization** — Cloud-hosted remote machines (v2)
- **Tech stack** — React + Vite + xterm.js (frontend), Node.js + Express + node-pty (backend), Turborepo monorepo
- **Domain** — clsh.dev (Cloudflare Pages for landing, ngrok for live tunnels)
