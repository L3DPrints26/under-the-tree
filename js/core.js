/* Under the Tree — core: storage, people, UI helpers, router.
   Every other file talks to the app through window.App. */
window.App = (function () {
  'use strict';
  const App = { pages: {}, version: 4 };
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  App.$ = $; App.$$ = $$;

  /* ---------- small helpers ---------- */
  App.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  App.rand = (a, b) => a + Math.random() * (b - a);
  App.pick = a => a[(Math.random() * a.length) | 0];
  App.uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
  App.poss = n => n + "'s";
  App.qs = new URLSearchParams(location.search);
  App.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  App.canHover = matchMedia('(hover:hover)').matches;
  App.css = text => { const s = document.createElement('style'); s.textContent = text; document.head.appendChild(s); };
  App.shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };

  /* ---------- time (supports ?date=YYYY-MM-DD for testing) ---------- */
  const T0 = Date.now(), DBG = App.qs.get('date');
  App.now = () => {
    if (DBG) { const d = new Date(DBG + 'T09:00:00'); if (!isNaN(d)) return new Date(d.getTime() + (Date.now() - T0)); }
    return new Date();
  };
  App.xmas = () => { const n = App.now(), y = n.getFullYear(); return n >= new Date(y, 11, 26) ? new Date(y + 1, 11, 25) : new Date(y, 11, 25); };

  /* ---------- events ---------- */
  const subs = {};
  App.on = (ev, fn) => { (subs[ev] = subs[ev] || []).push(fn); };
  App.emit = (ev, data) => { (subs[ev] || []).forEach(fn => { try { fn(data); } catch (e) { console.error(e); } }); };

  /* ---------- storage (localStorage, JSON, one prefix) ----------
     A "space" is where the data lives: a group that is shared online (its id is also its invite code),
     or '' for the old one-device mode. Everything except a few device settings is stored per space,
     so two groups on one phone never mix. Nothing here is ever renamed or cleared by an update. */
  const PRE = 'utt:';
  const raw = {
    get(k, f) { try { const v = localStorage.getItem(PRE + k); return v == null ? f : JSON.parse(v); } catch (e) { return f; } },
    set(k, v) { try { localStorage.setItem(PRE + k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem(PRE + k); } catch (e) {} }
  };
  const DEVICE = { music: 1, groups: 1, group: 1, seeded: 1 };
  let SPACE = raw.get('group', '') || '';
  if (SPACE && !(raw.get('groups', []) || []).some(g => g && g.id === SPACE)) SPACE = '';
  const nk = k => (DEVICE[k] || !SPACE ? k : 'g:' + SPACE + ':' + k);
  App.space = () => SPACE;
  App.store = {
    raw,
    key: nk,
    get(k, f) { return raw.get(nk(k), f); },
    /* every save announces itself (with what was there before) so the online copy can follow along */
    set(k, v) { const key = nk(k); let old = null; try { old = localStorage.getItem(PRE + key); } catch (e) {} const ok = raw.set(key, v); if (ok) App.emit('store', { k, old }); return ok; },
    del(k) { raw.del(nk(k)); }
  };

  /* ---------- people ----------
     The people in a group are saved with the group, never written into the code. Each gets a color. */
  const PALETTE = [
    ['#5fe3a1', '#0f8a55', '#053d25'], ['#ff7a8a', '#c41e3a', '#5e0a18'], ['#ffb3d1', '#d6478a', '#6b1740'], ['#7cc4ff', '#1d6fd6', '#0a2c66'],
    ['#c9a6ff', '#7a3fd0', '#34126b'], ['#ffe08a', '#d49a1c', '#6b4a06'], ['#7fe6e0', '#0f8f8a', '#064240'], ['#ffb38a', '#d9642a', '#6b2a0c'],
    ['#c8d3e6', '#6b7c99', '#2a3550'], ['#d7f08a', '#7fa21a', '#3a4d08'], ['#ff9ad8', '#b0309a', '#541048'], ['#a8b6ff', '#4654c9', '#1c2266']
  ];
  App.maxPeople = PALETTE.length;
  App.people = []; App.names = [];
  App.person = n => App.people.find(p => p.name === n) || { name: n, c: PALETTE[8] };
  App.loadPeople = () => {
    let obj = App.store.get('people', null);
    if (!obj && !SPACE) {          /* one-device mode from before groups existed: the people are whoever has a list */
      const l = App.store.get('lists', null);
      if (l && Object.keys(l).length) { obj = {}; Object.keys(l).forEach((n, i) => { obj[n] = { c: i % PALETTE.length, at: i + 1 }; }); App.store.set('people', obj); }
    }
    obj = obj || {};
    const arr = Object.keys(obj).filter(n => obj[n]).map(n => ({ name: n, c: PALETTE[(obj[n].c | 0) % PALETTE.length], at: +obj[n].at || 0 }))
      .sort((a, b) => a.at - b.at || (a.name < b.name ? -1 : 1));
    App.people.length = 0; App.names.length = 0;
    arr.forEach(p => { App.people.push(p); App.names.push(p.name); });
  };
  App.cleanName = s => String(s || '').replace(/[^\p{L}\p{N} \-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 14).trim();
  App.addPerson = name => {
    name = App.cleanName(name); if (!name || name in {}) return '';
    const obj = App.store.get('people', {}) || {}, hit = Object.keys(obj).find(n => obj[n] && n.toLowerCase() === name.toLowerCase());
    if (hit) return hit;
    if (App.names.length >= PALETTE.length) return '';
    const used = Object.keys(obj).map(n => obj[n] && obj[n].c); let c = 0; while (used.indexOf(c) >= 0 && c < PALETTE.length - 1) c++;
    obj[name] = { c, at: Date.now() }; App.store.set('people', obj); App.loadPeople(); App.emit('people'); return name;
  };
  App.removePerson = name => { const obj = App.store.get('people', {}) || {}; if (!obj[name]) return; delete obj[name]; App.store.set('people', obj); App.loadPeople(); if (ME === name) ME = null; App.emit('people'); };
  App.loadPeople();

  /* ---------- who is using this (remembered per space, on this device only) ---------- */
  let ME = App.store.get('me', null);
  /* ?me=Name is a test hook and only works on this computer, never on the real site */
  const DEV = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  if (DEV && App.names.indexOf(App.qs.get('me')) >= 0) ME = App.qs.get('me');
  if (App.names.indexOf(ME) < 0) ME = null;
  App.me = () => ME;
  App.setMe = n => { ME = n; App.store.set('me', n); App.emit('me', n); };
  App.clearMe = () => { ME = null; App.store.del('me'); App.emit('me', null); if (App.renderShell) App.renderShell(); };

  /* ---------- photos (IndexedDB, with an in-memory cache) ---------- */
  const cache = new Map(); let db = null;
  App.photos = {
    ready: new Promise(res => {
      let done = false; const finish = () => { if (!done) { done = true; res(); } };
      try {
        const rq = indexedDB.open('under-the-tree', 1);
        rq.onupgradeneeded = () => rq.result.createObjectStore('photos');
        rq.onerror = finish;
        rq.onsuccess = () => {
          db = rq.result;
          try {
            const cur = db.transaction('photos').objectStore('photos').openCursor();
            cur.onsuccess = e => { const c = e.target.result; if (c) { cache.set(c.key, c.value); c.continue(); } else finish(); };
            cur.onerror = finish;
          } catch (e) { finish(); }
        };
      } catch (e) { finish(); }
      setTimeout(finish, 2500);
    }),
    seed(id, dataURL) { cache.set(id, dataURL); },
    get(id) { return cache.get(id); },
    /* a photo entry is {id} (stored on this device, and online when in a group) or {url} (a web address).
       A photo this device has not downloaded yet is asked for once; the screen redraws when it arrives. */
    src(p) {
      if (!p) return '';
      const v = p.url || cache.get(p.id);
      if (!v && p.id) App.emit('photo:miss', p.id);
      return v || '';
    },
    put(dataURL) {
      const id = 'p' + App.uid(); cache.set(id, dataURL);
      if (db) try { db.transaction('photos', 'readwrite').objectStore('photos').put(dataURL, id); } catch (e) {}
      App.emit('photo:new', id);
      return id;
    },
    /* a photo that just came down from the group */
    have(id, dataURL) {
      cache.set(id, dataURL);
      if (db) try { db.transaction('photos', 'readwrite').objectStore('photos').put(dataURL, id); } catch (e) {}
      App.emit('photo', id);
    },
    remove(id) { cache.delete(id); if (db) try { db.transaction('photos', 'readwrite').objectStore('photos').delete(id); } catch (e) {} },
    /* shrink a picked file so it stores small and loads fast */
    fromFile(file) {
      return new Promise((res, rej) => {
        if (!file || !/^image\//.test(file.type)) return rej(new Error('not an image'));
        const url = URL.createObjectURL(file), img = new Image();
        img.onload = () => {
          const max = 1100, k = Math.min(1, max / Math.max(img.width, img.height));
          const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
          const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
          URL.revokeObjectURL(url);
          res(App.photos.put(c.toDataURL('image/jpeg', 0.82)));
        };
        img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('could not read that picture')); };
        img.src = url;
      });
    }
  };

  /* ---------- profile pictures ----------
     One small square photo per person. A single style rule paints it onto every avatar with that
     name, so nothing has to be redrawn when a picture changes. */
  let PICS = App.store.get('pics', {}) || {};
  const picCss = document.createElement('style'); document.head.appendChild(picCss);
  const paintPics = () => {
    picCss.textContent = App.names.map(n => {
      const src = PICS[n] && App.photos.src({ id: PICS[n] }); if (!src) return '';
      const sel = '.avatar[data-n="' + n + '"]';
      return sel + '{background:#0b1730 url("' + src + '") center/cover;box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.55)}' + sel + ' b{display:none}';
    }).join('');
  };
  App.pics = {
    has: n => !!(PICS[n] && App.photos.get(PICS[n])),
    set(n, file) {
      return new Promise((res, rej) => {
        if (!file || !/^image\//.test(file.type)) return rej(new Error('not an image'));
        const url = URL.createObjectURL(file), img = new Image();
        img.onload = () => {
          const s = Math.min(img.width, img.height), c = document.createElement('canvas'); c.width = c.height = 320;
          /* square crop from the middle; tall photos crop a little higher, where faces usually are */
          c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) * .38, s, s, 0, 0, 320, 320);
          URL.revokeObjectURL(url);
          const old = PICS[n];
          PICS[n] = App.photos.put(c.toDataURL('image/jpeg', 0.86)); App.store.set('pics', PICS);
          if (old) App.photos.remove(old);
          paintPics(); res();
        };
        img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('could not read that picture')); };
        img.src = url;
      });
    },
    clear(n) { const old = PICS[n]; delete PICS[n]; App.store.set('pics', PICS); if (old) App.photos.remove(old); paintPics(); }
  };
  App.photos.ready.then(paintPics);
  App.on('photo', paintPics);

  /* ---------- who is online ----------
     The group keeps a short note for every open app (see cloud.js). Anyone on that list gets a green
     dot on their picture and their ornament, painted with one style rule so nothing is redrawn. */
  const onCss = document.createElement('style'); document.head.appendChild(onCss);
  App.online = () => {
    const st = App.cloud ? App.cloud.status() : 'off'; if (st === 'off' || st === 'offline') return [];
    const o = App.store.get('online', {}) || {}, on = {}; Object.keys(o).forEach(k => { if (o[k] && o[k].n) on[o[k].n] = 1; });
    return App.names.filter(n => on[n]);
  };
  const paintOnline = () => {
    onCss.textContent = App.online().map(n => '.avatar[data-n="' + n + '"]::after{content:"";position:absolute;right:-4%;bottom:-4%;width:30%;height:30%;min-width:8px;min-height:8px;border-radius:50%;background:#3ddc84;box-shadow:0 0 0 2px #0b1730}' +
      '.orn[data-name="' + n + '"] .olabel::before{content:"";display:inline-block;width:7px;height:7px;border-radius:50%;background:#3ddc84;margin-right:5px;vertical-align:1px}').join('');
  };
  App.on('sync', keys => { if (keys.indexOf('online') >= 0 || keys.indexOf('people') >= 0) paintOnline(); });
  App.on('cloud', paintOnline);
  App.on('people', paintPics);
  App.on('sync', keys => { if (keys.indexOf('pics') >= 0 || keys.indexOf('people') >= 0) { PICS = App.store.get('pics', {}) || {}; paintPics(); } });
  App.css(`
    .me-pic{display:flex;align-items:center;gap:14px;padding:12px;border-radius:16px;background:var(--surface2);border:1px solid var(--line)}
    .me-pic.drop{border-color:var(--gold)}
    .me-name{font-family:var(--display);font-size:20px;font-weight:600;line-height:1.2}
    .me-acts{margin-top:8px;flex-wrap:wrap;gap:8px}
    .who-sub{margin-top:14px;font-size:13.5px}
    .who-sub+.who-grid{margin-top:8px}
    .avatar{position:relative}
    .who-btn.on{border-color:var(--gold)}
    .who-btn>span:last-child{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .who-plus{width:64px;height:64px;border-radius:50%;display:grid;place-items:center;border:1.5px dashed var(--line2);color:var(--muted)}
    .who-row{margin-top:12px}
    .who-switch{margin-top:8px}
    .who-row .btn{padding:0 10px}
    .bg-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
    .bg-opt{position:relative;aspect-ratio:16/10;border-radius:12px;background:#0a1429 center/cover;border:2px solid transparent;overflow:hidden}
    .bg-opt.on{border-color:var(--gold)}
    .bg-opt span{position:absolute;left:0;right:0;bottom:0;padding:14px 6px 5px;font-size:11.5px;font-weight:600;color:#fff;text-align:center;background:linear-gradient(transparent,rgba(4,9,22,.85));white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    @media (orientation:landscape) and (max-height:480px){.bg-grid{grid-template-columns:repeat(6,1fr)}}
    .who-grid.many{grid-template-columns:repeat(4,1fr);gap:8px}
    .who-grid.many .who-btn{padding:10px 4px;font-size:13.5px}
    .who-grid.many .avatar{--size:46px!important}
    .who-grid.many .who-plus{width:46px;height:46px}
    @media (orientation:landscape) and (max-height:480px){.me-pic{padding:8px 12px}.me-pic .avatar{--size:48px!important}.me-acts{margin-top:4px}.who-sub{margin-top:8px}}
  `);

  /* ---------- UI helpers ---------- */
  const ui = App.ui = {};
  ui.toast = msg => {
    const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; $('#toasts').appendChild(t);
    setTimeout(() => t.classList.add('out'), 2600); setTimeout(() => t.remove(), 3100);
  };
  /* ornament-style avatar. size in px. */
  ui.avatar = (name, size, extra) => {
    const p = App.person(name);
    return '<span class="avatar ' + (extra || '') + '" data-n="' + App.esc(name) + '" style="--c1:' + p.c[0] + ';--c2:' + p.c[1] + ';--c3:' + p.c[2] + ';--size:' + (size || 36) + 'px"><b>' + App.esc(name[0]) + '</b></span>';
  };
  /* sheet: slides up on phones, centered dialog on big screens.
     opts: {title, html, wide, locked, onMount(el, close), onClose()} → {el, close} */
  const stack = [];
  ui.sheet = opts => {
    const back = document.createElement('div'); back.className = 'sheet-back';
    back.innerHTML = '<div class="sheet' + (opts.wide ? ' wide' : '') + (opts.cls ? ' ' + opts.cls : '') + '" role="dialog" aria-modal="true">' +
      '<header class="sheet-head"><h2>' + App.esc(opts.title || '') + '</h2>' +
      (opts.locked ? '' : '<button class="icon-btn" data-close aria-label="Close">' + App.icon('x') + '</button>') + '</header>' +
      '<div class="sheet-body">' + (opts.html || '') + '</div></div>';
    $('#sheets').appendChild(back);
    let closed = false;
    const close = () => { if (closed) return; closed = true; back.classList.add('out'); const i = stack.indexOf(api); if (i >= 0) stack.splice(i, 1); setTimeout(() => back.remove(), 220); if (opts.onClose) opts.onClose(); };
    const api = { el: back.firstChild, close, locked: !!opts.locked };
    back.addEventListener('click', e => { if ((e.target === back && !opts.locked) || e.target.closest('[data-close]')) close(); });
    stack.push(api);
    requestAnimationFrame(() => back.classList.add('in'));
    setTimeout(() => back.classList.add('in'), 30);
    if (opts.onMount) opts.onMount(api.el, close);
    return api;
  };
  ui.closeTop = () => { const s = stack[stack.length - 1]; if (s && !s.locked) s.close(); };
  ui.sheetOpen = () => stack.length > 0;
  ui.confirm = (msg, yes, danger) => new Promise(res => {
    let answered = false;
    ui.sheet({
      title: msg, cls: 'confirm',
      html: '<div class="row end gap"><button class="btn ghost" data-close>Cancel</button><button class="btn ' + (danger ? 'danger' : 'primary') + '" data-yes>' + App.esc(yes || 'Yes') + '</button></div>',
      onMount(el, close) { $('[data-yes]', el).onclick = () => { answered = true; close(); res(true); }; },
      onClose() { if (!answered) res(false); }
    });
  });

  /* ---------- school mode ----------
     For when someone might see your screen. This device shows Dad and Mom instead of Daddy and Mommy.
     Only the words on this screen change: nothing is renamed, and nobody else sees a difference. */
  let school = !!raw.get('school', false), schoolObs = null;
  const swapWords = node => {
    const v = node.nodeValue; if (!v || !/addy|ommy/i.test(v)) return;
    const p = node.parentNode; if (p && /^(SCRIPT|STYLE|TEXTAREA)$/.test(p.nodeName)) return;
    const n = v.replace(/\bDaddy\b/g, 'Dad').replace(/\bdaddy\b/g, 'dad').replace(/\bDADDY\b/g, 'DAD').replace(/\bMommy\b/g, 'Mom').replace(/\bmommy\b/g, 'mom').replace(/\bMOMMY\b/g, 'MOM');
    if (n !== v) node.nodeValue = n;
  };
  const sweepWords = root => { const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) swapWords(n); };
  function schoolStart() {
    if (schoolObs || !document.body) return;
    sweepWords(document.body);
    schoolObs = new MutationObserver(list => { for (const m of list) { if (m.type === 'characterData') swapWords(m.target); else m.addedNodes.forEach(x => { if (x.nodeType === 3) swapWords(x); else if (x.nodeType === 1) sweepWords(x); }); } });
    schoolObs.observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  App.school = { on: () => school, set(v) { school = !!v; raw.set('school', school); if (school) schoolStart(); else location.reload(); } };
  if (school) schoolStart();

  /* ---------- settings (kept on this device) ---------- */
  ui.settings = () => {
    const bgs = App.scene && App.scene.backgrounds ? App.scene.backgrounds() : [], cur = bgs.length ? App.scene.background() : '';
    ui.sheet({
      title: 'Settings', cls: 'set',
      html: '<label class="switch"><span class="s-text"><b>School mode</b><small>Shows Dad and Mom instead of Daddy and Mommy. Only on this device.</small></span><input type="checkbox" id="setSchool"' + (school ? ' checked' : '') + '></label>' +
        (App.lock && App.lock.on() && ME ? '<div class="row gap" style="margin:4px 0 6px"><button class="btn sm grow" id="setPin">' + App.icon('lock', 16) + 'Change my PIN</button><button class="btn sm grow" id="setFace" hidden></button></div>' : '') +
        (bgs.length ? '<span class="label" style="margin-top:10px">Background</span><div class="bg-grid">' + bgs.map(b => '<button class="bg-opt' + (b.id === cur ? ' on' : '') + '" data-bg="' + b.id + '" style="background-image:url(' + b.thumb + ')"><span>' + App.esc(b.name) + '</span></button>').join('') + '</div>' : ''),
      onMount(el) {
        $('#setSchool', el).onchange = e => App.school.set(e.target.checked);
        const pb = $('#setPin', el), fb = $('#setFace', el);
        if (pb) pb.onclick = () => App.lock.changePin();
        if (fb) { const lab = () => { fb.innerHTML = App.icon('eye', 16) + (App.lock.faceOn(ME) ? 'Face ID is on' : 'Use Face ID here'); }; App.lock.faceReady().then(ok => { if (!ok) return; fb.hidden = false; lab(); fb.onclick = () => App.lock.faceToggle().then(on => { lab(); ui.toast(on ? 'Done. This phone can sign you in.' : 'Face ID is off on this phone.'); }, () => ui.toast('That did not turn on.')); }); }
        $$('.bg-opt', el).forEach(b => b.onclick = () => { App.scene.setBackground(b.dataset.bg); $$('.bg-opt', el).forEach(x => x.classList.toggle('on', x === b)); });
      }
    });
  };

  /* ---------- who's here ---------- */
  let whoApi = null, whoFirst = false, whoLoading = false;
  const reWho = () => { if (!whoApi) return; const f = whoFirst; whoApi.close(); ui.who(f); };
  App.on('cloud', () => { if (whoApi && whoLoading && App.cloud.synced()) reWho(); });
  /* first: true = this phone has no name yet (cannot be closed), 'switch' = change person, false = your profile */
  ui.who = first => {
    const picker = !!first, mine = !picker && ME, locks = !!(App.lock && App.lock.on());
    whoFirst = first;
    /* a phone that just joined has nothing saved yet: wait for the group instead of showing an empty list */
    whoLoading = !App.names.length && !!App.space() && !!App.cloud && !App.cloud.synced();
    if (whoLoading) { whoApi = ui.sheet({ title: 'Getting the group…', locked: true, cls: 'who', html: '<p class="muted">One moment. If this takes long, check the Wi-Fi.</p>', onClose() { whoApi = null; } }); return; }
    const picRow = () => ui.avatar(ME, 68) + '<div class="col grow"><b class="me-name">' + App.esc(ME) + '</b><div class="row me-acts">' +
      '<button class="btn sm primary" id="picPick">' + App.icon('camera', 16) + (App.pics.has(ME) ? 'Change picture' : 'Add a picture') + '</button>' +
      (App.pics.has(ME) ? '<button class="btn sm ghost" id="picClear">Remove</button>' : '') + '</div></div>';
    whoApi = ui.sheet({
      title: picker ? (first === 'switch' ? 'Switch person' : "Who's using this?") : 'Your profile', locked: picker && first !== 'switch', cls: 'who', onClose() { whoApi = null; },
      html: mine
        ? '<div class="me-pic" id="picRow">' + picRow() + '</div><input type="file" accept="image/*" id="picFile" hidden>' +
          '<div class="row gap who-row">' + (App.cloud ? '<button class="btn grow" id="whoGroups">' + App.icon('users', 18) + (App.space() ? 'Group' : 'Go online') + '</button>' : '') +
          '<button class="btn grow" id="whoSet">' + App.icon('sliders', 18) + 'Settings</button></div>' +
          '<button class="btn ghost block who-switch" id="whoSwitch">Switch person</button>'
        : '<p class="muted">' + (!App.names.length ? 'Nobody is in this group yet. Add your name to start.' : locks ? 'Pick your name. A name with a lock already belongs to someone and needs their PIN.' : 'Pick your name. You can change your own list and see everyone else\'s.') + '</p>' +
          '<div class="who-grid' + (App.names.length > 5 ? ' many' : '') + '">' +
          App.names.map(n => '<button class="who-btn' + (n === ME ? ' on' : '') + '" data-n="' + App.esc(n) + '">' + (locks && App.lock.has(n) ? '<i class="who-lock">' + App.icon('lock', 14) + '</i>' : '') + ui.avatar(n, 64) + '<span>' + App.esc(n) + '</span></button>').join('') +
          (App.cloud && App.names.length < App.maxPeople ? '<button class="who-btn who-add" id="whoAdd"><span class="who-plus">' + App.icon('plus', 26) + '</span><span>' + (App.names.length ? 'Add a name' : 'Add my name') + '</span></button>' : '') + '</div>',
      onMount(el, close) {
        const pickMe = n => { const was = ME; App.setMe(n); close(); App.renderShell(); App.route(); if (was !== ME) ui.toast('Hi, ' + ME + '.'); };
        /* a name is only yours after its PIN (or after you make one for it) */
        const tryName = n => (App.lock ? App.lock.choose(n) : Promise.resolve(true)).then(ok => { if (ok) pickMe(n); });
        $$('.who-btn[data-n]', el).forEach(b => b.onclick = () => { if (b.dataset.n === ME) { close(); return; } tryName(b.dataset.n); });
        const add = $('#whoAdd', el); if (add) add.onclick = () => App.cloud.addPersonSheet(n => { if (App.data) App.data.init(); tryName(n); });
        const grp = $('#whoGroups', el); if (grp) grp.onclick = () => { close(); App.cloud.groupSheet(); };
        const set = $('#whoSet', el); if (set) set.onclick = () => { close(); ui.settings(); };
        const sw = $('#whoSwitch', el); if (sw) sw.onclick = () => { close(); ui.who('switch'); };
        if (!mine) return;
        const row = $('#picRow', el), file = $('#picFile', el);
        const draw = () => { row.innerHTML = picRow(); $('#picPick', row).onclick = () => file.click(); const c = $('#picClear', row); if (c) c.onclick = () => { App.pics.clear(ME); draw(); }; };
        const use = f => App.pics.set(ME, f).then(draw, () => ui.toast('That file is not a picture.'));
        file.onchange = () => { if (file.files[0]) use(file.files[0]); file.value = ''; };
        row.addEventListener('dragover', e => { e.preventDefault(); row.classList.add('drop'); });
        row.addEventListener('dragleave', () => row.classList.remove('drop'));
        row.addEventListener('drop', e => { e.preventDefault(); row.classList.remove('drop'); const f = e.dataTransfer && e.dataTransfer.files[0]; if (f) use(f); });
        draw();
      }
    });
  };

  /* ---------- shell + router ---------- */
  const TABS = [
    { id: 'home', label: 'Lists', icon: 'ornament', hash: '#/' },
    { id: 'santa', label: 'Secret Santa', short: 'Santa', icon: 'hat', hash: '#/santa' },
    { id: 'advent', label: 'Advent', icon: 'calendar', hash: '#/advent' },
    { id: 'games', label: 'Games', icon: 'game', hash: '#/games' }
  ];
  App.renderShell = () => {
    $('#tabs').innerHTML = TABS.map(t => '<a class="tab" data-tab="' + t.id + '" href="' + t.hash + '">' + App.icon(t.icon) + '<span>' + (t.short || t.label) + '</span></a>').join('');
    $('#meBtn').innerHTML = ME ? ui.avatar(ME, 30) + '<span>' + ME + '</span>' : '';
  };
  let current = null, curName = '';
  App.parse = () => { const p = decodeURIComponent(location.hash.replace(/^#\/?/, '')).split('/').filter(Boolean); return { name: p[0] || 'home', args: p.slice(1) }; };
  App.route = () => {
    if (!ME) return;
    const r = App.parse(), known = TABS.some(t => t.id === r.name), root = $('#page');
    if (known && !App.pages[r.name]) App.pages[r.name] = { soon: true, render(el) { el.innerHTML = '<div class="empty">' + App.icon('clock', 48) + '<p>This part is still being built. Check back in a few minutes.</p></div>'; } };
    const name = App.pages[r.name] ? r.name : 'home', page = App.pages[name];
    if (current && current.leave) { try { current.leave(); } catch (e) { console.error(e); } }
    current = page; curName = name;
    document.body.dataset.page = name;
    root.className = 'page page-' + name; root.innerHTML = '';
    $$('#tabs .tab').forEach(t => t.classList.toggle('on', t.dataset.tab === (page.tab || name)));
    try { page.render(root, r.args); } catch (e) { console.error(e); root.innerHTML = '<div class="empty"><p>Something went wrong on this screen.</p></div>'; }
    root.classList.add('enter');
  };
  App.go = hash => { if (location.hash === hash) App.route(); else location.hash = hash; };
  App.refresh = () => { if (current && ME) { const r = App.parse(), root = $('#page'); if (current.leave) current.leave(); root.innerHTML = ''; current.render(root, r.args); } };
  App.currentPage = () => curName;

  /* ---------- following the group ----------
     When something changes on another phone, redraw the screen, but never under someone's fingers:
     not while a sheet is open and not in the middle of a game. It waits and redraws afterwards. */
  let softT = 0;
  const busy = () => ui.sheetOpen() || !!document.querySelector('#santaShield.on') || (curName === 'games' && App.parse().args.length > 0) || !!(current && current.busy && current.busy());
  App.softRefresh = () => { clearTimeout(softT); softT = setTimeout(function tick() { if (!ME || !current) return; if (busy()) { softT = setTimeout(tick, 900); return; } App.refresh(); }, 260); };
  App.on('sync', keys => {
    if (keys.every(k => k === 'online')) return;          /* someone opened or closed the app: only the dots change */
    if (keys.indexOf('people') >= 0) {
      App.loadPeople(); if (ME && App.names.indexOf(ME) < 0) ME = null;
      /* test hook: ?me=Name also works on a phone that has only just joined */
      if (DEV && !ME && App.names.indexOf(App.qs.get('me')) >= 0) { App.setMe(App.qs.get('me')); if (whoApi) whoApi.close(); App.renderShell(); App.route(); App.softRefresh(); return; }
      App.renderShell(); if (whoApi) reWho();
    }
    if (!ME) { if (!ui.sheetOpen()) ui.who(true); return; }
    App.softRefresh();
  });
  App.on('photo', () => App.softRefresh());
  App.on('people', () => { App.renderShell(); });

  addEventListener('hashchange', () => { while (ui.sheetOpen() && stack[stack.length - 1] && !stack[stack.length - 1].locked) stack[stack.length - 1].close(); App.route(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') ui.closeTop(); });
  let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { App.emit('resize'); if (current && current.onResize) current.onResize(); else if (!ui.sheetOpen()) App.refresh(); }, 200); });

  /* no accidental text selection, long-press menus or image drags */
  document.addEventListener('dragstart', e => { if (!e.target.closest('[draggable="true"]')) e.preventDefault(); });
  document.addEventListener('contextmenu', e => { if (!e.target.closest('input,textarea,a')) e.preventDefault(); });

  return App;
})();
