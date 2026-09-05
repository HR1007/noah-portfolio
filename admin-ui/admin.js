// 本機後台前端邏輯 —— 純原生 JS，不依賴任何框架。
// 這份介面由 admin-server 自己提供（npm run admin, http://localhost:5174），
// 與 API 同源，所以請求都走相對路徑。刻意不放在 public/：那裡的檔案會被
// 打包進 dist 部署到線上，後台不該出現在正式站台上。
const API = '';

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

let currentPage = 'home'; // 'gallery' | 'portfolio' | 'home' | 'content'
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
let contentPreviewTouched = false; // 在 Content 分頁手動選過別的 preview 頁面後，就不要再被自動蓋回 Home

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
  // Content 頁涵蓋很多頁面，沒有單一對應頁面可以自動猜；每次「切換到」這個分頁
  // 都固定回到 Home，不要沿用切換前殘留的 gallery/portfolio 路徑（不然會看起來
  // 像是「儲存文案卻跳回 Gallery」，其實只是切分頁那瞬間就已經沒同步）。
  // 下拉選單仍可以手動換到別頁，之後儲存/重新整理不會再把它改回去。
  else if (currentPage === 'content' && !contentPreviewTouched) previewPath = '/';
  if ([...previewSelectEl.options].some((o) => o.value === previewPath)) {
    previewSelectEl.value = previewPath;
  }
  reloadPreview();
}

