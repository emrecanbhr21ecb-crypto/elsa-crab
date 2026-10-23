import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { productBase } from './base.js';
import { tex, canvasTex, dust, near, smooth } from '../lib.js';
import { haloTex } from './home.js';

// Ehrenweg: henüz yayınlanmamış bir uygulama. BazaltGo'nun yoklama+pasaport
// çekirdeği yeniden kurgulanıyor — simge, QR yoklama + Entegrasyon Pasaportu,
// üç kazanım türü. Gerçek ekran yok; hepsi dürüstçe konsept görselleştirme.
//
// Arka plan "Ehrenweg" adının kendisi: derinliğe doğru kıvrılan, karanlıkta
// başlayıp ışıkla biten bir yol. Taş taş döşeli patika sayfa boyunca
// (s.p) arkadan öne aydınlanır, her taşın üstünde küçük bir fener yanar ve
// ardında bir ışık izi bırakır — atılan her adım, geride kalan topluluğa
// bağlanır.
const REWARDS = [
  { en: 'Integration score', tr: 'Entegrasyon Puanı', tag: 'IP', c: '#0f766e' },
  { en: 'Partner discounts', tr: 'Partner İndirimi', tag: '%', c: '#f59e0b' },
  { en: 'Cash vouchers', tr: 'Nakit Kupon', tag: '€', c: '#5b8cff' },
];

