// 本機後台前端邏輯 —— 純原生 JS，不依賴任何框架。
// 只跟 admin-server（npm run admin, http://localhost:5174）溝通，
// 不會影響正式站台的任何一行程式碼或打包內容。
const API = 'http://localhost:5174';

const sidebarItems = [...document.querySelectorAll('.sidebar__item[data-page]')];
const pageTitleEl = document.getElementById('pageTitle');
const pageMetaEl = document.getElementById('pageMeta');
const pageTabsEl = document.getElementById('pageTabs');
const contentEl = document.getElementById('content');
const fileInputEl = document.getElementById('fileInput');
const lightboxEl = document.getElementById('lightbox');
const lightboxImageEl = document.getElementById('lightboxImage');
const lightboxInfoEl = document.getElementById('lightboxInfo');
const lightboxCloseEl = document.getElementById('lightboxClose');
const previewPanelEl = document.getElementById('previewPanel');
const previewFrameEl = document.getElementById('previewFrame');
const previewSelectEl = document.getElementById('previewPageSelect');
const previewLocaleBtn = document.getElementById('previewLocaleToggle');

let currentPage = 'gallery'; // 'gallery' | 'portfolio' | 'home'
let currentType = 'gallery'; // 'gallery' | 'projects' —— 對應後端 /api/collections/:type
let currentSlug = null;
let currentImages = [];
let dragFromIndex = null;
let selectedIndex = null;
let pendingUpload = null; // { type:'collection', type/slug } 或 { type:'home', name } —— fileInput 觸發時要知道存去哪

// ---------- 共用小工具 ----------

function showToast(message, isError = false) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.toggle('toast--error', isError);
  toast.classList.add('toast--show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('toast--show'), 2200);
}

function formatBytes(bytes) {
  if (bytes == null) return '—';
  if (bytes < 1024) return `${bytes}B`;
  return `${Math.round(bytes / 1024)}KB`;
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

// rename（拖拉排序／互換位置）不會動到檔案的 mtime，只有內容真的變了 mtime 才會變，
// 拿它當 cache-busting 參數：同一個檔名位置換了不同內容的檔案時，瀏覽器才不會拿舊快取圖顯示。
function imgUrl(img) {
  return `${API}${img.url}?t=${encodeURIComponent(img.modifiedAt || '')}`;
}

function openLightbox(img, label) {
  lightboxImageEl.src = imgUrl(img);
  lightboxImageEl.alt = img.filename;
  lightboxInfoEl.innerHTML = `
    <div><dt>檔名</dt><dd>${img.filename}</dd></div>
    <div><dt>位置</dt><dd>${label}</dd></div>
    <div><dt>尺寸</dt><dd>${img.width && img.height ? `${img.width} × ${img.height} px` : '—'}</dd></div>
    <div><dt>檔案大小</dt><dd>${formatBytes(img.sizeBytes)}</dd></div>
    <div><dt>上傳日期</dt><dd>${formatDate(img.uploadedAt)}</dd></div>
    <div><dt>最後修改</dt><dd>${formatDate(img.modifiedAt)}</dd></div>
  `;
  lightboxEl.hidden = false;
}

function closeLightbox() {
  lightboxEl.hidden = true;
  lightboxImageEl.src = '';
}

lightboxCloseEl.addEventListener('click', closeLightbox);
lightboxEl.querySelector('.lightbox__backdrop').addEventListener('click', closeLightbox);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !lightboxEl.hidden) closeLightbox();
});

// ---------- 右側即時 Preview（iframe 嵌實際跑在 astro dev 上的正式頁面） ----------

const PREVIEW_BASE = 'http://localhost:4321';
let previewLocale = 'en';
let previewPath = '/';
let galleryAlbumList = [];
let previewOptionsLoaded = false;

async function ensurePreviewOptionsLoaded() {
  if (previewOptionsLoaded) return;
  const [gallery, projects] = await Promise.all([
    fetch(`${API}/api/collections/gallery`).then((r) => r.json()),
    fetch(`${API}/api/collections/projects`).then((r) => r.json()),
  ]);
  galleryAlbumList = gallery;
  if (projectSlugs.length === 0) projectSlugs = projects;
  previewOptionsLoaded = true;
  populatePreviewSelect();
}

