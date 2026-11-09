/*
  案例頁示範影片的錄影工具。   執行：npm run demo:record -- <腳本名稱>

  為什麼存在：每個案例都要一支 30 秒以上、從頭走完核心流程的示範影片。手動錄的話，
  產品一改版就得整支重錄，節奏和游標路徑每次也都不一樣。把流程寫成腳本，
  改版後重跑一次就好，錄出來的節奏永遠一致。

  做法：開 headless Chrome（用 Node 內建的 WebSocket 走 DevTools Protocol，不裝套件），
  照 scripts/demos/<名稱>.mjs 的腳本操作，同時用 Page.startScreencast 收每一格畫面，
  最後交給 ffmpeg 合成 MP4（H.264、無聲、faststart；桌機 60fps、手機 30fps）。

  ffmpeg 這一關另外做三件事，都是在錄完之後疊上去，不碰被錄的網頁：
  - 鏡頭放大：腳本用 demo.focus(區塊) 指定要介紹的區塊，鏡頭把它移到畫面正中央、
    放大到剛好填滿畫面，周圍不相干的功能就不會出現；換下一個區塊時鏡頭平順移過去，
    demo.unfocus() 縮回整個畫面。倍率依區塊大小自動算，不是固定值——區塊本來就夠大
    就不放大。錄影解析度是輸出的 1.5 倍，放大 1.5 倍以內不會糊，上限 MAX_ZOOM。
  - 中英雙字幕：用作品集的 tokens.css 與 Inter 字型畫成透明 PNG，依時間疊上去。
    字幕不放在被錄的網頁裡——放在網頁裡的話，鏡頭一放大就會被裁出畫面外。
  - 結尾：最後一格畫面縮小淡出，接著浮現案例頁 hero 用的那張圖（版位 00）與專案名稱，
    動態與作品集「體驗展示」段落的圖片登場一樣（縮小、模糊 → 原尺寸、對焦）。

  游標與點擊效果則直接疊在被錄的網頁上（跟著畫面一起放大，像真的在螢幕上錄）：
  桌機是深灰色箭頭，點下去從尖端放射出一圈線條；手機是觸控圓點加同樣的放射線。
  換頁後游標會接續停在上一頁的位置（存在 sessionStorage），不會跳回畫面中央。

  敏感資訊：每次都用全新的空白 Chrome 設定檔（沒有任何登入狀態、cookie、紀錄），
  只錄網頁內容、不錄網址列。腳本裡輸入的一律是假資料；頁面上有不該公開的內容時
  用 demo.mask(選擇器) 模糊掉；會寄信給真人的表單用 demo.fakeResponse 攔下，畫面照樣走到送出成功。錄完會另外輸出一張每 3 秒抽一格的總覽圖
  （.demo-out/<名稱>-sheet.jpg），上傳前逐格看過一遍。

  輸出到 .demo-out/<名稱>.mp4（不進版控），確認沒問題再複製到案例的圖片資料夾。
  桌機輸出 1920×1200（16:10），手機輸出 780×1688（直式）。

  參數也可以直接給腳本檔路徑：npm run demo:record -- ./某處/test.mjs

  腳本格式：
    export default {
      device: 'desktop' | 'phone',
      project: 'foodlet',         // 結尾用：讀這個案例的標題與 hero 圖；不填就沒有結尾
      start: 'https://…',         // 開始錄影前先載入好的頁面
      minSeconds: 30,             // 選填，錄出來比這短會警告
      async run(demo) { … },      // demo 提供的動作見下方 actions
    }
*/
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import matter from 'gray-matter';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, '.demo-out');
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

/*
  width/height 是被錄網頁的版面尺寸（CSS px），out 是輸出影片的像素尺寸。
  錄影時用 scale 倍的解析度（輸出的 1.5 倍），鏡頭放大 1.5 倍時剛好不需要拉伸。
*/
const DEVICES = {
  desktop: { width: 1440, height: 900, scale: 2, mobile: false, out: [1920, 1200], fps: 60 },
  phone: { width: 390, height: 844, scale: 3, mobile: true, out: [780, 1688], fps: 30 },
};
const MAX_ZOOM = 2; // 超過 1.5 倍就開始拉伸錄影畫面，再大字會明顯變軟
const FOCUS_MS = 700; // 鏡頭從一個狀態移到下一個狀態的時間
const CAPTION_BAND = { desktop: 0.15, phone: 0.2 }; // 畫面下緣被字幕卡佔掉的比例（含留白）

