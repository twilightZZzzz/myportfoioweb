/*
  Кинематографический слой сайта: плавный скролл, вход с отсчётом, прожектор в hero,
  раскрытие заголовков, сцены на скролле, курсор, магнитные кнопки, шторка переходов.
  При prefers-reduced-motion всё это отключается, а контент остаётся видимым и рабочим.
*/
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);

const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];
const CYR = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯ0123456789';

root.classList.add('motion-ready');

/* ---------------- всегда: сетка-пасхалка, свет за курсором в карточках ---------------- */

const gridBtn = $<HTMLButtonElement>('[data-grid-toggle]');
const toggleGrid = () => gridBtn?.setAttribute('aria-pressed', String(root.classList.toggle('show-grid')));
gridBtn?.addEventListener('click', toggleGrid);
addEventListener('keydown', e => {
  const t = e.target as HTMLElement;
  if (e.metaKey || e.ctrlKey || e.altKey || t.closest('input, textarea, select, [contenteditable]')) return;
  if (['g', 'G', 'п', 'П'].includes(e.key)) toggleGrid();
});

if (fine && !reduce) {
  $$('[data-glow]').forEach(zone => {
    zone.addEventListener('pointermove', e => {
      const r = zone.getBoundingClientRect();
      zone.style.setProperty('--gx', `${e.clientX - r.left}px`);
      zone.style.setProperty('--gy', `${e.clientY - r.top}px`);
    });
  });
}

/* ---------------- появление блоков (CSS-переходы по IntersectionObserver) ---------------- */

const revealEls = $$('[data-reveal]');
if (reduce) revealEls.forEach(el => el.classList.add('is-in'));
else {
  const io = new IntersectionObserver(
    entries =>
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }),
    { rootMargin: '0px 0px -8% 0px' },
  );
  revealEls.forEach(el => io.observe(el));
}

if (!reduce) init();

function init() {
  /* ---------------- плавный скролл ---------------- */
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  addEventListener('scroll-lock', () => lenis.stop());
  addEventListener('scroll-unlock', () => lenis.start());

  document.addEventListener('click', e => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!a || a.getAttribute('href') === '#') return;
    const target = $(a.getAttribute('href')!);
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: -80, duration: 1.4 });
  });

  /* прогресс прокрутки */
  const bar = $('[data-progress]');
  if (bar) lenis.on('scroll', ({ progress }: { progress: number }) => gsap.set(bar, { scaleX: progress }));

  /* шапка прячется при прокрутке вниз и возвращается при прокрутке вверх */
  const header = $('[data-header]');
  if (header) {
    let last = 0;
    lenis.on('scroll', ({ scroll }: { scroll: number }) => {
      const down = scroll > last && scroll > 240;
      header.classList.toggle('is-hidden', down);
      last = scroll;
    });
  }

  setupCursor();
  setupCurtain();
  setupSplits();
  setupScramble();
  setupMarquee(lenis);
  setupManifesto();
  setupFlowScene();
  setupReel();
  setupProcess();
  setupTilt();
  setupFinale();
  setupCredits();
  setupPageHero();

  leader().then(heroIntro);

  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
  addEventListener('load', () => ScrollTrigger.refresh());
}

/* ---------------- вход с отсчётом киноплёнки (главная, первый визит за сессию) ---------------- */

