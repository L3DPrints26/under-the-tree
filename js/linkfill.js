/* Under the Tree — paste a link and the wish fills itself in (name, price, photo).
   This only works inside the iPhone and iPad app. A website is not allowed to read another website,
   so on the web the box is simply not shown. Shops change their pages all the time and some block
   this kind of reading, so it is a helper, not a promise: whatever it finds can be fixed by hand. */
(function () {
  'use strict';
  const A = window.App, cap = window.Capacitor;
  const native = !!(cap && cap.isNativePlatform && cap.isNativePlatform());
  const http = () => (cap.Plugins && cap.Plugins.CapacitorHttp) || (cap.registerPlugin ? cap.registerPlugin('CapacitorHttp') : null);

  const decode = s => { const t = document.createElement('textarea'); t.innerHTML = s; return t.value; };
  function meta(html, names) {
    for (const n of names) {
      const a = new RegExp('<meta[^>]+(?:property|name|itemprop)=["\']' + n + '["\'][^>]*?content=["\']([^"\']+)["\']', 'i');
      const b = new RegExp('<meta[^>]+content=["\']([^"\']+)["\'][^>]*?(?:property|name|itemprop)=["\']' + n + '["\']', 'i');
      const m = html.match(a) || html.match(b);
      if (m && m[1].trim()) return decode(m[1]).trim();
    }
    return '';
  }
  const host = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return ''; } };

  /* shops stick their own name on the front or the back of the title */
  function cleanTitle(t, url) {
    t = String(t || '').replace(/\s+/g, ' ').trim();
    t = t.replace(/^Amazon\.com\s*:\s*/i, '');
    if (/amazon\./i.test(host(url))) t = t.split(/\s:\s/)[0];
    /* a bar almost always splits the product from the shop's own words, so keep what is in front of the first one */
    const bar = t.indexOf(' | ');
    if (bar >= 8) t = t.slice(0, bar);
    for (const sep of [' - ', ' – ', ' — ', ' : ']) {
      const i = t.lastIndexOf(sep);
      if (i > 12 && t.length - i - sep.length <= 28) t = t.slice(0, i);
    }
    return t.trim().slice(0, 90);
  }
  function findPrice(html) {
    let p = meta(html, ['product:price:amount', 'og:price:amount', 'price']);
    if (!p) { const m = html.match(/"price"\s*:\s*"?(\d[\d,]*(?:\.\d{1,2})?)"?/); if (m) p = m[1]; }
    if (!p) { const m = html.match(/itemprop=["']price["'][^>]*>\s*\$?\s*(\d[\d,]*(?:\.\d{1,2})?)/i); if (m) p = m[1]; }
    if (!p) {
      /* Amazon: only the price in the main price box counts. A page has many other prices on it (other sellers,
         bundles, things people also bought), and a wrong price is worse than no price. */
      const m = html.match(/"priceAmount"\s*:\s*(\d+(?:\.\d{1,2})?)/);
      if (m) p = m[1];
      else { const at = html.search(/corePrice(?:Display)?_(?:desktop_|mobile_)?feature_div|id=["']corePrice/); if (at >= 0) { const m2 = html.slice(at, at + 6000).match(/class=["']a-offscreen["']>\s*\$\s*(\d[\d,]*\.\d{2})/); if (m2) p = m2[1]; } }
    }
    if (!p) return '';
    const num = String(p).replace(/[^\d.,]/g, '').replace(/,(?=\d{3}\b)/g, '');
    if (!num || !(parseFloat(num) > 0)) return '';
    const cur = (meta(html, ['product:price:currency', 'og:price:currency']) || (html.match(/"priceCurrency"\s*:\s*"([A-Z]{3})"/) || [])[1] || 'USD').toUpperCase();
    const sym = { USD: '$', CAD: '$', AUD: '$', GBP: '£', EUR: '€' }[cur];
    return (sym || '') + num.replace(/\.00$/, '') + (sym ? '' : ' ' + cur);
  }

  /* reads the page and returns { name, price, photo (a photo id, or '') }. Throws when nothing useful came back. */
  async function read(url) {
    if (!native) throw new Error('app only');
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    const H = http(); if (!H) throw new Error('not ready');
    const ua = navigator.userAgent.replace(/Mobile\/\w+$/, 'Version/17.0 Mobile/15E148 Safari/604.1');
    const res = await H.request({ method: 'GET', url: url, headers: { 'User-Agent': ua, 'Accept': 'text/html,application/xhtml+xml', 'Accept-Language': 'en-US,en;q=0.9' }, responseType: 'text', connectTimeout: 12000, readTimeout: 12000 });
    const html = typeof res.data === 'string' ? res.data : '';
    if (!html || res.status >= 400) throw new Error('blocked');
    const name = cleanTitle(meta(html, ['og:title', 'twitter:title']) || decode((html.match(/<title[^>]*>([^<]+)<\/title>/i) || [])[1] || ''), url);
    const price = findPrice(html);
    let img = meta(html, ['og:image:secure_url', 'og:image', 'twitter:image', 'twitter:image:src']), photo = '';
    if (!img) {
      /* Amazon keeps the big picture in the page's own data, and other shops list it in their product info */
      const m = html.match(/"hiRes"\s*:\s*"(https:[^"]+)"/) || html.match(/data-old-hires=["'](https:[^"']+)["']/) || html.match(/id=["'](?:landingImage|main-image)["'][^>]*?src=["'](https:[^"']+)["']/) ||
        html.match(/data-a-dynamic-image=["']\{(?:&quot;|")(https:[^&"]+)/) || html.match(/"image"\s*:\s*\[?\s*"(https:[^"]+)"/) ||
        (/amazon\./i.test(host(url)) ? html.match(/(https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9%+-]+\.(?:_[A-Za-z0-9_,]+_\.)?jpg)/) : null);
      if (m) img = decode(m[1]).replace(/\\\//g, '/');
    }
    if (img) {
      try {
        img = new URL(img, url).href;
        if (/(?:media-amazon|ssl-images-amazon)\.com\/images\/I\//.test(img)) img = img.replace(/\._[^\/]*_\.(jpg|png)$/i, '.$1');      /* drop the size code: full-size picture */
        const r = await H.request({ method: 'GET', url: img, headers: { 'User-Agent': ua }, responseType: 'blob', connectTimeout: 12000, readTimeout: 15000 });
        if (typeof r.data === 'string' && r.data.length > 200) {
          const bin = atob(r.data.replace(/\s/g, '')), bytes = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
          const type = String((r.headers && (r.headers['Content-Type'] || r.headers['content-type'])) || 'image/jpeg').split(';')[0];
          photo = await A.photos.fromFile(new Blob([bytes], { type: /^image\//.test(type) ? type : 'image/jpeg' }));
        }
      } catch (e) { photo = ''; }
    }
    if (!name && !price && !photo) throw new Error('nothing');
    return { name: name, price: price, photo: photo, link: url, host: host(url) };
  }

  /* the box at the top of the wish form */
  const boxHTML = () => (native ? '<div class="field"><span class="label">Have a link? Paste it and the rest fills in.</span><div class="linkrow"><input class="input" id="lfUrl" placeholder="https://" inputmode="url" autocapitalize="off" autocomplete="off" spellcheck="false">' +
    '<button type="button" class="btn primary" id="lfGo" style="flex:none">Fill in</button></div><p class="gp-msg" id="lfMsg" style="margin-top:6px"></p></div>' : '');

  /* form: { el, addPhoto(id), addLink(url) } so the wish form stays in charge of its own fields */
  function wire(form) {
    const $ = A.$, el = form.el, go = $('#lfGo', el); if (!go) return;
    const inp = $('#lfUrl', el), msg = $('#lfMsg', el);
    const run = () => {
      const url = inp.value.trim(); if (!url) { inp.focus(); return; }
      go.disabled = true; go.textContent = 'Looking'; msg.style.color = ''; msg.textContent = '';
      read(url).then(r => {
        const n = $('#fName', el), p = $('#fPrice', el);
        if (r.name && !n.value.trim()) n.value = r.name;
        if (r.price && !p.value.trim()) p.value = r.price;
        if (r.photo) form.addPhoto(r.photo);
        form.addLink(r.link);
        inp.value = '';
        msg.style.color = '#5fe3a1';
        msg.textContent = 'Filled in from ' + (r.host || 'that page') + '. Check it over, shops are not always right.';
      }, () => { msg.textContent = 'That page would not let the app read it. You can still type it in.'; })
        .then(() => { go.disabled = false; go.textContent = 'Fill in'; });
    };
    go.onclick = run;
    inp.addEventListener('paste', () => setTimeout(run, 60));
    inp.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); run(); } };
  }

  A.linkFill = { native: native, read: read, boxHTML: boxHTML, wire: wire };
})();
