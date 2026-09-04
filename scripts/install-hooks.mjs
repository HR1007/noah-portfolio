#!/usr/bin/env node
/**
 * 把 scripts/hooks/ 底下的 hook 安裝到 .git/hooks/。
 *
 *   npm run hooks:install
 *
 * .git/hooks/ 不進版控，重新 clone 之後 hook 不會自動存在，所以原始檔放在
 * scripts/hooks/（可審閱、可追蹤修改），再由這支腳本安裝。安裝的是一層薄
 * 轉呼叫，之後改 scripts/hooks/ 裡的內容會立即生效，不必重新安裝。
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(__dirname, 'hooks');
const GIT_HOOKS = path.join(ROOT, '.git', 'hooks');

async function main() {
  try {
    await fs.access(GIT_HOOKS);
  } catch {
    console.error('找不到 .git/hooks/ —— 這裡不是 git 工作區？');
    process.exit(1);
  }

  const hooks = await fs.readdir(SRC_DIR);
  for (const name of hooks) {
    const target = path.join(GIT_HOOKS, name);

    // 已存在且不是我們裝的，就不覆蓋，避免蓋掉使用者自己的 hook
    try {
      const existing = await fs.readFile(target, 'utf-8');
      if (!existing.includes('scripts/hooks/')) {
        console.warn(`⚠️  ${name} 已存在且非本專案安裝，略過（請自行合併）`);
        continue;
      }
    } catch {
      // 不存在，繼續安裝
    }

    const shim = `#!/bin/sh
# 由 npm run hooks:install 產生，實際內容在 scripts/hooks/${name}
hook="$(git rev-parse --show-toplevel)/scripts/hooks/${name}"
[ -x "$hook" ] && exec "$hook" "$@"
exit 0
`;
    await fs.writeFile(target, shim, { mode: 0o755 });
    console.log(`✅ 已安裝 .git/hooks/${name}`);
  }

  console.log('   hook 內容改動後會立即生效，不需重新安裝。');
}

main().catch((err) => {
  console.error('安裝失敗：', err.message);
  process.exit(1);
});