const arg = process.argv[2];
if (!arg) {
  console.error('用法：npm run demo:record -- <腳本名稱>（scripts/demos/ 裡的檔名，不含 .mjs）');
  process.exit(1);
}
const storyPath = arg.endsWith('.mjs') ? path.resolve(arg) : path.join(ROOT, 'scripts/demos', `${arg}.mjs`);
const name = path.basename(storyPath, '.mjs');
const story = (await import(pathToFileURL(storyPath).href)).default;
const device = DEVICES[story.device];
if (!device) throw new Error(`device 要是 ${Object.keys(DEVICES).join(' 或 ')}`);
const [OUT_W, OUT_H] = device.out;
const CAP_W = Math.round(device.width * device.scale), CAP_H = Math.round(device.height * device.scale);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const dataUri = (file) => {
  const ext = path.extname(file).slice(1).toLowerCase();
  const mime = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', avif: 'image/avif', woff2: 'font/woff2' }[ext];
  return `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
};
const escapeHtml = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// ---------- 作品集的設計 token 與字型（字幕、結尾用，讓影片跟作品集同一套視覺） ----------
function readTokens() {
  const css = fs.readFileSync(path.join(ROOT, 'src/styles/tokens.css'), 'utf-8');
  const block = (selector) => {
    const start = css.indexOf('{', css.indexOf(selector));
    return css.slice(start + 1, css.indexOf('\n}', start));
  };
  const vars = (text) => [...text.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, k, v]) => `${k}: ${v.replace(/\s+/g, ' ').trim()};`).join('\n');
  // 作品集預設是深色主題，影片裡的字幕與結尾也用深色
  return `:root {\n${vars(block(':root {'))}\n${vars(block(":root[data-theme='dark'] {"))}\n}`;
}
const PORTFOLIO_CSS = `
  @font-face {
    font-family: 'Inter Variable';
    font-weight: 100 900;
    src: url(${dataUri(path.join(ROOT, 'node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2'))}) format('woff2');
  }
  ${readTokens()}
  html, body { margin: 0; font-family: var(--font-sans); -webkit-font-smoothing: antialiased; }
  #__demoCursor { display: none !important; }
`;

// ---------- 疊在被錄網頁上的游標與點擊效果（每個新文件載入時注入） ----------
const cursorScript = (kind) => `(() => {
  if (window.top !== window) return;
  const KEY = '__demoCursor';
  const NS = 'http://www.w3.org/2000/svg';
  const init = () => {
    if (document.getElementById(KEY)) return;
    const el = document.createElement('div');
    el.id = KEY;
    el.style.cssText = 'position:fixed;left:0;top:0;z-index:2147483647;pointer-events:none;will-change:transform';
    ${kind === 'phone'
      ? `el.innerHTML = '<div style="width:38px;height:38px;margin:-19px 0 0 -19px;border-radius:50%;background:rgba(255,255,255,.55);border:2px solid rgba(0,0,0,.25);box-shadow:0 2px 10px rgba(0,0,0,.25);transition:opacity .18s,transform .18s;opacity:0;transform:scale(.6)"></div>';`
      : `el.innerHTML = '<svg width="28" height="28" viewBox="0 0 28 28" style="display:block;overflow:visible;filter:drop-shadow(0 2px 3px rgba(0,0,0,.3));transition:transform .12s;transform-origin:2px 2px"><path d="M2 2 L23 10.2 L14.6 13.4 L20.6 19.4 Q21.6 20.4 20.6 21.4 L19.4 22.6 Q18.4 23.6 17.4 22.6 L11.4 16.6 L8.2 25 Z" fill="#3a3a3a" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';`}
    document.documentElement.appendChild(el);
    const mark = el.firstElementChild;
    const saved = JSON.parse(sessionStorage.getItem(KEY) || 'null');
    const pos = { x: saved ? saved.x : innerWidth / 2, y: saved ? saved.y : innerHeight / 2 };
    let gliding = false;
    const place = (x, y) => {
      pos.x = x; pos.y = y;
      el.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      try { sessionStorage.setItem(KEY, JSON.stringify({ x, y })); } catch {}
    };
    place(pos.x, pos.y);

    /*
      游標移動在頁面裡用 requestAnimationFrame 逐格畫，跟畫面刷新同步，所以是順的。
      先前是從 Node 每 16ms 送一次滑鼠事件，每一步都要等 DevTools 來回，間隔忽長忽短，
      錄起來游標一頓一頓的。路徑是一條微微彎曲的弧線（真人手腕移動滑鼠不會走直線），
      速度兩頭慢、中間快。移動途中不理會真正的 mousemove，抵達後 Node 才補一個在終點的事件。
    */
    let arcSide = 1;
    window.__demoGlide = (x, y, ms) => new Promise((resolve) => {
      const from = { ...pos };
      const dx = x - from.x, dy = y - from.y;
      arcSide = -arcSide;
      const bend = Math.min(60, Math.hypot(dx, dy) * 0.08) * arcSide;
      const len = Math.hypot(dx, dy) || 1;
      const cx = from.x + dx / 2 - (dy / len) * bend, cy = from.y + dy / 2 + (dx / len) * bend;
      const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      const start = performance.now();
      gliding = true;
      const step = (now) => {
        const t = Math.min(1, (now - start) / ms), k = ease(t), u = 1 - k;
        place(u * u * from.x + 2 * u * k * cx + k * k * x, u * u * from.y + 2 * u * k * cy + k * k * y);
        if (t < 1) requestAnimationFrame(step); else { gliding = false; resolve(true); }
      };
      requestAnimationFrame(step);
    });

    // 點擊效果：從點擊位置放射出 12 道線，內圈短、外圈長短交錯，向外擴散後淡出
    const burst = (x, y) => {
      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('viewBox', '-50 -50 100 100');
      svg.style.cssText = 'position:fixed;left:' + (x - 50) + 'px;top:' + (y - 50) + 'px;width:100px;height:100px;pointer-events:none;z-index:2147483646;overflow:visible;filter:drop-shadow(0 0 1.5px #fff) drop-shadow(0 0 1px #fff)';
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const segs = i % 2 ? [[15, 20], [27, 34]] : [[14, 21], [26, 42]];
        for (const [r1, r2] of segs) {
          const l = document.createElementNS(NS, 'line');
          l.setAttribute('x1', Math.cos(a) * r1); l.setAttribute('y1', Math.sin(a) * r1);
          l.setAttribute('x2', Math.cos(a) * r2); l.setAttribute('y2', Math.sin(a) * r2);
          l.setAttribute('stroke', '#3a3a3a'); l.setAttribute('stroke-width', '3.4'); l.setAttribute('stroke-linecap', 'round');
          svg.appendChild(l);
        }
      }
      document.documentElement.appendChild(svg);
      svg.animate(
        [{ transform: 'scale(.55)', opacity: 0 }, { transform: 'scale(.9)', opacity: 1, offset: 0.35 }, { transform: 'scale(1.18)', opacity: 0 }],
        { duration: 560, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
      ).onfinish = () => svg.remove();
    };
    const down = (x, y) => {
      burst(x, y);
      ${kind === 'phone' ? `mark.style.opacity = 1; mark.style.transform = 'scale(1)';` : `mark.style.transform = 'scale(.88)';`}
    };
    const up = () => {
      ${kind === 'phone' ? `mark.style.opacity = 0; mark.style.transform = 'scale(.6)';` : `mark.style.transform = 'scale(1)';`}
    };
    addEventListener('mousemove', (e) => { if (!gliding) place(e.clientX, e.clientY); }, true);
    addEventListener('mousedown', (e) => { place(e.clientX, e.clientY); down(e.clientX, e.clientY); }, true);
    addEventListener('mouseup', up, true);
    addEventListener('touchstart', (e) => { const t = e.touches[0]; if (t) { place(t.clientX, t.clientY); down(t.clientX, t.clientY); } }, true);
    addEventListener('touchmove', (e) => { const t = e.touches[0]; if (t) place(t.clientX, t.clientY); }, true);
    addEventListener('touchend', up, true);
  };
  if (document.body) init(); else document.addEventListener('DOMContentLoaded', init);
})()`;

// 在頁面裡找元素：CSS 選擇器，或 "text:字樣"（可見元素中，文字包含它、而且最短的那一個）。
// 文字一樣長時（按鈕外面包一層只有這顆按鈕的卡片，兩者 innerText 相同），
// 先挑可以點的元素，再挑面積小的——不然會點到卡片正中央，而不是那顆按鈕
const FIND = `(q) => {
  const vis = (el) => { const b = el.getBoundingClientRect(); const cs = getComputedStyle(el); return b.width > 0 && b.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
  if (q.startsWith('text:')) {
    const t = q.slice(5);
    const clickable = (el) => el.matches('button, a, [role=button], [role=tab], label, summary, input') ? 0 : 1;
    const area = (el) => { const b = el.getBoundingClientRect(); return b.width * b.height; };
    // 只有圖示的按鈕（例如關閉的 ×）沒有文字，改比對 aria-label
    const label = (el) => (el.innerText || el.value || el.getAttribute('aria-label') || '').trim();
    const all = [...document.querySelectorAll('button, a, [role=button], [role=tab], label, summary, input, h1, h2, h3, h4, p, span, li, div')]
      .filter((el) => vis(el) && label(el).includes(t));
    return all.sort((a, b) => (a.innerText || '').length - (b.innerText || '').length || clickable(a) - clickable(b) || area(a) - area(b))[0] ?? null;
  }
  return [...document.querySelectorAll(q)].find(vis) ?? null;
}`;

/*
  元素所在的捲動區塊在畫面上看得到的範圍：最近一個會自己捲動的祖先元素，沒有就是整個視窗。
  手機版常見側欄或面板自己捲動（Star Overlay 的控制項就在一個 324px 高的側欄裡），
  手勢或滾輪要落在那一塊裡面才捲得動——落在旁邊的畫布上，只會被當成拖曳畫布。
*/
const SCROLLER = `(el) => {
  for (let n = el.parentElement; n && n !== document.body && n !== document.documentElement; n = n.parentElement) {
    const cs = getComputedStyle(n);
    if (/(auto|scroll)/.test(cs.overflowY) && n.scrollHeight > n.clientHeight + 4) {
      const b = n.getBoundingClientRect();
      const top = Math.max(0, b.top), bottom = Math.min(innerHeight, b.bottom);
      return { x: b.left + b.width / 2, y: (top + bottom) / 2, top, bottom };
    }
  }
  return { x: innerWidth / 2, y: innerHeight * 0.6, top: 0, bottom: innerHeight };
}`;

// ---------- Chrome ----------
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'demo-rec-'));
const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'demo-frames-'));
// headless 的螢幕串流不理會 Emulation 設的 deviceScaleFactor，一律給 CSS 像素大小的畫面；
// 要拿到高解析度的格，得在啟動時就用 --force-device-scale-factor 並給同樣大小的視窗
const chrome = spawn(CHROME, [
  '--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--hide-scrollbars', '--mute-audio',
  `--force-device-scale-factor=${device.scale}`, `--window-size=${device.width},${device.height}`, 'about:blank',
], { stdio: 'ignore' });

let ws, id = 0;
const pending = new Map();
const frames = [];
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const i = ++id;
  pending.set(i, (d) => (d.error ? reject(new Error(`${method}: ${d.error.message}`)) : resolve(d.result)));
  ws.send(JSON.stringify({ id: i, method, params }));
});
const ev = async (expr) => {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? 'eval error');
  return r.result.value;
};
let loadWaiters = [];

/*
  影片時間軸：以第一格畫面為 0。畫面用 Chrome 給的時間戳、事件（點擊、對焦、字幕）
  用 Node 這一側的牆鐘，兩者都從「第一格」起算，所以落在同一條時間軸上。
  paused 是錄影中途暫停的總長（換到結尾畫面時會暫停一下），之後的畫面與事件都扣掉它，
  時間軸才是連續的、不會往回跳。
*/
const clock = { firstTs: null, firstWall: 0, paused: 0 };
const videoTime = () => (clock.firstTs === null ? 0 : Date.now() / 1000 - clock.firstWall - clock.paused);
const focusKeys = []; // { t, z, x, y }：從 t 開始，鏡頭在 FOCUS_MS 內移到中心 (x, y)、倍率 z（CSS px）
const captions = []; // { t, zh, en, top }：zh 為 null 代表收起字幕
const fakes = []; // { urlPattern, method, status, body }：demo.fakeResponse 登記的假回應

async function connect() {
  let port, target;
  for (let i = 0; i < 100 && !port; i++) {
    await sleep(100);
    try { port = fs.readFileSync(path.join(profile, 'DevToolsActivePort'), 'utf-8').split('\n')[0]; } catch {}
  }
  for (let i = 0; i < 50 && port && !target; i++) {
    try { target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page'); } catch { await sleep(200); }
  }
  if (!target) throw new Error('Chrome 沒有啟動成功');
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r));
  ws.addEventListener('message', (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); return; }
    if (d.method === 'Page.screencastFrame') {
      if (clock.firstTs === null) { clock.firstTs = d.params.metadata.timestamp; clock.firstWall = Date.now() / 1000; }
      const file = path.join(workDir, `f${String(frames.length).padStart(6, '0')}.jpg`);
      fs.writeFileSync(file, Buffer.from(d.params.data, 'base64'));
      frames.push({ file, t: d.params.metadata.timestamp - clock.firstTs - clock.paused });
      ws.send(JSON.stringify({ id: ++id, method: 'Page.screencastFrameAck', params: { sessionId: d.params.sessionId } }));
    }
    if (d.method === 'Page.loadEventFired') { loadWaiters.forEach((r) => r()); loadWaiters = []; }
    // demo.fakeResponse 攔下的請求：方法對得上就在瀏覽器裡直接回應，其他照常放行
    if (d.method === 'Fetch.requestPaused') {
      const fake = fakes.find((x) => x.method === d.params.request.method);
      ws.send(JSON.stringify(fake
        ? { id: ++id, method: 'Fetch.fulfillRequest', params: { requestId: d.params.requestId, responseCode: fake.status, responseHeaders: [{ name: 'Content-Type', value: 'text/plain' }], body: Buffer.from(fake.body).toString('base64') } }
        : { id: ++id, method: 'Fetch.continueRequest', params: { requestId: d.params.requestId } }));
    }
    // 頁面跳出 alert／confirm 會卡住整個錄影，一律直接關掉
    if (d.method === 'Page.javascriptDialogOpening') ws.send(JSON.stringify({ id: ++id, method: 'Page.handleJavaScriptDialog', params: { accept: true } }));
  });
}

const startScreencast = () => send('Page.startScreencast', { format: 'jpeg', quality: 85, maxWidth: CAP_W, maxHeight: CAP_H, everyNthFrame: 1 });

// ---------- 給腳本用的動作 ----------
const mouse = { x: device.width / 2, y: device.height / 2 };

async function locate(q, timeout = 10000) {
  const until = Date.now() + timeout;
  while (Date.now() < until) {
    const r = await ev(`(() => { const el = (${FIND})(${JSON.stringify(q)}); if (!el) return null; const b = el.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2, top: b.top, bottom: b.bottom, area: (${SCROLLER})(el) }; })()`);
    if (r) return r;
    await sleep(200);
  }
  throw new Error(`找不到元素：${q}`);
}

const actions = {
  wait: (ms) => sleep(ms),

  async goto(url) {
    const loaded = new Promise((r) => loadWaiters.push(r));
    await send('Page.navigate', { url });
    await Promise.race([loaded, sleep(15000)]);
    await sleep(600);
  },

  // 游標滑過去（動畫在頁面裡跑，見 __demoGlide），距離越遠花的時間越長，但有上下限
  async moveTo(target, ms) {
    const to = typeof target === 'string' ? await actions.reveal(target) : target;
    const dist = Math.hypot(to.x - mouse.x, to.y - mouse.y);
    const dur = ms ?? Math.min(950, Math.max(380, 320 + dist * 0.45));
    await ev(`window.__demoGlide ? window.__demoGlide(${to.x}, ${to.y}, ${Math.round(dur)}) : true`);
    mouse.x = to.x;
    mouse.y = to.y;
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: mouse.x, y: mouse.y });
  },

  async click(target, { pause = 350 } = {}) {
    await actions.moveTo(target);
    await sleep(120);
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: mouse.x, y: mouse.y, button: 'left', clickCount: 1 });
    await sleep(90);
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: mouse.x, y: mouse.y, button: 'left', clickCount: 1 });
    await sleep(pause);
  },

  // 一個字一個字打，間隔稍微不規則
  async type(target, text, { delay = 70 } = {}) {
    if (target) await actions.click(target, { pause: 200 });
    for (const ch of text) {
      await send('Input.insertText', { text: ch });
      await sleep(delay + Math.round(Math.random() * delay * 0.6));
    }
  },

  // 按住拖曳（例如滑桿）：從 target 的中心拖動 dx、dy（CSS px）再放開
  async drag(target, { dx = 0, dy = 0, ms = 700 } = {}) {
    await actions.moveTo(target);
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: mouse.x, y: mouse.y, button: 'left', clickCount: 1 });
    const from = { ...mouse };
    const steps = Math.max(10, Math.round(ms / 16));
    for (let i = 1; i <= steps; i++) {
      const k = ease(i / steps);
      mouse.x = from.x + dx * k;
      mouse.y = from.y + dy * k;
      await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: mouse.x, y: mouse.y, button: 'left', buttons: 1 });
      await sleep(16);
    }
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: mouse.x, y: mouse.y, button: 'left', clickCount: 1 });
    await sleep(300);
  },

  async key(keyName) {
    const codes = { Enter: 13, Tab: 9, Escape: 27, Backspace: 8 };
    const base = { key: keyName, code: keyName, windowsVirtualKeyCode: codes[keyName] ?? 0 };
    await send('Input.dispatchKeyEvent', { type: 'keyDown', ...base, ...(keyName === 'Enter' ? { text: '\r' } : {}) });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', ...base });
  },

  // 平滑捲動。桌機用滾輪事件、手機用觸控滑動手勢，正值往下。
  // 滾輪捲的是游標底下那個區塊（側欄和內容區常常各自捲動），要捲別處就給 at，游標會先移過去
  // 手機：手勢從 at（預設畫面 60% 高）開始滑；捲動區塊很矮時一次滑不了那麼遠，拆成幾段，每段不超過 reach
  async scroll(dy, { ms = 900, at, reach } = {}) {
    if (device.mobile) {
      const p = at ?? { x: device.width / 2, y: device.height * 0.6 };
      const max = reach ?? device.height * 0.5;
      for (let left = dy; Math.abs(left) > 1; ) {
        const part = Math.sign(left) * Math.min(Math.abs(left), max);
        // speed 只收整數（px／秒），帶小數會整個指令被拒
        await send('Input.synthesizeScrollGesture', { x: Math.round(p.x), y: Math.round(p.y), yDistance: -Math.round(part), speed: Math.round(Math.max(400, Math.abs(dy) / (ms / 1000))), gestureSourceType: 'touch' });
        left -= part;
      }
      await sleep(250);
      return;
    }
    if (at) await actions.moveTo(at, 450);
    const steps = Math.max(10, Math.round(ms / 16));
    let done = 0;
    for (let i = 1; i <= steps; i++) {
      const next = Math.round(dy * ease(i / steps));
      await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: mouse.x, y: mouse.y, deltaX: 0, deltaY: next - done });
      done = next;
      await sleep(16);
    }
    await sleep(250);
  },

  // 元素不在它那個捲動區塊的可見範圍裡，就先平滑捲過去（停在區塊約 40% 高的位置），回傳它的中心點。
  // 捲動在那個區塊裡面進行（桌機游標先移過去再捲滾輪，手機在那一塊裡滑），見 SCROLLER
  async reveal(q) {
    let r = await locate(q);
    const a = r.area, h = a.bottom - a.top;
    if (r.top < a.top + h * 0.12 || r.bottom > a.bottom - h * 0.12) {
      const x = Math.min(Math.max(device.mobile ? a.x : r.x, device.width * 0.05), device.width * 0.95);
      await actions.scroll(r.top - (a.top + h * 0.4), { ms: 800, at: { x, y: a.y }, reach: h * 0.7 });
      r = await locate(q);
    }
    return r;
  },

  hover: (q) => actions.moveTo(q),

  /*
    鏡頭對準一個區塊：放到畫面正中央、放大到剛好填滿畫面（四周留 pad 的空間），
    倍率最多 MAX_ZOOM；區塊本來就快填滿畫面時不放大。量的是呼叫當下在畫面上的位置，
    之後頁面若捲動，要再 focus 一次。
    畫面下緣留給字幕卡（CAPTION_BAND）：區塊放進字幕上方那一塊的正中央，
    不然放大到填滿畫面時，區塊底部的按鈕會被字幕蓋住。
    closest：用文字找到的常常只是區塊的標題，給一個選擇器往外找到整個區塊
    （例如 focus('text:編輯規則', { closest: 'section.panel' })）。
  */
  async focus(q, { pad = 32, closest } = {}) {
    const box = await ev(`(() => { let el = (${FIND})(${JSON.stringify(q)}); if (el && ${JSON.stringify(closest ?? null)}) el = el.closest(${JSON.stringify(closest ?? '')}); if (!el) return null; const b = el.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; })()`);
    if (!box) throw new Error(`找不到要對焦的區塊：${q}`);
    const band = CAPTION_BAND[story.device];
    let z = Math.min(device.width / (box.w + pad * 2), (device.height * (1 - band)) / (box.h + pad * 2), MAX_ZOOM);
    if (z < 1.08) z = 1;
    // 鏡頭中心往下移半個字幕帶，區塊就會落在字幕上方那一塊的中央
    focusKeys.push({ t: videoTime(), z, x: box.x + box.w / 2, y: box.y + box.h / 2 + ((band / 2) * device.height) / z });
    await sleep(FOCUS_MS);
  },

  async unfocus() {
    focusKeys.push({ t: videoTime(), z: 1, x: device.width / 2, y: device.height / 2 });
    await sleep(FOCUS_MS);
  },

  async upload(selector, filePath) {
    const { root } = await send('DOM.getDocument', { depth: 0 });
    const { nodeId } = await send('DOM.querySelector', { nodeId: root.nodeId, selector });
    if (!nodeId) throw new Error(`找不到上傳欄位：${selector}`);
    await send('DOM.setFileInputFiles', { nodeId, files: [path.resolve(filePath)] });
  },

  // 中英雙字幕，簡短說明現在這個畫面在做什麼；caption(null) 收起來。
  // 錄完才疊進影片，不會跟著鏡頭放大；會擋到重點內容時給 { top: true } 改放上方
  async caption(zh, en, { top = false } = {}) {
    captions.push({ t: videoTime(), zh, en, top });
    await sleep(300);
  },

  /*
    攔下符合網址的請求，在瀏覽器裡直接回一個假的回應，請求不會送出去。
    用在「送出表單」這種會寄信給真人的動作：畫面照樣走到送出成功，對方什麼都收不到。
    被攔下的請求在這裡回應之前會一直停著、不會自己送出，所以就算出錯也不會漏出去。
  */
  async fakeResponse(urlPattern, { method = 'POST', status = 200, body = '' } = {}) {
    fakes.push({ urlPattern, method, status, body });
    await send('Fetch.enable', { patterns: fakes.map((x) => ({ urlPattern: x.urlPattern, requestStage: 'Request' })) });
  },

  // 把符合選擇器的元素模糊掉（之後出現的也會套到），錄到個資或不該公開的資料時用
  async mask(selector) {
    await ev(`(() => { const s = document.createElement('style'); s.textContent = ${JSON.stringify(`${selector} { filter: blur(8px) !important; }`)}; document.head.append(s); })()`);
  },

  eval: (js) => ev(js),
};

// ---------- 結尾：最後一格畫面縮小淡出，案例的 hero 圖浮現 ----------
async function playOutro() {
  const data = matter(fs.readFileSync(path.join(ROOT, 'src/content/projects', `${story.project}.md`), 'utf-8')).data;
  const dir = path.join(ROOT, 'src/assets/projects', story.project);
  const heroFile = fs.readdirSync(dir).find((f) => /^00\.(png|jpe?g|webp|avif)$/i.test(f));
  const phone = device.mobile;
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    ${PORTFOLIO_CSS}
    html, body { height: 100%; overflow: hidden; background: var(--color-bg); color: var(--color-ink); }
    .last { position: fixed; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .stage { position: fixed; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--sp-3); }
    .hero { margin: 0; width: ${phone ? '86vw' : '58vw'}; opacity: 0; transform: scale(0.94); filter: blur(6px); }
    .hero img { display: block; width: 100%; height: auto; max-height: ${phone ? '46vh' : '62vh'}; object-fit: contain; border-radius: var(--radius); }
    .title { text-align: center; opacity: 0; transform: translateY(var(--reveal-distance)); }
    .title .en { font-size: ${phone ? 'var(--font-size-h3)' : 'var(--font-size-h2)'}; font-weight: var(--font-weight-light); line-height: 1.15; }
    .title .zh { margin-top: var(--sp-1); font-size: ${phone ? 'var(--font-size-label)' : 'var(--font-size-body-lg)'}; color: var(--color-muted); }
    .play .last { animation: leave 700ms var(--reveal-easing) forwards; }
    .play .hero { animation: arrive calc(var(--reveal-duration) * 1.6) var(--reveal-easing) 420ms forwards; }
    .play .title { animation: arrive var(--reveal-duration) var(--reveal-easing) 950ms forwards; }
    @keyframes leave { to { transform: scale(0.88); filter: blur(8px); opacity: 0; border-radius: var(--radius); } }
    @keyframes arrive { to { transform: none; filter: none; opacity: 1; } }
  </style></head><body>
    <div class="stage">
      ${heroFile ? `<figure class="hero"><img src="${dataUri(path.join(dir, heroFile))}"></figure>` : ''}
      <div class="title"><div class="en">${escapeHtml(data.title.en)}</div>${data.title.zh && data.title.zh !== data.title.en ? `<div class="zh">${escapeHtml(data.title.zh)}</div>` : ''}</div>
    </div>
    <img class="last" src="${dataUri(frames.at(-1).file)}">
  </body></html>`;

  // 換頁瞬間圖片還沒解碼會閃一下底色：先暫停錄影，等圖都準備好再接著錄，暫停的時間從時間軸扣掉
  await send('Page.stopScreencast');
  const pausedAt = Date.now() / 1000;
  const { frameTree } = await send('Page.getFrameTree');
  await send('Page.setDocumentContent', { frameId: frameTree.frame.id, html });
  await ev(`Promise.all([...document.images].map((i) => i.decode().catch(() => {}))).then(() => document.fonts.ready).then(() => true)`);
  await sleep(200);
  clock.paused += Date.now() / 1000 - pausedAt;
  captions.push({ t: videoTime(), zh: null });
  await startScreencast();
  await sleep(150);
  await ev(`document.body.classList.add('play'); true`);
  await sleep(3600);
}

