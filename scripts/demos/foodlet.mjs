/*
  Foodlet 示範影片。   執行：npm run demo:record -- foodlet

  錄的是本機開發版，不是正式站：註冊頁有密碼欄，只在本機填測試資料。
  先在 foodlet 專案跑 `npx vite --port 5191 --strictPort`。
  Foodlet 的註冊、NFT、錢包全是前端模擬，資料只存在瀏覽器，不會建立任何帳號。

  流程照案例頁的敘事：註冊 → 建立錢包 → 領第一個 NFT → 收藏頁 → 看卡片權益 →
  模擬在合作店家付款、解鎖新收藏 → 篩選。鏡頭在表單、領取卡片、卡片詳情、
  新解鎖的收藏這幾處放大，其餘時候看整個畫面。
  放到 src/assets/projects/foodlet/02.mp4（See Foodlet in Action 那一段）。
*/
export default {
  device: 'desktop',
  project: 'foodlet',
  start: 'http://localhost:5191/foodlet/#/join',
  async run(d) {
    await d.caption('註冊只要一張簡短表單，不需要懂加密貨幣', 'Sign up with one short form, no crypto jargon');
    await d.wait(900);
    await d.focus('.signup');
    // 以下皆為測試用假資料
    await d.type('#join-name', '林小美');
    await d.type('#join-email', 'demo@example.com', { delay: 45 });
    await d.type('#join-phone', '0900123456', { delay: 55 });
    await d.type('#join-password', 'foodlet-demo', { delay: 55 });
    await d.click('.signup__check');
    await d.wait(300);
    await d.click('.signup__submit');
    await d.unfocus();

    await d.caption('Foodlet 在背後幫你建好錢包', 'Foodlet sets up the wallet behind the scenes');
    await d.wait(1900);

    await d.caption('見面禮：第一個收藏品，點一下就能領取', 'A welcome gift: the first collectible, ready to claim');
    await d.wait(600);
    await d.focus('.claim-card');
    await d.click('text:點擊領取');
    await d.wait(2000);
    await d.unfocus();

    await d.caption('領到的收藏會直接放進錢包', 'It goes straight into your collection');
    await d.click('text:查看我的食錢包');
    await d.wait(1400);

    await d.caption('每一餐、每個挑戰，都會變成留得住的收藏', 'Every meal and challenge becomes a keepsake');
    await d.wait(1600);
    await d.click('button.nft-tile__art:not([disabled])');
    await d.wait(400);
    await d.focus('.nft-modal__card', { pad: 24 });
    await d.caption('每張卡片都記錄持有權益與上鏈資訊', 'Each card shows its perks and on-chain record');
    await d.wait(2600);
    await d.click('text:關閉');
    await d.unfocus();

    await d.caption('在合作餐廳付款，就會解鎖新的收藏', 'Pay at a partner restaurant and a new one unlocks');
    await d.click('text:模擬完成任務');
    await d.wait(500);
    await d.focus('.nft-tile:has(.nft-tile__art[aria-label*="墨西哥塔可"])');
    await d.wait(1800);
    await d.unfocus();

    await d.caption('篩選已經擁有、或還沒解鎖的收藏', 'Filter what you own and what is still locked');
    await d.click('text:已擁有');
    await d.wait(1300);
    await d.click('text:未解鎖');
    await d.wait(1300);
    await d.click('text:全部');
    await d.wait(1200);
    await d.caption(null);
  },
};
