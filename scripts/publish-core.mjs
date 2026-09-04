/**
 * 發布流程的核心邏輯——CLI（scripts/publish.mjs）與後台的發布按鈕
 * （admin-server 的 /api/publish）都讀這一支。
 *
 * 刻意抽成共用模組：如果兩邊各寫一套，發布範圍或驗證條件哪天改了卻只改一邊，
 * 就會出現「用按鈕發布會帶到程式碼、用指令不會」這種難以察覺的差異。
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** 後台唯一會寫入的兩個目錄；發布範圍僅限於此，程式碼永遠不會被送出。 */
export const CONTENT_PATHS = ['src/content', 'src/assets'];

const run = promisify(execFile);



const git = async (args) => (await run('git', args, { cwd: ROOT, maxBuffer: 32 * 1024 * 1024 })).stdout;

export function fail(msg, detail) {
  console.error(`\n✖ ${msg}`);
  if (detail) console.error(detail.trim().split('\n').slice(-12).join('\n'));
  process.exit(1);
}

/** 解析 git status --porcelain，只留發布範圍內的檔案。 */
export async function changedFiles() {
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
export async function buildMessage(files) {
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


/** 範圍外的改動：只用來提示使用者「這些會留在本機」，不會被發布。 */
export async function outsideFiles() {
  const out = await git(['status', '--porcelain']);
  return out.split('\n').filter(Boolean)
    .map((l) => l.slice(3))
    .filter((f) => !CONTENT_PATHS.some((p) => f.startsWith(p)) && !f.startsWith('.claude'));
}

/** 跑一次 astro build；內容不符 schema 會在這裡失敗。 */
export async function validateBuild() {
  try {
    await run('npm', ['run', 'build'], { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 });
    return { ok: true };
  } catch (err) {
    const log = (err.stdout || err.stderr || String(err)).trim().split('\n').slice(-12).join('\n');
    return { ok: false, log };
  }
}

/** 遠端若有本機沒有的 commit 就不該發布——這裡只回報，不自動合併。 */
export async function remoteBehind() {
  await git(['fetch', 'origin', '--quiet']).catch(() => {});
  const n = (await git(['rev-list', '--count', 'HEAD..origin/main'])).trim();
  return Number(n) || 0;
}

/** 實際送出：只 add 發布範圍，commit 後 push。 */
export async function commitAndPush(subject, body) {
  await git(['add', '--', ...CONTENT_PATHS]);
  await git(['commit', '-m', subject, '-m', body]);
  await git(['push', 'origin', 'HEAD']);
  return (await git(['rev-parse', '--short', 'HEAD'])).trim();
}

export { git, run };
