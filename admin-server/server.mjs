// 本機專用的小型後台伺服器 —— 只給 /admin 這個自訂管理介面用，正式網站不會載入這支程式。
// 管三種素材：
//   /api/collections/gallery/:slug   Gallery 三個相簿（編號序列）
//   /api/collections/projects/:slug  Portfolio 五個 case study（編號序列，對應 content.config.ts 的 sections）
//   /api/home                        Home 頁面的固定命名圖片（hero / avatar / about）
//   /api/home/sets/:set              Home 上數量可變的圖組（hobby = Beyond the Grid 生活照）
//   /api/projects/:slug/sections     案例頁的段落結構（新增／刪除段落、段落內加減項目）
import express from 'express';
import cors from 'cors';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { imageSize } from 'image-size';
import matter from 'gray-matter';
import {
  getImageSlots, SECTION_META, describeSection, sectionItemCount,
  createSection, addSectionItem, removeSectionItem, sectionTypeOptions,
} from '../src/lib/image-slots.mjs';
import { HERO_GRADIENTS } from '../src/lib/hero-gradients.mjs';
import {
  CONTENT_PATHS, changedFiles, outsideFiles, buildMessage,
  validateBuild, remoteBehind, commitAndPush,
} from '../scripts/publish-core.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const GALLERY_DIR = path.join(ROOT, 'src/assets/gallery');
const PROJECTS_ASSET_DIR = path.join(ROOT, 'src/assets/projects');
const PROJECTS_CONTENT_DIR = path.join(ROOT, 'src/content/projects');
const HOME_DIR = path.join(ROOT, 'src/assets/home');
const ADMIN_UI_DIR = path.join(ROOT, 'admin-ui');
const SITE_CONTENT_DIR = path.join(ROOT, 'src/content/site');
const SITE_EN = path.join(SITE_CONTENT_DIR, 'main-en.json');
const SITE_ZH = path.join(SITE_CONTENT_DIR, 'main-zh.json');

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif']);
const HOME_SLOTS = ['hero', 'avatar', 'about'];
// Home 上數量可變的圖組：網站端用 getHomeImageSet(prefix) 依檔名排序取用，
// 所以檔名一律是 <prefix>-NN，可以隨時追加。
const HOME_SETS = { hobby: 'Beyond the Grid（生活照）' };

const COLLECTIONS = {
  gallery: { dir: GALLERY_DIR, urlBase: '/gallery-src' },
  projects: { dir: PROJECTS_ASSET_DIR, urlBase: '/projects-src' },
};

const app = express();
app.use(cors());
app.use(express.json());

function collectionOf(type) {
  const c = COLLECTIONS[type];
  if (!c) throw new Error(`unknown collection type: ${type}`);
  return c;
}

function slugDir(type, slug) {
  const { dir } = collectionOf(type);
  const resolved = path.join(dir, slug);
  if (!resolved.startsWith(dir)) throw new Error('invalid slug');
  return resolved;
}

async function describeFile(full, urlPath) {
  const [stat, buf] = await Promise.all([fs.stat(full), fs.readFile(full)]);
  let dims = { width: null, height: null };
  try {
    const s = imageSize(buf);
    dims = { width: s.width, height: s.height };
  } catch {
    // 讀不出尺寸就留 null，前端顯示「—」
  }
  return {
    filename: path.basename(full),
    url: urlPath,
    sizeBytes: stat.size,
    width: dims.width,
    height: dims.height,
    // rename（拖拉排序／互換位置）不會動到 birthtime/mtime，比較適合當「上傳日期」判斷依據。
    uploadedAt: stat.birthtime.toISOString(),
    modifiedAt: stat.mtime.toISOString(),
  };
}

async function listSlugImages(type, slug) {
  const { urlBase } = collectionOf(type);
  const dir = slugDir(type, slug);
  const entries = (await fs.readdir(dir)).filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase())).sort();
  const images = await Promise.all(
    entries.map((filename) => describeFile(path.join(dir, filename), `${urlBase}/${slug}/${filename}`))
  );

  if (type === 'projects') {
    const { slots, sections } = await describeProject(slug).catch(() => ({ slots: [], sections: [] }));
    const labels = slots.map((s) => s.label);
    // 版位以「檔名編號」對應，不是陣列位置：刪掉中間某張圖後陣列會塌陷，
    // 用位置配對會讓後面的圖全部套到前一格的標籤，看起來就像圖片往前遞補。
    images.forEach((img) => {
      const base = path.basename(img.filename, path.extname(img.filename));
      const idx = /^\d+$/.test(base) ? Number(base) : null;
      img.slotIndex = idx;
      img.slotLabel = idx === null ? null : labels[idx] ?? null;
    });
    return { images, requiredSlots: slots.length, slotLabels: labels, slots, sections };
  }
  return { images, requiredSlots: null, slotLabels: null, slots: null, sections: null };
}