function populatePreviewSelect() {
  const opts = [
    { path: '/', label: 'Home' },
    { path: '/portfolio', label: 'Portfolio（列表頁）' },
    { path: '/gallery', label: 'Gallery（主頁）' },
  ];
  projectSlugs.forEach(({ slug, title }) => opts.push({ path: `/projects/${slug}`, label: `案例頁 → ${title}` }));
  galleryAlbumList.forEach(({ slug, title }) => opts.push({ path: `/gallery/${slug}`, label: `相簿 → ${title}` }));
  previewSelectEl.innerHTML = '';
  opts.forEach((o) => {
    const el = document.createElement('option');
    el.value = o.path;
    el.textContent = o.label;
    previewSelectEl.appendChild(el);
  });
  previewSelectEl.value = previewPath;
}

function reloadPreview() {
  previewFrameEl.src = `${PREVIEW_BASE}/${previewLocale}${previewPath}?t=${Date.now()}`;
}

// 依目前後台在編輯哪一頁，自動把 Preview 切到對應的正式頁面；下拉選單仍可手動覆蓋。
async function syncPreview() {
  await ensurePreviewOptionsLoaded();
  if (currentPage === 'home') previewPath = '/';
  else if (currentPage === 'gallery' && currentSlug) previewPath = `/gallery/${currentSlug}`;
  else if (currentPage === 'portfolio' && currentSlug) previewPath = `/projects/${currentSlug}`;
  else if (currentPage === 'content') previewPath = previewPath || '/';
  if ([...previewSelectEl.options].some((o) => o.value === previewPath)) {
    previewSelectEl.value = previewPath;
  }
  reloadPreview();
}

previewSelectEl.addEventListener('change', () => {
  previewPath = previewSelectEl.value;
  reloadPreview();
});
previewLocaleBtn.addEventListener('click', () => {
  previewLocale = previewLocale === 'en' ? 'zh' : 'en';
  previewLocaleBtn.textContent = previewLocale.toUpperCase();
  reloadPreview();
});
document.getElementById('previewRefresh').addEventListener('click', reloadPreview);
document.getElementById('previewCollapse').addEventListener('click', () => previewPanelEl.classList.toggle('collapsed'));

// ---------- 側欄切換 ----------

sidebarItems.forEach((btn) => {
  btn.addEventListener('click', () => {
    const page = btn.dataset.page;
    if (page === currentPage) return;
    sidebarItems.forEach((b) => b.classList.toggle('sidebar__item--active', b === btn));
    currentPage = page;
    selectedIndex = null;
    document.querySelector('.content-savebar')?.remove();
    if (page === 'gallery') {
      currentType = 'gallery';
      loadCollectionList();
    } else if (page === 'portfolio') {
      currentType = 'projects';
      loadCollectionList();
    } else if (page === 'home') {
      loadHome();
    } else if (page === 'content') {
      loadContentPage();
    }
  });
});

// ---------- Gallery / Portfolio（編號序列相簿，共用同一套邏輯） ----------

async function loadCollectionList() {
  pageTitleEl.textContent = currentType === 'gallery' ? 'Gallery 相簿' : 'Portfolio 案例圖片';
  pageMetaEl.textContent = '載入中…';
  pageTabsEl.innerHTML = '';
  contentEl.innerHTML = '<div class="grid" id="grid"></div>';

  const list = await fetch(`${API}/api/collections/${currentType}`).then((r) => r.json());
  pageTabsEl.innerHTML = '';
  list.forEach((item, i) => {
    const btn = document.createElement('button');
    btn.className = 'tab' + (i === 0 ? ' tab--active' : '');
    btn.textContent = item.title;
    btn.addEventListener('click', () => selectSlug(item.slug, btn));
    pageTabsEl.appendChild(btn);
  });
  if (list.length > 0) {
    currentSlug = list[0].slug;
    await loadImages();
  }
}

async function selectSlug(slug, btn) {
  currentSlug = slug;
  selectedIndex = null;
  [...pageTabsEl.children].forEach((b) => b.classList.toggle('tab--active', b === btn));
  await loadImages();
}

let currentRequiredSlots = null;
let currentSlotLabels = [];

async function loadImages() {
  pageMetaEl.textContent = '載入中…';
  const { images, requiredSlots, slotLabels } = await fetch(
    `${API}/api/collections/${currentType}/${currentSlug}/images`
  ).then((r) => r.json());
  currentImages = images;
  currentRequiredSlots = requiredSlots;
  currentSlotLabels = slotLabels || [];
  pageMetaEl.textContent =
    requiredSlots != null
      ? `已上傳 ${currentImages.length} / 需要 ${requiredSlots} 張圖片 · 拖拉調順序，或點兩張快速互換位置`
      : `${currentImages.length} 張圖片 · 拖拉調順序，或點兩張快速互換位置`;
  renderCollectionGrid();
  syncPreview();
}

