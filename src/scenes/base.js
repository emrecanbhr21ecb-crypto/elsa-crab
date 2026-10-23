import * as THREE from 'three';
import { dust, skyDome, keyframe, makePhone, tex, damp } from '../lib.js';

// Ürün sayfalarının ortak iskeleti.
// Bölüm sırası: 0 hero · 1..N özellik · istatistik · (galeri) · sıradaki
export function productBase({ renderer, product, sky, fog, dustColor = 0xffffff, phone = true, phoneAspect = 0.4884, phoneWidth = 1.55 }) {
  const scene = new THREE.Scene();
  if (fog) scene.fog = new THREE.FogExp2(fog[0], fog[1]);
  const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 300);
  const dome = skyDome(sky[0], sky[1], { power: sky[2] ?? 1 });
  scene.add(dome);
  const motes = dust({ count: 900, spread: 30, depth: 30, size: 0.05, color: dustColor, opacity: 0.6 });
  scene.add(motes);

  const N = product.sections.length;
  const hasGallery = (product.shots ?? []).length > 0;
  const total = 1 + N + 2 + (hasGallery ? 1 : 0) + 1;

  // her bölümde nesnenin duracağı yatay taraf: panel soldaysa sağ (+1)
  const sideKeys = (m) => {
    const ks = [{ x: m ? 0 : 1, y: m ? 0.55 : 0, z: 0 }];
    for (let i = 0; i < N; i++) ks.push({ x: m ? 0 : i % 2 ? -1 : 1, y: m ? 0.75 : 0, z: 0 });
    ks.push({ x: 0, y: m ? 0.2 : 0.1, z: -1.5 }); // rakamlar
    ks.push({ x: m ? 0 : 0.8, y: m ? 0.9 : 0, z: -2.5 }); // kaputun altı
    if (hasGallery) ks.push({ x: 0, y: 0.9, z: -5 });
    ks.push({ x: 0, y: 0, z: -2 });
    return ks;
  };
  const side = (sp, m) => keyframe(sideKeys(m), sp);

  // her bölümde telefonda gösterilecek ekran
  const texes = (product.shots ?? []).map((u) => tex(u, renderer));
  const shotFor = (i) => {
    if (!texes.length) return null;
    if (i === 0) return texes[0];
    const sec = product.sections[i - 1];
    if (sec && sec.shot != null) return texes[sec.shot % texes.length];
    return texes[(i - 1) % texes.length];
  };

  let ph = null;
  if (phone && texes.length) {
    ph = makePhone(texes[0], { width: phoneWidth, aspect: phoneAspect });
    scene.add(ph);
  }

  const light = new THREE.DirectionalLight(0xffffff, 1.6);
  light.position.set(3, 5, 6);
  scene.add(light, new THREE.AmbientLight(0xffffff, 0.25));

  let tilt = 0;
  return {
    scene,
    camera,
    dome,
    motes,
    phone: ph,
    total,
    side,
    // ortak güncelleme: kamera, telefon konumu ve ekran seçimi
    tick(t, dt, s, { spread = 2.6, camZ = 9, camY = 0.3, phoneScale = 1 } = {}) {
      const sd = side(s.sp, s.mobile);
      const spread2 = s.mobile ? 0 : spread;
      if (ph) {
        const idx = Math.round(s.sp);
        const tx = shotFor(Math.min(idx, N));
        if (tx) ph.userData.show(tx);
        ph.userData.tick(dt, t);
        const sc = (s.mobile ? 0.78 : 1) * phoneScale;
        ph.scale.setScalar(sc);
        ph.position.set(sd.x * spread2, sd.y * (s.mobile ? 1.6 : 1) + Math.sin(t * 0.9) * 0.08, sd.z);
        tilt = damp(tilt, (s.sp % 1) - 0.5, 4, dt);
        ph.rotation.set(0.05 + s.mouseS.y * 0.12, -sd.x * 0.32 + s.mouseS.x * 0.2 + Math.sin(t * 0.5) * 0.05, -tilt * 0.06);
      }
      camera.position.set(s.mouseS.x * 0.4, camY + s.mouseS.y * 0.25, camZ + (s.mobile ? 2.5 : 0));
      camera.lookAt(0, camY * 0.5, 0);
      motes.userData.tick(t);
      return sd;
    },
  };
}
