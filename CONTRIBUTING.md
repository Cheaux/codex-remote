# Contributing and maintaining Codex Remote

Use this repository for Remote changes. The separate Codex Folders project is not required for core development.

## Make a change

Install Node 24+ and Git, then clone and create a branch:

```sh
git clone https://github.com/Cheaux/codex-remote.git
cd codex-remote
git switch -c fix/describe-your-change
npm ci
```

Edit files locally, then check your work:

```sh
npm run check
npm test
npm run test:package
```

The core tests use an isolated native-protocol fixture and do not need a ChatGPT account or an active Codex daemon. The optional `/qr` integration test is skipped when a built sibling `../codex-terminal-extensions` (or `CODEX_TERMINAL_TEST_ROOT`) checkout is absent. CI checks out the published host and runs this integration independently of Folders. Do not report a skip as a successful launcher test.

The package smoke builds and installs a temporary release archive, checks hidden plugin manifests and installation arguments, and starts its MCP server to list the six tools. It never enables native access.

Review and submit the change:

```sh
git diff
git add PATHS_YOU_CHANGED
git commit -m "Describe the change"
git push -u origin HEAD
gh pr create
```

Replace `PATHS_YOU_CHANGED` with actual file names. Contributors without write access should fork the repository first. The maintainer reviews the pull request and merges it after CI passes.

This is one public repository. Local edits remain on your computer until pushed. **All pushed branches and pull requests are public.** Users installing a numbered release keep that version until they choose to update; merging code does not update their installations.

## Preserve active sessions

- Use the existing local socket RPCs for persistent remote enable/disable operations.
- Never use daemon stop/restart or the native daemon enable/disable CLI toggles as implementation shortcuts. In the tested native version, those toggles restart the server.
- Do not revoke a real device or disable a real connection as a test.
- Use a temporary `CODEX_HOME` for native plugin-registration smoke tests. Do not copy real account credentials into it.
- Keep QR tokens, native credentials, conversation identifiers, and local diagnostic recordings out of commits and issue reports.

## Documentation

The README is the quick start. The GitHub Pages guide lives in `docs/`, uses Jekyll's Minimal theme, and is built by the Documentation workflow. Pages contain static HTML, page descriptions, canonical URLs, and a sitemap.

The Documentation workflow builds proposed documentation on pull requests and deploys changes merged to `main`. Keep all project links under `/codex-remote/`. Real QR credentials must never appear in documentation; the demo image deliberately uses example.com.

## Publish a release — maintainer

1. Merge the release changes into `main` after CI passes.
2. Set the new version in `package.json`, the lockfile, the plugin manifest, and confirm the CLI/MCP version from `src/version.ts`, which reads package metadata. The package smoke catches a mismatched CLI or plugin version.
3. Update the versioned installation URL in the README, `docs/install.md`, and `docs/_config.yml`. Replace `RELEASE_NOTES.md` with the notes for this version and add a dated entry to `CHANGELOG.md`.
4. Run all three checks above. Review the staged files and release notes, commit the release preparation, and push it to `main`.
5. Tag the release and push the tag. For the initial release:

```sh
git switch main
git pull --ff-only
git tag -a v0.2.0 -m "Codex Remote v0.2.0"
git push origin v0.2.0
```

For later releases, substitute the new version. The Release workflow verifies the tag, runs checks, builds the installable `.tgz`, creates `SHA256SUMS`, and publishes the GitHub release. No npm registry token is required. If a workflow fails, inspect its logs before retrying; never overwrite a published version with different code.

After publication, download the archive from GitHub and test the documented installation in an isolated environment. Confirm the documentation deployment is green and its download links work. Users can verify a downloaded archive with `sha256sum -c SHA256SUMS` when both release files are in the same directory.

## Discovery after launch

Keep compatibility claims, screenshots, release notes, repository topics, and FAQ answers accurate. Relevant topics and genuinely useful documentation help people find and evaluate the project; search indexing and AI recommendations are not guaranteed.

For Google Search Console, the owner can verify the documentation URL prefix and submit `https://cheaux.github.io/codex-remote/sitemap.xml`. This requires the owner's Google account and is separate from publishing the site. Crawl rules apply at `https://cheaux.github.io/robots.txt`; a robots.txt inside the project subdirectory does not control the host.

An official ChatGPT/Codex directory listing is a separate process. [OpenAI's current local-MCP submission instructions](https://developers.openai.com/plugins/deploy/desktop-only) require organization allowlisting through an OpenAI representative, plus review. A GitHub release does not constitute directory approval. Do not claim approval or guaranteed placement.
