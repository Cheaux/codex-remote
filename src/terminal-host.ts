import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { RemoteError } from './errors.js';
const execute = promisify(execFile);
export async function terminalHost(args: string[], optional = false) {
  try {
    const result = await execute(process.env.CODEX_TERMINAL_BIN || 'codex-terminal', args, { env: process.env, timeout: 15000 });
    return JSON.parse(result.stdout);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT' && optional) return { available: false, registered: false };
    throw new RemoteError('terminal_host_unavailable', 'Install Codex Terminal Extensions for /qr, then run codex-remote terminal enable. CLI and conversational pairing work independently.');
  }
}
export async function registerTerminal(optional = false) {
  return terminalHost(['register', fileURLToPath(new URL('../terminal-extension.json', import.meta.url))], optional);
}
