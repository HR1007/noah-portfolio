/*
  產生站台的蝴蝶餅圖示。   執行：node scripts/make-favicon.mjs

  為什麼用程式畫而不是放一張圖：favicon 要在 16px 到 180px 之間都清楚，
  幾何定義出來的形狀可以在任何尺寸重新算，不會有縮放糊掉的問題。
  形狀由三段圓環組成——左右兩個上環，加一段大的底弧，那就是蝴蝶餅的骨架。

  輸出：
    public/favicon.svg        向量，現代瀏覽器優先用這個
    public/favicon.ico        32×32，Safari 與舊瀏覽器的 fallback
    public/apple-touch-icon.png  180×180，iOS 加到主畫面時用

  沒有依賴任何繪圖套件：PNG 用 Node 內建的 zlib 自己編碼。
*/

import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public');

// 128×128 的設計座標。三段圓環：左上環、右上環、底弧。
const S = 128;
const RINGS = [
  { cx: 48, cy: 46, r: 17, w: 5 }, // 左上環
  { cx: 80, cy: 46, r: 17, w: 5 }, // 右上環
  /*
    外圈的身體。minDy 取到接近圓心正上方，讓兩側一路往上長，
    在上環的高度剛好與上環外緣重合而接起來。

    先前把它畫成一道淺弧，兩個上環就「浮」在開口裡沒有相連——那會讀成一張笑臉，
    不是蝴蝶餅。要讓它成立，關鍵是兩個小環必須嵌進大環的上半部並互相交叉。
  */
  { cx: 64, cy: 56, r: 40, w: 5, minDy: -30 },
];

// 溫暖的琥珀棕。這是食物的顏色不是介面色，所以淺色與深色主題共用同一個值。
const INK = [0xd0, 0x8a, 0x2e];

/** 這個點落在蝴蝶餅的筆畫上嗎（座標以 128 為基準）。 */
function onStroke(x, y) {
  for (const ring of RINGS) {
    const dx = x - ring.cx;
    const dy = y - ring.cy;
    if (ring.minDy != null && dy < ring.minDy) continue;
    if (Math.abs(Math.hypot(dx, dy) - ring.r) <= ring.w) return true;
  }
  return false;
}

/** 以 4×4 超取樣算出每個像素的覆蓋率，邊緣才不會鋸齒。 */
function raster(size) {
  const px = new Uint8Array(size * size * 4);
  const scale = S / size;
  const SUB = 4;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let hit = 0;
      for (let sy = 0; sy < SUB; sy++) {
        for (let sx = 0; sx < SUB; sx++) {
          const px128 = (x + (sx + 0.5) / SUB) * scale;
          const py128 = (y + (sy + 0.5) / SUB) * scale;
          if (onStroke(px128, py128)) hit++;
        }
      }
      const i = (y * size + x) * 4;
      px[i] = INK[0];
      px[i + 1] = INK[1];
      px[i + 2] = INK[2];
      px[i + 3] = Math.round((hit / (SUB * SUB)) * 255);
    }
  }
  return px;
}

// ---------- 最小的 PNG 編碼器 ----------
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function toPng(px, size) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // 每色 8 bit
  ihdr[9] = 6; // RGBA
  // 10–12 保持 0：壓縮、濾波、交錯都用預設

  // 每一列前面要加一個濾波位元組，這裡一律用 0（不濾波）
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    Buffer.from(px.buffer, y * size * 4, size * 4).copy(raw, y * (size * 4 + 1) + 1);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/** ICO 從 Vista 起就可以直接包 PNG，不必轉成 BMP。 */
function toIco(png, size) {
  const dir = Buffer.alloc(6);
  dir.writeUInt16LE(0, 0);
  dir.writeUInt16LE(1, 2); // 1 = icon
  dir.writeUInt16LE(1, 4); // 1 張
  const entry = Buffer.alloc(16);
  entry[0] = size;
  entry[1] = size;
  entry.writeUInt16LE(1, 4); // planes
  entry.writeUInt16LE(32, 6); // bpp
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(6 + 16, 12);
  return Buffer.concat([dir, entry, png]);
}

// ---------- SVG ----------
function toSvg() {
  const arcs = RINGS.map((ring) => {
    const clip = ring.minDy != null
      ? ` clip-path="inset(${ring.cy + ring.minDy}px 0 0 0)"`
      : '';
    return `  <circle cx="${ring.cx}" cy="${ring.cy}" r="${ring.r}" stroke-width="${ring.w * 2}"${clip} />`;
  }).join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" fill="none">
  <!--
    蝴蝶餅：左右兩個上環加一段底弧。由 scripts/make-favicon.mjs 產生，
    要改形狀請改那支腳本再重跑，不要直接手改這裡——PNG 與 ICO 是同一組數字算出來的。
  -->
  <g stroke="rgb(${INK.join(' ')})" stroke-linecap="round">
${arcs}
  </g>
</svg>
`;
}

fs.writeFileSync(path.join(OUT, 'favicon.svg'), toSvg(), 'utf-8');

const png32 = toPng(raster(32), 32);
fs.writeFileSync(path.join(OUT, 'favicon.ico'), toIco(png32, 32));
fs.writeFileSync(path.join(OUT, 'apple-touch-icon.png'), toPng(raster(180), 180));

console.log('favicon.svg / favicon.ico（32×32）/ apple-touch-icon.png（180×180）已產生');
