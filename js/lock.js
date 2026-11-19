/* Under the Tree — name lock.
   Picking a name ties it to that phone: nobody else can pick it, and nobody has to type anything.
   On top of that each person can add any of these, or all of them, or none:
     a PIN, a password (either one lets you be yourself on another phone), and
     Face ID or fingerprint (stands in for them on a phone where it was turned on).
   The person who runs the group can unlock a name that the wrong person picked.
   This keeps family members from taking each other's names in the app. It is not bank-grade security:
   the group itself still trusts everyone who has the invite code. */
(function () {
  'use strict';
  const A = window.App, $ = A.$, $$ = A.$$, esc = A.esc, raw = A.store.raw;
  const LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  const OFF = LOCAL && A.qs.has('nolock');                      /* test hook, this computer only */
  A.css(`
    .pin-in{text-align:center;letter-spacing:.42em;font-size:22px;font-weight:600}
    .pw-in{text-align:center;font-size:18px;font-weight:600}
    .lk-or{text-align:center;margin:10px 0;font-size:13px;color:var(--muted)}
    .lk-note{margin-top:12px;font-size:13px;color:var(--muted);text-align:center}
    .lk-stack{display:flex;flex-direction:column;gap:8px;margin-top:10px}
    .lk-seg{display:flex;gap:6px;margin-bottom:12px}
    .lk-seg button{flex:1;min-height:40px;border-radius:10px;background:var(--surface2);border:1px solid var(--line);font-weight:600;font-size:14px;color:var(--muted)}
    .lk-seg button.on{border-color:var(--gold);color:#fff}
    .lk-row{display:flex;align-items:center;gap:10px;min-height:56px;padding:8px 0}
    .lk-row+.lk-row{border-top:1px solid var(--line)}
    .lk-row .lk-ic{width:36px;height:36px;border-radius:10px;display:grid;place-items:center;background:rgba(233,196,106,.14);color:var(--gold);flex:none}
    .lk-row b{display:block;font-weight:600}
    .lk-row small{display:block;font-size:12.5px;color:var(--muted)}
    .lk-row small.set{color:#5fe3a1}
    .lk-row .btn{flex:none}
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

  /* ---------- PIN and password (saved with the group as scrambled values, never the real thing) ----------
     pins[name] = { s, h } for the PIN and { ps, ph } for the password. Either may be missing. */
  const KIND = {
    pin: { salt: 's', hash: 'h', word: 'PIN', a: 'a PIN', rule: '4 to 8 numbers', ok: v => /^[0-9]{4,8}$/.test(v), bad: 'Use 4 to 8 numbers.' },
    pw: { salt: 'ps', hash: 'ph', word: 'password', a: 'a password', rule: '6 or more letters or numbers', ok: v => v.length >= 6 && v.length <= 40, bad: 'Use 6 or more letters or numbers.' }
  };
  const pins = () => A.store.get('pins', {}) || {};
  const hasKind = (n, k) => !!(pins()[n] && pins()[n][KIND[k].hash]);
  const hasPin = n => hasKind(n, 'pin') || hasKind(n, 'pw');      /* any typed secret */
  const locked = n => hasPin(n) || (!!ownerOf(n) && !freed(n));
  const sig = p => (p && (p.h || p.ph) ? (p.h || '') + '|' + (p.ph || '') : '');
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
  const scramble = (name, salt, secret) => digest(salt + '|' + A.space() + '|' + name + '|' + secret);
  async function saveSecret(name, kind, value) {
    const K = KIND[kind], s = A.uid() + A.uid(), h = await scramble(name, s, value), p = pins(), rec = Object.assign({}, p[name]);
    rec[K.salt] = s; rec[K.hash] = h; p[name] = rec; A.store.set('pins', p); raw.set(okKey(name), sig(rec));
  }
  async function secretRight(name, kind, value) {
    const K = KIND[kind], p = pins()[name]; if (!p || !p[K.hash]) return false;
    const ok = (await scramble(name, p[K.salt], value)) === p[K.hash]; if (ok) raw.set(okKey(name), sig(p)); return ok;
  }
  const signedIn = n => { const s = sig(pins()[n]); return !!s && raw.get(okKey(n), '') === s; };
  function dropSecret(name, kind) {
    const K = KIND[kind], p = pins(), rec = Object.assign({}, p[name]); delete rec[K.salt]; delete rec[K.hash];
    if (rec.h || rec.ph) p[name] = rec; else delete p[name];
    A.store.set('pins', p); raw.set(okKey(name), sig(p[name]));
  }

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
  const field = (id, kind, label) => '<label class="field"><span>' + label + '</span><input class="input ' + (kind === 'pin' ? 'pin-in' : 'pw-in') + '" id="' + id + '" type="password"' +
    (kind === 'pin' ? ' inputmode="numeric" pattern="[0-9]*" maxlength="8"' : ' maxlength="40" autocapitalize="off" spellcheck="false"') + ' autocomplete="off"></label>';
  const other = '<button class="btn ghost block" data-notme>Pick a different name</button>';
  const helper = name => { const org = organizer(); return org && org !== name ? esc(org) + ' can unlock it from the menu, under People.' : 'Whoever runs the group can unlock it from the menu, under People.'; };
  /* make or change a PIN or a password. resolves 'ok' or null (closed). Always the person's own choice. */
  function makeSecret(name, kind) {
    const K = KIND[kind];
    return new Promise(res => {
      let out = null; const change = hasKind(name, kind);
      A.ui.sheet({
        title: (change ? 'New ' + K.word + ' for ' : 'Make ' + K.a + ' for ') + name,
        html: '<p class="muted">' + (change ? 'Pick a new one.' : 'With ' + K.a + ' you can be ' + esc(name) + ' on another phone too.') + '</p>' +
          '<div style="margin-top:12px">' + field('lk1', kind, K.word.charAt(0).toUpperCase() + K.word.slice(1) + ', ' + K.rule) + field('lk2', kind, 'Type it again') + '</div>' +
          '<p class="gp-msg" id="lkMsg"></p><div class="lk-stack"><button class="btn primary block" id="lkGo">Save</button></div>',
        onMount(el, close) {
          const a = $('#lk1', el), b = $('#lk2', el), msg = $('#lkMsg', el), go = $('#lkGo', el);
          const run = () => {
            if (!K.ok(a.value)) { msg.textContent = K.bad; return; }
            if (a.value !== b.value) { msg.textContent = 'Those two do not match.'; return; }
            go.disabled = true;
            saveSecret(name, kind, a.value).then(() => { out = 'ok'; close(); }, () => { go.disabled = false; msg.textContent = 'That did not save. Try again.'; });
          };
          go.onclick = run; b.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
          setTimeout(() => { try { a.focus(); } catch (e) {} }, 260);
        },
        onClose() { res(out); }
      });
    });
  }
  /* prove you are this name, choosing between whatever that person set up. resolves 'ok', 'notme' or null */
  const tries = {};
  function verify(name, o) {
    o = o || {};
    return new Promise(res => {
      let out = null; const face = faceOn(name), kinds = ['pin', 'pw'].filter(k => hasKind(name, k)); let kind = kinds[0] || '';
      A.ui.sheet({
        title: 'Sign in as ' + name, locked: !!o.stuck,
        html: (face ? '<button class="btn primary block" id="lkFace">' + A.icon('eye', 18) + 'Use Face ID or fingerprint</button>' + (kinds.length ? '<p class="lk-or">or</p>' : '') : '') +
          (kinds.length > 1 ? '<div class="lk-seg">' + kinds.map(k => '<button data-k="' + k + '">' + (k === 'pin' ? 'PIN' : 'Password') + '</button>').join('') + '</div>' : '') +
          '<div id="lkField"></div><p class="gp-msg" id="lkMsg"></p>' +
          '<div class="lk-stack">' + (kinds.length ? '<button class="btn ' + (face ? '' : 'primary ') + 'block" id="lkGo">Sign in</button>' : '') + (o.stuck ? other : '') + '</div>' +
          '<p class="lk-note">Forgot it? ' + helper(name) + '</p>',
        onMount(el, close) {
          const msg = $('#lkMsg', el), go = $('#lkGo', el), box = $('#lkField', el), t = tries[name] = tries[name] || { n: 0, until: 0 };
          const show = k => { kind = k; if (!k) return; box.innerHTML = field('lkP', k, (k === 'pin' ? 'PIN' : 'Password') + ' for ' + esc(name)); $$('.lk-seg button', el).forEach(b => b.classList.toggle('on', b.dataset.k === k)); msg.textContent = '';
            $('#lkP', el).addEventListener('keydown', e => { if (e.key === 'Enter') run(); }); };
          const run = () => {
            const inp = $('#lkP', el), wait = Math.ceil((t.until - Date.now()) / 1000);
            if (wait > 0) { msg.textContent = 'Too many tries. Wait ' + wait + ' seconds.'; return; }
            if (!inp.value) { msg.textContent = 'Type the ' + KIND[kind].word + '.'; return; }
            go.disabled = true;
            secretRight(name, kind, inp.value).then(ok => {
              go.disabled = false;
              if (ok) { t.n = 0; out = 'ok'; close(); return; }
              t.n++; inp.value = ''; if (t.n >= 5) { t.n = 0; t.until = Date.now() + 30000; }
              msg.textContent = t.until > Date.now() ? 'Too many tries. Wait 30 seconds.' : 'That is not right.';
            });
          };
          show(kind);
          $$('.lk-seg button', el).forEach(b => { b.onclick = () => show(b.dataset.k); });
          if (go) go.onclick = run;
          const fb = $('#lkFace', el); if (fb) fb.onclick = () => faceCheck(name).then(ok => { if (ok) { raw.set(okKey(name), sig(pins()[name])); out = 'ok'; close(); } }, () => { msg.textContent = kinds.length ? 'That did not work. Use the other way.' : 'That did not work. Try again.'; });
          const nm = $('[data-notme]', el); if (nm) nm.onclick = () => { out = 'notme'; close(); };
          if (kinds.length && !face) setTimeout(() => { try { $('#lkP', el).focus(); } catch (e) {} }, 260);
        },
        onClose() { res(out); }
      });
    });
  }
  /* the name belongs to another phone and has no PIN or password: it cannot be used here */
  function taken(name, o) {
    o = o || {};
    return new Promise(res => {
      let out = null;
      A.ui.sheet({
        title: name + ' is taken', locked: !!o.stuck,
        html: '<p class="muted">' + esc(name) + ' is already being used on another phone. If that is you, add a PIN or a password on that phone (menu, then Sign-in options) and type it here.</p>' +
          '<p class="muted" style="margin-top:8px">Picked by the wrong person? ' + helper(name) + '</p>' +
          '<div class="lk-stack">' + (o.stuck ? other : '<button class="btn primary block" data-close>OK</button>') + '</div>',
        onMount(el, close) { const nm = $('[data-notme]', el); if (nm) nm.onclick = () => { out = 'notme'; close(); }; },
        onClose() { res(out); }
      });
    });
  }
  /* every way to sign in, in one place. Each one is optional. */
  function optionsSheet() {
    const me = A.me(); if (!me) return;
    const row = (icon, title, sub, set, btns) => '<div class="lk-row"><span class="lk-ic">' + A.icon(icon, 20) + '</span><span class="grow"><b>' + title + '</b><small' + (set ? ' class="set"' : '') + '>' + sub + '</small></span>' + btns + '</div>';
    const two = k => hasKind(me, k) ? '<button class="btn sm" data-add="' + k + '">Change</button><button class="btn sm ghost" data-del="' + k + '">Remove</button>' : '<button class="btn sm primary" data-add="' + k + '">Add</button>';
    A.ui.sheet({
      title: 'Sign-in options',
      html: '<p class="muted">' + esc(me) + ' is tied to ' + (mine(me) ? 'this phone' : 'another phone') + ', so nobody else can pick it. Add any of these, all of them, or none.</p>' +
        '<div style="margin-top:8px">' +
        row('lock', 'PIN', hasKind(me, 'pin') ? 'On. Works on any phone.' : KIND.pin.rule, hasKind(me, 'pin'), two('pin')) +
        row('pencil', 'Password', hasKind(me, 'pw') ? 'On. Works on any phone.' : KIND.pw.rule, hasKind(me, 'pw'), two('pw')) +
        row('eye', 'Face ID or fingerprint', faceOn(me) ? 'On, for this phone.' : 'For this phone only.', faceOn(me), '<button class="btn sm' + (faceOn(me) ? ' ghost' : ' primary') + '" id="lkFaceSw" hidden>' + (faceOn(me) ? 'Turn off' : 'Turn on') + '</button><small id="lkNoFace">Checking…</small>') +
        row('link', 'Code by email or text', 'Needs real accounts. Not available yet.', false, '') +
        '</div><p class="gp-msg" id="lkMsg"></p>',
      onMount(el, close) {
        const again = () => { close(); optionsSheet(); }, msg = $('#lkMsg', el);
        $$('[data-add]', el).forEach(b => { b.onclick = () => makeSecret(me, b.dataset.add).then(r => { if (r === 'ok') { A.ui.toast('Saved.'); again(); } }); });
        $$('[data-del]', el).forEach(b => { b.onclick = () => {
          const k = b.dataset.del, lastOne = !hasKind(me, k === 'pin' ? 'pw' : 'pin');
          if (lastOne && !mine(me)) { msg.textContent = 'Keep one of these on this phone, because ' + me + ' belongs to another phone.'; return; }
          dropSecret(me, k); A.ui.toast('Removed.'); again();
        }; });
        const fs = $('#lkFaceSw', el), nf = $('#lkNoFace', el);
        faceReady().then(ok => {
          if (!ok) { nf.textContent = 'Not on this phone'; return; }
          nf.remove(); fs.hidden = false;
          fs.onclick = () => { if (faceOn(me)) { raw.del(faceKey(me)); again(); } else faceSetup(me).then(() => { A.ui.toast('Done. This phone can sign you in.'); again(); }, () => { msg.textContent = 'That did not turn on.'; }); };
        });
      }
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
  /* signing in on someone else's phone only lasts until that phone switches to another name */
  let lastMe = A.me();
  A.on('me', n => { if (lastMe && lastMe !== n && !mine(lastMe)) raw.del(okKey(lastMe)); lastMe = n; setTimeout(ensure, 300); });
  A.on('sync', keys => { if (keys.indexOf('pins') >= 0 || keys.indexOf('owners') >= 0) setTimeout(ensure, 300); });

  A.lock = {
    has: locked, hasPin, choose, ensure, organizer, faceReady, faceOn, optionsSheet,
    on: () => !OFF && !!A.space(),
    summary() { const me = A.me(); if (!me) return ''; const on = [hasKind(me, 'pin') ? 'PIN' : '', hasKind(me, 'pw') ? 'password' : '', faceOn(me) ? 'Face ID' : ''].filter(Boolean); return on.length ? on.join(', ') + ' on' : 'PIN, password, Face ID'; },
    /* whoever runs the group lets a name go: its PIN and password are cleared and the next person to pick it gets it */
    reset(name) { const p = pins(), o = owners(); delete p[name]; o[name] = 'free:' + Date.now(); A.store.set('pins', p); A.store.set('owners', o); },
    handOver(name) { if (A.names.indexOf(name) >= 0) A.store.set('organizer', name); },
    changePin() { optionsSheet(); }
  };
})();
