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
    .fm-pic svg :is(path,circle,rect,ellipse,polygon){fill:currentColor;fill-opacity:.22}
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
    .iconpick button{flex:none;width:46px;height:46px;border-radius:14px}
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
    const deer = (x, y, s, f1, f2, op) => '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')" opacity="' + (op || 1) + '">' +
      '<ellipse cx="-14.500" cy="-3.500" rx="3" ry="2" fill="' + f2 + '"/>' +
      '<path d="M-9 4L-16 12M-5 6L-10 13.500" stroke="' + f2 + '" stroke-width="3.400" stroke-linecap="round" fill="none"/><path d="M-16 12l-2 2.500M-10 13.500l-2 2.500" stroke="#2c1a10" stroke-width="3" stroke-linecap="round"/>' +
      '<ellipse cx="0" cy="0" rx="14.500" ry="7.800" fill="url(#' + f1 + ')"/><ellipse cx="1" cy="3.800" rx="10" ry="3" fill="#f0d9b5" opacity=".85"/>' +
      '<path d="M7 5L16 9.500M10 4L19 6.500" stroke="' + f2 + '" stroke-width="3.400" stroke-linecap="round" fill="none"/><path d="M16 9.500l3 1.200M19 6.500l3 .8" stroke="#2c1a10" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M8 -4L16 -14l6 4-8 12z" fill="url(#' + f1 + ')"/>' +
      '<ellipse cx="23" cy="-15" rx="7" ry="4.800" transform="rotate(-28 23 -15)" fill="url(#' + f1 + ')"/><ellipse cx="28.500" cy="-12" rx="3.600" ry="2.800" transform="rotate(-28 28.500 -12)" fill="#f0d9b5"/>' +
      '<circle cx="31" cy="-11" r="5.500" fill="url(#sa-nose)" opacity=".7"/><circle cx="31" cy="-11" r="2.400" fill="#ff4a4a"/><circle cx="30.300" cy="-11.800" r=".8" fill="#fff" opacity=".9"/>' +
      '<circle cx="24" cy="-17" r="1" fill="#1d1410"/><circle cx="24.300" cy="-17.300" r=".35" fill="#fff"/><ellipse cx="18.500" cy="-20" rx="1.700" ry="3.600" transform="rotate(-32 18.500 -20)" fill="' + f2 + '"/>' +
      '<path d="M21 -19L19 -28M19 -28L15 -30.500M19.600 -24.500L24 -28M19 -28L20.500 -32.500" stroke="#ecd7a3" stroke-width="1.500" stroke-linecap="round" fill="none"/><path d="M24 -19L26.500 -27M26.500 -27L30.500 -29M26 -23L22.500 -26" stroke="#c9b27c" stroke-width="1.200" stroke-linecap="round" fill="none"/>' +
      '<path d="M9 -5L6.500 7" stroke="#d7263d" stroke-width="2.200" stroke-linecap="round"/><circle cx="6.500" cy="7.500" r="1.800" fill="#ffd166"/><circle cx="6.200" cy="7" r=".6" fill="#fff"/></g>';
    return '<svg class="gm-santa-art" viewBox="18 14 172 126" preserveAspectRatio="xMidYMax meet" style="overflow:visible" aria-hidden="true">' +
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
      '<filter id="sa-blur2"><feGaussianBlur stdDeviation="5"/></filter>' +
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
      '<g transform="rotate(-11 112 70)">' +
      '<path d="M66 92C46 98 36 90 20 100" stroke="url(#sa-trail)" stroke-width="7" stroke-linecap="round" fill="none" filter="url(#sa-blur)"/><path d="M66 90C48 94 38 88 24 96" stroke="url(#sa-trail)" stroke-width="2.200" stroke-linecap="round" fill="none"/>' +
      twinkle(40, 92, 3, .95) + twinkle(28, 99, 2.200, .85) + twinkle(52, 86, 2, .9) + twinkle(20, 92, 1.800, .7) +
      /* reindeer, the far one first */
      deer(121, 72, .86, 'sa-fur2', '#5a3318', .95) + deer(153, 62, 1, 'sa-fur', '#7a4a26') +
      /* reins */
      '<path d="M120 70Q134 64 150 60M120 72Q130 72 138 70" stroke="#e9c46a" stroke-width="1" fill="none" stroke-linecap="round"/>' +
      /* sleigh */
      '<path d="M40 110H98Q116 110 121 94Q123 88 118 85" stroke="url(#sa-gold)" stroke-width="3.800" stroke-linecap="round" fill="none"/><path d="M42 108.500H98" stroke="#fff6c0" stroke-width=".8" opacity=".8"/><path d="M56 102V110M88 102V110" stroke="#c9922e" stroke-width="2.600" stroke-linecap="round"/>' +
      '<path d="M50 70H110C115 70 117 74 116 78C112 94 100 102 82 102H62C53 102 48 94 50 83z" fill="url(#sa-red)"/><path d="M50 70H110" stroke="url(#sa-gold)" stroke-width="3" stroke-linecap="round"/><path d="M52 92Q84 100 112 86" stroke="#7e0d1e" stroke-width="2.200" opacity=".5" fill="none"/>' +
      '<path d="M58 84q9-9 18 0q-7 7-12 2M82 84q8-8 15 0q-6 6-10 2" stroke="url(#sa-gold)" stroke-width="1.500" fill="none" stroke-linecap="round"/><path d="M52 74H108" stroke="#ff9aa6" stroke-width="1" opacity=".7"/>' +
      /* the sack and the presents */
      '<path d="M40 74C33 60 41 48 56 50C67 52 72 62 70 74z" fill="url(#sa-fur2)"/><path d="M47 52Q56 57 66 52" stroke="url(#sa-gold)" stroke-width="2" fill="none" stroke-linecap="round"/>' +
      gift(48, 52, 10, 9, '#3b82f6', '#ffd166', -14) + gift(58, 49, 9, 8, '#2fb07a', '#ff5a6c', 8) + gift(66, 56, 8, 7, '#a76bff', '#ffe28a', 18) +
      /* Santa */
      '<path d="M78 76C75 64 82 55 92 55C102 55 108 64 106 76z" fill="url(#sa-red)"/><path d="M79 66C81 60 86 57 92 57" stroke="#ff8a98" stroke-width="1.200" fill="none" opacity=".8"/>' +
      '<rect x="78.500" y="66.500" width="27" height="3.400" fill="#1d1a26"/><rect x="89" y="65.400" width="6.400" height="5.600" rx="1" fill="url(#sa-gold)" stroke="#9c6a10" stroke-width=".5"/>' +
      '<path d="M78 76H106" stroke="#fff" stroke-width="3.400" stroke-linecap="round"/>' +
      '<path d="M100 62C107 61 112 64 117 68" stroke="url(#sa-red)" stroke-width="6.500" stroke-linecap="round" fill="none"/><circle cx="112.500" cy="66" r="3.400" fill="#fff"/><circle cx="118.500" cy="68.500" r="3.600" fill="#2a2230"/><circle cx="117.600" cy="67.500" r="1" fill="#6b6478" opacity=".7"/>' +
      '<circle cx="92" cy="47.500" r="9.200" fill="url(#sa-skin)"/><circle cx="86.500" cy="50" r="2.300" fill="#ff8f94" opacity=".55"/><circle cx="97.500" cy="50" r="2.300" fill="#ff8f94" opacity=".55"/>' +
      '<ellipse cx="88.500" cy="46" rx="1" ry="1.300" fill="#2a1d1d"/><ellipse cx="95.500" cy="46" rx="1" ry="1.300" fill="#2a1d1d"/><circle cx="88.800" cy="45.500" r=".35" fill="#fff"/><circle cx="95.800" cy="45.500" r=".35" fill="#fff"/>' +
      '<path d="M86 43.500Q88.500 42 91 43.500M93 43.500Q95.500 42 98 43.500" stroke="#fff" stroke-width="1.300" stroke-linecap="round" fill="none"/><circle cx="92" cy="49" r="2" fill="#f28f7c"/>' +
      '<path d="M84 51.500Q86 66 92 66.500Q98 66 100 51.500Q96 58 92 57Q88 58 84 51.500z" fill="url(#sa-beard)"/><path d="M84.500 52Q88 47.500 92 51Q96 47.500 99.500 52Q96 57 92 54.500Q88 57 84.500 52z" fill="#fff"/><path d="M88 60q2 2 4 0M92 61.500q2 2 4 0" stroke="#b9c8e2" stroke-width=".8" fill="none" opacity=".8"/>' +
      '<path d="M83 43C83.500 32 91 27.500 98.500 31C103 33.500 103 39 101 43z" fill="url(#sa-red)"/><path d="M98 31Q107 30 107 38" stroke="#d11d36" stroke-width="5" stroke-linecap="round" fill="none"/><circle cx="107" cy="39" r="3.800" fill="#fff"/><circle cx="106" cy="38" r="1.200" fill="#e7eefc"/>' +
      '<path d="M82 43.500Q92 48 102 43.500Q101 39.500 92 39.500Q84 39.500 82 43.500z" fill="#fff"/><path d="M84 42.500Q92 45.500 100 42.500" stroke="#dbe5f7" stroke-width=".8" fill="none"/>' +
      '</g>' + snow + '</svg>';
  };
})();
