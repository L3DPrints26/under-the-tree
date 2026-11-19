/* Under the Tree — design your own ornament.
   Three ways: pick a ready-made style and color, use a photo (drag to move it, slide to zoom), or draw.
   You can draw on top of a photo too. The name always sits on its own dark tag so it stays easy to read. */
(function () {
  'use strict';
  const A = window.App, $ = A.$, $$ = A.$$, esc = A.esc;
  const INK = ['#ffffff', '#ffd76a', '#ff5a5a', '#d7263d', '#6fe3a5', '#0f8a55', '#7cc4ff', '#1d6fd6', '#c9a6ff', '#111a2e'];
  A.css(`
    .oe{display:flex;flex-direction:column;gap:12px}
    .oe-top{display:flex;align-items:center;gap:16px}
    .oe-ball{position:relative;width:148px;height:148px;flex:none;border-radius:50%;display:grid;place-items:center;overflow:hidden;box-shadow:inset -12px -15px 30px rgba(0,0,0,.42),0 10px 24px rgba(0,0,0,.45);touch-action:none}
    .oe-ball canvas{position:absolute;inset:0;width:100%;height:100%;border-radius:50%}
    .oe-ball::after{content:"";position:absolute;inset:0;border-radius:50%;pointer-events:none;background:radial-gradient(circle at 30% 26%,rgba(255,255,255,.9) 0,rgba(255,255,255,.4) 5%,rgba(255,255,255,0) 20%),radial-gradient(circle at 72% 80%,rgba(255,255,255,.16) 0,rgba(255,255,255,0) 34%)}
    .oe-name{position:relative;z-index:1;pointer-events:none;font-family:var(--script);font-size:24px;line-height:1;color:#fffdf2;text-shadow:0 2px 4px rgba(0,0,0,.7)}
    .oe-name.tag{background:rgba(6,14,30,.72);padding:.16em .55em;border-radius:999px;box-shadow:0 0 0 1.5px rgba(255,255,255,.22)}
    .oe-side{flex:1;min-width:0;display:flex;flex-direction:column;gap:8px}
    .oe-side p{font-size:13.5px;color:var(--muted)}
    .oe-tabs{display:flex;gap:6px}
    .oe-tabs button{flex:1;min-height:42px;border-radius:999px;background:var(--surface2);border:1.5px solid var(--line);font-weight:600;font-size:14.5px;color:var(--muted)}
    .oe-tabs button.on{background:var(--gold);border-color:var(--gold);color:var(--gold-ink)}
    .oe-pane{min-height:132px;display:flex;flex-direction:column;gap:10px;justify-content:center}
    .oe-styles{display:grid;grid-template-columns:repeat(8,1fr);gap:8px}
    .oe-st{aspect-ratio:1;border-radius:50%;border:2px solid transparent;box-shadow:inset -3px -4px 8px rgba(0,0,0,.35)}
    .oe-st.on,.oe-sw.on{border-color:#fff;box-shadow:0 0 0 2px var(--gold)}
    .oe-colors{display:flex;flex-wrap:wrap;gap:8px}
    .oe-sw{width:30px;height:30px;border-radius:50%;border:2px solid transparent;flex:none}
    .oe-tools{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
    .oe-size{width:40px;height:40px;border-radius:12px;background:var(--surface2);border:1.5px solid var(--line);display:grid;place-items:center}
    .oe-size.on{border-color:var(--gold)}
    .oe-size i{display:block;border-radius:50%;background:#fff}
    .oe-zoom{width:100%;accent-color:var(--gold)}
    @media (max-width:420px){.oe-styles{grid-template-columns:repeat(4,1fr)}.oe-ball{width:128px;height:128px}}
    @media (orientation:landscape) and (max-height:480px){.oe{display:grid;grid-template-columns:auto 1fr;gap:10px 16px}.oe-top{flex-direction:column;grid-row:1/4}.oe-side p{display:none}.oe-pane{min-height:96px}.oe-ball{width:118px;height:118px}}
  `);

  A.ui.ornament = () => {
    const me = A.me(); if (!me) return;
    const S = A.ornStyles, cur = A.ornOf(me), person = () => A.person(me);
    let mode = cur.img ? 'photo' : 'style', st = cur.img ? 0 : (cur.st | 0) % S.length, color = Math.max(0, A.palette.findIndex(c => c[0] === person().c[0]));
    let photo = null, zoom = 1, dx = 0, dy = 0, ink = INK[0], brush = 10, undo = [], touched = !!cur.img;
    const styleBg = (i, c) => 'radial-gradient(circle at 30% 26%,rgba(255,255,255,.95) 0,rgba(255,255,255,.5) 5%,rgba(255,255,255,0) 20%)' + (S[i].bg ? ',' + S[i].bg : '') + ',radial-gradient(circle at 38% 32%,' + c[0] + ' 0,' + c[1] + ' 56%,' + c[2] + ' 100%)';
    A.ui.sheet({
      title: 'Your ornament', cls: 'orn-ed',
      html: '<div class="oe"><div class="oe-top"><div class="oe-ball" id="oeBall"><canvas id="oeCv" width="320" height="320" hidden></canvas><span class="oe-name" id="oeName">' + esc(me) + '</span></div>' +
        '<div class="oe-side"><p id="oeHint"></p><div class="oe-tabs"><button data-t="style">Styles</button><button data-t="photo">Photo</button><button data-t="draw">Draw</button></div></div></div>' +
        '<div class="oe-pane" id="oeStyle"><div class="oe-styles">' + S.map((s, i) => '<button class="oe-st" data-st="' + i + '" aria-label="' + esc(s.n) + '"></button>').join('') + '</div>' +
          '<div class="oe-colors">' + A.palette.map((c, i) => '<button class="oe-sw" data-c="' + i + '" style="background:' + c[1] + '" aria-label="Color ' + (i + 1) + '"></button>').join('') + '</div></div>' +
        '<div class="oe-pane" id="oePhoto" hidden><button class="btn block" id="oePick">' + A.icon('camera', 18) + 'Choose a photo</button><input type="file" accept="image/*" id="oeFile" hidden>' +
          '<label class="field" style="margin:0"><span>Zoom</span><input class="oe-zoom" id="oeZoom" type="range" min="1" max="4" step="0.01" value="1"></label></div>' +
        '<div class="oe-pane" id="oeDraw" hidden><div class="oe-colors">' + INK.map((c, i) => '<button class="oe-sw" data-ink="' + c + '" style="background:' + c + '" aria-label="Paint ' + (i + 1) + '"></button>').join('') + '</div>' +
          '<div class="oe-tools">' + [5, 10, 20].map(b => '<button class="oe-size" data-b="' + b + '" aria-label="Brush ' + b + '"><i style="width:' + (b + 2) + 'px;height:' + (b + 2) + 'px"></i></button>').join('') +
          '<button class="btn sm" id="oeUndo">Undo</button><button class="btn sm ghost" id="oeClear">Start over</button></div></div>' +
        '<button class="btn primary block" id="oeSave">Save my ornament</button></div>',
      onMount(el, close) {
        const ball = $('#oeBall', el), cv = $('#oeCv', el), g = cv.getContext('2d'), nameEl = $('#oeName', el), hint = $('#oeHint', el);
        const panes = { style: $('#oeStyle', el), photo: $('#oePhoto', el), draw: $('#oeDraw', el) };
        const HINTS = { style: 'Pick a look and a color.', photo: 'Choose a photo, then drag the ball to move it and slide to zoom.', draw: 'Draw right on the ball with your finger or the mouse.' };
        const base = () => { const c = A.palette[color], gr = g.createRadialGradient(122, 102, 0, 160, 160, 230); gr.addColorStop(0, c[0]); gr.addColorStop(.56, c[1]); gr.addColorStop(1, c[2]); g.fillStyle = gr; g.fillRect(0, 0, 320, 320); };
        /* the photo, moved and zoomed, always covering the whole ball */
        const drawPhoto = () => {
          if (!photo) { base(); return; }
          const k = Math.max(320 / photo.width, 320 / photo.height) * zoom, w = photo.width * k, h = photo.height * k;
          dx = Math.max(-(w - 320) / 2, Math.min((w - 320) / 2, dx)); dy = Math.max(-(h - 320) / 2, Math.min((h - 320) / 2, dy));
          g.fillStyle = '#0a1429'; g.fillRect(0, 0, 320, 320); g.drawImage(photo, (320 - w) / 2 + dx, (320 - h) / 2 + dy, w, h);
        };
        const paint = () => {
          const custom = mode !== 'style';
          cv.hidden = !custom; nameEl.classList.toggle('tag', custom || !!S[st].pill);
          ball.style.background = custom ? '#0a1429' : styleBg(st, A.palette[color]);
          $$('.oe-st', el).forEach((b, i) => { b.style.background = styleBg(i, A.palette[color]); b.classList.toggle('on', i === st && mode === 'style'); });
          $$('[data-c]', el).forEach((b, i) => b.classList.toggle('on', i === color));
          $$('[data-ink]', el).forEach(b => b.classList.toggle('on', b.dataset.ink === ink));
          $$('[data-b]', el).forEach(b => b.classList.toggle('on', +b.dataset.b === brush));
          $$('.oe-tabs button', el).forEach(b => b.classList.toggle('on', b.dataset.t === mode));
          Object.keys(panes).forEach(k => { panes[k].hidden = k !== mode; });
          hint.textContent = HINTS[mode];
        };
        const go = m => {
          if (m === 'photo' && mode !== 'photo') { undo = []; drawPhoto(); }
          if (m === 'draw' && mode === 'style') { undo = []; base(); }            /* from a style: start on a plain ball of your color */
          mode = m; paint();
        };
        /* opening with a saved custom ornament: show it so it can be drawn on */
        if (cur.img) { const src = A.photos.src({ id: cur.img }); if (src) { const im = new Image(); im.onload = () => { g.drawImage(im, 0, 0, 320, 320); }; im.src = src; } mode = 'draw'; } else base();
        $$('.oe-tabs button', el).forEach(b => { b.onclick = () => go(b.dataset.t); });
        $$('[data-st]', el).forEach(b => { b.onclick = () => { st = +b.dataset.st; mode = 'style'; paint(); }; });
        $$('[data-c]', el).forEach(b => { b.onclick = () => { color = +b.dataset.c; if (mode === 'draw' && !touched) base(); paint(); }; });
        $$('[data-ink]', el).forEach(b => { b.onclick = () => { ink = b.dataset.ink; paint(); }; });
        $$('[data-b]', el).forEach(b => { b.onclick = () => { brush = +b.dataset.b; paint(); }; });
        const file = $('#oeFile', el);
        $('#oePick', el).onclick = () => file.click();
        file.onchange = () => { const f = file.files[0]; file.value = ''; if (!f || !/^image\//.test(f.type)) return; const url = URL.createObjectURL(f), im = new Image();
          im.onload = () => { photo = im; zoom = 1; dx = dy = 0; $('#oeZoom', el).value = 1; touched = true; drawPhoto(); URL.revokeObjectURL(url); }; im.onerror = () => A.ui.toast('That file is not a picture.'); im.src = url; };
        $('#oeZoom', el).oninput = e => { zoom = +e.target.value; if (photo) drawPhoto(); };
        /* one finger or the mouse: move the photo in Photo, paint in Draw */
        const at = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * 320 / r.width, (e.clientY - r.top) * 320 / r.height]; };
        let down = null;
        ball.addEventListener('pointerdown', e => {
          if (mode === 'style') return; e.preventDefault(); try { ball.setPointerCapture(e.pointerId); } catch (x) {}
          down = at(e);
          if (mode === 'draw') { if (undo.length > 14) undo.shift(); undo.push(g.getImageData(0, 0, 320, 320)); touched = true; g.fillStyle = ink; g.beginPath(); g.arc(down[0], down[1], brush / 2, 0, 6.283); g.fill(); }
        });
        ball.addEventListener('pointermove', e => {
          if (!down) return; const p = at(e);
          if (mode === 'photo' && photo) { dx += p[0] - down[0]; dy += p[1] - down[1]; drawPhoto(); }
          else if (mode === 'draw') { g.strokeStyle = ink; g.lineWidth = brush; g.lineCap = g.lineJoin = 'round'; g.beginPath(); g.moveTo(down[0], down[1]); g.lineTo(p[0], p[1]); g.stroke(); }
          down = p;
        });
        const up = () => { down = null; }; ball.addEventListener('pointerup', up); ball.addEventListener('pointercancel', up);
        $('#oeUndo', el).onclick = () => { const d = undo.pop(); if (d) g.putImageData(d, 0, 0); };
        $('#oeClear', el).onclick = () => { undo = []; touched = false; photo = null; base(); };
        $('#oeSave', el).onclick = () => {
          if (A.palette[color][0] !== person().c[0]) A.setColor(me, color);
          if (mode === 'style') A.setOrn(me, { st });
          else A.setOrn(me, { img: A.photos.put(cv.toDataURL('image/jpeg', 0.86)) });
          close(); A.refresh(); A.ui.toast('Ornament saved.');
        };
        paint();
      }
    });
  };
})();
