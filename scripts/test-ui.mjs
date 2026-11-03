/*
  作品集按鈕與互動的回歸測試。   執行：npm run test:ui

  為什麼存在：這個站的互動壞掉時幾乎都是「無聲的」——主控台沒有錯誤、build 全綠、
  畫面乍看正常，只有在某個寬度真的點下去才發現沒反應。第一次全站跑就抓到四個這種問題：
  平板寬度首頁「閱讀更多」被下一段蓋住、案例頁圖片載入前不佔位導致段落導覽捲過頭、
  只有一張圖時檢視器還有左右鍵、英文導覽在 768 折行後中央點不到。

  做法：開 headless Chrome（用 Node 內建的 WebSocket 走 DevTools Protocol，不裝套件），
  爬出站上每一頁，用真實的滑鼠事件去點；點之前先確認按鈕中心點沒有被別的元素蓋住。
  測：頁內錨點、按鈕是否被蓋住、主題與語言切換、Read more、更新日誌、輪播、
  圖片檢視器、段落導覽、返回鍵、JS 錯誤與載入失敗，最後把所有連結打一次確認沒壞。

  前提：dev server 要先開著（npx astro dev --background）。

  參數（npm 要加 -- 才傳得進來，例如 npm run test:ui -- --width 768）：
    --width 768       只跑一個寬度，預設 375、768、1440 依序跑
    --only foodlet    只測路徑符合這個正規式的頁面
    --base <網址>      改測別的站，預設 http://localhost:4321
  Chrome 不在預設位置時，用環境變數 CHROME_PATH 指定。

  每個寬度的完整結果寫在 .ui-test/<寬度>.json，連結檢查寫在 .ui-test/links.json。
  有任何一項失敗時 exit code 為 1。
*/
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, '.ui-test');

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const WIDTHS = opt('width') ? [Number(opt('width'))] : [375, 768, 1440];
const ONLY = opt('only') ? new RegExp(opt('only')) : null;
const BASE = new URL(opt('base') ?? 'http://localhost:4321').origin;
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
// 有些站外網站看到 Node 預設的 user-agent 就直接回 403，冒充一般瀏覽器比較接近訪客實際看到的結果
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const slash = (p) => p.replace(/\/?$/, '/');

// ---------- 1. 找出所有頁面 ----------
async function crawl() {
  const seen = new Set();
  const queue = ['/', '/zh/', '/en/'];
  while (queue.length) {
    const p = queue.shift();
    if (seen.has(p)) continue;
    seen.add(p);
    let html;
    try {
      const res = await fetch(BASE + p);
      if (!res.ok || !res.headers.get('content-type')?.includes('html')) continue;
      html = await res.text();
    } catch { continue; }
    for (const m of html.matchAll(/href="([^"#?]+)/g)) {
      let u;
      try { u = new URL(m[1], BASE + p); } catch { continue; }
      if (u.origin !== BASE) continue;
      if (/\.[a-z0-9]+$/i.test(u.pathname)) continue;
      if (u.pathname.startsWith('/admin') || u.pathname.startsWith('/_')) continue;
      if (!seen.has(u.pathname)) queue.push(u.pathname);
    }
  }
  // 根目錄只是轉址到預設語系，不算一頁
  return [...seen].filter((p) => p !== '/').sort();
}

// ---------- 2. CDP ----------
let ws, id = 0;
const pending = new Map();
const listeners = [];
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expr) => {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description ?? 'eval error');
  return r.result?.result?.value;
};
const waitEvent = (method, ms = 15000) => new Promise((resolve) => {
  const t = setTimeout(() => { done(); resolve(false); }, ms);
  const fn = (d) => { if (d.method === method) { clearTimeout(t); done(); resolve(true); } };
  const done = () => listeners.splice(listeners.indexOf(fn), 1);
  listeners.push(fn);
});

let pageErrors = [];

