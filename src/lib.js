import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// ---------- matematik ----------
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (a, b, v) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
// kare hızından bağımsız yumuşak takip
export const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt));
// sp (kesirli bölüm indeksi) etrafında tepe yapan pencere: bölüm i'deyken 1
export const near = (sp, i, w = 0.6) => 1 - smooth(0, w, Math.abs(sp - i));

// ---------- doku ----------
const loader = new THREE.TextureLoader();
const cache = new Map();
export function tex(url, renderer) {
  if (cache.has(url)) return cache.get(url);
  const t = loader.load(url, (tt) => {
    tt.userData.ready = true;
  });
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 4;
  // url'i sakla: sahne kapanıp doku dispose edilince önbellekten de silinsin —
  // aksi halde sayfa sayfa gezindikçe GPU'da doku hiç boşalmadan birikir (Safari'de
  // rastgele siyah kare/bozulmaya yol açan asıl sebep buydu)
  t.userData.url = url;
  cache.set(url, t);
  return t;
}
export function preload(urls, onProgress) {
  let done = 0;
  const list = urls.filter(Boolean);
  if (!list.length) return Promise.resolve();
  return Promise.all(
    list.map(
      (u) =>
        new Promise((res) => {
          const img = new Image();
          img.onload = img.onerror = () => {
            done++;
            onProgress?.(0.9 * (done / list.length));
            res();
          };
          img.src = u;
        }),
    ),
  );
}

// ---------- telefon ----------
// Ekran: köşeleri SDF ile yuvarlanan, iki doku arasında geçiş yapabilen shader.
const screenVert = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const screenFrag = /* glsl */ `
  uniform sampler2D mapA; uniform sampler2D mapB; uniform float mixv; uniform vec2 size;
  uniform float radius; uniform float glow; uniform float time;
  varying vec2 vUv;
  float sdRound(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q,0.0)) + min(max(q.x,q.y),0.0) - r; }
  vec2 cover(vec2 uv, sampler2D m){ return uv; }
  void main(){
    vec2 p = (vUv - 0.5) * size;
    float d = sdRound(p, size*0.5, radius);
    float a = 1.0 - smoothstep(-0.004, 0.004, d);
    vec3 ca = texture2D(mapA, vUv).rgb;
    vec3 cb = texture2D(mapB, vUv).rgb;
    vec3 c = mix(ca, cb, smoothstep(0.0,1.0,mixv));
    // camda gezinen ince yansıma şeridi
    float sweep = smoothstep(0.08, 0.0, abs(vUv.x + vUv.y*0.6 - fract(time*0.07)*2.6 + 0.4));
    c = c * 0.9 + sweep * 0.06 + glow * 0.04;
    gl_FragColor = vec4(c, a);
    #include <colorspace_fragment>
  }`;

export function makePhone(firstTex, { width = 1, aspect = 0.4875, color = 0x111318 } = {}) {
  const h = width / aspect;
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0.9,
    roughness: 0.28,
    clearcoat: 1,
    clearcoatRoughness: 0.15,
  });
  const body = new THREE.Mesh(new RoundedBoxGeometry(width + 0.09, h + 0.09, 0.1, 6, 0.12), bodyMat);
  g.add(body);
  const uniforms = {
    mapA: { value: firstTex },
    mapB: { value: firstTex },
    mixv: { value: 0 },
    size: { value: new THREE.Vector2(width, h) },
    radius: { value: 0.09 * width },
    glow: { value: 0 },
    time: { value: 0 },
  };
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(width, h),
    new THREE.ShaderMaterial({ uniforms, vertexShader: screenVert, fragmentShader: screenFrag, transparent: true, toneMapped: false }),
  );
  screen.position.z = 0.051;
  g.add(screen);
  // arka yüzde kamera adası
  const cam = new THREE.Mesh(new RoundedBoxGeometry(width * 0.36, width * 0.36, 0.03, 4, 0.05), bodyMat);
  cam.position.set(-width * 0.26, h * 0.36, -0.06);
  g.add(cam);

  let current = firstTex;
  g.userData = {
    height: h,
    uniforms,
    // yeni dokuya yumuşak geçiş
    show(t) {
      if (t === current) return;
      uniforms.mapA.value = uniforms.mixv.value > 0.5 ? uniforms.mapB.value : uniforms.mapA.value;
      uniforms.mapB.value = t;
      uniforms.mixv.value = 0;
      current = t;
    },
    tick(dt, time) {
      uniforms.time.value = time;
      if (uniforms.mapB.value !== uniforms.mapA.value) {
        uniforms.mixv.value = Math.min(1, uniforms.mixv.value + dt * 2.6);
        if (uniforms.mixv.value >= 1) {
          uniforms.mapA.value = uniforms.mapB.value;
          uniforms.mixv.value = 0;
        }
      }
    },
  };
  return g;
}

