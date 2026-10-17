# Codex Remote: directory installation prerequisites

The ZIP is a draft for OpenAI directory review, not evidence of approval or publication. It packages a skill and the local MCP configuration.

Install Node 24+ and the official Codex CLI first. Before enabling this plugin, install the matching standalone CLI from the public release:

```sh
curl --fail --location --output codex-remote-0.2.1.tgz \
  https://github.com/Cheaux/codex-remote/releases/download/v0.2.1/codex-remote-0.2.1.tgz
npm install --global --prefix "$HOME/.local" --ignore-scripts ./codex-remote-0.2.1.tgz
export PATH="$HOME/.local/bin:$PATH"
```

The local MCP configuration runs `codex-remote serve` from PATH. Merely uploading this ZIP does not install the CLI or grant account access. Read the project README for native prerequisites and platform limits.

Existing Codex sessions and paired phones should remain running. Reviewers must use isolated test data/accounts; never ask for real pairing credentials.
