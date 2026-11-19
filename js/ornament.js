/* Under the Tree — the ornament studio.
   A full-screen place to make your own ornament. Pick a ready-made style, or make one:
   paint with a pen, marker, spray or glitter, erase, fill, stamp little shapes, mirror your strokes,
   and put a photo underneath that you can move, zoom and turn. Undo and redo as much as you like.
   The ribbon band with your name is shown on top while you work, so you always see how it will read. */
(function () {
  'use strict';
  const A = window.App, $ = A.$, $$ = A.$$, esc = A.esc;
  const N = 512;
  const INK = ['#ffffff', '#fff3c4', '#ffd76a', '#ff9a3c', '#ff5a5a', '#d7263d', '#ff9ad1', '#c9a6ff', '#7cc4ff', '#1d6fd6', '#6fe3a5', '#0f8a55', '#8a5a34', '#111a2e'];
  const TOOLS = [['pen', 'Pen'], ['marker', 'Marker'], ['spray', 'Spray'], ['glitter', 'Glitter'], ['eraser', 'Eraser']];
  const STAMPS = ['star', 'heart', 'snow', 'tree', 'bell', 'candy', 'gift', 'holly', 'sparkle'];
  A.css(`
    #ornEd{position:fixed;inset:0;z-index:70;display:flex;flex-direction:column;background:#071022;padding:env(safe-area-inset-top) 0 env(safe-area-inset-bottom)}
    #ornEd::before{content:"";position:absolute;left:0;right:0;top:0;height:8px;background:repeating-linear-gradient(135deg,#c9243a 0 10px,#f4ecdc 10px 20px)}
    .oe2-top{display:flex;align-items:center;justify-content:space-between;gap:10px;height:58px;padding:10px 14px 0;flex:none}
    .oe2-top b{font-family:var(--display);font-size:21px;font-weight:600}
    .oe2-stage{flex:1;min-height:0;display:grid;place-items:center;padding:6px}
    .oe2-ball{position:relative;border-radius:50%;overflow:hidden;display:grid;place-items:center;box-shadow:0 14px 40px rgba(0,0,0,.6),0 0 0 3px rgba(233,196,106,.35);touch-action:none;cursor:crosshair}
    .oe2-ball canvas{position:absolute;inset:0;width:100%;height:100%}
    .oe2-over{position:absolute;inset:0;pointer-events:none;transition:opacity .2s}
    .oe2-name{position:relative;z-index:1;pointer-events:none;font-family:var(--script);font-style:italic;font-weight:700;line-height:1;color:#fff8e6;text-shadow:0 1px 3px rgba(0,0,0,.8);transition:opacity .2s}
    .oe2-ball.bare .oe2-over,.oe2-ball.bare .oe2-name{opacity:0}
    .oe2-tools{flex:none;display:flex;flex-direction:column;gap:8px;padding:8px 12px 12px;background:#0f1b33;border-top:1px solid var(--line2);border-radius:20px 20px 0 0}
    .oe2-tabs{display:flex;gap:6px}
    .oe2-tabs button{flex:1;min-height:40px;border-radius:999px;background:var(--surface2);border:1.5px solid var(--line);font-weight:600;font-size:14.5px;color:var(--muted)}
    .oe2-tabs button.on{background:var(--gold);border-color:var(--gold);color:var(--gold-ink)}
    .oe2-pane{display:flex;flex-direction:column;gap:8px;min-height:104px;justify-content:center}
    .oe2-row{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
    .oe2-chip{min-height:36px;padding:0 12px;border-radius:10px;background:var(--surface2);border:1.5px solid var(--line);font-weight:600;font-size:13.5px;color:#e6edf7}
    .oe2-chip.on{border-color:var(--gold);background:#3a2f12;color:#fff}
    .oe2-sw{width:28px;height:28px;border-radius:50%;border:2px solid rgba(255,255,255,.25);flex:none;padding:0}
    .oe2-sw.on{border-color:#fff;box-shadow:0 0 0 2px var(--gold)}
    .oe2-sw.pick{position:relative;overflow:hidden;background:conic-gradient(#ff5a5a,#ffd76a,#6fe3a5,#7cc4ff,#c9a6ff,#ff5a5a)}
    .oe2-sw.pick input{position:absolute;inset:-6px;width:200%;height:200%;opacity:0;cursor:pointer}
    .oe2-st{width:44px;height:44px;border-radius:50%;border:2px solid transparent;flex:none;padding:0}
    .oe2-st.on{border-color:#fff;box-shadow:0 0 0 2px var(--gold)}
    .oe2-stamp{width:42px;height:42px;border-radius:12px;background:var(--surface2);border:1.5px solid var(--line);display:grid;place-items:center;color:#fff;flex:none}
    .oe2-stamp.on{border-color:var(--gold);color:var(--gold)}
    .oe2-range{display:flex;align-items:center;gap:8px;flex:1;min-width:150px;font-size:13px;font-weight:600;color:var(--muted)}
    .oe2-range input{flex:1;accent-color:var(--gold)}
    .oe2-bar{display:flex;gap:6px}
    .oe2-bar .btn{flex:1;min-height:38px;padding:0 6px;font-size:13.5px}
    @media (orientation:landscape) and (max-height:520px){
      #ornEd{display:grid;grid-template-columns:minmax(0,1fr) minmax(300px,46%);grid-template-rows:auto minmax(0,1fr)}
      .oe2-top{grid-column:1/3;height:46px;padding-top:8px}
      .oe2-tools{border-radius:20px 0 0 0;border-top:0;border-left:1px solid var(--line2);overflow:hidden;justify-content:center}
      .oe2-pane{min-height:0}
    }
  `);

  A.ui.ornament = () => {
    const me = A.me(); if (!me || $('#ornEd')) return;
    const S = A.ornStyles, cur = A.ornOf(me), person = A.person(me);
    let color = Math.max(0, A.palette.findIndex(c => c[0] === person.c[0])), st = cur.img ? 0 : (cur.st | 0) % S.length;
    let pane = cur.img ? 'draw' : 'style', custom = !!cur.img, tool = 'pen', ink = INK[0], size = 14, stamp = STAMPS[0], stampSize = 90, mirror = false;
    let photo = null, zoom = 1, rot = 0, dx = 0, dy = 0, flat = '', undo = [], redo = [];
    const root = document.createElement('div'); root.id = 'ornEd';
    root.innerHTML = '<div class="oe2-top"><button class="icon-btn solid" id="oeX" aria-label="Close without saving">' + A.icon('x') + '</button><b>Your ornament</b><button class="btn primary sm" id="oeSave">Save</button></div>' +
      '<div class="oe2-stage"><div class="oe2-ball" id="oeBall"><canvas id="oeCv" width="' + N + '" height="' + N + '"></canvas><span class="oe2-over" id="oeOver"></span><span class="oe2-name" id="oeName">' + esc(me) + '</span></div></div>' +
      '<div class="oe2-tools"><div class="oe2-tabs"><button data-t="style">Styles</button><button data-t="draw">Draw</button><button data-t="stamp">Stamps</button><button data-t="photo">Photo</button></div>' +
      '<div class="oe2-pane" data-p="style"><div class="oe2-row">' + S.map((s, i) => '<button class="oe2-st" data-st="' + i + '" aria-label="' + esc(s.n) + '"></button>').join('') + '</div>' +
        '<div class="oe2-row">' + A.palette.map((c, i) => '<button class="oe2-sw" data-c="' + i + '" style="background:' + c[1] + '" aria-label="Ornament color ' + (i + 1) + '"></button>').join('') + '</div></div>' +
      '<div class="oe2-pane" data-p="draw"><div class="oe2-row">' + TOOLS.map(t => '<button class="oe2-chip" data-tool="' + t[0] + '">' + t[1] + '</button>').join('') + '<button class="oe2-chip" id="oeMirror">Mirror</button><button class="oe2-chip" id="oeFill">Fill</button></div>' +
        '<div class="oe2-row" data-inks></div><label class="oe2-range">Size<input type="range" id="oeSize" min="3" max="70" value="14"></label></div>' +
      '<div class="oe2-pane" data-p="stamp"><div class="oe2-row">' + STAMPS.map(s => '<button class="oe2-stamp" data-stamp="' + s + '" aria-label="' + s + ' stamp">' + A.icon(s, 24) + '</button>').join('') + '</div>' +
        '<div class="oe2-row" data-inks></div><label class="oe2-range">Size<input type="range" id="oeStampSize" min="36" max="220" value="90"></label></div>' +
      '<div class="oe2-pane" data-p="photo"><div class="oe2-row"><button class="btn sm primary" id="oePick">' + A.icon('camera', 16) + 'Choose a photo</button><button class="oe2-chip" id="oeNoPhoto">Take the photo off</button><input type="file" accept="image/*" id="oeFile" hidden></div>' +
        '<label class="oe2-range">Zoom<input type="range" id="oeZoom" min="1" max="4" step="0.01" value="1"></label><label class="oe2-range">Turn<input type="range" id="oeRot" min="-180" max="180" step="1" value="0"></label>' +
        '<p class="muted" style="font-size:13px">Drag the ball to move the photo. Draw and stamp on top of it.</p></div>' +
      '<div class="oe2-bar"><button class="btn" id="oeUndo">Undo</button><button class="btn" id="oeRedo">Redo</button><button class="btn" id="oeClear">Start over</button><button class="btn" id="oeBand">Hide name</button></div></div>';
    document.body.appendChild(root);
    const inks = INK.map(c => '<button class="oe2-sw" data-ink="' + c + '" style="background:' + c + '" aria-label="Color"></button>').join('') + '<label class="oe2-sw pick" aria-label="Any color"><input type="color" value="#ff5a5a"></label>';
    $$('[data-inks]', root).forEach(r => { r.innerHTML = inks; });

    const ball = $('#oeBall', root), cv = $('#oeCv', root), g = cv.getContext('2d'), over = $('#oeOver', root), nameEl = $('#oeName', root);
    const layer = document.createElement('canvas'); layer.width = layer.height = N; const L = layer.getContext('2d');       /* everything drawn or stamped */
    const fit = () => { const st2 = $('.oe2-stage', root).getBoundingClientRect(), d = Math.max(140, Math.min(st2.width - 12, st2.height - 12, 620)); ball.style.width = ball.style.height = d + 'px'; nameEl.style.fontSize = (d * .19) + 'px'; };
    /* what is under the drawing: a flat fill, a photo, or a soft ball in your color */
    const base = () => {
      const c = A.palette[color];
      if (photo) { const k = Math.max(N / photo.width, N / photo.height) * zoom; g.fillStyle = '#0a1429'; g.fillRect(0, 0, N, N); g.save(); g.translate(N / 2 + dx, N / 2 + dy); g.rotate(rot * Math.PI / 180); g.drawImage(photo, -photo.width * k / 2, -photo.height * k / 2, photo.width * k, photo.height * k); g.restore(); return; }
      if (flat) { g.fillStyle = flat; g.fillRect(0, 0, N, N); return; }
      const gr = g.createRadialGradient(N * .36, N * .3, 0, N / 2, N / 2, N * .8); gr.addColorStop(0, c[0]); gr.addColorStop(.55, c[1]); gr.addColorStop(1, c[2]); g.fillStyle = gr; g.fillRect(0, 0, N, N);
    };
    const render = () => { if (!custom) return; base(); g.drawImage(layer, 0, 0); };
    const snap = () => { if (undo.length > 14) undo.shift(); undo.push(L.getImageData(0, 0, N, N)); redo = []; };
    const paint = () => {
      cv.style.visibility = custom ? 'visible' : 'hidden';
      ball.style.background = custom ? '#0a1429' : A.ornArt(st, A.palette[color]) + ' center/100% 100%';
      over.style.background = custom ? A.ornArt(-1, A.palette[color]) + ' center/100% 100%' : 'none';
      $$('.oe2-tabs button', root).forEach(b => b.classList.toggle('on', b.dataset.t === pane));
      $$('.oe2-pane', root).forEach(p => { p.hidden = p.dataset.p !== pane; });
      $$('[data-st]', root).forEach((b, i) => { b.style.background = A.ornArt(i, A.palette[color]) + ' center/100% 100%'; b.classList.toggle('on', !custom && i === st); });
      $$('[data-c]', root).forEach((b, i) => b.classList.toggle('on', i === color));
      $$('[data-ink]', root).forEach(b => b.classList.toggle('on', b.dataset.ink === ink));
      $$('[data-tool]', root).forEach(b => b.classList.toggle('on', b.dataset.tool === tool));
      $$('[data-stamp]', root).forEach(b => b.classList.toggle('on', b.dataset.stamp === stamp));
      $('#oeMirror', root).classList.toggle('on', mirror);
      render();
    };
    const go = p => { pane = p; if (p !== 'style') custom = true; paint(); fit(); };

    /* ----- drawing ----- */
    const at = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * N / r.width, (e.clientY - r.top) * N / r.height]; };
    const seg = (a, b) => {
      const each = fn => { fn(a, b); if (mirror) fn([N - a[0], a[1]], [N - b[0], b[1]]); };
      if (tool === 'pen' || tool === 'marker' || tool === 'eraser') each((p, q) => {
        L.save(); L.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over'; L.globalAlpha = tool === 'marker' ? .35 : 1;
        L.strokeStyle = ink; L.lineWidth = size * (tool === 'marker' ? 1.8 : 1); L.lineCap = L.lineJoin = 'round'; L.beginPath(); L.moveTo(p[0], p[1]); L.lineTo(q[0], q[1]); L.stroke(); L.restore();
      });
      else each((p, q) => {
        const n = tool === 'spray' ? 14 : 5, R = size * (tool === 'spray' ? 1.6 : 2.2);
        for (let i = 0; i < n; i++) { const an = Math.random() * 6.283, d = Math.sqrt(Math.random()) * R, x = q[0] + Math.cos(an) * d, y = q[1] + Math.sin(an) * d;
          if (tool === 'spray') { L.fillStyle = ink; L.globalAlpha = .5; L.beginPath(); L.arc(x, y, Math.max(1, size * .09), 0, 6.283); L.fill(); L.globalAlpha = 1; }
          else { const s = Math.random() * size * .32 + 1.4; L.fillStyle = Math.random() < .5 ? '#ffffff' : (Math.random() < .5 ? '#ffe9a8' : ink); L.beginPath(); L.moveTo(x, y - s); L.lineTo(x + s * .3, y - s * .3); L.lineTo(x + s, y); L.lineTo(x + s * .3, y + s * .3); L.lineTo(x, y + s); L.lineTo(x - s * .3, y + s * .3); L.lineTo(x - s, y); L.lineTo(x - s * .3, y - s * .3); L.closePath(); L.fill(); } }
      });
    };
    const stampImgs = {};
    const putStamp = p => {
      const key = stamp + ink, draw = im => { const each = x => L.drawImage(im, x - stampSize / 2, p[1] - stampSize / 2, stampSize, stampSize); each(p[0]); if (mirror) each(N - p[0]); render(); };
      if (stampImgs[key]) return draw(stampImgs[key]);
      const im = new Image(); im.onload = () => { stampImgs[key] = im; draw(im); };
      im.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="' + ink + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + A.icons[stamp] + '</svg>');
    };
    let down = null;
    ball.addEventListener('pointerdown', e => {
      if (!custom) return; e.preventDefault(); try { ball.setPointerCapture(e.pointerId); } catch (x) {}
      down = at(e);
      if (pane === 'photo') return;
      snap();
      if (pane === 'stamp') { putStamp(down); down = null; return; }
      seg(down, down); render();
    });
    ball.addEventListener('pointermove', e => {
      if (!down) return; const p = at(e);
      if (pane === 'photo') { if (photo) { dx += p[0] - down[0]; dy += p[1] - down[1]; render(); } }
      else { seg(down, p); render(); }
      down = p;
    });
    const up = () => { down = null; }; ball.addEventListener('pointerup', up); ball.addEventListener('pointercancel', up);

    /* ----- controls ----- */
    $$('.oe2-tabs button', root).forEach(b => { b.onclick = () => go(b.dataset.t); });
    $$('[data-st]', root).forEach(b => { b.onclick = () => { st = +b.dataset.st; custom = false; pane = 'style'; paint(); }; });
    $$('[data-c]', root).forEach(b => { b.onclick = () => { color = +b.dataset.c; paint(); }; });
    $$('[data-tool]', root).forEach(b => { b.onclick = () => { tool = b.dataset.tool; paint(); }; });
    $$('[data-stamp]', root).forEach(b => { b.onclick = () => { stamp = b.dataset.stamp; paint(); }; });
    root.addEventListener('click', e => { const b = e.target.closest('[data-ink]'); if (b) { ink = b.dataset.ink; if (tool === 'eraser') tool = 'pen'; paint(); } });
    $$('.oe2-sw.pick input', root).forEach(i => { i.oninput = () => { ink = i.value; if (tool === 'eraser') tool = 'pen'; paint(); }; });
    $('#oeSize', root).oninput = e => { size = +e.target.value; };
    $('#oeStampSize', root).oninput = e => { stampSize = +e.target.value; };
    $('#oeMirror', root).onclick = () => { mirror = !mirror; paint(); };
    $('#oeFill', root).onclick = () => { flat = ink; photo = null; render(); A.ui.toast('Filled.'); };
    $('#oeUndo', root).onclick = () => { const d = undo.pop(); if (d) { redo.push(L.getImageData(0, 0, N, N)); L.putImageData(d, 0, 0); render(); } };
    $('#oeRedo', root).onclick = () => { const d = redo.pop(); if (d) { undo.push(L.getImageData(0, 0, N, N)); L.putImageData(d, 0, 0); render(); } };
    $('#oeClear', root).onclick = () => { snap(); L.clearRect(0, 0, N, N); flat = ''; photo = null; render(); };
    $('#oeBand', root).onclick = e => { const bare = ball.classList.toggle('bare'); e.currentTarget.textContent = bare ? 'Show name' : 'Hide name'; };
    const file = $('#oeFile', root);
    $('#oePick', root).onclick = () => file.click();
    $('#oeNoPhoto', root).onclick = () => { photo = null; render(); };
    file.onchange = () => { const f = file.files[0]; file.value = ''; if (!f || !/^image\//.test(f.type)) return; const url = URL.createObjectURL(f), im = new Image();
      im.onload = () => { photo = im; flat = ''; zoom = 1; rot = 0; dx = dy = 0; $('#oeZoom', root).value = 1; $('#oeRot', root).value = 0; custom = true; paint(); URL.revokeObjectURL(url); }; im.onerror = () => A.ui.toast('That file is not a picture.'); im.src = url; };
    $('#oeZoom', root).oninput = e => { zoom = +e.target.value; render(); };
    $('#oeRot', root).oninput = e => { rot = +e.target.value; render(); };
    const shut = () => { removeEventListener('resize', fit); root.remove(); };
    $('#oeX', root).onclick = shut;
    $('#oeSave', root).onclick = () => {
      if (A.palette[color][0] !== A.person(me).c[0]) A.setColor(me, color);
      if (custom) { render(); A.setOrn(me, { img: A.photos.put(cv.toDataURL('image/jpeg', 0.88)) }); } else A.setOrn(me, { st });
      shut(); A.refresh(); A.ui.toast('Ornament saved.');
    };
    /* a saved custom ornament opens as the starting picture, ready to draw on */
    if (cur.img) { const src = A.photos.src({ id: cur.img }); if (src) { const im = new Image(); im.onload = () => { photo = im; render(); }; im.src = src; } }
    addEventListener('resize', fit); paint(); fit(); requestAnimationFrame(fit);
  };
})();
