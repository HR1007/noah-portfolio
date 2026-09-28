# 頂欄下方的伸手互動影片（ScrollVideo）

首頁進站第一眼看到的東西：訪客往下捲，影片裡的角色慢慢把手伸向鏡頭；停下就停在那一幀，往回捲就縮回去。不是背景影片，是一段由捲軸位置直接控制播放進度的逐幀動畫。

程式碼：`src/components/ScrollVideo.astro`（元件本體）、`src/views/Home.astro`（呼叫端＋裝飾層）、`src/styles/tokens.css`（`--scrub-distance` / `--nav-height`）。

---

## 機制：怎麼做到「捲軸控制影片」

### 1. 軌道 + 舞台

```
<section data-scrub-track>          軌道：舞台的自然高度 + --scrub-distance 的空白
  <div data-scrub-stage>            舞台：sticky，貼在 nav 正下方，撐滿以下視窗
    <video>                         滿版鋪在舞台裡，cover 裁切
  </div>
</section>
```

軌道比舞台多出來的高度（用 CSS `::after` 撐出來的一段空白，值是 `--scrub-distance: 1200px`）就是訪客實際要捲動的距離。舞台是 `position: sticky`，捲動時會「黏」在 nav 下方不動，直到軌道剩下的空白被捲完，舞台才跟著一起離開視窗。

### 2. 進度是純幾何算出來的

```js
const range = track.height - stage.height;               // 軌道比舞台多出來的空白
const progress = (stage.top - track.top) / range;         // 0 ~ 1
const frame = Math.round(progress * (totalFrames - 1));
video.currentTime = frame / fps;
```

不需要知道捲軸絕對位置、不需要知道 nav 高度、不需要監聽 `scrollY`——只要量兩個 `getBoundingClientRect()`，兩者的差就是目前捲了多少。這樣寫的好處：換斷點、換內容高度、甚至舞台裡面塞更多東西，這段邏輯完全不用改。

### 3. 影片必須是「全 keyframe」

一般影片幾秒才有一個 keyframe（I-frame），中間全是差量幀（P-frame）。`seek` 到任一幀時，解碼器得從上一個 keyframe 開始往後解碼到目標幀——捲動快一點、往回捲，都會卡頓。

解法是轉檔時逼每一幀都是 keyframe：

```bash
ffmpeg -i character-reach.mp4 \
  -an -vf "crop=1920:980:0:0,scale=1280:-2" \
  -c:v libx264 -profile:v high -pix_fmt yuv420p \
  -g 1 -keyint_min 1 \
  -crf 23 -preset slow -movflags +faststart \
  character-reach.mp4
```

- `-g 1 -keyint_min 1`：keyframe 間隔設成 1 幀，也就是每一幀都是 keyframe。
- `-an`：去掉音軌（影片本來就是靜音的，音軌只是佔體積）。
- `crop=1920:980:0:0`：裁掉素材右下角的浮水印。
- 代價是檔案變大（這支 121 幀、5 秒的影片從 6.5MB 全 keyframe 後仍壓在 4MB 左右，因為原始素材大多是靜止背景，H.264 的幀內壓縮本身效率就不低）。

### 4. 捲動事件不直接算，集中到一個 rAF

```js
const schedule = () => { dirty = true; if (!rafId) rafId = requestAnimationFrame(render); };
window.addEventListener('scroll', schedule, { passive: true });
```

`scroll` 事件在同一幀內可能觸發很多次，這裡只負責立一個「髒」旗標，真正的量測與 `video.currentTime` 賦值集中到單一個 `requestAnimationFrame` 裡做，一幀最多算一次。幀也會先量化（`Math.round(progress * (totalFrames - 1))`），同一幀不重複 seek——每次 seek 都要走一趟解碼，捲軸每動一像素就 seek 一次是白做工。

### 5. 兩層 IntersectionObserver

- **loading gate**（`rootMargin: '100% 0px'`）：軌道進到「上下各一個螢幕高」的範圍才把 `video.preload` 從 `'none'` 切成 `'auto'` 並呼叫 `video.load()`。首屏不用先扛這幾 MB。
- **listening gate**：軌道真的進入視窗才掛 `scroll`／`resize` 監聽，離開視窗就拆掉。不留一個常駐、頁面其他地方捲動也在空轉的 listener。

### 6. 三種降級路徑

