import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { isAbsolute } from 'node:path';
import { z } from 'zod';
import { RemoteError } from './errors.js';

const execute = promisify(execFile);
const daemonSchema = z.object({
  status: z.enum(['running', 'notRunning', 'started', 'alreadyRunning']),
  socketPath: z.string().refine(isAbsolute, 'Expected an absolute local socket path'),
  cliVersion: z.string().optional(), appServerVersion: z.string().optional(),
});
export type DaemonInfo = z.infer<typeof daemonSchema>;
export interface NativeHost { version(): Promise<DaemonInfo>; start(): Promise<DaemonInfo>; }
export type Runner = (file: string, args: string[]) => Promise<string>;

export function parseDaemonOutput(stdout: string): DaemonInfo {
  // Native lifecycle commands may include JSON diagnostic lines before their final result.
  const line = stdout.trim().split('\n').filter(Boolean).at(-1);
  try { return daemonSchema.parse(JSON.parse(line || '')); }
  catch { throw new RemoteError('unsupported_codex', 'Codex returned an unsupported daemon response. Codex Remote requires the native managed app-server interface (tested with 0.163.0).'); }
}

export class CodexHost implements NativeHost {
  constructor(readonly executable = process.env.CODEX_REMOTE_CODEX_BIN || 'codex', readonly runner: Runner = async (file, args) => {
    const result = await execute(file, args, { encoding: 'utf8', env: process.env, timeout: 45000, maxBuffer: 1024 * 1024 });
    return result.stdout;
  }) {}
  private async command(action: 'version' | 'start') {
    try { return parseDaemonOutput(await this.runner(this.executable, ['app-server', 'daemon', action])); }
    catch (error) {
      if (error instanceof RemoteError) throw error;
      // Never include arbitrary native stderr: it may contain private account/configuration data.
      const code = (error as NodeJS.ErrnoException)?.code;
      throw new RemoteError('native_command_failed', code === 'ENOENT'
        ? 'Codex executable not found. Install Codex or set CODEX_REMOTE_CODEX_BIN.'
        : `Could not ${action === 'version' ? 'inspect' : 'start'} the Codex daemon. Check codex app-server daemon version and ChatGPT login. No restart was attempted.`);
    }
  }
  version() { return this.command('version'); }
  start() { return this.command('start'); }
}