function leader(): Promise<void> {
  const el = $('[data-leader]');
  if (!el || !el.classList.contains('is-on')) return Promise.resolve();
  root.style.overflow = 'hidden';
  dispatchEvent(new Event('scroll-lock'));
  const num = $('[data-leader-num]', el)!;
  const pct = $('[data-leader-pct]', el)!;
  const sweep = $('[data-leader-sweep]', el)!;

  return new Promise(resolve => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      try {
        sessionStorage.setItem('leader-seen', '1');
      } catch {
        /* приватный режим */
      }
      gsap
        .timeline({
          onComplete: () => {
            el.remove();
            root.style.overflow = '';
            dispatchEvent(new Event('scroll-unlock'));
          },
        })
        .to($('[data-leader-ring]', el), { scale: 1.6, opacity: 0, duration: 0.5, ease: 'power3.in' })
        .to($$('[data-leader-fade]', el), { opacity: 0, duration: 0.3 }, 0)
        .to(el, { opacity: 0, duration: 0.45, ease: 'power2.out' }, '-=0.1')
        .add(resolve, '-=0.35');
      // снимаем паузу с CSS-анимаций входа в hero
      root.classList.remove('leader-on');
    };
    const D = 1800;
    const start = performance.now();
    const step = (now: number) => {
      if (done) return;
      const p = Math.min(1, (now - start) / D);
      num.textContent = String(3 - Math.min(2, Math.floor(p * 3)));
      sweep.style.setProperty('--p', `${((p * 3) % 1) * 360}deg`);
      pct.textContent = String(Math.round(p * 100)).padStart(3, '0') + '%';
      if (p < 1) requestAnimationFrame(step);
      else (document.fonts ? document.fonts.ready : Promise.resolve()).then(finish);
    };
    requestAnimationFrame(step);
    $('[data-leader-skip]', el)?.addEventListener('click', finish);
    addEventListener('keydown', e => e.key === 'Escape' && finish(), { once: true });
  });
}

/* ---------------- hero: строки выезжают, прожектор проявляет заголовок ---------------- */

