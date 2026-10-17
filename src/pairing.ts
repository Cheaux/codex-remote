import QRCode from 'qrcode';
import type { Pairing } from './service.js';

export const pairingPng = (pair: Pairing) => QRCode.toBuffer(pair.pairingUrl, { type: 'png', width: 512, margin: 4, errorCorrectionLevel: 'M', color: { dark: '#000000ff', light: '#ffffffff' } });
export const pairingTerminal = (pair: Pairing) => QRCode.toString(pair.pairingUrl, { type: 'terminal', small: true, errorCorrectionLevel: 'M' });

/** Monochrome half-block QR for fenced text in terminal conversation responses. */
export function pairingText(pair: Pairing) {
  const { modules } = QRCode.create(pair.pairingUrl, { errorCorrectionLevel: 'M' });
  const margin = 4, size = modules.size + margin * 2;
  const dark = (x: number, y: number) => x >= margin && y >= margin && x < size - margin && y < size - margin && !!modules.get(y - margin, x - margin);
  const lines: string[] = [];
  for (let y = 0; y < size; y += 2) {
    let line = '';
    for (let x = 0; x < size; x++) line += dark(x, y) ? (dark(x, y + 1) ? '█' : '▀') : (dark(x, y + 1) ? '▄' : ' ');
    lines.push(line);
  }
  return lines.join('\n');
}