function renderCollectionGrid() {
  const gridEl = document.getElementById('grid');
  if (!gridEl) return;
  gridEl.innerHTML = '';
  const showSlotLabels = currentType === 'projects';

  currentImages.forEach((img, index) => {
    const tile = document.createElement('div');
    tile.className = 'tile' + (index === selectedIndex ? ' tile--selected' : '');
    tile.draggable = true;
    tile.dataset.index = String(index);

    const badge = showSlotLabels ? img.slotLabel : index === 0 ? 'Cover' : null;

    tile.innerHTML = `
      <div class="tile__image-wrap">
        ${badge ? `<span class="tile__badge">${badge}</span>` : ''}
        <img src="${imgUrl(img)}" alt="${img.filename}" loading="lazy" />
        <button class="tile__expand" title="放大查看">
          <svg viewBox="0 0 24 24"><path d="M15 3h6v6" /><path d="M9 21H3v-6" /><path d="M21 3l-7 7" /><path d="M3 21l7-7" /></svg>
        </button>
        <button class="tile__delete" title="刪除">
          <svg viewBox="0 0 24 24"><path d="M4 7h16" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" /><path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" /></svg>
        </button>
      </div>
      <div class="tile__meta">
        <strong>${img.filename}</strong>
        <span>${img.width && img.height ? `${img.width}×${img.height}` : '—'} · ${formatBytes(img.sizeBytes)}</span>
      </div>
    `;

    tile.querySelector('.tile__delete').addEventListener('click', (e) => {
      e.stopPropagation();
      handleDelete(img.filename);
    });

    tile.querySelector('.tile__expand').addEventListener('click', (e) => {
      e.stopPropagation();
      openLightbox(img, badge || `第 ${index + 1} 張`);
    });

    // 點兩張圖快速互換位置：不用拖著整張圖跨越整個 grid，適合離很遠的兩張圖交換。
    tile.addEventListener('click', () => {
      if (selectedIndex === null) {
        selectedIndex = index;
        renderCollectionGrid();
      } else if (selectedIndex === index) {
        selectedIndex = null;
        renderCollectionGrid();
      } else {
        const a = selectedIndex;
        selectedIndex = null;
        handleSwap(a, index);
      }
    });

    tile.addEventListener('dragstart', () => {
      dragFromIndex = index;
      tile.classList.add('dragging');
    });
    tile.addEventListener('dragend', () => {
      tile.classList.remove('dragging');
      gridEl.querySelectorAll('.tile').forEach((t) => t.classList.remove('drop-target'));
    });
    tile.addEventListener('dragover', (e) => {
      e.preventDefault();
      tile.classList.add('drop-target');
    });
    tile.addEventListener('dragleave', () => tile.classList.remove('drop-target'));
    tile.addEventListener('drop', (e) => {
      e.preventDefault();
      tile.classList.remove('drop-target');
      const toIndex = index;
      if (dragFromIndex === null || dragFromIndex === toIndex) return;
      handleReorder(dragFromIndex, toIndex);
    });

    gridEl.appendChild(tile);
  });

  // 案例頁：把還沒上傳、但頁面 sections 需要用到的空位也列出來，
  // 讓你一眼看出「這格對應哪個區塊」，點了直接上傳到那一格（永遠是下一個編號，順序不會亂）。
  if (showSlotLabels && currentRequiredSlots != null) {
    for (let i = currentImages.length; i < currentRequiredSlots; i++) {
      const empty = document.createElement('div');
      empty.className = 'tile tile--empty-slot';
      empty.innerHTML = `
        <div class="tile__image-wrap">
          <span class="tile__badge tile__badge--pending">待上傳</span>
          <span class="tile__empty-label">${currentSlotLabels[i] ?? `#${i + 1}`}</span>
        </div>
      `;
      empty.addEventListener('click', () => {
        pendingUpload = { kind: 'collection' };
        fileInputEl.click();
      });
      gridEl.appendChild(empty);
    }
  }

  const addTile = document.createElement('div');
  addTile.className = 'tile tile--add';
  addTile.innerHTML = '<span class="plus">+</span>';
  addTile.draggable = false;
  addTile.addEventListener('click', () => {
    pendingUpload = { kind: 'collection' };
    fileInputEl.click();
  });
  gridEl.appendChild(addTile);
}

async function handleDelete(filename) {
  if (!confirm(`確定要刪除 ${filename}？`)) return;
  try {
    const res = await fetch(`${API}/api/collections/${currentType}/${currentSlug}/images/${filename}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(await res.text());
    showToast(`已刪除 ${filename}`);
    await loadImages();
  } catch (err) {
    showToast(`刪除失敗：${err.message}`, true);
  }
}

async function submitOrder(order) {
  const res = await fetch(`${API}/api/collections/${currentType}/${currentSlug}/order`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order }),
  });
  if (!res.ok) throw new Error(await res.text());
}

