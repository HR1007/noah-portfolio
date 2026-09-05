/**
 * 案例頁「區塊結構」與「圖片版位（slot）」的單一來源。
 *
 * 案例頁的圖片不在 md 或元件裡寫路徑，而是依「區塊在頁面上由上到下的順序」
 * 依序從該案例的圖片資料夾取用（00, 01, 02...）。這份對應關係同時被兩個地方需要：
 *
 *   - src/views/ProjectDetail.astro  決定每個區塊拿到哪幾張圖
 *   - admin-server/server.mjs        後台的段落卡片：標題、要幾張圖、能不能再加一項
 *
 * 兩邊必須完全一致，否則後台標示的位置會跟實際渲染錯開，而且不會報錯，
 * 只會默默把圖放錯地方。所以規則集中在這裡，兩邊都 import 這一支。
 *
 * SECTION_META 另外描述「每種區塊的可重複清單長什麼樣」，後台增刪段落／項目
 * 時依它改 frontmatter —— schema 的形狀只有這裡知道，server 不自己再寫一份。
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

/** 後台新增的項目一律先填佔位文字，實際文案在後台 Content 頁補。 */
const TBD = '[需確認]';

/**
 * 每種區塊的結構描述。
 *
 *   label   後台段落卡片顯示的區塊名稱
 *   images  「版型固定」的圖片數（不隨清單增減，例如 Feature Split 永遠一張）
 *   list    該區塊唯一的可重複清單；沒有可重複內容時為 null
 *     key       清單在 frontmatter 裡的欄位名
 *     kind      'image' = 每一項各佔一個圖片版位；'text' = 純文字，不佔版位
 *     counter   true 表示這欄不是陣列而是數字（illustrationGrid 的 count）
 *     label     後台按鈕與確認框裡的單位名稱
 *     min/max   數量上下限（對齊 content.config.ts 的 schema）
 *     create()  新項目的樣板
 *   create()  新區塊的樣板（後台「新增段落」用）
 *
 * 注意：目前沒有任何區塊同時擁有 images > 0 與 kind:'image' 的清單。
 * describeSlot 依此假設把 slot 的序號直接當成清單索引，若之後出現這種區塊要一併改。
 */
/**
 * 各段落型別支援的版型選項（下拉可選值，第一個是預設）。
 *
 * 這些欄位在 content schema 裡有 default，不填也能通過驗證——但也因此不會
 * 出現在 .md 裡，後台若只讀原始 frontmatter 就永遠看不到、等於功能不存在。
 * 集中宣告在這裡，後台照著渲染選單，選了才寫進檔案。
 */
export const SECTION_OPTIONS = {
  experienceDemo: { layout: ['stacked', 'split'] },
  researchFramework: { layout: ['stacked', 'split'] },
  featureSplit: { imagePosition: ['right', 'left'] },
  flow: { direction: ['horizontal', 'vertical'] },
  featureGrid: { direction: ['horizontal', 'vertical'] },
  imageRow: { direction: ['horizontal', 'vertical'] },
  designThemes: { direction: ['vertical', 'horizontal'] },
};