// 每個寬度開一個乾淨的 Chrome（獨立 profile，localStorage 不會帶到下一輪），回傳關閉用的函式
async function openBrowser(width, height) {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'ui-test-'));
  const chrome = spawn(CHROME, [
    '--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--hide-scrollbars', 'about:blank',
  ], { stdio: 'ignore' });

  // port 0 讓 Chrome 自己挑空的 port，挑好後寫進 profile 裡的 DevToolsActivePort
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
  pending.clear();
  ws.addEventListener('message', (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); return; }
    if (d.method === 'Runtime.exceptionThrown') pageErrors.push('exception: ' + (d.params.exceptionDetails.exception?.description ?? d.params.exceptionDetails.text).split('\n')[0]);
    if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') pageErrors.push('console.error: ' + d.params.args.map((a) => a.value ?? a.description).join(' ').slice(0, 200));
    if (d.method === 'Network.responseReceived' && d.params.response.status >= 400) pageErrors.push(`HTTP ${d.params.response.status}: ${d.params.response.url}`);
    if (d.method === 'Network.loadingFailed' && !d.params.canceled && d.params.errorText !== 'net::ERR_ABORTED') pageErrors.push(`載入失敗 ${d.params.errorText}`);
    listeners.slice().forEach((fn) => fn(d));
  });
  await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 768 });

  return async () => {
    ws.close();
    if (chrome.exitCode === null) {
      chrome.kill();
      await Promise.race([new Promise((r) => chrome.once('exit', r)), sleep(3000)]);
    }
    fs.rmSync(profile, { recursive: true, force: true });
  };
}

async function goto(page) {
  pageErrors = [];
  const loaded = waitEvent('Page.loadEventFired');
  await send('Page.navigate', { url: BASE + page });
  await loaded;
  await sleep(1200);
}
async function mouseClick(x, y) {
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
}
// 捲到元素、確認中心點真的點得到它，再用真實滑鼠事件點下去
async function clickEl(expr) {
  const r = await ev(`(() => { const el = ${expr}; if (!el) return null;
    el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' });
    const b = el.getBoundingClientRect(); const x = b.left + b.width / 2, y = b.top + b.height / 2;
    const hit = document.elementFromPoint(x, y);
    return { x, y, ok: !!hit && (hit === el || el.contains(hit)), hit: hit ? hit.tagName.toLowerCase() + (hit.className && typeof hit.className === 'string' ? '.' + hit.className.trim().split(/\\s+/).join('.') : '') : null };
  })()`);
  if (!r) return { found: false };
  await sleep(750); // 等 data-reveal 的進場位移跑完，否則座標會落在動畫途中
  // 捲動後重算一次座標（scroll-behavior / reveal 動畫可能讓位置位移）
  const r2 = await ev(`(() => { const el = ${expr}; const b = el.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; })()`);
  await mouseClick(r2.x, r2.y);
  return { found: true, ...r };
}
const key = async (k) => {
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: k, code: k, windowsVirtualKeyCode: k === 'Escape' ? 27 : 0 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code: k, windowsVirtualKeyCode: k === 'Escape' ? 27 : 0 });
};

// ---------- 3. 測試 ----------
let results, current;
const allLinks = {};
const check = (name, pass, detail = '') => { current.checks.push({ name, pass: !!pass, detail }); };

