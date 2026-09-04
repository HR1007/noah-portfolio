/**
 * 案例頁圖片版位（slot）的單一來源。
 *
 * 案例頁的圖片不在 md 或元件裡寫路徑，而是依「區塊在頁面上由上到下的順序」
 * 依序從該案例的圖片資料夾取用（00, 01, 02...）。這份對應關係同時被兩個地方需要：
 *
 *   - src/views/ProjectDetail.astro  決定每個區塊拿到哪幾張圖
 *   - admin-server/server.mjs        後台顯示「第 N 格是哪個區塊」與需要幾張
 *
 * 兩邊必須完全一致，否則後台標示的位置會跟實際渲染錯開，而且不會報錯，
 * 只會默默把圖放錯地方。所以規則集中在這裡，兩邊都 import 這一支。
 *
 * 寫成 .mjs 而非 .ts：後台是 `node admin-server/server.mjs` 直接執行，
 * 沒有 TypeScript 編譯步驟；純 JS 讓 Astro(Vite) 與 Node 都能直接 import。
 *
 * @typedef {Object} ImageSlot
 * @property {number} index          該案例的第幾張圖（對應檔名排序後的索引）
 * @property {number} sectionIndex   所屬 section 在 sections 陣列裡的索引；hero 為 -1
 * @property {string} type           區塊型別，hero 為 'hero'
 * @property {string} label          後台顯示用的版位名稱
 * @property {string} [alt]          內容裡定義的 alt 文字
 * @property {string} [ratio]        內容裡定義的長寬比
 */

/**
 * 每種區塊需要幾張圖。回傳 0 表示該區塊沒有圖片版位。
 * @param {any} section
 * @returns {number}
 */
export function imageCountForSection(section) {
  switch (section?.type) {
    case 'deviceShowcase':
    case 'experienceDemo':
    case 'featureSplit':
    case 'researchFramework':
      return 1;
    case 'featureGrid':
      return (section.columns || []).length;
    case 'imageRow':
      return (section.images || []).length;
    case 'illustrationGrid':
      return section.count || 0;
    case 'persona':
      return (section.personas || []).length;
    case 'flow':
      return (section.steps || []).length;
    // textSection / designThemes 是純文字，不佔用圖片版位
    default:
      return 0;
  }
}

/**
 * 單一區塊內第 i 個版位的顯示名稱與 alt/ratio。
 * @param {any} section
 * @param {number} sectionIndex
 * @param {number} i
 */
function describeSlot(section, sectionIndex, i) {
  const n = sectionIndex + 1;
  const heading = section.heading ? ` — ${section.heading}` : '';

  switch (section.type) {
    case 'deviceShowcase':
      return { label: `#${n} Device Showcase`, alt: section.alt, ratio: section.ratio };
    case 'experienceDemo':
      return { label: `#${n} Experience Demo${heading}`, alt: section.alt, ratio: section.ratio };
    case 'featureSplit':
      return { label: `#${n} Feature Split${heading}`, alt: section.alt, ratio: section.ratio };
    case 'researchFramework':
      return { label: `#${n} Research Framework`, alt: section.alt, ratio: section.ratio };
    case 'featureGrid': {
      const col = (section.columns || [])[i] || {};
      return {
        label: `#${n} Feature Grid — Column ${i + 1}${col.heading ? ` (${col.heading})` : ''}`,
        alt: col.alt,
        ratio: col.ratio,
      };
    }
    case 'imageRow': {
      const img = (section.images || [])[i] || {};
      return { label: `#${n} Image Row — Image ${i + 1}`, alt: img.alt, ratio: img.ratio };
    }
    case 'illustrationGrid':
      return { label: `#${n} Illustration Grid — #${i + 1}`, alt: section.alt, ratio: section.ratio };
    case 'persona': {
      const p = (section.personas || [])[i] || {};
      return { label: `#${n} Persona — ${p.name || 'Untitled'}`, alt: p.alt, ratio: p.ratio };
    }
    case 'flow': {
      const s = (section.steps || [])[i] || {};
      return {
        label: `#${n} Flow — Step ${i + 1}${s.label ? ` (${s.label})` : ''}`,
        alt: s.alt,
        ratio: s.ratio,
      };
    }
    default:
      return { label: `#${n} ${section.type}` };
  }
}

/**
 * 依渲染順序回傳整個案例頁的圖片版位清單。
 * 順序即是圖片資料夾裡檔名排序後的取用順序：slot[0] 拿第 0 張，以此類推。
 *
 * @param {any} data 案例的 frontmatter（含 hero 與 sections）
 * @returns {ImageSlot[]}
 */
export function getImageSlots(data) {
  const slots = [];
  const isMigrated = data?.hero !== undefined && (data?.sections?.length ?? 0) > 0;

  // 尚未拆解成 sections 的舊版案例：整頁只有一張 showcase 圖
  if (!isMigrated) {
    slots.push({
      index: 0,
      sectionIndex: -1,
      type: 'showcase',
      label: 'Showcase（舊版單圖版型，未拆解成 sections）',
      alt: data?.title ? `${data.title} showcase` : undefined,
    });
    return slots;
  }

  slots.push({
    index: 0,
    sectionIndex: -1,
    type: 'hero',
    label: 'Hero',
    alt: data.title ? `${data.title} hero` : undefined,
  });

  (data.sections || []).forEach((section, sectionIndex) => {
    const count = imageCountForSection(section);
    for (let i = 0; i < count; i++) {
      slots.push({
        index: slots.length,
        sectionIndex,
        type: section.type,
        ...describeSlot(section, sectionIndex, i),
      });
    }
  });

  return slots;
}

/**
 * 把圖片依版位分配到各個 section，供渲染端直接取用。
 * 回傳 { hero, bySection }：bySection[sectionIndex] 是該區塊拿到的圖片陣列
 * （長度等於該區塊的版位數，缺圖時為 undefined，由 Media 顯示佔位框）。
 *
 * @param {any} data
 * @param {any[]} images 依檔名排序後的圖片
 */
export function assignImages(data, images) {
  const slots = getImageSlots(data);
  const bySection = {};
  let hero;

  slots.forEach((slot) => {
    const image = images[slot.index];
    if (slot.sectionIndex === -1) {
      hero = image;
      return;
    }
    if (!bySection[slot.sectionIndex]) bySection[slot.sectionIndex] = [];
    bySection[slot.sectionIndex].push(image);
  });

  return { hero, bySection };
}
