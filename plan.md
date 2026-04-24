## Plan: 新增明暗主題切換與偏好保存

在首頁頂部加入單一切換按鈕，提供 Light 與 Dark 兩種主題，首次造訪固定 Light，使用者切換後以 localStorage 保存並於下次載入立即套用。以 CSS 變數為核心重構既有硬編碼顏色，確保整頁元件一致切換且不加入第三種 System 模式。

**Steps**
1. Phase 1 盤點與主題策略定稿
1.1 整理現有顏色來源與主題影響面，確認需變數化的區塊清單：body 背景漸層、header 漸層、表單欄位、focus 狀態、記錄卡片、ghost 按鈕、一般文字與邊框。
1.2 定義主題切換策略：在 body 掛載 data-theme（dark 或 light），預設為 light；點擊按鈕時僅在 Light 與 Dark 互切。
1.3 定義 localStorage 規格：key 命名為 bp-theme，值限定 light 或 dark，非法值回退到 light。

2. Phase 2 CSS 主題層重構（阻塞後續視覺驗收）
2.1 在根層新增完整語意化變數（背景、面板、文字、次文字、邊框、主色、主色加深、header 漸層、輸入框背景、focus ring、ghost 按鈕色）。
2.2 將現有硬編碼顏色改為引用語意變數，覆蓋整頁全部元件（依需求：整頁覆蓋）。
2.3 新增 dark 主題覆蓋區（例如 body[data-theme="dark"]），只改變變數值，不複製整段元件樣式。
2.4 新增主題切換按鈕樣式，與現有 header 版面協調；按鈕需有 hover/focus 可視狀態，但切換本身不加動畫（依需求：立即切換）。

3. Phase 3 HTML 介面接點（可與 Phase 2 後半平行）
3.1 於首頁上方 .app-header 增加單一切換按鈕，預設以太陽/月亮 SVG 圖示呈現，不顯示文字文案。
3.2 補齊可辨識屬性：id、aria-label、必要時 aria-pressed，方便 JS 綁定與狀態反映。
3.3 若 header 需微調排列，採最小改動維持現有資訊結構與響應式行為。

4. Phase 4 JavaScript 主題生命週期（依賴 Phase 3 的 DOM id）
4.1 新增主題常數與工具函式：讀取偏好、套用主題、寫回偏好、切換主題。
4.2 初始化順序調整：在頁面互動綁定前先套用已儲存主題，避免首屏閃爍；若無儲存則使用 Light。
4.3 綁定按鈕 click 事件：Light <-> Dark 互切、同步更新 localStorage、同步更新圖示與 aria 狀態。
4.4 錯誤防護：localStorage 存取異常時不阻斷主流程，回退到 Light。

5. Phase 5 驗收與回歸檢查
5.1 手動驗收主流程：首次進站為 Light、點擊切成 Dark、重新整理後仍為 Dark、再次切回 Light 並持久化。
5.2 視覺覆蓋驗收：背景、header、表單、列表、按鈕、文字、邊框、focus 狀態均隨主題變化，無局部殘留亮色硬編碼。
5.3 響應式驗收：桌面與手機寬度下，header 內容與切換按鈕不重疊、不溢出。
5.4 相容性快測：現代瀏覽器（Chrome/Edge/Firefox/Safari 新版）至少抽測一次載入與切換流程。

**Relevant files**
- style.css - 主題變數分層、dark 覆蓋、硬編碼顏色改造、切換按鈕樣式
- index.html - 在 .app-header 新增主題切換按鈕與必要可及性屬性
- script.js - 主題初始化、切換事件、localStorage 讀寫與容錯

**Verification**
1. 清空該站 localStorage 後開頁，確認初始為 Light。
2. 點擊頂部切換按鈕，確認整頁立即切換 Dark，且 localStorage 寫入 dark。
3. 重新整理頁面，確認仍為 Dark。
4. 再次點擊切回 Light，確認 localStorage 更新為 light。
5. 使用開發者工具檢查 body 的 data-theme 與計算後 CSS 變數值是否符合預期。
6. 在手機寬度檢查 header 佈局與按鈕可點擊區。

**Decisions**
- 僅做 Light 與 Dark 兩種模式，不提供 System。
- 首次造訪固定 Light，不跟隨 prefers-color-scheme。
- 偏好儲存於 localStorage，不做帳號同步。
- 切換器為首頁頂部單一按鈕，僅顯示太陽/月亮 SVG 圖示。
- 主題標記掛載於 body 節點（data-theme）。
- localStorage 主題鍵名使用 bp-theme。
- 切換需覆蓋整頁元件，且切換時不使用過渡動畫。
- 目前不強制可及性合規檢測，但保留基本語意屬性。

**Further Considerations**
1. 目前無阻塞議題，已可依本計劃直接進入實作。
