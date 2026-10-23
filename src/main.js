import './style.css';
import Lenis from 'lenis';
import { createEngine } from './engine.js';
import { ui, home, products, websites, studio, journey } from './content.js';
import { preload } from './lib.js';
import { initSound, isSoundEnabled, setSoundEnabled, playClick } from './audio.js';

const scenes = {
  home: () => import('./scenes/home.js'),
  sores: () => import('./scenes/sores.js'),
  'kum-tuvali': () => import('./scenes/sand.js'),
  'renk-simyacisi': () => import('./scenes/alchemy.js'),
  'sincere-salah': () => import('./scenes/salah.js'),
  bazaltgo: () => import('./scenes/bazalt.js'),
  'deprem-mesh': () => import('./scenes/mesh.js'),
  fitkoc: () => import('./scenes/fitkoc.js'),
  ehrenweg: () => import('./scenes/ehrenweg.js'),
  greenact: () => import('./scenes/greenact.js'),
  web: () => import('./scenes/web.js'),
  journey: () => import('./scenes/journey.js'),
};

// ---------- dil ----------
let lang = (() => {
  try {
    const s = localStorage.getItem('elsa-lang');
    if (s) return s;
  } catch {}
  return (navigator.language || 'en').toLowerCase().startsWith('tr') ? 'tr' : 'en';
})();
const T = (o) => (o == null ? '' : typeof o === 'string' || typeof o === 'number' ? String(o) : o[lang] ?? o.en);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const pname = (p) => (lang === 'tr' && p.name_tr ? p.name_tr : p.name);
const pad = (n) => String(n).padStart(2, '0');
const fmt = (n) => new Intl.NumberFormat(lang === 'tr' ? 'tr-TR' : 'en-US').format(n);

// Başlıkları harf harf (kelime bütünlüğü korunarak) böl
function split(text, cls = 'split') {
  let i = 0;
  const lines = String(text).split('\n');
  return `<span class="${cls}" aria-label="${esc(text.replace(/\n/g, ' '))}">${lines
    .map(
      (line) =>
        `<span class="ln">${line
          .split(' ')
          .map((w) => `<span class="w" aria-hidden="true">${[...w].map((c) => `<span class="ch" style="--i:${i++}">${esc(c)}</span>`).join('')}</span>`)
          .join(' ')}</span>`,
    )
    .join('')}</span>`;
}

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// WebGL açılamazsa (eski cihaz, kapalı donanım hızlandırma) site 3D'siz ama eksiksiz açılır
function createFallbackEngine() {
  document.body.classList.add('no-webgl');
  return { renderer: null, state: { p: 0, sp: 0, target: { p: 0, sp: 0 }, velocity: 0, pulse: 0 }, setScene() {}, current: null };
}
let engine;
try {
  engine = createEngine(document.getElementById('stage'), { reducedMotion });
} catch (err) {
  console.warn('WebGL kullanılamıyor, 3D sahneler kapalı:', err);
  engine = createFallbackEngine();
}
const pageEl = document.getElementById('page');
const curtain = document.getElementById('curtain');
const hud = document.getElementById('hud');

