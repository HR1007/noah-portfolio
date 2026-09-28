# 網站功能總覽

整個作品集用到的所有互動、導覽、內容架構與後台功能，每項簡述「做什麼」與「怎麼做到」。單一功能想看更深入的技術細節，個別功能可能另有專屬文件（例如 `docs/reach-video-feature.md`），這裡的定位是索引＋概觀。

正式站台的硬規則：不引入 JS 函式庫，所有互動都是原生 JS／CSS；所有色彩字級間距圓角都引用 `src/styles/tokens.css` 的 token。後台（`/admin`）是本機專用工具，不受此限制，另外說明。

---

## 一、互動與動畫

### 捲動驅動的伸手互動影片（ScrollVideo）

首頁頂欄下方，捲軸位置直接控制影片播放進度（`video.currentTime`），往下捲角色伸手、往回捲角色縮手。核心是「軌道 + sticky 舞台」的幾何關係算進度，不依賴監聽 `scrollY`；影片需要轉成全 keyframe（`ffmpeg -g 1`）避免 seek 卡頓。詳見 **`docs/reach-video-feature.md`**（機制、裝飾層、素材規格、CMS 整合都在裡面）。

檔案：`src/components/ScrollVideo.astro`、`src/views/Home.astro`

### 進場動畫（SectionReveal）

頁面上大部分 `<section>` 一開始是隱藏＋往上偏移的狀態，捲進視窗才淡入歸位，捲出去再捲回來會重播。用單一 `IntersectionObserver` 共用給全頁所有區塊，不是每個區塊各開一個 observer。

不輸出任何標記，只在 `<head>` 掛一支 inline script：先判斷 `prefers-reduced-motion`，通過才在 `<html>` 補上 `data-reveal-ready`；CSS 只在有這個旗標時才把元素設成隱藏狀態。JS 沒跑到、或使用者開了減少動態，內容從第一次繪製起就是正常可見的——預設「看得見」是刻意的，動畫是加分項，不是內容能不能顯示的前提。

檔案：`src/components/SectionReveal.astro`（掛在 `BaseLayout.astro` 裡，全站生效）

### 全螢幕圖片檢視（ImageViewer）

案例頁與相簿裡的圖片點下去可以放大、縮放、拖曳平移、左右鍵換圖、Esc 關閉。整支只用原生 `pointer`／`wheel` 事件寫縮放平移，沒有引入 lightbox 函式庫。

幾個值得注意的細節：

- **縮放上限依每張圖的原始解析度動態算**（`native / shown * 1.5`，夾在 2～6 倍之間），不是寫死一個倍數——不然低解析度的圖會被放大到糊掉。
- **以游標為錨點縮放**：滾輪縮放時，游標底下的那一點在畫面上的位置不會跑掉（先算游標相對圖片中心的偏移，縮放後反推新的平移量）。
- **聚光燈效果**：一圈跟著游標走的柔光，`--x`／`--y` 由 `pointermove` 寫入 CSS 自訂屬性，`radial-gradient` 吃這兩個變數畫出來，不用 JS 操作漸層本身。
- 圖片包在連結裡（例如相簿封面卡）時連結優先，不會誤觸放大檢視。

檔案：`src/components/ImageViewer.astro`（掛在 `BaseLayout.astro`，全站共用一份）

### 長文字收合／展開（ReadMore）

案例頁的長段落與首頁自我介紹用的到。用 CSS `max-height` 收合，不是 `-webkit-line-clamp`（那個屬性在段落只有一兩個子元素時會失準，等於沒收到）。

按鈕**只在真的被截斷時才出現**：用 `scrollHeight > clientHeight` 量測，字型載入完（`document.fonts.ready`）才量，避免字重還沒到位時算錯。文字全文留在 DOM 裡只是視覺高度被收合，SEO 與螢幕閱讀器讀到的都是完整內容。

檔案：`src/components/ReadMore.astro`

