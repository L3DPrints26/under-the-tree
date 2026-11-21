/* Under the Tree: advent prizes.
   Every door gives a prize, and a small activity for that day. The prizes get better as December goes on
   (small, nice, big, grand). Each one is a new color or stamp for the ornament studio, or a charm that
   hangs on the home tree. Doing the day's activity gives a bonus prize.
   Nothing is stored in a list: the year and the day pick the prize, so every year is different, and
   the colors and charms never run out. Stamps come from a fixed set (more can be added later).
   What a device has won is kept on that device only. */
(function () {
  'use strict';
  const A = window.App, esc = A.esc;
  const KEY = 'prizes';
  const get = () => { const v = A.store.raw.get(KEY, null); return v && typeof v === 'object' && v.got ? v : { got: {} }; };
  const put = v => A.store.raw.set(KEY, v);

  const tier = d => d <= 8 ? 1 : d <= 16 ? 2 : d <= 23 ? 3 : 4;
  const TIER_NAME = ['', 'Small prize', 'Nice prize', 'Big prize', 'Grand prize'];

  function rng(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function hex(h, s, l) {
    h = (h % 360 + 360) % 360; s /= 100; l /= 100;
    const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return '#' + [f(0), f(8), f(4)].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
  }
  const HUES = [['Red', 355], ['Orange', 25], ['Gold', 45], ['Lime', 80], ['Green', 130], ['Mint', 160], ['Teal', 180], ['Sky', 200], ['Blue', 220], ['Indigo', 255], ['Purple', 285], ['Pink', 325]];
  const SHADE = { 1: ['Soft', 55, 76], 2: ['Bright', 85, 60], 3: ['Deep', 75, 42], 4: ['Royal', 92, 52] };

  const STAMPS = {
    1: [['mitten', 'Mitten'], ['cookie', 'Cookie'], ['mug', 'Cocoa mug'], ['hat', 'Santa hat']],
    2: [['stocking', 'Stocking'], ['snowman', 'Snowman'], ['candle', 'Candle'], ['wreath', 'Wreath']],
    3: [['lights', 'Lights'], ['deer', 'Reindeer'], ['sleigh', 'Sleigh'], ['music', 'Music note']],
    4: [['crown', 'Crown'], ['trophy', 'Trophy'], ['book', 'Story book']]
  };
  const ITEMS = {
    1: [['candy', 'candy cane'], ['bell', 'bell'], ['snow', 'snowflake'], ['cookie', 'cookie'], ['mitten', 'mitten']],
    2: [['stocking', 'stocking'], ['mug', 'mug'], ['snowman', 'snowman'], ['wreath', 'wreath'], ['holly', 'holly']],
    3: [['lights', 'string of lights'], ['deer', 'reindeer'], ['sleigh', 'sleigh'], ['gift', 'present'], ['crown', 'crown']]
  };
  /* one activity for each day that is not already a mission. Easy early, bigger later. */
  const ACTS = {
    1: ['Tell someone one thing you like about them.', 'Hum a Christmas song to someone.', 'Hang one new decoration somewhere.', 'Give someone a hug for no reason.',
      'Draw your favorite Christmas thing.', 'Tell someone your favorite Christmas memory.', 'Wear something red or green today.', 'Say thank you to someone who does a lot for you.', 'Count the Christmas lights on your street.'],
    2: ['Write down three things you are thankful for.', 'Make a paper snowflake and tape it to a window.', 'Pick one thing you do not use and give it away.', 'Set the table without being asked.',
      'Make a Christmas playlist and play it at dinner.', 'Ask an older relative what Christmas was like when they were a kid.', 'Wrap one gift.', 'Have a ten minute pillow fight.',
      'Write a short note to a friend.', 'Make hot chocolate for someone else.', 'Teach someone your favorite Christmas song.'],
    3: ['Make a gift by hand for someone.', 'Write a real Christmas card and hand it to someone.', 'Bake something and take it to a neighbor.', 'Play a board game together with no phones.',
      'Clean up a room as a surprise.', 'Make breakfast for the whole family.', 'Sing a carol together, even badly.', 'Write a letter to one person about why they matter to you.', 'Wrap a gift for someone in your family.']
  };
  const ACT24 = 'Leave cookies and milk out for Santa. Then read the Christmas story together. Luke, chapter 2.';

  function activity(year, day, mission) {
    if (day === 24) return ACT24;
    if (mission) return 'Do today’s mission above. Then tap the button.';
    const t = tier(day), list = ACTS[t] || ACTS[3];
    return list[(((day * 5 + (year - 2026) * 4) % list.length) + list.length) % list.length];
  }

  /* which kind each of days 1 to 23 gives this year */
  function order(year) {
    const r = rng(year * 31 + 7), a = [];
    for (let i = 0; i < 23; i++) a.push(i < 8 ? 'stamp' : i < 16 ? 'color' : 'item');
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const x = a[i]; a[i] = a[j]; a[j] = x; }
    return a;
  }
  const pick = (r, list) => list[Math.floor(r() * list.length)];
  function color(r, t) {
    const h = pick(r, HUES), s = SHADE[t], c = hex(h[1] + r() * 16 - 8, s[1], s[2]);
    return { name: s[0] + ' ' + h[0].toLowerCase(), hex: c, hue: h[0] };
  }
  function make(year, day, bonus) {
    const r = rng(year * 1000 + day * 2 + (bonus ? 1 : 0)), t = tier(day), have = get().got;
    if (day === 25 && !bonus) return { k: 'item', id: 'star', name: 'Golden star topper', hex: '#ffd24a', t: 4 };
    let kind = bonus ? (r() < .5 ? 'stamp' : 'color') : day === 24 ? 'stamp' : order(year)[day - 1];
    if (kind === 'stamp') {
      const owned = Object.keys(have).map(k => have[k]).filter(p => p.k === 'stamp').map(p => p.id);
      let c = (STAMPS[t] || []).filter(s => owned.indexOf(s[0]) < 0);
      if (!c.length) c = [].concat(STAMPS[1], STAMPS[2], STAMPS[3], STAMPS[4]).filter(s => owned.indexOf(s[0]) < 0);
      if (c.length) { const s = pick(r, c); return { k: 'stamp', id: s[0], name: s[1] + ' stamp', t: t }; }
      kind = 'color';
    }
    if (kind === 'color') { const c = color(r, t); return { k: 'color', id: c.hex, name: c.name, hex: c.hex, t: t }; }
    const it = pick(r, ITEMS[t] || ITEMS[3]), c = color(r, t);
    return { k: 'item', id: it[0], name: c.hue + ' ' + it[1], hex: c.hex, t: t, y: year };
  }
  function ensure(year, day, bonus) {
    const key = year + '-' + day + (bonus ? 'b' : ''), g = get();
    if (!g.got[key]) { const p = make(year, day, bonus); p.y = year; g.got[key] = p; put(g); }
    return g.got[key];
  }
  const all = () => { const g = get().got; return Object.keys(g).map(k => g[k]); };
  const yearNow = () => { const n = A.now(); return n.getMonth() === 11 && n.getDate() > 25 ? n.getFullYear() : A.xmas().getFullYear(); };
  const stamps = () => all().filter(p => p.k === 'stamp').map(p => p.id);
  const colors = () => all().filter(p => p.k === 'color').map(p => p.hex);
  const items = year => all().filter(p => p.k === 'item' && (year == null || p.y === year));

  A.css(`
    .pz{margin:14px 0 4px;text-align:left}
    .pz-tier{display:inline-block;margin-bottom:8px;padding:3px 11px;border-radius:999px;font-size:12.5px;font-weight:700;background:var(--surface2);color:var(--muted)}
    .pz-tier.t2{background:#1f3a2a;color:#9fe3b5}.pz-tier.t3{background:#3a2f12;color:var(--gold)}.pz-tier.t4{background:var(--gold);color:var(--gold-ink)}
    .pz-card{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:16px;background:var(--surface2);border:1.5px solid var(--line2)}
    .pz-card b{display:block;font-size:16px}.pz-card small{display:block;color:var(--muted);font-size:13px}
    .pz-ic{flex:none;display:grid;place-items:center;width:46px;height:46px;border-radius:14px;background:rgba(255,255,255,.07)}
    .pz-sw{flex:none;width:46px;height:46px;border-radius:50%;border:2px solid rgba(255,255,255,.45)}
    .pz-act{margin-top:12px;padding:12px;border-radius:16px;border:1.5px dashed var(--gold)}
    .pz-act>b{display:block;font-size:13px;color:var(--gold)}
    .pz-act p{margin:4px 0 10px;font-size:15.5px;line-height:1.4}
    .pz-bonus{margin:0 0 6px!important;font-size:13px!important;font-weight:600;color:var(--muted)}
    .pz-shelf h4{margin:16px 0 8px;font-size:14px;color:var(--muted)}.pz-shelf h4:first-child{margin-top:0}
    .pz-row{display:flex;flex-wrap:wrap;gap:8px}
    .pz-row .pz-sw{width:34px;height:34px}
    .pz-row .pz-ic{width:44px;height:44px}
    .pz-strip{display:flex;justify-content:center;gap:8px;height:30px;margin:0 0 4px;overflow:hidden;white-space:nowrap}
    .pz-strip svg{filter:drop-shadow(0 1px 3px rgba(0,0,0,.5))}
  `);

  function card(p) {
    const art = p.k === 'color' ? '<i class="pz-sw" style="background:' + p.hex + '"></i>' : '<span class="pz-ic" style="color:' + (p.hex || 'var(--gold)') + '">' + A.icon(p.id, 32) + '</span>';
    const what = p.k === 'stamp' ? 'New stamp in the ornament studio' : p.k === 'color' ? 'New color in the ornament studio' : 'Now hanging on your tree';
    return '<div class="pz-card">' + art + '<span><b>' + esc(p.name) + '</b><small>' + what + '</small></span></div>';
  }

  /* the prize and the activity inside a day's pop-up */
  function panel(host, year, day, mission) {
    if (!host) return;
    const p = ensure(year, day, false), t = tier(day), key = year + '-' + day + 'b';
    host.innerHTML = '<span class="pz-tier t' + t + '">' + TIER_NAME[t] + '</span>' + card(p) +
      '<div class="pz-act"><b>Today’s activity</b><p>' + esc(activity(year, day, mission)) + '</p><div class="pz-slot"></div></div>';
    const slot = host.querySelector('.pz-slot');
    function show(fresh) {
      const b = get().got[key];
      if (b) {
        slot.innerHTML = '<p class="pz-bonus">Bonus for doing it:</p>' + card(b);
        if (fresh && A.fx && A.fx.confetti && !A.reduced) { const r = slot.getBoundingClientRect(); A.fx.confetti(r.left + r.width / 2, r.top + 20, 70); }
      } else {
        slot.innerHTML = '<button type="button" class="btn primary block">I did it</button>';
        slot.firstChild.onclick = () => { ensure(year, day, true); show(true); };
      }
    }
    show(false);
  }

  /* everything he has won so far */
  function shelf() {
    const years = {}, it = items();
    it.forEach(p => { (years[p.y] = years[p.y] || []).push(p); });
    const ys = Object.keys(years).sort().reverse(), cs = all().filter(p => p.k === 'color'), ss = all().filter(p => p.k === 'stamp');
    const html = '<div class="pz-shelf">' +
      '<h4>Tree charms</h4>' + (ys.length ? ys.map(y => '<p style="margin:6px 0 4px;font-size:13px;color:var(--muted)">' + y + '</p><div class="pz-row">' + years[y].map(p => '<span class="pz-ic" title="' + esc(p.name) + '" style="color:' + p.hex + '">' + A.icon(p.id, 28) + '</span>').join('') + '</div>').join('') : '<p class="muted">Open a door to win one.</p>') +
      '<h4>Ornament colors (' + cs.length + ')</h4>' + (cs.length ? '<div class="pz-row">' + cs.map(p => '<i class="pz-sw" title="' + esc(p.name) + '" style="background:' + p.hex + '"></i>').join('') + '</div>' : '<p class="muted">None yet.</p>') +
      '<h4>Ornament stamps (' + ss.length + ')</h4>' + (ss.length ? '<div class="pz-row">' + ss.map(p => '<span class="pz-ic" title="' + esc(p.name) + '" style="color:var(--gold)">' + A.icon(p.id, 28) + '</span>').join('') + '</div>' : '<p class="muted">None yet.</p>') +
      '<p class="muted" style="margin-top:16px;font-size:13px">Colors and stamps show up in the ornament studio. Charms hang on your tree. A new year brings new prizes.</p>' +
      '<button type="button" class="btn primary block" data-close style="margin-top:12px">Close</button></div>';
    A.ui.sheet({ title: 'My prizes', html: html });
  }

  /* the charms on the home tree: this year's, newest last */
  function strip() {
    const list = items(yearNow()).slice(-12);
    return list.length ? '<div class="pz-strip" aria-label="Tree charms">' + list.map(p => '<span style="color:' + p.hex + '">' + A.icon(p.id, 22) + '</span>').join('') + '</div>' : '';
  }

  A.prizes = { panel: panel, shelf: shelf, strip: strip, stamps: stamps, colors: colors, count: () => all().length, hasCharms: () => items(yearNow()).length > 0 };
})();
