/* ============================================================
   AI STUDIO — script.js
   Barcha media fayllar CDN/assets papkasidan yuklanadi.
   Base64 ISHLATILMAYDI — TZ talabiga muvofiq.
   ============================================================ */

/* ---- mobile nav ---- */
const burgerBtn = document.getElementById('burgerBtn');
const mainNav = document.getElementById('mainNav');
burgerBtn.addEventListener('click', () => {
  mainNav.classList.toggle('open');
  document.body.classList.toggle('nav-open', mainNav.classList.contains('open'));
});
mainNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mainNav.classList.remove('open');
  document.body.classList.remove('nav-open');
}));

/* ---- header: pastga scroll qilinsa yashirinadi, yuqoriga qaytilsa chiqadi ---- */
const headerEl = document.querySelector('header');
let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  headerEl.classList.toggle('scrolled', y > 30);
  if (y > lastScrollY && y > 120) {
    headerEl.classList.add('hide-header');
    mainNav.classList.remove('open');
  } else {
    headerEl.classList.remove('hide-header');
  }
  lastScrollY = y;
}, { passive: true });

/* ---- film grain (kinematik shovqin effekti, past o'lchamda chizib katta ko'rsatiladi — tez ishlaydi) ---- */
(function initGrain() {
  const canvas = document.createElement('canvas');
  canvas.id = 'grain';
  canvas.width = 160; canvas.height = 160;
  canvas.style.width = '100%'; canvas.style.height = '100%';
  canvas.style.imageRendering = 'pixelated';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(160, 160);
  const buf = new Uint32Array(imgData.data.buffer);
  function draw() {
    for (let i = 0; i < buf.length; i++) {
      const shade = (Math.random() * 255) | 0;
      buf[i] = (255 << 24) | (shade << 16) | (shade << 8) | shade;
    }
    ctx.putImageData(imgData, 0, 0);
    setTimeout(() => requestAnimationFrame(draw), 90);
  }
  draw();
})();

/* ---- scroll reveal (kuchliroq: scale + slide) ---- */
const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
}, { threshold: .12 });
document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => obs.observe(el));

/* ---- parallax: hero video scroll bilan sekin harakatlanadi ---- */
const heroVisual = document.querySelector('.hero-visual');
const heroVideo = heroVisual ? heroVisual.querySelector('video') : null;

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (heroVisual) heroVisual.style.transform = `translateY(${y * 0.1}px)`;
}, { passive: true });

if (heroVideo) {
  const heroObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) heroVideo.play().catch(() => {});
      else heroVideo.pause();
    });
  }, { threshold: .3 });
  heroObs.observe(heroVisual);
}

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
   COVERFLOW — 3D perspektivali karusel (Ishlarim + Model tanlash)
   ============================================================ */
function initCoverflow(container, opts = {}) {
  const stepPx = opts.stepPx ?? 130;
  const angle = opts.angle ?? 42;
  let items = [];
  let active = 0;

  function render() {
    items.forEach((item, i) => {
      const offset = i - active;
      const abs = Math.abs(offset);
      const clamped = Math.max(-4, Math.min(4, offset));
      const tx = clamped * stepPx;
      const rot = clamped === 0 ? 0 : -Math.sign(clamped) * angle;
      const scale = abs === 0 ? 1 : Math.max(.62, 1 - abs * .14);
      const tz = -abs * 90;
      const opacity = abs > 4 ? 0 : 1 - abs * .18;
      item.style.transform = `translate(-50%,-50%) translateX(${tx}px) translateZ(${tz}px) rotateY(${rot}deg) scale(${scale})`;
      item.style.zIndex = String(100 - abs);
      item.style.opacity = String(Math.max(0, opacity));
      item.style.pointerEvents = abs > 4 ? 'none' : 'auto';
      item.classList.toggle('cf-active', offset === 0);
    });
  }

  function goTo(i) {
    active = Math.max(0, Math.min(items.length - 1, i));
    render();
  }

  function setItems(newItems) {
    items = newItems;
    active = 0;
    items.forEach((item, i) => {
      item.addEventListener('click', (e) => {
        const offset = i - active;
        if (offset !== 0) { e.stopImmediatePropagation(); e.preventDefault(); goTo(i); }
      }, true);
    });
    render();
  }

  /* sudrab (drag) aylantirish */
  let dragging = false, startX = 0, startActive = 0, moved = false;
  container.addEventListener('pointerdown', (e) => {
    dragging = true; moved = false; startX = e.clientX; startActive = active;
    container.setPointerCapture(e.pointerId);
  });
  container.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 4) moved = true;
    const deltaSteps = -dx / stepPx;
    goTo(Math.round(startActive + deltaSteps));
  });
  function endDrag() { dragging = false; }
  container.addEventListener('pointerup', endDrag);
  container.addEventListener('pointercancel', endDrag);
  container.addEventListener('pointerleave', endDrag);
  container.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault();
      goTo(active + (e.deltaX > 0 ? 1 : -1));
    }
  }, { passive: false });

  return { setItems, goTo, next: () => goTo(active + 1), prev: () => goTo(active - 1) };
}

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
const photoCoverflow = initCoverflow(photoGrid);
const videoCoverflow = initCoverflow(videoGrid);
document.getElementById('photoPrev').addEventListener('click', photoCoverflow.prev);
document.getElementById('photoNext').addEventListener('click', photoCoverflow.next);
document.getElementById('videoPrev').addEventListener('click', videoCoverflow.prev);
document.getElementById('videoNext').addEventListener('click', videoCoverflow.next);

const REAL_PHOTOS = [
  "assets/images/portfolio/photo-01.webp",
  "assets/images/portfolio/photo-02.webp",
  "assets/images/portfolio/photo-03.webp"
];
const photoItems = REAL_PHOTOS.map((src) => {
  const item = document.createElement('div');
  item.className = 'coverflow-item work-item';
  item.innerHTML = `<img src="${src}" alt="Rasm ish namunasi" loading="lazy" decoding="async">`;
  item.addEventListener('click', () => openLightbox('photo', src));
  photoGrid.appendChild(item);
  return item;
});
photoCoverflow.setItems(photoItems);

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

const videoItems = REAL_VIDEOS.map(({ src, poster }) => {
  const item = document.createElement('div');
  item.className = 'coverflow-item work-item';
  item.innerHTML = `
    <video src="${src}" poster="${poster}" muted loop playsinline preload="metadata"></video>
    <div class="play"><span>▶</span></div>`;
  const previewVideo = item.querySelector('video');
  item.addEventListener('mouseenter', () => { if (item.classList.contains('cf-active')) previewVideo.play().catch(() => {}); });
  item.addEventListener('mouseleave', () => { previewVideo.pause(); previewVideo.currentTime = 0; });
  item.addEventListener('click', () => openLightbox('video', src, poster));
  videoGrid.appendChild(item);
  return item;
});
videoCoverflow.setItems(videoItems);

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
const modelCoverflow = initCoverflow(modelGrid, { stepPx: 110, angle: 40 });
document.getElementById('modelPrev').addEventListener('click', modelCoverflow.prev);
document.getElementById('modelNext').addEventListener('click', modelCoverflow.next);

let selectedModels = [];
const modelItems = MODEL_IMAGES.map((src, idx) => {
  const i = idx + 1;
  const card = document.createElement('div');
  card.className = 'coverflow-item model-card';
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
  return card;
});
modelCoverflow.setItems(modelItems);

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
