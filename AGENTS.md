# 專案定位

個人 UI/UX 作品集，五個 case study，另有 Gallery 相片集。維護者是設計師本人。內容更新方式不限定「只能丟檔案」——可視需要接 Git-based CMS（如 Decap CMS）或資料庫/圖床方案管理素材，目標是維護者能用直觀介面更新內容，不必手動處理檔名與資料夾結構。但 CMS 管的是「media library ＋ 排序/命名/文字」，不會幫忙裁圖——上傳前圖片仍要先裁好。

# 硬規則

- 所有色彩、字級、間距、圓角必須引用 `src/styles/tokens.css` 的 CSS custom property。程式碼裡不得出現任何寫死的 hex 或 px 數值(border 的 1px 例外)。
- 斷點只用三個：375 / 768 / 1200。
- 正式站台（訪客會載入到的頁面）維持不引入 JS 函式庫，互動用原生 JS，總量控制在 5KB 以內。內容管理用的獨立後台（例如 `/admin` 的 Decap CMS）不受此限制，因為不會打包進站台本身、訪客不會載入到。
- 所有文案內容存放於 `src/content/`，元件不得硬編碼中英文文字。
- 圖片一律走 `astro:assets`，必須有 width/height/alt。
- 圖片路徑不得寫在 md 或元件裡，一律由 glob 掃描資料夾取得。圖片缺席時 fallback 到佔位元件，不得讓 build 失敗。

# 工作方式

- 每次動手前先輸出計畫(要改哪些檔案、為什麼)，等我確認再寫。
- 一次只做一個元件或一個頁面，不要批次產生。
- 完成後回報：新增/修改了哪些檔案，以及有什麼我需要手動確認的地方。
- 不確定的設計數值標記為 `[需確認]`，不要自己猜一個填進去。

# commit 慣例

`feat:` / `fix:` / `style:` / `content:` / `chore:`

每個階段結束時提醒我 commit。

# Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

# Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