export const SECTION_META = {
  textSection: {
    label: '純文字段落',
    images: 0,
    list: {
      key: 'paragraphs',
      kind: 'text',
      label: '段落文字',
      min: 1,
      max: null,
      create: () => `${TBD} 段落內文，待補`,
    },
    create: () => ({
      type: 'textSection',
      eyebrow: `${TBD} EYEBROW`,
      heading: `${TBD} 標題`,
      paragraphs: [`${TBD} 段落內文，待補`],
    }),
  },

  deviceShowcase: {
    label: '裝置展示圖',
    images: 1,
    list: null,
    create: () => ({
      type: 'deviceShowcase',
      eyebrow: `${TBD} EYEBROW`,
      heading: `${TBD} 標題`,
      ratio: '16/10',
      alt: `${TBD} Device showcase`,
    }),
  },

  experienceDemo: {
    label: '體驗展示',
    images: 1,
    list: null,
    create: () => ({
      type: 'experienceDemo',
      layout: 'stacked',
      eyebrow: 'EXPERIENCE DEMO',
      heading: `${TBD} 標題`,
      body: `${TBD} 說明文字，待補`,
      ratio: '9/16',
      alt: `${TBD} Experience demo`,
    }),
  },

  featureSplit: {
    label: '圖文並排',
    images: 1,
    list: null,
    create: () => ({
      type: 'featureSplit',
      eyebrow: `${TBD} EYEBROW`,
      heading: `${TBD} 標題`,
      body: `${TBD} 說明文字，待補`,
      imagePosition: 'right',
      ratio: '3/4',
      alt: `${TBD} Feature split`,
    }),
  },

  featureGrid: {
    label: '功能格線',
    images: 0,
    list: {
      key: 'columns',
      kind: 'image',
      label: '欄位',
      min: 1,
      max: null,
      create: () => ({
        heading: `${TBD} 欄位標題`,
        body: `${TBD} 欄位說明，待補`,
        ratio: '3/4',
        alt: `${TBD} Feature column`,
      }),
    },
    create: () => ({
      type: 'featureGrid',
      eyebrow: `${TBD} EYEBROW`,
      heading: `${TBD} 標題`,
      columns: [
        {
          heading: `${TBD} 欄位標題`,
          body: `${TBD} 欄位說明，待補`,
          ratio: '3/4',
          alt: `${TBD} Feature column`,
        },
      ],
    }),
  },

  imageRow: {
    label: '並排圖片',
    images: 0,
    list: {
      key: 'images',
      kind: 'image',
      label: '圖片',
      min: 1,
      max: 3, // content.config.ts 限制一列最多三張
      create: () => ({ ratio: '4/3', alt: `${TBD} Image row` }),
    },
    create: () => ({
      type: 'imageRow',
      eyebrow: `${TBD} EYEBROW`,
      heading: `${TBD} 標題`,
      images: [{ ratio: '4/3', alt: `${TBD} Image row` }],
    }),
  },

  illustrationGrid: {
    label: '插畫格線',
    images: 0,
    // 這一種的張數是一個數字欄位，不是陣列：加一張＝count + 1
    list: { key: 'count', kind: 'image', counter: true, label: '插畫', min: 1, max: null },
    create: () => ({
      type: 'illustrationGrid',
      eyebrow: `${TBD} EYEBROW`,
      heading: `${TBD} 標題`,
      count: 1,
      alt: `${TBD} Illustration`,
    }),
  },

  researchFramework: {
    label: '研究架構',
    images: 1,
    list: {
      key: 'paragraphs',
      kind: 'text',
      label: '段落文字',
      min: 1,
      max: null,
      create: () => `${TBD} 段落內文，待補`,
    },
    create: () => ({
      type: 'researchFramework',
      layout: 'stacked',
      eyebrow: 'RESEARCH FRAMEWORK',
      heading: `${TBD} 標題`,
      paragraphs: [`${TBD} 段落內文，待補`],
      ratio: '4/3',
      alt: `${TBD} Research framework`,
    }),
  },

  persona: {
    label: 'Persona',
    images: 0,
    list: {
      key: 'personas',
      kind: 'image',
      label: '人物',
      min: 1,
      max: null,
      create: () => ({ name: `${TBD} Persona 名稱`, ratio: '3/4', alt: `${TBD} Persona portrait` }),
    },
    create: () => ({
      type: 'persona',
      eyebrow: 'PERSONA',
      heading: `${TBD} 標題`,
      personas: [{ name: `${TBD} Persona 名稱`, ratio: '3/4', alt: `${TBD} Persona portrait` }],
    }),
  },

  designThemes: {
    label: '設計主軸',
    images: 0,
    list: {
      key: 'themes',
      // 每個主題卡片各配一張圖：kind 改成 image 後，版位數就等於 themes 的項目數
      kind: 'image',
      label: '主題',
      min: 1,
      max: null,
      create: () => ({ title: `${TBD} 主題標題`, description: `${TBD} 主題說明，待補` }),
    },
    create: () => ({
      type: 'designThemes',
      eyebrow: 'DESIGN THEMES',
      heading: `${TBD} 標題`,
      themes: [{ title: `${TBD} 主題標題`, description: `${TBD} 主題說明，待補` }],
    }),
  },

  flow: {
    label: '流程步驟',
    images: 0,
    list: {
      key: 'steps',
      kind: 'image',
      label: '步驟',
      min: 1,
      max: null,
      create: () => ({ label: `${TBD} Step`, ratio: '3/4', alt: `${TBD} Flow step` }),
    },
    create: () => ({
      type: 'flow',
      direction: 'horizontal',
      eyebrow: 'FLOW',
      heading: `${TBD} 標題`,
      body: `${TBD} 說明文字，待補`,
      steps: [{ label: `${TBD} Step`, ratio: '3/4', alt: `${TBD} Flow step` }],
    }),
  },
};

/** 後台「新增段落」的下拉選單：型別 + 中文名稱。 */
export function sectionTypeOptions() {
  return Object.entries(SECTION_META).map(([type, meta]) => ({ type, label: meta.label }));
}

/** 該區塊可重複清單目前有幾項；沒有清單時回傳 0。 */
export function sectionItemCount(section) {
  const list = SECTION_META[section?.type]?.list;
  if (!list) return 0;
  if (list.counter) return Number(section[list.key]) || 0;
  return (section[list.key] || []).length;
}

/**
 * 每種區塊需要幾張圖 = 版型固定的張數 + 圖片型清單的項目數。
 * 回傳 0 表示該區塊沒有圖片版位（例如 textSection、designThemes）。
 * @param {any} section
 * @returns {number}
 */
