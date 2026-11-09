/*
  Talk German（Deutsch Translater）示範影片。   執行：npm run demo:record -- talk-german

  錄正式站的手機版。登入頁只示範輸入 email，不按「寄登入信給我」——按了會真的寄信。
  沒登入時所有紀錄都只存在瀏覽器，不會碰到任何帳號資料。
  headless 沒有麥克風，即時錄音只展示畫面，翻譯改用文字輸入。

  流程照案例頁的敘事：登入 → 翻譯（錄音／上傳／文字）→ 左右對照的結果 →
  每日單字 → 學習卡 → 測驗 → 單字庫。
  放到 src/assets/projects/talk-german/02.mp4（See Talk German in Action 那一段）。
*/
export default {
  device: 'phone',
  project: 'talk-german',
  start: 'https://hr1007.github.io/talk-german/#/account',
  async run(d) {
    await d.caption('登入只要一個 email，不必記密碼', 'Sign in with just an email, no password to remember');
    await d.wait(1000);
    // 只輸入、不送出
    await d.type('input[type=email]', 'demo@example.com', { delay: 60 });
    await d.wait(1200);

    await d.caption('翻譯：現場錄音、上傳音檔，或直接輸入德文', 'Translate by recording, uploading audio or typing German');
    await d.click('text:翻譯');
    await d.wait(1600);
    await d.click('text:文字輸入');
    await d.type('#de-text', 'Die Vorlesung fällt heute aus, weil der Professor krank ist.', { delay: 40 });
    await d.wait(300);
    await d.click('form button[type=submit]');
    await d.wait(2600);
    await d.caption('德文與中文左右對照，馬上確認自己聽懂多少', 'German and Chinese side by side, so you can check what you understood', { top: true });
    await d.scroll(260);
    await d.wait(2200);

    await d.caption('每天 10 個單字，附冠詞、複數與例句', 'Ten words a day, with article, plural and an example');
    await d.click('text:每日單字');
    await d.wait(1600);
    // 記下今天每個字的冠詞，等一下測驗才答得對（每天的字不一樣，不能寫死）
    await d.eval(`(() => { window.__arts = Object.fromEntries([...document.querySelectorAll('.word-item')].map((li) => [li.querySelector('b').innerText.trim(), li.querySelector('.art').innerText.trim()])); return true; })()`);
    await d.scroll(360);
    await d.wait(1400);

    await d.caption('學習卡：先想意思，再點卡片翻面', 'Flashcards: think of the meaning, then tap to flip');
    await d.click('text:開始學習卡');
    await d.wait(1200);
    await d.click('text:先想想看意思');
    await d.wait(1800);
    await d.click('text:記住了');
    await d.wait(1000);

    await d.caption('測驗：冠詞、例句填空、拼寫與複數', 'Quizzes on articles, gap-fills, spelling and plurals');
    await d.click('text:測驗');
    await d.wait(1200);
    // 題型預設是「冠詞選擇＋例句填空」，關掉例句填空，只留冠詞題
    await d.click('text:例句填空');
    await d.wait(500);
    await d.click('text:開始測驗');
    await d.wait(1400);
    for (let i = 0; i < 2; i++) {
      // 從題目裡找出名詞，標出正確的冠詞按鈕再點下去
      await d.eval(`(async () => {
        const btns = [...document.querySelectorAll('button')].filter((b) => /^(der|die|das)$/.test(b.innerText.trim()));
        // 題目長這樣：「___ Träne」，名詞就在底線後面（這段寫在反引號字串裡，正規式不能用反斜線）
        const noun = document.body.innerText.match(/_{2,}[^A-Za-zÄÖÜäöüß]*([A-Za-zÄÖÜäöüß]+)/)?.[1];
        // 每日單字頁記下的那組可能是生活單字還沒載完時先顯示的學術單字，查不到就讀公開的單字檔
        let art = window.__arts?.[noun];
        if (!art) art = (await (await fetch('vocab.json')).json()).find((r) => r[3] === noun)?.[2];
        const right = btns.find((b) => b.innerText.trim() === art) ?? btns[0];
        right?.setAttribute('data-demo-answer', '');
        return noun ?? null;
      })()`);
      await d.click('[data-demo-answer]');
      await d.wait(1600);
      if (i === 0) {
        await d.key('Enter');
        await d.wait(900);
      }
    }

    await d.caption('標記過的字都收進單字庫，答錯的會回到學習中', 'Marked words collect in the library; missed ones go back into practice');
    await d.click('text:單字庫');
    await d.wait(2600);
    await d.caption(null);
  },
};
