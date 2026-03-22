# Architecture Decisions

Record of significant technical decisions made during clsh.dev development.

## ADR-001: xterm.js for Terminal Emulation
**Decision**: Use xterm.js over custom terminal rendering
**Rationale**: Battle-tested, extensive ANSI support, active maintenance, addons ecosystem
**Trade-offs**: Larger bundle size (~200KB) but significantly reduced development time

## ADR-002: node-pty for Shell Process Management
**Decision**: Use node-pty over child_process.spawn
**Rationale**: True PTY support needed for terminal applications (vim, htop, tmux)
**Trade-offs**: Native dependency requires build tools, but essential for real terminal experience

## ADR-003: ngrok over Custom Tunneling
**Decision**: Use ngrok for remote access tunneling
**Rationale**: Zero config for users, built-in HTTPS, reliable connections
**Trade-offs**: Third-party dependency, free tier limits. Acceptable for v1.

## ADR-004: WebSocket over HTTP Polling
**Decision**: WebSocket for terminal I/O
**Rationale**: Real-time bidirectional communication essential for terminal UX
**Trade-offs**: More complex connection management, but latency improvement is critical

## ADR-005: Custom Mobile Keyboard over Native
**Decision**: Build custom keyboard overlays replacing iOS/Android keyboards
**Rationale**: Native keyboards lack terminal-essential keys and workflows
**Trade-offs**: Significant development effort, but core differentiator. Key infrastructure detail documented in [[Infrastructure]].
