Connect Codex CLI on your computer to the official ChatGPT phone app through Codex's native remote service.

### Install

Requires Node 24+ and Codex signed in with ChatGPT, on an OS exposing the required native managed-server remote interface. Linux with Codex 0.163.0 is verified; macOS, Windows, and other operating systems are untested. These commands use Bash/Zsh; see the installation guide for PowerShell commands.

```sh
export PATH="$HOME/.local/bin:$PATH"
npm install --global --prefix "$HOME/.local" --ignore-scripts \
  https://github.com/Cheaux/codex-remote/releases/download/v0.1.0/codex-remote-0.1.0.tgz
codex-remote install
codex-remote qr
```

Scan the QR and finish setup on your phone with the same account and workspace. Open a new Codex terminal to use “Show the QR for remote session pairing.” Keep your current sessions running.

### Included

QR pairing, remote status, persistent enable/disable, paired-device management, six MCP tools, and a conversational pairing skill. Access stays enabled until explicitly disabled. The separate Codex Folders launcher is needed only for `/qr` autocomplete.

### Verification and limitations

Android pairing and continuing an existing chat were verified on a real phone with a Linux host. iPhone, new mobile chats, approvals, and steering remain unverified. The native APIs are experimental; account/workspace policies apply. Other computer operating systems are untested and require a compatible native interface.

Download the `.tgz` asset below for installation. GitHub's automatic source ZIP does not include the built CLI. `SHA256SUMS` verifies the `.tgz` download.

[Installation guide](https://cheaux.github.io/codex-remote/install/) · [Troubleshooting](https://cheaux.github.io/codex-remote/troubleshooting/) · [Source and issues](https://github.com/Cheaux/codex-remote)
