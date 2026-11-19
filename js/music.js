/* Under the Tree — music. Real recordings, streamed. Tap the song to pick from the list. */
(function () {
  'use strict';
  const A = window.App, $ = A.$, $$ = A.$$;
  const BASE = 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/';
  const TRACKS = [
    ['Jingle Bells', 'Jingle Bells'], ['Deck the Halls', 'Deck the Halls A'], ['Silent Night', 'Silent Night'],
    ['O Holy Night', 'Oh Holy Night'], ['Angels We Have Heard on High', 'Angels We Have Heard'], ['Up on the Housetop', 'Up on a Housetop'],
    ['Dance of the Sugar Plum Fairy', 'Dance of the Sugar Plum Fairy'], ['It Came Upon a Midnight Clear', 'It Came Upon a Midnight Clear'],
    ['Jingle Bells (calm)', 'Jingle Bells Calm'], ['Deck the Halls (big band)', 'Deck the Halls B'], ['Frost Waltz', 'Frost Waltz'],
    ['Winter Chimes', 'Winter Chimes'], ['What Child Is This', 'Greensleeves'],
    ['O Come, All Ye Faithful', 'Adeste Fideles Shorter']
  ];
  /* 'auto' lets the browser start fetching a song the moment it is chosen. A second, silent player fetches
     the next song ahead of time, so skipping does not start from zero. */
  const audio = new Audio(); audio.preload = 'auto';
  const ahead = new Audio(); ahead.preload = 'auto'; ahead.muted = true;
  const url = i => BASE + encodeURIComponent(TRACKS[(i + TRACKS.length) % TRACKS.length][1]) + '.mp3';
  let loading = false;
  const prefs = Object.assign({ on: true, vol: 0.6, repeat: false, skip: {} }, A.store.get('music', {}));
  if (!prefs.skip || typeof prefs.skip !== 'object') prefs.skip = {};
  /* songs someone turned off on this phone are never picked */
  const skipped = i => !!prefs.skip[TRACKS[(i + TRACKS.length) % TRACKS.length][1]];
  const after = (i, step) => { let j = i; for (let k = 0; k < TRACKS.length; k++) { j = (j + step + TRACKS.length) % TRACKS.length; if (!skipped(j)) return j; } return (i + step + TRACKS.length) % TRACKS.length; };
  A.css('.tracks.two{display:grid;grid-template-columns:1fr 1fr;gap:5px}.trk{display:flex;align-items:center;min-width:0;border-radius:12px;background:var(--surface2);border:1px solid var(--line)}.trk .track{flex:1;min-width:0;min-height:36px;padding:2px 2px 2px 6px;border:0;gap:8px}.trk .track .t{font-size:14px}.trk.on{background:#7d1727;border-color:#c9a24a}.trk.on .track .t,.trk.on .track .n{color:#fff}.trk.off .track{opacity:.4;text-decoration:line-through}.trk-x{width:34px;height:36px;display:grid;place-items:center;color:var(--muted);flex:none}.trk.off .trk-x{color:var(--gold)}@media (orientation:landscape) and (max-height:480px){.tracks.two{grid-template-columns:repeat(4,1fr)}}');
  let ti = after((Math.random() * TRACKS.length) | 0, 1), errs = 0, started = false, sheet = null;
  const save = () => A.store.set('music', prefs);

  function setTrack(i) { ti = (i + TRACKS.length) % TRACKS.length; audio.src = url(ti); try { audio.load(); } catch (e) {} $('#pFill').style.width = '0'; paint(); }
  function paint() {
    const playing = !audio.paused && started;
    $('#player').classList.toggle('playing', playing && !loading);
    $('#player').classList.toggle('loading', loading);
    $('#pTitle').textContent = started ? TRACKS[ti][0] : 'Christmas music';
    $('#pSub').textContent = loading ? 'Loading the song…' : started ? (prefs.repeat ? 'On repeat' : 'Tap to pick a song') : 'Tap to pick a song';
    $('#pPlay').innerHTML = A.icon(playing ? 'pause' : 'play', 20);
    $('#pPlay').setAttribute('aria-label', playing ? 'Pause' : 'Play');
    if (sheet) $$('.track', sheet.el).forEach(b => { const on = +b.dataset.i === ti && started; b.classList.toggle('on', on); b.parentNode.classList.toggle('on', on); b.parentNode.classList.toggle('off', skipped(+b.dataset.i)); b.classList.toggle('playing', on && playing); b.querySelector('.n').innerHTML = on ? '<span class="eq"><i></i><i></i><i></i></span>' : (+b.dataset.i + 1); });
  }
  function play() { if (!audio.src) setTrack(ti); started = true; loading = audio.readyState < 3; const p = audio.play(); if (p && p.catch) p.catch(() => { loading = false; paint(); }); paint(); }
  function next(step) { setTrack(after(ti, step || 1)); play(); }
  audio.addEventListener('playing', () => { errs = 0; loading = false; paint(); if (!prefs.repeat) { const n = url(after(ti, 1)); if (ahead.src !== n) { ahead.src = n; try { ahead.load(); } catch (e) {} } } });
  audio.addEventListener('waiting', () => { if (started && !audio.paused) { loading = true; paint(); } });
  audio.addEventListener('canplay', () => { if (loading && audio.paused) { loading = false; paint(); } });
  audio.addEventListener('pause', () => { loading = false; paint(); });
  audio.addEventListener('ended', () => { if (!prefs.repeat) next(1); });
  audio.addEventListener('error', () => {
    if (!audio.src || !started) return;
    if (++errs >= TRACKS.length) { started = false; paint(); A.ui.toast('Music needs an internet connection.'); return; }
    next(1);
  });
  audio.addEventListener('timeupdate', () => { if (audio.duration) $('#pFill').style.width = (audio.currentTime / audio.duration * 100).toFixed(2) + '%'; });

  function openSheet() {
    sheet = A.ui.sheet({
      title: 'Music',
      html: '<label class="switch"><span class="s-text"><b>Repeat this song</b><small>Off plays the next one when a song ends</small></span><input type="checkbox" id="mRepeat"' + (prefs.repeat ? ' checked' : '') + '></label>' +
        '<div class="row gap" style="min-height:44px">' + A.icon('music', 20) + '<input type="range" id="mVol" min="0" max="1" step="0.01" value="' + prefs.vol + '" style="flex:1;accent-color:#e9c46a" aria-label="Volume"></div>' +
        '<p class="muted small" style="margin:2px 0 6px">Tap a song to play it. Tap its x to skip it on this ' + App.dev + '.</p>' +
        '<div class="tracks two">' + TRACKS.map((t, i) => '<div class="trk"><button class="track" data-i="' + i + '"><span class="n">' + (i + 1) + '</span><span class="t">' + A.esc(t[0]) + '</span></button><button class="trk-x" data-x="' + i + '" aria-label="Skip or bring back ' + A.esc(t[0]) + '">' + A.icon('x', 15) + '</button></div>').join('') + '</div>' +
        '<p class="muted" style="margin-top:8px;font-size:12px">Music by Kevin MacLeod (incompetech.com), Creative Commons Attribution 4.0.</p>',
      onMount(el) {
        $$('.track', el).forEach(b => b.onclick = () => { prefs.on = true; delete prefs.skip[TRACKS[+b.dataset.i][1]]; save(); setTrack(+b.dataset.i); play(); });
        $$('.trk-x', el).forEach(b => b.onclick = () => { const i = +b.dataset.x, k = TRACKS[i][1]; if (prefs.skip[k]) delete prefs.skip[k]; else { prefs.skip[k] = 1; if (i === ti && started && !audio.paused) next(1); } save(); paint(); });
        $('#mRepeat', el).onchange = e => { prefs.repeat = e.target.checked; audio.loop = prefs.repeat; save(); paint(); };
        $('#mVol', el).oninput = e => { prefs.vol = +e.target.value; audio.volume = prefs.vol; save(); };
      },
      onClose() { sheet = null; }
    });
    paint();
  }

  A.music = {
    init() {
      audio.volume = prefs.vol; audio.loop = prefs.repeat;
      $('#pArt').innerHTML = A.icon('music', 18); $('#pNext').innerHTML = A.icon('skipf', 18);
      $('#pOpen').onclick = openSheet;
      $('#pPlay').onclick = () => { if (audio.paused) { prefs.on = true; play(); } else { prefs.on = false; audio.pause(); } save(); };
      $('#pNext').onclick = () => { prefs.on = true; save(); next(1); };
      paint();
      /* fetch the first song quietly while the app opens, so the first tap can play it right away */
      if (prefs.on) setTrack(ti);
      /* browsers only allow sound after a tap, so start on the first one */
      const first = e => { if (e.target.closest('#player') || !A.me()) return; document.removeEventListener('pointerdown', first, true); if (prefs.on && !started) play(); };
      document.addEventListener('pointerdown', first, true);
      A.on('me', () => { if (prefs.on && !started) play(); });
    },
    pause() { audio.pause(); }
  };
})();
