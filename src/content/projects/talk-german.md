---
title:
  en: Talk German
  zh: Talk German
order: 5
summary:
  en: >-
    An idea from my exchange year at THWS Würzburg. Talk German links the dense
    German of lecture materials with the German people speak every day, using
    information-management logic behind a simple interface.
  zh: >-
    在 THWS 符茲堡交換時想到的點子。Talk German
    想把課堂上的學術資料和日常說出口的德文連起來，背後用資訊管理的邏輯整理內容，介面則盡量簡單。
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
          During my exchange at THWS Würzburg, I realized that language is the
          most basic interface there is: if it blocks you, nothing behind it is
          usable. My friends and I, all learning German in Germany, kept running
          into the same problems. We couldn't note down German we didn't
          understand the moment we heard it, or translate it wherever we were.
          There was no easy way to practise before class. Words we had already
          translated were hard to find again, and German articles simply had to
          be memorised. The language tools we had each did one thing, and
          nothing brought them together.
        zh: >-
          在 THWS
          符茲堡交換那段時間，我才真正意識到，語言是最底層的介面：這一層卡住，後面的東西都用不了。我和一起在德國學德文的朋友常碰到幾個問題：遇到不懂的德文，沒辦法當下記錄、隨時翻譯；上課前想先練習，卻找不到順手的方法；翻譯過的單字，事後很難再找回來；德文特有的冠詞，也只能硬背。現有的語言工具各做各的，功能分散，沒辦法整合在一起。
      - en: >-
          I then ran a round of preliminary interviews with learners from
          Taiwan, Japan, South Korea, the United States, Spain and Italy, each
          learning German for different reasons. Talk German's features came out
          of those problems and interviews: it links academic files with the
          German people speak every day, with information-management logic
          behind a design that doesn't make you think. I wanted it to work like
          a study partner that helps people get past the language barrier.
        zh: >-
          後來我做了一輪初步訪談，受訪者來自台灣、日本、韓國、美國、西班牙和義大利，學德文的需求各不相同。Talk German
          的功能就是從這些問題和訪談整理出來的：把學術檔案和日常說出口的德文連起來，背後用資訊管理的邏輯整理，前面給一個不用多想的介面。我希望它像一個陪人念書的夥伴，幫人跨過語言這道門檻。
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
          The product breaks down into four steps: enter, choose an input, wait
          for recognition, read the result. This wireflow fixed that path before
          any visual design began. Uploading a file and recording live both lead
          to the same recognition step and the same side-by-side result screen.
        zh: >-
          整個產品可以拆成四個步驟：進入、選擇輸入方式、等待辨識、查看結果。這張 wireflow
          在視覺設計開始前就先確定了這條路徑。上傳檔案和現場錄音兩種方式，都會進到同一個辨識步驟，最後顯示在同一個左右對照的結果畫面。
      - en: >-
          Light and dark were drawn together from the first sketch, so neither
          theme was adapted from the other.
        zh: 淺色和深色從第一張草圖就一起畫，沒有哪一個主題是從另一個改過來的。
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
        that keep every screen consistent across both themes.
      zh: 一套小而完整的設計系統：色彩、字體、間距和標註都有規範，每個畫面在兩種主題下都一致。
    themes:
      - title:
          en: Colour
          zh: 色彩
        description:
          en: >-
            Brand violet with an amber pretzel mark. The dark and light canvases
            share one set of ink and status tokens, so switching themes never
            requires redrawing a screen.
          zh: 主色是品牌紫，搭配琥珀色的蝴蝶餅標記。深淺兩種畫布共用同一組墨色和狀態 token，切換主題時不需要重畫畫面。
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
          zh: 每個畫面都標好尺寸，實作時照著做就好，不用猜。
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
        The demo follows the core flow: a secure but simple sign-in, audio
        capture by live recording or file upload, and a side-by-side translation
        where learners can check right away how much they understood. The design
        keeps the pressure low so attention stays on understanding the sentence.
      zh: >-
        這段 demo
        走過核心流程：先是安全但簡單的登入，接著擷取語音，可以現場錄音或上傳音檔，最後是左右對照的翻譯結果，學習者能馬上確認自己聽懂多少。這樣設計是為了降低壓力，讓注意力留在聽懂這句話上。
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
            The first screen of the app, designed so nobody gets stuck before
            they start.
          zh: 進入 app 的第一個畫面，目標是讓人一開始就不會卡住。
        ratio: 3/4
        alt:
          en: Intuitive Authentication screen
          zh: 登入畫面
      - heading:
          en: Record or Upload
          zh: 順手的語音擷取
        body:
          en: >-
            Recording and uploading sit side by side, so choosing between them
            is obvious.
          zh: 錄音和上傳兩種輸入方式並排顯示，一眼就能選。
        ratio: 3/4
        alt:
          en: Seamless Audio Capture screen
          zh: 語音擷取畫面
      - heading:
          en: Side by Side
          zh: 左右對照
        body:
          en: >-
            After recognition, the original and the translation sit side by
            side, keeping the context so you can check one against the other on
            the spot.
          zh: 辨識完成後，原文和翻譯左右並排，保留上下文，可以當場核對。
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
        Light mode prioritises legibility, with a clean layout that reads like a
        printed textbook.
      zh: 淺色模式以可讀性為優先，畫面乾淨，閱讀感接近印刷課本。
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
      en: 'In low light, dark mode reduces eye strain during long sessions.'
      zh: 光線較暗時可以切換到深色模式，長時間看螢幕眼睛比較不累。
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
        quizzes, cloud sync, and a dark version of every new screen.
      zh: 每天 10 個附冠詞和例句的德文名詞、自訂測驗、雲端同步，每個新畫面都有深色版本。
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
              Translation got me through lectures, but the words never stuck. So
              I extended Talk German into a daily practice: ten German nouns a
              day, each with its article, plural and an example sentence, plus
              one B1 grammar pattern that uses them. There are two word lists,
              1,048 everyday words and 200 B1 academic words. This version is
              live, with its own database, and no longer just a prototype.
            zh: >-
              翻譯幫我撐過了每一堂課，但單字一直記不住。所以我把 Talk German 延伸成每天的練習：每天 10
              個德文名詞，每個都附上冠詞、複數和例句，再搭配一個用得到這些字的 B1 句型。字庫有兩套：生活常用 1,048 字和 B1 學術
              200 字。這一版已經正式上線，有自己的資料庫，不再只是原型。
          - en: >-
              Every new screen has a dark version. When you switch themes, the
              new palette spreads across the page in a circle from the top-left
              corner.
            zh: 每個新畫面都有對應的深色版本。切換主題時，新配色會從左上角以圓形擴散到整頁。
      - type: flow
        eyebrow:
          en: FLOW
          zh: 流程
        heading:
          en: One Path on the Phone
          zh: 手機上，一條路走完
        body:
          en: >-
            Seven screens form the main path: translate, learn today's words,
            take the quiz. Grammar, the word library and cloud sync branch off
            it, and the bottom tab bar keeps each branch one tap away.
          zh: 主線有七個畫面：翻譯、背今天的單字、測驗；句型、單字庫和雲端同步則是分支。底部分頁列讓每條分支只要點一下就能進入。
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
            Chinese-to-German spelling and plural), and set the number of
            questions. A word answered correctly three times in a row moves to
            learned; a wrong answer moves it back to learning.
          zh: 先選範圍，再混搭四種題型（冠詞、例句填空、中翻德拼寫、複數），最後決定題數。連續答對三次的字會自動移到「已熟背」，答錯就放回「學習中」。
        imagePosition: right
        ratio: 45/32
        alt:
          en: 'Custom quiz setup with scope, question types and length'
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
            Everything works without an account, with progress saved in the
            browser. After signing in with a six-digit code sent to your email,
            learned words, quiz history and streaks sync through Supabase.
            Row-level security limits each person to their own data.
          zh: >-
            不登入也能使用，紀錄會先存在瀏覽器。用信箱收到的 6 位數驗證碼登入後，背過的字、測驗紀錄和連續天數會透過 Supabase
            同步；資料表啟用了 Row Level Security，每個人只能存取自己的資料。
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
              Once the site became something people open every day, it needed a
              home-screen icon. The pixel pretzel from the site header sits on
              the brand violet, aligned to a 64×64 grid so it is still
              recognisable at 40px. Added to the home screen from Safari or
              Chrome, it opens like an app.
            zh: >-
              網站變成每天會打開的工具後，也需要一個放在主畫面上的圖示。網站左上角的像素椒鹽卷餅放在品牌紫色底上，對齊 64×64 格線，縮到
              40px 仍然認得出來。從 Safari 或 Chrome 加到主畫面後，打開的方式就跟 app 一樣。
        ratio: 1600/1635
        alt:
          en: >-
            Talk German app icon sheet: the pixel pretzel icon at several sizes,
            an Android maskable version and home screen previews
          zh: Talk German 的 app icon 規格：像素椒鹽卷餅圖示的各種尺寸、Android 自適應版本與主畫面預覽
---