async function handleReorder(fromIndex, toIndex) {
  const order = currentImages.map((img) => img.filename);
  const [moved] = order.splice(fromIndex, 1);
  order.splice(toIndex, 0, moved);
  try {
    await submitOrder(order);
    showToast('順序已更新');
    await loadImages();
  } catch (err) {
    showToast(`排序失敗：${err.message}`, true);
  }
}

async function handleSwap(indexA, indexB) {
  const order = currentImages.map((img) => img.filename);
  [order[indexA], order[indexB]] = [order[indexB], order[indexA]];
  try {
    await submitOrder(order);
    showToast(`已互換 ${currentImages[indexA].filename} 與 ${currentImages[indexB].filename} 的位置`);
    await loadImages();
  } catch (err) {
    showToast(`互換失敗：${err.message}`, true);
  }
}

// ---------- Home（固定命名圖片：hero / avatar / about / beyond-grid） ----------

const HOME_LABELS = {
  hero: 'Hero（首頁最上方全身照）',
  avatar: 'Avatar（引言旁的圓形頭像）',
  about: 'About（About me 區塊照片）',
  'beyond-grid': 'Beyond the Grid（生活照）',
};

let currentHomeSlots = [];

async function loadHome() {
  pageTitleEl.textContent = 'Home 首頁圖片';
  pageMetaEl.textContent = '每個位置固定用途，點圖上傳／更換即可，不需要排序';
  pageTabsEl.innerHTML = '';
  contentEl.innerHTML = '<div class="home-grid" id="homeGrid"></div>';

  currentHomeSlots = await fetch(`${API}/api/home`).then((r) => r.json());
  renderHomeGrid();
  syncPreview();
}

function renderHomeGrid() {
  const homeGridEl = document.getElementById('homeGrid');
  if (!homeGridEl) return;
  homeGridEl.innerHTML = '';

  currentHomeSlots.forEach((slot) => {
    const card = document.createElement('div');
    card.className = 'home-card';

    const hasImage = !!slot.filename;
    card.innerHTML = `
      <div class="tile__image-wrap home-card__image-wrap">
        ${
          hasImage
            ? `<img src="${imgUrl(slot)}" alt="${slot.filename}" loading="lazy" />
               <button class="tile__expand" title="放大查看"><svg viewBox="0 0 24 24"><path d="M15 3h6v6" /><path d="M9 21H3v-6" /><path d="M21 3l-7 7" /><path d="M3 21l7-7" /></svg></button>
               <button class="tile__delete" title="刪除，改回佔位框"><svg viewBox="0 0 24 24"><path d="M4 7h16" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" /><path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" /></svg></button>`
            : `<span class="home-card__empty">尚未上傳，點擊上傳</span>`
        }
      </div>
      <div class="tile__meta home-card__meta">
        <strong>${HOME_LABELS[slot.name] ?? slot.name}</strong>
        <span>${hasImage ? `${slot.width && slot.height ? `${slot.width}×${slot.height}` : '—'} · ${formatBytes(slot.sizeBytes)}` : '—'}</span>
      </div>
    `;

    if (hasImage) {
      card.querySelector('.tile__expand').addEventListener('click', (e) => {
        e.stopPropagation();
        openLightbox(slot, HOME_LABELS[slot.name] ?? slot.name);
      });
      card.querySelector('.tile__delete').addEventListener('click', (e) => {
        e.stopPropagation();
        handleHomeDelete(slot.name);
      });
    }

    card.querySelector('.home-card__image-wrap').addEventListener('click', () => {
      pendingUpload = { kind: 'home', name: slot.name };
      fileInputEl.click();
    });

    homeGridEl.appendChild(card);
  });
}

