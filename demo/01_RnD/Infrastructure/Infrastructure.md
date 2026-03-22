# Infrastructure

Tunneling, authentication, and deployment infrastructure for clsh.dev.

## ngrok Tunneling

The core connectivity layer. When a user runs `npx clsh`:

1. Express server starts on localhost
2. ngrok tunnel opens to expose the server
3. Public URL displayed + QR code generated
4. User opens URL on phone to connect

### Why ngrok?
- Zero config for end users
- Built-in HTTPS
- Stable URLs during session
- Free tier sufficient for personal use

## Authentication

Session-based auth (not user accounts):
1. Server generates session token on startup
2. Token embedded in tunnel URL as query parameter
3. Frontend validates token on WebSocket handshake
4. Invalid tokens rejected immediately

## Deployment Architecture

```
Phone Browser ──HTTPS──> ngrok tunnel ──localhost──> Express + node-pty
                                                         │
                                                    User's Mac (zsh)
```

Runs entirely on the user's machine. No cloud servers. CI/CD managed through [[DevOps]].
