/* Under the Tree — name lock.
   Picking a name ties it to that phone: nobody else can pick it, and nobody has to type anything.
   A PIN is optional. It lets you use your name on a second phone, or sign in as yourself on someone
   else's. Face ID or fingerprint is optional too, and stands in for the PIN on a phone where it was
   turned on. The person who runs the group can unlock a name that the wrong person picked.
   This keeps family members from taking each other's names in the app. It is not bank-grade security:
   the group itself still trusts everyone who has the invite code. */
(function () {
  'use strict';
  const A = window.App, $ = A.$, esc = A.esc, raw = A.store.raw;
  const LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  const OFF = LOCAL && A.qs.has('nolock');                      /* test hook, this computer only */
  A.css(`
    .pin-in{text-align:center;letter-spacing:.42em;font-size:22px;font-weight:600}
    .lk-or{text-align:center;margin:10px 0;font-size:13px;color:var(--muted)}
    .lk-note{margin-top:12px;font-size:13px;color:var(--muted);text-align:center}
    .lk-stack{display:flex;flex-direction:column;gap:8px;margin-top:10px}
    .who-btn{position:relative}
    .who-lock{position:absolute;right:8px;top:8px;color:var(--gold);display:grid}
  `);

  /* ---------- which phone a name belongs to ---------- */
  const dev = (() => { let d = raw.get('dev', ''); if (!d) { d = A.uid() + A.uid(); raw.set('dev', d); } return d; })();
  const owners = () => A.store.get('owners', {}) || {};
  const ownerOf = n => { const o = owners()[n]; return typeof o === 'string' ? o : ''; };
  const freed = n => ownerOf(n).indexOf('free:') === 0;         /* unlocked on purpose by whoever runs the group */
  const mine = n => ownerOf(n) === dev;
  const organizer = () => { const o = A.store.get('organizer', ''); return typeof o === 'string' && A.names.indexOf(o) >= 0 ? o : ''; };
  function claim(name) {
    const o = owners(); o[name] = dev; A.store.set('owners', o);
    if (!organizer()) A.store.set('organizer', name);            /* the first person to pick a name runs the group */
  }

  /* ---------- PINs (saved with the group as a scrambled value, never the PIN itself) ---------- */
  const pins = () => A.store.get('pins', {}) || {};
  const hasPin = n => !!(pins()[n] && pins()[n].h);
  const locked = n => hasPin(n) || (!!ownerOf(n) && !freed(n));
  const okKey = n => A.store.key('ok:' + n), faceKey = n => A.store.key('fid:' + n);
  async function digest(text) {
    if (window.crypto && crypto.subtle) {
      const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return Array.from(new Uint8Array(b), x => x.toString(16).padStart(2, '0')).join('');
    }
    let h1 = 2166136261, h2 = 5381;                              /* very old browsers only */
    for (let i = 0; i < text.length; i++) { const c = text.charCodeAt(i); h1 = Math.imul(h1 ^ c, 16777619); h2 = (Math.imul(h2, 33) + c) | 0; }
    return 'x' + (h1 >>> 0).toString(16) + (h2 >>> 0).toString(16);
  }
  const scramble = (name, salt, pin) => digest(salt + '|' + A.space() + '|' + name + '|' + pin);
  async function savePin(name, pin) { const s = A.uid() + A.uid(), h = await scramble(name, s, pin), p = pins(); p[name] = { s, h }; A.store.set('pins', p); raw.set(okKey(name), h); }
  async function pinRight(name, pin) { const p = pins()[name]; if (!p) return false; const ok = (await scramble(name, p.s, pin)) === p.h; if (ok) raw.set(okKey(name), p.h); return ok; }
  const signedIn = n => { const p = pins()[n]; return !!p && raw.get(okKey(n), '') === p.h; };
  const validPin = v => /^[0-9]{4,8}$/.test(v);

  /* ---------- Face ID / fingerprint, on this phone only ---------- */
  const b64 = buf => btoa(String.fromCharCode.apply(null, new Uint8Array(buf))), unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const rnd = n => crypto.getRandomValues(new Uint8Array(n));
  async function faceReady() { try { return !!(window.isSecureContext && window.PublicKeyCredential && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()); } catch (e) { return false; } }
  const faceOn = n => !!raw.get(faceKey(n), '');
  async function faceSetup(name) {
    const cred = await navigator.credentials.create({ publicKey: {
      challenge: rnd(32), rp: { name: 'Under the Tree' }, user: { id: rnd(16), name: 'Under the Tree: ' + name, displayName: name },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
      authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'discouraged' }, timeout: 60000, attestation: 'none' } });
    raw.set(faceKey(name), b64(cred.rawId));
  }
  async function faceCheck(name) {
    const id = raw.get(faceKey(name), ''); if (!id) return false;
    await navigator.credentials.get({ publicKey: { challenge: rnd(32), allowCredentials: [{ type: 'public-key', id: unb64(id) }], userVerification: 'required', timeout: 60000 } });
    return true;
  }

  /* ---------- sheets ---------- */
  const pinField = (id, label) => '<label class="field"><span>' + label + '</span><input class="input pin-in" id="' + id + '" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="8" autocomplete="off"></label>';
  const other = '<button class="btn ghost block" data-notme>Pick a different name</button>';
  const helper = name => { const org = organizer(); return org && org !== name ? esc(org) + ' can unlock it from the menu, under People.' : 'Whoever runs the group can unlock it from the menu, under People.'; };
  /* make or change a PIN. resolves 'ok' or null (closed). Always the person's own choice. */
  function makePin(name) {
    return new Promise(res => {
      let out = null; const change = hasPin(name);
      A.ui.sheet({
        title: change ? 'New PIN for ' + name : 'Make a PIN for ' + name,
        html: '<p class="muted">' + (change ? 'Pick a new PIN.' : 'With a PIN you can be ' + esc(name) + ' on another phone too. Without one, ' + esc(name) + ' only works on this phone.') + '</p>' +
          '<div style="margin-top:12px">' + pinField('lk1', 'PIN, 4 to 8 numbers') + pinField('lk2', 'Type it again') + '</div>' +
          '<p class="gp-msg" id="lkMsg"></p><div class="lk-stack"><button class="btn primary block" id="lkGo">Save my PIN</button></div>',
        onMount(el, close) {
          const a = $('#lk1', el), b = $('#lk2', el), msg = $('#lkMsg', el), go = $('#lkGo', el);
          const run = () => {
            if (!validPin(a.value)) { msg.textContent = 'Use 4 to 8 numbers.'; return; }
            if (a.value !== b.value) { msg.textContent = 'Those two do not match.'; return; }
            go.disabled = true;
            savePin(name, a.value).then(() => { out = 'ok'; close(); }, () => { go.disabled = false; msg.textContent = 'That did not save. Try again.'; });
          };
          go.onclick = run; b.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
          setTimeout(() => { try { a.focus(); } catch (e) {} }, 260);
        },
        onClose() { res(out); }
      });
    });
  }
  /* prove you are this name, with whichever way is set up. resolves 'ok', 'notme' or null (closed) */
  const tries = {};
  function verify(name, o) {
    o = o || {};
    return new Promise(res => {
      let out = null; const face = faceOn(name), pin = hasPin(name);
      A.ui.sheet({
        title: 'Sign in as ' + name, locked: !!o.stuck,
        html: (face ? '<button class="btn primary block" id="lkFace">' + A.icon('eye', 18) + 'Use Face ID or fingerprint</button>' + (pin ? '<p class="lk-or">or use the PIN</p>' : '') : '') +
          (pin ? pinField('lkP', 'PIN for ' + esc(name)) + '<p class="gp-msg" id="lkMsg"></p>' : '<p class="gp-msg" id="lkMsg"></p>') +
          '<div class="lk-stack">' + (pin ? '<button class="btn ' + (face ? '' : 'primary ') + 'block" id="lkGo">Sign in</button>' : '') + (o.stuck ? other : '') + '</div>' +
          '<p class="lk-note">Forgot it? ' + helper(name) + '</p>',
        onMount(el, close) {
          const inp = $('#lkP', el), msg = $('#lkMsg', el), go = $('#lkGo', el), t = tries[name] = tries[name] || { n: 0, until: 0 };
          const run = () => {
            const wait = Math.ceil((t.until - Date.now()) / 1000);
            if (wait > 0) { msg.textContent = 'Too many tries. Wait ' + wait + ' seconds.'; return; }
            if (!validPin(inp.value)) { msg.textContent = 'Type the PIN.'; return; }
            go.disabled = true;
            pinRight(name, inp.value).then(ok => {
              go.disabled = false;
              if (ok) { t.n = 0; out = 'ok'; close(); return; }
              t.n++; inp.value = ''; if (t.n >= 5) { t.n = 0; t.until = Date.now() + 30000; }
              msg.textContent = t.until > Date.now() ? 'Too many tries. Wait 30 seconds.' : 'That is not the PIN.';
            });
          };
          if (go) { go.onclick = run; inp.addEventListener('keydown', e => { if (e.key === 'Enter') run(); }); }
          const fb = $('#lkFace', el); if (fb) fb.onclick = () => faceCheck(name).then(ok => { if (ok) { const p = pins()[name]; if (p) raw.set(okKey(name), p.h); out = 'ok'; close(); } }, () => { msg.textContent = pin ? 'That did not work. Use the PIN.' : 'That did not work. Try again.'; });
          const nm = $('[data-notme]', el); if (nm) nm.onclick = () => { out = 'notme'; close(); };
          if (pin && !face) setTimeout(() => { try { inp.focus(); } catch (e) {} }, 260);
        },
        onClose() { res(out); }
      });
    });
  }
  /* the name belongs to another phone and has no PIN: it cannot be used here */
  function taken(name, o) {
    o = o || {};
    return new Promise(res => {
      let out = null;
      A.ui.sheet({
        title: name + ' is taken', locked: !!o.stuck,
        html: '<p class="muted">' + esc(name) + ' is already being used on another phone. If that is you, make a PIN on that phone (menu, then PIN and Face ID) and type it here.</p>' +
          '<p class="muted" style="margin-top:8px">Picked by the wrong person? ' + helper(name) + '</p>' +
          '<div class="lk-stack">' + (o.stuck ? other : '<button class="btn primary block" data-close>OK</button>') + '</div>',
        onMount(el, close) { const nm = $('[data-notme]', el); if (nm) nm.onclick = () => { out = 'notme'; close(); }; },
        onClose() { res(out); }
      });
    });
  }

  /* someone tapped a name: let them be that person only if it is really theirs */
  function choose(name) {
    if (OFF || !A.space()) return Promise.resolve(true);
    /* your own phone lets you back in, unless you turned on Face ID for exactly this */
    if ((mine(name) || signedIn(name)) && !faceOn(name)) return Promise.resolve(true);
    if (hasPin(name) || faceOn(name)) return verify(name).then(r => r === 'ok');
    if (ownerOf(name) && !freed(name)) return taken(name).then(() => false);
    claim(name); return Promise.resolve(true);                    /* nobody has it: it is yours, nothing to type */
  }
  /* on opening the app: the name this phone uses must really belong to it */
  let checking = false;
  function ensure() {
    if (OFF || checking || !A.space() || !A.cloud || !A.cloud.synced()) return;
    const me = A.me(); if (!me || A.names.indexOf(me) < 0) return;
    if (mine(me) || signedIn(me)) return;
    if (!ownerOf(me) && !hasPin(me)) { claim(me); return; }      /* from before names were locked: it becomes this phone's */
    if (A.ui.sheetOpen()) { setTimeout(ensure, 1500); return; }
    if (freed(me) && !hasPin(me)) { A.clearMe(); A.ui.who(true); A.ui.toast(me + ' was unlocked. Pick your name again.'); return; }
    checking = true;
    (hasPin(me) ? verify(me, { stuck: true }) : taken(me, { stuck: true })).then(r => {
      checking = false;
      if (r === 'notme') { A.clearMe(); A.ui.who(true); }
      else if (r !== 'ok') setTimeout(ensure, 400);
    });
  }
  A.on('cloud', ensure);
  /* signing in with a PIN on someone else's phone only lasts until that phone switches to another name */
  let lastMe = A.me();
  A.on('me', n => { if (lastMe && lastMe !== n && !mine(lastMe)) raw.del(okKey(lastMe)); lastMe = n; setTimeout(ensure, 300); });
  A.on('sync', keys => { if (keys.indexOf('pins') >= 0 || keys.indexOf('owners') >= 0) setTimeout(ensure, 300); });

  A.lock = {
    has: locked, hasPin, choose, ensure, organizer, faceReady, faceOn,
    on: () => !OFF && !!A.space(),
    /* whoever runs the group lets a name go: its PIN is cleared and the next person to pick it gets it */
    reset(name) { const p = pins(), o = owners(); delete p[name]; o[name] = 'free:' + Date.now(); A.store.set('pins', p); A.store.set('owners', o); },
    handOver(name) { if (A.names.indexOf(name) >= 0) A.store.set('organizer', name); },
    changePin() { const me = A.me(); if (!me) return; (hasPin(me) && !mine(me) ? verify(me) : Promise.resolve('ok')).then(r => { if (r === 'ok') makePin(me).then(x => { if (x === 'ok') A.ui.toast('PIN saved.'); }); }); },
    removePin() { const me = A.me(), p = pins(); if (!me || !p[me]) return; delete p[me]; A.store.set('pins', p); if (!mine(me)) claim(me); },
    faceToggle() { const me = A.me(); if (!me) return Promise.resolve(false); if (faceOn(me)) { raw.del(faceKey(me)); return Promise.resolve(false); } return faceSetup(me).then(() => true); }
  };
})();