async function handleHomeDelete(name) {
  if (!confirm(`確定要刪除 ${HOME_LABELS[name] ?? name} 的圖片嗎？（會改回佔位框）`)) return;
  try {
    const res = await fetch(`${API}/api/home/${name}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(await res.text());
    showToast('已刪除');
    await loadHome();
  } catch (err) {
    showToast(`刪除失敗：${err.message}`, true);
  }
}

// ---------- Content（src/content/site/main-en.json ／ main-zh.json 中英文案，逐欄位對照編輯） ----------

let siteEn = null;
let siteZh = null;
const CONTENT_EXPANDED_BY_DEFAULT = new Set(['home', 'portfolio', 'gallery']);

function humanize(key) {
  return String(key).replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase());
}

function getPath(obj, keyPath) {
  return keyPath.reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

function setPath(obj, keyPath, value) {
  let node = obj;
  for (let i = 0; i < keyPath.length - 1; i++) node = node[keyPath[i]];
  node[keyPath[keyPath.length - 1]] = value;
}

function makeFieldInput(value, onChange) {
  const el = value.length > 60 ? document.createElement('textarea') : document.createElement('input');
  if (el.tagName === 'INPUT') el.type = 'text';
  el.value = value;
  el.addEventListener('input', () => onChange(el.value));
  return el;
}

function renderContentRow(label, keyPath) {
  const row = document.createElement('div');
  row.className = 'content-row';

  const labelEl = document.createElement('div');
  labelEl.className = 'content-row__label';
  labelEl.textContent = label;
  row.appendChild(labelEl);

  const enValue = getPath(siteEn, keyPath) ?? '';
  const zhValue = getPath(siteZh, keyPath) ?? '';

  if (keyPath[keyPath.length - 1] === 'icon') {
    [
      ['EN', siteEn, enValue],
      ['ZH', siteZh, zhValue],
    ].forEach(([langLabel, target, value]) => {
      const wrap = document.createElement('div');
      const langEl = document.createElement('div');
      langEl.className = 'content-row__lang';
      langEl.textContent = langLabel;
      const select = document.createElement('select');
      ['email', 'instagram'].forEach((opt) => {
        const o = document.createElement('option');
        o.value = opt;
        o.textContent = opt;
        if (opt === value) o.selected = true;
        select.appendChild(o);
      });
      select.addEventListener('change', () => setPath(target, keyPath, select.value));
      wrap.appendChild(langEl);
      wrap.appendChild(select);
      row.appendChild(wrap);
    });
    return row;
  }

  [
    ['EN', siteEn, enValue],
    ['ZH', siteZh, zhValue],
  ].forEach(([langLabel, target, value]) => {
    const wrap = document.createElement('div');
    const langEl = document.createElement('div');
    langEl.className = 'content-row__lang';
    langEl.textContent = langLabel;
    const input = makeFieldInput(String(value), (v) => setPath(target, keyPath, v));
    wrap.appendChild(langEl);
    wrap.appendChild(input);
    row.appendChild(wrap);
  });

  return row;
}

function renderContentNode(enVal, keyPath, container) {
  if (typeof enVal === 'string') {
    container.appendChild(renderContentRow(humanize(keyPath[keyPath.length - 1]), keyPath));
    return;
  }

  if (Array.isArray(enVal)) {
    if (enVal.length === 0) return;
    if (typeof enVal[0] === 'string') {
      enVal.forEach((_, i) => {
        container.appendChild(renderContentRow(`${humanize(keyPath[keyPath.length - 1])} #${i + 1}`, [...keyPath, i]));
      });
    } else {
      enVal.forEach((item, i) => {
        const group = document.createElement('div');
        group.className = 'content-group';
        const label = document.createElement('div');
        label.className = 'content-group__label';
        label.textContent = `${humanize(keyPath[keyPath.length - 1])} #${i + 1}`;
        group.appendChild(label);
        Object.keys(item).forEach((k) => renderContentNode(item[k], [...keyPath, i, k], group));
        container.appendChild(group);
      });
    }
    return;
  }

  if (enVal && typeof enVal === 'object') {
    const group = document.createElement('div');
    group.className = 'content-group';
    Object.keys(enVal).forEach((k) => renderContentNode(enVal[k], [...keyPath, k], group));
    container.appendChild(group);
    return;
  }
}

