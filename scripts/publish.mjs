#!/usr/bin/env node
/**
 * 把後台改好的內容發布上線（指令版）。
 *
 *   npm run publish              驗證 → 顯示差異 → 確認 → commit + push
 *   npm run publish -- --dry-run 只驗證與顯示，不 commit 也不 push
 *   npm run publish -- --yes     略過互動確認（給自動化用，平常不建議）
 *
 * 實際邏輯全在 scripts/publish-core.mjs，後台的發布按鈕讀的是同一支，
 * 兩邊行為保證一致。這裡只負責終端機的輸出與確認。
 */
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import {
  CONTENT_PATHS, changedFiles, outsideFiles, buildMessage,
  validateBuild, remoteBehind, commitAndPush,
} from './publish-core.mjs';

const DRY = process.argv.includes('--dry-run');
const YES = process.argv.includes('--yes');

function fail(msg, detail) {
  console.error(`\n✖ ${msg}`);
  if (detail) console.error(detail);
  process.exit(1);
}

async function main() {
  console.log('▸ 檢查發布範圍…');
  const files = await changedFiles();
  if (!files.length) {
    console.log('  沒有待發布的內容變更（發布範圍：' + CONTENT_PATHS.join('、') + '）');
    return;
  }

  console.log('\n將發布以下內容：');
  for (const f of files) console.log(`  ${f.status.padEnd(2)} ${f.file}`);

  const outside = await outsideFiles();
  if (outside.length) {
    console.log('\n以下改動不在發布範圍，會留在本機不送出：');
    for (const f of outside) console.log(`  · ${f}`);
  }

  console.log('\n▸ 驗證建置（內容不符 schema 會在這裡擋下）…');
  const build = await validateBuild();
  if (!build.ok) fail('建置失敗，已中止發布。線上網站維持原狀。', build.log);
  console.log('  建置通過');

  console.log('\n▸ 檢查遠端…');
  const behind = await remoteBehind();
  if (behind) fail(`遠端有 ${behind} 個你本機沒有的 commit。請先 git pull --rebase 再發布，這裡不會自動合併。`);
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
  const sha = await commitAndPush(subject, body);
  console.log(`\n✅ 已發布 ${sha}`);
  console.log('   Vercel 會自動建置，約 1 分鐘後生效：');
  console.log('   https://noah-portfolio-tawny.vercel.app');
}

main().catch((err) => fail(err.message, err.stdout || err.stderr));
