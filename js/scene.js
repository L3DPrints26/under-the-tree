/* Under the Tree — background photo, snow, the Santa chase and particle effects.
   One real photo, one snow canvas, one effects canvas. Nothing follows the mouse.
   Santa only appears when his button is pressed. While he is out, nothing behind him can be tapped. */
(function () {
  'use strict';
  const A = window.App, $ = A.$, rand = A.rand, pick = A.pick;
  let W = innerWidth, H = innerHeight, LOW = A.reduced;
  /* real photos to choose from (Unsplash). The choice is kept on this device only. */
  const PHOTOS = [
    ['trees', 'Snowy trees', '1643498091519-c1006f563bc9', 'center 55%'],
    ['cabin', 'Cabin', '1741948924635-13a7ddbc6a05', 'center 62%'],
    ['aurora', 'Northern lights', '1771944162983-41647a1298af', 'center 45%'],
    ['pine', 'Pine and lights', '1513297887119-d46091b24bfa', 'center'],
    ['lights', 'Christmas lights', '1544438369-a34666f8ff77', 'center'],
    ['fire', 'Fireplace', '1543393470-b2c833b98dce', 'center 60%']
  ];
  const photoUrl = (id, q) => 'https://images.unsplash.com/photo-' + id + '?' + q + '&auto=format&fit=crop';
  let bgTok = 0;
  function paintBg(key) {
    const p = PHOTOS.find(x => x[0] === key) || PHOTOS[0], ph = $('#bgPhoto'), tok = ++bgTok;
    const px = Math.min(2400, Math.ceil(Math.max(innerWidth, innerHeight) * Math.min(2, devicePixelRatio || 1) / 400) * 400);
    const url = photoUrl(p[2], 'w=' + px + '&q=72'), img = new Image();
    ph.classList.remove('on');
    img.onload = () => { if (tok !== bgTok) return; setTimeout(() => { if (tok !== bgTok) return; ph.style.backgroundImage = 'url("' + url + '")'; ph.style.backgroundPosition = p[3]; ph.classList.add('on'); }, ph.style.backgroundImage ? 350 : 0); };
    img.src = url;
  }

  A.css(`
    #scene .photo{position:absolute;inset:0;background-size:cover;background-position:center 55%;opacity:0;transition:opacity .35s ease}
    #scene .photo.on{transition:opacity 1.1s ease}
    #scene .photo.on{opacity:1}
    #scene .shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(4,9,22,.68) 0%,rgba(4,9,22,.36) 34%,rgba(4,9,22,.42) 66%,rgba(4,9,22,.8) 100%)}
    #santaShield{position:fixed;inset:0;z-index:19;display:none;touch-action:none;background:rgba(4,9,22,.45)}
    #santaShield.on{display:block}
    #chase{position:fixed;left:50%;top:calc(env(safe-area-inset-top) + 60px);transform:translate(-50%,-14px);z-index:85;display:flex;align-items:center;gap:10px;height:44px;padding:0 6px 0 14px;border-radius:999px;
      background:#fff;color:#111a2e;font-weight:700;font-size:16px;box-shadow:0 10px 30px rgba(0,0,0,.45);opacity:0;pointer-events:none;transition:opacity .25s,transform .25s;overflow:hidden;font-variant-numeric:tabular-nums;white-space:nowrap}
    #chase.on{opacity:1;transform:translate(-50%,0);pointer-events:auto}
    #chase svg{color:#d7263d}
    #chase small{font-weight:600;color:#5b6b85;font-size:12.5px}
    #chase i{position:absolute;left:0;bottom:0;height:3px;width:100%;background:#d7263d;transform-origin:left}
    #chase.bump b{animation:chbump .22s ease-out}
    @keyframes chbump{from{transform:scale(1.5)}to{transform:scale(1)}}
    #chase b{display:inline-block;min-width:1.4em;text-align:center}
    #chaseDone{height:34px;padding:0 14px;border-radius:999px;background:#111a2e;color:#fff;font-weight:600;font-size:13.5px}
    #chase.gold i{background:#d9a520}
    #chase.gold small{color:#a8740c;font-weight:700}
    .sb-list{list-style:none;display:flex;flex-direction:column;gap:2px;margin:12px 0 14px}
    .sb-list li{display:flex;align-items:center;gap:10px;min-height:40px;padding:4px 12px 4px 8px;border-radius:12px}
    .sb-list li.me{background:var(--surface2)}
    .sb-list li b{font-weight:600;font-variant-numeric:tabular-nums}
    .sb-rank{width:22px;display:grid;place-items:center;color:var(--muted);font-weight:600}
    .sb-list li:first-child .sb-rank{color:var(--gold)}
    .sb-wait .sb-acts{opacity:.45}
  `);

  /* ---------- santa artwork ---------- */
  function deer(x, y, delay, lead) {
    const legs = 'fill="none" stroke="#6f4726" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"';
    return `<g transform="translate(${x},${y})"><g class="bob" style="animation-delay:${delay}s">
      <g class="la" ${legs} style="animation-delay:${delay}s"><path d="M56 48L68 58L80 60"/><path d="M52 50L62 62L74 67"/><path d="M22 48L10 58L-2 60"/><path d="M26 50L16 63L4 68"/></g>
      <g class="lb" ${legs} style="animation-delay:${delay}s"><path d="M56 48L62 60L54 68"/><path d="M52 50L54 63L46 69"/><path d="M22 48L30 60L24 70"/><path d="M26 50L36 61L31 71"/></g>
      <path d="M14 36l-7-5l4 9z" fill="#f3e6cf"/><ellipse cx="38" cy="42" rx="25" ry="11.5" fill="url(#gDeer)"/>
      <path d="M50 36C56 28 62 20 66 12L77 17C72 26 68 38 60 48Z" fill="#a8733f"/>
      <path d="M57.5 27.5L70.5 33.5" stroke="#d3273f" stroke-width="3.8" stroke-linecap="round"/><circle cx="63.6" cy="34.4" r="2.5" fill="#f2c94c"/>
      <path d="M67 7l-6-6l9 2z" fill="#8a5a34"/><path d="M64 10C68 4 78 4 84 9L93 13C95 15 94 18 91 18L80 20C72 21 66 18 64 10Z" fill="#a8733f"/>
      <circle cx="78.5" cy="10.6" r="1.35" fill="#1a0f08"/>
      <path d="M70 5C68-6 62-14 54-18M66-8C70-12 72-18 71-24M61-14C64-19 64-24 62-28M72 5C76-4 82-10 90-12M78-5C80-11 79-17 76-21" fill="none" stroke="#ead2a6" stroke-width="2.4" stroke-linecap="round"/>
      ${lead ? '<circle cx="94" cy="15" r="11" fill="url(#gNose)"/><circle cx="94" cy="15" r="3" fill="#ff4a3a"/>' : '<circle cx="93" cy="15.4" r="1.9" fill="#2a1a10"/>'}
    </g></g>`;
  }
  function buildSanta() {
    $('#santa').innerHTML = `<svg viewBox="0 0 470 124"><defs>
      <radialGradient id="gNose"><stop offset="0" stop-color="#ff5a4a" stop-opacity=".95"/><stop offset="1" stop-color="#ff5a4a" stop-opacity="0"/></radialGradient>
      <linearGradient id="gDeer" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b17a45"/><stop offset="1" stop-color="#8a5a34"/></linearGradient>
      <linearGradient id="gSleigh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e5384f"/><stop offset="1" stop-color="#8f1527"/></linearGradient></defs>
      <path d="M100 68Q150 77 202 76T297 72T392 68" fill="none" stroke="#d9b65a" stroke-width="1.5" stroke-linecap="round"/>
      <g transform="translate(10,52)"><g class="bob" style="animation-duration:.9s">
        <path d="M16 26C4 8 18-10 34-4C46 0 48 14 42 26Z" fill="#0f6a45"/><path d="M27-4C26-10 35-12 37-6" fill="none" stroke="#f2c94c" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M46 26C44 8 54 0 64 2C74 4 78 14 76 26Z" fill="#d3273f"/><path d="M46.6 19.5L75.8 19.5" stroke="#1b1b1f" stroke-width="3.6"/><rect x="58.5" y="17" width="6" height="5" rx="1" fill="none" stroke="#f2c94c" stroke-width="1.4"/>
        <circle cx="64" cy="-6" r="7.5" fill="#f4cba6"/><path d="M57-5C57 8 71 8 71-4C68 1 61 1 57-5Z" fill="#fff"/>
        <path d="M56-10C57-22 70-24 76-15L83-6L74-9C70-13 62-13 56-10Z" fill="#d3273f"/><path d="M55.5-9.5C61-13.5 70-13 74.5-8.5" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/><circle cx="84" cy="-5" r="3.2" fill="#fff"/>
        <path d="M68 10L88 15.5" stroke="#d3273f" stroke-width="5.4" stroke-linecap="round"/><path d="M85.5 12.4L84.6 17" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><circle cx="90.4" cy="16.2" r="3" fill="#1b1b1f"/>
        <path d="M8 40C4 20 12 6 28 6L34 26L88 26C100 26 106 14 102 2C116 10 118 36 102 48L22 48C12 48 8 46 8 40Z" fill="url(#gSleigh)"/>
        <path d="M28 6L34 26L88 26C100 26 106 14 102 2" fill="none" stroke="#f2c94c" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
        <path d="M30 48L30 62M82 48L82 62" stroke="#b8862b" stroke-width="3" fill="none"/><path d="M4 62L98 62C114 62 120 50 112 42" fill="none" stroke="#f2c94c" stroke-width="3.2" stroke-linecap="round"/>
      </g></g>${deer(150, 44, 0, false)}${deer(245, 40, -.15, false)}${deer(340, 36, -.3, true)}</svg>`;
  }

  /* ---------- canvases + particles ---------- */
  const bc = $('#back'), bx = bc.getContext('2d'), fc = $('#front'), fx = fc.getContext('2d');
  let flakes = [], parts = [], blizzardUntil = 0, frontDirty = false;
  const CONF = ['#e9c46a', '#ff4d5e', '#59e0a0', '#6bbcff', '#ffffff', '#ff8fd0'];
  const WRAPS = [['#d7263d', '#a3162a', '#f7e3a1'], ['#1f9d6b', '#147150', '#f7e3a1'], ['#2f7fe0', '#1c5bb0', '#ffffff'], ['#8a52dd', '#5f2fb0', '#ffd76a'], ['#f2b8cf', '#d98aa9', '#d7263d'], ['#f7e3a1', '#d9b65a', '#d7263d']];
  const mkFlake = () => { const z = Math.random(); return { x: Math.random() * W, y: Math.random() * H, r: .5 + z * 2, s: .25 + z * .95, ph: Math.random() * 6.28, o: .35 + z * .55 }; };
  function resize() { W = innerWidth; H = innerHeight; bc.width = fc.width = W; bc.height = fc.height = H; flakes = Array.from({ length: Math.round(W / (LOW ? 26 : 11)) }, mkFlake); }
  function blizzard() {
    blizzardUntil = performance.now() + 10000;
    flakes = flakes.filter(q => !q.extra).concat(Array.from({ length: Math.round(W / (LOW ? 12 : 5)) }, () => Object.assign(mkFlake(), { extra: 1 })));
    setTimeout(() => { flakes = flakes.filter(q => !q.extra); }, 10500);
  }
  const fxApi = A.fx = {
    confetti(x, y, n) { n = LOW ? Math.ceil(n / 2) : n; for (let i = 0; i < n; i++) parts.push({ k: 'c', x, y, vx: rand(-5, 5), vy: rand(-8.5, -2), r: rand(0, 6.28), vr: rand(-.3, .3), s: rand(5, 10), c: pick(CONF), life: 1, dec: rand(.008, .016) }); },
    puff(x, y) { for (let i = 0; i < 12; i++) { const a = rand(0, 6.28), v = rand(1, 4.2); parts.push({ k: 'p', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1.2, s: rand(1.4, 3.4), life: 1, dec: rand(.025, .045) }); } },
    sparkle(x, y) { parts.push({ k: 's', x, y, vx: rand(-.6, .6), vy: rand(-.3, .9), s: rand(1, 2.6), life: 1, dec: rand(.014, .03), c: Math.random() < .7 ? '#ffe7a3' : '#ffffff' }); },
    text(x, y, str, color) { parts.push({ k: 't', x, y, vx: 0, vy: -1.5, str, c: color || '#fff', life: 1, dec: .018 }); },
    blizzard
  };
  /* a wrapped present: box, lid, ribbon and a bow */
  function drawGift(g, s, w) {
    const h = s * .86;
    g.fillStyle = w[0]; g.fillRect(-s / 2, -h / 2 + s * .14, s, h - s * .14);
    g.fillStyle = w[1]; g.fillRect(s * .18, -h / 2 + s * .14, s * .32, h - s * .14);
    g.fillStyle = w[2]; g.fillRect(-s * .1, -h / 2 + s * .14, s * .2, h - s * .14);
    g.fillStyle = w[0]; g.fillRect(-s * .56, -h / 2, s * 1.12, s * .22);
    g.fillStyle = w[1]; g.fillRect(-s * .56, -h / 2 + s * .17, s * 1.12, s * .05);
    g.fillStyle = w[2]; g.fillRect(-s * .1, -h / 2, s * .2, s * .22);
    g.beginPath(); g.ellipse(-s * .2, -h / 2 - s * .1, s * .2, s * .12, -.5, 0, 6.283); g.ellipse(s * .2, -h / 2 - s * .1, s * .2, s * .12, .5, 0, 6.283); g.fill();
    g.fillStyle = w[1]; g.beginPath(); g.arc(0, -h / 2 - s * .04, s * .08, 0, 6.283); g.fill();
  }
  function throwGifts(x, y, n) {
    for (let i = 0; i < n; i++) parts.push({ k: 'g', x: x + rand(-18, 18), y: y + rand(-6, 10), vx: rand(-6.5, 6.5), vy: rand(-11, -5), r: rand(-.5, .5), vr: rand(-.14, .14), s: rand(20, 32) * (W < 600 ? .85 : 1), w: pick(WRAPS), bounced: false });
  }
  function stepParts() {
    if (!parts.length) { if (frontDirty) { fx.clearRect(0, 0, W, H); frontDirty = false; } return; }
    fx.clearRect(0, 0, W, H); frontDirty = true;
    const floor = H - 22;
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      if (p.k === 'g') {
        p.vy += .34; p.vx *= .995; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        if (p.x < 14 || p.x > W - 14) { p.vx *= -.7; p.x = Math.max(14, Math.min(W - 14, p.x)); }
        if (p.y > floor) {
          if (!p.bounced && p.vy > 3) { p.bounced = true; p.y = floor; p.vy *= -.42; p.vx *= .7; p.vr *= .5; }
          else { fxApi.confetti(p.x, floor, 10); fxApi.puff(p.x, floor); parts.splice(i, 1); continue; }
        }
        fx.save(); fx.translate(p.x, p.y); fx.rotate(p.r); drawGift(fx, p.s, p.w); fx.restore(); continue;
      }
      p.life -= p.dec; if (p.life <= 0) { parts.splice(i, 1); continue; }
      p.x += p.vx; p.y += p.vy;
      if (p.k === 'c') { p.vy += .22; p.vx *= .99; p.r += p.vr; fx.save(); fx.globalAlpha = Math.min(1, p.life * 1.6); fx.translate(p.x, p.y); fx.rotate(p.r); fx.fillStyle = p.c; fx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); fx.restore(); }
      else if (p.k === 'p') { p.vy += .08; p.vx *= .96; fx.globalAlpha = p.life * .9; fx.fillStyle = '#fff'; fx.beginPath(); fx.arc(p.x, p.y, p.s, 0, 6.283); fx.fill(); }
      else if (p.k === 't') { fx.globalAlpha = Math.min(1, p.life * 2); fx.font = '700 26px "DM Sans",system-ui,sans-serif'; fx.textAlign = 'center'; fx.lineWidth = 4; fx.strokeStyle = 'rgba(6,13,31,.85)'; fx.strokeText(p.str, p.x, p.y); fx.fillStyle = p.c; fx.fillText(p.str, p.x, p.y); }
      else { p.vy += .012; fx.globalAlpha = p.life; fx.fillStyle = p.c; fx.beginPath(); fx.arc(p.x, p.y, p.s * p.life, 0, 6.283); fx.fill(); }
    }
    fx.globalAlpha = 1;
  }

  /* ---------- santa ----------
     He only comes out when called. Every visit is different: he comes in from a random edge and
     strings random moves together (swoops, loops, zigzags, dashes, slow glides), and now and then
     he vanishes in a puff of snow and pops up somewhere else. Quick hits in a row build a combo. */
  const el = $('#santa'); let S = null, hud = null, shield = null, coolUntil = 0, board = null;
  const GAME_MS = 16000, COOL_MS = 1500, MOVES = ['swoop', 'loop', 'zigzag', 'dash', 'glide', 'blink'];
  const MUL = { swoop: 1, loop: 1.05, zigzag: .95, dash: 1.65, glide: .4, blink: 1 };
  const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
  function ensureUi() {
    if (hud) return;
    shield = document.createElement('div'); shield.id = 'santaShield'; document.body.appendChild(shield);
    shield.addEventListener('pointerdown', e => { e.preventDefault(); if (S && S.mode === 'fly') fxApi.puff(e.clientX, e.clientY); });
    hud = document.createElement('div'); hud.id = 'chase';
    hud.innerHTML = A.icon('gift', 20) + '<b>0</b><small>Tap Santa</small><button id="chaseDone">Done</button><i></i>';
    document.body.appendChild(hud);
    $('#chaseDone', hud).onclick = () => { if (S && S.mode === 'fly') S.until = 0; };
  }
  /* pick what he does next, never the same thing twice in a row */
  function nextMove(t, first) {
    let m; do { m = pick(MOVES); } while (m === S.move || (first && (m === 'blink' || m === 'glide')));
    S.move = m; S.zig = Math.random() < .5 ? -1 : 1; S.nextWander = 0; S.fade = m === 'blink' ? -1 : 0;
    S.moveUntil = m === 'blink' ? Infinity : t + (m === 'dash' ? rand(700, 1000) : m === 'glide' ? rand(900, 1300) : m === 'loop' ? rand(1500, 2100) : rand(1600, 3000));
  }
  function launch() {
    if (S || performance.now() < coolUntil) return false;
    ensureUi(); if (board) { const bd = board; board = null; bd.close(); }
    el.style.display = 'block'; el.style.opacity = 1; el.style.pointerEvents = '';
    const w = el.offsetWidth || 300, h = w * 124 / 470, now = performance.now(), side = (Math.random() * 3) | 0;
    const base = Math.max(300, Math.min(600, (W + H) * .27));
    /* in from the left, the right or the top, at a random spot and angle */
    const x = side === 0 ? -w * .6 : side === 1 ? W + w * .6 : W * rand(.25, .75), y = side === 2 ? -h : H * rand(.22, .6);
    const th = side === 0 ? rand(-.5, .5) : side === 1 ? Math.PI + rand(-.5, .5) : Math.PI / 2 + rand(-.7, .7), f = Math.cos(th) >= 0 ? 1 : -1;
    S = { mode: 'fly', w, h, x, y, th, om: 0, omT: 0, nextWander: 0, base, v: base, mul: 1, boost: 0, face: f, faceT: f, rot: 0, until: now + GAME_MS, count: 0, hits: 0, last: 0,
      evadeUntil: 0, evadeDir: 1, exitDir: 1, move: '', moveUntil: 0, zig: 1, fade: 0, wait: 0, alpha: 1, combo: 0, lastHit: 0, bestCombo: 0, gold: 0 };
    nextMove(now, true);
    shield.classList.add('on'); hud.classList.add('on'); hud.classList.remove('gold'); $('b', hud).textContent = '0'; $('small', hud).textContent = 'Tap Santa';
    return true;
  }
  function hit(e) {
    if (!S || S.mode !== 'fly' || S.alpha < .5) return;
    const now = performance.now(), gold = S.until - now < 4000;
    /* hits close together build a combo, and the last few seconds count double */
    S.combo = now - S.lastHit < 1400 ? Math.min(5, S.combo + 1) : 1; S.lastHit = now; S.bestCombo = Math.max(S.bestCombo, S.combo);
    const n = (2 + ((Math.random() * 3) | 0) + (S.combo - 1) * 2) * (gold ? 2 : 1);
    S.hits++; S.count += n; S.v = Math.min(S.v * 1.06, S.base * 1.6); S.boost = .6;
    const dC = wrap(Math.atan2(H * .45 - S.y, W * .5 - S.x) - S.th), edge = S.x < W * .3 || S.x > W * .7 || S.y < H * .3 || S.y > H * .68;
    S.evadeUntil = now + 420; S.evadeDir = edge ? (dC >= 0 ? 1 : -1) : (Math.random() < .5 ? -1 : 1);
    throwGifts(S.x, S.y + S.h * .1, Math.min(6, 2 + S.combo));
    fxApi.text(e.clientX, e.clientY - 26, '+' + n, '#ffe28a');
    if (S.combo > 1) fxApi.text(e.clientX, e.clientY - 58, 'x' + S.combo, '#8ff0e6');
    fxApi.confetti(e.clientX, e.clientY, 8);
    /* sometimes he has had enough of that spot and pops up somewhere else */
    if (S.move !== 'blink' && Math.random() < .3) { S.move = 'blink'; S.fade = -1; S.moveUntil = Infinity; }
    $('b', hud).textContent = S.count; $('small', hud).textContent = gold ? 'double!' : 'presents'; hud.classList.remove('bump'); void hud.offsetWidth; hud.classList.add('bump');
  }
  const scores = () => { const best = A.store.get('santaBest', {}) || {}; return A.names.map(n => ({ n, v: +best[n] || 0 })).filter(r => r.v > 0).sort((p, q) => q.v - p.v); };
  function showBoard(got, isBest, prev) {
    const me = A.me();
    board = A.ui.sheet({
      title: got + ' presents' + (isBest && prev ? '. New best.' : ''),
      html: '<p class="muted">' + (isBest ? (prev ? 'You beat your old best of ' + prev + '.' : 'That is your first score on the board.') : 'Your best is ' + prev + '.') + '</p>' +
        '<ol class="sb-list">' + scores().map((r, i) => '<li' + (r.n === me ? ' class="me"' : '') + '><span class="sb-rank">' + (i ? i + 1 : A.icon('crown', 17)) + '</span>' + A.ui.avatar(r.n, 28) + '<span class="grow">' + A.esc(r.n) + '</span><b>' + r.v + '</b></li>').join('') + '</ol>' +
        '<div class="row gap sb-acts"><button class="btn grow" data-close>Done</button><button class="btn primary grow" id="sbAgain">' + A.icon('sleigh', 18) + 'Go again</button></div>',
      onMount(sh, close) {
        /* nothing on this card can be tapped during the pause either */
        const back = sh.parentNode; back.style.pointerEvents = 'none'; sh.classList.add('sb-wait');
        setTimeout(() => { back.style.pointerEvents = ''; sh.classList.remove('sb-wait'); }, COOL_MS);
        $('#sbAgain', sh).onclick = () => { board = null; close(); if (S) { S = null; el.style.display = 'none'; } coolUntil = 0; launch(); };
      },
      onClose() { board = null; }
    });
  }
  function finish() {
    const me = A.me() || 'Someone', best = A.store.get('santaBest', {}) || {}, prev = +best[me] || 0, got = S.count, isBest = got > prev;
    if (isBest) { best[me] = got; A.store.set('santaBest', best); }
    hud.classList.remove('on');
    /* a short pause before anything behind can be tapped, so a last frantic tap never lands on a button */
    coolUntil = performance.now() + COOL_MS;
    setTimeout(() => { if (!S || S.mode !== 'fly') shield.classList.remove('on'); }, COOL_MS);
    if (got) showBoard(got, isBest, prev);
  }
  function stepSanta(t) {
    if (!S) return;
    const dt = Math.max(0, Math.min(.05, (t - (S.last || t)) / 1000)); S.last = t;
    let mulT = 1;
    if (S.mode === 'fly') {
      if (t > S.until) { S.mode = 'exit'; S.exitDir = Math.cos(S.th) >= 0 ? 1 : -1; S.fade = 0; S.alpha = 1; finish(); }
      else {
        const left = S.until - t, mx = S.w * .32, top = S.h * .6 + 76, bot = H - S.h * .6 - 84;
        $('i', hud).style.transform = 'scaleX(' + Math.max(0, left / GAME_MS).toFixed(3) + ')';
        if (left < 4000 && !S.gold) { S.gold = 1; hud.classList.add('gold'); $('small', hud).textContent = 'double!'; }
        if (t > S.moveUntil) nextMove(t);
        /* vanish, jump to a random spot, come back */
        if (S.move === 'blink') {
          if (S.fade < 0) {
            S.alpha -= dt / .14;
            if (S.alpha <= 0) {
              S.alpha = 0; fxApi.puff(S.x, S.y);
              S.x = rand(mx + 20, Math.max(mx + 30, W - mx - 20)); S.y = rand(top, Math.max(top + 10, bot));
              S.th = Math.atan2(H * .45 - S.y, W * .5 - S.x) + rand(-1, 1); S.om = 0; S.face = S.faceT = Math.cos(S.th) >= 0 ? 1 : -1; S.fade = 1; S.wait = t + 260;
            }
          } else if (t > S.wait) {
            if (S.alpha === 0) fxApi.puff(S.x, S.y);
            S.alpha += dt / .16 + .001;
            if (S.alpha >= 1) { S.alpha = 1; nextMove(t); }
          }
        }
        let target;
        if (S.move === 'loop') target = S.zig * 3.7;
        else if (S.move === 'zigzag') { if (t > S.nextWander) { S.zig = -S.zig; S.nextWander = t + rand(330, 480); } target = S.zig * 3.1; }
        else if (S.move === 'dash' || S.move === 'glide') target = 0;
        else { if (t > S.nextWander) { S.omT = rand(-1.4, 1.4); S.nextWander = t + rand(600, 1500); } target = S.omT; }
        mulT = MUL[S.move] || 1;
        /* look ahead: if he is about to leave the play area, bend the path back toward the middle */
        const k = Math.max(1, S.v * S.mul * (1 + S.boost) / S.base), look = Math.min(S.v * S.mul * .6, Math.min(W, H) * .34), ax = S.x + Math.cos(S.th) * look, ay = S.y + Math.sin(S.th) * look;
        if (ax < mx || ax > W - mx || ay < top || ay > bot) { const d = wrap(Math.atan2(H * .45 - S.y, W * .5 - S.x) - S.th); target = Math.sign(d) * 3 * k * Math.min(1, Math.abs(d) * 1.4); }
        if (t < S.evadeUntil && !(S.x < mx || S.x > W - mx || S.y < top || S.y > bot)) target = S.evadeDir * 4.4;
        S.om += (target - S.om) * Math.min(1, dt * 4.2 * k); S.th += S.om * dt;
      }
    }
    if (S.mode === 'exit') { S.th += wrap((S.exitDir > 0 ? 0 : Math.PI) - S.th) * Math.min(1, dt * 2.6); mulT = 2.2; }
    S.mul += (mulT - S.mul) * Math.min(1, dt * 5);
    S.boost *= Math.max(0, 1 - dt * 1.9);
    const sp = S.alpha <= 0 ? 0 : S.v * S.mul * (1 + S.boost), cs = Math.cos(S.th), sn = Math.sin(S.th);
    S.x += cs * sp * dt; S.y += sn * sp * dt;
    if (cs > .14) S.faceT = 1; else if (cs < -.14) S.faceT = -1;
    S.face += (S.faceT - S.face) * Math.min(1, dt * 13);
    const pitch = Math.max(-30, Math.min(30, Math.atan2(sn, Math.abs(cs) + .3) * 57.3 * .8)); S.rot += (pitch - S.rot) * Math.min(1, dt * 6);
    if (S.mode === 'exit' && (S.x < -S.w * .7 || S.x > W + S.w * .7 || S.y < -S.h * 1.5 || S.y > H + S.h * 1.5)) { S = null; el.style.display = 'none'; return; }
    const f = Math.abs(S.face) < .08 ? (S.face < 0 ? -.08 : .08) : S.face, yb = S.y + Math.sin(t / 380) * 5;
    el.style.transform = 'translate3d(' + (S.x - S.w / 2).toFixed(1) + 'px,' + (yb - S.h / 2).toFixed(1) + 'px,0) scaleX(' + f.toFixed(3) + ') rotate(' + (S.rot * Math.abs(f)).toFixed(2) + 'deg)';
    el.style.opacity = S.alpha.toFixed(2); el.style.pointerEvents = S.alpha < .5 ? 'none' : '';
    if (!LOW && S.alpha > .6) { const rx = S.x - S.faceT * S.w * .46, ry = yb + S.h * .28; fxApi.sparkle(rx + rand(-4, 4), ry + rand(-7, 7)); fxApi.sparkle(rx + rand(-10, 10), ry + rand(-10, 10)); }
  }
  el.addEventListener('pointerdown', e => { e.preventDefault(); hit(e); });

  /* ---------- frame loop ---------- */
  let fN = 0, fAcc = 0, lastT = 0, odd = false;
  function frame(t) {
    requestAnimationFrame(frame);
    if (lastT) { const dt = t - lastT; if (dt < 250) { fAcc += dt; if (++fN === 90) { if (!LOW && fAcc / fN > 25) { LOW = true; document.body.classList.add('low'); flakes = flakes.filter((q, i) => i % 2 === 0); } fN = 0; fAcc = 0; } } }
    lastT = t;
    stepSanta(t); stepParts();
    odd = !odd; if (LOW && odd) return;
    const bl = t < blizzardUntil, wind = Math.sin(t / 6000) * .45 + (bl ? 2.8 : 0), sp = (bl ? 2.4 : 1) * (LOW ? 2 : 1);
    bx.clearRect(0, 0, W, H); bx.fillStyle = '#fff';
    for (const q of flakes) {
      q.y += q.s * sp; q.x += wind * q.s + Math.sin(t / 900 + q.ph) * .3;
      if (q.y > H + 4) { q.y = -4; q.x = Math.random() * W; } if (q.x > W + 4) q.x = -4; else if (q.x < -4) q.x = W + 4;
      bx.globalAlpha = q.o;
      if (q.r < 1.3) bx.fillRect(q.x, q.y, q.r * 1.7, q.r * 1.7); else { bx.beginPath(); bx.arc(q.x, q.y, q.r, 0, 6.283); bx.fill(); }
    }
    bx.globalAlpha = 1;
  }

  A.scene = {
    start() {
      buildSanta(); resize();
      paintBg(A.store.raw.get('bg', 'trees'));
      if (LOW) document.body.classList.add('low');
      requestAnimationFrame(frame);
      A.on('resize', resize);
      document.addEventListener('pointerdown', e => { const c = e.target.classList; if (e.target.id === 'page' || (c && (c.contains('tree-area') || c.contains('count') || c.contains('orns') || c.contains('g-row')))) fxApi.puff(e.clientX, e.clientY); });
    },
    callSanta() { return launch(); },
    backgrounds: () => PHOTOS.map(p => ({ id: p[0], name: p[1], thumb: photoUrl(p[2], 'w=240&h=150&q=60') })),
    background: () => { const k = A.store.raw.get('bg', 'trees'); return PHOTOS.some(p => p[0] === k) ? k : 'trees'; },
    setBackground(key) { A.store.raw.set('bg', key); paintBg(key); },
    blizzard
  };
  if (A.qs.has('debug')) window.__dbg = { launch, frame, hit: () => hit({ clientX: S ? S.x : 100, clientY: S ? S.y : 100 }), end: () => { if (S) S.until = 0; }, state: () => S && { mode: S.mode, move: S.move, x: S.x | 0, y: S.y | 0, count: S.count, combo: S.combo, alpha: +S.alpha.toFixed(2), v: S.v | 0, face: +S.face.toFixed(2) }, shield: () => !!(shield && shield.classList.contains('on')), cooling: () => performance.now() < coolUntil };
})();
