#!/usr/bin/env node
/**
 * 把後台改好的內容發布上線。
 *
 *   npm run publish              驗證 → 顯示差異 → 確認 → commit + push
 *   npm run publish -- --dry-run 只驗證與顯示，不 commit 也不 push
 *   npm run publish -- --yes     略過互動確認（給自動化用，平常不建議）
 *
 * 安全機制：
 *   1. 先跑一次 astro build。內容不符 content schema 就中止——寧可發布失敗，
 *      也不要把會讓線上建置爆掉的內容推上去。
 *   2. 只 commit CONTENT_PATHS 底下的檔案，絕不 git add -A，
 *      免得把還在改一半的程式碼一起送出去。
 *   3. 遠端有新 commit 時中止，不自動合併、更不 force push。
 *   4. commit 訊息由實際差異自動產生，內容仍會在確認畫面完整列出。
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const run = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** 後台唯一會寫入的兩個目錄；發布範圍僅限於此。 */
const CONTENT_PATHS = ['src/content', 'src/assets'];

const DRY = process.argv.includes('--dry-run');
const YES = process.argv.includes('--yes');

const git = async (args) => (await run('git', args, { cwd: ROOT, maxBuffer: 32 * 1024 * 1024 })).stdout;

function fail(msg, detail) {
  console.error(`\n✖ ${msg}`);
  if (detail) console.error(detail.trim().split('\n').slice(-12).join('\n'));
  process.exit(1);
}

/** 解析 git status --porcelain，只留發布範圍內的檔案。 */
async function changedFiles() {
  const out = await git(['status', '--porcelain', '--', ...CONTENT_PATHS]);
  return out.split('\n').filter(Boolean).map((line) => ({
    status: line.slice(0, 2).trim(),
    file: line.slice(3).replace(/^"|"$/g, ''),
  }));
}

async function blobHash(rev, file) {
  return git(['rev-parse', `${rev}:${file}`]).then((s) => s.trim()).catch(() => null);
}

/**
 * 圖片常常只是「換順序」——檔名互換但內容完全沒動。這種情況講「順序調整」
 * 比「修改了 N 張圖片」精確得多，也讓之後看 log 的人一眼知道畫質沒被動過。
 *
 * 判斷要以資料夾為單位：同一次發布裡，A 相簿可能只是調順序，B 相簿卻是新增圖，
 * 混在一起看會失準。
 */
async function describeImages(files) {
  const byDir = new Map();
  for (const f of files) {
    const dir = path.dirname(f.file);
    if (!byDir.has(dir)) byDir.set(dir, []);
    byDir.get(dir).push(f);
  }

  const parts = [];
  for (const [dir, group] of byDir) {
    const added = group.filter((f) => f.status === '??' || f.status === 'A');
    const removed = group.filter((f) => f.status === 'D');
    const modified = group.filter((f) => f.status === 'M');
    const name = path.basename(dir);

    let reordered = false;
    if (modified.length && !added.length && !removed.length) {
      const before = await Promise.all(modified.map((f) => blobHash('HEAD', f.file)));
      const after = await Promise.all(
        modified.map((f) => git(['hash-object', f.file]).then((s) => s.trim()).catch(() => null))
      );
      const a = before.filter(Boolean).sort().join(',');
      const b = after.filter(Boolean).sort().join(',');
      reordered = a !== '' && a === b;
    }

    const bits = [];
    if (reordered) bits.push(`${modified.length} 張順序調整（內容未重新編碼）`);
    else if (modified.length) bits.push(`${modified.length} 張更換`);
    if (added.length) bits.push(`新增 ${added.length} 張`);
    if (removed.length) bits.push(`移除 ${removed.length} 張`);
    parts.push(`  · ${name}：${bits.join('、')}`);
  }
  return parts;
}

