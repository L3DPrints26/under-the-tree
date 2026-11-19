/* Under the Tree — wishlists: data, the list screen, the wish sheet, private picks and the add/edit form */
(function () {
  'use strict';
  const A = window.App, $ = A.$, $$ = A.$$, esc = A.esc;
  let lists = {}, plans = {}, share = {};

  /* ---------- data ---------- */
  const blank = () => ({ id: A.uid(), name: '', price: '', photos: [], links: [], why: [], note: '', icon: 'gift', top: false, santa: false, backup: null });
  const EMOJI = { '📱': 'phone', '🎮': 'game', '🎧': 'headphones', '👟': 'shoe', '👕': 'shirt', '📚': 'book', '🧸': 'toy', '⚽': 'ball', '🎨': 'art', '🚲': 'bike', '⌚': 'watch', '🎸': 'music', '🧵': 'spool', '💄': 'makeup' };
  function fromLegacy(it) {
    const n = blank(); n.id = it.id || n.id; n.name = it.name || ''; n.price = it.price || ''; n.note = it.note || ''; n.top = !!it.top;
    if (it.link) n.links = [it.link]; if (it.img) n.photos = [{ url: it.img }]; n.icon = EMOJI[it.emoji] || 'gift'; return n;
  }
  A.data = {
    init() {
      lists = A.store.get('lists', null);
      if (!lists) {
        lists = {};
        let old = null; try { old = JSON.parse(localStorage.getItem('xmas2026-data') || 'null'); } catch (e) {}
        A.names.forEach(n => { lists[n] = { items: old && old[n] && Array.isArray(old[n].items) ? old[n].items.map(fromLegacy) : [] }; });
      }
      A.names.forEach(n => { if (!lists[n] || !Array.isArray(lists[n].items)) lists[n] = { items: [] }; });
      /* pictures pasted into old lists as raw data move into the photo store, so lists stay small */
      Object.keys(lists).forEach(n => ((lists[n] && lists[n].items) || []).forEach(it => { (it.photos || []).forEach((p, i) => { if (p && p.url && /^data:image\//.test(p.url)) it.photos[i] = { id: A.photos.put(p.url) }; }); }));
      plans = A.store.get('plans', null);
      if (!plans) { plans = {}; const old = A.store.get('claims', {}); Object.keys(old).forEach(id => { const g = old[id]; if (A.names.indexOf(g) >= 0) (plans[g] = plans[g] || {})[id] = 'getting'; }); }
      share = A.store.get('share', {});
      if (A.seed) A.seed.apply(lists, blank);
      rollover();
      A.data.save();
    },
    save() { A.store.set('lists', lists); A.store.set('plans', plans); A.store.set('share', share); },
    items: n => (lists[n] ? lists[n].items : []),
    find: (n, id) => A.data.items(n).find(x => x.id === id)
  };
  const rank = x => (x.got ? -4 : 0) + (x.top ? 2 : 0) + (x.santa ? 1 : 0);
  const sorted = n => A.data.items(n).slice().sort((a, b) => rank(b) - rank(a));
  /* January still counts as last Christmas. From February the next season starts and received gifts move to Past years. */
  const seasonYear = () => { const d = A.now(); return d.getMonth() === 0 ? d.getFullYear() - 1 : d.getFullYear(); };
  function rollover() {
    const season = seasonYear(), last = A.store.get('season', season);
    if (season > last) {
      const hist = A.store.get('history', {});
      A.names.forEach(n => { lists[n].items = lists[n].items.filter(it => { if (!it.got) return true; const y = hist[it.got] = hist[it.got] || {}; (y[n] = y[n] || []).push(it); return false; }); });
      A.store.set('history', hist); plans = {};
    }
    A.store.set('season', season);
  }
  function openPast(who) {
    const hist = A.store.get('history', {}), years = Object.keys(hist).filter(y => hist[y][who] && hist[y][who].length).sort().reverse();
    const now = A.data.items(who).filter(it => it.got);
    const row = it => '<div class="pk-row">' + A.icon(it.icon || 'gift', 24) + '<span class="grow"><b>' + esc(it.name) + '</b>' + (it.price ? '<small>' + esc(it.price) + '</small>' : '') + '</span></div>';
    A.ui.sheet({
      title: (who === A.me() ? 'Your' : A.poss(who)) + ' past gifts',
      html: (now.length ? '<h3 class="h2" style="font-size:17px">This Christmas</h3>' + now.map(row).join('') : '') +
        years.map(y => '<h3 class="h2" style="font-size:17px;margin-top:18px">Christmas ' + y + '</h3>' + hist[y][who].map(row).join('')).join('') +
        (!now.length && !years.length ? '<p class="muted">Nothing yet. Gifts marked as received show up here, and each year is kept after the season ends.</p>' : '')
    });
  }
  const host = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return 'link'; } };
  const fixUrl = u => { u = (u || '').trim(); return u && !/^https?:\/\//i.test(u) ? 'https://' + u : u; };
  const firstPhoto = it => (it.photos || []).map(A.photos.src).find(Boolean) || '';
  /* a photo in a frame: the whole photo, never cropped, and never stretched past twice its real pixels
     (that is what made small photos blurry). A soft blurred copy fills whatever space is left. */
  const photoBox = src => '<img class="pbg" src="' + esc(src) + '" alt="" aria-hidden="true"><img class="pfg" src="' + esc(src) + '" alt="" onload="App.fitPhoto(this)">';
  A.fitPhoto = img => {
    const box = img.parentNode && img.parentNode.getBoundingClientRect(); if (!box || !box.width || !img.naturalWidth) return;
    const k = Math.min(box.width / img.naturalWidth, box.height / img.naturalHeight, 2 / Math.min(3, window.devicePixelRatio || 1));
    img.style.width = Math.round(img.naturalWidth * k) + 'px'; img.style.height = Math.round(img.naturalHeight * k) + 'px';
  };
  const badges = it => (it.top ? '<span class="chip gold">' + A.icon('star') + 'Most wanted</span>' : '') + (it.santa ? '<span class="chip red">' + A.icon('hat') + 'From Santa</span>' : '');

  /* picks are private: only the person who made them sees them, plus anyone they chose to share with.
     The person a gift is for never sees picks on their own list. */
  const PLAN = { getting: 'Getting this', bought: 'Already got it' };
  const myPlan = id => (plans[A.me()] || {})[id] || '';
  const setPlan = (id, v) => { const p = plans[A.me()] || (plans[A.me()] = {}); if (v) p[id] = v; else p[id] = undefined; };
  const sharedPlans = (id, owner) => A.names.filter(g => g !== A.me() && g !== owner && (share[g] || []).indexOf(A.me()) >= 0 && plans[g] && plans[g][id]).map(g => ({ who: g, st: plans[g][id] }));
  A.css(`
    .pl-opt{display:flex;align-items:center;gap:12px;width:100%;min-height:58px;padding:10px 14px;border-radius:14px;background:var(--surface2);border:1px solid var(--line);margin-bottom:8px;text-align:left}
    .pl-opt>span{flex:1;min-width:0}.pl-opt b{display:block;font-weight:600}.pl-opt small{color:var(--muted);font-size:12.5px}
    .pl-opt.on{border-color:var(--gold);background:rgba(233,196,106,.12)}.pl-opt>svg{color:var(--gold)}
    .pk-row{display:flex;align-items:center;gap:12px;min-height:54px;padding:6px 0;border-bottom:1px solid var(--line)}
    .pk-row b{display:block;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pk-row small{color:var(--muted);font-size:12.5px}
    .wshare{display:flex;gap:6px;flex-wrap:wrap}
    .wbackup{display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;color:#dbe6f4;background:var(--surface2);border:1px solid var(--line);border-radius:8px;padding:5px 9px;min-width:0}
    .wbackup span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .fold summary>span{display:flex;flex-direction:column;gap:1px}
    .fold summary small{display:flex;align-items:center;gap:5px;font-weight:500;font-size:12.5px;color:var(--muted)}
    .fold summary small.set{color:#5fe3a1}
    /* the wish photo always shows whole, never cropped or blown up */
    .gal>*{min-width:0;min-height:0;overflow:hidden}
    .wpic img.pbg,.gal img.pbg{position:absolute;inset:-12%;width:124%;height:124%;max-width:none;object-fit:cover;filter:blur(16px) brightness(.5)}
    .wpic img.pfg,.gal img.pfg{position:absolute;inset:0;margin:auto;width:auto;height:auto;max-width:100%;max-height:100%;object-fit:contain;border-radius:6px}
    body.low .wpic img.pbg,body.low .gal img.pbg{filter:brightness(.35)}
    @media (max-width:520px){.phead{gap:8px}.phead>.avatar{display:none}.phead .ttl .h1{font-size:clamp(19px,5.5vw,28px)}.phead .btn{padding:0 12px;gap:6px}}
    .wcard.is-got .wpic img,.wcard.is-got .wpic .ph{filter:grayscale(1);opacity:.45}
    .wcard.is-got .wtitle,.wcard.is-got .wprice,.wcard.is-got .wwhy{opacity:.5}
  `);

  /* ---------- the list screen ---------- */
  function cardHTML(who, it, mine) {
    const p = A.person(who), src = firstPhoto(it), n = (it.photos || []).length, mp = mine ? '' : myPlan(it.id), others = mine ? [] : sharedPlans(it.id, who);
    const act = mine ? '<button class="btn sm" data-edit="' + it.id + '">' + A.icon('pencil', 16) + 'Edit</button><button class="btn sm' + (it.got ? ' green' : '') + '" data-got="' + it.id + '">' + A.icon('check', 16) + (it.got ? 'Got it' : 'I got this') + '</button>'
      : '<button class="btn sm' + (mp ? ' primary' : '') + '" data-plan="' + it.id + '">' + A.icon(mp ? 'check' : 'lock', 16) + (mp ? PLAN[mp] : 'Add to my picks') + '</button>';
    return '<article class="wcard' + (it.top ? ' is-top' : '') + (it.got ? ' is-got' : '') + '" data-id="' + it.id + '" style="--c2:' + p.c[1] + ';--c3:' + p.c[2] + '">' +
      '<div class="wpic">' + (src ? photoBox(src) : A.icon(it.icon || 'gift', 64, 'ph')) +
      '<div class="wbadges">' + (it.got ? '<span class="chip green">' + A.icon('check') + (mine ? 'You got it' : esc(who) + ' got this') + '</span>' : badges(it)) + '</div>' + (n > 1 ? '<span class="wcount">' + A.icon('photo', 14) + n + '</span>' : '') + '</div>' +
      '<div class="wbody"><h3 class="wtitle">' + esc(it.name) + '</h3>' + (it.price ? '<div class="wprice">' + esc(it.price) + '</div>' : '') +
      ((it.why && it.why[0]) || it.note ? '<p class="wwhy">' + esc((it.why && it.why[0]) || it.note) + '</p>' : '') +
      (it.backup && it.backup.name ? '<p class="wbackup">' + A.icon('swap', 14) + '<span>Backup: ' + esc(it.backup.name) + '</span></p>' : '') +
      (others.length ? '<div class="wshare">' + others.map(o => '<span class="chip">' + esc(o.who) + ': ' + PLAN[o.st].toLowerCase() + '</span>').join('') + '</div>' : '') +
      '<div class="wacts">' + act + '</div></div></article>';
  }
  A.pages.list = {
    tab: 'home',
    render(root, args) {
      const who = args[0]; if (A.names.indexOf(who) < 0) { A.go('#/'); return; }
      const mine = who === A.me(), items = sorted(who), picked = mine ? 0 : items.filter(i => myPlan(i.id)).length;
      const sub = items.length ? items.length + (items.length === 1 ? ' wish' : ' wishes') + (picked ? ', ' + picked + ' in your picks' : '') : 'Nothing here yet';
      root.innerHTML = '<div class="phead"><a class="icon-btn solid" href="#/" aria-label="Back">' + A.icon('back') + '</a>' + A.ui.avatar(who, 40) +
        '<div class="ttl"><h1 class="h1">' + (mine ? 'Your list' : esc(A.poss(who)) + ' list') + '</h1><p>' + sub + '</p></div>' +
        '<button class="icon-btn solid" id="pastBtn" aria-label="Past gifts">' + A.icon('clock', 20) + '</button>' +
        (mine ? '<button class="btn primary sm" data-add>' + A.icon('plus', 18) + 'Add</button>' : '<button class="btn sm" id="picksBtn">' + A.icon('lock', 16) + 'My picks</button>') + '</div>' +
        (items.length
          ? '<div class="reel" id="reel">' + items.map(it => cardHTML(who, it, mine)).join('') + (mine ? '<button class="wcard addcard" data-add>' + A.icon('plus', 30) + '<span>Add a wish</span></button>' : '') + '</div><div class="dots" id="dots"></div>'
          : '<div class="empty">' + A.icon('gift', 54) + '<p>' + (mine ? 'Add the first thing you are hoping for. A photo and a link make it easy to shop for you.' : esc(who) + ' has not added anything yet.') + '</p>' + (mine ? '<button class="btn primary" data-add>' + A.icon('plus', 18) + 'Add a wish</button>' : '') + '</div>');
      $$('[data-add]', root).forEach(b => b.onclick = () => openForm(who, null));
      const pb = $('#picksBtn', root); if (pb) pb.onclick = openPicks;
      $('#pastBtn', root).onclick = () => openPast(who);
      const reel = $('#reel', root); if (!reel) return;
      const cards = $$('.wcard', reel), dots = $('#dots', root);
      dots.innerHTML = cards.length > 1 && cards.length <= 14 ? cards.map((c, i) => '<i' + (i ? '' : ' class="on"') + '></i>').join('') : '';
      let raf = 0; reel.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { const x = reel.scrollLeft + reel.clientWidth / 2; let best = 0, bd = 1e9; cards.forEach((c, i) => { const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - x); if (d < bd) { bd = d; best = i; } }); $$('i', dots).forEach((d, i) => d.classList.toggle('on', i === best)); }); }, { passive: true });
      reel.addEventListener('wheel', e => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { reel.scrollLeft += e.deltaY; e.preventDefault(); } }, { passive: false });
      reel.addEventListener('click', e => {
        const ed = e.target.closest('[data-edit]'), pl = e.target.closest('[data-plan]'), card = e.target.closest('.wcard[data-id]');
        const got = e.target.closest('[data-got]');
        if (got) { const it = A.data.find(who, got.dataset.got); if (it) { it.got = it.got ? 0 : seasonYear(); const r = got.getBoundingClientRect(); if (it.got && A.fx) A.fx.confetti(r.left + r.width / 2, r.top, 30); A.data.save(); A.refresh(); } return; }
        if (ed) return openForm(who, ed.dataset.edit);
        if (pl) return openPlan(who, pl.dataset.plan);
        if (card && !e.target.closest('button')) openDetail(who, card.dataset.id);
      });
    }
  };

  /* ---------- private picks ---------- */
  function openPlan(who, id) {
    const it = A.data.find(who, id); if (!it) return;
    const cur = myPlan(id);
    const opt = (v, icon, label, sub) => '<button class="pl-opt' + (cur === v && v ? ' on' : '') + '" data-v="' + v + '">' + A.icon(icon, 22) + '<span><b>' + label + '</b><small>' + sub + '</small></span>' + (cur === v && v ? A.icon('check', 20) : '') + '</button>';
    A.ui.sheet({
      title: it.name,
      html: '<p class="muted small" style="margin-bottom:12px">Your picks are private. ' + esc(who) + ' never sees them.</p>' +
        opt('getting', 'gift', "I'm getting this", 'Planning to buy it') + opt('bought', 'check', 'I already got it', 'Bought and hidden away') + (cur ? opt('', 'x', 'Take it off my picks', 'Changed my mind') : '') +
        '<button class="btn sm block ghost" id="plShare" style="margin-top:6px">' + A.icon('users', 16) + 'Choose who can see my picks</button>',
      onMount(el, close) {
        $$('.pl-opt', el).forEach(b => b.onclick = () => { setPlan(id, b.dataset.v); A.data.save(); close(); A.refresh(); A.ui.toast(b.dataset.v ? 'Saved to your picks.' : 'Taken off your picks.'); });
        $('#plShare', el).onclick = () => { close(); openPicks(); };
      }
    });
  }
  function openPicks() {
    const me = A.me(), mine = plans[me] || {}, rows = [], sh = share[me] || [];
    A.names.forEach(n => { if (n === me) return; A.data.items(n).forEach(it => { if (mine[it.id]) rows.push('<div class="pk-row">' + A.ui.avatar(n, 30) + '<span class="grow"><b>' + esc(it.name) + '</b><small>For ' + n + '</small></span><span class="chip ' + (mine[it.id] === 'bought' ? 'green' : 'gold') + '">' + PLAN[mine[it.id]] + '</span></div>'); }); });
    A.ui.sheet({
      title: 'My picks',
      html: (rows.length ? rows.join('') : '<p class="muted">Nothing picked yet. Open a list and tap "Add to my picks" on a wish.</p>') +
        '<h3 class="h2" style="font-size:17px;margin-top:20px">Who can see my picks</h3><p class="muted small" style="margin:4px 0 6px">Off means only you. The person a gift is for never sees it, even if they are switched on.</p>' +
        A.names.filter(n => n !== me).map(n => '<label class="switch"><span class="row gap">' + A.ui.avatar(n, 30) + '<b>' + n + '</b></span><input type="checkbox" data-s="' + n + '"' + (sh.indexOf(n) >= 0 ? ' checked' : '') + '></label>').join(''),
      onMount(el) {
        $$('[data-s]', el).forEach(c => c.onchange = () => { const cur = share[me] || (share[me] = []), i = cur.indexOf(c.dataset.s); if (c.checked && i < 0) cur.push(c.dataset.s); if (!c.checked && i >= 0) cur.splice(i, 1); A.data.save(); });
      }
    });
  }

  /* ---------- one wish, full details ---------- */
  function openDetail(who, id) {
    const it = A.data.find(who, id); if (!it) return;
    const mine = who === A.me(), mp = mine ? '' : myPlan(id), pics = (it.photos || []).map(A.photos.src).filter(Boolean), b = it.backup;
    const bsrc = b && b.photo ? A.photos.src(b.photo) : '';
    const act = mine ? '<button class="btn" data-edit>' + A.icon('pencil', 18) + 'Edit</button>'
      : '<button class="btn' + (mp ? ' primary' : '') + '" data-plan>' + A.icon(mp ? 'check' : 'lock', 18) + (mp ? PLAN[mp] : 'Add to my picks') + '</button>';
    return A.ui.sheet({
      title: mine ? 'Your wish' : A.poss(who) + ' wish', wide: true,
      html: '<div class="gal">' + (pics.length ? pics.map(s => '<div>' + photoBox(s) + '</div>').join('') : '<div>' + A.icon(it.icon || 'gift', 90, 'ph') + '</div>') + '</div>' +
        (pics.length > 1 ? '<p class="muted small center" style="margin-top:6px">Swipe for ' + pics.length + ' photos</p>' : '') +
        '<h3 class="d-title">' + esc(it.name) + '</h3>' + (it.price ? '<div class="d-price">' + esc(it.price) + '</div>' : '') +
        (it.top || it.santa ? '<div class="row gap-s wrap" style="margin-top:10px">' + badges(it) + '</div>' : '') +
        (it.why && it.why.length ? '<div class="d-sec"><h3>Why ' + (mine ? 'I' : esc(who)) + ' would love it</h3><ul class="why">' + it.why.map(w => '<li>' + A.icon('check') + '<span>' + esc(w) + '</span></li>').join('') + '</ul></div>' : '') +
        (it.note ? '<div class="d-sec"><h3>Good to know</h3><p class="d-note">' + esc(it.note) + '</p></div>' : '') +
        (it.links && it.links.length ? '<div class="d-sec"><h3>Where to get it</h3><div class="links">' + it.links.map(u => '<a class="btn block" href="' + esc(u) + '" target="_blank" rel="noopener">' + A.icon('link', 18) + 'Open ' + esc(host(u)) + '</a>').join('') + '</div></div>' : '') +
        (b && b.name ? '<div class="d-sec"><h3>Backup, if the first choice does not work out</h3><div class="backup"><div class="row gap">' + (bsrc ? '<img src="' + esc(bsrc) + '" alt="" style="width:64px;height:64px;border-radius:10px;object-fit:cover">' : '') + '<div class="grow"><b>' + esc(b.name) + '</b>' + (b.price ? '<span class="wprice">' + esc(b.price) + '</span>' : '') + '</div></div>' +
          (b.note ? '<p class="d-note small" style="margin-top:8px">' + esc(b.note) + '</p>' : '') + (b.link ? '<a class="btn sm block" style="margin-top:10px" href="' + esc(b.link) + '" target="_blank" rel="noopener">' + A.icon('link', 16) + 'Open ' + esc(host(b.link)) + '</a>' : '') + '</div></div>' : '') +
        '<div class="sticky-acts">' + act + '</div>',
      onMount(el, close) {
        const e1 = $('[data-edit]', el), c1 = $('[data-plan]', el);
        if (e1) e1.onclick = () => { close(); openForm(who, id); };
        if (c1) c1.onclick = () => { close(); openPlan(who, id); };
      }
    });
  }

  /* ---------- add / edit ---------- */
  function openForm(who, id) {
    const editing = !!id, src = editing ? A.data.find(who, id) : null, it = Object.assign(blank(), JSON.parse(JSON.stringify(src || {})));
    let photos = (it.photos || []).slice(), links = (it.links && it.links.length ? it.links : ['']).slice(), icon = it.icon || 'gift';
    const b = it.backup || {};
    A.ui.sheet({
      title: editing ? 'Edit wish' : 'Add a wish', wide: true,
      html: '<label class="field"><span>What is it?</span><input class="input" id="fName" maxlength="90" value="' + esc(it.name) + '" placeholder="Wireless headphones"></label>' +
        '<label class="field"><span>About how much?</span><input class="input" id="fPrice" maxlength="40" value="' + esc(it.price) + '" placeholder="$40" inputmode="text"></label>' +
        '<div class="field"><span class="label">Photos</span><div class="drop" id="drop"></div><input type="file" id="fFile" accept="image/*" multiple hidden></div>' +
        '<div class="field"><span class="label">Links</span><div id="fLinks"></div><button type="button" class="btn sm" id="addLink">' + A.icon('plus', 16) + 'Add another link</button></div>' +
        '<label class="field"><span>Why would you love it? One reason per line.</span><textarea class="input" id="fWhy" maxlength="900" placeholder="I would use it every day">' + esc((it.why || []).join('\n')) + '</textarea></label>' +
        '<label class="field"><span>Anything else they should know? Size, color, which version.</span><textarea class="input" id="fNote" maxlength="600" style="min-height:70px">' + esc(it.note) + '</textarea></label>' +
        '<label class="switch"><span class="s-text"><b>Most wanted</b><small>Your number one. Only one wish can have this.</small></span><input type="checkbox" id="fTop"' + (it.top ? ' checked' : '') + '></label>' +
        '<label class="switch"><span class="s-text"><b>Ask Santa for this one</b><small>The gift you want from Santa. Only one wish can have this.</small></span><input type="checkbox" id="fSanta"' + (it.santa ? ' checked' : '') + '></label>' +
        '<details class="fold"' + (b.name ? ' open' : '') + '><summary><span>Backup option<small id="bState"></small></span>' + A.icon('next', 18) + '</summary>' +
          '<p class="muted small" style="margin-bottom:12px">Something that would also be great if the first choice does not work out.</p>' +
          '<label class="field"><span>Backup</span><input class="input" id="bName" maxlength="90" value="' + esc(b.name || '') + '" placeholder="A different color or model"></label>' +
          '<label class="field"><span>Price</span><input class="input" id="bPrice" maxlength="40" value="' + esc(b.price || '') + '"></label>' +
          '<label class="field"><span>Link</span><input class="input" id="bLink" value="' + esc(b.link || '') + '" placeholder="https://" inputmode="url" autocapitalize="off"></label>' +
          '<label class="field"><span>Note</span><textarea class="input" id="bNote" maxlength="400" style="min-height:64px">' + esc(b.note || '') + '</textarea></label></details>' +
        '<div class="field"><span class="label">Icon, used when there is no photo</span><div class="iconpick" id="fIcons">' + A.wishIcons.map(n => '<button type="button" data-ic="' + n + '"' + (n === icon ? ' class="on"' : '') + ' aria-label="' + n + '">' + A.icon(n, 22) + '</button>').join('') + '</div></div>' +
        '<div class="sticky-acts">' + (editing ? '<button class="btn danger" id="fDel" style="flex:0 0 auto" aria-label="Remove this wish">' + A.icon('trash', 18) + '</button>' : '') + '<button class="btn primary" id="fSave">' + (editing ? 'Save' : 'Add to my list') + '</button></div>',
      onMount(el, close) {
        const drop = $('#drop', el), file = $('#fFile', el), linksEl = $('#fLinks', el);
        /* say plainly whether a backup is set, and keep it true while they type */
        const bState = $('#bState', el), bIn = $('#bName', el);
        const drawBackup = () => { const n = bIn.value.trim(); bState.className = n ? 'set' : ''; bState.innerHTML = n ? A.icon('check', 13) + 'Set: ' + esc(n) : 'Not set. Tap to add one.'; };
        bIn.addEventListener('input', drawBackup); drawBackup();
        const drawPhotos = () => {
          drop.innerHTML = photos.map((p, i) => '<div class="thumb"><img src="' + esc(A.photos.src(p)) + '" alt=""><button type="button" data-rm="' + i + '" aria-label="Take this photo off">' + A.icon('x') + '</button></div>').join('') +
            '<button type="button" class="addphoto" id="pick">' + A.icon('camera', 22) + 'Add photo</button>' + (photos.length ? '' : '<span class="drop-hint">Pick from your photos, take one, or drag a picture here.</span>');
          $('#pick', drop).onclick = () => file.click();
          $$('[data-rm]', drop).forEach(x => x.onclick = () => { photos.splice(+x.dataset.rm, 1); drawPhotos(); });
        };
        const addFiles = fl => Promise.all(Array.from(fl || []).slice(0, 8).map(f => A.photos.fromFile(f).then(pid => photos.push({ id: pid })).catch(() => A.ui.toast('That file is not a picture.')))).then(drawPhotos);
        file.onchange = () => { addFiles(file.files); file.value = ''; };
        ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
        ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
        drop.addEventListener('drop', e => addFiles(e.dataTransfer && e.dataTransfer.files));
        el.addEventListener('paste', e => { const fs = Array.from((e.clipboardData && e.clipboardData.files) || []).filter(f => /^image\//.test(f.type)); if (fs.length) { e.preventDefault(); addFiles(fs); } });
        const readLinks = () => { links = $$('input', linksEl).map(i => i.value); };
        const drawLinks = () => {
          linksEl.innerHTML = links.map((u, i) => '<div class="linkrow"><input class="input" value="' + esc(u) + '" placeholder="https://" inputmode="url" autocapitalize="off" autocomplete="off">' + (links.length > 1 ? '<button type="button" class="icon-btn solid" data-rl="' + i + '" aria-label="Take this link off">' + A.icon('x', 18) + '</button>' : '') + '</div>').join('');
          $$('[data-rl]', linksEl).forEach(x => x.onclick = () => { readLinks(); links.splice(+x.dataset.rl, 1); drawLinks(); });
        };
        $('#addLink', el).onclick = () => { readLinks(); links.push(''); drawLinks(); const ins = $$('input', linksEl); ins[ins.length - 1].focus(); };
        $('#fIcons', el).onclick = e => { const x = e.target.closest('[data-ic]'); if (!x) return; icon = x.dataset.ic; $$('#fIcons button', el).forEach(q => q.classList.toggle('on', q === x)); };
        drawPhotos(); drawLinks();
        const val = s => $(s, el).value.trim();
        $('#fSave', el).onclick = () => {
          const name = val('#fName'); if (!name) { $('#fName', el).focus(); A.ui.toast('Give it a name first.'); return; }
          readLinks();
          const rec = Object.assign(blank(), { id: editing ? id : A.uid(), name, price: val('#fPrice'), photos, links: links.map(fixUrl).filter(Boolean), why: val('#fWhy').split('\n').map(s => s.replace(/^[-*•\s]+/, '').trim()).filter(Boolean), note: val('#fNote'), icon, top: $('#fTop', el).checked, santa: $('#fSanta', el).checked });
          const bn = val('#bName'); rec.backup = bn ? { name: bn, price: val('#bPrice'), link: fixUrl(val('#bLink')), note: val('#bNote'), photo: b.photo || null } : null;
          const arr = A.data.items(who);
          if (rec.top) arr.forEach(x => { if (x.id !== rec.id) x.top = false; });
          if (rec.santa) arr.forEach(x => { if (x.id !== rec.id) x.santa = false; });
          const i = arr.findIndex(x => x.id === rec.id); if (i >= 0) arr[i] = rec; else arr.push(rec);
          A.data.save(); close(); A.refresh(); A.ui.toast(editing ? 'Saved.' : 'Added to your list.');
        };
        const del = $('#fDel', el);
        if (del) del.onclick = () => A.ui.confirm('Take "' + it.name + '" off your list?', 'Take it off', true).then(ok => {
          if (!ok) return;
          lists[who].items = A.data.items(who).filter(x => x.id !== id);
          Object.keys(plans).forEach(g => { if (plans[g]) plans[g][id] = undefined; });
          A.data.save(); close(); A.refresh(); A.ui.toast('Taken off your list.');
        });
        if (!editing && A.canHover) setTimeout(() => { const f = $('#fName', el); if (f) f.focus(); }, 120);
      }
    });
  }
})();

/* another phone changed the lists (or someone joined): load them again */
(function () {
  var A = window.App, mine = ['lists', 'plans', 'share', 'history', 'season', 'people'];
  A.on('sync', function (keys) { if (A.data && keys.some(function (k) { return mine.indexOf(k) >= 0; })) A.data.init(); });
  A.on('people', function () { if (A.data) A.data.init(); });
})();
