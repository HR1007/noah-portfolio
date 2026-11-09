/*
  New Formosa Sport 示範影片。   執行：npm run demo:record -- new-formosa-sport

  錄正式站。這是對外的官網，沒有登入頁，從首頁開始；店家用的後台裡是真實客戶的報價資料，
  不錄。首頁的報價表單只填假資料、游標停在送出鈕上但不按——送出會真的寄到店家的信箱。

  流程照案例頁的敘事：報價表單就在首頁第一個畫面 → 填需求 → 五大服務 → 服務介紹頁。
  放到 src/assets/projects/new-formosa-sport/08.mp4（The Quote Lives on the First Screen 那一段）。
*/
export default {
  device: 'desktop',
  project: 'new-formosa-sport',
  start: 'https://new-formosa-sport.netlify.app/index.html#home',
  async run(d) {
    await d.caption('報價表單就放在首頁第一個畫面', 'The quote form sits right on the first screen');
    await d.wait(1600);
    await d.focus('#quote');
    await d.caption('填完需求就能送出，不必另外找聯絡頁面', 'Describe the job and send it, no contact page to hunt for');
    // 以下皆為示範用假資料，不送出
    await d.type('#quote input[name=name]', '林先生', { delay: 90 });
    await d.type('#quote input[name=phone]', '0900-000-000', { delay: 50 });
    await d.type('#quote input[name=email]', 'demo@example.com', { delay: 45 });
    await d.click('#quote select[name=service]');
    await d.eval(`(() => { const s = document.querySelector('#quote select[name=service]'); s.value = [...s.options].find((o) => o.text.includes('團體服'))?.value ?? s.value; s.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
    await d.wait(500);
    await d.type('#quote input[name=org]', '示範國中籃球隊', { delay: 80 });
    await d.type('#quote input[name=quantity]', '30 件', { delay: 80 });
    await d.type('#quote input[name=message]', '比賽球衣，需印校名與背號', { delay: 70 });
    await d.hover('#quote button');
    await d.wait(1400);
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
