/*
  後台段落排序的回歸測試。   執行：npm run test:admin

  為什麼存在：這個功能的失敗樣態是「無聲的」——拖了沒反應、主控台沒有錯誤、
  畫面沒有異狀。它在開發過程中壞過兩次，第二次還是修第一次時製造出來的回歸，
  而且送出時看起來是好的。靠人工複測抓不到這種東西。

  做法：不重寫一份邏輯來測，而是把 admin.js 裡「真正的」bindDrag、bindSectionDrag、
  buildSectionMoveButtons 原始碼抽出來，放進一個實作了事件冒泡與 stopPropagation
  語意的最小 DOM 跑。測的是實際會跑在瀏覽器裡的那份程式碼。

  涵蓋的核心情境：段落卡片裡面塞滿了同樣可拖的圖片磚，拖著卡片放在圖片磚上時，
  外層卡片到底收不收得到 dragover 與 drop（先前正是這裡壞掉）。

  可帶一個檔案路徑參數指定要測哪一份 admin.js，預設是專案裡的那份。
*/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(process.argv[2] ?? path.join(ROOT, 'admin-ui/admin.js'), 'utf-8');

function extract(signature) {
  const start = src.indexOf(signature);
  if (start < 0) throw new Error(`找不到 ${signature}`);
  let depth = 0;
  for (let i = src.indexOf('{', start); i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}' && --depth === 0) return src.slice(start, i + 1);
  }
  throw new Error('括號不對稱');
}

// ---------- 最小 DOM：只實作冒泡、stopPropagation、preventDefault、classList ----------
class El {
  constructor(cls = '') {
    this.children = [];
    this.parent = null;
    this.listeners = {};
    this.dataset = {};
    this.draggable = false;
    this._classes = new Set(cls.split(' ').filter(Boolean));
    this.classList = {
      add: (...c) => c.forEach((x) => this._classes.add(x)),
      remove: (...c) => c.forEach((x) => this._classes.delete(x)),
      contains: (c) => this._classes.has(c),
      toggle: (c, on) => (on ? this._classes.add(c) : this._classes.delete(c)),
    };
  }
  append(child) { child.parent = this; this.children.push(child); return child; }
  appendChild(child) { return this.append(child); }
  click() { for (const fn of this.listeners.click ?? []) fn.call(this, { stopPropagation() {} }); }
  addEventListener(type, fn) { (this.listeners[type] ??= []).push(fn); }
  querySelectorAll() { return []; }
  matches(sel) { return this._classes.has(sel.replace('.', '')); }
}

function dispatch(target, type) {
  const event = {
    type,
    target,
    defaultPrevented: false,
    _stopped: false,
    preventDefault() { this.defaultPrevented = true; },
    stopPropagation() { this._stopped = true; },
    dataTransfer: { effectAllowed: null, setData() {}, getData: () => '' },
  };
  // 由 target 往上冒泡，遇到 stopPropagation 就停在那一層
  for (let node = target; node; node = node.parent) {
    for (const fn of node.listeners[type] ?? []) fn.call(node, event);
    if (event._stopped) break;
  }
  return event;
}

const document = { querySelectorAll: () => [], createElement: () => new El() };

// ---------- 把真正的程式碼載進來 ----------
let dragFromIndex = null;
let dragKind = null;
let sectionDragFrom = null;
const calls = [];
const reorderSection = (slug, from, to) => calls.push(['reorderSection', slug, from, to]);

const bindDrag = eval(`(${extract('function bindDrag(tile, key, container, onDrop)')})`);
const bindSectionDrag = eval(`(${extract('function bindSectionDrag(card, index, slug, reload)')})`);
const buildSectionMoveButtons = eval(
  `(${extract('function buildSectionMoveButtons(index, total, slug, reload)')})`
);

// ---------- 組出 Portfolio 分頁的實際結構：卡片 > 格線 > 圖片磚 ----------
function buildCard(index) {
  const card = new El('sec-card');
  bindSectionDrag(card, index, 'talk-german', () => {});
  const grid = card.append(new El('grid'));
  const tile = grid.append(new El('tile'));
  bindDrag(tile, index * 10, { querySelectorAll: () => [] }, (a, b) => calls.push(['slotSwap', a, b]));
  return { card, tile };
}

