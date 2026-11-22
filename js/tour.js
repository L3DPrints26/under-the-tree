/* Under the Tree — the tutorial and the bigger-text setting.
   The tutorial points at the real buttons one at a time. Everything else is dimmed and cannot be
   tapped until it ends. It runs once on each device, the first time someone reaches the tree with a
   name picked, and can be replayed from the front page or from Settings.
   Skipping takes a three-second hold, so nobody skips it by accident.
   Bigger text is kept on this device only. */
(function () {
  'use strict';
  const A = window.App, $ = A.$, raw = A.store.raw;

  A.css(`
    html.big{-webkit-text-size-adjust:118%;text-size-adjust:118%}
    html.big .bname,html.big .count-num,html.big .tab span,html.big canvas{-webkit-text-size-adjust:100%;text-size-adjust:100%}
    #coach{position:fixed;inset:0;z-index:80;touch-action:none;-webkit-user-select:none;user-select:none}
    .co-hole{position:absolute;left:50%;top:40%;width:0;height:0;border-radius:16px;box-shadow:0 0 0 9999px rgba(3,8,20,.84),0 0 0 3px #f5d07a,0 0 22px 6px rgba(245,208,122,.55);transition:left .32s cubic-bezier(.2,.8,.2,1),top .32s cubic-bezier(.2,.8,.2,1),width .32s cubic-bezier(.2,.8,.2,1),height .32s cubic-bezier(.2,.8,.2,1),border-radius .32s;pointer-events:none}
    .co-hole.none{box-shadow:0 0 0 9999px rgba(3,8,20,.84)}
    .co-tip{position:absolute;width:min(420px,calc(100vw - 24px));padding:14px 16px 12px;border-radius:20px;background:linear-gradient(#17305f,#0e1f42);border:1px solid rgba(245,208,122,.6);box-shadow:0 16px 36px rgba(0,0,0,.6);transition:left .32s cubic-bezier(.2,.8,.2,1),top .32s cubic-bezier(.2,.8,.2,1)}
    .co-tip::before{content:"";position:absolute;left:var(--ax,50%);width:16px;height:16px;margin-left:-8px;background:#17305f;border-left:1px solid rgba(245,208,122,.6);border-top:1px solid rgba(245,208,122,.6);transform:rotate(45deg);top:-9px}
    .co-tip.above::before{top:auto;bottom:-9px;background:#0e1f42;transform:rotate(225deg)}
    .co-tip.co-r::before{left:-9px;top:var(--ay,50%);margin-left:0;margin-top:-8px;background:#132a55;transform:rotate(-45deg)}
    .co-tip.co-l::before{left:auto;right:-9px;top:var(--ay,50%);margin-left:0;margin-top:-8px;background:#132a55;transform:rotate(135deg)}
    .co-tip.free::before{display:none}
    @media (max-height:460px){.co-tip{width:min(340px,calc(100vw - 24px));padding:10px 14px}.co-tip h3{font-size:18px}.co-text{font-size:14px}.co-nav{margin-top:8px}}
    .co-step{font-size:12.5px;font-weight:700;color:var(--gold)}
    .co-tip h3{font-family:var(--display);font-weight:600;font-size:21px;line-height:1.2;color:#fff;margin:2px 0 4px}
    .co-text{font-size:15px;line-height:1.45;color:#dbe6f4}
    .co-nav{display:flex;align-items:center;gap:8px;margin-top:12px}
    .co-nav .btn{min-height:44px}
    .co-next{flex:1}
    .co-skip{position:relative;overflow:hidden;min-height:44px;padding:0 14px;border-radius:14px;background:rgba(255,255,255,.08);border:1px solid var(--line2);font-weight:600;font-size:13.5px;color:#dbe6f4;touch-action:none}
    .co-skip i{position:absolute;left:0;top:0;bottom:0;width:0;background:rgba(255,122,138,.5);transition:width .15s}
    .co-skip.hold i{width:100%;transition:width 3s linear}
    .co-skip span{position:relative}
  `);

  /* ---------- bigger text ---------- */
  const big = () => !!raw.get('big', false);
  const paintBig = () => document.documentElement.classList.toggle('big', big());
  function setBig(v) { raw.set('big', !!v); paintBig(); }
  paintBig();

  /* ---------- the tutorial ---------- */
  const inApp = !!(window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform());
  const STEPS = () => [
    { at: () => $('#wordmark'), h: 'Your group', p: 'Tap the name for the menu. That is where you invite people, see who is here and change the background.' },
    { at: () => $('.orn:not(.me) .ball'), round: true, h: 'Everyone has an ornament', p: 'Tap one to see what that person is hoping for. ' + (A.features && A.features.picks ? 'On a wish, tap Add to my picks. They never see it.' : 'Tap I am getting this to tell the others. They never tell the person it is for.') },
    { at: () => $('.orn.me .ball'), round: true, h: 'This one is you', p: 'Tap your own ornament to add wishes and to take the favorites quiz.' + (inApp ? ' Paste a shop link and the app fills in the rest.' : '') },
    { at: () => $('#tabs'), h: 'More to do', p: 'Secret Santa, the advent calendar and the games live here.' },
    { at: () => $('#player'), h: 'Christmas music', p: 'Tap to pick a song. It keeps playing while you look around.' },
    { at: () => $('#meBtn'), h: 'You', p: 'Your picture and your ornament. Tap it to change them.' },
    { free: true, at: () => null, h: 'That is everything', p: 'Start by adding one thing you are hoping for. You can watch this again from the menu, under About and what is new.' }
  ];
  let live = null;

  function start() {
    if (live) return;
    /* a button that is not on this screen (nobody else in the group yet, say) is simply left out */
    const steps = STEPS().filter(s => { if (s.free) return true; const el = s.at(); if (!el) return false; const r = el.getBoundingClientRect(); return r.width > 4 && r.height > 4; });
    let i = 0, holdT = 0;
    const ov = document.createElement('div');
    ov.id = 'coach'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Tutorial');
    ov.innerHTML = '<div class="co-hole"></div><div class="co-tip" data-keep><p class="co-step"></p><h3></h3><p class="co-text"></p>' +
      '<div class="co-nav"><button class="co-skip" type="button"><i></i><span>Hold to skip</span></button><button class="btn co-back" type="button">Back</button><button class="btn primary co-next" type="button">Next</button></div></div>';
    document.body.appendChild(ov);
    const hole = $('.co-hole', ov), tip = $('.co-tip', ov), skip = $('.co-skip', ov);

    const place = () => {
      const s = steps[i], el = s.at(), vw = innerWidth, vh = innerHeight;
      $('.co-step', tip).textContent = i < steps.length - 1 ? 'Step ' + (i + 1) + ' of ' + (steps.length - 1) : 'All done';
      $('h3', tip).textContent = s.h; $('.co-text', tip).textContent = s.p;
      $('.co-back', tip).style.display = i ? '' : 'none';
      $('.co-next', tip).textContent = i === steps.length - 1 ? 'Done' : 'Next';
      skip.style.display = i === steps.length - 1 ? 'none' : '';
      const tw = tip.offsetWidth, th = tip.offsetHeight;
      if (!el) {
        hole.classList.add('none');
        hole.style.left = vw / 2 + 'px'; hole.style.top = vh / 2 + 'px'; hole.style.width = '0px'; hole.style.height = '0px';
        tip.classList.add('free'); tip.classList.remove('above');
        tip.style.left = Math.max(12, (vw - tw) / 2) + 'px'; tip.style.top = Math.max(12, (vh - th) / 2) + 'px';
        return;
      }
      const r = el.getBoundingClientRect(), pad = s.round ? 8 : 6;
      const x = Math.max(4, r.left - pad), y = Math.max(4, r.top - pad), w = Math.min(vw - 8, r.width + pad * 2), h = Math.min(vh - 8, r.height + pad * 2);
      hole.classList.remove('none');
      hole.style.left = x + 'px'; hole.style.top = y + 'px'; hole.style.width = w + 'px'; hole.style.height = h + 'px';
      hole.style.borderRadius = s.round ? '50%' : Math.min(22, h / 2) + 'px';
      const below = y + h + 16 + th < vh - 8, above = y - 16 - th > 8;
      const left = Math.max(12, Math.min(vw - tw - 12, x + w / 2 - tw / 2));
      tip.classList.remove('free', 'co-r', 'co-l');
      tip.classList.toggle('above', !below && above);
      if (below || above) {
        tip.style.left = left + 'px';
        tip.style.top = (below ? y + h + 16 : y - 16 - th) + 'px';
        tip.style.setProperty('--ax', Math.max(22, Math.min(tw - 22, x + w / 2 - left)) + 'px');
        return;
      }
      /* no room above or below (a phone on its side): sit beside the spotlight instead */
      const right = x + w + 16 + tw < vw - 8, lft = x - 16 - tw > 8;
      const top = Math.max(8, Math.min(vh - th - 8, y + h / 2 - th / 2));
      if (right || lft) {
        tip.classList.add(right ? 'co-r' : 'co-l');
        tip.style.left = (right ? x + w + 16 : x - 16 - tw) + 'px';
        tip.style.top = top + 'px';
        tip.style.setProperty('--ay', Math.max(20, Math.min(th - 20, y + h / 2 - top)) + 'px');
        return;
      }
      tip.classList.add('free');
      tip.style.left = left + 'px'; tip.style.top = Math.max(8, (vh - th) / 2) + 'px';
    };
    const end = skipped => {
      clearTimeout(holdT); removeEventListener('resize', place);
      ov.remove(); live = null; raw.set('toured', true);
      if (skipped) A.ui.toast('Skipped. You can watch it from the menu, under About and what is new.');
    };
    $('.co-next', tip).onclick = () => { if (i === steps.length - 1) end(false); else { i++; place(); } };
    $('.co-back', tip).onclick = () => { if (i) { i--; place(); } };
    /* skipping takes a three-second hold */
    const down = e => { e.preventDefault(); skip.classList.add('hold'); $('span', skip).textContent = 'Keep holding'; clearTimeout(holdT); holdT = setTimeout(() => end(true), 3000); };
    const up = () => { if (!skip.classList.contains('hold')) return; clearTimeout(holdT); skip.classList.remove('hold'); $('span', skip).textContent = 'Hold for 3 seconds'; };
    skip.addEventListener('pointerdown', down);
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(t => skip.addEventListener(t, up));
    skip.addEventListener('contextmenu', e => e.preventDefault());
    addEventListener('resize', place);
    live = { end: end, place: place };
    /* the first spotlight appears right on its button; after that it glides from one to the next */
    hole.style.transition = 'none'; tip.style.transition = 'none';
    place();
    setTimeout(() => { hole.style.transition = ''; tip.style.transition = ''; place(); }, 120);
  }

  /* go to the tree first: that is where the buttons are */
  function show() {
    if (live || !A.me()) return;
    for (let k = 0; k < 6 && A.ui.sheetOpen(); k++) A.ui.closeTop();
    if (!/^#?\/?$/.test(location.hash)) location.hash = '#/';
    setTimeout(() => { if (!A.ui.sheetOpen()) start(); }, 650);
  }

  /* people who were already using the app before the tutorial existed do not get it sprung on them */
  if (raw.get('toured', null) === null) raw.set('toured', !!(A.space() && A.me()));
  /* the first time this device shows the tree with a name picked */
  function maybe() {
    if (live || raw.get('toured', false) || !A.space() || !A.me() || A.ui.sheetOpen()) return;
    if (!/^#?\/?$/.test(location.hash) || !$('.orn')) return;
    start();
  }
  A.on('cloud', () => setTimeout(maybe, 600));
  /* keep looking until it has run: the tree can show up at any moment (after joining, after picking a name),
     and the tutorial should start right then, not at the next change in the group */
  if (!raw.get('toured', false)) { const look = setInterval(() => { if (live || raw.get('toured', false)) { clearInterval(look); return; } maybe(); }, 500); }

  A.tour = { show: show, big: big, setBig: setBig, running: () => !!live };
})();
