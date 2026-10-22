---
title:
  en: Talk German
  zh: Talk German
order: 5
summary:
  en: >-
    Born out of my exchange year at THWS Würzburg. Talk German connects the
    dense German of lecture files with the German people actually speak, using
    information-management logic to keep the interface out of your way.
  zh: >-
    這個點子是在 THWS 符茲堡交換時冒出來的。Talk German
    想把課堂上那些厚重的學術資料，和日常裡隨口說出的德文接起來；背後撐著的是資訊管理的邏輯，擺在前面的是不必多想的介面。
hero:
  ctaLabel:
    en: Try it out
    zh: 實際試試
  ctaHref: 'https://hr1007.github.io/talk-german/'
sections:
  - type: textSection
    eyebrow:
      en: ORIGIN & INSPIRATION
      zh: 起點與靈感
    heading:
      en: "\U0001F968 Talk German"
      zh: "\U0001F968 Talk German"
    paragraphs:
      - en: >-
          During my exchange at THWS Würzburg, it hit me that language is the
          most basic interface there is: if you can't get through it, nothing
          behind it works. Talk German tries to connect dense academic files
          with the German people actually speak, pairing information-management
          logic with a design you don't have to think about. I didn't want
          another utility you open, use and close. I wanted something closer to
          a study partner, one that turns the language barrier into a door you
          can actually push open.
        zh: >-
          在 THWS 符茲堡交換那段時間，我才真正意識到，語言其實是最底層的一層介面：這層卡住了，後面什麼都用不了。Talk German
          想做的，是把厚重的學術檔案和日常隨口說出的德文接起來，背後用資訊管理的邏輯撐著，前面給一個不必多想的介面。我不希望它只是個查完就關掉的工具，它應該更像一個陪你念書的夥伴，把語言這道門檻，變成一扇推得開的門。
  - type: deviceShowcase
    ratio: 16/10
    alt:
      en: Talk German app screens shown across three phone mockups
      zh: 三台手機模擬畫面展示 Talk German 的 app 介面
  - type: researchFramework
    layout: split
    eyebrow:
      en: RESEARCH FRAMEWORK
      zh: 研究架構
    heading:
      en: 'From speech to understanding, mapped end to end'
      zh: 從說出口到聽得懂，整條路徑攤開來畫一次
    paragraphs:
      - en: >-
          Strip it down and the whole product is four moments: arrive, pick an
          input, wait for recognition, read the result. This wireflow locked
          that path in before any visual design started. Upload a file or record
          live, and either way you reach the same recognition step and end on
          the same side-by-side result.
        zh: >-
          拆到最後，整個產品只有四個時刻：進來、選輸入方式、等辨識、看結果。這張 wireflow
          在視覺設計動工前，就先把這條路定下來了。不管是上傳檔案還是現場錄音，兩條路都會匯進同一個辨識步驟，最後落在同一個左右對照的結果畫面。
      - en: >-
          Light and dark were drawn side by side from the first sketch, so
          neither theme is stuck with a layout that was really built for the
          other.
        zh: 淺色和深色從第一張草圖就一起畫，所以哪一邊都不必遷就一套原本為另一邊設計的版面。
    ratio: 4/3
    alt:
      en: >-
        Talk German wireflow — entry, audio input, recognition and the bilingual
        result, drawn in both light and dark
      zh: Talk German 的 wireflow——進入、語音輸入、辨識與雙語結果，淺色深色各畫一次
  - type: persona
    eyebrow:
      en: PERSONA
      zh: 人物誌
    heading:
      en: Talk German — Persona
      zh: Talk German — 人物誌
    personas:
      - name: Emma Chen
        ratio: 3/4
        alt:
          en: Emma Chen persona board — a 22-year-old exchange student in Würzburg
          zh: Emma Chen 人物誌看板——22 歲，在符茲堡交換的學生
  - type: designThemes
    eyebrow:
      en: DESIGN THEMES
      zh: 設計主軸
    heading:
      en: >-
        A small but complete design system: colour, type, spacing and redlines
        that keep every screen in step across both themes.
      zh: 一套小而完整的設計系統。色彩、字體、間距和標註都定好了，每個畫面切到哪個主題都對得上。
    themes:
      - title:
          en: Colour
          zh: 色彩
        description:
          en: >-
            Brand violet, with an amber pretzel mark. Dark and light canvases
            share one set of ink and status tokens, so switching themes never
            means redrawing a screen.
          zh: 主色是品牌紫，再點一個琥珀色的蝴蝶餅標記。深淺兩種畫布共用同一組墨色和狀態 token，切換主題時不用重畫任何一個畫面。
      - title:
          en: Typography
          zh: 字體
        description:
          en: >-
            Space Grotesk for display and titles, Inter for body and caption,
            JetBrains Mono for the recording timer and labels.
          zh: 大標與標題用 Space Grotesk，內文與說明用 Inter，錄音計時器與標籤用 JetBrains Mono。
      - title:
          en: Spacing & Radius
          zh: 間距與圓角
        description:
          en: >-
            A 4pt base scale from 4 to 48, with four radii mapped to chips,
            cards, panels and the CTA.
          zh: 間距從 4 到 48，以 4pt 為一階往上疊；圓角有四種，分別給標籤、卡片、面板和主要按鈕。
      - title:
          en: Redlines
          zh: 標註
        description:
          en: >-
            Every screen is specced with measurements, so whoever builds it
            never has to guess.
          zh: 每個畫面都標好了尺寸，做的人照著實作就好，不必用猜的。
    direction: vertical
    layout: stacked
  - type: experienceDemo
    layout: split
    eyebrow:
      en: EXPERIENCE DEMO
      zh: 體驗展示
    heading:
      en: See Talk German in Action
      zh: 實際走一遍 Talk German
    body:
      en: >-
        How do you get from hearing German to understanding it, without the
        interface getting in the way? This demo follows the core journey: a
        login that's secure but quick, audio capture that takes either a live
        recording or an uploaded file, and a side-by-side translation where
        learners can check right away how much they understood. The aim is
        simple: take the pressure off, and keep attention on the sentence in
        front of you.
      zh: >-
        從聽見德文到聽懂德文，介面能不能別擋路？這段 demo
        走過核心動線：先是一個安全但不囉唆的登入，接著是語音擷取，現場錄音或上傳音檔都行，最後停在左右對照的翻譯結果，學習者當場就能確認自己聽懂了幾成。整段設計的目的其實很單純：把壓力降下來，讓注意力留在「聽懂這句話」上。
    ratio: 16/10
    alt:
      en: Talk German translation screen demo on a single phone
      zh: 單台手機展示 Talk German 的翻譯結果畫面
    ctaLabel:
      en: Try it out
      zh: 來試試看
    ctaHref: 'https://hr1007.github.io/talk-german/'
  - type: featureGrid
    eyebrow:
      en: INTUITIVE CAPABILITIES
      zh: 直覺的功能
    heading:
      en: Features
      zh: 功能
    columns:
      - heading:
          en: No-fuss Sign-in
          zh: 不囉唆的登入
        body:
          en: >-
            The front door to the app, built so nobody gets stuck before they've
            even started.
          zh: 這是進 app 的第一道門，原則只有一個：別讓人還沒開始就卡住。
        ratio: 3/4
        alt:
          en: Intuitive Authentication screen
          zh: 登入畫面
      - heading:
          en: Record or Upload
          zh: 順手的語音擷取
        body:
          en: >-
            Two ways in, recording or uploading, laid out so choosing takes no
            thought at all.
          zh: 錄音或上傳，兩種輸入方式並排擺好，要選哪個一眼就知道。
        ratio: 3/4
        alt:
          en: Seamless Audio Capture screen
          zh: 語音擷取畫面
      - heading:
          en: Side by Side
          zh: 左右對照
        body:
          en: >-
            Once recognition finishes, the original and the translation sit side
            by side, so the context stays intact and you can check one against
            the other on the spot.
          zh: 辨識跑完之後，原文和翻譯左右並排，上下文不會斷掉，對不對當場就能核對。
        ratio: 3/4
        alt:
          en: Parallel Insight screen
          zh: 左右對照結果畫面
    direction: horizontal
  - type: featureSplit
    heading:
      en: Daylight Accessibility
      zh: 白天的易讀性
    body:
      en: >-
        Light mode goes all in on legibility: crisp, clean, and close to the
        feel of a printed textbook.
      zh: 淺色模式把可讀性擺在第一位，畫面乾淨俐落，讀起來像在翻一本印刷課本。
    imagePosition: right
    ratio: 3/4
    alt:
      en: Light mode screen of Talk German
      zh: Talk German 的淺色模式畫面
    ctaLabel:
      en: Try it out
      zh: 來試試看
    ctaHref: 'https://hr1007.github.io/talk-german/'
  - type: featureSplit
    heading:
      en: Nightfall Immersion
      zh: 入夜之後
    body:
      en: >-
        When the lights go down, dark mode takes over. It puts the reader's eyes
        first and noticeably cuts down on strain during long sessions.
      zh: 光線暗下來的時候，就換深色模式上場。它把使用者的眼睛擺在第一位，盯著螢幕久了也不那麼累。
    imagePosition: left
    ratio: 3/4
    alt:
      en: Dark mode screen of Talk German
      zh: Talk German 的深色模式畫面
    ctaLabel:
      en: Try it out
      zh: 來試試看
    ctaHref: 'https://hr1007.github.io/talk-german/'