export function imageCountForSection(section) {
  const meta = SECTION_META[section?.type];
  if (!meta) return 0;
  const list = meta.list;
  return meta.images + (list && list.kind === 'image' ? sectionItemCount(section) : 0);
}

/**
 * 後台段落卡片的標題，例如「#7 Feature Grid — INTUITIVE CAPABILITIES」。
 * eyebrow 是頁面上實際看得到的小標，優先拿它辨識；沒有才退回 heading。
 * @param {any} section
 * @param {number} sectionIndex
 */
export function describeSection(section, sectionIndex) {
  const meta = SECTION_META[section?.type];
  const name = meta?.label ?? section?.type ?? 'Unknown';
  const hint = section?.eyebrow || section?.heading || '';
  return `#${sectionIndex + 1} ${name}${hint ? ` — ${hint}` : ''}`;
}

/**
 * 單一區塊內第 i 個版位的顯示名稱與 alt/ratio。
 * 名稱一律由 SECTION_META 推導，跟後台段落卡片的標題用同一組詞。
 * @param {any} section
 * @param {number} sectionIndex
 * @param {number} i
 */
function describeSlot(section, sectionIndex, i) {
  const meta = SECTION_META[section.type];
  const name = meta?.label ?? section.type;
  const n = sectionIndex + 1;
  const list = meta?.list;

  // 版型固定一張圖的區塊（Device Showcase、Feature Split…）：alt/ratio 寫在區塊本身
  if (!list || list.kind !== 'image') {
    const heading = section.heading ? ` — ${section.heading}` : '';
    return { label: `#${n} ${name}${heading}`, alt: section.alt, ratio: section.ratio };
  }

  // 張數是一個數字欄位（Illustration Grid）：每一張共用區塊的 alt/ratio
  if (list.counter) {
    return { label: `#${n} ${name} — 第 ${i + 1} 張`, alt: section.alt, ratio: section.ratio };
  }

  const item = (section[list.key] || [])[i] || {};
  const hint = item.heading || item.name || item.label || item.title || '';
  return {
    label: `#${n} ${name} — ${list.label} ${i + 1}${hint ? `（${hint}）` : ''}`,
    alt: item.alt,
    ratio: item.ratio,
  };
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
        // 該區塊內的第幾格：後台移除單一版位時要指定清單裡的哪一項
        slotInSection: i,
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
 * images 是「檔名編號 → 圖片」的對照表，不是陣列——用陣列的話，刪掉中間某張圖
 * 會讓後面的圖全部往前遞補一格，整頁圖片悄悄錯位。用編號對應則是刪哪格空哪格。
 *
 * @param {any} data
 * @param {Record<number, any>} images 檔名編號對照表（00.png → 0）
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

// ---------- 後台改結構用的純資料操作（不碰檔案，檔案重新編號由 server 負責） ----------

/** 建立一個新區塊（文字先填 [需確認] 佔位）。型別不認得時丟錯，不憑空造一個。 */
export function createSection(type) {
  const meta = SECTION_META[type];
  if (!meta) throw new Error(`未知的區塊型別：${type}`);
  return meta.create();
}

/**
 * 往區塊的可重複清單加一項，回傳新的區塊物件（不改原物件）。
 * 加不了時丟錯並說明原因，讓後台直接把訊息顯示給使用者。
 */
export function addSectionItem(section) {
  const meta = SECTION_META[section?.type];
  const list = meta?.list;
  if (!list) throw new Error(`${meta?.label ?? section?.type} 這種段落沒有可增加的項目`);

  const count = sectionItemCount(section);
  if (list.max != null && count >= list.max) {
    throw new Error(`${meta.label} 最多只能有 ${list.max} 個${list.label}`);
  }
  if (list.counter) return { ...section, [list.key]: count + 1 };
  return { ...section, [list.key]: [...(section[list.key] || []), list.create()] };
}

/**
 * 移除區塊清單裡的第 i 項，回傳新的區塊物件（不改原物件）。
 * 減到低於 min 時擋下：空的段落在頁面上會變成一塊什麼都沒有的區域，
 * 要整段拿掉應該用「刪除段落」，而不是把項目一個個刪光。
 */
export function removeSectionItem(section, i) {
  const meta = SECTION_META[section?.type];
  const list = meta?.list;
  if (!list) throw new Error(`${meta?.label ?? section?.type} 這種段落沒有可移除的項目`);

  const count = sectionItemCount(section);
  if (i < 0 || i >= count) throw new Error(`第 ${i + 1} 個${list.label}不存在`);
  if (count <= (list.min ?? 0)) {
    throw new Error(`${meta.label} 至少要留 ${list.min} 個${list.label}；要整段拿掉請用「刪除段落」`);
  }
  if (list.counter) return { ...section, [list.key]: count - 1 };
  return { ...section, [list.key]: (section[list.key] || []).filter((_, idx) => idx !== i) };
}
