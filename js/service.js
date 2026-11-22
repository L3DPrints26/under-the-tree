/* Under the Tree: Day of service.
   Behind every advent door there is also one idea for doing something for someone else. It fits the day:
   Sundays are restful (no rush, nothing to buy), Wednesdays are busy (about ten minutes), Saturdays are a free
   afternoon, the other days are easy. The idea for a day is picked from the group's id, the year and the day,
   so everyone in one group sees the same one, and another group gets different ones. Anyone can pick a different
   idea from the list, and that choice is saved with the group, so it changes for everyone.
   Saved with the group under "svc": { "2026-6": "r4" }. */
(function () {
  'use strict';
  const A = window.App, esc = A.esc;

  /* r = restful (Sunday), q = quick (busy days), e = easy (about half an hour), b = bigger (a free afternoon) */
  const POOL = {
    r: [
      "Bake something and take it, with a parent, to a family who could use a lift.",
      "Write a kind note to someone who helps others a lot, and thank them by name.",
      "Call or visit a grandparent or someone who lives alone. Mostly listen.",
      "Write a letter to someone far from home: a missionary, a soldier, a college student.",
      "Take a plate of treats to a neighbor you do not know well. Go with a parent.",
      "Visit someone who could not get out this week. Bring a card and stay a while.",
      "Make Christmas cards for a care home. A parent can drop them off this week.",
      "Read a Christmas story to a younger cousin, a brother or a sister.",
      "Write down three people who helped you this year, then tell each one thank you.",
      "Take dinner to someone who is sick or just had a baby. Go with a parent.",
      "Make a hot chocolate kit in a jar (cocoa, marshmallows, a candy cane) and give it away.",
      "Think of someone who seems lonely right now. Send them a message that says you noticed.",
      "Sing one Christmas song for a neighbor or a relative who would love it.",
      "Put a plate of cookies and a note on the porch of someone who has had a hard year. Go with a parent."
    ],
    q: [
      "Text someone who is having a hard week. Tell them one thing you like about them.",
      "Say Merry Christmas and hold the door for every person you pass today.",
      "Leave a kind note on a teacher's, coach's or teammate's desk or bag.",
      "Thank a teacher, a coach or a bus driver. Say it out loud, by name.",
      "Pick up any trash you see on the way to school or practice.",
      "Let someone go first in line today. Every time.",
      "Send a thank-you text to the person who drives you places.",
      "Tape a candy cane and a note to a neighbor's door.",
      "Give three different people one honest compliment.",
      "Clear the table and do the dishes so someone else gets a free evening.",
      "Sit with someone who is alone at lunch or at the game.",
      "Ask a parent, \"What can I take off your plate tonight?\" Then do it.",
      "Call a grandparent for five minutes.",
      "Leave a thank-you note for the person who cleans or helps at your school or church.",
      "Send a short video message to someone who lives far away.",
      "Put one thing you do not wear by the door for the donation box."
    ],
    e: [
      "Make a batch of cookies and share them with neighbors on your street. Go with a parent.",
      "Shovel, rake or sweep for a neighbor who could use the help. Do not ask for anything.",
      "Fill a bag with canned food and take it to a food pantry or a church collection.",
      "Make cards for a nursing home. A parent can drop them off.",
      "Give books and toys you have outgrown to someone who will love them.",
      "Make a care package for a friend who is sick or sad: a snack, a note, a small treat.",
      "Take the garbage cans in or out for an older neighbor.",
      "Help a younger kid with reading or homework for half an hour.",
      "Write thank-you cards to three people who helped you this year.",
      "Make a card for someone who has no family nearby and deliver it with a parent.",
      "Pack a hot chocolate kit for a family and leave it on their porch.",
      "Offer a free hour of babysitting so a parent can wrap presents in peace.",
      "Wash or clean something for someone else: their car, their garage, their kitchen.",
      "Make a big pot of soup or a batch of rolls for someone having a hard time.",
      "Gather warm hats, gloves and socks from your house for a shelter or a school.",
      "Bake for people who work on Christmas: the fire station, a nurse, a store worker."
    ],
    b: [
      "Sing Christmas songs at a care home or for a neighbor. Call ahead first.",
      "Bake with a friend and take plates to five homes on your street. Go with a parent.",
      "Do a full yard cleanup or snow shoveling for an older neighbor or a single parent.",
      "Volunteer at a food bank, a shelter or a Christmas drive with your family.",
      "Pick a family in need and gather gifts or groceries for them together. Ask your church or school for a name.",
      "Tie a fleece blanket for a shelter or a child in the hospital.",
      "Cook Christmas dinner and invite someone who would be alone.",
      "Put together ten care kits (socks, snacks, a note) and hand them out with a parent.",
      "Help someone put up their tree or decorations who cannot do it on their own.",
      "Spend an afternoon doing house or yard jobs for someone who is sick or recovering.",
      "Run a coat, toy or food drive on your street or at school.",
      "Visit a veterans' home or senior center and play a game with the people there.",
      "Cook a whole meal and deliver it hot to a family who needs a night off.",
      "Make a gift basket for the person who does the most for everyone you know.",
      "Clean up a park or a trail with a parent.",
      "Give a whole afternoon to a neighbor's moving, fixing or sorting."
    ]
  };
  const KINDS = {
    r: ['Restful', 'No rush, nothing to buy'],
    q: ['Quick', 'About ten minutes'],
    e: ['Easy', 'About half an hour'],
    b: ['Bigger', 'A free afternoon']
  };
  const SPECIAL = {
    24: { id: 'x24', k: 'q', t: "Take a plate of treats or a card to a neighbor before dark. Ring the bell, say Merry Christmas, and head home." },
    25: { id: 'x25', k: 'r', t: "Check on someone who might be alone today. Call them, or ask them to come over." }
  };
  const DAYNAME = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const WHY = { r: 'Sunday is a day of rest', q: 'Busy day, so a short one', e: 'A good size for today', b: 'A free day, so a bigger one' };

  const byId = {};
  Object.keys(POOL).forEach(k => POOL[k].forEach((t, i) => { byId[k + (i + 1)] = { id: k + (i + 1), k: k, t: t }; }));
  Object.keys(SPECIAL).forEach(d => { byId[SPECIAL[d].id] = SPECIAL[d]; });

  const hash = s => { let h = 2166136261; String(s).split('').forEach(c => { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }); return h >>> 0; };
  const wd = (year, day) => new Date(year, 11, day).getDay();
  const kindOf = (year, day) => { const w = wd(year, day); return w === 0 ? 'r' : w === 6 ? 'b' : w === 3 ? 'q' : 'e'; };

  /* today's suggestion for this group: the same for everyone in it, and no repeats within a month */
  function suggest(year, day) {
    if (SPECIAL[day]) return SPECIAL[day];
    const k = kindOf(year, day), list = POOL[k];
    let before = 0; for (let d = 1; d < day; d++) if (!SPECIAL[d] && kindOf(year, d) === k) before++;
    const i = (hash((A.space() || 'solo') + ':' + year + ':' + k) + before) % list.length;
    return byId[k + (i + 1)];
  }
  const all = () => { const v = A.store.get('svc', null); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; };
  function current(year, day) {
    const id = all()[year + '-' + day];
    return byId[id] ? { item: byId[id], chosen: true } : { item: suggest(year, day), chosen: false };
  }
  /* things worth a word on the day */
  function hook(year, day) {
    if (day === 5) return 'Today is International Volunteer Day.';
    const t = new Date(year, 10, 1); t.setDate(1 + ((4 - t.getDay() + 7) % 7) + 21);           /* Thanksgiving: fourth Thursday of November */
    const g = new Date(t.getFullYear(), t.getMonth(), t.getDate() + 5);
    if (g.getMonth() === 11 && g.getDate() === day) return 'Today is Giving Tuesday.';
    return '';
  }
  const groupName = () => { const c = A.cloud; const g = c && c.groups ? c.groups().find(x => x.id === A.space()) : null; return g && g.name ? g.name : 'your group'; };

  A.css(`
    .sv-host{width:100%;align-self:stretch}
    .sv{margin-top:12px;padding:12px;border-radius:16px;border:1.5px dashed #6fe3a5;text-align:left;background:rgba(111,227,165,.07)}
    .sv-h{display:flex;align-items:center;justify-content:space-between;gap:8px}
    .sv-h b{font-size:13px;color:#6fe3a5}
    .sv-k{font-size:12px;font-weight:700;padding:2px 9px;border-radius:999px;background:rgba(111,227,165,.18);color:#bff3d6}
    .sv-hook{margin:6px 0 0;font-size:12.5px;font-weight:700;color:var(--gold)}
    .sv-t{margin:6px 0 4px;font-size:15.5px;line-height:1.4}
    .sv small{display:block;margin:0 0 10px;color:var(--muted);font-size:12.5px;line-height:1.35}
    .sv-sec{margin:16px 0 8px;font-size:13px;font-weight:700;color:var(--muted)}.sv-sec:first-of-type{margin-top:2px}
    .sv-sec span{font-weight:500}
    /* the pictures behind the doors: a soft color fill and a little shadow, so they do not look like thin outlines */
    .adv-in-art svg,.adv-day-art svg,svg.ph{filter:drop-shadow(0 2px 4px rgba(60,20,0,.35))}
    .adv-in-art svg :is(path,circle,rect,ellipse,polygon),.adv-day-art svg :is(path,circle,rect,ellipse,polygon),svg.ph :is(path,circle,rect,ellipse,polygon){fill:currentColor;fill-opacity:.2}
  `);

  function panel(host, year, day) {
    if (!host) return;
    const cur = current(year, day), it = cur.item, k = KINDS[it.k], h = hook(year, day);
    host.innerHTML = '<div class="sv"><div class="sv-h"><b>Day of service</b><span class="sv-k">' + k[0] + '</span></div>' +
      (h ? '<p class="sv-hook">' + esc(h) + '</p>' : '') +
      '<p class="sv-t">' + esc(it.t) + '</p>' +
      '<small>' + (cur.chosen ? 'Picked by someone in ' : 'Same for everyone in ') + esc(groupName()) + '. ' + esc(k[1]) + '.</small>' +
      '<button type="button" class="btn sm block" id="svPick">Pick a different one</button></div>';
    host.querySelector('#svPick').onclick = () => pick(host, year, day);
  }

  function pick(host, year, day) {
    const cur = current(year, day).item, fit = kindOf(year, day), w = DAYNAME[wd(year, day)];
    const order = [fit].concat(['q', 'e', 'b', 'r'].filter(k => k !== fit));
    const row = it => '<button type="button" class="pl-opt' + (it.id === cur.id ? ' on' : '') + '" data-id="' + it.id + '"><span><b>' + esc(it.t) + '</b></span>' + (it.id === cur.id ? A.icon('check', 20) : '') + '</button>';
    A.ui.sheet({
      title: 'Day of service',
      html: '<p class="muted small" style="margin-bottom:10px">Everyone in ' + esc(groupName()) + ' will see the one you pick.</p>' +
        order.map((k, n) => '<h3 class="sv-sec">' + (n === 0 ? 'Fits ' + w + ' · ' : '') + KINDS[k][0] + ' <span>' + KINDS[k][1].toLowerCase() + '</span></h3>' + POOL[k].map((t, i) => row(byId[k + (i + 1)])).join('')).join('') +
        (SPECIAL[day] ? '<h3 class="sv-sec">For today</h3>' + row(SPECIAL[day]) : ''),
      onMount(el, close) {
        el.querySelectorAll('[data-id]').forEach(b => b.onclick = () => {
          const v = all(); v[year + '-' + day] = b.dataset.id; A.store.set('svc', v);
          close(); panel(host, year, day); A.ui.toast('Saved. Everyone in the group sees this one.');
        });
      }
    });
  }

  A.service = { panel: panel, suggest: suggest, current: current };
})();
