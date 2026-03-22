# Backend Architecture

Node.js + Express server managing PTY processes and WebSocket connections.

## Core Components

### PTY Manager
Manages shell process lifecycle using node-pty:
- Spawns zsh/bash processes per session
- Handles resize events from frontend
- Cleans up zombie processes on disconnect
- Supports multiple concurrent sessions

### WebSocket Handler
Bidirectional communication bridge:
- Receives keystrokes from frontend
- Streams terminal output back in real-time
- Heartbeat mechanism for connection health
- Automatic reconnection support

### Session Manager
Tracks active terminal sessions with unique IDs, timeout-based cleanup, and resource limits.

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | /health | Server health check |
| POST | /session | Create new terminal session |
| DELETE | /session/:id | Terminate session |
| WS | /terminal/:id | WebSocket terminal stream |

All endpoints protected by session-based auth. See [[Infrastructure]] for tunneling and auth details.