全部退回「原生文件流裡的一般版面」——不 sticky、沒有捲動距離、影片維持第一幀（或退回 `poster` 靜態圖），不強迫任何人看一段卡住的互動：

| 情況 | 觸發點 | 結果 |
|---|---|---|
| 系統開啟「減少動態」 | `matchMedia('(prefers-reduced-motion: reduce)')` | 一開始就不掛 `data-scrub-active`，影片一個 byte 都不下載 |
| JS 沒跑到（載入失敗、被擋） | 沒有旗標可掛 | CSS 預設就是一般版面，不會停在半成品狀態 |
| 影片載入失敗、或量不到 `duration` | `video` 的 `error` 事件／`loadedmetadata` 檢查 `duration` | 拿掉旗標，退回一般版面 |

作法比照既有的 `SectionReveal.astro`：預設就是「看得見的一般版面」，只有確認可以動了才由 inline script 補上 `data-scrub-active` 旗標，CSS 只在有這個旗標時才套用 sticky 版面。

### 7. iOS Safari 的一個小坑

沒有真正播過的 `<video>`，光設 `currentTime` 在部分 iOS Safari 版本上會畫不出畫面（一片空白，要等真的 play 過一次才會「解鎖」畫面渲染）。解法是 `loadedmetadata` 後靜音播放一格馬上暫停：

```js
video.play().then(() => video.pause()).catch(() => {}).finally(() => { /* 開始 seek */ });
```

肉眼看不出這個播放/暫停，之後的 `currentTime` seek 就都正常。桌面瀏覽器不需要但也無害；被瀏覽器擋下（沒有使用者手勢）就直接跳過，不影響後續邏輯。

---

## 裝飾層：觀景窗系統

貼在影片上的裝飾圍繞同一個概念——**角色正在注視你，鏡頭也正對著角色**：

| 元素 | 呼應 |
|---|---|
| 四角取景框角標 | 「觀景窗」本身，讓滿版影片有畫面邊界，不是隨機被裁切的一塊 |
| 細格線（`--sp-6`，8×8px） | 首頁引言那句「My life is an 8px grid」是本人自己的梗，格線放大 8 倍才在滿版尺度上看得出來 |
| 左上「錄製中」脈動點＋招呼文字 | 暗示「這一段正在被記錄」；文字是 `home.reachCaption`（CMS 可編輯） |
| 右上像素愛心貼圖 | 呼應首頁 Hero 本來就有的像素風插畫，手繪 SVG `<rect>` 格子，不是另外生成的圖檔 |
| 中央緩緩呼吸的準星 | 呼應本人做手勢互動／AR 介面研究的背景，暗示鏡頭正對準訪客 |
| 底部捲動提示箭頭 | 剛進站、還沒開始捲時的引導；一旦開始捲，捲動舞台本身就是最清楚的提示 |

全部用 `--color-on-hero`（原本是為「疊在照片背景上的文字，深色模式不跟著翻」設的 token）——影片本身不隨主題反轉，疊在上面的裝飾邏輯上也不該反轉。

像素愛心的畫法：純 SVG，`viewBox="0 0 7 6"`，`<rect>` 逐格排出經典 8-bit 愛心輪廓，`shape-rendering: crispEdges` 保持縮放不糊邊：

```html
<svg viewBox="0 0 7 6">
  <rect x="1" y="0" width="2" height="1" />
  <rect x="4" y="0" width="2" height="1" />
  <rect x="0" y="1" width="7" height="1" />
  <rect x="0" y="2" width="7" height="1" />
  <rect x="1" y="3" width="5" height="1" />
  <rect x="2" y="4" width="3" height="1" />
  <rect x="3" y="5" width="1" height="1" />
</svg>
```

---

## 靈感與參考

- **Scroll-scrubbed 影片／圖片序列**：這個手法本身不是原創——Apple 產品頁（AirPods、iPhone 相機介紹）常用「捲動控制一組連續畫面播放」做產品展示，只是那邊多半是用一串靜態圖片序列（canvas 逐張畫），不是真的 `<video>`。這裡選擇真的用 `<video>` + `currentTime`，理由：
  - 121 張獨立圖片（就算用 WebP）疊起來的體積不會比一支全 keyframe 的 H.264 影片小多少，多帶的是「一次性 121 個檔案請求」vs「一個影片檔案」的差異，後者對瀏覽器快取與 HTTP/2 多工更友善。
  - `<video>` 原生支援 `currentTime` 隨機存取，不用自己刻 canvas 逐幀繪製的邏輯。
