'use strict';
// Utilitários de PNG compartilhados pelo kit de arte e pelos ícones do app de celular.
// PNG RGBA -> RGB de 24 bits (sem canal alfa): exigência de Google Play / App Store para capturas e gráficos
const zlib = require('zlib');
function stripAlpha(buf) {
  if (!(buf[0] === 0x89 && buf[1] === 0x50)) return buf;
  let pos = 8, ihdr = null; const idat = [];
  while (pos < buf.length) { const len = buf.readUInt32BE(pos), type = buf.toString('ascii', pos + 4, pos + 8), data = buf.subarray(pos + 8, pos + 8 + len); if (type === 'IHDR') ihdr = data; else if (type === 'IDAT') idat.push(data); pos += 12 + len; if (type === 'IEND') break; }
  const w = ihdr.readUInt32BE(0), h = ihdr.readUInt32BE(4); if (ihdr[8] !== 8 || ihdr[9] !== 6) return buf;
  const raw = zlib.inflateSync(Buffer.concat(idat)), S4 = w * 4, px = Buffer.alloc(h * S4);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (S4 + 1)], row = raw.subarray(y * (S4 + 1) + 1, (y + 1) * (S4 + 1)), out = px.subarray(y * S4, (y + 1) * S4), prev = y ? px.subarray((y - 1) * S4, y * S4) : null;
    for (let x = 0; x < S4; x++) { const a = x >= 4 ? out[x - 4] : 0, b = prev ? prev[x] : 0, c = prev && x >= 4 ? prev[x - 4] : 0; let v = row[x]; if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1; else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c); } out[x] = v & 255; }
  }
  const S3 = w * 3, rows = Buffer.alloc(h * (S3 + 1)); const cur = Buffer.alloc(S3), prev3 = Buffer.alloc(S3); let last = Buffer.alloc(S3);
  for (let y = 0; y < h; y++) {
    for (let x = 0, i = y * S4, o = 0; x < w; x++, i += 4, o += 3) { cur[o] = px[i]; cur[o + 1] = px[i + 1]; cur[o + 2] = px[i + 2]; }
    // escolhe o melhor filtro (soma mínima de |v|) entre none/sub/up/paeth
    let best = 0, bestSum = Infinity, bestBuf = null;
    for (const f of [0, 1, 2, 4]) {
      const outb = Buffer.alloc(S3); let sum = 0;
      for (let x = 0; x < S3; x++) { const a = x >= 3 ? cur[x - 3] : 0, b = last[x], c = x >= 3 ? last[x - 3] : 0; let pr = 0; if (f === 1) pr = a; else if (f === 2) pr = b; else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); pr = (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c); } const v = (cur[x] - pr) & 255; outb[x] = v; sum += v < 128 ? v : 256 - v; }
      if (sum < bestSum) { bestSum = sum; best = f; bestBuf = outb; }
    }
    rows[y * (S3 + 1)] = best; bestBuf.copy(rows, y * (S3 + 1) + 1); last = Buffer.from(cur);
  }
  const chunk = (type, data) => { const t = Buffer.from(type, 'ascii'), len = Buffer.alloc(4); len.writeUInt32BE(data.length); const crc = Buffer.alloc(4); crc.writeUInt32BE(zlib.crc32(Buffer.concat([t, data])) >>> 0); return Buffer.concat([len, t, data, crc]); };
  const nh = Buffer.from(ihdr); nh[9] = 2;
  return Buffer.concat([buf.subarray(0, 8), chunk('IHDR', nh), chunk('IDAT', zlib.deflateSync(rows, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}
module.exports = { stripAlpha };
