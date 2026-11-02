---
title:
  en: New Formosa Sport — Sports Platform Website Design
  zh: 新寶島──運動用品平台網站設計
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
      zh: 新寶島──運動用品平台網站設計
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
    layout: carousel
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
    ctaLabel:
      en: Try it out
      zh: 來試試看
    ctaHref: 'https://new-formosa-sport.netlify.app/index.html#home'
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
  - type: dataViz
    eyebrow:
      en: USABILITY TEST
      zh: 可用性測試
    heading:
      en: >-
        Six people, four tasks, and whether customers can reach a sent inquiry
        on their own
      zh: 六個人、四個任務，看客人能不能自己走到送出詢價
    body:
      en: >-
        After launch I ran a moderated, think-aloud usability test on the live
        site. Six participants covered three customer groups (school buyers,
        team or cycling-club coaches, and general shoppers), two of each, split
        evenly between desktop and mobile. Each did four tasks, with T1,
        requesting a quote for team apparel, as the core conversion. The success
        criteria were set before testing: at least 5 of 6 completing T1 unaided,
        a median T1 time of 120 seconds or less, and an average SEQ of 5.5 or
        higher on every task.
      zh: >-
        網站上線後，我用正式站做了一輪主持式、放聲思考的可用性測試。六位受測者分成三種客群：學校採購、球隊或車隊教練、一般消費者，每種兩人，桌機和手機各半。每人做四個任務，T1「幫球隊詢價團體服」是核心轉換。成功標準在測試前就訂好：T1
        至少 5/6 人獨立完成、中位數時間不超過 120 秒，每個任務的 SEQ 平均至少 5.5。
    outcomes:
      independent:
        en: Unaided
        zh: 獨立完成
      assisted:
        en: With help
        zh: 需協助
      failed:
        en: Failed
        zh: 失敗
    participants:
      - id: P1
        label:
          en: school buyer · desktop
          zh: 學校採購・桌機
      - id: P2
        label:
          en: school buyer · mobile
          zh: 學校採購・手機
      - id: P3
        label:
          en: team coach · desktop
          zh: 球隊教練・桌機
      - id: P4
        label:
          en: team coach · mobile
          zh: 球隊教練・手機
      - id: P5
        label:
          en: general shopper · desktop
          zh: 一般消費者・桌機
      - id: P6
        label:
          en: general shopper · mobile
          zh: 一般消費者・手機
    charts:
      - kind: outcomeBars
        title:
          en: Task success
          zh: 任務成功率
        description:
          en: >-
            Five of six participants completed T1 unaided, meeting the 5-of-6
            target. The one who needed help was P2: on mobile, the homepage
            quote form sat below the first screen, and on the service page the
            quote button was only at the very bottom. In T2, P5 couldn't tell
            venue construction from facility planning and maintenance and also
            needed help. Everyone completed T3 and T4 unaided.
          zh: >-
            T1 有五位受測者獨立完成，達到 5/6 的目標。唯一需要協助的是
            P2：在手機上，首頁的報價表單落在第一屏以下，進到服務頁後，報價按鈕又只在頁面最下方。T2 的 P5
            分不清「運動場館工程」和「場地規劃與維修」，同樣需要協助。T3、T4 六個人都獨立完成。
        insight:
          en: >-
            The main path mostly works, and the trouble sits in two specific
            places: the quote entry is too far down on mobile, and "venue
            construction" and "facility planning and maintenance" sound too
            alike. Both were rated high severity. The fixes are a quote button
            on the first mobile screen that scrolls to the form, a quote button
            in the service-page hero, and a one-line subtitle under each venue
            service, with each page linking to the other.
          zh: >-
            主要路徑大致走得通，卡關集中在兩個具體的地方：手機版的報價入口位置太低，以及「運動場館工程」和「場地規劃與維修」兩個名稱太接近。這兩點都列為高嚴重度，對應的修正是在手機首屏加一顆直接捲到表單的報價按鈕、服務頁的
            Hero 也放報價按鈕，並在兩條場地服務的名稱下各加一行副標，兩頁互相連結。
        rowHeading:
          en: Task
          zh: 任務
        total: 6
        target:
          value: 5
          row: T1
          label:
            en: Target 5/6
            zh: 目標 5/6
        rows:
          - label: T1
            name: &ref_0
              en: Request a team-apparel quote
              zh: 幫球隊詢價團體服
            independent: 5
            assisted: 1
            failed: 0
          - label: T2
            name: &ref_1
              en: Check the service area
              zh: 確認服務範圍
            independent: 5
            assisted: 1
            failed: 0
          - label: T3
            name: &ref_2
              en: Contact without the form
              zh: 不填表，直接聯絡
            independent: 6
            assisted: 0
            failed: 0
          - label: T4
            name: &ref_3
              en: Understand a service
              zh: 看懂一項服務
            independent: 6
            assisted: 0
            failed: 0
      - kind: funnel
        title:
          en: T1 quote funnel
          zh: T1 詢價漏斗
        description:
          en: >-
            All six eventually sent an inquiry, five of them unaided. The only
            drop-off was at finding the quote entry: P2 couldn't find it on
            mobile and reached the form only after help. P3's "30 sets" was
            rejected by the quantity field; they changed it to a number
            themselves, so it doesn't count as a drop-off.
          zh: >-
            六個人最後都送出了詢價，獨立完成的有五位。唯一的流失點在「找到報價入口」：P2 在手機上找不到入口，協助之後才進到表單。P3
            在數量欄填了「30 套」被擋下，自己改成數字後通過，不算流失。
        insight:
          en: >-
            Drop-off happened only at finding the entry; once people reached the
            form, all six submitted it. The fix belongs at the entry, and the
            form itself needs little change. Opening the quote form from a
            service page pre-fills the service type, and nobody picked the wrong
            service this round. The quantity field accepting only digits without
            saying so is a low-severity issue, solved by showing the unit and an
            error message.
          zh: >-
            流失只發生在「找到入口」這一步，進到表單之後，六個人都順利送出。所以要改的是入口好不好找，表單本身不用大改。從服務頁按「立即免費報價」時服務類型會自動帶入，這次沒有人選錯服務。數量欄只接受數字卻沒有提示，屬於低嚴重度的小問題，加上單位「件」和錯誤訊息就能解決。
        rowHeading:
          en: Stage
          zh: 階段
        total: 6
        reachedLabel:
          en: Reached (including with help)
          zh: 最後有走到（含協助）
        independentLabel:
          en: Reached unaided
          zh: 獨立走到
        stages:
          - label:
              en: Started the task
              zh: 開始任務
            reached: 6
            independent: 6
          - label:
              en: Found the quote entry
              zh: 找到報價入口
            reached: 6
            independent: 5
            note:
              en: P2 couldn't find it on mobile; reached the form after help
              zh: P2 手機上找不到，協助後才進表單
          - label:
              en: Chose the right service
              zh: 選對服務類型
            reached: 6
            independent: 5
          - label:
              en: Filled in required fields
              zh: 填完必填欄位
            reached: 6
            independent: 5
            note:
              en: P3's quantity was rejected once; fixed it alone (not a drop-off)
              zh: P3 數量欄被擋一次，自行修正（不算流失）
          - label:
              en: Submitted
              zh: 送出成功
            reached: 6
            independent: 5
      - kind: dots
        title:
          en: Time on task
          zh: 任務完成時間
        description:
          en: >-
            T1's median was 100 seconds, inside the 120-second target; the
            slowest, 186 seconds, was P2, who needed help. T3 was fastest, with
            a median of 24 seconds, helped by tap-to-call on mobile. In T2, P5
            took 150 seconds, stuck between the two venue services.
          zh: >-
            T1 的中位數是 100 秒，在 120 秒的目標內；最慢的 186 秒就是需要協助的 P2。T3 最快，中位數 24
            秒，手機版的電話可以直接點撥。T2 的 P5 花了 150 秒，卡在兩條場地服務之間。
        insight:
          en: >-
            The time spread shows how much each problem costs. On T1, all three
            mobile participants (104, 118 and 186 seconds) were slower than all
            three desktop participants (72, 84 and 96 seconds), which matches
            the mobile entry problem in the success chart. T2's only long tail
            is P5 at 150 seconds, the participant who went back and forth
            between the two venue services. T3 took a median of just 24 seconds,
            and both mobile participants mentioned being able to tap the phone
            number to call.
          zh: >-
            時間分布把卡關的程度量化了。T1 的三位手機受測者（104、118、186 秒）都比三位桌機受測者（72、84、96
            秒）慢，和成功率那張圖指出的手機入口問題一致。T2 唯一的長尾是 P5 的 150 秒，正是在兩條場地服務之間來回的那一位。T3
            中位數只要 24 秒，兩位手機受測者都提到可以直接點撥電話。
        rowHeading:
          en: Task
          zh: 任務
        min: 0
        max: 210
        step: 30
        unit:
          en: s
          zh: ' 秒'
        axisLabel:
          en: seconds
          zh: 秒
        summary: median
        summaryLabel:
          en: Median
          zh: 中位數
        rangeLabel:
          en: Fastest to slowest
          zh: 最快到最慢
        reference:
          value: 120
          row: T1
          label:
            en: T1 target 120s
            zh: T1 目標 120 秒
        rows:
          - label: T1
            name: *ref_0
            points:
              - who: P1
                value: 84
                outcome: independent
              - who: P2
                value: 186
                outcome: assisted
              - who: P3
                value: 72
                outcome: independent
              - who: P4
                value: 118
                outcome: independent
              - who: P5
                value: 96
                outcome: independent
              - who: P6
                value: 104
                outcome: independent
          - label: T2
            name: *ref_1
            points:
              - who: P1
                value: 70
                outcome: independent
              - who: P2
                value: 95
                outcome: independent
              - who: P3
                value: 64
                outcome: independent
              - who: P4
                value: 88
                outcome: independent
              - who: P5
                value: 150
                outcome: assisted
              - who: P6
                value: 80
                outcome: independent
          - label: T3
            name: *ref_2
            points:
              - who: P1
                value: 22
                outcome: independent
              - who: P2
                value: 18
                outcome: independent
              - who: P3
                value: 25
                outcome: independent
              - who: P4
                value: 20
                outcome: independent
              - who: P5
                value: 30
                outcome: independent
              - who: P6
                value: 35
                outcome: independent
          - label: T4
            name: *ref_3
            points:
              - who: P1
                value: 48
                outcome: independent
              - who: P2
                value: 60
                outcome: independent
              - who: P3
                value: 40
                outcome: independent
              - who: P4
                value: 55
                outcome: independent
              - who: P5
                value: 75
                outcome: independent
              - who: P6
                value: 58
                outcome: independent
      - kind: dots
        title:
          en: SEQ scores
          zh: SEQ 分數
        description:
          en: >-
            SEQ is one question asked after each task: "Overall, how easy was
            this task?", from 1 (very difficult) to 7 (very easy). T2 averaged
            4.8, the only task below 5.5: three participants clicked the wrong
            service or went back and forth between venue construction and
            facility planning. The other three tasks all averaged 5.8 or higher.
          zh: >-
            SEQ 是每個任務做完後問的一題：「整體來說，這題有多容易？」1 是非常困難，7 是非常容易。T2 平均 4.8，是唯一低於 5.5
            的任務：三個人在「運動場館工程」和「場地規劃與維修」之間點錯或來回。其他三個任務的平均都在 5.8 以上。
        insight:
          en: >-
            SEQ shows what the success rate hides. Everyone completed T2, yet it
            averaged only 4.8: P5 gave it a 3, and four of the other five gave
            it a 5, so getting through took effort. That is why the T2 naming
            problem ranks near the top of the fix list even though nobody failed
            the task.
          zh: >-
            成功率看不出來的地方，SEQ 補上了。T2 六個人都完成，平均卻只有 4.8：P5 給了 3 分，其他五人裡有四位給 5
            分，過程並不輕鬆。這也是為什麼 T2 的名稱問題排在修正清單前面，即使它沒有讓任何人失敗。
        rowHeading:
          en: Task
          zh: 任務
        min: 1
        max: 7
        step: 1
        unit:
          en: ' / 7'
          zh: ' 分'
        axisLabel:
          en: score
          zh: 分數
        summary: mean
        summaryLabel:
          en: Average
          zh: 平均
        reference:
          value: 5.5
          label:
            en: Reference 5.5
            zh: 參考線 5.5
        rows:
          - label: T1
            name: *ref_0
            points:
              - who: P1
                value: 6
              - who: P2
                value: 4
              - who: P3
                value: 7
              - who: P4
                value: 6
              - who: P5
                value: 6
              - who: P6
                value: 6
          - label: T2
            name: *ref_1
            points:
              - who: P1
                value: 5
              - who: P2
                value: 5
              - who: P3
                value: 6
              - who: P4
                value: 5
              - who: P5
                value: 3
              - who: P6
                value: 5
          - label: T3
            name: *ref_2
            points:
              - who: P1
                value: 7
              - who: P2
                value: 7
              - who: P3
                value: 6
              - who: P4
                value: 7
              - who: P5
                value: 6
              - who: P6
                value: 5
          - label: T4
            name: *ref_3
            points:
              - who: P1
                value: 6
              - who: P2
                value: 6
              - who: P3
                value: 7
              - who: P4
                value: 6
              - who: P5
                value: 5
              - who: P6
                value: 6
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

