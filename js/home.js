/* Under the Tree — home: the countdown and the six ornaments */
(function () {
  'use strict';
  const A = window.App, $ = A.$, $$ = A.$$;
  const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  A.css(`
    .page-home{position:relative}
    .home-fx{position:absolute;right:14px;top:0;display:flex;gap:8px;z-index:2}
    .home-fx .icon-btn{width:40px;height:40px;color:#dfe8f5}
    @media (orientation:landscape) and (min-width:560px){.home-fx{right:18px}}
  `);

  /* a pine garland drawn to fit the space it gets. Needles are one static SVG; the lights are separate
     elements so their twinkle never repaints the needles. */
  function garland(seed, w, h) {
    const R = rng(91 + seed * 17), GW = 1000, GH = 1000 * h / w, f = v => v.toFixed(1);
    const swags = w > 620 ? 3 : 2, top = GH * .2, dip = GH * .3, yAt = x => top + dip * Math.abs(Math.sin(Math.PI * x / (GW / swags)));
    const greens = ['#0c3524', '#11492f', '#17603d', '#0a2a1c', '#1d7449'], step = w > 620 ? 3.4 : 5.5;
    let needles = '', extra = '', bulbs = '';
    for (let x = -6; x <= GW + 6; x += step) { const y = yAt(x); for (let k = 0; k < 3; k++) { const a = R() * 6.283, L = GH * (.12 + R() * .13); needles += `<line x1="${f(x)}" y1="${f(y)}" x2="${f(x + Math.cos(a) * L)}" y2="${f(y + Math.sin(a) * L * .8)}" stroke="${greens[(R() * greens.length) | 0]}"/>`; } }
    for (let i = 1; i < swags; i++) { const x = GW * i / swags, k = GH / 96; extra += `<g transform="translate(${f(x)},${f(top)}) scale(${k.toFixed(2)})"><path d="M0 0C-22-16-30 6-4 4Z" fill="#c9243a"/><path d="M0 0C22-16 30 6 4 4Z" fill="#c9243a"/><path d="M-3 3L-12 27L-5 22L-2 8Z" fill="#9c1830"/><path d="M3 3L12 27L5 22L2 8Z" fill="#9c1830"/><circle cx="0" cy="2" r="4.6" fill="#e23a50"/></g>`; }
    const cols = ['#ff5a5a', '#ffd76a', '#6fe3a5', '#7cc4ff', '#ffffff', '#ff9ad1'], gap = w > 620 ? 46 : 78; let i = 0;
    for (let x = gap / 2; x < GW; x += gap) { const y = yAt(x) + GH * .1; bulbs += `<i class="gb" style="left:${(x / 10).toFixed(2)}%;top:${(y / GH * 100).toFixed(1)}%;--c:${cols[i++ % cols.length]};animation-delay:${(-R() * 2.6).toFixed(2)}s"></i>`; }
    return `<svg class="garland" viewBox="0 0 ${GW} ${f(GH)}" style="height:${f(h)}px" preserveAspectRatio="none" aria-hidden="true"><g stroke-width="${(GH / 56).toFixed(2)}" stroke-linecap="round">${needles}</g>${extra}</svg><div class="g-bulbs" style="height:${f(h)}px">${bulbs}</div>`;
  }
  function orn(name, len, j, size) {
    const p = A.person(name), n = A.data ? A.data.items(name).length : 0, me = name === A.me(), e = A.esc(name);
    /* long names are set a little smaller so they stay inside the ball */
    const fs = name.length > 6 ? `font-size:calc(var(--size)*${Math.max(.1, .19 * 6.4 / name.length).toFixed(3)})` : '';
    return `<button class="orn${me ? ' me' : ''}" data-name="${e}" aria-label="Open ${A.esc(A.poss(name))} wishlist" style="--size:${size};--c1:${p.c[0]};--c2:${p.c[1]};--c3:${p.c[2]};--len:${len.toFixed(0)}px;--dur:${(4.2 + (j * 37 % 17) / 10).toFixed(1)}s;--del:${(-j * .7).toFixed(1)}s">
      <span class="hang"><span class="thread"></span><span class="cap"></span><span class="ball"><span class="bname" style="${fs}">${e}</span></span>
      <span class="olabel">${me ? 'You' + (n ? ', ' + n : '') : (n ? n + (n === 1 ? ' wish' : ' wishes') : 'Empty')}</span></span></button>`;
  }
  let timer = 0;
  function tick(first) {
    const el = $('.count'); if (!el) return;
    const now = A.now(); if (now.getMonth() === 11 && now.getDate() === 25) return;
    const t = Math.max(0, A.xmas() - now), d = Math.floor(t / 864e5), v = [Math.floor(t / 36e5) % 24, Math.floor(t / 6e4) % 60, Math.floor(t / 1e3) % 60];
    const num = $('.count-num', el); if (num.textContent !== String(d)) { num.textContent = d; $('.count-unit', el).textContent = (d === 1 ? 'day' : 'days') + ' until Christmas'; }
    $$('.count-sub b', el).forEach((b, i) => { const s = String(v[i]).padStart(2, '0'); if (b.textContent !== s) b.textContent = s; });
  }
  A.pages.home = {
    render(root) {
      const land = matchMedia('(orientation:landscape) and (min-width:560px)').matches;
      const w = root.clientWidth - (land ? 36 : 28), h = root.clientHeight, now = A.now(), xmasDay = now.getMonth() === 11 && now.getDate() === 25;
      /* any number of people: one row of up to 7 on a wide screen, rows of 3 on a tall one */
      const N = A.names.length, per = land ? (N <= 7 ? Math.max(N, 1) : Math.ceil(N / 2)) : (N === 4 ? 2 : 3), rows = [];
      for (let i = 0; i < N; i += per) rows.push(A.names.slice(i, i + per));
      const R = Math.max(rows.length, 1), cols = Math.max(Math.min(per, N), land ? 4 : 3);
      const size = land ? `min(${(74.4 / cols).toFixed(1)}cqw,${(36 / R).toFixed(1)}cqh,170px)` : `min(${(72 / cols).toFixed(1)}cqw,${(34 / R).toFixed(1)}cqh)`;
      const gh = (land ? Math.min(w * .085, h * .16) : Math.min(w * .11, h * .07)) * Math.min(1, 2 / R + (land ? .5 : 0));
      const pat = land ? [.05, .105, .03, .12, .06, .09, .04] : [.02, .045, .012, .04, .016, .034];
      const lens = A.names.map((n, i) => pat[i % pat.length] * Math.min(1, (land ? 1 : 2) / R));
      root.innerHTML = `
        <div class="home-fx"><button class="icon-btn solid" id="fxSanta" aria-label="Call Santa">${A.icon('sleigh', 20)}</button><button class="icon-btn solid" id="fxSnow" aria-label="Let it snow">${A.icon('snow', 20)}</button></div>
        <div class="count${xmasDay ? ' merry' : ''}">${xmasDay
          ? '<span class="count-num">Merry Christmas</span><span class="count-unit">Go open something.</span>'
          : '<span class="count-num">0</span><span class="count-unit">days until Christmas</span><span class="count-sub"><span><b>00</b> hr</span><span><b>00</b> min</span><span><b>00</b> sec</span></span>'}${A.reveal ? A.reveal.chipHTML() : ''}</div>
        <div class="tree-area">${rows.map((r, ri) => `<div class="g-row">${garland(ri, w, gh)}<div class="orns" style="margin-top:${(-gh * .5).toFixed(0)}px">${r.map((n, i) => orn(n, lens[ri * per + i] * h, ri * per + i, size)).join('')}</div></div>`).join('')}</div>`;
      tick(true); clearInterval(timer); timer = setInterval(tick, 1000);
      $$('.orn', root).forEach(b => b.onclick = () => A.go('#/list/' + encodeURIComponent(b.dataset.name)));
      if (A.reveal) A.reveal.wire(root);
      $('#fxSanta', root).onclick = () => { if (A.scene) A.scene.callSanta(); };
      $('#fxSnow', root).onclick = () => { if (A.scene) A.scene.blizzard(); A.ui.toast('Blizzard for ten seconds.'); };
    },
    leave() { clearInterval(timer); }
  };
})();
