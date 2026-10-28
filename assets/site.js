// Nav border on scroll
const nav = document.querySelector('.nav');
if (nav) {
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

// /build intake form: send through FormSubmit's AJAX endpoint, fall back to a normal POST
const form = document.querySelector('#intake');
if (form) {
  const sent = document.querySelector('#sent');
  const button = form.querySelector('button[type="submit"]');
  form.addEventListener('submit', async (e) => {
    if (!window.fetch) return;
    e.preventDefault();
    button.disabled = true;
    button.textContent = 'Sending…';
    try {
      const res = await fetch(form.dataset.ajax, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form),
      });
      if (!res.ok) throw new Error(res.status);
      form.hidden = true;
      sent.classList.add('show');
      sent.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (err) {
      button.disabled = false;
      button.textContent = 'Send it';
      form.submit();
    }
  });
}

// "How we build" orbit: describe → proof of concept → a fast prototype loop → harden → launch.
// Drawn as SVG; wide layout on desktop, tall layout on phones. Click a step to jump to it.
const orbit = document.querySelector('#orbit');
if (orbit) {
  const svg = orbit.querySelector('.orbit-svg');
  const detail = orbit.querySelector('.orbit-detail');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  const LAPS = 12;

  const STEPS = [
    { who: 'You', t: 'You describe it', p: "Tell us the problem, who it serves, and what's broken today. A call, a sketch, or the spreadsheet you're stuck with all work." },
    { who: 'Senior engineers, AI-accelerated', t: 'Senior engineers build the proof of concept', p: 'Experienced engineers design it and use AI to build it fast. AI speeds up the typing. The judgment is ours.' },
    { who: 'You + senior engineers', t: 'A working prototype in hours, not weeks', p: 'You click through something real right away, and we sit with you to sharpen the vision and the use cases.' },
    { who: 'You', t: 'You try it', p: 'Put it in front of your staff, your students, or your board, and tell us what works and what doesn\'t.' },
    { who: 'Together', t: 'Refine, and the loop keeps going', p: 'Feedback in, a better version out. Because AI makes each turn fast, we can go around as many times as it takes.' },
    { who: 'Senior engineers', t: 'Secure and harden', p: 'Before launch we lock it down with a security review, accessibility, tests, and docs your team can run with.' },
    { who: 'Yours', t: 'Launch', p: 'Live, documented, and yours: your code, your accounts, your data.' },
  ];
  const ICONS = [
    '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    '<circle cx="8" cy="8" r="3"/><path d="M2 20v-1a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v1"/><path d="M15 11.5a3 3 0 0 0 0-5.6"/><path d="M22 20v-1a4 4 0 0 0-3-3.8"/><path d="M19.5 1.5l.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7z" fill="currentColor" stroke="none"/>',
    '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
    '<path d="M5 3l14 7-6 2-2 6z"/>',
    '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
    '<path d="M5 15c-1.5 1.3-2 5-2 5s3.7-.5 5-2"/><path d="M9 15l-3-3c1.5-4 5-8 13-9-1 8-5 11.5-9 13z"/><circle cx="15" cy="9" r="1.5"/>',
  ];

  // Layouts: entry nodes, ring (center, radius, start angle = prototype), exit nodes, label placement
  const LAYOUTS = {
    wide: { vb: [960, 380], c: [480, 190], r: 150, a0: Math.PI, entry: [[70, 190], [215, 190]], exit: [[760, 190], [890, 190]],
      label: (i, p) => i === 2 ? [p[0] + 4, p[1] - 44, 'end'] : i === 3 ? [p[0] + 40, p[1] + 6, 'start'] : i === 4 ? [p[0] - 4, p[1] - 44, 'start'] : [p[0], p[1] + 54, 'middle'] },
    tall: { vb: [360, 980], c: [180, 470], r: 120, a0: -Math.PI / 2, entry: [[60, 70], [60, 200]], exit: [[60, 760], [60, 890]],
      label: (i, p) => i === 3 ? [p[0] - 2, p[1] - 40, 'middle'] : i === 2 || i === 4 ? [p[0] + 38, p[1] + 5, 'start'] : [p[0] + 42, p[1] + 5, 'start'] },
  };
  const SUBS = ['YOU', 'SENIOR ENG · AI-ACCELERATED', '', '', '', 'SENIOR ENG', ''];
  const NAMES = ['You describe it', 'Proof of concept', 'Prototype', 'You try it', 'Refine', 'Secure + harden', 'Launch'];

  let L, ringPts, nodes = [], comet, verEl, cur, raf, timer, hold, k = 0, frames = [];
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const a in attrs) e.setAttribute(a, attrs[a]); parent && parent.appendChild(e); return e; };
  const ang = (a) => [L.c[0] + L.r * Math.cos(a), L.c[1] + L.r * Math.sin(a)];

  const build = () => {
    L = LAYOUTS[window.matchMedia('(max-width: 760px)').matches ? 'tall' : 'wide'];
    svg.setAttribute('viewBox', `0 0 ${L.vb[0]} ${L.vb[1]}`);
    svg.innerHTML = '';
    const a = L.a0, q = Math.PI / 2;
    ringPts = [ang(a), ang(a + q), ang(a + 2 * q), ang(a + 3 * q)]; // prototype, try, refine, (return)
    const pts = [L.entry[0], L.entry[1], ringPts[0], ringPts[1], ringPts[2], L.exit[0], L.exit[1]];
    // tracks
    const tall = L === LAYOUTS.tall;
    if (tall) {
      el('path', { class: 'o-track', d: `M${pts[0]} L${pts[1]} L${L.c[0] - 40},${pts[1][1]} Q${L.c[0]},${pts[1][1]} ${pts[2]}` }, svg);
      el('path', { class: 'o-track', d: `M${pts[4]} Q${L.c[0]},${pts[5][1]} ${L.c[0] - 40},${pts[5][1]} L${pts[5]} L${pts[6]}` }, svg);
    } else {
      el('path', { class: 'o-track', d: `M${pts[0]} L${pts[2]}` }, svg);
      el('path', { class: 'o-track', d: `M${pts[4]} L${pts[6]}` }, svg);
    }
    el('circle', { class: 'o-ring', cx: L.c[0], cy: L.c[1], r: L.r }, svg);
    el('text', { class: 'o-label', x: L.c[0], y: L.c[1] - 34, 'text-anchor': 'middle' }, svg).textContent = 'THE LOOP';
    verEl = el('text', { class: 'o-ver', x: L.c[0], y: L.c[1] + 14, 'text-anchor': 'middle' }, svg);
    el('text', { class: 'o-cap', x: L.c[0], y: L.c[1] + 40, 'text-anchor': 'middle' }, svg).textContent = 'versions in hours, not weeks';
    // comet sits under the nodes, so it shows on the tracks and hides behind each step
    comet = el('circle', { class: 'o-comet', r: 7, cx: pts[0][0], cy: pts[0][1] }, svg);
    nodes = pts.map((p, i) => {
      const g = el('g', { class: 'o-node' + (i === 6 ? ' launch' : ''), tabindex: 0, role: 'button', 'aria-label': NAMES[i] }, svg);
      const rr = i >= 2 && i <= 4 ? 24 : 28;
      el('circle', { class: 'o-dot', cx: p[0], cy: p[1], r: rr }, g);
      if (i === 6) {
        el('text', { class: 'emoji', x: p[0], y: p[1] + 1, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, g).textContent = '🚀';
      } else {
        const ic = el('svg', { class: 'ic', x: p[0] - 12, y: p[1] - 12, width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
        ic.innerHTML = ICONS[i];
      }
      const [lx, ly, anchor] = L.label(i, p);
      el('text', { x: lx, y: ly, 'text-anchor': anchor }, g).textContent = NAMES[i];
      if (SUBS[i]) el('text', { class: 'sub', x: lx, y: ly + 18, 'text-anchor': anchor }, g).textContent = SUBS[i];
      const go = () => jump(frames.findIndex((f) => f.n === i));
      g.addEventListener('click', go);
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
      return g;
    });
    // frames: entry, laps that speed up, exit
    frames = [{ at: pts[0], n: 0, s: 0, v: 0, ms: 1700 }, { at: pts[1], n: 1, s: 1, v: 0, ms: 2000 }];
    for (let lap = 1; lap <= LAPS; lap++) {
      const ms = Math.max(140, 520 - lap * 45);
      const first = lap === 1;
      frames.push({ at: ringPts[0], n: 2, s: 2, v: lap, ms: first ? 1500 : ms });
      frames.push({ at: ringPts[1], n: 3, s: first ? 3 : 4, v: lap, ms: first ? 1300 : ms });
      frames.push({ at: ringPts[2], n: 4, s: 4, v: lap, ms: first ? 1300 : ms });
      if (lap < LAPS) frames.push({ at: ringPts[3], n: -1, s: 4, v: lap, ms });
    }
    frames.push({ at: pts[5], n: 5, s: 5, v: LAPS, ms: 2000 }, { at: pts[6], n: 6, s: 6, v: LAPS, ms: 3200 });
    cur = pts[0].slice();
  };

  const onRing = (p) => Math.abs(Math.hypot(p[0] - L.c[0], p[1] - L.c[1]) - L.r) < 1;
  const move = (to, dur) => {
    cancelAnimationFrame(raf);
    const from = cur.slice(), t0 = performance.now();
    const a0 = Math.atan2(from[1] - L.c[1], from[0] - L.c[0]);
    let a1 = Math.atan2(to[1] - L.c[1], to[0] - L.c[0]);
    while (a1 <= a0 + 1e-6) a1 += Math.PI * 2; // clockwise
    const arc = onRing(from) && onRing(to) && a1 - a0 < Math.PI * 0.6;
    cur = to.slice();
    if (reduced) { comet.setAttribute('cx', to[0]); comet.setAttribute('cy', to[1]); return; }
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur), e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      let x, y;
      if (arc) { const a = a0 + (a1 - a0) * (arc ? p : e); x = L.c[0] + L.r * Math.cos(a); y = L.c[1] + L.r * Math.sin(a); }
      else { x = from[0] + (to[0] - from[0]) * e; y = from[1] + (to[1] - from[1]) * e; }
      comet.setAttribute('cx', x); comet.setAttribute('cy', y);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  };

  const apply = (i) => {
    const f = frames[i], prev = frames[i - 1];
    if (i === 0) cur = f.at.slice();
    move(f.at, Math.min(900, (prev ? prev.ms : 600) * 0.9));
    const reached = Math.max(...frames.slice(0, i + 1).map((x) => x.n));
    nodes.forEach((g, j) => { g.classList.toggle('active', j === f.n); g.classList.toggle('done', j <= reached && j !== f.n); });
    verEl.textContent = 'v' + Math.max(1, f.v);
    orbit.classList.toggle('looping', f.n >= 2 && f.n <= 4 || f.n === -1);
    const s = STEPS[f.s];
    if (detail.dataset.s !== String(f.s)) {
      detail.dataset.s = f.s;
      detail.querySelector('.who').textContent = s.who;
      detail.querySelector('h3').textContent = s.t;
      detail.querySelector('p').textContent = s.p;
    }
  };
  const schedule = () => { clearTimeout(timer); timer = setTimeout(() => { k = (k + 1) % frames.length; apply(k); schedule(); }, frames[k].ms); };
  const jump = (i) => { if (i < 0) return; clearTimeout(timer); clearTimeout(hold); k = i; apply(k); if (!reduced) hold = setTimeout(schedule, 6000); };

  build();
  k = frames.length - 1; cur = frames[k].at.slice(); apply(k); // complete at rest
  if (!reduced && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { k = 0; apply(0); schedule(); } else { clearTimeout(timer); }
    }, { threshold: 0.35 }).observe(orbit);
  }
  let mode = L;
  window.addEventListener('resize', () => {
    const next = LAYOUTS[window.matchMedia('(max-width: 760px)').matches ? 'tall' : 'wide'];
    if (next !== mode) { mode = next; build(); apply(Math.min(k, frames.length - 1)); }
  });
}
