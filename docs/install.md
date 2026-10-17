---
title: Install Codex Remote on Linux
description: Install the built Codex Remote release without sudo, register its plugin, configure PATH, and pair the ChatGPT phone app.
permalink: /install/
---
{% include nav.html %}

# Install Codex Remote on Linux

These steps install the CLI into your user account and register its plugin with Codex. You do not need to build the source, create an API key, or install the separate Codex Folders launcher.

## 1. Check the requirements

Install [Node.js 24+ with npm](https://nodejs.org/en/download) and [Codex CLI](https://learn.chatgpt.com/docs/cli/). Sign Codex in with ChatGPT using your usual account. Check:

```sh
node --version
codex --version
```

Use a Linux PC. Codex **0.163.0** is the tested baseline; this plugin relies on its experimental native managed-server interface.

Install the official ChatGPT app on your phone and sign in with the same account and workspace. Some accounts or organizations may restrict remote access.

## 2. Install the built release

Run this in your regular PC terminal:

```sh
export PATH="$HOME/.local/bin:$PATH"
npm install --global --prefix "$HOME/.local" --ignore-scripts \
  {{ site.release_url }}
codex-remote install
```

No `sudo` is needed. The `.tgz` release already includes the built CLI and hidden plugin manifests. GitHub's automatic **Source code ZIP** is for development and does not include the built CLI.

The install command registers the bundled `codex-remote-local` marketplace and `codex-remote` plugin in your selected Codex home. It does not enable remote access or restart the server.

## 3. Pair your phone

```sh
codex-remote qr
```

Scan the QR or open the printed link on your phone, complete setup in ChatGPT, and then check:

```sh
codex-remote status
codex-remote devices list
```

Requesting a pairing code enables persistent remote access if needed. Access stays enabled until you run `codex-remote disable`. [Pairing walkthrough]({{ '/pairing/' | relative_url }})

## 4. Use it conversationally

Open a **new Codex terminal** so it loads the installed plugin. Keep existing conversations running. Ask:

> Show the QR for remote session pairing.

For an already paired phone, ask **“Check my remote connection”** to inspect status without generating another code.

## Make the command available in future terminals

If `codex-remote` is not found in a fresh terminal, put this line in the startup file for the shell you actually use:

```sh
export PATH="$HOME/.local/bin:$PATH"
```

For Zsh, edit `~/.zshrc`. For Bash, edit `~/.bashrc`. Add the line once, save, then open a new terminal. Also make sure `codex` remains available on PATH. [PATH troubleshooting]({{ '/troubleshooting/' | relative_url }}#command-not-found)

## Update

Copy the installation command from the [latest release](https://github.com/Cheaux/codex-remote/releases/latest), then run `codex-remote install` again. Open a new Codex terminal to load updated tools. Installed numbered releases do not update themselves.

## Uninstall

To turn off remote access as well as remove the plugin, first run:

```sh
codex-remote disable
```

Then remove the plugin, marketplace, and CLI:

```sh
codex plugin remove codex-remote@codex-remote-local
codex plugin marketplace remove codex-remote-local
npm uninstall --global --prefix "$HOME/.local" codex-remote
```

Uninstallation alone preserves native remote preferences and device pairings. Use `devices revoke DEVICE_ID` before uninstalling if you also want to remove a particular paired device.
