// ========= Countdown (Feb 14) =========
const countdownEl = document.getElementById("countdown");

// By default: Feb 14 of the current year; if already passed, use next year.
function getNextFeb14() {
  const now = new Date();
  let year = now.getFullYear();
  let target = new Date(year, 1, 14, 0, 0, 0); // Month is 0-based; 1 = February
  if (now > target) target = new Date(year + 1, 1, 14, 0, 0, 0);
  return target;
}

const targetDate = getNextFeb14();

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
  const now = new Date();
  const diff = targetDate - now;
  countdownEl.textContent = formatTime(diff);
}
setInterval(tick, 250);
tick();


// ========= Yes/No button behavior =========
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const reveal = document.getElementById("reveal");
const buttons = document.getElementById("buttons");
const inviteText = document.getElementById("inviteText");
const ctaLink = document.getElementById("ctaLink");

let yesScale = 1;

function moveNoButton() {
  // Move "NO" to a random position within the buttons container (mobile-friendly)
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
  yesBtn.style.boxShadow = `0 18px 60px rgba(255, 77, 166, ${0.25 + yesScale * 0.12})`;
}

// On mobile, "mouseenter" doesn’t really happen; use pointer events.
noBtn.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  moveNoButton();
  growYes();
});

// Also move it if she tries to hover (desktop)
noBtn.addEventListener("mouseenter", () => {
  moveNoButton();
  growYes();
});

yesBtn.addEventListener("click", () => {
  reveal.hidden = false;
  startConfetti(2200);

  // Optional: prefill a text message link (works great on phones)
  const msg = encodeURIComponent("YES 💖 Dinner on Feb 14?");
  ctaLink.href = `sms:?&body=${msg}`;

  // Smooth scroll to reveal
  reveal.scrollIntoView({ behavior: "smooth", block: "nearest" });
});


// ========= Simple confetti =========
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

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

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

      // wrap
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

    if (elapsed < durationMs) {
      confettiTimer = requestAnimationFrame(frame);
    } else {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      confettiPieces = [];
    }
  }

  if (confettiTimer) cancelAnimationFrame(confettiTimer);
  confettiTimer = requestAnimationFrame(frame);
}
