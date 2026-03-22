# DevOps & CI/CD

Build, test, and deployment pipeline for clsh.dev.

## GitHub Actions Pipeline

```
Push to main
  ├── Lint (ESLint + Prettier)
  ├── Type Check (TypeScript)
  ├── Unit Tests (Vitest)
  ├── Build (Vite production build)
  └── Deploy (Cloudflare Pages)
```

## Hosting

| Component | Platform | Notes |
|-----------|----------|-------|
| Frontend | Cloudflare Pages | Auto-deploy from main |
| Backend | User's Mac | Runs locally via npx clsh |
| npm Package | npmjs.com | npx clsh distribution |

## npm Package

Published as `clsh` on npm. Running `npx clsh` downloads the package, starts the Express backend, opens ngrok tunnel, and displays the connection URL + QR code.

Quality ensured through [[Testing]] pipeline.
