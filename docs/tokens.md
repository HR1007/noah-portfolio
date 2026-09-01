# Design Tokens

來源：實際上線的 `noahportfolio.figma.site`（用 `getComputedStyle` 對首頁、Portfolio 頁、Talk German 專案頁做過實測），而非 Claude Design 裡 `DesignSystemDoc` 那份米色/赤陶色文件 — 兩者色彩與字體系統不同，經確認以 live 網站為準。Claude Design 那份文件只借用它的 8px 間距邏輯與 component recipe 寫法（button/card/pill 的程式碼結構），色彩不採用。

## 色彩（light，唯一目前存在的主題）

實測只抓到 5 個顏色值，沒有觀察到任何強調色（accent hue）；Talk German / New Formosa Sport 等專案detail頁裡出現的紫色、藍色都是**裝置截圖圖片內容**，不是網站 UI chrome 本身用色。

| 語意變數 | 值 | 用途 |
|---|---|---|
| `--color-bg` | `#F2F2F2` | 頁面背景 |
| `--color-surface` | `#FFFFFF` | 卡片/面板背景 [需確認] — 實測時沒有明確捕捉到獨立卡片背景色，Portfolio/專案卡看起來直接坐在頁面背景上，是否需要獨立 surface 色要看實際重建時的視覺判斷 |
| `--color-ink` | `#333333` | 主要文字、marquee 跑馬燈底色、字標、primary 按鈕底色 |
| `--color-muted` | `rgba(0, 0, 0, 0.55)` | 次要文字（例如 Connect 頁的說明文字） |
| `--color-border` | [需確認] | 沒有實測到明確的 hairline border 色，本站目前視覺上分隔線很少（Experience 每個項目間有一條極細淺色線），需要在瀏覽器 zoom 後取色或請設計師提供 |

不再需要獨立的 `--color-black`/`--color-white`：marquee 底色與 primary 按鈕改用 `--color-ink`/`--color-bg` 這組語意相反色，dark 主題只要覆寫 `--color-ink`/`--color-bg`，這些元件就會自動換色。

沒有偵測到 dark mode（無 `prefers-color-scheme` 切換、無 `[data-theme]`）。應使用者要求，dark 主題數值已經補上（見 `tokens.css` 的 `:root[data-theme="dark"]` 區塊），但這組數值是**設計出來的，不是逆向工程結果**：把 `--color-bg` 與 `--color-ink` 的語意角色互換（bg 變深、ink 變淺），border/muted 用同樣邏輯的透明度反轉。等設計師有正式 dark 稿再替換。

## 字體

只有一個字體家族：**Inter**（透過多個字重變體載入：`Inter:Medium` 500、`Inter:SemiBold` 600、`Inter:Bold` 700、`Inter:ExtraBold` 800、`Inter:Black` 900）。沒有觀察到像 Claude Design 文件那樣的 mono/display 三字體分工 — 全站標題與內文都是 Inter，只靠字重與字級區分階層。

CLAUDE.md 原先預設 Saira / Noto Sans TC / Source Sans 3 三字體分流中英文，但目前作品集是全英文內容，且 live 站只用 Inter。**[需確認]**：是否要保留中文內容的可能性（Noto Sans TC fallback），或整站維持純英文、只用 Inter？在確認前，tokens.css 先只建立 Inter 一組字體變數，中文 fallback 留在 [需確認]。

## 字級階層

實測抓到的 `font-size` 全集（由小到大）：`12px 16px 18px 20px 24px 36px 48px 100px`。

| 語意變數 | px | 對應用途（依畫面觀察） |
|---|---|---|
| `--font-size-hero` | `100px` | 確認用途：Nav 的「NOAH WEN」字標（weight 900）與首頁「About me」大標題（weight 700）共用此字級 |
| `--font-size-h1` | `48px` | 各頁大標（例如「Portfolio」「Shaping Intuitive Solutions」等頁面主標） |
| `--font-size-h2` | `36px` | 專案頁次標題（例如「Talk German」「A design language for the Star Overlay editor」） |
| `--font-size-h3` | `24px` | Section 小標（例如 Experience 裡的職稱「Human Factors Researcher」） |
| `--font-size-body-lg` | `20px` | 部分強調內文 |
| `--font-size-body` | `18px` | 一般內文段落 |
| `--font-size-label` | `16px` | 導覽列連結、按鈕文字 |
| `--font-size-meta` | `12px` | marquee 跑馬燈文字、年份等 meta 資訊 |

行高、字距（letter-spacing）目前沒有實測數值，重建時先用瀏覽器預設或合理值，標記 **[需確認]** 待對照 Figma 原始稿確認。

## 間距階梯

實測 `padding`/`gap` 的完整集合（已濾掉 4px/6px/10px/41px/166px 等零星雜訊值，那些多半是圖示內距或 Figma auto-layout 捨入誤差，不構成穩定階梯）：

`8 16 24 32 40 64 80 120 240`

確認是 8px 為基準的等比階梯，與 Claude Design 文件聲稱的邏輯吻合（該文件間距值 8/16/24/40/64/88 與此處實測不完全一致，例如它有 88 沒有 32/80/120/240，這裡採用**實測值**為準）：

| 語意變數 | px |
|---|---|
| `--sp-1` | 8 |
| `--sp-2` | 16 |
| `--sp-3` | 24 |
| `--sp-4` | 32 |
| `--sp-5` | 40 |
| `--sp-6` | 64 |
| `--sp-7` | 80 |
| `--sp-8` | 120 |
| `--sp-9` | 240 |

## 圓角

只實測到一個值：**`16px`**，全站統一（按鈕、卡片、裝置截圖容器都用同一個圓角）。不像 Claude Design 文件那樣分 sm/md/lg/pill 四階 — 這裡只需要：

| 語意變數 | px |
|---|---|
| `--radius` | 16 |
| `--radius-pill` | 999 [需確認] — 目前沒觀察到藥丸形狀元件（live 站沒有 tag/pill），但 CLAUDE.md 之後可能會用到，先保留變數 |

## [需確認] 彙總

1. `--color-surface`（卡片背景）與 `--color-border`（分隔線）的確切色值
2. dark theme 數值是設計出來的，不是實測值，等設計師提供正式稿
3. 中文內容 / Noto Sans TC fallback 是否需要
4. 各字級的 line-height 與 letter-spacing
