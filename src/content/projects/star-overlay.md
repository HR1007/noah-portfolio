---
title:
  en: A design language for the Star Overlay editor
  zh: Star Overlay
eyebrow:
  en: MOBILE PHOTO EDITOR
  zh: 手機影像編輯器
order: 2
summary:
  en: >-
    Star Overlay is an editor that turns a photo into a split composition. This
    project is the design language built for it.
  zh: Star Overlay 是一個把照片變成左右對照構圖的編輯工具，這個專案是為它建立的整套設計語言。
hero:
  ctaLabel:
    en: Try it out
    zh: 實際試試
  ctaHref: 'https://star-overlay.vercel.app/'
sections:
  - type: textSection
    eyebrow:
      en: ORIGIN & INSPIRATION
      zh: 起點與靈感
    heading:
      en: A design language for the Star Overlay editor
      zh: Star Overlay
    paragraphs:
      - en: >-
          Star Overlay turns a photo into a split composition. On the left, the
          picture shows through star-shaped cutouts; on the right, the same
          stars sit as solid shapes on top of the original. I designed the
          language behind it, so colour, type and components stay consistent
          across the tool and it reads as one product.
        zh: >-
          Star Overlay
          會把一張照片變成左右對照的構圖：左邊的照片從星形鏤空裡透出來，右邊則是同樣的星星以實心形狀疊在原圖上。我負責的是它背後的設計語言，讓顏色、字體和元件在整個工具裡保持一致，用起來像同一個產品。
  - type: deviceShowcase
    ratio: 16/10
    alt:
      en: >-
        Star Overlay desktop editor showing the control panel and split preview
        canvas
      zh: Star Overlay 桌面版編輯器，含控制面板與左右對照的預覽畫布
  - type: experienceDemo
    eyebrow:
      en: EXPERIENCE DEMO
      zh: 體驗展示
    heading:
      en: See the Star Overlay Editor in Action
      zh: 實際走一遍 Star Overlay 編輯器
    body:
      en: >-
        Photos like this are all over Instagram: punched with star, heart and
        circle shapes, as if someone had pressed a hole-punch into a printed
        snapshot, which gives a digital image a handmade feel. Almost no photo
        editor offers the effect, though. Getting the look means switching
        between apps, hunting for the right tool, and working with controls that
        were never designed for it. Star Overlay puts those steps into one
        simple tool: pick a shape, scatter it, export.
      zh: >-
        最近在 Instagram
        上常看到這種照片：上面打滿星星、愛心和圓形的洞，看起來像用打洞機壓在沖洗出來的相片上，讓數位照片多了手作感。不過，市面上的修圖 app
        幾乎都沒有這個效果。想做出來，得在好幾個 app 之間切換、找合適的工具，還要使用不是為這個效果設計的控制項。Star Overlay
        把這些步驟整合成一個簡單的工具：選形狀、灑上去、輸出。
    ratio: 390/844
    alt:
      en: Star Overlay demo on a phone, from picking a photo to shuffling, styling and downloading the stars
      zh: Star Overlay 手機操作示範，從選照片、隨機排列、調整樣式到下載
    layout: stacked
  - type: researchFramework
    eyebrow:
      en: RESEARCH FRAMEWORK
      zh: 研究架構
    heading:
      en: Made for fans
      zh: 做給粉絲用的工具
    layout: split
    paragraphs:
      - en: >-
          The people using it are fans who want to make good-looking photos for
          someone they follow, without spending time fighting the software. Star
          Overlay aims to make that editing intuitive and close to effortless.
        zh: 這個工具的使用者是粉絲：想替喜歡的人做出好看的照片，又不想花時間和軟體周旋。Star Overlay 的目標，是讓這段編輯過程直覺又省力。
      - en: >-
          So I designed it as a small system with its own style and visual
          language, which fans use to communicate, through the photos they make,
          with the people they follow and with each other.
        zh: 所以我把它設計成一套有自己風格和語言的小系統，讓粉絲透過做出來的照片，和喜歡的人以及彼此交流。
    ratio: 4/3
    alt:
      en: Star Overlay design language overview
      zh: Star Overlay 設計語言總覽
  - type: persona
    eyebrow:
      en: PERSONA
      zh: 人物誌
    heading:
      en: Star Overlay — Persona
      zh: Star Overlay — 人物誌
    personas:
      - name: Mia Wang
        ratio: 3/4
        alt:
          en: Mia Wang persona portrait
          zh: Mia Wang 人物誌
  - type: designThemes
    eyebrow:
      en: DESIGN SYSTEM
      zh: 設計系統
    heading:
      en: >-
        Colour, type and components follow one set of rules, keeping the
        interface consistent and clear while leaving room to experiment.
      zh: 色彩、字體和元件遵循同一套規則，介面一致、清楚，也保留發揮空間。
    themes:
      - title:
          en: Display
          zh: 顯示層
        description:
          en: >-
            The light theme uses paper, surface and three ink levels; the dark
            theme pairs a violet accent with a night canvas. Four corner radii
            and a 6–24 spacing scale keep every panel consistent.
          zh: 淺色主題用紙張色、表面色和三階墨色；深色主題以紫色為主色，搭配夜色畫布。四種圓角和 6 到 24 的間距階梯，讓所有面板的間距保持一致。
      - title:
          en: Space Grotesk
          zh: Space Grotesk
        description:
          en: >-
            Space Grotesk is used for display text, headings and numerals; every
            other line of interface text uses Inter. Inter's neutral style lets
            the geometric numerals stand out.
          zh: >-
            Space Grotesk 用在大標、標題和數字，介面上的其他文字都用 Inter。Inter
            的風格比較中性，可以讓幾何感強的數字更突出。
      - title:
          en: Component
          zh: 元件
        description:
          en: >-
            All the controls are documented on one sheet: buttons, ratio
            presets, the count slider, six star shapes and an eyedropper
            palette, each defined with the states it ships with.
          zh: 所有控制項整理在一張表上：按鈕、比例預設、數量滑桿、六種星形和吸色色票，每一個都和上線後會用到的狀態一起定義。
    direction: vertical
    layout: carousel
  - type: flow
    eyebrow:
      en: FLOW
      zh: 流程
    heading:
      en: 'Upload, shape, export'
      zh: 上傳、選形狀、輸出
    body:
      en: >-
        The process is kept as short as possible, so attention stays on the
        photo throughout.
      zh: 流程盡量縮短，讓使用者的注意力一直放在照片上。
    steps:
      - label: Six steps
        ratio: 1120/532
        alt:
          en: >-
            From photo to PNG: the six steps from upload to export, each looping
            back to the canvas
          zh: 從照片到 PNG：從上傳到輸出的六個步驟，每一步都能回到畫布繼續調整
      - label: Annotated editor
        ratio: 4717/2943
        alt:
          en: >-
            Desktop editor with each control group numbered and explained
            alongside
          zh: 桌面版編輯器，每個控制區塊都標上編號，旁邊附上說明
      - label: Step sequence
        ratio: 5086/902
        alt:
          en: >-
            Six frames showing the canvas change step by step, from blank to the
            finished overlay
          zh: 六格畫面依序呈現畫布從空白到完成疊圖的變化
    direction: vertical
  - type: featureSplit
    heading:
      en: Experience the Intuitive Flow
      zh: 走一遍就懂的動線
    body:
      en: >-
        Everything happens on one screen: a grouped control rail on the left and
        the split canvas in the middle. You can upload, adjust, drag and export
        without leaving the page or opening a menu.
      zh: 所有操作都在同一個畫面上：左側是分組的控制列，中間是左右對照的畫布。上傳、微調、拖曳、輸出都不用離開頁面，也不必打開選單。
    imagePosition: right
    ratio: 3/4
    alt:
      en: Hand holding a phone showing the Star Overlay intuitive flow
      zh: 手拿手機展示 Star Overlay 的操作動線
    ctaLabel:
      en: Try it out
      zh: 來試試看
    ctaHref: 'https://star-overlay.vercel.app/'
  - type: featureGrid
    eyebrow:
      en: INTUITIVE CAPABILITIES
      zh: 直覺的功能
    heading:
      en: Features
      zh: 功能
    columns:
      - heading:
          en: Upload photo
          zh: 上傳照片
        body:
          en: >-
            Click the drop zone or drag an image onto it; JPG, PNG and WEBP are
            supported. The photo appears on the canvas right away, ready to be
            punched.
          zh: 點擊拖放區或直接把圖片拖進來，支援 JPG、PNG、WEBP。照片放進來後會立刻顯示在畫布上，可以直接開始打洞。
        ratio: 3/4
        alt:
          en: Upload photo screen
          zh: 上傳照片畫面
      - heading:
          en: Ratio & shape
          zh: 比例與形狀
        body:
          en: >-
            Choose the shape to punch from the panel: five-, six-, four- or
            eight-point stars, a slim star, or a heart. Turn on Mix and the
            canvas scatters several shapes at once.
          zh: 在面板上選擇要打出的形狀：五角星、六角星、四角星、八角星、細長星或愛心。開啟「混合」後，畫布會同時灑上多種形狀。
        ratio: 3/4
        alt:
          en: Ratio and shape screen
          zh: 比例與形狀畫面
      - heading:
          en: Export PNG
          zh: 輸出 PNG
        body:
          en: >-
            When it looks right, press "Download" at the ratio you chose.
            Everything runs in the browser, so the photo never leaves your
            device and there is no upload or sign-up. The file is ready to post
            to Instagram.
          zh: >-
            確認效果後，依照選好的比例按「下載」。所有運算都在瀏覽器中完成，照片不會離開裝置，也不需要上傳或註冊，下載後就能直接發到
            Instagram。
        ratio: 3/4
        alt:
          en: Export PNG screen
          zh: 輸出 PNG 畫面
    direction: horizontal
  - type: featureSplit
    heading:
      en: 'Everything the trend needs, nothing it doesn''t'
      zh: 這股風潮需要的都在，不需要的一個都沒有
    body:
      en: >-
        A tool built for the hole-punch look, with six shapes and one-click PNG
        export.
      zh: 專門做打洞照片效果的工具，提供六種形狀，一鍵輸出 PNG。
    imagePosition: right
    ratio: 3/4
    alt:
      en: Two phone mockups showing the finished Star Overlay look
      zh: 兩台手機模擬畫面，展示 Star Overlay 完成後的樣子
    ctaLabel:
      en: Try it out
      zh: 來試試看
    ctaHref: 'https://star-overlay.vercel.app/'
---

