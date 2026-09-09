/*
  把案例頁的文字欄位從純字串轉成 { en: "…" } 的中英對照結構。
  轉完之後中文就可以在後台逐欄填，沒填的欄位由 t() 自動退回英文。

    node scripts/localize-project.mjs foodlet          單一案例
    node scripts/localize-project.mjs --all            全部案例
    node scripts/localize-project.mjs --all --dry-run  只看會動到什麼，不寫檔

  安全性：轉檔最怕的是英文原稿在過程中掉字。所以寫檔前會把轉換後每個欄位的 en
  值跟轉換前的原字串逐一比對，只要有一個對不上就整份中止、不寫檔。

  哪些欄位會轉：由下面的 LOCALIZE 白名單決定，跟 content.config.ts 裡套用
  localized() 的欄位一致。ratio／layout／direction／ctaHref 這些不是給人讀的值
  不轉；persona 的 name 與 flow 的 step label 也不轉——它們不輸出到頁面，
  只是後台辨識版位用的標籤。
*/

import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const CONTENT_DIR = 'src/content/projects';

const LOCALIZE = new Set([
  'title',
  'summary',
  'ctaLabel',
  'eyebrow',
  'heading',
  'body',
  'alt',
  'description',
  'paragraphs',
]);

/** 轉換過程中記下「這個欄位原本是什麼字」，寫檔前用來驗證沒有掉字。 */
function convert(node, trail, seen) {
  if (Array.isArray(node)) return node.map((item, i) => convert(item, [...trail, i], seen));
  if (!node || typeof node !== 'object') return node;

  const out = {};
  for (const [key, value] of Object.entries(node)) {
    const here = [...trail, key];

    if (LOCALIZE.has(key) && typeof value === 'string') {
      seen.push({ trail: here, text: value });
      out[key] = { en: value };
      continue;
    }

    // paragraphs 是字串陣列，每一段各自轉
    if (LOCALIZE.has(key) && Array.isArray(value) && value.every((v) => typeof v === 'string')) {
      out[key] = value.map((text, i) => {
        seen.push({ trail: [...here, i], text });
        return { en: text };
      });
      continue;
    }

    out[key] = convert(value, here, seen);
  }
  return out;
}

/** 依 trail 走回轉換後的結構，確認該欄位的 en 就是原字串。 */
function readAt(root, trail) {
  let node = root;
  for (const step of trail) {
    if (node == null) return undefined;
    node = node[step];
  }
  return node;
}

async function run(slug, dryRun) {
  const file = path.join(CONTENT_DIR, `${slug}.md`);
  const raw = await fs.readFile(file, 'utf-8');
  const { data, content } = matter(raw);

  const seen = [];
  const next = convert(data, [], seen);

  if (!seen.length) {
    console.log(`  ${slug}：沒有需要轉換的欄位（可能已經轉過了）`);
    return 0;
  }

  // 掉字檢查：每一個轉換過的欄位，en 都必須跟原字串逐字相同
  for (const { trail, text } of seen) {
    const got = readAt(next, trail);
    if (!got || got.en !== text) {
      throw new Error(
        `${slug} 的 ${trail.join('.')} 轉換後對不上原文，整份中止未寫檔。\n` +
          `  原文：${JSON.stringify(text)}\n  轉換後：${JSON.stringify(got)}`
      );
    }
  }

  if (!dryRun) await fs.writeFile(file, matter.stringify(content, next), 'utf-8');
  console.log(`  ${slug}：${seen.length} 個欄位${dryRun ? '（dry-run，未寫檔）' : '已轉換'}`);
  return seen.length;
}

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const targets = args.includes('--all')
  ? (await fs.readdir(CONTENT_DIR)).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, '')).sort()
  : args.filter((a) => !a.startsWith('--'));

if (!targets.length) {
  console.error('用法：node scripts/localize-project.mjs <slug> | --all [--dry-run]');
  process.exit(1);
}

let total = 0;
for (const slug of targets) total += await run(slug, dryRun);
console.log(`\n合計 ${total} 個欄位${dryRun ? '（dry-run）' : ''}`);