changelog:
  - date: '2026-10-22'
    title:
      en: Daily Words
      zh: 每日單字
    summary:
      en: >-
        Ten German nouns a day with articles and example sentences, custom
        quizzes, cloud sync, and a dark twin for every new screen.
      zh: 每天 10 個附冠詞與例句的德文名詞、自訂測驗、雲端同步，每個新畫面都有深色版。
    sections:
      - type: textSection
        eyebrow:
          en: EXTENSION
          zh: 延伸
        heading:
          en: From Understanding to Remembering
          zh: 從聽懂，到記得住
        paragraphs:
          - en: >-
              Translation got me through lectures, but the words never stayed. So I
              extended Talk German into a daily habit: ten German nouns a day, each
              with its article, plural and an example sentence, plus one B1 grammar
              pattern to use them in. There are two decks, 1,048 everyday words and
              200 academic ones, and this time it isn't a prototype: it's a working
              site with its own database.
            zh: >-
              翻譯幫我撐過了每一堂課，可是字從來沒有留下來。所以我把 Talk German 延伸成每天的習慣：每天 10 個德文名詞，每個都帶著冠詞、複數和例句，再配一個用得上它們的 B1 句型。字庫有兩套，生活常用 1,048 字和 B1 學術 200 字；而這次不是原型，是一個真的上線、有自己資料庫的網站。
          - en: >-
              Every new screen has a dark twin, and switching themes sweeps the
              new palette across the page in a circle from the top-left corner.
            zh: 每日單字的每個新畫面都有對應的深色版，切換主題時，新配色會從左上角以圓形擴散、蓋滿整頁。
      - type: flow
        eyebrow:
          en: FLOW
          zh: 流程
        heading:
          en: One Path on the Phone
          zh: 手機上，一條路走完
        body:
          en: >-
            Seven screens form the main path: translate, learn today's words, test
            them. Grammar, the word library and cloud sync branch off it, and the
            bottom tab bar keeps every branch one tap away.
          zh: 七個畫面串成主線：翻譯、背今天的字、測驗；句型、單字庫和雲端同步是從主線岔出去的分支。底部分頁列讓每條分支都只差一下點擊。
        steps:
          - label: Mobile flow
            ratio: 2480/1823
            alt:
              en: >-
                Talk German mobile flow, seven screens from translation to quiz
                results with three branches
              zh: Talk German 手機版動線：從翻譯到測驗結果的七個畫面，加上三條分支
        direction: horizontal
      - type: imageRow
        eyebrow:
          en: MOBILE
          zh: 手機版
        heading:
          en: 'Ten Words, One Thumb'
          zh: 十個字，一隻手就背得完
        direction: horizontal
        images:
          - ratio: 390/844
            alt:
              en: 'Today''s ten words on mobile, with articles and example sentences'
              zh: 手機上的今日 10 字，附冠詞與例句
          - ratio: 390/844
            alt:
              en: Flashcard for die Hausarbeit with plural and pronunciation
              zh: die Hausarbeit 的學習卡，附複數與發音
          - ratio: 390/844
            alt:
              en: Fill-in-the-blank quiz question on mobile
              zh: 手機上的例句填空題
      - type: featureSplit
        heading:
          en: Quizzes That Know What You Forgot
          zh: 知道你忘了什麼的測驗
        body:
          en: >-
            Pick a scope, mix four question types (article, fill-in-the-blank,
            spelling and plural) and set the length. Three correct answers in a row
            move a word to learned; a miss sends it straight back to learning.
          zh: 選範圍、混搭四種題型（冠詞、例句填空、中翻德拼寫、複數），再決定題數。連續答對三次的字自動移到「已熟背」，答錯就直接放回「學習中」。
        imagePosition: right
        ratio: 45/32
        alt:
          en: Custom quiz setup with scope, question types and length
          zh: 自訂測驗設定：出題範圍、題型與題數
        ctaLabel:
          en: Try it out
          zh: 來試試看
        ctaHref: 'https://hr1007.github.io/talk-german/#/quiz'
      - type: featureSplit
        heading:
          en: Your Progress Follows You
          zh: 紀錄跟著你走
        body:
          en: >-
            Everything works without an account and saves in the browser. Sign in
            with a six-digit code from your inbox, and learned words, quiz history
            and streaks sync through Supabase, with row-level security so each
            person can only reach their own data.
          zh: 不登入也能用，紀錄先存在瀏覽器裡。用信箱收到的 6 位數驗證碼登入後，背過的字、測驗紀錄和連續天數會透過 Supabase 同步；資料表開了 Row Level Security，每個人只碰得到自己的資料。
        imagePosition: left
        ratio: 390/844
        alt:
          en: Cloud sync screen with a six-digit sign-in code
          zh: 雲端同步畫面，輸入 6 位數登入驗證碼
        ctaLabel:
          en: Try it out
          zh: 來試試看
        ctaHref: 'https://hr1007.github.io/talk-german/#/account'
      - type: researchFramework
        layout: stacked
        eyebrow:
          en: BRAND
          zh: 品牌
        heading:
          en: A Pretzel on Your Home Screen
          zh: 主畫面上的那顆卷餅
        paragraphs:
          - en: >-
              Once it became a site people come back to every day, it needed a
              face on the home screen. The pixel pretzel from the header sits on
              the brand violet, snapped to a 64×64 grid so it still reads at 40px.
              Add it from Safari or Chrome and it opens like an app.
            zh: 既然變成每天會打開的網站，就需要一張放在主畫面上的臉。網站左上角的像素椒鹽卷餅放到品牌紫色上，對齊 64×64 格線，縮到 40px 還認得出來。從 Safari 或 Chrome 加到主畫面，打開就像一個 app。
        ratio: 1600/1635
        alt:
          en: >-
            Talk German app icon sheet: the pixel pretzel icon at several sizes,
            an Android maskable version and home screen previews
          zh: Talk German 的 app icon 規格：像素椒鹽卷餅圖示的各種尺寸、Android 自適應版本與主畫面預覽
---