// ---------- parçacık alanı ----------
export function dust({ count = 1500, spread = 40, depth = 40, size = 0.06, color = 0xffffff, opacity = 0.7, y = 0 } = {}) {
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * spread;
    pos[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.6 + y;
    pos[i * 3 + 2] = (Math.random() - 0.5) * depth;
    seed[i] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { time: { value: 0 }, color: { value: new THREE.Color(color) }, size: { value: size }, opacity: { value: opacity }, pr: { value: Math.min(devicePixelRatio, 2) } },
    vertexShader: /* glsl */ `
      attribute float seed; uniform float time; uniform float size; uniform float pr; varying float vA;
      void main(){
        vec3 p = position;
        p.y += sin(time*0.3 + seed*40.0)*0.25;
        p.x += cos(time*0.2 + seed*25.0)*0.25;
        vec4 mv = modelViewMatrix * vec4(p,1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = size * pr * (300.0 / -mv.z) * (0.5 + seed);
        vA = 0.35 + 0.65 * (0.5 + 0.5*sin(time*1.3 + seed*60.0));
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 color; uniform float opacity; varying float vA;
      void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(color, a*a*opacity*vA); }`,
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  pts.userData.tick = (t) => (mat.uniforms.time.value = t);
  return pts;
}

// ---------- degrade gökyüzü ----------
export function skyDome(top, bottom, { radius = 120, power = 1.2 } = {}) {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: { top: { value: new THREE.Color(top) }, bottom: { value: new THREE.Color(bottom) }, power: { value: power } },
    vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
    fragmentShader: `uniform vec3 top; uniform vec3 bottom; uniform float power; varying vec3 vP;
      void main(){ float h = pow(clamp(vP.y*0.5+0.5,0.0,1.0), power); gl_FragColor = vec4(mix(bottom, top, h),1.0);
      #include <colorspace_fragment>
      }`,
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 16), mat);
  m.userData.setColors = (a, b) => {
    mat.uniforms.top.value.set(a);
    mat.uniforms.bottom.value.set(b);
  };
  return m;
}

// ---------- düz resim (sprite benzeri ama sahnede sabit) ----------
export function picture(t, w, aspect = 1, { transparent = true, toneMapped = false, opacity = 1 } = {}) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, w / aspect),
    new THREE.MeshBasicMaterial({ map: t, transparent, toneMapped, opacity, depthWrite: !transparent || opacity === 1 }),
  );
  return m;
}

// ---------- folyo kart: kalınlığı olan, holografik kenarlı karakter/kart görseli ----------
// Düz picture() yerine karakter portreleri ve kartlar için: gerçek 3D kalınlık +
// fresnel tabanlı gökkuşağı kenar parıltısı, "koleksiyon kartı" hissi verir.
export function foilCard(t, w, aspect = 1, { thickness = 0.045, edgeColor = 0x14161d, foil = true } = {}) {
  const h = w / aspect;
  const r = Math.min(w, h) * 0.04;
  const edgeMat = new THREE.MeshPhysicalMaterial({ color: edgeColor, metalness: 0.7, roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.2 });
  // yüz dokusu ışıktan bağımsız: picture() ile aynı davranış — sahne ışığına göre kararmaz/patlamaz
  const faceMat = new THREE.MeshBasicMaterial({ map: t, transparent: true, toneMapped: false });
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, thickness, 3, r), [edgeMat, edgeMat, edgeMat, edgeMat, faceMat, edgeMat]);
  const g = new THREE.Group();
  g.add(mesh);
  let foilMat = null;
  if (foil) {
    foilMat = new THREE.ShaderMaterial({
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
      uniforms: { time: { value: 0 } },
      vertexShader: /* glsl */ `varying vec3 vN; varying vec3 vV;
        void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.0); vV = -mv.xyz; gl_Position = projectionMatrix*mv; }`,
      fragmentShader: /* glsl */ `uniform float time; varying vec3 vN; varying vec3 vV;
        vec3 pal(float t){ return 0.5 + 0.5*cos(6.28318*(vec3(1.0)*t + vec3(0.0,0.33,0.67))); }
        void main(){ float fr = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.2); vec3 c = pal(fr*1.3 + time*0.04); gl_FragColor = vec4(c, fr*0.55); }`,
    });
    const rim = new THREE.Mesh(new RoundedBoxGeometry(w * 1.015, h * 1.015, thickness * 1.6, 3, r * 1.1), foilMat);
    g.add(rim);
  }
  // picture()'la aynı arayüz: .material üzerinden map/opacity değiştirilebilsin
  g.material = faceMat;
  g.userData = { tick: (t) => foilMat && (foilMat.uniforms.time.value = t) };
  return g;
}

// ---------- sahne temizliği ----------
function disposeTex(v) {
  if (!v || !v.isTexture || v.userData.shared) return;
  if (v.userData.url) cache.delete(v.userData.url); // önbellekten de düş: bir dahaki tex() çağrısı temiz yüklesin
  v.dispose();
}
export function disposeScene(scene) {
  scene.traverse((o) => {
    o.geometry?.dispose();
    const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
    for (const m of ms) {
      for (const k in m) disposeTex(m[k]);
      if (m.uniforms) for (const k in m.uniforms) disposeTex(m.uniforms[k].value);
      m.dispose();
    }
  });
}