// ---- 案例頁（src/content/projects/*.md frontmatter）：單一語言，不是 en/zh 對照 ----
// type（決定用哪個區塊元件渲染）唯讀顯示，改了頁面版型會跟著跑掉；
// imagePosition 是固定的 left/right 版面選項，用下拉選單避免打錯字。

let projectSlugs = []; // [{slug, title}]
let projectsData = {}; // slug -> frontmatter 物件

function renderMonoRow(label, keyPath, dataObj, { readonly = false, select = null, isNumber = false } = {}) {
  const row = document.createElement('div');
  row.className = 'content-row';

  const labelEl = document.createElement('div');
  labelEl.className = 'content-row__label';
  labelEl.textContent = label;
  row.appendChild(labelEl);

  const value = getPath(dataObj, keyPath) ?? '';
  const wrap = document.createElement('div');

  if (readonly) {
    const span = document.createElement('div');
    span.textContent = String(value);
    span.style.padding = '6px 8px';
    span.style.color = 'var(--muted)';
    wrap.appendChild(span);
  } else if (select) {
    const el = document.createElement('select');
    select.forEach((opt) => {
      const o = document.createElement('option');
      o.value = opt;
      o.textContent = opt;
      if (opt === value) o.selected = true;
      el.appendChild(o);
    });
    el.addEventListener('change', () => setPath(dataObj, keyPath, el.value));
    wrap.appendChild(el);
  } else if (isNumber) {
    const el = document.createElement('input');
    el.type = 'number';
    el.value = value;
    el.addEventListener('input', () => setPath(dataObj, keyPath, Number(el.value)));
    wrap.appendChild(el);
  } else {
    const el = makeFieldInput(String(value), (v) => setPath(dataObj, keyPath, v));
    wrap.appendChild(el);
  }

  row.appendChild(wrap);
  return row;
}

function renderMonoNode(val, keyPath, container, dataObj) {
  const key = keyPath[keyPath.length - 1];

  if (key === 'type') {
    container.appendChild(renderMonoRow('Type（唯讀，決定區塊版型）', keyPath, dataObj, { readonly: true }));
    return;
  }
  if (key === 'imagePosition') {
    container.appendChild(renderMonoRow('Image Position', keyPath, dataObj, { select: ['left', 'right'] }));
    return;
  }

  if (typeof val === 'string') {
    container.appendChild(renderMonoRow(humanize(key), keyPath, dataObj));
    return;
  }
  if (typeof val === 'number') {
    container.appendChild(renderMonoRow(humanize(key), keyPath, dataObj, { isNumber: true }));
    return;
  }

  if (Array.isArray(val)) {
    if (val.length === 0) return;
    if (typeof val[0] === 'string') {
      val.forEach((_, i) => container.appendChild(renderMonoRow(`${humanize(key)} #${i + 1}`, [...keyPath, i], dataObj)));
    } else {
      val.forEach((item, i) => {
        const group = document.createElement('div');
        group.className = 'content-group';
        const label = document.createElement('div');
        label.className = 'content-group__label';
        label.textContent = `${humanize(key)} #${i + 1}${item.type ? ` — ${item.type}` : ''}`;
        group.appendChild(label);
        Object.keys(item).forEach((k) => renderMonoNode(item[k], [...keyPath, i, k], group, dataObj));
        container.appendChild(group);
      });
    }
    return;
  }

  if (val && typeof val === 'object') {
    const group = document.createElement('div');
    group.className = 'content-group';
    Object.keys(val).forEach((k) => renderMonoNode(val[k], [...keyPath, k], group, dataObj));
    container.appendChild(group);
    return;
  }
}

