import { createServer } from 'node:http';
import { mkdtemp, rm, writeFile, chmod } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import type { TestContext } from 'node:test';
import { WebSocketServer } from 'ws';
import { RemoteService, type NativeRemote, type RemoteDevice } from '../src/service.js';
import { SocketRpc } from '../src/rpc.js';
import { CodexHost } from '../src/native.js';

export const device = (clientId: string): RemoteDevice => ({ clientId, displayName: `Phone ${clientId}`, deviceType: 'phone', platform: 'android', osVersion: null, deviceModel: null, appVersion: null, lastSeenAt: 1700000000 });
export async function fixture(t: TestContext, initial: NativeRemote['status'] = 'connected') {
  const root = await mkdtemp(join(tmpdir(), 'codex-remote-test-')); const socketPath = join(root, 's.sock');
  const http = createServer(); const wss = new WebSocketServer({ server: http });
  const state = {
    remote: { status: initial, serverName: 'Test host', installationId: 'install-test', environmentId: 'env-test' } as NativeRemote,
    devices: [device('phone-one')], pageSize: 100, repeatCursor: false,
    expiresAt: Math.floor(Date.now() / 1000) + 600, pairingCode: 'FAKE + / ? token',
    running: true, persisted: initial !== 'disabled', calls: [] as Array<{ method: string; params: any }>,
    commands: [] as string[][], errors: new Map<string, { code: number; message: string }>(),
    drop: '', hang: '', malformed: '', invalid: '',
  };
  wss.on('connection', socket => socket.on('message', bytes => {
    const m = JSON.parse(bytes.toString()); state.calls.push(m);
    if (m.id === undefined) return;
    if (state.drop === m.method) { socket.terminate(); return; }
    if (state.hang === m.method) return;
    if (state.malformed === m.method) { socket.send('INVALID JSON'); return; }
    const send = (result: unknown) => socket.send(JSON.stringify({ id: m.id, result }));
    const error = state.errors.get(m.method); if (error) { socket.send(JSON.stringify({ id: m.id, error })); return; }
    if (state.invalid === m.method) { send({ status: 123 }); return; }
    switch (m.method) {
      case 'initialize': send({ userAgent: 'native-test' }); break;
      case 'remoteControl/status/read':
        socket.send(JSON.stringify({ method: 'remoteControl/status/changed', params: state.remote })); send(state.remote); break;
      case 'remoteControl/enable': state.remote.status = 'connected'; state.persisted = !m.params.ephemeral; send(state.remote); break;
      case 'remoteControl/disable': state.remote.status = 'disabled'; state.persisted = m.params.ephemeral; send(state.remote); break;
      case 'remoteControl/pairing/start': send({ pairingCode: state.pairingCode, manualPairingCode: '1234-5678', environmentId: 'env-test', expiresAt: state.expiresAt }); break;
      case 'remoteControl/client/list': {
        const start = Number(m.params.cursor || 0), end = start + state.pageSize;
        send({ data: state.devices.slice(start, end), nextCursor: state.repeatCursor ? '1' : end < state.devices.length ? String(end) : null }); break;
      }
      case 'remoteControl/client/revoke': state.devices = state.devices.filter(d => d.clientId !== m.params.clientId); send({}); break;
      default: socket.send(JSON.stringify({ id: m.id, error: { code: -32601, message: 'Unknown method' } }));
    }
  }));
  await new Promise<void>(resolve => http.listen(socketPath, resolve));
  t.after(async () => {
    for (const socket of wss.clients) socket.terminate();
    await new Promise<void>(resolve => wss.close(() => resolve()));
    await new Promise<void>(resolve => http.close(() => resolve()));
    await rm(root, { force: true, recursive: true });
  });
  const info = () => ({ status: state.running ? 'running' as const : 'notRunning' as const, socketPath, cliVersion: '0.163.0', appServerVersion: '0.163.0' });
  const host = new CodexHost('fixture-codex', async (_file, args) => {
    state.commands.push(args);
    if (args.join(' ') === 'app-server daemon start') state.running = true;
    else if (args.join(' ') !== 'app-server daemon version') throw Error(`Unsafe native command: ${args.join(' ')}`);
    return JSON.stringify(info());
  });
  const service = new RemoteService(host, path => SocketRpc.connect(path, 300), 10);
  const nativeStub = join(root, 'codex');
  await writeFile(nativeStub, `#!/usr/bin/env node\nconst args=process.argv.slice(2); if(args.join(' ')!=='app-server daemon version'){process.exit(9)};console.log(${JSON.stringify(JSON.stringify(info()))});\n`);
  await chmod(nativeStub, 0o755);
  return { state, service, root, socketPath, nativeStub };
}
