/* Under the Tree — the Santa tracker, for Christmas Eve.
   The idea is simple and the math is real: Santa shows up at about 11 at night, when everyone should
   be asleep. So right now he is wherever in the world it is 11 pm on December 24. He starts at the
   first place that reaches 11 pm (Kiritimati, in the Pacific) and follows the night west for 26 hours.
   Nothing here is sent anywhere. The device only remembers which pop-ups it already showed.
   On Christmas Eve it is hard to miss: a big banner on the home page, a pop-up the first time the app is opened that day,
   and another when he gets close. What it says about "your neighborhood" is a game, worked out from your clock. */
(function () {
  'use strict';
  const A = window.App, $ = A.$, esc = A.esc;

  /* a place in each time zone and its December clock offset from UTC, east to west.
     The watch app copies this list (scripts/gen-data.js), so keep it a plain list. */
  const STOPS = [
    ['Kiritimati', 14], ['Auckland', 13], ['Fiji', 12], ['Sydney', 11], ['Brisbane', 10], ['Tokyo', 9], ['Beijing', 8], ['Bangkok', 7],
    ['Dhaka', 6], ['Delhi', 5.5], ['Dubai', 4], ['Moscow', 3], ['Cairo', 2], ['Paris', 1], ['London', 0], ['the Azores', -1],
    ['Rio de Janeiro', -3], ['Halifax', -4], ['New York', -5], ['Chicago', -6], ['Denver', -7], ['Los Angeles', -8], ['Anchorage', -9], ['Honolulu', -10], ['Baker Island', -12]
  ];
  const ARRIVES = 23;                                   /* 11 pm, local time, on the 24th */

  A.css(`
    .tk-chip{display:flex;width:fit-content;align-items:center;gap:8px;min-height:40px;margin:10px auto 0;padding:0 16px;border-radius:999px;background:linear-gradient(#e8404f,#a3162a);color:#fff;font-weight:700;font-size:14.5px;box-shadow:0 6px 16px rgba(0,0,0,.35)}
    @media (orientation:landscape) and (min-width:560px){.tk-chip,.rv-chip{margin:0}}
    .tk-sky{position:relative;height:150px;border-radius:18px;overflow:hidden;background:radial-gradient(120% 90% at 50% 120%,#1d3f7a 0,#0b1730 60%,#060d1f 100%);border:1px solid var(--line)}
    .tk-sky i{position:absolute;width:2px;height:2px;border-radius:50%;background:#fff;opacity:.7}
    .tk-earth{position:absolute;left:-10%;right:-10%;bottom:-150px;height:210px;border-radius:50%;background:radial-gradient(60% 60% at 50% 0,#2f7a55,#14573a 55%,#0a3a25);box-shadow:0 0 40px rgba(95,227,161,.25)}
    .tk-track{position:absolute;left:6%;right:6%;bottom:44px;height:0;border-top:2px dashed rgba(245,208,122,.55)}
    .tk-sled{position:absolute;bottom:42px;width:120px;height:32px;margin-left:-60px;transition:left 1s linear;filter:drop-shadow(0 4px 6px rgba(0,0,0,.5))}
    .tk-sled svg{width:100%;height:100%;display:block;overflow:visible}
    .tk-ends{position:absolute;left:6%;right:6%;bottom:14px;display:flex;justify-content:space-between;font-size:11.5px;font-weight:700;color:var(--muted)}
    .tk-where{margin-top:14px;text-align:center}
    .tk-where small{display:block;font-size:13px;font-weight:700;color:var(--gold)}
    .tk-where b{display:block;font-family:var(--display);font-weight:600;font-size:clamp(19px,5.5vw,24px);line-height:1.15;color:#fff}
    .tk-where span{display:block;margin-top:2px;font-size:14px;color:var(--muted)}
    .tk-hero{margin-bottom:14px;padding:18px 14px 16px;border-radius:20px;text-align:center;color:#fff;background:linear-gradient(180deg,#e8404f,#a3162a);border:1.5px solid rgba(255,214,140,.7);box-shadow:0 8px 22px rgba(0,0,0,.35)}
    .tk-hero svg{color:var(--gold);margin-bottom:4px}
    .tk-hero b{display:block;font-family:var(--display);font-weight:600;font-size:clamp(26px,8vw,36px);line-height:1.1}
    .tk-hero small{display:block;margin-top:6px;font-size:15px;color:#ffe9ec}
    .tk-hero.hot{animation:tk-hot 1.2s ease-in-out infinite}
    @keyframes tk-hot{0%,100%{box-shadow:0 8px 22px rgba(0,0,0,.35),0 0 0 0 rgba(255,214,140,.55)}50%{box-shadow:0 8px 22px rgba(0,0,0,.35),0 0 0 14px rgba(255,214,140,0)}}
    .tk-banner{position:relative;display:flex;align-items:center;gap:12px;width:100%;max-width:440px;min-height:68px;margin:12px auto 0;padding:10px 16px 10px 14px;border-radius:20px;text-align:left;color:#fff;background:linear-gradient(180deg,#ee4a5a,#a3162a);border:2px solid rgba(255,214,140,.85);box-shadow:0 8px 22px rgba(0,0,0,.45);animation:tk-hot 1.8s ease-in-out infinite}
    .tk-banner.hot{animation-duration:.9s}
    .tk-banner svg{flex:none;color:var(--gold)}
    .tk-banner span{flex:1;min-width:0}
    .tk-banner b{display:block;font-family:var(--display);font-weight:600;font-size:clamp(18px,5.4vw,22px);line-height:1.1}
    .tk-banner small{display:block;margin-top:2px;font-size:13.5px;font-weight:600;color:#ffe9ec;line-height:1.25}
    .tk-banner i{flex:none;font-style:normal;font-weight:800;font-size:13.5px;color:var(--gold-ink);background:var(--gold);border-radius:999px;padding:7px 13px}
  `);

  /* the moment (as a real Date) Santa reaches a stop this season */
  const eveYear = () => { const n = A.now(); return n.getMonth() === 0 ? n.getFullYear() - 1 : n.getFullYear(); };
  const arrival = off => new Date(Date.UTC(eveYear(), 11, 24, 0, 0, 0) + (ARRIVES - off) * 36e5);
  const span = ms => { const m = Math.max(0, Math.round(ms / 6e4)), h = Math.floor(m / 60); return h ? h + ' hr ' + (m % 60) + ' min' : m + ' min'; };

  /* where he is right now */
  function state() {
    const now = A.now(), first = arrival(STOPS[0][1]), last = arrival(STOPS[STOPS.length - 1][1]);
    const home = arrival(-now.getTimezoneOffset() / 60), out = { home: home, now: now, total: STOPS.length };
    /* how close he is to you, in words: worked out from the time until he reaches 11 pm where you are */
    const hrs = (home - now) / 36e5;
    let lvl = 7, big = 'Santa has been to your house!', small = 'Go look under the tree in the morning.';
    if (now < first) { lvl = 0; big = 'Santa is at the North Pole'; small = 'Loading the sleigh. He leaves soon.'; }
    else if (hrs > 6) { lvl = 1; big = 'Santa is on his way'; small = 'He is still a long way from your neighborhood.'; }
    else if (hrs > 3) { lvl = 2; big = 'Santa is getting closer to your neighborhood'; small = 'Keep an eye on the clock.'; }
    else if (hrs > 1) { lvl = 3; big = 'Santa is almost at your neighborhood'; small = 'Time to get ready for bed.'; }
    else if (hrs > .25) { lvl = 4; big = 'Santa is very close to your neighborhood!'; small = 'Just a few streets away. Get in bed!'; }
    else if (hrs > 0) { lvl = 5; big = 'Santa is near your house!'; small = 'Lights out, right now!'; }
    else if (hrs > -1) { lvl = 6; big = 'Santa is at your house right now'; small = 'Shh. Stay in bed.'; }
    out.lvl = lvl; out.homeText = big; out.homeSub = small;
    if (now < first) return Object.assign(out, { phase: 'before', title: 'At the North Pole', sub: 'Loading the sleigh. He leaves in ' + span(first - now) + '.', done: 0, at: 0 });
    if (now >= new Date(last.getTime() + 36e5)) return Object.assign(out, { phase: 'after', title: 'Back at the North Pole', sub: 'Every stop is done. See you next year.', done: STOPS.length, at: 1 });
    let i = 0; while (i + 1 < STOPS.length && now >= arrival(STOPS[i + 1][1])) i++;
    const next = STOPS[i + 1];
    out.phase = 'flying'; out.title = 'Over ' + STOPS[i][0]; out.done = i + 1;
    out.sub = next ? 'Next stop: ' + next[0] + ', in ' + span(arrival(next[1]) - now) : 'The last stop of the night.';
    out.at = Math.min(1, (now - first) / (last - first));
    return out;
  }

  /* shown all day on the 24th and through Christmas morning */
  function live() {
    const n = A.now(), y = eveYear();
    return n >= new Date(y, 11, 24) && n < new Date(y, 11, 25, 12);
  }

  /* the big banner on the home page, all of Christmas Eve */
  function chipHTML() {
    if (!live()) return '';
    const s = state();
    return '<button class="tk-banner' + (s.lvl >= 4 && s.lvl < 7 ? ' hot' : '') + '" id="tkChip">' + A.icon('sleigh', 34) + '<span><b>' + (s.lvl >= 7 ? 'Santa has been!' : 'Track Santa live') + '</b><small>' + esc(s.homeText) + '</small></span><i>' + (s.lvl >= 7 ? 'Look' : 'Track') + '</i></button>';
  }
  function wire(root) { const b = $('#tkChip', root); if (b) b.onclick = sheet; }

  /* keep the banner's words current while the app is open, and pop the tracker up the first time today and when he gets close */
  const seen = () => A.store.raw.get('tkSeen', {}) || {};
  function nudge() {
    if (!live() || !A.me || !A.me()) return;
    const s = state(), b = document.querySelector('#tkChip');
    if (b) { const sm = b.querySelector('small'); if (sm && sm.textContent !== s.homeText) sm.textContent = s.homeText; b.classList.toggle('hot', s.lvl >= 4 && s.lvl < 7); }
    const y = String(eveYear()), k = seen(), mark = s.lvl >= 5 ? 5 : s.lvl >= 4 ? 4 : 1;
    if (k.y === y && (k.lvl || 0) >= mark) return;
    if (A.ui.sheetOpen() || (A.tour && A.tour.running && A.tour.running())) return;
    A.store.raw.set('tkSeen', { y: y, lvl: mark });
    sheet();
  }
  setInterval(nudge, 20000); setTimeout(nudge, 6000);

  function sheet() {
    let timer = 0, stars = '';
    for (let i = 0; i < 26; i++) stars += '<i style="left:' + ((i * 37) % 100) + '%;top:' + ((i * 53) % 62) + '%;opacity:' + (.35 + (i % 5) * .13).toFixed(2) + '"></i>';
    const art = ($('#santa') || {}).innerHTML || '';
    A.ui.sheet({
      title: 'Santa tracker',
      html: '<div class="tk-hero" id="tkHero">' + A.icon('home', 28) + '<b id="tkHome"></b><small id="tkHomeSub"></small></div>' +
        '<div class="tk-sky">' + stars + '<div class="tk-earth"></div><div class="tk-track"></div><div class="tk-sled" id="tkSled">' + art + '</div><div class="tk-ends"><span>Pacific</span><span>Hawaii</span></div></div>' +
        '<div class="tk-where"><small id="tkCount"></small><b id="tkTitle"></b><span id="tkSub"></span></div>' +
        '<p class="sf-foot" data-keep>He shows up at about 11 at night, so the tracker follows 11 pm around the world.</p>',
      onMount(el) {
        const draw = () => {
          const s = state();
          $('#tkSled', el).style.left = (6 + s.at * 88) + '%';
          $('#tkCount', el).textContent = s.phase === 'flying' ? 'Stop ' + s.done + ' of ' + s.total : s.phase === 'before' ? 'Not yet' : 'All ' + s.total + ' stops done';
          $('#tkTitle', el).textContent = s.phase === 'flying' ? 'Santa is over ' + s.title.slice(5) : s.title;
          $('#tkSub', el).textContent = s.sub;
          $('#tkHome', el).textContent = s.homeText;
          $('#tkHomeSub', el).textContent = s.homeSub;
          $('#tkHero', el).classList.toggle('hot', s.lvl >= 4 && s.lvl < 7);
        };
        draw(); timer = setInterval(draw, 15000);
      },
      onClose() { clearInterval(timer); }
    });
  }

  A.tracker = { chipHTML, wire, sheet, live, state, stops: STOPS };
})();
