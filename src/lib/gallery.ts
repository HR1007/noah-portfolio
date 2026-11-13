import { getEntry } from 'astro:content';

/*
  Gallery 開關（內容檔的 gallery.enabled）的讀取與判斷集中在這裡。
  導覽列、首頁按鈕、四個 Gallery 路由都要問同一件事，各自寫一遍的話，
  之後改規則很容易漏掉其中一處。
*/

/** 這個語言的 Gallery 目前是否開放。 */
export async function isGalleryEnabled(locale: 'en' | 'zh'): Promise<boolean> {
  const site = await getEntry('site', `main-${locale}`);
  return site?.data.gallery.enabled ?? true;
}

/**
 * 連結是否指向 Gallery（列表頁或任何一本相簿）。
 * 比對網址而不是選單文字：選單文字在後台隨時會改，網址不會。
 */
export function isGalleryHref(href: string): boolean {
  return /\/gallery(\/|$)/.test(href);
}
