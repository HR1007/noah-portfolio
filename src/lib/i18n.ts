export type Locale = 'en' | 'zh';

export const locales: Locale[] = ['en', 'zh'];

export function otherLocale(locale: Locale): Locale {
  return locale === 'en' ? 'zh' : 'en';
}

/** 把路徑裡的語系前綴換成另一個語系，例如 /en/portfolio → /zh/portfolio。 */
export function swapLocalePath(pathname: string, targetLocale: Locale): string {
  return pathname.replace(/^\/(en|zh)(\/|$)/, `/${targetLocale}$2`);
}
