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
  App.palette = PALETTE;
  App.setColor = (name, c) => { const obj = App.store.get('people', {}) || {}; if (!obj[name]) return; obj[name] = Object.assign({}, obj[name], { c }); App.store.set('people', obj); App.loadPeople(); App.emit('people'); };
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
  const DEV = /^https?:$/.test(location.protocol) && /^(localhost|127\.0\.0\.1)$/.test(location.hostname);     /* never inside the iPhone app, which also calls itself localhost */
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

  /* ---------- ornament looks ----------
     Every ornament is one small drawing: a shaded glass ball in the person's color, a pattern that curves
     around it the way it would on a real one, and a darker ribbon band across the middle where the name
     sits, so the name always reads. A picture made in the ornament designer goes under the same band
     and shine. One style rule per person paints it everywhere that ornament hangs. */
  const ORN_NAMES = ['Glass', 'Pinstripe', 'Frosted', 'Snowflakes', 'Gold stars', 'Nordic', 'Glitter dip', 'Sparkle'];
  const hexTone = (hex, k) => { const n = parseInt(hex.slice(1), 16), t = k < 0 ? 0 : 255, m = Math.abs(k), ch = v => Math.round(v + (t - v) * m); return 'rgb(' + ch(n >> 16 & 255) + ',' + ch(n >> 8 & 255) + ',' + ch(n & 255) + ')'; };
  /* a line that sags the way a ring around a ball does when you look at it from slightly above */
  const curve = (base, sag, amp, step) => { let d = '', i = 0; for (let x = -4; x <= 204; x += (step || 8), i++) d += (i ? 'L' : 'M') + x + ' ' + (base + sag * (1 - Math.pow((x - 100) / 100, 2)) + (amp ? (i % 2 ? -amp : amp) : 0)).toFixed(1); return d; };
  const star = (x, y, s) => 'M' + x + ' ' + (y - s) + 'L' + (x + s * .24) + ' ' + (y - s * .24) + 'L' + (x + s) + ' ' + y + 'L' + (x + s * .24) + ' ' + (y + s * .24) + 'L' + x + ' ' + (y + s) + 'L' + (x - s * .24) + ' ' + (y + s * .24) + 'L' + (x - s) + ' ' + y + 'L' + (x - s * .24) + ' ' + (y - s * .24) + 'Z';
  const flake = (x, y, s) => { let d = ''; for (let k = 0; k < 6; k++) { const an = k * Math.PI / 3, cx = Math.cos(an), sy = Math.sin(an), px = x + cx * s, py = y + sy * s, bx = x + cx * s * .58, by = y + sy * s * .58, b1 = an + .9, b2 = an - .9; d += 'M' + x + ' ' + y + 'L' + px.toFixed(1) + ' ' + py.toFixed(1) + 'M' + bx.toFixed(1) + ' ' + by.toFixed(1) + 'L' + (bx + Math.cos(b1) * s * .3).toFixed(1) + ' ' + (by + Math.sin(b1) * s * .3).toFixed(1) + 'M' + bx.toFixed(1) + ' ' + by.toFixed(1) + 'L' + (bx + Math.cos(b2) * s * .3).toFixed(1) + ' ' + (by + Math.sin(b2) * s * .3).toFixed(1); } return d; };
  const dotRow = (y, longs, r) => { const cy = Math.sqrt(Math.max(0, 1 - Math.pow((100 - y) / 94, 2))); return longs.map(l => { const rad = l * Math.PI / 180; return '<ellipse cx="' + (100 + 94 * cy * Math.sin(rad)).toFixed(1) + '" cy="' + y + '" rx="' + (r * Math.cos(rad)).toFixed(2) + '" ry="' + r + '"/>'; }).join(''); };
  const GOLD = '#f6dc8c', FROST = 'M0 0H200V50Q186 64 172 52Q158 40 144 54Q130 68 116 54Q102 40 88 54Q74 68 60 54Q46 40 32 52Q16 64 0 52Z', DIP = 'M0 142Q26 130 52 142Q78 154 104 142Q130 130 156 142Q180 152 200 142V200H0Z';
  const ORN_PAT = [
    () => '',
    () => '<g fill="none" stroke="' + GOLD + '" stroke-opacity=".9"><path d="' + curve(18, 12) + '" stroke-width="1.2"/><path d="' + curve(26, 14) + '" stroke-width="2.4"/><path d="' + curve(34, 15) + '" stroke-width="1.2"/><path d="' + curve(142, 19) + '" stroke-width="1.2"/><path d="' + curve(151, 20) + '" stroke-width="2.4"/><path d="' + curve(160, 20) + '" stroke-width="1.2"/></g>',
    () => '<clipPath id="k"><path d="' + FROST + '"/></clipPath><path d="' + FROST + '" fill="#f4f9ff"/><rect width="200" height="80" filter="url(#gl)" clip-path="url(#k)" opacity=".9"/><path d="M0 52Q16 64 32 52Q46 40 60 54Q74 68 88 54Q102 40 116 54Q130 68 144 54Q158 40 172 52Q186 64 200 50" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="2" filter="url(#s)"/><g fill="#fff" fill-opacity=".85">' + dotRow(150, [-52, -8, 40], 2.2) + dotRow(166, [-30, 14, 50], 1.8) + dotRow(180, [-10, 24], 1.5) + '</g>',
    () => '<g fill="none" stroke="#fff" stroke-opacity=".93" stroke-width="1.9" stroke-linecap="round"><path d="' + flake(50, 46, 15) + '"/><path d="' + flake(108, 30, 11) + '"/><path d="' + flake(156, 54, 13) + '"/><path d="' + flake(46, 158, 12) + '"/><path d="' + flake(104, 172, 15) + '"/><path d="' + flake(158, 150, 11) + '"/></g>',
    () => '<g fill="' + GOLD + '"><path d="' + star(52, 42, 13) + '"/><path d="' + star(112, 28, 8) + '"/><path d="' + star(156, 52, 10) + '"/><path d="' + star(44, 156, 9) + '"/><path d="' + star(102, 172, 13) + '"/><path d="' + star(158, 150, 8) + '"/></g><g fill="#fff" fill-opacity=".85">' + dotRow(60, [-44, 6, 52], 1.5) + dotRow(146, [-20, 30], 1.5) + '</g>',
    () => '<g fill="none" stroke="#fff" stroke-opacity=".92" stroke-width="2.2" stroke-linejoin="round"><path d="' + curve(22, 13, 4.5, 11) + '"/><path d="' + curve(150, 20, 4.5, 11) + '"/></g><g fill="#fff" fill-opacity=".92">' + dotRow(52, [-62, -42, -22, 0, 22, 42, 62], 2.4) + dotRow(148, [-62, -42, -22, 0, 22, 42, 62], 2.4) + '</g><g fill="none" stroke="' + GOLD + '" stroke-opacity=".9" stroke-width="1.3"><path d="' + curve(30, 14) + '"/><path d="' + curve(172, 16) + '"/></g>',
    () => '<clipPath id="k"><path d="' + DIP + '"/></clipPath><path d="' + DIP + '" fill="#e2bb52"/><rect y="120" width="200" height="80" filter="url(#gl)" clip-path="url(#k)"/><path d="M0 142Q26 130 52 142Q78 154 104 142Q130 130 156 142Q180 152 200 142" fill="none" stroke="#fff3c4" stroke-opacity=".8" stroke-width="1.6"/>',
    () => '<rect width="200" height="200" filter="url(#gl)" opacity=".7"/><g fill="#fff"><path d="' + star(48, 50, 9) + '"/><path d="' + star(150, 40, 7) + '"/><path d="' + star(60, 160, 7) + '"/><path d="' + star(146, 158, 9) + '"/></g>'
  ];
  /* style -1 is only the name shadow, shading and reflections, to lay over a picture */
  App.ornArt = (style, c) => {
    const over = style < 0;
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs>' +
      '<radialGradient id="b" cx="38%" cy="30%" r="84%"><stop offset="0" stop-color="' + hexTone(c[0], .34) + '"/><stop offset=".26" stop-color="' + c[0] + '"/><stop offset=".62" stop-color="' + c[1] + '"/><stop offset="1" stop-color="' + hexTone(c[2], -.45) + '"/></radialGradient>' +
      '<radialGradient id="g" cx="62%" cy="92%" r="48%"><stop offset="0" stop-color="' + hexTone(c[0], .3) + '" stop-opacity=".55"/><stop offset="1" stop-color="' + c[0] + '" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="r"><stop offset=".52" stop-color="#000" stop-opacity="0"/><stop offset=".86" stop-color="#000" stop-opacity=".32"/><stop offset="1" stop-color="#000" stop-opacity=".62"/></radialGradient>' +
      '<radialGradient id="n"><stop offset="0" stop-color="#000" stop-opacity="' + (over ? '.62' : '.46') + '"/><stop offset=".65" stop-color="#000" stop-opacity="' + (over ? '.34' : '.2') + '"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity=".1"/></linearGradient>' +
      '<filter id="s" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.4"/></filter>' +
      '<filter id="s2" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6"/></filter>' +
      '<filter id="gl" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 .96 0 0 0 0 .74 0 0 0 12 -6.5"/></filter>' +
      '<clipPath id="c"><circle cx="100" cy="100" r="99.5"/></clipPath></defs><g clip-path="url(#c)">' +
      (over ? '' : '<rect width="200" height="200" fill="url(#b)"/><rect width="200" height="200" fill="url(#g)"/>' + ORN_PAT[((style | 0) % ORN_PAT.length + ORN_PAT.length) % ORN_PAT.length]()) +
      '<ellipse cx="100" cy="101" rx="112" ry="36" fill="url(#n)"/>' +
      '<rect width="200" height="200" fill="url(#r)"/>' +
      '<circle cx="100" cy="100" r="96" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="2.4" filter="url(#s)"/>' +
      '<ellipse cx="104" cy="34" rx="64" ry="20" fill="#fff" fill-opacity=".17" filter="url(#s2)"/>' +
      '<path d="M34 78Q38 42 76 26Q58 48 52 82Z" fill="url(#w)" filter="url(#s)" opacity=".9"/>' +
      '<ellipse cx="57" cy="38" rx="9.500" ry="5" fill="#fff" fill-opacity=".96" transform="rotate(-32 57 38)"/>' +
      '<path d="M146 156Q170 134 177 102" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="5" stroke-linecap="round" filter="url(#s)"/>' +
      '</g></svg>';
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
  };
  App.ornStyles = ORN_NAMES.map(n => ({ n }));
  App.ornOf = n => { const o = (App.store.get('orns', {}) || {})[n]; return o && typeof o === 'object' ? o : { st: Math.max(0, App.names.indexOf(n)) % ORN_NAMES.length }; };
  const ornCss = document.createElement('style'); document.head.appendChild(ornCss);
  const paintOrns = () => {
    ornCss.textContent = App.names.map(n => {
      const o = App.ornOf(n), p = App.person(n), sel = '.orn[data-name="' + n + '"]', src = o.img ? App.photos.src({ id: o.img }) : '';
      return sel + ' .ball{background:' + (src ? App.ornArt(-1, p.c) + ' center/100% 100%,url("' + src + '") center/cover' : App.ornArt(o.st | 0, p.c) + ' center/100% 100%') + '}' + sel + ' .ball::before,' + sel + ' .ball::after{display:none}';
    }).join('');
  };
  App.setOrn = (name, design) => { const o = App.store.get('orns', {}) || {}; o[name] = design; App.store.set('orns', o); paintOrns(); };
  App.photos.ready.then(paintOrns);
  App.on('photo', paintOrns); App.on('people', paintOrns);
  App.on('sync', keys => { if (keys.indexOf('orns') >= 0 || keys.indexOf('people') >= 0) paintOrns(); });

  /* ---------- who is online ----------
     The group keeps a short note for every open app (see cloud.js). Anyone on that list gets a green
     dot on their picture and their ornament, painted with one style rule so nothing is redrawn. */
  const onCss = document.createElement('style'); document.head.appendChild(onCss);
  App.online = () => {
    const st = App.cloud ? App.cloud.status() : 'off'; if (st === 'off' || st === 'offline') return [];
    /* a watch cannot tell the server when it closes, so its note carries a time and goes stale by itself */
    const o = App.store.get('online', {}) || {}, on = {}, now = Date.now(); Object.keys(o).forEach(k => { const e = o[k]; if (e && e.n && !(e.t && now - e.t > 150000)) on[e.n] = 1; });
    return App.names.filter(n => on[n]);
  };
  const paintOnline = () => {
    onCss.textContent = App.online().map(n => '.avatar[data-n="' + n + '"]::after{content:"";position:absolute;right:-4%;bottom:-4%;width:30%;height:30%;min-width:8px;min-height:8px;border-radius:50%;background:#3ddc84;box-shadow:0 0 0 2px #0b1730}' +
      '.orn[data-name="' + n + '"] .olabel::before{content:"";display:inline-block;width:7px;height:7px;border-radius:50%;background:#3ddc84;margin-right:5px;vertical-align:1px}').join('');
  };
  App.on('sync', keys => { if (keys.indexOf('online') >= 0 || keys.indexOf('people') >= 0) paintOnline(); });
  setInterval(paintOnline, 60000);
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
    /* every sheet is wrapped like a present: a candy-stripe ribbon along the top edge */
    .sheet{position:relative;overflow:hidden}
    .sheet::before{content:"";position:absolute;left:0;right:0;top:0;height:8px;z-index:2;background:repeating-linear-gradient(135deg,#c9243a 0 10px,#f4ecdc 10px 20px);box-shadow:0 1px 0 rgba(0,0,0,.28)}
    .sheet-head{padding-top:22px}
    .sheet-head h2{font-size:23px}
    .sheet-back.under{visibility:hidden}
    .bname{font-style:italic;font-weight:700;font-size:calc(var(--size)*.2);letter-spacing:.005em;color:#fffaf0;text-shadow:0 1px 2px rgba(0,0,0,.75),0 0 calc(var(--size)*.08) rgba(0,0,0,.55)}
    .ball{box-shadow:0 calc(var(--size)*.09) calc(var(--size)*.2) rgba(0,0,0,.55)}
    .cap{width:calc(var(--size)*.27);height:calc(var(--size)*.2);border-radius:0;margin-bottom:calc(var(--size)*-.05);background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 44'%3E%3Cdefs%3E%3ClinearGradient id='m' x1='0' x2='1'%3E%3Cstop offset='0' stop-color='%23705216'/%3E%3Cstop offset='.3' stop-color='%23fbe9ae'/%3E%3Cstop offset='.52' stop-color='%23d2a544'/%3E%3Cstop offset='.78' stop-color='%23f1d98c'/%3E%3Cstop offset='1' stop-color='%23604511'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='30' cy='9' r='6.500' fill='none' stroke='%23e6c668' stroke-width='2'/%3E%3Cpath d='M12 38V22Q12 16 18 16H42Q48 16 48 22V38Q45 43 42 38Q39 43 36 38Q33 43 30 38Q27 43 24 38Q21 43 18 38Q15 43 12 38Z' fill='url(%23m)'/%3E%3Cg stroke='%235a3f0e' stroke-opacity='.35' stroke-width='1'%3E%3Cpath d='M18 17V38M24 16V38M30 16V38M36 16V38M42 17V38'/%3E%3C/g%3E%3Cpath d='M13 22Q13 17 18 17H42Q47 17 47 22' fill='none' stroke='%23fff6d0' stroke-opacity='.8' stroke-width='1'/%3E%3C/svg%3E") center/100% 100% no-repeat}
    .cap::before{display:none}
    .who-orn{display:flex;align-items:center;gap:12px;width:100%;margin-top:10px;padding:10px 14px;border-radius:16px;text-align:left;background:#7d1727;border:1px solid #b33247}
    .who-orn:active{transform:scale(.98)}
    .who-orn-b{width:38px;height:38px;border-radius:50%;flex:none;background:radial-gradient(circle at 30% 26%,rgba(255,255,255,.95) 0,rgba(255,255,255,.4) 7%,rgba(255,255,255,0) 22%),repeating-linear-gradient(135deg,rgba(255,255,255,.3) 0 7%,rgba(255,255,255,0) 7% 19%),radial-gradient(circle at 38% 32%,#ffe08a,#d49a1c 58%,#6b4a06);box-shadow:inset -3px -4px 8px rgba(0,0,0,.35)}
    .who-orn b{display:block;font-weight:600;font-size:15.5px;color:#fff}
    .who-orn small{display:block;font-size:13px;color:#ffd6dc}
    /* top bar: the group's name, with the app name small above it */
    .wm-t{display:flex;flex-direction:column;line-height:1.08;min-width:0}
    .wm-t small{font-family:var(--font);font-size:11px;font-weight:600;color:#c9d5e6;letter-spacing:.03em}
    .wm-t b{font-family:var(--display);font-weight:600;font-size:19px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:44vw}
    /* tab bar: pine green, snow along the top edge, and the tab you are on is a red ornament */
    #tabs{position:relative;background:#0c2a22;border-top:0}
    #tabs::before{content:"";position:absolute;left:0;right:0;top:-8px;height:9px;pointer-events:none;background:radial-gradient(circle at 50% 100%,#eef4fb 0 8.5px,rgba(238,244,251,0) 9px) 0 0/19px 9px repeat-x}
    .tab{color:#c4d9cf}
    .tab svg{box-sizing:content-box;padding:6px;border-radius:50%;margin:-4px 0 -3px}
    .tab.on{color:#fff}
    .tab.on::before{display:none}
    .tab.on svg{color:#ffe9a8;background:radial-gradient(circle at 32% 26%,rgba(255,255,255,.85) 0,rgba(255,255,255,.25) 12%,rgba(255,255,255,0) 30%),radial-gradient(circle at 40% 34%,#ff6b7d,#c41e3a 60%,#6e0d1e);box-shadow:0 3px 8px rgba(0,0,0,.45)}
    @media (orientation:landscape) and (min-width:560px){#tabs{border-right:0}#tabs::before{left:auto;right:-5px;top:0;bottom:0;width:5px;height:auto;background:repeating-linear-gradient(180deg,#c9243a 0 9px,#f4ecdc 9px 18px)}}
    /* music player: a red music box with gold trim and a candy-stripe progress line */
    #player{background:linear-gradient(#8a1a2c,#6d1422);border:1px solid rgba(233,196,106,.55)}
    .p-art{border-radius:50%;color:#6b4a06;background:radial-gradient(circle at 32% 26%,rgba(255,255,255,.9) 0,rgba(255,255,255,.3) 12%,rgba(255,255,255,0) 30%),radial-gradient(circle at 40% 34%,#ffe9a8,#d9a520 62%,#7a5708)}
    #player.playing .p-art svg{animation:p-spin 6s linear infinite}
    @keyframes p-spin{to{transform:rotate(360deg)}}
    .p-sub{color:#ffd6dc;font-size:12.5px}
    .p-btn.main{background:#fff;color:#8a1a2c}
    .p-bar{height:4px;background:rgba(0,0,0,.28)}
    .p-bar b{background:repeating-linear-gradient(135deg,#fff 0 6px,#ffd76a 6px 12px)}
    #player.loading .p-btn.main{animation:p-load 1s ease-in-out infinite alternate}
    @keyframes p-load{from{opacity:.45}to{opacity:1}}
    /* sheets and buttons with a little more life */
    .sheet{background:radial-gradient(130% 70% at 50% 0,rgba(66,104,178,.3),rgba(15,27,51,0) 62%),var(--surface)}
    .sheet-head h2::before{content:"";display:inline-block;width:24px;height:22px;margin-right:9px;vertical-align:-3px;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 22'%3E%3Cpath d='M11 13C6 14 2 11 1 6c4-1 8 1 10 7z' fill='%232a8a58'/%3E%3Cpath d='M13 13c5 1 9-2 10-7-4-1-8 1-10 7z' fill='%231f6f47'/%3E%3Cpath d='M11 13C8 9 9 4 12 1c3 3 4 8 1 12z' fill='%2334a36b'/%3E%3Ccircle cx='9.300' cy='16.500' r='3' fill='%23d7263d'/%3E%3Ccircle cx='14.700' cy='16.500' r='3' fill='%23c41e3a'/%3E%3Ccircle cx='12' cy='19' r='2.800' fill='%23e8404f'/%3E%3Ccircle cx='8.400' cy='15.600' r='.9' fill='%23fff' fill-opacity='.7'/%3E%3C/svg%3E") center/contain no-repeat}
    .btn{background:linear-gradient(#1f3359,#172848);box-shadow:inset 0 1px 0 rgba(255,255,255,.08)}
    .btn.primary{background:linear-gradient(#f3d27c,#dcae45);box-shadow:inset 0 1px 0 rgba(255,255,255,.45),0 2px 0 #a17a1f}
    .btn.danger{background:transparent;box-shadow:none}
    .btn.ghost{background:transparent;box-shadow:none}
    .btn.red{background:linear-gradient(#e03a52,#c41e3a);box-shadow:inset 0 1px 0 rgba(255,255,255,.25),0 2px 0 #7d1727}
    .btn.green{background:linear-gradient(#22a06e,#16794f);box-shadow:inset 0 1px 0 rgba(255,255,255,.25),0 2px 0 #0c4a31}
    .who-row{margin-top:12px}
    .mu{display:flex;flex-direction:column;gap:14px}
    .mu-a,.mu-b{display:flex;flex-direction:column;gap:10px;min-width:0}
    .mu-hero{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:84px;padding:14px 18px;border-radius:20px;background:var(--gold);color:var(--gold-ink);text-align:left}
    .mu-hero:active,.mu-sq:active,.mu-pill:active,.mu-join:active,.mu-dot:active .mu-c{transform:scale(.97)}
    .mu-hero-t b{display:block;font-family:var(--display);font-size:22px;font-weight:600;line-height:1.1}
    .mu-hero-t small{display:block;font-size:13px;font-weight:500;opacity:.8;margin-top:3px}
    .mu-code{font-family:var(--display);font-weight:600;font-size:clamp(15px,4.4vw,19px);letter-spacing:.06em;background:rgba(17,26,46,.12);border-radius:10px;padding:7px 10px;white-space:nowrap}
    .mu-two{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .mu-sq{display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-height:86px;padding:12px 14px;border-radius:18px;text-align:left;border:1px solid transparent}
    .mu-sq svg{margin-bottom:6px}
    .mu-sq b{font-weight:600;font-size:16px;color:#fff}
    .mu-sq small{font-size:13px}
    .mu-sq.blue{background:#15336a;border-color:#2c58ab}.mu-sq.blue svg{color:#8cc4ff}.mu-sq.blue small{color:#b9d4f5}
    .mu-sq.purple{background:#2f2060;border-color:#5b41b3}.mu-sq.purple svg{color:#cbb0ff}.mu-sq.purple small{color:#d3c5f3}
    .mu-h{font-size:13px;font-weight:600;color:var(--muted);margin-bottom:-2px}
    .mu-pills{display:flex;gap:8px}
    .mu-pill{flex:1.3;display:flex;align-items:center;justify-content:center;gap:7px;min-height:46px;border-radius:999px;font-weight:600;font-size:15px}
    .mu-pill.green{background:#10603f;color:#d2f7e3}
    .mu-pill.red{background:#8a1a2c;color:#ffe0e4}
    .mu-pill.line{flex:.8;background:transparent;border:1.5px solid var(--line2);color:#fff}
    .mu-join{display:flex;align-items:center;justify-content:center;gap:8px;min-height:44px;border-radius:12px;border:1.5px dashed rgba(255,255,255,.38);font-weight:600;font-size:14.5px;color:#e6edf7}
    .mu-round{display:flex;justify-content:space-around;gap:8px}
    .mu-dot{display:flex;flex-direction:column;align-items:center;gap:6px;min-width:0;flex:1}
    .mu-c{width:58px;height:58px;border-radius:50%;display:grid;place-items:center;background:var(--surface2);border:1.5px solid var(--line2);color:#fff;background-size:cover;background-position:center}
    .mu-photo{border-color:rgba(255,255,255,.55)}
    .mu-dot.on .mu-c{background:var(--gold);border-color:var(--gold);color:var(--gold-ink)}
    .mu-dot small{font-size:13px;font-weight:500;color:#dfe7f3;text-align:center;line-height:1.2}
    .mu-dot small b{font-weight:700;color:var(--gold)}
    @media (orientation:landscape) and (max-height:480px){.mu{display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start}.mu-hero{min-height:64px;padding:10px 14px}.mu-hero-t b{font-size:18px}.mu-sq{min-height:70px;padding:9px 12px}.mu-sq svg{margin-bottom:2px}.mu-c{width:46px;height:46px}.mu-pill{min-height:40px}.mu-join{min-height:38px}.mu-b{gap:8px}}
    .mn-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .mn-tile{display:flex;align-items:center;gap:10px;min-height:56px;padding:8px 10px;border-radius:14px;background:var(--surface2);border:1px solid var(--line);text-align:left;min-width:0}
    .mn-tile:active{transform:scale(.98)}
    .mn-ic{width:36px;height:36px;border-radius:10px;display:grid;place-items:center;background:rgba(233,196,106,.14);color:var(--gold);flex:none}
    .mn-tx{display:flex;flex-direction:column;min-width:0}
    .mn-tx b{font-weight:600;font-size:14px;line-height:1.2}
    .mn-tx small{font-size:12.5px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .wordmark{cursor:pointer}
    .wordmark .wm-more{transform:rotate(90deg);color:#c9d5e6;margin-left:-2px}
    @media (orientation:landscape) and (max-height:480px){.mn-grid{grid-template-columns:repeat(5,1fr)}.mn-tile{flex-direction:column;align-items:flex-start;gap:6px;min-height:0;padding:8px}.mn-ic{width:30px;height:30px}.mn-tx b{font-size:13px}}
    /* easier to read: small text a little bigger, and a soft dark edge on words that sit on the photo */
    .olabel{font-size:clamp(12px,2.1cqh,13.5px)}
    .count-unit,.count-sub{text-shadow:0 1px 3px rgba(4,9,22,.9),0 0 10px rgba(4,9,22,.6)}
    .count-sub{font-size:clamp(13px,2.4cqh,15.5px);color:#dbe5f2}
    .tab{font-size:12px}
    .wwhy{font-size:14px}
    .phead .ttl p{font-size:13.5px;color:#cfdaea}
    .phead .ttl,.page>header,.page h1{text-shadow:0 1px 3px rgba(4,9,22,.75)}
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
  let lastToast = '', lastToastAt = 0;
  ui.toast = msg => {
    if (msg === lastToast && Date.now() - lastToastAt < 2500) return; lastToast = msg; lastToastAt = Date.now();
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
    const topNow = stack[stack.length - 1];
    if (topNow && topNow.title === (opts.title || '') && Date.now() - topNow.at < 600) return topNow;      /* a double tap */
    $$('#sheets .sheet-back.out').forEach(x => x.remove());                                                  /* one on its way out */
    if (topNow) topNow.back.classList.add('under');                                                          /* the one underneath waits out of sight */
    const back = document.createElement('div'); back.className = 'sheet-back';
    back.innerHTML = '<div class="sheet' + (opts.wide ? ' wide' : '') + (opts.cls ? ' ' + opts.cls : '') + '" role="dialog" aria-modal="true">' +
      '<header class="sheet-head"><h2>' + App.esc(opts.title || '') + '</h2>' +
      (opts.locked ? '' : '<button class="icon-btn" data-close aria-label="Close">' + App.icon('x') + '</button>') + '</header>' +
      '<div class="sheet-body">' + (opts.html || '') + '</div></div>';
    $('#sheets').appendChild(back);
    let closed = false;
    const close = () => { if (closed) return; closed = true; back.classList.remove('under'); back.classList.add('out'); const i = stack.indexOf(api); if (i >= 0) stack.splice(i, 1); const t = stack[stack.length - 1]; if (t) t.back.classList.remove('under'); setTimeout(() => back.remove(), 220); if (opts.onClose) opts.onClose(); };
    const api = { el: back.firstChild, back, close, locked: !!opts.locked, title: opts.title || '', at: Date.now() };
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
    const p = node.parentNode; if (p && (/^(SCRIPT|STYLE|TEXTAREA)$/.test(p.nodeName) || (p.closest && p.closest('[data-keep]')))) return;
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
      html: '<label class="switch"><span class="s-text"><b>School mode</b><small data-keep>Shows Dad and Mom instead of Daddy and Mommy. Only on this device.</small></span><input type="checkbox" id="setSchool"' + (school ? ' checked' : '') + '></label>' +
        (App.lock && App.lock.on() && ME ? '<button class="btn sm block" id="setPin" style="margin:4px 0 6px">' + App.icon('lock', 16) + 'Your locks</button>' : '') +
        (bgs.length ? '<span class="label" style="margin-top:10px">Background</span><div class="bg-grid">' + bgs.map(b => '<button class="bg-opt' + (b.id === cur ? ' on' : '') + '" data-bg="' + b.id + '" style="background-image:url(' + b.thumb + ')"><span>' + App.esc(b.name) + '</span></button>').join('') + '</div>' : ''),
      onMount(el) {
        $('#setSchool', el).onchange = e => App.school.set(e.target.checked);
        const pb = $('#setPin', el); if (pb) pb.onclick = () => App.lock.optionsSheet();
        $$('.bg-opt', el).forEach(b => b.onclick = () => { App.scene.setBackground(b.dataset.bg); $$('.bg-opt', el).forEach(x => x.classList.toggle('on', x === b)); });
      }
    });
  };

  /* ---------- menu ----------
     One place for everything that is not a wishlist: groups, invites, people, background, school mode, PIN. */
  ui.menu = () => {
    const C = App.cloud, inGroup = !!App.space() && !!C, g = inGroup ? (C.groups().find(x => x.id === App.space()) || {}) : {};
    const bgs = App.scene && App.scene.backgrounds ? App.scene.backgrounds() : [], bg = bgs.find(x => x.id === App.scene.background()) || bgs[0];
    const on = App.online().length, lockOn = App.lock && App.lock.on() && ME;
    ui.sheet({
      title: inGroup ? (g.name || 'Menu') : 'Menu', cls: 'menu',
      html: '<div class="mu">' +
        /* the main thing: getting people in. One wide gold banner with the code on it */
        (inGroup ? '<div class="mu-a"><button class="mu-hero" id="mnInvite"><span class="mu-hero-t"><b>Invite people</b><small>Tap to send the code</small></span><span class="mu-code">' + C.pretty(App.space()) + '</span></button>' +
          '<div class="mu-two"><button class="mu-sq blue" id="mnPeople">' + App.icon('users', 24) + '<b>People</b><small>' + App.names.length + ' here' + (on ? ', ' + on + ' online' : '') + '</small></button>' +
          '<button class="mu-sq purple" id="mnGroups">' + App.icon('swap', 24) + '<b>My groups</b><small>Switch or leave</small></button></div></div>' : '') +
        '<div class="mu-b">' +
        /* starting or joining: pill buttons and one dashed bar */
        (C ? '<p class="mu-h">Start something new</p><div class="mu-pills"><button class="mu-pill green" id="mnFamily">' + App.icon('tree', 18) + 'Family</button><button class="mu-pill red" id="mnFriends">' + App.icon('heart', 18) + 'Friends</button><button class="mu-pill line" id="mnMore">More</button></div>' +
          '<button class="mu-join" id="mnJoin">' + App.icon('plus', 18) + 'Join a group with a code</button>' : '') +
        /* things about this phone: round buttons */
        '<p class="mu-h">On this phone</p><div class="mu-round">' +
        '<button class="mu-dot" id="mnBg"><span class="mu-c mu-photo"' + (bg ? ' style="background-image:url(' + bg.thumb + ')"' : '') + '></span><small>Background</small></button>' +
        '<button class="mu-dot' + (school ? ' on' : '') + '" id="mnSchool"><span class="mu-c">' + App.icon('book', 22) + '</span><small>School mode<b>' + (school ? ' on' : ' off') + '</b></small></button>' +
        (lockOn ? '<button class="mu-dot" id="mnPin"><span class="mu-c">' + App.icon('lock', 22) + '</span><small>Locks</small></button>' : '') +
        (App.privacy && ME ? '<button class="mu-dot" id="mnPriv"><span class="mu-c">' + App.icon('eye', 22) + '</span><small>Who sees what</small></button>' : '') +
        (App.safety ? '<button class="mu-dot" id="mnSafe"><span class="mu-c">' + App.icon('heart', 22) + '</span><small>Safety and rules</small></button>' : '') +
        '</div></div></div>',
      onMount(el, close) {
        const tap = (id, fn) => { const x = $('#' + id, el); if (x) x.onclick = fn; };
        tap('mnInvite', () => C.invite()); tap('mnPeople', () => { close(); C.peopleSheet(); }); tap('mnGroups', () => { close(); C.groupSheet(); });
        tap('mnFamily', () => C.createSheet('family')); tap('mnFriends', () => C.createSheet('friends')); tap('mnJoin', () => C.joinSheet()); tap('mnMore', () => C.moreKindsSheet());
        tap('mnBg', () => { close(); ui.settings(); }); tap('mnPin', () => { close(); App.lock.optionsSheet(); }); tap('mnPriv', () => { close(); App.privacy.sheet(); }); tap('mnSafe', () => { close(); App.safety.sheet(); });
        tap('mnSchool', () => { const want = !school; close(); App.school.set(want); if (want) ui.toast('School mode is on.'); });
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
          '<button class="who-orn" id="whoOrn"><span class="who-orn-b"></span><span><b>Design my ornament</b><small>Styles, a photo, or draw your own</small></span></button>' +
          '<div class="row gap who-row">' + (App.cloud ? '<button class="btn grow" id="whoGroups">' + App.icon('users', 18) + (App.space() ? 'Group' : 'Go online') + '</button>' : '') +
          '<button class="btn grow" id="whoSet">' + App.icon('sliders', 18) + 'Settings</button></div>' +
          '<button class="btn ghost block who-switch" id="whoSwitch">Switch person</button>'
        : '<p class="muted">' + (!App.names.length ? 'Nobody is in this group yet. Add your name to start.' : locks ? 'Pick your name. A name with a lock is already taken.' : 'Pick your name. You can change your own list and see everyone else\'s.') + '</p>' +
          (App.names.length ? '<div class="pp-rail"></div>' : '') + '<div class="pp-grid">' +
          App.names.map((n, i) => { const p = App.person(n), size = App.names.length <= 4 ? 78 : App.names.length <= 8 ? 66 : 56, tag = n === ME ? 'You' : locks && App.lock.has(n) ? 'Taken' : 'Free';
            return '<button class="orn pp-orn who-btn' + (n === ME ? ' me' : '') + '" data-name="' + App.esc(n) + '" data-n="' + App.esc(n) + '" style="--size:' + size + 'px;--c1:' + p.c[0] + ';--c2:' + p.c[1] + ';--c3:' + p.c[2] + ';--len:' + [8, 22, 12, 26, 6, 18][i % 6] + 'px;--dur:' + (4.2 + (i * 37 % 17) / 10).toFixed(1) + 's">' +
              '<span class="hang"><span class="thread"></span><span class="cap"></span><span class="ball"><span class="bname" style="font-size:' + Math.max(10, Math.round(size * (n.length > 6 ? 1.25 / n.length : .19))) + 'px">' + App.esc(n) + '</span></span><span class="olabel">' + tag + '</span></span></button>'; }).join('') + '</div>' +
          (App.cloud && App.names.length < App.maxPeople ? '<button class="mu-join" id="whoAdd" style="width:100%;margin-top:12px">' + App.icon('plus', 18) + (App.names.length ? 'My name is not here' : 'Add my name') + '</button>' : ''),
      onMount(el, close) {
        const pickMe = n => { const was = ME; App.setMe(n); close(); App.renderShell(); App.route(); if (was !== ME) ui.toast('Hi, ' + ME + '.'); };
        /* a name is only yours after its PIN (or after you make one for it) */
        const tryName = n => (App.lock ? App.lock.choose(n) : Promise.resolve(true)).then(ok => { if (ok) pickMe(n); });
        $$('.who-btn[data-n]', el).forEach(b => b.onclick = () => { if (b.dataset.n === ME) { close(); return; } tryName(b.dataset.n); });
        const add = $('#whoAdd', el); if (add) add.onclick = () => App.cloud.addPersonSheet(n => { if (App.data) App.data.init(); tryName(n); });
        const grp = $('#whoGroups', el); if (grp) grp.onclick = () => { close(); App.cloud.groupSheet(); };
        const set = $('#whoSet', el); if (set) set.onclick = () => { close(); ui.settings(); };
        const sw = $('#whoSwitch', el); if (sw) sw.onclick = () => { close(); ui.who('switch'); };
        const ob = $('#whoOrn', el); if (ob) ob.onclick = () => { close(); if (ui.ornament) ui.ornament(); };
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
