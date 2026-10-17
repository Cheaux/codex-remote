---
title: Codex phone control FAQ and compatibility
description: Answers about using ChatGPT mobile with Codex CLI, Android and iPhone testing, desktop app requirements, remote access, and optional slash commands.
permalink: /faq/
---
{% include nav.html %}

# Codex phone control FAQ

## Can I use Codex CLI from the ChatGPT phone app?

Codex Remote exposes Codex's native remote pairing from terminal Codex on your computer. Install the plugin, generate a QR, and finish setup in the official ChatGPT phone app with the same account and workspace. Android pairing and continuing an existing chat were verified on a Linux host. [Get started]({{ '/install/' | relative_url }})

## Do I need the Codex desktop app?

The tested Linux workflow uses native terminal Codex and its managed app-server. The Codex desktop app is not required for this plugin's pairing workflow.

## Does it work on Android and iPhone?

Android pairing and existing-chat messaging were verified on a real phone. iPhone uses the same native pairing URL, but end-to-end iPhone verification is pending. Do not interpret protocol compatibility as a completed device test.

## Can I create new chats, approve actions, or steer a running task from my phone?

Those capabilities depend on the native Codex/ChatGPT mobile experience. This project's live checks confirmed continuation of an existing chat; they did not establish new mobile chat creation, mobile approvals, or active-task steering. These remain unverified.

## Can I use a Windows or Mac PC?

The project targets any OS where native Codex provides the required managed-server remote interface. Linux has been verified; Windows and macOS are currently untested, so compatibility is not yet confirmed. The installation guide includes Bash/Zsh and PowerShell commands. The phone's operating system is a separate compatibility question.

## Is this an official OpenAI plugin?

No. This is a community MIT-licensed project maintained by [Cheaux](https://github.com/Cheaux). It uses native Codex functionality; OpenAI does not maintain or endorse the plugin. A public GitHub release does not mean it has been approved for OpenAI's plugin directory.

## Does it need an API key, tunnel, or port forwarding?

It uses your existing native ChatGPT login and Codex remote service. There is no separate plugin API key, tunnel, or new network listener. Account/workspace restrictions still apply.

## Does pairing restart my current Codex conversations?

The plugin uses the existing daemon's socket APIs and does not restart it. An explicit pairing or enable request can start the managed server if none exists. Open a new Codex terminal to load newly installed MCP tools while leaving existing chats running.

## Does `/qr` require Codex Folders?

No. Remote registers `/qr` with the shared [Codex Terminal Extensions](https://github.com/Cheaux/codex-terminal-extensions) host. Folders independently registers its own commands with the same host. Install the host once, run `codex-remote terminal enable`, and open a new Codex terminal. CLI and conversational pairing do not need the host.

## Does closing the terminal QR display turn off access?

No. Remote access persists until `codex-remote disable`. Closing the display, generating a fresh QR, or uninstalling the plugin does not revoke existing devices. The PC and managed server must remain available for a remote connection.

## Does the plugin save or copy my chats?

It does not copy conversations or save pairing credentials. Codex and ChatGPT retain their native data and connection handling. [Lifecycle and privacy]({{ '/commands/' | relative_url }}#lifecycle-and-privacy)

## Is there a subscription requirement?

Native Codex and ChatGPT determine account eligibility and workspace policy. This plugin does not sell or grant access, and cannot bypass restrictions. Check the current official [remote connection guidance](https://learn.chatgpt.com/docs/remote-connections) for your account.