- **CSS 原生 Scroll-driven Animations**（`animation-timeline: scroll()`）：這是更新的瀏覽器原生方案，可以讓 CSS `@keyframes` 直接掛在捲動進度上，完全不用寫 JS。但它動的是 CSS 屬性（transform、opacity…），沒有辦法控制 `<video>` 的播放位置——影片幀對幀的精細控制目前只能靠 JS 讀寫 `currentTime` 做到。這支功能的 JS 實作某種程度上就是在「手刻」這個原生方案還做不到的那一小塊能力。
- **取景框／觀景窗視覺**：呼應本人研究背景（人因工程、手勢互動、AR 介面）與 About 段落照片本身的「被拍攝」語境，不是憑空加的裝飾主題。

---

## 版本演進（草稿記錄）

這支功能中途改過方向，記錄下來避免以後看到舊 commit 訊息覺得矛盾：

1. **v1 — 影片當 About 區塊背景**：影片鋪在 `.about` section 底下，疊一層半透明 `--scrim-page` 讓文字可讀，照片＋文字內容維持原樣疊在最上面。捲動距離對應 About 段落本身的高度。
2. **v2 — 改成獨立 section，放在頂欄正下方**：使用者回饋「不想要疊在背景、想要獨立一個 section、透明度 100%」。影片改成滿版不透明、不透明、不疊加任何內容的獨立 section，移到 `<BaseLayout>` 最上方、Hero 之前，訪客一進站就看到。舊的 scrim／overlay／`--read-more-fade` 相關程式碼在這次改版時整段移除。
3. **v3 — 加基礎裝飾**：四角取景框角標＋底部捲動提示箭頭，純圖形不含文字。
4. **v4 — 裝飾加豐富**：使用者要求「裝飾可以再豐富一點，讓閱覽者感受到獨特性」，並具體提示「比如文字或像素貼圖」。加上 8px 網格、「錄製中」提示點＋一句招呼文字（新增 `home.reachCaption` 內容欄位）、手繪像素愛心貼圖、中央呼吸準星。

---

## 素材與體積

| 項目 | 數值 |
|---|---|
| 原始素材 | 1920×1080、24fps、121 幀、5.04 秒、含音軌與浮水印，6.5MB |
| 轉檔後 | 1280×654（裁掉浮水印後再等比縮放）、全 keyframe、去音軌，約 4.1MB |
| 封面 poster（`character-reach-poster.jpg`） | 影片載入前／JS 未執行／減少動態時顯示的靜態首幀，1280×654，約 107KB |

原始檔留在 `raw-assets/videos/`（`.gitignore` 排除，不進版控、不會被 build）。

---

## CMS／後台整合

`admin-server/server.mjs` 的 `PAGE_IMAGES.home.slots` 新增兩個固定位置：

- `character-reach`（`kind: 'video'`）
- `character-reach-poster`（一般圖片位置，跟 hero／avatar／about 同規則）

原本 `findPageImage` 與上傳端點的副檔名驗證只認圖片副檔名（`IMAGE_EXT`），這裡按 `slot.kind` 分流成 `IMAGE_EXT` / `VIDEO_EXT` 兩條規則，圖片位置的行為完全不變。後台前端（`admin-ui/admin.js`）對應加了 `<video>` 預覽與動態 `accept` 屬性，換影片不用碰檔名或資料夾。

**換影片時要記得**：後台不會幫忙轉檔，新素材上傳前要先自己跑過「裁浮水印＋全 keyframe＋去音軌」那道 ffmpeg 手續（見上面的指令），不然捲動會頓。

---

## 可能的後續方向 `[需確認]`

- `--scrub-distance`（目前 1200px）：想要「伸手」的過程更慢、更有份量，加大這個值即可，純調參數。
- 手機直式螢幕上 `object-fit: cover` 會裁掉 16:9 影片的左右兩側，最後伸出的手在窄螢幕上可能被裁到；目前沒有另外處理，等有真機回饋再看要不要做手機專屬的裁切或改構圖。
- 是否要在準星或取景框上加一點「追蹤手部」的動態（例如準星隨捲動進度小幅位移到手掌位置）——目前是固定在畫面正中央，效果已經足夠但還有加強空間。
