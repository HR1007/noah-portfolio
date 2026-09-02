import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 案例頁區塊：每個專案依自己的 wireframe 排列不同組合與順序的區塊。
// 區塊一律不帶圖片路徑／檔名，頁面依 sections 出現順序，依序從該專案的圖片資料夾取下一張圖（沒有圖就顯示佔位框）。
const textSectionBlock = z.object({
  type: z.literal('textSection'),
  eyebrow: z.string().optional(),
  heading: z.string(),
  paragraphs: z.array(z.string()),
});

const deviceShowcaseBlock = z.object({
  type: z.literal('deviceShowcase'),
  ratio: z.string(),
  alt: z.string(),
});

const experienceDemoBlock = z.object({
  type: z.literal('experienceDemo'),
  eyebrow: z.string().optional(),
  heading: z.string(),
  body: z.string(),
  ratio: z.string(),
  alt: z.string(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
});

const featureSplitBlock = z.object({
  type: z.literal('featureSplit'),
  heading: z.string(),
  body: z.string(),
  imagePosition: z.enum(['left', 'right']),
  ratio: z.string(),
  alt: z.string(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
});

const featureGridBlock = z.object({
  type: z.literal('featureGrid'),
  eyebrow: z.string().optional(),
  heading: z.string().optional(),
  columns: z.array(
    z.object({
      heading: z.string(),
      body: z.string(),
      ratio: z.string(),
      alt: z.string(),
    })
  ),
});

const imageRowBlock = z.object({
  type: z.literal('imageRow'),
  images: z.array(z.object({ ratio: z.string(), alt: z.string() })).min(1).max(3),
});

// 圖片數量可調：設計師之後增減插畫素材時，把這裡的 count 改成資料夾裡實際的插畫張數即可。
const illustrationGridBlock = z.object({
  type: z.literal('illustrationGrid'),
  eyebrow: z.string().optional(),
  heading: z.string(),
  body: z.string().optional(),
  count: z.number(),
  alt: z.string(),
});

const projectSection = z.discriminatedUnion('type', [
  textSectionBlock,
  deviceShowcaseBlock,
  experienceDemoBlock,
  featureSplitBlock,
  featureGridBlock,
  imageRowBlock,
  illustrationGridBlock,
]);

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    year: z.string().optional(), // [需確認] live 站未展示年份，待設計師提供
    summary: z.string(),
    tags: z.array(z.string()).default([]), // [需確認] live 站卡片未展示 tag，待設計師提供
    ctaLabel: z.string().default('More Details'), // Portfolio 卡片上的按鈕文字
    // hero／sections 為新版區塊式案例頁用；尚未依 wireframe 重新拆解的專案先留空，
    // [slug].astro 會 fallback 回舊版簡易版型（標題＋摘要＋單張圖＋Markdown 內文），不讓 build 失敗。
    hero: z
      .object({
        ctaLabel: z.string(),
        ctaHref: z.string().default('#'), // [需確認] 待設計師提供實際 demo／prototype 連結
      })
      .optional(),
    sections: z.array(projectSection).default([]),
  }),
});

const site = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/site' }),
  schema: z.object({
    nav: z.object({
      logo: z.string(),
      links: z.array(z.object({ label: z.string(), href: z.string() })),
    }),
    marquee: z.object({
      items: z.array(z.string()),
    }),
    footer: z.object({
      copyright: z.string(),
    }),
    home: z.object({
      heroName: z.string(),
      heroTagline: z.string(),
      heroRoles: z.array(z.string()),
      heroQuote: z.string(),
      aboutHeading: z.string(), // 巨大標題，例如 "About me"
      aboutSubheading: z.string(), // 次標題，例如 "Shaping Intuitive Solutions"
      aboutIntro: z.string(),
      beyondGridHeading: z.string(),
      beyondGridParagraphs: z.array(z.string()),
      experience: z.array(
        z.object({ title: z.string(), period: z.string(), description: z.string() })
      ),
      connectHeading: z.string(),
      connectIntro: z.array(z.string()),
      connectChannels: z.array(
        z.object({
          icon: z.enum(['email', 'instagram']), // 決定圖示，跟 label 顯示文字脫鉤，label 可自由翻譯不影響圖示判斷
          label: z.string(),
          value: z.string(),
          href: z.string(),
        })
      ),
    }),
    portfolio: z.object({
      eyebrow: z.string(),
      headline: z.string(),
      intro: z.string(),
    }),
    projectQuote: z.object({
      quote: z.string(),
      name: z.string(),
      tagline: z.string(),
    }),
    gallery: z.object({
      eyebrow: z.string(),
      headline: z.string(),
      intro: z.string(),
    }),
  }),
});

export const collections = { projects, site };