async function testPage(page) {
  current = { checks: [], errors: [], counts: {} };
  results.pages[page] = current;
  await goto(page);

  // 連結蒐集（用 a.href 拿解析後的絕對網址，最後統一檢查狀態碼）
  const links = await ev(`[...document.querySelectorAll('a[href]')].filter(a => !a.closest('astro-dev-toolbar')).map(a => a.href)`);
  for (const h of links) (allLinks[h.split('#')[0]] ??= new Set()).add(page);
  current.counts.links = links.length;

  // 頁內錨點連結：目標 id 要存在
  const badHash = await ev(`[...document.querySelectorAll('a[href^="#"]')].map(a => a.getAttribute('href')).filter(h => h.length > 1 && !document.getElementById(decodeURIComponent(h.slice(1))))`);
  check('頁內錨點目標存在', badHash.length === 0, badHash.join(', '));

  // 每顆可見按鈕都點得到（中心點沒被別的元素蓋住）
  const blocked = await ev(`(() => {
    const out = []; let n = 0;
    for (const el of document.querySelectorAll('button, a[href]')) {
      if (el.closest('astro-dev-toolbar, [aria-hidden="true"], [hidden], [data-viewer]')) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || cs.pointerEvents === 'none') continue;
      const b0 = el.getBoundingClientRect(); if (b0.width < 2 || b0.height < 2) continue;
      if (el.closest('.photo-marquee, .marquee')) continue; // 跑馬燈一直在動，中心點會一直變
      el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
      const b = el.getBoundingClientRect();
      if (b.bottom < 0 || b.top > innerHeight || b.right < 0 || b.left > innerWidth) continue;
      if (getComputedStyle(el.closest('[data-section-nav]') ?? el).opacity === '0') continue;
      n++;
      const x = Math.min(Math.max(b.left + b.width / 2, 1), innerWidth - 1), y = Math.min(Math.max(b.top + b.height / 2, 1), innerHeight - 1);
      const hit = document.elementFromPoint(x, y);
      if (!hit || !(hit === el || el.contains(hit))) {
        out.push((el.tagName === 'BUTTON' ? 'button' : 'a') + ' 「' + (el.getAttribute('aria-label') || el.textContent.trim().slice(0, 24) || el.getAttribute('href')) + '」被 ' + (hit ? hit.tagName.toLowerCase() + '.' + String(hit.className).trim().split(/\\s+/).slice(0, 2).join('.') : 'null') + ' 蓋住');
      }
    }
    scrollTo({ top: 0, behavior: 'instant' });
    return { n, out };
  })()`);
  current.counts.clickable = blocked.n;
  check('可見的按鈕／連結都點得到', blocked.out.length === 0, blocked.out.join('\n'));
  await sleep(300);

  // 主題切換
  if (await ev(`!!document.getElementById('theme-toggle')`)) {
    const before = await ev(`document.documentElement.dataset.theme`);
    const c = await clickEl(`document.getElementById('theme-toggle')`);
    await sleep(200);
    const after = await ev(`({ t: document.documentElement.dataset.theme, s: localStorage.getItem('theme') })`);
    check('主題切換：點一下會換主題並記住', c.ok && after.t !== before && after.s === after.t, `${before} → ${after.t}（storage=${after.s}）${c.ok ? '' : ' 被 ' + c.hit + ' 蓋住'}`);
    await clickEl(`document.getElementById('theme-toggle')`);
    await sleep(200);
    check('主題切換：再點一下切回來', (await ev(`document.documentElement.dataset.theme`)) === before);
  }

  // 語言切換：指向另一語系的同一頁
  const lang = await ev(`document.querySelector('.lang-toggle')?.getAttribute('href') ?? null`);
  if (lang !== null) {
    const expect = page.replace(/^\/(zh|en)(\/|$)/, (_, l, s) => `/${l === 'zh' ? 'en' : 'zh'}${s}`);
    check('語言切換指向另一語系的同一頁', slash(lang) === slash(expect), `${lang}（預期 ${expect}）`);
  }

  // Read more（收合中的更新日誌裡那幾顆，留給下面的更新日誌測試展開後再點）
  const rm = await ev(`[...document.querySelectorAll('[data-read-more-btn]')].filter(b => !b.hidden && b.offsetParent && !b.closest('details:not([open])')).length`);
  current.counts.readMore = rm;
  for (let i = 0; i < rm; i++) {
    const sel = `[...document.querySelectorAll('[data-read-more-btn]')].filter(b => !b.hidden && b.offsetParent && !b.closest('details:not([open])'))[${i}]`;
    const h0 = await ev(`${sel}.closest('[data-read-more]').querySelector('[data-read-more-body]').getBoundingClientRect().height`);
    const c = await clickEl(sel);
    await sleep(700);
    const s1 = await ev(`({ e: ${sel}.getAttribute('aria-expanded'), h: ${sel}.closest('[data-read-more]').querySelector('[data-read-more-body]').getBoundingClientRect().height })`);
    await clickEl(sel);
    await sleep(700);
    const s2 = await ev(`({ e: ${sel}.getAttribute('aria-expanded'), h: ${sel}.closest('[data-read-more]').querySelector('[data-read-more-body]').getBoundingClientRect().height })`);
    check(`Read more #${i + 1}：展開再收合`, c.ok && s1.e === 'true' && s1.h > h0 && s2.e === 'false' && Math.abs(s2.h - h0) < 4, `高度 ${Math.round(h0)} → ${Math.round(s1.h)} → ${Math.round(s2.h)}，aria-expanded ${s1.e}/${s2.e}${c.ok ? '' : '，被 ' + c.hit + ' 蓋住'}`);
  }

  // 更新日誌（原生 details）
  const det = await ev(`document.querySelectorAll('main details').length`);
  current.counts.details = det;
  for (let i = 0; i < det; i++) {
    const d = `document.querySelectorAll('main details')[${i}]`;
    // 放在輪播裡、目前沒顯示的那一頁：先用真的「下一張」鍵切過去
    for (let k = 0; k < 10 && (await ev(`!!${d}.closest('[data-carousel-slide][hidden]')`)); k++) {
      await clickEl(`${d}.closest('[data-carousel]').querySelector('[data-carousel-next]')`); await sleep(300);
    }
    const c = await clickEl(`${d}.querySelector('summary')`); await sleep(500);
    const o1 = await ev(`${d}.open`);
    const inner = await ev(`[...${d}.querySelectorAll('[data-read-more-btn]')].filter(b => !b.hidden).length`);
    let innerOk = true, innerDetail = '';
    for (let k = 0; k < inner; k++) {
      const sel = `[...${d}.querySelectorAll('[data-read-more-btn]')].filter(b => !b.hidden)[${k}]`;
      const h0 = await ev(`${sel}.closest('[data-read-more]').querySelector('[data-read-more-body]').getBoundingClientRect().height`);
      const rc = await clickEl(sel); await sleep(700);
      const s1 = await ev(`({ e: ${sel}.getAttribute('aria-expanded'), h: ${sel}.closest('[data-read-more]').querySelector('[data-read-more-body]').getBoundingClientRect().height })`);
      await clickEl(sel); await sleep(700);
      const ok = rc.ok && s1.e === 'true' && s1.h > h0;
      innerOk &&= ok;
      innerDetail += `；裡面的 Read more #${k + 1} 高度 ${Math.round(h0)} → ${Math.round(s1.h)}${rc.ok ? '' : '（被 ' + rc.hit + ' 蓋住）'}`;
    }
    const c2 = await clickEl(`${d}.querySelector('summary')`); await sleep(500);
    const o2 = await ev(`${d}.open`);
    check(`更新日誌 #${i + 1}：展開${inner ? '、內文 Read more' : ''}、收合`, c.ok && c2.ok && o1 === true && o2 === false && innerOk, `open ${o1} → ${o2}${innerDetail}${c.ok ? '' : '，標題被 ' + c.hit + ' 蓋住'}`);
  }

  // 輪播。起點不一定是第 1 張——上面的更新日誌測試可能已經把它往後切過，
  // 所以一律以目前那張為基準：下一張 → +1、上一張 → 回原位、退回第 1 張後再上一張 → 循環到最後一張
  const cars = await ev(`document.querySelectorAll('[data-carousel].is-carousel').length`);
  current.counts.carousels = cars;
  for (let i = 0; i < cars; i++) {
    const root = `document.querySelectorAll('[data-carousel].is-carousel')[${i}]`;
    const state = `(() => { const r = ${root}; const s = [...r.querySelectorAll('[data-carousel-slide]')].filter(x => x.closest('[data-carousel]') === r); return { count: r.querySelector('[data-carousel-count]').textContent.trim(), visible: s.map((x, j) => x.hidden ? -1 : j).filter(j => j >= 0), n: s.length }; })()`;
    const at = (s, j) => s.visible.join() === String(j) && s.count === `${j + 1} / ${s.n}`;
    const s0 = await ev(state);
    const start = s0.visible[0], n = s0.n;
    const cn = await clickEl(`${root}.querySelector('[data-carousel-next]')`); await sleep(300);
    const s1 = await ev(state);
    const cp = await clickEl(`${root}.querySelector('[data-carousel-prev]')`); await sleep(300);
    const s2 = await ev(state);
    for (let k = 0; k <= start; k++) { await clickEl(`${root}.querySelector('[data-carousel-prev]')`); await sleep(300); }
    const s3 = await ev(state);
    check(`輪播 #${i + 1}：下一張／上一張／循環`,
      cn.ok && cp.ok && at(s0, start) && at(s1, (start + 1) % n) && at(s2, start) && at(s3, n - 1),
      `${s0.count} → 下一張 ${s1.count} → 上一張 ${s2.count} → 退到第 1 張再上一張 ${s3.count}${cn.ok ? '' : '；下一張鍵被 ' + cn.hit + ' 蓋住'}${cp.ok ? '' : '；上一張鍵被 ' + cp.hit + ' 蓋住'}`);
  }

  // 圖片檢視器（包在連結裡的圖點了是換頁，不算可放大的圖）
  const zoom = await ev(`(() => { const list = [...document.querySelectorAll('main .media img, main .photo-grid img')].filter(i => i.getBoundingClientRect().width > 40 && !i.closest('a')); return list.length; })()`);
  current.counts.zoomable = zoom;
  if (zoom > 0 && (await ev(`!!document.querySelector('[data-viewer]')`))) {
    const first = `[...document.querySelectorAll('main .media img, main .photo-grid img')].filter(i => i.getBoundingClientRect().width > 40 && !i.closest('a'))[0]`;
    const c = await clickEl(first);
    await sleep(600);
    const open = await ev(`({ open: !document.querySelector('[data-viewer]').hidden, src: document.querySelector('[data-viewer-image]').getAttribute('src'), lock: document.documentElement.style.overflow })`);
    check('圖片檢視器：點圖會開啟並鎖住背景捲動', c.ok && open.open && !!open.src && open.lock === 'hidden', `${open.open ? '已開啟' : '沒有開啟'}${c.ok ? '' : '，圖被 ' + c.hit + ' 蓋住'}`);
    if (open.open) {
      const total = await ev(`[...document.querySelectorAll('main .media img, main .photo-grid img, main .photo-marquee img')].filter(i => !i.closest('a')).length`);
      if (total === 1) {
        const arrows = await ev(`['[data-viewer-prev]', '[data-viewer-next]'].map(s => { const el = document.querySelector(s); const cs = getComputedStyle(el); return !el.hidden && cs.display !== 'none' && cs.visibility !== 'hidden' && cs.opacity !== '0'; })`);
        check('圖片檢視器：只有一張圖時不顯示左右鍵', !arrows[0] && !arrows[1], arrows[0] || arrows[1] ? '只有 1 張可放大的圖，左右鍵仍然顯示，按下去還是同一張' : '');
      }
      if (total > 1) {
        const cn = await clickEl(`document.querySelector('[data-viewer-next]')`); await sleep(500);
        const src1 = await ev(`document.querySelector('[data-viewer-image]').getAttribute('src')`);
        const cp = await clickEl(`document.querySelector('[data-viewer-prev]')`); await sleep(500);
        const src2 = await ev(`document.querySelector('[data-viewer-image]').getAttribute('src')`);
        check('圖片檢視器：下一張／上一張', cn.ok && cp.ok && src1 !== open.src && src2 === open.src, `${cn.ok ? '' : '下一張鍵被 ' + cn.hit + ' 蓋住 '}${cp.ok ? '' : '上一張鍵被 ' + cp.hit + ' 蓋住'}`);
      }
      await key('Escape'); await sleep(400);
      const esc = await ev(`({ open: !document.querySelector('[data-viewer]').hidden, lock: document.documentElement.style.overflow })`);
      check('圖片檢視器：Esc 關閉並解除捲動鎖', !esc.open && esc.lock === '');
      await clickEl(first); await sleep(600);
      const cc = await clickEl(`document.querySelector('[data-viewer-close]')`); await sleep(400);
      const cl = await ev(`({ open: !document.querySelector('[data-viewer]').hidden, lock: document.documentElement.style.overflow })`);
      check('圖片檢視器：關閉鍵', cc.ok && !cl.open && cl.lock === '', cc.ok ? '' : '關閉鍵被 ' + cc.hit + ' 蓋住');
    }
  }

  // 段落導覽（案例頁右側）
  if (await ev(`!!document.querySelector('[data-section-nav]')`)) {
    await ev(`scrollTo({ top: document.documentElement.scrollHeight * 0.3, behavior: 'instant' }); true`);
    await sleep(800);
    const navState = await ev(`(() => { const n = document.querySelector('[data-section-nav]'); const cs = getComputedStyle(n); return { shown: cs.display !== 'none' && cs.visibility !== 'hidden' && cs.opacity !== '0', links: n.querySelectorAll('[data-section-nav-link]').length }; })()`);
    current.counts.sectionNav = navState.links;
    if (navState.shown && navState.links > 0) {
      const idx = Math.min(navState.links - 1, Math.floor(navState.links / 2));
      const link = `document.querySelectorAll('[data-section-nav-link]')[${idx}]`;
      const target = await ev(`${link}.getAttribute('href')`);
      const c = await clickEl(link);
      await sleep(1600);
      const top = await ev(`document.getElementById(${JSON.stringify(target)}.slice(1)).getBoundingClientRect().top`);
      check('段落導覽：點連結會捲到該段', c.ok && Math.abs(top) < 200, `${target} 距離視窗頂 ${Math.round(top)}px${c.ok ? '' : '，連結被 ' + c.hit + ' 蓋住'}`);
      const ct = await clickEl(`document.querySelector('[data-section-nav-top]')`);
      await sleep(1800);
      const y = await ev(`scrollY`);
      check('段落導覽：回到頂端', ct.ok && y < 5, `scrollY=${Math.round(y)}${ct.ok ? '' : '，按鈕被 ' + ct.hit + ' 蓋住'}`);
    }
  }

  // 返回鍵：直接打開（沒有站內來源）→ 走 href
  const back = await ev(`document.querySelector('a[data-back]')?.getAttribute('href') ?? null`);
  if (back) {
    const c = await clickEl(`document.querySelector('a[data-back]')`);
    await waitEvent('Page.loadEventFired', 8000); await sleep(800);
    const loc = await ev(`location.pathname`);
    check('返回鍵（直接開啟頁面）：回到上層頁', c.ok && slash(loc) === slash(new URL(back, BASE + page).pathname), `到了 ${loc}，href=${back}${c.ok ? '' : '，被 ' + c.hit + ' 蓋住'}`);
  }

  current.errors = pageErrors.slice();
  check('沒有 JS 錯誤或載入失敗', pageErrors.length === 0, pageErrors.join('\n'));
}

