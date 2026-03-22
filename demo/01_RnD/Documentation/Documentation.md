# Documentation

Technical documentation and developer guides for clsh.dev.

## Documentation Structure

| Document | Audience | Content |
|----------|----------|---------|
| README.md | Users | Quick start, installation, usage |
| CONTRIBUTING.md | Contributors | Dev setup, PR process, code style |
| API Reference | Developers | WebSocket protocol, HTTP endpoints |
| Architecture Guide | Contributors | System design, component overview |

## Architecture Overview

The system consists of two main parts:

1. **Frontend**: React SPA with xterm.js terminal emulation, custom mobile keyboards, and WebSocket client. See [[Frontend]] for component architecture.
2. **Backend**: Express server with node-pty for shell process management and WebSocket server. Handles tunneling via ngrok.

## Code Documentation Standards

- JSDoc comments for all exported functions
- Inline comments for complex logic
- Type annotations for all function parameters
- README sections for each major module
