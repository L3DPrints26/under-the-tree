/* Under the Tree — the Santa tracker, for Christmas Eve.
   The idea is simple and the math is real: Santa shows up at about 11 at night, when everyone should
   be asleep. So right now he is wherever in the world it is 11 pm on December 24. He starts at the
   first place that reaches 11 pm (Kiritimati, in the Pacific) and follows the night west for 26 hours.
   Nothing here is saved or sent anywhere. */
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
    .tk-where b{display:block;font-family:var(--display);font-weight:600;font-size:clamp(24px,7vw,32px);line-height:1.15;color:#fff}
    .tk-where span{display:block;margin-top:2px;font-size:14px;color:var(--muted)}
    .tk-home{display:flex;align-items:center;gap:12px;margin-top:14px;padding:12px 14px;border-radius:16px;background:rgba(201,36,58,.22);border:1px solid rgba(255,122,138,.5)}
    .tk-home svg{flex:none;color:var(--gold)}
    .tk-home b{display:block;font-weight:700}.tk-home small{display:block;color:#f3d9dd;font-size:13px}
  `);

  /* the moment (as a real Date) Santa reaches a stop this season */
  const eveYear = () => { const n = A.now(); return n.getMonth() === 0 ? n.getFullYear() - 1 : n.getFullYear(); };
  const arrival = off => new Date(Date.UTC(eveYear(), 11, 24, 0, 0, 0) + (ARRIVES - off) * 36e5);
  const span = ms => { const m = Math.max(0, Math.round(ms / 6e4)), h = Math.floor(m / 60); return h ? h + ' hr ' + (m % 60) + ' min' : m + ' min'; };

  /* where he is right now */
  function state() {
    const now = A.now(), first = arrival(STOPS[0][1]), last = arrival(STOPS[STOPS.length - 1][1]);
    const home = arrival(-now.getTimezoneOffset() / 60), out = { home: home, now: now, total: STOPS.length };
    out.homeText = now < home ? 'Santa reaches you in ' + span(home - now) : now - home < 36e5 ? 'Santa is in your part of the world right now' : 'Santa has already been to your part of the world';
    out.homeSub = now < home ? 'That is 11 at night where you are. Be asleep by then.' : now - home < 36e5 ? 'Lights out. He does not stop for kids who are awake.' : 'Go look under the tree in the morning.';
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

  function chipHTML() { return live() ? '<button class="tk-chip" id="tkChip">' + A.icon('sleigh', 18) + 'Track Santa</button>' : ''; }
  function wire(root) { const b = $('#tkChip', root); if (b) b.onclick = sheet; }

  function sheet() {
    let timer = 0, stars = '';
    for (let i = 0; i < 26; i++) stars += '<i style="left:' + ((i * 37) % 100) + '%;top:' + ((i * 53) % 62) + '%;opacity:' + (.35 + (i % 5) * .13).toFixed(2) + '"></i>';
    const art = ($('#santa') || {}).innerHTML || '';
    A.ui.sheet({
      title: 'Santa tracker',
      html: '<div class="tk-sky">' + stars + '<div class="tk-earth"></div><div class="tk-track"></div><div class="tk-sled" id="tkSled">' + art + '</div><div class="tk-ends"><span>Pacific</span><span>Hawaii</span></div></div>' +
        '<div class="tk-where"><small id="tkCount"></small><b id="tkTitle"></b><span id="tkSub"></span></div>' +
        '<div class="tk-home">' + A.icon('home', 24) + '<span><b id="tkHome"></b><small id="tkHomeSub"></small></span></div>' +
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
        };
        draw(); timer = setInterval(draw, 15000);
      },
      onClose() { clearInterval(timer); }
    });
  }

  A.tracker = { chipHTML, wire, sheet, live, state, stops: STOPS };
})();