// 返回鍵：從作品集頁點卡片進案例頁，再按返回 → 回到作品集頁
async function testBackFlow(listPage) {
  current = { checks: [], errors: [], counts: {} };
  results.pages[`${listPage} → 案例頁 → 返回`] = current;
  await goto(listPage);
  const cards = await ev(`[...new Set([...document.querySelectorAll('main a[href*="/projects/"]')].map(a => a.getAttribute('href')))]`);
  for (const href of cards) {
    await goto(listPage);
    const c = await clickEl(`document.querySelector('main a[href="${href}"]')`);
    await waitEvent('Page.loadEventFired', 8000); await sleep(1000);
    const at = await ev(`location.pathname`);
    const bc = await clickEl(`document.querySelector('a[data-back]')`);
    await sleep(1500);
    const back = await ev(`location.pathname`);
    check(`卡片 ${href}：點進去、再按返回`, c.ok && slash(at) === slash(new URL(href, BASE).pathname) && bc.found && slash(back) === slash(listPage),
      `進到 ${at}，返回後在 ${back}${c.ok ? '' : '；卡片被 ' + c.hit + ' 蓋住'}${bc.found ? '' : '；找不到返回鍵'}`);
  }
  current.errors = pageErrors.slice();
}

async function runWidth(width, pages) {
  results = { width, pages: {} };
  const height = width < 768 ? 812 : width < 1200 ? 1024 : 900;
  const close = await openBrowser(width, height);
  try {
    for (const p of pages) {
      try { await testPage(p); } catch (e) { results.pages[p] ??= { checks: [], errors: [] }; results.pages[p].checks.push({ name: '測試本身出錯', pass: false, detail: String(e.message ?? e) }); }
    }
    for (const lp of pages.filter((p) => /\/portfolio\/?$/.test(p))) {
      const name = `${lp} → 案例頁 → 返回`;
      try { await testBackFlow(lp); } catch (e) { results.pages[name] ??= { checks: [], errors: [] }; results.pages[name].checks.push({ name: '測試本身出錯', pass: false, detail: String(e.message ?? e) }); }
    }
  } finally {
    await close();
  }
  return results;
}

