// 本機後台前端邏輯 —— 純原生 JS，不依賴任何框架。
// 只跟 admin-server（npm run admin, http://localhost:5174）溝通，
// 不會影響正式站台的任何一行程式碼或打包內容。
const API = 'http://localhost:5174';

const albumTabsEl = document.getElementById('albumTabs');
const albumMetaEl = document.getElementById('albumMeta');
const gridEl = document.getElementById('grid');
const fileInputEl = document.getElementById('fileInput');
const lightboxEl = document.getElementById('lightbox');
const lightboxImageEl = document.getElementById('lightboxImage');
const lightboxInfoEl = document.getElementById('lightboxInfo');
const lightboxCloseEl = document.getElementById('lightboxClose');

let albums = [];
let currentSlug = null;
let currentImages = [];
let dragFromIndex = null;
let selectedIndex = null;

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

function openLightbox(img, index) {
  lightboxImageEl.src = `${API}${img.url}`;
  lightboxImageEl.alt = img.filename;
  lightboxInfoEl.innerHTML = `
    <div><dt>檔名</dt><dd>${img.filename}</dd></div>
    <div><dt>順序位置</dt><dd>第 ${index + 1} 張${index === 0 ? '（Cover）' : ''}</dd></div>
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

async function loadAlbums() {
  albums = await fetch(`${API}/api/albums`).then((r) => r.json());
  albumTabsEl.innerHTML = '';
  albums.forEach((album) => {
    const btn = document.createElement('button');
    btn.className = 'tab' + (album.slug === currentSlug ? ' tab--active' : '');
    btn.textContent = album.title;
    btn.addEventListener('click', () => selectAlbum(album.slug));
    albumTabsEl.appendChild(btn);
  });
  if (!currentSlug && albums.length > 0) {
    await selectAlbum(albums[0].slug);
  }
}

async function selectAlbum(slug) {
  currentSlug = slug;
  [...albumTabsEl.children].forEach((btn, i) => {
    btn.classList.toggle('tab--active', albums[i].slug === slug);
  });
  await loadImages();
}

async function loadImages() {
  albumMetaEl.textContent = '載入中…';
  selectedIndex = null;
  currentImages = await fetch(`${API}/api/albums/${currentSlug}/images`).then((r) => r.json());
  albumMetaEl.textContent = `${currentImages.length} 張照片 · 拖拉調順序，或點兩張快速互換位置`;
  renderGrid();
}

function renderGrid() {
  gridEl.innerHTML = '';
  currentImages.forEach((img, index) => {
    const tile = document.createElement('div');
    tile.className = 'tile' + (index === selectedIndex ? ' tile--selected' : '');
    tile.draggable = true;
    tile.dataset.index = String(index);

    tile.innerHTML = `
      <div class="tile__image-wrap">
        ${index === 0 ? '<span class="tile__badge">Cover</span>' : ''}
        <img src="${API}${img.url}" alt="${img.filename}" loading="lazy" />
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
      openLightbox(img, index);
    });

    // 點兩張圖快速互換位置：不用拖著整張圖跨越整個 grid，適合離很遠的兩張圖交換。
    tile.addEventListener('click', () => {
      if (selectedIndex === null) {
        selectedIndex = index;
        renderGrid();
      } else if (selectedIndex === index) {
        selectedIndex = null;
        renderGrid();
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
  addTile.addEventListener('click', () => fileInputEl.click());
  gridEl.appendChild(addTile);
}

async function handleDelete(filename) {
  if (!confirm(`確定要刪除 ${filename}？`)) return;
  try {
    const res = await fetch(`${API}/api/albums/${currentSlug}/images/${filename}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(await res.text());
    showToast(`已刪除 ${filename}`);
    await loadImages();
  } catch (err) {
    showToast(`刪除失敗：${err.message}`, true);
  }
}

async function submitOrder(order) {
  const res = await fetch(`${API}/api/albums/${currentSlug}/order`, {
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

fileInputEl.addEventListener('change', async () => {
  const file = fileInputEl.files[0];
  fileInputEl.value = '';
  if (!file) return;
  try {
    const res = await fetch(`${API}/api/albums/${currentSlug}/images?filename=${encodeURIComponent(file.name)}`, {
      method: 'POST',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file,
    });
    if (!res.ok) throw new Error(await res.text());
    const { filename } = await res.json();
    showToast(`已上傳為 ${filename}`);
    await loadImages();
  } catch (err) {
    showToast(`上傳失敗：${err.message}`, true);
  }
});

loadAlbums().catch((err) => showToast(`載入失敗：${err.message}`, true));