previewSelectEl.addEventListener('change', () => {
  previewPath = previewSelectEl.value;
  if (currentPage === 'content') contentPreviewTouched = true;
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
    if (page !== 'content') contentPreviewTouched = false;
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

  /*
    案例頁依「版位編號」渲染，不是依陣列順序：檔名 02.png 永遠落在第 3 格。
    用陣列順序的話，刪掉中間某張圖後陣列塌陷，後面的圖會全部往前遞補一格，
    看起來就像圖片自己跑掉了。缺號的位置改放「待上傳」空位。
  */
  let renderList = currentImages;
  if (showSlotLabels && currentRequiredSlots != null) {
    const bySlot = new Map(
      currentImages.filter((im) => im.slotIndex != null).map((im) => [im.slotIndex, im])
    );
    renderList = [];
    for (let i = 0; i < currentRequiredSlots; i++) {
      renderList.push(bySlot.get(i) ?? { __emptySlot: i });
    }
    // 編號超出版位數、或檔名不是純數字的圖片，附在最後不讓它們消失
    currentImages
      .filter((im) => im.slotIndex == null || im.slotIndex >= currentRequiredSlots)
      .forEach((im) => renderList.push(im));
  }

  renderList.forEach((img) => {
    if (img.__emptySlot != null) {
      const i = img.__emptySlot;
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
      return;
    }

    const index = currentImages.indexOf(img);
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

// ---------- Home（固定命名圖片 + 數量可變的圖組） ----------

const HOME_LABELS = {
  hero: 'Hero（首頁最上方全身照）',
  avatar: 'Avatar（引言旁的圓形頭像）',
  about: 'About（About me 區塊照片）',
};

let currentHomeSlots = [];
let currentHomeSets = [];
// 漸層選項向後端拿，與 content schema 同一份清單
let heroGradients = ['slate'];
let projectSlots = {};   // slug -> 版位清單（含所屬段落）
let projectImages = {};  // slug -> 已上傳的圖片

async function loadHome() {
  pageTitleEl.textContent = 'Home 首頁圖片';
  pageMetaEl.textContent = '每個位置固定用途，點圖上傳／更換即可，不需要排序';
  pageTabsEl.innerHTML = '';
  contentEl.innerHTML = '<div class="home-grid" id="homeGrid"></div>';

  const [slots, hobby] = await Promise.all([
    fetch(`${API}/api/home`).then((r) => r.json()),
    fetch(`${API}/api/home/sets/hobby`).then((r) => r.json()),
  ]);
  currentHomeSlots = slots;
  currentHomeSets = [hobby];
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
    // 空位跟 Gallery/Portfolio 的「待上傳」格子共用同一套樣式（虛線框＋pending 徽章＋說明文字），
    // 三個頁面的「這裡還沒有圖」視覺要一致，不要各刻一套。
    card.innerHTML = `
      <div class="tile__image-wrap home-card__image-wrap${hasImage ? '' : ' tile--empty-slot'}">
        ${
          hasImage
            ? `<img src="${imgUrl(slot)}" alt="${slot.filename}" loading="lazy" />
               <button class="tile__expand" title="放大查看"><svg viewBox="0 0 24 24"><path d="M15 3h6v6" /><path d="M9 21H3v-6" /><path d="M21 3l-7 7" /><path d="M3 21l7-7" /></svg></button>
               <button class="tile__delete" title="刪除，改回佔位框"><svg viewBox="0 0 24 24"><path d="M4 7h16" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" /><path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" /></svg></button>`
            : `<span class="tile__badge tile__badge--pending">待上傳</span>
               <span class="tile__empty-label">尚未上傳，點擊上傳</span>`
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

  currentHomeSets.forEach(renderHomeSet);
}

// 數量可變的圖組（例如 Beyond the Grid 生活照）。磚塊刻意跟 Gallery／Portfolio
// 用同一套 tile 結構與樣式：放大檢視、刪除、尺寸與檔案大小的呈現都要一致，
// 不要因為在不同頁面就長得不一樣。
function renderHomeSet(set) {
  const wrap = document.createElement('section');
  wrap.className = 'home-set';
  wrap.innerHTML = `
    <div class="home-set__head">
      <strong>${set.label}</strong>
      <span>${set.images.length} 張 · 依檔名順序顯示在網站上，可隨時追加</span>
    </div>
    <div class="grid home-set__grid"></div>
  `;
  const gridEl = wrap.querySelector('.home-set__grid');

  set.images.forEach((img, index) => {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.innerHTML = `
      <div class="tile__image-wrap">
        <span class="tile__badge">第 ${index + 1} 張</span>
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

    tile.querySelector('.tile__expand').addEventListener('click', (e) => {
      e.stopPropagation();
      openLightbox(img, `${set.label} 第 ${index + 1} 張`);
    });
    tile.querySelector('.tile__delete').addEventListener('click', (e) => {
      e.stopPropagation();
      handleHomeSetDelete(set.set, img.filename, set.label);
    });

    gridEl.appendChild(tile);
  });

  const addTile = document.createElement('div');
  addTile.className = 'tile tile--add';
  addTile.innerHTML = '<span class="plus">+</span>';
  addTile.addEventListener('click', () => {
    pendingUpload = { kind: 'home-set', set: set.set };
    fileInputEl.click();
  });
  gridEl.appendChild(addTile);

  document.getElementById('homeGrid').parentElement.appendChild(wrap);
}

async function handleHomeSetDelete(set, filename, label) {
  if (!confirm(`確定要從「${label}」刪除 ${filename} 嗎？`)) return;
  try {
    const res = await fetch(`${API}/api/home/sets/${set}/${encodeURIComponent(filename)}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(await res.text());
    showToast('已刪除');
    await loadHome();
  } catch (err) {
    showToast(`刪除失敗：${err.message}`, true);
  }
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
  if (key === 'gradient') {
    container.appendChild(
      renderMonoRow('Hero 漸層底色', keyPath, dataObj, { select: heroGradients })
    );
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
  projectsHint.textContent = '每張卡片是頁面上的一個段落，卡片內同時有該段落的文字與圖片。新增／刪除段落會立即寫檔。';
  projectsHint.style.cssText = 'color:var(--muted);font-size:13px;margin-bottom:12px';
  form.appendChild(projectsHint);

  projectSlugs.forEach(({ slug, title }) => renderProjectCard(slug, title, form));

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

  const [{ en, zh }, slugs, gradients] = await Promise.all([
    fetch(`${API}/api/site`).then((r) => r.json()),
    fetch(`${API}/api/collections/projects`).then((r) => r.json()),
    fetch(`${API}/api/hero-gradients`).then((r) => r.json()).catch(() => ['slate']),
  ]);
  heroGradients = gradients;
  siteEn = en;
  siteZh = zh;
  projectSlugs = slugs;
  projectsData = {};
  await Promise.all(
    slugs.map(async ({ slug }) => {
      const [content, slots, imgs] = await Promise.all([
        fetch(`${API}/api/projects/${slug}/content`).then((r) => r.json()),
        fetch(`${API}/api/projects/${slug}/slots`).then((r) => r.json()).catch(() => []),
        fetch(`${API}/api/collections/projects/${slug}/images`).then((r) => r.json()).catch(() => ({ images: [] })),
      ]);
      projectsData[slug] = content;
      projectSlots[slug] = slots;
      projectImages[slug] = imgs.images || [];
    })
  );

  pageMetaEl.textContent = '網站文案為中英對照；案例頁以段落分組，文字與圖片在同一張卡片內編輯';
  renderContentForm();
  syncPreview();
}

/*
  以「段落」為單位呈現案例頁：每張卡片是頁面上的一個區塊，標題用該區塊實際的
  heading（而不是 sections #3 這種泛型標籤），卡片內同時放這個區塊的文字欄位
  與圖片格，改一個段落不必在兩個分頁之間來回。
*/
const SECTION_TYPES = {
  textSection: '純文字段落',
  deviceShowcase: '裝置展示圖',
  experienceDemo: '體驗展示',
  featureSplit: '圖文並排',
  featureGrid: '功能格線',
  imageRow: '並排圖片',
  illustrationGrid: '插畫格線',
  researchFramework: '研究架構',
  persona: 'Persona',
  designThemes: '設計主軸',
  flow: '流程步驟',
};

// 段落卡片標題優先用 heading，其次 eyebrow，都沒有才退回型別名稱
function sectionTitle(sec, i) {
  const name = sec.heading || sec.eyebrow || SECTION_TYPES[sec.type] || sec.type;
  return `${i + 1}. ${name}`;
}

function renderProjectCard(slug, title, form) {
  const data = projectsData[slug];
  if (!data) return;
  const slots = projectSlots[slug] || [];
  const images = projectImages[slug] || [];
  const bySlot = new Map(images.filter((im) => im.slotIndex != null).map((im) => [im.slotIndex, im]));

  const wrap = document.createElement('div');
  wrap.className = 'content-section collapsed';
  const header = document.createElement('div');
  header.className = 'content-section__header';
  header.innerHTML = `<span>${title}</span><span class="chev">▾</span>`;
  header.addEventListener('click', () => wrap.classList.toggle('collapsed'));
  const body = document.createElement('div');
  body.className = 'content-section__body';

  // Hero（不是 sections 的一員，單獨一張卡）
  const heroCard = document.createElement('div');
  heroCard.className = 'sec-card';
  heroCard.innerHTML = '<div class="sec-card__head"><strong>Hero</strong></div>';
  const heroBody = document.createElement('div');
  heroBody.className = 'sec-card__body';
  if (data.hero) Object.keys(data.hero).forEach((k) => renderMonoNode(data.hero[k], ['hero', k], heroBody, data));
  const heroSlots = slots.filter((sl) => sl.sectionIndex === -1);
  if (heroSlots.length) heroBody.appendChild(slotStrip(slug, heroSlots, bySlot));
  heroCard.appendChild(heroBody);
  body.appendChild(heroCard);

  (data.sections || []).forEach((sec, i) => {
    const card = document.createElement('div');
    card.className = 'sec-card';

    const head = document.createElement('div');
    head.className = 'sec-card__head';
    head.innerHTML = `<strong>${sectionTitle(sec, i)}</strong>
      <span class="sec-card__type">${SECTION_TYPES[sec.type] || sec.type}</span>`;
    const del = document.createElement('button');
    del.className = 'sec-card__del';
    del.textContent = '刪除段落';
    del.addEventListener('click', () => deleteSection(slug, i));
    head.appendChild(del);
    card.appendChild(head);

    const cardBody = document.createElement('div');
    cardBody.className = 'sec-card__body';
    Object.keys(sec).forEach((k) => renderMonoNode(sec[k], ['sections', i, k], cardBody, data));

    const mine = slots.filter((sl) => sl.sectionIndex === i);
    if (mine.length) cardBody.appendChild(slotStrip(slug, mine, bySlot));

    card.appendChild(cardBody);
    body.appendChild(card);
  });

  // 新增段落
  const add = document.createElement('div');
  add.className = 'sec-add';
  const sel = document.createElement('select');
  Object.entries(SECTION_TYPES).forEach(([v, label]) => {
    const o = document.createElement('option');
    o.value = v; o.textContent = label; sel.appendChild(o);
  });
  const addBtn = document.createElement('button');
  addBtn.textContent = '＋ 新增段落';
  addBtn.addEventListener('click', () => addSection(slug, sel.value));
  add.appendChild(sel); add.appendChild(addBtn);
  body.appendChild(add);

  wrap.appendChild(header);
  wrap.appendChild(body);
  form.appendChild(wrap);
}

// 一個段落的圖片格：有圖顯示縮圖，沒有就是可點的空位，都直接上傳到指定版位
function slotStrip(slug, slotList, bySlot) {
  const strip = document.createElement('div');
  strip.className = 'slot-strip';
  slotList.forEach((sl) => {
    const img = bySlot.get(sl.index);
    const cell = document.createElement('div');
    cell.className = 'slot-cell' + (img ? '' : ' slot-cell--empty');
    cell.innerHTML = img
      ? `<img src="${imgUrl(img)}" alt="${img.filename}" loading="lazy" />
         <span class="slot-cell__name">${img.filename}</span>`
      : `<span class="slot-cell__plus">＋</span><span class="slot-cell__name">待上傳</span>`;
    cell.title = sl.label;
    cell.addEventListener('click', () => {
      pendingUpload = { kind: 'slot', slug, slot: sl.index };
      fileInputEl.click();
    });
    strip.appendChild(cell);
  });
  return strip;
}

async function addSection(slug, type) {
  const data = projectsData[slug];
  const blank = { type };
  if (type === 'featureGrid') blank.columns = [];
  if (type === 'imageRow') blank.images = [];
  if (type === 'persona') blank.personas = [];
  if (type === 'flow') blank.steps = [];
  if (type === 'designThemes') blank.themes = [];
  if (type === 'illustrationGrid') { blank.count = 1; blank.alt = ''; }
  if (type === 'textSection') blank.paragraphs = [''];
  if (['deviceShowcase','experienceDemo','featureSplit','researchFramework'].includes(type)) {
    blank.ratio = '4/3'; blank.alt = '';
  }
  if (['experienceDemo','featureSplit','researchFramework','textSection'].includes(type)) blank.heading = '新段落';
  if (type === 'featureSplit') { blank.body = ''; blank.imagePosition = 'right'; }
  data.sections = data.sections || [];
  data.sections.push(blank);
  await persistProject(slug, '已新增段落，記得按儲存');
}

async function deleteSection(slug, i) {
  const data = projectsData[slug];
  const sec = data.sections[i];
  const slots = (projectSlots[slug] || []).filter((sl) => sl.sectionIndex === i);
  const later = (projectSlots[slug] || []).filter((sl) => sl.sectionIndex > i).length;

  let msg = `確定刪除段落「${sectionTitle(sec, i)}」？`;
  if (slots.length) msg += `\n\n這個段落有 ${slots.length} 個圖片版位，圖檔會保留在資料夾裡不刪除。`;
  if (later) msg += `\n⚠️ 後面還有 ${later} 個版位，刪除後版位編號會往前移，那些圖片會落到別的段落，需要你手動調整。`;
  if (!confirm(msg)) return;

  data.sections.splice(i, 1);
  await persistProject(slug, '已刪除段落，記得檢查後面的圖片是否錯位');
}

// 結構改動（新增／刪除段落）立即寫回檔案，否則版位計算會跟畫面對不上
async function persistProject(slug, toast) {
  try {
    const res = await fetch(`${API}/api/projects/${slug}/content`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectsData[slug]),
    });
    if (!res.ok) throw new Error(await res.text());
    showToast(toast);
    await loadContentPage();
  } catch (err) {
    showToast(`儲存失敗：${err.message}`, true);
  }
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
    } else if (pending.kind === 'slot') {
      const res = await fetch(
        `${API}/api/collections/projects/${pending.slug}/images?filename=${encodeURIComponent(file.name)}&slot=${pending.slot}`,
        { method: 'POST', headers: { 'Content-Type': file.type || 'application/octet-stream' }, body: file }
      );
      if (!res.ok) throw new Error(await res.text());
      const { filename } = await res.json();
      showToast(`已上傳為 ${filename}`);
      await loadContentPage();
    } else if (pending.kind === 'home-set') {
      const res = await fetch(`${API}/api/home/sets/${pending.set}?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file,
      });
      if (!res.ok) throw new Error(await res.text());
      const { filename } = await res.json();
      showToast(`已新增 ${filename}`);
      await loadHome();
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

/*
  開啟後台預設停在 Home 首頁圖片；網址帶 hash（#gallery / #portfolio / #content）
  時改開該頁，方便直接連到特定分頁。currentPage、側欄 active 標記與實際載入的
  內容三者必須一致，所以統一走側欄按鈕的 click 流程，不另外複製一套切換邏輯。
*/
function openInitialPage() {
  const wanted = location.hash.replace('#', '');
  const btn = sidebarItems.find((b) => b.dataset.page === wanted && !b.disabled);
  if (btn) {
    btn.click();
    return;
  }
  loadHome().catch((err) => showToast(`載入失敗：${err.message}`, true));
}

openInitialPage();

// ---------- 發布 ----------
// 只送出 src/content 與 src/assets（文字與圖片），程式碼永遠不會被帶走；
// 送出前會先跑一次建置驗證，內容有問題就擋下，線上網站維持原狀。

const publishBtn = document.getElementById('publishBtn');
const publishPanel = document.getElementById('publishPanel');
const publishBody = document.getElementById('publishBody');
const publishHint = document.getElementById('publishHint');
const publishConfirm = document.getElementById('publishConfirm');
const publishCount = document.getElementById('publishCount');

async function refreshPublishBadge() {
  try {
    const s = await fetch(`${API}/api/publish/status`).then((r) => r.json());
    const n = (s.files || []).length;
    publishCount.textContent = String(n);
    publishCount.hidden = n === 0;
    publishBtn.classList.toggle('publish-btn--ready', n > 0);
  } catch {
    publishCount.hidden = true;
  }
}

async function openPublishPanel() {
  publishPanel.hidden = false;
  publishBody.innerHTML = '<p class="publish-empty">檢查中…</p>';
  publishHint.textContent = '';
  publishConfirm.disabled = true;

  try {
    const s = await fetch(`${API}/api/publish/status`).then((r) => r.json());

    if (!s.files.length) {
      publishBody.innerHTML = '<p class="publish-empty">目前沒有待發布的變更。</p>';
      return;
    }
    if (s.behind) {
      publishBody.innerHTML = `<p class="publish-empty">遠端有 ${s.behind} 個本機沒有的 commit，請先在終端機執行 <code>git pull --rebase</code>。</p>`;
      return;
    }

    const rows = s.files
      .map((f) => `<li><span class="publish-status">${f.status}</span>${f.file}</li>`)
      .join('');
    const outside = s.outside.length
      ? `<div class="publish-outside">
           <strong>以下不在發布範圍，會留在本機</strong>
           <ul>${s.outside.map((f) => `<li>${f}</li>`).join('')}</ul>
         </div>`
      : '';

    publishBody.innerHTML = `
      <div class="publish-section">
        <strong>將發布 ${s.files.length} 個檔案</strong>
        <ul class="publish-files">${rows}</ul>
      </div>
      ${outside}
      <div class="publish-section">
        <strong>commit 訊息（自動產生）</strong>
        <pre class="publish-msg">${s.message.subject}\n\n${s.message.body}</pre>
      </div>
    `;
    publishHint.textContent = '送出前會先跑建置驗證，內容有問題會擋下。';
    publishConfirm.disabled = false;
  } catch (err) {
    publishBody.innerHTML = `<p class="publish-empty">讀取失敗：${err.message}</p>`;
  }
}

publishBtn.addEventListener('click', openPublishPanel);
document.getElementById('publishClose').addEventListener('click', () => { publishPanel.hidden = true; });

publishConfirm.addEventListener('click', async () => {
  publishConfirm.disabled = true;
  publishHint.textContent = '驗證建置並發布中，約需十秒…';
  try {
    const res = await fetch(`${API}/api/publish`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) {
      publishHint.textContent = '';
      publishBody.innerHTML = `<p class="publish-empty">${data.error}</p>` +
        (data.log ? `<pre class="publish-msg">${data.log}</pre>` : '');
      return;
    }
    publishPanel.hidden = true;
    showToast(`已發布 ${data.sha}，Vercel 建置中`);
    await refreshPublishBadge();
  } catch (err) {
    publishHint.textContent = '';
    publishBody.innerHTML = `<p class="publish-empty">發布失敗：${err.message}</p>`;
  } finally {
    publishConfirm.disabled = false;
  }
});

refreshPublishBadge();
