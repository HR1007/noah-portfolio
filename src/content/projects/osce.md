---
title:
  en: OSCE Medical Assessment Platform
  zh: OSCE 醫學考評平台
order: 4
summary:
  en: >-
    My master's thesis: a redesign of the information system behind an AR + OSCE
    assessment platform, so the structure of an exam is visible in the interface
    and no longer depends on one coordinator's memory.
  zh: 我的碩士論文：重新設計一套 AR + OSCE 考評平台背後的資訊系統，讓考試的安排直接呈現在介面上，不必靠承辦人一個人記。
hero:
  ctaLabel:
    en: Try it out
    zh: 實際試試
  ctaHref: 'https://osce-medical-assessment-platform.figma.site'
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
          This is my master's thesis. It builds on the "AR + OSCE" teaching and
          assessment platform from the Department of Pharmacy at Tajen
          University of Technology, and I worked with OSCE domain experts
          throughout. OSCE is a tightly specified method, with defined stations,
          scoring rubrics and standardized patients. The information system
          behind it, though, had never been treated as a design problem. In an
          interview, a coordinator mentioned in passing that assigning one exam
          seat meant opening ten tabs. I still remember that: the structure of
          the whole exam lived in her head, and the interface carried none of
          it. The project started there.
        zh: >-
          這是我的碩士論文，以大仁科技大學藥學系的「AR + OSCE」教學考評平台為基礎，過程中一直和 OSCE 領域的專家合作。OSCE
          是規格很嚴謹的考評方法，考站配置、評分表、標準化病人都有明確規範，支撐它的資訊系統卻似乎沒有人當成設計問題來處理。訪談時，一位承辦人順口提到，排一個考位她得開十個分頁。這句話我一直記得：整場考試的結構都在她腦中，介面沒有替她分擔任何一部分。這個專案就從這裡開始。
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
          Human-centered design is the foundation, and the process follows the
          Double Diamond, with a different method in each diamond. The first,
          discover and define, used experience-centered design to look at the
          situation on the ground, the emotional pressure people work under, and
          how the different roles work together; task analysis alone doesn't
          surface these. The second, develop and deliver, switched to
          user-centered design, moving forward through task-driven iteration,
          usability testing and participatory co-creation. The split keeps the
          efficiency and error prevention UCD is good at, without reducing what
          the exam is like for the people in it to a handful of numbers.
        zh: >-
          整體以人本設計為基礎，流程採用雙鑽石模型，兩顆鑽石各用不同的方法。第一顆是探索與定義，用體驗中心設計去看現場情境、使用者的情緒壓力，以及不同角色實際上怎麼協作，這些光靠任務分析看不出來。第二顆是發展與交付，改用使用者中心設計，透過任務導向的迭代、可用性測試和參與式共創推進。這樣分工，是為了保留
          UCD 重視的效率與防錯，同時不讓參與考試的人實際的感受被簡化成幾個數字。
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
        Sessions are filed by name and date, and each card shows its completion
        status, so an examiner can see which ones are still open without
        clicking into any of them.
      zh: 測驗按姓名和日期歸檔，每張卡片標示完成狀態，考官不必逐一點開，就能看出哪些還沒結束。
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
        Student ID, score, timestamp and examiner sit in one filterable row.
        Advanced filters narrow the list by year and date range, and the result
        exports in one click.
      zh: 學號、成績、時間和考官放在同一列，可以直接篩選。進階篩選能再依年級和日期區間縮小範圍，結果可以一鍵匯出。
    imagePosition: left
    ratio: 3/4
    alt:
      en: Exam overview table with advanced filters and export
      zh: 測驗總覽表格，含進階篩選與匯出
  - type: persona
    eyebrow:
      en: PERSONA
      zh: 人物誌
    heading:
      en: OSCE — Persona
      zh: OSCE — 人物誌
    personas:
      - name: Exam coordinator
        ratio: 3/4
        alt:
          en: >-
            OSCE persona board — the coordinator who sets up and runs the
            stations
          zh: OSCE 人物誌看板——負責建置與執行考站的承辦人
  - type: designThemes
    eyebrow:
      en: DESIGN THEMES
      zh: 設計主軸
    heading:
      en: >-
        Designed for long shifts in dim rooms: colour shows status, and the dark
        theme was planned from the start.
      zh: 為昏暗房間裡的長時間輪班設計：用顏色表示狀態，深色模式從一開始就一起規劃。
    themes:
      - title:
          en: Semantic colour
          zh: 語意化色彩
        description:
          en: >-
            Status is recognised by colour first, with text as support. A
            coordinator scanning a full list of stations can find the problem
            without reading every row.
          zh: 狀態先靠顏色辨識，文字是輔助。承辦人掃過整排考站，不必逐列讀完，就能找到出狀況的地方。
      - title:
          en: Dark theme
          zh: 深色模式
        description:
          en: >-
            Exams often run for hours in dimmed simulation rooms, so the dark
            and light colour sets were defined at the same time.
          zh: 考試常在燈光調暗的模擬情境室裡連續進行好幾個小時，所以深色和淺色兩套配色是同時定義的。
    direction: vertical
    layout: stacked
  - type: flow
    eyebrow:
      en: FLOW
      zh: 流程
    heading:
      en: 'One seat, one place'
      zh: 一個考位，一個地方
    body:
      en: >-
        The old workflow spread a single action across ten tabs. In the
        redesign, an entire exam is set up on one screen, and its structure is
        visible in the interface.
      zh: 舊流程把同一個動作拆散在十個分頁裡。改版後，一整場考試在同一個畫面上就能建置完成，考試的結構直接顯示在介面上。
    steps:
      - label: Operation flow
        ratio: 1280/1148
        alt:
          en: >-
            Operation flow from login to correcting a score: six screens on the
            main line, with eight branches peeling off it
          zh: 從登入到修正成績的操作動線：主線六個畫面，另有八條分支從中岔出
    direction: horizontal
  - type: featureSplit
    heading:
      en: Unified Task Surface
      zh: 收攏成單一操作面
    body:
      en: >-
        Search, filtering and batch operations share one view, which removes the
        back-and-forth between pages. A dense table handles precise batch work,
        and a card grid gives an overview of status, both built on the same
        data.
      zh: >-
        搜尋、篩選和批次操作收進同一個視圖，原本在頁面之間來回跳轉的步驟也省掉了。需要精準批次處理時用密集表格，想看整體狀態時切換成卡片格線，兩種檢視用的是同一份資料。
    imagePosition: left
    ratio: 3/4
    alt:
      en: Unified task surface dashboard screenshot
      zh: 收攏後的單一操作面後台畫面
  - type: featureSplit
    heading:
      en: Dark Mode for Long Sessions
      zh: 為長時間作業而做的深色模式
    body:
      en: >-
        The dark theme was designed separately, and in dimmed rooms the screen
        still meets existing eye-strain guidelines.
      zh: 深色主題是獨立設計的，在燈光昏暗的情境室裡，畫面仍符合既有的視覺疲勞規範。
    imagePosition: right
    ratio: 3/4
    alt:
      en: Dark mode dashboard screenshot
      zh: 深色模式的後台畫面
  - type: experienceDemo
    eyebrow:
      en: EXPERIENCE DEMO
      zh: 體驗展示
    heading:
      en: See the OSCE Platform in Action
      zh: 實際走一遍 OSCE 平台
    body:
      en: >-
        A walk through the redesigned backend: advanced filters expand in place,
        status is marked with semantic colour, and bulk actions sit next to the
        selected data.
      zh: 這段展示走一遍改版後的後台：進階篩選在原地展開，狀態用語意化色彩標示，批次操作就在選取的資料旁邊。
    ratio: 16/10
    alt:
      en: OSCE Medical Assessment Platform demo on laptop
      zh: 筆電上的 OSCE 醫學考評平台展示
    layout: stacked
    ctaLabel:
      en: Try it out
      zh: 來試試看
    ctaHref: 'https://osce-medical-assessment-platform.figma.site'
  - type: featureSplit
    eyebrow:
      en: AUDIT LOG
      zh: 操作日誌
    heading:
      en: Every Change Leaves a Trace
      zh: 每一次更動都留得下痕跡
    body:
      en: >-
        Logins, edits, deletions and exports each have their own colour tag and
        can be searched by account and date. When a score is disputed, the log
        shows what happened.
      zh: 登入、編輯、刪除和匯出各有對應的顏色，也能依帳號和日期查詢。成績有爭議時，可以直接從紀錄查證。
    imagePosition: left
    ratio: 3/4
    alt:
      en: System audit log with colour-tagged event types
      zh: 系統操作日誌，事件類型以顏色標記
    ctaLabel:
      en: Try it out
      zh: 來試試看
    ctaHref: 'https://osce-medical-assessment-platform.figma.site'
---

