# AI STUDIO — sayt

AI rasm va video xizmatlarini sotish uchun landing sayt. Toza HTML/CSS/JS, media fayllar `assets/` papkasida — HTML ichida base64 ishlatilmagan.

## Struktura

```
ai-studio/
├── index.html
├── style.css
├── script.js
├── assets/
│   ├── images/
│   │   ├── logo.webp
│   │   ├── favicon.png
│   │   ├── models/        (model yuzlari — hozircha vaqtinchalik manzildan)
│   │   └── portfolio/     (rasm namunalari + video poster rasmlar)
│   └── videos/             (video-01.mp4 ... video-07.mp4)
└── .github/workflows/pages.yml   (GitHub Pages avtomatik deploy)
```

## GitHub Pages'ga joylash

1. Shu papkani GitHub repository qiling (masalan `JASCOJI123/JAS`), `main` branchga push qiling.
2. Repository → Settings → Pages → Source: **GitHub Actions** tanlang.
3. `main`ga har push qilganingizda sayt avtomatik yangilanadi (`.github/workflows/pages.yml` shuni bajaradi).
4. Bir necha daqiqadan so'ng sayt `https://<username>.github.io/<repo>/` manzilida ochiladi.

## Nimalarni almashtirish kerak

- **Hamkor logotipi**: `assets/images/logo.webp` — o'zingizning logotipingiz bilan almashtiring.
- **Hamkor havolasi**: `script.js` faylida `PARTNER_LINK` qatori.
- **Model yuzlari**: hozircha `script.js`dagi `MODEL_IMAGES` vaqtinchalik (placeholder) manzillardan foydalanmoqda. Haqiqiy 10 ta model rasmini `assets/images/models/` papkasiga joylab, `MODEL_IMAGES` massivini shu fayllarga ko'rsating.
- **Hero rasm**: `index.html`dagi `.hero-visual img` — hozircha vaqtinchalik, o'zingizning rasmingiz bilan almashtiring va `assets/images/hero.webp` sifatida saqlang.
- **Telegram buyurtma**: `script.js`dagi `orderBtn.href` qatori — hozir umumiy Telegram ulashish havolasi, xohlasangiz to'g'ridan-to'g'ri o'z Telegram botingiz/akkauntingizga yo'naltirish mumkin.

## Media optimizatsiya haqida

Rasmlar WebP formatida, videolar H.264 MP4 formatida siqilgan holda joylashtirilgan. Portfolio rasm va videolar `loading="lazy"` / `preload="metadata"` bilan yuklanadi — sayt tez ochiladi, hammasi darhol yuklanmaydi.
