// Hafif sentez tabanlı ses sistemi — harici dosya yok, tamamı WebAudio ile anlık üretiliyor.
// Varsayılan kapalı başlar; kullanıcı açana kadar hiçbir ses çalmaz.
let ctx = null;
let enabled = false;
let ambienceNode = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function isSoundEnabled() {
  return enabled;
}

export function setSoundEnabled(on) {
  enabled = on;
  try {
    localStorage.setItem('elsa-sound', on ? '1' : '0');
  } catch {}
  if (!on) stopAmbience();
}

export function initSound() {
  try {
    enabled = localStorage.getItem('elsa-sound') === '1';
  } catch {}
  return enabled;
}

function env(g, t0, attack, hold, release, peak) {
  g.gain.cancelScheduledValues(t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(peak, t0 + attack);
  g.gain.setValueAtTime(peak, t0 + attack + hold);
  g.gain.linearRampToValueAtTime(0, t0 + attack + hold + release);
}

// jeton: iki kısa, yüksek perdeli "tink" tonu
export function playCoin() {
  if (!enabled) return;
  const c = getCtx();
  const t0 = c.currentTime;
  [1760, 2350].forEach((f, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'triangle';
    o.frequency.value = f;
    o.connect(g).connect(c.destination);
    env(g, t0 + i * 0.045, 0.004, 0.02, 0.12, 0.09);
    o.start(t0 + i * 0.045);
    o.stop(t0 + i * 0.045 + 0.2);
  });
}

// kapı: alçalan kısa "whoosh" — dünya geçişlerinde
export function playDoor() {
  if (!enabled) return;
  const c = getCtx();
  const t0 = c.currentTime;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(220, t0);
  o.frequency.exponentialRampToValueAtTime(70, t0 + 0.35);
  o.connect(g).connect(c.destination);
  env(g, t0, 0.01, 0.05, 0.3, 0.12);
  o.start(t0);
  o.stop(t0 + 0.4);
}

// tık: hafif "pop"
export function playClick() {
  if (!enabled) return;
  const c = getCtx();
  const t0 = c.currentTime;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(520, t0);
  o.frequency.exponentialRampToValueAtTime(260, t0 + 0.08);
  o.connect(g).connect(c.destination);
  env(g, t0, 0.002, 0.01, 0.1, 0.07);
  o.start(t0);
  o.stop(t0 + 0.14);
}

// atölye ortam sesi: filtrelenmiş pembe gürültü döngüsü, çok alçak seviyede
export function startAmbience() {
  if (!enabled || ambienceNode) return;
  const c = getCtx();
  const len = c.sampleRate * 2;
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    last = (last + 0.02 * w) / 1.02;
    d[i] = last * 3.5;
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const filt = c.createBiquadFilter();
  filt.type = 'bandpass';
  filt.frequency.value = 450;
  filt.Q.value = 0.6;
  const g = c.createGain();
  g.gain.value = 0;
  src.connect(filt).connect(g).connect(c.destination);
  src.start();
  g.gain.linearRampToValueAtTime(0.05, c.currentTime + 1.2);
  ambienceNode = { src, g };
}

export function stopAmbience() {
  if (!ambienceNode) return;
  const c = getCtx();
  const { src, g } = ambienceNode;
  g.gain.linearRampToValueAtTime(0, c.currentTime + 0.5);
  setTimeout(() => src.stop(), 600);
  ambienceNode = null;
}
