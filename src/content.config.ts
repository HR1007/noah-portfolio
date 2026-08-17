import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    year: z.string().optional(), // [需確認] live 站未展示年份，待設計師提供
    summary: z.string(),
    tags: z.array(z.string()).default([]), // [需確認] live 站卡片未展示 tag，待設計師提供
    ctaLabel: z.string().default('More Details'), // Portfolio 卡片上的按鈕文字
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
      aboutEyebrow: z.string(),
      aboutHeadline: z.string(),
      aboutIntro: z.string(),
      beyondGridHeading: z.string(),
      beyondGridParagraphs: z.array(z.string()),
      experience: z.array(
        z.object({ title: z.string(), period: z.string(), description: z.string() })
      ),
      connectHeading: z.string(),
      connectIntro: z.array(z.string()),
      connectChannels: z.array(
        z.object({ label: z.string(), value: z.string(), href: z.string() })
      ),
    }),
    portfolio: z.object({
      eyebrow: z.string(),
      headline: z.string(),
      intro: z.string(),
    }),
    gallery: z.object({
      eyebrow: z.string(),
      headline: z.string(),
      intro: z.string(),
    }),
  }),
});

export const collections = { projects, site };
