import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { HERO_GRADIENTS } from './lib/hero-gradients.mjs';

/*
  會顯示在頁面上的文字：中英對照。

  刻意接受兩種寫法。純字串代表「還沒雙語化」，維持原樣運作；轉成物件之後
  zh 才是選填——沒填就由 t() 退回 en。這樣不需要一次性大遷移，也不會有
  「翻譯做到一半、站台卻開天窗」的空窗期，可以一個欄位一個案例慢慢轉。

  ratio／layout／direction／ctaHref 這些不是給人讀的值，不套用。
  persona 的 name 與 flow 的 step label 也不套用——它們不輸出到頁面，
  只是後台辨識版位用的標籤。
*/
const localized = () =>
  z.union([z.string(), z.object({ en: z.string(), zh: z.string().optional() })]);

// 案例頁區塊：每個專案依自己的 wireframe 排列不同組合與順序的區塊。
// 區塊一律不帶圖片路徑／檔名，頁面依 sections 出現順序，依序從該專案的圖片資料夾取下一張圖（沒有圖就顯示佔位框）。
const textSectionBlock = z.object({
  type: z.literal('textSection'),
  eyebrow: localized().optional(),
  heading: localized(),
  paragraphs: z.array(localized()),
  // 選填 CTA 按鈕：兩個都填才會渲染（見 SectionCta.astro）。
  // 每種段落都支援，後台的「進階設定」可以逐段開關。
  ctaLabel: localized().optional(),
  ctaHref: z.string().optional(),
});

const deviceShowcaseBlock = z.object({
  type: z.literal('deviceShowcase'),
  eyebrow: localized().optional(),
  heading: localized().optional(),
  ratio: z.string(),
  alt: localized(),
  // 選填 CTA 按鈕：兩個都填才會渲染（見 SectionCta.astro）。
  // 每種段落都支援，後台的「進階設定」可以逐段開關。
  ctaLabel: localized().optional(),
  ctaHref: z.string().optional(),
});

const experienceDemoBlock = z.object({
  type: z.literal('experienceDemo'),
  eyebrow: localized().optional(),
  heading: localized(),
  body: localized(),
  ratio: z.string(),
  alt: localized(),
  ctaLabel: localized().optional(),
  ctaHref: z.string().optional(),
  // stacked：文字在上、圖片在下（預設）；split：文字在左、圖片在右
  // stacked 文上圖下／split 左文右圖／split-reverse 左圖右文
  layout: z.enum(['stacked', 'split', 'split-reverse']).default('stacked'),
});

const featureSplitBlock = z.object({
  type: z.literal('featureSplit'),
  eyebrow: localized().optional(),
  heading: localized(),
  body: localized(),
  imagePosition: z.enum(['left', 'right']),
  ratio: z.string(),
  alt: localized(),
  ctaLabel: localized().optional(),
  ctaHref: z.string().optional(),
});

const featureGridBlock = z.object({
  type: z.literal('featureGrid'),
  eyebrow: localized().optional(),
  heading: localized().optional(),
  columns: z.array(
    z.object({
      heading: localized(),
      body: localized(),
      ratio: z.string(),
      alt: localized(),
    })
  ),
  // 選填 CTA 按鈕：兩個都填才會渲染（見 SectionCta.astro）。
  // 每種段落都支援，後台的「進階設定」可以逐段開關。
  ctaLabel: localized().optional(),
  ctaHref: z.string().optional(),
});

const imageRowBlock = z.object({
  type: z.literal('imageRow'),
  eyebrow: localized().optional(),
  heading: localized().optional(),
  images: z.array(z.object({ ratio: z.string(), alt: localized() })).min(1).max(3),
  // 選填 CTA 按鈕：兩個都填才會渲染（見 SectionCta.astro）。
  // 每種段落都支援，後台的「進階設定」可以逐段開關。
  ctaLabel: localized().optional(),
  ctaHref: z.string().optional(),
});

// 圖片數量可調：設計師之後增減插畫素材時，把這裡的 count 改成資料夾裡實際的插畫張數即可。
const illustrationGridBlock = z.object({
  type: z.literal('illustrationGrid'),
  eyebrow: localized().optional(),
  heading: localized(),
  body: localized().optional(),
  count: z.number(),
  alt: localized(),
  // 選填 CTA 按鈕：兩個都填才會渲染（見 SectionCta.astro）。
  // 每種段落都支援，後台的「進階設定」可以逐段開關。
  ctaLabel: localized().optional(),
  ctaHref: z.string().optional(),
});

const researchFrameworkBlock = z.object({
  type: z.literal('researchFramework'),
  eyebrow: localized().optional(),
  heading: localized(),
  paragraphs: z.array(localized()),
  ratio: z.string(),
  alt: localized(),
  // stacked：文字在上、圖片在下（預設）；split：文字在左、圖片在右
  // stacked 文上圖下／split 左文右圖／split-reverse 左圖右文
  layout: z.enum(['stacked', 'split', 'split-reverse']).default('stacked'),
  // 選填 CTA 按鈕：兩個都填才會渲染（見 SectionCta.astro）。
  // 每種段落都支援，後台的「進階設定」可以逐段開關。
  ctaLabel: localized().optional(),
  ctaHref: z.string().optional(),
});

