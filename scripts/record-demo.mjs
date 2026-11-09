/*
  案例頁示範影片的錄影工具。   執行：npm run demo:record -- <腳本名稱>

  為什麼存在：每個案例都要一支 30 秒以上、從頭走完核心流程的示範影片。手動錄的話，
  產品一改版就得整支重錄，節奏和游標路徑每次也都不一樣。把流程寫成腳本，
  改版後重跑一次就好，錄出來的節奏永遠一致。

  做法：開 headless Chrome（用 Node 內建的 WebSocket 走 DevTools Protocol，不裝套件），
  照 scripts/demos/<名稱>.mjs 的腳本操作正式站，同時用 Page.startScreencast 收每一格畫面，
  最後交給 ffmpeg 依每格的時間戳記合成固定 30fps 的 MP4（H.264、無聲、faststart）。

  游標：headless 沒有系統游標，改在頁面上疊一層圖形，跟著腳本送出的滑鼠事件移動。
  桌機是箭頭，點擊時有一圈波紋；手機是觸控圓點，只在按下時出現。
  換頁後會接續停在上一頁的位置（存在 sessionStorage），不會跳回畫面中央。

  字幕：demo.caption('…') 在畫面下方顯示一句英文說明，直接錄進影片（中英文版頁面
  播的是同一支）。字幕不是網站文案，所以寫在腳本裡、不放 src/content/。

  敏感資訊：每次都用全新的空白 Chrome 設定檔（沒有任何登入狀態、cookie、紀錄），
  只錄網頁內容、不錄網址列。腳本裡輸入的一律是假資料；頁面上有不該公開的內容時
  用 demo.mask(選擇器) 模糊掉。錄完會另外輸出一張每 3 秒抽一格的總覽圖
  （.demo-out/<名稱>-sheet.jpg），上傳前逐格看過一遍。

  輸出到 .demo-out/<名稱>.mp4（不進版控），確認沒問題再複製到案例的圖片資料夾。
  桌機輸出 1920×1200（16:10），手機輸出 780×1688（直式）。

  參數也可以直接給腳本檔路徑：npm run demo:record -- ./某處/test.mjs

  腳本格式：
    export default {
      device: 'desktop' | 'phone',
      start: 'https://…',        // 開始錄影前先載入好的頁面
      minSeconds: 30,             // 選填，錄出來比這短會警告
      async run(demo) { … },      // demo 提供的動作見下方 actions
    }
*/
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, '.demo-out');
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const DEVICES = {
  // 1440×900 是一般筆電瀏覽器的版面寬度；放大 4/3 倍輸出成 1920×1200，字才夠銳利
  desktop: { width: 1440, height: 900, scale: 4 / 3, mobile: false },
  phone: { width: 390, height: 844, scale: 2, mobile: true },
};

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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

