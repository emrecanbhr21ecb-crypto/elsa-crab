import * as THREE from 'three';
import { productBase } from './base.js';
import { damp, near, smooth, clamp, keyframe, textSprite, canvasTex, lerp } from '../lib.js';
import { haloTex } from './home.js';

// Deprem Mesh — sinematik anlatı:
// 0 gece şehri (ışıklar yanık) → 1 sarsıntı: bina çöker, toz, elektrik kesilir
// → 2 mesh: telefonlar uyanır, BLE halkaları, paketler atlar → 3 imza ve uyku döngüsü
// → 4 kurtarma panosu (canlı triyaj) → rakamlar / kaputun altı: şehirden geri çekil.
export function build({ renderer, product, lang }) {
  const b = productBase({ renderer, product, sky: [0x0b1022, 0x010204, 1.1], fog: [0x03040a, 0.028], dustColor: 0xc8d0e0, phone: false });
  const { scene, camera } = b;
  const L = (en, tr) => (lang === 'tr' ? tr : en);

  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  // ---------- şehir ----------
  const city = new THREE.Group();
  scene.add(city);
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(160, 160),
    new THREE.ShaderMaterial({
      uniforms: { power: { value: 1 }, fogColor: { value: new THREE.Color(0x03040a) } },
      vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,
      fragmentShader: `uniform float power; uniform vec3 fogColor; varying vec3 vW;
        void main(){
          // sokak ızgarası: blok aralarında sokak lambası ışığı
          vec2 g = abs(fract(vW.xz / 3.0) - 0.5);
          float street = smoothstep(0.42, 0.5, max(g.x, g.y));
          vec3 c = vec3(0.012, 0.014, 0.022) + street * vec3(0.22, 0.15, 0.07) * power;
          float d = length(vW.xz);
          c = mix(c, fogColor, smoothstep(10.0, 60.0, d));
          gl_FragColor = vec4(c, 1.0);
          #include <colorspace_fragment>
        }`,
    }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.62;
  city.add(ground);

  // kamera anahtar kareleri (bölüm başına). off: +1 özne sağda, -1 solda
  const camKeys = [
    { pos: [13, 9.5, 17], look: [0, 1.2, 0], off: 1.7 },
    { pos: [5, 4.2, 10.5], look: [0, 1.6, 0], off: 1 },
    { pos: [4, 9, 13], look: [4.5, 0, 0], off: -1 },
    { pos: [14, 6, 9], look: [8.5, 0.4, 0], off: 1 },
    { pos: [2.5, 5.5, 11], look: [-0.2, 3.1, 1.6], off: -1 },
    { pos: [0, 26, 22], look: [2, 0, 0], off: 0 },
    { pos: [-16, 9, 10], look: [2, 0, 0], off: 0.7 },
    { pos: [24, 30, 30], look: [0, 0, 0], off: 0 },
  ];
  // bina blokları — pencere deseni shader'da, elektrik "power" ile kesilir
  const blocks = [];
  for (let gx = -9; gx <= 9; gx++)
    for (let gz = -9; gz <= 9; gz++) {
      if (Math.abs(gx) <= 1 && gz >= -1 && gz <= 2) continue; // merkez arsa + önündeki meydan
      if (gx >= 1 && gx <= 4 && Math.abs(gz) <= 1) continue; // dışarıya açılan sokak (paket zinciri)
      // kamera yolunu kapatan blokları atla
      if (camKeys.some((c) => Math.hypot(c.pos[0] - gx * 3, c.pos[2] - gz * 3) < 4.2 && c.pos[1] < 12)) continue;
      if (rnd() < 0.18) continue;
      const h = 0.8 + rnd() * rnd() * 6.5;
      blocks.push({ x: gx * 3 + (rnd() - 0.5) * 0.4, z: gz * 3 + (rnd() - 0.5) * 0.4, w: 1.6 + rnd() * 0.9, d: 1.6 + rnd() * 0.9, h, s: rnd() });
    }
  const bGeo = new THREE.BoxGeometry(1, 1, 1);
  bGeo.translate(0, 0.5, 0);
  const seedAttr = new Float32Array(blocks.length);
  const bMat = new THREE.ShaderMaterial({
    uniforms: { power: { value: 1 }, time: { value: 0 }, fogColor: { value: new THREE.Color(0x03040a) } },
    vertexShader: /* glsl */ `
      attribute float bseed; varying vec3 vP; varying vec3 vN; varying float vS; varying vec3 vW; varying vec3 vScale;
      void main(){
        vS = bseed; vN = normal; vP = position;
        vec4 w = modelMatrix * instanceMatrix * vec4(position,1.0);
        vW = w.xyz;
        vScale = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform float power; uniform float time; uniform vec3 fogColor;
      varying vec3 vP; varying vec3 vN; varying float vS; varying vec3 vW; varying vec3 vScale;
      float h(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5); }
      void main(){
        vec3 base = vec3(0.035, 0.04, 0.055);
        float side = 1.0 - abs(vN.y);
        // pencere ızgarası (yüz boyutuna göre ölçekli)
        vec2 uv = abs(vN.x) > 0.5 ? vec2(vP.z * vScale.z, vP.y * vScale.y) : vec2(vP.x * vScale.x, vP.y * vScale.y);
        vec2 cell = floor(uv * vec2(3.0, 2.6));
        vec2 f = fract(uv * vec2(3.0, 2.6));
        float win = step(0.32, f.x) * step(f.x, 0.68) * step(0.38, f.y) * step(f.y, 0.7);
        float r = h(cell + vS * 97.0);
        float lit = step(0.62, r);
        // elektrik kesilince: çoğu söner, birkaçı jeneratörle titrer
        float keep = step(0.93, h(cell * 1.7 + vS * 13.0));
        float flicker = 0.6 + 0.4 * step(0.5, fract(sin(time * 7.0 + r * 50.0) * 43.0));
        float on = mix(keep * flicker * 0.7, 1.0, power) * lit;
        vec3 warm = mix(vec3(1.0, 0.72, 0.38), vec3(0.75, 0.85, 1.0), step(0.8, r));
        vec3 c = base * (0.6 + 0.4 * side) + win * on * warm * side * 0.85;
        c += vec3(0.02, 0.03, 0.05) * smoothstep(0.0, 0.2, vN.y); // çatı
        float d = length(vW.xz);
        c = mix(c, fogColor, smoothstep(12.0, 55.0, d));
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,
  });
  const bInst = new THREE.InstancedMesh(bGeo, bMat, blocks.length);
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S = new THREE.Vector3(), E = new THREE.Euler();
  blocks.forEach((k, i) => {
    M.compose(V.set(k.x, -0.62, k.z), Q.identity(), S.set(k.w, k.h, k.d));
    bInst.setMatrixAt(i, M);
    seedAttr[i] = k.s;
  });
  bGeo.setAttribute('bseed', new THREE.InstancedBufferAttribute(seedAttr, 1));
  city.add(bInst);

  // ---------- çöken bina ----------
  const concrete = new THREE.MeshStandardMaterial({ color: 0x2a2e36, roughness: 0.95, flatShading: true, envMapIntensity: 0.35 });
  const edgeMat = new THREE.LineBasicMaterial({ color: 0xff5a4a, transparent: true, opacity: 0.0 });
  const winMat = new THREE.MeshBasicMaterial({ color: 0xffc27a, transparent: true, opacity: 0.9, toneMapped: false });
  const FLOORS = 7, FW = 3.6, FD = 2.6, FH = 0.62;
  const tower = new THREE.Group();
  city.add(tower);
  const floors = [];
  for (let i = 0; i < FLOORS; i++) {
    const g = new THREE.Group();
    const slab = new THREE.Mesh(new THREE.BoxGeometry(FW, 0.14, FD, 6, 1, 4), concrete);
    const p = slab.geometry.attributes.position;
    for (let k = 0; k < p.count; k++) p.setY(k, p.getY(k) + (rnd() - 0.5) * 0.05);
    slab.geometry.computeVertexNormals();
    g.add(slab, new THREE.LineSegments(new THREE.EdgesGeometry(slab.geometry, 20), edgeMat));
    const cols = [];
    for (const [cx, cz] of [[-1.6, -1.1], [1.6, -1.1], [-1.6, 1.1], [1.6, 1.1], [0, -1.1], [0, 1.1]]) {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.16, FH, 0.16), concrete);
      col.position.set(cx, -FH / 2, cz);
      col.userData.tilt = (rnd() - 0.5) * (i > 2 ? 0.9 : 0.2);
      col.userData.gone = i > 3 && rnd() < 0.5;
      g.add(col);
      cols.push(col);
    }
    // pencere şeridi (sarsıntıdan önce yanık)
    const strip = new THREE.Mesh(new THREE.PlaneGeometry(FW - 0.3, FH * 0.35), winMat);
    strip.position.set(0, -FH / 2, FD / 2 + 0.01);
    g.add(strip);
    const c = i > 2 ? (i - 2) / 4 : 0;
    g.userData = {
      intact: { p: new THREE.Vector3(0, i * FH, 0), r: new THREE.Euler() },
      fall: {
        p: new THREE.Vector3(c * 0.55 * (i % 2 ? 1 : 0.6), i * FH - (i > 3 ? (i - 3) * 0.3 : 0) - (i > 1 ? 0.12 * i : 0), c * 0.2),
        r: new THREE.Euler((rnd() - 0.5) * c * 0.3, (rnd() - 0.5) * c * 0.35, (i > 2 ? -1 : 0) * c * 0.26),
      },
      cols,
      strip,
      delay: (FLOORS - i) * 0.06, // üst katlar önce düşer
    };
    tower.add(g);
    floors.push(g);
  }

  // moloz
  const RUB = 220;
  const rubble = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.06, 0), concrete, RUB);
  const rubSeeds = Array.from({ length: RUB }, () => ({ a: rnd() * 6.28, r: 1.6 + rnd() * 2.6, s: 0.4 + rnd() * 1.8, rot: [rnd() * 3, rnd() * 3, rnd() * 3], h: 1 + rnd() * 3 }));
  city.add(rubble);

  // toz bulutu
  const DUST = 1400;
  const dPos = new Float32Array(DUST * 3), dDir = new Float32Array(DUST * 4);
  for (let i = 0; i < DUST; i++) {
    const a = rnd() * 6.28, up = rnd();
    dDir.set([Math.cos(a) * (0.5 + rnd()), up * 1.4 + 0.2, Math.sin(a) * (0.5 + rnd()), rnd()], i * 4);
  }
  const dGeo = new THREE.BufferGeometry();
  dGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
  dGeo.setAttribute('dir', new THREE.BufferAttribute(dDir, 4));
  const dMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { k: { value: 0 }, time: { value: 0 }, pr: { value: Math.min(devicePixelRatio, 2) } },
    vertexShader: /* glsl */ `attribute vec4 dir; uniform float k; uniform float time; uniform float pr; varying float vA;
      void main(){
        float e = k;
        vec3 p = vec3(dir.x * e * 6.0, -0.5 + dir.y * e * 3.2 - e*e*0.6, dir.z * e * 6.0);
        p.x += sin(time*0.3 + dir.w*20.0) * e; p.z += cos(time*0.25 + dir.w*17.0) * e;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = pr * (40.0 + dir.w * 90.0) * (0.3 + e) / -mv.z;
        vA = smoothstep(0.0, 0.15, e) * (1.0 - smoothstep(0.55, 1.0, e)) * (0.25 + dir.w * 0.35);
      }`,
    fragmentShader: `varying float vA; void main(){ float d = length(gl_PointCoord-0.5); gl_FragColor = vec4(vec3(0.45,0.42,0.4), smoothstep(0.5,0.0,d) * vA); }`,
  });
  const dust = new THREE.Points(dGeo, dMat);
  dust.frustumCulled = false;
  city.add(dust);

  // ---------- düğümler (telefonlar) ----------
  city.updateMatrixWorld(true);
  // düğüm konumları binanın ÇÖKMÜŞ hâline göre hesaplanır
  const fallMats = floors.map((f) => new THREE.Matrix4().compose(f.userData.fall.p, new THREE.Quaternion().setFromEuler(f.userData.fall.r), new THREE.Vector3(1, 1, 1)));
  const pts = [], floorOf = [];
  for (let i = 0; i < 40; i++) {
    const fi = Math.floor(rnd() * FLOORS);
    pts.push(new THREE.Vector3((rnd() - 0.5) * (FW - 0.5), 0.14, (rnd() - 0.5) * (FD - 0.5)).applyMatrix4(fallMats[fi]));
    floorOf.push(fi + 1);
  }
  const outside = [];
  for (let i = 0; i < 9; i++) outside.push(new THREE.Vector3(2.3 + i * 0.95, -0.47 + Math.sin(i) * 0.05, Math.sin(i * 1.3) * 0.7));
  pts.push(...outside);
  const beacon = new THREE.Vector3(11, -0.47, 0);
  pts.push(beacon);
  const B = pts.length - 1;
  const RANGE = 1.7;
  const adj = pts.map(() => []);
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) if (pts[i].distanceTo(pts[j]) < RANGE) adj[i].push(j), adj[j].push(i);
  const nextHop = new Int32Array(pts.length).fill(-1);
  const hopsTo = new Int32Array(pts.length).fill(99);
  const seen = new Uint8Array(pts.length);
  const queue = [B];
  seen[B] = 1;
  hopsTo[B] = 0;
  while (queue.length) {
    const u = queue.shift();
    for (const v of adj[u]) if (!seen[v]) (seen[v] = 1), (nextHop[v] = u), (hopsTo[v] = hopsTo[u] + 1), queue.push(v);
  }
  const sources = pts.map((_, i) => i).filter((i) => i < 40 && nextHop[i] >= 0);

  const lp = [];
  for (let i = 0; i < pts.length; i++) for (const j of adj[i]) if (j > i) lp.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z);
  const links = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0x6fb7ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  links.geometry.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3));
  city.add(links);

  const nodes = new THREE.InstancedMesh(new THREE.SphereGeometry(0.065, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), pts.length);
  city.add(nodes);
  const triage = pts.map((_, i) => (i >= 40 ? new THREE.Color(0x6fb7ff) : new THREE.Color([0xff3b3b, 0xffc23b, 0x3bd16f][Math.floor(rnd() * 3)])));
  const col = new THREE.Color(), base = new THREE.Color(0xbfe0ff);

  // BLE menzil halkaları (nokta sprite içinde çizilen halka)
  const ringPos = new Float32Array(pts.length * 3), ringPh = new Float32Array(pts.length);
  pts.forEach((p, i) => { ringPos.set([p.x, p.y, p.z], i * 3); ringPh[i] = rnd(); });
  const rGeo = new THREE.BufferGeometry();
  rGeo.setAttribute('position', new THREE.BufferAttribute(ringPos, 3));
  rGeo.setAttribute('ph', new THREE.BufferAttribute(ringPh, 1));
  const rMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { time: { value: 0 }, k: { value: 0 }, pr: { value: Math.min(devicePixelRatio, 2) } },
    vertexShader: `attribute float ph; uniform float time; uniform float pr; varying float vT; void main(){ vT = fract(time*0.45 + ph); vec4 mv = modelViewMatrix*vec4(position,1.0); gl_Position = projectionMatrix*mv; gl_PointSize = pr * 520.0 * vT / -mv.z; }`,
    fragmentShader: `uniform float k; varying float vT; void main(){ float d = length(gl_PointCoord-0.5)*2.0; float ring = smoothstep(0.08,0.0,abs(d-0.92)); gl_FragColor = vec4(0.45,0.75,1.0, ring*(1.0-vT)*k*0.7); }`,
  });
  const rings = new THREE.Points(rGeo, rMat);
  rings.frustumCulled = false;
  city.add(rings);

  // işaret: internete ilk çıkan telefon + gökyüzüne ışın
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.35, 30, 24, 1, true),
    new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      uniforms: { k: { value: 0 }, time: { value: 0 } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `uniform float k; uniform float time; varying vec2 vUv; void main(){ float a = (1.0 - vUv.y) * k; a *= 0.6 + 0.4*sin(vUv.y*40.0 - time*8.0); gl_FragColor = vec4(0.5,0.8,1.0, a*0.5); }`,
    }),
  );
  beam.position.copy(beacon).add(V.set(0, 15, 0));
  city.add(beam);
  const tip = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex(), color: 0x8fd0ff, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  tip.position.copy(beacon).add(V.set(0, 0.2, 0));
  city.add(tip);

  // paketler
  const PK = 46;
  const glow = new THREE.SpriteMaterial({ map: haloTex(), color: 0xff6a4a, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
  const packets = Array.from({ length: PK }, (_, i) => {
    const sp = new THREE.Sprite(glow.clone());
    sp.scale.setScalar(0.42);
    city.add(sp);
    return { sp, at: -1, to: -1, t: 0, delay: i * 0.22 };
  });
  let delivered = 0, hops = 0;
  const spawn = (p) => {
    p.at = sources[Math.floor(rnd() * sources.length)];
    p.to = nextHop[p.at];
    p.t = 0;
  };

  // acil durum ışıkları (ambulans)
  const siren = [0xff2a2a, 0x2a6bff].map((c, i) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex(), color: c, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 }));
    s.scale.setScalar(1.3);
    s.position.set(5.5 + i * 0.35, 0.35, 1.4);
    city.add(s);
    return s;
  });
  const sirenL = new THREE.PointLight(0xff2a2a, 0, 8);
  sirenL.position.set(5.6, 0.3, 1.4);
  city.add(sirenL);

  // ---------- etiketler ----------
  const tagSigned = textSprite('Ed25519 ✓ SIGNED', { size: 46, color: '#9fdcff', bg: 'rgba(5,10,20,0.6)' });
  tagSigned.scale.multiplyScalar(0.45);
  tagSigned.position.copy(beacon).add(V.set(0, 1.4, 0));
  const tagSleep = textSprite(L('SLEEP CYCLE · BATTERY 6+ DAYS', 'UYKU DÖNGÜSÜ · PİL 6+ GÜN'), { size: 40, color: '#ffd28a', bg: 'rgba(15,10,5,0.6)' });
  tagSleep.scale.multiplyScalar(0.42);
  tagSleep.position.set(0, 5.2, 0);
  const tagUp = textSprite(L('FIRST UPLINK → RESCUE SERVER', 'İLK BAĞLANTI → KURTARMA SUNUCUSU'), { size: 40, color: '#bfe6ff', bg: 'rgba(5,10,20,0.6)' });
  tagUp.scale.multiplyScalar(0.42);
  tagUp.position.copy(beacon).add(V.set(0, 2.3, 0));
  city.add(tagSigned, tagSleep, tagUp);

  // ---------- kurtarma panosu (holografik) ----------
  const board = canvasTex(1024, 640, () => {});
  const boardCtx = board.image.getContext('2d');
  const victims = sources.slice(0, 40).map((i) => ({ i, floor: floorOf[i], tri: triage[i].getHex(), got: false }));
  function drawBoard() {
    const g = boardCtx, w = 1024, h = 640;
    g.clearRect(0, 0, w, h);
    g.fillStyle = 'rgba(4,14,26,0.9)';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(120,200,255,0.6)';
    g.lineWidth = 3;
    g.strokeRect(6, 6, w - 12, h - 12);
    g.fillStyle = '#9fdcff';
    g.font = '600 34px JetBrains Mono, monospace';
    g.fillText(L('RESCUE BOARD · BLOCK C', 'KURTARMA PANOSU · C BLOK'), 36, 64);
    const got = victims.filter((v) => v.got);
    const cnt = (hex) => got.filter((v) => v.tri === hex).length;
    g.font = '500 24px JetBrains Mono, monospace';
    g.fillStyle = '#ff6b6b'; g.fillText(`● ${L('CRITICAL', 'KRİTİK')} ${cnt(0xff3b3b)}`, 36, 112);
    g.fillStyle = '#ffd36b'; g.fillText(`● ${L('URGENT', 'ACİL')} ${cnt(0xffc23b)}`, 300, 112);
    g.fillStyle = '#6be39a'; g.fillText(`● ${L('STABLE', 'STABİL')} ${cnt(0x3bd16f)}`, 520, 112);
    g.fillStyle = '#9fdcff'; g.fillText(`${got.length}/40`, 860, 112);
    g.fillStyle = 'rgba(120,200,255,0.25)';
    g.fillRect(36, 132, w - 72, 2);
    got.slice(-10).reverse().forEach((v, r) => {
      const y = 176 + r * 44;
      g.fillStyle = '#' + v.tri.toString(16).padStart(6, '0');
      g.fillRect(36, y - 20, 10, 26);
      g.fillStyle = '#e6f4ff';
      g.font = '500 24px JetBrains Mono, monospace';
      g.fillText(`#${String(v.i + 1).padStart(2, '0')}`, 64, y);
      g.fillText(`${L('FLOOR', 'KAT')} ${v.floor}`, 170, y);
      g.fillStyle = '#8fb8d8';
      g.fillText(`${L('sig', 'imza')} ✓  ${L('hops', 'atlama')} ${hopsTo[v.i]}`, 330, y);
      g.fillText(`${(0.4 + (v.i * 0.37) % 2.8).toFixed(1)} m`, 760, y);
    });
    board.needsUpdate = true;
  }
  drawBoard();
  const boardMesh = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.62), new THREE.MeshBasicMaterial({ map: board, transparent: true, opacity: 0, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }));
  boardMesh.position.set(-0.2, 3.4, 2.2);
  city.add(boardMesh);
  let boardDirty = 0;

  // ışıklar
  const moon = new THREE.DirectionalLight(0x8fb0ff, 0.9);
  moon.position.set(-6, 10, 4);
  const warm = new THREE.PointLight(0xffa860, 6, 12);
  warm.position.set(0, 3, 3);
  scene.add(moon, warm);

  // ---------- marka işareti: gerçek uygulama ikonunun aynısı — kırmızı merkez düğüm,
  // üç beyaz düğüm, mavi sinyal halkaları. Açılışta önce bu görünür, sonra şehre açılır.
  const brand = new THREE.Group();
  // şehir blokları çok yakın olabileceğinden derinlik testi kapalı: marka her zaman en üstte okunur
  const brandCore = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 16), new THREE.MeshBasicMaterial({ color: 0xe5392f, toneMapped: false, depthTest: false }));
  const brandCoreGlow = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2), new THREE.MeshBasicMaterial({ map: haloTex(), color: 0xff5a46, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false }));
  brand.add(brandCoreGlow, brandCore);
  const brandNodeMat = new THREE.MeshBasicMaterial({ color: 0xf4f6ff, toneMapped: false, depthTest: false });
  const brandNodes = [0, 1, 2].map((i) => {
    const a = Math.PI / 2 + (i / 3) * Math.PI * 2;
    const n = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 12), brandNodeMat);
    n.position.set(Math.cos(a) * 1.1, Math.sin(a) * 1.1, 0);
    brand.add(n);
    return n;
  });
  const brandLinePos = new Float32Array(6 * 3);
  const brandLines = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xf4f6ff, transparent: true, opacity: 0.8, depthTest: false }));
  brandNodes.forEach((n, i) => brandLinePos.set([0, 0, 0, n.position.x, n.position.y, n.position.z], i * 6));
  brandLines.geometry.setAttribute('position', new THREE.BufferAttribute(brandLinePos, 3));
  brand.add(brandLines);
  const brandRings = [0, 1, 2].map((i) => {
    const r = new THREE.Mesh(new THREE.TorusGeometry(1.1 + i * 0.55, 0.012, 8, 64), new THREE.MeshBasicMaterial({ color: 0x4f8fe0, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, toneMapped: false }));
    brand.add(r);
    return r;
  });
  brand.position.set(0, 2.6, 6);
  brand.renderOrder = 999;
  scene.add(brand);

  const look = new THREE.Vector3();
  let collapseS = 0, shake = 0;

  return {
    scene,
    camera,
    exposure: 1.05,
    bloom: { strength: 0.75, radius: 0.5, threshold: 0.72 },
    hud(s) {
      const quake = collapseS > 0.05;
      const k = s.sp;
      return [
        [L('Status', 'Durum'), k < 0.6 ? L('NORMAL', 'NORMAL') : k < 1.6 ? L('QUAKE · M7.4', 'DEPREM · M7.4') : k < 3.5 ? L('MESH ACTIVE', 'MESH AKTİF') : L('RESCUE', 'KURTARMA')],
        ['GSM', quake ? L('OFFLINE', 'YOK') : 'OK'],
        [L('Nodes', 'Düğüm'), `${quake ? Math.round(40 * smooth(1.2, 2, k)) : 0}/40`],
        [L('Hops', 'Atlama'), String(hops)],
        [L('Delivered', 'Ulaşan'), String(delivered)],
      ];
    },
    update(t, dt, s) {
      b.tick(t, dt, s, {});
      const sp = s.sp;
      const N = product.sections.length;

      // --- marka işareti: açılışta belirip şehre yol verir ---
      const vBrand = near(sp, 0, 0.55);
      brand.visible = vBrand > 0.02;
      if (brand.visible) {
        V.set(0, 1.2, 0).sub(camera.position).normalize();
        brand.position.copy(camera.position).addScaledVector(V, 10.5);
        brand.position.y += Math.sin(t * 0.4) * 0.08;
        brand.scale.setScalar(Math.max(0.001, vBrand));
        brand.rotation.z = t * 0.08;
        brandRings.forEach((r, i) => {
          const ph = (t * 0.25 + i * 0.33) % 1;
          r.scale.setScalar(0.8 + ph * 0.5);
          r.material.opacity = (1 - ph) * 0.5;
        });
      }

      // --- sarsıntı ve çöküş ---
      const collapse = smooth(0.55, 1.35, sp);
      collapseS = collapse;
      // odak: çöküş anında sis yoğunlaşır, arkadaki dağınık şehir geri çekilir — göz yalnız çöken kuleye kalır
      const focusFog = near(sp, 1, 0.75);
      scene.fog.density = 0.028 + focusFog * 0.05;
      const power = 1 - smooth(0.6, 1.0, sp);
      bMat.uniforms.power.value = power;
      bMat.uniforms.time.value = t;
      ground.material.uniforms.power.value = 0.25 + power * 0.75;
      shake = near(sp, 0.95, 0.5) * (1 - smooth(1.3, 1.5, sp));
      floors.forEach((f, i) => {
        const u = f.userData;
        const k = clamp((collapse - u.delay) / (1 - 0.42));
        const e = k * k * (3 - 2 * k);
        f.position.lerpVectors(u.intact.p, u.fall.p, e);
        f.rotation.set(lerp(0, u.fall.r.x, e), lerp(0, u.fall.r.y, e), lerp(0, u.fall.r.z, e));
        f.position.x += Math.sin(t * 31 + i) * 0.04 * shake;
        u.cols.forEach((c) => {
          c.rotation.z = c.userData.tilt * e;
          c.visible = !(c.userData.gone && e > 0.5);
        });
        u.strip.material.opacity = 0.9 * power;
      });
      edgeMat.opacity = 0.35 * collapse;
      dMat.uniforms.k.value = smooth(0.7, 2.6, sp);
      dMat.uniforms.time.value = t;
      for (let i = 0; i < RUB; i++) {
        const r = rubSeeds[i];
        const k = clamp((collapse - 0.3) / 0.7);
        const air = Math.sin(k * Math.PI) * r.h * 0.4;
        E.set(r.rot[0] + k * 4, r.rot[1], r.rot[2] + k * 3);
        M.compose(V.set(Math.cos(r.a) * r.r * k, -0.55 + air + (1 - k) * 2.5, Math.sin(r.a) * r.r * 0.8 * k), Q.setFromEuler(E), S.setScalar(r.s * k + 0.001));
        rubble.setMatrixAt(i, M);
      }
      rubble.instanceMatrix.needsUpdate = true;

      // --- mesh ---
      const meshOn = smooth(1.3, 2.0, sp);
      const tri = smooth(3.5, 4, sp) * (1 - smooth(N + 1.5, N + 2.2, sp));
      const sleep = near(sp, 3, 0.7);
      for (let i = 0; i < pts.length; i++) {
        const wake = i < 40 ? smooth(1.2 + (i % 10) * 0.05, 1.7 + (i % 10) * 0.05, sp) : meshOn;
        const blink = i < 40 && sleep > 0.1 ? 0.3 + 0.7 * Math.max(0, Math.sin(t * 1.4 + i * 1.7)) ** 8 : 1;
        M.compose(pts[i], Q.identity(), S.setScalar((i === B ? 2.2 : 1) * wake * (0.7 + blink * 0.5) + 0.0001));
        nodes.setMatrixAt(i, M);
        col.copy(base).lerp(triage[i], tri).multiplyScalar(0.5 + blink);
        nodes.setColorAt(i, col);
      }
      nodes.instanceMatrix.needsUpdate = true;
      nodes.instanceColor.needsUpdate = true;
      links.material.opacity = 0.32 * meshOn * (0.6 + near(sp, 2, 1) * 0.6);
      rMat.uniforms.k.value = meshOn * (0.4 + near(sp, 2, 0.9));
      rMat.uniforms.time.value = t;

      let arrived = false;
      for (const p of packets) {
        if (meshOn < 0.5) { p.sp.visible = false; continue; }
        if (p.delay > 0) { p.delay -= dt; p.sp.visible = false; continue; }
        if (p.at < 0) spawn(p);
        p.t += dt * 2.6;
        if (p.t >= 1) {
          hops++;
          const from = p.at;
          p.at = p.to;
          if (p.at === B) {
            delivered++;
            arrived = true;
            const v = victims.find((x) => !x.got && x.i === from) || victims.find((x) => !x.got);
            if (v) { v.got = true; boardDirty = 1; }
            spawn(p);
          } else {
            p.to = nextHop[p.at];
            p.t = 0;
          }
        }
        p.sp.visible = true;
        p.sp.position.lerpVectors(pts[p.at], pts[p.to], p.t);
        p.sp.position.y += Math.sin(p.t * Math.PI) * 0.22;
        p.sp.material.color.set(sp > 2.5 && sp < 3.5 ? 0xffffff : 0xff6a4a);
      }
      beam.material.uniforms.k.value = meshOn * (0.5 + (arrived ? 0.5 : 0));
      beam.material.uniforms.time.value = t;
      tip.scale.setScalar(0.8 + meshOn * (0.6 + Math.sin(t * 6) * 0.15));

      // siren: sarsıntıdan sonra
      const sirenOn = smooth(1.1, 1.5, sp);
      const ph = Math.sin(t * 9) > 0;
      siren[0].material.opacity = sirenOn * (ph ? 0.9 : 0.1);
      siren[1].material.opacity = sirenOn * (ph ? 0.1 : 0.9);
      sirenL.intensity = sirenOn * 6;
      sirenL.color.set(ph ? 0xff2a2a : 0x2a6bff);

      tagSigned.material.opacity = near(sp, 3, 0.7);
      tagSleep.material.opacity = near(sp, 3, 0.7);
      tagUp.material.opacity = near(sp, 2, 0.7);

      boardMesh.material.opacity = smooth(3.4, 4, sp) * (1 - smooth(N + 1.4, N + 2, sp));
      boardMesh.lookAt(camera.position);
      if (boardDirty && Math.floor(t * 4) !== Math.floor((t - dt) * 4)) {
        drawBoard();
        boardDirty = 0;
      }

      // --- kamera ---
      const ck = keyframe(camKeys, sp);
      const orbit = Math.sin(t * 0.05) * 0.6;
      camera.position.set(ck.pos[0] + orbit + s.mouseS.x * 0.8, ck.pos[1] + s.mouseS.y * 0.5, ck.pos[2]);
      look.set(...ck.look);
      camera.position.x += Math.sin(t * 43) * 0.08 * shake;
      camera.position.y += Math.cos(t * 37) * 0.06 * shake;
      camera.lookAt(look);
      if (s.mobile) camera.position.multiplyScalar(1.12);
      camera.filmOffset = s.mobile ? 0 : -ck.off * 7;
      camera.updateProjectionMatrix();
    },
  };
}
