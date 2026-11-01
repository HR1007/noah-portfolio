# 重複元件清單

依實測 live 站（`noahportfolio.figma.site`）與 Claude Design 專案裡的 component recipe 寫法整理。每個元件標註用途、預期 props、出現頁面。

## Nav

- **用途**：站台頂部固定導覽，sticky top。
- **Props**：`active`（目前頁面高亮，"Home" | "Portfolio" | "Gallery"）
- **內容**：左邊字標「NOAH WEN」+ 右邊三個連結（About Me / Portfolio / Gallery）。目前 active 連結有底線樣式。
- **出現頁面**：全站每一頁。
- **[需確認]**：字標本身是否需要連結回首頁；手機版（375px）導覽列如何收合，live 站在桌面寬度下沒有漢堡選單可參考，需要自己設計。

## Marquee

- **用途**：頂部深色跑馬燈，循環顯示關鍵字標籤。
- **Props**：`items: string[]`（實測內容為 "UI/UX DESIGNER" / "HUMAN FACTORS" / "INFO MANAGEMENT" 循環，中間夾星形圖示分隔）
- **樣式**：`--color-ink` 底色、`--color-white` 文字、`--font-size-meta` 字級。
- **出現頁面**：全站每一頁（頁首與頁尾各一條）。
- **實作規則**：純 CSS animation，`prefers-reduced-motion` 時停用，`aria-hidden`（CLAUDE.md 既有規則）。

## Hero（首頁專屬）

- **用途**：首頁最上方，pixel-art 角色插畫 + 三行職稱清單。
- **Props**：`character`（圖片，走 Media 元件）、`roles: string[]`
- **出現頁面**：只有首頁 `/`。

## PullQuote

- **用途**：一句話標語，帶左側強調邊條。
- **內容範例**：「My life is an 8px grid, and I'm just trying not to let my anxiety overflow-y」
- **出現頁面**：首頁。
- **[需確認]**：邊條顏色（目前用 `--color-ink` 還是需要獨立強調色，待補）。

## SectionIntro（eyebrow + headline + body）

- **用途**：各頁開頭的標準抬頭：小標籤（eyebrow）+ 大標題（headline）+ 一段說明文字。
- **Props**：`eyebrow?`, `headline`, `body`
- **出現頁面**：About/Portfolio/Gallery/各專案頁 都用同一種抬頭排版（例如「Portfolio」「Bridging the gap between technical logic and human-centered intuition.」）。

## PortfolioCard

- **用途**：Portfolio 列表頁的專案卡片，左右交錯排列（圖在左文在右、下一張反轉）。
- **Props**：`title`, `description`, `image`, `href`
- **出現頁面**：`/portfolio`。實測共 5 張卡：Star Overlay、New Formosa Sport、OSCE Medical Assessment Platform、Talk German、Foodlet。
- **互動**：卡片內「More Details」黑底按鈕連到專案詳情頁。
- **[內容錯誤，需與設計師確認]**：live 站上 OSCE 那張卡的說明文字目前是「A modern sports website designed to deliver clear information...」— 跟 New Formosa Sport 那張一字不差，明顯是複製貼上沒改到的錯誤內容，重建時不要照抄，請設計師確認 OSCE 卡的正確描述。

## ProjectHero（專案詳情頁專屬）

- **用途**：專案頁最上方，標題 + 一段描述 + 裝置 mockup 圖（手機/瀏覽器窗框樣式）。
- **Props**：`title`, `summary`, `heroImage`
- **出現頁面**：每個專案詳情頁（實測 `/talk-german` 存在此結構，其餘 4 個專案頁面推定同構）。

## Button

- **變體**：primary（黑底白字）、secondary（透明底 + 邊框）[需確認：secondary 目前 live 站沒有明確實例，是延用 Claude Design 文件的假設]
- **Props**：`label`, `href`, `variant: 'primary' | 'secondary'`
- **出現頁面**：Hero（About me / View gallery 若有）、Portfolio 卡片（More Details）、專案頁（Learn More）。

## ExperienceItem

