export type Locale = 'en' | 'zh';

export const locales: Locale[] = ['en', 'zh'];

/**
 * 案例內容裡「會顯示給人看」的文字。純字串是還沒雙語化的欄位，物件則是中英對照。
 */
export type LocalizedText = string | { en: string; zh?: string };

/**
 * 依語系取出文字。
 *
 * 兩條 fallback 都是刻意的：純字串直接原樣回傳（欄位還沒雙語化），
 * 物件則在 zh 沒填或填空字串時退回 en。翻譯永遠可以只做一半，
 * 沒翻到的地方顯示英文，不會變成空白或 undefined。
 */
export function t(value: LocalizedText, locale: Locale): string;
export function t(value: LocalizedText | undefined, locale: Locale): string | undefined;
export function t(value: LocalizedText | undefined, locale: Locale): string | undefined {
  if (value == null) return undefined;
  if (typeof value === 'string') return value;
  return value[locale] || value.en;
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'en' ? 'zh' : 'en';
}

/** 把路徑裡的語系前綴換成另一個語系，例如 /en/portfolio → /zh/portfolio。 */
export function swapLocalePath(pathname: string, targetLocale: Locale): string {
  return pathname.replace(/^\/(en|zh)(\/|$)/, `/${targetLocale}$2`);
}
