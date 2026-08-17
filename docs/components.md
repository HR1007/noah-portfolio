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
