import * as THREE from 'three';
import { productBase } from './base.js';
import { tex, picture, foilCard, damp, near, smooth, NOISE, textSprite } from '../lib.js';
import { haloTex } from './home.js';

// Renk Simyacısı: iki şişeden dökülen kırmızı ve sarı, ortadaki şişede
// girdap gibi karışıp turuncuya döner. Arkada usta dükkânı.
const RED = new THREE.Color(0xf0294f), YEL = new THREE.Color(0xffc21a), ORA = new THREE.Color(0xff7a1a);
const BLU = new THREE.Color(0x2a7bff), GRN = new THREE.Color(0x19c463), PUR = new THREE.Color(0x9b4dff);

function flaskProfile(scale = 1, inset = 0) {
  const pts = [];
  const r = 0.62 - inset;
  // yuvarlak gövde
  for (let i = 0; i <= 24; i++) {
    const a = -Math.PI / 2 + (i / 24) * (Math.PI * 0.86);
    pts.push(new THREE.Vector2(Math.max(0.001, Math.cos(a) * r), Math.sin(a) * r + r));
  }
  // boyun
  const top = pts[pts.length - 1];
  pts.push(new THREE.Vector2(0.17 - inset * 0.5, top.y + 0.12));
  pts.push(new THREE.Vector2(0.15 - inset * 0.5, top.y + 0.75));
  if (!inset) pts.push(new THREE.Vector2(0.2, top.y + 0.8), new THREE.Vector2(0.2, top.y + 0.86), new THREE.Vector2(0.14, top.y + 0.86));
  return pts.map((p) => p.multiplyScalar(scale));
}

