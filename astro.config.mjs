// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// site: [需確認] — 正式網域確定後填入，@astrojs/sitemap 需要它才能產生完整 URL
// https://astro.build/config
/*
  開發時關掉 /_image 的瀏覽器快取。

  Astro dev 對處理過的圖片回 `cache-control: max-age=31536000`（一年），而那個網址
  只由「原始檔路徑 ＋ 尺寸」組成，不含內容雜湊。所以在後台把某一格換成另一張
  「同尺寸」的圖之後，網址完全沒變，瀏覽器會一直拿快取裡的舊圖——看起來就像
  後台已經換好、網站卻沒更新，連後台右側的預覽也一樣（它只重載頁面，圖片網址沒變）。

  正式建置輸出的是帶內容雜湊的檔名，本來就不會撞快取，所以這裡只在 dev 生效。
*/
const devImageNoCache = {
  name: 'dev-image-no-cache',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      // 直接設 header 會被 Astro 的圖片處理器後蓋掉，所以改成攔截 setHeader 本身
      if (req.url?.startsWith('/_image')) {
        const original = res.setHeader.bind(res);
        res.setHeader = (name, value) =>
          original(name, String(name).toLowerCase() === 'cache-control' ? 'no-store, must-revalidate' : value);
      }
      next();
    });
  },
};

export default defineConfig({
  site: 'https://example.com',
  integrations: [sitemap()],
  vite: { plugins: [devImageNoCache] },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh'],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: true,
    },
  },
});
