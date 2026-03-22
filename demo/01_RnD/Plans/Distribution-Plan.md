# Distribution Plan

Strategy for distributing clsh.dev as an npm package.

## npx Distribution

Primary distribution via npm:
```bash
npx clsh
```

### Package Contents
- Bundled React [[Frontend]] (production build)
- Express backend server
- node-pty bindings (compiled per platform)
- ngrok integration
- CLI argument parser

## Platform Support

| Platform | Status | Notes |
|----------|--------|-------|
| macOS (arm64) | Supported | Primary target |
| macOS (x64) | Supported | Intel Macs |
| Linux (x64) | Planned | Server environments |
| Windows | Not planned | WSL recommended |

## Package Size Budget

- Frontend bundle: < 500KB gzipped
- Backend + dependencies: < 5MB
- Total install: < 15MB (including node-pty native bindings)

## Release Process

1. Version bump in package.json
2. Run test suite
3. Build frontend production bundle
4. Publish to npm with `npm publish`
5. Tag release on GitHub
