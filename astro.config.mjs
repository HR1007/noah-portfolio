// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// site: [需確認] — 正式網域確定後填入，@astrojs/sitemap 需要它才能產生完整 URL
// https://astro.build/config
export default defineConfig({
  site: 'https://example.com',
  integrations: [sitemap()],
});
