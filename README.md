# 實踐大學數位多媒體遊戲設計學系 112 級四學程檢核

完全靜態網站，不需要後端、帳號、資料庫或 Apps Script。

## 部署 GitHub Pages

1. 在 GitHub 新增 Public repository，例如 `usc-course-checker`。
2. 把 `index.html`、`style.css`、`script.js`、`data.js` 上傳到儲存庫根目錄。
3. Settings → Pages → Build and deployment：Source 設成 **Deploy from a branch**。
4. Branch 選 `main`、資料夾選 `/(root)`，按 **Save**。
5. 稍等 GitHub Pages 發布，網址一般會是 `https://你的帳號.github.io/usc-course-checker/`。

## 功能

- 40 門系選修的篩選、搜尋及已修勾選。
- 即時計算最多能完成的學程數，並列出每學程 4 門不重複的 3 學分課程。
- 本機 localStorage 保存勾選狀態，可 JSON 匯出與匯入備份。
- 手機與桌機皆可使用。

## 重要限制

112 級官方四學程檢核表中，只有一門可認列的 2 學分科目（物件導向程式設計）；因此滿足 12 學分的完整學程，必定需要至少 4 門不同的 3 學分課程，網站使用二分圖最大流精確分配這些課程。2 學分仍計入已修總學分以及對應學程「已修可用學分」，但不會獨立湊成 12 學分的完整學程。認列結果僅供規劃，最終仍以學校審查為準。

- 課程表 https://csd.kh.usc.edu.tw/var/file/24/1024/img/347/670507279.pdf
- 學程檢核表 https://csd.kh.usc.edu.tw/var/file/24/1024/img/347/206651566.pdf