// Persona 圖本身就是完整的人物看板（姓名、角色、Goals、Needs… 都印在圖上），
// 頁面不再用文字把同樣內容重複一次，所以每個 persona 只需要「一格圖」該有的資訊。
// name 不會輸出到頁面，是後台版位標籤用來辨識「這格是誰」的依據。
const personaBlock = z.object({
  type: z.literal('persona'),
  eyebrow: localized().optional(),
  heading: localized(),
  personas: z.array(
    z.object({
      name: z.string(),
      ratio: z.string(),
      alt: localized(),
    })
  ),
  // 選填 CTA 按鈕：兩個都填才會渲染（見 SectionCta.astro）。
  // 每種段落都支援，後台的「進階設定」可以逐段開關。
  ctaLabel: localized().optional(),
  ctaHref: z.string().optional(),
});

const designThemesBlock = z.object({
  type: z.literal('designThemes'),
  eyebrow: localized().optional(),
  heading: localized(),
  // 預設 vertical：這一區放的是設計系統規格圖，橫排會讓每張都太小看不清細節。
  // 預設值要跟 image-slots.mjs 的 SECTION_OPTIONS 第一個選項一致。
  direction: z.enum(['vertical', 'horizontal']).default('vertical'),
  themes: z.array(
    z.object({
      title: localized(),
      // 不在頁面上呈現，只作為後台版位標籤與 alt 文字，因此選填
      description: localized().optional(),
    })
  ),
  // 選填 CTA 按鈕：兩個都填才會渲染（見 SectionCta.astro）。
  // 每種段落都支援，後台的「進階設定」可以逐段開關。
  ctaLabel: localized().optional(),
  ctaHref: z.string().optional(),
});

const flowBlock = z.object({
  type: z.literal('flow'),
  eyebrow: localized().optional(),
  heading: localized(),
  body: localized().optional(),
  // horizontal：步驟並排成一列（預設）；vertical：一步一列往下排
  direction: z.enum(['horizontal', 'vertical']).default('horizontal'),
  steps: z.array(z.object({ label: z.string(), ratio: z.string(), alt: localized() })),
  // 選填 CTA 按鈕：兩個都填才會渲染（見 SectionCta.astro）。
  // 每種段落都支援，後台的「進階設定」可以逐段開關。
  ctaLabel: localized().optional(),
  ctaHref: z.string().optional(),
});

const projectSection = z.discriminatedUnion('type', [
  textSectionBlock,
  deviceShowcaseBlock,
  experienceDemoBlock,
  featureSplitBlock,
  featureGridBlock,
  imageRowBlock,
  illustrationGridBlock,
  researchFrameworkBlock,
  personaBlock,
  designThemesBlock,
  flowBlock,
]);

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: z.object({
    title: localized(),
    order: z.number(),
    year: z.string().optional(), // [需確認] live 站未展示年份，待設計師提供
    summary: localized(),
    tags: z.array(z.string()).default([]), // [需確認] live 站卡片未展示 tag，待設計師提供
    ctaLabel: localized().default('More Details'), // Portfolio 卡片上的按鈕文字
    // hero／sections 為新版區塊式案例頁用；尚未依 wireframe 重新拆解的專案先留空，
    // [slug].astro 會 fallback 回舊版簡易版型（標題＋摘要＋單張圖＋Markdown 內文），不讓 build 失敗。
    hero: z
      .object({
        ctaLabel: localized(),
        ctaHref: z.string().default('#'), // [需確認] 待設計師提供實際 demo／prototype 連結
        // 漸層底色只存名稱，實際色值定義在 src/styles/tokens.css，
        // 避免把 hex 散進內容檔。
        gradient: z.enum(HERO_GRADIENTS).default('slate'),
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
      // 案例頁／相簿頁左上角的返回鍵文案
      backLabel: z.string(),
      // 案例頁側邊章節導覽最上方的「回到頂端」
      toTop: z.string(),
      /*
        導覽列右側的「此刻」：設計師所在地的時間與天氣。

        座標跟城市名放在一起，是因為它們講的是同一件事——「Noah 人在哪裡」。
        搬家時只要改這一塊，不必去元件裡找另一個寫死的數字。
        天氣描述給螢幕閱讀器用；畫面上只出現圖示。
      */
      status: z.object({
        city: z.string(),
        latitude: z.number(),
        longitude: z.number(),
        weather: z.object({
          clear: z.string(),
          cloudy: z.string(),
          overcast: z.string(),
          fog: z.string(),
          rain: z.string(),
          snow: z.string(),
          thunder: z.string(),
        }),
      }),
    }),
    /* 長段落收合的按鈕文案 */
    readMore: z.object({ more: z.string(), less: z.string() }),
    /* 全螢幕圖片檢視的操作文案 */
    viewer: z.object({
      close: z.string(),
      prev: z.string(),
      next: z.string(),
      hint: z.string(),
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
      albums: z.array(
        z.object({
          slug: z.string(),
          title: z.string(),
          dateLabel: z.string(),
        })
      ),
      // Germany 在主頁是直接內嵌整組相片（非封面卡+連結），但同時也有自己的獨立相簿頁，
      // 所以一樣帶 slug，跟 albums 一起餵給 [slug].astro 的 getStaticPaths。
      germany: z.object({
        slug: z.string(),
        title: z.string(),
        dateLabel: z.string(),
      }),
      // [需確認] heading/body/ctaLabel/ctaHref 四項在參考稿裡是範本沒填的佔位文案（"This outstanding
      // object" / "A description explains a little bit more." / "Call to action"），先照抄英文原文
      // 並附上中文暫譯，待設計師提供正式內容與連結後更新。
      cta: z.object({
        heading: z.string(),
        body: z.string(),
        ctaLabel: localized(),
        ctaHref: z.string().default('#'),
      }),
    }),
  }),
});

export const collections = { projects, site };
