const loader = document.querySelector('#loader');
const invitation = document.querySelector('#invitation');
const openBtn = document.querySelector('#openInvite');
const audio = document.querySelector('#music');
const musicToggle = document.querySelector('#musicToggle');
const burst = document.querySelector('#burst');
const popup = document.querySelector('#revealPopup');
const popupDetail = document.querySelector('#popupDetail');
let opened = false;
let popupTimer;

function playMusic() {
  audio.play().then(() => { musicToggle.title = 'Pause music'; }).catch(() => { musicToggle.title = 'Play music'; });
}

openBtn.addEventListener('click', () => {
  if (opened) return;
  opened = true;
  loader.classList.add('open');
  setTimeout(() => { loader.classList.add('hide'); invitation.classList.add('ready'); invitation.setAttribute('aria-hidden', 'false'); window.scrollTo(0, 0); playMusic();}, 1050);
});

musicToggle.addEventListener('click', () => {
  if (audio.paused) playMusic();
  else { audio.pause(); musicToggle.title = 'Play music'; }
});

const target = new Date('2026-09-16T10:30:00+05:30').getTime();
function tick() {
  const remaining = Math.max(0, target - Date.now());
  const values = { days: Math.floor(remaining / 86400000), hours: Math.floor(remaining / 3600000) % 24, minutes: Math.floor(remaining / 60000) % 60, seconds: Math.floor(remaining / 1000) % 60 };
  Object.entries(values).forEach(([unit, value]) => { document.querySelector(`[data-unit="${unit}"]`).textContent = String(value).padStart(unit === 'days' ? 3 : 2, '0'); });
}
tick(); setInterval(tick, 1000);

const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('show'); observer.unobserve(entry.target); } }), { threshold: .13 });
document.querySelectorAll('.reveal').forEach(element => observer.observe(element));

function petals(x, y) {
  for (let i = 0; i < 30; i++) {
    const petal = document.createElement('i');
    petal.className = 'petal'; petal.style.left = `${x}px`; petal.style.top = `${y}px`;
    petal.style.setProperty('--x', `${Math.random() * 240 - 120}px`); petal.style.setProperty('--y', `${Math.random() * -190 - 10}px`);
    petal.style.background = ['#d9a0aa', '#f4d7a9', '#fff2cf'][i % 3]; burst.appendChild(petal); setTimeout(() => petal.remove(), 1300);
  }
}
function showReveal(label) {
  clearTimeout(popupTimer);
  popupTimer = setTimeout(() => {
    popupDetail.textContent = label; popup.classList.add('show'); popup.setAttribute('aria-hidden', 'false');
    popupTimer = setTimeout(() => { popup.classList.remove('show'); popup.setAttribute('aria-hidden', 'true'); }, 2200);
  }, 560);
}
popup.addEventListener('click', () => { popup.classList.remove('show'); popup.setAttribute('aria-hidden', 'true'); });

document.querySelectorAll('canvas.scratch').forEach(canvas => {
  const ctx = canvas.getContext('2d'); let done = false; let down = false;
  function size() {
    const rect = canvas.getBoundingClientRect(); const density = devicePixelRatio;
    canvas.width = rect.width * density; canvas.height = rect.height * density; ctx.scale(density, density);
    const gradient = ctx.createRadialGradient(rect.width * .35, rect.height * .25, 0, rect.width / 2, rect.height / 2, rect.width * .7);
    gradient.addColorStop(0, '#dfc37b'); gradient.addColorStop(.55, '#ad7d3c'); gradient.addColorStop(1, '#744823');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, rect.width, rect.height); ctx.fillStyle = '#fff0bd'; ctx.font = 'italic 26px Georgia'; ctx.textAlign = 'center'; ctx.fillText('Scratch', rect.width / 2, rect.height / 2 + 8);
  }
  size(); window.addEventListener('resize', () => { if (!done) size(); });
  function scratch(event) {
    if (!down || done) return;
    const rect = canvas.getBoundingClientRect(); const point = event.touches ? event.touches[0] : event; const x = point.clientX - rect.left; const y = point.clientY - rect.top;
    ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath(); ctx.arc(x, y, 24, 0, Math.PI * 2); ctx.fill();
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data; let clear = 0;
    for (let index = 3; index < data.length; index += 24) if (data[index] === 0) clear++;
    if (clear > (data.length / 24) * .42) {
      done = true; canvas.classList.add('scratched'); canvas.style.transition = 'opacity .65s'; canvas.style.opacity = 0;
      petals(rect.left + rect.width / 2, rect.top + rect.height / 2); showReveal(canvas.dataset.label); if (navigator.vibrate) navigator.vibrate([30, 25, 55]);
    }
  }
  canvas.addEventListener('pointerdown', event => { down = true; canvas.setPointerCapture(event.pointerId); scratch(event); });
  canvas.addEventListener('pointermove', scratch);
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(type => canvas.addEventListener(type, () => { down = false; }));
});

window.addEventListener('scroll', () => { document.querySelector('.fixed-rings').style.transform = `translateY(${window.scrollY * .035}px) rotate(${window.scrollY * .05}deg)`; }, { passive: true });
