/* Under the Tree — who can see what.
   One sheet that says it plainly, in three colors: green is seen by everyone in the group, red is seen
   only by you, and gold is yours to choose. The two choices are saved with the group so every phone
   respects them: showing when you are online, and showing your scores on the leaderboards. */
(function () {
  'use strict';
  const A = window.App, $ = A.$, esc = A.esc;
  A.css(`
    .pv{display:flex;flex-direction:column;gap:10px}
    .pv-b{border-radius:18px;padding:12px 14px 14px}
    .pv-b h3{display:flex;align-items:center;gap:8px;font-size:16px;font-weight:600;color:#fff;margin-bottom:8px}
    .pv-b ul{list-style:none;display:flex;flex-wrap:wrap;gap:6px}
    .pv-b li{font-size:13.5px;font-weight:500;padding:5px 10px;border-radius:999px;background:rgba(255,255,255,.14);color:#fff}
    .pv-b.all{background:#0f5a3c;border:1px solid #1f8a5d}
    .pv-b.me{background:#7d1727;border:1px solid #b33247}
    .pv-b.pick{background:#4d3a0a;border:1px solid #c9a24a}
    .pv-b .switch{min-height:46px;padding:4px 0}
    .pv-b .switch small{color:#f1e2b7}
    .pv-b .switch+.switch{border-top:1px solid rgba(255,255,255,.14)}
    .pv-link{margin-top:6px;font-size:13.5px;font-weight:600;color:#ffe9a8;text-decoration:underline}
    @media (orientation:landscape) and (max-height:480px){.pv{display:grid;grid-template-columns:1fr 1fr 1fr;align-items:start}.pv-b li{font-size:12.5px}}
  `);
  const all = () => A.store.get('privacy', {}) || {};
  const get = n => Object.assign({ online: true, scores: true }, all()[n]);
  function set(k, v) { const me = A.me(); if (!me) return; const p = all(); p[me] = Object.assign({}, p[me], { [k]: !!v }); A.store.set('privacy', p); A.emit('privacy', k); }
  function sheet() {
    const me = A.me(); if (!me) return; const p = get(me);
    A.ui.sheet({
      title: 'Who can see what', cls: 'pvs',
      html: '<div class="pv">' +
        '<div class="pv-b all"><h3>' + A.icon('users', 20) + 'Everyone in the group sees</h3><ul><li>Your wishlist</li><li>What you marked as got</li><li>Your picture and ornament</li><li>That you voted</li></ul></div>' +
        '<div class="pv-b me"><h3>' + A.icon('lock', 20) + 'Only you see</h3><ul><li>Who you voted for</li><li>Who you got in Secret Santa</li><li>Your picks</li><li>Your PIN and password</li><li>Your advent doors</li></ul></div>' +
        '<div class="pv-b pick"><h3>' + A.icon('sliders', 20) + 'You choose</h3>' +
          '<label class="switch"><span class="s-text"><b>Show when I am online</b><small>The green dot on your ornament</small></span><input type="checkbox" id="pvOn"' + (p.online ? ' checked' : '') + '></label>' +
          '<label class="switch"><span class="s-text"><b>Show my scores</b><small>On the game and Santa leaderboards</small></span><input type="checkbox" id="pvSc"' + (p.scores ? ' checked' : '') + '></label>' +
          '<button class="pv-link" id="pvPicks">Choose who can see my picks</button></div></div>',
      onMount(el, close) {
        $('#pvOn', el).onchange = e => set('online', e.target.checked);
        $('#pvSc', el).onchange = e => set('scores', e.target.checked);
        $('#pvPicks', el).onclick = () => { close(); if (A.openPicks) A.openPicks(); };
      }
    });
  }
  A.privacy = { get, set, sheet, hidesScores: n => get(n).scores === false, hidesOnline: n => get(n).online === false };
})();
