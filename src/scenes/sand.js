import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { productBase } from './base.js';
import { tex, picture, damp, clamp, smooth, near, keyframe, dynamicTextSprite } from '../lib.js';
import { haloTex } from './home.js';

// Kum Tuvali: müze salonunda çerçeveli tablolar; önde iki cam tüp arasında
// tane tane dökülen kum. Dökme döngüsü deterministik: her tanenin kalkış anı,
// uçuş yayı ve iniş yuvası önceden belli — kare hızından bağımsız.
const PALETTE = [0xc0392b, 0xf2ece0, 0xe8a33d, 0x2e5e9e]; // Kırmızı Fuji tonları
// müzenin 4 temalı salonu (içerik metnindeki isimler) — her biri kendi ışık/renk havasıyla
const HALLS = [
  { name: { en: 'Paper Moon', tr: 'Kâğıt Ay' }, top: 0xcfd3e8, bot: 0x3a3a52, floor: 0x14141e, spot: 0xe6e2ff },
  { name: { en: 'Silent North', tr: 'Sessiz Kuzey' }, top: 0x8fb8d8, bot: 0x0a1824, floor: 0x0a1620, spot: 0xaee0ff },
  { name: { en: 'Golden Room', tr: 'Altın Oda' }, top: 0xf0c87a, bot: 0x3a2408, floor: 0x241607, spot: 0xffdca0 },
  { name: { en: 'Starry Room', tr: 'Yıldızlı Oda' }, top: 0x1a1030, bot: 0x05030c, floor: 0x0c0714, spot: 0xc6a8ff },
];

