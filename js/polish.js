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

  /* a night sky, a snowy hill, and Santa's sleigh with a reindeer: drawn, not an icon */
  A.santaArt = function () {
    const stars = [[14, 14, 1.3], [38, 30, 1], [60, 10, 1.1], [88, 24, .9], [120, 12, 1.2], [140, 36, 1], [178, 18, 1.1], [190, 50, .9], [26, 56, .9], [172, 70, 1], [100, 44, .8], [8, 38, .8]];
    /* stars high above, for tall tiles */
    const far = Array.from({ length: 44 }, (_, i) => '<circle cx="' + (((i * 53) % 300) - 50) + '" cy="' + (-((i * 37) % 330) - 4) + '" r="' + (0.8 + (i % 4) * 0.2) + '" fill="#fff" opacity=".7"/>').join('');
    return '<svg class="gm-santa-art" viewBox="0 0 200 140" preserveAspectRatio="xMidYMax meet" style="overflow:visible" aria-hidden="true">' +
      '<defs><linearGradient id="sa-sky" gradientUnits="userSpaceOnUse" x1="0" y1="-300" x2="0" y2="140"><stop offset="0" stop-color="#1a1048"/><stop offset=".55" stop-color="#3b1c7a"/><stop offset="1" stop-color="#7a2f86"/></linearGradient>' +
      '<radialGradient id="sa-moon"><stop offset="0" stop-color="#fff6d0"/><stop offset="1" stop-color="#fff6d0" stop-opacity="0"/></radialGradient></defs>' +
      '<rect x="-300" y="-700" width="800" height="840" fill="url(#sa-sky)"/>' + far +
      '<circle cx="158" cy="30" r="26" fill="url(#sa-moon)" opacity=".55"/><circle cx="158" cy="30" r="12" fill="#fff3c4"/><circle cx="153" cy="27" r="2.6" fill="#f0dc9a" opacity=".6"/>' +
      stars.map(s => '<circle cx="' + s[0] + '" cy="' + s[1] + '" r="' + s[2] + '" fill="#fff" opacity=".85"/>').join('') +
      '<path d="M-300 120H0q30-16 66-6t70-4q40-8 64 4H500v40H-300z" fill="#dfe9fb"/><path d="M-300 132H0q40-14 92-4t108-4H500v30H-300z" fill="#b8c9ea"/>' +
      '<g transform="rotate(-9 100 68)">' +
        '<path d="M18 78q8-3 14-1M24 86q8-2 12 0M16 70q6-2 10 0" stroke="#ffe28a" stroke-width="1.6" stroke-linecap="round" fill="none" opacity=".8"/>' +
        '<circle cx="22" cy="74" r="1.6" fill="#ffe28a"/><circle cx="30" cy="82" r="1.2" fill="#fff"/><circle cx="14" cy="80" r="1.2" fill="#ffe28a"/>' +
        '<path d="M112 76q16-3 28-8" stroke="#f1d27c" stroke-width="1.4" fill="none"/>' +
        /* the sleigh */
        '<path d="M48 70h56c1 16-9 28-26 28H58c-9 0-14-8-10-18z" fill="#d7263d"/><path d="M48 70h56" stroke="#ff7a8a" stroke-width="2"/><path d="M52 80h50" stroke="#a3162a" stroke-width="1.5"/>' +
        '<path d="M42 104h66c8 0 12-4 13-11" stroke="#f1d27c" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M62 98v6M92 98v6" stroke="#f1d27c" stroke-width="2.2"/>' +
        '<circle cx="62" cy="62" r="11" fill="#2f9a64"/><path d="M54 60q8 5 16 0" stroke="#f5f0e4" stroke-width="1.6" fill="none"/>' +
        /* Santa */
        '<path d="M82 74c-1-9 3-15 10-15s11 6 10 15z" fill="#d7263d"/><circle cx="92" cy="55" r="6.5" fill="#f6c9a0"/><path d="M86 56.500q6 11 12 0z" fill="#fff"/>' +
        '<path d="M85.500 52a6.500 6.500 0 0 1 13 0z" fill="#d7263d"/><rect x="84.500" y="50.500" width="15" height="3" rx="1.500" fill="#fff"/><circle cx="99" cy="46.500" r="2.200" fill="#fff"/>' +
        '<circle cx="90" cy="55" r=".8" fill="#222"/><circle cx="95" cy="55" r=".8" fill="#222"/>' +
        /* the reindeer */
        '<ellipse cx="150" cy="64" rx="13" ry="7.500" fill="#8a5a34"/><path d="M160 58l8-8" stroke="#8a5a34" stroke-width="5" stroke-linecap="round"/><circle cx="169" cy="49" r="5" fill="#8a5a34"/><circle cx="173" cy="50" r="2" fill="#e8404f"/>' +
        '<path d="M167 45l-3-8m3 8l2-8m-5 3l3-1m-1-3l-2 2" stroke="#f1d27c" stroke-width="1.4" stroke-linecap="round" fill="none"/>' +
        '<path d="M141 69l-4 12M147 71l-2 12M156 71l3 12M162 69l5 11" stroke="#8a5a34" stroke-width="3" stroke-linecap="round"/>' +
      '</g></svg>';
  };
})();
