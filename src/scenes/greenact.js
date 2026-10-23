import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { productBase } from './base.js';
import { tex, canvasTex, dust, near, smooth } from '../lib.js';
import { haloTex } from './home.js';

// GreenAct: henüz kodlanmamış bir konsept. Gerçek olan tek şey, kayıtsızlık
// yüzünden bulunamayan fidanlardan doğan AB destekli ağaçlandırma projesi.
// Burada görselleştirilen uygulama fikri — kayıt, nöbet, canlılık takibi.
//
// Sahnenin asıl fikri: arka plandaki yanmış tepe, tüm sayfa boyunca (s.p
// ile) kömürden yeşile döner — gerçek hikaye (yangın → gönüllü dikim →
// takip) sahnenin kendisi oluyor, ayrı kartlar sadece önde yüzüyor.
const STAGES = [
  { en: 'Seedling', tr: 'Fide', c: '#9fcf6e' },
  { en: 'Sapling', tr: 'Fidan', c: '#4f9169' },
  { en: 'Tree', tr: 'Ağaç', c: '#2f6b4f' },
];
const CHAR = new THREE.Color('#161210');
const HEAL = new THREE.Color('#1f3a24');
const GROUND_Y = -1.7;

export function build({ renderer, product }) {
  const b = productBase({ renderer, product, sky: [0x234a33, 0x0c1b14, 0.9], fog: [0x0a1712, 0.032], dustColor: 0xd9c08a, phone: false });
  const { scene, camera } = b;
  const lang = document.documentElement.lang === 'tr' ? 'tr' : 'en';

  const blobs = [0x2f6b4f, 0xc17a45, 0x9fcf6e].map((c, i) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshBasicMaterial({ map: haloTex(), color: c, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false }));
    m.position.set((i - 1) * 6, (i % 2) * 3 - 1, -14);
    scene.add(m);
    return m;
  });

  // ---- yanan tepeden yeşile dönen zemin ----
  const groundMat = new THREE.MeshStandardMaterial({ color: CHAR.clone(), roughness: 1 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(46, 30, 1, 1), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, GROUND_Y, -8);
  scene.add(ground);

  // ağaçlar: gerçekçi büyüme — kömürleşmiş tek bir gövdeden dallanıp
  // yapraklanan fideler. Sayfa ilerledikçe hem boy atar hem dal dal açar;
  // her dal ve her yaprak kümesi kendi zamanında, hafif bir "sekme" ile belirir.
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const leafBlobTex = canvasTex(96, 96, (g, w) => {
    const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.65, 'rgba(255,255,255,0.85)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, w);
  });
  const shadowTex = canvasTex(96, 56, (g, w, h) => {
    const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gr.addColorStop(0, 'rgba(0,0,0,0.42)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
  const CHARRED_BARK = new THREE.Color('#231d18');
  const HEALTHY_BARK = new THREE.Color('#5a3c22');
  const emberTex = canvasTex(64, 64, (g, w) => {
    const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    gr.addColorStop(0, 'rgba(255,200,120,1)'); gr.addColorStop(0.45, 'rgba(255,120,40,0.8)'); gr.addColorStop(1, 'rgba(255,90,20,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, w);
  });
  const LEAF_HUES = [0xb7e08a, 0x9fcf6e, 0x7fbd81, 0x4f9169, 0x3a7d57, 0x2f6b4f];
  // "geri sekerek açılan" büyüme eğrisi: fidanın canlıya dönüşü mekanik değil
  const easeBack = (x) => { if (x <= 0) return 0; if (x >= 1) return 1; const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2; };

  const TREES = 9;
  const hillTrees = Array.from({ length: TREES }, (_, i) => {
    const h = 2.3 + rnd() * 1.8;
    const g = new THREE.Group();
    const barkMat = new THREE.MeshStandardMaterial({ color: CHARRED_BARK.clone(), roughness: 0.88 });
    // gövde: inceden tepeye doğru daralan, gerçek bir fidan gövdesi oranında
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.038 * h, 0.072 * h, h, 7), barkMat);
    trunk.position.y = h / 2;
    g.add(trunk);

    // iki sabit, yanık çıplak dal — en baştan "yanmış fidan" silüetini kurar
    const stubs = [0.62, 0.78].map((along, bi) => {
      const pivot = new THREE.Group();
      pivot.position.y = along * h;
      pivot.rotation.z = (bi % 2 === 0 ? 1 : -1) * (0.75 + rnd() * 0.3);
      pivot.rotation.y = bi * 2.8 + rnd();
      const len = (0.16 + rnd() * 0.08) * h;
      const bMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.01 * h, 0.022 * h, len, 5), barkMat);
      bMesh.position.y = len / 2;
      pivot.add(bMesh);
      g.add(pivot);
      return pivot;
    });

    // dallar: kendi pivotunda, gövdeden büyürmüş gibi uzunlamasına açılır
    const branches = Array.from({ length: 4 }, (_, bi) => {
      const pivot = new THREE.Group();
      pivot.position.y = (0.48 + bi * 0.13) * h;
      pivot.rotation.z = (bi % 2 === 0 ? 1 : -1) * (0.6 + rnd() * 0.35);
      pivot.rotation.y = bi * 1.9 + rnd();
      const len = (0.3 + rnd() * 0.24) * h;
      const bMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.018 * h, 0.034 * h, len, 5), barkMat);
      bMesh.position.y = len / 2;
      pivot.add(bMesh);
      pivot.scale.y = 0.001;
      g.add(pivot);
      return { pivot };
    });

    // yaprak kümeleri: dal uçlarının etrafına dağılmış, her biri ayrı patlar
    const canopyBlobs = Array.from({ length: 9 }, (_, bi) => {
      const hue = LEAF_HUES[Math.floor(rnd() * LEAF_HUES.length)];
      const mat = new THREE.MeshBasicMaterial({ map: leafBlobTex, color: hue, transparent: true, toneMapped: false, depthWrite: false });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
      const branch = branches[bi % branches.length];
      const ang = rnd() * Math.PI * 2;
      const rad = (0.1 + rnd() * 0.13) * h;
      m.position.set(Math.cos(ang) * rad, branch.pivot.position.y + 0.06 * h + rnd() * 0.18 * h, Math.sin(ang) * rad);
      m.userData = { base: (0.38 + rnd() * 0.24) * h, th: rnd() * 0.12 };
      m.scale.setScalar(0.001);
      g.add(m);
      return m;
    });

    // küllerin içinde hâlâ parıldayan birkaç kor — gövdeyi boyamaz, yanında küçük ışık noktaları
    const embersOnTree = Array.from({ length: 3 }, () => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.22 * h, 0.22 * h), new THREE.MeshBasicMaterial({ map: emberTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
      m.position.set((rnd() - 0.5) * 0.12 * h, rnd() * 0.3 * h, (rnd() - 0.5) * 0.12 * h);
      g.add(m);
      return m;
    });

    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(h * 0.55, h * 0.32), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.5, depthWrite: false, toneMapped: false }));
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.01;
    g.add(shadow);

    const x = (i / TREES - 0.5) * 30 + (rnd() - 0.5) * 2.4;
    const z = -3 - rnd() * 7;
    g.position.set(x, GROUND_Y, z);
    const sizeK = 0.85 + rnd() * 0.45;
    g.userData = { th: 0.04 + (i / TREES) * 0.82 + rnd() * 0.06, barkMat, branches, canopyBlobs, embersOnTree, sizeK, swayPh: rnd() * 10 };
    scene.add(g);
    return g;
  });

  // kömür dumanı → başlangıçta; sağlıklı toz/ateş böceği → iyileştikçe
  const embers = dust({ count: 420, spread: 34, depth: 26, size: 0.05, color: 0xff9a4a, opacity: 0.5, y: -0.4 });
  embers.position.z = -6;
  scene.add(embers);
  const fireflies = dust({ count: 260, spread: 30, depth: 20, size: 0.045, color: 0xd9f2b0, opacity: 0, y: 0.2 });
  fireflies.position.z = -5;
  scene.add(fireflies);

  // ---- 1) simge ----
  const iconT = tex(product.icon, renderer);
  const front = new THREE.MeshStandardMaterial({ map: iconT, emissive: 0xffffff, emissiveMap: iconT, emissiveIntensity: 0.2, roughness: 0.3 });
  const sideM = new THREE.MeshPhysicalMaterial({ color: 0x2f6b4f, metalness: 0.3, roughness: 0.4, clearcoat: 0.6 });
  const icon = new THREE.Mesh(new RoundedBoxGeometry(2.6, 2.6, 0.32, 8, 0.5), [sideM, sideM, sideM, sideM, front, sideM]);
  scene.add(icon);
  const dots = [0xc17a45, 0x9fcf6e].map((c, i) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), new THREE.MeshBasicMaterial({ color: c, toneMapped: false }));
    const h = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshBasicMaterial({ map: haloTex(), color: c, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }));
    m.add(h);
    m.userData = { a: (i / 2) * Math.PI * 2 };
    icon.add(m);
    return m;
  });

  // ---- 0) kayıt: fidan + GPS/QR etiketi ----
  const record = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 1.1, 10), new THREE.MeshStandardMaterial({ color: 0x3a2a18, roughness: 0.8 }));
  trunk.position.y = 0.55;
  const leafTex = canvasTex(256, 256, (g, w) => {
    g.fillStyle = '#4f9169';
    g.beginPath(); g.ellipse(w * 0.4, w * 0.5, 70, 40, -0.5, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#2f6b4f';
    g.beginPath(); g.ellipse(w * 0.62, w * 0.42, 70, 40, 0.5, 0, Math.PI * 2); g.fill();
  });
  const leaves = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.3), new THREE.MeshBasicMaterial({ map: leafTex, transparent: true, toneMapped: false }));
  leaves.position.y = 1.25;
  record.add(trunk, leaves);
  const tagTex = canvasTex(360, 220, (g, w, h) => {
    g.fillStyle = 'rgba(12,27,20,0.9)';
    g.beginPath(); g.roundRect(2, 2, w - 4, h - 4, 18); g.fill();
    g.strokeStyle = '#c17a45'; g.lineWidth = 3; g.stroke();
    g.fillStyle = '#c17a45';
    g.beginPath(); g.arc(56, 64, 20, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(56, 44); g.lineTo(48, 90); g.lineTo(64, 90); g.closePath(); g.fill();
    for (let yy = 0; yy < 5; yy++) for (let xx = 0; xx < 5; xx++) {
      if ((xx + yy * 3) % 3 === 0) { g.fillStyle = '#e8ddc8'; g.fillRect(210 + xx * 18, 40 + yy * 18, 14, 14); }
    }
    g.fillStyle = '#e8ddc8'; g.font = '600 20px Inter, sans-serif'; g.textAlign = 'left';
    g.fillText(lang === 'tr' ? 'FİDAN #0427' : 'SAPLING #0427', 30, 160);
    g.fillStyle = 'rgba(232,221,200,0.6)'; g.font = '500 15px Inter, sans-serif';
    g.fillText(lang === 'tr' ? 'KONSEPT · KOD YAZILMADI' : 'CONCEPT · NOT CODED', 30, 188);
  });
  const tag = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.1), new THREE.MeshBasicMaterial({ map: tagTex, transparent: true, toneMapped: false }));
  tag.position.set(1.5, 0.3, 0.3);
  record.add(tag);
  scene.add(record);

  // ---- 1) nöbet: nöbetçi halkası + sulama kartı ----
  const rotationG = new THREE.Group();
  const careTex = canvasTex(380, 260, (g, w, h) => {
    g.fillStyle = 'rgba(12,27,20,0.9)';
    g.beginPath(); g.roundRect(2, 2, w - 4, h - 4, 18); g.fill();
    g.strokeStyle = '#4f9169'; g.lineWidth = 3; g.stroke();
    g.fillStyle = '#9fcf6e'; g.font = '700 26px Fraunces, Georgia, serif'; g.textAlign = 'left';
    g.fillText(lang === 'tr' ? 'SULAMA NÖBETİ' : 'WATERING ROTATION', 26, 48);
    for (let i = 0; i < 4; i++) {
      g.fillStyle = i === 1 ? '#4f9169' : 'rgba(255,255,255,0.08)';
      g.beginPath(); g.roundRect(26 + i * 84, 76, 70, 70, 10); g.fill();
      g.fillStyle = i === 1 ? '#0c1b14' : 'rgba(255,255,255,0.4)'; g.font = '600 16px Inter, sans-serif'; g.textAlign = 'center';
      g.fillText(['Mon', 'Tue', 'Wed', 'Thu'][i], 26 + i * 84 + 35, 116);
    }
    g.fillStyle = 'rgba(232,221,200,0.55)'; g.font = '500 15px Inter, sans-serif'; g.textAlign = 'left';
    g.fillText(lang === 'tr' ? '1 fidan = 1 görevli' : '1 sapling = 1 caretaker', 26, 198);
  });
  const careCard = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 1.44), new THREE.MeshBasicMaterial({ map: careTex, transparent: true, toneMapped: false }));
  rotationG.add(careCard);
  const VOL = 6;
  const volDots = new THREE.InstancedMesh(new THREE.SphereGeometry(0.11, 14, 10), new THREE.MeshStandardMaterial({ color: 0xc17a45, roughness: 0.5 }), VOL);
  rotationG.add(volDots);
  scene.add(rotationG);

  // ---- 2) canlılık: üç büyüme evresi + takip halkası ----
  const survivalG = new THREE.Group();
  const stageCards = STAGES.map((st, i) => {
    const t = canvasTex(220, 220, (g, w) => {
      g.fillStyle = st.c;
      g.beginPath(); g.arc(w / 2, w / 2, 96, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.92)'; g.textAlign = 'center';
      g.font = '700 46px Fraunces, Georgia, serif'; g.fillText(String(i + 1), w / 2, w / 2 - 6);
      g.font = '600 16px Inter, sans-serif'; g.fillText(st[lang].toUpperCase(), w / 2, w / 2 + 58);
    });
    const m = new THREE.Mesh(new THREE.CircleGeometry(0.62, 32), new THREE.MeshBasicMaterial({ map: t, transparent: true, toneMapped: false }));
    survivalG.add(m);
    return m;
  });
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.55, 1.62, 64, 1, 0, Math.PI * 1.4), new THREE.MeshBasicMaterial({ color: 0x9fcf6e, transparent: true, opacity: 0.8, side: THREE.DoubleSide, toneMapped: false }));
  survivalG.add(ring);
  scene.add(survivalG);

  const M = new THREE.Matrix4(), V = new THREE.Vector3(), Q = new THREE.Quaternion(), S = new THREE.Vector3();
  const key = new THREE.PointLight(0xc9e8b0, 10, 22);
  key.position.set(2, 3, 5);
  scene.add(key);

  const vis = (sp, i) => near(sp, i, 0.9);

  return {
    scene,
    camera,
    bloom: { strength: 0.42, radius: 0.55, threshold: 0.88 },
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

      const vrec = vis(s.sp, 0);
      record.visible = vrec > 0.02;
      record.position.set(X - 0.5 * sc * vrec, Y - 0.3, -1 + vrec);
      record.scale.setScalar(sc * vrec);
      record.rotation.y = -sd.x * 0.3 + Math.sin(t * 0.4) * 0.1;
      tag.lookAt(camera.position);
      leaves.lookAt(camera.position.x, leaves.getWorldPosition(V).y, camera.position.z);

      const vrot = vis(s.sp, 1);
      rotationG.visible = vrot > 0.02;
      rotationG.position.set(X, Y, -1 + vrot);
      rotationG.scale.setScalar(sc * vrot);
      careCard.lookAt(camera.position);
      for (let i = 0; i < VOL; i++) {
        const a = (i / VOL) * Math.PI * 2 + t * 0.3;
        V.set(Math.cos(a) * 1.7, Math.sin(a) * 1.1, Math.sin(a * 2) * 0.3);
        S.setScalar(1);
        M.compose(V, Q.identity(), S);
        volDots.setMatrixAt(i, M);
      }
      volDots.instanceMatrix.needsUpdate = true;

      const vsur = vis(s.sp, 2);
      survivalG.visible = vsur > 0.02;
      survivalG.position.set(X, Y, -1 + vsur);
      survivalG.scale.setScalar(sc * vsur);
      survivalG.rotation.z = Math.sin(t * 0.2) * 0.05;
      stageCards.forEach((m, i) => {
        const a = -0.9 + i * 0.9;
        m.position.set(Math.cos(a) * 1.55, Math.sin(a) * 1.55, 0.05);
        m.lookAt(0, 0, 10);
      });
      ring.rotation.z = t * 0.15;

      blobs.forEach((m, i) => (m.position.y = (i % 2) * 3 - 1 + Math.sin(t * 0.3 + i) * 0.8 - s.p * 2));

      // tepe: tüm sayfa boyunca kömürden yeşile döner
      const gp = Math.min(1, s.p * 1.1);
      groundMat.color.lerpColors(CHAR, HEAL, smooth(0, 1, gp));
      hillTrees.forEach((g) => {
        const u = g.userData;
        const bloom = smooth(u.th, u.th + 0.2, gp);
        g.scale.setScalar(u.sizeK * (0.78 + bloom * 0.32));
        u.barkMat.color.lerpColors(CHARRED_BARK, HEALTHY_BARK, bloom);
        u.branches.forEach(({ pivot }, bi) => {
          const bb = smooth(u.th + bi * 0.03, u.th + bi * 0.03 + 0.14, gp);
          pivot.scale.y = Math.max(0.001, easeBack(bb));
        });
        u.canopyBlobs.forEach((m) => {
          const bb = smooth(u.th + 0.08 + m.userData.th, u.th + 0.08 + m.userData.th + 0.14, gp);
          m.scale.setScalar(Math.max(0.001, m.userData.base * easeBack(bb)));
        });
        const emberLevel = Math.max(0, 1 - bloom * 2.2);
        u.embersOnTree.forEach((m, i) => {
          m.material.opacity = emberLevel * (0.5 + Math.sin(t * 4 + i * 2 + u.swayPh) * 0.5);
        });
        g.rotation.y = Math.sin(t * 0.15 + u.swayPh) * 0.045;
        g.rotation.z = Math.sin(t * 0.22 + u.swayPh * 1.3) * 0.02;
      });
      embers.material.uniforms.opacity.value = 0.5 * (1 - gp);
      embers.userData.tick(t);
      fireflies.material.uniforms.opacity.value = 0.45 * gp;
      fireflies.userData.tick(t);
    },
  };
}
