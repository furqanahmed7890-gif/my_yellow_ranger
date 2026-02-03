// ===== Countdown to Feb 14 (uses her phone's local time; in Massachusetts it'll be ET) =====
const countdownEl = document.getElementById("countdown");

function getNextFeb14At(hour = 0, minute = 0) {
  const now = new Date();
  let year = now.getFullYear();
  let target = new Date(year, 1, 14, hour, minute, 0); // Feb = 1
  if (now > target) target = new Date(year + 1, 1, 14, hour, minute, 0);
  return target;
}

// If you want the "bomb" to hit at dinner time, set to e.g. 19:00 or 19:30.
// For now: midnight start of Feb 14.
const targetDate = getNextFeb14At(0, 0);

function formatTime(ms) {
  const total = Math.max(0, ms);
  const s = Math.floor(total / 1000);
  const days = Math.floor(s / (3600 * 24));
  const hrs = Math.floor((s % (3600 * 24)) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  return `${days}d ${String(hrs).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
}
function tick() {
  const diff = targetDate - new Date();
  countdownEl.textContent = formatTime(diff);
}
setInterval(tick, 250);
tick();

// ===== Music (phones require a tap to start audio) =====
const bgm = document.getElementById("bgm");
const musicBtn = document.getElementById("musicBtn");

async function toggleMusic() {
  try {
    if (bgm.paused) {
      await bgm.play();
      musicBtn.textContent = "Pause song";
    } else {
      bgm.pause();
      musicBtn.textContent = "Play our song";
    }
  } catch (e) {
    // If the browser blocks it, she needs to tap again (rare, but happens).
    musicBtn.textContent = "Tap to play";
  }
}
musicBtn.addEventListener("click", toggleMusic);

// ===== Yes/No behavior =====
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const reveal = document.getElementById("reveal");
const buttons = document.getElementById("buttons");
const ctaLink = document.getElementById("ctaLink");

let yesScale = 1;

function moveNoButton() {
  const rect = buttons.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();

  const maxX = rect.width - btnRect.width;
  const maxY = rect.height - btnRect.height;

  const x = Math.max(0, Math.random() * maxX);
  const y = Math.max(0, Math.random() * maxY);

  noBtn.style.position = "absolute";
  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
}

function growYes() {
  yesScale = Math.min(2.2, yesScale + 0.15);
  yesBtn.style.transform = `scale(${yesScale})`;
}

noBtn.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  moveNoButton();
  growYes();
});
noBtn.addEventListener("mouseenter", () => {
  moveNoButton();
  growYes();
});

yesBtn.addEventListener("click", async () => {
  reveal.hidden = false;

  // Try starting music when she taps YES (this counts as a gesture)
  try {
    if (bgm.paused) {
      await bgm.play();
      musicBtn.textContent = "Pause song";
    }
  } catch {}

  startConfetti(2200);

  // SMS link (works on phones; she can instantly text you)
  const msg = encodeURIComponent("YES. Sultan Restaurant (Agawam) on Feb 14? ");
  ctaLink.href = `sms:?&body=${msg}`;

  reveal.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

// ===== Confetti =====
const canvas = document.getElementById("confetti");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

let confettiPieces = [];
let confettiTimer = null;

function rand(min, max) { return Math.random() * (max - min) + min; }

function startConfetti(durationMs = 2000) {
  confettiPieces = Array.from({ length: 180 }).map(() => ({
    x: rand(0, window.innerWidth),
    y: rand(-50, window.innerHeight),
    r: rand(2, 6),
    vx: rand(-1.2, 1.2),
    vy: rand(2.2, 5.2),
    rot: rand(0, Math.PI),
    vrot: rand(-0.1, 0.1),
    color: ["#ff4da6", "#ff7ac8", "#ffd27d", "#b388ff", "#7c5cff"][Math.floor(rand(0, 5))]
  }));

  const start = performance.now();

  function frame(t) {
    const elapsed = t - start;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    confettiPieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vrot;

      if (p.y > window.innerHeight + 20) p.y = -10;
      if (p.x < -20) p.x = window.innerWidth + 20;
      if (p.x > window.innerWidth + 20) p.x = -20;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2);
      ctx.restore();
    });

    if (elapsed < durationMs) confettiTimer = requestAnimationFrame(frame);
    else {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      confettiPieces = [];
    }
  }

  if (confettiTimer) cancelAnimationFrame(confettiTimer);
  confettiTimer = requestAnimationFrame(frame);
}
