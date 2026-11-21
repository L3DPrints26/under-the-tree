/* Under the Tree — start everything */
(function () {
  'use strict';
  var A = window.App;
  var wm = document.getElementById('wordmark');
  var grp = A.cloud && A.space() ? (A.cloud.groups().filter(function (x) { return x.id === A.space(); })[0] || {}).name : '';
  wm.innerHTML = A.icon('tree', 22) + (grp ? '<span class="wm-t"><small>Under the Tree</small><b>' + A.esc(grp) + '</b></span>' : '<span>Under the Tree</span>') + A.icon('next', 16, 'wm-more');
  wm.setAttribute('aria-label', 'Menu'); wm.setAttribute('role', 'button');
  wm.onclick = function (e) { e.preventDefault(); if (A.ui.menu) A.ui.menu(); };
  A.renderShell();
  document.getElementById('meBtn').onclick = function () { A.ui.who(false); };
  if (!A.pages.home) A.pages.home = { render: function (root) { root.innerHTML = '<div class="empty"><p>Home is still loading.</p></div>'; } };
  if (A.scene) A.scene.start();
  if (A.music) A.music.init();
  A.photos.ready.then(function () {
    var code = A.cloud && A.cloud.pendingJoin, fresh = !A.space() && !A.names.length;
    if (code && A.cloud.groups().some(function (g) { return g.id === code; })) { if (A.space() !== code) { A.store.raw.set('group', code); location.reload(); return; } code = ''; }
    /* test hook: ?auto=1 on an invite link joins without the extra tap */
    if (code && A.qs.has('auto')) { A.cloud.join(code, A.qs.has('bring')).then(function () { location.hash = '#/'; location.reload(); }, function () { A.go('#/start/join/' + code); }); return; }
    /* An invite link on a new device joins right away, so the person only has to pick their name. On an iPhone's
       Safari the front page offers "Open in the app" first, because the website and the app are separate devices. */
    if (code && fresh && !A.iosWeb) { A.ui.toast('Joining the group…'); A.cloud.join(code, false).then(function () { location.hash = '#/'; location.reload(); }, function () { A.go('#/start/join/' + code); }); return; }
    if (fresh) { location.hash = code ? '#/start/join/' + code : '#/start'; A.route(); return; }      /* brand new here: the front page, where you start or join a group */
    if (A.data) A.data.init();
    if (!A.me()) A.ui.who(true); else A.route();
    if (code) A.go('#/start/join/' + code);
  });
})();
