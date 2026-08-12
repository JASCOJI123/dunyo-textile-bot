/* ============================================================
   AI STUDIO — script.js
   Barcha media fayllar CDN/assets papkasidan yuklanadi.
   Base64 ISHLATILMAYDI — TZ talabiga muvofiq.
   ============================================================ */

/* ---- mobile nav ---- */
const burgerBtn = document.getElementById('burgerBtn');
const mainNav = document.getElementById('mainNav');
burgerBtn.addEventListener('click', () => mainNav.classList.toggle('open'));
mainNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mainNav.classList.remove('open')));

/* ---- header: pastga scroll qilinsa yashirinadi, yuqoriga qaytilsa chiqadi ---- */
const headerEl = document.querySelector('header');
let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (y > lastScrollY && y > 120) {
    headerEl.classList.add('hide-header');
    mainNav.classList.remove('open');
  } else {
    headerEl.classList.remove('hide-header');
  }
  lastScrollY = y;
}, { passive: true });

/* ---- scroll reveal (kuchliroq: scale + slide) ---- */
const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
}, { threshold: .12 });
document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => obs.observe(el));

/* ---- hero video — scroll-driven playback / scrubbing ---- */
const heroSection = document.querySelector('.hero');
const heroVisual = document.querySelector('.hero-visual');
const heroVideo = document.getElementById('heroScrollVideo');
const orb1 = document.querySelector('.glow-orb-1');
const orb2 = document.querySelector('.glow-orb-2');
let heroVideoReady = false;
let heroScrubQueued = false;

if (heroVideo) {
  heroVideo.addEventListener('loadedmetadata', () => {
    heroVideoReady = Number.isFinite(heroVideo.duration) && heroVideo.duration > 0;
    heroVideo.pause();
    heroVideo.currentTime = 0;
  });
}

function scrubHeroVideo() {
  heroScrubQueued = false;
  if (!heroSection || !heroVideo || !heroVideoReady) return;

  const start = heroSection.offsetTop;
  const distance = Math.max(1, heroSection.offsetHeight - window.innerHeight);
  const progress = Math.min(1, Math.max(0, (window.scrollY - start) / distance));
  const targetTime = progress * Math.max(0, heroVideo.duration - 0.05);

  if (Math.abs(heroVideo.currentTime - targetTime) > 0.015) {
    try { heroVideo.currentTime = targetTime; } catch (_) {}
  }

  if (orb1) orb1.style.transform = `translateY(${progress * 70}px)`;
  if (orb2) orb2.style.transform = `translateY(${-progress * 50}px)`;
}

window.addEventListener('scroll', () => {
  if (!heroScrubQueued) {
    heroScrubQueued = true;
    requestAnimationFrame(scrubHeroVideo);
  }
}, { passive: true });
window.addEventListener('resize', scrubHeroVideo);
if (heroVideo) heroVideo.addEventListener('loadeddata', scrubHeroVideo);
scrubHeroVideo();

/* ---- raqamlar scroll qilinganda 0 dan sanab chiqadi ---- */
function animateCount(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1300;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4); // easeOutQuart
    const value = Math.round(target * eased);
    el.textContent = value.toLocaleString('fr-FR').replace(/,/g, ' ');
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target.toLocaleString('fr-FR').replace(/,/g, ' ');
  }
  requestAnimationFrame(tick);
}
const countObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { animateCount(e.target); countObs.unobserve(e.target); }
  });
}, { threshold: .4 });
document.querySelectorAll('.count-num').forEach(el => countObs.observe(el));

/* ============================================================
   PARTNERS MARQUEE — bitta logo joyi, harakatlanadigan animatsiya
   Logotipni almashtirish uchun LOGO_URL manzilini o'zgartiring.
   ============================================================ */
const LOGO_URL = "assets/images/logo.webp";
const PARTNER_LINK = "https://t.me/dunyotextil"; // hamkor bosilganda shu Telegram katalogiga o'tadi
const marqueeTrack = document.getElementById('marqueeTrack');
const slotHTML = LOGO_URL
  ? `<a class="logo-slot" href="${PARTNER_LINK}" target="_blank" rel="noopener" style="background:#fff;border:1px solid var(--line);"><img src="${LOGO_URL}" alt="Hamkor logotipi" loading="lazy" decoding="async"></a>`
  : `<div class="logo-slot">LOGO shu yerga</div>`;
marqueeTrack.innerHTML = slotHTML.repeat(10);

/* ============================================================
   MENING ISHLARIM — rasm va video alohida joylarda
   ============================================================ */
/* ============================================================
   LIGHTBOX — bosilganda rasm/video to'liq ekranda ochiladi
   Video ovozi bilan (unmuted) ijro etiladi.
   ============================================================ */
