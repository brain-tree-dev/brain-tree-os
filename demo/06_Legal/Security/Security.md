# Security Policy

Security practices and vulnerability disclosure for clsh.dev.

## Security Posture

All vulnerabilities from the security audit have been resolved:
- Command injection: Fixed (input sanitization)
- XSS via terminal output: Fixed (output encoding)
- Authentication bypass: Fixed (token validation)
- Rate limiting: Implemented on all endpoints

## Vulnerability Disclosure

### Reporting
Email security@clsh.dev with description, reproduction steps, and impact assessment.

### Response Timeline
- Acknowledgment: 48 hours
- Assessment: 7 days
- Fix: 30 days for critical/high

## Security Architecture

- HTTPS via ngrok tunnels
- Session-based auth (no persistent credentials)
- Input sanitization on all endpoints
- Rate limiting (100 req/min/IP)
- Content Security Policy headers
- No third-party scripts or trackers

Data handling practices documented in [[Privacy]].