### 相簿直向照片牆（PhotoMarquee）

相簿內頁的照片分成五欄持續往上（偶數欄往下）流動，滑鼠停在牆上整片暫停。刻意不用 JS 逐幀改 `transform`（長照片牆容易掉幀），純 CSS `animation` 交給合成執行緒跑，暫停只是切 `animation-play-state`，不需要記錄與復原播放進度。

無縫循環的技巧：每欄內容在瀏覽器端量測後動態複製到「超過容器高度」，再整份複製一次讓 `translateY(-50%)` 剛好接回起點；播放秒數用「軌道高度的一半 ÷ 固定的每秒像素」反推，不管複製了幾份，各欄速度都一致。小螢幕與減少動態時退回一般的直向堆疊。

檔案：`src/components/gallery/PhotoMarquee.astro`

### 頂部跑馬燈（Marquee）

導覽列上方那條跑動的文字條，單純的 CSS `@keyframes` 位移動畫，內容重複四輪讓寬螢幕也能無縫銜接。

檔案：`src/components/Marquee.astro`

### 返回鍵的像素箭頭動畫（BackLink）

案例頁與相簿內頁左上角的「返回」。箭頭是手刻的 5×5 像素網格（`grid-template-columns/rows` 切格，每格一個 `<i>`），不是圖檔也不是 `box-shadow` 畫法——逐格拆成獨立元素才能對每一格做延遲位移，做出「倒帶」的波動感（越左邊的格子延遲越短，形成從左到右的波）。hover 時箭頭整體位移，讓出的位置有兩塊「殘影」方塊依序淡出。

點擊行為是漸進增強：站內導覽真的呼叫 `history.back()`（不會把「上一步」錯記成固定的上層頁），但只在 `document.referrer` 同源時才這麼做，避免從外部連結進來時把訪客送回站外。

檔案：`src/components/BackLink.astro`

---

## 二、導覽與個人化

### 側邊章節導覽（SectionNav）

案例頁與首頁右側那條隨捲動高亮目前段落的導覽鐵軌，預設收成一排點，hover 才展開文字標籤。用 `IntersectionObserver`（`rootMargin` 把判定帶壓在畫面上方 20%～40%）標記目前捲到哪個段落，不是在 `scroll` 事件裡即時算位置——長頁面上後者很容易掉幀。跳轉使用一般錨點連結（`href="#id"`），目標元素要記得補 `scroll-margin-top`，不然會被 sticky 導覽列蓋住。捲到頁面最上方時整條淡出收起，1200px 以下直接隱藏（那個寬度內容欄兩側空間不夠放）。

檔案：`src/components/project/SectionNav.astro`（案例頁與首頁共用同一顆元件）

### 深色模式（ThemeToggle）

點擊切換 `<html data-theme>`，寫入 `localStorage`。**不跟隨作業系統設定**：預設一律淺色，深色是使用者主動選擇才套用，因為站台的視覺是以淺色為基準設計的。theme 的讀取發生在 `<head>` 的 inline script（`BaseLayout.astro`），比內容早，避免深色模式使用者重新整理時先閃一下淺色再跳深色。

檔案：`src/components/ThemeToggle.astro`

### 中英切換（LangToggle）

沒有 JS 邏輯，是一顆連結：把目前路徑的語系前綴換成另一個（`/en/portfolio` ↔ `/zh/portfolio`）。多語系本身靠 Astro 內建 i18n routing（`astro.config.mjs` 設 `prefixDefaultLocale: true`），每個語系各自靜態產出，不是執行期切換文字。

檔案：`src/components/LangToggle.astro`、`src/lib/i18n.ts`

### 即時時間與天氣（NavStatus）

導覽列右側顯示「設計師本人所在地」的時間與天氣（不是訪客的——後者要跳定位授權，而且對訪客沒有資訊量）。時間用 `Intl.DateTimeFormat` 固定 `Asia/Taipei` 時區，`setTimeout` 對齊到下一個整分再更新，不是每秒觸發；一開始用 inline script 同步寫入，避免一般 module script 的 defer 造成畫面先閃「--:--」。

