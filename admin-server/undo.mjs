/*
  後台的「復原上一步」。

  做法上刻意不替每個端點各寫一套反向邏輯——後台有十幾個會寫檔的端點，各寫一遍
  等於十幾個機會寫錯，而且以後每加一個端點都要記得補一份，漏掉時不會有任何徵兆，
  要等到真的誤刪、按了復原沒反應才會發現。

  改成統一在寫檔之前，把「這一步會碰到的東西」整份複製一份留著。復原就是把那一份
  原封不動放回去——不管那一步做了什麼（刪檔、改名、覆蓋、改文字），還原邏輯都只有
  一套，也不需要知道它到底做了什麼。

  快照放在專案根目錄的 .admin-undo/，刻意不放在 src/ 底下：那裡的圖片會被
  import.meta.glob 掃進網站，等於把備份也一起發布出去。這個資料夾要進 .gitignore，
  publish 流程才不會把它當成待提交的變更。

  只保留最近一次操作，每拍一次就蓋掉上一份。
*/

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const UNDO_DIR = path.join(ROOT, '.admin-undo');
const MANIFEST = path.join(UNDO_DIR, 'manifest.json');
const PAYLOAD = path.join(UNDO_DIR, 'payload');

function exists(target) {
  return fs.access(target).then(() => true).catch(() => false);
}

async function readManifest() {
  try {
    return JSON.parse(await fs.readFile(MANIFEST, 'utf-8'));
  } catch {
    return null; // 沒有快照，或上一次寫到一半壞掉——兩種情況都當成「沒有可復原的操作」
  }
}

/**
 * 在操作執行前拍下快照。targets 是這一步會碰到的檔案與資料夾：
 *   { kind: 'file' | 'dir', path: 絕對路徑 }
 *
 * 目標「目前不存在」也要記錄（例如新增案例）——復原時就是把它整個拿掉。
 */
export async function snapshotBefore(label, targets) {
  await fs.rm(UNDO_DIR, { recursive: true, force: true });
  await fs.mkdir(PAYLOAD, { recursive: true });

  const entries = [];
  for (const [i, target] of targets.entries()) {
    const rel = path.relative(ROOT, target.path);
    // 只准備份專案內的東西。路徑組錯時寧可讓這一步失敗，也不要往專案外面寫檔案。
    if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) {
      throw new Error(`快照目標超出專案範圍：${target.path}`);
    }

    const saved = String(i);
    const there = await exists(target.path);
    if (there) {
      await fs.cp(target.path, path.join(PAYLOAD, saved), { recursive: target.kind === 'dir' });
    }
    entries.push({ kind: target.kind, rel, existed: there, saved });
  }

  await fs.writeFile(
    MANIFEST,
    JSON.stringify({ label, at: new Date().toISOString(), entries }, null, 2),
    'utf-8'
  );
}

/** 下一次按復原會還原掉哪一步；沒有東西可復原時回 null。 */
export async function pendingUndo() {
  const manifest = await readManifest();
  return manifest ? { label: manifest.label, at: manifest.at } : null;
}

/** 快照拍失敗時把殘骸清掉，避免留下一份不完整的快照被誤認為可以復原。 */
export function clearUndo() {
  return fs.rm(UNDO_DIR, { recursive: true, force: true });
}

export async function restoreLast() {
  const manifest = await readManifest();
  if (!manifest) throw new Error('沒有可以復原的操作');

  for (const entry of manifest.entries) {
    const target = path.join(ROOT, entry.rel);
    const saved = path.join(PAYLOAD, entry.saved);

    // 這一步之前它根本不存在（例如新增案例），復原就是把它整個拿掉
    if (!entry.existed) {
      await fs.rm(target, { recursive: true, force: true });
      continue;
    }

    if (entry.kind === 'dir') {
      /*
        整個資料夾換成快照那一份，而不是逐檔比對差異。改名類的操作（拖拉排序、
        刪段落後重新編號）不能用「單一檔案還在不在」來判斷該做什麼——同一個檔名
        在前後可能是不同的圖。整份換掉才保證回到原樣。
      */
      await fs.rm(target, { recursive: true, force: true });
      await fs.cp(saved, target, { recursive: true });
    } else {
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.cp(saved, target);
    }
  }

  await clearUndo();
  return { label: manifest.label };
}
