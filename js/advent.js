/* Under the Tree: advent calendar and Christmas crackers.
   Route #/advent. Opened doors are saved per person in App.store 'advent' ({Name:[days]}).
   Test hooks: ?advdemo=open | openall | cracker | popped | dayN (for example day12). */
(function () {
  'use strict';
  const App = window.App, $ = App.$;
  const DEMO = App.qs.get('advdemo') || '';

  /* ---------- a few extra icons (24 grid, stroke) ---------- */
  Object.assign(App.icons, {
    advNote: '<rect x="3.5" y="6" width="17" height="12.5" rx="2"/><path d="M4 7.5l8 6 8-6"/>',
    advChat: '<path d="M4.5 6.500a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H11l-4.500 3.500v-3.500a2 2 0 0 1-2-2z"/><path d="M8.500 8.800h7M8.500 11.800h4.500"/>',
    advPhone: '<path d="M3.500 9.500V8.300A3.300 3.300 0 0 1 6.800 5h10.400a3.300 3.300 0 0 1 3.300 3.300v1.200h-4.300V8H7.800v1.500z"/><path d="M8.500 11.500h7l3 8h-13z"/><circle cx="12" cy="15.500" r="2"/>',
    advAntlers: '<path d="M10.800 20.500c.200-3.800-.800-6.300-3-8.300S4.300 7.800 4.500 4.500M7.300 11.800c-.300-2 .300-3.800 1.700-5.300M5 8.200L2.800 6.800"/><path d="M13.200 20.500c-.200-3.800.800-6.300 3-8.300s3.500-4.400 3.300-7.700M16.700 11.800c.300-2-.300-3.800-1.700-5.300M19 8.200l2.200-1.400"/>',
    advFlower: [0, 60, 120, 180, 240, 300].map(a => '<path transform="rotate(' + a + ' 12 12)" d="M12 11c-1.700-2-1.700-4.800 0-7.500 1.700 2.700 1.700 5.500 0 7.500z"/>').join('') + '<circle cx="12" cy="12" r="1" fill="currentColor"/>',
    advChi: '<path d="M7 5.500l10 13M17 5.500l-10 13M5.200 5.500h3.600M15.200 5.500h3.600M5.200 18.500h3.600M15.200 18.500h3.600"/>',
    advHouse: '<path d="M3.500 11.500L12 4.500l8.500 7"/><path d="M6 9.800v9.700h12V9.800"/><path d="M10 19.500V14h4v5.500"/><path d="M15.800 7.500V5h2v4.200"/>',
    advDrum: '<ellipse cx="12" cy="10.500" rx="7.500" ry="2.800"/><path d="M4.500 10.500v6c0 1.500 3.400 2.800 7.500 2.800s7.500-1.300 7.500-2.800v-6"/><path d="M8.500 13v5.800M15.500 13v5.800M12 13.300v6M6.500 3l3.500 5M17.500 3L14 8"/>',
    advTv: '<rect x="3.500" y="7" width="17" height="11.500" rx="2"/><path d="M8.500 21h7M8.500 3.500L12 7l3.500-3.500"/>'
  });

  /* ---------- what is behind each door ----------
     t: j = joke [setup, punchline], f = fact, m = mission */
  const DAYS = [null,
    { t: 'm', icon: 'music', x: 'Play the first Christmas song of the season. Loud enough for the whole house.' },
    { t: 'j', icon: 'candy', x: ["What do you call a reindeer wearing earmuffs?", "Anything you want. He can’t hear you."] },
    { t: 'f', icon: 'bell', x: 'Jingle Bells was the first song played in space. Two Gemini 6 astronauts played it on a harmonica and bells in December 1965.' },
    { t: 'm', icon: 'advNote', x: 'Leave a kind note where someone in the family will find it.' },
    { t: 'j', icon: 'hat', x: ["What kind of motorbike does Santa ride?", "A Holly Davidson."] },
    { t: 'f', icon: 'deer', x: 'Rudolph was created in 1939 for a Montgomery Ward coloring book.' },
    { t: 'm', icon: 'mug', x: 'Hot chocolate for everyone tonight. Rate each mug out of ten.' },
    { t: 'j', icon: 'gift', x: ["What do you call a snowman in July?", "A puddle with a carrot."] },
    { t: 'f', icon: 'advAntlers', x: 'Both male and female reindeer grow antlers.' },
    { t: 'm', icon: 'lights', x: 'Drive around after dark and vote on the best lights.' },
    { t: 'j', icon: 'advDrum', x: ["The tag says “From Santa.”", "Santa has Mom’s handwriting and Mom’s wrapping paper."] },
    { t: 'f', icon: 'sparkle', x: 'Tinsel was once made of real silver.' },
    { t: 'm', icon: 'advTv', x: 'Watch a Christmas movie in pajamas. Youngest person picks.' },
    { t: 'j', icon: 'heart', x: ["What is the best Christmas present?", "A broken drum. You just can’t beat it."] },
    { t: 'f', icon: 'advFlower', x: 'Poinsettias are native to Mexico.' },
    { t: 'm', icon: 'mitten', x: 'Do one chore that is not yours. Do not tell anyone.' },
    { t: 'j', icon: 'advHouse', x: ["Dad’s Christmas lights have two modes.", "Off, and visible from space."] },
    { t: 'f', icon: 'advChi', x: 'The X in Xmas comes from the Greek letter chi, the first letter of Christ in Greek.' },
    { t: 'm', icon: 'cookie', x: 'Bake something together. Cookies count. Burnt cookies also count.' },
    { t: 'j', icon: 'snowman', x: ["“Just one small gift each,” we agreed.", "Dad walked in carrying a bag labeled “small.”"] },
    { t: 'f', icon: 'candle', x: 'Silent Night was first performed on Christmas Eve in 1818, in Oberndorf, Austria.' },
    { t: 'm', icon: 'advChat', x: 'Call or text someone you will not see this Christmas.' },
    { t: 'f', icon: 'advPhone', x: 'A wrong-number phone call in 1955 started the tradition of the military tracking Santa on Christmas Eve.' },
    { t: 'm', icon: 'book', x: 'Read the Christmas story together tonight. Luke, chapter 2.' },
    { t: 'm', icon: 'star', x: 'Merry Christmas. Go wake everybody up.' }
  ];
  const KIND = {
    j: { label: 'Joke', icon: 'laugh', chip: 'red' },
    f: { label: 'Did you know', icon: 'bulb', chip: 'green' },
    m: { label: "Today's mission", icon: 'todo', chip: 'gold' }
  };

  /* ---------- cracker jokes: [setup, punchline] ---------- */
  const JOKES = [
    ["Why did the gingerbread man go to the doctor?", "He was feeling crumby."],
    ["What did the stamp say to the Christmas card?", "Stick with me and we’ll go places."],
    ["What’s Santa’s favorite candy?", "Jolly Ranchers."],
    ["What do you call Santa’s helpers?", "Subordinate clauses."],
    ["Who is Santa’s favorite singer?", "Elf-is Presley."],
    ["What do elves learn in school?", "The elf-abet."],
    ["What do you call a cat on the beach at Christmas?", "Sandy Claws."],
    ["What did one snowman say to the other?", "“Do you smell carrots?”"],
    ["Why was the Christmas tree a bad knitter?", "It kept dropping its needles."],
    ["Why did the skeleton skip the Christmas party?", "He had nobody to go with."],
    ["What do you call an elf who sings?", "A wrapper."],
    ["What kind of car do elves drive?", "A Toy-ota."],
    ["Why was Santa’s little helper so sad?", "He had low elf-esteem."],
    ["What is fruitcake?", "A brick that learned how to wear raisins."],
    ["Mom: “Don’t shake the presents.”", "Me, shaking one: “It’s socks. It’s always socks.”"],
    ["Wrapping a present takes 20 minutes.", "Opening it takes four seconds. Fireworks, but with tape."],
    ["The Elf on the Shelf reports everything to Santa.", "He’s a snitch in a cute hat."],
    ["Santa visits every house on Earth in one night.", "I can’t find my charger in my own room."],
    ["Nobody has ever finished a candy cane.", "You lose it in the couch and find it in March."],
    ["Hot chocolate is too hot for twenty minutes.", "Then perfect for exactly nine seconds."],
    ["Dad spent three hours hanging lights. One bulb died.", "He’s still on the roof. We send snacks."],
    ["My brother shakes every present to guess it.", "One was a snow globe. Was."],
    ["5 a.m. Christmas morning, a tiny voice asks, “Is it time?”", "Buddy, the sun isn’t even awake."],
    ["We put up the tree.", "The cat put it back down."],
    ["Every Christmas movie: a big-city woman goes home.", "She falls for Jake, who owns one flannel and a barn."],
    ["The family group chat in December: forty messages.", "Thirty-eight are about who’s bringing the rolls."],
    ["Matching family pajamas.", "Nobody voted. They just appeared on my bed."],
    ["Carolers sang at our door for two minutes.", "Our dog sang back for four. We tipped him."],
    ["Mom takes six hours to cook Christmas dinner.", "We eat it in eleven minutes and ask about dessert."],
  ];

  /* ---------- the printed layout ----------
     Doors 1 to 24 go in order, left to right and top to bottom, and door 25 comes last (placed by CSS).
     Colorways and textures were picked so no two touching doors match in any of the three grids. */
  const ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
  const COLOR = [0, 3, 2, 3, 0, 2, 1, 3, 4, 1, 4, 3, 1, 3, 4, 0, 2, 0, 1, 0, 2, 4, 1, 2];   /* 0 red 1 pine 2 cream 3 navy 4 gold */
  const FACE = [0, 1, 0, 2, 0, 2, 0, 1, 0, 0, 1, 0, 0, 2, 0, 2, 0, 0, 1, 0, 1, 0, 2, 0];    /* 0 numeral 1 ring 2 tag */
  const TEX = [4, 3, 0, 3, 2, 1, 0, 1, 0, 1, 0, 3, 0, 3, 0, 2, 0, 2, 1, 4, 1, 2, 4, 0];     /* 0 plain 1 pinstripe 2 dots 3 stripes 4 lattice */
  const MOTIF = ['snow', 'star', 'holly', 'tree', 'bell', 'ornament', 'candy', 'sparkle', 'wreath', 'mitten', 'candle', 'gift'];

  /* ---------- styles ---------- */
  App.css(`
.adv{flex:1;min-height:0;display:flex;flex-direction:column;
  --cols:5;--rows:5;--head:56px;--foot:3px;--bp:9px;--gap:6px;--maxr:1.04;--minr:.6;
  --cw0:calc((100cqw - 2*var(--bp) - (var(--cols) - 1)*var(--gap))/var(--cols));
  --ch0:calc((100cqh - var(--head) - var(--foot) - 2*var(--bp) - (var(--rows) - 1)*var(--gap))/var(--rows));
  --cw:min(var(--cw0),calc(var(--ch0)*var(--maxr)));
  --ch:min(var(--ch0),calc(var(--cw)/var(--minr)));
  --ub:min(var(--cw),var(--ch));
  --bw:calc(var(--cols)*var(--cw) + (var(--cols) - 1)*var(--gap) + 2*var(--bp));
  --grain:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .34 -.115'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E");
  --grain-soft:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .2 -.075'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E")}
.adv-head{flex:none;display:flex;align-items:center;gap:10px;width:var(--bw);max-width:100%;height:calc(var(--head) - 10px);margin:0 auto 10px}
.adv-ttl{flex:1;min-width:0}
.adv-title{font-family:var(--display);font-weight:600;font-size:clamp(20px,5.8cqw,27px);line-height:1.12;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.adv-status{display:flex;align-items:center;gap:6px;margin-top:1px;font-size:13px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.adv-status i{flex:none;width:6px;height:6px;border-radius:50%;background:var(--gold);display:none}
.adv-status.on{color:var(--gold)}
.adv-status.on i{display:block}
.adv-crk{flex:none}
.adv-crk svg{color:var(--gold)}

/* the board: one printed card, doors cut into it */
.adv-stage{flex:1;min-height:0;display:flex;align-items:center;justify-content:center}
.adv-board{flex:none;position:relative;padding:var(--bp);border-radius:calc(var(--bp) + 5px);
  background:
    radial-gradient(circle,rgba(255,244,214,.16) 1px,transparent 1.5px) 0 0/19px 19px,
    radial-gradient(circle,rgba(255,244,214,.09) 1px,transparent 1.5px) 9.5px 9.5px/19px 19px,
    linear-gradient(160deg,#17443a,#0c2a25 70%);
  box-shadow:0 0 0 1px rgba(233,196,106,.62),inset 0 0 0 3px #0e2f29,inset 0 0 0 4px rgba(233,196,106,.3),0 12px 28px rgba(0,0,0,.45)}
.adv-grid{display:grid;grid-template-columns:repeat(var(--cols),var(--cw));grid-template-rows:repeat(var(--rows),var(--ch));gap:var(--gap)}

.adv-cell{--u:var(--ub);--rad:clamp(4px,calc(var(--u)*.075),11px);position:relative;display:block;min-width:0;min-height:0;border-radius:var(--rad);
  box-shadow:0 0 0 1px rgba(3,14,12,.55)}
.adv-d25{grid-column:5;grid-row:5}
.adv-3d{position:absolute;inset:0;display:block;perspective:calc(var(--u)*var(--pz,7))}
.adv-open{z-index:2}

/* inside: warm and lit */
.adv-in{position:absolute;z-index:0;inset:0;display:grid;place-items:center;border-radius:var(--rad);overflow:hidden;visibility:hidden;color:#7c2a12;
  background:radial-gradient(120% 95% at 64% 40%,#fff7d4 0,#fcdf93 44%,#eaa94b 100%);
  box-shadow:inset 0 0 0 1px rgba(92,44,6,.55),inset 0 calc(var(--u)*.05) calc(var(--u)*.1) rgba(92,44,6,.45)}
.adv-in::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(70,28,4,.55) 0,rgba(70,28,4,.2) 30%,rgba(70,28,4,0) 54%)}
.adv-open .adv-in{visibility:visible}
.adv-in-art{position:relative;z-index:1;margin-left:26%;display:block}
.adv-in-art svg{width:calc(var(--u)*.5);height:calc(var(--u)*.5);stroke-width:1.6}
.adv-in-n{position:absolute;z-index:1;right:calc(var(--u)*.09);bottom:calc(var(--u)*.05);font-family:var(--display);font-weight:600;font-size:max(10px,calc(var(--u)*.17));line-height:1;opacity:.72;font-variant-numeric:lining-nums}

/* the door */
.adv-door{position:absolute;inset:0;display:block;transform-origin:0 50%;border-radius:var(--rad);transition:transform .18s ease-out}
@media(hover:hover){.adv-ready:hover .adv-door{transform:rotateY(-7deg)}}
.adv-ready:active .adv-door{transform:rotateY(-13deg)}
.adv-open .adv-door{transform:rotateY(-70deg);transition:none}
.adv-opening .adv-door{animation:adv-swing .95s both}
@keyframes adv-swing{
  0%{transform:rotateY(-10deg);animation-timing-function:ease-out}
  14%{transform:rotateY(-15deg);animation-timing-function:cubic-bezier(.45,0,.25,1)}
  72%{transform:rotateY(-79deg);animation-timing-function:ease-in-out}
  100%{transform:rotateY(-70deg)}}
.adv-shake .adv-door{animation:adv-shake .38s ease-in-out}
@keyframes adv-shake{0%,100%{transform:none}18%{transform:translateX(-3px) rotate(-.8deg)}38%{transform:translateX(3px) rotate(.8deg)}58%{transform:translateX(-2px)}78%{transform:translateX(1.5px)}}

.adv-face{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:calc(var(--u)*.02);border-radius:var(--rad);overflow:hidden;color:var(--ink);
  background:var(--grain),var(--tex,none),linear-gradient(165deg,var(--c1),var(--c2));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.26),inset 0 -1px 0 rgba(0,0,0,.3),0 1px 2px rgba(0,0,0,.45)}
.adv-face::before{content:"";position:absolute;inset:max(2.5px,calc(var(--u)*.045));border:1px dashed var(--perf);border-radius:max(2px,calc(var(--rad) - 2px));opacity:.55;pointer-events:none}
.adv-face::after{content:"";position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .5s}
.adv-locked .adv-face::after{background:rgba(6,14,26,.3);opacity:1}
.adv-open .adv-face::after{background:linear-gradient(90deg,rgba(0,0,0,.46),rgba(0,0,0,.1));opacity:1}
.adv-open .adv-face{box-shadow:inset -1.5px 0 0 rgba(255,255,255,.42),inset 0 1px 0 rgba(255,255,255,.2),inset 0 -1px 0 rgba(0,0,0,.3)}

.adv-c0{--c1:#b72b3d;--c2:#8b1a29;--ink:#fcf1da;--perf:#f5d283;--tone:rgba(255,255,255,.075);--tag:#f7efdb;--tagink:#8b1a29}
.adv-c1{--c1:#24765d;--c2:#164e3c;--ink:#fcf1da;--perf:#f5d283;--tone:rgba(255,255,255,.075);--tag:#f7efdb;--tagink:#164e3c}
.adv-c2{--c1:#f8f0dc;--c2:#e7d8b7;--ink:#9d1e2f;--perf:#9d1e2f;--tone:rgba(157,30,47,.085);--tag:#9d1e2f;--tagink:#f8f0dc;--grain:var(--grain-soft)}
.adv-c3{--c1:#294a86;--c2:#172d59;--ink:#f1cd7c;--perf:#d7e3fa;--tone:rgba(255,255,255,.07);--tag:#ecc468;--tagink:#172d59}
.adv-c4{--c1:#eec96f;--c2:#cd9c39;--ink:#4c1520;--perf:#4c1520;--tone:rgba(76,21,32,.1);--tag:#4c1520;--tagink:#f1cd7c}
.adv-p1{--tex:repeating-linear-gradient(135deg,var(--tone) 0 2px,transparent 2px 9px)}
.adv-p2{--tex:radial-gradient(circle,var(--tone) 1.4px,transparent 1.9px) 0 0/9px 9px}
.adv-p3{--tex:repeating-linear-gradient(90deg,var(--tone) 0 5px,transparent 5px 12px)}
.adv-p4{--tex:repeating-linear-gradient(45deg,var(--tone) 0 1.5px,transparent 1.5px 10px),repeating-linear-gradient(135deg,var(--tone) 0 1.5px,transparent 1.5px 10px)}

.adv-num{position:relative;font-family:var(--display);font-weight:600;font-size:calc(var(--u)*.5);line-height:1;letter-spacing:-.01em;font-variant-numeric:lining-nums;text-shadow:0 1px 0 rgba(0,0,0,.16)}
.adv-motif{position:relative;display:block;opacity:.86}
.adv-motif svg{width:calc(var(--u)*.23);height:calc(var(--u)*.23);stroke-width:2}
.adv-t1 .adv-num{display:grid;place-items:center;width:calc(var(--u)*.64);height:calc(var(--u)*.64);border-radius:50%;font-size:calc(var(--u)*.36);border:1.5px solid var(--ink);text-shadow:none}
.adv-t1 .adv-num::before{content:"";position:absolute;inset:max(2px,calc(var(--u)*.035));border:1px dotted var(--ink);border-radius:50%;opacity:.7}
.adv-t1 .adv-motif{display:none}
.adv-t2 .adv-num{min-width:calc(var(--u)*.58);padding:calc(var(--u)*.05) calc(var(--u)*.1) calc(var(--u)*.06);border-radius:calc(var(--u)*.06);text-align:center;font-size:calc(var(--u)*.38);
  background:var(--tag);color:var(--tagink);text-shadow:none;box-shadow:0 1px 2px rgba(0,0,0,.3);margin-bottom:calc(var(--u)*.04)}

.adv-hinge{position:absolute;left:0;top:17%;width:max(3px,calc(var(--u)*.05));height:calc(var(--u)*.14);border-radius:0 2px 2px 0;
  background:linear-gradient(180deg,#f6e2a4,#c2933a 55%,#8a6520);box-shadow:0 1px 1px rgba(0,0,0,.4)}
.adv-hinge.b{top:auto;bottom:17%}
.adv-knob{position:absolute;right:calc(var(--u)*.075);top:50%;width:max(5px,calc(var(--u)*.085));height:max(5px,calc(var(--u)*.085));margin-top:calc(var(--u)*-.043);border-radius:50%;
  background:radial-gradient(circle at 34% 30%,#fff7d8 0,#e6bb58 42%,#8a6520 100%);box-shadow:0 1px 2px rgba(0,0,0,.5)}
.adv-c4 .adv-hinge{background:linear-gradient(180deg,#8a5a22,#5c3712 60%,#3c220a)}
.adv-c4 .adv-knob{background:radial-gradient(circle at 34% 30%,#c98f52 0,#6a3e17 45%,#2e1907 100%)}
.adv-lock{position:absolute;z-index:1;top:calc(var(--u)*.075);right:calc(var(--u)*.075);display:none;opacity:.9}
.adv-lock svg{width:max(10px,calc(var(--u)*.165));height:max(10px,calc(var(--u)*.165));stroke-width:2.3}
.adv-locked .adv-lock{display:block}
.adv-locked .adv-knob{opacity:.7}

/* today */
.adv-today::before,.adv-today.adv-ready::after{content:"";position:absolute;inset:-3px;border:2px solid var(--gold);border-radius:calc(var(--rad) + 3px);pointer-events:none;z-index:3}
.adv-today.adv-ready::after{animation:adv-pulse 2.2s ease-out infinite}
@keyframes adv-pulse{0%{transform:scale(1);opacity:.85}75%,100%{transform:scale(1.16);opacity:0}}
.adv-today.adv-ready .adv-face{box-shadow:inset 0 1px 0 rgba(255,255,255,.3),inset 0 -1px 0 rgba(0,0,0,.3),0 2px 8px rgba(0,0,0,.5)}

/* printed tiles that fill the spare cells in the wide layout */
.adv-deco{display:none;place-items:center;color:var(--gold)}
.adv-deco span{position:relative;display:grid;place-items:center;width:calc(var(--ub)*.8);height:calc(var(--ub)*.8);border-radius:50%;border:1px solid rgba(233,196,106,.45)}
.adv-deco span::before{content:"";position:absolute;inset:3px;border-radius:50%;border:1px dotted rgba(233,196,106,.45)}
.adv-deco svg{width:calc(var(--ub)*.42);height:calc(var(--ub)*.42);stroke-width:1.5}

/* wider than tall: 7 across, door 25 double size */
@container (min-aspect-ratio:5/4){
  .adv{--cols:7;--rows:4;--head:62px;--foot:0px;--bp:12px;--gap:9px;--maxr:1.14}
  .adv-cell{--pz:8}
  .adv-d25{grid-column:6/span 2;grid-row:3/span 2;--u:calc(var(--ub)*1.9);--pz:16}
  .adv-title{font-size:27px}
}
/* short and wide (a phone on its side): 9 across, 3 down */
@container (min-aspect-ratio:3/2) and (max-height:430px){
  .adv{--cols:9;--rows:3;--head:44px;--foot:0px;--bp:7px;--gap:5px;--maxr:1.24}
  .adv-head{height:calc(var(--head) - 7px);margin-bottom:7px}
  .adv-ttl{display:flex;align-items:baseline;gap:12px}
  .adv-title{font-size:19px;flex:none}
  .adv-status{margin:0}
  .adv-d25{grid-column:8;grid-row:3;--u:var(--ub);--pz:8}
  .adv-deco{display:grid}
  .adv-deco.a{grid-column:1;grid-row:3}
  .adv-deco.b{grid-column:9;grid-row:3}
}
@container (min-aspect-ratio:27/10) and (min-height:431px){
  .adv{--cols:9;--rows:3;--maxr:1.1}
  .adv-d25{grid-column:8;grid-row:3;--u:var(--ub);--pz:8}
  .adv-deco{display:grid}
  .adv-deco.a{grid-column:1;grid-row:3}
  .adv-deco.b{grid-column:9;grid-row:3}
}

@container (max-width:335px){
  .adv-title{font-size:18px}
  .adv-crk{padding:0 10px;gap:6px}
}

/* what was behind the door */
.adv-day{display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center;padding-top:4px}
.adv-day-art{flex:none;display:grid;place-items:center;width:92px;height:92px;border-radius:16px;color:#7c2a12;
  background:radial-gradient(120% 95% at 60% 36%,#fff7d4 0,#fcdf93 46%,#eaa94b 100%);
  box-shadow:inset 0 0 0 1px rgba(92,44,6,.5),inset 0 4px 9px rgba(92,44,6,.35),0 0 0 4px rgba(233,196,106,.14)}
.adv-day-art svg{stroke-width:1.5}
.adv-day-main{display:flex;flex-direction:column;align-items:center;gap:12px;min-width:0}
.adv-day-text{font-size:18px;line-height:1.45;color:#fff;max-width:32ch;text-wrap:balance}
.adv-day-punch{font-family:var(--display);font-weight:600;font-size:22px;line-height:1.25;color:var(--gold);max-width:26ch;text-wrap:balance;margin-top:-4px}
.adv-day .btn{margin-top:6px}
@media (orientation:landscape) and (max-height:480px){
  .adv-day{flex-direction:row;flex-wrap:wrap;justify-content:center;text-align:left;gap:8px 16px;padding-top:0}
  .adv-day-art{width:72px;height:72px}
  .adv-day-main{align-items:flex-start;flex:1;gap:8px}
  .adv-day-text{font-size:17px;max-width:none}
  .adv-day-punch{font-size:20px;max-width:none;margin-top:0}
  .adv-day .btn{flex-basis:100%;margin-top:0}
}

/* cracker */
.adv-cr{display:flex;flex-direction:column;gap:14px}
.adv-cr-stage{position:relative;overflow:hidden;border-radius:14px;border:1px solid var(--line);touch-action:none;cursor:grab;
  background:radial-gradient(90% 130% at 50% 0,#1d3460 0,#0c1830 100%)}
.adv-cr.drag .adv-cr-stage{cursor:grabbing}
.adv-cr-stage svg{display:block;width:100%;height:auto;pointer-events:none}
.adv-crL,.adv-crR{transform-box:fill-box;transform-origin:50% 50%;transition:transform .5s cubic-bezier(.2,1.5,.4,1)}
.adv-cr.drag .adv-crL,.adv-cr.drag .adv-crR{transition:none}
.adv-cr.tug .adv-crL{transform:translate(-15px,0);transition:transform .22s ease-in}
.adv-cr.tug .adv-crR{transform:translate(15px,0);transition:transform .22s ease-in}
.adv-cr.popped .adv-crL{transform:translate(-66px,6px) rotate(-8deg)}
.adv-cr.popped .adv-crR{transform:translate(66px,3px) rotate(7deg)}
.adv-crSL,.adv-crSR{transition:transform .5s cubic-bezier(.2,1.5,.4,1)}
.adv-cr.popped .adv-crSL{transform:translate(-66px,0)}
.adv-cr.popped .adv-crSR{transform:translate(66px,0)}
.adv-cr.popped .adv-cr-core{opacity:0}
.adv-cr-burst{transform-box:fill-box;transform-origin:50% 50%;opacity:0}
.adv-cr.popped .adv-cr-burst{animation:adv-burst .5s ease-out}
@keyframes adv-burst{0%{opacity:1;transform:scale(.2)}55%{opacity:1}100%{opacity:0;transform:scale(1.55) rotate(24deg)}}
.adv-bit{position:absolute;left:50%;top:47%;width:7px;height:10px;margin:-5px 0 0 -3px;border-radius:1.5px;pointer-events:none;animation:adv-bit .85s cubic-bezier(.12,.7,.3,1) forwards}
@keyframes adv-bit{0%{transform:none;opacity:1}70%{opacity:1}100%{transform:translate(var(--dx),var(--dy)) rotate(var(--rot));opacity:0}}
.adv-cr-side{display:flex;flex-direction:column;gap:14px;min-width:0}
.adv-cr-slot{display:grid;align-items:center;min-height:134px}
.adv-cr-slot>*{grid-area:1/1}
.adv-cr-hint{text-align:center;color:#fff;font-weight:500;transition:opacity .2s}
.adv-cr-hint span{display:block;margin-top:2px;font-size:13px;font-weight:400;color:var(--muted)}
.adv-cr-slip{opacity:0;transform:translateY(-18px) scale(.86) rotate(-1.2deg);transition:opacity .22s,transform .45s cubic-bezier(.2,1.5,.4,1);filter:drop-shadow(0 6px 10px rgba(0,0,0,.4));pointer-events:none}
.adv-cr-card{display:flex;flex-direction:column;justify-content:center;gap:7px;min-height:134px;padding:16px 24px;text-align:center;background:linear-gradient(180deg,#faf3e0,#efe3c6);color:#2a1f05}
.adv-cr-q{font-size:15.5px;line-height:1.38;text-wrap:balance}
.adv-cr-a{font-family:var(--display);font-weight:600;font-size:19.5px;line-height:1.22;color:#8b1a29;text-wrap:balance}
.adv-cr.popped .adv-cr-slip{opacity:1;transform:rotate(-1.2deg);transition-delay:.12s}
.adv-cr.popped .adv-cr-hint{opacity:0}
@media (orientation:landscape) and (max-height:480px){
  .sheet.adv-cr-sheet{max-width:720px}
  .adv-cr{display:grid;grid-template-columns:1.1fr 1fr;align-items:center;gap:16px}
  .adv-cr-side{gap:10px}
  .adv-cr-slot,.adv-cr-card{min-height:96px}
  .adv-cr-card{padding:12px 22px}
}
`);

  /* ---------- season + saved doors ---------- */
  function season() {
    const n = App.now();
    /* Dec 26 to 31 still belongs to the Christmas that just happened, so the calendar stays fully open */
    const late = n.getMonth() === 11 && n.getDate() > 25;
    const year = late ? n.getFullYear() : App.xmas().getFullYear();
    const inDec = n.getFullYear() === year && n.getMonth() === 11;
    const unlocked = inDec ? Math.min(25, n.getDate()) : 0;
    const today = inDec && n.getDate() <= 25 ? n.getDate() : 0;
    const toStart = Math.round((new Date(year, 11, 1) - new Date(n.getFullYear(), n.getMonth(), n.getDate())) / 864e5);
    return { year: year, unlocked: unlocked, today: today, toStart: toStart };
  }
  function openedSet(s) {
    if (DEMO === 'open' || DEMO === 'openall') {
      const demo = new Set();
      for (let d = 1; d <= s.unlocked; d++) if (DEMO === 'openall' || d !== s.today) demo.add(d);
      return demo;
    }
    /* a new season starts with every door shut again */
    const y = App.store.get('adventYear', null);
    if (y !== s.year) { if (y != null) App.store.set('advent', {}); App.store.set('adventYear', s.year); }
    const all = App.store.get('advent', {}) || {}, mine = Array.isArray(all[App.me()]) ? all[App.me()] : [];
    return new Set(mine.filter(d => d >= 1 && d <= s.unlocked));
  }
  function saveOpened(day) {
    if (DEMO === 'open' || DEMO === 'openall') return;
    let all = App.store.get('advent', {});
    if (!all || typeof all !== 'object' || Array.isArray(all)) all = {};
    const me = App.me(), mine = Array.isArray(all[me]) ? all[me] : [];
    if (mine.indexOf(day) < 0) mine.push(day);
    all[me] = mine.sort((a, b) => a - b);
    App.store.set('advent', all);
  }
  function status(s, mine) {
    if (!s.unlocked) return { t: s.toStart === 1 ? 'First door opens tomorrow' : 'First door opens in ' + s.toStart + ' days', on: false };
    if (s.today && !mine.has(s.today)) return { t: 'Door ' + s.today + ' is ready', on: true };
    const wait = [];
    for (let d = 1; d <= s.unlocked; d++) if (!mine.has(d)) wait.push(d);
    if (wait.length) return { t: wait.length === 1 ? 'Door ' + wait[0] + ' is waiting' : wait.length + ' doors are waiting', on: true };
    if (s.unlocked >= 25) return { t: 'Every door is open', on: false };
    return { t: 'Door ' + (s.unlocked + 1) + ' opens tomorrow', on: false };
  }

  /* ---------- page ---------- */
  let timers = [], cur = null, lastNudge = 0, lastNudgeDay = 0, demoDone = false, dragEnd = 0;
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };

  function label(day, st) {
    return 'Door ' + day + (st === 'locked' ? ', locked. Opens December ' + day : st === 'open' ? ', open' : ', ready to open');
  }
  function doorHTML(day, i, s, mine) {
    const last = day === 25;
    const st = mine.has(day) ? 'open' : day <= s.unlocked ? 'ready' : 'locked';
    const cls = 'adv-cell adv-c' + (last ? 4 : COLOR[i]) + ' adv-t' + (last ? 0 : FACE[i]) + ' adv-p' + (last ? 2 : TEX[i]) + ' adv-' + st + (day === s.today ? ' adv-today' : '') + (last ? ' adv-d25' : '');
    return '<button type="button" class="' + cls + '" data-day="' + day + '" aria-label="' + label(day, st) + '"><span class="adv-3d">' +
      '<span class="adv-in"><span class="adv-in-art">' + (App.illus ? App.illus(DAYS[day].icon, 56) : App.icon(DAYS[day].icon)) + '</span><b class="adv-in-n">' + day + '</b></span>' +
      '<span class="adv-door"><span class="adv-face"><i class="adv-hinge"></i><i class="adv-hinge b"></i>' +
      '<span class="adv-num">' + day + '</span><span class="adv-motif">' + App.icon(last ? 'star' : MOTIF[i % MOTIF.length]) + '</span>' +
      '<i class="adv-knob"></i><span class="adv-lock">' + App.icon('lock') + '</span></span></span></span></button>';
  }

  function render(root) {
    const s = season(), mine = openedSet(s);
    cur = { s: s, mine: mine, root: root };
    root.innerHTML = '<div class="adv">' +
      '<header class="adv-head"><div class="adv-ttl"><h1 class="adv-title">Advent calendar</h1><p class="adv-status" aria-live="polite"></p></div>' +
      '<span style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end"><button type="button" class="btn sm adv-pz">' + App.icon('trophy', 18) + '<span>Prizes</span></button><button type="button" class="btn sm adv-crk">' + App.icon('cracker', 18) + '<span>Pull a cracker</span></button></span></header>' +
      '<div class="adv-stage"><div class="adv-board"><div class="adv-grid">' +
      ORDER.map((d, i) => doorHTML(d, i, s, mine)).join('') + doorHTML(25, 24, s, mine) +
      '<div class="adv-deco a" aria-hidden="true"><span>' + App.icon('tree') + '</span></div>' +
      '<div class="adv-deco b" aria-hidden="true"><span>' + App.icon('snow') + '</span></div>' +
      '</div></div></div></div>';
    paintStatus();
    $('.adv-crk', root).addEventListener('click', () => cracker(false));
    if (!App.store.raw.get('advHint', false)) { App.store.raw.set('advHint', true); later(() => App.ui.toast('Tip: drag across doors to open or close them.'), 900); }
    $('.adv-pz', root).addEventListener('click', () => { if (App.prizes) App.prizes.shelf(); });
    /* press and drag across the doors: the closed ones open, or the open ones close, depending on the door you started on */
    (function () {
      const grid = $('.adv-grid', root);
      let st = null;
      const cellAt = (x, y) => { const el = document.elementFromPoint(x, y); return el && el.closest ? el.closest('.adv-cell') : null; };
      const apply = c => { if (st.seen.has(c)) return; st.seen.add(c); setDoor(c, +c.dataset.day, st.mode === 'open'); };
      grid.addEventListener('pointerdown', e => {
        const c = e.target.closest('.adv-cell');
        if (!c || e.button) return;
        st = { x: e.clientX, y: e.clientY, c: c, mode: c.classList.contains('adv-open') ? 'close' : 'open', on: false, seen: new Set() };
      });
      grid.addEventListener('pointermove', e => {
        if (!st) return;
        if (!st.on) {
          if (Math.hypot(e.clientX - st.x, e.clientY - st.y) < 12) return;     /* a tap is not a drag */
          st.on = true; try { grid.setPointerCapture(e.pointerId); } catch (x) {}
          apply(st.c);
        }
        const c = cellAt(e.clientX, e.clientY);
        if (c) apply(c);
      });
      const end = () => { if (st && st.on) dragEnd = Date.now(); st = null; };
      grid.addEventListener('pointerup', end); grid.addEventListener('pointercancel', end);
    })();
    $('.adv-grid', root).addEventListener('click', e => {
      const cell = e.target.closest('.adv-cell');
      if (!cell || Date.now() - dragEnd < 150) return;
      const day = +cell.dataset.day;
      if (cell.classList.contains('adv-locked')) nudge(cell, day);
      else if (cell.classList.contains('adv-opening')) return;
      else if (cell.classList.contains('adv-open')) showDay(day);
      else openDoor(cell, day);
    });
    $('.adv-grid', root).addEventListener('animationend', e => {
      if (e.animationName === 'adv-shake') { const c = e.target.closest('.adv-cell'); if (c) c.classList.remove('adv-shake'); }
    });
    armMidnight();
    document.addEventListener('visibilitychange', onVisible);
    /* test hooks that open a sheet run once per page load */
    if (demoDone) return;
    demoDone = true;
    if (DEMO === 'cracker') later(() => cracker(false), 50);
    else if (DEMO === 'popped') later(() => cracker(true), 50);
    else if (/^day\d+$/.test(DEMO)) later(() => showDay(Math.max(1, Math.min(25, +DEMO.slice(3)))), 50);
  }
  function paintStatus() {
    if (!cur) return;
    const el = $('.adv-status', cur.root), st = status(cur.s, cur.mine);
    if (!el) return;
    el.className = 'adv-status' + (st.on ? ' on' : '');
    el.innerHTML = '<i></i><span>' + App.esc(st.t) + '</span>';
  }
  /* re-draw when the date rolls over so the next door unlocks without a reload */
  function armMidnight() {
    const n = App.now(), next = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1, 0, 0, 2);
    later(function tick() {
      if (App.currentPage() !== 'advent') return;
      if (App.ui.sheetOpen()) later(tick, 20000); else App.refresh();
    }, Math.min(next - n, 2e9));
  }

  /* coming back to the app the next morning: catch up without waiting for the timer */
  function onVisible() {
    if (document.hidden || !cur || App.ui.sheetOpen()) return;
    const s = season();
    if (s.year !== cur.s.year || s.unlocked !== cur.s.unlocked || s.today !== cur.s.today) App.refresh();
  }

  function nudge(cell, day) {
    cell.classList.remove('adv-shake');
    void cell.offsetWidth;
    cell.classList.add('adv-shake');
    const t = Date.now();
    if (day !== lastNudgeDay || t - lastNudge > 1800) { App.ui.toast('Opens December ' + day); lastNudge = t; lastNudgeDay = day; }
  }
  function saveClosed(day) {
    if (DEMO === 'open' || DEMO === 'openall') return;
    const all = App.store.get('advent', {});
    if (!all || typeof all !== 'object' || Array.isArray(all)) return;
    const me = App.me();
    if (Array.isArray(all[me])) { all[me] = all[me].filter(d => d !== day); App.store.set('advent', all); }
  }
  /* open or close one door without the pop-up (used when dragging across doors, and by "Close this door") */
  function setDoor(cell, day, open) {
    if (!cur || cell.classList.contains('adv-locked')) return;
    const isOpen = cell.classList.contains('adv-open');
    if (open === isOpen) return;
    if (open) {
      cur.mine.add(day); saveOpened(day);
      cell.classList.remove('adv-ready'); cell.classList.add('adv-open', 'adv-opening');
      later(() => cell.classList.remove('adv-opening'), App.reduced ? 80 : 1000);
    } else {
      cur.mine.delete(day); saveClosed(day);
      cell.classList.remove('adv-open', 'adv-opening'); cell.classList.add('adv-ready');
    }
    cell.setAttribute('aria-label', label(day, open ? 'open' : 'ready'));
    paintStatus();
  }
  function openDoor(cell, day) {
    cur.mine.add(day);
    saveOpened(day);
    cell.classList.remove('adv-ready');
    cell.classList.add('adv-open', 'adv-opening');
    cell.setAttribute('aria-label', label(day, 'open'));
    paintStatus();
    later(() => { cell.classList.remove('adv-opening'); if (!App.ui.sheetOpen()) showDay(day); }, App.reduced ? 80 : 1000);
  }

  function showDay(day) {
    const d = DAYS[day], k = KIND[d.t], joke = d.t === 'j';
    App.ui.sheet({
      title: 'December ' + day, cls: 'adv-day-sheet',
      html: '<div class="adv-day"><div class="adv-day-art">' + (App.illus ? App.illus(d.icon, 66) : App.icon(d.icon, 52)) + '</div>' +
        '<div class="adv-day-main"><span class="chip ' + k.chip + '">' + App.icon(k.icon, 14) + k.label + '</span>' +
        '<p class="adv-day-text">' + App.esc(joke ? d.x[0] : d.x) + '</p>' +
        (joke ? '<p class="adv-day-punch">' + App.esc(d.x[1]) + '</p>' : '') + '</div>' +
        '<div class="pz"></div><div class="sv-host"></div><button type="button" class="btn block" id="advShut" style="margin-top:14px">Close this door</button><button type="button" class="btn primary block" data-close>Close</button></div>',
      onMount(el, close) {
        const sh = el.querySelector('#advShut');
        if (sh) sh.onclick = () => { close(); const c = document.querySelector('.adv-cell[data-day="' + day + '"]'); if (c) setDoor(c, day, false); };
        if (App.prizes) App.prizes.panel(el.querySelector('.pz'), season().year, day, d.t === 'm' ? d.x : '');
        if (App.service) App.service.panel(el.querySelector('.sv-host'), season().year, day);
        if (day !== 25 || !App.fx || !App.fx.confetti) return;
        later(() => { const r = el.getBoundingClientRect(); App.fx.confetti(r.left + r.width / 2, r.top + 40, 140); }, 260);
      }
    });
  }

  /* ---------- pull a cracker ---------- */
  let deck = [];
  function nextJoke() {
    if (!deck.length) {
      let seen = App.store.get('adventJokes', []);
      if (!Array.isArray(seen)) seen = [];
      let left = JOKES.map((j, i) => i).filter(i => seen.indexOf(i) < 0);
      if (!left.length) { left = JOKES.map((j, i) => i); App.store.set('adventJokes', []); }
      deck = App.shuffle(left);
    }
    const i = deck.pop();
    let seen = App.store.get('adventJokes', []);
    if (!Array.isArray(seen)) seen = [];
    if (seen.indexOf(i) < 0) { seen.push(i); App.store.set('adventJokes', seen); }
    return JOKES[i];
  }

  function crackerSVG() {
    const W = 560, seam = [[279, 53], [286, 60], [275, 67], [286, 74], [275, 81], [286, 88], [275, 95], [286, 102], [275, 109], [286, 116], [281, 123]];
    const seamD = seam.map(p => 'L' + p[0] + ' ' + p[1]).join('');
    const half = right => {
      const X = x => right ? W - x : x;
      let zig = '';
      for (let k = 1; k <= 8; k++) zig += 'L' + X(97) + ' ' + (34 + 12 * k) + 'L' + X(k === 8 ? 88 : 86) + ' ' + (40 + 12 * k);
      const flare = 'M' + X(170) + ' 75C' + X(150) + ' 71 ' + X(122) + ' 54 ' + X(88) + ' 40' + zig + 'C' + X(122) + ' 122 ' + X(150) + ' 105 ' + X(170) + ' 101Z';
      const shoulder = 'M' + X(199) + ' 53C' + X(186) + ' 55 ' + X(176) + ' 64 ' + X(170) + ' 75L' + X(170) + ' 101C' + X(176) + ' 112 ' + X(186) + ' 121 ' + X(199) + ' 123Z';
      const tube = 'M' + X(198) + ' 53' + seamD + 'L' + X(198) + ' 123Z';
      const dots = [[146, 88], [126, 74], [126, 102], [108, 62], [108, 88], [108, 114]].map(p => '<circle cx="' + X(p[0]) + '" cy="' + p[1] + '" r="3.300"/>').join('');
      const sx = X(244), star = 'M' + sx + ' 73l3.600 11.400 11.400 3.600-11.400 3.600-3.600 11.400-3.600-11.400-11.400-3.600 11.400-3.600z';
      const rx = (a, w) => (right ? W - a - w : a);
      return '<g class="adv-cr' + (right ? 'R' : 'L') + '">' +
        '<path d="' + flare + '" fill="#1f6d55"/><g fill="#f7efdb" opacity=".9">' + dots + '</g>' +
        '<path d="' + flare + '" fill="url(#advCrShade)"/>' +
        '<path d="M' + X(88) + ' 40' + zig + '" fill="none" stroke="#e9c46a" stroke-width="3.200" stroke-linejoin="round" stroke-linecap="round"/>' +
        '<path d="' + shoulder + '" fill="#185845"/><path d="' + shoulder + '" fill="url(#advCrShade)"/>' +
        '<path d="' + tube + '" fill="#b72b3d"/>' +
        '<rect x="' + rx(205, 10) + '" y="53" width="10" height="70" fill="#f7efdb"/><rect x="' + rx(219, 3) + '" y="53" width="3" height="70" fill="#e9c46a"/>' +
        '<path d="' + star + '" fill="#e9c46a"/>' +
        '<path d="' + tube + '" fill="url(#advCrShade)"/>' +
        '<rect x="' + rx(163, 14) + '" y="70" width="14" height="36" rx="4.500" fill="#e9c46a" stroke="#a87a1e" stroke-width="1.500"/>' +
        '<rect x="' + rx(166.500, 3) + '" y="74" width="3" height="28" rx="1.500" fill="#fff3c9" opacity=".7"/></g>';
    };
    let burst = '', rays = '';
    for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, r = i % 2 ? 13 : 31; burst += (280 + Math.cos(a) * r).toFixed(1) + ',' + (88 + Math.sin(a) * r).toFixed(1) + ' '; }
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + .39; rays += 'M' + (280 + Math.cos(a) * 38).toFixed(1) + ' ' + (88 + Math.sin(a) * 38).toFixed(1) + 'L' + (280 + Math.cos(a) * 52).toFixed(1) + ' ' + (88 + Math.sin(a) * 52).toFixed(1); }
    return '<svg viewBox="0 0 ' + W + ' 176" role="img" aria-label="A Christmas cracker">' +
      '<defs><linearGradient id="advCrShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".2" stop-color="#fff" stop-opacity=".34"/>' +
      '<stop offset=".44" stop-color="#fff" stop-opacity="0"/><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".36"/></linearGradient>' +
      '<radialGradient id="advCrShadow"><stop offset="0" stop-color="#000" stop-opacity=".5"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs>' +
      '<ellipse class="adv-crSL" cx="190" cy="147" rx="112" ry="7" fill="url(#advCrShadow)"/><ellipse class="adv-crSR" cx="370" cy="147" rx="112" ry="7" fill="url(#advCrShadow)"/>' +
      '<rect class="adv-cr-core" x="226" y="58" width="108" height="60" rx="3" fill="#4a0f1a"/>' +
      half(false) + half(true) +
      '<g class="adv-cr-burst"><polygon points="' + burst + '" fill="#fff3c0" stroke="#e9c46a" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="' + rays + '" stroke="#ffe7a0" stroke-width="3" stroke-linecap="round" fill="none"/></g></svg>';
  }
  /* pinked ends on the paper slip */
  function slipClip() {
    const pts = ['6px 0', 'calc(100% - 6px) 0'], n = 9;
    for (let i = 1; i <= n; i++) pts.push((i % 2 ? '100%' : 'calc(100% - 6px)') + ' ' + (i * 100 / n).toFixed(2) + '%');
    for (let i = n; i >= 0; i--) pts.push((i % 2 ? '0' : '6px') + ' ' + (i * 100 / n).toFixed(2) + '%');
    return 'polygon(' + pts.join(',') + ')';
  }

  function cracker(popNow) {
    App.ui.sheet({
      title: 'Pull a cracker', cls: 'adv-cr-sheet',
      html: '<div class="adv-cr"><div class="adv-cr-stage">' + crackerSVG() + '</div>' +
        '<div class="adv-cr-side"><div class="adv-cr-slot"><p class="adv-cr-hint">Grab an end and pull.<span>There is a joke inside.</span></p>' +
        '<div class="adv-cr-slip" aria-live="polite"><div class="adv-cr-card" style="clip-path:' + slipClip() + '"><p class="adv-cr-q"></p><p class="adv-cr-a"></p></div></div></div>' +
        '<button type="button" class="btn primary block adv-cr-btn">Pull</button></div></div>',
      onMount(el) {
        const box = $('.adv-cr', el), stage = $('.adv-cr-stage', el), svg = $('svg', stage), btn = $('.adv-cr-btn', el);
        const L = $('.adv-crL', el), R = $('.adv-crR', el);
        let popped = false, busy = false, drag = null;
        const settle = () => { L.style.transform = ''; R.style.transform = ''; box.classList.remove('drag'); drag = null; };
        const pop = () => {
          if (popped) return;
          popped = true; busy = false; settle();
          const j = nextJoke();
          $('.adv-cr-q', el).textContent = j[0]; $('.adv-cr-a', el).textContent = j[1];
          box.classList.remove('tug'); box.classList.add('popped');
          btn.textContent = 'Another one';
          try { if (navigator.vibrate) navigator.vibrate(25); } catch (e) {}
          if (!App.reduced) {
            const colors = ['#e9c46a', '#d7263d', '#1f9d6b', '#f7efdb', '#3b82f6'];
            for (let i = 0; i < 18; i++) {
              const b = document.createElement('i'), a = App.rand(0, Math.PI * 2), d = App.rand(60, 190);
              b.className = 'adv-bit';
              b.style.cssText = 'background:' + App.pick(colors) + ';--dx:' + (Math.cos(a) * d).toFixed(0) + 'px;--dy:' + (Math.sin(a) * d * .5 - 14).toFixed(0) + 'px;--rot:' + App.rand(-540, 540).toFixed(0) + 'deg';
              stage.appendChild(b);
              setTimeout(() => b.remove(), 900);
            }
          }
          if (App.fx && App.fx.confetti) { const r = stage.getBoundingClientRect(); App.fx.confetti(r.left + r.width / 2, r.top + r.height / 2, 70); }
        };
        const reset = () => { popped = false; box.classList.remove('popped'); btn.textContent = 'Pull'; };
        /* the button, or a plain tap on the cracker: a short tug, then the snap */
        const pull = () => {
          if (popped || busy) return;
          busy = true; box.classList.add('tug');
          setTimeout(pop, App.reduced ? 0 : 230);
        };
        btn.addEventListener('click', () => { if (popped) reset(); else pull(); });
        stage.addEventListener('pointerdown', e => {
          if (popped || busy) return;
          const r = svg.getBoundingClientRect();
          drag = { x: e.clientX, side: e.clientX < r.left + r.width / 2 ? -1 : 1, k: 560 / Math.max(1, r.width), far: 0 };
          box.classList.add('drag');
          try { stage.setPointerCapture(e.pointerId); } catch (err) {}
        });
        stage.addEventListener('pointermove', e => {
          if (!drag) return;
          const amt = Math.max(0, (e.clientX - drag.x) * drag.side) * drag.k, d = Math.min(44, amt * .5);
          const held = drag.side < 0 ? L : R, other = drag.side < 0 ? R : L;
          drag.far = Math.max(drag.far, Math.abs(e.clientX - drag.x));
          held.style.transform = 'translate(' + (drag.side * d).toFixed(1) + 'px,0) rotate(' + (drag.side * d * .05).toFixed(2) + 'deg)';
          other.style.transform = 'translate(' + (-drag.side * d * .12).toFixed(1) + 'px,0)';
          if (amt > 90) pop();
        });
        stage.addEventListener('pointerup', () => { if (!drag) return; const tap = drag.far < 6; settle(); if (tap) pull(); });
        ['pointercancel', 'lostpointercapture'].forEach(ev => stage.addEventListener(ev, () => { if (drag) settle(); }));
        if (popNow) pop();
      }
    });
  }

  App.pages.advent = {
    render: render,
    leave() { timers.forEach(clearTimeout); timers = []; cur = null; document.removeEventListener('visibilitychange', onVisible); },
    /* the grid is sized with container units, so there is nothing to rebuild */
    onResize() {}
  };
})();
