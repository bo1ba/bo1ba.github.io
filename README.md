# Albion 20 人隊伍名單

網站:https://bo1ba.github.io/

- 名單資料在 `roster.json`,所有人打開網頁每 15 秒自動檢查更新(不用重新整理)。
- 隊長在網頁上按「🔒 隊長編輯」→ 貼 GitHub fine-grained token(只勾 bo1ba.github.io 這個 repo、Contents: Read and write)→ 填名字 → 「💾 儲存並同步」。儲存 = 一個 commit,GitHub Pages 約 1 分鐘內發布給所有人。
- 編輯模式可「📥 貼上 Discord 名單」(`武器 (備註) - @名字` 格式,照順序填入),或「也編輯武器配置」改武器/備註。
- 武器圖示來自 render.albiononline.com,名稱對照表在 `app.js` 的 `ITEMS`。
