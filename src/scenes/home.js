import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { NOISE, dust, skyDome, tex, keyframe, damp } from '../lib.js';

// Ana sayfa: nefes alan yanardöner bir küre ve etrafında dönen ürün kartları.
export function build({ renderer, products, websites = [], navigate }) {
  const items = [...products.map((p) => ({ ...p, href: p.slug })), ...websites.map((w) => ({ ...w, icon: w.cover, href: 'web/' + w.slug }))];
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x04050c, 0.035);
  const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 300);

  scene.add(skyDome(0x10143a, 0x020309, { power: 0.9 }));
  const stars = dust({ count: 2200, spread: 90, depth: 90, size: 0.05, color: 0xc8d0ff, opacity: 0.8 });
  scene.add(stars);
  // uzak yıldız katmanı: paralaks derinliği için yakın yıldızlardan daha yavaş döner
  const starsFar = dust({ count: 1400, spread: 170, depth: 170, size: 0.028, color: 0x5c66a0, opacity: 0.55 });
  scene.add(starsFar);

  // ---- küre ----
  const orbU = { time: { value: 0 }, amp: { value: 0.22 }, hue: { value: 0 } };
  const orb = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.55, 96),
    new THREE.ShaderMaterial({
      uniforms: orbU,
      vertexShader: /* glsl */ `
        ${NOISE}
        uniform float time; uniform float amp; varying vec3 vN; varying vec3 vV; varying float vD;
        void main(){
          vec3 p = position;
          float n = snoise(p*0.9 + vec3(time*0.18)) * 0.7 + snoise(p*2.1 - vec3(time*0.25))*0.3;
          vD = n;
          p += normal * n * amp;
          vec4 mv = modelViewMatrix * vec4(p,1.0);
          vN = normalize(normalMatrix * normal + n*0.35);
          vV = -mv.xyz;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform float time; uniform float hue; varying vec3 vN; varying vec3 vV; varying float vD;
        vec3 pal(float t){ return 0.5 + 0.5*cos(6.28318*(vec3(1.0)*t + vec3(0.0,0.33,0.67))); }
        void main(){
          vec3 n = normalize(vN); vec3 v = normalize(vV);
          float fr = pow(1.0 - max(dot(n,v),0.0), 2.4);
          vec3 base = mix(vec3(0.03,0.035,0.09), vec3(0.10,0.09,0.25), vD*0.5+0.5);
          vec3 irid = pal(fr*0.9 + vD*0.35 + time*0.03 + hue);
          vec3 c = base + irid * fr * 1.25 + vec3(0.9,0.85,1.0)*pow(fr,6.0)*0.55;
          gl_FragColor = vec4(c, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    }),
  );
  const orbGroup = new THREE.Group();
  orbGroup.add(orb);
  // ince yörünge halkaları
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xaab4ff, transparent: true, opacity: 0.35 });
  const rings = [];
  for (let i = 0; i < 3; i++) {
    const r = new THREE.Mesh(new THREE.TorusGeometry(2.2 + i * 0.42, 0.006, 8, 220), ringMat);
    r.rotation.set(Math.PI / 2 + (i - 1) * 0.35, i * 0.6, 0);
    orbGroup.add(r);
    rings.push(r);
  }
  scene.add(orbGroup);

  // ---- ürün kartları ----
  const carousel = new THREE.Group();
  const R = 3.5;
  const tiles = items.map((p, i) => {
    const g = new THREE.Group();
    const a = (i / items.length) * Math.PI * 2;
    const front = new THREE.MeshStandardMaterial({ map: tex(p.icon, renderer), roughness: 0.35, metalness: 0.1, emissive: 0xffffff, emissiveMap: tex(p.icon, renderer), emissiveIntensity: 0.14 });
    const side = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(p.accent), metalness: 0.6, roughness: 0.25, clearcoat: 1 });
    const geo = new RoundedBoxGeometry(0.95, 0.95, 0.12, 5, 0.16);
    const box = new THREE.Mesh(geo, [side, side, side, side, front, side]);
    g.add(box);
    // kartın altında yumuşak ışık lekesi
    const halo = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 2.4),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(p.accent), transparent: true, opacity: 0.18, depthWrite: false, blending: THREE.AdditiveBlending, map: haloTex() }),
    );
    halo.position.z = -0.12;
    g.add(halo);
    g.position.set(Math.cos(a) * R, Math.sin(i * 1.7) * 0.4, Math.sin(a) * R);
    g.userData = { slug: p.href, a, hover: 0 };
    box.userData.tile = g;
    carousel.add(g);
    return g;
  });
  carousel.rotation.x = 0.28;
  carousel.rotation.z = -0.12;
  scene.add(carousel);

  // ---- takımyıldızı: küreden her karta uzanan ince ışık iplikleri — "stüdyo + on ürün" ağı ----
  const linkPos = new Float32Array(tiles.length * 2 * 3);
  const links = new THREE.LineSegments(
    new THREE.BufferGeometry(),
    new THREE.LineBasicMaterial({ color: 0xaab4ff, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  links.geometry.setAttribute('position', new THREE.BufferAttribute(linkPos, 3));
  scene.add(links);
  const linkB = new THREE.Vector3();

  scene.add(new THREE.AmbientLight(0x8890ff, 0.4));
  const key = new THREE.PointLight(0xb7a6ff, 30, 30);
  key.position.set(0, 2, 4);
  scene.add(key);

  // bölüm başına kamera anahtarları: hero, 3 özellik, istatistik, ürünler, iletişim
  const K = (m) => [
    { cam: [0, 0.2, m ? 12 : 9.5], look: [0, m ? 0.6 : 0, 0], ox: m ? 0 : 2.4, oy: m ? 2.3 : 0, spin: 0 }, // hero
    { cam: [0, 0.6, 13.5], look: [0, 0, 0], ox: m ? 0 : 5.2, oy: m ? 2.8 : 1.6, spin: 0.8 }, // hakkında
    { cam: [0, 1.2, 12], look: [0, 0.4, 0], ox: m ? 0 : 3.2, oy: m ? 2.6 : 2.4, spin: 1.6 }, // süreç
    { cam: [0, 3.5, 12.5], look: [0, 0, 0], ox: 0, oy: 0, spin: 2.6 }, // rakamlar
    { cam: [0, 7.5, 13.5], look: [0, -0.6, 0], ox: 0, oy: 0, spin: 3.8 }, // ürünler
    { cam: [3, 4, 12], look: [0, 0, 0], ox: 0, oy: 0, spin: 5.0 }, // web siteleri
    { cam: [0, 0.2, 5.2], look: [0, 0, 0], ox: 0, oy: 0, spin: 5.8 }, // iletişim
  ];

  const ray = new THREE.Raycaster();
  const look = new THREE.Vector3();
  let hovered = null;
  let spin = 0;

  return {
    scene,
    camera,
    bloom: { strength: 0.5, radius: 0.55, threshold: 0.74 },
    // ana sayfa kendi mobil kompozisyonunu kuruyor (küre üstte), ek kaydırma gerekmez
    mobileShift: 0,
    update(t, dt, s) {
      const k = keyframe(K(s.mobile), s.sp);
      orbU.time.value = t;
      orbU.amp.value = 0.2 + Math.sin(t * 0.6) * 0.04 + s.p * 0.15;
      orbU.hue.value = s.p * 0.6;
      orbGroup.position.set(k.ox, k.oy, 0);
      orb.rotation.y = t * 0.08;
      rings.forEach((r, i) => (r.rotation.z = t * (0.05 + i * 0.03) * (i % 2 ? -1 : 1)));

      spin = damp(spin, k.spin, 3, dt);
      carousel.rotation.y = t * 0.06 + spin;
      carousel.position.copy(orbGroup.position);
      tiles.forEach((g, i) => {
        g.lookAt(camera.position.x, g.getWorldPosition(look).y, camera.position.z);
        g.position.y = Math.sin(t * 0.8 + i * 1.7) * 0.25;
        g.userData.hover = damp(g.userData.hover, hovered === g ? 1 : 0, 10, dt);
        const sc = 1 + g.userData.hover * 0.18;
        g.scale.setScalar(sc);
        g.getWorldPosition(linkB);
        linkPos.set([orbGroup.position.x, orbGroup.position.y, orbGroup.position.z, linkB.x, linkB.y, linkB.z], i * 6);
      });
      links.geometry.attributes.position.needsUpdate = true;
      links.material.opacity = 0.14 + Math.sin(t * 0.8) * 0.04 + (hovered ? 0.2 : 0);

      camera.position.set(k.cam[0] + s.mouseS.x * 0.5, k.cam[1] + s.mouseS.y * 0.35, k.cam[2]);
      camera.lookAt(look.set(...k.look));
      stars.userData.tick(t);
      stars.rotation.y = t * 0.01 + s.p * 0.6;
      starsFar.userData.tick(t * 0.4);
      starsFar.rotation.y = t * 0.004 + s.p * 0.15;

      // fareyle kartların üstüne gelme
      ray.setFromCamera(s.mouse, camera);
      const hit = ray.intersectObjects(tiles.map((g) => g.children[0]), false)[0];
      hovered = hit ? hit.object.userData.tile : null;
      document.body.style.cursor = hovered && !document.querySelector('.panel:hover,.card:hover,a:hover') ? 'pointer' : '';
    },
    click(e, s) {
      const m = new THREE.Vector2((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
      ray.setFromCamera(m, camera);
      const hit = ray.intersectObjects(tiles.map((g) => g.children[0]), false)[0];
      if (hit) navigate(hit.object.userData.tile.userData.slug);
    },
    dispose() {
      document.body.style.cursor = '';
    },
  };
}

let _halo;
function haloTex() {
  if (_halo) return _halo;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  _halo = new THREE.CanvasTexture(c);
  _halo.userData.shared = true;
  return _halo;
}
export { haloTex };
