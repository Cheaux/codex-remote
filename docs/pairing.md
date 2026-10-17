---
title: Pair ChatGPT on your phone with terminal Codex
description: Generate a Codex pairing QR, scan it in the phone setup flow, confirm a paired device, and handle expired codes without restarting chats.
permalink: /pairing/
---
{% include nav.html %}

# Pair ChatGPT on your phone with terminal Codex

First [install Codex Remote]({{ '/install/' | relative_url }}). Keep your computer awake and online during pairing and remote use.

## Show a pairing QR

In a regular PC terminal, run:

```sh
codex-remote qr
```

Or, in a new Codex conversation with the plugin loaded, ask:

> Show the QR for remote session pairing.

Both routes request a native, short-lived pairing code. The CLI displays a terminal QR and link; the conversational tool returns a QR image plus text QR for terminal replies. A manual code and expiration are also provided.

Requesting the QR enables persistent remote access if needed. It does not remove already paired devices or restart active chats.

## Finish setup on your phone

1. Scan the QR with your phone camera and open the link, or open the printed pairing URL on your phone.
2. Follow the ChatGPT setup flow using the same account and workspace as your PC's Codex login.
3. On the PC, run `codex-remote status` and `codex-remote devices list`.
4. Open an existing conversation from the connected host on your phone and send a message to confirm the complete path works.

Phone UI labels can vary with app versions. Android pairing and continuation were verified. iPhone uses the same native link, but end-to-end verification is pending.

## Check an existing connection

```sh
codex-remote status
codex-remote devices list
```

`status` distinguishes the host's relay connection from its paired-device list. A connected relay by itself does not prove that your phone completed pairing. Conversely, a saved paired device may be offline.

For conversational checks, ask **“Check my remote connection and paired devices.”** A check does not need a fresh pairing code.

## If the code expires

Run `codex-remote qr` again when you are ready to scan. Use the new link or QR and its expiration. Pairing credentials are not saved by this plugin; expired ones should not be reused.

Keep real QR codes, pairing links, and manual codes private. The image in this documentation uses demonstration data, not a usable pairing credential.

## Optional terminal view

`codex-remote qr --interactive` opens a terminal view. **D** toggles link/manual-code details. **Enter**, **Escape**, or **Ctrl+C** exits the display. Exiting the display does not disable remote access.

The separate Codex Folders terminal launcher uses this view for its `/qr` shortcut and autocomplete. Its retained-view behavior belongs to that launcher; the standalone Remote download does not install it.

## Stop access or remove a device

Use `codex-remote disable` to disconnect remote clients while keeping local sessions and saved pairings. `codex-remote enable` turns access back on.

To remove one device, get its exact ID from `devices list`, then run `codex-remote devices revoke DEVICE_ID`, replacing the placeholder with that ID. [Command reference]({{ '/commands/' | relative_url }})
