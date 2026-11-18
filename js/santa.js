/* Under the Tree: Secret Santa.
   Vote for an organizer, set it up, draw names, then hold to see who you got.
   Test hook: ?ssdemo=vote|vote0|vote5|tie|result|setup|details|waiting|drawn|peeked|held|out|tools|info
   (demo state lives in memory only and never touches saved data). */
(function () {
  'use strict';
  const App = window.App;
  if (!App) return;
  const $ = App.$, $$ = App.$$, esc = App.esc, icon = App.icon;

  App.css(`
.ss{flex:1;min-height:0;display:flex;flex-direction:column;width:100%;max-width:920px;margin:0 auto}
.ss-in{animation:rise .3s cubic-bezier(.2,.8,.2,1) both}

/* header + steps */
.ss-head{flex:none;display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"ttl more" "steps steps";align-items:center;gap:10px 12px;padding:2px 0 12px}
.ss-ttl{grid-area:ttl;min-width:0}
.ss-ttl .h1{white-space:nowrap}
.ss-sub{display:flex;align-items:center;gap:6px;margin-top:3px;font-size:13px;line-height:1.4;color:var(--muted);white-space:nowrap;overflow:hidden}
.ss-sub svg{color:var(--gold)}
.ss-more{grid-area:more;position:relative}
.ss-steps{grid-area:steps;list-style:none;display:flex;align-items:center;gap:8px;min-width:0;max-width:440px}
.ss-step{flex:none;display:flex;align-items:center;gap:7px;font-size:13px;font-weight:600;color:var(--dim);white-space:nowrap}
.ss-step i{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;font-style:normal;font-size:12px;font-weight:700;line-height:1;border:1.5px solid var(--line2)}
.ss-step i svg{stroke-width:3}
.ss-step.on{color:#fff}
.ss-step.on i{background:var(--gold);border-color:var(--gold);color:var(--gold-ink)}
.ss-step.done{color:var(--muted)}
.ss-step.done i{background:var(--green);border-color:var(--green);color:#fff}
.ss-bar{flex:1;height:2px;min-width:10px;border-radius:2px;background:var(--line2)}
.ss-bar.done{background:var(--green)}

/* shared layout */
/* knobs: set here (sized by the page), used inside the grid and hold-button containers */
.ss-body{flex:1;min-height:0;display:flex;flex-direction:column;gap:12px;padding-bottom:4px;--av:min(17cqw,50cqh - 44px);--tf:14.5px;--dk:.62;--chip:26px;--chipf:12.5px}
.ss-a{flex:1 1 0;min-width:0;min-height:0;display:flex;flex-direction:column;gap:8px}
.ss-b{flex:none;min-width:0;display:flex;flex-direction:column;gap:10px}
.ss-ask{flex:none}
.ss-ask p{margin-top:2px;font-size:13.5px;color:var(--muted)}
.ss-lab{flex:none;display:flex;align-items:baseline;justify-content:space-between;gap:10px}
.ss-lab span{font-size:13.5px;color:var(--muted);white-space:nowrap}

/* person tiles */
.ss-grid{flex:1 1 0;min-height:0;max-height:min(392px,100cqw);container-type:size;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-auto-rows:minmax(0,1fr);gap:10px}
.ss-tile{position:relative;min-width:0;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(3px,2.4cqh,9px);padding:6px;border-radius:16px;
  background:var(--surface);border:1.5px solid var(--line);font-weight:600;font-size:var(--tf);line-height:1.2;color:#fff;transition:transform .1s,border-color .15s,background-color .15s,opacity .15s,color .15s}
button.ss-tile:active{transform:scale(.97)}
.ss-tile .avatar{--size:clamp(24px,var(--av),92px)!important;transition:filter .15s,opacity .15s}
.ss-n{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ss-tick{position:absolute;right:7px;top:7px;width:clamp(18px,12cqh,22px);height:clamp(18px,12cqh,22px);border-radius:50%;display:grid;place-items:center;background:var(--gold);color:var(--gold-ink);transform:scale(0);transition:transform .2s cubic-bezier(.3,1.5,.5,1)}
.ss-tick svg{stroke-width:3}
.ss-tile.on{border-color:var(--gold);background:var(--surface2)}
.ss-tile.on .ss-tick{transform:scale(1)}
.ss-vote.lock .ss-tile{pointer-events:none}
.ss-pl.on{border-color:var(--line2);background:var(--surface)}
.ss-pl .ss-tick{background:var(--green);color:#fff}
.ss-pl:not(.on){background:transparent;border-style:dashed;border-color:var(--line2);color:var(--dim)}
.ss-pl:not(.on) .avatar{filter:grayscale(1);opacity:.35}

/* small avatar markers (who voted, who peeked) */
.ss-dots{flex:none;display:flex;align-items:center;gap:clamp(3px,1.2cqw,5px)}
.ss-dot{position:relative;display:block;line-height:0}
.ss-dot .avatar{--size:clamp(20px,6.6cqw,26px)!important;transition:opacity .2s,filter .2s}
.ss-dot:not(.done) .avatar{opacity:.42;filter:grayscale(.9)}
.ss-dot i{position:absolute;right:-3px;bottom:-3px;width:clamp(11px,50%,13px);aspect-ratio:1;border-radius:50%;display:grid;place-items:center;background:var(--green);color:#fff;box-shadow:0 0 0 2px var(--surface);transform:scale(0);transition:transform .2s cubic-bezier(.3,1.5,.5,1)}
.ss-dot i svg{stroke-width:3.6}
.ss-dot.done i{transform:scale(1)}

/* vote footer */
.ss-foot{flex:none;margin-top:auto;display:flex;flex-direction:column;gap:10px;padding:10px 12px 12px}
.ss-prog{display:flex;align-items:center;justify-content:space-between;gap:8px;min-width:0}
.ss-prog>b{font-size:14px;font-weight:600;white-space:nowrap}
.ss-count.is-off{opacity:.45}

/* status card (who has peeked, who is playing) */
.ss-peek{flex:none;display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:52px;padding:8px 12px}
.ss-peek-t{min-width:0;display:flex;flex-direction:column;line-height:1.3}
.ss-peek-t b{font-size:14px;font-weight:600;white-space:nowrap}
.ss-peek-t span{font-size:12.5px;color:var(--muted)}

/* price / day / note strip */
.ss-facts{flex:none;display:flex;align-items:stretch;width:100%;min-height:56px;padding:0;text-align:left;overflow:hidden;transition:transform .1s}
.ss-facts:active{transform:scale(.985)}
.ss-fact{flex:1 1 0;min-width:0;display:flex;flex-direction:column;justify-content:center;gap:1px;padding:8px 12px}
.ss-fact+.ss-fact{border-left:1px solid var(--line)}
.ss-fact.wide{flex-grow:1.5}
.ss-fact small{font-size:11.5px;font-weight:500;color:var(--muted);white-space:nowrap}
.ss-fact b{font-size:15px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ss-fact.unset b{color:var(--dim);font-weight:500}
.ss-go{flex:none;width:36px;display:grid;place-items:center;color:var(--dim)}
.ss-facts.edit .ss-go{color:var(--gold)}

/* tiebreak + result */
.ss-tie,.ss-result{align-items:center;justify-content:center;text-align:center}
.ss-tie{gap:16px}
.ss-tie .ss-ask p{max-width:40ch;margin-left:auto;margin-right:auto;text-wrap:balance}
.ss-tierow{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;width:100%}
.ss-tierow .ss-tile{flex:none;width:min(28cqw,34cqh,150px);aspect-ratio:1/1.08;opacity:.4;transition:opacity .12s,border-color .12s,background-color .12s,color .2s,transform .25s cubic-bezier(.3,1.4,.5,1)}
.ss-tierow .ss-tile{gap:max(3px,1cqh)}
.ss-tierow .ss-tile .avatar{--size:clamp(28px,min(15cqw,17cqh),72px)!important}
.ss-tierow .ss-tile.hot{opacity:1;border-color:var(--gold);background:var(--surface2)}
.ss-tierow .ss-tile.win{opacity:1;border-color:var(--gold);background:var(--gold);color:var(--gold-ink);transform:scale(1.07)}
.ss-result{gap:max(12px,3cqh)}
.ss-crowned{position:relative;flex:none;line-height:0}
.ss-crowned .avatar{--size:clamp(60px,min(32cqw,22cqh),128px)!important}
.ss-crowned i{position:absolute;left:50%;top:0;width:36px;height:36px;margin:-20px 0 0 -18px;border-radius:50%;display:grid;place-items:center;background:var(--gold);color:var(--gold-ink);box-shadow:0 0 0 3px #081226}
.ss-result-t{display:flex;flex-direction:column;align-items:center;gap:10px;min-width:0}
.ss-big{font-family:var(--display);font-weight:600;font-size:clamp(23px,min(7.4cqw,6cqh),38px);line-height:1.12;color:#fff;max-width:15ch;text-wrap:balance}
.ss-result-t p{font-size:14px;color:var(--muted)}
.ss-result-t .btn{margin-top:6px;min-width:160px}

/* waiting + sitting out */
.ss-wait>.ss-a,.ss-drawn>.ss-a{align-items:center;justify-content:center;text-align:center}
.ss-wait>.ss-a{gap:10px;padding-top:14px}
.ss-drawn>.ss-a{container-type:size;padding-bottom:14px}
.ss-wait .ss-crowned .avatar{--size:clamp(48px,min(22cqw,14cqh),100px)!important}
.ss-wait .ss-crowned i{width:30px;height:30px;margin:-16px 0 0 -15px}
.ss-a>p{max-width:32ch;font-size:13.5px;color:var(--muted)}
.ss-a>.h2{max-width:20ch;text-wrap:balance}
.ss-badge{flex:none;width:clamp(44px,32cqh,84px);aspect-ratio:1;border-radius:50%;display:grid;place-items:center;background:var(--surface2);border:1px solid var(--line);color:var(--gold)}

/* hold to reveal */
.ss-hold{--d:min(calc(100cqw*var(--dk)),100cqh,320px);position:relative;flex:none;width:var(--d);height:var(--d);border-radius:50%;cursor:pointer;touch-action:none;
  user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;outline-offset:6px}
.ss-hold:focus-visible{border-radius:50%}
.ss-ring{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg);pointer-events:none}
.ss-ring circle{fill:none;stroke-width:3}
.ss-ring .t{stroke:rgba(255,255,255,.16)}
.ss-ring .p{stroke:var(--gold);stroke-linecap:round;stroke-dasharray:100;stroke-dashoffset:100;opacity:0;transition:stroke-dashoffset .2s ease-out,opacity .2s}
.ss-hold.arm .ss-ring .p{opacity:1;stroke-dashoffset:0;transition:stroke-dashoffset .6s linear}
.ss-hold.shown .ss-ring .p{transition:none}
.ss-face{position:absolute;inset:calc(var(--d)*.075);border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;pointer-events:none}
.ss-idle{gap:calc(var(--d)*.035);padding:0 calc(var(--d)*.08);background:var(--red);color:#fff;box-shadow:0 calc(var(--d)*.05) calc(var(--d)*.14) rgba(0,0,0,.4);transition:transform .16s,background-color .16s}
.ss-idle svg{width:calc(var(--d)*.2);height:calc(var(--d)*.2)}
.ss-idle b{font-family:var(--display);font-weight:600;font-size:calc(var(--d)*.102);line-height:1.14}
.ss-hold.arm .ss-idle{transform:scale(.96);background:var(--red2)}
.ss-shown{display:none;gap:calc(var(--d)*.03);background:#0a1429;box-shadow:inset 0 0 0 3px var(--c2,var(--line2))}
.ss-shown .avatar{--size:calc(var(--d)*.37)!important}
.ss-shown>b{font-family:var(--display);font-weight:600;font-size:calc(var(--d)*.15);line-height:1.05;color:var(--c1,#fff)}
.ss-hold.shown .ss-idle{display:none}
.ss-hold.shown .ss-shown{display:flex;animation:ss-pop .16s cubic-bezier(.2,.9,.3,1.2) both}
@keyframes ss-pop{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:none}}
.ss-hold.still .ss-shown{animation:none}
.ss-meta{position:absolute;left:50%;bottom:-12px;transform:translateX(-50%);display:none;gap:6px;white-space:nowrap;pointer-events:none}
.ss-hold.shown .ss-meta{display:flex}
.ss-meta .chip{height:var(--chip);font-size:var(--chipf);box-shadow:0 4px 12px rgba(0,0,0,.45)}
.ss-after{flex:none;min-height:44px;display:flex;align-items:center;justify-content:center}
.ss-after .btn{width:100%}
.ss-hint{display:flex;align-items:center;gap:8px;font-size:13.5px;color:var(--muted)}
.ss-hint svg{flex:none;color:var(--gold)}

/* sheets */
.ss-row{display:flex;align-items:center;gap:12px;width:100%;min-height:64px;padding:8px 2px;text-align:left;border-bottom:1px solid var(--line)}
.ss-row:last-child{border-bottom:0}
.ss-row:active{background:rgba(255,255,255,.04)}
.ss-ri{flex:none;width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:var(--surface2);color:var(--gold)}
.ss-rt{flex:1;min-width:0;display:flex;flex-direction:column;line-height:1.3}
.ss-rt b{font-size:15.5px;font-weight:600}
.ss-rt small{font-size:13px;color:var(--muted)}
.ss-row>svg{color:var(--dim)}
.ss-row.dz .ss-ri{background:rgba(215,38,61,.16);color:#ff8a98}
.ss-row.dz .ss-rt b{color:#ff8a98}
.ss-money{position:relative}
.ss-money i{position:absolute;left:14px;top:50%;transform:translateY(-50%);font-style:normal;font-weight:600;color:var(--muted);pointer-events:none}
.ss-money .input{padding-left:30px;font-weight:600;-moz-appearance:textfield;appearance:textfield}
.ss-money .input::-webkit-outer-spin-button,.ss-money .input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
.ss-date{color-scheme:dark;display:block}
.ss-quick{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
.ss-q{flex:1 1 auto;min-width:62px;min-height:44px;padding:0 10px;border-radius:12px;background:var(--surface2);border:1px solid var(--line);font-weight:600;font-size:14.5px;white-space:nowrap;transition:transform .1s}
.ss-q:active{transform:scale(.96)}
.ss-q.on{background:var(--gold);border-color:transparent;color:var(--gold-ink)}
.ss-info>div{display:flex;align-items:flex-start;gap:14px;padding:13px 0;border-bottom:1px solid var(--line)}
.ss-info>div:last-child{border-bottom:0}
.ss-info dt{flex:none;width:88px;padding-top:1px;font-size:13px;font-weight:600;color:var(--muted)}
.ss-info dd{flex:1;min-width:0;font-weight:500;color:#fff;white-space:pre-wrap;overflow-wrap:anywhere}
.ss-info dd small{display:block;font-size:13px;font-weight:400;color:var(--muted)}
.ss-who{display:flex;flex-wrap:wrap;gap:6px}
.ss-who>span{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 11px 0 3px;border-radius:999px;background:var(--surface2);border:1px solid var(--line);font-size:13px;font-weight:600}

/* roomy widths: vote footer on one line */
@container (min-width:560px){
  .ss-foot{flex-direction:row;align-items:center;justify-content:space-between;padding:8px 8px 8px 14px}
  .ss-prog{justify-content:flex-start;gap:14px}
}

/* landscape: two columns */
@container (min-aspect-ratio:13/10){
  .ss-head{grid-template-columns:auto minmax(0,1fr) auto;grid-template-areas:"ttl steps more";column-gap:18px}
  .ss-steps{justify-self:end;width:min(100%,330px)}
  .ss-two{flex-direction:row;align-items:center;justify-content:center;gap:clamp(16px,3.6cqw,48px)}
  .ss-two>.ss-b{flex:1 1 0;max-width:430px}
  .ss-setup>.ss-a{flex:1.15 1 0;align-self:stretch;justify-content:center}
  .ss-wait>.ss-a{padding-top:0}
  .ss-drawn>.ss-a{flex:.8 1 0;align-self:stretch}
  .ss-body{--dk:.98}
}
/* roomy screens (tablets, desktop): header and content stay together as one centered block */
@container (min-width:600px) and (min-height:520px){
  .ss{max-height:650px;margin:auto}
  .ss-head{padding-bottom:18px}
  .ss-grid{gap:12px}
  .ss-body{--tf:15.5px;--chip:30px;--chipf:13.5px}
}
@container (min-aspect-ratio:13/10) and (min-height:520px){
  .ss{max-height:570px}
}

/* short screens (phones on their side) */
@container (max-height:360px){
  .ss-head{min-height:44px;padding:0 0 8px}
  .ss-ttl{display:flex;align-items:baseline;gap:12px}
  .ss-sub{margin-top:0}
  .ss-more{width:36px;height:36px}
  .ss-more::after{content:"";position:absolute;inset:-4px 0 -4px -8px}
  .ss-body{gap:8px;--tf:13.5px}
  .ss-vote{--av:min(9cqw,100cqh - 46px)}
  .ss-ask{display:flex;align-items:baseline;gap:10px}
  .ss-ask p{margin-top:0}
  .ss-grid{gap:8px}
  .ss-vote .ss-grid{grid-template-columns:repeat(6,minmax(0,1fr))}
  .ss-foot{padding:5px 5px 5px 12px}
  .ss-tie{gap:10px}
  .ss-tie .ss-ask{flex-direction:column;align-items:center;gap:2px}
  .ss-result{flex-direction:row;text-align:left;gap:24px}
  .ss-result-t{align-items:flex-start;gap:6px}
  .ss-crowned .avatar{--size:clamp(60px,38cqh,110px)!important}
  .ss-wait .ss-crowned .avatar{--size:clamp(44px,24cqh,80px)!important}
  .ss-wait>.ss-a{gap:6px}
  .ss-b{gap:8px}
}

/* short portrait (small phones) */
@container (max-height:440px) and (max-aspect-ratio:13/10){
  .ss-head{grid-template-areas:"ttl more" "steps more";gap:8px 12px;padding-bottom:8px}
  .ss-body{gap:8px}
  .ss-ask p,.ss-sub{display:none}
  .ss-foot{gap:8px;padding:8px 10px 10px}
  .ss-wait>.ss-a>p{display:none}
  .ss-b{gap:8px}
  .ss-after{min-height:40px}
  .ss-peek{min-height:46px;padding:6px 12px}
  .ss-facts{min-height:48px}
  .ss-fact{gap:0;padding:4px 12px;line-height:1.3}
}
`);

  /* ---------- constants + small helpers ---------- */
  const KEY = 'santa', DEMO = App.qs.get('ssdemo');
  const MIN_PLAYERS = 3, MIN_TO_COUNT = 4, HOLD_MS = 600, NOTE_MAX = 140;
  const HOLD_TEXT = 'Hold to see<br>who you got';
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const valid = n => App.names.indexOf(n) >= 0;
  const list = a => a.length < 2 ? (a[0] || '') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
  const parseDay = s => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ''); if (!m) return null; const d = new Date(+m[1], +m[2] - 1, +m[3]); return isNaN(d) ? null : d; };
  const dayShort = s => { const d = parseDay(s); return d ? MON[d.getMonth()] + ' ' + d.getDate() : ''; };
  const dayLong = s => { const d = parseDay(s); return d ? DAY[d.getDay()] + ', ' + MONTH[d.getMonth()] + ' ' + d.getDate() : ''; };
  const dayAway = s => {
    const d = parseDay(s); if (!d) return '';
    const n = App.now(), k = Math.round((d - new Date(n.getFullYear(), n.getMonth(), n.getDate())) / 864e5);
    return k < 0 ? '' : k === 0 ? 'That is today' : k === 1 ? 'That is tomorrow' : k + ' days away';
  };

  /* ---------- who got who, kept unreadable at a glance ---------- */
  function enc(obj) {
    const salt = App.uid(), src = encodeURIComponent(JSON.stringify(obj));
    let out = '';
    for (let i = 0; i < src.length; i++) out += String.fromCharCode(src.charCodeAt(i) ^ (salt.charCodeAt(i % salt.length) & 31));
    return salt + ':' + btoa(out).split('').reverse().join('');
  }
  function dec(str) {
    try {
      const s = String(str || ''), k = s.indexOf(':');
      if (k < 1) return null;
      const salt = s.slice(0, k), raw = atob(s.slice(k + 1).split('').reverse().join(''));
      let out = '';
      for (let i = 0; i < raw.length; i++) out += String.fromCharCode(raw.charCodeAt(i) ^ (salt.charCodeAt(i % salt.length) & 31));
      const o = JSON.parse(decodeURIComponent(out));
      return o && typeof o === 'object' ? o : null;
    } catch (e) { return null; }
  }
  function pairsOk(p, players) {
    if (!p || players.length < 2) return false;
    const seen = {};
    return players.every(n => { const to = p[n]; if (!to || to === n || players.indexOf(to) < 0 || seen[to]) return false; seen[to] = true; return true; });
  }
  /* nobody gets themselves */
  function derange(players) {
    for (let t = 0; t < 400; t++) {
      const mix = App.shuffle(players);
      if (players.every((n, i) => mix[i] !== n)) { const o = {}; players.forEach((n, i) => { o[n] = mix[i]; }); return o; }
    }
    const ring = App.shuffle(players), o = {};
    ring.forEach((n, i) => { o[n] = ring[(i + 1) % ring.length]; });
    return o;
  }
  const matchOf = name => { const p = dec(S.pairs); return p && valid(p[name]) ? p[name] : null; };

  /* ---------- state ---------- */
  let demoState = null;
  function blank() {
    return { phase: 'vote', votes: {}, leader: null, result: null, config: { players: App.names.slice(), budget: null, date: '', note: '' }, pairs: '', peeked: {} };
  }
  function read() {
    const raw = DEMO ? demoState : App.store.get(KEY, null), s = blank();
    if (!raw || typeof raw !== 'object') return s;
    const v = raw.votes || {}, c = raw.config || {}, r = raw.result;
    App.names.forEach(n => { if (valid(v[n])) s.votes[n] = v[n]; });
    if (valid(raw.leader)) s.leader = raw.leader;
    if (Array.isArray(c.players)) { const pl = App.names.filter(n => c.players.indexOf(n) >= 0); if (pl.length >= MIN_PLAYERS) s.config.players = pl; }
    s.config.budget = c.budget > 0 ? Math.min(9999, Math.round(c.budget)) : null;
    s.config.date = parseDay(c.date) ? c.date : '';
    s.config.note = typeof c.note === 'string' ? c.note.slice(0, NOTE_MAX) : '';
    if (r && typeof r === 'object') s.result = { votes: +r.votes || 0, total: +r.total || 0, tied: Array.isArray(r.tied) ? r.tied.filter(valid) : [] };
    if (s.leader && (raw.phase === 'setup' || raw.phase === 'drawn')) s.phase = raw.phase;
    if (s.phase === 'drawn') {
      if (pairsOk(dec(raw.pairs), s.config.players)) {
        s.pairs = raw.pairs;
        s.config.players.forEach(n => { if (raw.peeked && raw.peeked[n]) s.peeked[n] = true; });
      } else s.phase = 'setup';
    }
    return s;
  }
  function save() { if (DEMO) demoState = S; else App.store.set(KEY, S); }

  /* seeded states for screenshots and testing */
  function seed(kind, me) {
    const s = blank(), o = App.names.filter(n => n !== me);
    const plan = () => { s.config.budget = 20; s.config.date = App.xmas().getFullYear() + '-12-24'; s.config.note = 'Homemade gifts count. No gift cards.'; };
    const draw = (leader, peeked) => { plan(); s.phase = 'drawn'; s.leader = leader; s.pairs = enc(derange(s.config.players)); peeked.forEach(n => { s.peeked[n] = true; }); };
    switch (kind) {
      case 'vote': s.votes[o[0]] = o[1]; s.votes[o[1]] = me; s.votes[o[3]] = o[1]; s.votes[me] = o[2]; break;
      case 'vote5': o.forEach((n, i) => { s.votes[n] = o[i < 2 ? 0 : i < 4 ? 1 : 2]; }); break;
      case 'tie': App.names.forEach((n, i) => { s.votes[n] = o[i % 2]; }); break;
      case 'result': s.phase = 'setup'; s.leader = o[0]; s.result = { votes: 3, total: 6, tied: [] }; break;
      case 'setup': case 'details': s.phase = 'setup'; s.leader = me; s.config.budget = 20; break;
      case 'waiting': s.phase = 'setup'; s.leader = o[0]; s.config.players = App.names.filter(n => n !== o[4]); s.config.budget = 25; break;
      case 'drawn': case 'info': draw(o[0], [o[1], o[3]]); break;
      case 'peeked': case 'held': case 'tools': draw(me, [me, o[1], o[3]]); break;
      case 'out': s.config.players = o; draw(o[0], [o[2]]); break;
    }
    return s;
  }

  /* ---------- page plumbing ---------- */
  let wrap = null, S = blank(), V = {}, token = 0, timers = [], offs = [], hideReveal = null, demoDone = false;
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
  function cleanup() {
    timers.forEach(clearTimeout); timers = [];
    offs.forEach(f => { try { f(); } catch (e) {} }); offs = [];
    hideReveal = null;
  }
  const confetti = (el, n) => {
    if (!App.fx || !App.fx.confetti || !el) return;
    const r = el.getBoundingClientRect();
    try { App.fx.confetti(r.left + r.width / 2, r.top + r.height / 2, n || 70); } catch (e) {}
  };
  const viewName = me => V.mode || (S.phase === 'vote' ? 'vote' : S.phase === 'setup' ? (S.leader === me ? 'setup' : 'wait') : 'drawn');

  function paint(animate) {
    cleanup();
    if (!wrap) return;
    const me = App.me(), v = viewName(me), view = VIEWS[v];
    wrap.innerHTML = headHTML(me, v) + view.html(me);
    const body = wrap.lastElementChild;
    if (animate) body.classList.add('ss-in');
    const more = $('.ss-more', wrap);
    if (more) more.onclick = openTools;
    view.wire(body, me);
  }

  /* ---------- shared pieces ---------- */
  function headHTML(me, v) {
    const at = v === 'vote' || v === 'tie' ? 0 : v === 'drawn' ? 2 : 1;
    const steps = ['Vote', 'Set up', 'Draw'].map((t, i) =>
      (i ? '<li class="ss-bar' + (i <= at ? ' done' : '') + '" aria-hidden="true"></li>' : '') +
      '<li class="ss-step' + (i < at ? ' done' : i === at ? ' on' : '') + '"' + (i === at ? ' aria-current="step"' : '') + '><i>' + (i < at ? icon('check', 13) : i + 1) + '</i><span>' + t + '</span></li>').join('');
    const led = v === 'setup' || v === 'wait' || v === 'drawn';
    return '<header class="ss-head"><div class="ss-ttl"><h1 class="h1">Secret Santa</h1>' +
      (led ? '<p class="ss-sub">' + icon('crown', 15) + '<span>' + (S.leader === me ? 'You are running it' : esc(S.leader) + ' is running it') + '</span></p>' : '') + '</div>' +
      '<ol class="ss-steps" aria-label="Steps">' + steps + '</ol>' +
      (led && S.leader === me ? '<button type="button" class="icon-btn solid ss-more" aria-label="Organizer tools">' + icon('more') + '</button>' : '') + '</header>';
  }
  function tile(n, on, cls) {
    return '<button type="button" class="ss-tile' + (cls ? ' ' + cls : '') + (on ? ' on' : '') + '" data-n="' + n + '" aria-pressed="' + !!on + '">' +
      '<span class="ss-tick">' + icon('check', 14) + '</span>' + App.ui.avatar(n, 56) + '<span class="ss-n">' + esc(n) + '</span></button>';
  }
  function dots(names, done) {
    return '<div class="ss-dots">' + names.map(n => '<span class="ss-dot' + (done[n] ? ' done' : '') + '" data-n="' + n + '">' + App.ui.avatar(n, 26) + '<i>' + icon('check', 9) + '</i></span>').join('') + '</div>';
  }
  function crowned(n) { return '<div class="ss-crowned">' + App.ui.avatar(n, 96) + '<i>' + icon('crown', 20) + '</i></div>'; }
  function factsHTML(edit) {
    const c = S.config, open = S.phase !== 'drawn';
    const f = (label, val, unset, wide) => '<span class="ss-fact' + (unset ? ' unset' : '') + (wide ? ' wide' : '') + '"><small>' + label + '</small><b>' + esc(val) + '</b></span>';
    return '<button type="button" class="ss-facts card' + (edit ? ' edit' : '') + '" aria-label="' + (edit ? 'Change price limit, gift day and note' : 'See the details') + '">' +
      f('Price limit', c.budget ? '$' + c.budget : open ? 'Not set' : 'No limit', !c.budget) +
      f('Gift day', c.date ? dayShort(c.date) : 'Not set', !c.date) +
      f('Note', c.note || 'None', !c.note, true) +
      '<span class="ss-go">' + icon(edit ? 'pencil' : 'next', 18) + '</span></button>';
  }
  const factsTap = me => { if (S.leader === me) openDetails(); else openInfo(); };

  /* ---------- views ---------- */
  const VIEWS = {};

  /* 1. vote for the organizer */
  VIEWS.vote = {
    html(me) {
      return '<div class="ss-body ss-vote">' +
        '<div class="ss-ask"><h2 class="h2">Who should run it?</h2><p data-ask></p></div>' +
        '<div class="ss-grid">' + App.names.map(n => tile(n, S.votes[me] === n)).join('') + '</div>' +
        '<div class="ss-foot card"><div class="ss-prog"><b data-prog></b>' + dots(App.names, S.votes) + '</div>' +
        '<button type="button" class="btn ss-count">Count votes now</button></div></div>';
    },
    wire(el, me) {
      const tok = token, all = App.names.length, btn = $('.ss-count', el);
      let counting = false;
      const sync = () => {
        const n = App.names.filter(x => S.votes[x]).length, mine = S.votes[me];
        $$('.ss-tile', el).forEach(t => { const on = t.dataset.n === mine; t.classList.toggle('on', on); t.setAttribute('aria-pressed', on); });
        $('[data-ask]', el).textContent = mine ? 'Your vote is in. Tap another name to change it.' : 'Tap a name to cast your vote.';
        $('[data-prog]', el).textContent = n + ' of ' + all + ' have voted';
        $$('.ss-dot', el).forEach(d => d.classList.toggle('done', !!S.votes[d.dataset.n]));
        if (n >= all && !counting) { counting = true; el.classList.add('lock'); later(tally, App.reduced ? 300 : 900); }
        btn.textContent = counting ? 'Counting votes' : 'Count votes now';
        btn.classList.toggle('is-off', counting || n < MIN_TO_COUNT);
        btn.setAttribute('aria-disabled', counting || n < MIN_TO_COUNT);
      };
      el.addEventListener('click', e => {
        if (counting) return;
        const t = e.target.closest('.ss-tile');
        if (t) { if (S.votes[me] !== t.dataset.n) { S.votes[me] = t.dataset.n; save(); sync(); } return; }
        if (!e.target.closest('.ss-count')) return;
        const missing = App.names.filter(x => !S.votes[x]);
        if (all - missing.length < MIN_TO_COUNT) { App.ui.toast('At least ' + MIN_TO_COUNT + ' people need to vote first.'); return; }
        App.ui.confirm('Count votes now? ' + list(missing) + (missing.length === 1 ? ' has' : ' have') + ' not voted yet.', 'Count votes')
          .then(ok => { if (ok && tok === token && S.phase === 'vote' && !counting) tally(); });
      });
      sync();
    }
  };
  function tally() {
    const count = {}; let total = 0;
    App.names.forEach(n => { count[n] = 0; });
    App.names.forEach(n => { if (S.votes[n]) { count[S.votes[n]]++; total++; } });
    if (!total) return;
    const top = Math.max.apply(null, App.names.map(n => count[n]));
    const tied = App.names.filter(n => count[n] === top);
    const winner = tied.length > 1 ? App.pick(tied) : tied[0];
    S.phase = 'setup'; S.leader = winner; S.votes = {};
    S.result = { votes: top, total: total, tied: tied.length > 1 ? tied : [] };
    save();
    V = tied.length > 1 ? { mode: 'tie', tied: tied } : { mode: 'result' };
    paint(true);
  }

  /* tiebreak: the highlight runs along the tied names, slows down and stops on the winner */
  VIEWS.tie = {
    html() {
      const k = S.result.votes;
      return '<div class="ss-body ss-tie"><div class="ss-ask"><h2 class="h2">It is a tie</h2>' +
        '<p>' + esc(list(V.tied)) + ' each got ' + k + (k === 1 ? ' vote' : ' votes') + '. Picking one at random.</p></div>' +
        '<div class="ss-tierow">' + V.tied.map(n => '<div class="ss-tile" data-n="' + n + '">' + App.ui.avatar(n, 56) + '<span class="ss-n">' + esc(n) + '</span></div>').join('') + '</div></div>';
    },
    wire(el) {
      const tiles = $$('.ss-tile', el), k = tiles.length, w = Math.max(0, V.tied.indexOf(S.leader));
      const light = i => tiles.forEach((t, j) => t.classList.toggle('hot', j === i));
      const done = () => { light(w); tiles[w].classList.add('win'); later(() => { V = { mode: 'result' }; paint(true); }, 1100); };
      if (App.reduced) { later(done, 500); return; }
      let steps = 11, i = 0, gap = 90;
      while ((steps - 1) % k !== w) steps++;
      const tick = () => {
        light(i % k);
        if (++i >= steps) { later(done, 480); return; }
        gap = Math.min(380, gap * 1.18);
        later(tick, gap);
      };
      later(tick, 450);
    }
  };

  /* the winner */
  VIEWS.result = {
    html(me) {
      const r = S.result || { votes: 0, total: 0, tied: [] }, w = S.leader, rest = r.tied.filter(n => n !== w);
      return '<div class="ss-body ss-result">' + crowned(w) +
        '<div class="ss-result-t"><h2 class="ss-big">' + esc(w) + ' is running Secret Santa</h2>' +
        '<p>' + (rest.length ? 'Tied with ' + esc(list(rest)) + '. Picked at random.' : 'Won with ' + r.votes + ' of ' + r.total + ' votes.') + '</p>' +
        '<button type="button" class="btn primary" data-go>' + (w === me ? 'Set it up' : 'Continue') + '</button></div></div>';
    },
    wire(el) {
      $('[data-go]', el).onclick = () => { V = {}; paint(true); };
      later(() => confetti($('.ss-crowned', el), 90), 200);
    }
  };

  /* 2. set up (leader only) */
  VIEWS.setup = {
    html() {
      return '<div class="ss-body ss-two ss-setup">' +
        '<section class="ss-a"><div class="ss-lab"><h2 class="h2">Who is playing</h2><span data-np></span></div>' +
        '<div class="ss-grid">' + App.names.map(n => tile(n, S.config.players.indexOf(n) >= 0, 'ss-pl')).join('') + '</div></section>' +
        '<section class="ss-b">' + factsHTML(true) +
        '<button type="button" class="btn primary block" data-draw>' + icon('hat', 20) + 'Draw names</button></section></div>';
    },
    wire(el, me) {
      const tok = token, count = () => { $('[data-np]', el).textContent = S.config.players.length + ' playing'; };
      $('.ss-grid', el).addEventListener('click', e => {
        const t = e.target.closest('.ss-tile'); if (!t) return;
        const n = t.dataset.n, on = S.config.players.indexOf(n) >= 0;
        if (on && S.config.players.length <= MIN_PLAYERS) { App.ui.toast('You need at least ' + MIN_PLAYERS + ' players.'); return; }
        S.config.players = App.names.filter(x => x === n ? !on : S.config.players.indexOf(x) >= 0);
        save();
        t.classList.toggle('on', !on); t.setAttribute('aria-pressed', !on); count();
      });
      $('.ss-facts', el).onclick = () => factsTap(me);
      $('[data-draw]', el).onclick = () => {
        const c = S.config;
        App.ui.confirm('Draw names for ' + c.players.length + ' players with ' + (c.budget ? 'a $' + c.budget + ' limit' : 'no price limit') + '?', 'Draw names').then(ok => {
          if (!ok || tok !== token || S.phase !== 'setup') return;
          S.pairs = enc(derange(S.config.players)); S.peeked = {}; S.phase = 'drawn';
          save(); V = {}; paint(true);
          App.ui.toast('Names are drawn. Pass it around.');
          confetti($('.ss-hold', wrap) || wrap, 90);
        });
      };
      count();
    }
  };

  /* 2b. everyone else waits */
  VIEWS.wait = {
    html() {
      const L = esc(S.leader), on = {};
      S.config.players.forEach(n => { on[n] = true; });
      return '<div class="ss-body ss-two ss-wait">' +
        '<section class="ss-a">' + crowned(S.leader) + '<h2 class="h2">Waiting for&nbsp;' + L + ' to set it up</h2>' +
        '<p>' + L + ' picks who is playing and the price limit, then draws names.</p></section>' +
        '<section class="ss-b"><div class="ss-peek card"><div class="ss-peek-t"><b>Playing so far</b><span>' + S.config.players.length + ' of ' + App.names.length + '</span></div>' + dots(App.names, on) + '</div>' +
        factsHTML(false) + '</section></div>';
    },
    wire(el, me) { $('.ss-facts', el).onclick = () => factsTap(me); }
  };

  /* 3. names are drawn: hold to see yours */
  const HINT = '<p class="ss-hint">' + icon('lock', 17) + '<span>Make sure nobody else is looking.</span></p>';
  const WISH = '<button type="button" class="btn ss-wish">' + icon('gift', 20) + 'Open their wishlist</button>';
  VIEWS.drawn = {
    html(me) {
      const pl = S.config.players, playing = pl.indexOf(me) >= 0, seen = pl.filter(n => S.peeked[n]).length;
      const a = playing
        ? '<button type="button" class="ss-hold" aria-label="Hold to see who you got">' +
          '<svg class="ss-ring" viewBox="0 0 100 100" aria-hidden="true"><circle class="t" cx="50" cy="50" r="48.5"/><circle class="p" cx="50" cy="50" r="48.5" pathLength="100"/></svg>' +
          '<span class="ss-face ss-idle">' + icon('hand', 32) + '<b data-ht>' + HOLD_TEXT + '</b></span>' +
          '<span class="ss-face ss-shown" aria-live="polite"></span><span class="ss-meta"></span></button>'
        : '<div class="ss-badge">' + icon('mug', 30) + '</div><h2 class="h2">You are sitting this one out.</h2>' +
          '<p>Names are drawn for the ' + pl.length + ' people playing.</p>';
      return '<div class="ss-body ss-two ss-drawn"><section class="ss-a">' + a + '</section><section class="ss-b">' +
        (playing ? '<div class="ss-after">' + (S.peeked[me] ? WISH : HINT) + '</div>' : '') +
        '<div class="ss-peek card"><div class="ss-peek-t"><b>Who has peeked</b><span data-pk>' + seen + ' of ' + pl.length + '</span></div>' + dots(pl, S.peeked) + '</div>' +
        factsHTML(S.leader === me) + '</section></div>';
    },
    wire(el, me) {
      $('.ss-facts', el).onclick = () => factsTap(me);
      el.addEventListener('click', e => {
        if (!e.target.closest('.ss-wish')) return;
        const got = matchOf(me);
        if (got) App.go('#/list/' + encodeURIComponent(got));
      });
      const btn = $('.ss-hold', el);
      if (!btn) return;
      const face = $('.ss-shown', btn), meta = $('.ss-meta', btn), label = $('[data-ht]', btn);
      let down = false, shown = false, first = false, frozen = false, timer = 0, nudge = 0;

      const reveal = () => {
        timer = 0;
        const got = matchOf(me);
        if (!got) { stop(); App.ui.toast('That did not work. Ask ' + S.leader + ' to redraw names.'); return; }
        const p = App.person(got), c = S.config;
        face.style.setProperty('--c1', p.c[0]); face.style.setProperty('--c2', p.c[1]);
        face.innerHTML = App.ui.avatar(got, 96) + '<b>' + esc(got) + '</b>';
        meta.innerHTML = '<span class="chip gold">' + icon('tag') + (c.budget ? 'Up to $' + c.budget : 'No price limit') + '</span>' +
          (c.date ? '<span class="chip gold">' + icon('calendar') + dayShort(c.date) + '</span>' : '');
        btn.classList.add('shown'); shown = true;
        try { if (navigator.vibrate) navigator.vibrate(12); } catch (e) {}
        if (!S.peeked[me]) {
          S.peeked[me] = true; save(); first = true;
          const d = $('.ss-dot[data-n="' + me + '"]', el); if (d) d.classList.add('done');
          $('[data-pk]', el).textContent = S.config.players.filter(n => S.peeked[n]).length + ' of ' + S.config.players.length;
        }
      };
      const start = () => {
        if (down) return;
        down = true; clearTimeout(nudge);
        btn.classList.add('arm'); label.textContent = 'Keep holding';
        timer = setTimeout(reveal, HOLD_MS);
      };
      const stop = () => {
        if (!down || frozen) return;
        down = false;
        const early = !!timer;
        clearTimeout(timer); timer = 0;
        btn.classList.remove('arm', 'shown');
        face.innerHTML = ''; meta.innerHTML = '';
        label.innerHTML = early ? 'Press and hold' : HOLD_TEXT;
        if (early) nudge = setTimeout(() => { label.innerHTML = HOLD_TEXT; }, 1300);
        if (shown && first) { first = false; const slot = $('.ss-after', el); if (slot) { slot.innerHTML = WISH; slot.firstChild.classList.add('ss-in'); } }
        shown = false;
      };

      btn.addEventListener('pointerdown', e => {
        if (e.isPrimary === false || (e.pointerType === 'mouse' && e.button !== 0)) return;
        /* touch captures the pointer by default; let it go so sliding off the button hides the name */
        try { if (btn.hasPointerCapture(e.pointerId)) btn.releasePointerCapture(e.pointerId); } catch (err) {}
        start();
      });
      btn.addEventListener('pointermove', e => {
        if (!down || e.isPrimary === false) return;
        const r = btn.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        if (dx * dx + dy * dy > r.width * r.width / 4) stop();
      });
      ['pointerup', 'pointercancel', 'pointerleave', 'blur'].forEach(t => btn.addEventListener(t, stop));
      ['contextmenu', 'selectstart', 'dragstart'].forEach(t => btn.addEventListener(t, e => e.preventDefault()));
      btn.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!e.repeat) start(); } });
      btn.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') stop(); });
      const vis = () => { if (document.hidden) stop(); };
      window.addEventListener('blur', stop); window.addEventListener('pagehide', stop); document.addEventListener('visibilitychange', vis);
      hideReveal = stop;
      offs.push(() => {
        frozen = false; first = false; stop(); clearTimeout(nudge);
        window.removeEventListener('blur', stop); window.removeEventListener('pagehide', stop); document.removeEventListener('visibilitychange', vis);
      });
      if (V.hold) { V.hold = false; down = true; btn.classList.add('arm', 'still'); reveal(); frozen = true; } /* ?ssdemo=held */
    }
  };

  /* ---------- sheets ---------- */
  /* leader: price limit, gift day, note */
  function openDetails() {
    const c = S.config, y = App.xmas().getFullYear(), tok = token;
    App.ui.sheet({
      title: 'Price, day and note',
      html:
        '<div class="field"><label class="label" for="ssB">Price limit</label>' +
        '<div class="ss-money"><i>$</i><input class="input" id="ssB" type="number" inputmode="numeric" min="1" max="9999" step="1" placeholder="No limit" value="' + (c.budget || '') + '"></div>' +
        '<div class="ss-quick">' + [10, 20, 25, 50].map(v => '<button type="button" class="ss-q" data-b="' + v + '">$' + v + '</button>').join('') + '</div></div>' +
        '<div class="field"><label class="label" for="ssD">Gift day (optional)</label>' +
        '<input class="input ss-date" id="ssD" type="date" value="' + esc(c.date) + '">' +
        '<div class="ss-quick"><button type="button" class="ss-q" data-d="' + y + '-12-24">Christmas Eve</button>' +
        '<button type="button" class="ss-q" data-d="' + y + '-12-25">Christmas Day</button><button type="button" class="ss-q" data-d="">No date</button></div></div>' +
        '<div class="field"><label class="label" for="ssN">Note or rules (optional)</label>' +
        '<textarea class="input" id="ssN" maxlength="' + NOTE_MAX + '" placeholder="Like: homemade gifts count.">' + esc(c.note) + '</textarea></div>' +
        '<button type="button" class="btn primary block" data-save>Save</button>',
      onMount(el, close) {
        const b = $('#ssB', el), d = $('#ssD', el), n = $('#ssN', el);
        const sync = () => {
          $$('[data-b]', el).forEach(q => q.classList.toggle('on', q.dataset.b === String(parseInt(b.value, 10))));
          $$('[data-d]', el).forEach(q => q.classList.toggle('on', q.dataset.d === d.value));
        };
        el.addEventListener('click', e => {
          const q = e.target.closest('.ss-q');
          if (q) { if (q.dataset.b != null) b.value = q.dataset.b; else d.value = q.dataset.d; sync(); return; }
          if (!e.target.closest('[data-save]')) return;
          if (tok !== token) { close(); return; }
          const amount = parseInt(b.value, 10);
          S.config.budget = amount > 0 ? Math.min(9999, amount) : null;
          S.config.date = parseDay(d.value) ? d.value : '';
          S.config.note = n.value.trim().slice(0, NOTE_MAX);
          save(); close(); paint(false);
          App.ui.toast('Saved.');
        });
        b.addEventListener('input', sync); d.addEventListener('input', sync); d.addEventListener('change', sync);
        sync();
      }
    });
  }
  /* everyone else: read the plan */
  function openInfo() {
    const c = S.config, away = dayAway(c.date);
    App.ui.sheet({
      title: 'The plan',
      html: '<dl class="ss-info">' +
        '<div><dt>Run by</dt><dd>' + esc(S.leader) + '</dd></div>' +
        '<div><dt>Playing</dt><dd><div class="ss-who">' + c.players.map(n => '<span>' + App.ui.avatar(n, 26) + esc(n) + '</span>').join('') + '</div></dd></div>' +
        '<div><dt>Price limit</dt><dd>' + (c.budget ? 'Up to $' + c.budget : S.phase === 'drawn' ? 'No limit' : 'Not set yet') + '</dd></div>' +
        '<div><dt>Gift day</dt><dd>' + (c.date ? dayLong(c.date) + (away ? '<small>' + away + '</small>' : '') : 'Not set') + '</dd></div>' +
        '<div><dt>Note</dt><dd>' + (c.note ? esc(c.note) : 'None') + '</dd></div></dl>'
    });
  }
  /* leader tools */
  function openTools() {
    const tok = token, drawn = S.phase === 'drawn';
    const row = (act, ic, title, sub, danger) => '<button type="button" class="ss-row' + (danger ? ' dz' : '') + '" data-act="' + act + '"><span class="ss-ri">' + icon(ic, 22) + '</span>' +
      '<span class="ss-rt"><b>' + title + '</b><small>' + sub + '</small></span>' + icon('next', 18) + '</button>';
    App.ui.sheet({
      title: 'Organizer tools',
      html: row('edit', 'pencil', 'Change the details', 'Price limit, gift day and note') +
        (drawn ? row('redraw', 'swap', 'Redraw names', 'Everyone gets a new person', true) : '') +
        row('reset', 'trash', 'Start over', 'Clear everything and vote again', true),
      onMount(el, close) {
        el.addEventListener('click', e => {
          const r = e.target.closest('[data-act]'); if (!r) return;
          const act = r.dataset.act;
          close();
          later(() => {
            if (tok !== token) return;
            if (act === 'edit') openDetails();
            else if (act === 'redraw') App.ui.confirm('Redraw names? Everyone gets a new person and has to look again.', 'Redraw names', true).then(ok => {
              if (!ok || tok !== token || S.phase !== 'drawn') return;
              S.pairs = enc(derange(S.config.players)); S.peeked = {};
              save(); paint(true);
              App.ui.toast('New names are drawn.');
            });
            else App.ui.confirm('Start over? This clears the names and goes back to voting.', 'Start over', true).then(ok => {
              if (!ok || tok !== token) return;
              S = blank(); save(); V = {}; paint(true);
              App.ui.toast('Back to voting.');
            });
          }, 160);
        });
      }
    });
  }

  /* ---------- page ---------- */
  App.pages.santa = {
    render(root) {
      token++;
      const me = App.me();
      let after = null;
      if (DEMO && !demoState) demoState = seed(DEMO, me);
      S = read(); V = {};
      if (DEMO && !demoDone) {
        demoDone = true;
        if (DEMO === 'result') V = { mode: 'result' };
        if (DEMO === 'held') V = { hold: true };
        after = DEMO === 'tools' ? openTools : DEMO === 'details' ? openDetails : DEMO === 'info' ? openInfo : null;
      }
      root.innerHTML = '<div class="ss"></div>';
      wrap = root.firstChild;
      paint(false);
      if (after) after();
    },
    leave() { token++; cleanup(); wrap = null; },
    onResize() { if (hideReveal) hideReveal(); }
  };
})();
