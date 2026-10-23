import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { productBase } from './base.js';
import { tex, makePhone, picture, foilCard, canvasTex, dynamicTextSprite, damp, near, smooth } from '../lib.js';
import { haloTex } from './home.js';
import { playCoin, playDoor, startAmbience, stopAmbience } from '../audio.js';

// Şoreş: beş fabrikanın telefonları bir yelpazede, etrafta uçuşan işçiler,
// yağan sikke ve banknot destesi.
export function build({ renderer, product, lang }) {
  const L = (en, tr) => (lang === 'tr' ? tr : en);
  const b = productBase({ renderer, product, sky: [0x5a2a0e, 0x120803, 0.8], fog: [0x1c0d05, 0.018], dustColor: 0xffc070, phone: false });
  const { scene, camera } = b;

  // ---- fabrika yelpazesi ----
  const fan = new THREE.Group();
  const phones = product.shots.map((u) => {
    const p = makePhone(tex(u, renderer), { width: 1.75, aspect: 420 / 747, color: 0x2a1a10 });
    fan.add(p);
    return p;
  });
  // yelpazenin arkasında sıcak ışık
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.MeshBasicMaterial({ map: haloTex(), color: 0xff9a3c, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
  glow.position.set(0, 0, -4);
  fan.add(glow);
  scene.add(fan);
  let focus = 0;


  // ---- atölye dioraması: 9 masa, işçiler, patron masası; beş fabrikanın paleti ----
  const PALS = [
    [0xb7773d, 0xb89a74, 'b0', L('Wood Workshop', 'Ahşap Atölyesi')], // ahşap atölyesi
    [0x9c86c9, 0x8e7bb5, 'b2', L('Paint Shop', 'Boya Atölyesi')], // boya atölyesi
    [0x4f8a80, 0x6f9c94, 'b4', L('Pirate Toys', 'Korsan Oyuncak')], // korsan oyuncak
    [0xc9553a, 0xb48a66, 'b2', L('Circus', 'Sirk')], // sirk
    [0x7f90a8, 0x8e9db2, 'b4', L('Robot Factory', 'Robot Fabrikası')], // robot fabrikası
  ];
  const dio = new THREE.Group();
  const floorMat = new THREE.MeshStandardMaterial({ color: PALS[0][0], roughness: 0.8, envMapIntensity: 0.4 });
  const wallMat = new THREE.MeshStandardMaterial({ color: PALS[0][1], roughness: 0.9, envMapIntensity: 0.3 });
  const plank = new THREE.Mesh(new RoundedBoxGeometry(5, 0.28, 3.8, 3, 0.06), floorMat);
  plank.position.y = -0.14;
  // duvar boyu: patron büyüdüğünde kafası taşmasın diye önceki 1.8'den yükseltildi
  const backW = new THREE.Mesh(new THREE.BoxGeometry(5, 2.7, 0.12), wallMat);
  backW.position.set(0, 1.35, -1.84);
  const sideW = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.7, 3.8), wallMat);
  sideW.position.set(-2.44, 1.35, 0);
  dio.add(plank, backW, sideW);
  // gerçek oyundan alınan dünya görseli: duvara asılı küçük bir çerçeve gibi — köşede,
  // patronun ve masaların dışında, duvarın sınırları içinde kalacak boyutta
  const roomTex = [0, 1, 2, 3, 4].map((i) => tex(`media/sores-room${i}.webp`, renderer));
  const frameBack = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 1.14), new THREE.MeshStandardMaterial({ color: 0x3a2412, roughness: 0.7 }));
  frameBack.position.set(-1.75, 1.95, -1.8);
  dio.add(frameBack);
  const roomArt = picture(roomTex[0], 0.62, 640 / 1138, { transparent: false });
  roomArt.position.set(-1.75, 1.95, -1.78);
  dio.add(roomArt);
  // tek paylaşılan doku: dünya değişiminde metni yeniden çizer (her dünya için ayrı doku açmaz)
  const worldLabel = dynamicTextSprite(PALS[0][3].toUpperCase(), { size: 42, color: '#ffe6c2', bg: 'rgba(20,10,4,0.72)', maxChars: 20, scale: 0.26 });
  worldLabel.position.set(0, 2.9, -1.5);
  worldLabel.material.opacity = 0;
  dio.add(worldLabel);
  const deskMat = new THREE.MeshStandardMaterial({ color: 0x7a4a24, roughness: 0.7 });
  const desks = [];
  const crewNames = ['w0', 'w2', 'w5', 'w6', 'w8', 'w2', 'w0', 'w6', 'w5'];
  for (let i = 0; i < 9; i++) {
    const gx = (i % 3) - 1, gz = Math.floor(i / 3);
    const d = new THREE.Group();
    const top = new THREE.Mesh(new RoundedBoxGeometry(0.95, 0.12, 0.6, 2, 0.03), deskMat);
    top.position.y = 0.42;
    d.add(top);
    for (const [lx, lz] of [[-0.4, -0.24], [0.4, -0.24], [-0.4, 0.24], [0.4, 0.24]]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.4, 0.07), deskMat);
      leg.position.set(lx, 0.2, lz);
      d.add(leg);
    }
    const w = picture(tex(`media/sores-${crewNames[i]}.webp`, renderer), 0.62, 2 / 3);
    w.position.set(0, 0.62, -0.38);
    d.add(w);
    d.position.set(gx * 1.35, 0, -0.55 + gz * 1.0);
    d.userData = { w, phase: i * 0.7 };
    dio.add(d);
    desks.push(d);
  }
  const bossDesk = new THREE.Mesh(new RoundedBoxGeometry(1.6, 0.5, 0.6, 2, 0.05), new THREE.MeshStandardMaterial({ color: 0x5a3317, roughness: 0.6 }));
  bossDesk.position.set(0, 0.25, -1.35);
  // patron: düz resim değil, holografik kenarlı "koleksiyon kartı" — seviye atlayan patron bir ödül gibi hissettirir
  const boss = foilCard(tex('media/sores-b0.webp', renderer), 0.8, 2 / 3, { thickness: 0.05 });
  boss.position.set(0, 0.85, -1.62);
  dio.add(bossDesk, boss);
  const bossTex = { b0: tex('media/sores-b0.webp', renderer), b2: tex('media/sores-b2.webp', renderer), b4: tex('media/sores-b4.webp', renderer) };
  // uçan oyuncaklar: masadan patron masasına
  const toyTex = ['prod0', 'prod2', 'prod4'].map((n) => tex(`media/sores-${n}.webp`, renderer));
  const toys = Array.from({ length: 9 }, (_, i) => {
    const m = picture(toyTex[0], 0.32, 1);
    m.userData = { desk: i, t: Math.random() };
    dio.add(m);
    return m;
  });
  scene.add(dio);
  const cFrom = new THREE.Color(), cTo = new THREE.Color();
  let palIdx = 0;

  // ---- uçuşan işçiler ----
  const crew = ['w0', 'w2', 'w5', 'w6', 'w8', 'b0', 'b2', 'b4', 'prod0', 'prod2', 'prod4'].map((n, i) => {
    const isProd = n.startsWith('prod');
    const m = picture(tex(`media/sores-${n}.webp`, renderer), isProd ? 0.6 : 0.85, isProd ? 1 : 2 / 3);
    const a = (i / 11) * Math.PI * 2;
    const kind = isProd ? L('Toy', 'Oyuncak') : n.startsWith('b') ? L('Boss', 'Patron') : L('Worker', 'İşçi');
    const label = isProd ? kind : `${kind} · ${L('power', 'güç')} ×${8 + i * 7}`;
    m.userData = { a, r: 6 + (i % 3) * 1.5, y: ((i * 37) % 7) / 7 - 0.5, sp: 0.6 + (i % 4) * 0.15, label };
    scene.add(m);
    return m;
  });
  // tek paylaşılan baloncuk: aynı anda tek karakter hover olabileceği için 11 ayrı doku yerine tek doku
  const hoverBubble = dynamicTextSprite(crew[0].userData.label, { size: 34, color: '#fff3df', bg: 'rgba(20,10,4,0.78)', maxChars: 28, scale: 0.22 });
  hoverBubble.material.opacity = 0;
  hoverBubble.renderOrder = 5;
  scene.add(hoverBubble);
  const hoverRay = new THREE.Raycaster();
  let hoverIdx = -1;

  // ---- sikkeler ----
  const coinGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.035, 40);
  const coinMat = new THREE.MeshPhysicalMaterial({ color: 0xffc43a, metalness: 1, roughness: 0.22, clearcoat: 0.6, emissive: 0x3a2000, emissiveIntensity: 0.4 });
  const COINS = 34;
  const coins = new THREE.InstancedMesh(coinGeo, coinMat, COINS);
  // ---- banknot desteleri ----
  const billTex = canvasTex(256, 128, (g, w, h) => {
    g.fillStyle = '#3fae4a'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#1d6b28'; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20);
    g.fillStyle = '#d8f5c8'; g.beginPath(); g.arc(w / 2, h / 2, 30, 0, 7); g.fill();
    g.fillStyle = '#1d6b28'; g.font = 'bold 40px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('₺', w / 2, h / 2 + 2);
  });
  const billMat = new THREE.MeshStandardMaterial({ map: billTex, roughness: 0.6 });
  const sideMat = new THREE.MeshStandardMaterial({ color: 0x8fb98a, roughness: 0.9 });
  const BILLS = 12;
  const bills = new THREE.InstancedMesh(new RoundedBoxGeometry(0.62, 0.12, 0.31, 2, 0.02), [sideMat, sideMat, billMat, sideMat, sideMat, sideMat], BILLS);
  scene.add(coins, bills);
  const seeds = Array.from({ length: COINS + BILLS }, () => ({
    x: (Math.random() - 0.5) * 22, y: Math.random() * 14 - 7, z: -2 - Math.random() * 9,
    v: 0.25 + Math.random() * 0.45, r: Math.random() * 6, rs: (Math.random() - 0.5) * 2.5,
  }));
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), V = new THREE.Vector3(), S1 = new THREE.Vector3(1, 1, 1), S2 = new THREE.Vector3(), S3 = new THREE.Vector3();

  // sıcak atölye ışığı
  const lamp = new THREE.PointLight(0xffb35c, 40, 25);
  lamp.position.set(0, 4, 4);
  scene.add(lamp);

  // ---- masa üstü kazanç yazıları: rastgele aralıklarla "+N₺" yükselip kaybolur ----
  const popAmounts = [8, 12, 15, 18, 22, 27];
  // 3 paylaşılan doku, 6 masa arasında dönüyor — 6 ayrı doku yerine
  const POP_SLOTS = 3;
  const popups = Array.from({ length: POP_SLOTS }, (_, i) => {
    const spr = dynamicTextSprite(`+${popAmounts[0]}₺`, { size: 40, color: '#ffe28a', bg: null, font: '700 {s}px Fraunces, Georgia, serif', maxChars: 6, scale: 0.22 });
    spr.material.opacity = 0;
    dio.add(spr);
    return { spr, phase: i * 2.3, period: 4.8 + i * 1.1, desk: (i * 3) % 9, amount: -1 };
  });

  // ---- tıklama ile jeton patlaması ----
  const BURST = 16;
  const burst = new THREE.InstancedMesh(coinGeo, coinMat, BURST);
  scene.add(burst);
  const burstState = Array.from({ length: BURST }, () => ({ active: false, t: 0, p: new THREE.Vector3(), v: new THREE.Vector3() }));
  let burstCursor = 0;
  const clickPop = dynamicTextSprite('+₺', { size: 48, color: '#ffe28a', bg: null, font: '700 {s}px Fraunces, Georgia, serif', maxChars: 4, scale: 0.3 });
  clickPop.material.opacity = 0;
  scene.add(clickPop);
  let clickPopT = -1;
  const clickPopPos = new THREE.Vector3();
  startAmbience();

  // ---- prestij mücevheri: "uzun oyun" bölümünde — şirketi satıp kalıcı yıldız kazanma mekaniğinin görseli ----
  const gem = new THREE.Group();
  const shardGeo = new THREE.ConeGeometry(0.26, 1.0, 4);
  const shards = PALS.map(([c], i) => {
    const sm = new THREE.Mesh(shardGeo, new THREE.MeshPhysicalMaterial({ color: c, metalness: 0.35, roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.08, emissive: c, emissiveIntensity: 0.18 }));
    const a = (i / PALS.length) * Math.PI * 2;
    sm.position.set(Math.cos(a) * 0.32, 0, Math.sin(a) * 0.32);
    sm.rotation.x = 0.55;
    sm.rotation.z = a;
    gem.add(sm);
    return sm;
  });
  const gemGlow = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.4), new THREE.MeshBasicMaterial({ map: haloTex(), color: 0xffe3a0, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false }));
  gemGlow.position.z = -0.15;
  gem.add(gemGlow);
  const STARS = 12;
  const starGeo = new THREE.OctahedronGeometry(0.05, 0);
  const starMat = new THREE.MeshBasicMaterial({ color: 0xffe28a, toneMapped: false });
  const prestigeStars = new THREE.InstancedMesh(starGeo, starMat, STARS);
  gem.add(prestigeStars);
  scene.add(gem);

  return {
    scene,
    camera,
    exposure: 1.1,
    bloom: { strength: 0.35, radius: 0.5, threshold: 0.88 },
    update(t, dt, s) {
      const sd = b.tick(t, dt, s, { camZ: 9.5 });
      const N = product.sections.length;
      // hangi fabrika önde: hero → 0, özellik bölümleri → kendi ekranı, sonra yavaşça dönen gösteri
      const idx = Math.round(s.sp);
      const target = idx === 0 ? 0 : idx <= N ? product.sections[idx - 1].shot : (t * 0.4) % 5;
      focus = damp(focus, target, 3, dt);
      const spread = s.mobile ? 0 : 2.7;
      // hero'da başlık telefonla çakışmasın diye yelpaze biraz daha sağa kayar
      const heroPush = s.mobile ? 0 : near(s.sp, 0, 0.7) * 1.2;
      fan.position.set(sd.x * spread + heroPush, sd.y * (s.mobile ? 1.5 : 1), sd.z);
      fan.scale.setScalar(s.mobile ? 0.72 : 1);
      phones.forEach((p, i) => {
        const d = i - focus;
        const a = d * 0.5;
        p.position.set(Math.sin(a) * 3.2, -Math.abs(d) * 0.1 + Math.sin(t + i) * 0.05, Math.cos(a) * 3.2 - 3.2 - Math.abs(d) * 0.4);
        p.rotation.set(0.04 + s.mouseS.y * 0.1, a * 0.9 - sd.x * 0.25 + s.mouseS.x * 0.15, -d * 0.04);
        p.scale.setScalar(1 - Math.min(Math.abs(d), 3) * 0.06);
        p.userData.tick(dt, t);
      });


      // --- diorama: atölye ve patron bölümlerinde öne çıkar, dünyalar bölümünde paletler döner ---
      const vD = Math.max(near(s.sp, 1, 0.9), near(s.sp, 2, 0.9), near(s.sp, 3, 0.9));
      dio.visible = vD > 0.02;
      dio.position.set(s.mobile ? 0 : sd.x * 1.7, s.mobile ? 0.2 : -1.25, s.mobile ? -2 : 0.2);
      dio.scale.setScalar(Math.max(0.001, vD * (s.mobile ? 0.62 : 0.95)));
      dio.rotation.set(0.42 + s.mouseS.y * 0.06, -0.55 * sd.x + Math.sin(t * 0.3) * 0.08 + s.mouseS.x * 0.15, 0);
      fan.visible = vD < 0.95;
      fan.scale.multiplyScalar(1 - vD * 0.6);
      fan.position.z -= vD * 3;
      // patron büyür (2. bölüm), dünyalar bölümünde fabrika paleti değişir
      const grow = 1 + smooth(1.5, 2.2, s.sp) * 0.7 + Math.sin(t * 2) * 0.02;
      boss.scale.setScalar(grow);
      boss.position.y = 0.85 + (grow - 1) * 0.3;
      const pi = s.sp > 2.5 ? Math.floor(t * 0.5) % 5 : 0;
      if (pi !== palIdx) {
        palIdx = pi;
        boss.material.map = bossTex[PALS[pi][2]];
        boss.material.needsUpdate = true;
        toys.forEach((m, i) => {
          m.material.map = toyTex[[0, 1, 2, 1, 2][pi]];
          m.material.needsUpdate = true;
        });
        roomArt.material.map = roomTex[pi];
        roomArt.material.needsUpdate = true;
        worldLabel.userData.setText(PALS[pi][3].toUpperCase());
        playDoor();
      }
      cTo.set(PALS[palIdx][0]);
      floorMat.color.lerp(cTo, 1 - Math.exp(-dt * 4));
      cTo.set(PALS[palIdx][1]);
      wallMat.color.lerp(cTo, 1 - Math.exp(-dt * 4));
      worldLabel.material.opacity = damp(worldLabel.material.opacity, vD > 0.3 ? 1 : 0, 6, dt);
      boss.userData.tick(t);

      // prestij mücevheri: "uzun oyun" bölümünde öne çıkar, yıldızlar etrafında döner
      const vGem = near(s.sp, N, 0.85);
      gem.visible = vGem > 0.02;
      gem.position.set(s.mobile ? 0 : sd.x * 1.6, s.mobile ? -0.6 : 1.4, s.mobile ? -1.5 : -0.8);
      gem.scale.setScalar(Math.max(0.001, vGem * (s.mobile ? 0.75 : 1)));
      gem.rotation.y = t * 0.45;
      shards.forEach((m, i) => (m.scale.setScalar(1 + Math.sin(t * 2 + i) * 0.05)));
      for (let i = 0; i < STARS; i++) {
        const a = (i / STARS) * Math.PI * 2 + t * 0.6;
        const r = 0.95 + (i % 3) * 0.22;
        V.set(Math.cos(a) * r, Math.sin(t * 1.4 + i) * 0.3, Math.sin(a) * r);
        E.set(t + i, t * 1.3, 0);
        M.compose(V, Q.setFromEuler(E), S1);
        prestigeStars.setMatrixAt(i, M);
      }
      prestigeStars.instanceMatrix.needsUpdate = true;
      desks.forEach((d) => {
        d.userData.w.position.y = 0.62 + Math.abs(Math.sin(t * 4 + d.userData.phase)) * 0.05;
        d.userData.w.rotation.z = Math.sin(t * 4 + d.userData.phase) * 0.06;
        d.userData.w.lookAt(camera.position);
      });
      popups.forEach((p, pi2) => {
        const cycIdx = Math.floor((t + p.phase) / p.period);
        if (cycIdx !== p.amount) {
          p.amount = cycIdx;
          p.desk = (cycIdx * 2 + pi2 * 3) % 9;
          p.spr.userData.setText(`+${popAmounts[cycIdx % popAmounts.length]}₺`);
        }
        const cyc = (t + p.phase) % p.period;
        const rise = cyc < 1.3 ? cyc / 1.3 : -1;
        if (rise < 0 || vD < 0.3) {
          p.spr.material.opacity = 0;
          return;
        }
        const d = desks[p.desk];
        p.spr.position.set(d.position.x, 0.95 + rise * 0.85, d.position.z);
        p.spr.material.opacity = Math.sin(rise * Math.PI);
      });
      boss.lookAt(camera.position);
      toys.forEach((m) => {
        const u = m.userData;
        u.t += dt * (0.35 + vD * 0.3);
        if (u.t > 1) u.t = 0;
        const d = desks[u.desk];
        const k = u.t;
        m.position.set(d.position.x * (1 - k), 0.55 + Math.sin(k * Math.PI) * 1.1 + k * 0.4, d.position.z * (1 - k) + -1.35 * k);
        m.scale.setScalar(k < 0.05 ? k * 20 : k > 0.92 ? (1 - k) * 12 : 1);
        m.lookAt(camera.position);
      });

      hoverRay.setFromCamera(s.mouse, camera);
      const hoverHit = hoverRay.intersectObjects(crew, false)[0];
      const newHoverIdx = hoverHit ? crew.indexOf(hoverHit.object) : -1;
      if (newHoverIdx !== hoverIdx && newHoverIdx >= 0) hoverBubble.userData.setText(crew[newHoverIdx].userData.label);
      hoverIdx = newHoverIdx;
      document.body.style.cursor = hoverIdx >= 0 && !document.querySelector('.panel:hover,.card:hover,a:hover') ? 'pointer' : '';
      hoverBubble.material.opacity = damp(hoverBubble.material.opacity, hoverIdx >= 0 ? 1 : 0, 10, dt);
      crew.forEach((m, i) => {
        const u = m.userData;
        const hov = i === hoverIdx ? 1 : 0;
        u.hov = damp(u.hov ?? 0, hov, 10, dt);
        const a = u.a + t * 0.07 * u.sp + s.p * 2.2;
        m.position.set(Math.cos(a) * u.r * 1.2, u.y * 5 + Math.sin(t * u.sp + i) * 0.35 + u.hov * Math.abs(Math.sin(t * 9)) * 0.45, Math.sin(a) * u.r * 0.4 - 9);
        m.lookAt(camera.position);
        m.rotation.z += Math.sin(t * 1.3 + i) * 0.08 + u.hov * Math.sin(t * 14) * 0.4;
        m.scale.setScalar(1 + u.hov * 0.22);
        if (i === hoverIdx) hoverBubble.position.set(m.position.x, m.position.y + 0.56, m.position.z);
      });
      hoverBubble.visible = hoverBubble.material.opacity > 0.02;

      // para yağmuru: diorama aktifken (okunabilirlik için) iner, istatistik bölümünde coşar
      const rush = 1 + near(s.sp, N + 1, 1) * 2.2;
      const rainScale = Math.max(0.1, 1 - vD * 0.85);
      S2.setScalar(rainScale);
      for (let i = 0; i < COINS + BILLS; i++) {
        const q = seeds[i];
        q.y -= q.v * dt * rush;
        if (q.y < -7) q.y = 7;
        q.r += q.rs * dt;
        E.set(q.r, q.r * 0.7, q.r * 0.3);
        Q.setFromEuler(E);
        V.set(q.x, q.y, q.z);
        M.compose(V, Q, S2);
        if (i < COINS) coins.setMatrixAt(i, M);
        else bills.setMatrixAt(i - COINS, M);
      }
      coins.instanceMatrix.needsUpdate = true;
      bills.instanceMatrix.needsUpdate = true;

      // tıklama jeton patlaması
      for (let i = 0; i < BURST; i++) {
        const st = burstState[i];
        if (st.active) {
          st.t += dt;
          st.v.y -= dt * 6;
          st.p.addScaledVector(st.v, dt);
          const life = 1 - Math.min(1, st.t / 0.9);
          if (life <= 0) st.active = false;
          M.compose(st.p, Q.identity(), S3.setScalar(Math.max(0.0001, life)));
        } else {
          M.compose(st.p, Q.identity(), S3.setScalar(0.0001));
        }
        burst.setMatrixAt(i, M);
      }
      burst.instanceMatrix.needsUpdate = true;
      if (clickPopT >= 0) {
        clickPopT += dt;
        const k = Math.min(1, clickPopT / 0.9);
        clickPop.position.set(clickPopPos.x, clickPopPos.y + k * 1.1, clickPopPos.z);
        clickPop.material.opacity = 1 - k;
        if (k >= 1) clickPopT = -1;
      } else {
        clickPop.material.opacity = 0;
      }
    },
    click(e) {
      playCoin();
      const ndc = new THREE.Vector2((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
      hoverRay.setFromCamera(ndc, camera);
      const p = hoverRay.ray.at(6, new THREE.Vector3());
      for (let k = 0; k < 8; k++) {
        const st = burstState[burstCursor % BURST];
        burstCursor++;
        st.active = true;
        st.t = 0;
        st.p.copy(p);
        const a = Math.random() * Math.PI * 2, sp = 1 + Math.random() * 2;
        st.v.set(Math.cos(a) * sp, 2.5 + Math.random() * 2, Math.sin(a) * sp);
      }
      clickPopPos.copy(p);
      clickPopT = 0;
    },
    dispose() {
      stopAmbience();
      document.body.style.cursor = '';
    },
  };
}
