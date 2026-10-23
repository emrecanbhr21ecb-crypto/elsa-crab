import * as THREE from 'three';
import { dust, skyDome, damp, smooth, clamp, lerp, keyframe, textSprite } from '../lib.js';

// Yolculuk — kaydırmayla sürülen roket hikâyesi.
// Bölüm sırası: 0 rampa · 1 (2017) ilk fırlatma, yalpalar ve düşer · 2..7 roket yeniden kurulur,
// her deneyim gökyüzünde bir yıldız olarak yanar · 8 (2024) daha yükseğe çıkar, yine düşer ·
// 9 bugün · 10 hedef: başarılı fırlatma · 11 yörünge.
// Gezegen gerçek bir küre: rampa tepesinde durur, son fırlatmada kamera geri çekilince görünür.
const R = 60; // gezegen yarıçapı
const C = new THREE.Vector3(0, -R, 0); // gezegen merkezi — rampa (0,0,0) tepede
const ORBIT = 12; // yörünge irtifası (rampa üstü)

export function build({ journey, lang }) {
  const L = (en, tr) => (lang === 'tr' ? tr : en);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 1200);

  scene.add(skyDome(0x0b1233, 0x020309, { radius: 600, power: 0.8 }));
  const stars = dust({ count: 2600, spread: 420, depth: 420, size: 0.5, color: 0xd6dcff, opacity: 0.85, y: 60 });
  scene.add(stars);

  // ---------- gezegen + atmosfer ----------
  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(R, 160, 96),
    new THREE.ShaderMaterial({
      uniforms: { sun: { value: new THREE.Vector3(-0.6, 0.5, 0.6).normalize() } },
      vertexShader: `varying vec3 vN; varying vec3 vP; void main(){ vN = normalize(mat3(modelMatrix)*normal); vec4 w = modelMatrix*vec4(position,1.0); vP = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,
      fragmentShader: `uniform vec3 sun; varying vec3 vN; varying vec3 vP;
        float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
        void main(){
          float l = clamp(dot(vN, sun)*0.9+0.25, 0.0, 1.0);
          // kıtalar: kaba bir gürültüyle iki ton
          vec2 q = vec2(atan(vN.z, vN.x), asin(vN.y))*3.0;
          vec2 i = floor(q), f = fract(q); f = f*f*(3.0-2.0*f);
          float n = mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+1.0), f.x), f.y);
          vec3 sea = vec3(0.02,0.05,0.11), land = vec3(0.06,0.07,0.05);
          vec3 c = mix(sea, land, smoothstep(0.45,0.6,n)) * (0.25 + l);
          // gece tarafında şehir ışıkları
          float city = step(0.985, h(floor(q*14.0))) * smoothstep(0.35, 0.0, l) * smoothstep(0.45,0.6,n);
          c += vec3(1.0,0.7,0.35)*city*0.8;
          // rampa çevresi: yerde koyu beton zemin
          float pad = 1.0 - smoothstep(6.0, 18.0, length(vP.xz));
          c = mix(c, vec3(0.035,0.04,0.05), pad * step(-1.0, vP.y));
          gl_FragColor = vec4(c, 1.0);
          #include <colorspace_fragment>
        }`,
    }),
  );
  planet.position.copy(C);
  scene.add(planet);
  const atmoU = { opacity: { value: 0 } };
  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(R * 1.06, 96, 64),
    new THREE.ShaderMaterial({
      uniforms: atmoU,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
      fragmentShader: `uniform float opacity; varying vec3 vN; varying vec3 vV;
        void main(){ float f = pow(clamp(1.0 + dot(vN, vV), 0.0, 1.0), 3.0); gl_FragColor = vec4(vec3(0.35,0.6,1.0)*f*1.6, f*opacity); }`,
    }),
  );
  atmo.position.copy(C);
  scene.add(atmo);

  // ---------- rampa ----------
  const metal = new THREE.MeshStandardMaterial({ color: 0x2a2f3a, metalness: 0.6, roughness: 0.5 });
  const padG = new THREE.Group();
  const deck = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.9, 0.3, 48), metal);
  deck.position.y = -0.15;
  padG.add(deck);
  const tower = new THREE.Group();
  for (const [x, z] of [[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 3.4, 0.06), metal);
    leg.position.set(x, 1.7, z);
    tower.add(leg);
  }
  for (let i = 0; i < 9; i++) {
    const rung = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.04, 0.56), metal);
    rung.position.y = 0.3 + i * 0.38;
    tower.add(rung);
  }
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 0.08), metal);
  arm.position.set(-0.55, 2.6, 0);
  tower.add(arm);
  tower.position.set(1.05, 0, -0.1);
  padG.add(tower);
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8), new THREE.MeshBasicMaterial({ color: 0xff4040, toneMapped: false }));
  beacon.position.set(1.05, 3.45, -0.1);
  padG.add(beacon);
  scene.add(padG);

  // ---------- roket ----------
  const rocket = new THREE.Group();
  const body = new THREE.Group(); // yalpalama/dönüş için iç grup
  rocket.add(body);
  const white = new THREE.MeshStandardMaterial({ color: 0xb9b5ad, metalness: 0.35, roughness: 0.45, envMapIntensity: 0.6 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x1b1e26, metalness: 0.5, roughness: 0.4 });
  const accent = new THREE.MeshStandardMaterial({ color: 0xff8a3d, metalness: 0.3, roughness: 0.4, emissive: 0x3a1500 });
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 1.7, 40), white);
  tube.position.y = 1.05;
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.225, 0.225, 0.12, 40), accent);
  band.position.y = 1.5;
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.6, 40), white);
  nose.position.y = 2.2;
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 20), dark);
  tip.position.y = 2.46;
  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.19, 0.22, 24, 1, true), dark);
  nozzle.position.y = 0.09;
  body.add(tube, band, nose, tip, nozzle);
  for (let i = 0; i < 4; i++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.5, 0.32), dark);
    const a = (i / 4) * Math.PI * 2;
    fin.position.set(Math.cos(a) * 0.3, 0.42, Math.sin(a) * 0.3);
    fin.rotation.y = -a;
    body.add(fin);
  }
  // alev: iki iç içe koni, toplamalı karışım
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xff7a2a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const coreMat = new THREE.MeshBasicMaterial({ color: 0xfff1c8, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.17, 1.1, 24, 1, true), flameMat);
  flame.rotation.x = Math.PI;
  flame.position.y = -0.55;
  const core = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.6, 20, 1, true), coreMat);
  core.rotation.x = Math.PI;
  core.position.y = -0.3;
  const flameG = new THREE.Group();
  flameG.add(flame, core);
  body.add(flameG);
  const glow = new THREE.PointLight(0xff8a3d, 0, 8, 2);
  glow.position.y = -0.3;
  body.add(glow);
  scene.add(rocket);

  // ---------- duman / patlama parçacıkları ----------
  const P = 700;
  const pPos = new Float32Array(P * 3);
  const pLife = new Float32Array(P);
  const pVel = new Float32Array(P * 3);
  const pSize = new Float32Array(P);
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pg.setAttribute('life', new THREE.BufferAttribute(pLife, 1));
  pg.setAttribute('psize', new THREE.BufferAttribute(pSize, 1));
  const smoke = new THREE.Points(
    pg,
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { pr: { value: Math.min(devicePixelRatio, 2) } },
      vertexShader: `attribute float life; attribute float psize; uniform float pr; varying float vL;
        void main(){ vL = life; vec4 mv = modelViewMatrix*vec4(position,1.0); gl_Position = projectionMatrix*mv;
          gl_PointSize = psize * pr * (1.0 + (1.0-life)*2.5) * (260.0 / -mv.z); }`,
      fragmentShader: `varying float vL;
        void main(){ if (vL <= 0.0) discard; float d = length(gl_PointCoord-0.5); float a = smoothstep(0.5,0.0,d);
          vec3 hot = vec3(1.0,0.55,0.2), cold = vec3(0.55,0.56,0.6);
          vec3 c = mix(cold, hot, smoothstep(0.75,1.0,vL));
          gl_FragColor = vec4(c, a*a*vL*0.55); }`,
    }),
  );
  smoke.frustumCulled = false;
  scene.add(smoke);
  let pNext = 0;
  function emit(pos, vx, vy, vz, spread, size) {
    const i = pNext;
    pNext = (pNext + 1) % P;
    pPos[i * 3] = pos.x + (Math.random() - 0.5) * 0.1;
    pPos[i * 3 + 1] = pos.y;
    pPos[i * 3 + 2] = pos.z + (Math.random() - 0.5) * 0.1;
    pVel[i * 3] = vx + (Math.random() - 0.5) * spread;
    pVel[i * 3 + 1] = vy + (Math.random() - 0.5) * spread;
    pVel[i * 3 + 2] = vz + (Math.random() - 0.5) * spread;
    pLife[i] = 1;
    pSize[i] = size * (0.6 + Math.random() * 0.8);
  }
  function burst(pos) {
    for (let k = 0; k < 140; k++) emit(pos, 0, 1.2, 0, 3.2, 0.35);
  }

  // ---------- deneyim takımyıldızı: her bölümde bir yıldız yanar ----------
  // Bölüm 2..7 ve 9 (2016 · 2023 · YZ · Sağlık/AB · Aether · Bazalt · Elsa)
  const nodesDef = [
    [2, '2016', -10, 5.5],
    [3, '2023', -6.5, 8.6],
    [4, L('AI', 'YZ'), -2.5, 6.4],
    [5, L('Health · EU', 'Sağlık · AB'), 2.2, 9.2],
    [6, 'Aether', 5.6, 6.2],
    [7, 'Bazalt', 9.2, 8.8],
    [9, 'Elsa', 12.5, 6.8],
  ];
  const sky = new THREE.Group();
  sky.position.z = -24;
  scene.add(sky);
  const nodeMat = () => new THREE.MeshBasicMaterial({ color: 0xffc89a, transparent: true, toneMapped: false });
  const nodes = nodesDef.map(([sec, label, x, y]) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), nodeMat());
    m.position.set(x, y, 0);
    const halo = new THREE.Mesh(new THREE.RingGeometry(0.28, 0.32, 40), new THREE.MeshBasicMaterial({ color: 0xff8a3d, transparent: true, toneMapped: false, side: THREE.DoubleSide }));
    m.add(halo);
    const tag = textSprite(label, { size: 44, color: '#ffd9bb' });
    tag.scale.multiplyScalar(0.55);
    tag.position.set(0, 0.62, 0);
    m.add(tag);
    sky.add(m);
    return { m, halo, tag, sec };
  });
  const linePts = new Float32Array((nodes.length - 1) * 6);
  nodes.slice(1).forEach((n, i) => {
    const a = nodes[i].m.position, b = n.m.position;
    linePts.set([a.x, a.y, a.z, b.x, b.y, b.z], i * 6);
  });
  const lg = new THREE.BufferGeometry();
  lg.setAttribute('position', new THREE.BufferAttribute(linePts, 3));
  const lines = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0xff9c5a, transparent: true, opacity: 0.4, toneMapped: false }));
  sky.add(lines);

  // ---------- ışık ----------
  scene.add(new THREE.HemisphereLight(0x8ea2ff, 0x0b0b10, 0.55));
  const moon = new THREE.DirectionalLight(0xdfe6ff, 1.4);
  moon.position.set(-4, 6, 5);
  scene.add(moon);
  const flood = new THREE.PointLight(0xffd6a8, 2.2, 9, 1.5);
  flood.position.set(2.2, 3.2, 2.5);
  scene.add(flood);

  // ---------- roket durumu: kaydırma konumundan ----------
  // Başarısız fırlatma: yüksel → motor teklesin → yalpala → düş
  function failFlight(u, apex) {
    const rise = smooth(0, 0.45, u);
    const tumble = smooth(0.4, 0.7, u);
    const fall = smooth(0.62, 1, u);
    const top = apex * Math.pow(rise, 1.4);
    const y = fall > 0 ? apex * (1 - fall * fall) : top;
    return {
      alt: Math.max(0, y),
      x: tumble * 1.1 + fall * 1.6,
      rot: -tumble * 1.5 - fall * 1.9,
      thrust: u > 0.02 && u < 0.4 ? 1 : u >= 0.4 && u < 0.46 ? 0.35 : 0, // son anda teklemesi
      crashed: u > 0.985,
    };
  }
  const st = { alt: 0, x: 0, rot: 0, thrust: 0, scale: 1, visible: true, phase: 'pad', attempt: 1, f: 0 };
  let prevCrash = [false, false];
  function stateAt(sp) {
    st.f = smooth(9.7, 10.9, sp); // yörüngeye geçiş
    st.x = 0; st.rot = 0; st.thrust = 0; st.alt = 0; st.scale = 1; st.visible = true; st.pitch = 0;
    if (sp < 0.5) {
      st.phase = 'pad'; st.attempt = 1;
    } else if (sp < 1.55) {
      Object.assign(st, failFlight((sp - 0.5) / 1.0, 6), { attempt: 1 });
      st.phase = st.thrust > 0.5 ? 'burn' : st.alt > 0.05 ? 'fail' : 'crash';
      st.visible = !st.crashed;
    } else if (sp < 7.5) {
      st.phase = 'pad'; st.attempt = 2;
      st.scale = smooth(1.75, 2.3, sp); // roket yeniden kuruluyor
    } else if (sp < 8.55) {
      Object.assign(st, failFlight((sp - 7.5) / 1.0, 10), { attempt: 2 });
      st.phase = st.thrust > 0.5 ? 'burn' : st.alt > 0.05 ? 'fail' : 'crash';
      st.visible = !st.crashed;
    } else if (sp < 9.3) {
      st.phase = 'pad'; st.attempt = 3;
      st.scale = smooth(8.7, 9.15, sp);
    } else {
      // son fırlatma: dikey kalkış, sonra yörüngeye dönüş
      const k = smooth(9.3, 10.75, sp);
      st.alt = ORBIT * Math.pow(k, 1.5);
      st.pitch = smooth(0.45, 1, k);
      st.thrust = k > 0.01 && st.f < 0.999 ? 1 : 0.25;
      st.phase = st.f > 0.98 ? 'orbit' : 'burn';
      st.attempt = 3;
    }
    return st;
  }

  // kamera: bölüm başına anahtar — x roketin metin panelinin karşısında durmasını sağlar
  const camKeys = (m) => {
    const s = (i) => (m ? 0 : i % 2 ? -2.5 : 2.5); // kamera -x → roket sağda (panel solda: hero ve tek bölümler)
    const ks = [{ x: s(1), y: 1.7, z: 8.6, ly: 1.6 }];
    for (let i = 1; i <= 10; i++) ks.push({ x: s(i), y: 1.6 + (i === 1 || i === 8 ? 0.6 : 0), z: i === 1 || i === 8 ? 10.5 : 8.6, ly: 1.7 + (i >= 2 && i <= 7 ? 1.4 : 0) });
    ks.push({ x: 0, y: 1.6, z: 9, ly: 1.6 });
    return ks;
  };

  const orbitCam = new THREE.Vector3(0, 46, 215);
  const orbitLook = new THREE.Vector3(0, 22, 0);
  const groundCam = new THREE.Vector3();
  const groundLook = new THREE.Vector3();
  const look = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  let orbitPhase = 0;
  let smoothAlt = 0;
  const N = 11;

  return {
    scene,
    camera,
    exposure: 0.95,
    bloom: { strength: 0.6, radius: 0.5, threshold: 0.9 },
    hud(s) {
      const sp = s.sp;
      const year = sp < 1.5 ? '2017' : sp < 2.5 ? '2016–20' : sp < 3.5 ? '2023–26' : sp < 7.5 ? '—' : sp < 8.5 ? '2024' : sp < 9.5 ? L('Today', 'Bugün') : '→';
      const status = { pad: L('On the pad', 'Rampada'), burn: L('Engine on', 'Motor ateşte'), fail: L('Anomaly', 'Arıza'), crash: L('Lost', 'Kayıp'), orbit: L('In orbit', 'Yörüngede') }[st.phase];
      return [
        [L('Year', 'Yıl'), year],
        [L('Attempt', 'Deneme'), `0${st.attempt}`],
        [L('Altitude', 'İrtifa'), `${Math.round(smoothAlt * (st.f > 0.5 ? 35 : 120)).toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US')} m`],
        [L('Status', 'Durum'), status],
      ];
    },
    update(t, dt, s) {
      const sp = clamp(s.sp, 0, N);
      stateAt(sp);
      smoothAlt = damp(smoothAlt, st.alt, 8, dt);

      // çarpma anında toz bulutu (ileri kaydırırken)
      [[0.5, 6], [7.5, 10]].forEach(([s0], k) => {
        const crashed = sp > s0 + 0.97 && sp < s0 + 1.4;
        if (crashed && !prevCrash[k]) burst(tmp.set(2.7, 0.2, 0)); // failFlight'ın düştüğü nokta
        prevCrash[k] = crashed;
      });

      // roket konumu: gezegen merkezine göre kutupsal (yerde x kayması + yörünge açısı)
      if (st.f > 0.98) orbitPhase += dt * 0.16;
      else orbitPhase = damp(orbitPhase, 0, 3, dt);
      const a = Math.PI / 2 + orbitPhase;
      const r = R + st.alt;
      rocket.position.set(C.x + Math.cos(a) * r + st.x, C.y + Math.sin(a) * r, 0);
      const pitch = st.pitch;
      rocket.rotation.z = a - Math.PI / 2 + st.rot + (sp >= 9.3 ? pitch * (Math.PI / 2) : 0);
      body.rotation.y = t * (st.thrust > 0 ? 1.2 : 0.15);
      body.rotation.x = st.phase === 'fail' ? Math.sin(t * 9) * 0.08 : 0;
      const sc = Math.max(0.001, st.scale) * lerp(1, 3.2, st.f); // yörüngede uzaktan seçilsin
      rocket.scale.setScalar(sc);
      rocket.visible = st.visible && st.scale > 0.01;

      // alev
      const fl = st.thrust * (0.85 + Math.sin(t * 40) * 0.08 + Math.sin(t * 23) * 0.07);
      flameG.visible = fl > 0.02 && rocket.visible;
      flameG.scale.set(1, Math.max(0.01, fl * (1 + st.f * 0.6)), 1);
      flameMat.opacity = 0.85 * fl;
      coreMat.opacity = fl;
      glow.intensity = fl * 6;

      // duman: yanma sırasında egzozdan, rampada ince buhar
      if (rocket.visible && st.f < 0.6) {
        tmp.set(0, -0.2, 0).applyMatrix4(rocket.matrixWorld);
        if (fl > 0.1) for (let k = 0; k < 4; k++) emit(tmp, 0, -1.6, 0, 1.2, 0.22);
        else if (st.phase === 'pad' && Math.random() < 0.25) emit(tmp.set(0.25, 0.3, 0.1), 0.25, 0.25, 0, 0.2, 0.12);
      }
      for (let i = 0; i < P; i++) {
        if (pLife[i] <= 0) continue;
        pLife[i] -= dt * 0.45;
        pVel[i * 3 + 1] -= dt * 0.25; // ağır duman yere çöker
        if (pPos[i * 3 + 1] < 0.05) { pVel[i * 3 + 1] = Math.abs(pVel[i * 3 + 1]) * 0.1; pVel[i * 3] *= 1.02; pVel[i * 3 + 2] *= 1.02; }
        pPos[i * 3] += pVel[i * 3] * dt;
        pPos[i * 3 + 1] += pVel[i * 3 + 1] * dt;
        pPos[i * 3 + 2] += pVel[i * 3 + 2] * dt;
        pVel[i * 3] *= 1 - dt * 0.6;
        pVel[i * 3 + 2] *= 1 - dt * 0.6;
      }
      pg.attributes.position.needsUpdate = true;
      pg.attributes.life.needsUpdate = true;
      pg.attributes.psize.needsUpdate = true;

      // takımyıldızı: bölümü geçilen deneyim yanar
      nodes.forEach((n) => {
        const on = smooth(n.sec - 0.6, n.sec - 0.1, sp);
        n.m.material.opacity = (0.15 + on * 0.85) * (1 - st.f);
        n.m.scale.setScalar(0.6 + on * 0.5 + Math.sin(t * 2 + n.sec) * 0.05 * on);
        n.halo.material.opacity = on * (0.5 + Math.sin(t * 2.4 + n.sec) * 0.3) * (1 - st.f);
        n.halo.scale.setScalar(1 + on * 0.4);
        n.tag.material.opacity = on * (1 - st.f);
      });
      const lit = nodes.filter((n) => sp > n.sec - 0.2).length;
      lg.setDrawRange(0, Math.max(0, lit - 1) * 2);
      lines.material.opacity = 0.45 * (1 - st.f);
      const blink = Math.sin(t * 3) > 0 ? 1 : 0.15;
      beacon.material.color.setRGB(blink, blink * 0.25, blink * 0.25);

      atmoU.opacity.value = st.f;
      stars.userData.tick(t);

      // kamera: yerde roketi izle, sonda yörünge görünümüne geri çekil
      const k = keyframe(camKeys(s.mobile), sp);
      const follow = Math.min(smoothAlt, 14);
      groundCam.set(k.x + s.mouseS.x * 0.35, k.y + follow * 0.85 + s.mouseS.y * 0.2, k.z + (s.mobile ? 3.5 : 0) + follow * 0.45);
      groundLook.set(k.x * 0.98, k.ly + follow * 0.95, 0);
      const e = st.f * st.f * (3 - 2 * st.f);
      // mobilde metin dar ve uzun: gezegeni biraz uzaklaştırıp kadrajın altına it
      camera.position.lerpVectors(groundCam, tmp.copy(orbitCam).setX(s.mouseS.x * 4).setZ(orbitCam.z * (s.mobile ? 1.35 : 1)), e);
      look.lerpVectors(groundLook, tmp.copy(orbitLook).setY(orbitLook.y + (s.mobile ? 26 : 0)), e);
      camera.lookAt(look);
    },
  };
}
