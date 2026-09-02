import type { ImageMetadata } from 'astro';

type ImageModule = { default: ImageMetadata };

const projectImageModules = import.meta.glob<ImageModule>(
  '/src/assets/projects/*/*.{png,jpg,jpeg,webp,avif}',
  { eager: true }
);

const galleryImageModules = import.meta.glob<ImageModule>(
  '/src/assets/gallery/*.{png,jpg,jpeg,webp,avif}',
  { eager: true }
);

const galleryAlbumImageModules = import.meta.glob<ImageModule>(
  '/src/assets/gallery/*/*.{png,jpg,jpeg,webp,avif}',
  { eager: true }
);

const homeImageModules = import.meta.glob<ImageModule>(
  '/src/assets/home/*.{png,jpg,jpeg,webp,avif}',
  { eager: true }
);

function sortedByFilename(modules: Record<string, ImageModule>): [string, ImageMetadata][] {
  return Object.entries(modules)
    .map(([path, mod]) => [path, mod.default] as [string, ImageMetadata])
    .sort(([a], [b]) => a.localeCompare(b));
}

/** 依檔名序號（00, 01, 02...）回傳指定專案資料夾內所有圖片；資料夾不存在或無圖時回傳空陣列。 */
export function getProjectImages(slug: string): ImageMetadata[] {
  const prefix = `/src/assets/projects/${slug}/`;
  return sortedByFilename(projectImageModules)
    .filter(([path]) => path.startsWith(prefix))
    .map(([, image]) => image);
}

/** 依語意檔名（不含副檔名）取單張 Gallery 頁面圖片，例如 getGalleryImage('hero')；找不到時回傳 undefined。 */
export function getGalleryImage(name: string): ImageMetadata | undefined {
  const match = sortedByFilename(galleryImageModules).find(([path]) => {
    const filename = path.split('/').pop() ?? '';
    return filename.replace(/\.[^.]+$/, '') === name;
  });
  return match?.[1];
}

/** 依檔名序號（00, 01, 02...）回傳指定相簿資料夾內所有照片；資料夾不存在或無圖時回傳空陣列。 */
export function getGalleryAlbumImages(slug: string): ImageMetadata[] {
  const prefix = `/src/assets/gallery/${slug}/`;
  return sortedByFilename(galleryAlbumImageModules)
    .filter(([path]) => path.startsWith(prefix))
    .map(([, image]) => image);
}

/** 依語意檔名（不含副檔名）取單張首頁圖片，例如 getHomeImage('hero')；找不到時回傳 undefined。 */
export function getHomeImage(name: string): ImageMetadata | undefined {
  const match = sortedByFilename(homeImageModules).find(([path]) => {
    const filename = path.split('/').pop() ?? '';
    return filename.replace(/\.[^.]+$/, '') === name;
  });
  return match?.[1];
}

/** 依檔名前綴取一組首頁圖片（例如 getHomeImageSet('hobby') 對應 hobby-01.png, hobby-02.png...），依檔名排序；找不到時回傳空陣列。 */
export function getHomeImageSet(prefix: string): ImageMetadata[] {
  return sortedByFilename(homeImageModules)
    .filter(([path]) => {
      const filename = path.split('/').pop() ?? '';
      return filename.startsWith(`${prefix}-`);
    })
    .map(([, image]) => image);
}
