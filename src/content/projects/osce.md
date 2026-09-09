---
title:
  en: OSCE Medical Assessment Platform
  zh: OSCE 醫學考評平台
order: 3
summary:
  en: >-
    My master's thesis: redesigning the information system behind an AR + OSCE
    assessment platform, so the structure of an exam lives in the interface
    instead of the coordinator's head.
  zh: 我的碩士論文：重新設計 AR + OSCE 考評平台背後的資訊系統，讓一場考試的結構長在介面裡，而不是長在承辦人的腦袋裡。
hero:
  ctaLabel:
    en: Try it out
    zh: 實際試試
  ctaHref: 'https://osce-medical-assessment-platform.figma.site'
  gradient: cool
sections:
  - type: textSection
    eyebrow:
      en: ORIGIN & INSPIRATION
      zh: 起點與靈感
    heading:
      en: OSCE Medical Assessment Platform
      zh: OSCE 醫學考評平台
    paragraphs:
      - en: >-
          This is my master's thesis, built on the "AR + OSCE"
          teaching-assessment platform from the Department of Pharmacy at Taipei
          University of Science and Technology, developed alongside OSCE domain
          experts. OSCE is a rigorously designed assessment method — stations,
          rubrics, standardized patients, all of it specified. Its information
          system, on the other hand, had never really been treated as something
          that needed designing. The line that stuck with me from the interviews
          was a coordinator's aside: they had to open ten separate tabs just to
          place one exam seat. Which means the structure of the exam lived in
          her head, not in the interface. That gap is where this project
          started.
        zh: >-
          這是我的碩士論文，以北科大藥學系的「AR + OSCE」教學考評平台為基礎，與 OSCE 領域專家一起發展。OSCE
          本身是一套設計得很嚴謹的考評方法——考站、評分表、標準化病人，全都有規格。但它的資訊系統，從來沒有被當成一件需要設計的事。訪談裡讓我記到現在的，是一位承辦人隨口說的一句話：光是排一個考位，她就得開十個分頁。那代表這場考試的結構是長在她腦袋裡，不是長在介面裡。這個落差，就是這個專案的起點。
  - type: deviceShowcase
    ratio: 16/10
    alt:
      en: OSCE Medical Assessment Platform dashboard screenshot
      zh: OSCE 醫學考評平台的後台畫面
  - type: researchFramework
    layout: stacked
    eyebrow:
      en: RESEARCH FRAMEWORK
      zh: 研究架構
    heading:
      en: Research Framework
      zh: 研究架構
    paragraphs:
      - en: >-
          Human-Centered Design as the anchor, Double Diamond as the structure —
          with a different lens deliberately fitted to each diamond. The first
          diamond, discover and define, ran on Experience-Centered Design:
          situational context, emotional demands, how roles actually
          collaborate. Task analysis alone doesn't surface any of that. The
          second diamond, develop and deliver, switched to User-Centered Design
          for task-driven iteration and usability, and participatory
          co-creation. The reasoning is simple: keep the efficiency and
          error-prevention UCD cares about, without flattening the lived
          experience of turning an exam into a handful of numbers.
        zh: >-
          以人本設計為錨，雙鑽石為骨架——並且刻意為兩顆鑽石各配一副不同的鏡片。第一顆鑽石（探索與定義）走體驗中心設計：情境脈絡、情緒需求、各個角色實際上怎麼協作。這些東西，單靠任務分析看不出來。第二顆鑽石（發展與交付）換成使用者中心設計，做任務導向的迭代、可用性測試與參與式共創。理由很單純：UCD
          在意的效率與防錯要留著，但不能因此把「一場考試被壓縮成幾個數字」這件事背後的真實經驗給抹平。
    ratio: 4/3
    alt:
      en: >-
        OSCE research framework — core roles, the double diamond process, and
        the screen flow it produced
      zh: OSCE 研究架構——核心角色、雙鑽石流程，以及由此產出的畫面流程
  - type: featureSplit
    eyebrow:
      en: TEST RECORDS
      zh: 測驗紀錄
    heading:
      en: Every Exam in One Folder
      zh: 所有考試收在同一個資料夾
    body:
      en: >-
        Sessions are filed by name and date, each card carrying its own
        completion state — so an examiner sees what is still outstanding without
        opening anything.
      zh: 測驗依姓名與日期歸檔，每張卡片自己帶著完成狀態——考官不用點開任何一個，就知道還有哪些沒結束。
    imagePosition: right
    ratio: 3/4
    alt:
      en: 'Exam folder list, searchable by candidate name and date'
      zh: 測驗資料夾列表，可依考生姓名與日期搜尋
  - type: featureSplit
    eyebrow:
      en: OVERVIEW
      zh: 總覽
    heading:
      en: One Table for the Whole Cohort
      zh: 整屆考生，一張表看完
    body:
      en: >-
        Student ID, score, timestamp and examiner in a single filterable row.
        Advanced filters narrow by year and date range, and the result exports
        in one click.
      zh: 學號、成績、時間與考官收在同一列，而且可以篩。進階篩選能限縮年級與日期區間，結果一鍵匯出。
    imagePosition: left
    ratio: 3/4
    alt:
      en: Exam overview table with advanced filters and export
      zh: 測驗總覽表格，含進階篩選與匯出
  - type: persona
    eyebrow:
      en: PERSONA
      zh: 使用者輪廓
    heading:
      en: OSCE — Persona
      zh: OSCE — 使用者輪廓
    personas:
      - name: Exam coordinator
        ratio: 3/4
        alt:
          en: >-
            OSCE persona board — the coordinator who sets up and runs the
            stations
          zh: OSCE 使用者輪廓看板——負責建置與執行考站的承辦人
  - type: designThemes
    eyebrow:
      en: DESIGN THEMES
      zh: 設計主軸
    heading:
      en: >-
        A system built for long shifts in dim rooms — colour that carries
        status, and a dark theme that is not an afterthought.
      zh: 為昏暗房間裡的長時間輪班而做——用顏色承載狀態，而深色模式不是事後補的。
    themes:
      - title:
          en: Semantic colour
          zh: 語意化色彩
        description:
          en: >-
            Status is read from colour before it is read as text, so a
            coordinator scanning a full station list does not have to parse
            every row.
          zh: 狀態先被看成顏色，才被讀成文字。承辦人掃過一整排考站時，不必逐列讀完才知道發生什麼事。
      - title:
          en: Dark theme
          zh: 深色模式
        description:
          en: >-
            Exams run for hours in dimmed simulation rooms, so the dark surface
            is specified alongside the light one rather than derived from it
            afterwards.
          zh: 考試會在昏暗的模擬情境室裡連續進行好幾個小時，所以深色底是跟淺色一起被定義出來的，不是事後從淺色推導出來的。
    direction: vertical
  - type: flow
    eyebrow:
      en: FLOW
      zh: 流程
    heading:
      en: 'One seat, one place'
      zh: 一個考位，一個地方
    body:
      en: >-
        The original workflow scattered a single action across ten tabs. The
        redesigned flow keeps a whole exam setup on one surface, so the
        structure of the exam lives in the interface instead of in someone's
        memory.
      zh: 原本的流程把一個動作拆散到十個分頁。重新設計後，整場考試的建置留在同一個畫面上——考試的結構長在介面裡，不再長在某個人的記憶裡。
    steps:
      - label: Set up the station
        ratio: 3/4
        alt:
          en: OSCE flow — configuring a station and its rubric
          zh: OSCE 流程——設定考站與其評分表
    direction: horizontal
  - type: featureSplit
    heading:
      en: Unified Task Surface
      zh: 收攏成單一操作面
    body:
      en: >-
        Search, filtering and batch operations consolidated into one view,
        removing the page-hopping that fragmented the original workflow. A dense
        table for precise batch work, a card grid for status when needed — same
        data, two genuinely different tools.
      zh: >-
        搜尋、篩選與批次操作收進同一個視圖，原本讓流程支離破碎的跳頁就消失了。需要精準批次處理時用密集表格，需要看狀態時用卡片格線——同一份資料，兩種真的不一樣的工具。
    imagePosition: left
    ratio: 4/3
    alt:
      en: Unified task surface dashboard screenshot
      zh: 收攏後的單一操作面後台畫面
  - type: featureSplit
    heading:
      en: Dark Mode for Long Sessions
      zh: 為長時間作業而做的深色模式
    body:
      en: >-
        Exams run for hours in dimmed simulation rooms; a dedicated dark theme
        keeps content compliant with existing eye-strain requirements.
      zh: 考試會在昏暗的模擬情境室裡連續進行好幾個小時；獨立設計的深色主題讓內容仍然符合既有的視覺疲勞規範。
    imagePosition: right
    ratio: 4/3
    alt:
      en: Dark mode dashboard screenshot
      zh: 深色模式的後台畫面
  - type: experienceDemo
    eyebrow:
      en: EXPERIENCE DEMO
      zh: 體驗展示
    heading:
      en: See the OSCE platform in Action
      zh: 實際走一遍 OSCE 平台
    body:
      en: >-
        A walk through the redesigned backend: advanced filters that expand in
        place, status read through semantic colour, and bulk actions that stay
        where the selection happens. The same tasks that once needed ten tabs,
        done on one screen.
      zh: 走一遍重新設計過的後台：進階篩選就地展開、狀態用語意化色彩讀取、批次操作留在你做選取的地方。以前要開十個分頁才做得完的事，現在在一個畫面上完成。
    ratio: 16/10
    alt:
      en: OSCE Medical Assessment Platform demo on laptop
      zh: 筆電上的 OSCE 醫學考評平台展示
    layout: stacked
  - type: featureSplit
    heading:
      en: Experience the Intuitive Flow
      zh: 走一遍就懂的動線
    body:
      en: >-
        Watch a fragmented backend fold into one continuous surface. Advanced
        filters expand in place. Status is read through semantic color rather
        than a wall of text. Bulk actions live where the selection happens.
      zh: 看一個支離破碎的後台，怎麼收攏成一個連續的操作面。進階篩選就地展開；狀態用語意化色彩讀取，而不是一整面文字；批次操作留在你做選取的地方。
    imagePosition: right
    ratio: 3/4
    alt:
      en: Intuitive flow demo illustration
      zh: 動線展示插圖
    ctaLabel:
      en: Let's Try Out
      zh: 來試試看
    ctaHref: '#'
  - type: featureSplit
    eyebrow:
      en: AUDIT LOG
      zh: 操作日誌
    heading:
      en: Every Change Leaves a Trace
      zh: 每一次更動都留得下痕跡
    body:
      en: >-
        Logins, edits, deletions and exports are colour-tagged and searchable by
        account and date. When a score is disputed, the record answers it.
      zh: 登入、編輯、刪除與匯出都用顏色標記，可依帳號與日期查詢。成績有爭議的時候，紀錄自己會回答。
    imagePosition: left
    ratio: 3/4
    alt:
      en: System audit log with colour-tagged event types
      zh: 系統操作日誌，事件類型以顏色標記
    ctaLabel:
      en: Let's Try Out
      zh: 來試試看
    ctaHref: '#'
---

