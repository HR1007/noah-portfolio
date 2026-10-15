---
title:
  en: Signal & Action
  zh: 訊號與行動
order: 1
summary:
  en: >-
    An internship dashboard, rebuilt as a design system. The point was never
    turning data into charts. It was the path from spotting a problem to
    assigning someone to follow it up.
  zh: 把實習時做的銷售儀表板，重新設計成一套系統。說到底，重點從來不是把資料畫成圖表，而是讓人從發現問題，一路走到把跟進指派出去。
hero:
  ctaLabel:
    en: Try it out
    zh: 實際試試
  ctaHref: 'https://hr1007.github.io/Sales-War-Room/'
sections:
  - type: textSection
    eyebrow:
      en: ORIGIN & INSPIRATION
      zh: 起點與靈感
    heading:
      en: It started as a Power BI report
      zh: 從一份 Power BI 報表開始
    paragraphs:
      - en: >-
          During my internship I built a sales dashboard for a cloud-office SaaS
          company: filter by year and month, look at regions and counties, rank
          the best-selling products and the top sales reps. It could tell you
          "what's the number right now", but never "so what do I do next". This
          case takes that same analytical structure and redesigns it from the
          ground up. The company, the real figures and the product names are all
          confidential, so everything here is anonymised and the data is made
          up.
        zh: >-
          實習的時候，我替一家雲端辦公 SaaS
          公司做了一份銷售儀表板：可以篩年月、看地區和縣市，也能排出熱銷品和業績最好的業務員。它答得出「現在數字是多少」，卻答不出「那我現在該做什麼」。這個案子，就是把同一套分析架構從頭重新設計一次。公司、實際數據和產品名稱都要保密，所以這裡全部匿名，數字也都換成虛構的。
      - en: >-
          The original used a dark purple neon template: gradient backgrounds,
          card layouts, and a scatter plot, bar charts and pie charts packed in.
          It looked full. But a regional manager opening it on Monday morning
          still had to dig through ten charts to work out which region was in
          trouble. And once they found it, they had to leave the dashboard,
          switch to other tools, and message each sales rep one by one.
        zh: >-
          原版用的是深紫霓虹的模板，漸層背景、卡片式排列，再塞進散點圖、長條圖、圓餅圖，畫面看起來滿滿的。可是區域主管週一早上打開它，還是得自己在十張圖裡翻出哪一區出了問題。好不容易找到了，又得離開這個畫面，換到別的工具，一個一個去通知業務。
  - type: persona
    eyebrow:
      en: PERSONA
      zh: 人物誌
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
          zh: 人物誌——林建中，負責中部四縣市的區域銷售主管
  - type: deviceShowcase
    eyebrow:
      en: THE SCREEN
      zh: 主畫面
    heading:
      en: 'One screen, three levels'
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
      en: 'Seven principles, turned into rules you can check'
      zh: 七個原則，變成可以逐條檢查的硬規則
    layout: stacked
    paragraphs:
      - en: >-
          Hierarchy, KPI selection, the right chart for the data, filters,
          visual clarity, context, feedback. All seven sound obviously right,
          which is exactly why they get skipped. So I turned each into a rule
          the design system can be checked against: at most nine blocks on a
          screen, every number carries a unit and a comparison baseline, each
          semantic colour means one thing only, and all four data states get
          their own screen.
        zh: >-
          資訊層級、KPI
          選擇、圖表適配、篩選互動、視覺清楚、數據脈絡、操作回饋。這七件事聽起來都很對，偏偏正因為太理所當然，最常被跳過。所以我把每一條都改寫成能拿來檢查的規則：一個畫面最多九塊、每個數字都要帶單位和比較基準、一個語意色只能有一種意思、四種資料狀態各有各的畫面。
      - en: >-
          Three breakpoints only — 375, 768, 1200 — because there are three real
          situations: at the desk seeing everything, in a meeting with a tablet,
          standing outside a client's door checking one number. When space runs
          out, legends and decoration go first; the hierarchy goes last. Unit,
          period and baseline are never dropped at any width.
        zh: >-
          斷點只設三個：375、768、1200，因為真實情境也就這三種：坐在辦公桌前看全貌、開會時拿平板、站在客戶門口查一個數字。空間不夠時，先砍圖例和裝飾，資訊層級留到最後才動；至於單位、期間和比較基準，不管多窄都不刪。
    ratio: 4/3
    alt:
      en: Responsive and auto layout specification page
      zh: 響應式與 auto layout 規格頁
  - type: designThemes
    layout: split
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
            charcoal from the site navigation, orange from the product wordmark.
            Orange is reserved for the interface — logo, primary button,
            selected nav, current month. Charts get a separate five-colour
            palette, because red, amber and green are already spoken for by
            "declining", "needs attention" and "growing".
          zh: >-
            底色和強調色都直接取自客戶的品牌：炭灰來自官網導覽列，橘色來自產品字標。橘色只留給介面用，像
            logo、主按鈕、側欄選取狀態和目前月份。圖表另外配一組五色，因為紅、黃、綠早就被「衰退、需注意、成長」占走了。
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
            命名分三段：「類別 / 元件 / 變體」，九個類別各管一件事。Figma 裡的元件名就是前端的 component
            名，兩邊只認同一份真相。每個元件都連同它上線後真的會遇到的狀態一起定義：載入中、沒有資料、資料延遲、載入失敗。
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
            七種對話框、三種
            toast。標題就是問題本身，破壞性動作用紅色而且永遠不是預設焦點，按下去之前先說清楚範圍：匯出幾筆、影響幾人、什麼時候生效。可逆的事不問，直接做，然後給「復原」。
    direction: vertical
  - type: experienceDemo
    layout: stacked
    eyebrow:
      en: BRAND
      zh: 品牌
    heading:
      en: A mark that says what the product does
      zh: 讓標誌直接說出這個產品在做什麼
    body:
      en: >-
        The original mark was a bullseye — it said "aim" but never said at what.
        I explored four directions that all keep the orange rounded square and
        put a screen inside it, and picked B: a rising line on a monitor that
        ends in a red dot. The screen is the war room, the line is the trend,
        and the dot is the one anomaly the insight card wants you to look at.
        The orange is the same accent the interface uses, and below 20px the
        strokes thicken so it still reads in the sidebar and a browser tab.
      zh: >-
        原本的標誌是個靶心，說了「瞄準」，卻沒說瞄準什麼。我試了四個方向，每個都保留橘色圓角方塊，再往裡面放一台螢幕，最後選了
        B：螢幕裡一條往上爬的折線，終點是一個紅點。螢幕是戰情室，折線是趨勢，紅點就是洞察卡要你多看一眼的那個異常。底座的橘和介面強調色是同一個橘；縮到
        20px 以下，線條會自動加粗，放在側欄或瀏覽器分頁上也認得出來。
    ratio: 101/36
    alt:
      en: >-
        Logo redesign board — four computer-themed directions, each shown at
        160, 44 and 30 px and on dark and light headers
      zh: 標誌重新設計提案——四個電腦主題方向，各自展示 160、44、30 px 三種尺寸與深淺兩種頁首
  - type: flow
    uniform: true
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
      zh: 主線五張畫面，三條分支從中段岔出去。每張縮圖都是從設計檔匯出的實際畫面，不是另外重畫的示意框。
    steps:
      - label: Operation flow
        ratio: 16/9
        alt:
          en: Operation flow from login to assigning a follow-up
          zh: 從登入到指派跟進的操作動線
      - label: Mobile flow
        ratio: 16/9
        alt:
          en: Mobile flow from push notification to closing a follow-up task
          zh: 從推播通知到結案跟進任務的手機動線
    direction: vertical
  - type: experienceDemo
    layout: split
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
        總覽最上方的洞察卡把話直接講完：中區達成率 77.7%，已經連續兩個月低於
        85%，原因和缺口金額也一起附上。按下「指派跟進」，對話框只問三件事：負責人、到期日、備註。送出後，它就成了跟進任務頁上的一列。從看到問題到動手處理，中間不必換系統、不必開會，也不用另外寄信。
    ratio: 16/10
    alt:
      en: The assign follow-up dialog over the overview screen
      zh: 指派跟進對話框疊在總覽畫面上
  - type: featureSplit
    eyebrow:
      en: DATA LINEAGE
      zh: 資料來源
    heading:
      en: Who decided that insight card should appear?
      zh: 那張洞察卡，是誰決定要出現的？
    body:
      en: >-
        Tasks can't come from nowhere. The rules page closes the chain: sync at
        00:10, evaluate every rule at 01:00, a hit produces the insight card,
        the manager assigns it, the task writes its outcome back. A rule is
        built from four fields — metric, operator, threshold, consecutive
        periods — and can't be saved without a backtest first. Fewer than three
        hits in twelve months means the threshold is too loose to catch
        anything; more than eight means it's noisy and managers start ignoring
        it.
      zh: >-
        任務不能憑空冒出來。規則頁把整條鏈補齊：每天 00:10 同步、01:00
        逐條評估，命中就產生洞察卡，主管指派後變成任務，完成後再回寫命中紀錄。一條規則由「指標 ＋ 運算子 ＋ 門檻 ＋
        連續期數」四格組成，而且沒跑過回測就不能存檔，得先看清楚過去 12 個月它會響幾次。少於 3 次，代表門檻太鬆，什麼都抓不到；多於 8
        次又太吵，主管遲早會開始無視它。
    imagePosition: right
    ratio: 3/4
    alt:
      en: Insight rules page with condition builder and backtest
      zh: 洞察規則頁，含條件建構器與回測
  - type: featureGrid
    uniform: true
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
        ratio: 2976/1778
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
          zh: >-
            直接沿用你目前的篩選條件。七個內容區塊可以勾選，每一塊都標好會多出幾頁。排程建好之後，系統會先寄一份預覽給你自己，你確認之前，不會發給任何收件人。
        ratio: 2976/1778
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
        ratio: 2976/1778
        alt:
          en: Follow-up tasks page
          zh: 跟進任務頁
    direction: horizontal
  - type: imageRow
    eyebrow:
      en: RESPONSIVE
      zh: 三個斷點
    heading:
      en: 'One screen, three breakpoints at once'
      zh: 同一個畫面，三個斷點同時成立
    images:
      - ratio: 5920/2480
        alt:
          en: >-
            Desktop, tablet and phone device mockups side by side, all showing
            the same overview screen
          zh: 桌機、平板、手機三個裝置 mockup 並排，都是同一個總覽畫面
    direction: vertical
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
        padding and resizing behaviour all set, so adding content reflows
        instead of breaking. Spacing only ever comes from seven steps — 4, 8,
        12, 16, 24, 32, 40 — so no 13 or 18 ever appears. Fifty-two screens, two
        themes, three breakpoints, and a naming convention that matches the
        front end, so whoever picks this up knows what to call the next
        component without asking me.
      zh: >-
        核心容器全用原生 auto layout 重建，方向、間距、內距和縮放行為都設好了，內容一多，版面會自己重排，不會散掉。間距只從
        4、8、12、16、24、32、40 這七階裡挑，所以永遠不會冒出 13 或 18。整份檔案有 52
        張畫面、兩套主題、三個斷點，命名也和前端對齊，接手的人不用問我，就知道下一個元件該叫什麼。
    imagePosition: left
    ratio: 3/4
    alt:
      en: Core components rebuilt with real auto layout
      zh: 用原生 auto layout 重建的核心元件
---

