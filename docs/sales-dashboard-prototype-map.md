# Prototype 連線對照表 — 銷售戰情室

DesignAgent 的 bridge **沒有 prototype API**（只有 Figma Motion 動畫），所以 frame 之間的互動連線要在 Figma 裡手動拉。
這張表把「從哪個畫面、點什麼、去哪裡、用什麼轉場」全部列好，照著做大約 20 分鐘。

操作方式：選取起點元件 → 右側面板切到 **Prototype** → 從藍點拖到目標 frame → 設定 Interaction 與 Animation。

---

## 桌機主線（Flow 1：從發現問題到指派跟進）

| # | 起點 frame | 點擊的元件 | 目標 frame | Interaction | Animation |
|---|---|---|---|---|---|
| 1 | `D10 · 登入 Login` | 「登入」按鈕 | `D1 · 總覽 Overview` | On click | Smart animate · 300ms · Ease out |
| 2 | `D1 · 總覽` | 洞察卡「看中區明細」 | `D5 · 交易明細 Transactions` | On click | Move in · Right · 250ms |
| 3 | `D5 · 交易明細` | 麵包屑「中區」 | `D2 · 區域分析 Regions` | On click | Move out · Right · 250ms |
| 4 | `D1 · 總覽` | 洞察卡「指派跟進」 | `M3 · 指派跟進 · 暗色` | On click | Dissolve · 200ms |
| 5 | `M3 · 指派跟進` | 「建立任務」 | `D6 · 跟進任務 Follow-ups` | On click | Smart animate · 300ms |
| 6 | `M3 · 指派跟進` | 「取消」 | `D1 · 總覽` | On click | Dissolve · 150ms |

## 桌機分支

| # | 起點 | 元件 | 目標 | Animation |
|---|---|---|---|---|
| 7 | `D1 · 總覽` | 頂端「＋ 建立報表」 | `D8 · 建立報表` | Move in · Bottom · 300ms |
| 8 | `D8 · 建立報表` | 「建立並排程」 | `M?` 成功對話框（見下）→ `D7 · 報表與匯出` | Dissolve |
| 9 | `D7 · 報表與匯出` | 任一列「停用」 | `M2 · 停用排程 · 暗色` | Dissolve · 200ms |
| 10 | `D6 · 跟進任務` | 「編輯規則」 | `D11 · 洞察規則 Rules` | Move in · Right |
| 11 | `D5 · 交易明細` | 「⤓ 匯出 CSV」 | `M1 · 匯出確認 · 暗色` | Dissolve · 200ms |
| 12 | 任一桌機頁 | 篩選器「區域」 | `M5 · 下拉選單展開 · 暗色` | Dissolve · 120ms |

## 亮暗主題切換（每一頁都要接）

| 起點 | 元件 | 目標 | Animation |
|---|---|---|---|
| `D1 · 總覽` | 頂端 `☀` | `L1 · 總覽 · 亮色` | Dissolve · 200ms |
| `L1 · 總覽 · 亮色` | 頂端 `☾` | `D1 · 總覽` | Dissolve · 200ms |
| …其餘 10 組同理（D2↔L2、D3↔L3 …… D11↔L11） | | | |

> 小技巧：先接好 D1↔L1，選取那條連線 **Copy**，再選其他頁的切換器 **Paste** ——Figma 會保留 interaction 設定，只需改目標。

## 手機主線（Flow 2）

| # | 起點 frame | 元件 | 目標 frame | Animation |
|---|---|---|---|---|
| 1 | `P0 · 推播通知` | 推播卡片 | `P4 · 手機 登入` | Move in · Bottom · 250ms |
| 2 | `P4 · 手機 登入` | 「登入」 | `P1 · 手機 375 總覽` | Smart animate · 300ms |
| 3 | `P1 · 手機 總覽` | 篩選 chip「中區」 | `P5 · 手機 bottom sheet` | Move in · Bottom · 250ms · Ease out |
| 4 | `P5 · bottom sheet` | 「套用」 | `P2 · 手機 交易明細` | Move out · Bottom → Move in · Right |
| 5 | `P2 · 交易明細` | 任一交易卡 | `P3 · 手機 跟進任務` | Move in · Right · 250ms |
| 6 | 任一手機頁 | 底部分頁列各項 | 對應手機頁 | Instant（分頁切換不做轉場） |

## 建議的 Prototype 設定

- **Starting frame**：`P0 · 推播通知`（手機故事）或 `D10 · 登入 Login`（桌機故事）。兩個都設，面試時看情況選。
- **Device**：桌機頁用 `Desktop 1440 × 1024`；手機頁用 `iPhone 14 Pro`（393×852，畫面 375 會置中留邊，可接受）。
- **Background**：`#0E0F11`（跟外框容器同色，播放時不會有突兀的白邊）。
- **Overflow behavior**：長頁面（總覽、洞察規則）設 `Vertical scrolling`，不然只看得到第一屏。

## 為什麼對話框要獨立成 frame

`M1`～`M5` 是「整頁 ＋ 遮罩 ＋ 對話框」的完整畫面，不是浮在上面的元件。這樣在 prototype 裡可以直接當目標 frame，不需要用 Overlay——Overlay 在 Figma 裡要另外設定位置與背景，而且轉場選項較少。代價是畫面數量變多，但換來接線簡單、預覽穩定。
