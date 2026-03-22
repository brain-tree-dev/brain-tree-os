# Contributors Guide

How to contribute to clsh.dev.

## Getting Started

1. Fork the repository
2. Clone your fork
3. Install dependencies: `npm install`
4. Start dev server: `npm run dev`
5. Make changes and test
6. Submit a pull request

## Contribution Areas

| Area | Skill Level | Examples |
|------|------------|---------|
| Bug fixes | Beginner | Issue triage, simple fixes |
| Documentation | Beginner | README, guides, comments |
| Features | Intermediate | Keyboard modes, themes |
| Core terminal | Advanced | PTY handling, WebSocket |
| Mobile UX | Advanced | Touch gestures, keyboard |

## Code Standards

- TypeScript strict mode
- ESLint + Prettier formatting
- Tests for new features
- JSDoc for exported functions

## Pull Request Process

1. Create feature branch from main
2. Write code + tests
3. Ensure CI passes (lint, types, tests)
4. Request review from maintainer
5. Squash merge after approval
