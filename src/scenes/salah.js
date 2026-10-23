import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { productBase } from './base.js';
import { tex, picture, canvasTex, keyframe, damp, near, dust, smooth, textSprite } from '../lib.js';
import { haloTex } from './home.js';

// Sincere Salah: yüzen bir bahçe adası. Kaydırdıkça gök şafaktan yatsıya döner,
// fide ağaca dönüşür, fenerler yanar, adanın etrafında bir tesbih döner.
export function build({ renderer, product, lang }) {
  const b = productBase({ renderer, product, sky: [0x1b2a5a, 0x0a0f22, 0.8], dustColor: 0xffe7b0, phone: false });
  const { scene, camera, dome } = b;
  scene.fog = new THREE.FogExp2(0x0a0f22, 0.012);

  // gökyüzü durakları: şafak → kuşluk → akşam → yatsı → gece
  const skies = [
    { top: [0.07, 0.1, 0.27], bot: [0.85, 0.5, 0.42], star: 0.6 },
    { top: [0.16, 0.36, 0.66], bot: [0.93, 0.78, 0.6], star: 0.0 },
    { top: [0.15, 0.1, 0.34], bot: [0.9, 0.44, 0.3], star: 0.2 },
    { top: [0.04, 0.05, 0.16], bot: [0.2, 0.16, 0.38], star: 0.85 },
    { top: [0.015, 0.02, 0.06], bot: [0.06, 0.07, 0.17], star: 1 },
  ];
  const stars = dust({ count: 1400, spread: 80, depth: 40, size: 0.06, color: 0xffffff, opacity: 1, y: 14 });
  stars.position.z = -25;
  scene.add(stars);

  // ---- hilal ----
  const moonTex = canvasTex(512, 512, (g, w) => {
    const gr = g.createRadialGradient(w / 2, w / 2, 60, w / 2, w / 2, 250);
    gr.addColorStop(0, 'rgba(255,235,190,0.35)');
    gr.addColorStop(1, 'rgba(255,235,190,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, w, w);
    // hilali ayrı bir tuvalde kes, sonra parıltının üstüne koy
    const c2 = document.createElement('canvas');
    c2.width = c2.height = w;
    const h = c2.getContext('2d');
    h.fillStyle = '#ffe9b8';
    h.beginPath();
    h.arc(w / 2, w / 2, 110, 0, 7);
    h.fill();
    h.globalCompositeOperation = 'destination-out';
    h.beginPath();
    h.arc(w / 2 + 52, w / 2 - 30, 100, 0, 7);
    h.fill();
    g.drawImage(c2, 0, 0);
  });
  const moon = picture(moonTex, 5, 1);
  moon.material.blending = THREE.AdditiveBlending;
  moon.position.set(4.5, 5, -16);
  scene.add(moon);

  // ---- ada ----
  const island = new THREE.Group();
  const soil = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 0.9, 1.3, 48, 3), new THREE.MeshStandardMaterial({ color: 0x4a3324, roughness: 1, flatShading: true }));
  soil.position.y = -0.65;
  const pos = soil.geometry.attributes.position;
  // dikiş yerindeki çift köşeler aynı değeri alsın diye konumdan türetilen sözde rastgele
  const hash = (x, y, z) => { const v = Math.sin(Math.round(x * 97) * 12.9898 + Math.round(y * 89) * 78.233 + Math.round(z * 83) * 37.719) * 43758.5453; return v - Math.floor(v); };
  for (let i = 0; i < pos.count; i++) if (pos.getY(i) < 0.6) { const f = 0.88 + hash(pos.getX(i), pos.getY(i), pos.getZ(i)) * 0.24; pos.setX(i, pos.getX(i) * f); pos.setZ(i, pos.getZ(i) * f); }
  soil.geometry.computeVertexNormals();
  const grass = new THREE.Mesh(new THREE.CylinderGeometry(1.95, 1.9, 0.16, 48), new THREE.MeshStandardMaterial({ color: 0x3d6b3e, roughness: 0.95 }));
  island.add(soil, grass);

  // büyüme evreleri (aynı yerde üst üste, opaklıkla geçiş)
  const stages = Array.from({ length: 6 }, (_, i) => {
    const m = picture(tex(`media/garden-${i}.webp`, renderer), 5.2, 1, { opacity: 0 });
    m.position.y = 2.45;
    m.material.depthWrite = false;
    island.add(m);
    return m;
  });
  // süsler
  const deco = [
    ['salah-decor_lantern', -1.35, 0.42, 0.5, 0.7],
    ['salah-plant_jasmine', 1.3, 0.45, 0.4, 0.85],
    ['salah-decor_fountain_small', 0.55, 0.4, 1.15, 0.8],
  ].map(([n, x, y, z, w]) => {
    const m = picture(tex(`media/${n}.webp`, renderer), w, 1);
    m.position.set(x, y, z);
    island.add(m);
    return m;
  });
  scene.add(island);


  // ---- beş vakit yayı: güneş/ay yay boyunca ilerler (2. bölüm) ----
  const arcG = new THREE.Group();
  const arcLine = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.012, 8, 160, Math.PI), new THREE.MeshBasicMaterial({ color: 0xffe2a8, transparent: true, opacity: 0.6, toneMapped: false }));
  arcG.add(arcLine);
  const prayerNames = lang === 'tr' ? ['SABAH', 'ÖĞLE', 'İKİNDİ', 'AKŞAM', 'YATSI'] : ['FAJR', 'DHUHR', 'ASR', 'MAGHRIB', 'ISHA'];
  const marks = prayerNames.map((n, i) => {
    const a = Math.PI * (0.92 - i * 0.21);
    const g = new THREE.Group();
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffe2a8, toneMapped: false }));
    const lab = textSprite(n, { size: 40, color: '#ffe9c2', bg: 'rgba(8,12,24,0.55)' });
    lab.scale.multiplyScalar(0.22);
    lab.position.y = 0.32;
    g.add(dot, lab);
    g.position.set(Math.cos(a) * 3.6, Math.sin(a) * 3.6, 0);
    arcG.add(g);
    return g;
  });
  const orb = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex(), color: 0xffd27a, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  orb.scale.setScalar(1.2);
  const orbCore = new THREE.Mesh(new THREE.SphereGeometry(0.14, 24, 16), new THREE.MeshBasicMaterial({ color: 0xfff1c9, toneMapped: false }));
  arcG.add(orb, orbCore);
  scene.add(arcG);

  // ---- gizlilik kubbesi: veri adadan çıkmaz (3. bölüm) ----
  const privDome = new THREE.Mesh(
    new THREE.SphereGeometry(2.6, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
      uniforms: { k: { value: 0 }, time: { value: 0 } },
      vertexShader: `varying vec3 vN; varying vec3 vV; varying vec3 vP; void main(){ vP = position; vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.0); vV = -mv.xyz; gl_Position = projectionMatrix*mv; }`,
      fragmentShader: `uniform float k; uniform float time; varying vec3 vN; varying vec3 vV; varying vec3 vP;
        void main(){ float fr = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.2);
          float hex = smoothstep(0.92, 1.0, abs(sin(vP.x*9.0)*sin(vP.y*9.0 + time)*sin(vP.z*9.0)));
          float scan = smoothstep(0.03, 0.0, abs(fract(vP.y*0.4 - time*0.2) - 0.5));
          gl_FragColor = vec4(vec3(0.95,0.82,0.5), (fr*0.7 + hex*0.15 + scan*0.25) * k); }`,
    }),
  );
  const domeTag = textSprite(lang === 'tr' ? 'CİHAZDA · 0 AĞ İSTEĞİ' : 'ON DEVICE · 0 NETWORK CALLS', { size: 40, color: '#ffe2a8', bg: 'rgba(8,12,24,0.6)' });
  domeTag.scale.multiplyScalar(0.3);
  domeTag.position.set(0, 3.0, 0);
  island.add(privDome, domeTag);

  // ---- kıble pusulası (4. bölüm) ----
  const compT = canvasTex(512, 512, (g, w) => {
    g.translate(w / 2, w / 2);
    g.strokeStyle = 'rgba(255,226,168,0.9)';
    g.lineWidth = 3;
    g.beginPath(); g.arc(0, 0, 240, 0, 7); g.stroke();
    g.beginPath(); g.arc(0, 0, 200, 0, 7); g.lineWidth = 1; g.stroke();
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * Math.PI * 2, r1 = i % 18 === 0 ? 170 : i % 6 === 0 ? 185 : 192;
      g.lineWidth = i % 18 === 0 ? 4 : 1.5;
      g.beginPath(); g.moveTo(Math.cos(a) * r1, Math.sin(a) * r1); g.lineTo(Math.cos(a) * 200, Math.sin(a) * 200); g.stroke();
    }
    g.fillStyle = '#ffe2a8'; g.font = '600 34px JetBrains Mono, monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
    ['N', 'E', 'S', 'W'].forEach((d, i) => { const a = (i / 4) * Math.PI * 2 - Math.PI / 2; g.fillText(d, Math.cos(a) * 140, Math.sin(a) * 140); });
  });
  const compass = new THREE.Group();
  const face = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), new THREE.MeshBasicMaterial({ map: compT, transparent: true, depthWrite: false, toneMapped: false }));
  const needle = new THREE.Mesh(new THREE.ConeGeometry(0.07, 1.0, 12), new THREE.MeshBasicMaterial({ color: 0xffc04d, toneMapped: false }));
  needle.rotation.x = -Math.PI / 2;
  needle.position.z = 0.02;
  const needleG = new THREE.Group();
  needle.position.y = 0;
  needle.geometry.translate(0, 0.5, 0);
  needle.rotation.set(0, 0, 0);
  needleG.add(needle);
  const kaaba = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.16), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.6 }));
  kaaba.position.set(0, 1.12, 0.08);
  needleG.add(kaaba);
  compass.add(face, needleG);
  compass.rotation.x = -Math.PI / 2 + 1.0;
  const qTag = textSprite(lang === 'tr' ? 'KIBLE · MANYETİK SAPMA DÜZELTİLDİ' : 'QIBLA · DECLINATION CORRECTED', { size: 40, color: '#ffe2a8', bg: 'rgba(8,12,24,0.6)' });
  qTag.scale.multiplyScalar(0.3);
  qTag.position.set(0, 0.2, 1.4);
  compass.add(qTag);
  qTag.rotation.x = Math.PI / 2;
  scene.add(compass);
  let needleA = 0;

  // ---- uçan fenerler ----
  const lanterns = Array.from({ length: 9 }, (_, i) => {
    const g = new THREE.Group();
    const m = picture(tex('media/salah-decor_lantern.webp', renderer), 0.55, 1);
    const h = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), new THREE.MeshBasicMaterial({ map: haloTex(), color: 0xffb648, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
    h.position.z = -0.05;
    g.add(h, m);
    g.userData = { a: (i / 9) * 6.28, r: 3.6 + (i % 3) * 1.1, y: (i % 4) * 0.7 - 0.6, s: 0.5 + (i % 5) * 0.1 };
    scene.add(g);
    return g;
  });

  // ---- tesbih (33 tane) ----
  const BEADS = 33;
  const beadMat = new THREE.MeshPhysicalMaterial({ color: 0x8a4b22, roughness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.2 });
  const beads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.085, 20, 14), beadMat, BEADS);
  scene.add(beads);
  const imam = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.075, 0.32, 16), beadMat);
  scene.add(imam);
  const M = new THREE.Matrix4(), V = new THREE.Vector3(), Q = new THREE.Quaternion(), S1 = new THREE.Vector3(1, 1, 1);

  const sun = new THREE.DirectionalLight(0xffe2b8, 2);
  sun.position.set(-4, 6, 5);
  scene.add(sun);
  const warm = new THREE.PointLight(0xffb060, 8, 10);
  warm.position.set(0, 1.5, 2);
  scene.add(warm);

  // ---- vizyon: "kendi camini inşa et" — şu anki uygulamada yok, yol haritasındaki bir sonraki fikir.
  // Ağaç/fener gibi düz, el çizimi hissi veren bir ikon: 3D kutu-primitif yerine tek parça resim + parıltı.
  const mosqueTex = canvasTex(560, 680, (g, w, h) => {
    const cx = w / 2;
    const gold = g.createLinearGradient(0, h * 0.14, 0, h * 0.96);
    gold.addColorStop(0, '#f6dfa6');
    gold.addColorStop(0.55, '#cfa35a');
    gold.addColorStop(1, '#6e4f24');
    const dark = '#241a0e';
    g.lineJoin = 'round';

    // yumuşak sıcak parıltı
    const halo = g.createRadialGradient(cx, h * 0.55, 10, cx, h * 0.55, h * 0.46);
    halo.addColorStop(0, 'rgba(255,205,130,0.5)');
    halo.addColorStop(1, 'rgba(255,205,130,0)');
    g.fillStyle = halo;
    g.fillRect(0, 0, w, h);

    // minare (sol)
    g.fillStyle = gold; g.strokeStyle = dark; g.lineWidth = 5;
    g.beginPath(); g.roundRect(cx - 168, h * 0.4, 30, h * 0.44, 8); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(cx - 153, h * 0.4, 24, 9, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(cx - 168, h * 0.385); g.lineTo(cx - 153, h * 0.26); g.lineTo(cx - 138, h * 0.385); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.arc(cx - 153, h * 0.2, 9, 0.35, Math.PI * 1.5); g.lineWidth = 4; g.stroke();

    // ana kütle
    g.fillStyle = gold; g.lineWidth = 6;
    g.beginPath(); g.roundRect(cx - 118, h * 0.62, 236, h * 0.3, 12); g.fill(); g.stroke();
    // süsleme şeridi
    g.fillStyle = dark;
    for (let i = 0; i < 10; i++) { g.beginPath(); g.arc(cx - 98 + i * 22, h * 0.655, 4, 0, Math.PI * 2); g.fill(); }

    // kubbe
    g.fillStyle = gold; g.lineWidth = 6;
    g.beginPath(); g.moveTo(cx - 108, h * 0.63); g.quadraticCurveTo(cx, h * 0.16, cx + 108, h * 0.63); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = dark; g.beginPath(); g.arc(cx, h * 0.145, 7, 0, Math.PI * 2); g.fill();

    // kapı kemeri + ılık ışık
    const doorGlow = g.createRadialGradient(cx, h * 0.88, 4, cx, h * 0.88, 76);
    doorGlow.addColorStop(0, 'rgba(255,226,165,0.95)'); doorGlow.addColorStop(1, 'rgba(255,180,90,0.04)');
    g.fillStyle = doorGlow;
    g.beginPath(); g.moveTo(cx - 40, h * 0.92); g.lineTo(cx - 40, h * 0.78); g.quadraticCurveTo(cx, h * 0.62, cx + 40, h * 0.78); g.lineTo(cx + 40, h * 0.92); g.closePath(); g.fill();
    g.strokeStyle = dark; g.lineWidth = 4; g.stroke();
  });
  const mosquePic = picture(mosqueTex, 2.6, 560 / 680);
  const mosqueG = new THREE.Group();
  mosqueG.add(mosquePic);
  const mosqueGlow = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), new THREE.MeshBasicMaterial({ map: haloTex(), color: 0xffcf8a, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false }));
  mosqueGlow.position.z = -0.3;
  mosqueG.add(mosqueGlow);
  const mosqueTag = textSprite(lang === 'tr' ? 'SIRADAKİ · KENDİ CAMİNİ İNŞA ET' : 'NEXT UP · BUILD YOUR OWN MOSQUE', { size: 38, color: '#ffe3ab', bg: 'rgba(16,12,6,0.68)' });
  mosqueTag.scale.multiplyScalar(0.3);
  mosqueTag.position.set(0, 1.9, 0);
  mosqueG.add(mosqueTag);
  scene.add(mosqueG);

  // ---- Kur'an: gerçek bir özellik — basılı Mushaf'la aynı sayfa düzeni, sayfa çevirme ----
  const bookG = new THREE.Group();
  const quranPageTex = canvasTex(600, 800, (g, w, h) => {
    g.fillStyle = '#f7ecd2';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(180,140,60,0.55)';
    g.lineWidth = 6;
    g.strokeRect(20, 20, w - 40, h - 40);
    g.strokeStyle = 'rgba(180,140,60,0.28)';
    g.lineWidth = 2;
    g.strokeRect(34, 34, w - 68, h - 68);
    // satır blokları: gerçek metin değil, sayfa düzenini anımsatan dekoratif şeritler
    g.fillStyle = 'rgba(40,30,10,0.55)';
    let y = 100;
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    while (y < h - 110) {
      const lw = 70 + rnd() * 330;
      g.fillRect(w - 72 - lw, y, lw, 15);
      y += 32;
    }
    g.fillStyle = '#b8860b';
    g.font = 'italic 30px Georgia, serif';
    g.textAlign = 'center';
    g.fillText('۝', w / 2, h - 58);
  });
  const coverMat = new THREE.MeshStandardMaterial({ color: 0x173b2e, roughness: 0.55, metalness: 0.2, emissive: 0x173b2e, emissiveIntensity: 0.05 });
  const pageMat = new THREE.MeshBasicMaterial({ map: quranPageTex, toneMapped: false });
  const bSpine = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.9, 0.08), coverMat);
  const bCoverBack = new THREE.Mesh(new RoundedBoxGeometry(2.9, 2.0, 0.08, 2, 0.05), coverMat);
  bCoverBack.position.z = -0.1;
  const bPageL = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.8), pageMat);
  bPageL.position.set(-0.68, 0, 0.02);
  bPageL.rotation.y = 0.1;
  const bPageRPivot = new THREE.Group();
  const bPageR = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.8), pageMat);
  bPageR.position.x = 0.65;
  bPageRPivot.add(bPageR);
  bookG.add(bSpine, bCoverBack, bPageL, bPageRPivot);
  const bookTag = textSprite(lang === 'tr' ? 'KUR\'AN · GERÇEK SAYFA DÜZENİ' : 'QUR\'AN · REAL PAGE LAYOUT', { size: 38, color: '#f3dba0', bg: 'rgba(12,10,4,0.68)' });
  bookTag.scale.multiplyScalar(0.3);
  bookTag.position.set(0, 1.5, 0);
  bookG.add(bookTag);
  const bookLight = new THREE.PointLight(0xffdca0, 1.6, 6);
  bookLight.position.set(0, 0.5, 1.6);
  bookG.add(bookLight);
  scene.add(bookG);

  let grow = 1;
  const top = new THREE.Color(), bot = new THREE.Color();
  return {
    scene,
    camera,
    bloom: { strength: 0.6, radius: 0.6, threshold: 0.78 },
    update(t, dt, s) {
      const sd = b.tick(t, dt, s, { camZ: 10, camY: 0.9 });
      const total = b.total;
      const N = product.sections.length;
      // gök renkleri tüm sayfa boyunca
      const k = keyframe(skies, (s.p) * (skies.length - 1));
      top.setRGB(...k.top, THREE.SRGBColorSpace);
      bot.setRGB(...k.bot, THREE.SRGBColorSpace);
      dome.userData.setColors(top, bot);
      scene.fog.color.copy(top).lerp(bot, 0.35);
      stars.material.uniforms.opacity.value = k.star;
      stars.userData.tick(t);
      moon.material.opacity = 0.3 + k.star * 0.7;
      sun.intensity = 0.6 + (1 - k.star) * 1.8;

      // ada konumu
      island.position.set(s.mobile ? 0 : sd.x * 2.4, (s.mobile ? 0.9 : -0.6) + Math.sin(t * 0.6) * 0.1, sd.z);
      island.scale.setScalar(s.mobile ? 0.72 : 1);
      island.rotation.y = Math.sin(t * 0.2) * 0.25 + s.mouseS.x * 0.2;
      // ağaç büyümesi: ilk bölümde fide, sayfa sonuna doğru tam ağaç
      grow = damp(grow, Math.min(5, 1 + s.sp * 1.1), 2.5, dt);
      stages.forEach((m, i) => {
        m.material.opacity = Math.max(0, 1 - Math.abs(grow - i));
        m.lookAt(camera.position.x, m.getWorldPosition(V).y, camera.position.z);
      });
      deco.forEach((m, i) => {
        m.material.opacity = Math.min(1, Math.max(0, grow - 1 - i));
        m.lookAt(camera.position.x, m.getWorldPosition(V).y, camera.position.z);
      });
      warm.intensity = 3 + k.star * 10;

      lanterns.forEach((g, i) => {
        const u = g.userData;
        const a = u.a + t * 0.05 * u.s;
        g.position.set(Math.cos(a) * u.r + island.position.x * 0.6, u.y + Math.sin(t * u.s + i) * 0.4 + 1 + s.p * 1.5, Math.sin(a) * u.r * 0.6 - 2);
        g.lookAt(camera.position);
        g.children[0].material.opacity = 0.1 + k.star * 0.4;
        g.visible = k.star > 0.05 || i % 3 === 0;
      });


      // vakit yayı
      const vArc = Math.max(near(s.sp, 2, 0.9), near(s.sp, 0, 0.7) * 0.5);
      arcG.visible = vArc > 0.02;
      arcG.position.set(island.position.x, island.position.y + 0.1, island.position.z - 0.6);
      arcG.scale.setScalar(Math.max(0.001, (s.mobile ? 0.6 : 1) * (0.7 + vArc * 0.3)));
      arcLine.material.opacity = 0.6 * vArc;
      marks.forEach((m) => { m.children[1].material.opacity = vArc; m.children[0].material.opacity = vArc; });
      const dayK = Math.min(1, Math.max(0, (s.sp - 1.5) / 1.2));
      const oa = Math.PI * (0.92 - dayK * 0.84);
      orb.position.set(Math.cos(oa) * 3.6, Math.sin(oa) * 3.6, 0.05);
      orbCore.position.copy(orb.position);
      orb.material.color.set(dayK > 0.75 ? 0xbfd2ff : 0xffd27a);
      orbCore.material.color.set(dayK > 0.75 ? 0xe8efff : 0xfff1c9);
      // gizlilik kubbesi
      const vDome = near(s.sp, 3, 0.9);
      privDome.visible = domeTag.visible = vDome > 0.02;
      privDome.material.uniforms.k.value = vDome;
      privDome.material.uniforms.time.value = t;
      domeTag.material.opacity = vDome;
      // pusula: iğne kıbleye oturur
      const vQ = near(s.sp, 4, 0.9);
      compass.visible = vQ > 0.02;
      compass.position.set(island.position.x, island.position.y + 0.9, island.position.z + 1.9);
      compass.scale.setScalar(Math.max(0.001, vQ * (s.mobile ? 0.7 : 1.05)));
      const qibla = -(151.6 * Math.PI) / 180;
      needleA = damp(needleA, vQ > 0.5 ? qibla : qibla + Math.sin(t * 2) * 1.5, vQ > 0.5 ? 2.5 : 6, dt);
      needleG.rotation.z = needleA;

      // tesbih: adanın çevresinde eğik bir halka, odak bölümünde öne gelir
      const focusT = near(s.sp, 4, 1);
      const cx = island.position.x, cy = island.position.y + 0.3;
      for (let i = 0; i < BEADS; i++) {
        const a = (i / (BEADS + 2)) * Math.PI * 2 + t * 0.15;
        V.set(cx + Math.cos(a) * 2.6, cy + Math.sin(a) * 0.35 - 0.1, Math.sin(a) * 1.3 + island.position.z);
        S1.setScalar((s.mobile ? 0.75 : 1) * (1 + focusT * 0.25));
        M.compose(V, Q, S1);
        beads.setMatrixAt(i, M);
      }
      beads.instanceMatrix.needsUpdate = true;
      const ai = (BEADS / (BEADS + 2)) * Math.PI * 2 + t * 0.15 + 0.18;
      imam.position.set(cx + Math.cos(ai) * 2.6, cy + Math.sin(ai) * 0.35 - 0.1, Math.sin(ai) * 1.3 + island.position.z);
      imam.rotation.z = ai;

      // vizyon: kendi camini inşa et — "rakamlarla" bölümünde belirip yavaşça beliren tek parça ikon
      const vMosque = near(s.sp, N + 1, 0.9);
      mosqueG.visible = vMosque > 0.02;
      // sd.x bu bölümde 0 olabildiğinden sabit bir yan konum kullan — adayla çakışmasın
      mosqueG.position.set(s.mobile ? 0 : 2.8, s.mobile ? 2.6 : 0.4, s.mobile ? -2.4 : -1.4);
      mosqueG.scale.setScalar(Math.max(0.001, vMosque * (s.mobile ? 0.75 : 1)));
      mosqueG.rotation.y = Math.sin(t * 0.2) * 0.15 + s.mouseS.x * 0.15;
      const assemble = smooth(0, 0.65, vMosque);
      mosquePic.material.opacity = assemble;
      mosquePic.position.y = (1 - assemble) * 0.5;
      mosqueTag.material.opacity = vMosque;
      mosqueGlow.material.opacity = 0.12 + vMosque * 0.18;

      // Kur'an: gerçek özellik, kendi bölümünde (sona eklendi) — sayfa çevirme animasyonu
      // Bu bölümde ada da aynı sd.x'i kullandığından sabit, ters taraflı bir konum kullan — gövdeye/ağaca gömülmesin
      const vBook = near(s.sp, N, 0.85);
      bookG.visible = vBook > 0.02;
      const bookSide = sd.x < 0 ? 1 : -1;
      bookG.position.set(s.mobile ? 0 : bookSide * 3.1, s.mobile ? 0.4 : 1.1, s.mobile ? -2 : 1.6);
      bookG.scale.setScalar(Math.max(0.001, vBook * (s.mobile ? 0.8 : 1)));
      bookG.rotation.y = bookSide * 0.35 + s.mouseS.x * 0.15;
      bPageRPivot.rotation.y = -0.15 + Math.sin(t * 0.5) * 0.3; // sayfa yavaşça çevriliyormuş gibi sallanır
      bookTag.material.opacity = vBook;
    },
  };
}
