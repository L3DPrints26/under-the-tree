/* Under the Tree: Day of service.
   Behind every advent door there is also one idea for doing something for someone else. It fits the day:
   Sundays are restful (no rush, nothing to buy), Wednesdays are busy (about ten minutes), Saturdays are a free
   afternoon, the other days are easy. The idea for a day is picked from the group's id, the year and the day,
   so everyone in one group sees the same one, and another group gets different ones. Anyone can pick a different
   idea (browse by time, or search), and that choice is saved with the group, so it changes for everyone.
   Saved with the group under "svc": { "2026-6": "r4" }. Each idea is [icon, short title, what to do]. */
(function () {
  'use strict';
  const A = window.App, esc = A.esc, $ = A.$, $$ = A.$$;

  /* r = restful (Sunday), q = quick (busy days), e = easy (about half an hour), b = bigger (a free afternoon) */
  const D = {
    r: [
      ['cookie', 'Bake and drop off', "Bake something and take it, with a parent, to a family who could use a lift."],
      ['advNote', 'Thank-you note', "Write a kind note to someone who helps others a lot, and thank them by name."],
      ['advPhone', 'Call or visit', "Call or visit a grandparent or someone who lives alone. Mostly listen."],
      ['sleigh', 'Letter to far away', "Write to someone far from home: a missionary, a soldier, a college student."],
      ['gift', 'Treat plate', "Take a plate of treats to a neighbor you do not know well. Go with a parent."],
      ['heart', 'Visit someone', "Visit someone who could not get out this week. Bring a card and stay a while."],
      ['art', 'Cards for a care home', "Make Christmas cards for a care home. A parent can drop them off this week."],
      ['book', 'Read a story', "Read a Christmas story to a younger cousin, a brother or a sister."],
      ['star', 'Three thank-yous', "Write down three people who helped you this year, then tell each one thank you."],
      ['home', 'Bring dinner', "Take dinner to someone who is sick or just had a baby. Go with a parent."],
      ['mug', 'Cocoa kit in a jar', "Make a hot chocolate kit in a jar (cocoa, marshmallows, a candy cane) and give it away."],
      ['advChat', 'Say you noticed', "Think of someone who seems lonely right now. Send them a message that says you noticed."],
      ['music', 'Sing a song', "Sing one Christmas song for a neighbor or a relative who would love it."],
      ['candle', 'Porch surprise', "Put a plate of cookies and a note on the porch of someone who has had a hard year. Go with a parent."]
    ],
    q: [
      ['advChat', 'Cheer-up text', "Text someone who is having a hard week. Tell them one thing you like about them."],
      ['bell', 'Merry Christmas, all day', "Say Merry Christmas and hold the door for every person you pass today."],
      ['advNote', 'Desk note', "Leave a kind note on a teacher's, coach's or teammate's desk or bag."],
      ['star', 'Thank a helper', "Thank a teacher, a coach or a bus driver. Say it out loud, by name."],
      ['trash', 'Pick up trash', "Pick up any trash you see on the way to school or practice."],
      ['users', 'You first', "Let someone go first in line today. Every time."],
      ['heart', 'Thank your driver', "Send a thank-you text to the person who drives you places."],
      ['candy', 'Candy cane note', "Tape a candy cane and a note to a neighbor's door."],
      ['laugh', 'Three compliments', "Give three different people one honest compliment."],
      ['todo', 'Dish duty', "Clear the table and do the dishes so someone else gets a free evening."],
      ['user', 'Sit with someone', "Sit with someone who is alone at lunch or at the game."],
      ['hand', 'Take it off their plate', "Ask a parent, \"What can I take off your plate tonight?\" Then do it."],
      ['advPhone', 'Call a grandparent', "Call a grandparent for five minutes."],
      ['sparkle', 'Thank the cleaner', "Leave a thank-you note for the person who cleans or helps at your school or church."],
      ['camera', 'Video message', "Send a short video message to someone who lives far away."],
      ['shirt', 'Give one thing away', "Put one thing you do not wear by the door for the donation box."]
    ],
    e: [
      ['cookie', 'Cookies for the street', "Make a batch of cookies and share them with neighbors on your street. Go with a parent."],
      ['snow', 'Shovel or rake', "Shovel, rake or sweep for a neighbor who could use the help. Do not ask for anything."],
      ['gift', 'Fill a food bag', "Fill a bag with canned food and take it to a food pantry or a church collection."],
      ['advNote', 'Nursing home cards', "Make cards for a nursing home. A parent can drop them off."],
      ['toy', 'Pass it on', "Give books and toys you have outgrown to someone who will love them."],
      ['heart', 'Care package', "Make a care package for a friend who is sick or sad: a snack, a note, a small treat."],
      ['trash', 'Garbage can helper', "Take the garbage cans in or out for an older neighbor."],
      ['book', 'Homework helper', "Help a younger kid with reading or homework for half an hour."],
      ['pencil', 'Three thank-you cards', "Write thank-you cards to three people who helped you this year."],
      ['home', 'Card for someone alone', "Make a card for someone who has no family nearby and deliver it with a parent."],
      ['mug', 'Cocoa on a porch', "Pack a hot chocolate kit for a family and leave it on their porch."],
      ['clock', 'Free babysitting', "Offer a free hour of babysitting so a parent can wrap presents in peace."],
      ['sparkle', 'Clean something', "Wash or clean something for someone else: their car, their garage, their kitchen."],
      ['mug', 'Soup or rolls', "Make a big pot of soup or a batch of rolls for someone having a hard time."],
      ['mitten', 'Warm things', "Gather warm hats, gloves and socks from your house for a shelter or a school."],
      ['bell', 'Bake for workers', "Bake for people who work on Christmas: the fire station, a nurse, a store worker."]
    ],
    b: [
      ['music', 'Carol at a care home', "Sing Christmas songs at a care home or for a neighbor. Call ahead first."],
      ['cookie', 'Plates for five homes', "Bake with a friend and take plates to five homes on your street. Go with a parent."],
      ['snow', 'Yard or snow day', "Do a full yard cleanup or snow shoveling for an older neighbor or a single parent."],
      ['users', 'Volunteer together', "Volunteer at a food bank, a shelter or a Christmas drive with your family."],
      ['gift', 'Help a family', "Pick a family in need and gather gifts or groceries for them together. Ask your church or school for a name."],
      ['spool', 'Tie a blanket', "Tie a fleece blanket for a shelter or a child in the hospital."],
      ['wreath', 'Christmas dinner guest', "Cook Christmas dinner and invite someone who would be alone."],
      ['list', 'Ten care kits', "Put together ten care kits (socks, snacks, a note) and hand them out with a parent."],
      ['lights', 'Decorate for someone', "Help someone put up their tree or decorations who cannot do it on their own."],
      ['home', 'House and yard jobs', "Spend an afternoon doing house or yard jobs for someone who is sick or recovering."],
      ['sleigh', 'Run a drive', "Run a coat, toy or food drive on your street or at school."],
      ['dice', 'Game day', "Visit a veterans' home or senior center and play a game with the people there."],
      ['mug', 'Hot meal delivery', "Cook a whole meal and deliver it hot to a family who needs a night off."],
      ['crown', 'Gift basket for a hero', "Make a gift basket for the person who does the most for everyone you know."],
      ['tree', 'Park cleanup', "Clean up a park or a trail with a parent."],
      ['hand', 'Help with a move', "Give a whole afternoon to a neighbor's moving, fixing or sorting."]
    ]
  };
  /* [name, short time, how it feels] */
  const KINDS = {
    r: ['Restful', 'No rush', 'Nothing to buy, nothing to rush'],
    q: ['Quick', '10 minutes', 'About ten minutes'],
    e: ['Easy', '30 minutes', 'About half an hour'],
    b: ['Bigger', 'A free afternoon', 'Takes a free afternoon']
  };
  const SPECIAL = {
    24: { id: 'x24', k: 'q', i: 'gift', h: 'Treats at the door', t: "Take a plate of treats or a card to a neighbor before dark. Ring the bell, say Merry Christmas, and head home." },
    25: { id: 'x25', k: 'r', i: 'heart', h: 'Check on someone alone', t: "Check on someone who might be alone today. Call them, or ask them to come over." }
  };
  const DAYNAME = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const byId = {};
  Object.keys(D).forEach(k => D[k].forEach((x, i) => { byId[k + (i + 1)] = { id: k + (i + 1), k: k, i: x[0], h: x[1], t: x[2] }; }));
  Object.keys(SPECIAL).forEach(d => { byId[SPECIAL[d].id] = SPECIAL[d]; });

  const hash = s => { let h = 2166136261; String(s).split('').forEach(c => { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }); return h >>> 0; };
  const wd = (year, day) => new Date(year, 11, day).getDay();
  const kindOf = (year, day) => { const w = wd(year, day); return w === 0 ? 'r' : w === 6 ? 'b' : w === 3 ? 'q' : 'e'; };

  /* today's suggestion for this group: the same for everyone in it, and no repeats within a month */
  function suggest(year, day) {
    if (SPECIAL[day]) return SPECIAL[day];
    const k = kindOf(year, day), n = D[k].length;
    let before = 0; for (let d = 1; d < day; d++) if (!SPECIAL[d] && kindOf(year, d) === k) before++;
    return byId[k + (((hash((A.space() || 'solo') + ':' + year + ':' + k) + before) % n) + 1)];
  }
  const all = () => { const v = A.store.get('svc', null); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; };
  function current(year, day) {
    const id = all()[year + '-' + day];
    return byId[id] ? { item: byId[id], chosen: true } : { item: suggest(year, day), chosen: false };
  }
  /* things worth a word on the day */
  function hook(year, day) {
    if (day === 5) return 'Today is International Volunteer Day';
    const t = new Date(year, 10, 1); t.setDate(1 + ((4 - t.getDay() + 7) % 7) + 21);           /* Thanksgiving: fourth Thursday of November */
    const g = new Date(t.getFullYear(), t.getMonth(), t.getDate() + 5);
    return g.getMonth() === 11 && g.getDate() === day ? 'Today is Giving Tuesday' : '';
  }
  const groupName = () => { const c = A.cloud; const g = c && c.groups ? c.groups().find(x => x.id === A.space()) : null; return g && g.name ? g.name : 'your group'; };

  A.css(`
    .k-r{--a1:#8a7be0;--a2:#40308f}.k-q{--a1:#f4c752;--a2:#b27410}.k-e{--a1:#46c593;--a2:#136045}.k-b{--a1:#ef6a72;--a2:#8f1329}
    .sv-ic{flex:none;display:grid;place-items:center;width:54px;height:54px;border-radius:16px;color:#fff;background:linear-gradient(160deg,var(--a1),var(--a2));box-shadow:inset 0 1px 0 rgba(255,255,255,.35),0 4px 10px rgba(0,0,0,.3)}
    .sv-ic svg{filter:drop-shadow(0 1px 2px rgba(0,0,0,.35))}
    .sv-ic svg :is(path,circle,rect,ellipse,polygon){fill:currentColor;fill-opacity:.22}
    .sv-host,.pz{width:100%;align-self:stretch}
    .pz-act{padding:14px;border:1.5px solid var(--a1);border-radius:20px;background:linear-gradient(160deg,rgba(255,255,255,.07),rgba(255,255,255,.02));box-shadow:0 6px 18px rgba(0,0,0,.25)}
    .pz-act .sv-t{margin:12px 0 12px}
    .sv{margin-top:12px;padding:14px;border-radius:20px;text-align:left;background:linear-gradient(160deg,rgba(255,255,255,.07),rgba(255,255,255,.02));border:1.5px solid var(--a1);box-shadow:0 6px 18px rgba(0,0,0,.25)}
    .sv-top{display:flex;align-items:center;gap:12px}
    .sv-top>span{min-width:0}
    .sv-lab{display:block;font-size:12.5px;font-weight:700;color:var(--a1);margin-bottom:2px}
    .sv-title{display:block;font-family:var(--display);font-size:clamp(20px,5.8vw,25px);font-weight:600;line-height:1.12}
    .sv-t{margin:12px 0 10px;font-size:15.5px;line-height:1.45;color:#e8eefa}
    .sv-chips{display:flex;flex-wrap:wrap;gap:6px}
    .sv-chip{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:999px;font-size:12.5px;font-weight:700;background:rgba(255,255,255,.09);color:#dbe6f4}
    .sv-chip.k{background:linear-gradient(160deg,var(--a1),var(--a2));color:#fff}
    .sv-chip.hook{background:rgba(233,196,106,.2);color:var(--gold)}
    .sv-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:12px}
    .sv-foot small{font-size:12.5px;color:var(--muted);line-height:1.3}
    .sv-foot .btn{flex:none}
    .sv-q{position:sticky;top:0;z-index:2;padding-bottom:8px;background:var(--surface,#0f1b33)}
    .sv-tabs{display:flex;gap:6px;overflow-x:auto;padding:2px 0 10px;scrollbar-width:none}
    .sv-tabs::-webkit-scrollbar{display:none}
    .sv-tab{flex:none;min-height:36px;padding:0 14px;border-radius:999px;font-weight:700;font-size:13.5px;background:var(--surface2);border:1.5px solid var(--line2);color:var(--muted)}
    .sv-tab.on{background:var(--gold);border-color:var(--gold);color:var(--gold-ink)}
    .sv-tab small{display:block;font-size:10.5px;font-weight:700;opacity:.8;line-height:1}
    .sv-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
    .sv-card{position:relative;display:flex;flex-direction:column;gap:6px;min-width:0;padding:10px;border-radius:16px;text-align:left;background:var(--surface2);border:1.5px solid var(--line2);color:#fff;transition:transform .12s,border-color .12s}
    .sv-card:active{transform:scale(.98)}
    .sv-card .sv-ic{width:40px;height:40px;border-radius:12px}
    .sv-card b{font-size:14.5px;line-height:1.2}
    .sv-card .sv-d{font-size:12.5px;line-height:1.35;color:#c4d0e4;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
    .sv-card .sv-m{margin-top:auto;font-size:11.5px;font-weight:700;color:var(--a1)}
    .sv-card.on{border-color:var(--gold);box-shadow:0 0 0 2px rgba(233,196,106,.35)}
    .sv-card .sv-ck{position:absolute;top:8px;right:8px;color:var(--gold)}
    .sv-none{grid-column:1/-1;padding:24px 0;text-align:center;color:var(--muted)}
    /* the pictures behind the doors: a soft color fill and a little shadow, so they do not look like thin outlines */
    .adv-in-art svg,.adv-day-art svg,svg.ph{filter:drop-shadow(0 2px 4px rgba(60,20,0,.35))}
    .adv-in-art svg.illus,.adv-day-art svg.illus{stroke:none}
    .adv-in-art svg.illus{width:calc(var(--u)*.64);height:calc(var(--u)*.64)}
    .adv-in-art svg:not(.illus) :is(path,circle,rect,ellipse,polygon),.adv-day-art svg:not(.illus) :is(path,circle,rect,ellipse,polygon),svg.ph :is(path,circle,rect,ellipse,polygon){fill:currentColor;fill-opacity:.2}
  `);

  const chips = it => '<span class="sv-chip k">' + KINDS[it.k][0] + '</span><span class="sv-chip">' + A.icon('clock', 13) + KINDS[it.k][1] + '</span>' + (/parent/i.test(it.t) ? '<span class="sv-chip">' + A.icon('users', 13) + 'With a parent</span>' : '');

  function panel(host, year, day) {
    if (!host) return;
    const cur = current(year, day), it = cur.item, h = hook(year, day);
    host.innerHTML = '<div class="sv k-' + it.k + '"><div class="sv-top"><span class="sv-ic">' + A.icon(it.i, 30) + '</span><span><small class="sv-lab">Day of service</small><b class="sv-title">' + esc(it.h) + '</b></span></div>' +
      '<p class="sv-t">' + esc(it.t) + '</p>' +
      '<div class="sv-chips">' + chips(it) + (h ? '<span class="sv-chip hook">' + A.icon('star', 13) + esc(h) + '</span>' : '') + '</div>' +
      '<div class="sv-foot"><small>' + (cur.chosen ? 'Picked for everyone in ' : 'Same for everyone in ') + esc(groupName()) + '</small><button type="button" class="btn sm" id="svPick">More ideas</button></div></div>';
    host.querySelector('#svPick').onclick = () => pick(host, year, day);
  }

  /* browse by time, or search: icons, short titles, tap one to pick it for the whole group */
  function pick(host, year, day) {
    const cur = current(year, day).item, fit = kindOf(year, day), w = DAYNAME[wd(year, day)];
    const order = [fit].concat(['q', 'e', 'b', 'r'].filter(k => k !== fit));
    let tab = fit, q = '';
    const items = () => {
      const base = [].concat(SPECIAL[day] ? [SPECIAL[day]] : [], order.reduce((a, k) => a.concat(D[k].map((x, i) => byId[k + (i + 1)])), []));
      const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
      if (terms.length) return base.filter(it => { const s = (it.h + ' ' + it.t + ' ' + KINDS[it.k][0]).toLowerCase(); return terms.every(t => s.indexOf(t) >= 0); });
      return tab === 'all' ? base : base.filter(it => it.k === tab && !(SPECIAL[day] && it.id === SPECIAL[day].id && it.k !== tab));
    };
    const card = it => '<button type="button" class="sv-card k-' + it.k + (it.id === cur.id ? ' on' : '') + '" data-id="' + it.id + '"><span class="sv-ic">' + A.icon(it.i, 22) + '</span><b>' + esc(it.h) + '</b><span class="sv-d">' + esc(it.t) + '</span><span class="sv-m">' + esc(KINDS[it.k][1]) + '</span>' + (it.id === cur.id ? '<span class="sv-ck">' + A.icon('check', 18) + '</span>' : '') + '</button>';
    A.ui.sheet({
      title: 'Day of service',
      html: '<div class="sv-q"><input class="input" id="svQ" type="search" placeholder="Search, like cookies or call" autocomplete="off"></div>' +
        '<div class="sv-tabs" id="svTabs">' + ['all'].concat(order).map(k => '<button type="button" class="sv-tab' + (k === tab ? ' on' : '') + '" data-k="' + k + '">' + (k === 'all' ? 'All' : KINDS[k][0]) + (k === fit ? '<small>' + w + '</small>' : '') + '</button>').join('') + '</div>' +
        '<div class="sv-grid" id="svGrid"></div>' +
        '<p class="muted small" style="margin:12px 0 0">Everyone in ' + esc(groupName()) + ' sees the one you pick.</p>',
      onMount(el, close) {
        const grid = $('#svGrid', el);
        const draw = () => {
          const l = items();
          grid.innerHTML = l.length ? l.map(card).join('') : '<p class="sv-none">Nothing matches. Try another word.</p>';
          $$('[data-id]', grid).forEach(b => b.onclick = () => {
            const v = all(); v[year + '-' + day] = b.dataset.id; A.store.set('svc', v);
            close(); panel(host, year, day); A.ui.toast('Saved. Everyone in the group sees this one.');
          });
        };
        $$('.sv-tab', el).forEach(b => b.onclick = () => { tab = b.dataset.k; q = ''; $('#svQ', el).value = ''; $$('.sv-tab', el).forEach(x => x.classList.toggle('on', x === b)); draw(); });
        $('#svQ', el).oninput = e => { q = e.target.value; draw(); };
        draw();
      }
    });
  }

  A.service = { panel: panel, suggest: suggest, current: current };
})();
