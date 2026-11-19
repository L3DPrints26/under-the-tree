/* Under the Tree — online: groups, invites, and keeping every phone in step.
   Each group lives in a small online database. This file signs the device in (no password), creates
   or joins groups, and mirrors the app's saved data both ways. The app keeps reading and writing its
   normal local store, so it still opens instantly and keeps working with no signal. */
(function () {
  'use strict';
  const A = window.App, $ = A.$, $$ = A.$$, esc = A.esc, raw = A.store.raw;
  const CFG = {
    apiKey: 'AIzaSyChXmHaCTSIkCqGnIMIb0dY6eO7tDbnj2c',
    authDomain: 'under-the-tree-bdcf8.firebaseapp.com',
    databaseURL: 'https://under-the-tree-bdcf8-default-rtdb.firebaseio.com',
    projectId: 'under-the-tree-bdcf8',
    appId: '1:891668584280:web:8fa76e5f5034a94326772d'
  };
  const SDK = 'https://www.gstatic.com/firebasejs/10.14.1/firebase-';
  /* kept on this device only */
  const NOSYNC = { me: 1, adventJokes: 1, claims: 1, dirty: 1, pup: 1, music: 1, groups: 1, group: 1, seeded: 1 };
  /* saved two levels deep, so two people changing different parts at the same moment both win */
  const DEEP = { santa: 1, games: 1, history: 1 };
  const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  A.css(`
    .gp-code{font-family:var(--display);font-weight:600;font-size:clamp(24px,7.4vw,34px);letter-spacing:.08em;color:#fff;font-variant-numeric:lining-nums;user-select:text;-webkit-user-select:text}
    .gp-card{padding:14px;border-radius:16px;background:var(--surface2);border:1px solid var(--line);margin-bottom:12px}
    .gp-card h3{font-size:13px;font-weight:600;color:var(--muted);margin-bottom:6px}
    .gp-row{display:flex;align-items:center;gap:10px;min-height:46px}
    .gp-row+.gp-row{border-top:1px solid var(--line)}
    .gp-row b{font-weight:600}
    .gp-row small{display:block;color:var(--muted);font-size:12.5px}
    .gp-state{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;color:var(--muted)}
    .gp-state i{width:8px;height:8px;border-radius:50%;background:#6b7c99}
    .gp-state.on i{background:#59e0a0}
    .gp-btns{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
    .gp-btns .btn{flex:1 1 140px}
    .gp-msg{min-height:20px;margin-top:10px;font-size:13.5px;color:#ff8a98}
    .gp-big{display:flex;flex-direction:column;gap:10px;margin-top:16px}
    .pp-rail{height:5px;margin:8px 4px 0;border-radius:3px;background:linear-gradient(#2a8a58,#14573a);box-shadow:0 2px 0 rgba(0,0,0,.25)}
    .pp-grid{display:flex;flex-wrap:wrap;justify-content:space-around;gap:4px 6px;margin-top:-1px}
    .pp-orn{flex:0 0 22%;display:flex;justify-content:center}
    .pp-orn .bname{white-space:nowrap}
    .pp-orn .olabel{font-size:12.5px}
    .pp-note{font-size:13px;margin-top:12px;text-align:center}
    .gp-kinds{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .gp-kinds .btn{justify-content:flex-start;padding:0 12px}
    .gp-card .gp-code{display:block}
    .gp-card .gp-state{margin-top:4px}
    .gp-tap{display:block;width:100%;text-align:left;cursor:pointer}
    .gp-faces{display:flex;flex-wrap:wrap;gap:6px}
    .gp-more{display:block;margin-top:8px;font-size:13px;font-weight:600;color:var(--gold)}
    .gp-foot{margin-top:0}
    .gp-people{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .gp-person{display:flex;align-items:center;gap:8px;min-height:44px;padding:4px 6px 4px 8px;border-radius:12px;background:var(--surface2);border:1px solid var(--line);min-width:0}
    .gp-person b{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600}
    .gp-person small{color:var(--muted);font-size:12.5px;padding-right:6px}
    .gp-person .icon-btn{width:32px;height:32px;flex:none}
    @media (orientation:landscape) and (max-height:480px){.gp-cols{display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:start}.gp-cols .gp-card{margin-bottom:8px}.gp-people{grid-template-columns:repeat(3,1fr)}}
    .code-in{text-transform:uppercase;letter-spacing:.12em;font-weight:600;text-align:center;font-size:20px}
  `);

  /* ---------- the groups this device belongs to ---------- */
  const groups = () => raw.get('groups', []) || [];
  const saveGroups = g => raw.set('groups', g);
  const pretty = id => (id.length === 10 ? id.slice(0, 5) + '-' + id.slice(5) : id);
  const cleanCode = s => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const newCode = () => { const b = new Uint8Array(10); crypto.getRandomValues(b); return Array.from(b, x => LETTERS[x % 32]).join(''); };
  const register = (id, name) => { const g = groups().filter(x => x.id !== id); g.push({ id, name }); saveGroups(g); };
  const hasLocalLists = () => { const l = raw.get('lists', null); return !!(l && Object.keys(l).length); };
  const inviteLink = id => (/^https?:$/.test(location.protocol) ? location.origin + location.pathname + '#/join/' + id : '');

  /* ---------- connect ---------- */
  let fb = null, db = null, user = null, connected = false, starting = null;
  const loadScript = src => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('offline')); document.head.appendChild(s); });
  const within = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('offline')), ms))]);
  function start() {
    if (starting) return starting;
    starting = loadScript(SDK + 'app-compat.js')
      .then(() => Promise.all([loadScript(SDK + 'auth-compat.js'), loadScript(SDK + 'database-compat.js')]))
      .then(() => {
        fb = window.firebase; if (!fb.apps.length) fb.initializeApp(CFG); db = fb.database();
        return new Promise((res, rej) => {
          fb.auth().onAuthStateChanged(u => { if (u) { user = u; res(u); } });
          fb.auth().signInAnonymously().catch(rej);
        });
      })
      .then(u => {
        db.ref('.info/connected').on('value', s => { connected = !!s.val(); A.emit('cloud', status()); if (connected) { flush(); announce(); } });
        return u;
      });
    starting.catch(() => { starting = null; });
    return starting;
  }

  /* ---------- turning saved data into small pieces and back ----------
     A saved thing like "lists" is split per person (and one level deeper for a few), each piece stored
     as text. Pieces are compared as text, so only what actually changed is ever sent. */
  const enc = s => encodeURIComponent(String(s)).replace(/\./g, '%2E');
  const dec = s => { try { return decodeURIComponent(s); } catch (e) { return s; } };
  const plain = v => !!v && typeof v === 'object' && !Array.isArray(v);
  const parse = s => { if (s == null) return undefined; try { return JSON.parse(s); } catch (e) { return undefined; } };
  function flat(k, v) {
    const out = {};
    if (v === undefined || v === null) return out;
    if (!plain(v)) { out['~'] = JSON.stringify(v); return out; }
    Object.keys(v).forEach(p => {
      const x = v[p]; if (x === undefined) return;
      if (DEEP[k] && plain(x) && Object.keys(x).length) Object.keys(x).forEach(q => { if (x[q] !== undefined) out[enc(p) + '|' + enc(q)] = JSON.stringify(x[q]); });
      else out[enc(p)] = JSON.stringify(x);
    });
    return out;
  }
  function unflat(subs) {
    const keys = Object.keys(subs); if (!keys.length) return undefined;
    if ('~' in subs) return parse(subs['~']);
    const out = {};
    keys.filter(s => s.indexOf('|') < 0).forEach(s => { out[dec(s)] = parse(subs[s]); });
    keys.filter(s => s.indexOf('|') >= 0).forEach(s => { const i = s.indexOf('|'), p = dec(s.slice(0, i)), q = dec(s.slice(i + 1)); if (!plain(out[p])) out[p] = {}; out[p][q] = parse(subs[s]); });
    return out;
  }
  const same = (a, b) => { const ka = Object.keys(a), kb = Object.keys(b); return ka.length === kb.length && ka.every(s => a[s] === b[s]); };

  /* ---------- sync ---------- */
  let gid = '', kvRef = null, photoRef = null, attached = false, gotFirst = false, applying = false, last = {};
  const dkey = () => 'g:' + gid + ':dirty', pkey = () => 'g:' + gid + ':pup';
  const getDirty = () => raw.get(dkey(), {}) || {};
  const waiting = () => Object.keys(getDirty()).length + (raw.get(pkey(), []) || []).length;
  function status() { return !gid ? 'off' : attached && gotFirst && connected ? (waiting() ? 'saving' : 'online') : 'offline'; }

  /* something was saved on this device: note which pieces changed and send them */
  A.on('store', ev => {
    if (!gid || applying || NOSYNC[ev.k] || A.space() !== gid) return;
    const a = flat(ev.k, parse(ev.old)), b = flat(ev.k, A.store.get(ev.k));
    const ch = Object.keys(b).filter(s => b[s] !== a[s]).concat(Object.keys(a).filter(s => !(s in b)));
    if (!ch.length) return;
    const d = getDirty(); d[ev.k] = d[ev.k] || {}; ch.forEach(s => { d[ev.k][s] = 1; }); raw.set(dkey(), d);
    queueFlush();
  });
  A.on('photo:new', id => { if (!gid || A.space() !== gid) return; const q = raw.get(pkey(), []) || []; q.push(id); raw.set(pkey(), q); queueFlush(); });

  let ft = 0, flushing = false, again = false;
  const queueFlush = () => { clearTimeout(ft); ft = setTimeout(flush, 120); };
  async function flush() {
    if (!attached || !gotFirst || !connected) return;
    if (flushing) { again = true; return; }
    flushing = true;
    try { await pushPhotos(); await pushPieces(); } catch (e) { console.warn('sync', e && (e.code || e.message)); }
    flushing = false;
    if (again) { again = false; queueFlush(); }
    A.emit('cloud', status());
  }
  /* photos go up first, so a wish never points at a picture that is not there yet */
  async function pushPhotos() {
    for (;;) {
      const q = raw.get(pkey(), []) || []; if (!q.length) return;
      const id = q[0], data = A.photos.get(id);
      if (data && data.length < 1500000) await photoRef.child(enc(id)).set(data);
      raw.set(pkey(), (raw.get(pkey(), []) || []).filter(x => x !== id));
    }
  }
  async function pushPieces() {
    const d = getDirty();
    for (const k of Object.keys(d)) {
      const f = flat(k, A.store.get(k)), up = {}, sent = [];
      Object.keys(d[k]).forEach(s => { const v = s in f ? f[s] : null; up[s] = v; sent.push([s, v]); });
      if (!sent.length) continue;
      try { await kvRef.child(k).update(up); } catch (e) { console.warn('sync', k, e && e.code); continue; }
      const now = getDirty(); if (!now[k]) continue;
      const f2 = flat(k, A.store.get(k));
      sent.forEach(p => { if ((p[0] in f2 ? f2[p[0]] : null) === p[1]) delete now[k][p[0]]; });
      if (!Object.keys(now[k]).length) delete now[k];
      raw.set(dkey(), now);
    }
  }
  /* the group changed (from any phone, this one included): bring this device in line */
  function onValue(snap) {
    const val = snap.val() || {}, d = getDirty(), changed = [];
    Object.keys(Object.assign({}, last, val)).forEach(k => {
      if (NOSYNC[k]) return;
      const mine = flat(k, A.store.get(k)), subs = Object.assign({}, val[k] || {});
      if (d[k]) Object.keys(d[k]).forEach(s => { if (s in mine) subs[s] = mine[s]; else delete subs[s]; });   /* not sent yet: keep ours */
      if (same(subs, mine)) return;
      applying = true;
      try { const v = unflat(subs); if (v === undefined) A.store.del(k); else A.store.set(k, v); } finally { applying = false; }
      changed.push(k);
    });
    last = val;
    const first = !gotFirst; gotFirst = true;
    if (changed.length) A.emit('sync', changed);
    if (first) { A.emit('cloud', status()); flush(); missed.forEach(fetchPhoto); missed.clear(); }
  }
  /* photos this device does not have yet */
  const asked = {}, missed = new Set();
  function fetchPhoto(id) {
    if (asked[id]) return; asked[id] = 1;
    const retry = () => setTimeout(() => { delete asked[id]; }, 20000);
    photoRef.child(enc(id)).once('value').then(s => { const v = s.val(); if (typeof v === 'string') A.photos.have(id, v); else retry(); }, retry);
  }
  A.on('photo:miss', id => { if (!gid) return; if (attached && gotFirst) fetchPhoto(id); else missed.add(id); });

  /* ---------- who is online ----------
     Each open app leaves a small note under the group saying who is using it. The server takes the
     note away by itself when that phone closes the app or loses its connection. */
  let hereRef = null;
  function announce() {
    if (!attached || !user || !connected) return;
    const me = A.me(); hereRef = hereRef || kvRef.child('online/' + enc(user.uid));
    if (!me) { hereRef.remove().catch(() => {}); return; }
    hereRef.onDisconnect().remove().catch(() => {});
    hereRef.set(JSON.stringify({ n: me })).catch(() => {});
  }
  A.on('me', announce);

  function attach() {
    gid = A.space(); if (!gid) return;
    start().then(() => {
      const g = db.ref('groups/' + gid);
      kvRef = g.child('kv'); photoRef = g.child('photos'); attached = true; announce();
      g.child('members/' + user.uid).set(Date.now()).catch(() => {});
      kvRef.on('value', onValue, err => { console.warn('sync read', err && err.code); attached = false; A.emit('cloud', status()); });
    }).catch(() => { A.emit('cloud', status()); setTimeout(attach, 20000); });
  }

  /* ---------- create, join, leave ---------- */
  /* copy what is saved on this device (from before groups) into the new group, and queue all of it to go up */
  function carryOver(id, joining) {
    const pre = 'g:' + id + ':', d = {}, pics = new Set();
    /* joining a group that already has lists: only bring lists that have something in them, so an empty
       copy on this device can never wipe what someone already added from their own phone */
    const keep = (k, s, f) => !(joining && k === 'lists' && !((parse(f[s]) || {}).items || []).length);
    const walk = v => { if (typeof v === 'string') { if (v.length < 40 && A.photos.get(v)) pics.add(v); } else if (v && typeof v === 'object') Object.keys(v).forEach(p => walk(v[p])); };
    Object.keys(localStorage).forEach(full => {
      if (full.indexOf('utt:') !== 0) return;
      const k = full.slice(4); if (k.indexOf('g:') === 0 || k === 'groups' || k === 'group' || k === 'music' || k === 'seeded') return;
      /* joining brings the wishlists and pictures only. Votes, scores and the rest stay as the group has them */
      if (joining && !NOSYNC[k] && k !== 'lists' && k !== 'pics' && k !== 'history') return;
      const v = raw.get(k); raw.set(pre + k, v);
      if (NOSYNC[k]) return;
      const f = flat(k, v), subs = Object.keys(f).filter(s => keep(k, s, f));
      if (subs.length) { d[k] = {}; subs.forEach(s => { d[k][s] = 1; }); }
      walk(v);
    });
    raw.set(pre + 'dirty', d); raw.set(pre + 'pup', Array.from(pics));
  }
  async function create(name, bring, id, kind) {
    await within(start(), 15000);
    id = cleanCode(id) || newCode();
    const g = db.ref('groups/' + id);
    await within(g.child('meta').set({ name, at: Date.now(), kind: kind || 'group' }), 12000);
    await within(g.child('members/' + user.uid).set(Date.now()), 12000);
    register(id, name);
    if (bring) carryOver(id);
    raw.set('group', id);
    return id;
  }
  async function join(code, bring) {
    const id = cleanCode(code); if (id.length < 6) throw new Error('nocode');
    await within(start(), 15000);
    const g = db.ref('groups/' + id);
    try { await within(g.child('members/' + user.uid).set(Date.now()), 12000); }       /* refused unless the group exists */
    catch (e) { throw new Error(e && e.message === 'offline' ? 'offline' : 'nocode'); }
    const meta = (await within(g.child('meta').once('value'), 12000)).val() || {};
    register(id, meta.name || 'Group');
    if (bring) carryOver(id, true);
    raw.set('group', id);
    return id;
  }
  async function leave(id) {
    await within(start(), 15000);
    if (id === gid) { try { await within(flush(), 8000); } catch (e) {} if (kvRef) kvRef.off(); attached = false; }
    await within(db.ref('groups/' + id + '/members/' + user.uid).remove(), 12000);
    saveGroups(groups().filter(g => g.id !== id));
    /* forget this group's copy on this device. The group itself keeps everything, so joining again brings it all back. */
    Object.keys(localStorage).filter(k => k.indexOf('utt:g:' + id + ':') === 0).forEach(k => { localStorage.removeItem(k); });
    if (raw.get('group', '') === id) raw.set('group', (groups()[0] || {}).id || '');
  }
  const switchTo = id => { raw.set('group', id); go(); };
  const go = () => { location.hash = '#/'; location.reload(); };
  const why = e => (e && e.message === 'nocode' ? 'That code did not work. Check it and try again.' : 'No connection right now. Check the Wi-Fi and try again.');

  /* ---------- screens ---------- */
  /* kinds of groups: what the button says, the name it starts with, its icon */
  const KINDS = {
    family: ['family group', 'Our family', 'tree'], friends: ['friend group', 'Friend group', 'heart'], class: ['class group', 'Our class', 'book'], team: ['team group', 'Our team', 'ball'],
    work: ['work group', 'Work crew', 'mug'], church: ['church group', 'Church group', 'candle'], roommates: ['roommate group', 'Roommates', 'stocking'], couple: ['group for two', 'Us two', 'gift']
  };
  function welcome() {
    A.ui.sheet({
      title: 'Under the Tree', locked: true,
      html: '<p class="muted">Christmas wishlists for your family or your friends. Everyone adds what they want, and everyone can see it from their own phone.</p>' +
        '<div class="gp-big"><button class="btn primary block" id="wFam">' + A.icon('tree', 18) + 'Start a family group</button>' +
        '<button class="btn block" id="wFri">' + A.icon('heart', 18) + 'Start a friend group</button>' +
        '<button class="btn block" id="wJoin">' + A.icon('users', 18) + 'Join with a code</button>' +
        '<button class="btn ghost block" id="wMore">More kinds of groups</button></div>',
      onMount(el) { $('#wFam', el).onclick = () => createSheet('family'); $('#wFri', el).onclick = () => createSheet('friends'); $('#wJoin', el).onclick = () => joinSheet(); $('#wMore', el).onclick = () => moreKindsSheet(); }
    });
  }
  function moreKindsSheet() {
    A.ui.sheet({
      title: 'More kinds of groups',
      html: '<div class="gp-kinds">' + ['class', 'team', 'work', 'church', 'roommates', 'couple'].map(k => '<button class="btn" data-kind="' + k + '">' + A.icon(KINDS[k][2], 18) + KINDS[k][1] + '</button>').join('') +
        '<button class="btn" data-kind="">' + A.icon('plus', 18) + 'Something else</button></div>',
      onMount(el, close) { $$('[data-kind]', el).forEach(b => { b.onclick = () => { close(); createSheet(b.dataset.kind); }; }); }
    });
  }
  function createSheet(kind) {
    const bring = !A.space() && hasLocalLists(), k = KINDS[kind] || ['group', '', 'plus'];
    A.ui.sheet({
      title: 'Start a ' + k[0],
      html: '<label class="field"><span>What should it be called?</span><input class="input" id="gName" maxlength="40" placeholder="' + esc(k[1] || 'Our group') + '" value="' + esc(k[1]) + '" autocomplete="off"></label>' +
        '<p class="muted" style="font-size:13px;margin:-4px 0 10px">You get a code to send to the people you want in it.</p>' +
        (bring ? '<label class="switch"><span class="s-text"><b>Bring over the lists on this device</b><small>Everything already saved here moves into the group.</small></span><input type="checkbox" id="gBring" checked></label>' : '') +
        '<p class="gp-msg" id="gMsg"></p><button class="btn primary block" id="gGo">Start the group</button>',
      onMount(el) {
        const btn = $('#gGo', el), inp = $('#gName', el);
        btn.onclick = () => {
          const name = inp.value.trim() || k[1] || 'Our group';
          btn.disabled = true; btn.textContent = 'Starting…'; $('#gMsg', el).textContent = '';
          create(name, bring && $('#gBring', el).checked, '', kind || 'group').then(go, e => { btn.disabled = false; btn.textContent = 'Start the group'; $('#gMsg', el).textContent = why(e); });
        };
      }
    });
  }
  function joinSheet(code) {
    const bring = !A.space() && hasLocalLists();
    A.ui.sheet({
      title: 'Join with a code',
      html: '<label class="field"><span>The code someone in the group sent you</span><input class="input code-in" id="jCode" maxlength="14" placeholder="ABCDE-12345" autocomplete="off" autocapitalize="characters" spellcheck="false" value="' + esc(code ? pretty(cleanCode(code)) : '') + '"></label>' +
        (bring ? '<label class="switch"><span class="s-text"><b>Bring over the lists on this device</b><small>They replace the group\'s copy for the same names. Leave this off to keep the group as it is.</small></span><input type="checkbox" id="jBring"></label>' : '') +
        '<p class="gp-msg" id="jMsg"></p><button class="btn primary block" id="jGo">Join</button>',
      onMount(el) {
        const btn = $('#jGo', el), inp = $('#jCode', el);
        const run = () => {
          const id = cleanCode(inp.value);
          if (groups().some(g => g.id === id)) return switchTo(id);
          btn.disabled = true; btn.textContent = 'Joining…'; $('#jMsg', el).textContent = '';
          join(id, bring && $('#jBring', el).checked).then(go, e => { btn.disabled = false; btn.textContent = 'Join'; $('#jMsg', el).textContent = why(e); });
        };
        btn.onclick = run; inp.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
      }
    });
  }
  function invite(id, name) {
    const link = inviteLink(id), text = 'Join "' + name + '" on Under the Tree. The code is ' + pretty(id) + '.';
    const copy = () => { const t = link ? text + ' ' + link : text; (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => A.ui.toast('Invite copied. Paste it in a text or email.'), () => A.ui.toast('The code is ' + pretty(id) + '.')); };
    if (navigator.share) navigator.share(link ? { title: 'Under the Tree', text, url: link } : { title: 'Under the Tree', text }).catch(e => { if (!e || e.name !== 'AbortError') copy(); });
    else copy();
  }
  function leaveSheet(id, name) {
    A.ui.sheet({
      title: 'Leave "' + name + '"?',
      html: '<p class="muted">You will stop seeing this group on this device. Nothing is deleted: your wishes, picks and scores stay with the group, and they are all back if you join again with the code.</p>' +
        '<label class="field" style="margin-top:14px"><span>Type <b style="color:#fff">Yes, leave.</b> to leave</span><input class="input" id="lvText" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Yes, leave."></label>' +
        '<p class="gp-msg" id="lvMsg"></p><div class="row end gap"><button class="btn ghost" data-close>Stay</button><button class="btn danger" id="lvGo" disabled>Leave group</button></div>',
      onMount(el) {
        const inp = $('#lvText', el), btn = $('#lvGo', el);
        inp.oninput = () => { btn.disabled = inp.value.trim() !== 'Yes, leave.'; };
        btn.onclick = () => { btn.disabled = true; btn.textContent = 'Leaving…'; leave(id).then(go, e => { btn.disabled = false; btn.textContent = 'Leave group'; $('#lvMsg', el).textContent = why(e); }); };
      }
    });
  }
  function addPersonSheet(done) {
    A.ui.sheet({
      title: 'Add a person',
      html: '<label class="field"><span>Their name, the way the family says it</span><input class="input" id="apName" maxlength="14" autocomplete="off" autocapitalize="words" placeholder="Name"></label>' +
        '<p class="gp-msg" id="apMsg"></p><button class="btn primary block" id="apGo">Add</button>',
      onMount(el, close) {
        const inp = $('#apName', el), run = () => {
          if (A.names.length >= A.maxPeople) { $('#apMsg', el).textContent = 'A group can have up to ' + A.maxPeople + ' people.'; return; }
          const n = A.addPerson(inp.value); if (!n) { $('#apMsg', el).textContent = 'Type a name using letters or numbers.'; return; }
          close(); if (done) done(n);
        };
        $('#apGo', el).onclick = run; inp.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
        setTimeout(() => { try { inp.focus(); } catch (e) {} }, 250);
      }
    });
  }
  /* everyone in the group, with a way to add or take off a name */
  function peopleSheet() {
    const me = A.me(), org = A.lock ? A.lock.organizer() : '', boss = !org || me === org, n = A.names.length;
    const size = n <= 4 ? 78 : n <= 8 ? 66 : 56, lens = [8, 22, 12, 26, 6, 18];
    const orn = (name, i) => { const p = A.person(name), tag = name === me ? 'You' : name === org ? 'Runs this' : (A.lock && A.lock.has(name) ? 'Taken' : 'Not picked yet');
      return '<button class="orn pp-orn' + (name === me ? ' me' : '') + '" data-name="' + esc(name) + '" data-p="' + esc(name) + '" style="--size:' + size + 'px;--c1:' + p.c[0] + ';--c2:' + p.c[1] + ';--c3:' + p.c[2] + ';--len:' + lens[i % lens.length] + 'px;--dur:' + (4.2 + (i * 37 % 17) / 10).toFixed(1) + 's">' +
        '<span class="hang"><span class="thread"></span><span class="cap"></span><span class="ball"><span class="bname" style="font-size:' + Math.max(10, Math.round(size * (name.length > 6 ? 1.25 / name.length : .19))) + 'px">' + esc(name) + '</span></span><span class="olabel">' + tag + '</span></span></button>'; };
    A.ui.sheet({
      title: 'People', cls: 'pp',
      html: '<div class="pp-rail"></div><div class="pp-grid">' + A.names.map(orn).join('') + '</div>' +
        '<p class="muted pp-note">' + (org ? (boss ? 'You run this group. Tap someone to unlock their name or take them off.' : esc(org) + ' runs this group and can unlock a name or take someone off.') : 'A green dot means they have the app open.') + '</p>' +
        (A.names.length < A.maxPeople ? '<button class="mu-join" id="gpAdd" style="width:100%;margin-top:10px">' + A.icon('plus', 18) + 'Add a person</button>' : '') +
        (org && me === org && A.names.length > 1 ? '<button class="btn sm ghost block" id="gpHand" style="margin-top:8px">Let someone else run this group</button>' : ''),
      onMount(el, close) {
        const again = () => { close(); peopleSheet(); };
        const add = $('#gpAdd', el); if (add) add.onclick = () => addPersonSheet(again);
        $$('[data-p]', el).forEach(b => { b.onclick = () => {
          const who = b.dataset.p; if (!boss || who === me) return;
          const lockedNow = A.lock && A.lock.has(who);
          A.ui.sheet({ title: who,
            html: '<div class="lk-stack">' + (lockedNow ? '<button class="btn block" id="ppUn">' + A.icon('lock', 18) + 'Unlock this name</button>' : '') + '<button class="btn danger block" id="ppRm">Take ' + esc(who) + ' off the group</button></div>' +
              '<p class="muted" style="font-size:13px;margin-top:10px">' + (lockedNow ? 'Unlock when the wrong person picked the name. Whoever picks it next gets it. ' : '') + 'Taking someone off keeps their wishes, and they come back if you add the same name again.</p>',
            onMount(s2, c2) {
              const un = $('#ppUn', s2); if (un) un.onclick = () => { A.lock.reset(who); c2(); A.ui.toast('Unlocked.'); again(); };
              $('#ppRm', s2).onclick = () => { A.removePerson(who); c2(); again(); A.softRefresh(); };
            } });
        }; });
        const ho = $('#gpHand', el); if (ho) ho.onclick = () => A.ui.sheet({ title: 'Who should run this group?', html: '<p class="muted">They will be the one who can unlock names and take people off.</p><div class="gp-kinds" style="margin-top:12px">' + A.names.filter(x => x !== me).map(x => '<button class="btn" data-ho="' + esc(x) + '">' + A.ui.avatar(x, 26) + esc(x) + '</button>').join('') + '</div>',
          onMount(s2, c2) { $$('[data-ho]', s2).forEach(x => { x.onclick = () => { A.lock.handOver(x.dataset.ho); c2(); close(); A.ui.toast(x.dataset.ho + ' runs this group now.'); }; }); } });
      },
      onClose() { A.softRefresh(); }
    });
  }
  /* the other groups on this device, and starting or joining one */
  function otherGroupsSheet() {
    const cur = A.space(), others = groups().filter(g => g.id !== cur);
    A.ui.sheet({
      title: cur ? 'Your other groups' : 'Groups',
      html: (others.length ? others.map(g => '<div class="gp-row"><span class="grow"><b>' + esc(g.name) + '</b><small>' + pretty(g.id) + '</small></span><button class="btn sm" data-sw="' + g.id + '">Open</button></div>').join('')
        : '<p class="muted">' + (cur ? 'None yet. You can be in a family and a friend group at the same time.' : 'None yet.') + '</p>') +
        '<div class="gp-btns"><button class="btn" id="gpNew">' + A.icon('plus', 16) + 'Start a group</button><button class="btn" id="gpJoin">' + A.icon('users', 16) + 'Join with a code</button></div>',
      onMount(el) {
        $('#gpNew', el).onclick = () => createSheet(); $('#gpJoin', el).onclick = () => joinSheet();
        $$('[data-sw]', el).forEach(b => { b.onclick = () => switchTo(b.dataset.sw); });
      }
    });
  }
  function groupSheet() {
    const cur = A.space(), all = groups(), mine = all.find(g => g.id === cur), nOther = all.filter(g => g.id !== cur).length;
    const st = status(), stText = st === 'online' ? 'Saved online' : st === 'saving' ? 'Saving…' : 'Offline for now';
    if (!mine) {
      A.ui.sheet({
        title: 'Put this online',
        html: '<p class="muted">These lists are saved on this device and nowhere else. Start a group to put them online, so everyone can use their own phone. Nothing here gets lost.</p>' +
          '<div class="gp-big"><button class="btn primary block" id="gpNew">' + A.icon('plus', 18) + 'Start a group</button><button class="btn block" id="gpJoin">' + A.icon('users', 18) + 'Join with a code</button></div>',
        onMount(el) { $('#gpNew', el).onclick = () => createSheet(); $('#gpJoin', el).onclick = () => joinSheet(); }
      });
      return;
    }
    A.ui.sheet({
      title: mine.name, cls: 'gp',
      html: '<div class="gp-cols"><div class="gp-card"><h3>Invite code</h3><span class="gp-code">' + pretty(cur) + '</span>' +
        '<span class="gp-state' + (st === 'offline' ? '' : ' on') + '"><i></i>' + stText + '</span>' +
        '<div class="gp-btns"><button class="btn primary" id="gpInvite">' + A.icon('link', 18) + 'Send an invite</button></div></div>' +
        '<div><button class="gp-card gp-tap" id="gpPeople"><h3>People</h3><span class="gp-faces">' + A.names.map(n => A.ui.avatar(n, 30)).join('') + '</span><span class="gp-more">' + (A.online().length ? A.online().length + ' online now. ' : '') + 'Add or remove</span></button>' +
        '<div class="gp-btns gp-foot"><button class="btn sm" id="gpOther">' + A.icon('users', 16) + (nOther ? 'Other groups (' + nOther + ')' : 'Other groups') + '</button>' +
        '<button class="btn sm danger" id="gpLeave">Leave this group</button></div></div></div>',
      onMount(el, close) {
        $('#gpInvite', el).onclick = () => invite(cur, mine.name);
        $('#gpPeople', el).onclick = () => { close(); peopleSheet(); };
        $('#gpOther', el).onclick = () => otherGroupsSheet();
        $('#gpLeave', el).onclick = () => leaveSheet(cur, mine.name);
      }
    });
  }

  A.cloud = { status, synced: () => gotFirst, create, join, leave, welcome, createSheet, moreKindsSheet, joinSheet, groupSheet, peopleSheet, addPersonSheet, invite: () => { const g = groups().find(x => x.id === A.space()); if (g) invite(g.id, g.name); }, groups, pretty, inviteLink };

  /* opened from an invite link */
  A.cloud.pendingJoin = (() => { const m = /^#\/join\/([A-Za-z0-9-]+)/.exec(location.hash); if (!m) return ''; try { history.replaceState(null, '', location.pathname + location.search + '#/'); } catch (e) {} return cleanCode(m[1]); })();
  attach();
})();