// ---------- 4. 連結狀態碼 ----------
// 站內連結壞了一定是我們的錯；站外的只有 404／410 確定是壞掉，
// 其他像 403、429、逾時多半是對方擋了自動請求，列出來讓人手動點開確認
async function checkLinks() {
  const out = { ok: 0, broken: [], unsure: [] };
  const urls = Object.keys(allLinks).filter((u) => /^https?:/.test(u));
  await Promise.all(urls.map(async (u) => {
    let status;
    try {
      const res = await fetch(u, { redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { 'user-agent': UA } });
      status = res.status;
      await res.body?.cancel();
    } catch (e) {
      status = e.cause?.code ?? e.name;
    }
    const entry = { url: u, status, pages: [...allLinks[u]] };
    if (typeof status === 'number' && status < 400) out.ok++;
    else if (new URL(u).origin === BASE || status === 404 || status === 410) out.broken.push(entry);
    else out.unsure.push(entry);
  }));
  return out;
}

// ---------- 5. 執行 ----------
try {
  await fetch(BASE + '/zh/', { signal: AbortSignal.timeout(5000) });
} catch {
  console.error(`連不到 ${BASE}。先開 dev server：npx astro dev --background`);
  process.exit(1);
}
if (!fs.existsSync(CHROME)) {
  console.error(`找不到 Chrome：${CHROME}\n用環境變數 CHROME_PATH 指定 Chrome 執行檔的位置。`);
  process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });
