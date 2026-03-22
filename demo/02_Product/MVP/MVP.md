# MVP Scope

Minimum viable product for clsh.dev.

## In Scope

### Must Have
- [x] Real terminal via xterm.js + node-pty
- [x] Mobile-optimized custom keyboard overlay
- [x] `npx clsh` one-command setup
- [x] QR code for phone connection
- [x] WebSocket-based real-time I/O
- [x] Session-based authentication
- [x] ngrok tunneling (zero config)

### Should Have
- [x] Multiple keyboard modes (letters, numbers, symbols, shortcuts)
- [x] Swipe gestures for cursor and history
- [x] Connection status indicator
- [x] Dark theme
- [x] Automatic reconnection

## Out of Scope (v2+)
- [ ] Multi-user access and permissions
- [ ] Cloud-hosted machines
- [ ] Persistent sessions across restarts
- [ ] Custom themes and layouts

## Success Criteria

1. Developer can access their Mac terminal from phone in under 30 seconds
2. Common operations (ls, cd, git, npm) feel natural on mobile
3. Session stays stable for at least 30 minutes of active use

See [[Features]] for detailed feature tracking.