// ---------- yumuşak kaydırma ----------
// "hareketi azalt" açıksa tarayıcının kendi kaydırması kullanılır
const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: !reducedMotion });
let velocity = 0;
function raf(t) {
  lenis.raf(t);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
lenis.on('scroll', (e) => {
  velocity = e.velocity;
  onScroll();
});

// ---------- şablonlar ----------
function marquee(text) {
  const t = esc(T(text));
  return `<div class="marquee" aria-hidden="true"><div class="mq-track"><span>${t}</span><span>${t}</span><span>${t}</span><span>${t}</span></div></div>`;
}

function homeHTML() {
  const a = home.about;
  return `
  <section class="sec hero" data-sec data-label="${esc(T(ui.nav_home))}">
    <p class="eyebrow">${T(home.eyebrow)}</p>
    <h1 class="display">${split(T(home.title))}</h1>
    <p class="lead">${T(home.lead)}</p>
    <div class="scroll-cue"><span></span>${T(ui.scroll)}</div>
  </section>
  ${marquee({ en: 'Games · Apps · Websites · Built AI-native ·', tr: 'Oyun · Uygulama · Web sitesi · Yapay zekâ ile ·' })}
  <section class="sec about" data-sec data-label="${esc(T(a.label))}">
    <div class="about-in">
      <p class="kicker reveal">${T(a.label)}</p>
      <h2 class="big reveal">${split(T(a.h), 'split words')}</h2>
      <div class="about-cols">
        ${a.p.map((p) => `<p class="reveal">${T(p)}</p>`).join('')}
      </div>
      <article class="founder reveal">
        <div class="f-mark" aria-hidden="true">${studio.founder.split(' ').map((w) => w[0]).join('')}</div>
        <div class="f-body">
          <p class="kicker">${T(a.founder.label)}</p>
          <h3>${esc(studio.founder)}</h3>
          <p class="f-role">${T(a.founder.role)}</p>
          ${a.founder.p.map((p) => `<p>${T(p)}</p>`).join('')}
          <p class="f-teaser">${T(journey.teaser)}</p>
          <div class="f-links"><a class="btn ghost magnetic" href="#/${journey.slug}">${T(journey.teaser_link)} →</a><a class="f-mail" href="mailto:${studio.email}">${studio.email}</a></div>
        </div>
      </article>
      <div class="values">
        ${a.values.map((v, i) => `<div class="value reveal" style="--d:${i}"><span class="vn">${pad(i + 1)}</span><h3>${T(v.h)}</h3><p>${T(v.p)}</p></div>`).join('')}
      </div>
    </div>
  </section>
  <section class="sec process" data-sec data-label="${esc(T(a.process.label))}">
    <p class="kicker reveal">${T(a.process.label)}</p>
    <ol class="steps">
      ${a.process.steps.map((s, i) => `<li class="step reveal" style="--d:${i}"><span class="sn">${pad(i + 1)}</span><h3>${T(s.h)}</h3><p>${T(s.p)}</p></li>`).join('')}
    </ol>
  </section>
  <section class="sec stats" data-sec data-label="${esc(T(ui.in_numbers))}">
    <div class="stat-grid reveal">
      ${home.stats.map((s) => `<div class="stat"><b data-count="${s.n}" data-plus="${s.plus ? 1 : 0}">0</b><span>${T(s.l)}</span></div>`).join('')}
    </div>
  </section>
  <section class="sec products" id="products" data-sec data-label="${esc(T(home.products_h))}">
    <h2 class="sec-title reveal">${T(home.products_h)}</h2>
    <div class="cards">
      ${products.map((p) => card(p, `#/${p.slug}`)).join('')}
    </div>
  </section>
  <section class="sec websites" id="websites" data-sec data-label="${esc(T(home.web_h))}">
    <h2 class="sec-title reveal">${T(home.web_h)}</h2>
    <p class="lead reveal" style="margin:-24px 0 40px">${T(home.web_p)}</p>
    <div class="web-cards">
      ${websites
        .map(
          (w) => `
        <a class="web-card reveal" href="#/web/${w.slug}" style="--ac:${w.accent};--bg:${w.bg}">
          <div class="browser"><i></i><i></i><i></i><span>${esc(w.url ? w.url.replace(/^https?:\/\//, '').replace(/\/$/, '') : w.name.toLowerCase().replace(/\s/g, '') + '.com')}</span></div>
          <div class="web-shot" style="background-image:url(${w.cover})"></div>
          <div class="card-body">
            <span class="chip">${T(w.client)}</span>
            <h3>${esc(w.name)}</h3>
            <p>${T(w.tagline)}</p>
            <span class="go">${T(ui.explore)} →</span>
          </div>
        </a>`,
        )
        .join('')}
    </div>
  </section>
  <section class="sec contact center" data-sec data-label="${esc(T(home.contact_h))}">
    <h2 class="display sm">${split(T(home.contact_h))}</h2>
    <p class="lead reveal">${T(home.contact_p)}</p>
    <a class="btn magnetic reveal" href="mailto:${studio.email}">${studio.email}</a>
    <footer>© ${new Date().getFullYear()} ${studio.name} Studio · ${esc(studio.founder)}</footer>
  </section>`;
}

function card(p, href) {
  return `
    <a class="card${p.dev ? ' soon' : ''} reveal" href="${href}" style="--ac:${p.accent};--bg:${p.bg}">
      <div class="card-img" style="background-image:url(${p.cover})"><span class="code">${p.code}</span></div>
      <div class="card-body">
        <div class="chip-row"><span class="chip">${T(ui[p.kind])}</span>${p.dev ? `<span class="chip chip-dev">${T(ui.in_dev)}</span>` : ''}</div>
        <h3>${esc(pname(p))}</h3>
        <p>${T(p.tagline)}</p>
        ${p.dev ? `<p class="soon-phase">${T(p.dev.phase)}</p>` : ''}
        <span class="go">${T(ui.explore)} →</span>
      </div>
    </a>`;
}

function productHTML(p) {
  const list = p.kind === 'web' ? websites : products;
  const idx = list.indexOf(p);
  const next = list[(idx + 1) % list.length];
  const nextHref = p.kind === 'web' ? `#/web/${next.slug}` : `#/${next.slug}`;
  const shots = p.shots ?? [];
  const N = p.sections.length;
  return `
  <section class="sec hero p-hero" data-sec data-label="${esc(pname(p))}">
    <div class="p-cover" style="background-image:url(${p.cover})" aria-hidden="true"></div>
    <div class="p-hero-in">
      <div class="p-meta"><img class="p-icon" src="${p.icon}" alt="" /><span class="eyebrow">${p.code} · ${T(ui[p.kind])}${p.client ? ' · ' + esc(T(p.client)) : ''}</span></div>
      <h1 class="display mega">${split(pname(p))}</h1>
      <p class="lead">${T(p.tagline)}</p>
      ${
        p.dev
          ? `<div class="dev-banner reveal"><span class="chip chip-dev">${T(ui.in_dev)}</span><strong>${T(p.dev.phase)}</strong><p>${T(p.dev.note)}</p></div>`
          : ''
      }
      <div class="chips">${p.tech.map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</div>
      ${p.url ? `<a class="btn ghost magnetic" href="${p.url}" target="_blank" rel="noopener">${T(ui.visit)} ↗</a>` : ''}
    </div>
    <div class="scroll-cue"><span></span>${T(ui.scroll)}</div>
  </section>
  ${marquee(p.marquee)}
  ${p.sections
    .map(
      (s, i) => `
  <section class="sec chapter ${i % 2 ? 'right' : 'left'}" data-sec data-label="${esc(T(s.label))}">
    <div class="sticky">
      <div class="panel">
        <p class="kicker">${T(ui.chapter)} ${pad(i + 1)} <i>//</i> ${esc(T(s.label))}</p>
        <h2>${split(T(s.h), 'split words')}</h2>
        <p class="body">${T(s.p)}</p>
        ${
          s.points
            ? `<div class="points">${s.points.map(([v, l]) => `<div><b>${esc(v)}</b><span>${esc(T(l))}</span></div>`).join('')}</div>`
            : ''
        }
      </div>
    </div>
  </section>`,
    )
    .join('')}
  <section class="sec stats" data-sec data-label="${esc(T(ui.in_numbers))}">
    <p class="kicker reveal">${T(ui.in_numbers)}</p>
    <div class="stat-grid three reveal">
      ${p.facts.map((s) => `<div class="stat"><b data-count="${s.n}">0</b><span>${T(s.l)}</span></div>`).join('')}
    </div>
  </section>
  <section class="sec specs" data-sec data-label="${esc(T(ui.under_hood))}">
    <div class="specs-in">
      <p class="kicker reveal">${T(ui.under_hood)}</p>
      <dl class="spec-list">
        ${p.specs.map((s, i) => `<div class="spec reveal" style="--d:${i}"><dt>${esc(T(s.k))}</dt><dd>${esc(T(s.v))}</dd></div>`).join('')}
      </dl>
      <div class="chips">${p.tech.map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</div>
    </div>
  </section>
  ${
    shots.length
      ? `<section class="sec hgallery ${p.kind === 'web' ? 'is-web' : ''}" data-sec data-label="${esc(T(ui.gallery))}" style="--n:${shots.length}">
    <div class="sticky">
      <div class="hg-head">
        <h2 class="sec-title">${T(ui.gallery)}</h2>
        <p class="note">${T(p.kind === 'web' ? ui.gallery_web : ui.gallery_note)}</p>
      </div>
      <div class="hg-track">${shots
        .map((s, i) => `<figure class="shot"><img src="${s}" loading="lazy" alt="" /><figcaption>${pad(i + 1)} / ${pad(shots.length)}</figcaption></figure>`)
        .join('')}</div>
    </div>
  </section>`
      : ''
  }
  ${
    p.vision
      ? `<section class="sec vision">
    <p class="kicker reveal">${T(p.vision.label)}</p>
    <h2 class="sec-title reveal">${T(p.vision.label)}</h2>
    <p class="lead reveal" style="margin:-24px 0 40px">${T(p.vision.note)}</p>
    <div class="vision-grid">${p.vision.shots
      .map(
        (s) => `
      <figure class="vision-card tilt reveal">
        <div class="browser"><i></i><i></i><i></i><span>next.${p.slug}.studio</span></div>
        <div class="vision-shot" style="background-image:url(${s})"></div>
      </figure>`,
      )
      .join('')}</div>
  </section>`
      : ''
  }
  ${
    p.futureApp
      ? `<section class="sec future">
    <p class="kicker reveal">${T(p.futureApp.label)}</p>
    <h2 class="sec-title reveal">${T(p.futureApp.label)}</h2>
    <p class="lead reveal" style="margin:-24px 0 40px">${T(p.futureApp.note)}</p>
    <div class="future-grid">${p.futureApp.cards
      .map(
        (c) => `
      <figure class="future-card tilt reveal">
        <span class="future-tag">${esc(T(ui.concept))}</span>
        <div class="phone-mock">
          <div class="pm-notch"></div>
          <div class="pm-screen">
            ${
              c.type === 'streak'
                ? `<div class="pm-streak"><b>${c.streak}</b><small>${T(c.streakLabel)}</small></div>
                   <p class="pm-verse">${T(c.verse)}</p>
                   ${c.ref ? `<span class="pm-ref">${esc(c.ref)}</span>` : ''}`
                : `<span class="pm-shield"></span>
                   <p class="pm-verse">${T(c.verse)}</p>`
            }
          </div>
        </div>
        <figcaption>${T(c.title)}</figcaption>
      </figure>`,
      )
      .join('')}</div>
  </section>`
      : ''
  }
  <section class="sec next center" data-sec data-label="${esc(T(ui.next))}">
    <a class="next-link" href="${nextHref}" style="--ac:${next.accent}">
      <span>${T(ui.next)} · ${next.code}</span>
      <b>${split(pname(next))}</b>
      <img src="${next.cover}" alt="" class="next-peek" />
    </a>
    <a class="back" href="#/">← ${T(ui.back)}</a>
  </section>`;
}

function journeyHTML() {
  const J = journey;
  return `
  <section class="sec hero p-hero j-hero" data-sec data-label="${esc(T(J.nav))}">
    <div class="p-hero-in">
      <p class="eyebrow">${T(J.eyebrow)}</p>
      <h1 class="display">${split(T(J.title))}</h1>
      <p class="lead">${T(J.lead)}</p>
    </div>
    <div class="scroll-cue"><span></span>${T(ui.scroll)}</div>
  </section>
  ${marquee(J.marquee)}
  ${J.chapters
    .map(
      (c, i) => `
  <section class="sec chapter j-ch ${i % 2 ? 'right' : 'left'}" data-sec data-label="${esc(T(c.label))}">
    <div class="sticky">
      <div class="panel">
        <p class="kicker">${pad(i + 1)} <i>//</i> ${esc(T(c.label))}</p>
        <h2>${split(T(c.h), 'split words')}</h2>
        ${c.p.map((x) => `<p class="body">${T(x)}</p>`).join('')}
        ${c.points ? `<div class="points">${c.points.map(([v, l]) => `<div><b>${esc(T(v))}</b><span>${esc(T(l))}</span></div>`).join('')}</div>` : ''}
      </div>
    </div>
  </section>`,
    )
    .join('')}
  <section class="sec contact center j-end" data-sec data-label="${esc(T({ en: 'Orbit', tr: 'Yörünge' }))}">
    <h2 class="display sm">${split(T(J.end), 'split words')}</h2>
    <a class="btn magnetic reveal" href="mailto:${studio.email}">${studio.email}</a>
    <a class="back" href="#/">← ${T(ui.back)}</a>
  </section>`;
}

function navHTML(active) {
  document.getElementById('nav-list').innerHTML =
    `<a href="#/" class="${active === 'home' ? 'on' : ''}">${T(ui.nav_home)}</a>` +
    `<a href="#/${journey.slug}" class="${active === journey.slug ? 'on' : ''}" style="--ac:${journey.accent}">${T(journey.nav)}</a>` +
    products.map((p) => `<a href="#/${p.slug}" class="${active === p.slug ? 'on' : ''}" style="--ac:${p.accent}">${esc(pname(p))}</a>`).join('') +
    `<span class="nav-sep">${T(ui.nav_web)}</span>` +
    websites.map((w) => `<a href="#/web/${w.slug}" class="${active === 'web/' + w.slug ? 'on' : ''}" style="--ac:${w.accent}">${esc(w.name)}</a>`).join('');
  document.getElementById('lang').textContent = lang === 'tr' ? 'EN' : 'TR';
}

function hudHTML(p) {
  hud.innerHTML = `
    <i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>
    <div class="rail">${p ? `${p.code} · ${esc(pname(p))}` : document.body.dataset.kind === 'journey' ? `${journey.code} · ${esc(studio.founder)}` : `ELSA · ${T(home.eyebrow)}`}</div>
    <div class="readout" id="readout"></div>
    <div class="counter"><span id="c-num">01</span><span class="c-of">/ <span id="c-tot">01</span></span><span id="c-lab"></span><span class="c-bar"><i id="c-prog"></i></span></div>`;
}

// ---------- kaydırma → sahne durumu ----------
let secEls = [];
let hgEl = null;
function measure() {
  secEls = [...pageEl.querySelectorAll('[data-sec]')].map((el) => ({ el, top: el.offsetTop, h: el.offsetHeight }));
  hgEl = pageEl.querySelector('.hgallery');
  const tot = document.getElementById('c-tot');
  if (tot) tot.textContent = pad(secEls.length);
}
let lastSec = -1;
function onScroll() {
  const y = lenis.animatedScroll ?? scrollY;
  const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  engine.state.target.p = y / max;
  const mid = y + innerHeight / 2;
  let sp = 0;
  for (let i = 0; i < secEls.length; i++) {
    const c = secEls[i].top + secEls[i].h / 2;
    const n = secEls[i + 1];
    if (!n) { sp = i; break; }
    const cn = n.top + n.h / 2;
    if (mid <= c) { sp = i; break; }
    if (mid < cn) { sp = i + (mid - c) / (cn - c); break; }
  }
  engine.state.target.sp = sp;
  engine.state.velocity = velocity;
  document.body.classList.toggle('scrolled', y > 40);

  // HUD sayaç ve ilerleme
  const si = Math.round(sp);
  if (si !== lastSec && secEls[si]) {
    lastSec = si;
    engine.state.pulse = 1; // bölüm değişiminde kısa bir RGB kayması vuruşu
    const n = document.getElementById('c-num');
    const l = document.getElementById('c-lab');
    if (n) n.textContent = pad(si + 1);
    if (l) l.textContent = secEls[si].el.dataset.label || '';
    secEls.forEach((s, i) => s.el.classList.toggle('active', i === si));
  }
  const pr = document.getElementById('c-prog');
  if (pr) pr.style.transform = `scaleX(${engine.state.target.p})`;

  // yatay galeri: dikey kaydırma → yatay hareket
  if (hgEl) {
    const r = hgEl.offsetTop;
    const local = Math.min(1, Math.max(0, (y - r) / Math.max(1, hgEl.offsetHeight - innerHeight)));
    const track = hgEl.querySelector('.hg-track');
    const dist = Math.max(0, track.scrollWidth - innerWidth + 64);
    track.style.transform = `translate3d(${-local * dist}px,0,0)`;
    const cx = innerWidth / 2;
    track.querySelectorAll('.shot').forEach((f) => {
      const b = f.getBoundingClientRect();
      const d = (b.left + b.width / 2 - cx) / innerWidth;
      f.style.transform = `perspective(1200px) rotateY(${d * -28}deg) translateZ(${-Math.abs(d) * 160}px)`;
    });
  }
  // şerit: kaydırma hızına göre eğim
  document.documentElement.style.setProperty('--vel', Math.max(-1, Math.min(1, velocity / 40)).toFixed(3));
}
addEventListener('resize', () => {
  measure();
  onScroll();
});
// fontlar geç yüklenip metin yeniden dizilince bölüm konumları değişir — eski ölçümle sahne
// kaydırmanın gerisinde kalıyordu; sayfa yüksekliği her değiştiğinde yeniden ölç
new ResizeObserver(() => {
  measure();
  onScroll();
}).observe(pageEl);

// ---------- görünür olunca açığa çıkar + sayaç ----------
const io = new IntersectionObserver(
  (es) =>
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      e.target.querySelectorAll?.('[data-count]').forEach(countUp);
      if (e.target.dataset?.count) countUp(e.target);
    }),
  { threshold: 0.15 },
);
function countUp(el) {
  if (el.dataset.done) return;
  el.dataset.done = 1;
  const to = +el.dataset.count;
  const plus = el.dataset.plus === '1' ? '+' : '';
  const t0 = performance.now();
  const dur = 1400;
  const step = (t) => {
    const k = Math.min(1, (t - t0) / dur);
    const e = 1 - Math.pow(1 - k, 4);
    el.textContent = fmt(Math.round(to * e)) + (k === 1 ? plus : '');
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ---------- HUD canlı veri ----------
setInterval(() => {
  const r = document.getElementById('readout');
  const sc = engine.current;
  if (!r || !sc?.hud) return;
  const rows = sc.hud(engine.state, lang) || [];
  r.innerHTML = rows.map(([k, v]) => `<div><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('');
}, 120);

// ---------- yönlendirme ----------
let routeId = 0;
let currentKey = null;
let currentLang = lang;
let firstLoad = true;
function resolve() {
  const slug = location.hash.replace(/^#\/?/, '').split('?')[0];
  if (slug === journey.slug) return { key: journey.slug, scene: 'journey', page: null, isJourney: true };
  if (slug.startsWith('web/')) {
    const w = websites.find((x) => x.slug === slug.slice(4));
    if (w) return { key: 'web/' + w.slug, scene: 'web', page: w };
  }
  const p = products.find((x) => x.slug === slug);
  if (p) return { key: p.slug, scene: p.slug, page: p };
  return { key: 'home', scene: 'home', page: null };
}

async function route(force = false) {
  const { key, scene, page: p, isJourney } = resolve();
  if (key === currentKey && lang === currentLang && !force) return;
  const my = ++routeId;
  const sameScene = key === currentKey;
  // dil değişince sayfa aynı kalır ama 3D sahne yeniden kurulmalı —
  // yoksa dokulara gömülü metinler (ağaç etiketleri vb.) eski dilde takılı kalır
  const sceneStale = !sameScene || lang !== currentLang;
  if (!sameScene && !firstLoad) curtain.classList.add('on');
  document.body.classList.remove('menu-open');
  await new Promise((r) => setTimeout(r, sameScene || firstLoad ? 0 : 520));
  const mod = sceneStale && engine.renderer ? await scenes[scene]().catch((err) => (console.error(err), null)) : null;
  if (my !== routeId) return;

  const accent = p ? p.accent : isJourney ? journey.accent : '#9aa7ff';
  document.documentElement.style.setProperty('--accent', accent);
  document.documentElement.style.setProperty('--bg', p ? p.bg : isJourney ? journey.bg : '#05060c');
  document.title = p ? `${pname(p)} — ${studio.name}` : isJourney ? `${T(journey.nav)} · ${studio.founder} — ${studio.name}` : `${studio.name} — ${T(home.eyebrow)}`;
  // sayfaya özel açıklama: JS çalıştıran tarayıcı/arama motorları her ürünü kendi metniyle görsün
  document.querySelector('meta[name="description"]')?.setAttribute('content', p ? T(p.tagline) : isJourney ? T(journey.lead) : T(home.lead));
  document.documentElement.lang = lang;
  document.body.dataset.page = key;
  document.body.dataset.kind = p ? p.kind : isJourney ? 'journey' : 'home';
  document.body.dataset.tone = p?.tone || 'dark';
  pageEl.innerHTML = p ? productHTML(p) : isJourney ? journeyHTML() : homeHTML();
  navHTML(key);
  hudHTML(p);
  lastSec = -1;
  if (!sameScene) lenis.scrollTo(0, { immediate: true, force: true });
  measure();
  onScroll();
  pageEl.querySelectorAll('.reveal, .panel, .hero, .contact, [data-count]').forEach((el) => io.observe(el));
  bindMagnetic();
  bindTilt();

  if (sceneStale) {
    const assets = p ? [...(p.shots ?? []), p.icon] : isJourney ? [] : products.map((x) => x.icon);
    await Promise.race([preload(assets, firstLoad ? setLoad : null), new Promise((r) => setTimeout(r, firstLoad ? 6000 : 2500))]);
    if (mod) {
      try {
        const built = mod.build({ renderer: engine.renderer, product: p, products, websites, journey, state: engine.state, lang, navigate: (s) => (location.hash = `#/${s}`) });
        engine.setScene(built);
      } catch (err) {
        // sahne kurulamazsa sayfa yine de açılsın
        console.error(err);
      }
    }
    currentKey = key;
    currentLang = lang;
    measure();
    onScroll();
    if (firstLoad) {
      firstLoad = false;
      setLoad(1);
      setTimeout(() => document.body.classList.add('loaded'), 350);
    }
    requestAnimationFrame(() => curtain.classList.remove('on'));
  }
}
addEventListener('hashchange', () => route());

// ---------- açılış yükleyicisi ----------
const loadNum = document.getElementById('load-num');
const loadBar = document.getElementById('load-bar');
let shown = 0;
function setLoad(k) {
  const target = Math.round(k * 100);
  const tick = () => {
    if (shown >= target) return;
    shown = Math.min(target, shown + Math.max(1, Math.ceil((target - shown) / 6)));
    loadNum.textContent = String(shown).padStart(3, '0');
    loadBar.style.transform = `scaleX(${shown / 100})`;
    requestAnimationFrame(tick);
  };
  tick();
}

// ---------- imleç ve mıknatıslı düğmeler ----------
const fine = matchMedia('(pointer: fine)').matches;
if (fine) {
  const dot = document.getElementById('cursor');
  let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
  addEventListener('pointermove', (e) => {
    tx = e.clientX;
    ty = e.clientY;
    const hot = e.target.closest('a,button,.card,.web-card');
    dot.classList.toggle('hot', !!hot || document.body.style.cursor === 'pointer');
  });
  const loop = () => {
    cx += (tx - cx) * 0.2;
    cy += (ty - cy) * 0.2;
    dot.style.transform = `translate3d(${cx}px,${cy}px,0)`;
    requestAnimationFrame(loop);
  };
  loop();
  document.body.classList.add('fine');
}
function bindMagnetic() {
  if (!fine) return;
  pageEl.querySelectorAll('.magnetic').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const b = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - b.left - b.width / 2) * 0.25}px,${(e.clientY - b.top - b.height / 2) * 0.35}px)`;
    });
    el.addEventListener('pointerleave', () => (el.style.transform = ''));
  });
}
// kartı fareye göre hafifçe 3D eğer (konsept görselleri için)
function bindTilt() {
  if (!fine) return;
  pageEl.querySelectorAll('.tilt').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const b = el.getBoundingClientRect();
      const px = (e.clientX - b.left) / b.width - 0.5;
      const py = (e.clientY - b.top) / b.height - 0.5;
      el.style.transform = `perspective(900px) rotateX(${-py * 14}deg) rotateY(${px * 16}deg) scale3d(1.03,1.03,1.03)`;
    });
    el.addEventListener('pointerleave', () => (el.style.transform = ''));
  });
}

document.getElementById('lang').addEventListener('click', () => {
  lang = lang === 'tr' ? 'en' : 'tr';
  try {
    localStorage.setItem('elsa-lang', lang);
  } catch {}
  const y = scrollY;
  route(true).then(() => lenis.scrollTo(y, { immediate: true, force: true }));
});
document.getElementById('menu').addEventListener('click', () => document.body.classList.toggle('menu-open'));

// ---------- ses aç/kapa ----------
document.body.classList.toggle('sound-on', initSound());
document.getElementById('sound').addEventListener('click', () => {
  const on = !isSoundEnabled();
  setSoundEnabled(on);
  document.body.classList.toggle('sound-on', on);
  if (on) playClick();
});

// 3D sahnedeki tıklanabilir nesneler (ana sayfadaki ürün kartları)
addEventListener('click', (e) => {
  if (e.target.closest('a,button,.panel,.card,.web-card,header')) return;
  engine.current?.click?.(e, engine.state);
});

route();
