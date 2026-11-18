/* Under the Tree: mini games: hub, leaderboards, Present Catch, Memory Match, Gift Tower.
   Scores live in App.store under 'games':
     { catch: { Name: 42 }, memory: { Name: { moves: 18, time: 41 } }, stack: { Name: 17 } }
   Test hooks (still frames, sample scores, nothing is saved):
     ?gmdemo=play | over | pause | count | board | sprites | sim      ?gmdebug=1 exposes live game state */
(function () {
  'use strict';
  const A = window.App;
  if (!A) return;
  const $ = A.$, $$ = A.$$, esc = A.esc;
  const DEMO = (A.qs && A.qs.get('gmdemo')) || '';
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const clock = s => { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); };
  const prng = seed => () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

  A.icons.gmstack = '<rect x="5.5" y="14.5" width="13" height="6" rx="1.3"/><rect x="4" y="9" width="12" height="5.5" rx="1.3"/><rect x="8" y="3.5" width="11.5" height="5.5" rx="1.3"/>';
  A.icons.gmcards = '<rect x="3.5" y="7" width="10.5" height="13.5" rx="2"/><path d="M8.5 7V5.5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2V15a2 2 0 0 1-2 2H14"/>';

  /* ================= styles ================= */
  A.css(`
/* ---------- games: hub ---------- */
.gm-hub{flex:1;min-height:0;min-width:0;width:100%;max-width:1228px;margin:0 auto;display:flex;flex-direction:column;gap:10px;padding-bottom:6px}
.gm-top{flex:none;display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:44px}
.gm-top .btn{flex:none;padding:0 14px;font-size:14px}
.gm-ttl{min-width:0}
.gm-ttl p{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gm-tiles{flex:1;min-height:0;display:flex;flex-direction:column;gap:10px}
.gm-tile{flex:1 1 0;min-height:0;min-width:0;max-height:240px;display:flex;overflow:hidden;position:relative;background:var(--surface);border:1px solid var(--line);border-radius:var(--r);transition:transform .12s,border-color .15s}
.gm-tile:active{transform:scale(.985)}
.gm-tile:focus-visible{border-radius:var(--r)}
@media(hover:hover){.gm-tile:hover{border-color:rgba(233,196,106,.6)}}
.gm-art{flex:0 0 38%;min-width:0;min-height:0;position:relative;overflow:hidden;container-type:size;background:#0b1c3d}
.gm-art canvas{position:absolute;left:0;top:0;width:100%;height:100%;display:block}
.gm-art-memory{background:radial-gradient(120% 95% at 50% 100%,#1a6f51,#0b3a2b 72%)}
.gm-info{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;gap:3px;padding:8px 14px}
.gm-name{display:flex;align-items:center;justify-content:space-between;gap:8px;font-family:var(--display);font-weight:600;font-size:20px;line-height:1.15;color:#fff}
.gm-name svg{color:var(--gold)}
.gm-how{font-size:12.5px;line-height:1.3;color:var(--muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.gm-rows{display:flex;flex-direction:column;gap:2px;margin-top:4px}
.gm-row{display:flex;align-items:center;gap:7px;min-height:22px;font-size:13.5px}
.gm-who{flex:1;min-width:0;display:flex;align-items:center;gap:5px;font-weight:500;color:#e6ecf6;white-space:nowrap;overflow:hidden}
.gm-who svg{color:var(--gold);flex:none}
.gm-row b{font-weight:600;color:#fff;font-variant-numeric:tabular-nums;white-space:nowrap}
.gm-row em{font-style:normal;color:var(--dim);white-space:nowrap}
.gm-blank{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;flex:none;background:var(--surface2);color:var(--dim)}
.gm-dim{color:var(--dim)}
@container (max-aspect-ratio:1/1) and (max-height:469px){
  .gm-ttl p{display:none}
  .gm-how{-webkit-line-clamp:1}
  .gm-rows{gap:0}
}
@container (max-aspect-ratio:1/1) and (max-height:409px){
  .gm-hub{gap:8px}
  .gm-tiles{gap:8px}
  .gm-info{padding:5px 12px;gap:1px}
  .gm-name{font-size:18px}
  .gm-rows{margin-top:2px}
}
@container (min-aspect-ratio:1/1){
  .gm-tiles{flex-direction:row;justify-content:center;align-items:center;gap:14px}
  .gm-tile{flex-direction:column;height:100%;max-height:500px;max-width:400px}
  .gm-art{flex:1 1 0}
  .gm-info{flex:none;justify-content:flex-start;padding:14px 16px 16px;gap:5px}
  .gm-name{font-size:22px}
  .gm-row{min-height:28px;font-size:14.5px}
}
@container (min-aspect-ratio:1/1) and (max-height:330px){
  .gm-hub{gap:6px;padding-bottom:0}
  .gm-top{min-height:38px}
  .gm-ttl p{display:none}
  .gm-tiles{gap:10px}
  .gm-info{padding:7px 12px 9px;gap:2px}
  .gm-name{font-size:16.5px}
  .gm-how{font-size:12px;line-height:1.3}
  .gm-rows{margin-top:2px;gap:0}
  .gm-row{min-height:23px;font-size:12.5px}
}

/* tile art for Memory Match: three real cards, fanned */
.gm-fan{position:absolute;inset:0}
.gm-mini{--ch:min(60cqh,45cqw);--cw:calc(var(--ch)*.74);position:absolute;left:50%;top:47%;width:var(--cw);height:var(--ch);margin:calc(var(--ch)*-.5) 0 0 calc(var(--cw)*-.5);
  border-radius:calc(var(--cw)*.12);transform-origin:50% 180%;box-shadow:0 calc(var(--ch)*.03) calc(var(--ch)*.09) rgba(0,0,0,.42)}
.gm-mini .gm-face{transform:none}
.gm-mini.a{transform:rotate(-23deg)}
.gm-mini.b{transform:rotate(23deg)}

/* ---------- leaderboards ---------- */
.gm-lb{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px 24px}
.gm-lb h3{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:600;color:var(--gold);margin-bottom:6px}
.gm-lb ol{list-style:none;display:flex;flex-direction:column;gap:2px}
.gm-lb li{display:flex;align-items:center;gap:10px;min-height:40px;padding:4px 10px 4px 6px;border-radius:12px}
.gm-lb li.me{background:var(--surface2)}
.gm-rank{width:20px;flex:none;display:grid;place-items:center;font-weight:600;font-size:13px;color:var(--dim);font-variant-numeric:tabular-nums}
.gm-lb li.top .gm-rank{color:var(--gold)}
.gm-n{flex:1;min-width:0;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gm-lb li b{display:flex;flex-direction:column;align-items:flex-end;line-height:1.2;font-weight:600;font-variant-numeric:tabular-nums;white-space:nowrap}
.gm-lb li b i{font-style:normal;font-weight:500;font-size:12px;color:var(--muted)}
.gm-lb li em{font-style:normal;font-size:13px;color:var(--dim)}
.gm-lb li.none .avatar,.gm-lb li.none .gm-n{opacity:.55}

/* ---------- game frame + HUD ---------- */
.gm-frame{flex:1;min-height:0;min-width:0;width:100%;margin:0 auto;display:flex;flex-direction:column;gap:8px;padding-bottom:6px}
.gm-hud{flex:none;display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:46px}
.gm-hud-a,.gm-hud-b,.gm-hud-g{display:flex;align-items:center;gap:12px;min-width:0}
.gm-meter{display:flex;flex-direction:column;gap:1px;line-height:1.05;min-width:0}
.gm-meter>span{font-size:11.5px;font-weight:600;color:var(--muted)}
.gm-meter>b{font-family:var(--display);font-weight:600;font-size:24px;color:#fff;font-variant-numeric:tabular-nums lining-nums;white-space:nowrap;transform-origin:0 60%}
.gm-meter>b i{font-family:var(--font);font-style:normal;font-weight:500;font-size:12.5px;color:var(--muted);margin-left:5px}
.gm-meter>b em{font-family:var(--font);font-style:normal;font-weight:500;font-size:14px;color:var(--dim)}
.gm-meter>b.gm-gold{color:var(--gold)}
.gm-meter.gm-right{align-items:flex-end;text-align:right}
.gm-meter.gm-right>b{transform-origin:100% 60%}
.gm-lives{display:flex;gap:3px}
.gm-lives span{display:grid;place-items:center;color:var(--red)}
.gm-lives svg{fill:currentColor}
.gm-lives span.off{color:#3b4b6a}
.gm-lives span.off svg{fill:none}
.gm-lives span.gm-lost{animation:gm-lost .45s ease-out}
.gm-lives span.gm-gain{animation:gm-gain .55s cubic-bezier(.2,.8,.3,1.2)}
.gm-stage{flex:1;min-height:0;min-width:0;position:relative;overflow:hidden;border-radius:var(--r);border:1px solid var(--line2);background:#0b1c3d}
.gm-stage canvas{position:absolute;left:0;top:0;width:100%;height:100%;display:block}
.gm-stage.gm-hit::after{content:"";position:absolute;inset:0;border-radius:inherit;box-shadow:inset 0 0 0 5px rgba(215,38,61,.9);animation:gm-flash .4s ease-out both;pointer-events:none}

/* overlays inside a stage or board */
.gm-layer{position:absolute;inset:0;z-index:3;display:flex;align-items:center;justify-content:center;padding:10px;pointer-events:none;border-radius:inherit}
.gm-layer.dim{background:rgba(4,10,24,.66);pointer-events:auto;animation:gm-fade .2s ease both}
.gm-count{display:flex;flex-direction:column;align-items:center;gap:clamp(6px,2.4cqh,14px);text-align:center;margin-bottom:clamp(44px,24cqh,130px)}
.gm-count b{font-family:var(--display);font-weight:600;font-size:clamp(56px,26cqh,120px);line-height:1;color:#fff;font-variant-numeric:lining-nums;text-shadow:0 3px 0 rgba(4,10,24,.45);animation:gm-tick .55s cubic-bezier(.2,.8,.2,1) both}
.gm-count span,.gm-tip{max-width:100%;padding:7px 14px;border-radius:14px;background:rgba(6,14,30,.82);border:1px solid var(--line);font-size:13px;font-weight:500;line-height:1.35;color:#e6ecf6}
.gm-layer.gm-up{align-items:flex-start;padding-top:clamp(12px,5cqh,34px)}
.gm-tip{text-align:center}
.gm-panel{width:min(100%,330px);max-height:100%;display:flex;flex-direction:column;align-items:center;gap:clamp(4px,1.6cqh,8px);text-align:center;padding:clamp(12px,4cqh,22px) 18px clamp(12px,3.6cqh,18px);
  background:var(--surface);border:1px solid var(--line2);border-radius:20px;box-shadow:0 18px 40px rgba(0,0,0,.5);animation:gm-pop .3s cubic-bezier(.2,.9,.3,1.15) both}
.gm-ptitle{font-family:var(--display);font-weight:600;font-size:20px;line-height:1.15;color:#fff}
.gm-big{font-family:var(--display);font-weight:600;font-size:clamp(36px,15cqh,58px);line-height:1;color:#fff;font-variant-numeric:tabular-nums lining-nums}
.gm-unit{font-size:13px;font-weight:500;color:var(--muted);margin-top:-2px}
.gm-chips{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;margin-top:2px}
.gm-chips .chip.gold svg{fill:currentColor}
.gm-acts{display:flex;gap:8px;width:100%;margin-top:clamp(4px,2cqh,10px)}
.gm-acts .btn{flex:1 1 0;min-width:0;padding:0 8px}
.gm-acts.gm-stack{flex-wrap:wrap}
.gm-acts.gm-stack .btn.primary{flex:1 1 100%}

/* ---------- Present Catch ---------- */
.gm-arc{max-width:calc((100cqh - 68px)*1.2);touch-action:none}
@container (max-height:460px) and (min-aspect-ratio:3/2){
  .gm-arc{flex-direction:row;gap:12px;padding-bottom:0;max-width:calc(100cqh*1.5 + 224px)}
  .gm-arc .gm-hud{display:contents}
  .gm-arc .gm-hud-a,.gm-arc .gm-hud-b{flex:0 0 100px;flex-direction:column;justify-content:space-between;padding-bottom:4px}
  .gm-arc .gm-hud-a{order:0;align-items:flex-start}
  .gm-arc .gm-stage{order:1}
  .gm-arc .gm-hud-b{order:2;align-items:flex-end;flex-direction:column-reverse}
  .gm-arc .gm-hud-g{flex-direction:column;align-items:flex-end;gap:8px}
  .gm-arc .gm-meter>b{font-size:30px}
}

/* ---------- Memory Match ---------- */
.gm-mem{max-width:1290px;position:relative}
.gm-board{flex:1;min-height:0;min-width:0;position:relative;display:flex;align-items:center;justify-content:center;border-radius:var(--r)}
.gm-grid{display:grid;grid-template-columns:repeat(var(--cols,4),var(--cw,60px));grid-auto-rows:var(--ch,80px);gap:var(--gap,8px)}
.gm-card{display:block;position:relative;width:100%;height:100%;padding:0;border-radius:calc(var(--cw,60px)*.12);perspective:700px}
.gm-grid.gm-dealing .gm-card{animation:gm-deal .34s cubic-bezier(.2,.8,.2,1) both;animation-delay:calc(var(--i,0)*22ms)}
.gm-card:focus-visible{border-radius:calc(var(--cw,60px)*.12)}
.gm-card-in{position:absolute;inset:0;display:block;border-radius:inherit;transform-style:preserve-3d;transition:transform .44s cubic-bezier(.3,.7,.25,1)}
.gm-card.up .gm-card-in{transform:rotateY(180deg)}
.gm-card:not(.up):active .gm-card-in{transform:scale(.95)}
.gm-face,.gm-backf{position:absolute;inset:0;display:grid;place-items:center;overflow:hidden;border-radius:inherit;backface-visibility:hidden;-webkit-backface-visibility:hidden;box-shadow:0 2px 5px rgba(0,0,0,.35)}
.gm-backf{color:var(--gold);background:
  repeating-linear-gradient(45deg,rgba(255,255,255,.06) 0 1.5px,rgba(255,255,255,0) 1.5px 9px),
  repeating-linear-gradient(-45deg,rgba(255,255,255,.06) 0 1.5px,rgba(255,255,255,0) 1.5px 9px),
  linear-gradient(160deg,#c9243f,#8b1127)}
.gm-backf::before{content:"";position:absolute;inset:calc(var(--cw,60px)*.075);border:1.5px solid rgba(233,196,106,.8);border-radius:calc(var(--cw,60px)*.07)}
.gm-backf svg{position:relative;width:42%;height:auto}
.gm-face{transform:rotateY(180deg);background:#f7f2e6;color:var(--k,#147150)}
.gm-face::before{content:"";position:absolute;left:50%;top:50%;width:72%;aspect-ratio:1;border-radius:50%;background:currentColor;opacity:.1;transform:translate(-50%,-50%)}
.gm-face svg{position:relative;width:50%;height:auto}
.gm-card.done .gm-face{box-shadow:inset 0 0 0 3px var(--gold2),0 2px 5px rgba(0,0,0,.35)}
.gm-card.done .gm-face::before{opacity:.17}
.gm-card.pop{animation:gm-match .42s cubic-bezier(.2,.8,.3,1.2)}
.gm-card.no{animation:gm-no .34s ease-in-out}
.gm-grid.win .gm-card{animation:gm-wave .62s cubic-bezier(.3,.7,.3,1) both;animation-delay:calc(var(--i,0)*42ms)}
@container (max-height:330px){
  .gm-mem{gap:6px;padding-bottom:0}
  .gm-mem .gm-hud{min-height:44px}
}

.gm-demo *,.gm-demo *::after{animation:none!important}
@keyframes gm-tick{from{opacity:0;transform:scale(1.5)}to{opacity:1;transform:none}}
@keyframes gm-pop{from{opacity:0;transform:translateY(10px) scale(.94)}to{opacity:1;transform:none}}
@keyframes gm-fade{from{opacity:0}to{opacity:1}}
@keyframes gm-flash{from{opacity:1}to{opacity:0}}
@keyframes gm-lost{0%{transform:scale(1.7)}100%{transform:none}}
@keyframes gm-gain{0%{transform:scale(.3)}55%{transform:scale(1.5)}100%{transform:none}}
@keyframes gm-deal{from{opacity:0;transform:translateY(10px) scale(.94)}to{opacity:1;transform:none}}
@keyframes gm-match{0%{transform:none}45%{transform:scale(1.08)}100%{transform:none}}
@keyframes gm-no{0%,100%{transform:none}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
@keyframes gm-wave{0%,100%{transform:none}40%{transform:translateY(-11%) scale(1.04)}}
`);

  /* ================= scores ================= */
  /* sample scores for the screenshot hooks only, spread over whoever is in the group. Never saved. */
  const SAMPLE = { catch: [34, 41, 58, 47, 26, 0], memory: [[15, 52], [12, 44], [14, 39], [13, 41], 0, [19, 77]], stack: [21, 0, 14, 17, 9, 11] };
  function readAll() {
    if (DEMO) {
      const out = {};
      Object.keys(SAMPLE).forEach(k => { out[k] = {}; A.names.forEach((n, i) => { const v = SAMPLE[k][i % 6]; if (v) out[k][n] = v.length ? { moves: v[0], time: v[1] } : v; }); });
      return out;
    }
    const s = A.store.get('games', null);
    return s && typeof s === 'object' ? s : {};
  }
  function bestOf(g, name) { const t = readAll()[g.id], v = t && t[name]; return g.valid(v) ? v : null; }
  function ranked(g) {
    return A.names.map(n => ({ name: n, v: bestOf(g, n) })).filter(r => r.v != null)
      .sort((a, b) => g.better(a.v, b.v) ? -1 : g.better(b.v, a.v) ? 1 : 0);
  }
  /* record a result for the current person. returns { isBest, leads } */
  function submit(g, v) {
    const me = A.me(), prev = bestOf(g, me), others = ranked(g).filter(r => r.name !== me);
    const isBest = g.valid(v) && (prev == null || g.better(v, prev));
    const leads = isBest && others.length > 0 && g.better(v, others[0].v);
    if (isBest && !DEMO) {
      const all = readAll(), t = all[g.id] && typeof all[g.id] === 'object' ? all[g.id] : {};
      t[me] = v; all[g.id] = t; A.store.set('games', all);
    }
    return { isBest, leads };
  }

  /* ================= canvas drawing shared by the game and its tile ================= */
  function rr(g, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    g.beginPath(); g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }
  function poly(g, pts, s) {
    g.beginPath();
    for (let i = 0; i < pts.length; i++) { if (i) g.lineTo(pts[i][0] * s, pts[i][1] * s); else g.moveTo(pts[i][0] * s, pts[i][1] * s); }
    g.closePath();
  }
  /* an offscreen picture drawn once, stamped every frame */
  function sprite(w, h, dpr, draw, ox, oy) {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.ceil(w * dpr)); c.height = Math.max(1, Math.ceil(h * dpr));
    if (ox == null) { ox = w / 2; oy = h / 2; }
    const g = c.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, ox * dpr, oy * dpr); draw(g);
    return { c, w: c.width / dpr, h: c.height / dpr, ox, oy };
  }
  function blit(g, sp, x, y, rot, sx, sy, alpha) {
    g.save(); g.translate(x, y);
    if (rot) g.rotate(rot);
    if (sx !== 1 || sy !== 1) g.scale(sx, sy);
    g.globalAlpha = alpha; g.drawImage(sp.c, -sp.ox, -sp.oy, sp.w, sp.h); g.restore();
  }

  const GIFTS = [
    { box: '#d7263d', lid: '#e64c60', rib: '#f1d27c', ribD: '#c99a2e', pat: 'dots', w: 1, h: 1 },
    { box: '#1f9d6b', lid: '#33b885', rib: '#f5f0e4', ribD: '#cbc3ae', pat: 'stripes', w: .86, h: 1.14 },
    { box: '#3b82f6', lid: '#66a2ff', rib: '#f5f0e4', ribD: '#cbc3ae', pat: 'plain', w: 1.12, h: .84, cross: 1 },
    { box: '#e9c46a', lid: '#f5de98', rib: '#d7263d', ribD: '#a3162a', pat: 'plain', w: 1, h: 1, cross: 1 },
    { box: '#a3162a', lid: '#c2203a', rib: '#43c693', ribD: '#147150', pat: 'stripes', w: 1.1, h: .88 },
    { box: '#147150', lid: '#1f9d6b', rib: '#e9c46a', ribD: '#c99a2e', pat: 'dots', w: .9, h: 1.08 }
  ];
  /* a wrapped present centered on 0,0 inside a box of side s */
  function drawGift(g, s, v) {
    const hw = s * .39 * v.w, bh = s * .56 * v.h, lh = s * .16, lw = hw + s * .045, bow = s * .2, rw = s * .15;
    const lidTop = -(bh + lh + bow) / 2 + bow, top = lidTop + lh - s * .015;
    rr(g, -hw, top, hw * 2, bh, s * .05); g.fillStyle = v.box; g.fill();
    g.save(); g.clip();
    if (v.pat === 'dots') {
      g.fillStyle = 'rgba(255,255,255,.3)';
      const st = s * .17;
      for (let r = 0, y = top + st * .75; y < top + bh; y += st, r++) for (let x = -hw + (r % 2 ? st : st * .5); x < hw; x += st) { g.beginPath(); g.arc(x, y, s * .028, 0, TAU); g.fill(); }
    } else if (v.pat === 'stripes') {
      g.strokeStyle = 'rgba(255,255,255,.2)'; g.lineWidth = s * .05; g.beginPath();
      for (let x = -hw - bh; x < hw; x += s * .17) { g.moveTo(x, top + bh); g.lineTo(x + bh, top); }
      g.stroke();
    }
    g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(hw * .42, top, hw, bh);
    g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(-hw, top, hw * .2, bh);
    g.restore();
    g.fillStyle = v.rib; g.fillRect(-rw / 2, top, rw, bh);
    if (v.cross) g.fillRect(-hw, top + bh * .52 - rw * .4, hw * 2, rw * .8);
    g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(-hw, top, hw * 2, s * .05);
    rr(g, -lw, lidTop, lw * 2, lh, s * .045); g.fillStyle = v.lid; g.fill();
    g.fillStyle = v.rib; g.fillRect(-rw / 2, lidTop, rw, lh);
    g.fillStyle = 'rgba(255,255,255,.26)'; rr(g, -lw + s * .035, lidTop + s * .025, lw * 2 - s * .07, s * .03, s * .015); g.fill();
    for (let k = -1; k <= 1; k += 2) {
      g.beginPath(); g.moveTo(0, lidTop);
      g.bezierCurveTo(k * s * .06, lidTop - s * .26, k * s * .36, lidTop - s * .24, k * s * .3, lidTop - s * .06);
      g.bezierCurveTo(k * s * .26, lidTop + s * .01, k * s * .1, lidTop - s * .01, 0, lidTop);
      g.fillStyle = v.rib; g.fill();
      g.beginPath(); g.moveTo(k * s * .07, lidTop - s * .05);
      g.bezierCurveTo(k * s * .1, lidTop - s * .16, k * s * .25, lidTop - s * .155, k * s * .225, lidTop - s * .075);
      g.bezierCurveTo(k * s * .2, lidTop - s * .04, k * s * .12, lidTop - s * .04, k * s * .07, lidTop - s * .05);
      g.fillStyle = v.ribD; g.fill();
    }
    rr(g, -s * .055, lidTop - s * .095, s * .11, s * .11, s * .035); g.fillStyle = v.rib; g.fill();
    g.strokeStyle = v.ribD; g.lineWidth = Math.max(1, s * .02); g.stroke();
  }
  function drawCoal(g, s) {
    const O = [[-.43, -.1], [-.25, -.4], [.08, -.46], [.38, -.28], [.47, .05], [.3, .36], [-.06, .45], [-.37, .29]];
    const C = [-.04, -.12], D = [.14, -.02];
    poly(g, O, s); g.fillStyle = '#171a21'; g.fill();
    poly(g, [O[0], O[1], O[2], C], s); g.fillStyle = '#4b5468'; g.fill();
    poly(g, [O[2], O[3], D, C], s); g.fillStyle = '#343a49'; g.fill();
    poly(g, [O[3], O[4], O[5], D], s); g.fillStyle = '#252a35'; g.fill();
    poly(g, [O[0], C, O[7]], s); g.fillStyle = '#2d323f'; g.fill();
    poly(g, [[-.3, -.2], [-.2, -.34], [-.02, -.38], [-.14, -.22]], s); g.fillStyle = '#8c98b0'; g.fill();
    poly(g, [[.2, -.2], [.3, -.14], [.24, -.06]], s); g.fillStyle = '#4a5365'; g.fill();
    poly(g, [[-.2, .14], [-.08, .2], [-.18, .3]], s); g.fillStyle = '#2b303b'; g.fill();
    poly(g, O, s); g.lineJoin = 'round'; g.lineWidth = Math.max(1.2, s * .04); g.strokeStyle = '#8693ad'; g.stroke();
  }
  function drawStar(g, s) {
    const R = s * .45, r = R * .47, P = [];
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, d = i % 2 ? r : R; P.push([Math.cos(a) * d, Math.sin(a) * d]); }
    const path = () => { g.beginPath(); for (let i = 0; i < 10; i++) { if (i) g.lineTo(P[i][0], P[i][1]); else g.moveTo(P[i][0], P[i][1]); } g.closePath(); };
    g.lineJoin = 'round';
    path(); g.fillStyle = g.strokeStyle = '#b38418'; g.lineWidth = s * .13; g.fill(); g.stroke();
    path(); g.fillStyle = g.strokeStyle = '#f1cd66'; g.lineWidth = s * .055; g.fill(); g.stroke();
    for (let i = 0; i < 10; i += 2) {
      const o = P[i], a = P[(i + 9) % 10], b = P[(i + 1) % 10];
      g.beginPath(); g.moveTo(0, 0); g.lineTo(o[0], o[1]); g.lineTo(a[0], a[1]); g.closePath(); g.fillStyle = 'rgba(255,255,255,.36)'; g.fill();
      g.beginPath(); g.moveTo(0, 0); g.lineTo(o[0], o[1]); g.lineTo(b[0], b[1]); g.closePath(); g.fillStyle = 'rgba(160,100,0,.2)'; g.fill();
    }
  }
  /* a heart to catch: wins one back */
  function drawHeart(g, s) {
    const k = s * .4;
    const path = () => {
      g.beginPath(); g.moveTo(0, k * 1.02);
      g.bezierCurveTo(-k * 1.5, k * .05, -k * 1.2, -k * 1.05, -k * .52, -k * .95);
      g.bezierCurveTo(-k * .22, -k * .9, 0, -k * .68, 0, -k * .42);
      g.bezierCurveTo(0, -k * .68, k * .22, -k * .9, k * .52, -k * .95);
      g.bezierCurveTo(k * 1.2, -k * 1.05, k * 1.5, k * .05, 0, k * 1.02); g.closePath();
    };
    g.lineJoin = 'round';
    path(); g.fillStyle = g.strokeStyle = '#fff1f3'; g.lineWidth = s * .15; g.fill(); g.stroke();
    path(); g.fillStyle = g.strokeStyle = '#e8304b'; g.lineWidth = s * .03; g.fill(); g.stroke();
    g.save(); path(); g.clip();
    g.fillStyle = 'rgba(120,0,30,.3)'; g.beginPath(); g.ellipse(k * .75, k * .55, k * .95, k * 1.25, .55, 0, TAU); g.fill();
    g.restore();
    g.beginPath(); g.ellipse(-k * .5, -k * .5, k * .22, k * .13, -.65, 0, TAU); g.fillStyle = 'rgba(255,255,255,.8)'; g.fill();
  }
  /* Santa's sack. 0,0 is the middle of its base. Back = inside of the mouth, front = everything else,
     so a present drawn between the two drops into it. */
  const sackGeo = u => { const w = u * 2.3, h = u * 1.95; return { w, h, my: -h * .86, rx: w * .4, ry: h * .11 }; };
  function fluff(g, q, a0, a1, n, rad, dy, col) {
    g.fillStyle = col; g.beginPath();
    for (let i = 0; i <= n; i++) { const t = a0 + (a1 - a0) * i / n, r = rad * (i % 2 ? 1 : .9), x = Math.cos(t) * q.rx, y = q.my + Math.sin(t) * q.ry + dy; g.moveTo(x + r, y); g.arc(x, y, r, 0, TAU); }
    g.fill();
  }
  function drawSackBack(g, u) {
    const q = sackGeo(u);
    g.beginPath(); g.ellipse(0, q.my, q.rx, q.ry, 0, 0, TAU); g.fillStyle = '#33060f'; g.fill();
    fluff(g, q, Math.PI, TAU, 22, q.h * .06, 0, '#cbc2ac');
  }
  function drawSackFront(g, u) {
    const q = sackGeo(u), w = q.w, h = q.h, my = q.my, rx = q.rx, ny = my + h * .2;
    g.beginPath(); g.moveTo(-rx, my);
    g.bezierCurveTo(-rx, my + h * .09, -w * .33, my + h * .11, -w * .345, ny);
    g.bezierCurveTo(-w * .37, ny + h * .14, -w * .57, -h * .46, -w * .5, -h * .2);
    g.bezierCurveTo(-w * .46, -h * .03, -w * .38, 0, -w * .26, 0);
    g.lineTo(w * .26, 0);
    g.bezierCurveTo(w * .38, 0, w * .46, -h * .03, w * .5, -h * .2);
    g.bezierCurveTo(w * .57, -h * .46, w * .37, ny + h * .14, w * .345, ny);
    g.bezierCurveTo(w * .33, my + h * .11, rx, my + h * .09, rx, my);
    g.ellipse(0, my, rx, q.ry, 0, 0, Math.PI); g.closePath();
    g.fillStyle = '#c2203a'; g.fill();
    g.save(); g.clip();
    g.fillStyle = 'rgba(70,0,14,.26)';
    g.beginPath(); g.moveTo(w * .14, my - h * .1); g.bezierCurveTo(w * .1, ny + h * .1, w * .36, -h * .34, w * .12, h * .05); g.lineTo(w, h * .05); g.lineTo(w, my - h * .1); g.closePath(); g.fill();
    g.fillRect(-w, -h * .1, w * 2, h * .2);
    g.lineCap = 'round';
    g.strokeStyle = 'rgba(255,255,255,.17)'; g.lineWidth = w * .07;
    g.beginPath(); g.moveTo(-w * .36, -h * .43); g.quadraticCurveTo(-w * .43, -h * .32, -w * .4, -h * .2); g.stroke();
    g.strokeStyle = 'rgba(70,0,14,.4)'; g.lineWidth = Math.max(1, w * .016);
    g.beginPath();
    g.moveTo(-w * .2, ny + h * .1); g.quadraticCurveTo(-w * .25, ny + h * .2, -w * .23, ny + h * .32);
    g.moveTo(-w * .02, ny + h * .12); g.quadraticCurveTo(-w * .03, ny + h * .2, -w * .01, ny + h * .27);
    g.moveTo(w * .24, ny + h * .09); g.quadraticCurveTo(w * .3, ny + h * .2, w * .29, ny + h * .34);
    g.stroke();
    g.beginPath(); g.ellipse(0, my + h * .05, rx, q.ry, 0, 0, Math.PI); g.strokeStyle = 'rgba(70,0,14,.3)'; g.lineWidth = h * .15; g.stroke();
    g.restore();
    /* gold cord around the neck, knotted at the front */
    g.lineCap = 'round';
    const cord = (col, lw, dy) => { g.beginPath(); g.ellipse(0, ny + dy, w * .352, h * .075, 0, .02, Math.PI - .02); g.strokeStyle = col; g.lineWidth = lw; g.stroke(); };
    cord('#9c7012', h * .062, h * .014); cord('#e9c46a', h * .05, 0);
    const kx = w * .15, ky = ny + h * .068;
    g.strokeStyle = '#9c7012'; g.lineWidth = h * .056;
    g.beginPath(); g.moveTo(kx, ky); g.quadraticCurveTo(kx - w * .03, ky + h * .1, kx - w * .065, ky + h * .17); g.moveTo(kx, ky); g.quadraticCurveTo(kx + w * .045, ky + h * .09, kx + w * .035, ky + h * .2); g.stroke();
    g.strokeStyle = '#e9c46a'; g.lineWidth = h * .038; g.stroke();
    g.beginPath(); g.arc(kx, ky, h * .043, 0, TAU); g.fillStyle = '#f1d27c'; g.fill(); g.strokeStyle = '#9c7012'; g.lineWidth = Math.max(1, h * .014); g.stroke();
    /* fur trim */
    fluff(g, q, 0, Math.PI, 24, h * .078, h * .026, '#cbc2ac');
    fluff(g, q, 0, Math.PI, 24, h * .078, 0, '#f5f0e4');
    g.beginPath(); g.ellipse(0, my - h * .028, rx, q.ry, 0, .3, Math.PI - .3); g.strokeStyle = '#ffffff'; g.lineWidth = h * .04; g.stroke();
  }
  function pine(g, x, y, h) {
    g.beginPath();
    for (let i = 0; i < 3; i++) { const t = y - h + i * h * .24, b = y - h * .52 + i * h * .26, hw = h * (.16 + i * .07); g.moveTo(x, t); g.lineTo(x + hw, b); g.lineTo(x - hw, b); g.closePath(); }
    g.fill();
  }
  /* night sky, two ridges with pines, snowy ground of height gh. part: 'sky' or 'ground' paints just that */
  function paintBg(g, W, H, gh, u, seed, part) {
    const rnd = prng(seed), hy = H - gh;
    if (part !== 'ground') {
      const sky = g.createLinearGradient(0, 0, 0, hy);
      sky.addColorStop(0, '#061229'); sky.addColorStop(.6, '#0d2850'); sky.addColorStop(1, '#1c4c79');
      g.fillStyle = sky; g.fillRect(0, 0, W, H);
      const n = Math.round(clamp(W * H / 4600, 12, 80)), span = part === 'sky' ? H * .96 : hy * .74;
      g.fillStyle = '#fff';
      for (let i = 0; i < n; i++) { const x = rnd() * W, y = rnd() * span, r = .55 + rnd() * .9; g.globalAlpha = .22 + rnd() * .6; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
      g.globalAlpha = 1;
      if (part === 'sky') return;
    }
    const ridge = (base, amp, k, ph) => x => base - amp * (.5 + .5 * Math.sin(x / W * k + ph));
    const fill = (f, col) => { g.beginPath(); g.moveTo(0, H); for (let i = 0; i <= 32; i++) { const x = W * i / 32; g.lineTo(x, f(x)); } g.lineTo(W, H); g.closePath(); g.fillStyle = col; g.fill(); };
    const far = ridge(hy - u * .15, u * 1.1, 5.2, seed), near = ridge(hy + u * .1, u * .75, 3.4, seed + 2);
    fill(far, '#12335a');
    g.fillStyle = '#0d2748';
    for (let i = 0, c = Math.max(4, Math.round(W / (u * 1.5))); i < c; i++) { const x = (i + .15 + rnd() * .7) * W / c; pine(g, x, far(x) + u * .1, u * (.7 + rnd() * .75)); }
    fill(near, '#1a4470');
    g.fillStyle = '#123459';
    for (let i = 0, c = Math.max(3, Math.round(W / (u * 2.6))); i < c; i++) { const x = (i + .1 + rnd() * .8) * W / c; pine(g, x, near(x) + u * .12, u * (1 + rnd() * .8)); }
    const top = x => hy + Math.sin(x / W * 7 + seed) * gh * .09;
    const snow = g.createLinearGradient(0, hy, 0, H);
    snow.addColorStop(0, '#eef4fb'); snow.addColorStop(1, '#b9cce4');
    fill(top, snow);
    g.beginPath(); for (let i = 0; i <= 32; i++) { const x = W * i / 32; if (i) g.lineTo(x, top(x) + 1); else g.moveTo(x, top(x) + 1); }
    g.strokeStyle = '#ffffff'; g.lineWidth = 2; g.stroke();
  }
  /* the Present Catch tile picture */
  function artCatch(g, W, H) {
    const u = Math.min(W / 4.7, H / 3.7), gh = Math.max(u * .5, H * .1), base = H - gh * .5, cx = W / 2;
    paintBg(g, W, H, gh, u, 9);
    const sx = Math.min(W / 2 - u * .62, u * 3.3), sy = clamp((H - gh) / (u * 3.5), 1, 1.8);
    const put = (fn, fx, fy, rot, k) => { g.save(); g.translate(cx + fx * sx, base - fy * u * (fy > 2 ? sy : 1)); g.rotate(rot); fn(g, u * k); g.restore(); };
    g.fillStyle = 'rgba(30,60,105,.22)'; g.beginPath(); g.ellipse(cx, base + u * .04, u * 1.2, u * .14, 0, 0, TAU); g.fill();
    g.save(); g.translate(cx, base); drawSackBack(g, u); g.restore();
    put((c, s) => drawGift(c, s, GIFTS[3]), .04, 1.78, .16, .95);
    g.save(); g.translate(cx, base); drawSackFront(g, u); g.restore();
    put((c, s) => drawGift(c, s, GIFTS[0]), -.7, 2.25, -.26, 1);
    put((c, s) => drawGift(c, s, GIFTS[1]), .74, 2.05, .22, 1);
    put(drawStar, .3, 2.85, .2, .9);
    put(drawCoal, -.86, .95, .5, .8);
    put((c, s) => drawGift(c, s, GIFTS[2]), .9, .78, -.14, .9);
  }

  /* ================= panels shared by the games ================= */
  function endPanel(title, big, unit, res, note) {
    const chips = (res.isBest ? '<span class="chip gold">' + A.icon('star') + 'New best</span>' : '') + (res.leads ? '<span class="chip green">' + A.icon('crown') + 'Family champion</span>' : '');
    return '<div class="gm-panel" role="dialog" aria-label="' + title + '"><div class="gm-ptitle">' + title + '</div>' +
      '<div class="gm-big">' + big + '</div><div class="gm-unit">' + unit + '</div>' +
      (chips ? '<div class="gm-chips">' + chips + '</div>' : '<p class="muted small">' + note + '</p>') +
      '<div class="gm-acts"><a class="btn ghost" href="#/games">Back to games</a><button class="btn primary" data-act="again">Play again</button></div></div>';
  }
  const PAUSED = '<div class="gm-panel" role="dialog" aria-label="Paused"><div class="gm-ptitle">Paused</div>' +
    '<div class="gm-acts gm-stack"><button class="btn primary" data-act="resume">Resume</button>' +
    '<button class="btn ghost" data-act="again">Restart</button><a class="btn ghost" href="#/games">Back to games</a></div></div>';
  function focusAgain(lay) { const b = lay && $('[data-act="again"]', lay); if (b && A.canHover) try { b.focus({ preventScroll: true }); } catch (e) {} }
  function party(el, n) { if (!DEMO && el && A.fx && A.fx.confetti) { const r = el.getBoundingClientRect(); A.fx.confetti(r.left + r.width / 2, r.top + r.height * .38, n); } }

  /* ================= hub ================= */
  function tileHTML(g) {
    const me = A.me(), mine = bestOf(g, me), champ = ranked(g)[0];
    return '<a class="gm-tile" href="#/games/' + g.id + '" aria-label="Play ' + g.name + '">' +
      '<div class="gm-art gm-art-' + g.id + '" data-art="' + g.id + '">' + (g.artHTML || '<canvas></canvas>') + '</div>' +
      '<div class="gm-info">' +
        '<div class="gm-name"><span>' + g.name + '</span>' + A.icon('next', 20) + '</div>' +
        '<p class="gm-how">' + g.how + '</p>' +
        '<div class="gm-rows">' +
          '<div class="gm-row">' + A.ui.avatar(me, 22) + '<span class="gm-who">Your best</span>' + (mine != null ? '<b>' + g.short(mine) + '</b>' : '<em>None yet</em>') + '</div>' +
          (champ
            ? '<div class="gm-row" title="Family champion">' + A.ui.avatar(champ.name, 22) + '<span class="gm-who">' + (champ.name === me ? 'You lead' : esc(champ.name)) + A.icon('crown', 15) + '</span><b>' + g.short(champ.v) + '</b></div>'
            : '<div class="gm-row"><span class="gm-blank">' + A.icon('crown', 13) + '</span><span class="gm-who gm-dim">No champion yet</span></div>') +
        '</div>' +
      '</div></a>';
  }
  function boardsHTML() {
    const me = A.me();
    return '<div class="gm-lb">' + GAMES.map(g => {
      const rows = ranked(g), rest = A.names.filter(n => !rows.some(r => r.name === n));
      return '<section><h3>' + A.icon(g.icon, 18) + '<span>' + g.name + '</span></h3><ol>' +
        rows.map((r, i) => '<li class="' + (i ? '' : 'top') + (r.name === me ? ' me' : '') + '"><span class="gm-rank">' + (i ? i + 1 : A.icon('crown', 17)) + '</span>' + A.ui.avatar(r.name, 28) + '<span class="gm-n">' + esc(r.name) + '</span><b>' + g.long(r.v) + '</b></li>').join('') +
        rest.map(n => '<li class="none' + (n === me ? ' me' : '') + '"><span class="gm-rank"></span>' + A.ui.avatar(n, 28) + '<span class="gm-n">' + esc(n) + '</span><em>No score</em></li>').join('') +
        '</ol></section>';
    }).join('') + '</div>';
  }
  let sheet = null;
  function openBoards() {
    if (sheet) return;
    sheet = A.ui.sheet({ title: 'Leaderboards', wide: true, html: boardsHTML(), onClose() { sheet = null; } });
  }
  function mountHub(root) {
    root.innerHTML = '<div class="gm-hub">' +
      '<div class="gm-top"><div class="gm-ttl"><h1 class="h1">Games</h1><p class="muted small">Scores save under ' + esc(A.me()) + '.</p></div>' +
      '<button class="btn" data-lb>' + A.icon('trophy', 18) + '<span>Leaderboards</span></button></div>' +
      '<div class="gm-tiles">' + GAMES.map(tileHTML).join('') + '</div></div>';
    const arts = $$('[data-art]', root).map(el => ({ el, cv: $('canvas', el), g: GAMES.find(x => x.id === el.dataset.art), w: 0, h: 0 })).filter(a => a.cv && a.g.art);
    const paint = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const todo = arts.filter(a => { const w = a.el.clientWidth, h = a.el.clientHeight; if (!w || !h || (w === a.w && h === a.h)) return false; a.w = w; a.h = h; return true; });
      todo.forEach(a => {
        a.cv.width = Math.round(a.w * dpr); a.cv.height = Math.round(a.h * dpr);
        const g = a.cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); a.g.art(g, a.w, a.h);
      });
    };
    paint();
    let ro = null;
    if (window.ResizeObserver) { ro = new ResizeObserver(paint); ro.observe($('.gm-tiles', root)); }
    $('[data-lb]', root).onclick = openBoards;
    if (DEMO === 'board') openBoards();
    return { hub: true, destroy() { if (ro) ro.disconnect(); }, resize: paint };
  }

  /* ================= Present Catch ================= */
  function mountCatch(root, game) {
    const me = A.me();
    let best = bestOf(game, me) || 0;
    root.innerHTML = '<div class="gm-frame gm-arc">' +
      '<div class="gm-hud">' +
        '<div class="gm-hud-a"><a class="icon-btn solid" href="#/games" aria-label="Back to games">' + A.icon('back') + '</a>' +
          '<div class="gm-meter"><span>Score</span><b data-score>0</b></div></div>' +
        '<div class="gm-hud-b"><div class="gm-hud-g"><div class="gm-lives" data-lives aria-label="Hearts"></div>' +
          '<div class="gm-meter gm-right"><span>Best</span><b data-best>0</b></div></div>' +
          '<button class="icon-btn solid" data-pause aria-label="Pause">' + A.icon('pause') + '</button></div>' +
      '</div>' +
      '<div class="gm-stage"><canvas></canvas></div></div>';
    const frame = $('.gm-arc', root), stage = $('.gm-stage', root), cv = $('canvas', stage), ctx = cv.getContext('2d', { alpha: false });
    const scoreEl = $('[data-score]', root), bestEl = $('[data-best]', root), livesEl = $('[data-lives]', root);
    const hint = (A.canHover ? 'Move the mouse or use the arrow keys.' : 'Drag anywhere to slide the sack.') + '<br>A miss or a lump of coal costs a heart.';
    let W = 0, H = 0, dpr = 1, u = 32, gh = 20, baseY = 0, groundY = 0, lanes = 6, lo = .1, hi = .9, left = 0, geo = sackGeo(32);
    let raf = 0, last = 0, alive = true, lay = null, drag = null, snow = null, quiet = false;
    const SP = {}, S = {}, keys = { l: false, r: false }, timers = [];
    const later = (fn, ms) => { const id = setTimeout(() => { const i = timers.indexOf(id); if (i >= 0) timers.splice(i, 1); if (alive) fn(); }, ms); timers.push(id); };
    const clearTimers = () => { timers.forEach(clearTimeout); timers.length = 0; };

    /* ----- size + sprites ----- */
    function textSprite(txt, col) {
      const fs = Math.round(u * .6);
      return sprite(fs * (1.3 + txt.length * .62), fs * 1.6, dpr, g => {
        g.font = '700 ' + fs + 'px "DM Sans",system-ui,-apple-system,"Segoe UI",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.lineJoin = 'round'; g.lineWidth = Math.max(2, fs * .24); g.strokeStyle = 'rgba(4,10,24,.8)'; g.strokeText(txt, 0, 0);
        g.fillStyle = col; g.fillText(txt, 0, 0);
      });
    }
    function buildText() { SP.p1 = textSprite('+1', '#ffffff'); SP.p5 = textSprite('+5', '#f1d27c'); SP.miss = textSprite('Missed', '#ff9aa6'); }
    function build() {
      const item = (k, fn) => sprite(u * k * 1.3, u * k * 1.3, dpr, g => fn(g, u * k));
      SP.gifts = GIFTS.map(v => item(1.04, (g, s) => drawGift(g, s, v)));
      SP.star = item(1.02, drawStar); SP.coal = item(.92, drawCoal); SP.heart = item(.96, drawHeart);
      SP.back = sprite(geo.w * 1.2, geo.h * 1.2, dpr, g => drawSackBack(g, u), geo.w * .6, geo.h * 1.1);
      SP.front = sprite(geo.w * 1.2, geo.h * 1.2, dpr, g => drawSackFront(g, u), geo.w * .6, geo.h * 1.1);
      buildText();
      const b = document.createElement('canvas'); b.width = cv.width; b.height = cv.height;
      const g = b.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); paintBg(g, W, H, gh, u, 5);
      SP.bg = b;
    }
    function measure() {
      const w = stage.clientWidth, h = stage.clientHeight;
      if (!w || !h) return;
      left = stage.getBoundingClientRect().left + stage.clientLeft;
      const d = Math.min(2, window.devicePixelRatio || 1);
      if (w === W && h === H && d === dpr) return;
      W = w; H = h; dpr = d;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      u = clamp(Math.min(W / 8.4, H / 6.6), 20, 72);
      gh = Math.max(u * .55, H * .075); groundY = H - gh; baseY = H - gh * .5;
      geo = sackGeo(u); lanes = clamp(Math.round(W / (u * 1.3)), 4, 9); lo = u * .95 / W; hi = 1 - lo;
      build();
    }

    /* ----- state ----- */
    function reset() {
      Object.assign(S, { mode: 'idle', t: 0, clock: 0, score: 0, lives: 3, n: 0, spawn: .35, items: [], parts: [], floats: [],
        x: .5, tx: .5, kv: 0, tilt: 0, squash: 0, shake: 0, lastLane: -1, lastGift: (lanes / 2) | 0, lastKind: 0, heartAt: 12, gained: 0, lost: { coal: 0, miss: 0 } });
      keys.l = keys.r = false; drag = null;
      hudScore(); hudLives(-1);
    }
    function hudScore(bump) {
      if (quiet) return;
      scoreEl.textContent = S.score;
      bestEl.textContent = Math.max(best, S.score);
      bestEl.classList.toggle('gm-gold', S.score > best && S.score > 0);
      if (bump && scoreEl.animate && !A.reduced) scoreEl.animate([{ transform: 'scale(1.22)' }, { transform: 'scale(1)' }], { duration: 190, easing: 'ease-out' });
    }
    function hudLives(lost, gained) {
      if (quiet) return;
      livesEl.innerHTML = [0, 1, 2].map(i => '<span class="' + (i < S.lives ? '' : 'off') + (i === lost ? ' gm-lost' : i === gained ? ' gm-gain' : '') + '">' + A.icon('heart', 19) + '</span>').join('');
    }
    function setLayer(html, dim) { clearLayer(); lay = document.createElement('div'); lay.className = 'gm-layer' + (dim ? ' dim' : ''); lay.innerHTML = html; stage.appendChild(lay); return lay; }
    function clearLayer() { if (lay) { lay.remove(); lay = null; } }

    /* ----- spawning: gentle start, then faster, closer together, more coal ----- */
    /* A missed present costs a heart, so nothing is dropped that cannot be dealt with: two presents are
       never further apart than the sack can travel in the time between them, and nothing comes down on
       top of something else. ta = the moment an item reaches the mouth of the sack. */
    function fair(kind, x, ta) {
      const half = (geo.rx + u * .16) / W, lane = 1 / lanes;
      for (let i = 0; i < S.items.length; i++) {
        const o = S.items[i]; if (o.state !== 0) continue;
        const gap = Math.abs(ta - o.ta), far = Math.abs(x - o.x);
        if (gap < .42 && far < lane * .9) return false;
        if (kind === 0 && o.kind === 0 && far - half * 1.4 > gap * .85) return false;
      }
      return true;
    }
    function spawn() {
      const d = 1 - Math.exp(-S.t / 45), ex = Math.min(.6, S.t / 330), N = lanes, mouth = (baseY + geo.my) / H;
      const coalP = S.n < 4 ? 0 : .1 + .16 * d + .12 * ex, starP = S.t > 6 ? .07 : 0, r = Math.random();
      let kind = 0;
      /* a heart to win back: only while one is missing, one at a time, and not often */
      if (S.lives < 3 && S.t >= S.heartAt && Math.random() < .07 && !S.items.some(o => o.kind === 3)) kind = 3;
      else if (r < coalP && !(S.lastKind === 2 && d < .55)) kind = 2;
      else if (r < coalP + starP) kind = 1;
      let want;
      if (kind === 2) want = Math.random() < .5 ? Math.floor(S.x * N) : (Math.random() * N) | 0;
      else { const reach = 2 + Math.round(d * 3); want = S.lastGift + Math.round(A.rand(-reach, reach)); }
      want = clamp(want, 0, N - 1);
      const size = kind === 0 ? 1.04 : kind === 1 ? 1.02 : kind === 2 ? .92 : .96, y0 = -(size * u * .7) / H;
      const vy = (.36 + .38 * d + .32 * ex) * mouth * A.rand(.95, 1.05) * (kind === 1 ? 1.15 : kind === 3 ? .88 : 1), ta = S.t + (mouth - y0) / vy;
      /* the lane we wanted first, then its neighbours, until one is fair */
      let lane = -1, x = 0;
      for (let k = 0; k < N * 2 && lane < 0; k++) {
        const c = want + (k % 2 ? 1 : -1) * Math.ceil(k / 2);
        if (c < 0 || c >= N || c === S.lastLane) continue;
        x = (c + .5 + A.rand(-.13, .13)) / N;
        if (fair(kind, x, ta)) lane = c;
      }
      if (lane < 0) { S.spawn = .12; return; }
      S.items.push({ kind, v: (Math.random() * GIFTS.length) | 0, x, y: y0, vy, ta, r: size * .5, rot: 0, r0: A.rand(-.18, .18), wf: A.rand(1.6, 2.6), ph: A.rand(0, TAU),
        vr: A.rand(1.2, 2.4) * (Math.random() < .5 ? -1 : 1), state: 0, t: 0, lost: false });
      S.lastLane = lane; S.lastKind = kind; if (kind < 2) S.lastGift = lane; S.n++;
      if (kind === 3) S.heartAt = S.t + 24;
      S.spawn = (1.2 - .52 * d - .16 * ex) * A.rand(.82, 1.18) * (d > .55 && Math.random() < .18 ? .5 : 1);
    }

    /* ----- effects ----- */
    function burst(x, y, n, cols, speed, round) {
      if (S.parts.length > 70) return;
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + A.rand(-1.15, 1.15), v = A.rand(.45, 1) * speed;
        S.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: A.rand(.32, .58), r: A.rand(.035, .07) * u * (round ? 1.9 : 1), col: A.pick(cols), round });
      }
    }
    const rise = (x, y, sp, life, k) => { S.floats.push({ x, y, sp, life, max: life, k }); };
    function caught(it) {
      const x = S.x * W, y = baseY + geo.my, v = GIFTS[it.v];
      it.state = 2; it.t = 0; S.squash = 1;
      if (it.kind === 3) {
        /* a heart back, never more than three */
        if (S.lives < 3) { S.lives++; S.gained++; hudLives(-1, S.lives - 1); }
        burst(x, y, 10, ['#ff5d73', '#ffd0d6', '#ffffff'], u * 7, false);
        rise(x, y - u * .7, SP.heart, .9, .62);
        return;
      }
      const star = it.kind === 1;
      S.score += star ? 5 : 1; hudScore(true);
      burst(x, y, star ? 12 : 6, star ? ['#f1cd66', '#fff3c4', '#ffffff'] : [v.box, v.rib, '#ffffff'], u * (star ? 8 : 6), false);
      rise(x + A.rand(-.2, .2) * u, y - u * .5, star ? SP.p5 : SP.p1, .8, 1);
    }
    /* every way of losing a heart ends up here */
    function loseHeart() {
      S.lives = Math.max(0, S.lives - 1); S.heartAt = Math.max(S.heartAt, S.t + 8); hudLives(S.lives, -1);
      if (quiet) { if (S.lives <= 0) S.mode = 'over'; return; }
      stage.classList.remove('gm-hit'); later(() => stage.classList.add('gm-hit'), 0); later(() => stage.classList.remove('gm-hit'), 440);
      try { if (navigator.vibrate) navigator.vibrate(70); } catch (e) {}
      if (S.lives <= 0) over();
    }
    function hitCoal(i) {
      S.items.splice(i, 1); S.lost.coal++;
      S.shake = A.reduced ? 0 : 1; S.squash = 1.3;
      burst(S.x * W, baseY + geo.my, 9, ['#2a2f3b', '#4b5364', '#14161c'], u * 5, true);
      loseHeart();
    }
    function missed(it) {
      it.lost = true; S.lost.miss++;
      burst(it.x * W, groundY + 2, 7, ['#ffffff', '#dfe9f6'], u * 3.6, true);
      rise(clamp(it.x * W, u * 1.4, W - u * 1.4), groundY - u * .8, SP.miss, 1, 1);
      loseHeart();
    }

    /* ----- one step of the game ----- */
    function step(dt) {
      S.clock += dt;
      const dir = (keys.r ? 1 : 0) - (keys.l ? 1 : 0);
      if (dir) { S.kv += (dir * 1.35 - S.kv) * Math.min(1, dt * 12); S.tx = clamp(S.tx + S.kv * dt, lo, hi); } else S.kv = 0;
      const px = S.x; S.x += (S.tx - S.x) * (1 - Math.exp(-dt * 28));
      const lean = A.reduced ? 0 : clamp((S.x - px) / dt * W / u * .03, -.11, .11);
      S.tilt += (lean - S.tilt) * Math.min(1, dt * 10);
      S.squash *= Math.exp(-dt * 10); S.shake *= Math.exp(-dt * 9);
      if (snow) for (let i = 0; i < snow.length; i++) { const f = snow[i]; f.y += f.v * dt; f.x += Math.sin(S.clock * f.w + f.p) * .012 * dt; if (f.y > 1) { f.y = -.02; f.x = Math.random(); } }
      if (S.mode === 'play') { S.t += dt; S.spawn -= dt; if (S.spawn <= 0) spawn(); }
      if (S.mode === 'play' || S.mode === 'over') {
        const mouthY = baseY + geo.my, sx = S.x * W;
        for (let i = S.items.length - 1; i >= 0; i--) {
          const it = S.items[i];
          if (it.state === 2) { it.t += dt; it.y += it.vy * dt * .8; if (it.t > .17) S.items.splice(i, 1); continue; }
          const py = it.y * H; it.y += it.vy * dt;
          const y = it.y * H, r = it.r * u;
          if (it.kind === 2) it.rot += it.vr * dt; else it.rot = it.r0 + Math.sin(S.clock * it.wf + it.ph) * (it.kind === 1 ? .28 : it.kind === 3 ? .12 : .2);
          if (it.state === 0 && S.mode === 'play') {
            const dx = Math.abs(it.x * W - sx);
            if (it.kind === 2) {
              /* coal only counts if it lands well inside the mouth */
              if (py < mouthY && y >= mouthY) { if (dx < geo.rx - r * .25) { hitCoal(i); continue; } it.state = 1; }
            } else if (y >= mouthY - r * .2) {
              /* presents, stars and hearts get a forgiving catch window */
              if (y > mouthY + r) it.state = 1;
              else if (dx < geo.rx + r * .3) { caught(it); continue; }
            }
          }
          /* a present that lands in the snow costs a heart. A star or a heart that gets away costs nothing */
          if (it.kind === 0 && !it.lost && S.mode === 'play' && y + r * .5 >= groundY) missed(it);
          if (y - r > groundY + u * .3) {
            if (it.kind === 1 || it.kind === 3) burst(it.x * W, groundY + 2, 3, ['#ffffff', '#dfe9f6'], u * 2.4, true);
            S.items.splice(i, 1);
          }
        }
      }
      for (let i = S.parts.length - 1; i >= 0; i--) { const p = S.parts[i]; p.life -= dt; if (p.life <= 0) { S.parts.splice(i, 1); continue; } p.vy += u * 16 * dt; p.x += p.vx * dt; p.y += p.vy * dt; }
      for (let i = S.floats.length - 1; i >= 0; i--) { const f = S.floats[i]; f.life -= dt; if (f.life <= 0) { S.floats.splice(i, 1); continue; } f.y -= u * 1.5 * dt; }
    }

    /* ----- draw ----- */
    function drawItem(g, it) {
      const sp = it.kind === 0 ? SP.gifts[it.v] : it.kind === 1 ? SP.star : it.kind === 2 ? SP.coal : SP.heart;
      const y = it.y * H; let sc = 1, al = 1;
      if (it.state === 2) sc = 1 - it.t / .17 * .4;
      else { const sunk = (y + it.r * u * .5 - groundY) / (u * .55); if (sunk > 0) al = 1 - Math.min(1, sunk); }
      if (it.kind === 1 || it.kind === 3) sc *= 1 + Math.sin(S.clock * 6 + it.ph) * (it.kind === 3 ? .08 : .05);
      if (al > 0) blit(g, sp, it.x * W, y, it.rot, sc, sc, al);
    }
    function draw() {
      if (!W || !SP.bg) return;
      const g = ctx;
      g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.drawImage(SP.bg, 0, 0);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (snow) { g.fillStyle = 'rgba(255,255,255,.5)'; for (let i = 0; i < snow.length; i++) { const f = snow[i]; g.fillRect(f.x * W, f.y * groundY, f.r, f.r); } }
      const sh = S.shake > .02 ? S.shake : 0;
      const bx = S.x * W + Math.sin(S.clock * 88) * sh * u * .11, by = baseY + Math.cos(S.clock * 71) * sh * u * .05;
      const scx = 1 + S.squash * .07, scy = 1 - S.squash * .1;
      g.fillStyle = 'rgba(30,60,105,.22)'; g.beginPath(); g.ellipse(bx, baseY + u * .04, geo.w * .52, u * .14, 0, 0, TAU); g.fill();
      blit(g, SP.back, bx, by, S.tilt, scx, scy, 1);
      const items = S.items;
      for (let i = 0; i < items.length; i++) if (items[i].state === 2) drawItem(g, items[i]);
      blit(g, SP.front, bx, by, S.tilt, scx, scy, 1);
      for (let i = 0; i < items.length; i++) if (items[i].state !== 2) drawItem(g, items[i]);
      for (let i = 0; i < S.parts.length; i++) {
        const p = S.parts[i]; g.globalAlpha = Math.min(1, p.life / .22); g.fillStyle = p.col;
        if (p.round) { g.beginPath(); g.arc(p.x, p.y, p.r, 0, TAU); g.fill(); } else g.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
      }
      g.globalAlpha = 1;
      for (let i = 0; i < S.floats.length; i++) { const f = S.floats[i], k = (.6 + Math.min(1, (f.max - f.life) / .12) * .4) * f.k; blit(g, f.sp, f.x, f.y, 0, k, k, Math.min(1, f.life / .3)); }
    }
    function tick(now) {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      if (dt <= 0) return;
      step(dt); draw();
    }
    function run() { if (raf || !alive) return; last = performance.now(); raf = requestAnimationFrame(tick); }
    function halt() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

    /* ----- flow ----- */
    function countdown(then) {
      S.mode = 'count';
      let n = 3, b = $('b', setLayer('<div class="gm-count"><b></b><span>' + hint + '</span></div>'));
      const next = () => {
        if (S.mode !== 'count') return;
        if (n <= 0) { clearLayer(); then(); return; }
        const nb = b.cloneNode(false); nb.textContent = n--; b.replaceWith(nb); b = nb;
        later(next, 620);
      };
      next();
    }
    function newGame() { clearTimers(); clearLayer(); stage.classList.remove('gm-hit'); reset(); countdown(() => { S.mode = 'play'; }); run(); }
    function pause() {
      if (S.mode !== 'play' && S.mode !== 'count') return;
      S.mode = 'pause'; clearTimers(); halt(); keys.l = keys.r = false; drag = null; draw();
      setLayer(PAUSED, true);
    }
    function resume() { if (S.mode !== 'pause') return; countdown(() => { S.mode = 'play'; }); run(); }
    function overPanel(res) {
      setLayer(endPanel('Game over', S.score, S.score === 1 ? 'point' : 'points', res, S.score === 0 ? 'Catch a present to get on the board.' : 'Your best is ' + best + '.'), true);
      focusAgain(lay); if (res.isBest) party(stage, 70);
    }
    function over() {
      S.mode = 'over'; keys.l = keys.r = false; drag = null;
      const res = submit(game, S.score);
      if (res.isBest) best = S.score;
      later(() => { halt(); draw(); overPanel(res); }, 750);
    }

    /* ----- input ----- */
    const canMove = () => S.mode === 'play' || S.mode === 'count';
    const onDown = e => {
      if (!canMove() || e.target.closest('button,a,.gm-panel')) return;
      left = stage.getBoundingClientRect().left + stage.clientLeft;
      if (e.pointerType === 'mouse') { S.tx = clamp((e.clientX - left) / W, lo, hi); return; }
      drag = { id: e.pointerId, x0: e.clientX, t0: S.tx };
      try { frame.setPointerCapture(e.pointerId); } catch (err) {}
      e.preventDefault();
    };
    const onMove = e => {
      if (!canMove()) return;
      if (e.pointerType === 'mouse') { S.tx = clamp((e.clientX - left) / W, lo, hi); return; }
      if (drag && e.pointerId === drag.id) S.tx = clamp(drag.t0 + (e.clientX - drag.x0) / W * 1.2, lo, hi);
    };
    const onUp = e => { if (drag && e.pointerId === drag.id) drag = null; };
    const onKey = e => {
      if (A.ui.sheetOpen() || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key, down = e.type === 'keydown';
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') { keys.l = down; if (down) e.preventDefault(); }
      else if (k === 'ArrowRight' || k === 'd' || k === 'D') { keys.r = down; if (down) e.preventDefault(); }
      else if (down && !e.repeat && (k === 'p' || k === 'P' || k === 'Escape' || (k === ' ' && !(e.target.closest && e.target.closest('button,a'))))) {
        if (k === ' ') e.preventDefault();
        if (S.mode === 'pause') resume(); else pause();
      }
    };
    const onVis = () => { if (document.hidden) pause(); };
    const onClick = e => {
      const b = e.target.closest('[data-act],[data-pause]'); if (!b) return;
      if (b.hasAttribute('data-pause')) { if (S.mode === 'pause') resume(); else pause(); }
      else if (b.dataset.act === 'again') newGame();
      else if (b.dataset.act === 'resume') resume();
    };
    frame.addEventListener('pointerdown', onDown); window.addEventListener('pointermove', onMove);
    frame.addEventListener('pointerup', onUp); frame.addEventListener('pointercancel', onUp);
    frame.addEventListener('click', onClick);
    window.addEventListener('keydown', onKey); window.addEventListener('keyup', onKey);
    document.addEventListener('visibilitychange', onVis);
    let ro = null;
    const resize = () => { measure(); if (DEMO === 'sprites') sheetOfSprites(); else if (!raf) draw(); };
    if (window.ResizeObserver) { ro = new ResizeObserver(resize); ro.observe(stage); }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (alive && W) buildText(); });

    /* ----- still frames for screenshots ----- */
    function still(kind) {
      const mouth = (baseY + geo.my) / H, mk = (k, v, x, p, rot) => ({ kind: k, v, x, y: p * mouth, vy: 0, r: .5, rot, r0: rot, wf: 2, ph: 0, vr: 0, state: 0, t: 0 });
      Object.assign(S, { score: 23, lives: 2, x: .42, tx: .42, tilt: -.05, squash: .25 });
      S.items = [mk(0, 0, .16, .2, -.2), mk(0, 1, .84, .4, .18), mk(1, 0, .64, .16, .15), mk(2, 0, .3, .58, .6), mk(0, 3, .72, .74, -.12), mk(0, 2, .5, .04, .1), mk(0, 4, .42, .97, .06), mk(3, 0, .9, .66, .08)];
      S.items[6].state = 2; S.items[6].t = .05;
      S.floats = [{ x: .42 * W, y: baseY + geo.my - u * .9, life: .55, max: .8, k: 1, sp: SP.p1 }];
      S.parts = [[-.5, -.7], [.45, -.9], [-.15, -1.2], [.7, -.5], [-.8, -.4]].map((p, i) => ({ x: .42 * W + p[0] * u, y: baseY + geo.my + p[1] * u, vx: 0, vy: 0, life: .4, r: u * .055, col: ['#e9c46a', '#d7263d', '#ffffff'][i % 3], round: false }));
      hudScore(); hudLives(-1); S.mode = 'idle';
      if (kind === 'over') { S.lives = 0; S.score = 61; best = 61; hudScore(); hudLives(-1); S.mode = 'over'; draw(); overPanel({ isBest: true, leads: true }); return; }
      if (kind === 'pause') { S.mode = 'play'; pause(); return; }
      if (kind === 'count') { S.items = []; S.floats = []; S.parts = []; S.score = 0; S.lives = 3; hudScore(); hudLives(-1); S.x = S.tx = .5; S.tilt = 0; S.squash = 0; draw(); setLayer('<div class="gm-count"><b>3</b><span>' + hint + '</span></div>'); return; }
      draw();
    }
    function sheetOfSprites() {
      const g = ctx; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = '#0d2850'; g.fillRect(0, 0, W, H);
      const s = Math.min(W / 4.4, H / 3.4); let i = 0;
      const cell = fn => { g.save(); g.translate((i % 4 + .5) * W / 4, (Math.floor(i / 4) + .5) * H / 3); fn(); g.restore(); i++; };
      GIFTS.forEach(v => cell(() => drawGift(g, s, v)));
      cell(() => drawStar(g, s)); cell(() => drawCoal(g, s)); cell(() => drawHeart(g, s));
      i = 10; cell(() => { g.translate(W * .12, s * .5); drawSackBack(g, s / 1.6); drawSackFront(g, s / 1.6); });
    }

    /* ?gmdemo=sim plays whole games instantly with two bots, to test the rules and the ramp.
       steady = perfect aim with an unhurried hand, human = slower to notice things and a little off target.
       Results land in window.__gmSim. */
    function simulate(human) {
      const dt = 1 / 60, cap = (human ? 1 : .85) * dt; let guard = 0, aim = .5, think = 0;
      quiet = true; reset(); S.mode = 'play';
      while (S.mode === 'play' && guard++ < 60 * 300) {
        const mouth = (baseY + geo.my) / H;
        if ((think -= dt) <= 0) {
          think = human ? .15 : 0;
          let t = null;
          for (let i = 0; i < S.items.length; i++) {
            const it = S.items[i];
            if (it.state !== 0 || it.kind === 2 || it.y > mouth || (human && it.y < mouth * .18) || (it.kind === 3 && S.lives > 2)) continue;
            if (!t || (it.kind === 0) > (t.kind === 0) || ((it.kind === 0) === (t.kind === 0) && it.ta < t.ta)) t = it;
          }
          let tx = t ? t.x + (human ? A.rand(-.035, .035) : 0) : aim;
          for (let i = 0; i < S.items.length; i++) {
            const it = S.items[i], hw = (geo.rx + it.r * u * .1) / W;
            if (it.state === 0 && it.kind === 2 && it.ta - S.t < .45 && (!human || it.y > mouth * .18) && Math.abs(it.x - tx) < hw) tx = it.x + (tx >= it.x ? hw : -hw);
          }
          aim = tx;
        }
        S.tx = clamp(S.tx + clamp(aim - S.tx, -cap, cap), lo, hi);
        step(dt);
      }
      quiet = false;
      return { score: S.score, seconds: Math.round(S.t), coal: S.lost.coal, miss: S.lost.miss, hearts: S.gained };
    }

    measure(); reset();
    if (DEMO === 'sim') {
      const runs = { steady: [], human: [] };
      for (let i = 0; i < 12; i++) { runs.steady.push(simulate(false)); runs.human.push(simulate(true)); }
      window.__gmSim = runs; clearTimers(); reset();
    }
    if (!A.reduced && !document.body.classList.contains('low')) { const rnd = prng(3); snow = []; for (let i = 0; i < 18; i++) snow.push({ x: rnd(), y: rnd(), v: .035 + rnd() * .05, r: 1.5 + rnd() * 1.5, w: .6 + rnd(), p: rnd() * 6 }); }
    if (A.qs.has('gmdebug')) { window.__gmCatch = S; S.test = { spawn }; }
    if (DEMO === 'sprites') sheetOfSprites();
    else if (DEMO === 'sim') draw();
    else if (DEMO) still(DEMO);
    else newGame();

    return {
      resize,
      destroy() {
        if ((S.mode === 'play' || S.mode === 'count' || S.mode === 'pause') && S.score > 0) submit(game, S.score);
        alive = false; halt(); clearTimers(); if (ro) ro.disconnect();
        window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey); window.removeEventListener('pointermove', onMove);
        document.removeEventListener('visibilitychange', onVis);
      }
    };
  }

  /* ================= Memory Match ================= */
  const CARDS = { tree: '#147150', gift: '#c41e3a', bell: '#a8641a', candy: '#d6478a', snowman: '#1d6fd6', stocking: '#0e7c86',
    mug: '#4f5bd5', star: '#cf9a00', holly: '#4f8f1a', candle: '#d2601a', deer: '#7a4a1e', mitten: '#8a3fd0' };
  const backHTML = () => '<span class="gm-backf">' + A.icon('snow', 24) + '</span>';
  const faceHTML = ic => '<span class="gm-face" style="--k:' + CARDS[ic] + '">' + A.icon(ic, 24) + '</span>';
  const MEM_ART = '<div class="gm-fan"><span class="gm-mini a">' + backHTML() + '</span><span class="gm-mini b">' + faceHTML('gift') + '</span><span class="gm-mini c">' + faceHTML('tree') + '</span></div>';

  function mountMemory(root, game) {
    const me = A.me();
    root.innerHTML = '<div class="gm-frame gm-mem">' +
      '<div class="gm-hud">' +
        '<div class="gm-hud-a"><a class="icon-btn solid" href="#/games" aria-label="Back to games">' + A.icon('back') + '</a>' +
          '<div class="gm-meter"><span>Moves</span><b data-moves>0</b></div>' +
          '<div class="gm-meter"><span>Time</span><b data-time>0:00</b></div></div>' +
        '<div class="gm-hud-b"><div class="gm-meter gm-right"><span>Best</span><b data-best></b></div>' +
          '<button class="icon-btn solid" data-new aria-label="New game">' + A.icon('repeat') + '</button></div>' +
      '</div>' +
      '<div class="gm-board"><div class="gm-grid" role="group" aria-label="Cards"></div></div></div>';
    const frame = $('.gm-mem', root), board = $('.gm-board', root), grid = $('.gm-grid', root);
    const movesEl = $('[data-moves]', root), timeEl = $('[data-time]', root), bestEl = $('[data-best]', root);
    let deck = [], els = [], first = -1, lock = false, moves = 0, found = 0, done = false, cols = 4, alive = true, lay = null;
    let running = false, since = 0, acc = 0, ticker = 0;
    const timers = [];
    const later = (fn, ms) => { const id = setTimeout(() => { const i = timers.indexOf(id); if (i >= 0) timers.splice(i, 1); if (alive) fn(); }, ms); timers.push(id); };
    const clearTimers = () => { timers.forEach(clearTimeout); timers.length = 0; };
    const elapsed = () => acc + (running && since ? performance.now() - since : 0);

    function showBest() { const b = bestOf(game, me); bestEl.innerHTML = b ? b.moves + '<i>' + clock(b.time) + '</i>' : '<em>None yet</em>'; }
    function startClock() {
      if (running || done) return;
      running = true; since = performance.now();
      ticker = setInterval(() => { timeEl.textContent = clock(Math.floor(elapsed() / 1000)); }, 250);
    }
    function stopClock() { acc = elapsed(); running = false; since = 0; if (ticker) { clearInterval(ticker); ticker = 0; } }
    const onVis = () => { if (!running) return; if (document.hidden) { acc = elapsed(); since = 0; } else since = performance.now(); };

    /* pick the grid shape that gives the biggest cards for this space */
    function layout() {
      const w = board.clientWidth, h = board.clientHeight;
      if (!w || !h) return;
      const gap = Math.min(w, h) < 360 ? 8 : 12;
      let pick = null;
      [[4, 4], [8, 2], [2, 8]].forEach(l => {
        let cw = (w - gap * (l[0] - 1)) / l[0], ch = (h - gap * (l[1] - 1)) / l[1];
        if (cw > ch * .84) cw = ch * .84;
        if (ch > cw / .7) ch = cw / .7;
        if (cw > 150) { ch *= 150 / cw; cw = 150; }
        const score = cw * ch * (l[0] === 4 ? 1.12 : 1);
        if (!pick || score > pick.score) pick = { c: l[0], cw: Math.floor(cw), ch: Math.floor(ch), score };
      });
      cols = pick.c;
      grid.style.cssText = '--cols:' + pick.c + ';--cw:' + pick.cw + 'px;--ch:' + pick.ch + 'px;--gap:' + gap + 'px';
    }
    function setLayer(html) { clearLayer(); lay = document.createElement('div'); lay.className = 'gm-layer dim'; lay.innerHTML = html; frame.appendChild(lay); }
    function clearLayer() { if (lay) { lay.remove(); lay = null; } }
    const label = (c, i) => 'Card ' + (i + 1) + (c.up || c.done ? ', ' + c.ic + (c.done ? ', matched' : '') : ', face down');

    function deal(order) {
      let picks = order;
      if (!picks) { const p = A.shuffle(Object.keys(CARDS)).slice(0, 8); picks = A.shuffle(p.concat(p)); }
      deck = picks.map(ic => ({ ic, up: false, done: false }));
      grid.classList.remove('win'); grid.classList.toggle('gm-dealing', !DEMO);
      later(() => grid.classList.remove('gm-dealing'), 800);
      grid.innerHTML = deck.map((c, i) => '<button class="gm-card" data-i="' + i + '" style="--i:' + i + '" aria-label="' + label(c, i) + '"><span class="gm-card-in">' + backHTML() + faceHTML(c.ic) + '</span></button>').join('');
      els = $$('.gm-card', grid);
    }
    function fresh() {
      clearTimers(); clearLayer(); stopClock();
      first = -1; lock = false; moves = 0; found = 0; done = false; acc = 0;
      movesEl.textContent = '0'; timeEl.textContent = '0:00'; showBest(); deal();
    }
    function mark(i) { const c = deck[i], el = els[i]; el.classList.toggle('up', c.up || c.done); el.classList.toggle('done', c.done); el.setAttribute('aria-label', label(c, i)); }
    function flip(i) {
      const c = deck[i];
      if (lock || done || !c || c.up || c.done) return;
      startClock(); c.up = true; mark(i);
      if (first < 0) { first = i; return; }
      const j = first, o = deck[j]; first = -1;
      moves++; movesEl.textContent = moves;
      if (o.ic === c.ic) {
        o.done = c.done = true; found++;
        later(() => { [i, j].forEach(k => { mark(k); els[k].classList.add('pop'); }); }, 300);
        later(() => { [i, j].forEach(k => els[k].classList.remove('pop')); }, 760);
        if (found === 8) finish();
      } else {
        /* no taps until these two are face down again */
        lock = true;
        later(() => { els[i].classList.add('no'); els[j].classList.add('no'); }, 430);
        later(() => { o.up = c.up = false; [i, j].forEach(k => { els[k].classList.remove('no'); mark(k); }); lock = false; }, 980);
      }
    }
    function resultPanel(res, r) {
      const b = bestOf(game, me);
      setLayer(endPanel('All matched', r.moves, 'moves in ' + clock(r.time), res, 'Your best is ' + (b ? b.moves + ' moves in ' + clock(b.time) : 'still to come') + '.'));
      focusAgain(lay);
    }
    function finish() {
      done = true; stopClock();
      const r = { moves, time: Math.max(1, Math.round(acc / 1000)) };
      timeEl.textContent = clock(r.time);
      const res = submit(game, r); showBest();
      later(() => {
        grid.classList.add('win'); party(board, 90);
      }, 520);
      later(() => resultPanel(res, r), 1650);
    }

    const onClick = e => {
      if (e.target.closest('[data-new],[data-act="again"]')) { fresh(); return; }
      const c = e.target.closest('.gm-card'); if (c && grid.contains(c)) flip(+c.dataset.i);
    };
    const onKey = e => {
      const c = e.target.closest && e.target.closest('.gm-card'); if (!c) return;
      const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -cols, ArrowDown: cols }[e.key];
      if (!step) return;
      const n = +c.dataset.i + step; if (n >= 0 && n < els.length) { e.preventDefault(); els[n].focus(); }
    };
    frame.addEventListener('click', onClick); frame.addEventListener('keydown', onKey);
    document.addEventListener('visibilitychange', onVis);
    let ro = null;
    if (window.ResizeObserver) { ro = new ResizeObserver(layout); ro.observe(board); }

    layout(); fresh();
    if (DEMO) {
      deal(['tree', 'gift', 'bell', 'snowman', 'star', 'tree', 'mitten', 'candy', 'deer', 'bell', 'gift', 'mitten', 'candy', 'star', 'deer', 'snowman']);
      const all = DEMO === 'over';
      deck.forEach((c, i) => { if (all || ['tree', 'gift', 'star'].indexOf(c.ic) >= 0) c.done = true; else if (i === 3 || i === 8) c.up = true; mark(i); });
      moves = all ? 12 : 7; movesEl.textContent = moves; timeEl.textContent = all ? '0:38' : '0:23';
      if (all) { done = true; resultPanel({ isBest: true, leads: true }, { moves: 12, time: 38 }); } else lock = true;
    }

    return {
      resize: layout,
      destroy() { alive = false; clearTimers(); stopClock(); if (ro) ro.disconnect(); document.removeEventListener('visibilitychange', onVis); }
    };
  }

  /* ================= Gift Tower ================= */
  /* one present in the tower: lid, body and ribbon. x,y = top left.
     rc/rw = where the ribbon is and how wide (default: centered), so a present that gets trimmed
     keeps its ribbon exactly where it was */
  function drawSlab(g, x, y, w, h, v, flash, rc, rw) {
    const lid = h * .3, pad = Math.min(h * .06, w * .12), r = Math.min(h * .14, w * .3);
    if (rc == null) { rc = x + w / 2; rw = Math.min(h * .44, w * .46); }
    const b0 = Math.max(x + pad, rc - rw / 2), b1 = Math.min(x + w - pad, rc + rw / 2), l0 = Math.max(x, rc - rw / 2), l1 = Math.min(x + w, rc + rw / 2);
    rr(g, x + pad, y + lid * .5, w - pad * 2, h - lid * .5, r); g.fillStyle = v.box; g.fill();
    if (w > r * 3) { g.fillStyle = 'rgba(0,0,0,.14)'; g.fillRect(x + pad + r, y + h * .84, w - pad * 2 - r * 2, h * .16); }
    if (b1 > b0) { g.fillStyle = v.rib; g.fillRect(b0, y + lid * .5, b1 - b0, h - lid * .5); }
    g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(x + pad, y + lid, w - pad * 2, h * .08);
    rr(g, x, y, w, lid, lid * .3); g.fillStyle = v.lid; g.fill();
    if (l1 > l0) { g.fillStyle = v.rib; g.fillRect(l0, y, l1 - l0, lid); }
    if (w > lid) { g.fillStyle = 'rgba(255,255,255,.28)'; g.fillRect(x + lid * .3, y + lid * .16, w - lid * .6, Math.max(1, lid * .14)); }
    if (flash > 0) { const a = g.globalAlpha; g.globalAlpha = a * Math.min(1, flash) * .65; rr(g, x, y, w, h, r); g.fillStyle = '#fff'; g.fill(); g.globalAlpha = a; }
  }
  /* the Gift Tower tile picture */
  function artStack(g, W, H) {
    const bh = Math.min(H / 6.6, W / 5), gh = Math.max(bh * .7, H * .1), base = H - gh * .5, cx = W / 2, bw = Math.min(W * .52, bh * 3.6);
    paintBg(g, W, H, gh, bh * 1.25, 14);
    const n = clamp(Math.floor((base - bh * 2) / bh), 3, 6), off = [0, .07, -.05, .04, -.02, .03], wid = [1, .94, .86, .8, .74, .7];
    for (let i = 0; i < n; i++) drawSlab(g, cx + off[i] * bw - wid[i] * bw / 2, base - (i + 1) * bh, wid[i] * bw, bh, GIFTS[i % GIFTS.length], 0);
    const mw = wid[n - 1] * bw, mx = cx + off[n - 1] * bw - mw / 2 + bw * .2, my = base - (n + 1) * bh - bh * .3;
    g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = Math.max(1.5, bh * .07); g.lineCap = 'round'; g.beginPath();
    for (let i = 0; i < 3; i++) { const y = my + bh * (.25 + i * .25), x0 = mx + mw + bh * .25; g.moveTo(x0, y); g.lineTo(x0 + bh * (i === 1 ? .7 : .45), y); }
    g.stroke();
    drawSlab(g, mx, my, mw, bh, GIFTS[n % GIFTS.length], 0);
  }

  function mountStack(root, game) {
    const me = A.me();
    let best = bestOf(game, me) || 0;
    root.innerHTML = '<div class="gm-frame gm-arc">' +
      '<div class="gm-hud">' +
        '<div class="gm-hud-a"><a class="icon-btn solid" href="#/games" aria-label="Back to games">' + A.icon('back') + '</a>' +
          '<div class="gm-meter"><span>Height</span><b data-score>0</b></div></div>' +
        '<div class="gm-hud-b"><div class="gm-hud-g"><div class="gm-meter gm-right"><span>Best</span><b data-best>0</b></div></div>' +
          '<button class="icon-btn solid" data-pause aria-label="Pause">' + A.icon('pause') + '</button></div>' +
      '</div>' +
      '<div class="gm-stage"><canvas></canvas></div></div>';
    const frame = $('.gm-arc', root), stage = $('.gm-stage', root), cv = $('canvas', stage), ctx = cv.getContext('2d', { alpha: false });
    const scoreEl = $('[data-score]', root), bestEl = $('[data-best]', root);
    const tip = '<span class="gm-tip">' + (A.canHover ? 'Click or press Space to drop the present.' : 'Tap anywhere to drop the present.') + '</span>';
    const FULL = .46, HOVER = .12, GOLD = ['#f1cd66', '#fff3c4', '#ffffff'], DEBUG = A.qs.has('gmdebug');
    let W = 0, H = 0, dpr = 1, bh = 30, gh = 20, floor = 0, anchor = 0, groundH = 0;
    let raf = 0, last = 0, alive = true, lay = null, frameMs = 16.7;
    const SP = {}, S = {}, timers = [], seen = [];   /* seen = [time, x, time, x ...]: where the sliding present was drawn on the last few frames */
    const later = (fn, ms) => { const id = setTimeout(() => { const i = timers.indexOf(id); if (i >= 0) timers.splice(i, 1); if (alive) fn(); }, ms); timers.push(id); };
    const clearTimers = () => { timers.forEach(clearTimeout); timers.length = 0; };

    function buildText() {
      const fs = Math.round(bh * .62);
      SP.perfect = sprite(fs * 5, fs * 1.7, dpr, g => {
        g.font = '700 ' + fs + 'px "DM Sans",system-ui,-apple-system,"Segoe UI",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.lineJoin = 'round'; g.lineWidth = Math.max(2, fs * .24); g.strokeStyle = 'rgba(4,10,24,.8)'; g.strokeText('Perfect', 0, 0);
        g.fillStyle = '#f1d27c'; g.fillText('Perfect', 0, 0);
      });
    }
    function measure() {
      const w = stage.clientWidth, h = stage.clientHeight;
      if (!w || !h) return;
      const d = Math.min(2, window.devicePixelRatio || 1);
      if (w === W && h === H && d === dpr) return;
      W = w; H = h; dpr = d;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      bh = clamp(Math.round(H / 9.5), 22, 58);
      const u = bh * 1.25;
      gh = Math.max(bh * .7, H * .075); floor = H - gh * .5; anchor = floor * .56;
      const sky = document.createElement('canvas'); sky.width = cv.width; sky.height = cv.height;
      const g = sky.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); paintBg(g, W, H, gh, u, 21, 'sky'); SP.sky = sky;
      /* the hills and snow slide down out of view as the tower grows */
      groundH = Math.min(H, Math.ceil(gh + u * 2.9));
      SP.ground = sprite(W, groundH, dpr, c => paintBg(c, W, H, gh, u, 21, 'ground'), 0, groundH - H);
      buildText();
      if (S.blocks) S.cam = Math.max(0, S.blocks.length * bh - anchor);
    }

    /* ----- state ----- */
    function launch() {
      const n = S.blocks.length, top = S.blocks[n - 1], fromLeft = top.x + top.w / 2 > .5;
      /* it swings half a present past each edge, so a clean miss is always possible */
      S.mv = { x: fromLeft ? -top.w / 2 : 1 - top.w / 2, w: top.w, dir: fromLeft ? 1 : -1, v: n % GIFTS.length, sp: Math.min(1.5, .6 + .03 * (n - 1)) };
      seen.length = 0;
    }
    function reset() {
      Object.assign(S, { mode: 'idle', clock: 0, cam: 0, streak: 0, blocks: [{ x: (1 - FULL) / 2, w: FULL, v: 0, pop: 1, flash: 0 }], pieces: [], parts: [], floats: [], mv: null });
      launch(); hud();
    }
    function hud(bump) {
      const n = S.blocks.length - 1;
      scoreEl.textContent = n; bestEl.textContent = Math.max(best, n);
      bestEl.classList.toggle('gm-gold', n > best && n > 0);
      if (bump && scoreEl.animate && !A.reduced) scoreEl.animate([{ transform: 'scale(1.22)' }, { transform: 'scale(1)' }], { duration: 190, easing: 'ease-out' });
    }
    function setLayer(html, dim, cls) { clearLayer(); lay = document.createElement('div'); lay.className = 'gm-layer' + (dim ? ' dim' : '') + (cls ? ' ' + cls : ''); lay.innerHTML = html; stage.appendChild(lay); }
    function clearLayer() { if (lay) { lay.remove(); lay = null; } }
    function sparks(x, y, n, cols, speed) {
      if (S.parts.length > 60) return;
      for (let i = 0; i < n; i++) { const a = A.rand(-Math.PI, 0), v = A.rand(.4, 1) * speed; S.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: A.rand(.3, .55), r: A.rand(.05, .09) * bh, col: A.pick(cols) }); }
    }
    /* ribbon of a present as [center, width], center in field widths and width in block heights */
    const ribbon = (x, w) => [x + w / 2, Math.min(.44, w * W * .46 / bh)];
    const chunk = (x, w, layer, v, side, rib) => ({ x, w, layer, v, rc: rib[0], rk: rib[1], dx: 0, dy: 0, vx: side * bh * 1.5, vy: -bh * 1.2, rot: 0, vr: side * A.rand(1.4, 2.6), life: 1.3 });

    /* ----- the one move: drop the sliding present ----- */
    /* The present drops from where it was on screen at the moment of the tap, not from where the game
       has moved it since. A drawn frame reaches the screen about two refreshes later, and the tap itself
       carries the time it happened, so look that moment up in the frames just drawn. */
    function shownX(ev) {
      const now = performance.now(), ts = ev && ev.timeStamp, lag = Math.min(120, frameMs * 2);
      const at = (ts > 0 && now - ts >= 0 && now - ts < 300 ? ts : now) - lag;
      let x = seen.length ? seen[1] : S.mv.x;
      for (let i = seen.length - 2; i >= 0; i -= 2) if (seen[i] <= at) { x = seen[i + 1]; break; }
      if (DEBUG) S.dbg = { used: x, live: S.mv.x, at, lag, seen: seen.slice() };
      return x;
    }
    function drop(ev) {
      if (S.mode !== 'play' || !S.mv) return;
      if (lay) clearLayer();
      const m = S.mv, mx = shownX(ev), n = S.blocks.length, top = S.blocks[n - 1], dx = mx - top.x, y = floor + S.cam - n * bh, rib = ribbon(mx, m.w);
      if (Math.abs(dx) <= Math.max(.012, top.w * .07)) {
        /* close enough counts as perfect: nothing is cut, and a run of three wins some width back */
        let w = top.w, x = top.x;
        S.streak++;
        if (S.streak >= 3 && w < FULL) { const grow = Math.min(.03, FULL - w); w += grow; x = clamp(x - grow / 2, 0, 1 - w); }
        S.blocks.push({ x, w, v: m.v, pop: 0, flash: 1 });
        sparks(x * W, y - bh, 5, GOLD, bh * 5); sparks((x + w) * W, y - bh, 5, GOLD, bh * 5);
        S.floats.push({ x: (x + w / 2) * W, y: y - bh * 1.8, life: .9 });
        try { if (navigator.vibrate) navigator.vibrate(12); } catch (e) {}
      } else {
        /* keep the part that sits on the present below, cut the rest off. Any overlap you can see counts */
        const l = Math.max(mx, top.x), r = Math.min(mx + m.w, top.x + top.w), side = dx > 0 ? 1 : -1;
        if ((r - l) * W < 1) { S.pieces.push(chunk(mx, m.w, n, m.v, side, rib)); S.mv = null; over(); return; }
        S.pieces.push(side > 0 ? chunk(r, mx + m.w - r, n, m.v, 1, rib) : chunk(mx, l - mx, n, m.v, -1, rib));
        S.streak = 0;
        S.blocks.push({ x: l, w: r - l, v: m.v, rc: rib[0], rk: rib[1], pop: 0, flash: 0 });
        sparks((side > 0 ? r : l) * W, y - bh * .5, 3, ['#ffffff', '#dfe9f6'], bh * 3);
      }
      hud(true); launch();
    }

    function step(dt) {
      S.clock += dt;
      const m = S.mv;
      if (S.mode === 'play' && m) {
        const min = -m.w / 2, max = 1 - m.w / 2; m.x += m.dir * m.sp * dt;
        if (m.x < min) { m.x = Math.min(max, min * 2 - m.x); m.dir = 1; } else if (m.x > max) { m.x = Math.max(min, max * 2 - m.x); m.dir = -1; }
      }
      S.cam += (Math.max(0, S.blocks.length * bh - anchor) - S.cam) * (1 - Math.exp(-dt * 6));
      for (let n = S.blocks.length, i = Math.max(0, n - 3); i < n; i++) {
        const b = S.blocks[i];
        if (b.flash > 0) b.flash = Math.max(0, b.flash - dt * 2.6);
        if (b.pop < 1) b.pop = i === n - 1 ? Math.min(1, b.pop + dt / .2) : 1;
      }
      for (let i = S.pieces.length - 1; i >= 0; i--) { const p = S.pieces[i]; p.life -= dt; if (p.life <= 0) { S.pieces.splice(i, 1); continue; } p.vy += bh * 42 * dt; p.dx += p.vx * dt; p.dy += p.vy * dt; p.rot += p.vr * dt; }
      for (let i = S.parts.length - 1; i >= 0; i--) { const p = S.parts[i]; p.life -= dt; if (p.life <= 0) { S.parts.splice(i, 1); continue; } p.vy += bh * 20 * dt; p.x += p.vx * dt; p.y += p.vy * dt; }
      for (let i = S.floats.length - 1; i >= 0; i--) { const f = S.floats[i]; f.life -= dt; if (f.life <= 0) { S.floats.splice(i, 1); continue; } f.y -= bh * 1.1 * dt; }
    }
    /* a present is always drawn at exactly the place the game has it: x and width are never scaled */
    function slab(g, b, x, y, w) { drawSlab(g, x, y, w, bh, GIFTS[b.v], b.flash || 0, b.rc == null ? null : x + (b.rc - b.x) * W, b.rc == null ? 0 : b.rk * bh); }
    function draw() {
      if (!W || !SP.sky) return;
      const g = ctx, cam = S.cam, bl = S.blocks, n = bl.length;
      g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.drawImage(SP.sky, 0, 0);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (cam < groundH) g.drawImage(SP.ground.c, 0, H - groundH + cam, SP.ground.w, SP.ground.h);
      for (let i = Math.max(0, Math.floor((cam - gh) / bh) - 1); i < n; i++) {
        const b = bl[i], y = floor + cam - (i + 1) * bh;
        if (y > H) continue;
        if (b.pop < 1) {
          /* landing squash: height only, anchored on the present below */
          g.save(); g.translate(0, y + bh); g.scale(1, 1 - Math.sin(b.pop * Math.PI) * .13); slab(g, b, b.x * W, -bh, b.w * W); g.restore();
        } else slab(g, b, b.x * W, y, b.w * W);
      }
      const m = S.mv;
      if (m) drawSlab(g, m.x * W, floor + cam - (n + 1) * bh - bh * HOVER, m.w * W, bh, GIFTS[m.v], 0);
      for (let i = 0; i < S.pieces.length; i++) {
        const p = S.pieces[i], w = p.w * W;
        g.save(); g.translate((p.x + p.w / 2) * W + p.dx, floor + cam - (p.layer + .5) * bh - bh * HOVER + p.dy); g.rotate(p.rot); g.globalAlpha = Math.min(1, p.life / .35);
        slab(g, p, -w / 2, -bh / 2, w); g.restore();
      }
      for (let i = 0; i < S.parts.length; i++) { const p = S.parts[i]; g.globalAlpha = Math.min(1, p.life / .22); g.fillStyle = p.col; g.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2); }
      g.globalAlpha = 1;
      for (let i = 0; i < S.floats.length; i++) { const f = S.floats[i], k = Math.min(1, (.9 - f.life) / .12); blit(g, SP.perfect, f.x, f.y, 0, .6 + k * .4, .6 + k * .4, Math.min(1, f.life / .3)); }
    }
    function tick(now) {
      raf = requestAnimationFrame(tick);
      const gap = now - last, dt = Math.min(.05, gap / 1000); last = now;
      if (dt <= 0) return;
      frameMs += (clamp(gap, 4, 100) - frameMs) * .2;
      step(dt); draw();
      if (S.mv) { seen.push(now, S.mv.x); if (seen.length > 40) seen.splice(0, 2); }
    }
    function run() { if (raf || !alive) return; last = performance.now(); raf = requestAnimationFrame(tick); }
    function halt() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

    /* ----- flow ----- */
    function newGame() { clearTimers(); reset(); S.mode = 'play'; setLayer(tip, false, 'gm-up'); run(); }
    function pause() { if (S.mode !== 'play') return; S.mode = 'pause'; halt(); draw(); setLayer(PAUSED, true); }
    function resume() { if (S.mode !== 'pause') return; clearLayer(); launch(); S.mode = 'play'; run(); }
    function over() {
      const n = S.blocks.length - 1, res = submit(game, n);
      S.mode = 'over'; if (res.isBest) best = n;
      try { if (navigator.vibrate) navigator.vibrate(60); } catch (e) {}
      later(() => {
        halt(); draw();
        setLayer(endPanel('Game over', n, n === 1 ? 'present high' : 'presents high', res, n === 0 ? 'Line each present up with the one below.' : 'Your best is ' + best + '.'), true);
        focusAgain(lay); if (res.isBest) party(stage, 70);
      }, 850);
    }

    /* ----- input ----- */
    const onDown = e => {
      if (S.mode !== 'play' || e.target.closest('button,a,.gm-panel') || (e.pointerType === 'mouse' && e.button !== 0)) return;
      e.preventDefault(); drop(e);
    };
    const onKey = e => {
      if (A.ui.sheetOpen() || e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      const k = e.key, onButton = !!(e.target.closest && e.target.closest('button,a'));
      if ((k === ' ' || k === 'Enter' || k === 'ArrowDown') && !onButton) { if (S.mode === 'play') { e.preventDefault(); drop(e); } }
      else if (k === 'p' || k === 'P' || k === 'Escape') { if (S.mode === 'pause') resume(); else pause(); }
    };
    const onVis = () => { if (document.hidden) pause(); };
    const onClick = e => {
      const b = e.target.closest('[data-act],[data-pause]'); if (!b) return;
      if (b.hasAttribute('data-pause')) { if (S.mode === 'pause') resume(); else pause(); }
      else if (b.dataset.act === 'again') newGame();
      else if (b.dataset.act === 'resume') resume();
    };
    frame.addEventListener('pointerdown', onDown); frame.addEventListener('click', onClick);
    window.addEventListener('keydown', onKey);
    document.addEventListener('visibilitychange', onVis);
    let ro = null;
    const resize = () => { measure(); if (!raf) draw(); };
    if (window.ResizeObserver) { ro = new ResizeObserver(resize); ro.observe(stage); }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (alive && W) buildText(); });

    /* ----- still frames for screenshots ----- */
    function still(kind) {
      const xs = [.27, .3, .27, .27, .24, .25, .25, .29, .29], ws = [.46, .43, .4, .4, .37, .36, .36, .32, .32];
      S.blocks = xs.map((x, i) => ({ x, w: ws[i], v: i % GIFTS.length, pop: 1, flash: i === 8 ? .5 : 0 }));
      S.cam = Math.max(0, S.blocks.length * bh - anchor);
      S.mv = { x: .52, w: .32, dir: -1, v: 9 % GIFTS.length, sp: 0 };
      S.pieces = [{ x: .61, w: .04, layer: 7, v: 1, dx: bh * .5, dy: bh * 1.3, vx: 0, vy: 0, rot: .5, vr: 0, life: 1 }];
      S.floats = [{ x: .45 * W, y: floor + S.cam - 9 * bh - bh * 1.9, life: .7 }];
      hud();
      if (kind === 'over') { S.mv = null; S.floats = []; S.mode = 'over'; draw(); setLayer(endPanel('Game over', 8, 'presents high', { isBest: false, leads: false }, 'Your best is ' + best + '.'), true); return; }
      if (kind === 'pause') { S.mode = 'play'; pause(); return; }
      draw();
    }

    measure(); reset();
    if (DEBUG) { window.__gmStack = S; S.test = { seen, geo: () => ({ W, H, bh, floor, dpr, hover: HOVER, frameMs }) }; }
    if (DEMO === 'play' || DEMO === 'over' || DEMO === 'pause') still(DEMO);
    else if (DEMO) { draw(); setLayer(tip, false, 'gm-up'); }
    else newGame();

    return {
      resize,
      destroy() {
        if ((S.mode === 'play' || S.mode === 'pause') && S.blocks.length > 1) submit(game, S.blocks.length - 1);
        alive = false; halt(); clearTimers(); if (ro) ro.disconnect();
        window.removeEventListener('keydown', onKey);
        document.removeEventListener('visibilitychange', onVis);
      }
    };
  }

  /* ================= the games ================= */
  const GAMES = [
    { id: 'catch', name: 'Present Catch', icon: 'gift', how: 'Slide the sack to catch every present. Watch out for coal.',
      valid: v => typeof v === 'number' && isFinite(v) && v > 0, better: (a, b) => a > b,
      short: v => String(v), long: v => String(v), art: artCatch, mount: mountCatch },
    { id: 'memory', name: 'Memory Match', icon: 'gmcards', how: 'Flip two cards at a time and find all eight pairs.',
      valid: v => !!v && typeof v === 'object' && v.moves > 0 && v.time > 0, better: (a, b) => a.moves < b.moves || (a.moves === b.moves && a.time < b.time),
      short: v => v.moves + ' moves', long: v => v.moves + ' moves<i>' + clock(v.time) + '</i>', artHTML: MEM_ART, mount: mountMemory },
    { id: 'stack', name: 'Gift Tower', icon: 'gmstack', how: 'Tap to drop each present and build the tallest tower.',
      valid: v => typeof v === 'number' && isFinite(v) && v > 0, better: (a, b) => a > b,
      short: v => String(v), long: v => v + ' high', art: artStack, mount: mountStack }
  ];

  /* ================= page ================= */
  let active = null;
  function teardown() {
    if (sheet) { const s = sheet; sheet = null; s.close(); }
    if (active) { const a = active; active = null; try { a.destroy(); } catch (e) { console.error(e); } }
  }
  A.pages.games = {
    render(root, args) {
      teardown();
      root.classList.toggle('gm-demo', !!DEMO);
      const g = GAMES.find(x => x.id === (args && args[0]));
      active = g ? g.mount(root, g) : mountHub(root);
    },
    leave() { teardown(); },
    onResize() { if (active && active.resize) active.resize(); }
  };
  /* scores saved on another device: show them on the hub as they arrive */
  if (A.on) A.on('sync', keys => { if (keys && keys.indexOf('games') >= 0 && active && active.hub && A.currentPage() === 'games' && !A.ui.sheetOpen()) A.refresh(); });
})();