export function build({ renderer, product, lang: L0 }) {
  const b = productBase({ renderer, product, sky: [0x0f3b35, 0x0b1220, 0.9], fog: [0x0a1a18, 0.032], dustColor: 0xffd9a0, phone: false });
  const { scene, camera } = b;
  const lang = document.documentElement.lang === 'tr' ? 'tr' : 'en';

  const blobs = [0x0f766e, 0xf59e0b, 0x5b8cff].map((c, i) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshBasicMaterial({ map: haloTex(), color: c, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false }));
    m.position.set((i - 1) * 6, (i % 2) * 3 - 1, -14);
    scene.add(m);
    return m;
  });

  // ---- arka plan: karanlıktan ışığa kıvrılan taş patika ----
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const PATH_Y = -2.15;
  const TILES = 18;
  const pathPt = (u) => new THREE.Vector3(Math.sin(u * 3.3) * 4.6 + Math.sin(u * 7.1) * 0.6, PATH_Y, -2.2 - u * 25);

  const tileMat = new THREE.MeshStandardMaterial({ color: 0x171d22, roughness: 0.75, metalness: 0.1 });
  const glowTex = canvasTex(96, 96, (g, w) => {
    const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, w);
  });
  const flameTex = canvasTex(64, 64, (g, w) => {
    const gr = g.createRadialGradient(w / 2, w * 0.58, 0, w / 2, w * 0.58, w * 0.42);
    gr.addColorStop(0, '#fff3d6'); gr.addColorStop(0.5, '#ffb648'); gr.addColorStop(1, 'rgba(255,120,30,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, w);
  });
  const path = Array.from({ length: TILES }, (_, i) => {
    const u = i / (TILES - 1);
    const p = pathPt(u);
    const g = new THREE.Group();
    g.position.copy(p);
    g.lookAt(pathPt(Math.min(1, u + 0.06)));
    const tile = new THREE.Mesh(new RoundedBoxGeometry(0.82 + rnd() * 0.18, 0.1, 0.52 + rnd() * 0.12, 2, 0.06), tileMat);
    g.add(tile);
    const topGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.44), new THREE.MeshBasicMaterial({ map: glowTex, color: 0xf59e0b, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    topGlow.rotation.x = -Math.PI / 2;
    topGlow.position.y = 0.06;
    g.add(topGlow);
    const flame = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), new THREE.MeshBasicMaterial({ map: flameTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    flame.position.y = 0.4;
    g.add(flame);
    scene.add(g);
    return { g, topGlow, flame, th: u, p };
  });
  // taşlar arasında, yanan kısımları birbirine bağlayan ışık izi
  const trailMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
  const trails = path.slice(0, -1).map((a, i) => {
    const b2 = path[i + 1];
    const len = a.p.distanceTo(b2.p);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(len, 0.05), trailMat.clone());
    m.position.copy(a.p).lerp(b2.p, 0.5);
    m.position.y += 0.02;
    m.lookAt(b2.p.x, m.position.y, b2.p.z);
    m.rotateX(-Math.PI / 2);
    scene.add(m);
    return m;
  });
  const pathFireflies = dust({ count: 220, spread: 14, depth: 26, size: 0.045, color: 0xffd9a0, opacity: 0, y: PATH_Y + 0.6 });
  pathFireflies.position.z = -12;
  scene.add(pathFireflies);

  // ---- 1) simge ----
  const iconT = tex(product.icon, renderer);
  const front = new THREE.MeshStandardMaterial({ map: iconT, emissive: 0xffffff, emissiveMap: iconT, emissiveIntensity: 0.22, roughness: 0.3 });
  const sideM = new THREE.MeshPhysicalMaterial({ color: 0x0f766e, metalness: 0.5, roughness: 0.25, clearcoat: 1 });
  const icon = new THREE.Mesh(new RoundedBoxGeometry(2.6, 2.6, 0.32, 8, 0.5), [sideM, sideM, sideM, sideM, front, sideM]);
  scene.add(icon);
  const dotCols = [0xf59e0b, 0x0f766e];
  const dots = dotCols.map((c, i) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), new THREE.MeshBasicMaterial({ color: c, toneMapped: false }));
    const h = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshBasicMaterial({ map: haloTex(), color: c, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }));
    m.add(h);
    m.userData = { a: (i / dotCols.length) * Math.PI * 2 };
    icon.add(m);
    return m;
  });

  // ---- 0) aktivite kategorileri (plandaki gerçek aktivite türleri) ----
  const cats = (lang === 'tr' ? ['BAHÇE/PARK', 'YAŞLI DESTEĞİ', 'DİL DERSİ', 'MAHALLE'] : ['GARDEN/PARK', 'ELDER CARE', 'LANGUAGE', 'NEIGHBOURHOOD']).map((n, i) => {
    const c = ['#0f766e', '#f59e0b', '#5b8cff', '#e07a9e'][i];
    const t = canvasTex(360, 120, (g, w, h) => {
      g.fillStyle = 'rgba(10,20,18,0.85)';
      g.beginPath(); g.roundRect(2, 2, w - 4, h - 4, 60); g.fill();
      g.strokeStyle = c; g.lineWidth = 4; g.stroke();
      g.fillStyle = c; g.beginPath(); g.arc(58, h / 2, 16, 0, 7); g.fill();
      g.fillStyle = '#fff'; g.font = '600 30px Inter, sans-serif'; g.textBaseline = 'middle'; g.fillText(n, 92, h / 2 + 2);
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.53), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, toneMapped: false }));
    scene.add(m);
    return m;
  });

  // ---- 1) voksel QR + Entegrasyon Pasaportu ----
  const G = 25;
  const qr = new THREE.InstancedMesh(new RoundedBoxGeometry(0.1, 0.1, 0.1, 1, 0.02), new THREE.MeshStandardMaterial({ color: 0xbfe0d8, roughness: 0.6, metalness: 0.1, envMapIntensity: 0.5 }), G * G);
  const qrBack = new THREE.Mesh(new RoundedBoxGeometry(G * 0.11 + 0.5, G * 0.11 + 0.5, 0.08, 4, 0.12), new THREE.MeshPhysicalMaterial({ color: 0x0a2220, roughness: 0.3, clearcoat: 1 }));
  qrBack.position.z = -0.08;
  const qrG = new THREE.Group();
  qrG.add(qrBack, qr);
  scene.add(qrG);
  const finder = (x, y) => {
    for (const [fx, fy] of [[0, 0], [G - 7, 0], [0, G - 7]]) {
      const dx = x - fx, dy = y - fy;
      if (dx >= 0 && dx < 7 && dy >= 0 && dy < 7) {
        const ring = Math.max(Math.abs(dx - 3), Math.abs(dy - 3));
        return ring === 3 || ring <= 1 ? 1 : 0;
      }
    }
    return -1;
  };
  const codes = [0, 1].map(() => new Uint8Array(G * G));
  const rollCode = (arr) => {
    for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) {
      const f = finder(x, y);
      arr[y * G + x] = f >= 0 ? f : Math.random() < 0.48 ? 1 : 0;
    }
  };
  rollCode(codes[0]);
  rollCode(codes[1]);
  let codeIdx = 0, codeT = 0;
  const scan = new THREE.Mesh(new THREE.PlaneGeometry(G * 0.11 + 0.8, 0.06), new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  const scanGlow = new THREE.Mesh(new THREE.PlaneGeometry(G * 0.11 + 1.2, 0.7), new THREE.MeshBasicMaterial({ map: haloTex(), color: 0xf59e0b, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
  scan.position.z = 0.2;
  scanGlow.position.z = 0.19;
  qrG.add(scan, scanGlow);

  const passTex = canvasTex(512, 720, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, '#0b2a26'); gr.addColorStop(1, '#0f3b35');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(245,158,11,0.55)'; g.lineWidth = 3; g.strokeRect(22, 22, w - 44, h - 44);
    g.strokeStyle = '#f59e0b'; g.lineWidth = 7;
    g.beginPath(); g.arc(w / 2, 158, 56, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#f59e0b';
    g.beginPath(); g.moveTo(w / 2 - 20, 208); g.lineTo(w / 2 - 34, 268); g.lineTo(w / 2 - 6, 248); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(w / 2 + 20, 208); g.lineTo(w / 2 + 34, 268); g.lineTo(w / 2 + 6, 248); g.closePath(); g.fill();
    // soyut yol+kalp amblemi (gerçek ikon motifi)
    g.strokeStyle = '#0f766e'; g.lineWidth = 8; g.lineCap = 'round';
    g.beginPath(); g.moveTo(w / 2 - 22, 150); g.quadraticCurveTo(w / 2, 110, w / 2 + 18, 136); g.stroke();
    g.fillStyle = '#f59e0b'; g.textAlign = 'center';
    g.font = '700 38px Fraunces, Georgia, serif'; g.fillText(lang === 'tr' ? 'ENTEGRASYON' : 'INTEGRATION', w / 2, 320);
    g.font = '700 38px Fraunces, Georgia, serif'; g.fillText(lang === 'tr' ? 'PASAPORTU' : 'PASSPORT', w / 2, 368);
    g.fillStyle = 'rgba(255,255,255,0.55)'; g.font = '600 17px Inter, sans-serif'; g.letterSpacing = '2px';
    g.fillText('EHRENWEG', w / 2, 404);
    g.letterSpacing = '0px';
    g.strokeStyle = 'rgba(245,158,11,0.5)'; g.lineWidth = 2;
    g.strokeRect(w / 2 - 170, 448, 340, 94);
    g.fillStyle = 'rgba(255,255,255,0.5)'; g.font = '500 15px Inter, sans-serif';
    g.fillText(lang === 'tr' ? 'PASAPORT SAHİBİ' : 'PASSPORT HOLDER', w / 2, 480);
    g.fillStyle = '#ffffff'; g.font = '700 24px Inter, sans-serif';
    g.fillText(lang === 'tr' ? 'KULLANICI ADI' : 'USER NAME', w / 2, 520);
    g.fillStyle = 'rgba(255,255,255,0.4)'; g.font = '500 16px Inter, sans-serif';
    g.fillText(lang === 'tr' ? 'KONSEPT · HENÜZ YAYINDA DEĞİL' : 'CONCEPT · NOT LIVE YET', w / 2, 650);
  });
  const pageTex = canvasTex(512, 720, (g, w, h) => {
    g.fillStyle = '#f3ede0'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(15,118,110,.12)';
    for (let y = 60; y < h; y += 44) { g.beginPath(); g.moveTo(30, y); g.lineTo(w - 30, y); g.stroke(); }
    const stamps = ['#0f766e', '#f59e0b', '#5b8cff', '#19a463'];
    stamps.forEach((c, i) => {
      const x = 120 + (i % 2) * 270, y = 160 + Math.floor(i / 2) * 230;
      g.save(); g.translate(x, y); g.rotate((i % 3 - 1) * 0.18);
      g.strokeStyle = c; g.lineWidth = 6; g.globalAlpha = 0.85;
      g.beginPath(); g.arc(0, 0, 70, 0, 7); g.stroke();
      g.fillStyle = c; g.font = '700 24px Inter, sans-serif'; g.textAlign = 'center'; g.fillText('IP', 0, 10);
      g.restore();
    });
  });
  const passport = new THREE.Group();
  const cover = new THREE.MeshStandardMaterial({ map: passTex, roughness: 0.55, envMapIntensity: 0.5 });
  const paper = new THREE.MeshStandardMaterial({ map: pageTex, roughness: 0.9, color: 0x9a948a, envMapIntensity: 0.3 });
  const edge = new THREE.MeshStandardMaterial({ color: 0x24433d, roughness: 0.9 });
  const PW = 1.6, PH = 2.25;
  const backC = new THREE.Mesh(new THREE.BoxGeometry(PW, PH, 0.05), [edge, edge, edge, edge, paper, cover]);
  backC.position.x = PW / 2;
  const hinge = new THREE.Group();
  const frontC = new THREE.Mesh(new THREE.BoxGeometry(PW, PH, 0.05), [edge, edge, edge, edge, cover, paper]);
  frontC.position.set(PW / 2, 0, 0.05);
  hinge.add(frontC);
  passport.add(backC, hinge);
  scene.add(passport);

  // ---- 2) üç kazanım ----
  const rewards = REWARDS.map((R) => {
    const t = canvasTex(256, 256, (g, w) => {
      g.fillStyle = R.c;
      g.beginPath();
      for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2 + Math.PI / 6; g.lineTo(w / 2 + Math.cos(a) * 120, w / 2 + Math.sin(a) * 120); }
      g.closePath(); g.fill();
      g.fillStyle = 'rgba(255,255,255,.95)'; g.textAlign = 'center';
      g.font = '700 64px Fraunces, Georgia, serif'; g.fillText(R.tag, w / 2, 130);
      g.font = '600 18px Inter, sans-serif';
      const words = R[lang].toUpperCase().split(' ');
      words.forEach((wd, j) => g.fillText(wd, w / 2, 170 + j * 24));
    });
    t.center.set(0.5, 0.5);
    t.rotation = Math.PI / 2;
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.1, 6), [
      new THREE.MeshPhysicalMaterial({ color: new THREE.Color(R.c), metalness: 0.7, roughness: 0.3 }),
      new THREE.MeshStandardMaterial({ map: t, transparent: true, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.25 }),
      new THREE.MeshStandardMaterial({ map: t, transparent: true }),
    ]);
    m.geometry.rotateX(Math.PI / 2);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.64, 0.025, 8, 48), new THREE.MeshBasicMaterial({ color: R.c, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    const g = new THREE.Group();
    g.add(m, rim);
    scene.add(g);
    return g;
  });

  const M = new THREE.Matrix4(), V = new THREE.Vector3(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), AX = new THREE.Vector3(1, 0, 0);
  const key = new THREE.PointLight(0x7fe8d0, 12, 24);
  key.position.set(2, 3, 5);
  scene.add(key);

  const vis = (sp, i) => near(sp, i, 0.9);

  return {
    scene,
    camera,
    bloom: { strength: 0.4, radius: 0.55, threshold: 0.9 },
    update(t, dt, s) {
      const sd = b.tick(t, dt, s, { camZ: 9.5 });
      const X = s.mobile ? 0 : sd.x * 2.6;
      const Y = s.mobile ? 1.15 : 0;
      const sc = s.mobile ? 0.7 : 1;
      const N = product.sections.length;

      const vi = Math.max(vis(s.sp, 0), vis(s.sp, N + 1), smooth(N + 1.5, N + 2, s.sp));
      icon.scale.setScalar(sc * (0.3 + vi * 0.9));
      icon.position.set(X, Y + Math.sin(t) * 0.1, -2 + vi * 2);
      icon.rotation.set(Math.sin(t * 0.7) * 0.12 + s.mouseS.y * 0.2, Math.sin(t * 0.5) * 0.35 + s.mouseS.x * 0.3 + (1 - vi) * 3, 0);
      icon.visible = vi > 0.02;
      dots.forEach((m, i) => {
        const a = m.userData.a + t * 0.6;
        const r = 1.9 + Math.sin(t * 1.3 + i) * 0.1;
        m.position.set(Math.cos(a) * r, Math.sin(a) * r * 0.9, 0.3 + Math.sin(t * 2 + i) * 0.1);
      });

      const vCat = Math.max(vis(s.sp, 0), vis(s.sp, N + 1) * 0.6);
      cats.forEach((m, i) => {
        const a = (i / cats.length) * Math.PI * 2 + t * 0.25;
        m.visible = vCat > 0.02;
        m.position.set(X + Math.cos(a) * 2.6 * sc, Y + Math.sin(a * 1.0) * 1.5 * sc, Math.sin(a) * 1.2);
        m.scale.setScalar(Math.max(0.001, vCat * sc));
        m.lookAt(camera.position);
      });

      const vq = vis(s.sp, 1);
      qrG.visible = vq > 0.02;
      qrG.position.set(X - 1.3 * sc * vq, Y, -1 + vq);
      qrG.scale.setScalar(sc * vq * 0.85);
      qrG.rotation.set(s.mouseS.y * 0.2, -sd.x * 0.35 + Math.sin(t * 0.6) * 0.2, 0);
      codeT += dt;
      if (codeT > 2.4) {
        codeT = 0;
        codeIdx ^= 1;
        rollCode(codes[codeIdx]);
      }
      for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) {
        const i = y * G + x;
        const w = Math.min(1, Math.max(0, codeT * 3 - (x + y) / (G * 2) * 1.5));
        const on = codes[codeIdx][i] * w + codes[codeIdx ^ 1][i] * (1 - w);
        V.set((x - G / 2 + 0.5) * 0.11, (G / 2 - y - 0.5) * 0.11, on * 0.12);
        S.setScalar(on > 0.05 ? 0.4 + on * 0.6 : 0.0001);
        Q.setFromAxisAngle(AX, (1 - w) * w * 6);
        M.compose(V, Q, S);
        qr.setMatrixAt(i, M);
      }
      qr.instanceMatrix.needsUpdate = true;
      const sy = Math.sin(t * 2.2) * (G * 0.055) * 0.85;
      scan.position.y = scanGlow.position.y = sy;

      passport.visible = vq > 0.02;
      passport.position.set(X + 1.2 * sc * vq, Y, -1 + vq);
      passport.scale.setScalar(sc * vq * 1.1);
      passport.rotation.set(-0.15 + s.mouseS.y * 0.15, -sd.x * 0.25 + s.mouseS.x * 0.2 + 0.4, 0);
      hinge.rotation.y = -Math.PI * 0.7 * smooth(1.2, 1.7, s.sp) * (1 - smooth(2.0, 2.4, s.sp));

      const vr = vis(s.sp, 2);
      rewards.forEach((m, i) => {
        const a = (i / REWARDS.length) * Math.PI * 2 + t * 0.3;
        m.visible = vr > 0.02;
        m.position.set(X + Math.cos(a) * 2.1 * sc, Y + Math.sin(a) * 0.65 * sc, Math.sin(a) * 1.3 - 1 + vr);
        m.scale.setScalar(sc * vr * 0.95);
        m.rotation.set(0, Math.sin(t + i) * 0.4, 0);
      });

      blobs.forEach((m, i) => (m.position.y = (i % 2) * 3 - 1 + Math.sin(t * 0.3 + i) * 0.8 - s.p * 2));

      // patika: sayfa ilerledikçe taşlar arkadan öne aydınlanır, fenerler yanar
      const gp = Math.min(1, s.p * 1.05);
      path.forEach(({ g, topGlow, flame, th }, i) => {
        const on = smooth(th * 0.82, th * 0.82 + 0.08, gp);
        topGlow.material.opacity = 0.75 * on;
        const flicker = 0.85 + Math.sin(t * 6 + i * 2.1) * 0.15;
        flame.material.opacity = on * flicker;
        flame.scale.setScalar(0.9 + on * 0.2 + Math.sin(t * 5 + i) * 0.04);
        g.position.y = PATH_Y + Math.sin(t * 0.5 + i) * 0.01;
      });
      trails.forEach((m, i) => {
        const onA = smooth(path[i].th * 0.82, path[i].th * 0.82 + 0.08, gp);
        const onB = smooth(path[i + 1].th * 0.82, path[i + 1].th * 0.82 + 0.08, gp);
        m.material.opacity = 0.55 * Math.min(onA, onB);
      });
      pathFireflies.material.uniforms.opacity.value = 0.4 * smooth(0.1, 0.6, gp);
      pathFireflies.userData.tick(t);
    },
  };
}
