import WebSocket from 'ws';
import { isAbsolute } from 'node:path';
import { RemoteError } from './errors.js';

export interface Rpc { request(method: string, params?: unknown): Promise<unknown>; close(): void; }
type Pending = { resolve(value: unknown): void; reject(error: Error): void; timer: NodeJS.Timeout };

/** A metadata client of the existing daemon, never a second app-server process. */
export class SocketRpc implements Rpc {
  private pending = new Map<number, Pending>();
  private nextId = 0;
  private constructor(private socket: WebSocket, private timeoutMs: number) {
    socket.on('message', bytes => {
      let message: any;
      try { message = JSON.parse(bytes.toString()); }
      catch { this.fail(new RemoteError('protocol_error', 'Codex sent invalid JSON.')); this.close(); return; }
      if (!message || typeof message !== 'object') { this.fail(new RemoteError('protocol_error', 'Codex sent an invalid protocol message.')); this.close(); return; }
      if (message.method) {
        // This client never handles agent approvals or claims control of a thread.
        if (message.id !== undefined && socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ id: message.id, error: { code: -32601, message: 'Method not supported by Codex Remote metadata client' } }));
        return;
      }
      const pending = this.pending.get(message.id); if (!pending) return;
      clearTimeout(pending.timer); this.pending.delete(message.id);
      if (message.error) {
        const code = message.error.code;
        const text = typeof message.error.message === 'string' ? message.error.message : 'Native remote request failed';
        pending.reject(new RemoteError(code === -32601 ? 'unsupported_codex' : 'native_error',
          code === -32601 ? 'This Codex server does not support the requested remote-control method. No restart was attempted.' : text, typeof code === 'number' ? code : undefined));
      } else if ('result' in message) pending.resolve(message.result);
      else pending.reject(new RemoteError('protocol_error', 'Codex response has neither a result nor an error.'));
    });
    socket.on('close', () => this.fail(new RemoteError('disconnected', 'The Codex socket disconnected. Reconnect and check status; no daemon restart was attempted.')));
    socket.on('error', () => this.fail(new RemoteError('socket_error', 'Could not communicate with the local Codex socket.')));
  }
  static async connect(socketPath: string, timeoutMs = 15000): Promise<SocketRpc> {
    if (!isAbsolute(socketPath) || socketPath.includes(':') || socketPath.includes('?') || socketPath.includes('#')) throw new RemoteError('invalid_socket', 'Expected a local Unix socket path.');
    const socket = new WebSocket(`ws+unix://${socketPath}:/`, { handshakeTimeout: timeoutMs, maxPayload: 2 * 1024 * 1024 });
    const rpc = new SocketRpc(socket, timeoutMs);
    try {
      await new Promise<void>((resolve, reject) => {
        const cleanup = () => { socket.off('open', opened); socket.off('error', failed); socket.off('close', closed); };
        const opened = () => { cleanup(); resolve(); };
        const failed = () => { cleanup(); reject(new RemoteError('socket_unavailable', 'The existing Codex socket is unavailable. No new server or restart was attempted.')); };
        const closed = () => failed();
        socket.once('open', opened); socket.once('error', failed); socket.once('close', closed);
      });
      await rpc.request('initialize', { clientInfo: { name: 'codex_remote', title: 'Codex Remote', version: '0.1.0' }, capabilities: { experimentalApi: true } });
      socket.send(JSON.stringify({ method: 'initialized', params: {} }));
      return rpc;
    } catch (error) { rpc.close(); throw error; }
  }
  request(method: string, params: unknown = {}) {
    if (this.socket.readyState !== WebSocket.OPEN) return Promise.reject(new RemoteError('disconnected', 'The Codex socket is not connected.'));
    return new Promise<unknown>((resolve, reject) => {
      const id = ++this.nextId;
      const timer = setTimeout(() => { this.pending.delete(id); reject(new RemoteError('timeout', `Codex did not finish ${method} in time. Its result is unknown; check status before retrying a change.`)); }, this.timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
      this.socket.send(JSON.stringify({ id, method, params }), error => {
        if (error) { const item = this.pending.get(id); if (item) { clearTimeout(item.timer); this.pending.delete(id); item.reject(new RemoteError('socket_error', 'Failed to send a request to Codex.')); } }
      });
    });
  }
  private fail(error: Error) { for (const item of this.pending.values()) { clearTimeout(item.timer); item.reject(error); } this.pending.clear(); }
  close() { this.fail(new RemoteError('disconnected', 'The Codex Remote connection closed.')); this.socket.terminate(); }
}