// ---------- 疊在頁面上的游標（每個新文件載入時注入） ----------
const cursorScript = (kind) => `(() => {
  if (window.top !== window) return;
  const KEY = '__demoCursor';
  const init = () => {
    if (document.getElementById(KEY)) return;
    const el = document.createElement('div');
    el.id = KEY;
    el.style.cssText = 'position:fixed;left:0;top:0;z-index:2147483647;pointer-events:none;will-change:transform';
    ${kind === 'phone'
      ? `el.innerHTML = '<div style="width:38px;height:38px;margin:-19px 0 0 -19px;border-radius:50%;background:rgba(255,255,255,.55);border:2px solid rgba(0,0,0,.25);box-shadow:0 2px 10px rgba(0,0,0,.25);transition:opacity .18s,transform .18s;opacity:0;transform:scale(.6)"></div>';`
      : `el.innerHTML = '<svg width="26" height="26" viewBox="0 0 26 26" style="display:block;filter:drop-shadow(0 1px 2px rgba(0,0,0,.35));transition:transform .12s"><path d="M3 2 L3 21 L8.2 16.4 L11.6 24 L15 22.5 L11.7 15 L18.6 15 Z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';`}
    document.documentElement.appendChild(el);
    const mark = el.firstElementChild;
    const saved = JSON.parse(sessionStorage.getItem(KEY) || 'null');
    const place = (x, y) => {
      el.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      try { sessionStorage.setItem(KEY, JSON.stringify({ x, y })); } catch {}
    };
    place(saved ? saved.x : innerWidth / 2, saved ? saved.y : innerHeight / 2);
    const ripple = (x, y) => {
      const r = document.createElement('div');
      r.style.cssText = 'position:fixed;left:' + x + 'px;top:' + y + 'px;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;border:2px solid rgba(120,120,255,.9);pointer-events:none;z-index:2147483646';
      document.documentElement.appendChild(r);
      r.animate([{ transform: 'scale(.3)', opacity: 1 }, { transform: 'scale(1.4)', opacity: 0 }], { duration: 480, easing: 'ease-out' }).onfinish = () => r.remove();
    };
    const down = (x, y) => {
      ${kind === 'phone' ? `mark.style.opacity = 1; mark.style.transform = 'scale(1)';` : `mark.style.transform = 'scale(.86)'; ripple(x, y);`}
    };
    const up = () => {
      ${kind === 'phone' ? `mark.style.opacity = 0; mark.style.transform = 'scale(.6)';` : `mark.style.transform = 'scale(1)';`}
    };
    addEventListener('mousemove', (e) => place(e.clientX, e.clientY), true);
    addEventListener('mousedown', (e) => { place(e.clientX, e.clientY); down(e.clientX, e.clientY); }, true);
    addEventListener('mouseup', up, true);
    addEventListener('touchstart', (e) => { const t = e.touches[0]; if (t) { place(t.clientX, t.clientY); down(t.clientX, t.clientY); } }, true);
    addEventListener('touchmove', (e) => { const t = e.touches[0]; if (t) place(t.clientX, t.clientY); }, true);
    addEventListener('touchend', up, true);

    // 字幕：畫面下方一條說明，換一句時淡出再淡入。存在 sessionStorage，換頁後接著顯示
    const cap = document.createElement('div');
    cap.style.cssText = 'position:fixed;left:50%;bottom:${kind === 'phone' ? '12%' : '7%'};z-index:2147483646;pointer-events:none;max-width:${kind === 'phone' ? '88%' : '70%'};padding:${kind === 'phone' ? '8px 14px' : '12px 26px'};border-radius:12px;background:rgba(12,12,14,.8);color:#fff;font:600 ${kind === 'phone' ? '14px' : '22px'}/1.4 Inter,-apple-system,BlinkMacSystemFont,system-ui,sans-serif;text-align:center;letter-spacing:.01em;box-shadow:0 6px 24px rgba(0,0,0,.3);opacity:0;transform:translate(-50%,8px);transition:opacity .28s,transform .28s';
    document.documentElement.appendChild(cap);
    const BOTTOM = '${kind === 'phone' ? '12%' : '7%'}', TOP = '${kind === 'phone' ? '9%' : '11%'}';
    const show = (t, top) => {
      if (t) {
        cap.textContent = t;
        cap.style.top = top ? TOP : 'auto';
        cap.style.bottom = top ? 'auto' : BOTTOM;
        cap.style.opacity = 1;
        cap.style.transform = 'translate(-50%,0)';
      } else { cap.style.opacity = 0; cap.style.transform = 'translate(-50%,8px)'; }
    };
    window.__demoCaption = (t, top) => {
      try { sessionStorage.setItem(KEY + 'Caption', JSON.stringify([t || '', !!top])); } catch {}
      if (cap.style.opacity === '1' && t) { show(null); setTimeout(() => show(t, top), 280); } else show(t, top);
    };
    show(...JSON.parse(sessionStorage.getItem(KEY + 'Caption') || '["",false]'));
  };
  if (document.body) init(); else document.addEventListener('DOMContentLoaded', init);
})()`;

// 在頁面裡找元素：CSS 選擇器，或 "text:字樣"（可見元素中，文字包含它、而且最短的那一個）
const FIND = `(q) => {
  const vis = (el) => { const b = el.getBoundingClientRect(); const cs = getComputedStyle(el); return b.width > 0 && b.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
  if (q.startsWith('text:')) {
    const t = q.slice(5);
    const all = [...document.querySelectorAll('button, a, [role=button], [role=tab], label, summary, input, h1, h2, h3, h4, p, span, li, div')]
      .filter((el) => vis(el) && (el.innerText || el.value || '').trim().includes(t));
    return all.sort((a, b) => (a.innerText || '').length - (b.innerText || '').length)[0] ?? null;
  }
  return [...document.querySelectorAll(q)].find(vis) ?? null;
}`;

