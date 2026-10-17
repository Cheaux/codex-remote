import { stripVTControlCharacters } from 'node:util';
import { pairingTerminal } from './pairing.js';
import type { Pairing } from './service.js';

/** A compact, resize-aware view inside the launcher's retained PTY. */
export async function showPairing(pair: Pairing) {
  const qr = await pairingTerminal(pair);
  const plainLines = stripVTControlCharacters(qr).trimEnd().split('\n');
  const height = plainLines.length, width = Math.max(...plainLines.map(line => line.length));
  const wasRaw = process.stdin.isRaw; let details = false;
  const clean = (s: string) => stripVTControlCharacters(s).replace(/[\x00-\x08\x0b-\x1f\x7f-\x9f]/g, '');
  const draw = () => {
    const columns = Math.max(10, process.stdout.columns || 80), rows = Math.max(4, process.stdout.rows || 24);
    let output = '\x1b[0m\x1b[?7l\x1b[2J\x1b[H';
    if (Date.now() >= pair.expiresAt * 1000) output += 'Pairing QR expired.\r\nReturn to your chat and request a new QR.';
    else if (details) {
      const text = clean(`ChatGPT remote pairing\n\n${pair.pairingUrl}\n\nManual code: ${pair.manualPairingCode || 'unavailable'}\nExpires: ${pair.expiresAtIso}\n\nScan/open with Android or iPhone.\nExisting pairings are preserved.`);
      output += text.split('\n').flatMap(line => line.match(new RegExp(`.{1,${columns}}`, 'gu')) || ['']).slice(0, rows - 2).join('\r\n');
    } else if (width <= columns && height <= rows - 2) output += `ChatGPT remote pairing\r\n${qr}`;
    else output += 'Enlarge the terminal to show the whole QR.\r\nPress D for the pairing link and manual code.';
    output += `\x1b[${rows};1H\x1b[0m${(details ? 'Enter: back | D: show QR' : 'Enter: back | D: link/code').slice(0, columns)}\x1b[?7h`;
    process.stdout.write(output);
  };
  process.stdin.setRawMode(true); process.stdin.resume(); draw();
  try {
    await new Promise<void>(resolve => {
      const done = () => { process.stdin.off('data', onInput); process.stdout.off('resize', draw); clearTimeout(expiration); resolve(); };
      const onInput = (data: Buffer) => {
        if ([...data].some(byte => [3, 4, 10, 13, 27].includes(byte))) done();
        else if (/[dD]/.test(data.toString())) { details = !details; draw(); }
      };
      const expiration = setTimeout(draw, Math.max(1, Math.min(2147483647, pair.expiresAt * 1000 - Date.now() + 10)));
      process.stdin.on('data', onInput); process.stdout.on('resize', draw);
    });
  } finally { process.stdin.setRawMode(wasRaw || false); process.stdin.pause(); process.stdout.write('\x1b[0m\x1b[?7h'); }
}
