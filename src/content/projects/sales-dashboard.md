---
title:
  en: Signal & Action
  zh: 訊號與行動
order: 1
summary:
  en: >-
    An internship dashboard, rebuilt as a design system. The focus is the path
    from spotting a problem to assigning someone to follow it up; the charts are
    only one part of that.
  zh: 把實習時做的銷售儀表板重新設計成一套系統。這個案子在意的是怎麼讓人從發現問題，一路走到把跟進指派出去，圖表只是其中一段。
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
          company. It could filter by year and month, break results down by
          region and county, and rank the best-selling products and top sales
          reps. It answered "what is the number right now" but not "what should
          I do next". This case redesigns the same analytical structure from
          scratch. The company, the real figures and the product names are
          confidential, so everything here is anonymised and the data is
          fictional.
        zh: >-
          實習時，我替一家雲端辦公 SaaS
          公司做了一份銷售儀表板，可以篩年月、看地區和縣市，也能排出熱銷品和業績最好的業務員。它能回答「現在數字是多少」，卻回答不了「接下來該做什麼」。這個案子把同一套分析架構從頭重新設計。公司、實際數據和產品名稱都需要保密，所以頁面上全部匿名，數字也換成虛構資料。
      - en: >-
          The original used a dark purple neon template with gradient
          backgrounds, card layouts, a scatter plot, bar charts and pie charts.
          It looked full. A regional manager opening it on Monday morning still
          had to search ten charts to find the region in trouble, then leave the
          dashboard and use other tools to contact each sales rep individually.
        zh: >-
          原版套用深紫霓虹模板，漸層背景、卡片式排列，放了散點圖、長條圖和圓餅圖，畫面很滿。區域主管週一早上打開它，還是得自己在十張圖裡找出哪一區有問題；找到之後，又得離開儀表板，用別的工具一個一個通知業務。
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
          visual clarity, context and feedback all sound obviously right, and
          that is why they get skipped. I turned each one into a rule the design
          system can be checked against: at most nine blocks per screen, a unit
          and a comparison baseline on every number, one meaning per semantic
          colour, and a dedicated screen for each of the four data states.
        zh: >-
          資訊層級、KPI
          選擇、圖表適配、篩選互動、視覺清楚、數據脈絡、操作回饋，這七個原則聽起來都對，也因為太理所當然而常被跳過。我把每一條都改寫成可以檢查的規則：一個畫面最多九個區塊；每個數字都帶單位和比較基準；一個語意色只代表一種意思；四種資料狀態各有自己的畫面。
      - en: >-
          There are three breakpoints, 375, 768 and 1200, for three real
          situations: at a desk seeing everything, in a meeting with a tablet,
          and outside a client's door checking one number. When space runs
          short, legends and decoration go first and the hierarchy changes last.
          Unit, period and baseline stay at every width.
        zh: >-
          頁面斷點只設 375、768、1200
          三個，對應三種實際情境：在辦公桌前看全貌、開會時用平板、站在客戶門口查一個數字。空間不夠時，先拿掉圖例和裝飾，資訊層級最後才調整；單位、期間和比較基準在任何寬度都保留。
    ratio: 4/3
    alt:
      en: Responsive and auto layout specification page
      zh: 響應式與 auto layout 規格頁
  - type: designThemes
    layout: carousel
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
            The base and accent colours come from the client's brand: charcoal
            from the website navigation, orange from the product wordmark.
            Orange is used only for interface elements such as the logo, the
            primary button, the selected sidebar item and the current month.
            Charts use a separate five-colour palette, because red, amber and
            green already mean "declining", "needs attention" and "growing".
          zh: >-
            品牌底色和強調色取自客戶的品牌：炭灰來自官網導覽列，橘色來自產品字標。橘色只用在介面上，例如
            logo、主按鈕、側欄選取狀態和目前月份。圖表另外用一組五色，因為紅、黃、綠已經分別代表「衰退」「需注意」「成長」。
      - title:
          en: Components & naming
          zh: 元件與命名
        description:
          en: >-
            Names have three parts, category / component / variant, across nine
            categories that each handle one job. Figma component names match the
            front-end component names, so there is only one list to maintain.
            Every component is defined together with the states it ships with:
            loading, empty, stale and failed.
          zh: >-
            命名分成「類別 / 元件 / 變體」三段，九個類別各負責一件事。Figma 的元件名稱和前端的 component
            名稱相同，兩邊只維護一份。每個元件都和上線後會遇到的狀態一起定義：載入中、沒有資料、資料延遲、載入失敗。
      - title:
          en: Screens that interrupt
          zh: 會打斷人的畫面
        description:
          en: >-
            The pages use seven dialogs and three toasts. A dialog's title is
            the question itself; destructive actions are red and never the
            default focus; and the scope is stated before you confirm: how many
            rows, how many people, and when it takes effect. Reversible actions
            skip the confirmation, run immediately and offer an undo.
          zh: >-
            頁面中共有七種對話框和三種
            toast。對話框標題直接寫出問題；破壞性動作用紅色，也不會是預設焦點；按下確認前先說明影響範圍，包括匯出幾筆、影響幾人、什麼時候生效。可以復原的操作不跳確認，直接執行並提供「復原」。
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
        The original logo was a bullseye: it suggested aiming without saying at
        what. I explored four directions that all kept the orange rounded square
        with a screen inside it, and chose B, a rising line on the screen that
        ends in a red dot. The screen stands for the war room, the line for the
        trend, and the dot for the anomaly the insight card flags. The orange
        matches the interface accent, and below 20px the strokes thicken so the
        mark stays legible in the sidebar and in a browser tab.
      zh: >-
        原本的標誌是靶心，只表達了「瞄準」，沒有說明瞄準什麼。我試了四個方向，都保留橘色圓角方塊，並在裡面放一台螢幕，最後選了
        B：螢幕裡一條上升的折線，終點是一個紅點。螢幕代表戰情室，折線代表趨勢，紅點代表洞察卡提醒你注意的異常。底座的橘色和介面強調色相同；縮到
        20px 以下時線條會自動加粗，在側欄和瀏覽器分頁上也能辨認。
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
        Five screens form the main line, with three branches splitting off the
        middle. Every thumbnail is a real screen exported from the design file.
      zh: 主線有五張畫面，三條分支從中段分出去。每張縮圖都是從設計檔匯出的實際畫面。
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
        The insight card at the top of the overview states the finding directly:
        the Central region is at 77.7%, below 85% for two months in a row, with
        the cause and the size of the gap attached. "Assign follow-up" opens a
        dialog that asks for an owner, a due date and a note, and the result
        becomes a row on the follow-ups page. Seeing the problem and acting on
        it happen in the same system, without a meeting or a separate email.
      zh: >-
        總覽最上方的洞察卡直接寫出結論：中區達成率 77.7%，已連續兩個月低於
        85%，並附上原因和缺口金額。按下「指派跟進」後，對話框只問負責人、到期日和備註，送出後就成為跟進任務頁上的一列。從看到問題到開始處理，都在同一個系統裡完成，不用另外開會或寄信。
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
        Every task needs a source, and the rules page supplies it: data syncs at
        00:10, every rule is evaluated at 01:00, a hit creates an insight card,
        the manager assigns it as a task, and the finished task writes its
        result back to the rule. A rule has four fields (metric, operator,
        threshold and consecutive periods) and cannot be saved until it has been
        backtested against the past 12 months. Fewer than three hits means the
        threshold is too loose to catch anything; more than eight means it fires
        too often and managers start ignoring it.
      zh: >-
        交付出去的任務都要有來源，規則頁就是補上這段流程的地方：每天 00:10 同步資料，01:00
        逐條評估規則，命中就產生洞察卡，主管指派後成為任務，任務完成後再寫回命中紀錄。一條規則由「指標 ＋ 運算子 ＋ 門檻 ＋
        連續期數」四個欄位組成，存檔前必須先跑回測，看它在過去 12 個月會觸發幾次。少於 3 次表示門檻太鬆，抓不到問題；超過 8
        次則太頻繁，主管很快就會忽略它。
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
            You can drill from a regional gap on the overview down to a single
            order, and the breadcrumb records where you came from. Filters stay
            visible on screen, and exports use the same conditions.
          zh: 從總覽上的區域缺口一路下鑽到單筆訂單，麵包屑會記錄你從哪裡進來。篩選條件一直顯示在畫面上，匯出時也套用同一組條件。
        ratio: 2976/1778
        alt:
          en: Transaction detail page
          zh: 交易明細頁
      - heading:
          en: Report builder
          zh: 建立報表
        body:
          en: >-
            A report starts from the current filters. There are seven content
            blocks to choose from, each labelled with the number of pages it
            adds. Once a schedule is set, the system sends you a preview first,
            and nothing goes to recipients until you confirm.
          zh: >-
            報表直接沿用目前的篩選條件。七個內容區塊可以勾選，每一塊都標示會增加幾頁。排程建立後，系統會先寄一份預覽給你，確認之前不會寄給任何收件人。
        ratio: 2976/1778
        alt:
          en: Report builder with live preview
          zh: 建立報表頁，右側為即時預覽
      - heading:
          en: Follow-ups
          zh: 跟進任務
        body:
          en: >-
            Each task records its source, owner and due date, and shows whether
            a rule or a person created it. When it closes, the outcome is
            written back to the rule, and those records are what threshold
            tuning is based on.
          zh: 每件任務都記錄來源、負責人和到期日，並標明是規則觸發還是手動建立。結案後結果會寫回規則，之後調整門檻就是依據這些紀錄。
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
      en: Handing over a spec you can build from
      zh: 交出去的是一份可以照著做的規格
    body:
      en: >-
        The core containers are rebuilt with native auto layout, with direction,
        gap, padding and resizing all set, so the layout reflows as content is
        added. Spacing comes only from seven values, 4, 8, 12, 16, 24, 32 and
        40, so a 13 or 18 never appears. The file has 52 screens, two themes and
        three breakpoints, and its naming matches the front end, so whoever
        takes it over can name the next component without asking me.
      zh: >-
        核心容器全部用原生 auto layout 重建，方向、間距、內距和縮放行為都已設定，內容增加時版面會自動重排。間距只使用
        4、8、12、16、24、32、40 這七個數值，不會出現 13 或 18。整份檔案有 52
        張畫面、兩套主題、三個斷點，命名和前端一致，接手的人不必問我，也知道下一個元件該怎麼命名。
    imagePosition: left
    ratio: 3/4
    alt:
      en: Core components rebuilt with real auto layout
      zh: 用原生 auto layout 重建的核心元件
---