export function build({ renderer, product, lang }) {
  const b = productBase({ renderer, product, sky: [0x101a3a, 0x03050c, 0.9], fog: [0x050814, 0.045], dustColor: 0xf3d9a6 });
  const { scene, camera, dome } = b;

  // ---- müze duvarı ve tablolar ----
  const wall = new THREE.Group();
  const frameMat = new THREE.MeshPhysicalMaterial({ color: 0xc89b4a, metalness: 1, roughness: 0.3, clearcoat: 0.5 });
  const spotMats = [];
  product.art.forEach((u, i) => {
    const g = new THREE.Group();
    const w = 2.6;
    const pic = picture(tex(u, renderer), w, 1.5, { transparent: false });
    pic.position.z = 0.075;
    const fr = new THREE.Mesh(new RoundedBoxGeometry(w + 0.34, w / 1.5 + 0.34, 0.12, 2, 0.03), frameMat);
    g.add(fr, pic);
    // spot ışığı konisi
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(1.9, 4.5, 40, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xffe2b0, transparent: true, opacity: 0.014, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
    );
    cone.position.set(0, 1.4, 0.6);
    cone.rotation.x = -0.15;
    g.add(cone);
    spotMats.push(cone.material);
    g.position.set((i - 1.5) * 3.9, 1.7, -9);
    wall.add(g);
  });
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x04060d, roughness: 0.85, metalness: 0, envMapIntensity: 0.2 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 30), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2.4;
  scene.add(wall, floor);
  // salon etiketi: hangi temalı salonda olduğumuzu gösterir (tek paylaşılan doku, yeniden çizilir)
  const hallLabel = dynamicTextSprite(HALLS[0].name[lang] ?? HALLS[0].name.en, { size: 40, color: '#f3ecff', bg: 'rgba(10,8,20,0.65)', maxChars: 18, scale: 0.3 });
  hallLabel.material.opacity = 0;
  hallLabel.position.set(0, 3.6, -8.5);
  scene.add(hallLabel);
  const hallCol = new THREE.Color(), hallSkyTop = new THREE.Color(), hallSkyBot = new THREE.Color();
  let hallIdx = -1;


  // ---- tabloyu tane tane geri boya: eserin pikselleri kum tanesine dönüşür ----
  const GW = 72, GH = 48; // 3:2 eser
  const PX = GW * GH;
  const cell = 5.4 / GW;
  const paintGeo = new THREE.BoxGeometry(cell * 0.92, cell * 0.92, cell * 0.5);
  const paint = new THREE.InstancedMesh(paintGeo, new THREE.MeshStandardMaterial({ roughness: 0.85 }), PX);
  const paintG = new THREE.Group();
  paintG.add(paint);
  const pFrame = new THREE.Mesh(new RoundedBoxGeometry(5.4 + 0.4, 3.6 + 0.4, 0.1, 2, 0.04), frameMat);
  pFrame.position.z = -0.08;
  const pBack = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 3.6), new THREE.MeshStandardMaterial({ color: 0x0c0f18, roughness: 1 }));
  pBack.position.z = -0.02;
  paintG.add(pFrame, pBack);
  scene.add(paintG);
  const from = [], to = [], delay = [];
  for (let k = 0; k < PX; k++) {
    const x = k % GW, y = Math.floor(k / GW);
    to.push(new THREE.Vector3((x - GW / 2 + 0.5) * cell, (GH / 2 - y - 0.5) * cell, 0));
    const a = Math.random() * Math.PI * 2, r = Math.random() * 0.5;
    from.push(new THREE.Vector3(Math.cos(a) * r - 3.2, -3.4 + Math.random() * 0.3, Math.sin(a) * r + 1.5));
    delay.push(((GH - 1 - y) / GH) * 0.62 + Math.random() * 0.08); // alttan yukarı dolar
  }
  const pc = new THREE.Color();
  for (let k = 0; k < PX; k++) paint.setColorAt(k, pc.set(0x2a2f3a));
  const img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas');
    c.width = GW;
    c.height = GH;
    const g = c.getContext('2d');
    g.drawImage(img, 0, 0, GW, GH);
    const d = g.getImageData(0, 0, GW, GH).data;
    for (let k = 0; k < PX; k++) paint.setColorAt(k, pc.setRGB(d[k * 4] / 255, d[k * 4 + 1] / 255, d[k * 4 + 2] / 255, THREE.SRGBColorSpace));
    paint.instanceColor.needsUpdate = true;
  };
  img.src = product.art[0];
  const PM = new THREE.Matrix4(), PQ = new THREE.Quaternion(), PV = new THREE.Vector3(), PS = new THREE.Vector3(), PE = new THREE.Euler();
  let paintK = -1;

  // ---- cam tüpler ----
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xdfe8ff, roughness: 0.05, metalness: 0, transparent: true, opacity: 0.08, clearcoat: 1, side: THREE.FrontSide, depthWrite: false, envMapIntensity: 0.5 });
  const rim = new THREE.MeshBasicMaterial({ color: 0xbcd0ff, transparent: true, opacity: 0.5 });
  const TR = 0.36, TH = 2.2;
  const makeTube = () => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(TR, TH - TR * 2, 8, 32), glass);
    body.position.y = TH / 2;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(TR, 0.02, 8, 48), rim);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = TH - TR * 0.15;
    g.add(body, ring);
    return g;
  };
  const rig = new THREE.Group();
  const tubeA = makeTube();
  const tubeB = makeTube();
  tubeB.position.set(0.55, -1.2, 0);
  tubeA.position.set(-0.9, -1.2, 0);
  rig.add(tubeA, tubeB);
  // halo
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({ map: haloTex(), color: 0xffd9a0, transparent: true, opacity: 0.14, blending: THREE.AdditiveBlending, depthWrite: false }));
  glow.position.set(0, 0, -1);
  rig.add(glow);
  scene.add(rig);

  // ---- kum taneleri ----
  // A tüpünde 3 katman: alt kırmızı, orta beyaz, üst turuncu (dökülecek olan).
  const PER_LAYER = 330, LAYERS = 3;
  const N = PER_LAYER * LAYERS;
  const R = 0.03;
  const grains = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(R, 0), new THREE.MeshStandardMaterial({ roughness: 0.9, metalness: 0 }), N);
  const layerColor = [PALETTE[0], PALETTE[1], PALETTE[2]];
  const col = new THREE.Color();
  // tüp içi yuvalar: altıgen ızgaralı diskler, alttan yukarı
  const disc = [];
  const STEP = R * 2.05, RIN = TR - R * 1.6;
  for (let x = -RIN; x <= RIN; x += STEP) for (let z = -RIN; z <= RIN; z += STEP * 0.87) {
    const xx = x + ((Math.round(z / (STEP * 0.87)) & 1) ? STEP / 2 : 0);
    if (xx * xx + z * z <= RIN * RIN) disc.push([xx, z]);
  }
  const LH = R * 1.75;
  const slot = (k) => {
    const d = Math.floor(k / disc.length), j = k % disc.length;
    // yuvarlak dip: alt disklerde yarıçap daralır
    const shrink = Math.min(1, 0.45 + d * 0.18);
    return new THREE.Vector3(disc[j][0] * shrink, R * 1.2 + d * LH, disc[j][1] * shrink);
  };
  const g0 = [], jitter = [];
  for (let k = 0; k < N; k++) {
    g0.push(slot(k));
    jitter.push(new THREE.Vector3((Math.random() - 0.5) * 0.012, (Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.012));
    const L = Math.floor(k / PER_LAYER);
    col.set(layerColor[L]).offsetHSL(0, (Math.random() - 0.5) * 0.08, (Math.random() - 0.5) * 0.1);
    grains.setColorAt(k, col);
  }
  rig.add(grains);

  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S1 = new THREE.Vector3(1, 1, 1);
  const mouth = new THREE.Vector3(), ctrl = new THREE.Vector3(), start = new THREE.Vector3(), land = new THREE.Vector3();
  const tmp = new THREE.Vector3(), AXIS = new THREE.Vector3(0.3, 1, 0.2).normalize();
  const CYCLE = 8; // sn: eğil → dök → bekle → sıfırla
  const pourFirst = PER_LAYER * 2; // dökülen ilk tanenin indeksi (üst katman)
  const THETA = 1.45; // eğim açısı (rad)
  const restA = new THREE.Vector3(-0.95, -1.2, 0);
  const pourA = new THREE.Vector3(0.48 - Math.sin(THETA) * TH, -1.2 + TH + 0.42 - Math.cos(THETA) * TH, 0);

  return {
    scene,
    camera,
    bloom: { strength: 0.35, radius: 0.5, threshold: 0.93 },
    update(t, dt, s) {
      const sd = b.tick(t, dt, s, { camZ: 9.5, spread: 3.1 });
      const Nsec = product.sections.length;
      // tüp düzeneği telefonun karşı tarafında
      // tüpler telefonla aynı tarafta, ortaya yakın
      rig.position.set(s.mobile ? -0.2 : sd.x * 0.7 - 0.3, s.mobile ? -1.15 : -0.1, s.mobile ? -1 : 0.4);
      rig.scale.setScalar(s.mobile ? 0.85 : 1.05);
      rig.rotation.y = Math.sin(t * 0.3) * 0.15 + s.mouseS.x * 0.15;
      wall.position.x = -s.p * 6 + 3;
      wall.position.y = -s.p * 0.6;

      // müze salonları: "salon salon bir müze" bölümünde her birkaç saniyede bir sonraki temalı
      // salona geçer — ışık rengi, zemin ve etiket değişir, hepsi aynı duvar hissi kaybolur
      const vMuseum = near(s.sp, 3, 0.85);
      const hi = vMuseum > 0.3 ? Math.floor(t * 0.35) % HALLS.length : 0;
      if (hi !== hallIdx) {
        hallIdx = hi;
        hallLabel.userData.setText(HALLS[hi].name[lang] ?? HALLS[hi].name.en);
      }
      const hall = HALLS[hallIdx];
      hallSkyTop.set(0x101a3a).lerp(hallCol.set(hall.top), vMuseum);
      hallSkyBot.set(0x03050c).lerp(hallCol.set(hall.bot), vMuseum);
      dome.userData.setColors(hallSkyTop, hallSkyBot);
      scene.fog.color.copy(hallSkyBot);
      floorMat.color.lerp(hallCol.set(vMuseum > 0.05 ? hall.floor : 0x04060d), 1 - Math.exp(-dt * 3));
      spotMats.forEach((m) => m.color.lerp(hallCol.set(vMuseum > 0.05 ? hall.spot : 0xffe2b0), 1 - Math.exp(-dt * 3)));
      hallLabel.position.set(wall.position.x, 3.6 + wall.position.y, -8.5);
      hallLabel.material.opacity = damp(hallLabel.material.opacity, vMuseum > 0.3 ? 1 : 0, 6, dt);
      hallLabel.visible = hallLabel.material.opacity > 0.02;

      const c = (t % CYCLE) / CYCLE;
      const tilt = smooth(0.0, 0.16, c) * (1 - smooth(0.8, 0.93, c)); // 0..1
      tubeA.rotation.z = -tilt * THETA;
      tubeA.position.lerpVectors(restA, pourA, tilt);
      tubeA.updateMatrix();
      tubeB.updateMatrix();
      mouth.set(0, TH, 0).applyMatrix4(tubeA.matrix);
      ctrl.copy(mouth).add(V.set(0.12, 0.05, 0));
      const pour = clamp((c - 0.17) / 0.5); // dökme penceresi
      const reset = smooth(0.9, 1.0, c);
      for (let k = 0; k < N; k++) {
        let pos = tmp.copy(g0[k]).add(jitter[k]).applyMatrix4(tubeA.matrix);
        if (k >= pourFirst) {
          const order = 1 - (k - pourFirst) / PER_LAYER; // üstteki önce kalkar
          const e = clamp((pour - order * 0.72) / 0.28);
          if (e > 0) {
            start.copy(pos);
            land.copy(g0[N - 1 - k]).add(jitter[k]).applyMatrix4(tubeB.matrix); // ilk kalkan en alta oturur
            const u = 1 - e;
            // ikinci dereceden Bezier: yuva → ağız → iniş; sona doğru yerçekimi hızlanması
            const ee = e * e * (1.6 - 0.6 * e);
            const uu = 1 - ee;
            pos = tmp.set(0, 0, 0)
              .addScaledVector(start, uu * uu)
              .addScaledVector(ctrl, 2 * uu * ee)
              .addScaledVector(land, ee * ee);
            pos.x += Math.sin(k * 12.9898) * 0.03 * Math.sin(e * Math.PI) * u;
            pos.z += Math.cos(k * 4.1414) * 0.03 * Math.sin(e * Math.PI) * u;
          }
        }
        const sc = k >= pourFirst ? (c < 0.5 ? smooth(0, 0.08, c) : 1 - reset) : 1;
        S1.setScalar(Math.max(0.001, sc));
        Q.setFromAxisAngle(AXIS, k);
        M.compose(pos, Q, S1);
        grains.setMatrixAt(k, M);
      }
      grains.instanceMatrix.needsUpdate = true;
      glow.material.opacity = 0.1 + near(s.sp, 1, 0.8) * 0.12;

      // boya: 2. bölümde (hikâye) taneler tuvale uçar
      const vis = Math.max(near(s.sp, 2, 1.1), smooth(2, 2.6, s.sp) * (1 - smooth(3.0, 3.6, s.sp)));
      paintG.visible = vis > 0.01;
      const k = smooth(1.35, 2.35, s.sp);
      paintG.position.set(s.mobile ? 0 : sd.x * 1.9, s.mobile ? 1.3 : 0.55, s.mobile ? -2.5 : -1.2);
      paintG.scale.setScalar((s.mobile ? 0.55 : 0.85) * (0.6 + vis * 0.4));
      paintG.rotation.set(s.mouseS.y * 0.08, -sd.x * 0.25 + s.mouseS.x * 0.12, 0);
      if (paintG.visible && Math.abs(k - paintK) > 0.0005) {
        paintK = k;
        for (let i = 0; i < PX; i++) {
          const e = clamp((k - delay[i]) / 0.3);
          const ee = e * e * (3 - 2 * e);
          PV.lerpVectors(from[i], to[i], ee);
          PV.y += Math.sin(ee * Math.PI) * 1.2;
          PV.z += Math.sin(ee * Math.PI) * 0.6;
          PE.set((1 - ee) * i, (1 - ee) * i * 0.7, 0);
          PS.setScalar(e <= 0 ? 0.0001 : 0.6 + ee * 0.4);
          PM.compose(PV, PQ.setFromEuler(PE), PS);
          paint.setMatrixAt(i, PM);
        }
        paint.instanceMatrix.needsUpdate = true;
      }
      // tüpler hikâye bölümünde geri çekilir
      if (b.phone) {
        const n2 = near(s.sp, 2, 0.9);
        b.phone.position.x += sd.x * n2 * 1.3;
        b.phone.position.z -= n2 * 2;
      }
      rig.scale.multiplyScalar(1 - near(s.sp, 2, 0.9) * 0.4);
    },
  };
}
