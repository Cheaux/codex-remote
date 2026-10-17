---
title: Control Codex CLI from your phone
description: Connect terminal Codex on Linux to the official ChatGPT app. Install Codex Remote, scan a QR, and continue an existing chat from Android.
permalink: /
---
{% include nav.html %}

# Use Codex CLI from your phone

**Codex Remote connects terminal Codex on your Linux PC to the official ChatGPT phone app.** Pair with a QR code, continue an existing chat, and manage remote devices from your terminal or by asking Codex.

It is a community plugin by [Cheaux](https://github.com/Cheaux), using Codex's native remote service and your existing ChatGPT account. OpenAI does not maintain or endorse this project.

**[Install Codex Remote]({{ '/install/' | relative_url }})** · [Download the release](https://github.com/Cheaux/codex-remote/releases/latest) · [View the source](https://github.com/Cheaux/codex-remote)

![Illustration of terminal pairing with a demonstration QR, not a real credential.]({{ '/assets/pairing-demo.svg' | relative_url }})

## What you need

- A Linux PC with Node.js 24+ and Codex CLI signed in with ChatGPT.
- The official ChatGPT phone app, signed into the same account and workspace.
- Your PC awake, online, and running Codex's managed server while you connect remotely.

Codex 0.163.0 is the tested native version. Account and workspace policies still apply.

## Three steps to a phone connection

1. **[Install the release]({{ '/install/' | relative_url }})** and register its Codex plugin.
2. Run **`codex-remote qr`** on your PC, scan it with your phone, and finish setup in ChatGPT.
3. Check **`codex-remote status`**, then continue your existing chat from your phone.

After opening a new Codex terminal to load the plugin, you can also ask:

> Show the QR for remote session pairing.

The plugin preserves local sessions and existing pairings. There is no separate API key, additional remote server, or new public listener. Remote access stays enabled until you explicitly disable it.

## What has been tested?

Android pairing and continuing an existing conversation were verified on a real phone. iPhone uses the same native pairing link, but its end-to-end check is pending. New mobile chat creation, approvals, and steering also need further verification.

This release supports Linux hosts. The native APIs are experimental; macOS and Windows hosts are not supported by this release. [Detailed compatibility and answers]({{ '/faq/' | relative_url }})

## Does this add `/qr` to Codex?

The standalone plugin provides conversational pairing and the `codex-remote` command. `/qr` autocomplete is supplied by the separate Codex Folders terminal launcher. It is optional and is not included in this download.

## Need help?

Start with [troubleshooting]({{ '/troubleshooting/' | relative_url }}), the [command reference]({{ '/commands/' | relative_url }}), or [open an issue](https://github.com/Cheaux/codex-remote/issues/new/choose). Do not include real QR codes or pairing links in public reports.