const pages = (await crawl()).filter((p) => !ONLY || ONLY.test(p));
console.log(`測試 ${BASE}：${pages.length} 頁 × ${WIDTHS.join('／')}px`);
let failed = 0;

for (const width of WIDTHS) {
  const r = await runWidth(width, pages);
  fs.writeFileSync(path.join(OUT_DIR, `${width}.json`), JSON.stringify(r, null, 1));
  const all = Object.values(r.pages).flatMap((p) => p.checks);
  const bad = Object.entries(r.pages).flatMap(([p, pr]) => pr.checks.filter((c) => !c.pass).map((c) => ({ page: p, ...c })));
  console.log(`\n${width}px：${all.length - bad.length}/${all.length} 項通過`);
  for (const b of bad) {
    console.log(`  ✗ ${b.page}  ${b.name}`);
    if (b.detail) console.log(b.detail.split('\n').map((l) => `      ${l}`).join('\n'));
  }
  failed += bad.length;
}

const links = await checkLinks();
fs.writeFileSync(path.join(OUT_DIR, 'links.json'), JSON.stringify(links, null, 1));
console.log(`\n連結：${links.ok + links.broken.length + links.unsure.length} 個，${links.broken.length} 個壞掉，${links.unsure.length} 個需要手動確認`);
for (const l of links.broken) console.log(`  ✗ ${l.status}  ${l.url}（出現在 ${l.pages.slice(0, 3).join('、')}${l.pages.length > 3 ? ' 等' : ''}）`);
for (const l of links.unsure) console.log(`  ? ${l.status}  ${l.url}——站外網站可能擋了自動請求，手動點開確認`);
failed += links.broken.length;

console.log(failed ? `\n共 ${failed} 項失敗，完整結果在 .ui-test/` : '\n全部通過');
process.exitCode = failed ? 1 : 0;
