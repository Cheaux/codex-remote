import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { RemoteService } from './service.js';
import { errorResult } from './errors.js';
import { pairingPng, pairingText } from './pairing.js';

export function createMcpServer(service = new RemoteService()) {
  const server = new McpServer({ name: 'codex-remote', version: '0.1.0' });
  const tool = (name: string, description: string, inputSchema: z.ZodRawShape, readOnly: boolean, destructive: boolean, idempotent: boolean, run: (args: any) => Promise<CallToolResult>) => {
    server.registerTool(name, { description, inputSchema, annotations: { readOnlyHint: readOnly, destructiveHint: destructive, idempotentHint: idempotent, openWorldHint: true } }, async args => {
      try { return await run(args); }
      catch (error) { const value = errorResult(error); return { isError: true, content: [{ type: 'text', text: JSON.stringify({ error: value }) }], structuredContent: { error: value } }; }
    });
  };
  const result = (value: unknown): CallToolResult => ({ content: [{ type: 'text', text: JSON.stringify(value, null, 2) }], structuredContent: { result: value } });
  tool('remote_status', 'Read native remote-access status and paired-device count without starting or changing the daemon. Relay connected and phone paired are separate states.', {}, true, false, true, async () => result(await service.status()));
  tool('remote_enable', 'Enable persistent ChatGPT phone access through the existing Codex socket, keeping local sessions running. Starts the native daemon only if absent; never restarts a running server.', {}, false, false, true, async () => result(await service.enable()));
  tool('remote_pair', 'Show a fresh remote-session pairing QR image, link, manual code, and expiration for ChatGPT Android or iPhone. Enables persistent remote access if needed. Existing pairings are preserved; only call when pairing/QR is requested.', {}, false, false, false, async () => {
    const pair = await service.qr(); const png = await pairingPng(pair); const output = { ...pair, qrText: pairingText(pair) };
    return { content: [
      { type: 'text', text: JSON.stringify({ ...output, instructions: 'Show the QR image when supported. In terminal conversation output, reproduce qrText exactly inside a fenced code block, then provide the pairing link and expiration. Scan with Android or iPhone and finish in ChatGPT using the same account/workspace. Existing pairings remain valid. Use remote_devices_list after pairing to confirm the device.' }, null, 2) },
      { type: 'image', data: png.toString('base64'), mimeType: 'image/png' },
    ], structuredContent: { result: output } };
  });
  tool('remote_disable', 'Disable persistent phone access without stopping Codex or local sessions. This disconnects remote clients, including the caller when used from a phone; it preserves paired devices.', {}, false, true, true, async () => result(await service.disable()));
  tool('remote_devices_list', 'List devices paired with this host, including exact IDs, names, platform, and last-seen timestamps. Does not issue a new pairing code.', {}, true, false, true, async () => result(await service.devices()));
  tool('remote_device_revoke', 'Revoke one explicitly chosen device from this host using its client_id from remote_devices_list. Disconnects that device without stopping local Codex sessions.', { client_id: z.string().min(1).max(200) }, false, true, false, async args => result(await service.revoke(args.client_id)));
  return server;
}

export async function serve() { await createMcpServer().connect(new StdioServerTransport()); }
