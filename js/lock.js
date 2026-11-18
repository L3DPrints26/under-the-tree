/* Under the Tree — name lock.
   Once someone picks their name it is theirs: they make a PIN for it, and using that name on another
   phone, or switching back to it, needs the PIN (or Face ID / fingerprint on a phone where they turned
   that on). The person who started the group is the organizer and can reset a forgotten PIN.
   This keeps family members from picking each other's names in the app. It is not bank-grade security:
   the group itself still trusts everyone who has the invite code. */
(function () {
  'use strict';
  const A = window.App, $ = A.$, esc = A.esc, raw = A.store.raw;
  const LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) || location.protocol === 'file:';
  const OFF = LOCAL && A.qs.has('nolock');                      /* test hook, local only */
  A.css(`
    .pin-in{text-align:center;letter-spacing:.42em;font-size:22px;font-weight:600}
    .lk-or{text-align:center;margin:10px 0;font-size:13px;color:var(--muted)}
    .lk-note{margin-top:12px;font-size:13px;color:var(--muted);text-align:center}
    .lk-stack{display:flex;flex-direction:column;gap:8px;margin-top:10px}
    .who-btn{position:relative}
    .who-lock{position:absolute;right:8px;top:8px;color:var(--gold);display:grid}
  `);

  /* ---------- PINs (saved with the group as a scrambled value, never the PIN itself) ---------- */
  const pins = () => A.store.get('pins', {}) || {};
  const has = n => !!(pins()[n] && pins()[n].h);
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
  async function savePin(name, pin) {
    const s = A.uid() + A.uid(), h = await scramble(name, s, pin), p = pins();
    p[name] = { s, h }; A.store.set('pins', p); raw.set(okKey(name), h);
    if (!organizer()) A.store.set('organizer', name);            /* whoever locks a name first runs the group */
  }
  async function pinRight(name, pin) { const p = pins()[name]; if (!p) return false; const ok = (await scramble(name, p.s, pin)) === p.h; if (ok) raw.set(okKey(name), p.h); return ok; }
  const organizer = () => { const o = A.store.get('organizer', ''); return typeof o === 'string' && A.names.indexOf(o) >= 0 ? o : ''; };
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
    const p = pins()[name]; if (p) raw.set(okKey(name), p.h);
    return true;
  }

  /* ---------- sheets ---------- */
  const pinField = (id, label) => '<label class="field"><span>' + label + '</span><input class="input pin-in" id="' + id + '" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="8" autocomplete="off"></label>';
  const notMe = name => '<button class="btn ghost block" data-notme>I am not ' + esc(name) + '</button>';
  /* make a PIN for a name. resolves 'ok', 'notme' or null (closed) */
  function protect(name, o) {
    o = o || {};
    return new Promise(res => {
      let out = null;
      A.ui.sheet({
        title: (o.change ? 'New PIN for ' : 'Make a PIN for ') + name, locked: !!o.stuck,
        html: '<p class="muted">' + (o.change ? 'Pick a new PIN.' : 'This PIN makes ' + esc(name) + ' yours. You will need it to be ' + esc(name) + ' on another phone, or to switch back on this one.') + '</p>' +
          '<div style="margin-top:12px">' + pinField('lk1', 'PIN, 4 to 8 numbers') + pinField('lk2', 'Type it again') + '</div>' +
          '<p class="gp-msg" id="lkMsg"></p><div class="lk-stack"><button class="btn primary block" id="lkGo">Save my PIN</button>' + (o.stuck ? notMe(name) : '') + '</div>',
        onMount(el, close) {
          const a = $('#lk1', el), b = $('#lk2', el), msg = $('#lkMsg', el), go = $('#lkGo', el);
          const run = () => {
            if (!validPin(a.value)) { msg.textContent = 'Use 4 to 8 numbers.'; return; }
            if (a.value !== b.value) { msg.textContent = 'Those two do not match.'; return; }
            go.disabled = true;
            savePin(name, a.value).then(() => { out = 'ok'; close(); }, () => { go.disabled = false; msg.textContent = 'That did not save. Try again.'; });
          };
          go.onclick = run; b.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
          const nm = $('[data-notme]', el); if (nm) nm.onclick = () => { out = 'notme'; close(); };
          setTimeout(() => { try { a.focus(); } catch (e) {} }, 260);
        },
        onClose() { res(out); if (out === 'ok') offerFace(name); }
      });
    });
  }
  /* prove you are this name. resolves 'ok', 'notme' or null (closed) */
  const tries = {};
  function verify(name, o) {
    o = o || {};
    return new Promise(res => {
      let out = null; const org = organizer(), face = faceOn(name);
      A.ui.sheet({
        title: 'Sign in as ' + name, locked: !!o.stuck,
        html: (face ? '<button class="btn primary block" id="lkFace">' + A.icon('eye', 18) + 'Use Face ID or fingerprint</button><p class="lk-or">or use the PIN</p>' : '') +
          pinField('lkP', 'PIN for ' + esc(name)) + '<p class="gp-msg" id="lkMsg"></p>' +
          '<div class="lk-stack"><button class="btn ' + (face ? '' : 'primary ') + 'block" id="lkGo">Sign in</button>' + (o.stuck ? notMe(name) : '') + '</div>' +
          '<p class="lk-note">Forgot it? ' + (org && org !== name ? esc(org) + ' can reset it from Group, People.' : 'The person who started the group can reset it.') + '</p>',
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
          go.onclick = run; inp.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
          const fb = $('#lkFace', el); if (fb) fb.onclick = () => faceCheck(name).then(ok => { if (ok) { out = 'ok'; close(); } }, () => { msg.textContent = 'That did not work. Use the PIN.'; });
          const nm = $('[data-notme]', el); if (nm) nm.onclick = () => { out = 'notme'; close(); };
          if (!face) setTimeout(() => { try { inp.focus(); } catch (e) {} }, 260);
        },
        onClose() { res(out); }
      });
    });
  }
  function offerFace(name) {
    faceReady().then(ok => {
      if (!ok || faceOn(name)) return;
      A.ui.confirm('Use Face ID or fingerprint to sign in as ' + name + ' on this phone?', 'Turn it on').then(yes => { if (yes) faceSetup(name).then(() => A.ui.toast('Done. This phone can sign you in.'), () => A.ui.toast('That did not turn on. Your PIN still works.')); });
    });
  }

  /* someone tapped a name: let them be that person only if it is really theirs */
  function choose(name) {
    if (OFF || !A.space()) return Promise.resolve(true);
    return (has(name) ? verify(name) : protect(name)).then(r => r === 'ok');
  }
  /* on opening the app: the name this phone uses must be locked, and locked by this phone's owner */
  let checking = false;
  function ensure() {
    if (OFF || checking || !A.space() || !A.cloud || !A.cloud.synced()) return;
    const me = A.me(); if (!me) return;
    const p = pins()[me]; if (p && raw.get(okKey(me), '') === p.h) return;
    if (A.ui.sheetOpen()) { setTimeout(ensure, 1500); return; }
    checking = true;
    (p ? verify(me, { stuck: true }) : protect(me, { stuck: true })).then(r => {
      checking = false;
      if (r === 'notme') { A.clearMe(); A.ui.who(true); }
      else if (r !== 'ok') setTimeout(ensure, 400);
    });
  }
  A.on('cloud', ensure);
  A.on('me', () => setTimeout(ensure, 300));
  A.on('sync', keys => { if (keys.indexOf('pins') >= 0) setTimeout(ensure, 300); });

  A.lock = {
    has, choose, ensure, organizer, faceReady, faceOn,
    on: () => !OFF && !!A.space(),
    reset(name) { const p = pins(); if (!p[name]) return; delete p[name]; A.store.set('pins', p); },
    changePin() { const me = A.me(); if (!me) return; (has(me) ? verify(me) : Promise.resolve('ok')).then(r => { if (r === 'ok') protect(me, { change: true }).then(x => { if (x === 'ok') A.ui.toast('PIN changed.'); }); }); },
    faceToggle() { const me = A.me(); if (!me) return Promise.resolve(false); if (faceOn(me)) { raw.del(faceKey(me)); return Promise.resolve(false); } return faceSetup(me).then(() => true); }
  };
})();
