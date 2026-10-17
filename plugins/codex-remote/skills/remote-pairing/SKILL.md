---
name: remote-pairing
description: Show a QR for pairing ChatGPT on Android or iPhone with terminal Codex, check phone connections, and manage this host's remote access. Use for Codex remote session pairing, not QR codes for unrelated URLs or general remote desktop software.
---

Use the Codex Remote MCP tools for native phone access. Asking to show the remote pairing QR authorizes `remote_pair`, which enables persistent remote access if necessary and returns the QR image, `qrText`, link, manual code, and expiration. Present the returned image where supported. For terminal conversation responses, reproduce `qrText` exactly inside a fenced code block, preserving spaces and line breaks, then show the pairing link and expiration. Do not regenerate the QR with an image tool. Never invent a pairing code or claim that issuing one proves pairing succeeded.

For an existing connection, use `remote_status` or `remote_devices_list`; do not issue a new QR unless requested. A connected relay and a paired phone are different states. The user scans with Android or iPhone, then completes ChatGPT's same-account/workspace setup. Confirm pairing from the native device list or the user's successful phone interaction. Reissue an expired code only when requested.

`remote_enable` persists access until `remote_disable` is requested. Disabling disconnects phone clients but keeps local sessions and pairings. Revoke only an explicitly chosen device using its exact `client_id` from `remote_devices_list`. Do not disable access or revoke a device as a diagnostic test.

If the MCP tools are unavailable, use `codex-remote qr` in the shell for a pairing request, or the corresponding CLI command for status/device management. In a Codex Folders terminal launcher, typing `/qr` and Enter opens the QR display; Enter returns to the retained chat. A new terminal is needed after installing or updating that launcher. Native Codex plugins do not register arbitrary built-in slash commands, so do not claim `/qr` works without the launcher.

Never substitute `codex remote-control start/stop`, daemon stop/restart, or daemon enable/disable commands for the plugin tools. In Codex 0.163.0, the daemon CLI toggles restart active sessions. This plugin uses local socket RPCs with `ephemeral: false` instead. Report native authentication/policy/version errors without restarting the daemon or altering credentials. Do not copy native tokens, pairings, or threads into plugin storage.