// 版位規則的唯一來源在 src/lib/image-slots.mjs，渲染端 (ProjectDetail.astro)
// 讀的是同一支，後台不再自行維護一份，避免兩邊悄悄失去同步。
async function describeProject(slug) {
  const raw = await fs.readFile(projectFilePath(slug), 'utf-8');
  const { data } = matter(raw);
  return { data, slots: getImageSlots(data), sections: summarizeSections(data) };
}

// 後台段落卡片需要的資訊：標題、這個段落能不能再加一項、加的是圖還是字。
// 能不能加是 schema 決定的（例如 Image Row 最多三張、Feature Split 版型固定一張），
// 由 SECTION_META 統一回答，後台不自己判斷型別。
function summarizeSections(data) {
  return (data.sections || []).map((section, index) => {
    const meta = SECTION_META[section.type];
    const list = meta?.list ?? null;
    const count = sectionItemCount(section);
    return {
      index,
      type: section.type,
      title: describeSection(section, index),
      list: list
        ? {
            kind: list.kind, // 'image' = 加一項就多一格圖；'text' = 純文字，不佔版位
            label: list.label,
            count,
            canAdd: list.max == null || count < list.max,
            canRemove: count > (list.min ?? 0),
            items: list.kind === 'text' ? textItemPreviews(section, list) : null,
          }
        : null,
    };
  });
}

// 文字型清單在後台段落卡片上只顯示摘要（實際文案編輯在 Content 頁），
// 但要看得出哪一項是哪一項，否則不知道自己按的「移除」會拿掉哪一段。
function textItemPreviews(section, list) {
  return (section[list.key] || []).map((item) => {
    const text = typeof item === 'string' ? item : item.title || item.name || item.label || '';
    return text.length > 60 ? `${text.slice(0, 60)}…` : text;
  });
}

