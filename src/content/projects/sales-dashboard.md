---
title:
  en: A sales war room for a regional manager
  zh: 給區域銷售主管的銷售戰情室
order: 1
summary:
  en: >-
    An internship dashboard, rebuilt as a design system. The point was never
    turning data into charts — it's the path from spotting a problem to
    assigning the follow-up.
  zh: 把實習時建的銷售儀表板重新設計成一套系統。重點從來不是把資料變成圖表，而是從發現問題走到指派跟進。
hero:
  ctaLabel:
    en: Open the Figma prototype
    zh: 打開 Figma Prototype
  # [需確認] 待貼上 Figma prototype 的分享連結（Share → Copy link，權限設成「知道連結的人可檢視」）
  ctaHref: '#'
  gradient: slate
sections:
  - type: textSection
    eyebrow:
      en: ORIGIN
      zh: 起點
    heading:
      en: It started as a Power BI report
      zh: 從一份 Power BI 報表開始
    paragraphs:
      - en: >-
          During my internship I built a sales dashboard for a cloud-office SaaS
          company: filter by year and month, look at regions and
          counties, rank the hot products and the top clerks. It answered "what
          is the number right now" but never "so what should I do next". This
          case is that same analytical structure, redesigned from the ground up.
          The company, the real figures and the product names are all confidential,
          so everything here is anonymised and fabricated — but every number ties
          out against the others.
        zh: >-
          實習時我為某家雲端辦公 SaaS 公司建了一份銷售儀表板：篩年月、看地區與縣市、排出熱銷品與業績最好的業務員。它能回答「現在數字多少」，卻回答不了「所以我現在該做什麼」。這個案子是把同一套分析架構重新設計一次——公司、實際數據與產品名稱皆保密，這裡全部匿名並換成虛構資料，但每個數字都彼此對得起來。
      - en: >-
          The original was a neon-purple template: wave backgrounds, ribbon
          cards, a scatter plot, a donut. It looked full. But a regional manager
          opening it on Monday morning still had to hunt across ten charts to
          work out which region was in trouble — and then leave the dashboard
          entirely to do anything about it.
        zh: >-
          原版是深紫霓虹的模板：波浪背景、緞帶卡片、散點圖、甜甜圈。畫面看起來很滿。但區域主管週一早上打開它，還是得自己在十張圖裡找出哪一區出事——找到之後，也得離開這個畫面才能處理。
  - type: persona
    eyebrow:
      en: PERSONA
      zh: 使用者輪廓
    heading:
      en: Who opens this ten times a day
      zh: 一天會打開這個畫面十次的人
    personas:
      - name: Chien-chung Lin
        ratio: 3/4
        alt:
          en: >-
            Persona — Chien-chung Lin, regional sales manager covering four
            counties in central Taiwan
          zh: 使用者輪廓——林建中，負責中部四縣市的區域銷售主管
  - type: deviceShowcase
    eyebrow:
      en: THE SCREEN
      zh: 主畫面
    heading:
      en: One screen, three levels
      zh: 一個畫面，三層資訊
    ratio: 16/10
    alt:
      en: Sales war room overview in the light theme
      zh: 銷售戰情室總覽（亮色主題）
  - type: researchFramework
    eyebrow:
      en: FRAMEWORK
      zh: 架構
    heading:
      en: Seven principles, turned into rules you can check
      zh: 七個原則，變成可以逐條檢查的硬規則
    layout: split
    paragraphs:
      - en: >-
          Hierarchy, KPI selection, the right chart for the data, filters,
          visual clarity, context, feedback. All seven sound obviously correct —
          which is exactly why they get ignored. So each became a rule the
          design system can be checked against: at most nine blocks on a screen,
          every number carries a unit and a comparison baseline, a semantic
          colour means one thing and only one thing, and all four data states
          have their own screen.
        zh: >-
          資訊層級、KPI 選擇、圖表適配、篩選互動、視覺清楚、數據脈絡、操作回饋——這七件事聽起來都對，也正因為都對而最容易被跳過。所以我把每一條都變成可以拿來檢查的規則：一個畫面最多九塊、每個數字都要有單位與比較基準、一個語意色只有一種意思、四種資料狀態各自有畫面。
      - en: >-
          Three breakpoints only — 375, 768, 1200 — because there are three real
          situations: at the desk seeing everything, in a meeting with a tablet,
          standing outside a client's door checking one number. When space runs
          out, legends and decoration go first; the hierarchy goes last. Unit,
          period and baseline are never dropped at any width.
        zh: >-
          斷點只有三個：375、768、1200，對應三種真實情境——在辦公桌前看全貌、開會帶平板、站在客戶門口查一個數字。空間變小時先砍圖例與裝飾，最後才動資訊層級；單位、期間與比較基準在任何寬度都不刪。
    ratio: 4/3
    alt:
      en: Responsive and auto layout specification page
      zh: 響應式與 auto layout 規格頁
  - type: designThemes
    eyebrow:
      en: DESIGN SYSTEM
      zh: 設計系統
    heading:
      en: >-
        Colour, components, and the screens that interrupt you — each with its
        own set of rules
      zh: 顏色、元件，以及會打斷使用者的畫面，各自有一套規則
    themes:
      - title:
          en: Colour & meaning
          zh: 色彩與語意
        description:
          en: >-
            The base and accent come straight from the client's own brand:
            charcoal from the site navigation, orange from the product
            wordmark. Orange is reserved for the interface — logo, primary
            button, selected nav, current month. Charts get a separate
            five-colour palette, because red, amber and green are already spoken
            for by "declining", "needs attention" and "growing".
          zh: >-
            底色與強調色直接取自客戶品牌：炭灰來自官網導覽，橘來自產品字標。橘色只管介面——logo、主按鈕、側欄選取、目前月份。圖表另外給一組五色，因為紅、黃、綠已經被「衰退、需注意、成長」徵用了。
      - title:
          en: Components & naming
          zh: 元件與命名
        description:
          en: >-
            Three-part names — category / component / variant — across nine
            categories that each own one job. The Figma component name is the
            front-end component name; there is only one source of truth. Every
            component is defined together with the states it actually ships
            with: loading, empty, stale, failed.
          zh: >-
            三段式命名「類別 / 元件 /
            變體」，九個類別各管一件事。Figma 的元件名就是前端的 component
            名，兩邊只有一份真相。每個元件都連它真正會用到的狀態一起定義：載入中、沒有資料、資料延遲、載入失敗。
      - title:
          en: Screens that interrupt
          zh: 會打斷人的畫面
        description:
          en: >-
            Seven dialogs and three toasts. The title is the question itself,
            destructive actions are red and never the default focus, and the
            scope is stated before you commit — how many rows, how many people,
            when it takes effect. Reversible things don't ask; they just happen,
            with an undo.
          zh: >-
            七種對話框、三種 toast。標題就是問題本身，破壞性動作用紅色而且永遠不是預設焦點，按下去之前先說清楚範圍：匯出幾筆、影響幾人、什麼時候生效。可逆的事不問，直接做，然後給「復原」。
    direction: vertical
  - type: flow
    eyebrow:
      en: FLOW
      zh: 動線
    heading:
      en: A day's path — open it and the problem is already there
      zh: 一天的動線：打開就看到問題，關掉之前指派完
    body:
      en: >-
        Five screens on the main line, three branches peeling off the middle.
        Every thumbnail is an actual screen exported from the design file, not a
        redrawn placeholder box.
      zh: 五張畫面串成主線，三條分支從中間岔出去。所有縮圖都是設計檔裡實際完成的畫面匯出，不是重畫的示意框。
    steps:
      - label: Operation flow
        ratio: 16/10
        alt:
          en: Operation flow from login to assigning a follow-up
          zh: 從登入到指派跟進的操作動線
    direction: horizontal
  - type: experienceDemo
    eyebrow:
      en: THE MOMENT
      zh: 收斂點
    heading:
      en: The whole system exists for this one click
      zh: 整個系統只為了這一下
    body:
      en: >-
        The insight card at the top of the overview says it outright: Central
        region at 77.7%, under 85% for two months running — with the cause and
        the size of the gap attached. Hit "assign follow-up" and the dialog asks
        three things: owner, due date, note. That becomes a row on the
        follow-ups page. Between seeing the problem and acting on it there is no
        second system, no meeting, no separate email.
      zh: >-
        總覽最上方的洞察卡直接把話講完：中區達成率 77.7%，連續兩個月低於
        85%，附上原因與缺口金額。按下「指派跟進」，對話框只問三件事：負責人、到期日、備註。按下去它就變成跟進任務頁的一列。從看到問題到採取行動，中間不換系統、不開會、不用另外寄信。
    ratio: 16/10
    alt:
      en: The assign follow-up dialog over the overview screen
      zh: 指派跟進對話框疊在總覽畫面上
    layout: stacked
  - type: featureSplit
    eyebrow:
      en: DATA LINEAGE
      zh: 資料來源
    heading:
      en: Who decided that insight card should appear?
      zh: 那張洞察卡是誰決定要出現的
    body:
      en: >-
        Tasks can't come from nowhere. The rules page closes the chain: sync at
        00:10, evaluate every rule at 01:00, a hit produces the insight card, the
        manager assigns it, the task writes its outcome back. A rule is built
        from four fields — metric, operator, threshold, consecutive periods — and
        can't be saved without a backtest first. Fewer than three hits in twelve
        months means the threshold is too loose to catch anything; more than
        eight means it's noisy and managers start ignoring it.
      zh: >-
        任務不能憑空出現。規則頁把鏈路補完：每日 00:10 同步、01:00
        逐條評估、命中就產生洞察卡、主管指派後變成任務、完成後回寫命中紀錄。規則用「指標 ＋ 運算子 ＋ 門檻 ＋
        連續期數」四格組成，而且不跑回測就不能存檔——過去 12 個月會叫幾次要先看清楚。低於 3 次代表門檻太鬆抓不到問題，高於 8
        次代表太吵，主管會開始無視。
    imagePosition: right
    ratio: 4/3
    alt:
      en: Insight rules page with condition builder and backtest
      zh: 洞察規則頁，含條件建構器與回測
  - type: featureGrid
    eyebrow:
      en: SUPPORTING PAGES
      zh: 支撐頁面
    heading:
      en: Three pages holding the main line up
      zh: 三個把主線撐起來的頁面
    columns:
      - heading:
          en: Transactions
          zh: 交易明細
        body:
          en: >-
            Drill from a regional gap all the way down to a single order, with a
            breadcrumb that remembers where you came from. Filters stay visible
            on screen, and an export carries exactly the same conditions.
          zh: 從總覽的區域缺口一路下鑽到單筆訂單，麵包屑記得你從哪裡來。篩選條件永遠顯示在畫面上，匯出時帶著同一組條件走。
        ratio: 4/3
        alt:
          en: Transaction detail page
          zh: 交易明細頁
      - heading:
          en: Report builder
          zh: 建立報表
        body:
          en: >-
            Starts from the filters you already have. Seven content blocks to
            tick, each labelled with the pages it will add. Once scheduled, the
            system emails a preview to you first — nothing reaches a recipient
            before you confirm.
          zh: 直接帶入你目前的篩選。七個內容區塊可勾選，每個都標了會多幾頁。排程建立後系統先寄一份預覽給你自己，你確認之前不會發給任何收件人。
        ratio: 4/3
        alt:
          en: Report builder with live preview
          zh: 建立報表頁，右側為即時預覽
      - heading:
          en: Follow-ups
          zh: 跟進任務
        body:
          en: >-
            Each task carries its source, owner and due date, and says whether a
            rule created it or a person did. Closing it writes back to the rule,
            which is what makes threshold tuning possible at all.
          zh: 每件任務都帶著來源、負責人與到期日，並標明是規則命中還是有人手動建立。結案後回寫到規則，這正是之後能調門檻的依據。
        ratio: 4/3
        alt:
          en: Follow-up tasks page
          zh: 跟進任務頁
    direction: horizontal
  - type: imageRow
    eyebrow:
      en: RESPONSIVE
      zh: 三個斷點
    heading:
      en: On a phone the three levels just stack into one column
      zh: 手機只是把三層疊成一欄
    images:
      - ratio: 3/4
        alt:
          en: Mobile at 375 — bottom tab bar, KPIs two by two, table becomes cards
          zh: 手機 375：底部五分頁、KPI 二乘二、表格改成卡片列
      - ratio: 16/9
        alt:
          en: Tablet at 768 — icon rail and two columns
          zh: 平板 768：72px 圖示導覽軌與兩欄
      - ratio: 16/9
        alt:
          en: Desktop at 1200 and up — full sidebar and four columns
          zh: 桌機 1200 以上：完整側欄與四欄
    direction: horizontal
  - type: featureSplit
    eyebrow:
      en: HANDOFF
      zh: 交付
    heading:
      en: What gets handed over isn't a picture — it's a spec you can build from
      zh: 交出去的不是圖，是一份可以照著做的規格
    body:
      en: >-
        The core containers are rebuilt as real auto layout: direction, gap,
        padding and resizing behaviour all set, so adding content reflows instead
        of breaking. Spacing only ever comes from seven steps — 4, 8, 12, 16, 24,
        32, 40 — so no 13 or 18 ever appears. Fifty-two screens, two themes,
        three breakpoints, and a naming convention that matches the front end, so
        whoever picks this up knows what to call the next component without
        asking me.
      zh: >-
        核心容器用原生 auto layout
        重建：方向、間距、內距與縮放行為都設好，加內容時版面會自己重排而不是散掉。間距只取 4、8、12、16、24、32、40
        這七階，所以不會冒出 13 或 18。整份檔案 52
        張畫面、兩套主題、三個斷點，命名規則與前端對齊——接手的人不用問我，就知道下一個元件該叫什麼。
    imagePosition: left
    ratio: 4/3
    alt:
      en: Core components rebuilt with real auto layout
      zh: 用原生 auto layout 重建的核心元件
---
