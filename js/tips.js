/* Under the Tree — tip the developer (iPhone and iPad app only).
   A tip is a one-time in-app purchase through Apple. It unlocks nothing and nothing renews, so there is
   nothing to restore. The prices come from the App Store in the person's own currency. The website has no
   tip button: it has no way to take one, and it never pretends to. */
(function () {
  'use strict';
  const A = window.App, cap = window.Capacitor, $ = A.$, $$ = A.$$, esc = A.esc;
  const native = !!(cap && cap.isNativePlatform && cap.isNativePlatform());
  /* Preview only: ?tipmock (or =cancel, =pending, =fail, =none) on localhost shows the screen with made-up prices and takes no payment.
     Nobody reaches that by accident: the query has to be typed in or set by a test run. */
  const mock = () => /^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? ((location.search.match(/[?&]tipmock(?:=(\w+))?/) || [])[1] || (/[?&]tipmock/.test(location.search) ? 'ok' : '')) : '';
  const PREFIX = 'com.gamercrafter.underthetree.tip';
  /* id ending, dollars, a name for it. The three most common are shown big. */
  const TIPS = [
    ['099', 0.99, 'Hot cocoa'], ['199', 1.99, 'Candy canes'], ['299', 2.99, 'Gingerbread'], ['499', 4.99, 'A wrapped gift'],
    ['699', 6.99, 'A warm sweater'], ['999', 9.99, 'Apple pie'], ['1499', 14.99, 'A big gift'], ['1999', 19.99, 'A tree topper'],
    ['2499', 24.99, 'A sleigh ride'], ['4999', 49.99, 'The whole workshop']
  ];
  const BIG = ['099', '299', '499'];

  let plugin = null;
  const fake = {
    products: () => new Promise(r => setTimeout(() => r(mock() === 'none' ? { products: [] } : { products: TIPS.map(t => ({ id: PREFIX + t[0], name: t[2], price: '$' + t[1].toFixed(2), value: t[1] })) }), 400)),
    buy: () => new Promise((res, rej) => setTimeout(() => mock() === 'fail' ? rej(new Error('That did not go through.')) : res({ result: mock() === 'cancel' ? 'cancelled' : mock() === 'pending' ? 'pending' : 'success' }), 700))
  };
  function getPlugin() {
    if (mock()) return fake;
    /* in the app the page sees the plugin as Capacitor.Plugins.TipJar (there is no registerPlugin without a bundler) */
    if (!plugin && native) plugin = (cap.Plugins && cap.Plugins.TipJar) || (cap.registerPlugin ? cap.registerPlugin('TipJar') : null);
    return plugin;
  }
  const available = () => !!(mock() || native);

  A.css(`
    .mu-about.mu-tip{background:linear-gradient(90deg,rgba(201,36,58,.34),rgba(201,36,58,.12));border-color:rgba(255,122,138,.45)}
    .mu-about.mu-tip svg{color:#ff8a9a}
    .tj-lead{margin:0 0 12px;font-size:14.5px;line-height:1.45;color:#dfe7f3}
    .tj-big{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}
    .tj-b{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-height:96px;padding:10px 6px;border-radius:18px;background:linear-gradient(180deg,#f2d27f,var(--gold2));color:var(--gold-ink);box-shadow:inset 0 1px 0 rgba(255,255,255,.5),0 3px 0 #8a6516;transition:transform .12s}
    .tj-b b{font-family:var(--display);font-size:clamp(20px,6vw,25px);font-weight:600;line-height:1}
    .tj-b small{font-size:12px;font-weight:600;opacity:.8;text-align:center;line-height:1.15}
    .tj-b:active{transform:translateY(2px) scale(.97);box-shadow:inset 0 1px 0 rgba(255,255,255,.5),0 1px 0 #8a6516}
    .tj-h{margin:16px 0 8px;font-size:13px;font-weight:600;color:var(--muted)}
    .tj-more{display:flex;flex-wrap:wrap;gap:8px}
    .tj-p{flex:1 1 calc(25% - 8px);min-width:74px;min-height:46px;padding:6px 8px;border-radius:14px;background:var(--surface2);border:1.5px solid var(--line2);color:#fff;font-weight:700;font-size:15.5px;transition:transform .12s,border-color .12s}
    .tj-p:active{transform:scale(.96);border-color:var(--gold)}
    .tj-fine{margin:14px 0 0;font-size:12.5px;line-height:1.4;color:var(--muted);text-align:center}
    .tj-wait{display:grid;place-items:center;min-height:120px;color:var(--muted);font-size:14px}
    .tj-busy .tj-b,.tj-busy .tj-p{opacity:.55;pointer-events:none}
    .tj-thx{display:flex;flex-direction:column;align-items:center;text-align:center;gap:6px;padding:14px 4px 6px}
    .tj-heart{width:92px;height:92px;color:var(--red);filter:drop-shadow(0 6px 14px rgba(215,38,61,.45));animation:tj-pop .7s cubic-bezier(.2,1.5,.4,1) both}
    .tj-thx h3{margin:6px 0 0;font-family:var(--display);font-size:27px;font-weight:600}
    .tj-thx p{margin:0;font-size:15px;line-height:1.45;color:#dfe7f3;max-width:30ch}
    @keyframes tj-pop{0%{transform:scale(.2) rotate(-14deg);opacity:0}100%{transform:scale(1) rotate(0);opacity:1}}
  `);

  const price = p => esc(p.price);

  function sheet() {
    if (!available()) return;
    let body, shut = false, busy = false, products = [];
    const api = A.ui.sheet({
      title: 'Tip the dev', cls: 'tipjar',
      html: '<div data-keep><p class="tj-lead">Under the Tree is free and has no ads. If it made your holidays easier, you can leave a tip. It is optional, and it unlocks nothing.</p><div id="tjBody"><div class="tj-wait">Getting prices…</div></div></div>',
      onMount(el, close) {
        body = $('#tjBody', el);
        load();
        function load() {
          body.innerHTML = '<div class="tj-wait">Getting prices…</div>';
          const P = getPlugin();
          const done = list => {
            if (shut) return;
            products = (list || []).map(p => ({ id: p.id, key: String(p.id).slice(PREFIX.length), price: p.price, value: p.value })).filter(p => TIPS.some(t => t[0] === p.key));
            products.sort((a, b) => a.value - b.value);
            products.length ? show() : fail();
          };
          if (!P) return fail();
          P.products({ ids: TIPS.map(t => PREFIX + t[0]) }).then(r => done(r && r.products), fail);
        }
        function fail() {
          if (shut) return;
          body.innerHTML = '<div class="tj-wait" style="gap:10px;text-align:center">Tips are not available right now.<br>Check your connection and try again.<button class="btn" id="tjRetry">Try again</button></div>';
          $('#tjRetry', body).onclick = load;
        }
        function name(p) { return (TIPS.find(t => t[0] === p.key) || [])[2] || ''; }
        function show() {
          const big = products.filter(p => BIG.includes(p.key)), rest = products.filter(p => !BIG.includes(p.key));
          body.innerHTML =
            (big.length ? '<div class="tj-big">' + big.map(p => '<button class="tj-b" data-id="' + esc(p.id) + '"><b>' + price(p) + '</b><small>' + esc(name(p)) + '</small></button>').join('') + '</div>' : '') +
            (rest.length ? '<p class="tj-h">' + (big.length ? 'Other amounts' : 'Pick an amount') + '</p><div class="tj-more">' + rest.map(p => '<button class="tj-p" data-id="' + esc(p.id) + '">' + price(p) + '</button>').join('') + '</div>' : '') +
            '<p class="tj-fine">Paid through your Apple Account. One time only. Nothing renews.</p>';
          $$('[data-id]', body).forEach(b => b.onclick = () => buy(b.dataset.id));
        }
        function thanks() {
          const lead = body.previousElementSibling; if (lead) lead.style.display = 'none';
          body.innerHTML = '<div class="tj-thx"><svg class="tj-heart" viewBox="0 0 24 24" fill="currentColor"><path d="M12 20.500S3.800 15.600 3.800 9.600A4.300 4.300 0 0 1 12 7.300a4.300 4.300 0 0 1 8.200 2.300c0 6-8.200 10.900-8.200 10.900z"/></svg><h3>Thank you</h3><p>That really helps keep the app going. Merry Christmas.</p><button class="btn primary" id="tjDone" style="margin-top:12px;min-width:150px">Done</button></div>';
          $('#tjDone', body).onclick = close;
          if (A.fx && A.fx.confetti && !A.reduced) { const r = $('.tj-heart', body).getBoundingClientRect(); setTimeout(() => A.fx.confetti(r.left + r.width / 2, r.top + r.height / 2, 90), 250); }
        }
        function buy(id) {
          if (busy) return;                                   /* three fast taps make one purchase */
          busy = true; body.classList.add('tj-busy');
          getPlugin().buy({ id: id }).then(r => {
            busy = false; body.classList.remove('tj-busy');
            if (shut) return;
            const res = r && r.result;
            if (res === 'success') thanks();
            else if (res === 'pending') A.ui.toast('Waiting for approval. If it goes through, thank you.');
          }, () => {
            busy = false; body.classList.remove('tj-busy');
            if (!shut) A.ui.toast('That did not go through. Try again in a moment.');
          });
        }
      },
      onClose() { shut = true; }
    });
    return api;
  }

  A.tips = { available: available, sheet: sheet };
})();
