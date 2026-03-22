# Security Policy

## Reporting a Vulnerability

**Do NOT open a public GitHub issue for security vulnerabilities.**

### How to report

1. **GitHub Security Advisory** (preferred): [Create a private advisory](https://github.com/brain-tree-dev/brain-tree-os/security/advisories/new)
2. **Email**: dev@brain-tree.ai

### What to include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)

### Response timeline

- **48 hours**: We will acknowledge receipt of your report
- **7 days**: We will triage and provide an initial assessment
- **30 days**: We aim to release a fix for confirmed vulnerabilities

## Scope

BrainTree OS runs entirely locally on your machine. The primary security concerns are:

- Local file access (the server reads/writes files on your filesystem)
- WebSocket connections (localhost only)
- CLI command execution

**In scope:**

- Path traversal vulnerabilities (reading files outside brain directories)
- WebSocket injection or hijacking
- Arbitrary code execution through crafted brain files
- Dependencies with known CVEs

**Out of scope:**

- Issues requiring physical access to the host machine
- Social engineering attacks
- Vulnerabilities in outdated versions (please update first)

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest  | Yes       |

## Recognition

We appreciate responsible disclosure. With your permission, we will credit you in the release notes.
