# Albion 20 人隊伍:報名與排位

網站:https://bo1ba.github.io/

- 資料在 Firebase Realtime Database(`config` 隊伍配置/活動資訊、`signups` 報名卡片、`assign` 排位),網站即時同步。
- 隊員:網站按「📝 我要報名」(最多選 3 個位置/職業,可勾補位),或在 Discord 報名訊息點表情。
- 隊長:「👑 隊長登入」用 Google 登入(UID 需在資料庫 `admins/<UID> = true`),拖曳卡片到位置;手機上點卡片再點位置。
- 安全規則在 `database.rules.json`(貼到 Firebase 主控台 → Realtime Database → 規則)。
- Firebase 網頁設定在 `firebase-config.js`。
- 武器圖示來自 render.albiononline.com,名稱對照表在 `app.js` 的 `ITEMS`。
- 本機測試:`python -m http.server 8765` 後開 `http://localhost:8765/?mock`(假資料庫,存在 localStorage,多分頁同步)。
