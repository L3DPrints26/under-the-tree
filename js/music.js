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
    ['O Come, All Ye Faithful', 'Adeste Fideles Shorter'], ['O Come, All Ye Faithful (waltz)', 'Adeste Fideles Waltz'], ['Jingle Bells (another take)', 'Jingle Bells 3'],
    ['Christmas Rap', 'Christmas Rap'], ['Ave Maria (marimba)', 'Ave Marimba'], ['Holiday Weasel', 'Holiday Weasel'],
    ['Winter Reflections', 'Winter Reflections'], ['Frozen Star', 'Frozen Star'], ['Canon in D', 'Canon in D Major']
  ];
  /* 'auto' lets the browser start fetching a song the moment it is chosen. A second, silent player fetches
     the next song ahead of time, so skipping does not start from zero. */
  const audio = new Audio(); audio.preload = 'auto';
  const ahead = new Audio(); ahead.preload = 'auto'; ahead.muted = true;
  const url = i => BASE + encodeURIComponent(TRACKS[(i + TRACKS.length) % TRACKS.length][1]) + '.mp3';
  let loading = false;
  const prefs = Object.assign({ on: true, vol: 0.6, repeat: false }, A.store.get('music', {}));
  let ti = (Math.random() * TRACKS.length) | 0, errs = 0, started = false, sheet = null;
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
    if (sheet) $$('.track', sheet.el).forEach(b => { const on = +b.dataset.i === ti && started; b.classList.toggle('on', on); b.classList.toggle('playing', on && playing); b.querySelector('.n').innerHTML = on ? '<span class="eq"><i></i><i></i><i></i></span>' : (+b.dataset.i + 1); });
  }
  function play() { if (!audio.src) setTrack(ti); started = true; loading = audio.readyState < 3; const p = audio.play(); if (p && p.catch) p.catch(() => { loading = false; paint(); }); paint(); }
  function next(step) { setTrack(ti + (step || 1)); play(); }
  audio.addEventListener('playing', () => { errs = 0; loading = false; paint(); if (!prefs.repeat) { const n = url(ti + 1); if (ahead.src !== n) { ahead.src = n; try { ahead.load(); } catch (e) {} } } });
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
        '<div class="divider"></div><div class="tracks">' + TRACKS.map((t, i) => '<button class="track" data-i="' + i + '"><span class="n">' + (i + 1) + '</span><span class="t">' + A.esc(t[0]) + '</span></button>').join('') + '</div>' +
        '<p class="muted small" style="margin-top:14px">Music by Kevin MacLeod (incompetech.com), licensed under Creative Commons Attribution 4.0.</p>',
      onMount(el) {
        $$('.track', el).forEach(b => b.onclick = () => { prefs.on = true; save(); setTrack(+b.dataset.i); play(); });
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