// ---------- Chrome ----------
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'demo-rec-'));
const framesDir = fs.mkdtempSync(path.join(os.tmpdir(), 'demo-frames-'));
const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--hide-scrollbars', '--mute-audio', 'about:blank'], { stdio: 'ignore' });

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
      const file = path.join(framesDir, `f${String(frames.length).padStart(6, '0')}.jpg`);
      fs.writeFileSync(file, Buffer.from(d.params.data, 'base64'));
      frames.push({ file, t: d.params.metadata.timestamp });
      ws.send(JSON.stringify({ id: ++id, method: 'Page.screencastFrameAck', params: { sessionId: d.params.sessionId } }));
    }
    if (d.method === 'Page.loadEventFired') { loadWaiters.forEach((r) => r()); loadWaiters = []; }
    // 頁面跳出 alert／confirm 會卡住整個錄影，一律直接關掉
    if (d.method === 'Page.javascriptDialogOpening') ws.send(JSON.stringify({ id: ++id, method: 'Page.handleJavaScriptDialog', params: { accept: true } }));
  });
}

// ---------- 給腳本用的動作 ----------
const mouse = { x: device.width / 2, y: device.height / 2 };

async function locate(q, timeout = 10000) {
  const until = Date.now() + timeout;
  while (Date.now() < until) {
    const r = await ev(`(() => { const el = (${FIND})(${JSON.stringify(q)}); if (!el) return null; const b = el.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2, top: b.top, bottom: b.bottom }; })()`);
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

  // 游標用緩動曲線移過去，不是瞬移——錄起來才像真人在操作
  async moveTo(target, ms = 650) {
    const to = typeof target === 'string' ? await actions.reveal(target) : target;
    const from = { ...mouse };
    const steps = Math.max(8, Math.round(ms / 16));
    for (let i = 1; i <= steps; i++) {
      const k = ease(i / steps);
      mouse.x = from.x + (to.x - from.x) * k;
      mouse.y = from.y + (to.y - from.y) * k;
      await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: mouse.x, y: mouse.y });
      await sleep(16);
    }
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

  async key(keyName) {
    const codes = { Enter: 13, Tab: 9, Escape: 27, Backspace: 8 };
    const base = { key: keyName, code: keyName, windowsVirtualKeyCode: codes[keyName] ?? 0 };
    await send('Input.dispatchKeyEvent', { type: 'keyDown', ...base, ...(keyName === 'Enter' ? { text: '\r' } : {}) });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', ...base });
  },

  // 平滑捲動。桌機用滾輪事件、手機用觸控滑動手勢，正值往下。
  // 滾輪捲的是游標底下那個區塊（側欄和內容區常常各自捲動），要捲別處就給 at，游標會先移過去
  async scroll(dy, { ms = 900, at } = {}) {
    if (at) await actions.moveTo(at, 450);
    if (device.mobile) {
      // speed 只收整數（px／秒），帶小數會整個指令被拒
      await send('Input.synthesizeScrollGesture', { x: Math.round(device.width / 2), y: Math.round(device.height * 0.6), yDistance: -Math.round(dy), speed: Math.round(Math.max(400, Math.abs(dy) / (ms / 1000))), gestureSourceType: 'touch' });
      await sleep(250);
      return;
    }
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

  // 元素不在畫面裡就先平滑捲過去（停在畫面約 40% 高的位置），回傳它的中心點。
  // 游標先移到元素所在的那一欄再捲，捲到的才會是包著它的那個捲動區塊
  async reveal(q) {
    let r = await locate(q);
    if (r.top < device.height * 0.12 || r.bottom > device.height * 0.88) {
      const x = Math.min(Math.max(r.x, device.width * 0.05), device.width * 0.95);
      await actions.scroll(r.top - device.height * 0.4, { ms: 800, at: { x, y: device.height * 0.55 } });
      r = await locate(q);
    }
    return r;
  },

  hover: (q) => actions.moveTo(q),

  // 英文字幕，簡短說明現在這個畫面在做什麼；給 null 收起來。直接錄進影片，不是另外的字幕檔。
  // 預設在畫面下方，會擋到重點內容時給 { top: true } 改放上方
  async caption(text, { top = false } = {}) {
    await ev(`window.__demoCaption && window.__demoCaption(${JSON.stringify(text)}, ${top})`);
    await sleep(300);
  },

  // 把符合選擇器的元素模糊掉（之後出現的也會套到），錄到個資或不該公開的資料時用
  async mask(selector) {
    await ev(`(() => { const s = document.createElement('style'); s.textContent = ${JSON.stringify(`${selector} { filter: blur(8px) !important; }`)}; document.head.append(s); })()`);
  },

  async upload(selector, filePath) {
    const { root } = await send('DOM.getDocument', { depth: 0 });
    const { nodeId } = await send('DOM.querySelector', { nodeId: root.nodeId, selector });
    if (!nodeId) throw new Error(`找不到上傳欄位：${selector}`);
    await send('DOM.setFileInputFiles', { nodeId, files: [path.resolve(filePath)] });
  },

  eval: (js) => ev(js),
};

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
  await send('Page.addScriptToEvaluateOnNewDocument', { source: cursorScript(story.device) });

  // 先把起始頁載好再開始錄，影片第一格就是完整的畫面，不是一片白
  await actions.goto(story.start);
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: mouse.x, y: mouse.y });
  await sleep(400);

  const w = Math.round(device.width * device.scale), h = Math.round(device.height * device.scale);
  await send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: w, maxHeight: h, everyNthFrame: 1 });
  const startedAt = Date.now() / 1000;
  await story.run(actions);
  await sleep(1000);
  await send('Page.stopScreencast');
  const endedAt = Date.now() / 1000;

  if (frames.length < 2) throw new Error('沒有收到畫面');

  // concat demuxer：每格停留到下一格出現為止；畫面沒變化時 Chrome 不會送新的格，靠這個補足時間
  const list = [];
  frames.forEach((f, i) => {
    const next = frames[i + 1]?.t ?? frames[0].t + (endedAt - startedAt);
    list.push(`file '${f.file}'`, `duration ${Math.max(0.001, next - f.t).toFixed(4)}`);
  });
  list.push(`file '${frames.at(-1).file}'`);
  const listFile = path.join(framesDir, 'list.txt');
  fs.writeFileSync(listFile, list.join('\n'));

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const out = path.join(OUT_DIR, `${name}.mp4`);
  const ff = spawnSync('ffmpeg', [
    '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', listFile,
    // 截圖是 JPEG 的全範圍色彩，要轉成影片標準的 tv 範圍，不然有些播放器會偏色
    '-vf', `fps=30,scale=${w}:${h}:flags=lanczos:out_range=tv,format=yuv420p`,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-pix_fmt', 'yuv420p', '-color_range', 'tv',
    '-movflags', '+faststart', '-an', out,
  ], { stdio: 'inherit' });
  if (ff.status !== 0) throw new Error('ffmpeg 合成失敗');

  const seconds = Number(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out]).stdout.toString().trim());
  const mb = fs.statSync(out).size / 1024 / 1024;
  console.log(`${path.relative(ROOT, out)}：${seconds.toFixed(1)} 秒，${mb.toFixed(1)} MB，${w}×${h}，${frames.length} 格`);

  // 總覽圖：每 3 秒抽一格排成一張，上傳前檢查有沒有錄到不該出現的東西
  const sheet = path.join(OUT_DIR, `${name}-sheet.jpg`);
  const cols = device.mobile ? 8 : 4;
  const rows = Math.ceil(seconds / 3 / cols);
  spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', out, '-vf', `fps=1/3,scale=${device.mobile ? 260 : 480}:-2,tile=${cols}x${rows}:padding=6`, '-frames:v', '1', '-q:v', '4', sheet]);
  console.log(`總覽圖：${path.relative(ROOT, sheet)}`);
  if (seconds < (story.minSeconds ?? 30)) console.warn(`⚠ 比 ${story.minSeconds ?? 30} 秒短`);
} catch (e) {
  failed = true;
  console.error(e.message ?? e);
} finally {
  ws?.close();
  chrome.kill();
  await sleep(300);
  fs.rmSync(profile, { recursive: true, force: true });
  fs.rmSync(framesDir, { recursive: true, force: true });
  process.exitCode = failed ? 1 : 0;
}
