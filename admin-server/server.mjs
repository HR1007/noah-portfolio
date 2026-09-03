// 本機專用的小型後台伺服器 —— 只給 /admin 這個自訂管理介面用，正式網站不會載入這支程式。
// 管三種素材：
//   /api/collections/gallery/:slug   Gallery 三個相簿（編號序列）
//   /api/collections/projects/:slug  Portfolio 五個 case study（編號序列，對應 content.config.ts 的 sections）
//   /api/home                        Home 頁面的固定命名圖片（hero / avatar / about / beyond-grid）
import express from 'express';
import cors from 'cors';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { imageSize } from 'image-size';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const GALLERY_DIR = path.join(ROOT, 'src/assets/gallery');
const PROJECTS_ASSET_DIR = path.join(ROOT, 'src/assets/projects');
const PROJECTS_CONTENT_DIR = path.join(ROOT, 'src/content/projects');
const HOME_DIR = path.join(ROOT, 'src/assets/home');
const SITE_CONTENT_DIR = path.join(ROOT, 'src/content/site');
const SITE_EN = path.join(SITE_CONTENT_DIR, 'main-en.json');
const SITE_ZH = path.join(SITE_CONTENT_DIR, 'main-zh.json');

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif']);
const HOME_SLOTS = ['hero', 'avatar', 'about', 'beyond-grid'];

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
  return Promise.all(entries.map((filename) => describeFile(path.join(dir, filename), `${urlBase}/${slug}/${filename}`)));
}

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
    const maxIndex = existing.reduce((max, f) => {
      const n = parseInt(path.basename(f, path.extname(f)), 10);
      return Number.isFinite(n) ? Math.max(max, n) : max;
    }, -1);
    const nextName = `${String(maxIndex + 1).padStart(2, '0')}${ext}`;

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

app.use('/gallery-src', express.static(GALLERY_DIR));
app.use('/projects-src', express.static(PROJECTS_ASSET_DIR));
app.use('/home-src', express.static(HOME_DIR));

const PORT = 5174;
app.listen(PORT, () => {
  console.log(`Admin server listening on http://localhost:${PORT}`);
});
