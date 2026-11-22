/* Under the Tree — the favorites quiz.
   Everyone answers a few quick questions about themselves (favorite candy, colors, sizes, what they
   already have plenty of). Everyone in the group can read the answers, so it is easy to pick a small
   gift or fill a basket without asking. Saved with the group under "about", one piece per person. */
(function () {
  'use strict';
  const A = window.App, $ = A.$, $$ = A.$$, esc = A.esc;

  /* id, section, the question, a hint, and quick answers to tap (optional).
     The watch app copies this list (scripts/gen-data.js), so keep it a plain list. */
  const QUESTIONS = [
    { id: 'candy', sec: 'Favorites', q: 'Favorite candy', hint: "M&M's, sour gummies, mint anything", pick: [] },
    { id: 'snack', sec: 'Favorites', q: 'Favorite snack', hint: 'Chips, popcorn, trail mix', pick: [] },
    { id: 'drink', sec: 'Favorites', q: 'Favorite drink', hint: 'Hot chocolate, a soda, a coffee order', pick: [] },
    { id: 'food', sec: 'Favorites', q: 'Favorite place to eat', hint: 'A restaurant or a fast food spot', pick: [] },
    { id: 'color', sec: 'Favorites', q: 'Favorite color', hint: '', pick: ['Red', 'Green', 'Blue', 'Purple', 'Pink', 'Black', 'Gold'] },
    { id: 'store', sec: 'Favorites', q: 'Favorite store', hint: 'Where a gift card would get used', pick: [] },
    { id: 'hobby', sec: 'Favorites', q: 'What I like to do', hint: 'Drawing, soccer, baking, building things', pick: [] },
    { id: 'music', sec: 'Favorites', q: 'Music I like', hint: 'An artist or a kind of music', pick: [] },
    { id: 'show', sec: 'Favorites', q: 'Favorite movie or show', hint: '', pick: [] },
    { id: 'game', sec: 'Favorites', q: 'Favorite game', hint: 'Video game, board game or sport', pick: [] },
    { id: 'animal', sec: 'Favorites', q: 'Favorite animal', hint: '', pick: [] },
    { id: 'shirt', sec: 'Sizes', q: 'Shirt size', hint: '', pick: ['Kids S', 'Kids M', 'Kids L', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'pants', sec: 'Sizes', q: 'Pants size', hint: '32x30, or a kids size', pick: [] },
    { id: 'shoe', sec: 'Sizes', q: 'Shoe size', hint: '', pick: [] },
    { id: 'collect', sec: 'Good to know', q: 'Things I collect', hint: 'Cards, mugs, ornaments, rocks', pick: [] },
    { id: 'plenty', sec: 'Good to know', q: 'I already have plenty of', hint: 'Socks, candles, water bottles', pick: [] },
    { id: 'no', sec: 'Good to know', q: 'Please do not get me', hint: 'Anything you would rather skip', pick: [] },
    { id: 'small', sec: 'Good to know', q: 'A small thing that always makes me happy', hint: 'Good for stockings and baskets', pick: [] }
  ];
  const SECTIONS = ['Favorites', 'Sizes', 'Good to know'];

  A.css(`
    .ab-strip{flex:none;display:flex;align-items:center;gap:10px;width:100%;min-height:44px;padding:6px 12px;margin:0 0 10px;border-radius:14px;background:linear-gradient(90deg,rgba(201,36,58,.34),rgba(201,36,58,.14));border:1px solid rgba(255,122,138,.45);text-align:left}
    .ab-strip svg{flex:none;color:var(--gold)}
    .ab-strip span{flex:1;min-width:0;font-size:13.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .ab-strip b{color:var(--gold);font-weight:700}
    .ab-strip i{font-style:normal;flex:none;font-size:12.5px;font-weight:700;color:var(--gold)}
    .ab-sec{margin-top:14px}.ab-sec:first-child{margin-top:0}
    .ab-sec h3{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:var(--gold);margin-bottom:6px}
    .ab-tags{display:flex;flex-wrap:wrap;gap:8px}
    .ab-tag{position:relative;max-width:100%;padding:8px 12px 8px 26px;border-radius:9px;background:#f6eedd;color:#3a2a12;clip-path:polygon(0 50%,12px 0,100% 0,100% 100%,12px 100%);box-shadow:0 3px 8px rgba(0,0,0,.3)}
    .ab-tag::before{content:"";position:absolute;left:11px;top:50%;width:7px;height:7px;margin-top:-4px;border-radius:50%;background:#0f1b33}
    .ab-tag small{display:block;font-size:11.5px;font-weight:700;color:#8a1a2c}
    .ab-tag span{display:block;font-size:15px;font-weight:600;overflow-wrap:anywhere}
    .ab-none{color:var(--muted);font-size:14px}
    .ab-bar{height:8px;border-radius:4px;background:var(--surface2);overflow:hidden;margin-bottom:14px}
    .ab-bar i{display:block;height:100%;border-radius:4px;background:linear-gradient(90deg,#2a8a58,#f5d07a);transition:width .25s}
    .ab-q{font-family:var(--display);font-weight:600;font-size:clamp(22px,6.4vw,28px);line-height:1.2;color:#fff;margin-bottom:4px}
    .ab-step{font-size:12.5px;font-weight:700;color:var(--gold);margin-bottom:6px}
    .ab-picks{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 2px}
    .ab-pick{min-height:40px;padding:0 14px;border-radius:999px;background:var(--surface2);border:1px solid var(--line);font-weight:600;font-size:14px}
    .ab-pick.on{background:var(--gold);border-color:var(--gold);color:var(--gold-ink)}
    .ab-nav{display:flex;gap:8px;margin-top:14px}.ab-nav .btn{flex:1}
    .ab-done{text-align:center;padding:6px 0 2px}.ab-done b{display:block;font-family:var(--display);font-size:24px;margin:6px 0 4px}
  `);

  const all = () => { const v = A.store.get('about', null); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; };
  const of = n => { const v = all()[n]; return v && typeof v === 'object' ? v : {}; };
  const count = n => { const a = of(n); return QUESTIONS.filter(q => a[q.id]).length; };
  function save(n, id, text) {
    const v = all(), mine = Object.assign({}, v[n]);
    text = String(text || '').trim().slice(0, 80);
    if (text) mine[id] = text; else delete mine[id];
    v[n] = mine; A.store.set('about', v);
  }

  /* the strip that sits above a wishlist: a taste of the answers, tap for all of them */
  function stripHTML(who) {
    const mine = who === A.me(), a = of(who), n = count(who);
    if (mine && n < QUESTIONS.length) return '<button class="ab-hero" id="abStrip">' + A.icon('heart', 34) + '<span><b>' + (n ? 'Finish your favorites quiz' : 'Take your favorites quiz') + '</b><small>' + (n ? n + ' of ' + QUESTIONS.length + ' answered' : 'About two minutes. It tells everyone what to get you.') + '</small></span><i>' + (n ? 'Continue' : 'Start') + '</i></button>';
    if (mine) return '<button class="ab-strip" id="abStrip">' + A.icon('heart', 18) + '<span>' + (n ? 'My favorites quiz' : 'Take the favorites quiz so people know what you like') + '</span><i>' + (n ? n + ' of ' + QUESTIONS.length : 'Start') + '</i></button>';
    if (!n) return '';
    const taste = QUESTIONS.filter(q => a[q.id]).slice(0, 3).map(q => esc(a[q.id])).join(', ');
    return '<button class="ab-strip" id="abStrip">' + A.icon('heart', 18) + '<span><b>' + esc(who) + ' likes</b> ' + taste + '</span><i>See all</i></button>';
  }
  function open(who) { if (who === A.me() && count(who) < QUESTIONS.length) quiz(Math.max(0, QUESTIONS.findIndex(q => !of(who)[q.id]))); else card(who); }
  function wire(root, who) { const b = $('#abStrip', root); if (b) b.onclick = () => open(who); }

  /* everything one person answered, as gift tags */
  function card(who) {
    const a = of(who), mine = who === A.me();
    const body = SECTIONS.map(sec => {
      const rows = QUESTIONS.filter(q => q.sec === sec && a[q.id]);
      return rows.length ? '<div class="ab-sec"><h3>' + sec + '</h3><div class="ab-tags">' + rows.map(q => '<div class="ab-tag"><small>' + q.q + '</small><span>' + esc(a[q.id]) + '</span></div>').join('') + '</div></div>' : '';
    }).join('');
    A.ui.sheet({
      title: mine ? 'About me' : 'About ' + who, wide: true,
      html: (body || '<p class="ab-none">' + (mine ? 'You have not answered anything yet.' : esc(who) + ' has not taken the quiz yet.') + '</p>') +
        (mine ? '<div class="lk-stack" style="margin-top:16px"><button class="btn primary block" id="abEdit">' + (count(who) < QUESTIONS.length ? 'Answer more questions' : 'Change my answers') + '</button></div><p class="sf-foot" data-keep>Everyone in the group can read your answers.</p>' : ''),
      onMount(el, close) {
        const e = $('#abEdit', el);
        if (e) e.onclick = () => { close(); const first = QUESTIONS.findIndex(q => !of(who)[q.id]); quiz(first < 0 ? 0 : first); };
      }
    });
  }

  /* the quiz: one question at a time, each answer saved as you go */
  function quiz(start) {
    const me = A.me(); if (!me) return;
    let i = Math.max(0, Math.min(QUESTIONS.length, start || 0));
    A.ui.sheet({
      title: 'Favorites quiz',
      html: '<div id="abBody"></div>',
      onMount(el, close) {
        const body = $('#abBody', el);
        const keep = () => { const inp = $('#abIn', body); if (inp && QUESTIONS[i]) save(me, QUESTIONS[i].id, inp.value); };
        const draw = () => {
          if (i >= QUESTIONS.length) {
            body.innerHTML = '<div class="ab-bar"><i style="width:100%"></i></div><div class="ab-done">' + A.icon('gift', 44) + '<b>All done</b><p class="muted">Everyone in the group can see what you like now. You can change an answer any time.</p></div>' +
              '<div class="lk-stack"><button class="btn primary block" id="abSee">See my answers</button></div>';
            $('#abSee', body).onclick = () => { close(); A.refresh(); card(me); };
            return;
          }
          const q = QUESTIONS[i], cur = of(me)[q.id] || '';
          body.innerHTML = '<div class="ab-bar"><i style="width:' + Math.round(i / QUESTIONS.length * 100) + '%"></i></div>' +
            '<p class="ab-step">' + q.sec + ', question ' + (i + 1) + ' of ' + QUESTIONS.length + '</p><p class="ab-q">' + q.q + '</p>' +
            (q.pick.length ? '<div class="ab-picks">' + q.pick.map(p => '<button type="button" class="ab-pick' + (p === cur ? ' on' : '') + '" data-pick="' + esc(p) + '">' + esc(p) + '</button>').join('') + '</div>' : '') +
            '<label class="field" style="margin-top:10px"><span>' + (q.pick.length ? 'Or type your own' : (q.hint ? esc(q.hint) : 'Type your answer')) + '</span><input class="input" id="abIn" maxlength="80" autocomplete="off" value="' + esc(cur) + '"></label>' +
            '<div class="ab-nav">' + (i ? '<button class="btn" id="abBack">Back</button>' : '') + '<button class="btn ghost" id="abSkip">Skip</button><button class="btn primary" id="abNext">' + (i === QUESTIONS.length - 1 ? 'Finish' : 'Next') + '</button></div>';
          const inp = $('#abIn', body);
          $$('[data-pick]', body).forEach(b => b.onclick = () => { inp.value = b.dataset.pick; $$('[data-pick]', body).forEach(x => x.classList.toggle('on', x === b)); });
          inp.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); $('#abNext', body).click(); } };
          $('#abNext', body).onclick = () => { keep(); i++; draw(); };
          $('#abSkip', body).onclick = () => { i++; draw(); };
          const bk = $('#abBack', body); if (bk) bk.onclick = () => { keep(); i--; draw(); };
          if (A.canHover) setTimeout(() => inp.focus(), 60);
        };
        draw();
      },
      onClose() { A.refresh(); }
    });
  }

  A.about = { stripHTML, wire, card, quiz, count, open, questions: QUESTIONS };
})();
