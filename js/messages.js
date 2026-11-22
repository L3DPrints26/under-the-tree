/* Under the Tree: messages about gifts.
   "I am getting Max the blue headphones." Sent to one person or several, never to the person the gift is for,
   so nobody buys the same thing twice. This replaces "My picks" (which is still in the code, switched off with
   A.features.picks in lists.js).
   Saved with the group under "msgs": { toName: { id: { f: from, w: gift is for, s: getting|bought, t: what, at: time } } }.
   One short line of text, nothing else: no photos, no links, no chat. A message from someone you hid is not shown. */
(function () {
  'use strict';
  const A = window.App, $ = A.$, $$ = A.$$, esc = A.esc;
  const KEY = 'msgs', MAX_T = 60, KEEP = 400 * 864e5;
  const all = () => { const v = A.store.get(KEY, null); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; };
  const icon = () => (A.icons && A.icons.advChat ? 'advChat' : 'list');
  const hidden = n => !!(A.safety && A.safety.hiddenPerson && A.safety.hiddenPerson(n));
  const clean = s => String(s || '').replace(/[\u0000-\u001f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, MAX_T);
  const seen = () => +A.store.raw.get('msgSeen', 0) || 0;

  /* what other phones saved is checked before it is shown */
  const good = (m, me) => m && typeof m === 'object' && A.names.indexOf(m.f) >= 0 && A.names.indexOf(m.w) >= 0 && m.w !== me && m.f !== me && !hidden(m.f) &&
    (m.s === 'getting' || m.s === 'bought') && typeof m.t === 'string' && typeof m.at === 'number' && Date.now() - m.at < KEEP;
  function mine() {
    const me = A.me(), box = all()[me] || {}, out = [];
    if (!me || !A.names.length) return out;
    Object.keys(box).forEach(id => { const m = box[id]; if (good(m, me)) out.push({ id: id, f: m.f, w: m.w, s: m.s, t: m.t.slice(0, MAX_T), at: m.at }); });
    return out.sort((a, b) => b.at - a.at);
  }
  const unread = () => mine().filter(m => m.at > seen()).length;
  function sent() {
    const me = A.me(), box = all(), by = {};
    Object.keys(box).forEach(to => Object.keys(box[to] || {}).forEach(id => {
      const m = box[to][id];
      if (m && m.f === me && typeof m.t === 'string') { const g = by[id] || (by[id] = { id: id, w: m.w, s: m.s, t: m.t.slice(0, MAX_T), at: m.at || 0, to: [] }); g.to.push(to); }
    }));
    return Object.keys(by).map(k => by[k]).sort((a, b) => b.at - a.at);
  }
  function send(w, t, s, to) {
    const me = A.me(), box = all(), id = A.uid(), at = Date.now();
    to.forEach(n => { (box[n] = box[n] || {})[id] = { f: me, w: w, s: s, t: t, at: at }; });
    A.store.set(KEY, box);
  }
  function takeBack(id) {
    const me = A.me(), box = all();
    Object.keys(box).forEach(to => { if (box[to] && box[to][id] && box[to][id].f === me) delete box[to][id]; });
    A.store.set(KEY, box);
  }
  const names = l => l.length < 3 ? l.join(' and ') : l.slice(0, -1).join(', ') + ' and ' + l[l.length - 1];
  const verb = s => (s === 'bought' ? ' already got ' : ' is getting ');
  const when = at => { const d = new Date(at); return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ', ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }); };

  A.css(`
    .mg-h{margin:14px 0 8px;font-size:13px;font-weight:700;color:var(--muted)}
    .mg-h:first-child{margin-top:0}
    .mg-who{display:flex;flex-wrap:wrap;gap:8px}
    .mg-p{display:flex;align-items:center;gap:8px;min-height:44px;padding:5px 12px 5px 6px;border-radius:999px;background:var(--surface2);border:1.5px solid var(--line2);font-weight:600;font-size:14.5px;color:#fff}
    .mg-p.on{border-color:var(--gold);background:rgba(233,196,106,.16)}
    .mg-wishes{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 2px}
    .mg-w{max-width:100%;padding:6px 11px;border-radius:999px;background:var(--surface2);border:1px solid var(--line2);font-size:13px;font-weight:600;color:#dbe6f4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .mg-seg{display:flex;gap:6px;margin:12px 0 0}
    .mg-seg button{flex:1;min-height:42px;border-radius:12px;background:var(--surface2);border:1.5px solid var(--line2);font-weight:600;font-size:14px;color:var(--muted)}
    .mg-seg button.on{background:var(--gold);border-color:var(--gold);color:var(--gold-ink)}
    .mg-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--line)}
    .mg-row.new{background:linear-gradient(90deg,rgba(233,196,106,.14),transparent);margin:0 -6px;padding-left:6px;border-radius:10px}
    .mg-row .grow{flex:1;min-width:0}
    .mg-row p{margin:0;font-size:15px;line-height:1.35}
    .mg-row small{display:block;margin-top:2px;color:var(--muted);font-size:12.5px}
    .mg-sec{margin:18px 0 4px;font-size:13px;font-weight:700;color:var(--gold)}
    /* the rows added to the menus */
    .who-quiz{display:flex;align-items:center;gap:12px;width:100%;min-height:62px;margin-top:10px;padding:10px 14px;border-radius:16px;text-align:left;color:#fff;background:linear-gradient(90deg,#d9304a,#9c1830);border:1px solid rgba(255,160,170,.45)}
    .who-quiz>svg{flex:none;color:#ffd6dc}
    .who-quiz>span{flex:1;min-width:0}.who-quiz b{display:block;font-weight:700}.who-quiz small{display:block;font-size:12.5px;color:#ffe3e6}
    .who-quiz>i{flex:none;font-style:normal;font-weight:800;font-size:13px;padding:6px 12px;border-radius:999px;background:var(--gold);color:var(--gold-ink)}
    .who-quiz.who-msg{background:linear-gradient(90deg,#2a62c9,#16356f);border-color:rgba(150,190,255,.45)}
    .who-quiz.who-msg>svg{color:#cfe0ff}.who-quiz.who-msg small{color:#dbe8ff}
    .me-badge{display:inline-grid;place-items:center;min-width:18px;height:18px;margin-left:4px;padding:0 5px;border-radius:9px;background:#e8404f;color:#fff;font-style:normal;font-size:11px;font-weight:800}
    .set-more{display:flex;flex-direction:column;gap:6px;margin-top:6px}
    .set-row{display:flex;align-items:center;gap:12px;width:100%;min-height:50px;padding:8px 14px;border-radius:14px;text-align:left;background:var(--surface2);border:1px solid var(--line);font-weight:600;color:#fff}
    .set-row>svg{flex:none;color:var(--gold)}.set-row>span{flex:1;min-width:0}
    .set-row em{font-style:normal;font-weight:800;font-size:11.5px;padding:3px 9px;border-radius:999px;background:var(--gold);color:var(--gold-ink)}
    .mu-pair{display:flex;gap:8px;margin-top:12px}
    .mu-small{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;min-height:46px;padding:0 10px;border-radius:14px;border:1.5px dashed var(--line2);font-weight:600;font-size:14px;color:#dbe6f4}
    .fx-pill{gap:6px}
    button.gm-tile{text-align:left;color:inherit;font:inherit;padding:0}
    .ab-hero{display:flex;align-items:center;gap:14px;width:100%;min-height:84px;margin:0 0 14px;padding:14px 16px;border-radius:20px;text-align:left;color:#fff;background:linear-gradient(100deg,#e0344e,#8f1329);border:2px solid rgba(255,205,210,.65);box-shadow:0 8px 22px rgba(0,0,0,.35);animation:ab-glow 2.6s ease-in-out infinite}
    .ab-hero>svg{flex:none;color:#ffd6dc}
    .ab-hero>span{flex:1;min-width:0}.ab-hero b{display:block;font-family:var(--display);font-size:clamp(19px,5.5vw,23px);font-weight:600;line-height:1.15}
    .ab-hero small{display:block;margin-top:3px;font-size:13.5px;color:#ffe3e6}
    .ab-hero>i{flex:none;font-style:normal;font-weight:800;font-size:14px;padding:8px 15px;border-radius:999px;background:var(--gold);color:var(--gold-ink)}
    @keyframes ab-glow{0%,100%{box-shadow:0 8px 22px rgba(0,0,0,.35),0 0 0 0 rgba(255,205,210,.5)}50%{box-shadow:0 8px 22px rgba(0,0,0,.35),0 0 0 12px rgba(255,205,210,0)}}
    @media (prefers-reduced-motion:reduce){.ab-hero{animation:none}}
  `);

  /* ---------- write a message ---------- */
  function compose(o) {
    o = o || {};
    const me = A.me();
    if (!me || !A.space()) { A.ui.toast('Join a group first.'); return; }
    const people = A.names.filter(n => n !== me);
    if (!people.length) { A.ui.toast('Nobody else is in the group yet.'); return; }
    let w = o.who && people.indexOf(o.who) >= 0 ? o.who : '', s = 'getting', what = '';
    const off = new Set();
    if (w && o.id) { const it = A.data.find(w, o.id); if (it) what = clean(it.name); }
    A.ui.sheet({
      title: 'Tell people', cls: 'msgc', html: '<div id="mgBody"></div>',
      onMount(el, close) {
        const body = $('#mgBody', el);
        let wishNames = [], to = [];
        const keep = () => { const i = $('#mgWhat', body); if (i) what = i.value; };
        function draw() {
          to = w ? people.filter(n => n !== w && !(A.noPhone && A.noPhone(n))) : [];
          wishNames = w ? A.data.items(w).map(it => clean(it.name)).filter(Boolean).slice(0, 8) : [];
          body.innerHTML =
            '<h3 class="mg-h">Who is the gift for?</h3><div class="mg-who">' + people.map(n => '<button type="button" class="mg-p' + (n === w ? ' on' : '') + '" data-who="' + esc(n) + '">' + A.ui.avatar(n, 28) + '<span>' + esc(n) + '</span></button>').join('') + '</div>' +
            (w ? '<h3 class="mg-h">What are you getting ' + esc(w) + '?</h3><input class="input" id="mgWhat" maxlength="' + MAX_T + '" placeholder="For example, the blue headphones" value="' + esc(what) + '">' +
              (wishNames.length ? '<div class="mg-wishes">' + wishNames.map((n, i) => '<button type="button" class="mg-w" data-i="' + i + '">' + esc(n) + '</button>').join('') + '</div>' : '') +
              '<div class="mg-seg"><button type="button" data-s="getting" class="' + (s === 'getting' ? 'on' : '') + '">I am getting it</button><button type="button" data-s="bought" class="' + (s === 'bought' ? 'on' : '') + '">I already got it</button></div>' +
              '<h3 class="mg-h">Tell</h3>' + (to.length ? to.map(n => '<label class="switch"><span class="row gap">' + A.ui.avatar(n, 30) + '<b>' + esc(n) + '</b></span><input type="checkbox" data-t="' + esc(n) + '"' + (off.has(n) ? '' : ' checked') + '></label>').join('') : '<p class="muted small">Nobody else can get this message.</p>') +
              '<p class="muted small" style="margin:8px 0 12px">' + esc(w) + ' never sees it.</p><button type="button" class="btn primary block" id="mgSend">Send</button>'
              : '<p class="muted small">Pick who the gift is for. Then tell the others, so nobody buys it twice.</p>') +
            '<button type="button" class="btn sm block ghost" id="mgBox" style="margin-top:10px">' + A.icon(icon(), 16) + 'Messages' + (unread() ? ' (' + unread() + ' new)' : '') + '</button>';
          $$('[data-who]', body).forEach(b => b.onclick = () => { keep(); w = b.dataset.who; off.clear(); draw(); });
          $$('.mg-w', body).forEach(b => b.onclick = () => { what = wishNames[+b.dataset.i] || ''; draw(); });
          $$('[data-s]', body).forEach(b => b.onclick = () => { keep(); s = b.dataset.s; draw(); });
          $$('[data-t]', body).forEach(c => c.onchange = () => { if (c.checked) off.delete(c.dataset.t); else off.add(c.dataset.t); });
          const go = $('#mgSend', body);
          if (go) go.onclick = () => {
            keep(); const t = clean(what), list = to.filter(n => !off.has(n));
            if (!t) { A.ui.toast('Say what you are getting.'); return; }
            if (!list.length) { A.ui.toast('Pick at least one person to tell.'); return; }
            send(w, t, s, list); close(); A.ui.toast('Sent to ' + names(list) + '.');
          };
          const bx = $('#mgBox', body); if (bx) bx.onclick = () => { close(); inbox(); };
        }
        draw();
      }
    });
  }

  /* ---------- the inbox, and what you sent ---------- */
  function inbox() {
    const list = mine(), out = sent(), was = seen();
    if (list.length) A.store.raw.set('msgSeen', Math.max(was, list[0].at));
    if (A.renderShell) A.renderShell();
    A.ui.sheet({
      title: 'Messages',
      html: '<button type="button" class="btn primary block" id="mgNew">' + A.icon('gift', 18) + 'Tell people what I am getting</button>' +
        (list.length ? list.map(m => '<div class="mg-row' + (m.at > was ? ' new' : '') + '">' + A.ui.avatar(m.f, 36) + '<span class="grow"><p>' + esc(m.f) + verb(m.s) + '<b>' + esc(m.t) + '</b> for ' + esc(m.w) + '.</p><small>' + when(m.at) + '</small></span></div>').join('')
          : '<p class="muted" style="margin:14px 0 0">No messages yet. When someone says what they are getting, it shows up here.</p>') +
        (out.length ? '<h3 class="mg-sec">What I sent</h3>' + out.map(m => '<div class="mg-row"><span class="grow"><p><b>' + esc(m.t) + '</b> for ' + esc(m.w) + '</p><small>Told ' + esc(names(m.to)) + '. ' + when(m.at) + '</small></span><button type="button" class="btn sm" data-back="' + esc(m.id) + '">Take back</button></div>').join('') : ''),
      onMount(el, close) {
        $('#mgNew', el).onclick = () => { close(); compose({}); };
        $$('[data-back]', el).forEach(b => b.onclick = () => { takeBack(b.dataset.back); close(); A.ui.toast('Taken back.'); inbox(); });
      }
    });
  }

  const menuLine = () => (unread() ? unread() + ' new' : 'Say what you are getting');

  /* a new message arrives while the app is open */
  let told = 0;
  A.on('sync', keys => {
    if (!keys || keys.indexOf('msgs') < 0) return;
    const fresh = mine().filter(m => m.at > seen() && m.at > told);
    if (fresh.length) { told = Math.max(told, fresh[0].at); if (!A.ui.sheetOpen()) A.ui.toast(fresh.length === 1 ? fresh[0].f + ' sent you a message.' : fresh.length + ' new messages.'); }
    if (A.renderShell) A.renderShell();
  });
  A.on('cloud', () => setTimeout(() => { if (A.renderShell) A.renderShell(); }, 600));

  A.msgs = { compose: compose, inbox: inbox, unread: unread, menuLine: menuLine };
})();
