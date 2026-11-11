/*
  Sales Dashboard（Sales War Room）示範影片。   執行：npm run demo:record -- sales-dashboard

  錄正式站。這個產品沒有登入頁，從總覽開始。畫面上的業務姓名在產品裡就已經遮蔽成
  「鄭X妤」這種形式，數字也全是示範資料。

  流程照案例頁的動線：總覽的洞察卡 → 看中區明細 → 回到洞察卡指派跟進 →
  跟進任務頁多出一列 → 看這張洞察卡背後的規則 → 自己建立報表。
  放到 src/assets/projects/sales-dashboard/04.mp4（裝置展示圖後面的「體驗展示」段落）。
*/
export default {
  device: 'desktop',
  project: 'sales-dashboard',
  start: 'https://hr1007.github.io/Sales-War-Room/',
  async run(d) {
    await d.caption('打開總覽，最需要處理的問題已經在最上面', 'Open the overview: the problem worth acting on is already on top');
    await d.wait(1200);
    await d.focus('section.insight');
    await d.wait(2400);

    await d.caption('先看中區明細，確認缺口從哪裡來', 'Check the Central region details to see where the gap comes from');
    await d.click('text:看中區明細');
    await d.unfocus();
    await d.wait(2200);
    await d.scroll(320, { at: { x: 820, y: 520 } });
    await d.wait(1200);

    await d.caption('回到洞察卡，直接指派跟進', 'Back on the insight card, assign a follow-up right away');
    await d.click('text:總覽');
    await d.wait(900);
    // 頁面下方業務排行的每一列也有「指派跟進」，要點的是洞察卡上那一顆
    await d.click('section.insight .btn-primary');
    await d.wait(400);
    await d.focus('.dialog', { pad: 24 });
    await d.caption('只需要負責人、到期日和備註', 'It only asks for an owner, a due date and a note');
    await d.click('#a-owner');
    await d.eval(`(() => { const s = document.querySelector('#a-owner'); s.selectedIndex = 1; s.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
    await d.wait(700);
    await d.click('#a-note');
    await d.eval(`(() => { const t = document.querySelector('#a-note'); t.setSelectionRange(t.value.length, t.value.length); return true; })()`);
    await d.type(null, '，週五前回報', { delay: 90 });
    await d.wait(500);
    await d.click('text:建立任務');
    await d.unfocus();

    await d.caption('送出後，就成為跟進任務頁上的一列', 'Once sent, it becomes a row on the follow-ups page');
    await d.click('text:跟進任務');
    await d.wait(700);
    await d.focus('article.task.fresh');
    await d.wait(2200);
    await d.unfocus();

    await d.caption('每張洞察卡都來自一條規則，存檔前先回測', 'Every insight card comes from a rule, backtested before it is saved');
    await d.click('text:看洞察規則');
    await d.wait(1000);
    await d.focus('text:編輯規則', { closest: 'section.panel' });
    await d.wait(2800);
    await d.unfocus();

    await d.caption('也能自己組合報表，再一鍵匯出', 'Build your own report, then export it in one click');
    await d.click('text:＋ 建立報表');
    await d.wait(3200);
    await d.caption(null);
  },
};
