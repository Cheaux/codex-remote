---
title: Fix Codex Remote installation and phone pairing
description: Troubleshoot command not found, missing plugin tools, expired pairing codes, workspace restrictions, and disconnected Codex phone sessions.
permalink: /troubleshooting/
---
{% include nav.html %}

# Troubleshooting Codex Remote

Start by checking `codex-remote --version`, `codex --version`, `codex-remote status`, and `codex-remote devices list`. Keep account details and pairing credentials out of public reports.

## Command not found

If `codex-remote` is missing, check that installation succeeded and your shell can find the user installation directory:

```sh
export PATH="$HOME/.local/bin:$PATH"
codex-remote --version
```

For future terminals, add that export line once to `~/.zshrc` for Zsh or `~/.bashrc` for Bash. The [installation guide]({{ '/install/' | relative_url }}) uses `--prefix "$HOME/.local"`, so the executable is placed in `~/.local/bin`.

For the Windows default-prefix installation, run `npm prefix --global` and check that directory is on PATH, then reopen PowerShell. macOS and Windows have not yet been verified end to end; the required native Codex interface must be available on the host.

If `codex` itself is missing, install the official CLI and make it available on PATH. `CODEX_REMOTE_CODEX_BIN` can select a particular executable when needed.

## Codex cannot find the conversational tools

Run `codex-remote install`, then open a **new Codex terminal**. Already running conversations may keep the plugin set they loaded at startup. You can leave those conversations running.

If you use a custom `CODEX_HOME`, use the same value during plugin installation and when opening Codex. Also ensure the Codex process can find `codex-remote` on PATH.

## npm reports EALLOWREMOTE

npm 12 blocks direct tarball-URL installs by default. Use the current [installation commands]({{ '/install/' | relative_url }}): download the release with curl, PowerShell, or your browser, then pass the local `.tgz` file to `npm install`. No global npm configuration change is needed. [npm's allow-remote setting](https://docs.npmjs.com/cli/using-npm/config/#allow-remote)

## `/qr` is missing from autocomplete

Install [Codex Terminal Extensions](https://github.com/Cheaux/codex-terminal-extensions), run `codex-remote terminal enable`, and open a new Codex terminal. Check `codex-terminal status --json` for the `codex-remote` registration and `/qr`. Folders is not required. The current terminal host supports Linux/macOS; Windows needs another backend.

Use `codex-remote qr` in a regular terminal or ask Codex **“Show the QR for remote session pairing.”** Neither route requires Folders.

## The QR cannot be scanned or has expired

Enlarge the terminal, use the printed pairing link on your phone, or use the provided manual-code option in ChatGPT's pairing flow. Generate a fresh QR with `codex-remote qr` if the old one expired. In interactive mode, press **D** to see the link and manual code.

Real QR codes from this plugin carry short-lived pairing credentials. Do not post screenshots containing them in an issue. The documentation's demonstration QR cannot pair a real session.

## The host is connected but the phone is not paired

Relay connectivity and device pairing are different. Check `codex-remote devices list`, finish the phone setup flow, and verify that Codex and ChatGPT use the same account and workspace. A saved device entry alone does not mean that device is currently online.

## Login, workspace policy, or unsupported API error

Confirm that native Codex is signed in with ChatGPT. An API-key-only login does not replace the native ChatGPT pairing flow. Workspace policies may require administrator changes; the plugin cannot override them.

The native interface is experimental and was tested with Codex 0.163.0. If another version returns an unsupported response, report the version and sanitized error. Do not try daemon restart or enable/disable CLI toggles as a workaround for this plugin's errors.

## My phone lost access

Keep the PC awake and online. Check the relay status and paired devices. If access is disabled and you want it restored, run `codex-remote enable`. You do not need a new QR merely to inspect a connection.

If your conversation was started with `--no-daemon`, it is outside the shared managed server. The plugin does not move its running process into that server.

## Disable reports that no daemon is running

The plugin cannot persist a changed preference through the socket when no server exists, and will not claim it did. Do not confuse that error with a successful persistent disable. When you next intentionally run the managed server, use `codex-remote disable` to persist the setting.

## Get help

[Open an issue](https://github.com/Cheaux/codex-remote/issues/new/choose) with your computer OS, Node/Codex/Remote versions, phone OS, reproduction steps, and sanitized error. Do not include authentication files, pairing links, real QR codes, or private conversation content.
