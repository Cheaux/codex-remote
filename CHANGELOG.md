# Changelog

## 0.2.0 — 2026-10-17

- `/qr` now registers with Codex Terminal Extensions independently of Folders.
- Added terminal enable/disable/status commands; installation registers when the host is present.
- Native phone pairing, MCP tools, saved devices, and active sessions retain their existing behavior.
- Terminal integration tests now run against the shared host without a Folders checkout.

## 0.1.0 — 2026-10-17

Initial public release.

- Native ChatGPT phone pairing for terminal Codex on Linux.
- QR image, terminal QR, phone link, manual code, and expiration.
- Persistent remote access controls without restarting active sessions.
- Paired-device listing and selected-device revocation.
- Six MCP tools and a pairing skill for conversational access.
- Standalone CLI, built GitHub release archive, and installation guide.

Tested with Node 24+ and Codex 0.163.0. Android pairing and existing-chat messaging were verified. iPhone, new mobile chats, approvals, and active-task steering require further end-to-end verification. The optional `/qr` autocomplete integration belongs to the separate Codex Folders launcher.
