# Contributing to BrainTree OS

Thanks for your interest in contributing! This guide will help you get set up.

## Development Setup

```bash
git clone https://github.com/brain-tree-dev/brain-tree-os
cd brain-tree-os
npm install
npm run dev
```

The web app runs on `http://localhost:3000`.

## Project Structure

```
brain-tree-os/
├── packages/
│   ├── cli/        # CLI entry point (npx brain-tree-os)
│   └── web/        # Next.js app (brain viewer, local data layer)
├── demo/           # Bundled demo brain (43 CLSH files)
├── examples/       # Full example brains
└── docs/           # Documentation and screenshots
```

## Development Workflow

- **Web** (`packages/web`): Next.js with hot reload via `npm run dev`
- **CLI** (`packages/cli`): TypeScript compiled with `tsc`
- **Turborepo**: `npm run dev` runs everything in parallel

## Coding Standards

- **TypeScript**: Strict mode in all packages
- **Prettier**: Auto-formats on save (config in `.prettierrc`)
  - No semicolons, single quotes, trailing commas, 100 char width
- **ESLint**: Flat config with `typescript-eslint` strict rules
- **EditorConfig**: 2-space indent, LF line endings, UTF-8

Run checks locally:

```bash
npm run lint
npm run typecheck
npm run format:check
npm run build
```

## Commit Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `chore:` Maintenance, dependency updates
- `refactor:` Code restructuring without behavior change

## Branch Naming

- `feat/description` New features
- `fix/description` Bug fixes
- `docs/description` Documentation

## Pull Request Guidelines

1. Create a branch from `main`
2. Write a clear description of what changed and why
3. Ensure CI passes (lint, typecheck, build)
4. Add screenshots for UI changes
5. Keep PRs focused (one feature or fix per PR)

## Reporting Bugs

Open a [GitHub issue](https://github.com/brain-tree-dev/brain-tree-os/issues/new?template=bug_report.yml) with:

- Your environment (OS, Node version, browser)
- Steps to reproduce
- Expected vs actual behavior

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