export function build({ renderer, product, lang }) {
  const b = productBase({ renderer, product, sky: [0x2a1240, 0x07040c, 0.9], fog: [0x0c0614, 0.05], dustColor: 0xffb6e0 });
  const { scene, camera } = b;

  // ---- arka plan: dükkân ----
  // dükkân evreleri: harabe → temizlik → çalışan → zengin → usta (3. bölümde kaydırdıkça)
  const shopTex = [0, 1, 2, 3, 4].map((i) => tex(`media/alchemy-shop-s${i}.webp`, renderer));
  const shop = picture(shopTex[4], 11, 643 / 900, { transparent: true, opacity: 0.55 });
  shop.position.set(0, 1.2, -10);
  const shopB = picture(shopTex[4], 11, 643 / 900, { transparent: true, opacity: 0 });
  shopB.position.set(0, 1.2, -9.98);
  scene.add(shopB);
  let shopIdx = 4;
    const stageNames = lang === 'tr' ? ['HARABE', 'TEMİZLİK', 'ÇALIŞAN DÜKKÂN', 'ZENGİN DÜKKÂN', 'USTA DÜKKÂNI'] : ['RUIN', 'CLEAN-UP', 'WORKING SHOP', 'THRIVING SHOP', 'MASTER’S SHOP'];
  const stageSprites = stageNames.map((n, i) => {
    const sp = textSprite(`${String(i + 1).padStart(2, '0')} · ${n}`, { size: 44, color: '#ffd8a8', bg: 'rgba(20,10,24,0.7)' });
    sp.scale.multiplyScalar(0.55);
    sp.position.set(0, -2.6, -6);
    sp.material.opacity = 0;
    scene.add(sp);
    return sp;
  });
  scene.add(shop);
  // usta ve çırak: düz resim değil, holografik kenarlı karakter kartı
  const sedef = foilCard(tex('media/alchemy-sedef-happy.webp', renderer), 1.8, 500 / 716, { thickness: 0.06 });
  sedef.position.set(-5.2, -0.6, -4);
  const piri = foilCard(tex('media/alchemy-piri-proud.webp', renderer), 1.8, 500 / 716, { thickness: 0.06 });
  piri.position.set(5.4, -0.6, -4.5);
  scene.add(sedef, piri);

  // ---- şişeler ----
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, transparent: true, opacity: 0.09, clearcoat: 1, clearcoatRoughness: 0.05, side: THREE.FrontSide, depthWrite: false, envMapIntensity: 0.6, specularIntensity: 1 });
  const outerGeo = new THREE.LatheGeometry(flaskProfile(1), 64);
  const innerGeo = new THREE.LatheGeometry(flaskProfile(1, 0.04), 64);

  const liquid = (a, b2) =>
    new THREE.ShaderMaterial({
      transparent: true,
      uniforms: { time: { value: 0 }, level: { value: 0.9 }, colA: { value: a.clone() }, colB: { value: b2.clone() }, target: { value: a.clone() }, mixv: { value: 0 }, swirl: { value: 0 } },
      vertexShader: /* glsl */ `varying vec3 vP; varying vec3 vN; varying vec3 vV;
        void main(){ vP = position; vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.0); vV = -mv.xyz; gl_Position = projectionMatrix*mv; }`,
      fragmentShader: /* glsl */ `${NOISE}
        uniform float time; uniform float level; uniform vec3 colA; uniform vec3 colB; uniform vec3 target; uniform float mixv; uniform float swirl;
        varying vec3 vP; varying vec3 vN; varying vec3 vV;
        void main(){
          float wave = sin(vP.x*6.0 + time*2.0)*0.015 + sin(vP.z*5.0 - time*1.6)*0.015;
          if (vP.y > level + wave) discard;
          float ang = atan(vP.z, vP.x);
          float n = snoise(vec3(cos(ang)*1.2, vP.y*2.2 - time*0.4, sin(ang)*1.2 + time*0.2*swirl));
          float stripes = smoothstep(-0.15, 0.15, sin(ang*3.0 + vP.y*7.0*swirl - time*2.5*swirl + n*2.0));
          vec3 c = mix(colA, colB, mix(0.0, stripes, swirl));
          c = mix(c, target, mixv);
          float fr = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.0);
          c *= 0.75 + 0.6*fr;
          c += smoothstep(level-0.04+wave, level+wave, vP.y)*0.35; // yüzey parıltısı
          gl_FragColor = vec4(c, 0.92);
          #include <colorspace_fragment>
        }`,
    });

  const makeFlask = (a, b2, level) => {
    const g = new THREE.Group();
    const liq = new THREE.Mesh(innerGeo, liquid(a, b2));
    liq.material.uniforms.level.value = level;
    liq.renderOrder = 1;
    const out = new THREE.Mesh(outerGeo, glass);
    out.renderOrder = 2;
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), new THREE.MeshBasicMaterial({ map: haloTex(), color: a, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false }));
    halo.position.set(0, 0.7, -0.7);
    g.add(halo, liq, out);
    g.userData = { liq: liq.material, halo: halo.material };
    return g;
  };
  const rig = new THREE.Group();
  const left = makeFlask(RED, RED, 0.75);
  const mid = makeFlask(RED, YEL, 0.25);
  const right = makeFlask(YEL, YEL, 0.75);
  left.position.set(-1.6, -0.2, 0);
  right.position.set(1.6, -0.2, 0);
  mid.position.set(0, -0.35, 0.4);
  mid.scale.setScalar(1.3);
  rig.add(left, mid, right);
  scene.add(rig);

  // ---- kabarcıklar ----
  const BUB = 60;
  const bubbles = new THREE.InstancedMesh(new THREE.SphereGeometry(0.025, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 }), BUB);
  const bs = Array.from({ length: BUB }, () => ({ a: Math.random() * 6.28, r: Math.random() * 0.45, y: Math.random(), v: 0.15 + Math.random() * 0.35 }));
  mid.add(bubbles);
  const M = new THREE.Matrix4(), V = new THREE.Vector3(), Q = new THREE.Quaternion(), S = new THREE.Vector3();

  // tarifler: hero ve 1. bölüm kırmızı+sarı→turuncu, 2. bölüm sarı+mavi→yeşil, 3. bölüm kırmızı+mavi→mor
  const LO = ORA.clone().lerp(new THREE.Color(0xffffff), 0.45), DO = ORA.clone().multiplyScalar(0.5);
  const MUD = new THREE.Color(0x5a4630);
  const recipes = [
    [RED, YEL, ORA], // hero
    [RED, YEL, ORA], // kural
    [LO, DO, ORA], // tonlar: açık / koyu / tam
    [YEL, BLU, GRN], // dükkân
    [RED, BLU, PUR], // mekanikler
    [RED, GRN, MUD], // rakamlar: yanlış karışım çamur olur
  ];
  // mühür mumu (sol şişe) ve ateş ocağı (orta şişenin altı) — mekanikler bölümünde
  const wax = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.12, 24), new THREE.MeshStandardMaterial({ color: 0xa3122a, roughness: 0.4, emissive: 0x300008 }));
  const FIRE = 140;
  const fPos = new Float32Array(FIRE * 3), fSeed = new Float32Array(FIRE);
  for (let i = 0; i < FIRE; i++) { fPos.set([(Math.random() - 0.5) * 0.9, 0, (Math.random() - 0.5) * 0.5], i * 3); fSeed[i] = Math.random(); }
  const fGeo = new THREE.BufferGeometry();
  fGeo.setAttribute('position', new THREE.BufferAttribute(fPos, 3));
  fGeo.setAttribute('sd', new THREE.BufferAttribute(fSeed, 1));
  const fMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { time: { value: 0 }, k: { value: 0 }, pr: { value: Math.min(devicePixelRatio, 2) } },
    vertexShader: `attribute float sd; uniform float time; uniform float pr; varying float vL;
      void main(){ float l = fract(time*0.9 + sd); vL = l; vec3 p = position; p.y += l*0.9; p.x *= 1.0 - l*0.7; p.x += sin(time*6.0+sd*30.0)*0.04;
        vec4 mv = modelViewMatrix*vec4(p,1.0); gl_Position = projectionMatrix*mv; gl_PointSize = pr*(26.0*(1.0-l)+6.0)*(6.0/-mv.z); }`,
    fragmentShader: `uniform float k; varying float vL; void main(){ float d = length(gl_PointCoord-0.5); vec3 c = mix(vec3(1.0,0.85,0.4), vec3(1.0,0.25,0.05), vL); gl_FragColor = vec4(c, smoothstep(0.5,0.0,d)*(1.0-vL)*k); }`,
  });
  const fire = new THREE.Points(fGeo, fMat);
  fire.frustumCulled = false;
  fire.position.set(0, -0.62, 0.4);
  rig.add(fire);
  wax.position.set(0, 2.15, 0);
  left.add(wax);
  let mixT = 0;
  let lastR = -1;
  const lamp = new THREE.PointLight(0xff9ad1, 25, 20);
  lamp.position.set(0, 3, 4);
  scene.add(lamp);

  return {
    scene,
    camera,
    bloom: { strength: 0.6, radius: 0.55, threshold: 0.75 },
    update(t, dt, s) {
      const sd = b.tick(t, dt, s, { camZ: 9.5, spread: 3.6 });
      // şişeler telefonla aynı tarafta, metnin karşısında
      rig.position.set(s.mobile ? 0 : sd.x * (0.75 + 0.75 * near(s.sp, 0, 0.8)), s.mobile ? -1.45 : -0.55, s.mobile ? -0.6 : 0.3);
      rig.scale.setScalar(s.mobile ? 0.72 : 0.82);
      rig.rotation.y = Math.sin(t * 0.25) * 0.2 + s.mouseS.x * 0.2;
      shop.position.x = -s.p * 3 + 1.5;
      shopB.position.x = shop.position.x;
      // dükkân evresi: 3. bölümün içinde ilerledikçe 0→4
      const st = Math.max(0, Math.min(4, Math.round((s.sp - 2.55) * 5)));
      const want = s.sp < 2.5 ? 4 : st;
      if (want !== shopIdx) {
        shopB.material.map = shop.material.map;
        shopB.material.opacity = shop.material.opacity;
        shop.material.map = shopTex[want];
        shop.material.opacity = 0;
        shopIdx = want;
      }
      const shopFocus = near(s.sp, 3, 0.8);
      shop.material.opacity = damp(shop.material.opacity, 0.55 + shopFocus * 0.35, 4, dt);
      shopB.material.opacity = damp(shopB.material.opacity, 0, 4, dt);
      shop.scale.setScalar(1 + shopFocus * 0.15);
      stageSprites.forEach((sp, i) => (sp.material.opacity = i === shopIdx ? damp(sp.material.opacity, shopFocus > 0.3 ? 1 : 0, 6, dt) : 0));
      fMat.uniforms.time.value = t;
      fMat.uniforms.k.value = near(s.sp, 4, 0.8);
      wax.visible = near(s.sp, 4, 0.8) > 0.05;
      wax.scale.setScalar(Math.max(0.001, near(s.sp, 4, 0.8)));
      sedef.position.y = -0.6 + Math.sin(t * 0.7) * 0.1;
      piri.position.y = -0.6 + Math.sin(t * 0.6 + 1) * 0.1;
      sedef.userData.tick(t);
      piri.userData.tick(t);

      const ri = Math.min(recipes.length - 1, Math.max(0, Math.round(s.sp)));
      const [A, B, C] = recipes[ri];
      if (ri !== lastR) {
        lastR = ri;
        mixT = 0;
      }
      mixT += dt;
      // döngü: dök (0-1.6s) → girdap (1.6-3.6s) → turuncuya otur (3.6-5s) → bekle
      const cyc = mixT % 7;
      const fill = smooth(0.2, 2.2, cyc);
      const swirl = smooth(1.2, 2.4, cyc) * (1 - smooth(3.8, 5.0, cyc) * 0.7);
      const settle = smooth(3.4, 5.2, cyc);
      const L = left.userData.liq.uniforms, R = right.userData.liq.uniforms, Mi = mid.userData.liq.uniforms;
      for (const [u, c] of [[L, A], [R, B]]) {
        u.colA.value.copy(c); u.colB.value.copy(c); u.target.value.copy(c);
        u.level.value = 0.95 - fill * 0.35 + (cyc > 6.3 ? (cyc - 6.3) * 0.5 : 0);
        u.time.value = t;
      }
      left.userData.halo.color.copy(A);
      right.userData.halo.color.copy(B);
      Mi.colA.value.copy(A); Mi.colB.value.copy(B); Mi.target.value.copy(C);
      Mi.level.value = 0.25 + fill * 0.7 - (cyc > 6.3 ? (cyc - 6.3) * 1.0 : 0);
      Mi.swirl.value = 0.3 + swirl;
      Mi.mixv.value = settle;
      Mi.time.value = t;
      mid.userData.halo.color.copy(A).lerp(B, 0.5).lerp(C, settle);
      mid.userData.halo.opacity = 0.2 + near(s.sp, 1, 0.8) * 0.15 + settle * 0.1;
      // dökülen şişeler hafifçe eğilir
      left.rotation.z = -Math.sin(Math.min(1, fill) * Math.PI) * 0.35;
      right.rotation.z = Math.sin(Math.min(1, fill) * Math.PI) * 0.35;

      for (let i = 0; i < BUB; i++) {
        const q = bs[i];
        q.y += q.v * dt * (0.4 + swirl);
        if (q.y > 1) q.y = 0;
        const lv = Mi.level.value;
        V.set(Math.cos(q.a + t) * q.r, 0.08 + q.y * Math.max(0.01, lv - 0.1), Math.sin(q.a + t) * q.r);
        S.setScalar(q.y * lv < lv - 0.05 ? 1 : 0.001);
        M.compose(V, Q, S);
        bubbles.setMatrixAt(i, M);
      }
      bubbles.instanceMatrix.needsUpdate = true;
    },
  };
}
