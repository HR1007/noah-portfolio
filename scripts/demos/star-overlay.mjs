/*
  Star Overlay 示範影片。   執行：npm run demo:record -- star-overlay

  錄正式站的手機版。這個工具沒有登入頁，從上傳照片開始。
  示範照片用藝廊 film-project 的 05 號（日本的寺院與池塘），畫面裡沒有人。
  照片只在瀏覽器裡處理，不會上傳到任何伺服器；最後的「下載圖片」在錄影時被擋下，不會真的存檔。

  流程照案例頁的敘事：選照片 → 左右對照的星形構圖出現 → 隨機生成星星 →
  調整數量與大小 → 換顏色 → 換比例 → 下載。
  放到 src/assets/projects/star-overlay/10.mp4（See the Star Overlay Editor in Action 那一段）。
*/
export default {
  device: 'phone',
  project: 'star-overlay',
  start: 'https://star-overlay.vercel.app/',
  async run(d) {
    await d.caption('選一張照片，所有處理都在手機上完成', 'Pick a photo; everything happens right on the phone');
    await d.wait(900);
    await d.click('#uploadZone');
    await d.upload('#fileInput', 'src/assets/gallery/film-project/05.webp');
    await d.wait(1600);

    await d.caption('左邊照片從星形鏤空透出，右邊星星疊在原圖上', 'Left: the photo shows through star cut-outs. Right: solid stars on top', { top: true });
    await d.wait(2600);

    await d.caption('一鍵隨機生成新的星星排列', 'Shuffle a new star layout in one tap', { top: true });
    await d.click('text:隨機生成星星');
    await d.wait(1600);
    await d.click('text:隨機生成星星');
    await d.wait(1600);

    await d.caption('調整星星數量和大小', 'Adjust how many stars and how big', { top: true });
    await d.drag('#countSlider', { dx: 70 });
    await d.wait(900);
    await d.drag('#sizeSlider', { dx: -50 });
    await d.wait(1200);

    await d.caption('從照片吸色，或從色票挑顏色', 'Pick a colour from the photo or the palette', { top: true });
    // 色票第一格是白色，跟原本的背景一樣看不出變化；第三格是深藍
    await d.click('#palette > *:nth-child(3)');
    await d.wait(1500);

    await d.caption('換個比例，直接下載', 'Switch the ratio and download', { top: true });
    await d.click('text:9:16');
    await d.wait(1800);
    await d.click('text:下載圖片');
    await d.wait(1800);
    await d.caption(null);
  },
};
