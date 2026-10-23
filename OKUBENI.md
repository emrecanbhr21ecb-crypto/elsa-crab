# Elsa Studio — 3D tanıtım sitesi

## En hızlı yol: hazır siteyi aç (Node gerekmez)
`dist/` klasörü derlenmiş sitedir. Tarayıcı güvenlik kuralları yüzünden
`index.html`'e çift tıklamak çalışmaz; küçük bir yerel sunucu gerekir:

- **Mac:** `site-ac.command` dosyasına çift tıkla
  (ilk seferde "tanımlanmamış geliştirici" uyarısı çıkarsa: sağ tık → Aç).
- **Windows:** `site-ac.bat` dosyasına çift tıkla.
- **Elle:** terminalde `cd dist && python3 -m http.server 8080` → http://localhost:8080

## Geliştirme (kodu değiştirmek için)
Node.js 18+ gerekir.

```bash
npm install
npm run dev      # http://127.0.0.1:5190 — değişiklikler anında görünür
npm run build    # dist/ klasörünü yeniden üretir
```

## Yayına alma
**GitHub Pages (otomatik):** `main`'e her push'ta `.github/workflows/deploy-pages.yml` siteyi
derleyip yayınlar. İlk seferde bir kez: repo → Settings → Pages → Source: **GitHub Actions**.
(Private repoda Pages için GitHub Pro gerekir; değilse repo public olmalı.)

Elle:
`npm run build` sonrası `dist/` klasörünün içeriğini herhangi bir statik
barındırmaya yükle: Netlify (klasörü sürükle-bırak), Vercel, Firebase Hosting,
GitHub Pages. Yönlendirme `#/` ile yapıldığı için ek ayar gerekmez.

## Nerede ne var
- `src/content.js` — TÜM metinler (TR/EN), ürünler, web siteleri, rakamlar
- `src/scenes/` — her sayfanın 3D sahnesi (home, mesh, sand, sores, alchemy, salah, bazalt, fitkoc, web)
- `src/main.js` — sayfa şablonları, yönlendirme, HUD, kaydırma
- `src/style.css` — tasarım
- `public/media`, `public/video` — görseller ve videolar

## Yayından önce kontrol et
- Alan adı `https://elsacrob.com/` varsayıldı: `index.html` (canonical, og:url, og:image,
  JSON-LD), `public/robots.txt`, `public/sitemap.xml` ve `src/content.js` → `studio.site`.
  Site başka bir adreste yayınlanacaksa bu yerleri değiştir.
- Paylaşım görseli `public/og-image.jpg` (1200×630) ana sayfanın açılış karesinden alındı.
- Kurucu metni (`src/content.js` → `home.about.founder`) yalnız projelerden görünen bilgiyle
  yazıldı; eğitim, şehir gibi kişisel ayrıntı eklenecekse oraya.

## Dayanıklılık
- WebGL açılamazsa site 3D'siz açılır (`body.no-webgl`): metinler tam, ürün sayfalarında kapak görseli.
- "Hareketi azalt" (`prefers-reduced-motion`) açıksa yumuşak kaydırma, film greni ve RGB vuruşu kapanır,
  3D ortam hareketi yavaşlar.