// ---------- canvas'tan doku (logo, yazı) ----------
export function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// ---------- 3B simplex gürültü (Ashima / Stefan Gustavson, MIT) ----------
export const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

// Kesirli bölüm indeksine göre anahtar kareler arasında yumuşak geçiş.
// keys: [{...sayısal alanlar}] — her bölüm için bir anahtar.
export function keyframe(keys, sp) {
  const n = keys.length - 1;
  const s = clamp(sp, 0, n);
  const i = Math.min(Math.floor(s), n - 1 < 0 ? 0 : n - 1);
  const f = s - i;
  const e = f * f * (3 - 2 * f);
  const a = keys[i], b = keys[Math.min(i + 1, n)];
  const out = {};
  for (const k in a) {
    const va = a[k], vb = b[k] ?? va;
    out[k] = Array.isArray(va) ? va.map((v, j) => lerp(v, vb[j], e)) : lerp(va, vb, e);
  }
  return out;
}

// ---------- tarayıcı penceresi (web siteleri için) ----------
export function makeBrowser(firstTex, { width = 3.2, aspect = 1.6, color = 0x14161d } = {}) {
  const g = makePhone(firstTex, { width, aspect, color });
  const h = width / aspect;
  // telefonun kamera adasını gizle, üst çubuk ekle
  g.children[2].visible = false;
  g.children[0].geometry.dispose();
  g.children[0].geometry = new RoundedBoxGeometry(width + 0.08, h + 0.3, 0.08, 4, 0.05);
  g.children[0].position.y = 0.11;
  g.userData.uniforms.radius.value = 0.012;
  const dots = [0xff5f57, 0xfebc2e, 0x28c840].map((c, i) => {
    const d = new THREE.Mesh(new THREE.CircleGeometry(0.035, 16), new THREE.MeshBasicMaterial({ color: c, toneMapped: false }));
    d.position.set(-width / 2 + 0.12 + i * 0.11, h / 2 + 0.11, 0.045);
    g.add(d);
    return d;
  });
  const bar = new THREE.Mesh(new THREE.PlaneGeometry(width * 0.5, 0.11), new THREE.MeshBasicMaterial({ color: 0x2a2d37, toneMapped: false }));
  bar.position.set(0.05, h / 2 + 0.11, 0.045);
  g.add(bar);
  return g;
}

// metin dokusu (sahnede etiket, pano vb.)
export function textSprite(text, { size = 64, color = '#ffffff', font = '500 {s}px JetBrains Mono, monospace', pad = 18, bg = null } = {}) {
  const c = document.createElement('canvas');
  const g = c.getContext('2d');
  const f = font.replace('{s}', size);
  g.font = f;
  const w = Math.ceil(g.measureText(text).width) + pad * 2;
  c.width = w;
  c.height = size + pad * 2;
  g.font = f;
  if (bg) {
    g.fillStyle = bg;
    g.fillRect(0, 0, c.width, c.height);
  }
  g.fillStyle = color;
  g.textBaseline = 'middle';
  g.fillText(text, pad, c.height / 2);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, toneMapped: false }));
  s.scale.set(c.width / c.height, 1, 1);
  return s;
}

// textSprite ile aynı, ama tek bir canvas/doku üzerinde metni değiştirebilir (.setText).
// Aynı anda tek bir metin gösterecek çok sayıda etiket için (hover baloncuğu, dünya adı vb.)
// her biri için ayrı doku açmak yerine TEK dokuyu paylaşıp yeniden çizer — doku belleğini azaltır.
export function dynamicTextSprite(text, { size = 64, color = '#ffffff', font = '500 {s}px JetBrains Mono, monospace', pad = 18, bg = null, maxChars = 24, scale = 1 } = {}) {
  const c = document.createElement('canvas');
  const g = c.getContext('2d');
  const f = font.replace('{s}', size);
  c.width = Math.ceil(size * 0.62) * maxChars + pad * 2;
  c.height = size + pad * 2;
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, toneMapped: false }));
  // doku tuvalin tamamı (maxChars için ayrılmış) — sadece çizilen kısmı UV repeat ile gösterip geri kalanını kırpıyoruz
  function draw(txt) {
    g.clearRect(0, 0, c.width, c.height);
    g.font = f;
    const tw = Math.min(c.width - pad * 2, Math.ceil(g.measureText(txt).width));
    const boxW = tw + pad * 2;
    if (bg) {
      g.fillStyle = bg;
      g.fillRect(0, 0, boxW, c.height);
    }
    g.fillStyle = color;
    g.textBaseline = 'middle';
    g.fillText(txt, pad, c.height / 2);
    t.needsUpdate = true;
    t.repeat.set(boxW / c.width, 1);
    t.offset.set(0, 0);
    s.scale.set((boxW / c.height) * scale, scale, 1);
  }
  s.userData.setText = (txt) => draw(txt);
  draw(text);
  return s;
}