// ---------- 字幕畫成透明 PNG ----------
async function renderCaptions() {
  const phone = device.mobile;
  const out = [];
  // 每句字幕顯示到下一句出現（或收起）為止
  const shown = captions.map((c, i) => ({ ...c, end: captions[i + 1]?.t ?? Infinity })).filter((c) => c.zh);
  if (!shown.length) return out;
  // 用輸出影片的版面尺寸畫，字級直接用作品集的 token
  await send('Emulation.setDeviceMetricsOverride', { width: device.width, height: device.height, deviceScaleFactor: OUT_W / device.width, mobile: device.mobile });
  await send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
  const { frameTree } = await send('Page.getFrameTree');
  for (const [i, c] of shown.entries()) {
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>
      ${PORTFOLIO_CSS}
      html, body { background: transparent; height: 100%; overflow: hidden; }
      .cap {
        position: fixed; left: 50%; transform: translateX(-50%);
        ${c.top ? `top: ${phone ? '9%' : '11%'};` : `bottom: ${phone ? '12%' : '3.5%'};`}
        width: max-content; max-width: ${phone ? '86%' : '68%'};
        padding: ${phone ? 'var(--sp-1) var(--sp-2)' : 'var(--sp-2) var(--sp-4)'};
        border-radius: var(--radius);
        background: color-mix(in srgb, var(--color-surface) 90%, transparent);
        border: 1px solid var(--color-border);
        box-shadow: 0 var(--sp-1) var(--sp-3) color-mix(in srgb, var(--color-bg) 60%, transparent);
        color: var(--color-ink); text-align: center;
      }
      .zh { font-size: ${phone ? 'var(--font-size-label)' : 'var(--font-size-body-lg)'}; font-weight: var(--font-weight-medium); line-height: 1.45; }
      .en { font-size: ${phone ? 'var(--font-size-meta)' : 'var(--font-size-label)'}; color: var(--color-muted); line-height: 1.4; margin-top: 2px; }
    </style></head><body><div class="cap"><div class="zh">${escapeHtml(c.zh)}</div>${c.en ? `<div class="en">${escapeHtml(c.en)}</div>` : ''}</div></body></html>`;
    await send('Page.setDocumentContent', { frameId: frameTree.frame.id, html });
    await ev('document.fonts.ready.then(() => true)');
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const file = path.join(workDir, `cap${i}.png`);
    fs.writeFileSync(file, Buffer.from(shot.data, 'base64'));
    out.push({ file, start: c.t, end: c.end });
  }
  return out;
}

// ---------- 鏡頭放大的時間軸 → ffmpeg 運算式 ----------
/*
  把「某段時間內從 a 值緩動到 b 值」寫成 ffmpeg 的運算式：每一段都是
  (b - a) × smoothstep((t - 開始) / 長度)，全部加起來就是整條曲線，不需要巢狀的 if。
*/
function curve(start, keys) {
  const c = (k) => `clip((it-${k.t0.toFixed(3)})/${Math.max(0.001, k.t1 - k.t0).toFixed(3)},0,1)`;
  return start.toFixed(2) + keys.map((k) => `+(${(k.to - k.from).toFixed(2)})*(${c(k)}*${c(k)}*(3-2*${c(k)}))`).join('');
}

function zoomPlan() {
  const keys = [{ t: 0, z: 1, x: device.width / 2, y: device.height / 2 }, ...focusKeys];
  const seg = (prop) => keys.slice(1).map((k, i) => ({ t0: k.t, t1: k.t + FOCUS_MS / 1000, from: keys[i][prop], to: k[prop] }));
  return { z: curve(1, seg('z')), cx: curve(keys[0].x, seg('x')), cy: curve(keys[0].y, seg('y')) };
}

// ---------- 執行 ----------
let failed = false;
try {
  await connect();
  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: device.width, height: device.height, deviceScaleFactor: device.scale, mobile: device.mobile });
  if (device.mobile) await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await send('Page.setDownloadBehavior', { behavior: 'deny' });
  // 點到上傳鈕時不要真的跳出檔案選擇視窗（headless 會卡住）；檔案由 demo.upload 直接放進去
  await send('Page.setInterceptFileChooserDialog', { enabled: true });
  await send('Page.addScriptToEvaluateOnNewDocument', { source: cursorScript(story.device) });

  // 先把起始頁載好再開始錄，影片第一格就是完整的畫面，不是一片白
  await actions.goto(story.start);
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: mouse.x, y: mouse.y });
  await sleep(400);

  await startScreencast();
  await story.run(actions);
  if (focusKeys.length && focusKeys.at(-1).z !== 1) await actions.unfocus();
  await sleep(800);
  if (story.project) await playOutro();
  await send('Page.stopScreencast');
  const duration = videoTime();

  if (frames.length < 2) throw new Error('沒有收到畫面');

  // concat demuxer：每格停留到下一格出現為止；畫面沒變化時 Chrome 不會送新的格，靠這個補足時間
  const list = [];
  frames.forEach((f, i) => {
    list.push(`file '${f.file}'`, `duration ${Math.max(0.001, (frames[i + 1]?.t ?? duration) - f.t).toFixed(4)}`);
  });
  list.push(`file '${frames.at(-1).file}'`);
  const listFile = path.join(workDir, 'list.txt');
  fs.writeFileSync(listFile, list.join('\n'));

  const caps = await renderCaptions();
  const plan = zoomPlan();
  const graph = [
    /*
      鏡頭：zoompan 每格依時間（it）算出倍率與中心，從錄影畫面裁出那一塊、縮放成輸出尺寸。
      不用「scale 放大再 crop」：中途改變畫面尺寸時 crop 只認得第一格的尺寸，
      裁切位置會被卡在左上角。zoompan 的輸入尺寸固定，沒有這個問題；它裁切時
      座標取整數的抖動，因為錄影解析度比輸出高，縮下來後小於半個像素，看不出來。
      x、y 是裁切範圍的左上角，zoom 是這一格算出來的倍率。
    */
    `[0:v]fps=${device.fps},zoompan=z='${plan.z}':` +
      `x='clip((${plan.cx})*iw/${device.width}-iw/zoom/2,0,iw-iw/zoom)':` +
      `y='clip((${plan.cy})*ih/${device.height}-ih/zoom/2,0,ih-ih/zoom)':` +
      `d=1:s=${OUT_W}x${OUT_H}:fps=${device.fps},scale=out_range=tv[v0]`,
  ];
  caps.forEach((c, i) => {
    const end = Math.min(c.end, duration);
    const d = Math.max(0.3, end - c.start);
    graph.push(`[${i + 1}:v]format=rgba,fade=t=in:st=0:d=0.25:alpha=1,fade=t=out:st=${(d - 0.25).toFixed(3)}:d=0.25:alpha=1,setpts=PTS+${c.start.toFixed(3)}/TB[c${i}]`);
    graph.push(`[v${i}][c${i}]overlay=0:0:eof_action=pass:enable='between(t,${c.start.toFixed(3)},${end.toFixed(3)})'[v${i + 1}]`);
  });
  graph.push(`[v${caps.length}]format=yuv420p[out]`);
  const graphFile = path.join(workDir, 'graph.txt');
  fs.writeFileSync(graphFile, graph.join(';\n'));
  if (process.env.DEMO_DEBUG) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(path.join(OUT_DIR, `${name}-debug.json`), JSON.stringify({ duration, frames: frames.length, focusKeys, captions, graph }, null, 1));
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const out = path.join(OUT_DIR, `${name}.mp4`);
  const capInputs = caps.flatMap((c) => ['-loop', '1', '-framerate', String(device.fps), '-t', Math.max(0.3, Math.min(c.end, duration) - c.start).toFixed(3), '-i', c.file]);
  const ff = spawnSync('ffmpeg', [
    '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', listFile, ...capInputs,
    '-/filter_complex', graphFile, '-map', '[out]',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-pix_fmt', 'yuv420p', '-color_range', 'tv',
    '-movflags', '+faststart', '-an', out,
  ], { stdio: 'inherit' });
  if (ff.status !== 0) throw new Error('ffmpeg 合成失敗');

  const seconds = Number(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out]).stdout.toString().trim());
  const mb = fs.statSync(out).size / 1024 / 1024;
  console.log(`${path.relative(ROOT, out)}：${seconds.toFixed(1)} 秒，${mb.toFixed(1)} MB，${OUT_W}×${OUT_H}，${frames.length} 格，鏡頭對焦 ${focusKeys.length} 次，字幕 ${caps.length} 句`);
  if (seconds < (story.minSeconds ?? 30)) console.warn(`⚠ 比 ${story.minSeconds ?? 30} 秒短`);

  // 總覽圖：每 3 秒抽一格排成一張，上傳前檢查有沒有錄到不該出現的東西
  const sheet = path.join(OUT_DIR, `${name}-sheet.jpg`);
  const cols = device.mobile ? 8 : 4;
  const rows = Math.ceil(seconds / 3 / cols);
  spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', out, '-vf', `fps=1/3,scale=${device.mobile ? 260 : 480}:-2,tile=${cols}x${rows}:padding=6`, '-frames:v', '1', '-q:v', '4', sheet]);
  console.log(`總覽圖：${path.relative(ROOT, sheet)}`);
} catch (e) {
  failed = true;
  console.error(e.message ?? e);
  // 腳本卡住時留一張當下的畫面，才看得出是點錯地方、還是頁面根本沒走到那一步
  try {
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(path.join(OUT_DIR, `${name}-error.png`), Buffer.from(shot.data, 'base64'));
    console.error(`出錯當下的畫面：${path.relative(ROOT, path.join(OUT_DIR, `${name}-error.png`))}`);
  } catch {}
} finally {
  ws?.close();
  chrome.kill();
  await sleep(300);
  fs.rmSync(profile, { recursive: true, force: true });
  fs.rmSync(workDir, { recursive: true, force: true });
  process.exitCode = failed ? 1 : 0;
}
