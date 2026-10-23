import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { productBase } from './base.js';
import { canvasTex, foilCard, damp, near, smooth, textSprite } from '../lib.js';
import { haloTex } from './home.js';

// FitKoç: turuncu neon halkalı bir antrenman sahnesi.
// hero: telefon + etrafında dönen gerçek hareket videoları
// 1 bugün: kalori halkası + makro çubukları · 2 koçlar: doğrulanmış koç kartları
// 3 kütüphane: kas haritalı figür + videolar · 4 beslenme: büyük halka + porsiyon etiketleri
export function build({ renderer, product, lang }) {
  const b = productBase({ renderer, product, sky: [0x16121a, 0x050508, 1], fog: [0x07070b, 0.035], dustColor: 0xffa070, phoneAspect: 632 / 1200, phoneWidth: 1.5 });
  const { scene, camera } = b;
  const L = (en, tr) => (lang === 'tr' ? tr : en);
  const OR = new THREE.Color(0xff5a1f);

  // ---- zemin: gerçek bir spor salonu zemini — boyalı saha çizgileri, neon halka değil ----
  const courtTex = canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = '#0b0b10';
    g.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2;
    g.strokeStyle = 'rgba(255,255,255,0.14)';
    g.lineWidth = 5;
    g.beginPath(); g.arc(cx, cy, 170, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.arc(cx, cy, 6, 0, Math.PI * 2); g.fillStyle = 'rgba(255,255,255,0.14)'; g.fill();
    g.strokeStyle = 'rgba(255,90,31,0.5)';
    g.lineWidth = 7;
    g.beginPath(); g.arc(cx, cy, 340, 0, Math.PI * 2); g.stroke();
    // antrenman çizgi ızgarası (koşu bandı şeridi gibi)
    g.strokeStyle = 'rgba(255,255,255,0.07)';
    g.lineWidth = 3;
    for (let a = 0; a < 8; a++) {
      const th = (a / 8) * Math.PI * 2;
      g.beginPath();
      g.moveTo(cx + Math.cos(th) * 180, cy + Math.sin(th) * 180);
      g.lineTo(cx + Math.cos(th) * 490, cy + Math.sin(th) * 490);
      g.stroke();
    }
  });
  const floor = new THREE.Mesh(new THREE.CircleGeometry(30, 64), new THREE.MeshStandardMaterial({ map: courtTex, color: 0x0a0a0f, roughness: 0.4, metalness: 0.4 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2.2;
  scene.add(floor);
  // tek, anlamlı halka: "bugünkü antrenman" ilerlemesini gösteren zemin çizgisi — dekoratif değil
  const progressRing = new THREE.Mesh(new THREE.TorusGeometry(5, 0.025, 8, 160, Math.PI * 2), new THREE.MeshBasicMaterial({ color: OR, transparent: true, opacity: 0.5, toneMapped: false }));
  progressRing.rotation.x = Math.PI / 2;
  progressRing.position.y = -2.18;
  scene.add(progressRing);

  // ---- hareket videoları ----
  const vids = (product.videos || []).map((src) => {
    const v = document.createElement('video');
    // H.264 her tarayıcıda yok (ör. açık kaynak Chromium): önce WebM dene
    const webm = src.replace(/\.mp4$/, '.webm');
    v.src = v.canPlayType('video/webm; codecs="vp9"') ? webm : src;
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.setAttribute('playsinline', '');
    v.crossOrigin = 'anonymous';
    v.play().catch(() => {});
    const t = new THREE.VideoTexture(v);
    t.colorSpace = THREE.SRGBColorSpace;
    return { v, t };
  });
  const names = [L('Squat', 'Squat'), L('Lunge', 'Lunge'), L('Plank', 'Plank'), L('Jumping jack', 'Jumping jack'), L('Mountain climber', 'Mountain climber')];
  const screens = vids.map(({ t }, i) => {
    const g = new THREE.Group();
    const frame = new THREE.Mesh(new RoundedBoxGeometry(2.08, 1.2, 0.06, 4, 0.05), new THREE.MeshPhysicalMaterial({ color: 0x15151c, metalness: 0.8, roughness: 0.3 }));
    const pic = new THREE.Mesh(new THREE.PlaneGeometry(1.98, 1.11), new THREE.MeshBasicMaterial({ map: t, toneMapped: false }));
    pic.position.z = 0.035;
    const tag = textSprite(names[i].toUpperCase(), { size: 40, color: '#ffb48a', bg: 'rgba(10,10,14,0.75)' });
    tag.scale.multiplyScalar(0.2);
    tag.position.set(-0.6, -0.72, 0.05);
    g.add(frame, pic, tag);
    scene.add(g);
    return g;
  });

  // ---- kalori halkası + makrolar ----
  const ringG = new THREE.Group();
  const track = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.09, 16, 120), new THREE.MeshStandardMaterial({ color: 0x23232c, roughness: 0.6 }));
  const arcGeo = new THREE.TorusGeometry(1.2, 0.11, 20, 160, Math.PI * 2);
  const arcMat = new THREE.ShaderMaterial({
    uniforms: { k: { value: 0 }, col: { value: OR } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `uniform float k; uniform vec3 col; varying vec2 vUv; void main(){ if (vUv.x > k) discard; float g = 0.65 + 0.35 * vUv.x / max(k, 0.001); gl_FragColor = vec4(col * g * 1.6, 1.0); }`,
    toneMapped: false,
  });
  const arc = new THREE.Mesh(arcGeo, arcMat);
  arc.rotation.z = Math.PI / 2;
  arc.scale.x = -1;
  const kcal = canvasTex(512, 256, () => {});
  const kcalMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.8), new THREE.MeshBasicMaterial({ map: kcal, transparent: true, toneMapped: false }));
  let lastK = -1;
  const drawKcal = (n) => {
    const g = kcal.image.getContext('2d');
    g.clearRect(0, 0, 512, 256);
    g.fillStyle = '#fff';
    g.textAlign = 'center';
    g.font = '300 120px Fraunces, Georgia, serif';
    g.fillText(String(n), 256, 140);
    g.fillStyle = '#9a96a8';
    g.font = '500 30px JetBrains Mono, monospace';
    g.fillText('/ 2200 kcal', 256, 200);
    kcal.needsUpdate = true;
  };
  ringG.add(track, arc, kcalMesh);
  const macros = [
    ['P', 96 / 140, 0xff5a1f],
    ['K', 158 / 240, 0xffa23f],
    ['Y', 48 / 70, 0xffd166],
  ].map(([n, v, c], i) => {
    const bar = new THREE.Mesh(new RoundedBoxGeometry(0.22, 1, 0.22, 3, 0.05), new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.35, roughness: 0.4 }));
    bar.geometry.translate(0, 0.5, 0);
    bar.position.set(1.9 + i * 0.38, -1.1, 0);
    bar.userData.v = v;
    ringG.add(bar);
    return bar;
  });
  scene.add(ringG);

  // ---- koç kartları (uygulamadaki örnek profiller) ----
  const coachData = [
    ['AY', 'Ayşe Yılmaz', '4,8', L('Weight loss · Strength', 'Kilo verme · Güç'), '2.500 TL'],
    ['MK', 'Mert Kaya', '4,9', L('Weight loss · Strength', 'Kilo verme · Güç'), '4.800 TL'],
    ['ED', 'Elif Demir', '4,6', L('Postnatal · Mobility', 'Doğum sonrası · Mobilite'), '3.200 TL'],
  ];
  const coaches = coachData.map(([ini, name, star, tags, price], i) => {
    const t = canvasTex(640, 360, (g, w, h) => {
      g.fillStyle = '#ffffff';
      g.beginPath(); g.roundRect(0, 0, w, h, 28); g.fill();
      g.fillStyle = ['#ffe3d6', '#e2e3ff', '#d9f3e4'][i];
      g.beginPath(); g.arc(80, 86, 46, 0, 7); g.fill();
      g.fillStyle = ['#ff5a1f', '#5b5fd6', '#1f9d63'][i];
      g.font = '600 34px Inter, sans-serif'; g.textAlign = 'center'; g.fillText(ini, 80, 98);
      g.textAlign = 'left'; g.fillStyle = '#16161d'; g.font = '600 36px Inter, sans-serif'; g.fillText(name, 146, 78);
      g.fillStyle = '#1f9d63'; g.beginPath(); g.arc(160 + g.measureText(name).width, 66, 14, 0, 7); g.fill();
      g.fillStyle = '#fff'; g.font = '700 18px Inter'; g.fillText('✓', 153 + g.measureText(name).width - 14 + 9, 73);
      g.fillStyle = '#f5a524'; g.font = '500 26px Inter, sans-serif'; g.fillText(`★ ${star}`, 146, 118);
      g.fillStyle = '#55556a'; g.font = '400 26px Inter, sans-serif'; g.fillText(tags, 36, 190);
      g.fillStyle = '#1f9d63'; g.font = '500 24px Inter, sans-serif'; g.fillText(L('Free 15-min intro', 'Ücretsiz 15 dk tanışma'), 36, 236);
      g.fillStyle = '#16161d'; g.font = '700 34px Inter, sans-serif'; g.fillText(L(`from ${price}`, `${price}'den başlayan`), 36, 312);
    });
    // koç kartı: düz pano değil, kalınlığı ve holografik "doğrulanmış" parıltısı olan gerçek bir kart
    const m = foilCard(t, 2.2, 2.2 / 1.24, { thickness: 0.05 });
    scene.add(m);
    return m;
  });

  // ---- kas haritalı figür ----
  const body = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: 0x1d2333, roughness: 0.5, metalness: 0.2 });
  const hot = new THREE.MeshStandardMaterial({ color: 0xff5a1f, emissive: 0xff5a1f, emissiveIntensity: 0.9, roughness: 0.4, transparent: true });
  const part = (geo, mat, x, y, z, rz = 0, rx = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, 0, rz);
    body.add(m);
    return m;
  };
  part(new THREE.SphereGeometry(0.2, 24, 16), skin, 0, 1.62, 0);
  part(new THREE.CapsuleGeometry(0.07, 0.1, 6, 12), skin, 0, 1.38, 0);
  part(new THREE.CapsuleGeometry(0.3, 0.55, 8, 20), skin, 0, 0.98, 0);
  part(new THREE.CapsuleGeometry(0.24, 0.12, 8, 16), skin, 0, 0.5, 0);
  for (const sx of [-1, 1]) {
    part(new THREE.CapsuleGeometry(0.09, 0.42, 6, 12), skin, sx * 0.43, 1.05, 0, sx * 0.2);
    part(new THREE.CapsuleGeometry(0.075, 0.4, 6, 12), skin, sx * 0.53, 0.6, 0.02, sx * 0.08);
    part(new THREE.CapsuleGeometry(0.13, 0.5, 6, 14), skin, sx * 0.15, 0.0, 0);
    part(new THREE.CapsuleGeometry(0.1, 0.5, 6, 14), skin, sx * 0.16, -0.62, 0);
  }
  // çalışan kaslar: ön uyluk + kalça (uygulamadaki Goblet Squat örneği gibi)
  const quads = [-1, 1].map((sx) => part(new THREE.CapsuleGeometry(0.115, 0.38, 6, 14), hot, sx * 0.15, 0.02, 0.06));
  const glutes = [-1, 1].map((sx) => part(new THREE.SphereGeometry(0.15, 16, 12), hot, sx * 0.12, 0.42, -0.12));
  const muscleTag = textSprite(L('QUADS · GLUTES', 'ÖN UYLUK · KALÇA'), { size: 40, color: '#ffb48a', bg: 'rgba(10,10,14,0.7)' });
  muscleTag.scale.multiplyScalar(0.22);
  muscleTag.position.set(0.75, 0.2, 0);
  body.add(muscleTag);
  const aura = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.4), new THREE.MeshBasicMaterial({ map: haloTex(), color: OR, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false }));
  aura.position.set(0, 0.5, -0.4);
  body.add(aura);
  scene.add(body);

  // ---- beslenme etiketleri ----
  const foods = [
    L('Lentil soup · 1 bowl · 180 kcal', 'Mercimek çorbası · 1 kase · 180 kcal'),
    L('Simit · 1 piece · 280 kcal', 'Simit · 1 adet · 280 kcal'),
    L('Ayran · 1 glass · 70 kcal', 'Ayran · 1 bardak · 70 kcal'),
    L('You are 180 kcal over your target', 'Hedefin 180 kcal üzerindesin'),
  ].map((txt, i) => {
    const s = textSprite(txt, { size: 40, color: i === 3 ? '#ffd166' : '#f3e9e2', bg: 'rgba(12,12,16,0.72)', font: '500 {s}px Inter, sans-serif' });
    s.scale.multiplyScalar(0.24);
    scene.add(s);
    return s;
  });

  const key = new THREE.PointLight(0xff8a50, 20, 18);
  key.position.set(2, 3, 4);
  const rim = new THREE.PointLight(0x7a8cff, 12, 18);
  rim.position.set(-4, 2, -2);
  scene.add(key, rim);

  let kShown = 0;
  const V = new THREE.Vector3();
  return {
    scene,
    camera,
    bloom: { strength: 0.5, radius: 0.5, threshold: 0.96 },
    hud(s) {
      return [
        [L('Today', 'Bugün'), L('Leg day · 6 moves', 'Bacak günü · 6 hareket')],
        ['kcal', `${Math.round(kShown)} / 2200`],
        [L('Streak', 'Seri'), L('12 days', '12 gün')],
        [L('Next session', 'Sıradaki seans'), '18:00'],
      ];
    },
    update(t, dt, s) {
      const sd = b.tick(t, dt, s, { camZ: 9.5, spread: 3.9 });
      const sp = s.sp;
      const X = s.mobile ? 0 : sd.x * 3.9;
      const IN = s.mobile ? 0 : sd.x * 1.0; // telefonun iç tarafı
      const Y = s.mobile ? 1.2 : 0;
      const sc = s.mobile ? 0.72 : 1;
      // zemin halkası artık dekoratif değil: sayfadaki ilerlemeyi "bugünkü antrenman" göstergesi gibi okur
      const workoutProgress = Math.max(0, Math.min(1, sp / 7));
      progressRing.scale.setScalar(0.4 + workoutProgress * 0.6);
      progressRing.material.opacity = 0.25 + Math.sin(t * 1.2) * 0.08;

      // videolar: hero'da telefonun etrafında yay, kütüphanede figürün etrafında
      const vHero = Math.max(near(sp, 0, 0.9), near(sp, 7, 1));
      const vLib = near(sp, 3, 0.9);
      const vVis = Math.max(vHero, vLib);
      screens.forEach((g, i) => {
        const n = screens.length;
        const a = (i / n) * Math.PI * 2 + t * 0.18;
        const r = 3.1 * sc;
        const cx = vLib > vHero ? IN * 1.2 : X;
        g.position.set(cx + Math.cos(a) * r, Y + Math.sin(a * 2 + i) * 0.35 + 0.2, Math.sin(a) * r * 0.55 - 1.5);
        g.lookAt(camera.position);
        g.scale.setScalar(Math.max(0.001, vVis * sc * 0.95));
        g.visible = vVis > 0.02;
      });

      // kalori halkası: bugün ve beslenme bölümlerinde
      const vRing = Math.max(near(sp, 1, 0.85), near(sp, 4, 0.85));
      ringG.visible = vRing > 0.02;
      ringG.position.set(IN, Y + 0.2, -0.5);
      ringG.scale.setScalar(Math.max(0.001, vRing * sc * (sp > 3 ? 1.25 : 1)));
      ringG.rotation.set(s.mouseS.y * 0.2, s.mouseS.x * 0.3 + Math.sin(t * 0.4) * 0.12, 0);
      const target = vRing > 0.5 ? (sp > 3 ? 2380 : 1480) : 0;
      kShown = damp(kShown, target, 2.5, dt);
      arcMat.uniforms.k.value = Math.min(1, kShown / 2200);
      arcMat.uniforms.col.value.set(kShown > 2200 ? 0xffd166 : 0xff5a1f);
      const kr = Math.round(kShown / 10) * 10;
      if (kr !== lastK) { lastK = kr; drawKcal(kr); }
      macros.forEach((m, i) => (m.scale.y = Math.max(0.001, damp(m.scale.y, vRing > 0.5 ? m.userData.v * 1.8 : 0.001, 3 - i * 0.4, dt))));

      // koç kartları
      const vC = near(sp, 2, 0.85);
      coaches.forEach((m, i) => {
        m.visible = vC > 0.02;
        const k = Math.max(0, Math.min(1, vC * 1.4 - i * 0.15));
        m.position.set(IN + (i - 1) * 0.5 * sc, Y + (1 - i) * 1.05 * sc + Math.sin(t + i) * 0.05, -0.6 - i * 0.4 + (1 - k) * -3);
        m.rotation.set(0, sd.x * 0.35 + s.mouseS.x * 0.15, (i - 1) * 0.03);
        m.scale.setScalar(Math.max(0.001, k * sc));
        m.userData.tick(t);
      });

      // figür
      const vB = near(sp, 3, 0.85);
      body.visible = vB > 0.02;
      body.position.set(IN * 0.7, s.mobile ? 0.4 : -1.2, 0.3);
      body.scale.setScalar(Math.max(0.001, vB * sc * 1.9));
      body.rotation.y = Math.sin(t * 0.5) * 0.6 + s.mouseS.x * 0.4;
      const pulse = 0.6 + 0.4 * Math.sin(t * 3);
      hot.emissiveIntensity = 0.5 + pulse * 0.9;
      quads.concat(glutes).forEach((m) => m.scale.setScalar(1 + pulse * 0.06));

      // beslenme etiketleri
      const vF = near(sp, 4, 0.85);
      foods.forEach((f, i) => {
        f.visible = vF > 0.02;
        f.material.opacity = Math.max(0, Math.min(1, vF * 1.6 - i * 0.2));
        f.position.copy(ringG.position).add(V.set(0, (i === 3 ? -1.85 : 2.45 - i * 0.42) * sc, 0.4));
      });

      // telefon: koç ve kütüphane bölümlerinde yan tarafa çekilir
      if (b.phone) {
        // kütüphane bölümünde figür öne çıkar, telefon kenara çekilir
        b.phone.position.x += sd.x * vB * 1.6;
        b.phone.position.z -= vB * 1.5;
        b.phone.scale.multiplyScalar(1 - vB * 0.35);
      }
    },
    dispose() {
      vids.forEach(({ v, t }) => {
        v.pause();
        v.removeAttribute('src');
        v.load();
        t.dispose();
      });
    },
  };
}
