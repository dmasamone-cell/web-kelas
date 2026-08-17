function toggleDrawer() {
  document.getElementById('drawer-menu').classList.toggle('hidden');
}

const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const html = document.documentElement;

themeToggle.addEventListener('click', () => {
  html.classList.toggle('dark');
  if (html.classList.contains('dark')) {
    themeIcon.innerText = '☀️';
    localStorage.setItem('theme', 'dark');
  } else {
    themeIcon.innerText = '🌙';
    localStorage.setItem('theme', 'light');
  }
});

if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  html.classList.add('dark');
  themeIcon.innerText = '☀️';
}

const wheelDataPresets = {
  semua: ["Kiya", "Rafa", "Gilang", "Haris", "Wandi", "Alvin", "Fhidel", "Rojul", "Firli", "Afzal", "Muhtar", "Fadil", "Ainun", "Melisa", "Astria", "Fitri", "Sania", "Sri", "Adelia", "Dini", "Rahmi", "Salwa", "Alfahra", "Gisni", "Marisyha", "Husna", "Mulia", "Mutiara"],
  pria: ["Kiya", "Rafa", "Gilang", "Haris", "Wandi", "Alvin", "Fhidel", "Rojul", "Firli", "Afzal", "Muhtar", "Fadil"],
  wanita: ["Ainun", "Melisa", "Astria", "Fitri", "Sania", "Sri", "Adelia", "Dini", "Rahmi", "Salwa", "Alfahra", "Gisni", "Marisyha", "Husna", "Mulia", "Mutiara"]
};

let wheelItems = [...wheelDataPresets.semua];
let currentDegree = 0;
let isSpinning = false;
const colors = ["#0284c7", "#f59e0b", "#10b981", "#ec4899", "#8b5cf6", "#f97316", "#14b8a6", "#6366f1"];

function drawWheel() {
  const canvas = document.getElementById('wheel-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const numItems = wheelItems.length;
  const arc = (2 * Math.PI) / numItems;
  const radius = canvas.width / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < numItems; i++) {
    const angle = i * arc;
    ctx.beginPath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.moveTo(radius, radius);
    ctx.arc(radius, radius, radius, angle, angle + arc);
    ctx.lineTo(radius, radius);
    ctx.fill();

    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(angle + arc / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(wheelItems[i], radius - 15, 4);
    ctx.restore();
  }
}

function setWheelPreset(type) {
  if (isSpinning) return;
  wheelItems = [...wheelDataPresets[type]];
  drawWheel();
  document.getElementById('wheel-winner').innerText = "Mode: " + type.toUpperCase();
}

function updateWheelFromCustom() {
  if (isSpinning) return;
  const val = document.getElementById('wheel-custom-input').value;
  const list = val.split(',').map(s => s.trim()).filter(s => s.length > 0);
  if (list.length >= 2) {
    wheelItems = list;
    drawWheel();
    document.getElementById('wheel-winner').innerText = "Custom List Ready!";
  } else {
    alert("Masukkan minimal 2 nama/item yang dipisahkan koma!");
  }
}

function spinWheel() {
  if (isSpinning || wheelItems.length === 0) return;
  
  // Jika tersisa 1 nama, beri peringatan
  if (wheelItems.length === 1) {
    alert("Tersisa 1 nama lagi di dalam roda!");
  }

  isSpinning = true;

  const spinBtn = document.getElementById('spin-btn');
  spinBtn.disabled = true;
  spinBtn.classList.add('opacity-50');

  const extraSpins = 5 + Math.floor(Math.random() * 5);
  const randomDegree = Math.floor(Math.random() * 360);
  const totalDegrees = extraSpins * 360 + randomDegree;

  currentDegree += totalDegrees;
  const canvas = document.getElementById('wheel-canvas');
  canvas.style.transform = `rotate(${currentDegree}deg)`;

  setTimeout(() => {
    isSpinning = false;
    spinBtn.disabled = false;
    spinBtn.classList.remove('opacity-50');

    const finalDegree = currentDegree % 360;
    const wheelAngleAtPointer = (270 - finalDegree + 3600) % 360;
    const arcDegree = 360 / wheelItems.length;
    const winnerIndex = Math.floor(wheelAngleAtPointer / arcDegree) % wheelItems.length;

    const winner = wheelItems[winnerIndex];
    document.getElementById('wheel-winner').innerText = "🎉 " + winner + " (Telah Dihapus)";

    // Hapus nama terpilih dari array wheelItems
    wheelItems.splice(winnerIndex, 1);

    // Gambar ulang roda dengan sisa nama yang ada
    if (wheelItems.length > 0) {
      drawWheel();
    } else {
      // Jika semua nama sudah habis terpilih
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      document.getElementById('wheel-winner').innerText = "🏁 Semua nama sudah terpilih!";
    }
  }, 4000);
}