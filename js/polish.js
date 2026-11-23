/* Under the Tree: a nicer look.
   Styles for the add-a-wish screen (a live preview, price buttons, big toggles, tidy folds), and a drawn picture
   for the Tap Santa game tile, which used to be a thin outline icon. */
(function () {
  'use strict';
  const A = window.App;

  A.css(`
    /* ---- add a wish ---- */
    .fm-prev{display:flex;align-items:center;gap:14px;margin:0 0 14px;padding:14px;border-radius:22px;background:linear-gradient(160deg,var(--c1,#3b82f6),var(--c2,#14307a));box-shadow:0 8px 22px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.3)}
    .fm-pic{flex:none;display:grid;place-items:center;width:84px;height:84px;border-radius:18px;overflow:hidden;color:#fff;background:rgba(255,255,255,.16);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.35)}
    .fm-pic img{width:100%;height:100%;object-fit:cover}
    .fm-pic svg{filter:drop-shadow(0 2px 4px rgba(0,0,0,.3))}
    .fm-pic svg:not(.illus) :is(path,circle,rect,ellipse,polygon){fill:currentColor;fill-opacity:.22}
    .fm-txt{min-width:0;display:flex;flex-direction:column;gap:6px;align-items:flex-start}
    .fm-txt b{font-family:var(--display);font-size:clamp(20px,6vw,26px);font-weight:600;line-height:1.1;color:#fff;overflow-wrap:anywhere}
    .fm-price{padding:3px 11px;border-radius:999px;font-size:13.5px;font-weight:800;background:rgba(0,0,0,.28);color:#fff}
    .fm-big .input{min-height:54px;font-size:18px;font-weight:600}
    .fm-chips{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:8px}
    .fm-chips button{min-height:40px;padding:0 15px;border-radius:999px;font-weight:700;font-size:15px;background:var(--surface2);border:1.5px solid var(--line2);color:#fff}
    .fm-chips button.on{background:var(--gold);border-color:var(--gold);color:var(--gold-ink)}
    .fm-tog2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:4px 0 14px}
    .fm-tog{position:relative;display:block}
    .fm-tog input{position:absolute;opacity:0;pointer-events:none}
    .fm-tog>span{display:flex;flex-direction:column;align-items:center;gap:2px;padding:14px 8px;border-radius:18px;text-align:center;background:var(--surface2);border:2px solid var(--line2);color:var(--muted);transition:transform .12s,border-color .12s}
    .fm-tog>span b{font-size:15px;color:#fff}.fm-tog>span small{font-size:12px}
    .fm-tog:active>span{transform:scale(.97)}
    .fm-tog input:checked+span{border-color:var(--gold);background:linear-gradient(160deg,rgba(233,196,106,.3),rgba(233,196,106,.08));color:var(--gold)}
    .fm-tog input:focus-visible+span{outline:2px solid #fff}
    .fm-more{margin:6px 0 8px;font-size:13px;font-weight:700;color:var(--muted)}
    .fm-d{margin-bottom:8px}
    .iconpick{display:flex;gap:8px;overflow-x:auto;padding:2px 0 6px;scrollbar-width:none}
    .iconpick::-webkit-scrollbar{display:none}
    .iconpick button{flex:none;width:52px;height:52px;border-radius:14px;display:grid;place-items:center}
    /* ---- the favorites form: a sheet of paper ---- */
    .ab-paper{position:relative;margin:12px 0 4px;padding:24px 16px 12px;border-radius:6px;color:#3a2a1a;background:#fbf4e2 repeating-linear-gradient(transparent 0 31px,rgba(150,115,60,.13) 31px 32px);box-shadow:0 10px 26px rgba(0,0,0,.45),inset 0 0 0 1px rgba(120,90,40,.3),inset 0 0 44px rgba(190,150,80,.2)}
    .ab-paper::before{content:"";position:absolute;left:50%;top:-10px;width:88px;height:22px;transform:translateX(-50%) rotate(-2deg);background:rgba(240,215,150,.8);box-shadow:0 1px 3px rgba(0,0,0,.25)}
    .ab-note{margin:0 0 4px;font-size:13px;line-height:1.35;color:#7a6440}
    .ab-sh{margin:16px 0 2px;font-family:var(--display);font-size:21px;font-weight:600;color:#9d1e2f;border-bottom:2px solid rgba(157,30,47,.35)}
    .ab-row{display:flex;align-items:baseline;gap:10px;padding:5px 0}
    .ab-l{flex:0 0 40%;font-weight:600;font-size:14px;line-height:1.25;color:#3a2a1a}
    .ab-i{flex:1;min-width:0;border:0;border-bottom:1.5px dotted #a68a52;border-radius:0;background:transparent;padding:4px 2px;font-family:var(--script,cursive);font-style:italic;font-size:19px;color:#1d3a8a;outline:none}
    .ab-i::placeholder{color:#c4b48a;font-size:13.5px;font-style:normal;font-family:inherit}
    .ab-i:focus{border-bottom-style:solid;border-bottom-color:#9d1e2f}
    .ab-pk{display:flex;flex-wrap:wrap;gap:6px;padding:0 0 6px 40%}
    .ab-paper .ab-pick{min-height:30px;padding:0 11px;border-radius:999px;background:#efe2c0;border:1px solid #c9b27c;color:#5a4526;font-weight:600;font-size:13px}
    .ab-paper .ab-pick.on{background:#9d1e2f;border-color:#9d1e2f;color:#fff}
    .ab-saved{margin:10px 0 4px;text-align:center;font-size:12.5px;font-weight:700;color:#6fe3a5;min-height:16px}
    /* ---- hold and drag a wish ---- */
    .wcard[data-id]{-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}
    .wcard[data-id] img{-webkit-user-drag:none}
    .reel.fm-dragging{scroll-snap-type:none!important;touch-action:none}
    .wcard.fm-ph{opacity:.22;filter:grayscale(.5)}
    .wcard.fm-ghost{position:fixed!important;z-index:9999;margin:0;pointer-events:none;transform:scale(1.07) rotate(2.5deg);transform-origin:50% 40%;box-shadow:0 26px 54px rgba(0,0,0,.6),0 0 0 2px rgba(233,196,106,.7);opacity:.98;transition:none;animation:fm-lift .16s ease-out}
    @keyframes fm-lift{from{transform:scale(1) rotate(0)}to{transform:scale(1.07) rotate(2.5deg)}}
    /* ---- an empty list ---- */
    .fm-empty{display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px;padding:26px 16px}
    .fm-gift{display:grid;place-items:center;width:104px;height:104px;border-radius:50%;color:var(--gold-ink);background:radial-gradient(circle at 35% 30%,#fff1b8,var(--gold) 55%,#b8860f);box-shadow:0 10px 26px rgba(0,0,0,.4),inset 0 -4px 10px rgba(120,70,0,.3)}
    .fm-gift svg :is(path,circle,rect){fill:currentColor;fill-opacity:.18}
    .fm-gift svg{color:#5a3300;opacity:1}
    .fm-empty h2{color:#fff;margin:6px 0 0;font-family:var(--display);font-size:clamp(24px,7vw,30px);font-weight:600}
    .fm-empty p{margin:0;max-width:30ch;color:#dfe7f3;line-height:1.45}
    .fm-empty .btn{margin-top:6px;min-width:210px}
    .fm-or{margin-top:12px!important;font-size:13px;font-weight:700;color:var(--muted)!important}
    .fm-ideas{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;max-width:420px}
    .fm-idea{display:inline-flex;align-items:center;gap:7px;min-height:42px;padding:0 14px;border-radius:999px;font-weight:700;font-size:14px;background:var(--surface2);border:1.5px solid var(--line2);color:#fff;transition:transform .12s,border-color .12s}
    .fm-idea svg{color:var(--gold)}
    .fm-idea:active{transform:scale(.96);border-color:var(--gold)}
    /* ---- advent doors: one cohesive look. Red and green in a checker, gold foil numbers, a thin gold frame ---- */
    .adv-grid{touch-action:none;user-select:none;-webkit-user-select:none}
    .adv-cell:nth-child(odd){--c1:#c52a40;--c2:#8c1329;--ink:#f7dc8a;--perf:#f5d283}
    .adv-cell:nth-child(even){--c1:#23805f;--c2:#0f4c39;--ink:#f7dc8a;--perf:#f5d283}
    .adv-cell.adv-d25{--c1:#f6dc86;--c2:#c8922c;--ink:#5a1a24;--perf:#7a4a10}
    .adv-cell.adv-p1,.adv-cell.adv-p2,.adv-cell.adv-p3,.adv-cell.adv-p4,.adv-cell.adv-p0{--tone:rgba(255,255,255,.07);--tex:radial-gradient(120% 80% at 50% 0,rgba(255,255,255,.16),transparent 60%),repeating-linear-gradient(135deg,rgba(255,255,255,.05) 0 1.5px,transparent 1.5px 8px)}
    .adv-face{box-shadow:inset 0 1.5px 0 rgba(255,255,255,.38),inset 0 -3px 0 rgba(0,0,0,.28),inset 0 0 0 1px rgba(0,0,0,.18),0 2px 3px rgba(0,0,0,.5)}
    .adv-face::before{inset:max(3.500px,calc(var(--u)*.06));border:1px solid var(--perf);opacity:.85;box-shadow:0 0 0 max(2px,calc(var(--u)*.022)) rgba(0,0,0,.14),inset 0 0 0 max(2px,calc(var(--u)*.022)) rgba(0,0,0,.1)}
    .adv-t1 .adv-num,.adv-t2 .adv-num{display:block;width:auto;height:auto;min-width:0;padding:0;border:0;border-radius:0;background:none;box-shadow:none;margin:0;font-size:calc(var(--u)*.5);color:inherit}
    .adv-t1 .adv-num::before{display:none}
    .adv-t1 .adv-motif{display:block}
    .adv-face .adv-num{background:linear-gradient(180deg,#fffbe0 0,#f6d56e 48%,#c0891a 100%);-webkit-background-clip:text;background-clip:text;color:transparent!important;filter:drop-shadow(0 1.5px 0 rgba(0,0,0,.45));text-shadow:none!important}
    .adv-d25 .adv-face .adv-num{background:linear-gradient(180deg,#8a2a3a,#4c1520);-webkit-background-clip:text;background-clip:text;filter:drop-shadow(0 1px 0 rgba(255,255,255,.4))}
    .adv-motif{opacity:1;color:var(--perf)}
    .adv-d25 .adv-motif{color:#7a4a10}
    .adv-hinge{background:linear-gradient(180deg,#fff0b8,#d9a73e 55%,#8a6520)}
    /* fairy lights along the top of the board */
    .adv-board::before{content:"";position:absolute;left:12px;right:12px;top:-8px;height:16px;pointer-events:none;z-index:4;
      background:
        radial-gradient(circle at 5px 10px,#ff5a6c 0 3.200px,transparent 4px) 0 0/68px 16px repeat-x,
        radial-gradient(circle at 5px 10px,#ffd166 0 3.200px,transparent 4px) 17px 0/68px 16px repeat-x,
        radial-gradient(circle at 5px 10px,#3ee6a0 0 3.200px,transparent 4px) 34px 0/68px 16px repeat-x,
        radial-gradient(circle at 5px 10px,#5aa2ff 0 3.200px,transparent 4px) 51px 0/68px 16px repeat-x,
        linear-gradient(#0a1f1a,#0a1f1a) 0 4px/100% 1.500px no-repeat;
      filter:drop-shadow(0 0 3px rgba(255,255,255,.35))}
    /* ---- the Tap Santa tile ---- */
    .gm-santa-art{width:100%;height:100%;display:block}
  `);

  /* Santa's sleigh over a snowy village at night: layered, shaded, drawn for the Tap Santa tile.
     The scene is anchored to the bottom, and everything past the edges is extended so tall and wide tiles both fill. */
  A.santaArt = function () {
    const rnd = i => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); };
    const twinkle = (x, y, r, o) => '<path d="M' + x + ' ' + (y - r) + 'q' + (r * .25) + ' ' + (r * .75) + ' ' + r + ' ' + r + 'q-' + (r * .75) + ' ' + (r * .25) + ' -' + r + ' ' + r + 'q-' + (r * .25) + ' -' + (r * .75) + ' -' + r + ' -' + r + 'q' + (r * .75) + ' -' + (r * .25) + ' ' + r + ' -' + r + 'z" fill="#fff" opacity="' + o + '"/>';
    let sky = '';
    for (let i = 0; i < 70; i++) { const x = -60 + rnd(i + 1) * 320, y = -330 + rnd(i + 91) * 380; sky += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (.5 + rnd(i + 7) * 1.1).toFixed(2) + '" fill="#fff" opacity="' + (.35 + rnd(i + 17) * .6).toFixed(2) + '"/>'; }
    [[30, 18, 3.2, .9], [176, 8, 2.6, .8], [60, -30, 3.6, .9], [150, -80, 3, .8], [14, -110, 2.6, .8], [120, 24, 2.2, .7], [190, 40, 2.4, .8]].forEach(s => { sky += twinkle(s[0], s[1], s[2], s[3]); });
    let snow = '';
    for (let i = 0; i < 38; i++) snow += '<circle cx="' + (-20 + rnd(i + 301) * 240).toFixed(1) + '" cy="' + (rnd(i + 401) * 140).toFixed(1) + '" r="' + (.5 + rnd(i + 11) * .8).toFixed(2) + '" fill="#fff" opacity="' + (.35 + rnd(i + 23) * .5).toFixed(2) + '"/>';
    const pine = (x, y, s, c) => '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><path d="M0 -17l6 8h-3.500l5 7h-4l5 7H-9l5-7h-4l5-7H-6z" fill="' + c + '"/><path d="M0 -17l3.500 4.600H-3.500zM-2 -8.500l2-1.500 2 1.500-2 1.200z" fill="#fff" opacity=".85"/><rect x="-1.200" y="5" width="2.400" height="3" fill="#4a2f1b"/></g>';
    const house = (x, y, s, wall, roof) => '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><rect x="-8" y="-9" width="16" height="10" fill="' + wall + '"/><path d="M-10.500 -9L0 -18l10.500 9z" fill="' + roof + '"/><path d="M-10.500 -9L0 -18l10.500 9H8L0 -15.500-8-9z" fill="#fff" opacity=".9"/><rect x="5" y="-17" width="3" height="5" fill="#6b4a3a"/><rect x="-5.500" y="-6" width="4.500" height="4.500" rx=".6" fill="#ffd479"/><rect x="2" y="-6" width="4.500" height="4.500" rx=".6" fill="#ffd479"/><rect x="-5.500" y="-6" width="4.500" height="4.500" rx=".6" fill="#ffe9a8" opacity=".6"/></g>';
    const gift = (x, y, w, h, box, rib, rot) => '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ')"><rect x="' + (-w / 2) + '" y="' + (-h) + '" width="' + w + '" height="' + h + '" rx="1" fill="' + box + '"/><rect x="-1" y="' + (-h) + '" width="2" height="' + h + '" fill="' + rib + '"/><rect x="' + (-w / 2) + '" y="' + (-h / 2 - 1) + '" width="' + w + '" height="2" fill="' + rib + '"/><path d="M0 ' + (-h) + 'q-4 -4 -5 -1q1 3 5 1zM0 ' + (-h) + 'q4 -4 5 -1q-1 3 -5 1z" fill="' + rib + '"/></g>';
    const deer = (x, y, s, f1, f2, op) => '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')" opacity="' + (op || 1) + '" stroke="#2c1a10" stroke-width=".7" stroke-linejoin="round" stroke-linecap="round">' +
      '<ellipse cx="-15" cy="-3.500" rx="3.200" ry="2.200" fill="' + f2 + '"/>' +
      '<path d="M-9 4L-16 12M-5 6L-10 13.500" stroke="' + f2 + '" stroke-width="3.800" fill="none"/><path d="M-16 12L-17.500 14.500M-10 13.500L-11.500 16" stroke="#1d1008" stroke-width="3.400" fill="none"/>' +
      '<ellipse cx="0" cy="0" rx="14.500" ry="8" fill="url(#' + f1 + ')"/><ellipse cx="1" cy="4" rx="10" ry="3.200" fill="#f3dfbd" stroke="none" opacity=".9"/><path d="M-10 -6Q0 -9.500 10 -6" stroke="#e3b27a" stroke-width="1.100" fill="none" opacity=".75"/>' +
      '<path d="M-8 -3q2 2 0 4M-4 -4q2 2 0 4M0 -4q2 2 0 4" stroke="#5a3318" stroke-width=".6" fill="none" opacity=".5"/>' +
      '<path d="M7 5L16 9.500M10 4L19 6.500" stroke="' + f2 + '" stroke-width="3.800" fill="none"/><path d="M16 9.500L18.500 11M19 6.500L21.500 8" stroke="#1d1008" stroke-width="3.400" fill="none"/>' +
      '<path d="M8 -4L16 -14.500L22.500 -10L14 2z" fill="url(#' + f1 + ')"/><path d="M10 -3l-2 4l3.500 -1l.6 3.500l2.400 -4.600z" fill="#f3dfbd" stroke="none"/>' +
      '<ellipse cx="23" cy="-15" rx="7.200" ry="5" transform="rotate(-28 23 -15)" fill="url(#' + f1 + ')"/><ellipse cx="28.800" cy="-12" rx="3.800" ry="3" transform="rotate(-28 28.800 -12)" fill="#f3dfbd"/>' +
      '<path d="M27.500 -9.200Q29.500 -8.600 31 -9.400" stroke="#6a3a28" stroke-width=".7" fill="none"/><circle cx="31.500" cy="-11" r="6" fill="url(#sa-nose)" opacity=".75" stroke="none"/><circle cx="31.500" cy="-11" r="2.600" fill="#ff4040" stroke="#9c1414" stroke-width=".5"/><circle cx="30.700" cy="-11.900" r=".9" fill="#fff" stroke="none" opacity=".95"/>' +
      '<circle cx="24" cy="-17" r="1.500" fill="#140c08" stroke="none"/><circle cx="24.500" cy="-17.500" r=".55" fill="#fff" stroke="none"/><path d="M21.500 -19.500Q24 -21 26.500 -19.500" stroke="#3a2312" stroke-width=".6" fill="none"/>' +
      '<ellipse cx="18.500" cy="-20.500" rx="1.900" ry="3.800" transform="rotate(-32 18.500 -20.500)" fill="' + f2 + '"/><ellipse cx="18.500" cy="-20.500" rx=".9" ry="2.600" transform="rotate(-32 18.500 -20.500)" fill="#e8a08a" stroke="none" opacity=".7"/>' +
      '<path d="M21 -19.500L19 -28.500M19 -28.500L14.500 -31M19.500 -25L24.500 -28.500M19 -28.500L20.500 -33.500" stroke="#3b2a14" stroke-width="2.600" fill="none"/><path d="M21 -19.500L19 -28.500M19 -28.500L14.500 -31M19.500 -25L24.500 -28.500M19 -28.500L20.500 -33.500" stroke="#f0dcaa" stroke-width="1.400" fill="none"/>' +
      '<path d="M24.500 -19.500L27 -28M27 -28L31.500 -30M26.500 -23.500L22.500 -27" stroke="#c9b27c" stroke-width="1.300" fill="none"/>' +
      '<path d="M9 -5.500L6.500 7.500" stroke="#d7263d" stroke-width="2.400" fill="none"/><path d="M-8 -7L8 -6.500" stroke="#a3162a" stroke-width="1.200" fill="none" opacity=".8"/><circle cx="6.500" cy="8" r="2" fill="url(#sa-gold)" stroke="#8a5a0a" stroke-width=".5"/><circle cx="6" cy="7.400" r=".7" fill="#fff" stroke="none"/></g>';
    /* Santa, the sleigh and a reindeer, drawn as a few big smooth forms. Each form has one outline around all its parts, so the joints blend,
       and its light and shadow are soft blurred patches clipped inside it, like a painting, instead of separate shapes stacked on top. */
    const OL = '#5a1824';
    const form = (id, shapes, fill, shade, ow) => '<clipPath id="' + id + '">' + shapes + '</clipPath>' +
      '<g fill="' + OL + '" stroke="' + OL + '" stroke-width="' + (ow || 1.300) + '" stroke-linejoin="round" stroke-linecap="round">' + shapes + '</g>' +
      '<g fill="' + fill + '">' + shapes + '</g><g clip-path="url(#' + id + ')">' + shade + '</g>';
    const blob = (cx, cy, rx, ry, c, o, f, rot) => '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + c + '" opacity="' + o + '" filter="url(#sa-' + (f || 'b2') + ')"' + (rot ? ' transform="rotate(' + rot + ' ' + cx + ' ' + cy + ')"' : '') + '/>';
    const line = (d, c, w, o, f) => '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + w + '" stroke-linecap="round" opacity="' + (o || 1) + '"' + (f ? ' filter="url(#sa-' + f + ')"' : '') + '/>';
    const trim = (d, w) => line(d, '#7a4a10', w + 1.100) + line(d, 'url(#sa-gold)', w) + line(d, '#fff8d0', 0.7, 0.9);
    const foreground = () => {
      /* runner and sleigh */
      let g = trim('M33 112C50 114.500 92 114.500 108 112C121 110 129 102 127 93C126 88 121 87 119 90', 3.4) + trim('M57 104V112M91 104V112', 2.2);
      /* sack and presents */
      g += form('sa-f-sack', '<path d="M34 80C28 66 35 52 50 50C63 49 71 58 69 80Z"/>', 'url(#sa-sack)', blob(48, 82, 26, 8, '#2a1206', .6) + blob(36, 66, 7, 14, '#2a1206', .35) + blob(58, 58, 9, 7, '#e0a56a', .55, 'b1'));
      g += line('M44 54Q53 60 63 54', OL, 4) + line('M44 54Q53 60 63 54', 'url(#sa-gold)', 2.200);
      const gift = (x, y, w, h, c, r, rot) => '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ')"><rect x="' + (-w / 2) + '" y="' + (-h) + '" width="' + w + '" height="' + h + '" rx="1.800" fill="' + OL + '" transform="scale(1.100)"/><rect x="' + (-w / 2) + '" y="' + (-h) + '" width="' + w + '" height="' + h + '" rx="1.600" fill="' + c + '"/><rect x="' + (-w / 2 + .6) + '" y="' + (-h + .6) + '" width="' + (w * .3) + '" height="' + (h - 1.2) + '" rx=".8" fill="#fff" opacity=".28"/><rect x="' + (-w * .11) + '" y="' + (-h) + '" width="' + (w * .22) + '" height="' + h + '" fill="' + r + '"/><rect x="' + (-w / 2) + '" y="' + (-h * .56) + '" width="' + w + '" height="' + (h * .2) + '" fill="' + r + '"/><path d="M0 ' + (-h) + 'q-5.500 -5.500 -6.500 -1.500q1.200 4 6.500 1.500zM0 ' + (-h) + 'q5.500 -5.500 6.500 -1.500q-1.200 4 -6.500 1.500z" fill="' + r + '" stroke="' + OL + '" stroke-width=".8"/></g>';
      g += gift(46, 52, 11, 10, '#3b82f6', '#ffd166', -12) + gift(58, 49, 10, 9, '#2fb07a', '#ff5a6c', 6) + gift(66, 55, 9, 8, '#a76bff', '#ffe28a', 16);
      /* reins */
      g += line('M121 66C132 64 142 62 152 61', '#6b3a1c', 1.200) + line('M120 68C132 68 142 67 150 66', '#6b3a1c', 1.200);
      /* the reindeer: one body, neck and head, with legs that flow out of it */
      g += form('sa-f-deer', '<path d="M137 68C136 59 146 54 156 56C160 57 163 55 165 50C167 45 166 40 168 37C172 32 180 33 182 38C184 42 182 45 179 46C177 47 176 49 175 52C174 59 171 65 167 69C162 73 156 75 150 75C143 75 138 73 137 68Z"/><path d="M158 70C165 71 172 70 180 66L181 70C174 75 165 77 157 75Z"/><path d="M164 71C169 74 174 77 177 82L173 84C169 80 164 77 160 74Z"/><path d="M143 72C139 76 134 79 128 80L127 76C132 75 136 73 139 69Z"/><path d="M148 74C146 79 143 83 138 86L135 83C139 81 141 78 143 73Z"/><ellipse cx="136.500" cy="62" rx="4" ry="3.200"/><path d="M169 36C168 31 170 28 172 29C174 31 173 34 172 37Z"/>', 'url(#sa-fur)',
        blob(150, 70, 16, 7, '#f3dfbd', .75) + blob(152, 56, 15, 4.500, '#e3b27a', .55, 'b1') + blob(142, 62, 8, 9, '#3a1a08', .35) + blob(176, 41, 9, 8, '#3a1a08', .25, 'b1') + blob(178, 45, 5.500, 4.500, '#f3dfbd', .85, 'b1') + blob(150, 78, 20, 4, '#2b1306', .35));
      g += form('sa-f-hoof', '<ellipse cx="178.500" cy="66.500" rx="2.800" ry="2"/><ellipse cx="175" cy="83" rx="2.800" ry="2" transform="rotate(25 175 83)"/><ellipse cx="127" cy="77.500" rx="2.800" ry="2"/><ellipse cx="136.500" cy="85" rx="2.800" ry="2" transform="rotate(-25 136.500 85)"/>', '#241410', '');
      g += '<circle cx="183" cy="42" r="6" fill="url(#sa-nose)" opacity=".8"/><circle cx="183" cy="42" r="2.700" fill="#ff4040" stroke="' + OL + '" stroke-width=".8"/><circle cx="182.200" cy="41" r=".9" fill="#fff"/><circle cx="173.500" cy="37" r="1.500" fill="#140c08"/><circle cx="174" cy="36.400" r=".55" fill="#fff"/>';
      g += line('M170 31C168 24 164 20 163 14M166 22C163 21 160 21 158 19M168 27C172 24 176 22 177 17M170 30C174 28 179 28 182 25', OL, 3.200) + line('M170 31C168 24 164 20 163 14M166 22C163 21 160 21 158 19M168 27C172 24 176 22 177 17M170 30C174 28 179 28 182 25', '#f0dcaa', 1.700);
      g += line('M157 56C158 62 158 68 157 74', OL, 4) + line('M157 56C158 62 158 68 157 74', '#d7263d', 2.200) + '<circle cx="157.500" cy="75.500" r="2.200" fill="url(#sa-gold)" stroke="' + OL + '" stroke-width=".7"/>';
      /* Santa: coat and arm are one form */
      g += form('sa-f-coat', '<path d="M75 83C70 67 74 53 86 49C97 46 108 51 110 62C111 68 111 76 109 83Z"/><path d="M99 53C108 52 116 56 121 63L114 69C110 64 106 61 99 62Z"/>', 'url(#sa-red)',
        blob(80, 70, 9, 21, '#4e0714', .5) + blob(98, 57, 7, 7, '#ff9aa8', .55) + blob(115, 73, 7, 4, '#4e0714', .5, 'b1') + blob(104, 82, 14, 5, '#4e0714', .35) + blob(92, 73, 14, 5, '#3a0510', .6, 'b1') + blob(112, 70, 6, 3, '#3a0510', .5, 'b1') +
        line('M101 57C108 56 114 60 118 66', '#ff9aa8', 2.400, .6, 'b1') + line('M85 62C86 68 85 75 84 80', '#4e0714', 1.600, .5, 'b1') + line('M104 63C106 69 106 75 105 80', '#4e0714', 1.400, .4, 'b1'));
      g += line('M93 51C94 62 94 74 93 83', '#7a1424', 4.800) + line('M93 51C94 62 94 74 93 83', '#fff', 3) + line('M75 66C86 71 100 71 110 64', '#0e0a12', 6) + line('M75 65C86 70 100 70 110 63', '#2c2632', 4.400) + line('M78 71.200C88 75.500 100 75 107 69.500', '#6b6478', 1, .7);
      g += '<rect x="88" y="64" width="9" height="7.500" rx="1.800" fill="url(#sa-gold)" stroke="' + OL + '" stroke-width="1"/><rect x="90.500" y="66" width="4" height="3.500" rx=".8" fill="#2c2632"/>';
      g += '<ellipse cx="115.500" cy="67" rx="5" ry="6.200" transform="rotate(-35 115.500 67)" fill="' + OL + '"/><ellipse cx="115.500" cy="67" rx="4.200" ry="5.400" transform="rotate(-35 115.500 67)" fill="#fff"/>' +
        form('sa-f-mitt', '<circle cx="121" cy="65.500" r="5"/>', '#2c2632', blob(119.500, 63.500, 3, 2.500, '#8a82a0', .7, 'b1'), 2.400);
      /* head, beard, hat */
      g += form('sa-f-head', '<circle cx="92" cy="45" r="11"/><circle cx="81.500" cy="46.500" r="3"/><circle cx="102.500" cy="46.500" r="3"/>', 'url(#sa-skin)',
        blob(86, 51, 3.800, 3, '#ff5f78', .6, 'b1') + blob(98, 51, 3.800, 3, '#ff5f78', .6, 'b1') + blob(92, 37, 13, 5, '#9a4a3a', .55, 'b1') + blob(96, 42, 5, 4, '#fff', .25, 'b1'));
      g += '<ellipse cx="88" cy="46" rx="1.500" ry="2.100" fill="#1d1418"/><ellipse cx="96" cy="46" rx="1.500" ry="2.100" fill="#1d1418"/><circle cx="88.600" cy="45.100" r=".7" fill="#fff"/><circle cx="96.600" cy="45.100" r=".7" fill="#fff"/>' +
        line('M84 42.600Q88 40 91.500 42.400M92.500 42.400Q96 40 100 42.600', '#fff', 1.900);
      g += form('sa-f-beard', '<path d="M81 49C79 61 84 71 92 72C100 71 105 61 103 49C100 55 96 57 92 55.500C88 57 84 55 81 49Z"/><path d="M80 53C83 46 89 49 92 53C95 49 101 46 104 53C100 59 96 57.500 92 55.500C88 57.500 84 59 80 53Z"/>', 'url(#sa-beard)',
        blob(92, 71, 13, 5, '#8da4cc', .65) + blob(82, 60, 4, 10, '#8da4cc', .5, 'b1') + blob(102, 60, 4, 10, '#8da4cc', .5, 'b1') + blob(92, 58, 5, 2.500, '#8da4cc', .45, 'b1') +
        line('M87 60Q88 65 87 69M92 61V70M97 60Q96 65 97 69', '#b6c6e2', .9, .9) + blob(87, 52, 4, 1.600, '#fff', .8, 'b1') + blob(97, 52, 4, 1.600, '#fff', .8, 'b1'), 2.400);
      g += '<circle cx="92" cy="49.500" r="2.500" fill="#f2907e" stroke="#b8604a" stroke-width=".5"/><circle cx="91.200" cy="48.700" r=".7" fill="#fff" opacity=".9"/>' + line('M89 58Q92 60.500 95 58', '#b4424d', 1);
      /* the hat: dome, tail and fur band are drawn together, then lit */
      const hatRed = '<path d="M78 46C74 31 85 20 98 21C110 22 116 30 116 41L116 47C108 44 90 43 78 46Z"/><path d="M107 24C118 25 125 35 123 46C122 50 119 52 117 50C118 42 114 34 106 31Z"/>';
      const hatBand = '<path d="M75 47C78 42.500 87 41 96 41.500C105 42 112 44 115 48C115 51.500 108 52 100 52C90 52 79 51 75 47Z"/>';
      const hatPom = '<circle cx="120.500" cy="53.500" r="5.800"/>';
      g += '<g transform="translate(0 -8) translate(92 46) scale(.78 .9) translate(-92 -46)"><clipPath id="sa-f-hat-c">' + hatRed + '</clipPath><clipPath id="sa-f-band-c">' + hatBand + hatPom + '</clipPath>' +
        '<g fill="' + OL + '" stroke="' + OL + '" stroke-width="1.300" stroke-linejoin="round">' + hatRed + hatBand + hatPom + '</g>' +
        '<g fill="url(#sa-red)">' + hatRed + '</g>' +
        '<g clip-path="url(#sa-f-hat-c)">' + blob(98, 42, 22, 4, '#4e0714', .7, 'b1') + blob(82, 34, 6, 12, '#4e0714', .45) + blob(94, 28, 9, 4, '#ff9aa8', .6, 'b1') + blob(113, 40, 5, 9, '#4e0714', .4, 'b1') + blob(121, 40, 4, 8, '#4e0714', .35, 'b1') + '</g>' +
        '<g fill="url(#sa-beard)">' + hatBand + '</g><g fill="#fff">' + hatPom + '</g>' +
        '<g clip-path="url(#sa-f-band-c)">' + blob(96, 52, 20, 3, '#8da4cc', .7, 'b1') + blob(123, 57, 5, 3.500, '#8da4cc', .7, 'b1') + blob(100, 43, 14, 1.600, '#fff', .9, 'b1') + blob(119, 51, 2.200, 2.200, '#fff', .9, 'b1') + '</g></g>';
      /* the near side of the sleigh goes in front, so Santa sits inside it */
      g += blob(92, 76.500, 34, 4, '#1a0308', .55, 'b1') + blob(60, 74, 14, 5, '#1a0308', .35, 'b1');
      g += '<g transform="translate(0 6)">';
      g += form('sa-f-sleigh', '<path d="M41 70C38 83 45 97 58 102C72 107 99 107 111 99C120 93 124 83 122 74C121 71 119 70 116 70H47C44 70 42 70 41 70Z"/><path d="M42 75C33 75 29 66 33 60C36 55 43 57 43 62C43 66 45 70 49 72Z"/>', 'url(#sa-red)',
        blob(82, 107, 48, 9, '#4e0714', .6) + blob(38, 88, 9, 22, '#4e0714', .45) + blob(66, 76, 28, 4.500, '#ff9aa8', .65, 'b1') + blob(113, 84, 7, 13, '#ff8090', .4) + blob(82, 96, 36, 3, '#4e0714', .3, 'b1'));
      g += trim('M42 71.500C60 73.500 100 73.500 120 71.500', 3.2) + line('M55 90C58 80 69 80 73 88C69 94 61 93 59 89C58 91 60 93 63 92', OL, 3.800) + line('M55 90C58 80 69 80 73 88C69 94 61 93 59 89C58 91 60 93 63 92', 'url(#sa-gold)', 2) +
        line('M82 90C86 80 97 80 101 88C97 94 89 93 87 89C86 91 88 93 91 92', OL, 3.800) + line('M82 90C86 80 97 80 101 88C97 94 89 93 87 89C86 91 88 93 91 92', 'url(#sa-gold)', 2) +
        line('M117 74C126 72 130 65 126 61C123 58 118 60 119 64', OL, 3.800) + line('M117 74C126 72 130 65 126 61C123 58 118 60 119 64', 'url(#sa-gold)', 2);
      g += '</g>';
      return g;
    };
    return '<svg class="gm-santa-art" viewBox="26 14 164 126" preserveAspectRatio="xMidYMax meet" style="overflow:visible" aria-hidden="true">' +
      '<defs>' +
      '<linearGradient id="sa-sky" gradientUnits="userSpaceOnUse" x1="0" y1="-330" x2="0" y2="135"><stop offset="0" stop-color="#070a30"/><stop offset=".5" stop-color="#1f1670"/><stop offset=".82" stop-color="#6a2c8c"/><stop offset="1" stop-color="#e0719a"/></linearGradient>' +
      '<radialGradient id="sa-moon" cx=".4" cy=".35"><stop offset="0" stop-color="#fffdf0"/><stop offset="1" stop-color="#f1deA0"/></radialGradient>' +
      '<radialGradient id="sa-halo"><stop offset="0" stop-color="#fff4c4" stop-opacity=".55"/><stop offset="1" stop-color="#fff4c4" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="sa-glow"><stop offset="0" stop-color="#ffd98a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="sa-nose"><stop offset="0" stop-color="#ff5a5a" stop-opacity=".9"/><stop offset="1" stop-color="#ff5a5a" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="sa-red" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff5a6c"/><stop offset=".55" stop-color="#d11d36"/><stop offset="1" stop-color="#8f0f24"/></linearGradient>' +
      '<linearGradient id="sa-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0a8"/><stop offset=".5" stop-color="#f0bf4a"/><stop offset="1" stop-color="#b8790f"/></linearGradient>' +
      '<linearGradient id="sa-fur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b87a45"/><stop offset="1" stop-color="#6c3f1f"/></linearGradient>' +
      '<linearGradient id="sa-fur2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8e5b33"/><stop offset="1" stop-color="#4f2c15"/></linearGradient>' +
      '<linearGradient id="sa-skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe0c2"/><stop offset="1" stop-color="#eea987"/></linearGradient>' +
      '<linearGradient id="sa-beard" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cfdcf2"/></linearGradient>' +
      '<linearGradient id="sa-trail" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#ffe9a0"/><stop offset="1" stop-color="#ffe9a0" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="sa-hill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f8ff"/><stop offset="1" stop-color="#b9c9ea"/></linearGradient>' +
      '<linearGradient id="sa-aur" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3ee6b0" stop-opacity="0"/><stop offset=".5" stop-color="#3ee6b0" stop-opacity=".35"/><stop offset="1" stop-color="#7a6bff" stop-opacity="0"/></linearGradient>' +
      '<filter id="sa-blur" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="1.700"/></filter>' +
      '<filter id="sa-blur2"><feGaussianBlur stdDeviation="5"/></filter><filter id="sa-soft" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation=".34"/></filter><filter id="sa-b1" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.100"/></filter><filter id="sa-b2" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="2.600"/></filter><linearGradient id="sa-sack" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c98a55"/><stop offset="1" stop-color="#7a4524"/></linearGradient>' +
      '</defs>' +
      '<rect x="-400" y="-900" width="1000" height="1050" fill="url(#sa-sky)"/>' + sky +
      /* aurora ribbons and a big moon, for the sky above */
      '<g filter="url(#sa-blur2)"><path d="M-60 -70C0 -120 60 -40 120 -90S220 -130 260 -80V-40C200 -80 140 0 80 -40S0 -30 -60 -20z" fill="url(#sa-aur)"/><path d="M-60 -150C10 -190 80 -120 140 -170S240 -190 270 -150V-120C220 -150 160 -90 100 -120S20 -110 -60 -100z" fill="url(#sa-aur)" opacity=".7"/></g>' +
      '<circle cx="152" cy="-58" r="46" fill="url(#sa-halo)"/><circle cx="152" cy="-58" r="20" fill="url(#sa-moon)"/><circle cx="145" cy="-63" r="3.400" fill="#e9d38a" opacity=".55"/><circle cx="158" cy="-52" r="2.400" fill="#e9d38a" opacity=".5"/><circle cx="149" cy="-49" r="1.800" fill="#e9d38a" opacity=".45"/>' +
      '<g opacity=".16" fill="#fff"><ellipse cx="40" cy="106" rx="60" ry="6"/><ellipse cx="170" cy="100" rx="52" ry="5"/><ellipse cx="110" cy="-12" rx="46" ry="4"/></g>' +
      /* the village */
      '<path d="M-400 112H18C48 96 82 104 112 100S166 90 200 102H600V300H-400z" fill="#2c2475"/>' + pine(26, 104, .8, '#1d3b46') + pine(36, 106, .6, '#23495a') + pine(176, 98, .85, '#1d3b46') + pine(186, 100, .65, '#23495a') +
      '<path d="M-400 124H10C50 108 92 122 130 116S178 108 200 116H600V300H-400z" fill="url(#sa-hill)"/>' +
      house(36, 122, .95, '#c24a4f', '#4a3b83') + house(168, 118, .8, '#e0a64b', '#a3283e') + pine(50, 124, .9, '#2c6a58') + pine(60, 126, .7, '#3a8068') + pine(150, 121, .8, '#2c6a58') +
      '<path d="M-400 134H0C50 124 104 134 152 130S190 126 200 130H600V300H-400z" fill="#c4d3f0"/><path d="M-400 140H600V300H-400z" fill="#a9bde4"/>' +
      /* the glow and the sparkle trail */
      '<circle cx="112" cy="66" r="62" fill="url(#sa-glow)"/>' +
      '<g transform="rotate(-11 112 70)">' + foreground() +
      '</g>' + snow + '</svg>';
  };
})();
