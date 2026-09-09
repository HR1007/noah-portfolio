---
title:
  en: New Formosa Sport — Sports Platform Website Design
  zh: 新台灣運動——運動用品平台網站設計
order: 2
summary:
  en: >-
    A modern sports website designed to deliver clear information, engaging
    visuals, and a seamless browsing experience.
  zh: 一個資訊清楚、視覺有戲、瀏覽不卡的運動用品網站。
hero:
  ctaLabel:
    en: Try it out
    zh: 實際試試
  ctaHref: 'https://new-formosa-sport.netlify.app/index.html#home'
  gradient: mint
sections:
  - type: textSection
    eyebrow:
      en: ORIGIN & INSPIRATION
      zh: 起點與靈感
    heading:
      en: New Formosa Sport — Sports Platform Website Design
      zh: 新台灣運動——運動用品平台網站設計
    paragraphs:
      - en: >-
          New Formosa Sport is a long-established sporting goods store in Rende,
          Tainan, running five stores at once — retail, event construction, and
          local team apparel — for local schools and cycling teams. The easy
          version of this brief is a website. What the business actually lacked
          was a system: one design language, a site that deploys fast, an
          automated inquiry pipeline, and a workflow the team could keep using
          long after I stopped touching the files.
        zh: >-
          新台灣運動是台南仁德的老字號運動用品店，一次經營五條線——零售、場館工程、團體服訂製，服務在地學校與車隊。這個案子最省事的答案是「做一個網站」。但這家店真正缺的是一套系統：一致的設計語言、能快速上線的網站、自動化的詢價管道，以及一套在我不再碰這些檔案之後、團隊還能繼續用下去的流程。
  - type: deviceShowcase
    ratio: 16/10
    alt:
      en: New Formosa Sport website homepage screenshot
      zh: 新台灣運動網站首頁畫面
  - type: persona
    eyebrow:
      en: PERSONA
      zh: 使用者輪廓
    heading:
      en: New Formosa Sport — Persona
      zh: 新台灣運動 — 使用者輪廓
    personas:
      - name: School equipment buyer
        ratio: 3/4
        alt:
          en: New Formosa Sport persona board
          zh: 新台灣運動使用者輪廓看板
  - type: designThemes
    eyebrow:
      en: DESIGN THEMES
      zh: 設計主軸
    heading:
      en: >-
        One design language across five business lines — so the site reads as
        one shop, not five.
      zh: 五條業務線共用一套設計語言——讓網站讀起來是一家店，不是五家。
    themes:
      - title:
          en: Colour
          zh: 色彩
        description:
          en: >-
            The existing Formosa Red carried over as the brand anchor, paired
            with a deep navy that keeps long product listings calm.
          zh: 沿用原本的 Formosa Red 當品牌定錨，搭一個深藍，讓長長的商品列表看起來不吵。
      - title:
          en: Typography
          zh: 字體
        description:
          en: >-
            A type scale that survives both a spec sheet on a desktop and a
            phone held one-handed in a school corridor.
          zh: 同一套字級，要撐得住桌機上的規格表，也要撐得住學校走廊上單手拿著的手機。
      - title:
          en: Spacing & Shape
          zh: 間距與造型
        description:
          en: >-
            A 4px spacing scale with fixed radius and elevation steps, so a new
            page cannot quietly invent its own rhythm.
          zh: 4px 為基準的間距階梯，加上固定的圓角與陰影層級，新的頁面沒辦法偷偷長出自己的節奏。
      - title:
          en: Components
          zh: 元件
        description:
          en: >-
            Buttons, inputs, badges and service cards specified with every
            state, so five business lines build from one kit.
          zh: 按鈕、輸入框、標籤與服務卡連狀態一起定義，五條業務線用同一套零件組出來。
    direction: vertical
  - type: flow
    eyebrow:
      en: FLOW
      zh: 流程
    heading:
      en: The inquiry path
      zh: 詢價這條路
    body:
      en: >-
        Most visits end in a question, not a checkout. The flow gets someone
        from landing to a sent inquiry without asking them to understand the
        company's internal structure first.
      zh: 大部分的造訪最後是一個問句，不是一筆結帳。這條流程要讓人從進站到送出詢價，中途不必先搞懂這家公司內部怎麼分工。
    steps:
      - label: Pick a store or service
        ratio: 3/4
        alt:
          en: New Formosa Sport flow — choosing a store or service line
          zh: 新台灣運動流程——選擇門市或服務項目
    direction: horizontal
  - type: experienceDemo
    layout: stacked
    eyebrow:
      en: EXPERIENCE DEMO
      zh: 體驗展示
    heading:
      en: The Quote Lives on the First Screen
      zh: 報價就放在第一個畫面
    body:
      en: >-
        No hunting for a contact page. The inquiry form sits beside the hero, so
        a visitor can say what they need and send it without scrolling away.
      zh: 不用去找聯絡我們。詢價表單就在 hero 旁邊，訪客把需求講清楚、送出，不必往下捲。
    ratio: 9/16
    alt:
      en: New Formosa Sport homepage with the free-quote form beside the hero
      zh: 新台灣運動首頁，免費報價表單就在 hero 旁邊
  - type: featureSplit
    heading:
      en: Automated Lead Pipeline
      zh: 自動化的詢價管道
    body:
      en: >-
        The inquiry form is wired to Netlify Forms — captured automatically,
        reviewed in real time, with access and notification routing handled by
        environment variables.
      zh: 詢價表單接到 Netlify Forms——自動收件、即時檢視，權限與通知路由都由環境變數控制。
    imagePosition: right
    ratio: 4/3
    alt:
      en: Inquiry form screenshot showing the automated lead pipeline
      zh: 詢價表單畫面，展示自動化的收件管道
  - type: featureSplit
    heading:
      en: Zero-Build Deployment
      zh: 免建置部署
    body:
      en: >-
        A static site with no build command, deployed straight from the
        repository. The client has no engineering team, so the site had to stay
        updatable without anyone standing by to run a pipeline.
      zh: 靜態網站、沒有 build 指令，直接從 repository 部署。客戶沒有工程團隊，所以網站必須在沒人守著跑流程的情況下也改得動。
    imagePosition: left
    ratio: 4/3
    alt:
      en: Deployment configuration screenshot
      zh: 部署設定畫面
  - type: featureSplit
    heading:
      en: Experience the Intuitive Flow
      zh: 走一遍就懂的動線
    body:
      en: How do five unrelated business lines share one site without competing?
      zh: 五條互不相干的業務線，要怎麼共用一個網站又不互相打架？
    imagePosition: right
    ratio: 4/3
    alt:
      en: Overview of the five business lines sharing one site
      zh: 五條業務線共用一個網站的總覽
  - type: featureSplit
    heading:
      en: Single Source of Truth
      zh: 單一事實來源
    body:
      en: >-
        Formosa Red and a deep navy were already the brand's colours; the work
        was turning them into a token set with fixed roles, so a new page cannot
        quietly invent a seventh shade of red.
      zh: Formosa Red 與深藍本來就是這家店的顏色；要做的是把它們變成角色固定的 token，讓新頁面沒辦法偷偷長出第七種紅。
    imagePosition: left
    ratio: 4/3
    alt:
      en: Color and typography system screenshot
      zh: 色彩與字體系統畫面
  - type: featureSplit
    heading:
      en: 'Built for the Corridor, Not the Desk'
      zh: 為走廊設計，不是為辦公桌
    body:
      en: >-
        The mobile path assumes someone standing in a school corridor with one
        hand full — larger targets, fewer steps, and a form that never asks for
        anything the person would not already know.
      zh: 手機這條路假設使用者正站在學校走廊、一隻手還拿著東西——點擊目標大一點、步驟少一點，表單也不會問任何他當下答不出來的事。
    imagePosition: right
    ratio: 3/4
    alt:
      en: Mobile inquiry flow screenshot
      zh: 手機詢價流程畫面
  - type: featureSplit
    heading:
      en: The System Holds at 375px
      zh: 這套系統在 375px 撐得住
    body:
      en: >-
        375px is the floor, not an afterthought. Every layout, form and product
        listing is checked at that width, so the smallest supported screen gets
        the whole site rather than a reduced one.
      zh: 375px 是下限，不是事後補的。每一個版面、表單與商品列表都在這個寬度下檢查過，最小的螢幕拿到的是完整的網站，不是縮水版。
    imagePosition: left
    ratio: 3/4
    alt:
      en: Mobile layout at 375px viewport
      zh: 375px 視窗下的手機版面
---

