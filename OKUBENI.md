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
- `src/content.js` → `email: 'hello@elsa.studio'` yer tutucu; gerçek adresi yaz.
- Hakkımızda bölümündeki "Diyarbakır merkezli" ifadesini doğrula.
