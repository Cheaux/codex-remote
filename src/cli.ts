import { parseArgs, stripVTControlCharacters } from 'node:util';
import { createInterface } from 'node:readline/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RemoteService, type Status } from './service.js';
import { RemoteError, errorResult } from './errors.js';
import { pairingTerminal } from './pairing.js';
import { showPairing } from './terminal.js';
import { serve } from './mcp.js';
import { version } from './version.js';
import { registerTerminal, terminalHost } from './terminal-host.js';

const execute = promisify(execFile);
const clean = (text: string) => stripVTControlCharacters(text).replace(/[\x00-\x08\x0b-\x1f\x7f-\x9f]/g, '');
const help = `Codex Remote ${version} — ChatGPT phone access to terminal Codex

codex-remote status [--json]           Check relay and paired devices
codex-remote enable [--json]           Enable access until explicitly disabled
codex-remote qr [--json]               Show a fresh pairing QR, link, and manual code
codex-remote pair [--json]             Alias for qr
codex-remote disable [--json]          Disable access; keep local sessions running
codex-remote devices list [--json]     List paired devices and their IDs
codex-remote devices revoke ID [--json] Revoke the chosen device
codex-remote install [--json]          Install the local Codex plugin
codex-remote terminal enable           Register /qr and enable the shared terminal host
codex-remote terminal disable          Remove /qr; preserve other terminal extensions
codex-remote terminal status           Inspect the shared terminal host
codex-remote serve                    Run its MCP server over stdio

After installing the plugin, ask Codex: "Show the QR for remote session pairing."
Codex Terminal Extensions adds /qr and autocomplete; Folders is not required.
QR requests enable access if needed. Scan with Android/iPhone and finish in ChatGPT.
No session copy, daemon restart, separate API key, or desktop app is required here.
CODEX_HOME is respected; CODEX_REMOTE_CODEX_BIN can select the native Codex binary.
`;

function printStatus(status: Status) {
  console.log(clean(`Remote access: ${status.status}${status.serverName ? ` on ${status.serverName}` : ''}`));
  console.log(status.pairedDevices === null ? 'Paired devices: not checked' : `Paired devices: ${status.pairedDevices}`);
  if (status.diagnostic) console.log(clean(status.diagnostic));
}

async function run() {
  const { values, positionals } = parseArgs({ allowPositionals: true, options: {
    json: { type: 'boolean' }, interactive: { type: 'boolean' }, help: { type: 'boolean', short: 'h' }, version: { type: 'boolean' },
  } });
  const [command = 'help', subcommand, id, ...extra] = positionals;
  if (values.version) { console.log(version); return; }
  if (values.help || command === 'help') { console.log(help); return; }
  const json = !!values.json;
  const print = (value: unknown) => console.log(JSON.stringify(value, null, 2));
  if (values.interactive && (json || !['qr', 'pair'].includes(command) || !process.stdin.isTTY)) throw new RemoteError('invalid_arguments', '--interactive requires a terminal and a human pairing display.');
  if (extra.length || (!['devices','terminal'].includes(command) && subcommand !== undefined)) throw new RemoteError('invalid_arguments', 'Unexpected arguments. Run codex-remote --help.');
  if (command === 'terminal') {
    if (id || !['enable','disable','status'].includes(subcommand || '')) throw new RemoteError('invalid_arguments', 'Use terminal enable, disable, or status.');
    if (subcommand === 'enable') { await registerTerminal(); print(await terminalHost(['enable'])); }
    else print(await terminalHost(subcommand === 'disable' ? ['unregister','codex-remote'] : ['status','--json']));
    return;
  }
  if (command === 'serve') { await serve(); return; }
  if (command === 'install') {
    const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
    const native = process.env.CODEX_REMOTE_CODEX_BIN || 'codex';
    await execute(native, ['plugin', 'marketplace', 'add', root, '--json'], { env: process.env, timeout: 45000 });
    const installed = await execute(native, ['plugin', 'add', 'codex-remote@codex-remote-local', '--json'], { env: process.env, timeout: 45000 });
    const terminal = await registerTerminal(true);
    const output = { installed: true, result: JSON.parse(installed.stdout), terminal, next: 'Start a new Codex terminal to load the plugin, then ask: "Show the QR for remote session pairing." Or run codex-remote qr directly. Keep existing sessions running. For /qr and autocomplete, install Codex Terminal Extensions and run codex-remote terminal enable. Folders is not required.' };
    if (json) print(output); else console.log(output.next);
    return;
  }
  const service = new RemoteService();
  if (['status', 'enable', 'disable'].includes(command)) {
    const status = await service[command as 'status' | 'enable' | 'disable']();
    if (json) print(status); else printStatus(status);
  } else if (['qr', 'pair'].includes(command)) {
    const pair = await service.qr();
    if (json) print(pair);
    else if (values.interactive) await showPairing(pair);
    else {
      console.log('Scan to pair this host with ChatGPT on Android or iPhone.\n');
      console.log(await pairingTerminal(pair));
      console.log(pair.pairingUrl);
      if (pair.manualPairingCode) console.log(clean(`Manual code: ${pair.manualPairingCode}`));
      console.log(`Expires: ${pair.expiresAtIso}\nExisting pairings are preserved. Remote access stays enabled until you disable it.`);
    }
  } else if (command === 'devices' && subcommand === 'list' && !id) {
    const result = await service.devices();
    if (json) print(result);
    else if (!result.devices.length) console.log('No paired devices. Run codex-remote qr to connect a phone.');
    else for (const device of result.devices) console.log(clean(`${device.clientId}  ${device.displayName || device.deviceModel || 'Unnamed device'}  ${device.platform || device.deviceType || ''}`));
  } else if (command === 'devices' && subcommand === 'revoke' && id) {
    const result = await service.revoke(id); if (json) print(result); else console.log(clean(`Revoked device ${result.clientId}. Local sessions are still running.`));
  } else throw new RemoteError('invalid_arguments', 'Unknown command or missing device ID. Run codex-remote --help.');
}

try { await run(); }
catch (error) {
  const result = errorResult(error);
  if (process.argv.includes('--json')) console.log(JSON.stringify({ error: result }));
  else process.stderr.write(`Codex Remote: ${clean(result.message)}\n`);
  process.exitCode = 1;
} finally {
  if (process.exitCode === 1 && process.argv.includes('--interactive') && !process.argv.includes('--json') && process.stdin.isTTY) {
    const prompt = createInterface({ input: process.stdin, output: process.stdout });
    try { await prompt.question('\nPress Enter to return to your Codex chat. '); } finally { prompt.close(); }
  }
}
