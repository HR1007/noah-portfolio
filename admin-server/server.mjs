// 本機專用的小型後台伺服器 —— 只給 /admin 這個自訂管理介面用，正式網站不會載入這支程式。
// 只處理 Gallery 三個相簿的圖片：列表（含尺寸/檔案大小）、上傳、刪除、拖拉排序。
import express from 'express';
import cors from 'cors';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { imageSize } from 'image-size';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const GALLERY_DIR = path.join(ROOT, 'src/assets/gallery');
const SITE_EN = path.join(ROOT, 'src/content/site/main-en.json');

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif']);

const app = express();
app.use(cors());
app.use(express.json());

function albumDir(slug) {
  const resolved = path.join(GALLERY_DIR, slug);
  if (!resolved.startsWith(GALLERY_DIR)) throw new Error('invalid slug');
  return resolved;
}

async function listAlbumSlugs() {
  const site = JSON.parse(await fs.readFile(SITE_EN, 'utf-8'));
  const { albums, germany } = site.gallery;
  return [...albums.map((a) => ({ slug: a.slug, title: a.title })), { slug: germany.slug, title: germany.title }];
}

app.get('/api/albums', async (req, res) => {
  try {
    res.json(await listAlbumSlugs());
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get('/api/albums/:slug/images', async (req, res) => {
  try {
    const dir = albumDir(req.params.slug);
    const entries = (await fs.readdir(dir)).filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase())).sort();
    const images = await Promise.all(
      entries.map(async (filename) => {
        const full = path.join(dir, filename);
        const [stat, buf] = await Promise.all([fs.stat(full), fs.readFile(full)]);
        let dims = { width: null, height: null };
        try {
          const s = imageSize(buf);
          dims = { width: s.width, height: s.height };
        } catch {
          // 讀不出尺寸就留 null，前端顯示「—」
        }
        return {
          filename,
          url: `/gallery-src/${req.params.slug}/${filename}`,
          sizeBytes: stat.size,
          width: dims.width,
          height: dims.height,
          // birthtime 在 rename（拖拉排序／互換位置）時不會變，比較貼近「上傳日期」；
          // mtime 才是實際寫入內容的時間，兩個都給前端，各自標清楚。
          uploadedAt: stat.birthtime.toISOString(),
          modifiedAt: stat.mtime.toISOString(),
        };
      })
    );
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/albums/:slug/images', express.raw({ type: '*/*', limit: '25mb' }), async (req, res) => {
  try {
    const dir = albumDir(req.params.slug);
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

app.delete('/api/albums/:slug/images/:filename', async (req, res) => {
  try {
    const dir = albumDir(req.params.slug);
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
app.put('/api/albums/:slug/order', async (req, res) => {
  try {
    const dir = albumDir(req.params.slug);
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

app.use('/gallery-src', express.static(GALLERY_DIR));

const PORT = 5174;
app.listen(PORT, () => {
  console.log(`Admin server listening on http://localhost:${PORT}`);
});
