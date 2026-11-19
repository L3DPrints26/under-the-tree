/* Under the Tree — safety and rules.
   Report or hide a wish, hide a person's list, delete your own stuff, and the links to the rules.
   Hidden things are kept on this device only. Reports are saved with the group, so whoever runs
   the group can take a wish off for everyone. */
(function () {
  'use strict';
  const A = window.App, $ = A.$, $$ = A.$$, esc = A.esc;
  const SITE = 'https://l3dprints26.github.io/under-the-tree/';
  const LINKS = { privacy: SITE + 'privacy.html', terms: SITE + 'terms.html', support: SITE + 'support.html' };
  const WHY = ['Rude or mean', 'Not okay for kids', 'A joke or spam', 'Something else'];

  A.css(`
    .sf-why{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0 4px}
    .sf-chip{min-height:40px;padding:0 14px;border-radius:999px;background:var(--surface2);border:1px solid var(--line);font-weight:600;font-size:14px}
    .sf-chip.on{background:var(--gold);border-color:var(--gold);color:var(--gold-ink)}
    .sf-foot{margin-top:12px;font-size:12.5px;color:var(--muted);text-align:center}
    .sf-foot a,.sf-links a{color:var(--gold);font-weight:600}
    .sf-rules{padding:12px 14px;border-radius:16px;background:rgba(47,154,100,.16);border:1px solid rgba(95,227,161,.45);margin-bottom:12px}
    .sf-rules b{display:flex;align-items:center;gap:8px;font-weight:700;margin-bottom:4px}
    .sf-rules p{font-size:14px;color:#e6f4ec;line-height:1.45}
    .sf-row{display:flex;align-items:center;gap:12px;width:100%;min-height:56px;padding:8px 14px;border-radius:16px;background:var(--surface2);border:1px solid var(--line);margin-bottom:8px;text-align:left}
    .sf-row>span{flex:1;min-width:0}.sf-row b{display:block;font-weight:600}.sf-row small{display:block;color:var(--muted);font-size:12.5px}
    .sf-row.red{border-color:rgba(255,122,138,.55)}.sf-row.red b{color:#ff9aa6}
    .sf-row i{font-style:normal;min-width:26px;height:26px;padding:0 8px;border-radius:13px;display:grid;place-items:center;background:var(--gold);color:var(--gold-ink);font-weight:700;font-size:13px}
    .sf-links{display:flex;justify-content:center;gap:18px;margin-top:10px;font-size:14px}
    .sf-rep{padding:12px 14px;border-radius:16px;background:var(--surface2);border:1px solid var(--line);margin-bottom:8px}
    .sf-rep b{display:block;font-weight:600}.sf-rep small{display:block;color:var(--muted);font-size:12.5px;margin-top:2px}
    .sf-acts{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
    .sf-hid{display:flex;align-items:center;gap:10px;min-height:50px;padding:4px 0;border-bottom:1px solid var(--line)}
    .sf-hid span{flex:1;min-width:0;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .sf-report{display:block;margin:14px auto 0;font-size:13px;font-weight:600;color:var(--muted);text-decoration:underline;text-underline-offset:3px}
    .sf-agree{margin-top:12px;font-size:12.5px;color:var(--muted);text-align:center}.sf-agree a{color:var(--gold);font-weight:600}
  `);

  /* ---------- hidden on this device ---------- */
  const hid = () => { const h = A.store.get('hidden', null); return h && typeof h === 'object' ? { w: h.w || {}, p: h.p || {} } : { w: {}, p: {} }; };
  const hiddenWish = id => !!hid().w[id];
  const hiddenPerson = n => !!hid().p[n];
  function hideWish(id, on) { const h = hid(); if (on) h.w[id] = 1; else delete h.w[id]; A.store.set('hidden', h); }
  function hidePerson(n, on) { const h = hid(); if (on) h.p[n] = 1; else delete h.p[n]; A.store.set('hidden', h); }

  /* ---------- reports, saved with the group ---------- */
  const reports = () => A.store.get('reports', {}) || {};
  const organizer = () => (A.lock ? A.lock.organizer() : '');
  const iRun = () => { const o = organizer(); return !!A.space() && !!A.me() && (!o || o === A.me()); };
  function report(who, id, why) {
    const it = A.data.find(who, id), r = reports();
    r[A.uid()] = { w: id, o: who, n: it ? String(it.name).slice(0, 80) : '', by: A.me() || '', why: why, t: Date.now() };
    A.store.set('reports', r);
    hideWish(id, true);
  }
  function dropReport(k) { const r = reports(); delete r[k]; A.store.set('reports', r); }

  function reportSheet(who, id) {
    const org = organizer();
    let why = WHY[0];
    A.ui.sheet({
      title: 'Report or hide',
      html: '<p class="muted">Hiding takes this wish off your phone only. Reporting also tells ' + (org && org !== A.me() ? esc(org) + ', who runs this group' : 'whoever runs this group') + ', so it can be taken off for everyone.</p>' +
        '<div class="sf-why">' + WHY.map((w, i) => '<button class="sf-chip' + (i ? '' : ' on') + '" data-why="' + w + '">' + w + '</button>').join('') + '</div>' +
        '<div class="lk-stack"><button class="btn danger block" id="sfReport">Report and hide</button><button class="btn block" id="sfHide">Just hide it for me</button>' +
        '<button class="btn ghost block" id="sfAll">Hide all of ' + esc(A.poss(who)) + ' list</button></div>' +
        '<p class="sf-foot" data-keep>A report shows your name to whoever runs the group. Something serious? <a href="' + LINKS.support + '" target="_blank" rel="noopener">Tell the people who make the app</a>.</p>',
      onMount(el, close) {
        $$('[data-why]', el).forEach(b => b.onclick = () => { why = b.dataset.why; $$('[data-why]', el).forEach(x => x.classList.toggle('on', x === b)); });
        $('#sfReport', el).onclick = () => { report(who, id, why); close(); A.ui.toast('Reported, and hidden on this phone.'); A.refresh(); };
        $('#sfHide', el).onclick = () => { hideWish(id, true); close(); A.ui.toast('Hidden on this phone.'); A.refresh(); };
        $('#sfAll', el).onclick = () => { hidePerson(who, true); close(); A.ui.toast('Hidden on this phone.'); A.refresh(); };
      }
    });
  }

  /* whoever runs the group: look at reports and take a wish off for everyone */
  function reportsSheet() {
    const r = reports(), ids = Object.keys(r).sort((a, b) => (r[b].t || 0) - (r[a].t || 0));
    A.ui.sheet({
      title: 'Reports',
      html: ids.length ? ids.map(k => {
        const x = r[k], still = A.names.indexOf(x.o) >= 0 && A.data.find(x.o, x.w);
        return '<div class="sf-rep"><b>' + esc(x.n || 'A wish') + '</b><small>On ' + esc(A.poss(x.o)) + ' list. ' + esc(x.by || 'Someone') + ' said: ' + esc(String(x.why || '').toLowerCase()) + '.</small>' +
          '<div class="sf-acts">' + (still ? '<button class="btn sm danger" data-off="' + k + '">Take the wish off</button>' : '<span class="chip">Already gone</span>') + '<button class="btn sm" data-ok="' + k + '">' + (still ? 'It is fine' : 'Clear') + '</button></div></div>';
      }).join('') : '<p class="muted">No reports. Nice group.</p>',
      onMount(el, close) {
        const again = () => { close(); reportsSheet(); };
        $$('[data-off]', el).forEach(b => b.onclick = () => { const x = reports()[b.dataset.off]; if (x) A.data.remove(x.o, x.w); dropReport(b.dataset.off); A.refresh(); again(); });
        $$('[data-ok]', el).forEach(b => b.onclick = () => { dropReport(b.dataset.ok); again(); });
      }
    });
  }

  function hiddenSheet() {
    const h = hid(), rows = [];
    Object.keys(h.p).forEach(n => { if (A.names.indexOf(n) >= 0) rows.push('<div class="sf-hid"><span>All of ' + esc(A.poss(n)) + ' list</span><button class="btn sm" data-sp="' + esc(n) + '">Show again</button></div>'); });
    Object.keys(h.w).forEach(id => {
      let label = '';
      A.names.forEach(n => { const it = A.data.find(n, id); if (it) label = it.name + ' (' + n + ')'; });
      if (label) rows.push('<div class="sf-hid"><span>' + esc(label) + '</span><button class="btn sm" data-sw="' + esc(id) + '">Show again</button></div>');
    });
    A.ui.sheet({
      title: 'Hidden on this phone',
      html: rows.length ? rows.join('') : '<p class="muted">Nothing is hidden.</p>',
      onMount(el, close) {
        const again = () => { close(); A.refresh(); hiddenSheet(); };
        $$('[data-sp]', el).forEach(b => b.onclick = () => { hidePerson(b.dataset.sp, false); again(); });
        $$('[data-sw]', el).forEach(b => b.onclick = () => { hideWish(b.dataset.sw, false); again(); });
      }
    });
  }

  /* ---------- delete my stuff ----------
     Takes everything this person added out of the group, for everyone: wishes and their photos, picks,
     scores, votes, advent doors, picture, ornament, PIN. Optionally their name too. */
  function deleteMine(alsoName) {
    const me = A.me(); if (!me) return;
    const S = A.store, pics = [];
    const obj = (k) => { const v = S.get(k, null); return v && typeof v === 'object' && !Array.isArray(v) ? v : null; };
    const lists = obj('lists');
    if (lists && lists[me]) {
      (lists[me].items || []).forEach(it => { (it.photos || []).forEach(p => { if (p && p.id) pics.push(p.id); }); if (it.backup && it.backup.photo) pics.push(it.backup.photo); });
      lists[me] = { items: [] }; S.set('lists', lists);
    }
    const plans = obj('plans'); if (plans && plans[me]) { delete plans[me]; S.set('plans', plans); }
    const share = obj('share');
    if (share) { delete share[me]; Object.keys(share).forEach(n => { if (Array.isArray(share[n])) share[n] = share[n].filter(x => x !== me); }); S.set('share', share); }
    const games = obj('games'); if (games) { Object.keys(games).forEach(g => { if (games[g] && typeof games[g] === 'object') delete games[g][me]; }); S.set('games', games); }
    ['santaBest', 'advent', 'privacy', 'pins'].forEach(k => { const v = obj(k); if (v && me in v) { delete v[me]; S.set(k, v); } });
    const hist = obj('history');
    if (hist) { Object.keys(hist).forEach(y => { if (hist[y] && hist[y][me]) { hist[y][me].forEach(it => (it.photos || []).forEach(p => { if (p && p.id) pics.push(p.id); })); delete hist[y][me]; } }); S.set('history', hist); }
    const pp = obj('pics'); if (pp && pp[me]) { pics.push(pp[me]); delete pp[me]; S.set('pics', pp); }
    const orns = obj('orns'); if (orns && orns[me]) { if (orns[me].img) pics.push(orns[me].img); delete orns[me]; S.set('orns', orns); }
    const santa = obj('santa'); if (santa && santa.votes && santa.votes[me]) { delete santa.votes[me]; S.set('santa', santa); }
    const watch = obj('watch'); if (watch) { Object.keys(watch).forEach(k => { if (watch[k] && watch[k].n === me) delete watch[k]; }); S.set('watch', watch); }
    const rep = obj('reports'); if (rep) { Object.keys(rep).forEach(k => { if (rep[k] && (rep[k].by === me || rep[k].o === me)) delete rep[k]; }); S.set('reports', rep); }
    pics.forEach(id => { A.photos.remove(id); if (A.cloud && A.cloud.dropPhoto) A.cloud.dropPhoto(id); });
    if (alsoName) {
      const own = obj('owners'); if (own && me in own) { delete own[me]; S.set('owners', own); }
      if (S.get('organizer', '') === me) S.del('organizer');
      A.removePerson(me); A.clearMe();
    }
    if (A.data && A.data.init) A.data.init();
    setTimeout(() => { location.hash = '#/'; location.reload(); }, 900);     /* give the changes a moment to send, then start clean */
  }

  function deleteSheet() {
    const me = A.me(); if (!me) return;
    A.ui.sheet({
      title: 'Delete my stuff',
      html: '<p class="muted">This takes your wishes, photos, picks, scores, votes, picture and ornament out of this group, for everyone. It cannot be undone.</p>' +
        '<label class="field" style="margin-top:12px"><span>Type Delete to go ahead</span><input class="input" id="sfType" autocomplete="off" autocapitalize="off" spellcheck="false"></label>' +
        '<div class="lk-stack"><button class="btn danger block" id="sfDel">Delete my stuff</button><button class="btn danger block" id="sfDelName">Delete my stuff and take ' + esc(me) + ' off the group</button>' +
        '<button class="btn ghost block" data-close>Keep everything</button></div><p class="gp-msg" id="sfMsg" style="text-align:center"></p>',
      onMount(el, close) {
        const go = also => { if ($('#sfType', el).value.trim().toLowerCase() !== 'delete') { $('#sfMsg', el).textContent = 'Type the word Delete first.'; return; } close(); A.ui.toast('Deleted.'); deleteMine(also); };
        $('#sfDel', el).onclick = () => go(false);
        $('#sfDelName', el).onclick = () => go(true);
      }
    });
  }

  /* ---------- the menu page for all of this ---------- */
  function sheet() {
    const h = hid(), nh = Object.keys(h.w).length + Object.keys(h.p).length, nr = Object.keys(reports()).length;
    const row = (id, ic, title, sub, n, cls) => '<button class="sf-row' + (cls ? ' ' + cls : '') + '" id="' + id + '">' + A.icon(ic, 22) + '<span><b>' + title + '</b><small>' + sub + '</small></span>' + (n ? '<i>' + n + '</i>' : '') + '</button>';
    A.ui.sheet({
      title: 'Safety and rules',
      html: '<div class="sf-rules"><b>' + A.icon('heart', 18) + 'The rules</b><p>Be kind. Nothing mean, rude or not okay for kids. Anyone can report or hide a wish, and whoever runs the group can take a wish or a person off.</p></div>' +
        (iRun() ? row('sfReports', 'todo', 'Reports', 'Wishes people in this group reported', nr) : '') +
        row('sfHidden', 'eye', 'Hidden on this phone', 'Wishes and lists you hid', nh) +
        (A.me() && A.space() ? row('sfDelete', 'trash', 'Delete my stuff', 'Take everything of yours out of this group', 0, 'red') : '') +
        '<div class="sf-links" data-keep><a href="' + LINKS.privacy + '" target="_blank" rel="noopener">Privacy</a><a href="' + LINKS.terms + '" target="_blank" rel="noopener">Terms</a><a href="' + LINKS.support + '" target="_blank" rel="noopener">Help</a></div>',
      onMount(el, close) {
        const tap = (id, fn) => { const x = $('#' + id, el); if (x) x.onclick = () => { close(); fn(); }; };
        tap('sfReports', reportsSheet); tap('sfHidden', hiddenSheet); tap('sfDelete', deleteSheet);
      }
    });
  }

  /* the line under "start or join a group": using the app means agreeing to the rules */
  const agreeHTML = () => '<p class="sf-agree" data-keep>By starting or joining a group you agree to the <a href="' + LINKS.terms + '" target="_blank" rel="noopener">Terms</a> and the <a href="' + LINKS.privacy + '" target="_blank" rel="noopener">Privacy Policy</a>.</p>';

  /* whoever runs the group hears about a new report the next time they open the app */
  let told = false;
  function nudge() {
    if (told || !iRun() || !A.cloud || !A.cloud.synced() || A.ui.sheetOpen()) return;
    const n = Object.keys(reports()).length; if (!n) return;
    told = true; A.ui.toast(n === 1 ? 'Someone reported a wish. See Menu, Safety.' : n + ' wishes were reported. See Menu, Safety.');
  }
  A.on('cloud', () => setTimeout(nudge, 1500));
  A.on('sync', keys => { if (keys.indexOf('reports') >= 0) { told = false; setTimeout(nudge, 600); } });

  A.safety = { sheet, reportSheet, reportsSheet, hiddenSheet, deleteSheet, hiddenWish, hiddenPerson, hidePerson, agreeHTML, links: LINKS };
})();
