---
title: Codex Remote commands and MCP tools
description: Reference for QR pairing, persistent remote access, device revocation, JSON output, environment variables, lifecycle, and privacy.
permalink: /commands/
---
{% include nav.html %}

# Commands and MCP tools

Run these commands in a regular PC terminal. Use `codex-remote --help` for the installed version's help.

| Command | Behavior |
| --- | --- |
| `codex-remote status` | Inspect relay connectivity and paired devices without enabling access. |
| `codex-remote qr` | Enable persistent access if needed, then show a fresh pairing QR, link, manual code, and expiration. |
| `codex-remote pair` | Alias for `qr`. |
| `codex-remote enable` | Persistently enable native remote access. Starts the managed server if absent. |
| `codex-remote disable` | Persistently disable remote access without restarting local sessions or removing pairings. |
| `codex-remote devices list` | List paired devices and their exact IDs. |
| `codex-remote devices revoke DEVICE_ID` | Revoke the selected device on this host. |
| `codex-remote install` | Register the packaged local marketplace and plugin with Codex. |
| `codex-remote terminal enable` | Register `/qr` and enable the shared terminal host. |
| `codex-remote terminal disable` | Unregister only Remote; keep other extensions. |
| `codex-remote terminal status` | Inspect host and registration state. |
| `codex-remote serve` | Run the plugin's MCP server over stdio; normally launched by Codex. |
| `codex-remote --version` | Print the installed CLI version. |

## JSON and interactive output

Operational commands accept `--json`:

```sh
codex-remote status --json
codex-remote devices list --json
```

Errors return a nonzero exit status. JSON mode includes an `error` with a code and message. The pairing response contains short-lived credentials; avoid sending it to public logs.

`qr --interactive` and `pair --interactive` require a real terminal and cannot be combined with `--json`. **D** shows details; **Enter**, **Escape**, or **Ctrl+C** exits the display.

## Conversational tools

| MCP tool | Intended use |
| --- | --- |
| `remote_status` | Check connectivity and pairing status. |
| `remote_pair` | Request native pairing and return a QR image, exact terminal QR text, link, manual code, and expiry. |
| `remote_enable` | Enable persistent access. |
| `remote_disable` | Disable remote access when requested. |
| `remote_devices_list` | Inspect paired devices. |
| `remote_device_revoke` | Revoke the explicitly selected device by its `client_id`. |

Examples: **“Show the QR for remote session pairing”**, **“Check my paired devices”**, or **“Disable remote access on this PC.”** The pairing skill guides Codex to distinguish issuing a code from successfully pairing a phone.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `CODEX_HOME` | Use the selected native Codex home, including its configuration and pairings. |
| `CODEX_REMOTE_CODEX_BIN` | Select a specific native Codex executable instead of resolving `codex` on PATH. |

CLI installation does not automatically install the plugin into every Codex home. Run `codex-remote install` with the same `CODEX_HOME` you use for the intended conversations.

## Lifecycle and privacy

The plugin controls the existing managed Codex daemon through its local Unix WebSocket. Persistent enable/disable operations call `remoteControl/enable` or `remoteControl/disable` with `ephemeral: false`.

In Codex 0.163.0, similarly named native daemon CLI toggles perform a stop/start. This plugin does not invoke those toggles, daemon restart, or daemon stop. It uses native `app-server daemon start` only for an explicit enable/pairing request when a server is absent.

If the daemon is absent, `disable` reports that it cannot change the saved preference rather than claiming success. It does not start the daemon to disable it. Separately started `--no-daemon` sessions are not migrated into the shared server.

Remote access remains enabled until explicitly disabled. Disabling preserves pairings; revoking removes a selected device; uninstalling alone preserves native remote settings. These are separate operations.

Codex Remote does not save pairing credentials, copy conversations, add analytics, open another network listener, or operate its own relay. Native Codex and ChatGPT services handle the remote connection and their own data practices still apply.

Official references: [Codex app-server](https://learn.chatgpt.com/docs/app-server) and [remote connections](https://learn.chatgpt.com/docs/remote-connections).
