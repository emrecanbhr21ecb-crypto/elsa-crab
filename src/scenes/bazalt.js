import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { productBase } from './base.js';
import { tex, canvasTex, damp, near, smooth, keyframe } from '../lib.js';
import { haloTex } from './home.js';

// BazaltGo: büyük 3B uygulama simgesi; dönen voksel QR; açılan Gönüllü
// Pasaportu; yörüngede seviye madalyaları; eşleşme ağı.
const LEVELS = [
  { en: 'Volunteer', tr: 'Gönüllü', n: 1, c: '#ffb648' },
  { en: 'Active Volunteer', tr: 'Aktif Gönüllü', n: 3, c: '#ff7a3d' },
  { en: 'Project Ambassador', tr: 'Proje Elçisi', n: 6, c: '#ff4f7b' },
  { en: 'Senior Ambassador', tr: 'Kıdemli Elçi', n: 12, c: '#b456ff' },
  { en: 'Bazalt Leader', tr: 'Bazalt Lideri', n: 25, c: '#5b8cff' },
];

export function build({ renderer, product, lang: L0 }) {
  const b = productBase({ renderer, product, sky: [0x3a1670, 0x0d0620, 0.9], fog: [0x120827, 0.035], dustColor: 0xffc89a, phone: false });
  const { scene, camera } = b;
  const lang = document.documentElement.lang === 'tr' ? 'tr' : 'en';

  // arka planda yumuşak renk lekeleri (simgenin degradesi)
  const blobs = [0xff7a3d, 0xb456ff, 0x5b8cff, 0xffc04d].map((c, i) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshBasicMaterial({ map: haloTex(), color: c, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false }));
    m.position.set((i - 1.5) * 5, (i % 2) * 3 - 1, -14);
    scene.add(m);
    return m;
  });

  // ---- 1) simge ----
  const iconT = tex(product.icon, renderer);
  const front = new THREE.MeshStandardMaterial({ map: iconT, emissive: 0xffffff, emissiveMap: iconT, emissiveIntensity: 0.22, roughness: 0.3 });
  const sideM = new THREE.MeshPhysicalMaterial({ color: 0xff8a3d, metalness: 0.5, roughness: 0.25, clearcoat: 1 });
  const icon = new THREE.Mesh(new RoundedBoxGeometry(2.6, 2.6, 0.32, 8, 0.5), [sideM, sideM, sideM, sideM, front, sideM]);
  scene.add(icon);
  // simgenin dört rengi (gerçek logo noktaları): yörüngede dönüp simgeye ışık düşüren dört kıvılcım
  const dotCols = [0x8bc34a, 0xa0469e, 0xe53935, 0x1e88c9];
  const dots = dotCols.map((c, i) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), new THREE.MeshBasicMaterial({ color: c, toneMapped: false }));
    const h = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshBasicMaterial({ map: haloTex(), color: c, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }));
    m.add(h);
    m.userData = { a: (i / dotCols.length) * Math.PI * 2 };
    icon.add(m);
    return m;
  });

  // ---- 2) voksel QR: her 2.4 sn'de yeni kod, dalga hâlinde döner ----
  const G = 25;
  const qr = new THREE.InstancedMesh(new RoundedBoxGeometry(0.1, 0.1, 0.1, 1, 0.02), new THREE.MeshStandardMaterial({ color: 0xb8b0d0, roughness: 0.6, metalness: 0.1, envMapIntensity: 0.5 }), G * G);
  const qrBack = new THREE.Mesh(new RoundedBoxGeometry(G * 0.11 + 0.5, G * 0.11 + 0.5, 0.08, 4, 0.12), new THREE.MeshPhysicalMaterial({ color: 0x1b1030, roughness: 0.3, clearcoat: 1 }));
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


  // ---- hero: uygulamanın gerçek proje kategorileri simgenin etrafında döner ----
  const cats = (lang === 'tr' ? ['TEKNOLOJİ', 'DOĞA', 'KÜLTÜR', 'SOSYAL', 'SANAT', 'SPOR'] : ['TECH', 'NATURE', 'CULTURE', 'SOCIAL', 'ART', 'SPORTS']).map((n, i) => {
    const c = ['#ff7a3d', '#3bd16f', '#b456ff', '#5b8cff', '#ff4f7b', '#ffc04d'][i];
    const t = canvasTex(360, 120, (g, w, h) => {
      g.fillStyle = 'rgba(18,10,36,0.85)';
      g.beginPath(); g.roundRect(2, 2, w - 4, h - 4, 60); g.fill();
      g.strokeStyle = c; g.lineWidth = 4; g.stroke();
      g.fillStyle = c; g.beginPath(); g.arc(58, h / 2, 16, 0, 7); g.fill();
      g.fillStyle = '#fff'; g.font = '600 36px Inter, sans-serif'; g.textBaseline = 'middle'; g.fillText(n, 92, h / 2 + 2);
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.5), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, toneMapped: false }));
    scene.add(m);
    return m;
  });
  // ---- tarama ışını (QR üzerinde gezer) ----
  const scan = new THREE.Mesh(new THREE.PlaneGeometry(G * 0.11 + 0.8, 0.06), new THREE.MeshBasicMaterial({ color: 0xff7a3d, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  const scanGlow = new THREE.Mesh(new THREE.PlaneGeometry(G * 0.11 + 1.2, 0.7), new THREE.MeshBasicMaterial({ map: haloTex(), color: 0xff7a3d, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
  scan.position.z = 0.2;
  scanGlow.position.z = 0.19;

  // ---- 3) pasaport (gerçek uygulamanın "Gönüllü Pasaportu" ekranındaki palet ve kompozisyon) ----
  const passTex = canvasTex(512, 720, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, '#241352'); gr.addColorStop(1, '#3c1f6e');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,196,61,0.55)'; g.lineWidth = 3; g.strokeRect(22, 22, w - 44, h - 44);
    // madalya/kurdele rozeti
    g.strokeStyle = '#ffc43d'; g.lineWidth = 7;
    g.beginPath(); g.arc(w / 2, 158, 56, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#ffc43d';
    g.beginPath(); g.moveTo(w / 2 - 20, 208); g.lineTo(w / 2 - 34, 268); g.lineTo(w / 2 - 6, 248); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(w / 2 + 20, 208); g.lineTo(w / 2 + 34, 268); g.lineTo(w / 2 + 6, 248); g.closePath(); g.fill();
    g.fillStyle = '#2a145a';
    g.beginPath(); g.moveTo(w / 2 - 16, 140); g.lineTo(w / 2, 118); g.lineTo(w / 2 + 16, 140); g.lineTo(w / 2, 178); g.closePath(); g.fill();
    g.fillStyle = '#ffc43d'; g.textAlign = 'center';
    g.font = '700 38px Fraunces, Georgia, serif'; g.fillText(lang === 'tr' ? 'GÖNÜLLÜ' : 'VOLUNTEER', w / 2, 320);
    g.font = '700 38px Fraunces, Georgia, serif'; g.fillText(lang === 'tr' ? 'PASAPORTU' : 'PASSPORT', w / 2, 368);
    g.fillStyle = 'rgba(255,255,255,0.55)'; g.font = '600 17px Inter, sans-serif'; g.letterSpacing = '2px';
    g.fillText(lang === 'tr' ? 'BAZALT GENÇLİK DERNEĞİ' : 'BAZALT YOUTH ASSOCIATION', w / 2, 404);
    g.letterSpacing = '0px';
    g.strokeStyle = 'rgba(255,196,61,0.5)'; g.lineWidth = 2;
    g.strokeRect(w / 2 - 170, 448, 340, 94);
    g.fillStyle = 'rgba(255,255,255,0.5)'; g.font = '500 15px Inter, sans-serif';
    g.fillText(lang === 'tr' ? 'PASAPORT SAHİBİ' : 'PASSPORT HOLDER', w / 2, 480);
    g.fillStyle = '#ffffff'; g.font = '700 24px Inter, sans-serif';
    g.fillText(lang === 'tr' ? 'GÖNÜLLÜ ADI' : 'VOLUNTEER NAME', w / 2, 520);
    g.fillStyle = 'rgba(255,255,255,0.4)'; g.font = '500 16px Inter, sans-serif';
    g.fillText('BazaltGo', w / 2, 650);
  });
  const pageTex = canvasTex(512, 720, (g, w, h) => {
    g.fillStyle = '#fbf3e4'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(80,40,120,.12)';
    for (let y = 60; y < h; y += 44) { g.beginPath(); g.moveTo(30, y); g.lineTo(w - 30, y); g.stroke(); }
    const stamps = ['#ff7a3d', '#b456ff', '#5b8cff', '#19a463', '#ff4f7b', '#ffb648'];
    stamps.forEach((c, i) => {
      const x = 120 + (i % 2) * 270, y = 140 + Math.floor(i / 2) * 210;
      g.save(); g.translate(x, y); g.rotate((i % 3 - 1) * 0.18);
      g.strokeStyle = c; g.lineWidth = 6; g.globalAlpha = 0.85;
      g.beginPath(); g.arc(0, 0, 70, 0, 7); g.stroke();
      g.beginPath(); g.arc(0, 0, 54, 0, 7); g.lineWidth = 2; g.stroke();
      g.fillStyle = c; g.font = '700 26px Inter, sans-serif'; g.textAlign = 'center'; g.fillText(`${(i + 1) * 4}h`, 0, 10);
      g.restore();
    });
  });
  const passport = new THREE.Group();
  const cover = new THREE.MeshStandardMaterial({ map: passTex, roughness: 0.55, envMapIntensity: 0.5 });
  const paper = new THREE.MeshStandardMaterial({ map: pageTex, roughness: 0.9, color: 0x9a948a, envMapIntensity: 0.3 });
  const edge = new THREE.MeshStandardMaterial({ color: 0xb9ad98, roughness: 0.9 });
  const PW = 1.6, PH = 2.25;
  const backC = new THREE.Mesh(new THREE.BoxGeometry(PW, PH, 0.05), [edge, edge, edge, edge, paper, cover]);
  backC.position.x = PW / 2;
  const hinge = new THREE.Group();
  const frontC = new THREE.Mesh(new THREE.BoxGeometry(PW, PH, 0.05), [edge, edge, edge, edge, cover, paper]);
  frontC.position.set(PW / 2, 0, 0.05);
  hinge.add(frontC);
  passport.add(backC, hinge);
  scene.add(passport);

  qrG.add(scan, scanGlow);
  // damga: pasaport sayfasına iner
  const stamp = new THREE.Group();
  const sHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.4, 20), new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.5 }));
  sHandle.position.y = 0.3;
  const sBase = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.1, 32), new THREE.MeshStandardMaterial({ color: 0xff7a3d, roughness: 0.4 }));
  stamp.add(sHandle, sBase);
  stamp.rotation.x = Math.PI / 2;
  passport.add(stamp);

  // ---- 4) seviye madalyaları ----
  const medals = LEVELS.map((L, i) => {
    const t = canvasTex(256, 256, (g, w) => {
      g.fillStyle = L.c;
      g.beginPath();
      for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2 + Math.PI / 6; g.lineTo(w / 2 + Math.cos(a) * 120, w / 2 + Math.sin(a) * 120); }
      g.closePath(); g.fill();
      g.fillStyle = 'rgba(255,255,255,.95)'; g.textAlign = 'center';
      g.font = '700 72px Fraunces, Georgia, serif'; g.fillText(String(L.n), w / 2, 130);
      g.font = '600 19px Inter, sans-serif';
      const words = L[lang].toUpperCase().split(' ');
      words.forEach((wd, j) => g.fillText(wd, w / 2, 170 + j * 24));
    });
    // silindir kapağının UV'si çeyrek tur dönük
    t.center.set(0.5, 0.5);
    t.rotation = Math.PI / 2;
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.1, 6), [
      new THREE.MeshPhysicalMaterial({ color: new THREE.Color(L.c), metalness: 0.7, roughness: 0.3 }),
      new THREE.MeshStandardMaterial({ map: t, transparent: true, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.25 }),
      new THREE.MeshStandardMaterial({ map: t, transparent: true }),
    ]);
    m.geometry.rotateX(Math.PI / 2);
    // cam parıltısı: madalyanın kenarında ince, ışıktan bağımsız bir halka
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.64, 0.025, 8, 48), new THREE.MeshBasicMaterial({ color: L.c, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    const g = new THREE.Group();
    g.add(m, rim);
    scene.add(g);
    return g;
  });

  // ---- 5) eşleşme ağı ----
  const NODES = 18;
  const nodePos = Array.from({ length: NODES }, (_, i) => new THREE.Vector3(Math.cos(i * 2.4) * (1 + (i % 4) * 0.5), Math.sin(i * 1.7) * 1.4, Math.sin(i * 2.4) * (1 + (i % 3) * 0.5)));
  const nodes = new THREE.InstancedMesh(new THREE.SphereGeometry(0.09, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffd2a8 }), NODES);
  const linePos = new Float32Array(NODES * 2 * 3);
  const lines = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xffa060, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending }));
  lines.geometry.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
  const net = new THREE.Group();
  net.add(nodes, lines);
  scene.add(net);

  const M = new THREE.Matrix4(), V = new THREE.Vector3(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), AX = new THREE.Vector3(1, 0, 0);
  const key = new THREE.PointLight(0xffb48a, 14, 25);
  key.position.set(2, 3, 5);
  scene.add(key);

  // her nesnenin görünürlüğü kendi bölümünde tepe yapar (0 hero = simge)
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

      // simge: hero'da büyük, istatistik ve sonda geri döner
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

      // QR
      const vq = vis(s.sp, 1);
      qrG.visible = vq > 0.02;
      qrG.position.set(X, Y, -1 + vq);
      qrG.scale.setScalar(sc * vq);
      qrG.rotation.set(s.mouseS.y * 0.2, -sd.x * 0.35 + Math.sin(t * 0.6) * 0.2, 0);
      codeT += dt;
      if (codeT > 2.4) {
        codeT = 0;
        codeIdx ^= 1;
        rollCode(codes[codeIdx]);
      }
      for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) {
        const i = y * G + x;
        // çapraz dalga: eski koddan yenisine geçiş
        const w = Math.min(1, Math.max(0, codeT * 3 - (x + y) / (G * 2) * 1.5));
        const on = codes[codeIdx][i] * w + codes[codeIdx ^ 1][i] * (1 - w);
        V.set((x - G / 2 + 0.5) * 0.11, (G / 2 - y - 0.5) * 0.11, on * 0.12);
        S.setScalar(on > 0.05 ? 0.4 + on * 0.6 : 0.0001);
        Q.setFromAxisAngle(AX, (1 - w) * w * 6);
        M.compose(V, Q, S);
        qr.setMatrixAt(i, M);
      }
      qr.instanceMatrix.needsUpdate = true;

      // pasaport
      const vp = vis(s.sp, 2);
      passport.visible = vp > 0.02;
      passport.position.set(X - PW * sc * vp * 0.75, Y, -1 + vp);
      passport.scale.setScalar(sc * vp * 1.45);
      passport.rotation.set(-0.15 + s.mouseS.y * 0.15, -sd.x * 0.25 + s.mouseS.x * 0.2, 0);
      hinge.rotation.y = -Math.PI * 0.9 * smooth(1.6, 2.1, s.sp) * (1 - smooth(2.4, 2.8, s.sp));


      // kategori etiketleri: hero'da simgenin etrafında yörünge
      const vCat = Math.max(vis(s.sp, 0), vis(s.sp, N + 1) * 0.6);
      cats.forEach((m, i) => {
        const a = (i / cats.length) * Math.PI * 2 + t * 0.25;
        m.visible = vCat > 0.02;
        m.position.set(X + Math.cos(a) * 2.6 * sc, Y + Math.sin(a * 1.0) * 1.5 * sc, Math.sin(a) * 1.2);
        m.scale.setScalar(Math.max(0.001, vCat * sc));
        m.lookAt(camera.position);
      });
      // tarama ışını
      const sy = Math.sin(t * 2.2) * (G * 0.055);
      scan.position.y = scanGlow.position.y = sy;
      // damga: pasaport açıkken ritimle iner
      const open = smooth(1.6, 2.1, s.sp);
      const ph = (t * 0.8) % 1;
      const down = ph < 0.15 ? ph / 0.15 : ph < 0.3 ? 1 : Math.max(0, 1 - (ph - 0.3) / 0.25);
      stamp.visible = open > 0.3;
      stamp.position.set(PW * 0.55, -0.3 + Math.sin(Math.floor(t * 0.8) * 2.1) * 0.5, 0.05 + 0.75 - down * 0.7);

      // madalyalar
      const vm = vis(s.sp, 3);
      medals.forEach((m, i) => {
        const a = (i / LEVELS.length) * Math.PI * 2 + t * 0.3;
        m.visible = vm > 0.02;
        m.position.set(X + Math.cos(a) * 2.3 * sc, Y + Math.sin(a) * 0.7 * sc + (i - 2) * 0.15, Math.sin(a) * 1.4 - 1 + vm);
        m.scale.setScalar(sc * vm * (0.8 + i * 0.07));
        m.rotation.set(0, Math.sin(t + i) * 0.4, 0);
      });

      // eşleşme ağı
      const vn = vis(s.sp, 4);
      net.visible = vn > 0.02;
      net.position.set(X, Y, -1 + vn);
      net.scale.setScalar(sc * vn);
      net.rotation.y = t * 0.2;
      for (let i = 0; i < NODES; i++) {
        V.copy(nodePos[i]);
        V.y += Math.sin(t + i) * 0.08;
        S.setScalar(1 + Math.sin(t * 3 + i) * 0.25);
        M.compose(V, Q.identity(), S);
        nodes.setMatrixAt(i, M);
        // her düğüm "merkez kullanıcı" (0) ile ya da bir sonrakiyle bağ
        const j = i % 3 === 0 ? 0 : (i + 1) % NODES;
        linePos.set([V.x, V.y, V.z, nodePos[j].x, nodePos[j].y, nodePos[j].z], i * 6);
      }
      nodes.instanceMatrix.needsUpdate = true;
      lines.geometry.attributes.position.needsUpdate = true;
      lines.material.opacity = 0.25 + Math.sin(t * 2) * 0.15;

      blobs.forEach((m, i) => (m.position.y = (i % 2) * 3 - 1 + Math.sin(t * 0.3 + i) * 0.8 - s.p * 2));
    },
  };
}