function heroIntro() {
  const hero = $('[data-hero]');
  if (!hero) return;
  const title = $('[data-hero-title]', hero)!;
  const glow = $('[data-hero-glow]', hero);
  const light = { x: innerWidth / 2, y: innerHeight / 2, tx: innerWidth / 2, ty: innerHeight / 2, r: 0 };
  const baseR = () => Math.max(150, Math.min(innerWidth * 0.24, 360));
  const tr0 = title.getBoundingClientRect();
  light.x = light.tx = tr0.left + tr0.width * 0.3;
  light.y = light.ty = tr0.top + tr0.height * 0.5;

  let lastMove = -1e9;
  let visible = true;
  const setTarget = (x: number, y: number) => {
    light.tx = x;
    light.ty = y;
    lastMove = performance.now();
  };
  addEventListener('pointermove', e => e.pointerType === 'mouse' && setTarget(e.clientX, e.clientY), { passive: true });
  hero.addEventListener('touchmove', e => setTarget(e.touches[0]!.clientX, e.touches[0]!.clientY), { passive: true });
  new IntersectionObserver(([en]) => (visible = en!.isIntersecting)).observe(hero);
  addEventListener('resize', () => light.r && (light.r = baseR()));

  gsap.ticker.add(() => {
    if (!visible) return;
    const now = performance.now();
    const tr = title.getBoundingClientRect();
    // если мышь давно не двигалась — свет сам гуляет по заголовку
    if (now - lastMove > 2600) {
      const t = now / 1000;
      light.tx = tr.left + tr.width * (0.5 + 0.4 * Math.sin(t * 0.55));
      light.ty = tr.top + tr.height * (0.5 + 0.34 * Math.sin(t * 0.9 + 1));
    }
    light.x += (light.tx - light.x) * 0.07;
    light.y += (light.ty - light.y) * 0.07;
    title.style.setProperty('--x', `${light.x - tr.left}px`);
    title.style.setProperty('--y', `${light.y - tr.top}px`);
    title.style.setProperty('--r', `${light.r}px`);
    if (glow) {
      const hr = hero.getBoundingClientRect();
      glow.style.transform = `translate(${light.x - hr.left}px, ${light.y - hr.top}px) translate(-50%, -50%)`;
    }
  });

  // строки и подписи выезжают на CSS (см. index.astro), здесь — свет и углы кадра
  gsap
    .timeline({ delay: 0.3 })
    .to(light, { r: baseR(), duration: 1.8, ease: 'power3.out' })
    .from($$('.corner', hero), { opacity: 0, scale: 0.4, duration: 0.8, stagger: 0.05, ease: 'back.out(2)' }, 0.3);

  // при уходе со сцены hero уезжает в глубину
  gsap.to($('[data-hero-inner]', hero), {
    yPercent: -14,
    opacity: 0.25,
    ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
  });

  // таймкод в углу
  const tc = $('[data-timecode]', hero);
  if (tc) {
    const t0 = performance.now();
    const pad = (n: number) => String(n).padStart(2, '0');
    setInterval(() => {
      const f = Math.floor((performance.now() - t0) / (1000 / 24));
      const s = Math.floor(f / 24);
      tc.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(f % 24)}`;
    }, 1000 / 24);
  }
}

/* ---------------- заголовок внутренних страниц ---------------- */

function setupPageHero() {
  const h = $('[data-page-hero]');
  if (!h) return;
  const title = $('[data-split-hero]', h);
  if (!title) return;
  SplitText.create(title, {
    type: 'lines',
    mask: 'lines',
    linesClass: 'split-line',
    autoSplit: true,
    onSplit(self) {
      gsap.set(title, { visibility: 'visible' });
      return gsap.from(self.lines, { yPercent: 115, duration: 1.3, ease: 'expo.out', stagger: 0.08, delay: 0.1 });
    },
  });
  gsap.fromTo($$('[data-hero-fade]', h), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, stagger: 0.08, ease: 'power3.out', delay: 0.35 });
}

/* ---------------- заголовки разделов раскрываются по строкам ---------------- */

function setupSplits() {
  // явно размеченные заголовки и заголовки разделов на внутренних страницах
  $$('[data-split], .section-head > .h2, .section-head > div > .h2, .faq__title, .cta .h2, .empty .h2').forEach(el => {
    if (el.closest('[data-page-hero]')) return;
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'split-line',
      autoSplit: true,
      onSplit(self) {
        gsap.set(el, { visibility: 'visible' });
        return gsap.from(self.lines, {
          yPercent: 110,
          duration: 1.2,
          ease: 'expo.out',
          stagger: 0.09,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      },
    });
  });
}

/* ---------------- моно-подписи «расшифровываются» ---------------- */

function setupScramble() {
  $$('[data-scramble]').forEach(el => {
    const text = el.textContent ?? '';
    ScrollTrigger.create({
      trigger: el,
      start: 'top 92%',
      once: true,
      onEnter: () => gsap.to(el, { duration: 1.1, scrambleText: { text, chars: CYR, speed: 0.6, revealDelay: 0.2 } }),
    });
  });
}

/* ---------------- бегущая строка разгоняется от скорости скролла ---------------- */

function setupMarquee(lenis: Lenis) {
  $$('[data-marquee]').forEach(track => {
    const group = track.firstElementChild as HTMLElement;
    let x = 0;
    let boost = 0;
    let dir = 1;
    lenis.on('scroll', ({ velocity }: { velocity: number }) => {
      if (Math.abs(velocity) > 0.1) dir = velocity > 0 ? 1 : -1;
      boost = Math.min(Math.abs(velocity) * 0.6, 22);
    });
    gsap.ticker.add(() => {
      const w = group.offsetWidth;
      if (!w) return;
      x -= (0.6 + boost) * dir;
      boost *= 0.92;
      if (x <= -w) x += w;
      if (x > 0) x -= w;
      track.style.transform = `translate3d(${x}px,0,0)`;
    });
  });
}

/* ---------------- манифест: слова зажигаются по одному ---------------- */

function setupManifesto() {
  $$('[data-words]').forEach(el => {
    const split = SplitText.create(el, { type: 'words' });
    // 0.4 — тусклое, но читаемое состояние (контраст крупного текста ≥ 3:1)
    gsap.set(split.words, { opacity: 0.4 });
    gsap.to(split.words, {
      opacity: 1,
      stagger: 0.1,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 45%', scrub: true },
    });
  });
}

/* ---------------- сцена «сайт → форма → Telegram → статус» ---------------- */

function setupFlowScene() {
  const scene = $('[data-flow]');
  if (!scene) return;
  const steps = $$('[data-flow-step]', scene);
  const frames = $$('[data-flow-frame]', scene);
  const counter = $('[data-flow-counter]', scene);
  const scan = $('[data-flow-scan]', scene);
  const n = frames.length;

  const setActive = (i: number) => {
    steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
    if (counter) counter.textContent = String(i + 1).padStart(2, '0');
  };

  // мелкие движения внутри кадров
  const details = (frame: HTMLElement) => {
    const tl = gsap.timeline();
    const typing = $$('[data-type]', frame);
    if (typing.length) tl.from(typing, { scaleX: 0, transformOrigin: 'left', duration: 0.5, stagger: 0.25, ease: 'power2.out' });
    const pops = $$('[data-pop]', frame);
    if (pops.length) tl.from(pops, { y: 24, opacity: 0, scale: 0.94, duration: 0.5, stagger: 0.2, ease: 'back.out(1.6)' }, typing.length ? '-=0.1' : 0);
    const press = $('[data-press]', frame);
    if (press) tl.to(press, { scale: 0.94, duration: 0.12, yoyo: true, repeat: 1 });
    return tl;
  };

  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => {
    gsap.set(frames.slice(1), { clipPath: 'inset(0% 100% 0% 0%)' });
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: $('[data-flow-pin]', scene),
        start: 'top top',
        end: `+=${n * 85}%`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        // номер шага меняется вместе с появлением кадра
        onUpdate: () => setActive(Math.min(n - 1, Math.floor(tl.time() + 0.15))),
      },
    });
    // первый кадр «собирается» сразу при входе в сцену
    const first = details(frames[0]!).pause();
    ScrollTrigger.create({ trigger: scene, start: 'top 70%', once: true, onEnter: () => first.play() });
    frames.slice(1).forEach((f, k) => {
      const at = k + 1;
      if (scan) {
        tl.set(scan, { opacity: 1, left: '0%' }, at - 0.05);
        tl.to(scan, { left: '100%', duration: 0.5, ease: 'none' }, at);
        tl.set(scan, { opacity: 0 }, at + 0.5);
      }
      tl.to(f, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'none' }, at);
      tl.add(details(f), at + 0.4);
    });
    tl.to({}, { duration: 0.6 });
    return () => gsap.set(frames, { clearProps: 'clipPath' });
  });
  mm.add('(max-width: 899px)', () => {
    frames.forEach(f => {
      const tl = details(f).pause();
      ScrollTrigger.create({ trigger: f, start: 'top 75%', once: true, onEnter: () => tl.play() });
    });
  });
}

/* ---------------- проекты: горизонтальная плёнка ---------------- */

function setupReel() {
  const pin = $('[data-reel]');
  if (!pin) return;
  const track = $('[data-reel-track]', pin)!;
  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => {
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    if (dist() < 40) return;
    const tween = gsap.to(track, {
      x: () => -dist(),
      ease: 'none',
      scrollTrigger: { trigger: pin, start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 1, invalidateOnRefresh: true },
    });
    $$('[data-reel-media]', track).forEach(m => {
      gsap.fromTo(m, { scale: 1.2 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: m, containerAnimation: tween, start: 'left right', end: 'center center', scrub: true } });
    });
  });
}

/* ---------------- процесс: линия заполняется по мере прокрутки ---------------- */

function setupProcess() {
  $$('[data-process]').forEach(list => {
    const fill = $('[data-process-fill]', list);
    const items = $$('[data-process-step]', list);
    ScrollTrigger.create({
      trigger: list,
      start: 'top 75%',
      end: 'bottom 55%',
      scrub: true,
      onUpdate: self => {
        if (fill) gsap.set(fill, { scaleX: self.progress });
        const k = Math.floor(self.progress * items.length * 0.999);
        items.forEach((it, i) => it.classList.toggle('is-active', i <= k));
      },
    });
  });
}

/* ---------------- лёгкий 3D-наклон карточек ---------------- */

function setupTilt() {
  if (!fine) return;
  $$('[data-tilt]').forEach(card => {
    const rx = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' });
    const ry = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' });
    const y = gsap.quickTo(card, 'y', { duration: 0.6, ease: 'power3.out' });
    gsap.set(card, { transformPerspective: 900 });
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * 6);
      rx(-((e.clientY - r.top) / r.height - 0.5) * 6);
      y(-4);
    });
    card.addEventListener('pointerleave', () => {
      rx(0);
      ry(0);
      y(0);
    });
  });
}

/* ---------------- финальная сцена контакта ---------------- */

function setupFinale() {
  $$('[data-finale]').forEach(sec => {
    const glow = $('[data-finale-glow]', sec);
    if (glow)
      gsap.fromTo(glow, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'top 20%', scrub: true } });
  });
}

/* ---------------- титры ---------------- */

function setupCredits() {
  const c = $('[data-credits]');
  if (!c) return;
  gsap.from($$('[data-credit]', c), {
    y: 50,
    opacity: 0,
    stagger: 0.07,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: { trigger: c, start: 'top 80%', once: true },
  });
}

/* ---------------- курсор и магнитные кнопки ---------------- */

function setupCursor() {
  if (!fine) return;
  const cursor = $('[data-cursor-el]');
  if (!cursor) return;
  root.classList.add('has-cursor');
  const label = $('[data-cursor-label]', cursor)!;
  const ring = $('.cursor__ring', cursor)!;
  const dot = $('.cursor__dot', cursor)!;
  const rx = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3.out' });
  const ry = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3.out' });
  addEventListener(
    'pointermove',
    e => {
      if (e.pointerType !== 'mouse') return;
      gsap.set(dot, { x: e.clientX, y: e.clientY });
      rx(e.clientX);
      ry(e.clientY);
    },
    { passive: true },
  );
  addEventListener('pointerdown', () => cursor.classList.add('is-down'));
  addEventListener('pointerup', () => cursor.classList.remove('is-down'));
  document.addEventListener('mouseleave', () => gsap.to(cursor, { opacity: 0, duration: 0.2 }));
  document.addEventListener('mouseenter', () => gsap.to(cursor, { opacity: 1, duration: 0.2 }));
  document.addEventListener('mouseover', e => {
    const t = (e.target as HTMLElement).closest('[data-cursor], a, button, summary, label');
    cursor.classList.remove('has-label', 'is-hover');
    if (!t || t.closest('input, textarea, select')) return;
    const text = t.getAttribute('data-cursor');
    if (text) {
      label.textContent = text;
      cursor.classList.add('has-label');
    } else cursor.classList.add('is-hover');
  });

  $$('[data-magnetic]').forEach(el => {
    const mx = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const my = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      mx((e.clientX - r.left - r.width / 2) * 0.3);
      my((e.clientY - r.top - r.height / 2) * 0.4);
    });
    el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, .35)' }));
  });
}

/* ---------------- шторка между страницами ---------------- */

function setupCurtain() {
  const curtain = $('[data-curtain]');
  if (!curtain) return;
  const label = $('[data-curtain-label]', curtain)!;

  // пришли со шторкой — открываем страницу
  if (root.classList.contains('curtain-on')) {
    try {
      label.textContent = sessionStorage.getItem('curtain') ?? '';
      sessionStorage.removeItem('curtain');
    } catch {
      /* приватный режим */
    }
    gsap.set(curtain, { yPercent: 0 });
    root.classList.remove('curtain-on');
    gsap.to(curtain, { yPercent: -101, duration: 0.8, ease: 'expo.inOut', delay: 0.15 });
  }
  addEventListener('pageshow', e => {
    if (e.persisted) gsap.set(curtain, { yPercent: 101 });
  });

  document.addEventListener('click', e => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname.startsWith('/api/')) return;
    if (url.pathname === location.pathname && url.search === location.search) return; // якорь на той же странице
    e.preventDefault();
    const text = (a.dataset.curtainLabel ?? a.textContent ?? '').replace(/[→↗←]/g, '').trim().slice(0, 40);
    label.textContent = text;
    try {
      sessionStorage.setItem('curtain', text);
    } catch {
      /* приватный режим */
    }
    gsap.fromTo(curtain, { yPercent: 101 }, { yPercent: 0, duration: 0.6, ease: 'expo.inOut', onComplete: () => location.assign(url.href) });
  });
}
