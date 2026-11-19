/* Under the Tree — the front page.
   A real screen, not a pop-up: what the app is, what is new, and where to start or join a group.
   A brand new visitor lands here. Anyone can come back to it from the menu at any time. */
(function () {
  'use strict';
  const A = window.App, $ = A.$, $$ = A.$$, esc = A.esc, raw = A.store.raw;
  const inApp = !!(window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform());

  /* what changed, newest first. Only things that are really in the app. */
  const NEWS = [
    { id: '2026-11-19', date: 'November 19', title: 'A front page and a tutorial', items: [
      'This front page, and a tutorial that points at each button.',
      'Call people what you call them: tap someone in People and pick Dad, Daddy, Papa or your own.',
      'Favorites quiz: tell your group your candy, colors and sizes.',
      'Santa tracker on Christmas Eve.',
      'On Christmas Day, vote to reveal who gave what. Everyone has to say yes.',
      'Report or hide a wish, and delete your own stuff, under Safety and rules.'] },
    { id: '2026-11-18', date: 'November 18', title: 'Names that stay yours', items: [
      'Pick your name once and it stays on your phone. A PIN is optional.',
      'Glass ornaments, and a studio to design your own.',
      'See who is online. Leaderboards for every game.',
      'Present Catch keeps getting harder the longer you last.'] },
    { id: '2026-11-17', date: 'November 17', title: 'Groups', items: [
      'Everyone on their own phone. Start a group and send the invite code.',
      'Advent doors in order, with new jokes.'] }
  ];
  const KINDS = [['family', 'Family', 'Our family'], ['friends', 'Friends', 'Friend group'], ['class', 'Class', 'Our class'], ['team', 'Team', 'Our team'], ['work', 'Work', 'Work crew'], ['church', 'Church', 'Church group'], ['roommates', 'Roommates', 'Roommates'], ['couple', 'Us two', 'Us two']];

  A.css(`
    body[data-page="start"].st-solo #top,body[data-page="start"].st-solo #tabs,body[data-page="start"].st-solo #player{display:none}
    .page-start{display:flex;flex-direction:column;min-height:0;gap:10px;max-width:760px;width:100%;margin:0 auto}
    body.st-solo .page-start{padding-top:max(14px,env(safe-area-inset-top));padding-bottom:max(12px,env(safe-area-inset-bottom))}
    .st-hero{flex:none;text-align:center;position:relative;padding-top:26px}
    .st-lights{position:absolute;left:4%;right:4%;top:0;height:22px}
    .st-lights::before{content:"";position:absolute;left:0;right:0;top:2px;height:16px;border-bottom:2px solid #1c6f47;border-radius:0 0 50% 50%}
    .st-lights i{position:absolute;width:9px;height:12px;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;background:var(--c);box-shadow:0 0 10px var(--c);animation:so-tw 1.8s ease-in-out infinite alternate}
    .st-name{font-family:var(--script);font-style:italic;font-weight:700;font-size:clamp(30px,9vw,44px);line-height:1.05;color:#fff;text-shadow:0 2px 14px rgba(4,9,22,.8)}
    .st-tag{margin-top:4px;font-size:clamp(14px,4vw,16.5px);color:#dbe6f4}
    .st-mid{flex:1;min-height:0;display:flex;flex-direction:column;gap:10px;justify-content:center}
    .st-cards{flex:0 1 380px;min-height:150px;display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;-webkit-overflow-scrolling:touch;padding:2px 2px 4px}
    .st-cards::-webkit-scrollbar{display:none}
    .st-card{flex:0 0 min(78%,320px);scroll-snap-align:center;display:flex;flex-direction:column;border-radius:20px;padding:12px 14px 14px;border:1px solid rgba(255,255,255,.2);box-shadow:0 10px 24px rgba(0,0,0,.4);min-height:0}
    .st-card .art{flex:1;min-height:64px;display:flex;align-items:center;justify-content:center;gap:10px}
    .st-card h3{font-family:var(--display);font-weight:600;font-size:21px;line-height:1.2;color:#fff;margin-bottom:2px}
    .st-card p{font-size:14px;line-height:1.4;color:rgba(255,255,255,.88)}
    .st-ball{width:74px;height:74px;border-radius:50%;box-shadow:0 6px 12px rgba(0,0,0,.4)}
    .st-tagp{position:relative;padding:12px 18px 12px 34px;border-radius:11px;background:#f6eedd;color:#3a2a12;font-weight:700;font-size:18px;transform:rotate(-3deg);box-shadow:0 8px 16px rgba(0,0,0,.4);clip-path:polygon(0 50%,12px 0,100% 0,100% 100%,12px 100%)}
    .st-tagp::before{content:"";position:absolute;left:15px;top:50%;width:7px;height:7px;margin-top:-4px;border-radius:50%;background:#0f1b33}
    .st-door{display:grid;place-items:center;width:62px;height:62px;border-radius:11px;font-family:var(--display);font-weight:700;font-size:27px;color:#fff;border:1.5px dashed rgba(245,208,122,.85)}
    .st-hold{display:grid;place-items:center;width:104px;height:104px;border-radius:50%;background:radial-gradient(circle at 40% 30%,#e8404f,#a3162a);color:#fff;font-weight:700;font-size:14px;line-height:1.15;text-align:center;border:3px solid rgba(255,255,255,.2)}
    .st-sled{width:min(86%,230px)}.st-sled svg{width:100%;height:auto;display:block;overflow:visible}
    .st-dots{flex:none;display:flex;justify-content:center;gap:7px}
    .st-dots i{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.28)}.st-dots i.on{background:var(--gold)}
    .st-news{flex:none;display:flex;align-items:center;gap:10px;width:100%;min-height:52px;padding:8px 14px;border-radius:16px;background:rgba(245,208,122,.14);border:1px solid rgba(245,208,122,.55);text-align:left}
    .st-news svg{flex:none;color:var(--gold)}
    .st-news span{flex:1;min-width:0}.st-news b{display:block;font-weight:700;font-size:14.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .st-news small{display:block;font-size:13px;color:#dbe6f4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .st-news em{font-style:normal;flex:none;font-size:11.5px;font-weight:700;color:var(--gold-ink);background:var(--gold);border-radius:999px;padding:2px 8px}
    .st-list{flex:1;min-height:150px;overflow-y:auto;border-radius:20px;padding:14px 16px;background:rgba(11,23,48,.72);border:1px solid var(--line)}
    .st-list h3{font-family:var(--display);font-weight:600;font-size:18px;color:#fff}
    .st-list h3 small{display:block;font-family:var(--body,inherit);font-size:12.5px;font-weight:700;color:var(--gold);margin-bottom:1px}
    .st-list ul{margin:6px 0 14px;padding-left:18px}.st-list li{margin:4px 0;font-size:14px;line-height:1.4;color:#e6edf8}
    .st-act{flex:none;display:flex;flex-direction:column;gap:8px}
    .st-two{display:flex;gap:8px}.st-two>*{flex:1}
    .st-pill{display:flex;align-items:center;justify-content:center;gap:8px;min-height:54px;border-radius:999px;font-weight:700;font-size:16px;color:#fff;box-shadow:inset 0 1px 0 rgba(255,255,255,.3),0 6px 14px rgba(0,0,0,.3)}
    .st-pill.green{background:linear-gradient(#2f9a64,#14573a)}.st-pill.red{background:linear-gradient(#d8334a,#8a1a2c)}.st-pill.gold{background:linear-gradient(#f7dc92,#d9a93a);color:#3a2a12}
    .st-dash{display:flex;align-items:center;justify-content:center;gap:8px;min-height:50px;border-radius:16px;border:2px dashed rgba(255,255,255,.4);font-weight:700;font-size:15px;color:#fff;background:rgba(255,255,255,.05)}
    .st-link{align-self:center;font-size:13.5px;font-weight:600;color:var(--muted);text-decoration:underline;text-underline-offset:3px;min-height:32px}
    .st-kinds{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
    .st-kinds button{min-height:40px;border-radius:999px;background:var(--surface2);border:1px solid var(--line);font-weight:600;font-size:13.5px}
    .st-kinds button.on{background:var(--gold);border-color:var(--gold);color:var(--gold-ink)}
    .st-form{display:flex;flex-direction:column;gap:8px}.st-form .input{text-align:center;font-size:18px;font-weight:600}
    .st-msg{min-height:18px;font-size:13.5px;color:#ff8a98;text-align:center}
    .nk-top{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px}
    .nk-pill{min-height:54px;border-radius:999px;font-weight:700;font-size:17px;color:#fff;box-shadow:inset 0 1px 0 rgba(255,255,255,.3),0 6px 14px rgba(0,0,0,.3)}
    .nk-pill.green{background:linear-gradient(#2f9a64,#14573a)}.nk-pill.red{background:linear-gradient(#d8334a,#8a1a2c)}.nk-pill.gold{background:linear-gradient(#f7dc92,#d9a93a);color:#3a2a12}
    .nk-pill.on{outline:3px solid #fff;outline-offset:2px}
    .nk-more{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
    .nk-chip{min-height:40px;padding:0 14px;border-radius:999px;background:var(--surface2);border:1px solid var(--line);font-weight:600;font-size:14px}
    .nk-chip.on{background:var(--gold);border-color:var(--gold);color:var(--gold-ink)}
    .mu-about{display:flex;align-items:center;gap:12px;width:100%;min-height:56px;padding:8px 14px;border-radius:16px;background:linear-gradient(90deg,rgba(47,154,100,.32),rgba(47,154,100,.1));border:1px solid rgba(95,227,161,.45);text-align:left;margin-bottom:12px}
    .mu-about svg{flex:none;color:#5fe3a1}.mu-about span{flex:1;min-width:0}.mu-about b{display:block;font-weight:700}.mu-about small{display:block;font-size:12.5px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .mu-about em{font-style:normal;flex:none;font-size:11.5px;font-weight:700;color:var(--gold-ink);background:var(--gold);border-radius:999px;padding:2px 8px}
    @media (orientation:landscape) and (max-height:520px){
      #page.page-start{flex-direction:row;align-items:stretch;max-width:none;gap:14px}
      .st-hero{display:none}.st-mid{flex:1.2}.st-act{flex:1;justify-content:center;min-height:0;overflow-y:auto}.st-mid{min-width:0}.st-cards{flex:1 1 auto}.st-kinds{grid-template-columns:repeat(4,1fr)}
    }
  `);

  const ball = i => '<span class="st-ball" style="background:' + A.ornArt(i, A.palette[i]).replace(/"/g, "'") + ' center/100% 100%"></span>';
  const door = (n, c) => '<span class="st-door" style="background:' + c + '">' + n + '</span>';
  function cards() {
    const sled = ($('#santa') || {}).innerHTML || '';
    const list = [
      ['linear-gradient(160deg,#1d4fa0,#0f2150)', ball(0) + ball(1) + ball(3), 'Wishlists everyone can see', 'Each person adds what they are hoping for, with a photo, a price and a link.'],
      ['linear-gradient(160deg,#8a6a1c,#3a2a12)', '<span class="st-tagp">' + A.icon('lock', 16) + ' Getting this</span>', 'Picks stay secret', 'Say what you are getting. The person it is for never sees it, and nobody buys it twice.'],
      ['linear-gradient(160deg,#c9243a,#5e0a18)', '<span class="st-hold">Hold to see<br>who you got</span>', 'Secret Santa', 'Vote for who runs it, set a price limit, draw names.'],
      ['linear-gradient(160deg,#2f9a64,#0a3a25)', door(1, '#c9243a') + door(2, '#1d3a78') + door(3, '#14573a'), 'Advent, games and music', 'A new door every day in December, four small games and Christmas songs.'],
      ['linear-gradient(160deg,#34126b,#0b1730)', sled ? '<span class="st-sled">' + sled + '</span>' : A.icon('sleigh', 54), 'Christmas Eve and Day', 'Track Santa on the 24th. On the 25th, vote to reveal who gave what.']
    ];
    if (inApp) list.push(['linear-gradient(160deg,#3b3f52,#11131c)', A.icon('clock', 54), 'On Apple Watch too', 'Lists, picks and games on your wrist, with the countdown on your watch face.']);
    return list.map(c => '<div class="st-card" style="background:' + c[0] + '"><div class="art">' + c[1] + '</div><h3>' + c[2] + '</h3><p>' + c[3] + '</p></div>');
  }
  const newsHTML = () => NEWS.map(n => '<h3><small>' + n.date + '</small>' + esc(n.title) + '</h3><ul>' + n.items.map(i => '<li>' + esc(i) + '</li>').join('') + '</ul>').join('');
  const unseen = () => raw.get('newsSeen', '') !== NEWS[0].id;
  const why = e => (e && e.message === 'nocode' ? 'That code did not work. Check it and try again.' : 'No connection right now. Check the Wi-Fi and try again.');
  const done = () => { location.hash = '#/'; location.reload(); };
  const agree = () => (A.safety ? A.safety.agreeHTML() : '');
  const hasOld = () => { const l = raw.get('lists', null); return !A.space() && !!(l && Object.keys(l).length); };

  A.pages.start = {
    tab: 'none',
    render(root, args) {
      const inGroup = !!A.space() && !!A.me(), cs = cards();
      let mode = args[0] || '', kind = 'family', showNews = mode === 'news';
      document.body.classList.toggle('st-solo', !inGroup);
      const bulbs = ['#ff5a5a', '#ffd76a', '#6fe3a5', '#7cc4ff', '#ffffff', '#ff9ad1', '#ffd76a', '#6fe3a5', '#ff5a5a'];
      root.innerHTML = '<div class="st-hero"><div class="st-lights">' + bulbs.map((c, i) => '<i style="left:' + (4 + i * 11.5) + '%;top:' + (2 + Math.sin(Math.PI * (4 + i * 11.5) / 100) * 15).toFixed(0) + 'px;--c:' + c + ';animation-delay:' + (-i * .37).toFixed(2) + 's"></i>').join('') + '</div>' +
        '<h1 class="st-name" data-keep>Under the Tree</h1><p class="st-tag">Christmas wishlists for your family or your friends.</p></div>' +
        '<div class="st-mid" id="stMid"></div><div class="st-act" id="stAct"></div>';
      const mid = $('#stMid', root), act = $('#stAct', root);

      const drawMid = () => {
        if (showNews) {
          raw.set('newsSeen', NEWS[0].id);
          mid.innerHTML = '<div class="st-list" data-keep>' + newsHTML() + '</div><button class="st-link" id="stBack">Back to what the app does</button>';
          $('#stBack', mid).onclick = () => { showNews = false; drawMid(); };
          return;
        }
        mid.innerHTML = '<div class="st-cards" id="stCards">' + cs.join('') + '</div><div class="st-dots">' + cs.map((c, i) => '<i' + (i ? '' : ' class="on"') + '></i>').join('') + '</div>' +
          '<button class="st-news" id="stNews">' + A.icon('gift', 22) + '<span><b>What is new</b><small>' + esc(NEWS[0].title) + '. Tap to see it all.</small></span>' + (unseen() ? '<em>New</em>' : '') + '</button>';
        const sc = $('#stCards', mid), dots = $$('.st-dots i', mid);
        sc.addEventListener('scroll', () => { const w = sc.firstElementChild.offsetWidth + 10, k = Math.max(0, Math.min(cs.length - 1, Math.round(sc.scrollLeft / w))); dots.forEach((d, i) => d.classList.toggle('on', i === k)); }, { passive: true });
        $('#stNews', mid).onclick = () => { showNews = true; drawMid(); };
      };

      const drawAct = () => {
        if (mode === 'new' || mode === 'family' || mode === 'friends') {
          if (mode !== 'new') kind = mode;
          const k = KINDS.find(x => x[0] === kind) || KINDS[0], bring = hasOld();
          act.innerHTML = '<div class="st-kinds">' + KINDS.map(x => '<button data-kind="' + x[0] + '"' + (x[0] === kind ? ' class="on"' : '') + '>' + x[1] + '</button>').join('') + '</div>' +
            '<div class="st-form"><input class="input" id="stName" maxlength="40" value="' + esc(k[2]) + '" aria-label="What should the group be called?" autocomplete="off">' +
            (bring ? '<label class="switch"><span class="s-text"><b>Bring over the lists on this device</b></span><input type="checkbox" id="stBring" checked></label>' : '') +
            '<p class="st-msg" id="stMsg"></p><button class="st-pill green" id="stGo">' + A.icon('tree', 20) + 'Start the group</button></div>' +
            '<button class="st-link" id="stCancel">Back</button>' + agree();
          $$('[data-kind]', act).forEach(b => b.onclick = () => { const cur = $('#stName', act).value.trim(), was = KINDS.find(x => x[0] === kind); kind = b.dataset.kind; mode = 'new'; drawAct(); if (cur && was && cur !== was[2]) $('#stName', act).value = cur; });
          const go = $('#stGo', act);
          go.onclick = () => {
            const name = $('#stName', act).value.trim() || k[2];
            go.disabled = true; go.lastChild.textContent = 'Starting'; $('#stMsg', act).textContent = '';
            A.cloud.create(name, bring && $('#stBring', act).checked, '', kind).then(done, e => { go.disabled = false; go.lastChild.textContent = 'Start the group'; $('#stMsg', act).textContent = why(e); });
          };
          $('#stCancel', act).onclick = () => { mode = ''; drawAct(); };
          return;
        }
        if (mode === 'join') {
          act.innerHTML = '<div class="st-form"><input class="input code-in" id="stCode" maxlength="14" placeholder="ABCDE-12345" aria-label="The invite code someone sent you" autocomplete="off" autocapitalize="characters" spellcheck="false" value="' + esc(args[1] ? A.cloud.pretty(String(args[1]).toUpperCase().replace(/[^A-Z0-9]/g, '')) : '') + '">' +
            '<p class="st-msg" id="stMsg"></p><button class="st-pill gold" id="stGo">' + A.icon('check', 20) + 'Join</button></div><button class="st-link" id="stCancel">Back</button>' + agree();
          const go = $('#stGo', act), inp = $('#stCode', act);
          const run = () => {
            const id = inp.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
            if (A.cloud.groups().some(g => g.id === id)) { raw.set('group', id); return done(); }
            go.disabled = true; go.lastChild.textContent = 'Joining'; $('#stMsg', act).textContent = '';
            A.cloud.join(id, false).then(done, e => { go.disabled = false; go.lastChild.textContent = 'Join'; $('#stMsg', act).textContent = why(e); });
          };
          go.onclick = run; inp.onkeydown = e => { if (e.key === 'Enter') run(); };
          $('#stCancel', act).onclick = () => { mode = ''; drawAct(); };
          if (A.canHover) setTimeout(() => inp.focus(), 60);
          return;
        }
        if (inGroup && mode !== 'more') {
          act.innerHTML = '<button class="st-pill green" id="stTree">' + A.icon('tree', 20) + 'Go to the tree</button>' +
            '<div class="st-two"><button class="st-dash" id="stTour">' + A.icon('gift', 18) + 'Show me around</button><button class="st-dash" id="stInvite">' + A.icon('plus', 18) + 'Invite people</button></div>' +
            '<button class="st-link" id="stMore">Start or join another group</button>';
          $('#stTree', act).onclick = () => A.go('#/');
          $('#stTour', act).onclick = () => { if (A.tour) A.tour.show(); };
          $('#stInvite', act).onclick = () => A.cloud.invite();
          $('#stMore', act).onclick = () => { mode = 'more'; drawAct(); };
          return;
        }
        act.innerHTML = '<div class="st-two"><button class="st-pill green" id="stFam">' + A.icon('tree', 20) + 'Family group</button><button class="st-pill red" id="stFri">' + A.icon('heart', 20) + 'Friend group</button></div>' +
          '<button class="st-dash" id="stJoin">' + A.icon('plus', 18) + 'I have a code to join</button>' +
          '<button class="st-link" id="stOther">' + (inGroup ? 'Back' : 'Another kind of group') + '</button>';
        $('#stFam', act).onclick = () => { mode = 'family'; drawAct(); };
        $('#stFri', act).onclick = () => { mode = 'friends'; drawAct(); };
        $('#stJoin', act).onclick = () => { mode = 'join'; drawAct(); };
        $('#stOther', act).onclick = () => { if (inGroup) { mode = ''; drawAct(); } else { kind = 'class'; mode = 'new'; drawAct(); } };
      };
      drawMid(); drawAct();
    },
    leave() { document.body.classList.remove('st-solo'); }
  };

  A.start = { news: NEWS, unseen: unseen };
})();