- **用途**：Experience 區塊的單筆經歷（職稱 + 說明 + 年份），簡單清單樣式，實測**沒有**時間軸圓點/diamond marker（跟 Claude Design 文件描述的 timeline node 不同，live 站是純清單 + 分隔線）。
- **Props**：`title`, `description`, `period`
- **出現頁面**：首頁（About Me 頁面內的 Experience 段落）。

## ConnectChannel

- **用途**：聯絡方式卡片（email / instagram）。
- **Props**：`icon`, `label`, `value`, `href`
- **出現頁面**：首頁 Connect 區塊。

## GalleryGrid

- **用途**：Gallery 頁面的攝影/pixel art 作品瀑布流。
- **Props**：`images[]`
- **出現頁面**：`/gallery`。

## Footer

- **用途**：版權宣告 + 下方跑馬燈。
- **出現頁面**：全站每一頁。

## Media / Placeholder

沿用 CLAUDE.md 既有規則：圖片一律透過 `Media.astro`（`astro:assets` + fallback 佔位元件），不在本文件重複定義。

## DataViz（資料視覺化輪播，案例頁區塊）

- **用途**：案例頁裡一次顯示一張圖表，左右箭頭（或鍵盤方向鍵）切換上一張／下一張，圖下方是名稱、說明與可展開的數據表。目前用在 New Formosa Sport 的可用性測試結果。
- **內容**：`type: dataViz` 區塊，欄位見 `src/content.config.ts` 的 `dataVizBlock`。數值寫在案例 md 裡，中位數、平均由元件計算。三種圖型：
  - `outcomeBars`：每列一個任務，堆疊「獨立完成／需協助／失敗」人數，可加目標線
  - `funnel`：每列一個階段，「最後有走到」與「獨立走到」疊在一起看流失，可加註記
  - `dots`：每列一個任務，每位受測者一個點，標中位數或平均，可加範圍軌道與參考線
- **繪圖**：build 時直接畫成 HTML／CSS，不用圖表函式庫、不產生圖片，所以**不佔圖片版位**，插在哪裡都不會讓後面的圖片編號錯開。
- **配色**：`--chart-step-1/2/3` 順序型三階（單色，深色主題另有一組），用 dataviz `validate_palette.js --ordinal` 驗過；改色要重跑驗證。
- **JS**：切換交給共用的 Carousel（見下方），這裡的 script 只負責滑鼠提示。沒有 JS 時所有圖表依序攤開，內容一樣讀得到。
- **無障礙**：每張圖都有數據表；圖例與直接標註並存，不只靠顏色辨識；滑鼠提示只是加分。
- **說明分兩層**：`description` 寫數據顯示了什麼；選填的 `insight` 寫這代表什麼、因此要改什麼，顯示在說明下方並加小標題。
- **文案**：按鈕、「查看數據表」與「這代表什麼」小標題在 `src/content/site/main-*.json` 的 `dataViz`。

## Carousel（共用輪播）

- **用途**：一次顯示一張，左右箭頭或鍵盤方向鍵切換，下方顯示「2 / 4」頁碼，到頭會循環。DataViz 與設計主軸的 carousel 版型共用這一份，切換邏輯與箭頭樣式只維護一處。
- **用法**：`<Carousel prevLabel nextLabel>`，每一張用 `data-carousel-slide` 標記後放進 slot。
- **箭頭對齊**：箭頭對齊 `--carousel-anchor` 高度的中線，由使用的段落設定（DataViz 用 `--viz-card-height`，設計主軸用 `--theme-carousel-height`）。
- **小螢幕**：箭頭與頁碼移到內容下方排成一列。
- **沒有 JS**：所有內容依序往下排，沒有箭頭（漸進增強）。

## DesignThemes 的 carousel 版型

- **用途**：設計主軸段落一次顯示一個主題（規格板），左右箭頭切換，主題標題與說明置中放在圖下方。用共用的 Carousel。
- **設定**：`layout: carousel`（後台版型下拉選單可選），原本的 `stacked`、`split` 保留。
- **圖片區**：固定高度 `--theme-carousel-height`，直的規格板等比例縮進這個高度，橫的維持滿寬；圖片一樣可以點開全螢幕放大。
- **圖片版位**：一個主題一張圖，跟其他版型相同，切換版型不影響圖片編號。
- **小螢幕**：圖片區不鎖高度，說明改靠左，箭頭在下方。
