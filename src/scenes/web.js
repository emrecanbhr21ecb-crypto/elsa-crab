import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { productBase } from './base.js';
import { tex, makeBrowser, makePhone, damp, near, smooth, NOISE } from '../lib.js';
import { haloTex } from './home.js';

// Web siteleri: 3B tarayıcı penceresinde sitenin gerçek kareleri + her siteye özel dünya.
const LOOKS = {
  hevsel: { sky: [0xdfe5e8, 0x9aa6ad, 0.9], fog: [0xc9d2d7, 0.012], dust: 0xffffff, exposure: 0.85, bloom: { strength: 0.15, radius: 0.4, threshold: 0.97 } },
  valeon: { sky: [0x0a0f1e, 0x010205, 1], fog: [0x02030a, 0.04], dust: 0x8fe3ff, exposure: 1.0, bloom: { strength: 0.6, radius: 0.5, threshold: 0.85 } },
  florium: { sky: [0x173a2a, 0x06100b, 0.9], fog: [0x0a1710, 0.035], dust: 0xf2d38a, exposure: 1.1, bloom: { strength: 0.45, radius: 0.5, threshold: 0.82 } },
};

export function build({ renderer, product }) {
  const look = LOOKS[product.slug];
  const b = productBase({ renderer, product, sky: look.sky, fog: look.fog, dustColor: look.dust, phone: false });
  const { scene, camera } = b;
  const N = product.sections.length;

  // ---- tarayıcı ----
  const texes = product.shots.map((u) => tex(u, renderer));
  const browser = makeBrowser(texes[0], { width: 4.3, aspect: 1.6 });
  scene.add(browser);
  const shotFor = (i) => (i === 0 ? texes[0] : texes[(product.sections[Math.min(i, N) - 1]?.shot ?? i) % texes.length]);

  // ---- florium: telefonda kendiliğinden kayan mobil site ----
  let phone = null, tall = null;
  if (product.tall) {
    tall = tex(product.tall, renderer).clone();
    tall.userData.shared = false;
    tall.wrapT = THREE.ClampToEdgeWrapping;
    const ratio = 844 / 4000; // ekran yüksekliği / tüm sayfa
    tall.repeat.set(1, ratio);
    tall.offset.set(0, 1 - ratio);
    phone = makePhone(tall, { width: 1.05, aspect: 390 / 844 });
    phone.userData.ratio = ratio;
    scene.add(phone);
  }

  // ---- siteye özel dünya ----
  const world = new THREE.Group();
  scene.add(world);
  let tickWorld = () => {};

  if (product.slug === 'hevsel') {
    // minyatür şehir: krem bloklar, mavi nehir, sarı servis aracı
    const ground = new THREE.Mesh(new THREE.BoxGeometry(26, 0.4, 18), new THREE.MeshStandardMaterial({ color: 0xf2efe8, roughness: 0.9 }));
    ground.position.y = -2.6;
    world.add(ground);
    const river = new THREE.Mesh(new THREE.PlaneGeometry(2, 30, 1, 40), new THREE.MeshStandardMaterial({ color: 0x3d9be0, roughness: 0.3 }));
    const rp = river.geometry.attributes.position;
    for (let i = 0; i < rp.count; i++) rp.setX(i, rp.getX(i) + Math.sin(rp.getY(i) * 0.3) * 1.6);
    river.rotation.x = -Math.PI / 2;
    river.rotation.z = 0.5;
    river.position.set(5, -2.39, 0);
    world.add(river);
    const blocks = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 }), 180);
    const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S = new THREE.Vector3(), C = new THREE.Color();
    let k = 0, sd = 3;
    const r = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
    while (k < 180) {
      const x = (r() - 0.5) * 24, z = (r() - 0.5) * 16;
      if (Math.abs(x - 5 - Math.sin(z * 0.3) * 1.6 + z * 0.5) < 1.8) continue;
      const h = 0.3 + r() * 1.3;
      M.compose(V.set(x, -2.4 + h / 2, z), Q.identity(), S.set(0.5 + r() * 0.7, h, 0.5 + r() * 0.7));
      blocks.setMatrixAt(k, M);
      blocks.setColorAt(k, C.set(r() < 0.08 ? 0xffb300 : r() < 0.06 ? 0x3fa86a : 0xf4efe6));
      k++;
    }
    world.add(blocks);
    // surlar: koyu halka
    const wall = new THREE.Mesh(new RoundedBoxGeometry(7, 0.6, 5, 4, 0.6), new THREE.MeshStandardMaterial({ color: 0x2a2a2e, roughness: 0.8 }));
    const hole = new THREE.Mesh(new RoundedBoxGeometry(6.2, 0.62, 4.2, 4, 0.5), new THREE.MeshStandardMaterial({ color: 0xf2efe8 }));
    wall.position.set(-3, -2.1, 0);
    hole.position.set(-3, -2.08, 0);
    world.add(wall, hole);
    const bus = new THREE.Group();
    const busBody = new THREE.Mesh(new RoundedBoxGeometry(0.9, 0.42, 0.42, 3, 0.08), new THREE.MeshStandardMaterial({ color: 0xffb300, roughness: 0.4 }));
    busBody.position.y = 0.28;
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 0.43), new THREE.MeshStandardMaterial({ color: 0x23262d }));
    win.position.y = 0.38;
    bus.add(busBody, win);
    for (const [x, z] of [[-0.3, 0.2], [0.3, 0.2], [-0.3, -0.2], [0.3, -0.2]]) {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 16), new THREE.MeshStandardMaterial({ color: 0x111111 }));
      w.rotation.x = Math.PI / 2;
      w.position.set(x, 0.09, z);
      bus.add(w);
    }
    world.add(bus);
    const path = new THREE.CatmullRomCurve3([[-3, 0, -2.6], [0.5, 0, -2.6], [0.5, 0, 2.6], [-6.5, 0, 2.6], [-6.5, 0, -2.6]].map((p) => new THREE.Vector3(p[0], -2.4, p[2])), true, 'catmullrom', 0.2);
    const line = new THREE.Mesh(new THREE.TubeGeometry(path, 200, 0.06, 6, true), new THREE.MeshStandardMaterial({ color: 0xffb300, emissive: 0xffb300, emissiveIntensity: 0.3 }));
    world.add(line);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xb8b2a4, 0.7));
    tickWorld = (t, s) => {
      const u = (t * 0.03 + s.p * 0.6) % 1;
      path.getPointAt(u, V);
      bus.position.copy(V);
      path.getTangentAt(u, S);
      bus.rotation.y = Math.atan2(-S.z, S.x);
      world.rotation.y = -0.35 + s.p * 0.5;
    };
  }

  if (product.slug === 'valeon') {
    // neon ızgara zemin
    const grid = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.ShaderMaterial({
        transparent: true,
        uniforms: { time: { value: 0 } },
        vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,
        fragmentShader: `uniform float time; varying vec3 vW;
          void main(){ vec2 g = abs(fract((vW.xz + vec2(0.0, time*0.6)) / 1.6) - 0.5) / fwidth(vW.xz / 1.6);
            float line = 1.0 - min(min(g.x, g.y), 1.0);
            float fade = 1.0 - smoothstep(4.0, 30.0, length(vW.xz));
            vec3 c = mix(vec3(1.0,0.2,0.35), vec3(0.2,0.8,1.0), smoothstep(-10.0, 10.0, vW.x));
            gl_FragColor = vec4(c * line * 1.4, line * fade * 0.8); }`,
      }),
    );
    grid.rotation.x = -Math.PI / 2;
    grid.position.y = -2.4;
    world.add(grid);
    // asılı kart (markanın siyah-altın kartı) — sönümlü sarkaç
    const cardT = tex('media/web/val-premium.webp', renderer);
    const pivot = new THREE.Group();
    pivot.position.set(0, 3.2, -1.5);
    const string = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 2, 6), new THREE.MeshBasicMaterial({ color: 0x222222 }));
    string.position.y = -1;
    const card = new THREE.Mesh(new RoundedBoxGeometry(1.05, 2.2, 0.03, 3, 0.04), [0, 0, 0, 0, 1, 1].map((i) => (i ? new THREE.MeshStandardMaterial({ map: cardT, roughness: 0.5, metalness: 0.1, envMapIntensity: 0.4 }) : new THREE.MeshStandardMaterial({ color: 0x111111 }))));
    card.position.y = -3.1;
    pivot.add(string, card);
    world.add(pivot);
    // esans parçacıkları (GPU'da hareket)
    const P = 2600;
    const pos = new Float32Array(P * 3), sd = new Float32Array(P);
    for (let i = 0; i < P; i++) { pos.set([(Math.random() - 0.5) * 14, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8 - 2], i * 3); sd[i] = Math.random(); }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('sd', new THREE.BufferAttribute(sd, 1));
    const pm = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { time: { value: 0 }, pr: { value: Math.min(devicePixelRatio, 2) } },
      vertexShader: `${NOISE} attribute float sd; uniform float time; uniform float pr; varying float vA; varying float vS;
        void main(){ vec3 p = position; float t = time*0.15;
          p += vec3(snoise(p*0.2+t), snoise(p*0.2+t+17.0), snoise(p*0.2+t+31.0)) * 1.2;
          vec4 mv = modelViewMatrix*vec4(p,1.0); gl_Position = projectionMatrix*mv; gl_PointSize = pr*(2.0+sd*4.0)*(10.0/-mv.z);
          vA = 0.3 + 0.7*sd; vS = sd; }`,
      fragmentShader: `varying float vA; varying float vS; void main(){ float d = length(gl_PointCoord-0.5); vec3 c = mix(vec3(0.3,0.85,1.0), vec3(1.0,0.75,0.35), step(0.8, vS)); gl_FragColor = vec4(c, smoothstep(0.5,0.0,d)*vA); }`,
    });
    const parts = new THREE.Points(g, pm);
    parts.frustumCulled = false;
    world.add(parts);
    const key = new THREE.PointLight(0x3fd2ff, 8, 15);
    key.position.set(-2, 2, 3);
    const gold = new THREE.PointLight(0xffc06a, 5, 12);
    gold.position.set(2, 1, 2);
    scene.add(key, gold);
    // iki serbestlik dereceli sönümlü sarkaç (araç ivmesi iki sinüsün toplamı)
    let a = 0.25, av = 0, c = 0, cv = 0;
    tickWorld = (t, s, dt) => {
      grid.material.uniforms.time.value = t;
      pm.uniforms.time.value = t;
      const acc = Math.sin(t * 0.9) * 0.6 + Math.sin(t * 2.3) * 0.25 + (s.velocity || 0) * 0.01;
      av += (-9.8 / 2.2 * Math.sin(a) - acc * Math.cos(a) - av * 0.6) * dt;
      a += av * dt;
      cv += (-c * 6 - cv * 1.2 + Math.sin(t * 1.3) * 0.5) * dt;
      c += cv * dt;
      pivot.rotation.z = a;
      card.rotation.y = c + s.mouseS.x * 0.3;
      const sd2 = b.side(s.sp, s.mobile);
      pivot.position.x = s.mobile ? 0 : -sd2.x * 0.2 + sd2.x * 0.6;
      pivot.visible = s.sp > 0.5 || true;
    };
  }

  if (product.slug === 'florium') {
    // düşen taç yaprakları ve yapraklar
    const P = 90;
    const petal = new THREE.PlaneGeometry(0.11, 0.17, 1, 4);
    const pp = petal.attributes.position;
    for (let i = 0; i < pp.count; i++) pp.setZ(i, Math.sin((pp.getY(i) + 0.12) * 12) * 0.03);
    petal.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.7, envMapIntensity: 0.3 });
    const inst = new THREE.InstancedMesh(petal, mat, P);
    const cols = [0xc8324a, 0xf0a3b4, 0xf6efe6, 0x5c9e5a, 0x3e7a45, 0xe8b4c0];
    const C = new THREE.Color();
    const seeds = Array.from({ length: P }, (_, i) => {
      inst.setColorAt(i, C.set(cols[i % cols.length]));
      return { x: (Math.random() - 0.5) * 16, y: Math.random() * 12 - 6, z: -Math.random() * 8 + 1, v: 0.12 + Math.random() * 0.22, r: Math.random() * 6, w: Math.random() * 6 };
    });
    world.add(inst);
    const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), V = new THREE.Vector3(), S = new THREE.Vector3(1, 1, 1);
    const warm = new THREE.PointLight(0xffd59a, 8, 16);
    warm.position.set(1, 3, 4);
    scene.add(warm, new THREE.HemisphereLight(0xcfe8d2, 0x10241a, 0.8));
    tickWorld = (t, s, dt) => {
      for (let i = 0; i < P; i++) {
        const q = seeds[i];
        q.y -= q.v * dt;
        if (q.y < -6) q.y = 6;
        E.set(q.r + t * 0.8, q.w + t * 0.5, Math.sin(t + q.r));
        M.compose(V.set(q.x + Math.sin(t * 0.7 + q.w) * 0.6, q.y, q.z), Q.setFromEuler(E), S);
        inst.setMatrixAt(i, M);
      }
      inst.instanceMatrix.needsUpdate = true;
    };
  }

  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.position.set(3, 5, 6);
  scene.add(key);

  return {
    scene,
    camera,
    exposure: look.exposure,
    bloom: look.bloom,
    hud(s) {
      const i = Math.min(N, Math.round(s.sp));
      const label = i === 0 ? product.name : product.sections[i - 1]?.label?.en || '';
      return [
        ['Site', product.name],
        ['Frame', `${String((shotFor(Math.max(0, i)) && texes.indexOf(shotFor(Math.max(0, i)))) + 1).padStart(2, '0')} / ${String(texes.length).padStart(2, '0')}`],
        ['Section', label],
        ['Scroll', `${Math.round(s.p * 100)}%`],
      ];
    },
    update(t, dt, s) {
      const sd = b.tick(t, dt, s, { camZ: 9.5 });
      const idx = Math.round(s.sp);
      browser.userData.show(shotFor(Math.min(idx, N)));
      browser.userData.tick(dt, t);
      const m = s.mobile;
      const bx = m ? 0 : sd.x * 2.35;
      browser.position.set(bx, (m ? 1.0 : 0.15) + Math.sin(t * 0.8) * 0.06, sd.z * 0.6);
      browser.scale.setScalar(m ? 0.62 : 1);
      browser.rotation.set(0.04 + s.mouseS.y * 0.08, -sd.x * 0.28 + s.mouseS.x * 0.12, 0);
      if (phone) {
        phone.userData.tick(dt, t);
        phone.position.set(bx + (m ? 1.05 : sd.x * 1.7), (m ? 0.6 : -0.6) + Math.sin(t * 0.9 + 1) * 0.08, 0.9 + sd.z * 0.6);
        phone.scale.setScalar(m ? 0.6 : 1);
        phone.rotation.set(0.05, -sd.x * 0.4 + s.mouseS.x * 0.15, 0);
        // telefon ekranında mobil site yukarıdan aşağı kendiliğinden kayar
        const r = phone.userData.ratio;
        const u = (Math.sin(t * 0.12 - Math.PI / 2) * 0.5 + 0.5) * 0.7 + s.p * 0.3;
        tall.offset.y = (1 - r) * (1 - Math.min(1, u));
      }
      tickWorld(t, s, dt);
    },
  };
}
