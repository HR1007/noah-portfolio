---
title:
  en: OSCE Medical Assessment Platform
  zh: OSCE 醫學考評平台
order: 4
summary:
  en: >-
    My master's thesis. I redesigned the information system behind an AR + OSCE
    assessment platform, so that how an exam fits together shows up on screen
    instead of living only in one coordinator's memory.
  zh: 我的碩士論文。我替一套 AR + OSCE 考評平台重新設計背後的資訊系統，希望一場考試怎麼排，打開介面就看得出來，不必再靠承辦人一個人記著。
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
          throughout. OSCE itself is a meticulous method: how stations are set
          up, how rubrics are scored, how standardized patients play their parts
          — all of it is specified. Oddly, the information system holding it
          together had never been treated as something worth designing. One
          coordinator's offhand complaint from the interviews has stayed with
          me: she had to open ten separate tabs just to assign one exam seat.
          She was carrying the whole exam's structure in her head, and the
          interface wasn't helping her hold any of it. That gap is where this
          project started.
        zh: >-
          這是我的碩士論文。底子是大仁科技大學藥學系的「AR + OSCE」教學考評平台，過程中一路和 OSCE 領域的專家合作。OSCE
          本身是一套很講究的考評方法，考站怎麼設、評分表怎麼打、標準化病人怎麼演，樣樣都有規格。奇怪的是，撐起這一切的資訊系統，好像從來沒有人把它當成需要設計的東西。訪談時有位承辦人隨口抱怨了一句，我到現在都還記得：光是排一個考位，她就得開十個分頁。換句話說，整場考試的結構全靠她自己記著，介面一點忙也沒幫上。這個專案就是從這個落差開始的。
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
          Human-centered design is the anchor and the Double Diamond is the
          frame, but I deliberately fitted each diamond with a different lens.
          The first, discover and define, ran on experience-centered design: the
          situation on the ground, the emotional pressure, how the different
          roles actually work together. Task analysis alone won't dig any of
          that up. For the second, develop and deliver, I switched to
          user-centered design and moved forward through task-driven iteration,
          usability testing and participatory co-creation. Why switch halfway? I
          wanted to keep the efficiency and error-prevention UCD is good at,
          without squeezing what an exam actually feels like for the people
          inside it into a handful of numbers.
        zh: >-
          人本設計是錨，雙鑽石是骨架，不過兩顆鑽石我刻意各配了一副不同的鏡片。第一顆負責探索與定義，用的是體驗中心設計：現場的情境、人的情緒壓力、不同角色之間實際怎麼搭配。這些東西光靠任務分析是挖不出來的。到了第二顆，進入發展與交付，我換成使用者中心設計，靠任務導向的迭代、可用性測試和參與式共創往前推。為什麼要中途換？UCD
          重視的效率和防錯當然要留，可是一場考試對身在其中的人是什麼滋味，總不能就這樣被壓成幾個數字吧？
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
        Sessions are filed by name and date, and every card shows its own
        completion status. An examiner can tell what's still outstanding at a
        glance, without opening a thing.
      zh: 每一場測驗都按姓名和日期歸檔，卡片上直接標著完成狀態。考官不用一張張點開，掃一眼就知道還剩哪些沒收尾。
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
        Student ID, score, timestamp and examiner sit in one row you can filter.
        Advanced filters narrow it by year and date range, and whatever's left
        exports in one click.
      zh: 學號、成績、時間、考官全擺在同一列，隨時可以篩。想縮小範圍就打開進階篩選，挑年級、挑日期區間，篩完按一下就能匯出。
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
        Built for long shifts in dim rooms: colour does the work of showing
        status, and the dark theme was planned from the start.
      zh: 這套系統要撐過昏暗房間裡的長時間輪班：狀態交給顏色來說，深色模式也從一開始就在規劃裡。
    themes:
      - title:
          en: Semantic colour
          zh: 語意化色彩
        description:
          en: >-
            You see a status as a colour before you read it as text. A
            coordinator scanning a full list of stations can spot the trouble
            without parsing every row.
          zh: 狀態先用顏色被看見，文字只是第二層。承辦人掃過一整排考站，不必逐列讀完，就知道哪裡出了狀況。
      - title:
          en: Dark theme
          zh: 深色模式
        description:
          en: >-
            Exams can run for hours in dimmed simulation rooms, so the dark
            surface was specified alongside the light one instead of being
            derived from it afterwards.
          zh: 考試常在燈光調暗的模擬情境室裡一連跑上好幾個小時，所以深色底和淺色底是同時定義的，並不是做完淺色再反推出來。
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
        In the old workflow, a single action was scattered across ten tabs. Now
        an entire exam is set up on one surface. Open the interface and the
        exam's structure is right there, no one's memory required.
      zh: 舊流程裡，同一個動作被拆到十個分頁去做。改版後，建置一整場考試都在同一個畫面上完成。考試長什麼樣子，打開介面就看得到，不必再去翻誰的記憶。
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
        Search, filtering and batch operations now share one view, and the
        page-hopping that kept breaking the workflow apart is gone. Use a dense
        table for precise batch work, or a card grid when you need to see
        status. Same data, two genuinely different tools.
      zh: >-
        搜尋、篩選、批次操作都收進同一個視圖，那些讓流程斷成好幾截的跳頁也跟著沒了。要精準地批次處理，就切到密集表格；想看整體狀態，就換成卡片格線。資料是同一份，工具卻是真的兩種。
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
        Exams run for hours in dimmed simulation rooms. A dedicated dark theme
        keeps the screen within existing eye-strain guidelines, even there.
      zh: 考試在昏暗的模擬情境室裡一跑就是好幾個小時。獨立設計的深色主題，讓畫面在這種環境下依然符合既有的視覺疲勞規範。
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
        A walk through the redesigned backend, and how a fragmented system folds
        into one continuous surface: advanced filters open right where you are,
        status reads at a glance through semantic colour, and bulk actions stay
        next to your selection. Work that once took ten tabs now fits on one
        screen.
      zh: >-
        帶你走一遍改版後的後台，看一個東拼西湊的系統怎麼收成一個連貫的操作面：進階篩選在原地展開，狀態靠語意化色彩一眼讀出，批次操作就待在你選取資料的地方。以前得開十個分頁才辦得完的事，現在一個畫面就搞定。
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
        Logins, edits, deletions and exports each get their own colour tag,
        searchable by account and date. If a score is ever disputed, the log has
        the answer.
      zh: 登入、編輯、刪除、匯出，每一種操作都有自己的顏色，也能依帳號和日期查回去。哪天成績起了爭議，翻一下紀錄就有答案。
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

