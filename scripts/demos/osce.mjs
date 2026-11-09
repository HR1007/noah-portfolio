/*
  OSCE 醫學考評平台示範影片。   執行：npm run demo:record -- osce

  案例頁 CTA 連的 Figma Sites 原型一定要填帳號密碼才進得去，而正式站的密碼欄不能由
  錄影工具代填。所以錄的是同一份設計稿實作出來的後台（vr-medication-admin 專案）在本機的
  開發版：先在該專案跑 `npx vite --port 5192 --strictPort`。
  它的登入、資料、刪除／匯出全是瀏覽器端模擬；登入頁本身就預填了設計稿上的示範帳密
  （Marry1234），錄影時直接按登入，不另外輸入。示範資料的姓名、學號都是虛構的
  （見該專案的 src/data/seed.ts）。

  流程照案例頁的敘事：登入 → 測驗資料夾 → 進階篩選在原地展開 → 狀態的語意色彩 →
  勾選後批次操作出現在旁邊 → 學生作答記錄。
  放到 src/assets/projects/osce/11.mp4（See the OSCE Platform in Action 那一段）。
*/
export default {
  device: 'desktop',
  project: 'osce',
  start: 'http://localhost:5192/vr-medication-admin/#/login',
  async run(d) {
    await d.caption('登入測驗後台', 'Sign in to the assessment back office');
    await d.wait(900);
    await d.focus('#username', { closest: 'form' });
    await d.hover('#username');
    await d.wait(900);
    await d.click('button.auth__submit');
    await d.unfocus();
    await d.wait(1600);

    await d.caption('測驗依諮詢主題分成資料夾', 'Assessments are organised into folders by consultation topic');
    await d.wait(1800);
    await d.click('.folder-card__open');
    await d.wait(1600);

    await d.caption('進階篩選直接在原地展開，不必跳到另一頁', 'Advanced filters expand in place, no separate page');
    await d.click('.tests-filter__toggle');
    await d.wait(500);
    await d.focus('.tests-filter__toggle', { closest: 'form' });
    await d.wait(2400);
    await d.unfocus();

    await d.caption('狀態用語意色彩標示，完成與未完成一眼分開', 'Status uses semantic colour, so finished and pending stand apart');
    await d.focus('table.tests-table');
    await d.wait(2600);
    await d.unfocus();

    await d.caption('勾選資料後，批次刪除與匯出就在旁邊', 'Select rows and the bulk actions sit right beside them');
    await d.click('table.tests-table tbody tr:nth-child(1) input[type=checkbox]');
    await d.click('table.tests-table tbody tr:nth-child(2) input[type=checkbox]');
    await d.click('table.tests-table tbody tr:nth-child(3) input[type=checkbox]');
    await d.wait(400);
    await d.focus('.table-card');
    await d.wait(2200);
    await d.unfocus();

    await d.caption('點進學生的作答記錄，逐題檢視', 'Open a student record to review every answer');
    await d.click('a.tests-table__link');
    await d.wait(2400);
    await d.scroll(420);
    await d.wait(2200);
    await d.caption(null);
  },
};
