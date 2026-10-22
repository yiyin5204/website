// ============================================================
// 首頁專用的程式 (home.js)
// ------------------------------------------------------------
// 只有首頁 (index.html) 會載入這個檔案，負責讓首頁「動起來」。
// 年份、花瓣、點擊愛心這些每一頁都有的東西，寫在 js/common.js。
// 這裡會用到 common.js 裡的 reduceMotion 和 createPetals，
// 所以 HTML 裡一定要先載入 common.js，再載入這個檔案。
// ============================================================

// ---------- 1. 打字效果 ----------
// ✏️ 想讓副標題打出什麼字，就改這個陣列（用逗號分隔，每句用引號包起來）
const phrases = [
  "學習程式的路上，永遠不要放棄！💪",
  "每天進步一點點，總有一天會成功！🌟",
  "程式碼就像魔法，能創造無限可能！✨",
  "保持好奇心，勇於嘗試新事物！🧠",
  "失敗是成功之母，勇敢面對挑戰！🔥",
  "程式設計是一種藝術，享受創作的過程！🎨",
  "與志同道合的人一起學習，事半功倍！🤝",
  "持之以恆，終將收穫滿滿！�🏆",
  "程式世界無邊界，勇敢探索吧！🌐",
  "每一次錯誤都是學習的機會，別害怕！💡",
];
const typingEl = document.getElementById("typing");

let phraseIndex = Math.floor(Math.random() * phrases.length);  // 隨機選一個句子開始打
let charIndex = 0;    // 這一句打到第幾個字
let deleting = false; // 現在是在「打字」還是「刪字」

function typeLoop() {
  const current = phrases[phraseIndex];

  if (deleting) {
    charIndex--;   // 刪掉一個字
  } else {
    charIndex++;   // 多打一個字
  }

  // slice(0, n)：取出字串的前 n 個字
  // Array.from 是為了讓 emoji 被當成「一個字」，不會被切成亂碼
  typingEl.textContent = Array.from(current).slice(0, charIndex).join("");

  let delay = deleting ? 50 : 120;   // 刪字比打字快（單位：毫秒，1000 毫秒 = 1 秒）

  if (!deleting && charIndex === Array.from(current).length) {
    // 整句打完了：停 1.8 秒，然後開始刪
    deleting = true;
    delay = 1800;
  } else if (deleting && charIndex === 0) {
    // 整句刪完了：換下一句（% 是取餘數，到最後一句之後會回到第 0 句）
    deleting = false;
    // 改成 ramdom 亂數，讓每次換下一句的順序都不一樣
    phraseIndex = Math.floor(Math.random() * phrases.length);
    delay = 400;
  }

  // setTimeout(要做的事, 等幾毫秒)：等一下再執行一次自己，就形成了循環
  setTimeout(typeLoop, delay);
}

if (reduceMotion) {
  typingEl.textContent = phrases[0];   // 不要動畫的話，直接顯示第一句
} else {
  typeLoop();
}

// ---------- 2. 捲動浮現效果 ----------
// IntersectionObserver：瀏覽器內建的「偵測器」，可以知道某個元素有沒有出現在畫面上
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");      // 出現了 → 加上 show，觸發 CSS 動畫
        revealObserver.unobserve(entry.target);  // 只要播一次，之後就不用再偵測
      }
    });
  },
  { threshold: 0.15 }  // 元素有 15% 進入畫面時就算「出現」
);

// querySelectorAll：找出「所有」符合條件的元素
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

// 幫每顆技能標籤設定順序編號 --i，讓 CSS 可以讓它們一顆一顆跳出來
document.querySelectorAll(".tag").forEach((tag, i) => {
  tag.style.setProperty("--i", i);
});

// ---------- 3. 卡片 3D 傾斜 + 跟著滑鼠的光 ----------
// (hover: hover) 代表「有滑鼠的裝置」；手機沒有滑鼠，就不需要這個效果
const hasMouse = window.matchMedia("(hover: hover)").matches;

if (hasMouse && !reduceMotion) {
  document.querySelectorAll(".card").forEach((card) => {
    // mousemove：滑鼠在卡片上移動時，一直觸發
    card.addEventListener("mousemove", (e) => {
      // getBoundingClientRect：取得卡片在畫面上的位置和大小
      const rect = card.getBoundingClientRect();
      // 算出滑鼠在卡片裡的位置（0 ~ 1 之間，0.5 是正中間）
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      // 傾斜角度：滑鼠越靠邊，傾斜越多（最多 6 度）
      card.style.setProperty("--ry", (x - 0.5) * 12 + "deg");
      card.style.setProperty("--rx", (0.5 - y) * 12 + "deg");

      // 光的位置跟著滑鼠
      card.style.setProperty("--mx", x * 100 + "%");
      card.style.setProperty("--my", y * 100 + "%");
    });

    // mouseleave：滑鼠離開卡片時，把傾斜歸零
    card.addEventListener("mouseleave", () => {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    });
  });
}

// ---------- 4. 飄落的櫻花花瓣 ----------
// createPetals 寫在 js/common.js，這裡呼叫它，用預設的花瓣
createPetals();

// ---------- 5. 閱讀進度條 ----------
const progressBar = document.getElementById("progress");

function updateProgress() {
  // 可以捲動的總距離 = 整個網頁高度 - 畫面高度
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  // 目前捲了多少比例（0 ~ 1）；如果網頁短到不用捲，就直接算 1
  const ratio = scrollable > 0 ? window.scrollY / scrollable : 1;
  progressBar.style.transform = "scaleX(" + ratio + ")";
}

// scroll：捲動的時候觸發；{ passive: true } 告訴瀏覽器我們不會阻止捲動，讓捲動更順
window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();  // 一打開網頁先算一次
