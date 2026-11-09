/*
  Foodlet 最後一段「The Receipt You Actually Keep」的手機示範影片。
  執行：npm run demo:record -- foodlet-reward

  跟 foodlet.mjs 一樣錄本機開發版（先在 foodlet 專案跑 `npx vite --port 5191 --strictPort`），
  只是改成手機畫面、只講「結完帳就領到第一個收藏品」這一件事：快速註冊 →
  第一個 NFT 出現 → 點一下領取 → 收進錢包、看它的權益。
  註冊、NFT、錢包全是前端模擬，資料只存在瀏覽器；輸入的都是測試用假資料。
  放到 src/assets/projects/foodlet/11.mp4（THE REWARD 那一段）。
*/
export default {
  device: 'phone',
  project: 'foodlet',
  start: 'http://localhost:5191/foodlet/#/join',
  async run(d) {
    await d.caption('先用一張短表單建立錢包', 'Set up the wallet with one short form');
    await d.wait(800);
    // 以下皆為測試用假資料
    await d.type('#join-name', '林小美', { delay: 60 });
    await d.type('#join-email', 'demo@example.com', { delay: 30 });
    await d.type('#join-phone', '0900123456', { delay: 35 });
    await d.type('#join-password', 'foodlet-demo', { delay: 35 });
    await d.click('.signup__check');
    await d.click('.signup__submit');
    await d.wait(2400);

    await d.caption('結完帳，第一個收藏品就出現了', 'Once the payment clears, the first collectible appears', { top: true });
    await d.wait(2200);
    await d.caption('一塊像素餅乾，點一下就能領取', 'A pixel cookie, claimed with one tap', { top: true });
    await d.click('text:點擊領取');
    await d.wait(2600);

    await d.caption('一聲「嗶」之後，多了能收藏的東西', 'A single beep now leaves something to keep', { top: true });
    await d.click('text:查看我的食錢包');
    await d.wait(2000);
    await d.click('button.nft-tile__art:not([disabled])');
    await d.wait(1200);
    await d.caption('每張收藏都附帶權益和上鏈紀錄', 'Perks and an on-chain record come with it');
    await d.wait(4200);
    await d.caption(null);
  },
};
