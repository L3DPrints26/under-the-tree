/* Under the Tree — the Christmas Day reveal.
   Picks are secret all season. From Christmas Day the group can vote on showing who gave what.
   Everyone has to vote, and it only opens when every single person says yes. One "not yet" keeps
   everything secret, and anyone can change their vote. Saved with the group under "reveal"
   (one piece per person) and "thanks" (one piece per gift). */
(function () {
  'use strict';
  const A = window.App, $ = A.$, $$ = A.$$, esc = A.esc;

  A.css(`
    .rv-chip{display:inline-flex;align-items:center;gap:8px;min-height:40px;margin-top:10px;padding:0 16px;border-radius:999px;background:linear-gradient(#f7dc92,#d9a93a);color:#3a2a12;font-weight:700;font-size:14.5px;box-shadow:0 6px 16px rgba(0,0,0,.35)}
    .rv-chip svg{flex:none}
    .rv-chip.wait{background:var(--surface2);color:#fff;border:1px solid var(--line2)}
    .rv-people{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0 4px}
    .rv-p{display:flex;align-items:center;gap:7px;min-height:38px;padding:4px 12px 4px 5px;border-radius:999px;background:var(--surface2);border:1px solid var(--line);font-weight:600;font-size:14px}
    .rv-p i{font-style:normal;display:grid;place-items:center;width:20px;height:20px;border-radius:50%;background:var(--line2);color:var(--muted)}
    .rv-p.in{border-color:rgba(95,227,161,.55)}.rv-p.in i{background:#2a8a58;color:#fff}
    .rv-note{font-size:13.5px;font-weight:600;color:var(--gold);margin-top:6px}
    .rv-btns{display:flex;gap:8px;margin-top:14px}.rv-btns .btn{flex:1}
    .rv-sec{margin-top:16px}.rv-sec:first-child{margin-top:0}
    .rv-sec h3{font-size:13px;font-weight:700;color:var(--gold);margin-bottom:6px}
    .rv-row{display:flex;align-items:center;gap:12px;min-height:58px;padding:8px 0;border-bottom:1px solid var(--line)}
    .rv-row .grow{flex:1;min-width:0}.rv-row b{display:block;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .rv-row small{display:block;color:var(--muted);font-size:13px}
    .rv-row small em{font-style:normal;color:#5fe3a1;font-weight:700}
  `);

  /* January still counts as the Christmas that just happened */
  const season = () => { const d = A.now(); return d.getMonth() === 0 ? d.getFullYear() - 1 : d.getFullYear(); };
  /* voting opens on Christmas Day and closes at the end of January */
  const inWindow = () => { const n = A.now(), y = season(); return n >= new Date(y, 11, 25) && n < new Date(y + 1, 1, 1); };
  const all = () => { const v = A.store.get('reveal', null); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; };
  const voteOf = n => { const v = all()[n]; return v && v.y === season() ? v.v : ''; };
  const voted = () => A.names.filter(n => voteOf(n));
  const isOpen = () => inWindow() && A.names.length > 1 && A.names.every(n => voteOf(n) === 'yes');
  function vote(v) { const me = A.me(); if (!me) return; const r = all(); r[me] = { y: season(), v: v }; A.store.set('reveal', r); }

  /* who gave what, worked out from everyone's picks */
  function gifts() {
    const plans = A.store.get('plans', {}) || {}, out = [];
    A.names.forEach(from => {
      const p = plans[from]; if (!p || typeof p !== 'object') return;
      Object.keys(p).forEach(id => {
        if (!p[id]) return;
        A.names.forEach(to => { if (to === from) return; const it = A.data.find(to, id); if (it) out.push({ id: id, from: from, to: to, name: it.name, icon: it.icon || 'gift', st: p[id] }); });
      });
    });
    return out;
  }
  const thanks = () => { const v = A.store.get('thanks', null); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; };
  const thanked = g => { const t = thanks()[g.id]; return !!(t && t.from === g.to && t.to === g.from && t.y === season()); };
  function sayThanks(g) { const t = thanks(); t[g.id] = { from: g.to, to: g.from, n: String(g.name).slice(0, 80), y: season(), t: Date.now() }; A.store.set('thanks', t); }

  /* the pill on the home screen */
  function chipHTML() {
    if (!A.space() || !A.me() || !inWindow() || A.names.length < 2) return '';
    if (isOpen()) return '<button class="rv-chip" id="rvChip">' + A.icon('gift', 18) + 'See who gave what</button>';
    const mine = voteOf(A.me());
    return '<button class="rv-chip' + (mine ? ' wait' : '') + '" id="rvChip">' + A.icon(mine ? 'clock' : 'gift', 18) + (mine ? 'Reveal vote: ' + voted().length + ' of ' + A.names.length : 'Reveal who gave what? Vote') + '</button>';
  }
  function wire(root) { const b = $('#rvChip', root); if (b) b.onclick = sheet; }

  function voteSheet() {
    const me = A.me(), mine = voteOf(me), v = voted(), waiting = A.names.filter(n => !voteOf(n)), anyNo = A.names.some(n => voteOf(n) === 'no');
    const note = waiting.length ? 'Waiting on ' + (waiting.length <= 3 ? waiting.join(', ') : waiting.length + ' people') + '.' : anyNo ? 'Everyone voted, and somebody said not yet. It stays secret for now.' : '';
    A.ui.sheet({
      title: 'Reveal who gave what?',
      html: '<p class="muted">Picks have been secret all season. If every single person says yes, each of you gets to see who got you what. One "not yet" keeps it all secret, and anyone can change their vote.</p>' +
        '<div class="rv-people">' + A.names.map(n => '<span class="rv-p' + (voteOf(n) ? ' in' : '') + '">' + A.ui.avatar(n, 26) + esc(n) + '<i>' + A.icon(voteOf(n) ? 'check' : 'clock', 12) + '</i></span>').join('') + '</div>' +
        '<p class="rv-note">' + v.length + ' of ' + A.names.length + ' have voted. ' + note + '</p>' +
        '<div class="rv-btns"><button class="btn' + (mine === 'no' ? ' primary' : '') + '" id="rvNo">Not yet</button><button class="btn' + (mine === 'no' ? '' : ' primary') + '" id="rvYes">' + (mine === 'yes' ? 'You said yes' : 'Yes, reveal') + '</button></div>' +
        '<p class="sf-foot" data-keep>Everyone can see who has voted. Nobody can see how you voted.</p>',
      onMount(el, close) {
        $('#rvYes', el).onclick = () => { vote('yes'); close(); A.refresh(); if (isOpen()) celebrate(); else A.ui.toast('Your vote is in.'); };
        $('#rvNo', el).onclick = () => { vote('no'); close(); A.refresh(); A.ui.toast('Okay. It stays secret.'); };
      }
    });
  }

  function giftSheet() {
    const me = A.me(), g = gifts(), forMe = g.filter(x => x.to === me), fromMe = g.filter(x => x.from === me);
    const row = (x, mineToThank) => '<div class="rv-row">' + A.ui.avatar(mineToThank ? x.from : x.to, 38) + '<span class="grow"><b>' + esc(x.name) + '</b><small>' +
      (mineToThank ? 'From ' + esc(x.from) : 'To ' + esc(x.to)) + (!mineToThank && thanked(x) ? ' <em>said thank you</em>' : '') + '</small></span>' +
      (mineToThank ? (thanked(x) ? '<span class="chip green">' + A.icon('check') + 'Thanked</span>' : '<button class="btn sm primary" data-thank="' + esc(x.id) + '|' + esc(x.from) + '">Say thanks</button>') : '') + '</div>';
    A.ui.sheet({
      title: 'Who gave what', wide: true,
      html: '<div class="rv-sec"><h3>For you</h3>' + (forMe.length ? forMe.map(x => row(x, true)).join('') : '<p class="muted">Nobody marked a pick from your list in the app. Your gifts may have come from somewhere else.</p>') + '</div>' +
        '<div class="rv-sec"><h3>You gave</h3>' + (fromMe.length ? fromMe.map(x => row(x, false)).join('') : '<p class="muted">You did not mark any picks this year.</p>') + '</div>',
      onMount(el, close) {
        $$('[data-thank]', el).forEach(b => b.onclick = () => {
          const k = b.dataset.thank.split('|'), x = forMe.find(q => q.id === k[0] && q.from === k[1]);
          if (x) { sayThanks(x); A.ui.toast('Thank you sent to ' + x.from + '.'); close(); giftSheet(); }
        });
      }
    });
  }

  const sheet = () => (isOpen() ? giftSheet() : voteSheet());
  function celebrate() {
    A.ui.toast('Everyone said yes. Here is who gave what.');
    if (A.fx && A.fx.confetti) A.fx.confetti(innerWidth / 2, innerHeight * .3, 90);
    setTimeout(giftSheet, 500);
  }

  /* the moment the last yes comes in from another phone, and thank-yous meant for you */
  let wasOpen = null, seenThanks = null;
  function watch() {
    if (!A.space() || !A.me() || !A.cloud || !A.cloud.synced()) return;
    const now = isOpen();
    if (wasOpen === false && now && !A.ui.sheetOpen()) { A.refresh(); celebrate(); }
    wasOpen = now;
    const mine = Object.keys(thanks()).filter(k => { const t = thanks()[k]; return t && t.to === A.me() && t.y === season(); });
    if (seenThanks && now) { const fresh = mine.filter(k => seenThanks.indexOf(k) < 0); if (fresh.length) { const t = thanks()[fresh[0]]; A.ui.toast(t.from + ' says thank you for ' + t.n + '.'); } }
    seenThanks = mine;
  }
  A.on('cloud', () => setTimeout(watch, 800));
  A.on('sync', keys => { if (keys.indexOf('reveal') >= 0 || keys.indexOf('thanks') >= 0) { setTimeout(watch, 200); if (keys.indexOf('reveal') >= 0 && !A.ui.sheetOpen()) A.refresh(); } });

  A.reveal = { chipHTML, wire, sheet, isOpen, inWindow, voteOf };
})();
