/* Under the Tree — start everything */
(function () {
  'use strict';
  var A = window.App;
  document.getElementById('wordmark').innerHTML = A.icon('tree', 22) + '<span>Under the Tree</span>';
  A.renderShell();
  document.getElementById('meBtn').onclick = function () { A.ui.who(false); };
  if (!A.pages.home) A.pages.home = { render: function (root) { root.innerHTML = '<div class="empty"><p>Home is still loading.</p></div>'; } };
  if (A.scene) A.scene.start();
  if (A.music) A.music.init();
  A.photos.ready.then(function () {
    var code = A.cloud && A.cloud.pendingJoin, fresh = !A.space() && !A.names.length;
    if (code && A.cloud.groups().some(function (g) { return g.id === code; })) { if (A.space() !== code) { A.store.raw.set('group', code); location.reload(); return; } code = ''; }
    /* test hook: ?auto=1 on an invite link joins without the extra tap */
    if (code && A.qs.has('auto')) { A.cloud.join(code, A.qs.has('bring')).then(function () { location.hash = '#/'; location.reload(); }, function () { A.cloud.welcome(); A.cloud.joinSheet(code); }); return; }
    if (fresh) { if (A.cloud) { A.cloud.welcome(); if (code) A.cloud.joinSheet(code); } return; }      /* brand new here: start or join a group */
    if (A.data) A.data.init();
    if (!A.me()) A.ui.who(true); else A.route();
    if (code) A.cloud.joinSheet(code);
  });
})();
