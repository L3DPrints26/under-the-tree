/* Under the Tree — reminders (iPhone and iPad app only; a website cannot do this when it is closed).
   A nudge at 8 in the morning when the day's advent door is ready, one on Christmas Eve when the
   Santa tracker starts, and one on Christmas morning. They are set on the device itself, so they
   need no connection and nothing is sent anywhere. Off until someone turns them on in the menu. */
(function () {
  'use strict';
  const A = window.App, cap = window.Capacitor, raw = A.store.raw;
  const native = !!(cap && cap.isNativePlatform && cap.isNativePlatform());
  const plugin = () => (cap.Plugins && cap.Plugins.LocalNotifications) || (cap.registerPlugin ? cap.registerPlugin('LocalNotifications') : null);
  const on = () => !!raw.get('remind', false);

  /* what would be sent, and when: 25 doors and Christmas Eve, for this December (or the next one) */
  function plan(now) {
    now = now || new Date();
    let y = now.getFullYear();
    if (now > new Date(y, 11, 25, 9)) y++;
    const out = [];
    for (let d = 1; d <= 25; d++) out.push({ id: 100 + d, at: new Date(y, 11, d, 8, 0), body: d === 25 ? 'Merry Christmas. Door 25 is ready, and the group can vote on who gave what.' : 'Door ' + d + ' is ready to open.' });
    out.push({ id: 201, at: new Date(y, 11, 24, 8, 0), body: 'It is Christmas Eve. Santa is on his way. Track him in the app all day.' });
    out.push({ id: 200, at: new Date(y, 11, 24, 17, 0), body: 'Santa is on his way. The tracker is on.' });
    out.push({ id: 202, at: new Date(y, 11, 24, 21, 30), body: 'Santa is almost at your neighborhood. Time to get ready for bed.' });
    out.push({ id: 203, at: new Date(y, 11, 24, 22, 45), body: 'Santa is near your house! Lights out, right now.' });
    return out.filter(x => x.at > now);
  }

  async function schedule() {
    if (!native) return;
    const P = plugin(); if (!P) return;
    try { const old = await P.getPending(); if (old && old.notifications && old.notifications.length) await P.cancel({ notifications: old.notifications.map(n => ({ id: n.id })) }); } catch (e) {}
    if (!on()) return;
    try { await P.schedule({ notifications: plan().map(x => ({ id: x.id, title: 'Under the Tree', body: x.body, schedule: { at: x.at, allowWhileIdle: true } })) }); } catch (e) {}
  }

  /* turn reminders on or off. Resolves false when the person said no to notifications. */
  async function set(want) {
    if (!native) return false;
    if (want) {
      let ok = false;
      try { const r = await plugin().requestPermissions(); ok = !!r && r.display === 'granted'; } catch (e) {}
      if (!ok) { raw.set('remind', false); return false; }
    }
    raw.set('remind', !!want);
    await schedule();
    return true;
  }

  A.remind = { native: native, on: on, set: set, schedule: schedule, plan: plan };
  if (native && on()) setTimeout(schedule, 4000);          /* keeps next December lined up */
})();
