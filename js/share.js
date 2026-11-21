/* Under the Tree — spreading the word and supporting the app.
   "Share the app" sends a short note and the store link. It does not add anyone to a group.
   The support pop-up puts four ways to help in one place: share it, leave a review, send a tip, subscribe.
   It comes up on its own: after a few visits, then about once a week (once a month after someone taps one of them),
   and it is always there from the button on the home page. Apple does not allow a pop-up that asks for a review,
   so the review button is only in the copy opened from that home button, never in the one that comes up by itself. */
(function () {
  'use strict';
  const A = window.App, cap = window.Capacitor, $ = A.$, $$ = A.$$, esc = A.esc, raw = A.store.raw;
  const inApp = !!(cap && cap.isNativePlatform && cap.isNativePlatform());
  const STORE = 'https://apps.apple.com/app/id6836867384', WEB = 'https://l3dprints26.github.io/under-the-tree/';
  const REVIEW = STORE + '?action=write-review', YT = 'https://www.youtube.com/@GamerCrafter-15';

  const SVG = {
    share: '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3.500M8 7l4-4 4 4M7 10.500H6a1.500 1.500 0 0 0-1.500 1.500v7A1.500 1.500 0 0 0 6 20.500h12a1.500 1.500 0 0 0 1.500-1.500v-7a1.500 1.500 0 0 0-1.500-1.500h-1"/></svg>',
    star: '<svg viewBox="0 0 24 24" width="42" height="42" fill="currentColor" aria-hidden="true"><path d="M12 2.800l2.800 5.900 6.400.800-4.700 4.400 1.200 6.400L12 17.100l-5.700 3.200 1.200-6.400-4.700-4.400 6.400-.800z"/></svg>',
    tip: '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="10.500" width="16" height="10" rx="1.800"/><path d="M3 7.500h18v3H3zM12 7.500v13"/><path d="M12 7.500C10.500 3.500 6 4.500 8 7.500M12 7.500c1.500-4 6-3 4 0"/></svg>',
    youtube: '<svg viewBox="0 0 48 34" width="52" height="37" aria-hidden="true"><rect width="48" height="34" rx="9" fill="#ff0000"/><path d="M19.500 9.500v15l13-7.500z" fill="#fff"/></svg>',
    small: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 20.500S3.800 15.600 3.800 9.600A4.300 4.300 0 0 1 12 7.300a4.300 4.300 0 0 1 8.200 2.300c0 6-8.200 10.900-8.200 10.900z"/></svg>'
  };
  const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')'; };

  A.css(`
    .sp-lead{margin:0 0 14px;font-size:14.5px;line-height:1.45;color:#dfe7f3}
    .sp-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .sp-t{display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:7px;min-height:132px;padding:16px 8px 12px;border-radius:20px;text-align:center;color:var(--c);background:linear-gradient(180deg,var(--t),rgba(12,20,38,.4));border:1.5px solid var(--b);text-decoration:none;transition:transform .12s}
    .sp-t:active{transform:scale(.96)}
    .sp-i{height:44px;display:grid;place-items:center}
    .sp-t b{font-size:15.5px;font-weight:700;color:#fff;line-height:1.15}
    .sp-t small{font-size:12.5px;line-height:1.25;color:#c9d6e8}
    .sp-grid>:last-child:nth-child(odd){grid-column:1/-1}
    .sh-msg{margin:0 0 14px;padding:12px 14px;border-radius:14px;background:var(--surface2);border:1px solid var(--line2);font-size:14px;line-height:1.45;color:#e6edf7;white-space:pre-wrap;overflow-wrap:anywhere}
    .home-sup{flex:none;display:flex;align-items:center;justify-content:center;gap:8px;align-self:center;min-height:38px;margin:2px 0 6px;padding:6px 16px;border-radius:999px;background:rgba(14,24,46,.78);border:1px solid rgba(255,255,255,.2);color:#e6edf7;font-size:13.5px;font-weight:600;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
    .home-sup svg{color:#ff6b86;flex:none}.home-sup b{color:var(--gold);font-weight:700}
    .home-sup:active{transform:scale(.97)}
  `);

  /* ---------- share the app ---------- */
  function note() {
    const who = (A.me && A.me()) || '';
    return (who ? who + ' invited you to try Under the Tree.' : 'Try Under the Tree.') +
      ' It is a free Christmas wishlist app: everyone adds what they want, and you can see what to get people. It also has an advent calendar and a Santa tracker.';
  }
  function shareApp() {
    const msg = note(), full = msg + '\n\nGet it on the App Store: ' + STORE + '\nOr open it in any browser: ' + WEB;
    const ic = (A.cloud && A.cloud.shareIcons) || {}, handheld = A.dev === 'phone' || A.dev === 'iPad' || A.dev === 'tablet';
    const put = () => (navigator.clipboard ? navigator.clipboard.writeText(full) : Promise.reject()).then(() => A.ui.toast('Copied. Paste it anywhere.'), () => A.ui.toast('Could not copy. Use Messages or Mail instead.'));
    A.ui.sheet({
      title: 'Share the app',
      html: '<div data-keep><p class="iv-lead">Send friends and family the app. This does not add them to your group.</p>' +
        '<div class="sh-msg">' + esc(full) + '</div>' +
        '<div class="iv-row">' +
          (handheld ? '<a class="iv-app" href="' + esc('sms:&body=' + encodeURIComponent(full)) + '">' + (ic.messages || '') + '<span>Messages</span></a>' : '') +
          '<a class="iv-app" href="' + esc('mailto:?subject=' + encodeURIComponent('Try Under the Tree') + '&body=' + encodeURIComponent(full)) + '">' + (ic.mail || '') + '<span>Mail</span></a>' +
          '<button class="iv-app" id="shMore" type="button">' + (ic.more || '') + '<span>More</span></button>' +
        '</div><button class="btn block" id="shCopy">Copy the message</button></div>',
      onMount(el) {
        $('#shMore', el).onclick = () => { if (navigator.share) navigator.share({ title: 'Under the Tree', text: full }).catch(e => { if (!e || e.name !== 'AbortError') put(); }); else put(); };
        $('#shCopy', el).onclick = put;
      }
    });
  }

  /* ---------- the support pop-up ---------- */
  const state = () => raw.get('support', {}) || {};
  const save = s => raw.set('support', s);
  const tapped = () => { const s = state(); s.tapped = Date.now(); save(s); };

  function support(manual) {
    const tiles = [
      { id: 'share', c: '#3da2ff', icon: SVG.share, label: 'Share it', sub: 'Send it to people you know' },
      manual && (inApp || A.iosWeb) ? { id: 'review', c: '#ffc83d', icon: SVG.star, label: 'Leave a review', sub: 'It helps others find it', href: REVIEW } : null,
      A.tips && A.tips.available() ? { id: 'tip', c: '#3ddc84', icon: SVG.tip, label: 'Send a tip', sub: 'Optional. It unlocks nothing' } : null,
      { id: 'yt', c: '#ff3b3b', icon: SVG.youtube, label: 'Subscribe', sub: "to the creator's YouTube", href: YT }
    ].filter(Boolean);
    A.ui.sheet({
      title: 'Enjoying the app?', cls: 'support',
      html: '<div data-keep><p class="sp-lead">Under the Tree is free, with no ads, and made by one person. If it helps your holidays, here are four ways to support it.</p>' +
        '<div class="sp-grid">' + tiles.map(t => {
          const inner = '<span class="sp-i">' + t.icon + '</span><b>' + esc(t.label) + '</b><small>' + esc(t.sub) + '</small>', st = ' style="--c:' + t.c + ';--t:' + rgba(t.c, .2) + ';--b:' + rgba(t.c, .6) + '"';
          return t.href ? '<a class="sp-t" data-sp="' + t.id + '" href="' + esc(t.href) + '" target="_blank" rel="noopener"' + st + '>' + inner + '</a>' : '<button class="sp-t" data-sp="' + t.id + '" type="button"' + st + '>' + inner + '</button>';
        }).join('') + '</div></div>',
      onMount(el, close) {
        $$('[data-sp]', el).forEach(b => b.addEventListener('click', () => {
          tapped();
          if (b.dataset.sp === 'share') shareApp();
          else if (b.dataset.sp === 'tip') { close(); setTimeout(() => A.tips.sheet(), 250); }
        }));
      }
    });
  }

  /* On its own: after a few visits, never over another pop-up or the tutorial, only on the home page. */
  function visit() {
    const s = state(), now = Date.now();
    if (!s.last || now - s.last > 6 * 36e5) s.visits = (s.visits || 0) + 1;
    s.last = now; save(s);
  }
  function maybe(tries) {
    const s = state();
    const wait = (s.tapped && s.tapped > (s.shownAt || 0) ? 30 : 7) * 864e5;
    if ((s.visits || 0) < 3 || (s.shownAt && Date.now() - s.shownAt < wait) || tries > 25) return;
    if (!A.me || !A.me() || !A.space()) return;
    const idle = !A.ui.sheetOpen() && !(A.tour && A.tour.running && A.tour.running()) && A.parse().name === 'home';
    if (!idle) { setTimeout(() => maybe(tries + 1), 5000); return; }
    s.shownAt = Date.now(); save(s);
    support(false);
  }
  visit();
  setTimeout(() => maybe(0), 9000);

  A.share = { app: shareApp, support: () => support(true), button: () => '<button class="home-sup" id="hmSup" type="button">' + SVG.small + '<span>Enjoying the app? <b>Support it</b></span></button>' };
})();
