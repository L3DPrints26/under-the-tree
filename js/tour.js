/* Under the Tree — the first-time walkthrough and the bigger-text setting.
   The walkthrough shows once on each device, the first time someone lands on the tree with a name
   picked, and can be replayed from Settings. Bigger text is kept on this device only. */
(function () {
  'use strict';
  const A = window.App, $ = A.$, raw = A.store.raw;

  /* ---------- bigger text ---------- */
  /* phones scale every bit of text with this one rule; the few things drawn to fit a shape are left alone */
  A.css(`
    html.big{-webkit-text-size-adjust:118%;text-size-adjust:118%}
    html.big .bname,html.big .count-num,html.big .tab span,html.big canvas{-webkit-text-size-adjust:100%;text-size-adjust:100%}
    .tr-art{display:grid;place-items:center;height:118px;margin-bottom:10px;border-radius:18px;background:radial-gradient(120% 100% at 50% 0,rgba(74,123,214,.35),rgba(11,23,48,.2));border:1px solid var(--line)}
    .tr-art svg{color:var(--gold)}
    .tr-row{display:flex;align-items:center;justify-content:center;gap:12px}
    .tr-ball{position:relative;width:62px;height:62px;border-radius:50%;box-shadow:0 6px 12px rgba(0,0,0,.4)}
    .tr-ball::before{content:"";position:absolute;left:50%;top:-7px;width:16px;height:9px;margin-left:-8px;border-radius:3px;background:linear-gradient(90deg,#8a6418,#ffe9a8,#7a5612)}
    .tr-ball.me{outline:3px solid var(--gold);outline-offset:3px}
    .tr-tag{position:relative;padding:8px 12px 8px 26px;border-radius:9px;background:#f6eedd;color:#3a2a12;font-weight:700;font-size:14px;clip-path:polygon(0 50%,12px 0,100% 0,100% 100%,12px 100%);box-shadow:0 3px 8px rgba(0,0,0,.3)}
    .tr-tag::before{content:"";position:absolute;left:11px;top:50%;width:7px;height:7px;margin-top:-4px;border-radius:50%;background:#0f1b33}
    .tr-tag svg{color:#8a1a2c;vertical-align:-4px;margin-right:4px}
    .tr-dot{display:grid;place-items:center;width:52px;height:52px;border-radius:50%;color:#fff}
    .tr-dot svg{color:#fff}
    .tr-h{font-family:var(--display);font-weight:600;font-size:clamp(22px,6.2vw,27px);line-height:1.2;color:#fff;margin-bottom:6px}
    .tr-dots{display:flex;justify-content:center;gap:7px;margin:14px 0 2px}
    .tr-dots i{width:8px;height:8px;border-radius:50%;background:var(--line2)}.tr-dots i.on{background:var(--gold)}
    .tr-nav{display:flex;gap:8px;margin-top:12px}.tr-nav .btn{flex:1}
  `);
  const big = () => !!raw.get('big', false);
  const paintBig = () => document.documentElement.classList.toggle('big', big());
  function setBig(v) { raw.set('big', !!v); paintBig(); }
  paintBig();

  /* ---------- walkthrough ---------- */
  const inApp = !!(window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform());
  const ball = (i, me) => '<span class="tr-ball' + (me ? ' me' : '') + '" style="background:' + A.ornArt(i, A.palette[i]).replace(/"/g, "'") + ' center/100% 100%"></span>';
  const tag = (html) => '<span class="tr-tag">' + html + '</span>';
  const dot = (ic, c) => '<span class="tr-dot" style="background:' + c + '">' + A.icon(ic, 24) + '</span>';
  const ART = () => [
    '<div class="tr-row">' + ball(0) + ball(1, true) + ball(3) + '</div>',
    '<div class="tr-row">' + tag(A.icon('plus', 18) + 'Wireless headphones') + '</div>',
    '<div class="tr-row">' + tag(A.icon('lock', 18) + 'Getting this') + '</div>',
    '<div class="tr-row" style="gap:8px;flex-wrap:wrap">' + tag("M&M's") + tag('Green') + tag('Size M') + '</div>',
    '<div class="tr-row">' + dot('hat', '#c9243a') + dot('calendar', '#14573a') + dot('trophy', '#c98f1c') + '</div>'
  ];
  const STEPS = () => [
    { icon: 'tree', h: 'This is the tree', p: 'Everyone in your group has an ornament. Tap one to see what that person is hoping for. Yours has the gold ring.' },
    { icon: 'plus', h: 'Add what you want', p: 'Tap your own ornament, then Add. A photo, a price and a link make it easy to shop for you.' + (inApp ? ' Paste a shop link and the app fills in the rest.' : '') },
    { icon: 'lock', h: 'Pick in secret', p: 'On someone else\'s wish, tap Add to my picks. They never see it, and nobody buys the same gift twice.' },
    { icon: 'heart', h: 'Tell people what you like', p: 'Take the favorites quiz on your list. Candy, colors, sizes. It helps people fill a stocking without asking.' },
    { icon: 'gift', h: 'There is more', p: 'Secret Santa, the advent calendar and the games are along the bottom. Tap the group name at the top for the menu.' }
  ];
  function show() {
    const steps = STEPS(); let i = 0;
    A.ui.sheet({
      title: 'How it works',
      html: '<div id="trBody"></div>',
      onMount(el, close) {
        const body = $('#trBody', el);
        const draw = () => {
          const s = steps[i], last = i === steps.length - 1;
          body.innerHTML = '<div class="tr-art">' + (ART()[i] || A.icon(s.icon, 58)) + '</div><p class="tr-h">' + s.h + '</p><p class="muted">' + s.p + '</p>' +
            '<div class="tr-dots">' + steps.map((x, k) => '<i' + (k === i ? ' class="on"' : '') + '></i>').join('') + '</div>' +
            '<div class="tr-nav">' + (i ? '<button class="btn" id="trBack">Back</button>' : '<button class="btn ghost" id="trSkip">Skip</button>') + '<button class="btn primary" id="trNext">' + (last ? 'Got it' : 'Next') + '</button></div>';
          $('#trNext', body).onclick = () => { if (last) close(); else { i++; draw(); } };
          const b = $('#trBack', body); if (b) b.onclick = () => { i--; draw(); };
          const k = $('#trSkip', body); if (k) k.onclick = close;
        };
        draw();
      },
      onClose() { raw.set('toured', true); }
    });
  }
  /* people who were already using the app before the walkthrough existed do not need it sprung on them */
  if (raw.get('toured', null) === null) raw.set('toured', !!(A.space() && A.me()));
  /* the first time this device shows the tree with a name picked */
  function maybe() {
    if (raw.get('toured', false) || !A.space() || !A.me() || A.ui.sheetOpen()) return;
    if (!/^#?\/?$/.test(location.hash)) return;
    show();
  }
  A.on('cloud', () => setTimeout(maybe, 2500));
  setTimeout(maybe, 3500);

  A.tour = { show: show, big: big, setBig: setBig };
})();