function renderContentForm() {
  contentEl.innerHTML = '<div class="content-form" id="contentForm"></div>';
  const form = document.getElementById('contentForm');

  Object.keys(siteEn).forEach((sectionKey) => {
    const section = document.createElement('div');
    section.className = 'content-section' + (CONTENT_EXPANDED_BY_DEFAULT.has(sectionKey) ? '' : ' collapsed');

    const header = document.createElement('div');
    header.className = 'content-section__header';
    header.innerHTML = `<span>${humanize(sectionKey)}</span><span class="chev">▾</span>`;
    header.addEventListener('click', () => section.classList.toggle('collapsed'));

    const body = document.createElement('div');
    body.className = 'content-section__body';
    renderContentNode(siteEn[sectionKey], [sectionKey], body);

    section.appendChild(header);
    section.appendChild(body);
    form.appendChild(section);
  });

  const projectsHeading = document.createElement('h2');
  projectsHeading.textContent = 'Portfolio 案例頁文案';
  projectsHeading.style.margin = '32px 0 8px';
  form.appendChild(projectsHeading);
  const projectsHint = document.createElement('p');
  projectsHint.textContent = '案例頁目前只有單一語言（沒有中英分開），下面每個欄位只有一格。';
  projectsHint.style.cssText = 'color:var(--muted);font-size:13px;margin-bottom:12px';
  form.appendChild(projectsHint);

  projectSlugs.forEach(({ slug, title }) => {
    const data = projectsData[slug];
    if (!data) return;
    const section = document.createElement('div');
    section.className = 'content-section collapsed';

    const header = document.createElement('div');
    header.className = 'content-section__header';
    header.innerHTML = `<span>${title}</span><span class="chev">▾</span>`;
    header.addEventListener('click', () => section.classList.toggle('collapsed'));

    const body = document.createElement('div');
    body.className = 'content-section__body';
    Object.keys(data).forEach((k) => renderMonoNode(data[k], [k], body, data));

    section.appendChild(header);
    section.appendChild(body);
    form.appendChild(section);
  });

  const savebar = document.createElement('div');
  savebar.className = 'content-savebar';
  savebar.innerHTML = '<button id="contentSaveBtn">儲存所有文案</button>';
  document.body.appendChild(savebar);
  document.getElementById('contentSaveBtn').addEventListener('click', handleSaveContent);
}

async function loadContentPage() {
  pageTitleEl.textContent = 'Content 文案';
  pageMetaEl.textContent = '載入中…';
  pageTabsEl.innerHTML = '';
  document.querySelector('.content-savebar')?.remove();
  contentEl.innerHTML = '<p style="padding:16px;color:var(--muted)">載入中…</p>';

  const [{ en, zh }, slugs] = await Promise.all([
    fetch(`${API}/api/site`).then((r) => r.json()),
    fetch(`${API}/api/collections/projects`).then((r) => r.json()),
  ]);
  siteEn = en;
  siteZh = zh;
  projectSlugs = slugs;
  projectsData = {};
  await Promise.all(
    slugs.map(async ({ slug }) => {
      projectsData[slug] = await fetch(`${API}/api/projects/${slug}/content`).then((r) => r.json());
    })
  );

  pageMetaEl.textContent = '中英文對照（網站文案）+ 案例頁單語欄位，改完按右下角「儲存」直接寫回檔案';
  renderContentForm();
  syncPreview();
}

async function handleSaveContent() {
  try {
    const requests = [
      fetch(`${API}/api/site/en`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(siteEn) }),
      fetch(`${API}/api/site/zh`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(siteZh) }),
      ...projectSlugs.map(({ slug }) =>
        fetch(`${API}/api/projects/${slug}/content`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectsData[slug]),
        })
      ),
    ];
    const results = await Promise.all(requests);
    const failed = results.find((r) => !r.ok);
    if (failed) throw new Error(await failed.text());
    showToast('文案已儲存');
    reloadPreview();
  } catch (err) {
    showToast(`儲存失敗：${err.message}`, true);
  }
}

// ---------- 上傳（Gallery/Portfolio 與 Home 共用同一個 file input） ----------

fileInputEl.addEventListener('change', async () => {
  const file = fileInputEl.files[0];
  const pending = pendingUpload;
  fileInputEl.value = '';
  pendingUpload = null;
  if (!file || !pending) return;

  try {
    if (pending.kind === 'collection') {
      const res = await fetch(
        `${API}/api/collections/${currentType}/${currentSlug}/images?filename=${encodeURIComponent(file.name)}`,
        { method: 'POST', headers: { 'Content-Type': file.type || 'application/octet-stream' }, body: file }
      );
      if (!res.ok) throw new Error(await res.text());
      const { filename } = await res.json();
      showToast(`已上傳為 ${filename}`);
      await loadImages();
    } else if (pending.kind === 'home') {
      const res = await fetch(`${API}/api/home/${pending.name}?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file,
      });
      if (!res.ok) throw new Error(await res.text());
      showToast('已更新');
      await loadHome();
    }
  } catch (err) {
    showToast(`上傳失敗：${err.message}`, true);
  }
});

loadCollectionList().catch((err) => showToast(`載入失敗：${err.message}`, true));
