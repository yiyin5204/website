// ============================================================
// 共用程式 (common.js)
// ------------------------------------------------------------
// 這個檔案是「每一頁都會用到」的程式，首頁和唱片機都會載入它。
// 每一頁自己才有的程式，放在自己的檔案：
//   - 首頁：js/home.js
//   - 唱片機：js/music.js
//
// HTML 是這樣載入 JavaScript 的（寫在 </body> 前面）：
//   <script src="js/common.js"></script>
//   <script src="js/home.js"></script>
// 順序很重要！common.js 要放在前面，
// 因為後面的檔案會用到這裡定義的東西（例如 reduceMotion、createPetals）
//
// 這個檔案會自動做的事：填年份、點擊噴愛心
// 要每一頁自己呼叫才會做的事：createPetals()（花瓣）
// ============================================================

// 先檢查使用者有沒有開「減少動態效果」
// matchMedia 可以在 JavaScript 裡檢查 CSS 的 @media 條件，.matches 是 true 或 false
// 這個變數其他檔案也可以直接用
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- 1. 自動填入今年的年份 ----------
// 找到 id="year" 的元素，把它的文字內容設成今年的年份
// if (yearEl)：這一頁有 id="year" 才做，沒有的話就跳過，不會出錯
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// ---------- 2. 飄落的櫻花花瓣 ----------
// 這是一個「函式」：把一段程式包起來取個名字，需要的時候再呼叫它
// 每一頁可以自己決定要不要花瓣、要用哪些 emoji，例如：
//   createPetals();                          → 用預設的花瓣
//   createPetals(["🌸", "🎵"]);              → 自己指定 emoji
// emojis = [...] 的意思是：呼叫時沒有給 emoji，就用這個預設值
function createPetals(emojis = ["🌸", "🌸", "💮", "🩷"]) {
  // 開了「減少動態效果」就不要花瓣
  if (reduceMotion) return;

  // ✏️ 花瓣數量，想要更多就把數字調大
  // 「條件 ? A : B」的意思是：條件成立就用 A，不成立就用 B
  // 手機畫面比較小（寬度小於 600px），花瓣少一點才不會太擠、也比較省電
  const petalCount = window.innerWidth < 600 ? 8 : 14;

  for (let i = 0; i < petalCount; i++) {
    // createElement：用 JavaScript 新增一個 HTML 元素
    const petal = document.createElement("span");
    petal.className = "petal";
    petal.setAttribute("aria-hidden", "true");

    // Math.random() 會產生 0 ~ 1 之間的隨機小數
    // Math.floor 是無條件捨去，用來隨機挑一個 emoji
    petal.textContent = emojis[Math.floor(Math.random() * emojis.length)];

    // 每片花瓣的位置、大小、速度都隨機，看起來才自然
    petal.style.left = Math.random() * 100 + "vw";                  // 水平位置
    petal.style.fontSize = 12 + Math.random() * 14 + "px";          // 大小 12 ~ 26px
    petal.style.opacity = 0.5 + Math.random() * 0.4;               // 透明度
    const fallTime = 10 + Math.random() * 12;                       // 掉落時間 10 ~ 22 秒
    const swayTime = 2 + Math.random() * 3;                         // 搖擺時間 2 ~ 5 秒
    petal.style.animationDuration = fallTime + "s, " + swayTime + "s";
    // 負的延遲 = 動畫「已經播了一段時間」，這樣一打開網頁畫面上就有花瓣
    petal.style.animationDelay = -Math.random() * fallTime + "s, 0s";

    // appendChild：把做好的花瓣放進網頁裡
    document.body.appendChild(petal);
  }
}

// ---------- 3. 點擊噴出小愛心 ----------
// 點畫面任何地方，都會噴出一圈小愛心（每一頁都有）
// 注意：嵌進來的別人的網頁（例如 Spotify 播放器）裡面的點擊，我們收不到，所以點那裡不會噴
if (!reduceMotion) {
  const burstEmojis = ["💗", "✨", "🌸", "💕"];

  // 監聽整個網頁的點擊
  document.addEventListener("click", (e) => {
    for (let i = 0; i < 8; i++) {
      const el = document.createElement("span");
      el.className = "burst";
      el.textContent = burstEmojis[i % burstEmojis.length];

      // 放在滑鼠點擊的位置
      el.style.left = e.clientX + "px";
      el.style.top = e.clientY + "px";

      // 用三角函數把 8 顆平均分散成一圈往外飛
      // Math.PI * 2 = 360 度，除以 8 就是每顆間隔 45 度
      const angle = (Math.PI * 2 * i) / 8;
      const distance = 50 + Math.random() * 30;
      el.style.setProperty("--dx", Math.cos(angle) * distance + "px");
      el.style.setProperty("--dy", Math.sin(angle) * distance + "px");

      document.body.appendChild(el);
      // 動畫結束後把它刪掉，不然網頁裡的元素會越來越多
      el.addEventListener("animationend", () => el.remove());
    }
  });
}