// 漸層清單由 src/lib/hero-gradients.mjs 提供，與 content schema 同一份，
// 後台不自行維護一份選項，避免兩邊選項不一致。
// 完整版位資訊（含所屬段落），供 Content 分頁以段落為單位分組顯示圖片。
// 一樣讀 src/lib/image-slots.mjs，不另外算一套。
app.get('/api/projects/:slug/slots', async (req, res) => {
  try {
    const raw = await fs.readFile(projectFilePath(req.params.slug), 'utf-8');
    const { data } = matter(raw);
    res.json(getImageSlots(data));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get('/api/hero-gradients', (req, res) => res.json(HERO_GRADIENTS));

app.get('/api/collections/gallery', async (req, res) => {
  try {
    const site = JSON.parse(await fs.readFile(SITE_EN, 'utf-8'));
    const { albums, germany } = site.gallery;
    res.json([...albums.map((a) => ({ slug: a.slug, title: a.title })), { slug: germany.slug, title: germany.title }]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get('/api/collections/projects', async (req, res) => {
  try {
    const files = (await fs.readdir(PROJECTS_CONTENT_DIR)).filter((f) => f.endsWith('.md'));
    const projects = await Promise.all(
      files.map(async (file) => {
        const raw = await fs.readFile(path.join(PROJECTS_CONTENT_DIR, file), 'utf-8');
        const { data } = matter(raw);
        return { slug: file.replace(/\.md$/, ''), title: data.title, order: data.order ?? 999 };
      })
    );
    projects.sort((a, b) => a.order - b.order);
    res.json(projects.map(({ slug, title }) => ({ slug, title })));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

function projectFilePath(slug) {
  const resolved = path.join(PROJECTS_CONTENT_DIR, `${slug}.md`);
  if (!resolved.startsWith(PROJECTS_CONTENT_DIR)) throw new Error('invalid slug');
  return resolved;
}

app.get('/api/projects/:slug/content', async (req, res) => {
  try {
    const raw = await fs.readFile(projectFilePath(req.params.slug), 'utf-8');
    const { data } = matter(raw);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// body 是整份 frontmatter 物件，寫回時保留原本的 markdown 內文（目前案例頁都用 sections
// 版型，內文本身沒有實際顯示在頁面上，但還是原樣保留，不憑空清空）。
app.put('/api/projects/:slug/content', async (req, res) => {
  try {
    const file = projectFilePath(req.params.slug);
    const raw = await fs.readFile(file, 'utf-8');
    const { content } = matter(raw);
    const next = matter.stringify(content, req.body);
    await fs.writeFile(file, next, 'utf-8');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ---------- 案例頁的段落結構（新增／刪除段落、段落內加減項目） ----------
//
// 這些動作都會改變「版位的數量與順序」，所以一定要連帶把圖片檔案重新編號：
// 檔名編號就是版位編號，只改 md 不改檔名的話，改動點之後的圖會整串錯位，
// 而且不會有任何錯誤訊息，只會默默把圖放到別的區塊去。兩件事因此綁在同一個流程裡。

app.get('/api/section-types', (req, res) => res.json(sectionTypeOptions()));

/**
 * 算出「新版位 → 舊版位」的對照表，用來決定哪個檔案要改成哪個編號。
 * null 代表這一格沒有對應的舊圖（新加的段落／新加的項目），維持空著。
 *
 * 對照的依據是「哪個段落的第幾格」，不是版位編號本身 —— 編號會因為前面
 * 插入或刪除而整串位移，拿它比對等於沒比對。
 *
 * @param {Record<string, any>} opts
 *   sectionMap      新段落索引 → 舊段落索引（-1 表示這是全新的段落）
 *   changedSection  這次動到的舊段落索引（只有段落內加減項目才需要）
 *   itemMap         該段落內：新的第幾格 → 舊的第幾格（null 表示新格子）
 */
function buildSlotOrigin(oldData, nextData, { sectionMap, changedSection = null, itemMap = null }) {
  const oldIndexByKey = new Map(
    getImageSlots(oldData).map((slot) => [`${slot.sectionIndex}:${slot.slotInSection ?? 0}`, slot.index])
  );

  return getImageSlots(nextData).map((slot) => {
    if (slot.sectionIndex === -1) return oldIndexByKey.get('-1:0') ?? null; // hero 不受段落增刪影響
    const oldSection = sectionMap[slot.sectionIndex];
    if (oldSection == null || oldSection < 0) return null;
    const inSection =
      oldSection === changedSection && itemMap ? itemMap[slot.slotInSection] : slot.slotInSection;
    if (inSection == null) return null;
    return oldIndexByKey.get(`${oldSection}:${inSection}`) ?? null;
  });
}

/** 依對照表算出要改哪些檔名、刪哪些檔案；只計算不執行，讓錯誤在動手前就浮現。 */
async function planRenumber(slug, oldData, slotOrigin) {
  const dir = slugDir('projects', slug);
  const files = (await fs.readdir(dir)).filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()));
  const byIndex = new Map();
  for (const f of files) {
    const base = path.basename(f, path.extname(f));
    if (/^\d+$/.test(base)) byIndex.set(Number(base), f);
  }

  const oldSlotCount = getImageSlots(oldData).length;
  const renames = [];
  const kept = new Set();

  slotOrigin.forEach((origin, newIndex) => {
    if (origin == null) return;
    kept.add(origin);
    const from = byIndex.get(origin);
    if (!from) return; // 這一格本來就沒上傳圖，維持空著
    const to = `${String(newIndex).padStart(2, '0')}${path.extname(from).toLowerCase()}`;
    if (from !== to) renames.push({ from, to });
  });

  // 編號超出版位範圍的圖片（使用者自己多上傳的）一律排在最後一格之後，
  // 不讓它們跟重新編號後的版位撞名而被悄悄覆蓋掉。
  [...byIndex.keys()]
    .filter((i) => i >= oldSlotCount)
    .sort((a, b) => a - b)
    .forEach((oldIndex, n) => {
      const from = byIndex.get(oldIndex);
      const to = `${String(slotOrigin.length + n).padStart(2, '0')}${path.extname(from).toLowerCase()}`;
      if (from !== to) renames.push({ from, to });
    });

  // 只刪「版位整個被拿掉」的圖（刪段落、刪項目）；範圍外的多餘圖片不動它們。
  const removals = [];
  for (const [index, filename] of byIndex) {
    if (index < oldSlotCount && !kept.has(index)) removals.push(filename);
  }

  return { dir, renames, removals };
}

async function executeRenumber({ dir, renames, removals }) {
  for (const f of removals) await fs.unlink(path.join(dir, f)).catch(() => {});
  // 先全部改成不會撞名的暫存檔名，再改成最終編號，避免排列過程中互相覆蓋
  const temps = renames.map((r, i) => `__tmp_${i}__${r.from}`);
  for (let i = 0; i < renames.length; i++) {
    await fs.rename(path.join(dir, renames[i].from), path.join(dir, temps[i]));
  }
  for (let i = 0; i < renames.length; i++) {
    await fs.rename(path.join(dir, temps[i]), path.join(dir, renames[i].to));
  }
}

/**
 * 套用一次段落結構變更：mutate 回傳新的 frontmatter 與版位對照，
 * 這裡負責把 md 與圖片檔名一起更新。
 * 會丟錯的檢查（型別不認得、超過上限、段落不存在）都發生在 mutate 與 planRenumber 裡，
 * 也就是還沒動到任何檔案之前。
 */
async function applySectionChange(slug, mutate) {
  const file = projectFilePath(slug);
  const raw = await fs.readFile(file, 'utf-8');
  const { data, content } = matter(raw);

  const { nextData, slotOrigin } = mutate(data);
  const plan = await planRenumber(slug, data, slotOrigin);

  await fs.writeFile(file, matter.stringify(content, nextData), 'utf-8');
  await executeRenumber(plan);
  return { renamed: plan.renames.length, deleted: plan.removals.length };
}

function sectionAt(data, raw) {
  const sections = data.sections || [];
  const index = Number(raw);
  if (!Number.isInteger(index) || index < 0 || index >= sections.length) {
    throw new Error(`第 ${raw} 個段落不存在`);
  }
  return { sections, index };
}

// body: { type: 'featureGrid', at?: 3 } —— at 省略時加在最後
app.post('/api/projects/:slug/sections', async (req, res) => {
  try {
    const result = await applySectionChange(req.params.slug, (data) => {
      const sections = [...(data.sections || [])];
      const at = Number.isInteger(req.body?.at)
        ? Math.max(0, Math.min(req.body.at, sections.length))
        : sections.length;
      sections.splice(at, 0, createSection(req.body?.type));

      const nextData = { ...data, sections };
      const sectionMap = sections.map((_, i) => (i < at ? i : i === at ? -1 : i - 1));
      return { nextData, slotOrigin: buildSlotOrigin(data, nextData, { sectionMap }) };
    });
    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(400).json({ error: String(err.message || err) });
  }
});

// 刪段落會連同該段落的圖片檔一起刪掉：那些圖已經沒有任何版位能放，留著只會變成孤兒檔案。
app.delete('/api/projects/:slug/sections/:index', async (req, res) => {
  try {
    const result = await applySectionChange(req.params.slug, (data) => {
      const { sections: all, index } = sectionAt(data, req.params.index);
      const sections = all.filter((_, i) => i !== index);

      const nextData = { ...data, sections };
      const sectionMap = sections.map((_, i) => (i < index ? i : i + 1));
      return { nextData, slotOrigin: buildSlotOrigin(data, nextData, { sectionMap }) };
    });
    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(400).json({ error: String(err.message || err) });
  }
});

// 往段落的可重複清單加一項：圖片型清單會多一個空版位，文字型清單只是多一段 [需確認] 文字。
app.post('/api/projects/:slug/sections/:index/items', async (req, res) => {
  try {
    const result = await applySectionChange(req.params.slug, (data) => {
      const { sections: all, index } = sectionAt(data, req.params.index);
      const before = sectionItemCount(all[index]);
      const sections = [...all];
      sections[index] = addSectionItem(all[index]);

      const nextData = { ...data, sections };
      const list = SECTION_META[all[index].type]?.list;
      // 文字型清單不佔版位，版位順序完全沒變，不需要 itemMap
      const itemMap =
        list?.kind === 'image' ? Array.from({ length: before + 1 }, (_, i) => (i < before ? i : null)) : null;
      return {
        nextData,
        slotOrigin: buildSlotOrigin(data, nextData, {
          sectionMap: sections.map((_, i) => i),
          changedSection: index,
          itemMap,
        }),
      };
    });
    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(400).json({ error: String(err.message || err) });
  }
});

// 移除段落裡的第 i 項（圖片型清單會連同那一格的圖片檔一起刪）
app.delete('/api/projects/:slug/sections/:index/items/:item', async (req, res) => {
  try {
    const result = await applySectionChange(req.params.slug, (data) => {
      const { sections: all, index } = sectionAt(data, req.params.index);
      const item = Number(req.params.item);
      const before = sectionItemCount(all[index]);
      const sections = [...all];
      sections[index] = removeSectionItem(all[index], item);

      const nextData = { ...data, sections };
      const list = SECTION_META[all[index].type]?.list;
      const itemMap =
        list?.kind === 'image'
          ? Array.from({ length: before - 1 }, (_, i) => (i < item ? i : i + 1))
          : null;
      return {
        nextData,
        slotOrigin: buildSlotOrigin(data, nextData, {
          sectionMap: sections.map((_, i) => i),
          changedSection: index,
          itemMap,
        }),
      };
    });
    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(400).json({ error: String(err.message || err) });
  }
});

// 回傳 { images, requiredSlots }：requiredSlots 只有 projects 類型會算（該案例頁
// 依 sections 需要幾張圖），gallery 類型固定是 null（相片牆沒有「需要幾張」的概念）。
app.get('/api/collections/:type/:slug/images', async (req, res) => {
  try {
    res.json(await listSlugImages(req.params.type, req.params.slug));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/collections/:type/:slug/images', express.raw({ type: '*/*', limit: '25mb' }), async (req, res) => {
  try {
    const dir = slugDir(req.params.type, req.params.slug);
    const ext = path.extname(String(req.query.filename || '')).toLowerCase();
    if (!IMAGE_EXT.has(ext)) return res.status(400).json({ error: 'unsupported extension' });

    const existing = (await fs.readdir(dir)).filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()));

    // 帶 slot 時上傳到指定版位（後台點某一格空位上傳）；不帶就接在最後一個編號之後。
    // 沒有 slot 的話，點空位上傳出來的檔名永遠是「最大編號 + 1」，根本不會落在那一格。
    let index;
    if (req.query.slot != null) {
      index = Number(req.query.slot);
      if (!Number.isInteger(index) || index < 0) return res.status(400).json({ error: 'invalid slot' });
      // 同一格可能已經有別種副檔名的舊圖，先清掉再寫，否則兩個檔案會搶同一個版位
      await Promise.all(
        existing
          .filter((f) => path.basename(f, path.extname(f)) === String(index).padStart(2, '0'))
          .map((f) => fs.unlink(path.join(dir, f)))
      );
    } else {
      index = existing.reduce((max, f) => {
        const n = parseInt(path.basename(f, path.extname(f)), 10);
        return Number.isFinite(n) ? Math.max(max, n) : max;
      }, -1) + 1;
    }

    const nextName = `${String(index).padStart(2, '0')}${ext}`;
    await fs.writeFile(path.join(dir, nextName), req.body);
    res.json({ filename: nextName });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.delete('/api/collections/:type/:slug/images/:filename', async (req, res) => {
  try {
    const dir = slugDir(req.params.type, req.params.slug);
    const target = path.join(dir, req.params.filename);
    if (!target.startsWith(dir)) throw new Error('invalid filename');
    await fs.unlink(target);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// body: { order: ["03.webp", "00.webp", ...] } —— 依新順序把檔案改名成 00, 01, 02...
// 先全部改成不會撞名的暫存檔名，再改成最終編號，避免排列過程中互相覆蓋。
app.put('/api/collections/:type/:slug/order', async (req, res) => {
  try {
    const dir = slugDir(req.params.type, req.params.slug);
    const order = req.body.order;
    if (!Array.isArray(order) || order.length === 0) return res.status(400).json({ error: 'order required' });

    const tempNames = order.map((name, i) => `__tmp_${i}__${name}`);
    for (let i = 0; i < order.length; i++) {
      await fs.rename(path.join(dir, order[i]), path.join(dir, tempNames[i]));
    }
    const finalNames = [];
    for (let i = 0; i < tempNames.length; i++) {
      const ext = path.extname(order[i]).toLowerCase();
      const finalName = `${String(i).padStart(2, '0')}${ext}`;
      await fs.rename(path.join(dir, tempNames[i]), path.join(dir, finalName));
      finalNames.push(finalName);
    }
    res.json({ order: finalNames });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// 案例頁的「互換兩格」：只改這兩個編號，其他格完全不動。
// 不能沿用 gallery 的 /order（那是把整串檔名壓成 00..N-1 的重排）——案例頁允許中間有
// 空版位，壓一次就把空位吃掉、後面的圖全部往前移一格，等於整頁圖片錯位。
app.put('/api/projects/:slug/images/swap', async (req, res) => {
  try {
    const dir = slugDir('projects', req.params.slug);
    const a = Number(req.body?.a);
    const b = Number(req.body?.b);
    if (![a, b].every((n) => Number.isInteger(n) && n >= 0) || a === b) {
      return res.status(400).json({ error: 'invalid slots' });
    }

    const files = (await fs.readdir(dir)).filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()));
    const fileAt = (n) => files.find((f) => path.basename(f, path.extname(f)) === String(n).padStart(2, '0'));
    const fa = fileAt(a);
    const fb = fileAt(b);
    if (!fa && !fb) return res.status(400).json({ error: '這兩格都沒有圖片' });

    const named = (n, from) => `${String(n).padStart(2, '0')}${path.extname(from).toLowerCase()}`;
    // 先搬到暫存檔名再定名，避免兩個檔案在互換過程中互相覆蓋
    const moves = [];
    if (fa) moves.push({ from: fa, to: named(b, fa) });
    if (fb) moves.push({ from: fb, to: named(a, fb) });
    const temps = moves.map((m, i) => `__swap_${i}__${m.from}`);
    for (let i = 0; i < moves.length; i++) await fs.rename(path.join(dir, moves[i].from), path.join(dir, temps[i]));
    for (let i = 0; i < moves.length; i++) await fs.rename(path.join(dir, temps[i]), path.join(dir, moves[i].to));

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ---------- Home：固定命名圖片（不是編號序列，不用排序） ----------

app.get('/api/home', async (req, res) => {
  try {
    const files = await fs.readdir(HOME_DIR);
    const slots = await Promise.all(
      HOME_SLOTS.map(async (name) => {
        const match = files.find((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()) && path.basename(f, path.extname(f)) === name);
        if (!match) return { name, filename: null };
        const info = await describeFile(path.join(HOME_DIR, match), `/home-src/${match}`);
        return { name, ...info };
      })
    );
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/home/:name', express.raw({ type: '*/*', limit: '25mb' }), async (req, res) => {
  try {
    const { name } = req.params;
    if (!HOME_SLOTS.includes(name)) return res.status(400).json({ error: 'unknown home slot' });
    const ext = path.extname(String(req.query.filename || '')).toLowerCase();
    if (!IMAGE_EXT.has(ext)) return res.status(400).json({ error: 'unsupported extension' });

    const files = await fs.readdir(HOME_DIR);
    await Promise.all(
      files
        .filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()) && path.basename(f, path.extname(f)) === name)
        .map((f) => fs.unlink(path.join(HOME_DIR, f)))
    );
    const filename = `${name}${ext}`;
    await fs.writeFile(path.join(HOME_DIR, filename), req.body);
    res.json({ filename });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.delete('/api/home/:name', async (req, res) => {
  try {
    const { name } = req.params;
    if (!HOME_SLOTS.includes(name)) return res.status(400).json({ error: 'unknown home slot' });
    const files = await fs.readdir(HOME_DIR);
    const match = files.find((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()) && path.basename(f, path.extname(f)) === name);
    if (match) await fs.unlink(path.join(HOME_DIR, match));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ---------- Home 圖組（數量可變，例如 Beyond the Grid 的生活照） ----------

function homeSetFiles(files, prefix) {
  return files
    .filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()))
    .filter((f) => new RegExp(`^${prefix}-\\d+$`).test(path.basename(f, path.extname(f))))
    .sort();
}

app.get('/api/home/sets/:set', async (req, res) => {
  try {
    const { set } = req.params;
    if (!HOME_SETS[set]) return res.status(400).json({ error: 'unknown home set' });
    const files = await fs.readdir(HOME_DIR);
    const images = await Promise.all(
      homeSetFiles(files, set).map((f) => describeFile(path.join(HOME_DIR, f), `/home-src/${f}`))
    );
    res.json({ set, label: HOME_SETS[set], images });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/home/sets/:set', express.raw({ type: '*/*', limit: '25mb' }), async (req, res) => {
  try {
    const { set } = req.params;
    if (!HOME_SETS[set]) return res.status(400).json({ error: 'unknown home set' });
    const ext = path.extname(String(req.query.filename || '')).toLowerCase();
    if (!IMAGE_EXT.has(ext)) return res.status(400).json({ error: 'unsupported extension' });

    // 一律接在最後一個編號之後，避免覆蓋既有檔案、也不會讓網站端的排序跳號
    const files = await fs.readdir(HOME_DIR);
    const maxIndex = homeSetFiles(files, set).reduce((max, f) => {
      const n = parseInt(path.basename(f, path.extname(f)).slice(set.length + 1), 10);
      return Number.isNaN(n) ? max : Math.max(max, n);
    }, 0);

    const filename = `${set}-${String(maxIndex + 1).padStart(2, '0')}${ext}`;
    await fs.writeFile(path.join(HOME_DIR, filename), req.body);
    res.json({ filename });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.delete('/api/home/sets/:set/:filename', async (req, res) => {
  try {
    const { set, filename } = req.params;
    if (!HOME_SETS[set]) return res.status(400).json({ error: 'unknown home set' });
    if (path.basename(filename) !== filename) return res.status(400).json({ error: 'invalid filename' });
    const target = path.join(HOME_DIR, filename);
    if (!target.startsWith(HOME_DIR)) return res.status(400).json({ error: 'invalid filename' });
    await fs.unlink(target).catch(() => {});
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ---------- 網站文案（Home/Portfolio/Gallery 等中英文字，src/content/site/*.json） ----------

app.get('/api/site', async (req, res) => {
  try {
    const [en, zh] = await Promise.all([
      fs.readFile(SITE_EN, 'utf-8').then(JSON.parse),
      fs.readFile(SITE_ZH, 'utf-8').then(JSON.parse),
    ]);
    res.json({ en, zh });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// body 是整份 JSON 物件，直接覆寫對應語言的檔案。
// 前端只送「型別結構跟原檔一致、只有字串值可能被改過」的物件，
// 這裡不重新驗證 schema —— 內容壞掉的話下次 astro build 會直接報錯，容易發現。
app.put('/api/site/:locale', async (req, res) => {
  try {
    const { locale } = req.params;
    if (locale !== 'en' && locale !== 'zh') return res.status(400).json({ error: 'invalid locale' });
    const target = locale === 'en' ? SITE_EN : SITE_ZH;
    await fs.writeFile(target, JSON.stringify(req.body, null, 2) + '\n', 'utf-8');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// 後台介面由這支 server 自己提供，不放在 public/：public 底下的東西會被
// 一併打包進 dist 部署到線上，訪客就能看到後台外殼。後台只跟本機檔案系統
// 溝通，本來就沒有理由出現在正式站台上。
// ---------- 發布（把後台改好的內容 commit + push，讓 Vercel 重新建置） ----------
// 邏輯全部來自 scripts/publish-core.mjs，與 npm run publish 完全同一套：
// 發布範圍僅限 src/content 與 src/assets，程式碼永遠不會被送出。

app.get('/api/publish/status', async (req, res) => {
  try {
    const [files, outside, behind] = await Promise.all([
      changedFiles(), outsideFiles(), remoteBehind(),
    ]);
    const message = files.length ? await buildMessage(files) : null;
    res.json({ scope: CONTENT_PATHS, files, outside, behind, message });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/publish', async (req, res) => {
  try {
    const files = await changedFiles();
    if (!files.length) return res.status(400).json({ error: '沒有待發布的內容變更' });

    const behind = await remoteBehind();
    if (behind) {
      return res.status(409).json({ error: `遠端有 ${behind} 個本機沒有的 commit，請先在終端機執行 git pull --rebase` });
    }

    // 內容不符 schema 就擋下：寧可發布失敗，也不要讓線上網站建置爆掉
    const build = await validateBuild();
    if (!build.ok) return res.status(422).json({ error: '建置驗證失敗，已中止發布', log: build.log });

    const { subject, body } = await buildMessage(files);
    const sha = await commitAndPush(subject, body);
    res.json({ ok: true, sha, subject, count: files.length });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.use(express.static(ADMIN_UI_DIR));

app.use('/gallery-src', express.static(GALLERY_DIR));
app.use('/projects-src', express.static(PROJECTS_ASSET_DIR));
app.use('/home-src', express.static(HOME_DIR));

const PORT = 5174;
app.listen(PORT, () => {
  console.log(`後台介面與 API： http://localhost:${PORT}`);
  console.log('Preview 功能另需 `npm run dev`（http://localhost:4321）');
});
