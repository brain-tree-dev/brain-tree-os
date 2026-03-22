# Security Audit

Pre-launch security review of the clsh.dev codebase.

## Summary

| Severity | Found | Fixed |
|----------|-------|-------|
| Critical | 2 | 2 |
| High | 3 | 3 |
| Medium | 4 | 4 |
| Low | 2 | 2 |

All identified vulnerabilities have been resolved.

## Critical Findings (Fixed)

### 1. Command Injection in PTY Spawn
- **Location**: [[Backend]] PTY Manager
- **Issue**: User-supplied shell arguments passed unsanitized to node-pty.spawn()
- **Fix**: Whitelist allowed shells, sanitize all arguments

### 2. WebSocket Authentication Bypass
- **Location**: Backend WebSocket Handler
- **Issue**: Token validation skipped on reconnection attempts
- **Fix**: Validate token on every WebSocket handshake

## High Findings (Fixed)

1. **XSS via terminal output**: Malicious ANSI sequences could inject HTML. Fixed with output sanitization.
2. **Missing rate limiting**: No limits on API endpoints. Added express-rate-limit middleware.
3. **Session fixation**: Session tokens predictable. Switched to crypto.randomUUID().

Security policies documented in [[Security]].
