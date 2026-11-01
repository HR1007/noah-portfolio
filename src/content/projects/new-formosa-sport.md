---
title:
  en: New Formosa Sport — Sports Platform Website Design
  zh: 新寶島——運動用品平台網站設計
order: 3
summary:
  en: >-
    A website, design system and inquiry pipeline for a long-established
    sporting goods business in Tainan, built so information is easy to find, the
    pages look good, and the staff can maintain it after I leave.
  zh: 替台南一家老字號運動用品店做的網站、設計系統和詢價管道。目標是讓資訊好找、畫面好看，我離開後店裡的人也能自己維護。
hero:
  ctaLabel:
    en: Try it out
    zh: 實際試試
  ctaHref: 'https://new-formosa-sport.netlify.app/index.html#home'
sections:
  - type: textSection
    eyebrow:
      en: ORIGIN & INSPIRATION
      zh: 起點與靈感
    heading:
      en: New Formosa Sport — Sports Platform Website Design
      zh: 新寶島——運動用品平台網站設計
    paragraphs:
      - en: >-
          New Formosa Sport is a long-established sporting goods business in
          Rende, Tainan. It runs five lines at once: sporting goods retail,
          venue construction, team apparel, facility planning and maintenance,
          and equipment servicing, mostly for local schools and cycling teams.
          The obvious response to the brief was to build a website. A closer
          look showed the business needed a system: one design language, a site
          that could launch quickly, an inquiry pipeline that runs on its own,
          and a workflow the staff could keep using after I stopped working on
          the files.
        zh: >-
          新寶島是台南仁德的老字號運動用品店，同時經營五條業務線：運動用品零售、場館工程、團體服訂製、場地規劃與維修，以及器材保養維修，客人多半是在地的學校和車隊。這種案子最直接的做法是做一個網站，但實際了解之後，這家店需要的是一套系統：統一的設計語言、能快速上線的網站、自動運作的詢價管道，以及我不再經手之後，店裡的人仍然能繼續使用的流程。
  - type: deviceShowcase
    ratio: 16/10
    alt:
      en: New Formosa Sport website homepage screenshot
      zh: 新寶島網站首頁畫面
  - type: persona
    eyebrow:
      en: PERSONA
      zh: 人物誌
    heading:
      en: New Formosa Sport — Persona
      zh: 新寶島 — 人物誌
    personas:
      - name: School equipment buyer
        ratio: 3/4
        alt:
          en: New Formosa Sport persona board
          zh: 新寶島人物誌看板
  - type: designThemes
    eyebrow:
      en: DESIGN THEMES
      zh: 設計主軸
    heading:
      en: >-
        Five business lines share one design language, so the site reads as a
        single shop.
      zh: 五條業務線共用一套設計語言，讓網站看起來是同一家店。
    themes:
      - title:
          en: Colour
          zh: 色彩
        description:
          en: >-
            Formosa Red and a deep navy were already the shop's colours. Red is
            the main brand colour, and navy keeps long, dense product listings
            calm. I turned both into tokens with fixed roles, so a new page
            cannot introduce another shade of red.
          zh: >-
            Formosa Red
            和深藍原本就是這家店的顏色。紅色作為品牌主色，深藍用在又長又密的商品列表上，讓畫面比較沉穩。我把這兩個顏色整理成角色固定的
            token，新頁面就不會再多出其他紅色。
      - title:
          en: Typography
          zh: 字體
        description:
          en: >-
            One type scale has to work for a dense spec sheet on a desktop and
            for a phone used one-handed in a school corridor.
          zh: 同一套字級要同時適用於桌機上密密麻麻的規格表，以及學校走廊上單手操作的手機。
      - title:
          en: Spacing & Shape
          zh: 間距與造型
        description:
          en: >-
            Spacing follows a 4px scale, and radius and elevation have fixed
            steps, so a new page cannot introduce spacing of its own.
          zh: 間距以 4px 為一階，圓角和陰影也有固定的層級，新頁面不會出現自訂的間距。
      - title:
          en: Components
          zh: 元件
        description:
          en: >-
            Buttons, inputs, badges and service cards are specified in every
            state, and all five business lines use the same components.
          zh: 按鈕、輸入框、標籤和服務卡的每一種狀態都事先定義好，五條業務線使用同一套元件。
    direction: vertical
    layout: stacked
  - type: flow
    eyebrow:
      en: FLOW
      zh: 流程
    heading:
      en: The inquiry path
      zh: 詢價這條路
    body:
      en: >-
        Most visitors come to ask for a quote. The flow takes them from landing
        to a sent inquiry without requiring them to understand how the company
        is organised.
      zh: 多數訪客來網站是為了詢價。這條流程讓人從進站一路走到送出詢價，過程中不需要先了解公司內部怎麼分工。
    steps:
      - label: Inquiry flow
        ratio: 1280/849
        alt:
          en: >-
            New Formosa Sport inquiry flow — six screens from landing to a sent
            inquiry, with four branches off the main path
          zh: 新寶島詢價動線——從進站到送出詢價的六個畫面，加上四條從主線岔出去的分支
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
        The inquiry form sits right beside the homepage hero, so visitors don't
        have to look for a contact page. They can describe what they need and
        send it without scrolling.
      zh: 詢價表單直接放在首頁 hero 旁邊，訪客不必另外找聯絡頁面，填完需求就能送出，不用往下捲。
    ratio: 16/10
    alt:
      en: New Formosa Sport homepage with the free-quote form beside the hero
      zh: 新寶島首頁，免費報價表單就在 hero 旁邊
    ctaLabel:
      en: Try it out
      zh: 來試試看
    ctaHref: 'https://new-formosa-sport.netlify.app/index.html#home'
  - type: featureSplit
    heading:
      en: Automated Lead Pipeline
      zh: 自動化的詢價管道
    body:
      en: >-
        The inquiry form connects to Netlify Forms. Leads are collected
        automatically and can be checked at any time, and environment variables
        control who can see them and where notifications go.
      zh: 詢價表單接上 Netlify Forms，需求會自動收件，隨時都能查看；誰能看到資料、通知寄給誰，都由環境變數設定。
    imagePosition: right
    ratio: 3/4
    alt:
      en: Quote form confirmation screen after an inquiry is sent
      zh: 詢價送出後的「已收到您的需求」確認畫面
  - type: featureSplit
    heading:
      en: Zero-Build Deployment
      zh: 免建置部署
    body:
      en: >-
        The site is static, with no build step, and deploys straight from the
        repository. The client has no engineering team, so the site had to stay
        editable without anyone maintaining a build pipeline.
      zh: 網站是靜態網站，沒有 build 指令，直接從 repository 部署。客戶沒有工程團隊，所以網站必須在沒有人維護部署流程的情況下也能修改。
    imagePosition: left
    ratio: 3/4
    alt:
      en: Sporting goods retail service page on the live site
      zh: 正式站上的運動用品零售服務頁
    ctaLabel:
      en: Try it out
      zh: 來試試看
    ctaHref: 'https://new-formosa-sport.netlify.app/index.html#home'
  - type: featureSplit
    heading:
      en: 'Five Lines, One Site'
      zh: 五條線，一個網站
    body:
      en: >-
        Five unrelated business lines have to share one site without competing
        for space. The homepage sets them side by side in a services overview,
        each with its own entry point, and anyone unsure which one they need can
        go straight to a consultation.
      zh: 五條彼此不相關的業務線要放在同一個網站上，又不能互相搶版面。首頁用服務總覽把五條線並排，各有自己的入口，不確定需要哪一項的人，可以直接走諮詢。
    imagePosition: right
    ratio: 3/4
    alt:
      en: Overview of the five business lines sharing one site
      zh: 五條業務線共用一個網站的總覽
    ctaLabel:
      en: Try it out
      zh: 來試試看
    ctaHref: 'https://new-formosa-sport.netlify.app/index.html#home'
  - type: featureSplit
    heading:
      en: 'Built for the Corridor, Not the Desk'
      zh: 為走廊而設計，不只是辦公桌
    body:
      en: >-
        The mobile version assumes someone standing in a school corridor with
        one hand full. Tap targets are larger, there are fewer steps, and the
        form never asks for anything they wouldn't already know.
      zh: 手機版假設使用者站在學校走廊上，一隻手還拿著東西。所以點擊範圍加大、步驟減少，表單也不會問當下答不出來的問題。
    imagePosition: right
    ratio: 3/4
    alt:
      en: Mobile inquiry flow screenshot
      zh: 手機詢價流程畫面
    ctaLabel:
      en: Try it out
      zh: 來試試看
    ctaHref: 'https://new-formosa-sport.netlify.app/index.html#home'
  - type: featureSplit
    heading:
      en: The System Holds at 375px
      zh: 這套系統在 375px 撐得住
    body:
      en: >-
        375px is the minimum supported width and was part of the design from the
        start. Every layout, form and product listing was checked at that width,
        so small screens get the full site.
      zh: 375px 是最小支援寬度，從一開始就納入設計。每個版面、表單和商品列表都在這個寬度下檢查過，小螢幕也能使用完整的網站。
    imagePosition: left
    ratio: 3/4
    alt:
      en: Mobile layout at 375px viewport
      zh: 375px 視窗下的手機版面
    ctaLabel:
      en: Try it out
      zh: 來試試看
    ctaHref: 'https://new-formosa-sport.netlify.app/index.html#home'
---

