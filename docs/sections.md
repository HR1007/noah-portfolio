# 頁面結構（Sections）

實測 live 站的真實路由結構跟 CLAUDE.md 原本設想的「四個獨立 case study 頁」不完全一樣，記錄如下，重建時以此為準。

## 真實路由

- `/`（＝導覽列上的「About Me」，目前 active 狀態就是掛在根路徑）— Hero + About + Beyond the Grid + Experience + Connect + Footer，**全部塞在同一頁**，不是 Claude Design 文件裡設想的 Home/About/Experience/Connect 四個獨立頁面。
- `/portfolio` — 專案列表頁
- `/gallery` — 攝影/pixel art 瀑布流
- 每個專案各自一個路由（實測到 `/talk-german`；其餘 4 個推定為 `/star-overlay`、`/new-formosa-sport`、`/osce`、`/foodlet`，命名待重建時自訂，不需要照抄 live 站路由，因為我們的 slug 由 `src/content/projects/` 的檔名決定）

**[需確認]**：新版是否要維持「About/Experience/Connect 全部塞同一頁」這個資訊架構，還是拆成獨立頁面（CLAUDE.md 目前預設有獨立的 About 概念，需要設計師拍板）。本文件先假設沿用 live 站的單頁版型，因為那是目前實際上線的樣子。

## `/`（Home / About 合併頁）依序 section

1. **Marquee**（頁首跑馬燈）
2. **Hero** — pixel-art 角色插畫（長寬比約 **4:5**，依 Claude Design 文件的 hero 容器比例，live 站實測未取得精確比例，[需確認]）+ 三行職稱清單 + PullQuote
3. **About Intro** — 一段自我介紹文字，右側或上方一張人像/生活照（長寬比 **3:4**，依 About 頁 hero 圖容器觀察，[需確認] 精確值）
4. **Beyond the Grid** — 兩段文字 + 一張生活照（寬圖，橫向，約 **16:9** 或更寬，[需確認]）+ 右側 pixel-art 插畫
5. **Experience** — 3 筆經歷清單（純文字，無圖片）
6. **Connect** — email + instagram 兩個聯絡卡片（無圖片，只有 icon）
7. **Footer** + 底部 Marquee

## `/portfolio`

1. **SectionIntro** — eyebrow「Portfolio」+ headline「Portfolio」+ 一段自介文字
2. **PortfolioCard × 5**，左右交錯排列（單數卡圖在右文在左，偶數卡相反，[需確認] 交錯規則的精確 pattern，實測時只看到部分卡片）：
   - Star Overlay — 圖：手機截圖 device mockup，長寬比 **~4:3**（雙手機並排構圖）
   - New Formosa Sport — 圖：瀏覽器窗框截圖，長寬比 **~16:10**
   - OSCE Medical Assessment Platform — 圖：瀏覽器窗框截圖，長寬比 **~16:10**（內容文案有誤，見 components.md 備註）
   - Talk German — 圖：手機截圖 device mockup，長寬比 **~4:3**
   - Foodlet — 圖：[需確認]，實測未捲動到此卡片的圖片
3. Connect + Footer（沿用全站共用區塊）

## 專案詳情頁（以 `/talk-german` 為樣本）

1. **ProjectHero** — 大標題 + 一段摘要 + 「Learn More」按鈕
2. **ProjectShowcase** — 大張裝置 mockup 圖（手機並排構圖），長寬比 **~4:3**
3. 後續內容（功能說明、設計挑戰、成果等段落）**未完整實測** — 只捲動看到最上方 hero 區塊就切換到下一個任務，[需確認] 其餘 section 組成需要再次瀏覽或請設計師提供完整截圖／Figma 稿。

CLAUDE.md 原先預期的 schema（`origin` / `demo` / `flow` / `features` / `colorRationale` / `designSystem` / `challenges` / `outcome`）目前**沒有實測依據**，需要設計師確認每個專案頁實際段落結構是否吻合這套 schema，或需要調整。

## `/gallery`

1. **SectionIntro** — eyebrow「Gallery」+ headline「Travel photography」風格文案
2. **GalleryGrid** — CSS columns 瀑布流，[需確認] 精確張數與長寬比分布（Claude Design 文件裡的假資料是 9 張、高度介於 200–320px，但那是假資料不是實測值，需要以實際圖片數量為準）

## 共用區塊（每頁都有）

- Nav（頁首）
- Marquee（頁首 + 頁尾各一條）
- Footer（版權宣告）

## [需確認] 彙總

1. 是否要維持 About/Experience/Connect 合併成單頁的資訊架構
2. Hero / About 人像 / Beyond the Grid 照片的精確長寬比
3. PortfolioCard 圖片交錯排列的精確 pattern
4. Foodlet 卡片圖片比例
5. 專案詳情頁除 Hero 外的完整 section 組成（目前只驗證了最上方區塊）
6. Gallery 頁實際圖片數量與比例分布
