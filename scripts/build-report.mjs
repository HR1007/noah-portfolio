#!/usr/bin/env node
/**
 * 從 git log 產生「Noah Portfolio 進度報告」。
 *
 *   npm run report            產生報告（不連網）
 *   npm run report -- --check 另外檢查線上站台各路由狀態
 *
 * 輸出到 .report/progress-report.html（已 gitignore）。報告內容全部由
 * git 歷史推導，不需要人工維護；要更新只要重跑這支即可。
 *
 * 版位／區塊的規則不在這裡重複實作，需要時一律讀 src/lib/image-slots.mjs。
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const run = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, '.report');
const OUT_FILE = path.join(OUT_DIR, 'progress-report.html');
const TEMPLATE = path.join(__dirname, 'report-template.html');

const SITE = 'https://noah-portfolio-tawny.vercel.app';
const ROUTES = [
  '/zh/', '/en/', '/zh/portfolio/', '/en/portfolio/', '/zh/gallery/', '/en/gallery/',
  '/zh/gallery/germany/', '/zh/gallery/film-project/', '/zh/gallery/digital-cam-project/',
  '/zh/projects/osce/', '/zh/projects/foodlet/', '/zh/projects/star-overlay/',
  '/zh/projects/talk-german/', '/zh/projects/new-formosa-sport/',
];

const TYPE_PREFIX = ['feat', 'fix', 'content', 'style', 'chore', 'refactor', 'docs', 'test'];

function classifyType(subject) {
  const m = subject.match(/^([a-z]+)(\(.+?\))?:/i);
  if (m && TYPE_PREFIX.includes(m[1].toLowerCase())) return m[1].toLowerCase();
  if (subject.startsWith('Merge')) return 'merge';
  return 'init';
}

/** 依實際改動的檔案路徑判斷這次 commit 屬於哪個範圍，路徑比 commit 訊息可靠。 */
function classifyArea(paths, subject) {
  const p = paths.join(' ');
  if (!paths.length) return '整合';
  if (/admin-ui|admin-server|public\/admin/.test(p)) return '後台';
  if (/^src\/assets|\ssrc\/assets/.test(p) && !/views|components/.test(p)) return '圖片素材';
  if (/gallery/i.test(p) || /相簿|藝廊/.test(subject)) return '藝廊';
  if (/projects/.test(p) || /案例/.test(subject)) return '案例頁';
  if (/portfolio/i.test(p) || /作品集/.test(subject)) return '作品集';
  if (/home|Home/.test(p) || /首頁/.test(subject)) return '首頁';
  return '基礎建設';
}

async function git(args) {
  const { stdout } = await run('git', args, { cwd: ROOT, maxBuffer: 32 * 1024 * 1024 });
  return stdout;
}

async function collectCommits() {
  const SEP = '';
  const REC = '';
  const raw = await git([
    'log', '--all', '--date=format:%Y-%m-%d %H:%M',
    `--format=%H${SEP}%ad${SEP}%s${SEP}%b${REC}`,
  ]);

  const commits = [];
  for (const rec of raw.split(REC)) {
    if (!rec.trim()) continue;
    const [sha, date, subject, body = ''] = rec.replace(/^\n/, '').split(SEP);
    if (!sha) continue;

    const [stat, names] = await Promise.all([
      git(['show', '--shortstat', '--format=', '--no-renames', sha]).catch(() => ''),
      git(['show', '--name-only', '--format=', sha]).catch(() => ''),
    ]);

    const num = (re) => Number((stat.match(re) || [])[1] || 0);
    const paths = names.split('\n').map((s) => s.trim()).filter(Boolean);
    const [d, t] = date.split(' ');

    commits.push({
      sha: sha.slice(0, 7), date: d, time: t,
      type: classifyType(subject),
      area: classifyArea(paths, subject),
      title: subject.replace(/^[a-z]+(\(.+?\))?:\s*/i, ''),
      raw: subject,
      body: body.trim(),
      files: num(/(\d+) files? changed/),
      ins: num(/(\d+) insertions?/),
      del: num(/(\d+) deletions?/),
    });
  }

  commits.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  return commits;
}

async function checkRoutes() {
  const results = [];
  for (const route of ROUTES) {
    try {
      const res = await fetch(SITE + route, { method: 'HEAD', redirect: 'follow' });
      results.push({ route, status: res.status });
    } catch {
      results.push({ route, status: 0 });
    }
  }
  return results;
}

async function main() {
  const wantCheck = process.argv.includes('--check');
  const commits = await collectCommits();
  if (!commits.length) throw new Error('git log 沒有回傳任何 commit');

  const days = new Set(commits.map((c) => c.date));
  const first = commits[0].date;
  const last = commits[commits.length - 1].date;
  const generated = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Taipei' }).slice(0, 16);

  let template = await fs.readFile(TEMPLATE, 'utf-8');
  template = template
    .replace('/*__TIMELINE_DATA__*/[]', JSON.stringify(commits))
    .replaceAll('<!--__COMMITS__-->', String(commits.length))
    .replaceAll('<!--__DAYS__-->', String(days.size))
    .replace('<!--__RANGE__-->', `${first} → ${last}`)
    .replace('<!--__GENERATED__-->', generated);

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(OUT_FILE, template, 'utf-8');

  console.log(`✅ ${path.relative(ROOT, OUT_FILE)}`);
  console.log(`   ${commits.length} commits · ${days.size} 天 · ${first} → ${last}`);

  if (wantCheck) {
    const routes = await checkRoutes();
    const ok = routes.filter((r) => r.status === 200).length;
    console.log(`   線上路由 ${ok}/${routes.length} 正常`);
    routes.filter((r) => r.status !== 200)
      .forEach((r) => console.log(`   ⚠️  ${r.status || 'ERR'} ${r.route}`));
  }
}

main().catch((err) => {
  console.error('產生報告失敗：', err.message);
  process.exit(1);
});