const lightbox = document.getElementById('lightbox');
const lightboxInner = document.getElementById('lightboxInner');
const lightboxClose = document.getElementById('lightboxClose');

function openLightbox(type, src, poster) {
  if (type === 'video') {
    lightboxInner.innerHTML = `<video src="${src}" ${poster ? `poster="${poster}"` : ''} controls autoplay playsinline></video>`;
  } else {
    lightboxInner.innerHTML = `<img src="${src}" alt="">`;
  }
  lightbox.classList.add('open');
}
function closeLightbox() {
  lightbox.classList.remove('open');
  lightboxInner.innerHTML = '';
}
lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

const photoGrid = document.getElementById('photoGrid');
const videoGrid = document.getElementById('videoGrid');

const REAL_PHOTOS = [
  "assets/images/portfolio/photo-01.webp",
  "assets/images/portfolio/photo-02.webp",
  "assets/images/portfolio/photo-03.webp"
];
REAL_PHOTOS.forEach((src) => {
  const item = document.createElement('div');
  item.className = 'work-item';
  item.innerHTML = `<img src="${src}" alt="Rasm ish namunasi" loading="lazy" decoding="async">`;
  item.addEventListener('click', () => openLightbox('photo', src));
  photoGrid.appendChild(item);
});

const REAL_VIDEOS = [
  { src: "assets/videos/video-01.mp4", poster: "assets/images/portfolio/video-01-poster.webp" },
  { src: "assets/videos/video-02.mp4", poster: "assets/images/portfolio/video-02-poster.webp" },
  { src: "assets/videos/video-03.mp4", poster: "assets/images/portfolio/video-03-poster.webp" },
  { src: "assets/videos/video-04.mp4", poster: "assets/images/portfolio/video-04-poster.webp" },
  { src: "assets/videos/video-05.mp4", poster: "assets/images/portfolio/video-05-poster.webp" },
  { src: "assets/videos/video-06.mp4", poster: "assets/images/portfolio/video-06-poster.webp" },
  { src: "assets/videos/video-07.mp4", poster: "assets/images/portfolio/video-07-poster.webp" },
  { src: "assets/videos/video-08.mp4", poster: "assets/images/portfolio/video-08-poster.webp" },
  { src: "assets/videos/video-09.mp4", poster: "assets/images/portfolio/video-09-poster.webp" },
  { src: "assets/videos/video-10.mp4", poster: "assets/images/portfolio/video-10-poster.webp" },
  { src: "assets/videos/video-11.mp4", poster: "assets/images/portfolio/video-11-poster.webp" },
];

REAL_VIDEOS.forEach(({ src, poster }) => {
  const item = document.createElement('div');
  item.className = 'work-item';
  item.innerHTML = `
    <video src="${src}" poster="${poster}" muted loop playsinline preload="metadata"></video>
    <div class="play"><span>▶</span></div>`;
  const previewVideo = item.querySelector('video');
  item.addEventListener('mouseenter', () => previewVideo.play().catch(() => {}));
  item.addEventListener('mouseleave', () => { previewVideo.pause(); previewVideo.currentTime = 0; });
  item.addEventListener('click', () => openLightbox('video', src, poster));
  videoGrid.appendChild(item);
});

document.querySelectorAll('.work-tabs button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.work-tabs button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const isPhoto = btn.dataset.work === 'photo';
    document.getElementById('panel-photo').style.display = isPhoto ? 'block' : 'none';
    document.getElementById('panel-video').style.display = isPhoto ? 'none' : 'block';
  });
});

/* ============================================================
   MODEL TANLASH — bir nechta model yuzini tanlash
   Namunaviy rasmlar hozircha vaqtincha manzildan.
   Haqiqiy yuzlarni assets/images/models/ papkasiga qo'yib,
   quyidagi MODEL_IMAGES ro'yxatini shu fayl nomlariga almashtiring.
   ============================================================ */
const MODEL_IMAGES = Array.from({ length: 10 }, (_, i) =>
  `https://picsum.photos/seed/aistudio-model-${i + 1}/400/520` // TODO: assets/images/models/model-XX.webp bilan almashtiring
);

const modelGrid = document.getElementById('modelGrid');
let selectedModels = [];
MODEL_IMAGES.forEach((src, idx) => {
  const i = idx + 1;
  const card = document.createElement('div');
  card.className = 'model-card';
  card.dataset.id = i;
  card.innerHTML = `<img src="${src}" alt="Model yuzi ${i}" loading="lazy" decoding="async">
                     <span class="num">${String(i).padStart(2, '0')}</span>
                     <span class="check">✓</span>`;
  card.addEventListener('click', () => {
    card.classList.toggle('sel');
    if (card.classList.contains('sel')) { selectedModels.push(i); }
    else { selectedModels = selectedModels.filter(x => x !== i); }
    document.getElementById('selCount').textContent = selectedModels.length;
  });
  modelGrid.appendChild(card);
});

