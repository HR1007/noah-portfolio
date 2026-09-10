/*
  產生站台的字標圖示（簡約的 N）。   執行：node scripts/make-favicon.mjs

  為什麼用程式畫而不是放一張圖：favicon 要在 16px 到 180px 之間都清楚，
  幾何定義出來的形狀可以在任何尺寸重新算，不會有縮放糊掉的問題。
  也不用嵌字型——favicon 的算繪環境拿不到網站載入的 Inter，用 <text> 會變成
  各平台各自的系統字體，長相不一致。

  輸出：
    public/favicon.svg           向量，現代瀏覽器優先用這個，會隨系統主題翻色
    public/favicon.ico           32×32，Safari 與舊瀏覽器的 fallback
    public/apple-touch-icon.png  180×180，iOS 加到主畫面時用

  沒有依賴任何繪圖套件：PNG 用 Node 內建的 zlib 自己編碼。
*/

import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public');

const S = 128; // 設計座標

/*
  N 用三段筆畫畫成：左豎、對角、右豎。

  筆畫寬度刻意不跟站上字標的 light（300）一致——那個字重在 100px 的「NOAH WEN」
  上很好看，但縮到 16px 的分頁圖示會細到看不見。圖示要自己站得住，
  不是把字標等比縮小。
*/
const LEFT = 36;
const RIGHT = 92;
const TOP = 34;
const BOTTOM = 94;
const W = 7; // 筆畫半寬

const STROKES = [
  { a: [LEFT, BOTTOM], b: [LEFT, TOP] }, // 左豎
  { a: [LEFT, TOP], b: [RIGHT, BOTTOM] }, // 對角
  { a: [RIGHT, BOTTOM], b: [RIGHT, TOP] }, // 右豎
];

/*
  跟站上的 --color-ink 同一個值。點陣圖沒辦法隨主題反轉，所以 ICO 與
  apple-touch-icon 固定用深墨色——iOS 會把 apple-touch-icon 疊在白底上，
  Safari 的分頁列在淺色模式也是淺底，這個選擇在絕大多數情況下是對的。
  SVG 那份則會跟著系統主題翻色（見 toSvg）。
*/
const INK = [0x33, 0x33, 0x33];
const INK_DARK = '#f2f2f2';

/** 點到線段的最短距離。 */
function distToSegment(x, y, [ax, ay], [bx, by]) {
  const vx = bx - ax;
  const vy = by - ay;
  const t = Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / (vx * vx + vy * vy)));
  return Math.hypot(x - (ax + t * vx), y - (ay + t * vy));
}

/** 這個點落在字標的筆畫上嗎（座標以 128 為基準）。 */
function onStroke(x, y) {
  return STROKES.some((stroke) => distToSegment(x, y, stroke.a, stroke.b) <= W);
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
          if (onStroke((x + (sx + 0.5) / SUB) * scale, (y + (sy + 0.5) / SUB) * scale)) hit++;
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

function toSvg() {
  const lines = STROKES.map(
    (s) => `    <line x1="${s.a[0]}" y1="${s.a[1]}" x2="${s.b[0]}" y2="${s.b[1]}" />`
  ).join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" fill="none">
  <!--
    由 scripts/make-favicon.mjs 產生。要改形狀或粗細請改那支腳本再重跑，
    不要直接手改這裡——PNG 與 ICO 是同一組數字算出來的。
  -->
  <g stroke-width="${W * 2}" stroke-linecap="round" stroke-linejoin="round">
${lines}
  </g>
  <style>
    g { stroke: rgb(${INK.join(' ')}); }
    @media (prefers-color-scheme: dark) {
      g { stroke: ${INK_DARK}; }
    }
  </style>
</svg>
`;
}

fs.writeFileSync(path.join(OUT, 'favicon.svg'), toSvg(), 'utf-8');
fs.writeFileSync(path.join(OUT, 'favicon.ico'), toIco(toPng(raster(32), 32), 32));
fs.writeFileSync(path.join(OUT, 'apple-touch-icon.png'), toPng(raster(180), 180));

console.log('favicon.svg / favicon.ico（32×32）/ apple-touch-icon.png（180×180）已產生');
