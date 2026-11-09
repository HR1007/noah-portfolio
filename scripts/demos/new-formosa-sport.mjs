/*
  New Formosa Sport 示範影片。   執行：npm run demo:record -- new-formosa-sport

  錄正式站。這是對外的官網，沒有登入頁，從首頁開始；店家用的後台裡是真實客戶的報價資料，
  不錄。首頁的報價表單只填假資料；錄影一開始就用 demo.fakeResponse 把所有 POST 請求
  在瀏覽器裡攔下、直接回成功，按下送出後畫面走到「已收到您的需求」，但請求根本沒有
  送出去，店家不會收到這張假的詢價單。攔的是「所有網址的 POST」而不是只攔表單的網址，
  這樣就算表單哪天改送到別的地方，也一樣漏不出去。

  流程照案例頁的敘事：報價表單就在首頁第一個畫面 → 填需求並送出 → 五大服務 → 服務介紹頁。
  放到 src/assets/projects/new-formosa-sport/02.mp4（The Quote Lives on the First Screen 那一段）。
*/
export default {
  device: 'desktop',
  project: 'new-formosa-sport',
  start: 'https://new-formosa-sport.netlify.app/index.html#home',
  async run(d) {
    // 所有 POST 一律在瀏覽器裡攔下回成功，報價單不會寄到店家
    await d.fakeResponse('*', { method: 'POST' });
    await d.caption('報價表單就放在首頁第一個畫面', 'The quote form sits right on the first screen');
    await d.wait(1600);
    await d.focus('#quote');
    await d.caption('填完需求就能送出，不必另外找聯絡頁面', 'Describe the job and send it, no contact page to hunt for');
    // 以下皆為示範用假資料
    await d.type('#quote input[name=name]', '林先生', { delay: 90 });
    await d.type('#quote input[name=phone]', '0900-000-000', { delay: 50 });
    await d.type('#quote input[name=email]', 'demo@example.com', { delay: 45 });
    await d.click('#quote select[name=service]');
    await d.eval(`(() => { const s = document.querySelector('#quote select[name=service]'); s.value = [...s.options].find((o) => o.text.includes('團體服'))?.value ?? s.value; s.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
    await d.wait(500);
    await d.type('#quote input[name=org]', '示範國中籃球隊', { delay: 80 });
    await d.type('#quote input[name=quantity]', '30 件', { delay: 80 });
    await d.type('#quote input[name=message]', '比賽球衣，需印校名與背號', { delay: 70 });
    await d.click('text:送出免費報價需求');
    await d.wait(1200);
    await d.caption('送出後立刻確認，店家在營業時間內回覆報價', 'Sent: the shop confirms right away and replies with a quote');
    await d.focus('#quote');
    await d.wait(2600);
    await d.unfocus();

    await d.caption('五大服務一目了然，從零售到場館工程', 'Five services at a glance, from retail to venue construction');
    await d.hover('a[href="service.html?id=venue"]');
    await d.wait(2600);

    await d.caption('每項服務都有自己的介紹頁', 'Each service has its own page');
    await d.click('a[href="service.html?id=teamwear"]');
    await d.wait(2200);
    await d.scroll(520);
    await d.wait(2400);
    await d.caption(null);
  },
};