天氣是**全站唯一的第三方請求**：打 [Open-Meteo](https://open-meteo.com/)（免 API key、免費、支援 CORS），WMO 天氣代碼收斂成七類圖示。結果存進 `sessionStorage` 快取 30 分鐘，同一次瀏覽換頁不會每頁重打。定位是「錦上添花」等級——抓不到就整塊藏起來，不擋畫面、不留壞掉的空框、不顯示錯誤訊息。

檔案：`src/components/NavStatus.astro`

---

## 三、內容架構

作品集的核心設計哲學：**內容與圖片路徑都不寫死在元件或程式碼裡**，全部靠掃描與 schema 驅動，維護者透過後台或直接編輯 content 檔案就能更新，不用碰程式碼。

### 雙語內容 schema（content.config.ts）

用 Zod 定義兩種文字型別：

- `z.string()` — 首頁／導覽等「已經拆成 en/zh 兩個檔案」的內容，同一欄位天生就是單語。
- `localized()` = `z.union([z.string(), z.object({ en, zh? })])` — 案例頁內容（`src/content/projects/*.md`）用，接受純字串（代表還沒雙語化）或中英對照物件（`zh` 選填，沒填就在讀取時退回英文）。這樣不需要一次性把全部內容翻完才能上線，可以一個欄位一個案例慢慢補。

案例頁的區塊是一個 `discriminatedUnion`（`textSection`／`featureGrid`／`persona`／`flow`…十一種類型），每種描述自己的欄位形狀；**區塊本身完全不含圖片路徑**，頁面依區塊在陣列裡的順序，依序從該案例的圖片資料夾取下一張圖。

### 圖片版位的單一事實來源（image-slots.mjs）

「第幾個區塊該拿第幾張圖」這條規則會同時被兩個完全不同的地方用到：`ProjectDetail.astro`（決定畫面上放哪張圖）與 `admin-server`（後台段落卡片要標示「這是第幾格」、新增/刪除段落時要不要連動搬動圖片）。這份對應關係抽成 `src/lib/image-slots.mjs` 單一來源，兩邊都 import 它——分開各寫一套的風險是規則改了只改到一邊，後台標示的位置跟實際渲染悄悄錯開，而且不會報錯，只會讓圖片默默放錯地方。

寫成 `.mjs` 而非 `.ts`：後台是 `node admin-server/server.mjs` 直接執行，沒有編譯步驟，純 JS 讓 Vite（網站端）與 Node（後台）都能原樣 import 同一份檔案。

### 圖片解析：glob 掃描，不寫路徑（media.ts）

`src/lib/media.ts` 用 `import.meta.glob` 掃描 `src/assets/` 底下的資料夾（`projects/*`、`gallery/*`、`home/*`…），依語意檔名（`getHomeImage('hero')`）或編號序列（`getProjectImages(slug)`）取圖。元件與內容檔完全不出現檔案路徑或副檔名——換圖只是覆蓋同名檔案，副檔名可以從 png 換成 webp 都不用改任何程式碼。找不到圖片時所有取用函式回傳 `undefined`，不會讓 build 失敗，交給 `Placeholder.astro` 顯示佔位框。

同一支檔案也提供 `getHomeVideo()`，機制相同，只是找的是 `.mp4`（見上面的 ScrollVideo）。

### 缺圖時的佔位框（Placeholder）

虛線斜紋背景 + 檔名標籤，維持跟預期圖片一樣的長寬比撐住版面（不會因為缺圖而版面塌陷）。標籤可以用環境變數 `SHOW_PLACEHOLDER_LABEL=false` 整站關掉（正式上線前確認沒有漏圖用）。

---

## 四、後台內容管理系統（`/admin`，本機專用）

一個自己刻的輕量 CMS，管三種素材：頁面固定圖片（hero/avatar/about 這種語意檔名）、Gallery／Portfolio 的編號序列圖片、案例頁的段落結構與文案。不進版控的公開站台，只有維護者本機執行 `npm run admin` 才能存取。

### 統一的復原機制（undo.mjs）

後台十幾個會寫檔的端點，沒有各自寫一套「復原」邏輯（那樣每加一個端點都要記得補一份，漏掉不會有任何徵兆）。改成統一在每次寫入前，把「這一步會碰到的檔案或資料夾」原封不動複製一份存到 `.admin-undo/`（`.gitignore` 排除）。復原永遠只有一個動作：把快照整份放回去，不需要知道那一步實際做了什麼（刪檔、改名、覆蓋內容）。只保留最近一次操作。

### 發布流程（publish-core.mjs）

CLI（`npm run publish`）與後台的「發布」按鈕共用同一套核心邏輯，避免兩邊各寫一份、哪天改了發布範圍或驗證條件卻只改到一邊。

- **範圍鎖定**：只會 `git add` 兩個目錄——`src/content`、`src/assets`。程式碼永遠不會被後台不小心送出。
- **發布前跑一次完整 `astro build`**：內容不符 schema 就擋下，寧可發布失敗，也不要讓正式站台的建置壞掉。
- **commit 訊息自動生成**：不是簡單的「更新內容」，會讀 `git diff` 判斷實際改了哪些欄位、哪些案例；圖片異動還會分辨「單純調順序」（內容雜湊沒變）跟「真的換了新圖」，log 上看得出畫質有沒有被動過。
- **推送前檢查遠端**：本機落後 origin 就擋下，不自動合併，交給維護者自己 `git pull --rebase`。

### 圖片 slot 系統跨型別支援（image / video）

原本 `PAGE_IMAGES.home.slots` 只認得圖片副檔名。新增 ScrollVideo 的影片素材後，把副檔名驗證依 `slot.kind` 分流成 `IMAGE_EXT`／`VIDEO_EXT` 兩條規則，同一套上傳／更換／刪除端點兩種檔案都能用，前端對應在影片位置渲染 `<video>` 預覽而不是 `<img>`。詳見 `docs/reach-video-feature.md` 的「CMS／後台整合」一節。

---

## 五、開發輔助（不影響正式站台）

### Dev 模式圖片快取繞過

`astro.config.mjs` 裡的一個小型 Vite plugin：開發模式下攔截 `/_image` 路由的 `Cache-Control`，強制 `no-store`。原因：處理過的圖片網址只由「原始檔路徑＋尺寸」組成、不含內容雜湊，在後台把某張圖換成另一張同尺寸的圖後網址完全不變，瀏覽器會一直吃快取裡的舊圖，看起來像後台換圖沒生效。正式建置的輸出檔名帶內容雜湊，本來就不會撞快取，這個 plugin 只在 `serve`（dev）階段生效。

---

## 技術原則小結

貫穿以上所有功能的幾條共同規則：

1. **內容與圖片路徑不寫死**——schema + glob 掃描 + fallback 佔位框，維護者不用碰程式碼或記檔名規則。
2. **降級優先於強制**：抓不到天氣、影片載入失敗、JS 沒跑到、系統開減少動態——都退回一個「看得見、讀得到、可以用」的基本版面，不會讓某個加分互動變成擋路的東西。
3. **`IntersectionObserver` 優先於 `scroll` 事件**：捲動觸發的邏輯（進場動畫、章節導覽、影片預載）幾乎都用 observer，真正需要逐幀反應的（ScrollVideo）才用 `requestAnimationFrame` 節流過的 `scroll` 監聽，而且只在元素可見時才掛著。
4. **單一事實來源**：圖片版位規則（image-slots.mjs）、發布邏輯（publish-core.mjs）等會被多處用到的邏輯抽成共用模組，避免兩邊各寫一份而悄悄失去同步。