/* ============================================================
   NARX HISOBLAGICH
   ============================================================ */
const PHOTO_PRICE = 50000, VIDEO_PRICE = 100000;
let mode = 'single';
let photoQty = 0, videoQty = 0;
let selectedPkg = null;

const modeButtons = document.querySelectorAll('.mode-toggle button');
const panelSingle = document.getElementById('panel-single');
const panelPackage = document.getElementById('panel-package');

modeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    modeButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    mode = btn.dataset.mode;
    panelSingle.style.display = mode === 'single' ? 'block' : 'none';
    panelPackage.style.display = mode === 'package' ? 'block' : 'none';
    render();
  });
});

document.querySelectorAll('.counter button').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.target;
    const delta = parseInt(btn.dataset.delta);
    if (target === 'photo') { photoQty = Math.max(0, photoQty + delta); document.getElementById('photoVal').textContent = photoQty; }
    if (target === 'video') { videoQty = Math.max(0, videoQty + delta); document.getElementById('videoVal').textContent = videoQty; }
    render();
  });
});

document.querySelectorAll('.pkg-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.pkg-card').forEach(c => c.classList.remove('sel'));
    card.classList.add('sel');
    selectedPkg = {
      name: card.querySelector('h4').textContent,
      price: parseInt(card.dataset.price),
      desc: card.dataset.desc
    };
    render();
  });
});

/* Buyurtma shu Telegram admin akkauntiga boradi.
   O'zingizning Telegram username'ingizni shu yerga yozing (masalan "dunyo_admin"). */
const ADMIN_USERNAME = "jascoav";

const receiptLines = document.getElementById('receiptLines');
const totalAmt = document.getElementById('totalAmt');
const orderBtn = document.getElementById('orderBtn');
const brandInput = document.getElementById('brandName');

function fmt(n) { return n.toLocaleString('fr-FR').replace(/,/g, ' ') + " so'm"; }

function render() {
  let lines = [];
  let total = 0;
  let orderText = "";
  const brand = brandInput.value.trim();
  const brandLine = brand ? `%0ABrend: ${encodeURIComponent(brand)}` : "";
  const modelsLine = selectedModels.length ? `%0AModel: ${encodeURIComponent(selectedModels.map(m => 'Model ' + String(m).padStart(2, '0')).join(', '))}` : "";

  if (mode === 'single') {
    if (photoQty > 0) { lines.push(`<div class="r-line"><span>AI Rasm × ${photoQty}</span><b>${fmt(photoQty * PHOTO_PRICE)}</b></div>`); total += photoQty * PHOTO_PRICE; }
    if (videoQty > 0) { lines.push(`<div class="r-line"><span>AI Video × ${videoQty}</span><b>${fmt(videoQty * VIDEO_PRICE)}</b></div>`); total += videoQty * VIDEO_PRICE; }
    if (lines.length === 0) { lines.push(`<div class="r-line"><span>Hali tanlanmagan</span></div>`); }
    orderText = `AI STUDIO BUYURTMA${brandLine}%0AXizmat:%0A- AI Rasm: ${photoQty} dona%0A- AI Video: ${videoQty} dona${modelsLine}%0AJami: ${encodeURIComponent(fmt(total))}`;
  } else {
    if (selectedPkg) {
      lines.push(`<div class="r-line"><span>${selectedPkg.name} paket</span><b>${fmt(selectedPkg.price)}</b></div>`);
      lines.push(`<div class="r-line"><span>${selectedPkg.desc}</span></div>`);
      total = selectedPkg.price;
      orderText = `AI STUDIO BUYURTMA${brandLine}%0APaket: ${encodeURIComponent(selectedPkg.name)} (${encodeURIComponent(selectedPkg.desc)})${modelsLine}%0AJami: ${encodeURIComponent(fmt(total))}`;
    } else {
      lines.push(`<div class="r-line"><span>Paket tanlanmagan</span></div>`);
      orderText = `Salom! AI Studio paketlari haqida ma'lumot olmoqchiman.`;
    }
  }

  receiptLines.innerHTML = lines.join('');
  totalAmt.textContent = fmt(total);
  totalAmt.classList.add('pulse');
  setTimeout(() => totalAmt.classList.remove('pulse'), 150);
  orderBtn.href = `https://t.me/${ADMIN_USERNAME}?text=${orderText}`;
}

brandInput.addEventListener('input', render);

render();