const a = buildCard(0);
const b = buildCard(1);

const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
}

// ===== 情境 1：拖「段落卡片 0」，放在「卡片 1 裡的圖片磚」上 =====
calls.length = 0;
dispatch(a.card, 'dragstart');
check('拖卡片時 dragKind 標成 section', dragKind === 'section', `實際：${dragKind}`);

const over = dispatch(b.tile, 'dragover');
check(
  '指標壓在圖片磚上時，dragover 仍然冒泡到外層卡片並 preventDefault',
  over.defaultPrevented && b.card._classes.has('sec-card--over'),
  `preventDefault=${over.defaultPrevented}, 卡片有highlight=${b.card._classes.has('sec-card--over')}`
);

dispatch(b.tile, 'drop');
check(
  '放開後真的呼叫 reorderSection(0 → 1)',
  calls.some((c) => c[0] === 'reorderSection' && c[2] === 0 && c[3] === 1),
  JSON.stringify(calls)
);
check('沒有誤觸圖片互換', !calls.some((c) => c[0] === 'slotSwap'), JSON.stringify(calls));
dispatch(a.card, 'dragend');

// ===== 情境 2：拖「圖片磚」，放在另一張圖片磚上（原本就該正常的路徑）=====
calls.length = 0;
dispatch(a.tile, 'dragstart');
check('拖圖片磚時 dragKind 標成 tile', dragKind === 'tile', `實際：${dragKind}`);
check('圖片磚的 dragstart 有擋住冒泡，段落沒有跟著被拖', sectionDragFrom === null, `實際：${sectionDragFrom}`);

dispatch(b.tile, 'drop');
check(
  '放開後呼叫圖片互換而不是段落搬移',
  calls.some((c) => c[0] === 'slotSwap') && !calls.some((c) => c[0] === 'reorderSection'),
  JSON.stringify(calls)
);
dispatch(a.tile, 'dragend');

// ===== 情境 3：Firefox 需要 dataTransfer.setData 才會真的開始拖 =====
let didSetData = false;
const probe = new El('sec-card');
bindSectionDrag(probe, 5, 'x', () => {});
probe.listeners.dragstart[0].call(probe, {
  dataTransfer: { effectAllowed: null, setData: () => (didSetData = true) },
});
check('dragstart 有呼叫 dataTransfer.setData', didSetData);

// ===== 情境 4：上移／下移按鈕 =====
const TOTAL = 3;
const btns = (i) => buildSectionMoveButtons(i, TOTAL, 'talk-german', () => {}).children;

const mid = btns(1);
check('中間段落的上移鍵可按', mid[0].disabled === false);
check('中間段落的下移鍵可按', mid[1].disabled === false);

calls.length = 0;
mid[0].click();
check('按上移 → reorderSection(1 → 0)',
  JSON.stringify(calls) === JSON.stringify([['reorderSection', 'talk-german', 1, 0]]),
  JSON.stringify(calls));

calls.length = 0;
mid[1].click();
check('按下移 → reorderSection(1 → 2)',
  JSON.stringify(calls) === JSON.stringify([['reorderSection', 'talk-german', 1, 2]]),
  JSON.stringify(calls));

const first = btns(0);
check('第一段的上移鍵停用', first[0].disabled === true);
check('第一段的下移鍵仍可按', first[1].disabled === false);

const last = btns(TOTAL - 1);
check('最後一段的上移鍵仍可按', last[0].disabled === false);
check('最後一段的下移鍵停用', last[1].disabled === true);

calls.length = 0;
first[0].click();
check('停用的按鈕按下去不會送出任何請求', calls.length === 0, JSON.stringify(calls));

// ---------- 結果 ----------
let failed = 0;
for (const r of results) {
  console.log(`${r.ok ? '✅' : '❌'} ${r.name}${r.ok ? '' : `\n     → ${r.detail}`}`);
  if (!r.ok) failed++;
}
console.log(failed ? `\n${failed} 項失敗` : '\n全部通過');
process.exit(failed ? 1 : 0);