/** 由實際差異組出 commit 訊息，不需要人工描述。 */
async function buildMessage(files) {
  const site = files.filter((f) => f.file.startsWith('src/content/site/'));
  const projects = files.filter((f) => f.file.startsWith('src/content/projects/'));
  const assets = files.filter((f) => f.file.startsWith('src/assets/'));

  const subjectBits = [];
  if (site.length) subjectBits.push('網站文案');
  if (projects.length) subjectBits.push(`${projects.length} 個案例頁`);
  if (assets.length) subjectBits.push('圖片');
  const subject = `content: 更新${subjectBits.join('、') || '內容'}`;

  const lines = [];

  if (site.length) {
    // 列出實際變動的欄位，讓 log 看得出改了什麼，而不只是「JSON 有變」
    const keys = new Set();
    for (const f of site) {
      const diff = await git(['diff', '--unified=0', '--', f.file]).catch(() => '');
      for (const m of diff.matchAll(/^[+-]\s*"([^"]+)":/gm)) keys.add(m[1]);
    }
    lines.push(`- 網站文案：${[...keys].join('、') || '內容調整'}`);
  }

  if (projects.length) {
    lines.push(`- 案例頁：${projects.map((f) => path.basename(f.file, '.md')).join('、')}`);
  }

  if (assets.length) {
    lines.push('- 圖片：');
    lines.push(...(await describeImages(assets)));
  }

  lines.push('', '由 npm run publish 產生；發布前已通過 astro build 驗證。');
  return { subject, body: lines.join('\n') };
}

async function main() {
  console.log('▸ 檢查發布範圍…');
  const files = await changedFiles();
  if (!files.length) {
    console.log('  沒有待發布的內容變更（發布範圍：' + CONTENT_PATHS.join('、') + '）');
    return;
  }

  // 範圍外的改動只提示、不納入，讓你知道它們會被留在本機
  const outside = (await git(['status', '--porcelain']))
    .split('\n').filter(Boolean)
    .map((l) => l.slice(3))
    .filter((f) => !CONTENT_PATHS.some((p) => f.startsWith(p)) && !f.startsWith('.claude'));

  console.log('\n將發布以下內容：');
  for (const f of files) console.log(`  ${f.status.padEnd(2)} ${f.file}`);
  if (outside.length) {
    console.log('\n以下改動不在發布範圍，會留在本機不送出：');
    for (const f of outside) console.log(`  · ${f}`);
  }

  console.log('\n▸ 驗證建置（內容不符 schema 會在這裡擋下）…');
  try {
    await run('npm', ['run', 'build'], { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 });
  } catch (err) {
    fail('建置失敗，已中止發布。線上網站維持原狀。', err.stdout || err.stderr || String(err));
  }
  console.log('  建置通過');

  console.log('\n▸ 檢查遠端…');
  await git(['fetch', 'origin', '--quiet']).catch(() => {});
  const behind = (await git(['rev-list', '--count', 'HEAD..origin/main'])).trim();
  if (behind !== '0') {
    fail(`遠端有 ${behind} 個你本機沒有的 commit。請先處理（git pull --rebase）再發布，這裡不會自動合併。`);
  }
  console.log('  與遠端同步');

  const { subject, body } = await buildMessage(files);
  console.log('\n▸ commit 訊息：\n');
  console.log(`  ${subject}\n`);
  for (const line of body.split('\n')) console.log(`  ${line}`);

  if (DRY) {
    console.log('\n(--dry-run：未 commit、未 push)');
    return;
  }

  if (!YES) {
    const rl = createInterface({ input: stdin, output: stdout });
    const answer = (await rl.question('\n確定發布？(y/N) ')).trim().toLowerCase();
    rl.close();
    if (answer !== 'y' && answer !== 'yes') {
      console.log('已取消，沒有做任何變更。');
      return;
    }
  }

  console.log('\n▸ 發布中…');
  await git(['add', '--', ...CONTENT_PATHS]);
  await git(['commit', '-m', subject, '-m', body]);
  await git(['push', 'origin', 'HEAD']);

  const sha = (await git(['rev-parse', '--short', 'HEAD'])).trim();
  console.log(`\n✅ 已發布 ${sha}`);
  console.log('   Vercel 會自動建置，約 1 分鐘後生效：');
  console.log('   https://noah-portfolio-tawny.vercel.app');
}

main().catch((err) => fail(err.message, err.stdout || err.stderr));
