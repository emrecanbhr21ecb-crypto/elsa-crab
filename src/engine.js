import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { disposeScene, damp } from './lib.js';

// Tek renderer, tek canvas: sayfalar arasında yalnız sahne değişir.
// WebGL yoksa WebGLRenderer hata fırlatır; main.js bunu yakalayıp 3D'siz moda geçer.
export function createEngine(canvas, { reducedMotion = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(new THREE.Scene(), new THREE.PerspectiveCamera());
  const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.55, 0.5, 0.82);
  composer.addPass(renderPass);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  // son katman: scroll hızına bağlı renk kayması + vinyet + film greni
  const finish = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, amount: { value: 0 }, time: { value: 0 }, vignette: { value: 0.32 }, grain: { value: 0.045 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `uniform sampler2D tDiffuse; uniform float amount; uniform float time; uniform float vignette; uniform float grain; varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
      void main(){
        vec2 d = (vUv - 0.5);
        vec2 off = d * amount * 0.035;
        vec3 c = vec3(texture2D(tDiffuse, vUv + off).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - off).b);
        c *= 1.0 - vignette * smoothstep(0.25, 0.85, length(d) * 1.25);
        c += (hash(vUv * 1000.0 + time) - 0.5) * grain;
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
  composer.addPass(finish);

  const state = {
    p: 0, // 0..1 sayfa ilerlemesi (yumuşatılmış)
    sp: 0, // kesirli bölüm indeksi (yumuşatılmış)
    target: { p: 0, sp: 0 },
    mouse: new THREE.Vector2(),
    mouseS: new THREE.Vector2(),
    mobile: innerWidth < 820,
    velocity: 0,
    reducedMotion,
  };
  // "hareketi azalt": film greni titremesi ve RGB vuruşu kapalı, ortam hareketi yavaş
  if (reducedMotion) finish.uniforms.grain.value = 0;
  const timeScale = reducedMotion ? 0.2 : 1;
  let current = null;
  let fade = 1; // sahne geçişinde siyahtan açılma

  function resize() {
    const w = innerWidth,
      h = innerHeight;
    state.mobile = w < 820;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    bloom.resolution.set(w, h);
    if (current) {
      current.camera.aspect = w / h;
      // mobilde metin ekranın alt yarısında durur: 3D görüntüyü yukarı kaydır ki nesneler metnin altına düşmesin
      const shift = state.mobile ? current.mobileShift ?? 0.12 : 0;
      if (shift) current.camera.setViewOffset(w, h, 0, h * shift, w, h);
      else current.camera.clearViewOffset();
      current.camera.updateProjectionMatrix();
      current.resize?.(w, h, state);
    }
  }
  addEventListener('resize', resize);
  addEventListener('pointermove', (e) => {
    state.mouse.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  });

  function setScene(s) {
    if (current) {
      current.dispose?.();
      disposeScene(current.scene);
    }
    current = s;
    s.scene.environment = s.scene.environment ?? envMap;
    renderPass.scene = s.scene;
    renderPass.camera = s.camera;
    const b = s.bloom ?? {};
    bloom.strength = b.strength ?? 0.55;
    bloom.radius = b.radius ?? 0.5;
    bloom.threshold = b.threshold ?? 0.82;
    state.p = state.target.p;
    state.sp = state.target.sp;
    fade = 0;
    resize();
  }

  const clock = new THREE.Clock();
  let running = true;
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) clock.getDelta();
  });

  function loop() {
    requestAnimationFrame(loop);
    if (!running || !current) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime * timeScale;
    state.p = damp(state.p, state.target.p, 6, dt);
    state.sp = damp(state.sp, state.target.sp, 6, dt);
    state.mouseS.x = damp(state.mouseS.x, state.mouse.x, 3, dt);
    state.mouseS.y = damp(state.mouseS.y, state.mouse.y, 3, dt);
    fade = Math.min(1, fade + dt * 1.4);
    renderer.toneMappingExposure = (current.exposure ?? 1.05) * fade;
    finish.uniforms.time.value = t % 100;
    // RGB kayması artık scroll hızına bağlı sürekli bir efekt değil — yalnızca bölüm geçişinde ~0.3sn'lik bir vuruş
    state.pulse = reducedMotion ? 0 : (state.pulse ?? 0) * Math.exp(-dt * 11);
    finish.uniforms.amount.value = state.pulse;
    current.update(t, dt, state);
    state.velocity *= Math.exp(-dt * 6);
    composer.render();
  }
  loop();

  return { renderer, state, setScene, get current() { return current; } };
}
