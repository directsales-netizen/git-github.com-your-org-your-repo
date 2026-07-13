// Live clock
function updateClock() {
  const now = new Date();
  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes().toString().padStart(2, '0');
  const el = document.getElementById('clock');
  if (el) el.textContent = `${h}:${m}`;
}
updateClock();
setInterval(updateClock, 10000);

// Generate pseudo-random QR grid
const qrGrid = document.getElementById('qrGrid');
if (qrGrid) {
  const pattern = [
    1,1,1,0,1,0,1,1,1,0,
    1,0,1,0,0,0,1,0,1,0,
    1,1,1,1,0,1,1,1,1,1,
    0,0,1,0,1,0,0,1,0,0,
    1,1,0,1,1,1,0,0,1,1,
    0,1,0,0,1,0,1,1,0,1,
    1,1,1,0,0,0,1,0,1,0,
    0,0,1,1,0,1,0,1,1,0,
    1,0,0,0,1,1,1,0,0,1,
    1,1,0,1,0,0,1,1,1,1,
  ];
  pattern.forEach(v => {
    const cell = document.createElement('div');
    cell.className = 'qr-cell';
    cell.style.background = v
      ? 'rgba(0,229,255,0.85)'
      : 'rgba(0,229,255,0.04)';
    qrGrid.appendChild(cell);
  });
}

// Screen navigation
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active', 'slide-out');
  });
  const target = document.getElementById(`screen-${id}`);
  if (target) target.classList.add('active');
}

// Quick action buttons → screens
document.querySelectorAll('.action-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.action;
    const screenMap = { send: 'send', receive: 'receive', topup: 'send', pay: 'send' };
    if (screenMap[action]) showScreen(screenMap[action]);
  });
});

// Back buttons
document.querySelectorAll('.back-btn').forEach(btn => {
  btn.addEventListener('click', () => showScreen(btn.dataset.back || 'home'));
});

// Bottom nav
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    const screen = item.dataset.screen;
    if (screen === 'home') showScreen('home');
  });
});

// Send form mock submission
const sendForm = document.querySelector('#screen-send .send-form');
sendForm?.querySelector('.app-btn')?.addEventListener('click', () => {
  const btn = sendForm.querySelector('.app-btn');
  btn.textContent = 'Sending…';
  setTimeout(() => {
    btn.textContent = 'Sent!';
    setTimeout(() => {
      btn.textContent = 'Send Now';
      sendForm.querySelectorAll('input').forEach(i => i.value = '');
      showScreen('home');
    }, 1200);
  }, 900);
});

// Copy address mock
document.querySelector('#screen-receive .app-btn.outline')?.addEventListener('click', function() {
  this.textContent = 'Copied!';
  setTimeout(() => { this.textContent = 'Copy Address'; }, 1800);
});

// Card tilt on hover (desktop)
const card = document.querySelector('.balance-card');
if (card) {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    card.style.transform = `translateY(-2px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
}
