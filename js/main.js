(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);
  const CASES = window.CASES || [];

  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.toggle('has-cursor', fine && !reduce);

  /* ---------- мелочи: год, часы ---------- */
  $('#year').textContent = new Date().getFullYear();
  const clock = $('#clock');
  const tick = () => {
    clock.textContent = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };
  tick(); setInterval(tick, 10000);

  /* ---------- карточки кейсов ---------- */
  const track = $('#workTrack');
  track.innerHTML = CASES.map((c, i) => `
    <button class="case-card" data-case="${i}" data-cursor="Смотреть">
      <div class="case-card__frame">
        <span class="case-card__num mono">${String(i + 1).padStart(2, '0')} / ${String(CASES.length).padStart(2, '0')}</span>
        ${renderPoster(c)}
      </div>
      <div class="case-card__meta">
        <h3 class="case-card__title"><span>${c.title}</span></h3>
        <span class="case-card__tags mono">${c.tags.join(' · ')} — ${c.year}</span>
      </div>
      <p class="case-card__line">${c.tagline}</p>
    </button>`).join('') + `
    <div class="work__end">
      <p>Следующий кейс<br>может быть <em>твоим</em></p>
      <a href="#contact" class="pill" data-scroll data-magnetic>Обсудить проект →</a>
    </div>`;

  /* ---------- плавный скролл ---------- */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    if (hasGSAP) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
    lenis.stop();
  }
  const scrollTo = target => {
    if (lenis) lenis.scrollTo(target, { duration: 1.6, easing: t => 1 - Math.pow(1 - t, 4) });
    else (typeof target === 'number' ? window.scrollTo({ top: target, behavior: 'smooth' }) : target.scrollIntoView({ behavior: 'smooth' }));
  };
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-scroll]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (!id || !id.startsWith('#')) return;
    e.preventDefault();
    if (caseOpen) closeCase();
    scrollTo(id === '#top' ? 0 : $(id));
  });

  /* ---------- курсор ---------- */
  const cursor = $('#cursor');
  const cLabel = $('#cursorLabel');
  const mouse = { x: innerWidth / 2, y: innerHeight / 2 };
  if (fine && !reduce) {
    const ring = $('.cursor__ring', cursor), dot = $('.cursor__dot', cursor);
    const rp = { x: mouse.x, y: mouse.y };
    addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    addEventListener('pointerdown', () => cursor.classList.add('is-down'));
    addEventListener('pointerup', () => cursor.classList.remove('is-down'));
    const loop = () => {
      rp.x += (mouse.x - rp.x) * 0.18; rp.y += (mouse.y - rp.y) * 0.18;
      dot.style.transform = `translate(${mouse.x}px, ${mouse.y}px) translate(-50%, -50%)`;
      ring.style.transform = `translate(${rp.x}px, ${rp.y}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    };
    loop();
    document.addEventListener('mouseover', e => {
      const t = e.target.closest('[data-cursor], a, button');
      cursor.classList.remove('has-label', 'is-hover');
      if (!t) return;
      const label = t.getAttribute('data-cursor');
      if (label) { cLabel.textContent = label; cursor.classList.add('has-label'); }
      else cursor.classList.add('is-hover');
    });
    document.addEventListener('mouseleave', () => { cursor.style.opacity = 0; });
    document.addEventListener('mouseenter', () => { cursor.style.opacity = 1; });

    /* магнитные кнопки */
    if (hasGSAP) {
      $$('[data-magnetic]').forEach(el => {
        el.addEventListener('pointermove', e => {
          const r = el.getBoundingClientRect();
          gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.4, duration: 0.5, ease: 'power3.out' });
        });
        el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, .35)' }));
      });
    }
  } else {
    cursor.remove();
  }

  /* ---------- hero: прожектор, который проявляет заголовок ---------- */
  const hero = $('#hero');
  const title = $('.hero__title');
  const glow = $('#heroGlow');
  const light = { x: innerWidth * 0.5, y: innerHeight * 0.45, tx: innerWidth * 0.5, ty: innerHeight * 0.45, r: 0 };
  let lastMove = -1e9, heroVisible = true;
  const baseR = () => Math.max(150, Math.min(innerWidth * 0.24, 360));
  const setTarget = (x, y) => { light.tx = x; light.ty = y; lastMove = performance.now(); };
  addEventListener('pointermove', e => { if (e.pointerType === 'mouse') setTarget(e.clientX, e.clientY); }, { passive: true });
  hero.addEventListener('touchstart', e => setTarget(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  hero.addEventListener('touchmove', e => setTarget(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  new IntersectionObserver(([en]) => { heroVisible = en.isIntersecting; }).observe(hero);
  const heroLoop = now => {
    if (heroVisible) {
      // если давно не двигали мышь — свет сам гуляет по заголовку
      if (now - lastMove > 2600) {
        const tr = title.getBoundingClientRect(), t = now / 1000;
        light.tx = tr.left + tr.width * (0.5 + 0.38 * Math.sin(t * 0.55));
        light.ty = tr.top + tr.height * (0.5 + 0.32 * Math.sin(t * 0.9 + 1));
      }
      light.x += (light.tx - light.x) * 0.07;
      light.y += (light.ty - light.y) * 0.07;
      const tr = title.getBoundingClientRect(), hr = hero.getBoundingClientRect();
      title.style.setProperty('--x', `${light.x - tr.left}px`);
      title.style.setProperty('--y', `${light.y - tr.top}px`);
      title.style.setProperty('--r', `${light.r}px`);
      glow.style.transform = `translate(${light.x - hr.left}px, ${light.y - hr.top}px) translate(-50%, -50%)`;
    }
    requestAnimationFrame(heroLoop);
  };
  requestAnimationFrame(heroLoop);

  /* таймкод в углу как на камере */
  const tc = $('#timecode'), t0 = performance.now();
  const pad = n => String(n).padStart(2, '0');
  setInterval(() => {
    const f = Math.floor((performance.now() - t0) / (1000 / 24));
    const s = Math.floor(f / 24);
    tc.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(f % 24)}`;
  }, 1000 / 24);

  /* ---------- обратный отсчёт ---------- */
  const leader = $('#leader');
  let seen = false;
  try { seen = sessionStorage.getItem('leader-seen') === '1'; } catch (_) {}
  let leaderDone = false;

  function finishLeader() {
    if (leaderDone) return;
    leaderDone = true;
    try { sessionStorage.setItem('leader-seen', '1'); } catch (_) {}
    const go = () => { leader.remove(); document.body.classList.remove('is-loading'); lenis && lenis.start(); intro(); };
    if (hasGSAP && !reduce) {
      gsap.timeline({ onComplete: go })
        .to('.leader__ring', { scale: 1.6, opacity: 0, duration: 0.5, ease: 'power3.in' })
        .to('.leader__meta, .leader__skip', { opacity: 0, duration: 0.3 }, 0)
        .to(leader, { opacity: 0, duration: 0.45, ease: 'power2.out' }, '-=0.1');
    } else go();
  }

  if (reduce || seen) {
    finishLeader();
  } else {
    const num = $('#leaderNum'), pct = $('#leaderPct'), sweep = $('.leader__sweep');
    const D = 2100, start = performance.now();
    const step = now => {
      if (leaderDone) return;
      const p = Math.min(1, (now - start) / D);
      const sec = Math.min(2, Math.floor(p * 3));
      num.textContent = 3 - sec;
      sweep.style.setProperty('--p', `${((p * 3) % 1) * 360}deg`);
      pct.textContent = String(Math.round(p * 100)).padStart(3, '0') + '%';
      if (p < 1) requestAnimationFrame(step);
      else (document.fonts ? document.fonts.ready : Promise.resolve()).then(finishLeader);
    };
    requestAnimationFrame(step);
    $('#leaderSkip').addEventListener('click', finishLeader);
  }

  /* ---------- вход в сцену ---------- */
  function intro() {
    const r = baseR();
    const tr = title.getBoundingClientRect();
    light.x = light.tx = tr.left + tr.width * 0.35;
    light.y = light.ty = tr.top + tr.height * 0.5;
    if (!hasGSAP || reduce) { light.r = r; afterIntro(); return; }
    gsap.set('.hero .line__in', { yPercent: 115 });
    gsap.timeline({ onComplete: afterIntro })
      .to('.hero .line__in', { yPercent: 0, duration: 1.4, ease: 'expo.out', stagger: 0.08 })
      .to(light, { r, duration: 1.8, ease: 'power3.out' }, 0.3)
      .from('.hero [data-reveal], .hero__hud, .nav', { opacity: 0, y: 20, duration: 1, stagger: 0.08, ease: 'power3.out' }, 0.5)
      .from('.corner', { opacity: 0, scale: 0.4, duration: 0.8, stagger: 0.05, ease: 'back.out(2)' }, 0.6);
  }
  function afterIntro() {
    if (hasGSAP) ScrollTrigger.refresh();
    const m = location.hash.match(/^#case-(.+)$/);
    if (m) { const i = CASES.findIndex(c => c.id === m[1]); if (i >= 0) openCase(i, false); }
  }
  addEventListener('resize', () => { if (light.r) light.r = baseR(); });

  /* ---------- бегущая строка, которая разгоняется от скролла ---------- */
  const marquee = $('#marquee');
  if (!reduce) {
    let x = 0, boost = 0, dir = 1;
    const group = $('.marquee__group', marquee);
    if (lenis) lenis.on('scroll', ({ velocity }) => {
      if (Math.abs(velocity) > 0.1) dir = velocity > 0 ? 1 : -1;
      boost = Math.min(Math.abs(velocity) * 0.6, 22);
    });
    const loop = () => {
      const w = group.offsetWidth;
      x -= (0.6 + boost) * dir;
      boost *= 0.92;
      if (x <= -w) x += w;
      if (x > 0) x -= w;
      marquee.style.transform = `translate3d(${x}px,0,0)`;
      requestAnimationFrame(loop);
    };
    loop();
  }

  if (!hasGSAP) {
    $('#frameFinal').style.clipPath = 'none';
    $$('.frame--wire').forEach(f => (f.style.display = 'none'));
    $$('[data-count]').forEach(el => (el.textContent = el.dataset.count));
  }

  /* ---------- скролл-сцены ---------- */
  if (hasGSAP && !reduce) {
    /* манифест: слова зажигаются по одному */
    const man = $('#manifesto');
    const words = [];
    [...man.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/( +)/).forEach(part => {
          if (!part) return;
          if (/^ +$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          const s = document.createElement('span'); s.className = 'w'; s.textContent = part;
          frag.appendChild(s); words.push(s);
        });
        man.replaceChild(frag, n);
      } else {
        const s = document.createElement('span'); s.className = 'w';
        man.replaceChild(s, n); s.appendChild(n); words.push(s);
      }
    });
    gsap.to(words, {
      opacity: 1, stagger: 0.1, ease: 'none',
      scrollTrigger: { trigger: man, start: 'top 78%', end: 'bottom 45%', scrub: true }
    });

    /* заголовки секций */
    $$('.section-title').forEach(t => {
      gsap.from(t, { yPercent: 30, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: t, start: 'top 85%' } });
    });

    const mm = gsap.matchMedia();

    /* кейсы: горизонтальная плёнка на десктопе, вертикальная лента на телефоне */
    mm.add('(min-width: 900px)', () => {
      const pin = $('#workPin');
      const dist = () => track.scrollWidth - innerWidth;
      const tween = gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: pin, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 }
      });
      $$('.case-card', track).forEach(card => {
        gsap.fromTo($('.poster', card), { scale: 1.25 }, {
          scale: 1, ease: 'none',
          scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'center center', scrub: true }
        });
      });
    });
    mm.add('(max-width: 899px)', () => {
      $$('.case-card, .work__end', track).forEach(card => {
        gsap.from(card, { y: 60, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 88%' } });
      });
    });

    /* процесс: каркас превращается в готовый макет */
    const steps = $$('#processSteps li');
    const setStep = p => {
      const idx = Math.min(steps.length - 1, Math.floor(p * steps.length * 0.999));
      steps.forEach((s, i) => s.classList.toggle('is-active', i === idx));
    };
    const buildProcess = st => gsap.timeline({ scrollTrigger: { ...st, onUpdate: self => setStep(self.progress) } })
      .to('#processScan', { opacity: 1, duration: 0.05 })
      .fromTo('#frameFinal', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', duration: 1 }, 0)
      .fromTo('#processScan', { left: '0%' }, { left: '100%', ease: 'none', duration: 1 }, 0)
      .to('#processScan', { opacity: 0, duration: 0.05 });
    mm.add('(min-width: 900px)', () => buildProcess({ trigger: '#processPin', start: 'top top', end: '+=160%', pin: true, scrub: 1 }));
    mm.add('(max-width: 899px)', () => buildProcess({ trigger: '.process__stage', start: 'top 80%', end: 'bottom 25%', scrub: 1 }));

    /* счётчики */
    $$('[data-count]').forEach(el => {
      const o = { v: 0 };
      gsap.to(o, {
        v: +el.dataset.count, duration: 2.2, ease: 'power3.out',
        onUpdate: () => (el.textContent = Math.round(o.v)),
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    /* услуги, отзывы, контакт, титры */
    gsap.from('.service', { y: 40, opacity: 0, stagger: 0.08, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.services', start: 'top 85%' } });
    gsap.from('.critic', { y: 60, opacity: 0, stagger: 0.12, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: '.critics__grid', start: 'top 85%' } });
    gsap.set('.contact .line__in', { yPercent: 115 });
    gsap.to('.contact .line__in', { yPercent: 0, stagger: 0.1, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.contact__title', start: 'top 85%' } });
    gsap.from('.contact__row > *', { y: 30, opacity: 0, stagger: 0.1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.contact__row', start: 'top 92%' } });
    gsap.fromTo('.contact__glow', { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, ease: 'none', scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'center center', scrub: true } });
    gsap.from('.credits__roll > *, .credits dl > *', { y: 50, opacity: 0, stagger: 0.06, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.credits', start: 'top 75%' } });

    /* шрифты и картинки меняют высоту блоков — пересчитываем точки сцен */
    if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
    addEventListener('load', () => ScrollTrigger.refresh());

    /* hero уезжает в глубину при скролле */
    gsap.to('.hero__inner', { yPercent: -18, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* ---------- страница кейса ---------- */
  const caseEl = $('#case'), caseScroll = $('#caseScroll'), caseContent = $('#caseContent');
  let caseOpen = false, current = -1, lastFocus = null;

  const caseHTML = i => {
    const c = CASES[i], n = CASES[(i + 1) % CASES.length];
    const gal = c.gallery && c.gallery.length
      ? c.gallery.map(src => `<div><img src="${src}" alt="${c.title}" loading="lazy"></div>`).join('')
      : `<div>${renderPoster(c, true)}</div><div class="g2">${renderPoster(c)}</div><div class="g3">${renderPoster(c)}</div>`;
    return `
      <header class="case__hero">
        <div class="case__kicker mono"><span>Кейс ${String(i + 1).padStart(2, '0')}</span><span>${c.tags.join(' · ')}</span></div>
        <h2 class="case__title" id="caseTitle"><span class="line"><span class="line__in">${c.title}</span></span></h2>
        <p class="case__tagline">${c.tagline}</p>
      </header>
      <dl class="case__metaGrid">
        <div><dt>Клиент</dt><dd>${c.client}</dd></div>
        <div><dt>Роль</dt><dd>${c.role}</dd></div>
        <div><dt>Год</dt><dd>${c.year}</dd></div>
        <div><dt>Срок</dt><dd>${c.duration}</dd></div>
      </dl>
      <div class="case__cover">${renderPoster(c, true)}</div>
      <section class="case__section"><h3 class="mono">(01) Задача</h3><p>${c.task}</p></section>
      <section class="case__section"><h3 class="mono">(02) Решение</h3><p>${c.solution}</p></section>
      <div class="case__results">${c.results.map(r => `<div><b>${r.v}</b><span>${r.l}</span></div>`).join('')}</div>
      <div class="case__gallery">${gal}</div>
      <button class="case__next" data-next="${(i + 1) % CASES.length}" data-cursor="Дальше">
        <span class="mono">Следующий кейс →</span><b>${n.title}</b>
      </button>`;
  };

  const animateCaseIn = () => {
    if (!hasGSAP || reduce) return;
    gsap.fromTo($$('.case__title .line__in', caseContent), { yPercent: 115 }, { yPercent: 0, duration: 1.3, ease: 'expo.out', delay: 0.25 });
    gsap.fromTo($$('.case__kicker, .case__tagline, .case__metaGrid > div, .case__cover', caseContent),
      { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.06, ease: 'power3.out', delay: 0.4 });
  };

  function openCase(i, push = true) {
    current = i;
    caseContent.innerHTML = caseHTML(i);
    caseScroll.scrollTop = 0;
    if (push) history.pushState({ c: i }, '', '#case-' + CASES[i].id);
    if (caseOpen) return;
    caseOpen = true;
    lastFocus = document.activeElement;
    lenis && lenis.stop();
    document.body.style.overflow = 'hidden';
    caseEl.classList.add('is-open');
    caseEl.setAttribute('aria-hidden', 'false');
    $('#caseClose').focus({ preventScroll: true });
    if (hasGSAP && !reduce) {
      gsap.fromTo(caseEl, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'expo.inOut' });
    } else caseEl.style.clipPath = 'none';
    animateCaseIn();
  }

  function closeCase(push = true) {
    if (!caseOpen) return;
    caseOpen = false;
    if (push && location.hash.startsWith('#case-')) history.pushState({}, '', location.pathname + location.search);
    const done = () => {
      caseEl.classList.remove('is-open');
      caseEl.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      lenis && lenis.start();
      lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true });
    };
    if (hasGSAP && !reduce) gsap.to(caseEl, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.9, ease: 'expo.inOut', onComplete: done });
    else done();
  }

  function swapCase(i) {
    if (!hasGSAP || reduce) { openCase(i); return; }
    gsap.to(caseContent, {
      opacity: 0, y: -60, duration: 0.45, ease: 'power2.in',
      onComplete: () => {
        openCase(i);
        gsap.fromTo(caseContent, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
        animateCaseIn();
      }
    });
  }

  track.addEventListener('click', e => {
    const card = e.target.closest('[data-case]');
    if (card) openCase(+card.dataset.case);
  });
  caseContent.addEventListener('click', e => {
    const n = e.target.closest('[data-next]');
    if (n) swapCase(+n.dataset.next);
  });
  $('#caseClose').addEventListener('click', () => closeCase());
  addEventListener('popstate', () => {
    const m = location.hash.match(/^#case-(.+)$/);
    const i = m ? CASES.findIndex(c => c.id === m[1]) : -1;
    if (i >= 0) openCase(i, false); else closeCase(false);
  });

  /* ---------- почта, тост ---------- */
  const toast = $('#toast');
  let toastT;
  const say = msg => {
    toast.textContent = msg; toast.classList.add('is-on');
    clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('is-on'), 2200);
  };
  $('#copyEmail').addEventListener('click', e => {
    const mail = e.currentTarget.textContent.trim();
    if (navigator.clipboard) navigator.clipboard.writeText(mail).then(() => say('Почта скопирована ✦'), () => (location.href = 'mailto:' + mail));
    else location.href = 'mailto:' + mail;
  });

  /* ---------- пасхалка: сетка на клавишу G ---------- */
  const toggleGrid = () => {
    const on = document.documentElement.classList.toggle('show-grid');
    say(on ? 'Сетка 12 колонок · всё по модулю' : 'Сетка спрятана');
  };
  $('#gridToggle').addEventListener('click', toggleGrid);
  addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (!leaderDone) finishLeader(); else closeCase(); }
    if ((e.key === 'g' || e.key === 'G' || e.key === 'п' || e.key === 'П') && !e.metaKey && !e.ctrlKey && !/input|textarea/i.test(e.target.tagName)) toggleGrid();
  });
})();
