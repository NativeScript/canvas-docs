<template>
  <div ref="rootRef" class="canvas-playground app" :class="{ 'is-dark': isDarkMode }">
    <aside class="sidebar">
      <header class="sidebar-head">
        <div class="title-row">
          <h2>Canvas Playground</h2>
          <span class="badge">{{ examples.length }}</span>
        </div>
        <p class="subtitle">Live samples across 2D, WebGL, WebGPU, Three.js and Pixi.js.</p>
      </header>
      <div class="category-select">
        <label for="categorySelect">Filter</label>
        <select id="categorySelect" v-model="selectedCategory">
          <option v-for="c in categories" :key="c" :value="c">
            {{ categoryLabel(c) }}
          </option>
        </select>
      </div>
      <div class="examples">
        <template v-for="group in groupedExamples" :key="group.category">
          <div v-if="selectedCategory === 'all'" class="group-header">
            <span class="pill" :data-cat="group.category">{{ pillLabel(group.category) }}</span>
            <span class="group-label">{{ categoryLabel(group.category) }}</span>
            <span class="group-count">{{ group.items.length }}</span>
          </div>
          <ul class="example-list">
            <li
              v-for="ex in group.items"
              :key="ex.id"
              :class="{ active: ex.id === currentExample.id }"
              @click="selectExample(ex.id)"
            >
              <span class="pill" :data-cat="ex.category">{{ pillLabel(ex.category) }}</span>
              <span class="title">{{ ex.title }}</span>
            </li>
          </ul>
        </template>
      </div>
    </aside>

    <main class="main">
      <div class="canvas-wrap" ref="canvasWrap">
        <canvas ref="canvas" id="playCanvas" :key="canvasKey"></canvas>
        <div v-if="runError" class="error-banner">{{ runError }}</div>
      </div>
      <section class="editor">
        <div class="editor-header">
          <div class="file-tab">
            <span class="dot" :data-cat="currentExample.category"></span>
            <span class="filename">{{ currentExample.id }}.js</span>
            <span class="muted">— {{ currentExample.title }}</span>
          </div>
          <div class="editor-actions">
            <button class="ghost run" @click="runSelected" title="Run sample">
              <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
              Run
            </button>
            <button class="ghost" @click="resetCode" title="Reset to original">Reset</button>
            <button class="ghost export" @click="openExport" title="Export to NativeScript">
              <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path fill="currentColor" d="M5 20h14v-2H5v2zM12 4l-5 5h3v6h4V9h3l-5-5z"/></svg>
              Export
            </button>
          </div>
        </div>
        <div class="code-editor" ref="codeEditorRoot">
          <div class="gutter" aria-hidden="true">
            <div class="gutter-inner" ref="gutter">
              <div v-for="n in lineCount" :key="n" class="ln">{{ n }}</div>
            </div>
          </div>
          <div class="code-area">
            <pre class="highlight" ref="highlightPre" v-html="highlightedHtml" aria-hidden="true"></pre>
            <textarea
              ref="codeEditor"
              v-model="code"
              spellcheck="false"
              autocorrect="off"
              autocapitalize="off"
              autocomplete="off"
              wrap="off"
              @scroll="syncScroll"
              @keydown.tab.prevent="onTab"
            ></textarea>
          </div>
        </div>
      </section>
    </main>

    <div v-show="modalVisible" id="exportModal" class="modal" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-copy">
            <h3>Export to NativeScript</h3>
            <p class="muted">Drop {{ exportFileCopy.item }} into a NativeScript {{ exportFramework }} project with <code>@nativescript/canvas</code> installed and wire {{ exportFileCopy.pronoun }} into your page route.</p>
          </div>
          <button class="modal-close" type="button" aria-label="Close export modal" @click="closeModal">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.29 19.7 2.88 18.3 9.17 12 2.88 5.71 4.29 4.29l6.3 6.3 6.29-6.3z"/></svg>
          </button>
        </div>
        <div class="framework-switcher" role="tablist" aria-label="Export framework flavor">
          <button
            v-for="framework in exportFrameworks"
            :key="framework"
            :class="['framework-switcher-button', { active: exportFramework === framework }]"
            type="button"
            @click="setExportFramework(framework)"
          >
            {{ framework }}
          </button>
        </div>
        <div class="modal-toolbar">
          <div class="tabs">
            <button
              v-for="file in exportFiles"
              :key="file.id"
              :class="{ active: exportTab === file.id }"
              type="button"
              @click="setExportTab(file.id)"
            >
              {{ file.label }}
            </button>
          </div>
          <span class="export-kind">{{ currentExportKind }}</span>
        </div>
        <div id="exportArea" class="exportArea" v-html="exportHighlightedHtml"></div>
        <div class="modal-actions">
          <p class="modal-note">{{ currentExportNote }}</p>
          <div class="modal-action-group">
            <button class="secondary" @click="copyExport">
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v12h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
              Copy code
            </button>
            <button class="primary" @click="downloadExport">
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M5 20h14v-2H5v2zm7-16-5 5h3v6h4V9h3l-5-5z"/></svg>
              {{ downloadLabel }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from 'vue';
import { createHighlighter } from 'shiki';

const rootRef = ref(null);
const canvasWrap = ref(null);
const codeEditorRoot = ref(null);
const highlightPre = ref(null);
const gutter = ref(null);
let contentContainer = null;
let vpDocRoot = null;

// ---------- examples ----------
// Each example declares its context so the runner can prepare the canvas correctly.
// `contextType` is one of '2d' | 'webgl' | 'webgpu'.
const examples = [
  {
    id: 'hello-world',
    category: '2d',
    contextType: '2d',
    title: 'Hello World',
    code: `ctx.setTransform(dpr,0,0,dpr,0,0);
const w = canvas.width / dpr, h = canvas.height / dpr;
const g = ctx.createLinearGradient(0,0,w,h);
g.addColorStop(0,'#0ea5e9'); g.addColorStop(1,'#a855f7');
ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
ctx.fillStyle = 'white';
ctx.font = 'bold 48px system-ui, -apple-system, Segoe UI, Roboto';
ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
ctx.fillText('Hello, Canvas', w/2, h/2);
`
  },
  {
    id: 'bouncing',
    category: '2d',
    contextType: '2d',
    title: 'Bouncing Balls',
    code: `ctx.setTransform(dpr,0,0,dpr,0,0);
const cw = canvas.width / dpr, ch = canvas.height / dpr;
const balls = Array.from({length: 24}, () => ({
  x: Math.random()*cw, y: Math.random()*ch,
  vx: (Math.random()-0.5)*3.2, vy: (Math.random()-0.5)*3.2,
  r: 6 + Math.random()*18,
  color: 'hsl(' + (Math.random()*360|0) + ',80%,60%)'
}));
let raf;
function step(){
  ctx.fillStyle = 'rgba(2,6,23,0.25)';
  ctx.fillRect(0,0,cw,ch);
  for (const b of balls){
    b.x += b.vx; b.y += b.vy;
    if (b.x < b.r){ b.x = b.r; b.vx *= -1; }
    if (b.x > cw - b.r){ b.x = cw - b.r; b.vx *= -1; }
    if (b.y < b.r){ b.y = b.r; b.vy *= -1; }
    if (b.y > ch - b.r){ b.y = ch - b.r; b.vy *= -1; }
    ctx.fillStyle = b.color;
    ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fill();
  }
  raf = requestAnimationFrame(step);
}
step();
return () => cancelAnimationFrame(raf);
`
  },
  {
    id: 'particles',
    category: '2d',
    contextType: '2d',
    title: 'Particle Field',
    code: `ctx.setTransform(dpr,0,0,dpr,0,0);
const cw = canvas.width / dpr, ch = canvas.height / dpr;
const N = 140;
const ps = Array.from({length:N}, () => ({
  x: Math.random()*cw, y: Math.random()*ch, vx:0, vy:0, s: 1 + Math.random()*3
}));
const mouse = { x: cw/2, y: ch/2 };
function onMove(e){
  const r = canvas.getBoundingClientRect();
  mouse.x = (e.clientX - r.left); mouse.y = (e.clientY - r.top);
}
canvas.addEventListener('mousemove', onMove);
let raf;
function step(){
  ctx.fillStyle = 'rgba(2,6,23,0.18)'; ctx.fillRect(0,0,cw,ch);
  for (const p of ps){
    const dx = mouse.x - p.x, dy = mouse.y - p.y;
    const d = Math.hypot(dx,dy) + 0.001;
    const f = Math.min(220/d, 2.2);
    p.vx += (dx/d)*f*0.02; p.vy += (dy/d)*f*0.02;
    p.vx *= 0.92; p.vy *= 0.92;
    p.x += p.vx; p.y += p.vy;
    ctx.fillStyle = 'rgba(14,165,233,0.9)';
    ctx.beginPath(); ctx.arc(p.x,p.y,p.s,0,Math.PI*2); ctx.fill();
  }
  raf = requestAnimationFrame(step);
}
step();
return () => { cancelAnimationFrame(raf); canvas.removeEventListener('mousemove', onMove); };
`
  },
  {
    id: 'lissajous',
    category: '2d',
    contextType: '2d',
    title: 'Lissajous Curves',
    code: `ctx.setTransform(dpr,0,0,dpr,0,0);
const cw = canvas.width / dpr, ch = canvas.height / dpr;
const cx = cw/2, cy = ch/2, R = Math.min(cw,ch)*0.42;
let t = 0, raf;
function draw(){
  t += 0.009;
  ctx.fillStyle = 'rgba(2,6,23,0.12)'; ctx.fillRect(0,0,cw,ch);
  ctx.beginPath();
  const a = 3, b = 4;
  for (let i = 0; i <= 400; i++){
    const th = i/400 * Math.PI * 2;
    const x = cx + R * Math.sin(a*th + t);
    const y = cy + R * Math.sin(b*th);
    i === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
  }
  ctx.strokeStyle = 'hsl(' + ((t*40)%360) + ',80%,65%)';
  ctx.lineWidth = 2; ctx.stroke();
  raf = requestAnimationFrame(draw);
}
draw();
return () => cancelAnimationFrame(raf);
`
  },
  {
    id: 'starfield',
    category: '2d',
    contextType: '2d',
    title: 'Starfield Warp',
    code: `ctx.setTransform(dpr,0,0,dpr,0,0);
const cw = canvas.width / dpr, ch = canvas.height / dpr;
const cx = cw/2, cy = ch/2;
const stars = Array.from({length: 400}, () => ({
  x: (Math.random()-0.5) * cw, y: (Math.random()-0.5) * ch, z: Math.random() * cw
}));
let raf;
function step(){
  ctx.fillStyle = 'rgba(2,6,23,0.35)'; ctx.fillRect(0,0,cw,ch);
  for (const s of stars){
    s.z -= 3;
    if (s.z <= 0){ s.x = (Math.random()-0.5) * cw; s.y = (Math.random()-0.5) * ch; s.z = cw; }
    const k = 128 / s.z;
    const px = s.x * k + cx, py = s.y * k + cy;
    if (px < 0 || px >= cw || py < 0 || py >= ch) continue;
    const size = (1 - s.z / cw) * 2.5;
    ctx.fillStyle = 'rgba(255,255,255,' + (1 - s.z/cw) + ')';
    ctx.fillRect(px, py, size, size);
  }
  raf = requestAnimationFrame(step);
}
step();
return () => cancelAnimationFrame(raf);
`
  },
  {
    id: 'fireworks',
    category: '2d',
    contextType: '2d',
    title: 'Fireworks',
    code: `ctx.setTransform(dpr,0,0,dpr,0,0);
const cw = canvas.width / dpr, ch = canvas.height / dpr;
const parts = [];
function burst(x, y){
  const hue = Math.random()*360;
  for (let i = 0; i < 80; i++){
    const a = Math.random() * Math.PI * 2;
    const sp = 1 + Math.random() * 4;
    parts.push({ x, y, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp, life: 1, hue });
  }
}
let raf, last = 0;
function step(t){
  if (t - last > 700){ last = t; burst(Math.random()*cw, Math.random()*ch*0.6); }
  ctx.fillStyle = 'rgba(2,6,23,0.18)'; ctx.fillRect(0,0,cw,ch);
  for (let i = parts.length - 1; i >= 0; i--){
    const p = parts[i];
    p.vy += 0.04; p.x += p.vx; p.y += p.vy; p.life -= 0.012;
    if (p.life <= 0){ parts.splice(i,1); continue; }
    ctx.fillStyle = 'hsla(' + p.hue + ',90%,60%,' + p.life + ')';
    ctx.fillRect(p.x, p.y, 2, 2);
  }
  raf = requestAnimationFrame(step);
}
raf = requestAnimationFrame(step);
return () => cancelAnimationFrame(raf);
`
  },
  {
    id: 'life',
    category: '2d',
    contextType: '2d',
    title: "Conway's Game of Life",
    code: `ctx.setTransform(dpr,0,0,dpr,0,0);
const cw = canvas.width / dpr, ch = canvas.height / dpr;
const cell = 6;
const cols = Math.floor(cw / cell), rows = Math.floor(ch / cell);
let grid = new Uint8Array(cols * rows);
for (let i = 0; i < grid.length; i++) grid[i] = Math.random() < 0.25 ? 1 : 0;
function idx(x,y){ return ((y+rows)%rows)*cols + (x+cols)%cols; }
let raf, acc = 0, last = performance.now();
function tick(){
  const next = new Uint8Array(grid.length);
  for (let y = 0; y < rows; y++){
    for (let x = 0; x < cols; x++){
      let n = 0;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++)
          if (dx || dy) n += grid[idx(x+dx, y+dy)];
      const alive = grid[idx(x,y)] === 1;
      next[idx(x,y)] = (alive && (n === 2 || n === 3)) || (!alive && n === 3) ? 1 : 0;
    }
  }
  grid = next;
}
function draw(now){
  acc += now - last; last = now;
  if (acc > 80){ tick(); acc = 0; }
  ctx.fillStyle = '#02060e'; ctx.fillRect(0,0,cw,ch);
  ctx.fillStyle = '#22d3ee';
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++)
      if (grid[idx(x,y)]) ctx.fillRect(x*cell, y*cell, cell-1, cell-1);
  raf = requestAnimationFrame(draw);
}
raf = requestAnimationFrame(draw);
return () => cancelAnimationFrame(raf);
`
  },
  {
    id: 'mandelbrot',
    category: '2d',
    contextType: '2d',
    title: 'Mandelbrot (static)',
    code: `const w = canvas.width, h = canvas.height;
const img = ctx.createImageData(w, h);
const data = img.data;
const maxIter = 80;
const cxMin = -2.2, cxMax = 1.0, cyMin = -1.2, cyMax = 1.2;
for (let py = 0; py < h; py++){
  const y0 = cyMin + (cyMax - cyMin) * py / h;
  for (let px = 0; px < w; px++){
    const x0 = cxMin + (cxMax - cxMin) * px / w;
    let x = 0, y = 0, i = 0;
    while (x*x + y*y < 4 && i < maxIter){
      const xt = x*x - y*y + x0;
      y = 2*x*y + y0; x = xt; i++;
    }
    const off = (py * w + px) * 4;
    if (i === maxIter){ data[off]=0; data[off+1]=0; data[off+2]=0; }
    else {
      const t = i / maxIter;
      data[off]   = 9*(1-t)*t*t*t*255 | 0;
      data[off+1] = 15*(1-t)*(1-t)*t*t*255 | 0;
      data[off+2] = 8.5*(1-t)*(1-t)*(1-t)*t*255 | 0;
    }
    data[off+3] = 255;
  }
}
ctx.putImageData(img, 0, 0);
`
  },
  {
    id: 'paint',
    category: '2d',
    contextType: '2d',
    title: 'Paint Trail',
    code: `ctx.setTransform(dpr,0,0,dpr,0,0);
const cw = canvas.width / dpr, ch = canvas.height / dpr;
ctx.fillStyle = '#02060e'; ctx.fillRect(0,0,cw,ch);
let down = false, last = null, hue = 200;
function pos(e){
  const r = canvas.getBoundingClientRect();
  const t = e.touches ? e.touches[0] : e;
  return { x: t.clientX - r.left, y: t.clientY - r.top };
}
function start(e){ down = true; last = pos(e); }
function move(e){
  if (!down) return;
  const p = pos(e);
  hue = (hue + 2) % 360;
  ctx.strokeStyle = 'hsl(' + hue + ',80%,60%)';
  ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(last.x,last.y); ctx.lineTo(p.x,p.y); ctx.stroke();
  last = p;
  e.preventDefault && e.preventDefault();
}
function end(){ down = false; last = null; }
canvas.addEventListener('mousedown', start);
canvas.addEventListener('mousemove', move);
canvas.addEventListener('mouseup', end);
canvas.addEventListener('mouseleave', end);
canvas.addEventListener('touchstart', start, { passive: false });
canvas.addEventListener('touchmove', move, { passive: false });
canvas.addEventListener('touchend', end);
ctx.fillStyle = 'rgba(255,255,255,0.6)';
ctx.font = '14px system-ui';
ctx.fillText('Click and drag to paint', 16, 24);
return () => {
  canvas.removeEventListener('mousedown', start);
  canvas.removeEventListener('mousemove', move);
  canvas.removeEventListener('mouseup', end);
  canvas.removeEventListener('mouseleave', end);
  canvas.removeEventListener('touchstart', start);
  canvas.removeEventListener('touchmove', move);
  canvas.removeEventListener('touchend', end);
};
`
  },
  {
    id: 'verlet-cloth',
    category: '2d',
    contextType: '2d',
    title: 'Verlet Cloth (drag)',
    code: `// Verlet-integrated cloth. Drag any node with the mouse to tug the fabric.
ctx.setTransform(dpr,0,0,dpr,0,0);
const cw = canvas.width / dpr, ch = canvas.height / dpr;
const COLS = 26, ROWS = 18;
const spacing = Math.min((cw - 80) / (COLS - 1), (ch - 100) / (ROWS - 1));
const ox = (cw - (COLS - 1) * spacing) / 2;
const oy = 30;

// pinned top row
const points = [];
for (let y = 0; y < ROWS; y++){
  for (let x = 0; x < COLS; x++){
    const px = ox + x * spacing, py = oy + y * spacing;
    points.push({ x: px, y: py, px, py, pinned: y === 0 && (x % 4 === 0 || x === COLS - 1) });
  }
}
function idx(x, y){ return y * COLS + x; }
const sticks = [];
for (let y = 0; y < ROWS; y++){
  for (let x = 0; x < COLS; x++){
    if (x < COLS - 1) sticks.push({ a: idx(x,y), b: idx(x+1,y), len: spacing });
    if (y < ROWS - 1) sticks.push({ a: idx(x,y), b: idx(x,y+1), len: spacing });
  }
}

const gravity = 0.35, friction = 0.992;
let dragIdx = -1, dragPos = { x: 0, y: 0 };

function localPos(e){
  const r = canvas.getBoundingClientRect();
  const t = e.touches ? e.touches[0] : e;
  return { x: t.clientX - r.left, y: t.clientY - r.top };
}
function onDown(e){
  const p = localPos(e);
  let best = -1, bestD = 20 * 20;
  for (let i = 0; i < points.length; i++){
    const dx = p.x - points[i].x, dy = p.y - points[i].y;
    const d = dx*dx + dy*dy;
    if (d < bestD){ bestD = d; best = i; }
  }
  dragIdx = best;
  if (dragIdx >= 0){ dragPos = p; e.preventDefault && e.preventDefault(); }
}
function onMove(e){ if (dragIdx < 0) return; dragPos = localPos(e); e.preventDefault && e.preventDefault(); }
function onUp(){ dragIdx = -1; }
canvas.addEventListener('mousedown', onDown);
canvas.addEventListener('mousemove', onMove);
canvas.addEventListener('mouseup', onUp);
canvas.addEventListener('mouseleave', onUp);
canvas.addEventListener('touchstart', onDown, { passive: false });
canvas.addEventListener('touchmove', onMove, { passive: false });
canvas.addEventListener('touchend', onUp);

let raf;
function step(){
  for (const p of points){
    if (p.pinned) continue;
    const vx = (p.x - p.px) * friction;
    const vy = (p.y - p.py) * friction;
    p.px = p.x; p.py = p.y;
    p.x += vx; p.y += vy + gravity;
  }
  // Pull the dragged point toward the cursor strongly
  if (dragIdx >= 0){
    const p = points[dragIdx];
    p.x = dragPos.x; p.y = dragPos.y;
    p.px = p.x; p.py = p.y;
  }
  // Relax constraints iteratively
  for (let k = 0; k < 5; k++){
    for (const s of sticks){
      const a = points[s.a], b = points[s.b];
      const dx = b.x - a.x, dy = b.y - a.y;
      const d = Math.hypot(dx, dy) || 0.0001;
      const diff = (d - s.len) / d * 0.5;
      const ox_ = dx * diff, oy_ = dy * diff;
      if (!a.pinned){ a.x += ox_; a.y += oy_; }
      if (!b.pinned){ b.x -= ox_; b.y -= oy_; }
    }
  }

  ctx.fillStyle = '#02060e'; ctx.fillRect(0,0,cw,ch);
  ctx.strokeStyle = 'rgba(34,211,238,0.7)'; ctx.lineWidth = 1;
  ctx.beginPath();
  for (const s of sticks){
    const a = points[s.a], b = points[s.b];
    ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
  }
  ctx.stroke();
  ctx.fillStyle = '#f472b6';
  for (const p of points){ if (p.pinned){ ctx.fillRect(p.x-2, p.y-2, 4, 4); } }
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = '13px system-ui';
  ctx.fillText('Drag any thread to pull the cloth', 16, 22);

  raf = requestAnimationFrame(step);
}
step();
return () => {
  cancelAnimationFrame(raf);
  canvas.removeEventListener('mousedown', onDown);
  canvas.removeEventListener('mousemove', onMove);
  canvas.removeEventListener('mouseup', onUp);
  canvas.removeEventListener('mouseleave', onUp);
  canvas.removeEventListener('touchstart', onDown);
  canvas.removeEventListener('touchmove', onMove);
  canvas.removeEventListener('touchend', onUp);
};
`
  },
  {
    id: 'webgl-clear',
    category: 'webgl',
    contextType: 'webgl',
    title: 'WebGL Clear Pulse',
    code: `const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
if (!gl) throw new Error('WebGL not supported');
let t = 0, raf;
function frame(){
  t += 0.012;
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.5 + 0.5*Math.sin(t), 0.5 + 0.5*Math.sin(t + 2), 0.5 + 0.5*Math.sin(t + 4), 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  raf = requestAnimationFrame(frame);
}
frame();
return () => cancelAnimationFrame(raf);
`
  },
  {
    id: 'webgl-triangle',
    category: 'webgl',
    contextType: 'webgl',
    title: 'WebGL Rotating Triangle',
    code: `const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
if (!gl) throw new Error('WebGL not supported');
const vs = \`
attribute vec2 aPos;
attribute vec3 aColor;
varying vec3 vColor;
uniform float uTime;
void main(){
  float a = uTime;
  mat2 R = mat2(cos(a), -sin(a), sin(a), cos(a));
  gl_Position = vec4(R * aPos, 0.0, 1.0);
  vColor = aColor;
}\`;
const fs = \`
precision mediump float;
varying vec3 vColor;
void main(){ gl_FragColor = vec4(vColor, 1.0); }\`;
function compile(type, src){
  const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}
const prog = gl.createProgram();
gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
gl.linkProgram(prog);
if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
gl.useProgram(prog);
const verts = new Float32Array([
   0.0,  0.8,  1, 0, 0,
  -0.8, -0.8,  0, 1, 0,
   0.8, -0.8,  0, 0, 1,
]);
const buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
const aPos = gl.getAttribLocation(prog, 'aPos');
const aColor = gl.getAttribLocation(prog, 'aColor');
const uTime = gl.getUniformLocation(prog, 'uTime');
const FS = 4; const stride = 5 * FS;
gl.enableVertexAttribArray(aPos);
gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, stride, 0);
gl.enableVertexAttribArray(aColor);
gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, stride, 2 * FS);
let t = 0, raf;
function draw(){
  t += 0.012;
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.02, 0.04, 0.10, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniform1f(uTime, t);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  raf = requestAnimationFrame(draw);
}
draw();
return () => { cancelAnimationFrame(raf); gl.deleteBuffer(buf); gl.deleteProgram(prog); };
`
  },
  {
    id: 'webgl-gradient',
    category: 'webgl',
    contextType: 'webgl',
    title: 'WebGL Shader Gradient',
    code: `const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
if (!gl) throw new Error('WebGL not supported');
const vs = \`attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }\`;
const fs = \`
precision highp float;
uniform float uTime;
uniform vec2  uRes;
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec3 col = 0.5 + 0.5 * cos(uTime + uv.xyx * 6.28318 + vec3(0.0, 2.0, 4.0));
  gl_FragColor = vec4(col, 1.0);
}\`;
function compile(t, s){ const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); return sh; }
const prog = gl.createProgram();
gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
gl.linkProgram(prog); gl.useProgram(prog);
const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
const p = gl.getAttribLocation(prog, 'p');
gl.enableVertexAttribArray(p); gl.vertexAttribPointer(p, 2, gl.FLOAT, false, 0, 0);
const uTime = gl.getUniformLocation(prog, 'uTime');
const uRes = gl.getUniformLocation(prog, 'uRes');
let t = 0, raf;
function draw(){
  t += 0.012;
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.uniform1f(uTime, t);
  gl.uniform2f(uRes, canvas.width, canvas.height);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  raf = requestAnimationFrame(draw);
}
draw();
return () => { cancelAnimationFrame(raf); gl.deleteBuffer(buf); gl.deleteProgram(prog); };
`
  },
  {
    id: 'double-pendulum',
    category: '2d',
    contextType: '2d',
    title: 'Double Pendulum (drag)',
    code: `// Drag anywhere to set the pendulum pose. Release to let physics take over.
ctx.setTransform(dpr,0,0,dpr,0,0);
const cw = canvas.width / dpr, ch = canvas.height / dpr;
const ox = cw/2, oy = ch*0.30;
const L1 = Math.min(cw,ch)*0.20, L2 = Math.min(cw,ch)*0.20;
const m1 = 10, m2 = 10, g = 0.6;       // gentler gravity → slower motion
const dt = 0.022;                       // smaller integration step → smoother
let a1 = Math.PI*0.85, a2 = Math.PI*0.85, v1 = 0, v2 = 0;
const trail = [];
let dragging = false;

function pose(tx, ty){
  // Two-link inverse kinematics: solve for a1, a2 so the second bob is at (tx, ty).
  const dx = tx - ox, dy = ty - oy;
  const D = Math.max(Math.abs(L1-L2)+1, Math.min(L1+L2-1, Math.hypot(dx, dy)));
  const cosB = (L1*L1 + L2*L2 - D*D) / (2*L1*L2);
  const B = Math.acos(Math.max(-1, Math.min(1, cosB)));
  const cosA = (L1*L1 + D*D - L2*L2) / (2*L1*D);
  const A = Math.acos(Math.max(-1, Math.min(1, cosA)));
  const psi = Math.atan2(dx, dy);
  a1 = psi - A; a2 = a1 + (Math.PI - B);
  v1 = 0; v2 = 0; trail.length = 0;
}

function localPos(e){
  const r = canvas.getBoundingClientRect();
  const t = e.touches ? e.touches[0] : e;
  return { x: t.clientX - r.left, y: t.clientY - r.top };
}
function onDown(e){ dragging = true; const p = localPos(e); pose(p.x, p.y); e.preventDefault && e.preventDefault(); }
function onMove(e){ if (!dragging) return; const p = localPos(e); pose(p.x, p.y); e.preventDefault && e.preventDefault(); }
function onUp(){ dragging = false; }
canvas.addEventListener('mousedown', onDown);
canvas.addEventListener('mousemove', onMove);
canvas.addEventListener('mouseup', onUp);
canvas.addEventListener('mouseleave', onUp);
canvas.addEventListener('touchstart', onDown, { passive: false });
canvas.addEventListener('touchmove', onMove, { passive: false });
canvas.addEventListener('touchend', onUp);

let raf;
function step(){
  if (!dragging){
    const num1 = -g*(2*m1+m2)*Math.sin(a1) - m2*g*Math.sin(a1-2*a2)
               - 2*Math.sin(a1-a2)*m2*(v2*v2*L2 + v1*v1*L1*Math.cos(a1-a2));
    const den1 = L1*(2*m1+m2 - m2*Math.cos(2*a1-2*a2));
    const num2 = 2*Math.sin(a1-a2)*(v1*v1*L1*(m1+m2) + g*(m1+m2)*Math.cos(a1)
               + v2*v2*L2*m2*Math.cos(a1-a2));
    const den2 = L2*(2*m1+m2 - m2*Math.cos(2*a1-2*a2));
    v1 += num1/den1; v2 += num2/den2;
    v1 *= 0.9995; v2 *= 0.9995;          // tiny damping
    a1 += v1*dt; a2 += v2*dt;
  }
  const x1 = ox + L1*Math.sin(a1), y1 = oy + L1*Math.cos(a1);
  const x2 = x1 + L2*Math.sin(a2), y2 = y1 + L2*Math.cos(a2);
  trail.push([x2,y2]); if (trail.length > 600) trail.shift();
  ctx.fillStyle = 'rgba(2,6,23,0.18)'; ctx.fillRect(0,0,cw,ch);
  ctx.strokeStyle = 'rgba(244,114,182,0.5)'; ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < trail.length; i++){
    const [tx,ty] = trail[i];
    i === 0 ? ctx.moveTo(tx,ty) : ctx.lineTo(tx,ty);
  }
  ctx.stroke();
  ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(ox,oy); ctx.lineTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  ctx.fillStyle = '#22d3ee'; ctx.beginPath(); ctx.arc(x1,y1,8,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#a855f7'; ctx.beginPath(); ctx.arc(x2,y2,10,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = '13px system-ui'; ctx.fillText('Drag anywhere to set the pose', 16, 22);
  raf = requestAnimationFrame(step);
}
step();
return () => {
  cancelAnimationFrame(raf);
  canvas.removeEventListener('mousedown', onDown);
  canvas.removeEventListener('mousemove', onMove);
  canvas.removeEventListener('mouseup', onUp);
  canvas.removeEventListener('mouseleave', onUp);
  canvas.removeEventListener('touchstart', onDown);
  canvas.removeEventListener('touchmove', onMove);
  canvas.removeEventListener('touchend', onUp);
};
`
  },
  {
    id: 'matrix-rain',
    category: '2d',
    contextType: '2d',
    title: 'Matrix Rain',
    code: `ctx.setTransform(dpr,0,0,dpr,0,0);
const cw = canvas.width / dpr, ch = canvas.height / dpr;
const fs = 16;
const cols = Math.floor(cw / fs);
const drops = new Array(cols).fill(0).map(() => Math.random() * ch / fs);
const chars = 'アイウエオカキクケコｱｲｳｴｵ01ABCDEF<>/$#';
ctx.font = fs + 'px ui-monospace, Menlo, Consolas, monospace';
const STEP_MS = 70;  // advance rain on a fixed cadence so DPR/refresh rate don't accelerate it
let raf, last = performance.now();
function frame(now){
  raf = requestAnimationFrame(frame);
  if (now - last < STEP_MS) return;
  last = now;
  ctx.fillStyle = 'rgba(0,0,0,0.10)'; ctx.fillRect(0,0,cw,ch);
  for (let i = 0; i < cols; i++){
    const ch_ = chars[(Math.random() * chars.length) | 0];
    const x = i * fs;
    const y = drops[i] * fs;
    ctx.fillStyle = y < fs*2 ? '#e6fff5' : '#22c55e';
    ctx.fillText(ch_, x, y);
    if (y > ch && Math.random() > 0.975) drops[i] = 0;
    drops[i] += 1;
  }
}
raf = requestAnimationFrame(frame);
return () => cancelAnimationFrame(raf);
`
  },
  {
    id: 'wireframe-cube',
    category: '2d',
    contextType: '2d',
    title: 'Wireframe Cube (2D Projection)',
    code: `ctx.setTransform(dpr,0,0,dpr,0,0);
const cw = canvas.width / dpr, ch = canvas.height / dpr;
const cx = cw/2, cy = ch/2;
const v = [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];
const e = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
let t = 0, raf;
function project(p){
  const [x,y,z] = p; const d = 4;
  const k = d / (d - z);
  return [cx + x * k * Math.min(cw,ch) * 0.25, cy + y * k * Math.min(cw,ch) * 0.25];
}
function rot(p, ax, ay){
  let [x,y,z] = p;
  // rotate Y
  let xr = x*Math.cos(ay) + z*Math.sin(ay);
  let zr = -x*Math.sin(ay) + z*Math.cos(ay);
  x = xr; z = zr;
  // rotate X
  let yr = y*Math.cos(ax) - z*Math.sin(ax);
  zr = y*Math.sin(ax) + z*Math.cos(ax);
  y = yr; z = zr;
  return [x,y,z];
}
function draw(){
  t += 0.009;
  ctx.fillStyle = 'rgba(2,6,23,0.22)'; ctx.fillRect(0,0,cw,ch);
  const projected = v.map(p => project(rot(p, t*0.7, t)));
  ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2;
  for (const [a,b] of e){
    ctx.beginPath();
    ctx.moveTo(projected[a][0], projected[a][1]);
    ctx.lineTo(projected[b][0], projected[b][1]);
    ctx.stroke();
  }
  raf = requestAnimationFrame(draw);
}
draw();
return () => cancelAnimationFrame(raf);
`
  },
  {
    id: 'plasma',
    category: '2d',
    contextType: '2d',
    title: 'Plasma (ImageData)',
    code: `const w = canvas.width, h = canvas.height;
const img = ctx.createImageData(w, h);
const data = img.data;
let t = 0, raf;
function draw(){
  t += 0.024;
  for (let y = 0; y < h; y += 2){
    for (let x = 0; x < w; x += 2){
      const v = Math.sin(x*0.02 + t) + Math.sin((y*0.02) + t)
              + Math.sin((x+y)*0.015 + t)
              + Math.sin(Math.hypot(x-w/2,y-h/2)*0.02 - t);
      const r = (Math.sin(v*Math.PI)*0.5 + 0.5) * 255 | 0;
      const g = (Math.sin(v*Math.PI + 2)*0.5 + 0.5) * 255 | 0;
      const b = (Math.sin(v*Math.PI + 4)*0.5 + 0.5) * 255 | 0;
      for (let dy = 0; dy < 2; dy++){
        for (let dx = 0; dx < 2; dx++){
          const o = ((y+dy) * w + (x+dx)) * 4;
          data[o] = r; data[o+1] = g; data[o+2] = b; data[o+3] = 255;
        }
      }
    }
  }
  ctx.putImageData(img, 0, 0);
  raf = requestAnimationFrame(draw);
}
draw();
return () => cancelAnimationFrame(raf);
`
  },
  {
    id: 'l-system',
    category: '2d',
    contextType: '2d',
    title: 'L-System Tree',
    code: `ctx.setTransform(dpr,0,0,dpr,0,0);
const cw = canvas.width / dpr, ch = canvas.height / dpr;
ctx.fillStyle = '#02060e'; ctx.fillRect(0,0,cw,ch);
let axiom = 'F';
const rules = { 'F': 'FF+[+F-F-F]-[-F+F+F]' };
for (let i = 0; i < 4; i++){
  let next = '';
  for (const c of axiom) next += rules[c] || c;
  axiom = next;
}
const len = Math.min(cw,ch) * 0.012;
const angle = 25 * Math.PI / 180;
ctx.translate(cw/2, ch);
ctx.rotate(-Math.PI/2);
ctx.strokeStyle = '#9ee671'; ctx.lineWidth = 1;
const stack = [];
for (const c of axiom){
  if (c === 'F'){
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(len, 0); ctx.stroke();
    ctx.translate(len, 0);
  } else if (c === '+') ctx.rotate(angle);
  else if (c === '-') ctx.rotate(-angle);
  else if (c === '[') stack.push(ctx.getTransform());
  else if (c === ']') ctx.setTransform(stack.pop());
}
`
  },
  {
    id: 'webgl-interactive-light',
    category: 'webgl',
    contextType: 'webgl',
    title: 'WebGL Interactive Light (mouse)',
    code: `// Move the mouse over the canvas. A soft light follows the cursor.
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
if (!gl) throw new Error('WebGL not supported');
const vs = \`attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }\`;
const fs = \`
precision highp float;
uniform vec2  uRes;
uniform vec2  uMouse;
uniform float uTime;
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 m  = uMouse / uRes;
  float d = distance(uv, m);
  float light = exp(-d * 4.5) * 1.6;
  vec3 base = 0.5 + 0.5 * cos(uTime + uv.xyx * 6.2831 + vec3(0.0, 2.0, 4.0));
  gl_FragColor = vec4(base * (0.25 + light), 1.0);
}\`;
function compile(t, s){ const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); return sh; }
const prog = gl.createProgram();
gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
gl.linkProgram(prog); gl.useProgram(prog);
const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
const p = gl.getAttribLocation(prog, 'p');
gl.enableVertexAttribArray(p); gl.vertexAttribPointer(p, 2, gl.FLOAT, false, 0, 0);
const uRes = gl.getUniformLocation(prog, 'uRes');
const uMouse = gl.getUniformLocation(prog, 'uMouse');
const uTime = gl.getUniformLocation(prog, 'uTime');
let mx = canvas.width/2, my = canvas.height/2;
function onMove(e){
  const r = canvas.getBoundingClientRect();
  const t = e.touches ? e.touches[0] : e;
  // Flip Y because gl_FragCoord has origin at bottom-left.
  mx = (t.clientX - r.left) * (canvas.width / r.width);
  my = canvas.height - (t.clientY - r.top) * (canvas.height / r.height);
}
canvas.addEventListener('mousemove', onMove);
canvas.addEventListener('touchmove', onMove, { passive: true });
let t = 0, raf;
function draw(){
  t += 0.012;
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.uniform2f(uRes, canvas.width, canvas.height);
  gl.uniform2f(uMouse, mx, my);
  gl.uniform1f(uTime, t);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  raf = requestAnimationFrame(draw);
}
draw();
return () => {
  cancelAnimationFrame(raf);
  canvas.removeEventListener('mousemove', onMove);
  canvas.removeEventListener('touchmove', onMove);
  gl.deleteBuffer(buf); gl.deleteProgram(prog);
};
`
  },
  {
    id: 'webgl-mandelbrot',
    category: 'webgl',
    contextType: 'webgl',
    title: 'WebGL Mandelbrot (Shader)',
    code: `const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
if (!gl) throw new Error('WebGL not supported');
const vs = \`attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }\`;
const fs = \`
precision highp float;
uniform vec2  uRes;
uniform float uTime;
void main(){
  vec2 uv = (gl_FragCoord.xy / uRes) * 2.0 - 1.0;
  uv.x *= uRes.x / uRes.y;
  float zoom = 1.2 + 0.6 * sin(uTime * 0.2);
  vec2 c = uv * zoom + vec2(-0.5, 0.0);
  vec2 z = vec2(0.0);
  float it = 0.0;
  const float MAX = 120.0;
  for (float i = 0.0; i < 120.0; i++){
    z = vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y) + c;
    if (dot(z,z) > 4.0) break;
    it = i;
  }
  float t = it / MAX;
  vec3 col = 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.66)));
  if (it == MAX - 1.0) col = vec3(0.0);
  gl_FragColor = vec4(col, 1.0);
}\`;
function compile(t, s){ const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); return sh; }
const prog = gl.createProgram();
gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
gl.linkProgram(prog); gl.useProgram(prog);
const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
const p = gl.getAttribLocation(prog, 'p');
gl.enableVertexAttribArray(p); gl.vertexAttribPointer(p, 2, gl.FLOAT, false, 0, 0);
const uRes = gl.getUniformLocation(prog, 'uRes');
const uTime = gl.getUniformLocation(prog, 'uTime');
let t = 0, raf;
function draw(){
  t += 0.012;
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.uniform2f(uRes, canvas.width, canvas.height);
  gl.uniform1f(uTime, t);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  raf = requestAnimationFrame(draw);
}
draw();
return () => { cancelAnimationFrame(raf); gl.deleteBuffer(buf); gl.deleteProgram(prog); };
`
  },
  {
    id: 'webgl-raymarch',
    category: 'webgl',
    contextType: 'webgl',
    title: 'WebGL Raymarched Scene',
    code: `// A tiny raymarcher — two spheres lit by the cursor.
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
if (!gl) throw new Error('WebGL not supported');
const vs = \`attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }\`;
const fs = \`
precision highp float;
uniform vec2  uRes;
uniform vec2  uMouse;
uniform float uTime;

float sdSphere(vec3 p, float r){ return length(p) - r; }
float scene(vec3 p){
  float a = sdSphere(p, 1.0);
  float b = sdSphere(p - vec3(sin(uTime)*1.6, cos(uTime*0.8)*0.6, cos(uTime)*1.6), 0.6);
  return min(a, b);
}
vec3 calcNormal(vec3 p){
  vec2 e = vec2(0.001, 0.0);
  return normalize(vec3(
    scene(p + e.xyy) - scene(p - e.xyy),
    scene(p + e.yxy) - scene(p - e.yxy),
    scene(p + e.yyx) - scene(p - e.yyx)
  ));
}
void main(){
  vec2 uv = (gl_FragCoord.xy / uRes) * 2.0 - 1.0;
  uv.x *= uRes.x / uRes.y;
  vec3 ro = vec3(0.0, 0.0, -4.0);
  vec3 rd = normalize(vec3(uv, 1.5));
  float t = 0.0; bool hit = false;
  for (int i = 0; i < 80; i++){
    vec3 p = ro + rd * t;
    float d = scene(p);
    if (d < 0.001){ hit = true; break; }
    t += d;
    if (t > 20.0) break;
  }
  vec3 col = vec3(0.04, 0.05, 0.10);
  if (hit){
    vec3 p = ro + rd * t;
    vec3 n = calcNormal(p);
    vec2 m = (uMouse / uRes) * 2.0 - 1.0;
    vec3 ldir = normalize(vec3(m.x * 1.5, m.y * 1.5, -1.0));
    float diff = max(dot(n, -ldir), 0.0);
    float spec = pow(max(dot(reflect(-ldir, n), -rd), 0.0), 32.0);
    col = vec3(0.20, 0.55, 0.95) * (0.15 + diff * 0.85) + vec3(spec);
  }
  gl_FragColor = vec4(col, 1.0);
}\`;
function compile(t, s){ const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); return sh; }
const prog = gl.createProgram();
gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
gl.linkProgram(prog); gl.useProgram(prog);
const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
const p = gl.getAttribLocation(prog, 'p');
gl.enableVertexAttribArray(p); gl.vertexAttribPointer(p, 2, gl.FLOAT, false, 0, 0);
const uRes = gl.getUniformLocation(prog, 'uRes');
const uMouse = gl.getUniformLocation(prog, 'uMouse');
const uTime = gl.getUniformLocation(prog, 'uTime');
let mx = canvas.width*0.7, my = canvas.height*0.7;
function onMove(e){
  const r = canvas.getBoundingClientRect();
  const t = e.touches ? e.touches[0] : e;
  mx = (t.clientX - r.left) * (canvas.width / r.width);
  my = canvas.height - (t.clientY - r.top) * (canvas.height / r.height);
}
canvas.addEventListener('mousemove', onMove);
canvas.addEventListener('touchmove', onMove, { passive: true });
let t = 0, raf;
function draw(){
  t += 0.009;
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.uniform2f(uRes, canvas.width, canvas.height);
  gl.uniform2f(uMouse, mx, my);
  gl.uniform1f(uTime, t);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  raf = requestAnimationFrame(draw);
}
draw();
return () => {
  cancelAnimationFrame(raf);
  canvas.removeEventListener('mousemove', onMove);
  canvas.removeEventListener('touchmove', onMove);
  gl.deleteBuffer(buf); gl.deleteProgram(prog);
};
`
  },
  {
    id: 'webgl-stripes',
    category: 'webgl',
    contextType: 'webgl',
    title: 'WebGL Animated Stripes',
    code: `const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
if (!gl) throw new Error('WebGL not supported');
const vs = \`attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }\`;
const fs = \`
precision highp float;
uniform vec2  uRes;
uniform float uTime;
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float s = sin((uv.x + uv.y) * 30.0 + uTime * 2.0);
  vec3 a = vec3(0.13, 0.83, 0.74);
  vec3 b = vec3(0.65, 0.33, 0.97);
  gl_FragColor = vec4(mix(a, b, smoothstep(-0.1, 0.1, s)), 1.0);
}\`;
function compile(t, s){ const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); return sh; }
const prog = gl.createProgram();
gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
gl.linkProgram(prog); gl.useProgram(prog);
const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
const p = gl.getAttribLocation(prog, 'p');
gl.enableVertexAttribArray(p); gl.vertexAttribPointer(p, 2, gl.FLOAT, false, 0, 0);
const uRes = gl.getUniformLocation(prog, 'uRes');
const uTime = gl.getUniformLocation(prog, 'uTime');
let t = 0, raf;
function draw(){
  t += 0.012;
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.uniform2f(uRes, canvas.width, canvas.height);
  gl.uniform1f(uTime, t);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  raf = requestAnimationFrame(draw);
}
draw();
return () => { cancelAnimationFrame(raf); gl.deleteBuffer(buf); gl.deleteProgram(prog); };
`
  },
  {
    id: 'webgl-fbm',
    category: 'webgl',
    contextType: 'webgl',
    title: 'WebGL FBM Noise Clouds',
    code: `const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
if (!gl) throw new Error('WebGL not supported');
const vs = \`attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }\`;
const fs = \`
precision highp float;
uniform vec2  uRes;
uniform float uTime;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  float a = hash(i), b = hash(i+vec2(1.0,0.0)), c = hash(i+vec2(0.0,1.0)), d = hash(i+vec2(1.0,1.0));
  vec2 u = f*f*(3.0-2.0*f);
  return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
}
float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<6;i++){ v += a*noise(p); p *= 2.0; a *= 0.5; } return v; }
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  uv.x *= uRes.x / uRes.y;
  float n = fbm(uv*3.0 + vec2(uTime*0.1, 0.0));
  vec3 col = mix(vec3(0.02,0.06,0.18), vec3(0.95,0.98,1.0), smoothstep(0.3, 0.8, n));
  gl_FragColor = vec4(col, 1.0);
}\`;
function compile(t, s){ const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); return sh; }
const prog = gl.createProgram();
gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
gl.linkProgram(prog); gl.useProgram(prog);
const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
const p = gl.getAttribLocation(prog, 'p');
gl.enableVertexAttribArray(p); gl.vertexAttribPointer(p, 2, gl.FLOAT, false, 0, 0);
const uRes = gl.getUniformLocation(prog, 'uRes'), uTime = gl.getUniformLocation(prog, 'uTime');
let t = 0, raf;
function draw(){
  t += 0.012;
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.uniform2f(uRes, canvas.width, canvas.height);
  gl.uniform1f(uTime, t);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  raf = requestAnimationFrame(draw);
}
draw();
return () => { cancelAnimationFrame(raf); gl.deleteBuffer(buf); gl.deleteProgram(prog); };
`
  },
  {
    id: 'webgl-voronoi',
    category: 'webgl',
    contextType: 'webgl',
    title: 'WebGL Voronoi Cells',
    code: `const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
if (!gl) throw new Error('WebGL not supported');
const vs = \`attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }\`;
const fs = \`
precision highp float;
uniform vec2  uRes;
uniform float uTime;
vec2 hash2(vec2 p){ p = vec2(dot(p, vec2(127.1,311.7)), dot(p, vec2(269.5,183.3))); return fract(sin(p) * 43758.5453); }
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  uv.x *= uRes.x / uRes.y;
  vec2 p = uv * 8.0;
  vec2 ip = floor(p), fp = fract(p);
  float md = 8.0;
  for (int y = -1; y <= 1; y++){
    for (int x = -1; x <= 1; x++){
      vec2 g = vec2(float(x), float(y));
      vec2 o = hash2(ip + g);
      o = 0.5 + 0.5 * sin(uTime + 6.2831 * o);
      float d = length(g + o - fp);
      md = min(md, d);
    }
  }
  vec3 col = 0.5 + 0.5 * cos(6.2831 * (md + vec3(0.0, 0.33, 0.66)));
  gl_FragColor = vec4(col, 1.0);
}\`;
function compile(t, s){ const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); return sh; }
const prog = gl.createProgram();
gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
gl.linkProgram(prog); gl.useProgram(prog);
const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
const p = gl.getAttribLocation(prog, 'p');
gl.enableVertexAttribArray(p); gl.vertexAttribPointer(p, 2, gl.FLOAT, false, 0, 0);
const uRes = gl.getUniformLocation(prog, 'uRes'), uTime = gl.getUniformLocation(prog, 'uTime');
let t = 0, raf;
function draw(){
  t += 0.009;
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.uniform2f(uRes, canvas.width, canvas.height);
  gl.uniform1f(uTime, t);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  raf = requestAnimationFrame(draw);
}
draw();
return () => { cancelAnimationFrame(raf); gl.deleteBuffer(buf); gl.deleteProgram(prog); };
`
  },
  {
    id: 'webgl-warp',
    category: 'webgl',
    contextType: 'webgl',
    title: 'WebGL Domain Warping',
    code: `const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
if (!gl) throw new Error('WebGL not supported');
const vs = \`attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }\`;
const fs = \`
precision highp float;
uniform vec2  uRes;
uniform float uTime;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  float a = hash(i), b = hash(i+vec2(1.0,0.0)), c = hash(i+vec2(0.0,1.0)), d = hash(i+vec2(1.0,1.0));
  vec2 u = f*f*(3.0-2.0*f);
  return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
}
float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<5;i++){ v += a*noise(p); p *= 2.0; a *= 0.5; } return v; }
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  uv.x *= uRes.x / uRes.y;
  vec2 q = vec2(fbm(uv + vec2(0.0, uTime*0.05)), fbm(uv + vec2(5.2, 1.3)));
  vec2 r = vec2(fbm(uv + 4.0*q + vec2(1.7, 9.2)),
                fbm(uv + 4.0*q + vec2(8.3, 2.8) + uTime*0.10));
  float v = fbm(uv + 4.0*r);
  vec3 col = mix(vec3(0.10,0.04,0.30), vec3(0.95,0.55,0.20), v);
  col = mix(col, vec3(0.20,0.78,0.92), length(q));
  gl_FragColor = vec4(col, 1.0);
}\`;
function compile(t, s){ const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); return sh; }
const prog = gl.createProgram();
gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
gl.linkProgram(prog); gl.useProgram(prog);
const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
const p = gl.getAttribLocation(prog, 'p');
gl.enableVertexAttribArray(p); gl.vertexAttribPointer(p, 2, gl.FLOAT, false, 0, 0);
const uRes = gl.getUniformLocation(prog, 'uRes'), uTime = gl.getUniformLocation(prog, 'uTime');
let t = 0, raf;
function draw(){
  t += 0.009;
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.uniform2f(uRes, canvas.width, canvas.height);
  gl.uniform1f(uTime, t);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  raf = requestAnimationFrame(draw);
}
draw();
return () => { cancelAnimationFrame(raf); gl.deleteBuffer(buf); gl.deleteProgram(prog); };
`
  },
  {
    id: 'webgpu-triangle',
    category: 'webgpu',
    contextType: 'webgpu',
    title: 'WebGPU Triangle',
    code: `if (!navigator.gpu) throw new Error('WebGPU not supported');
const adapter = await navigator.gpu.requestAdapter();
if (!adapter) throw new Error('No GPU adapter');
const device = await adapter.requestDevice();
const context = canvas.getContext('webgpu');
const format = navigator.gpu.getPreferredCanvasFormat
  ? navigator.gpu.getPreferredCanvasFormat()
  : 'bgra8unorm';
context.configure({ device, format, alphaMode: 'opaque' });
const shader = device.createShaderModule({
  code: \`
@vertex
fn vs(@builtin(vertex_index) i: u32) -> @builtin(position) vec4<f32> {
  var p = array<vec2<f32>, 3>(vec2(-0.8,-0.8), vec2(0.8,-0.8), vec2(0.0,0.8));
  return vec4<f32>(p[i], 0.0, 1.0);
}
@fragment
fn fs() -> @location(0) vec4<f32> {
  return vec4<f32>(0.18, 0.78, 0.92, 1.0);
}\`
});
const pipeline = device.createRenderPipeline({
  layout: 'auto',
  vertex: { module: shader, entryPoint: 'vs' },
  fragment: { module: shader, entryPoint: 'fs', targets: [{ format }] },
  primitive: { topology: 'triangle-list' },
});
let raf;
function frame(){
  const enc = device.createCommandEncoder();
  const view = context.getCurrentTexture().createView();
  const pass = enc.beginRenderPass({
    colorAttachments: [{ view, clearValue: { r: 0.02, g: 0.04, b: 0.10, a: 1 }, loadOp: 'clear', storeOp: 'store' }]
  });
  pass.setPipeline(pipeline); pass.draw(3); pass.end();
  device.queue.submit([enc.finish()]);
  raf = requestAnimationFrame(frame);
}
frame();
return () => cancelAnimationFrame(raf);
`
  },
  {
    id: 'webgpu-light',
    category: 'webgpu',
    contextType: 'webgpu',
    title: 'WebGPU Interactive Light (mouse)',
    code: `// Move the mouse — a soft light follows the cursor (WebGPU + uniform buffer).
if (!navigator.gpu) throw new Error('WebGPU not supported');
const adapter = await navigator.gpu.requestAdapter();
if (!adapter) throw new Error('No GPU adapter');
const device = await adapter.requestDevice();
const context = canvas.getContext('webgpu');
const format = navigator.gpu.getPreferredCanvasFormat
  ? navigator.gpu.getPreferredCanvasFormat()
  : 'bgra8unorm';
context.configure({ device, format, alphaMode: 'opaque' });

const shader = device.createShaderModule({
  code: \`
struct U {
  res:   vec2<f32>,
  mouse: vec2<f32>,
  time:  f32,
};
@group(0) @binding(0) var<uniform> u: U;

@vertex
fn vs(@builtin(vertex_index) i: u32) -> @builtin(position) vec4<f32> {
  var p = array<vec2<f32>, 3>(vec2(-1.0,-1.0), vec2(3.0,-1.0), vec2(-1.0,3.0));
  return vec4<f32>(p[i], 0.0, 1.0);
}
@fragment
fn fs(@builtin(position) fc: vec4<f32>) -> @location(0) vec4<f32> {
  let uv = fc.xy / u.res;
  let m  = u.mouse / u.res;
  let d  = distance(uv, m);
  let light = exp(-d * 4.5) * 1.6;
  let base = 0.5 + 0.5 * cos(u.time + uv.xyx * 6.2831 + vec3<f32>(0.0, 2.0, 4.0));
  return vec4<f32>(base * (0.25 + light), 1.0);
}\`
});

const pipeline = device.createRenderPipeline({
  layout: 'auto',
  vertex:   { module: shader, entryPoint: 'vs' },
  fragment: { module: shader, entryPoint: 'fs', targets: [{ format }] },
  primitive: { topology: 'triangle-list' },
});

// Uniform layout: vec2 res (8) | vec2 mouse (8) | f32 time (4) | pad (12) → 32 bytes
const UBO_BYTES = 32;
const ubo = device.createBuffer({
  size: UBO_BYTES,
  usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});
const ubData = new Float32Array(UBO_BYTES / 4);

const bindGroup = device.createBindGroup({
  layout: pipeline.getBindGroupLayout(0),
  entries: [{ binding: 0, resource: { buffer: ubo } }],
});

let mx = canvas.width / 2, my = canvas.height / 2;
function onMove(e){
  const r = canvas.getBoundingClientRect();
  const t = e.touches ? e.touches[0] : e;
  mx = (t.clientX - r.left) * (canvas.width / r.width);
  // WGSL fragment coord origin matches canvas top-left in WebGPU; no Y flip needed.
  my = (t.clientY - r.top)  * (canvas.height / r.height);
}
canvas.addEventListener('mousemove', onMove);
canvas.addEventListener('touchmove', onMove, { passive: true });

let t = 0, raf;
function frame(){
  t += 0.012;
  ubData[0] = canvas.width;
  ubData[1] = canvas.height;
  ubData[2] = mx;
  ubData[3] = my;
  ubData[4] = t;
  device.queue.writeBuffer(ubo, 0, ubData.buffer, 0, UBO_BYTES);
  const enc = device.createCommandEncoder();
  const view = context.getCurrentTexture().createView();
  const pass = enc.beginRenderPass({
    colorAttachments: [{ view, clearValue: { r: 0, g: 0, b: 0, a: 1 }, loadOp: 'clear', storeOp: 'store' }]
  });
  pass.setPipeline(pipeline);
  pass.setBindGroup(0, bindGroup);
  pass.draw(3); pass.end();
  device.queue.submit([enc.finish()]);
  raf = requestAnimationFrame(frame);
}
frame();
return () => {
  cancelAnimationFrame(raf);
  canvas.removeEventListener('mousemove', onMove);
  canvas.removeEventListener('touchmove', onMove);
};
`
  },
  {
    id: 'webgpu-raymarch',
    category: 'webgpu',
    contextType: 'webgpu',
    title: 'WebGPU Raymarched Scene',
    code: `// WebGPU raymarcher — two spheres, cursor-controlled light.
if (!navigator.gpu) throw new Error('WebGPU not supported');
const adapter = await navigator.gpu.requestAdapter();
if (!adapter) throw new Error('No GPU adapter');
const device = await adapter.requestDevice();
const context = canvas.getContext('webgpu');
const format = navigator.gpu.getPreferredCanvasFormat
  ? navigator.gpu.getPreferredCanvasFormat()
  : 'bgra8unorm';
context.configure({ device, format, alphaMode: 'opaque' });

const shader = device.createShaderModule({
  code: \`
struct U {
  res:   vec2<f32>,
  mouse: vec2<f32>,
  time:  f32,
};
@group(0) @binding(0) var<uniform> u: U;

fn sdSphere(p: vec3<f32>, r: f32) -> f32 { return length(p) - r; }
fn scene(p: vec3<f32>) -> f32 {
  let a = sdSphere(p, 1.0);
  let b = sdSphere(p - vec3<f32>(sin(u.time)*1.6, cos(u.time*0.8)*0.6, cos(u.time)*1.6), 0.6);
  return min(a, b);
}
fn calcNormal(p: vec3<f32>) -> vec3<f32> {
  let e = vec2<f32>(0.001, 0.0);
  return normalize(vec3<f32>(
    scene(p + e.xyy) - scene(p - e.xyy),
    scene(p + e.yxy) - scene(p - e.yxy),
    scene(p + e.yyx) - scene(p - e.yyx),
  ));
}

@vertex
fn vs(@builtin(vertex_index) i: u32) -> @builtin(position) vec4<f32> {
  var p = array<vec2<f32>, 3>(vec2(-1.0,-1.0), vec2(3.0,-1.0), vec2(-1.0,3.0));
  return vec4<f32>(p[i], 0.0, 1.0);
}
@fragment
fn fs(@builtin(position) fc: vec4<f32>) -> @location(0) vec4<f32> {
  // Match WebGL convention: bottom-left origin for the math below.
  let uv0 = fc.xy / u.res;
  var uv = uv0 * 2.0 - vec2<f32>(1.0, 1.0);
  uv.y = -uv.y;
  uv.x = uv.x * (u.res.x / u.res.y);

  let ro = vec3<f32>(0.0, 0.0, -4.0);
  let rd = normalize(vec3<f32>(uv, 1.5));
  var t: f32 = 0.0; var hit: bool = false;
  for (var i: i32 = 0; i < 80; i = i + 1) {
    let p = ro + rd * t;
    let d = scene(p);
    if (d < 0.001) { hit = true; break; }
    t = t + d;
    if (t > 20.0) { break; }
  }
  var col = vec3<f32>(0.04, 0.05, 0.10);
  if (hit) {
    let p = ro + rd * t;
    let n = calcNormal(p);
    var m = (u.mouse / u.res) * 2.0 - vec2<f32>(1.0, 1.0);
    m.y = -m.y;
    let ldir = normalize(vec3<f32>(m.x * 1.5, m.y * 1.5, -1.0));
    let diff = max(dot(n, -ldir), 0.0);
    let spec = pow(max(dot(reflect(-ldir, n), -rd), 0.0), 32.0);
    col = vec3<f32>(0.20, 0.55, 0.95) * (0.15 + diff * 0.85) + vec3<f32>(spec);
  }
  return vec4<f32>(col, 1.0);
}\`
});

const pipeline = device.createRenderPipeline({
  layout: 'auto',
  vertex:   { module: shader, entryPoint: 'vs' },
  fragment: { module: shader, entryPoint: 'fs', targets: [{ format }] },
  primitive: { topology: 'triangle-list' },
});
const UBO_BYTES = 32;
const ubo = device.createBuffer({
  size: UBO_BYTES,
  usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});
const ubData = new Float32Array(UBO_BYTES / 4);
const bindGroup = device.createBindGroup({
  layout: pipeline.getBindGroupLayout(0),
  entries: [{ binding: 0, resource: { buffer: ubo } }],
});

let mx = canvas.width * 0.7, my = canvas.height * 0.3;
function onMove(e){
  const r = canvas.getBoundingClientRect();
  const t = e.touches ? e.touches[0] : e;
  mx = (t.clientX - r.left) * (canvas.width / r.width);
  my = (t.clientY - r.top)  * (canvas.height / r.height);
}
canvas.addEventListener('mousemove', onMove);
canvas.addEventListener('touchmove', onMove, { passive: true });

let t = 0, raf;
function frame(){
  t += 0.009;
  ubData[0] = canvas.width; ubData[1] = canvas.height;
  ubData[2] = mx;           ubData[3] = my;
  ubData[4] = t;
  device.queue.writeBuffer(ubo, 0, ubData.buffer, 0, UBO_BYTES);
  const enc = device.createCommandEncoder();
  const view = context.getCurrentTexture().createView();
  const pass = enc.beginRenderPass({
    colorAttachments: [{ view, clearValue: { r: 0, g: 0, b: 0, a: 1 }, loadOp: 'clear', storeOp: 'store' }]
  });
  pass.setPipeline(pipeline);
  pass.setBindGroup(0, bindGroup);
  pass.draw(3); pass.end();
  device.queue.submit([enc.finish()]);
  raf = requestAnimationFrame(frame);
}
frame();
return () => {
  cancelAnimationFrame(raf);
  canvas.removeEventListener('mousemove', onMove);
  canvas.removeEventListener('touchmove', onMove);
};
`
  },
  {
    id: 'webgpu-pulse',
    category: 'webgpu',
    contextType: 'webgpu',
    title: 'WebGPU Color Pulse',
    code: `if (!navigator.gpu) throw new Error('WebGPU not supported');
const adapter = await navigator.gpu.requestAdapter();
const device = await adapter.requestDevice();
const context = canvas.getContext('webgpu');
const format = navigator.gpu.getPreferredCanvasFormat
  ? navigator.gpu.getPreferredCanvasFormat()
  : 'bgra8unorm';
context.configure({ device, format, alphaMode: 'opaque' });
let t = 0, raf;
function frame(){
  t += 0.012;
  const enc = device.createCommandEncoder();
  const view = context.getCurrentTexture().createView();
  const pass = enc.beginRenderPass({
    colorAttachments: [{
      view,
      clearValue: {
        r: 0.5 + 0.5 * Math.sin(t),
        g: 0.5 + 0.5 * Math.sin(t + 2),
        b: 0.5 + 0.5 * Math.sin(t + 4),
        a: 1
      },
      loadOp: 'clear',
      storeOp: 'store'
    }]
  });
  pass.end();
  device.queue.submit([enc.finish()]);
  raf = requestAnimationFrame(frame);
}
frame();
return () => cancelAnimationFrame(raf);
`
  },
  {
    id: 'webgpu-boids',
    category: 'webgpu',
    contextType: 'webgpu',
    title: 'WebGPU Compute Boids',
    code: `// Classic boids on the GPU: compute shader updates a storage buffer of agents,
// render pipeline draws them as small oriented triangles. 1500 boids, all on GPU.
if (!navigator.gpu) throw new Error('WebGPU not supported');
const adapter = await navigator.gpu.requestAdapter();
const device  = await adapter.requestDevice();
const context = canvas.getContext('webgpu');
const format  = navigator.gpu.getPreferredCanvasFormat
  ? navigator.gpu.getPreferredCanvasFormat()
  : 'bgra8unorm';
context.configure({ device, format, alphaMode: 'opaque' });

const NUM = 1500;

// Each boid: position.xy, velocity.xy (16 bytes)
const boidByteSize = 4 * 4;
const initial = new Float32Array(NUM * 4);
for (let i = 0; i < NUM; i++){
  initial[i*4 + 0] = (Math.random() * 2 - 1);
  initial[i*4 + 1] = (Math.random() * 2 - 1);
  initial[i*4 + 2] = (Math.random() * 2 - 1) * 0.1;
  initial[i*4 + 3] = (Math.random() * 2 - 1) * 0.1;
}

// Ping-pong storage buffers
const buffers = [0,1].map(() => device.createBuffer({
  size: NUM * boidByteSize,
  usage: GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
}));
device.queue.writeBuffer(buffers[0], 0, initial);
device.queue.writeBuffer(buffers[1], 0, initial);

const compute = device.createShaderModule({ code: \`
struct Boid { pos: vec2<f32>, vel: vec2<f32> };
struct Boids { data: array<Boid> };
@group(0) @binding(0) var<storage, read>       inBoids:  Boids;
@group(0) @binding(1) var<storage, read_write> outBoids: Boids;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  let i = id.x;
  let n = arrayLength(&inBoids.data);
  if (i >= n) { return; }
  let me = inBoids.data[i];
  var pos = me.pos;
  var vel = me.vel;

  var cm    = vec2<f32>(0.0);   // center of mass
  var sep   = vec2<f32>(0.0);   // separation
  var avgV  = vec2<f32>(0.0);   // alignment
  var cmN: f32 = 0.0;
  var avgN: f32 = 0.0;

  for (var j: u32 = 0u; j < n; j = j + 1u) {
    if (j == i) { continue; }
    let other = inBoids.data[j];
    let d = distance(other.pos, pos);
    if (d < 0.10) { sep = sep - (other.pos - pos); }
    if (d < 0.20) { cm = cm + other.pos; cmN = cmN + 1.0; }
    if (d < 0.20) { avgV = avgV + other.vel; avgN = avgN + 1.0; }
  }
  if (cmN  > 0.0) { cm   = cm   / cmN  - pos; }
  if (avgN > 0.0) { avgV = avgV / avgN - vel; }

  vel = vel + cm * 0.020 + sep * 0.050 + avgV * 0.040;

  // Clamp speed
  let s = length(vel);
  let maxS = 0.05;
  if (s > maxS) { vel = vel / s * maxS; }

  pos = pos + vel;
  // Wrap
  if (pos.x < -1.0) { pos.x = pos.x + 2.0; }
  if (pos.x >  1.0) { pos.x = pos.x - 2.0; }
  if (pos.y < -1.0) { pos.y = pos.y + 2.0; }
  if (pos.y >  1.0) { pos.y = pos.y - 2.0; }

  outBoids.data[i] = Boid(pos, vel);
}
\` });

const render = device.createShaderModule({ code: \`
@vertex
fn vs(@location(0) instancePos: vec2<f32>,
      @location(1) instanceVel: vec2<f32>,
      @location(2) vertPos: vec2<f32>) -> @builtin(position) vec4<f32> {
  let angle = -atan2(instanceVel.x, instanceVel.y);
  let c = cos(angle); let s = sin(angle);
  let p = vec2<f32>(vertPos.x * c - vertPos.y * s, vertPos.x * s + vertPos.y * c);
  return vec4<f32>(p + instancePos, 0.0, 1.0);
}
@fragment
fn fs() -> @location(0) vec4<f32> { return vec4<f32>(0.18, 0.78, 0.92, 1.0); }
\` });

const computePipeline = device.createComputePipeline({
  layout: 'auto',
  compute: { module: compute, entryPoint: 'main' },
});

const renderPipeline = device.createRenderPipeline({
  layout: 'auto',
  vertex: {
    module: render, entryPoint: 'vs',
    buffers: [
      { arrayStride: 16, stepMode: 'instance', attributes: [
        { shaderLocation: 0, offset: 0, format: 'float32x2' },
        { shaderLocation: 1, offset: 8, format: 'float32x2' },
      ]},
      { arrayStride: 8, stepMode: 'vertex', attributes: [
        { shaderLocation: 2, offset: 0, format: 'float32x2' },
      ]},
    ],
  },
  fragment: { module: render, entryPoint: 'fs', targets: [{ format }] },
  primitive: { topology: 'triangle-list' },
});

// Triangle vertices (one boid shape)
const boidShape = device.createBuffer({
  size: 6 * 4, usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
});
device.queue.writeBuffer(boidShape, 0, new Float32Array([
  -0.005, -0.010,
   0.005, -0.010,
   0.000,  0.015,
]));

const bg = [0,1].map(i => device.createBindGroup({
  layout: computePipeline.getBindGroupLayout(0),
  entries: [
    { binding: 0, resource: { buffer: buffers[i] } },
    { binding: 1, resource: { buffer: buffers[(i + 1) % 2] } },
  ],
}));

let t = 0, raf;
function frame(){
  const enc = device.createCommandEncoder();

  const cpass = enc.beginComputePass();
  cpass.setPipeline(computePipeline);
  cpass.setBindGroup(0, bg[t % 2]);
  cpass.dispatchWorkgroups(Math.ceil(NUM / 64));
  cpass.end();

  const view = context.getCurrentTexture().createView();
  const rpass = enc.beginRenderPass({
    colorAttachments: [{ view, clearValue: { r: 0.02, g: 0.04, b: 0.10, a: 1 }, loadOp: 'clear', storeOp: 'store' }]
  });
  rpass.setPipeline(renderPipeline);
  rpass.setVertexBuffer(0, buffers[(t + 1) % 2]); // freshly written buffer
  rpass.setVertexBuffer(1, boidShape);
  rpass.draw(3, NUM);
  rpass.end();

  device.queue.submit([enc.finish()]);
  t++;
  raf = requestAnimationFrame(frame);
}
frame();
return () => cancelAnimationFrame(raf);
`
  },
  {
    id: 'webgpu-life',
    category: 'webgpu',
    contextType: 'webgpu',
    title: 'WebGPU Compute Game of Life',
    code: `// Cellular automaton on the GPU: compute shader reads from one storage buffer,
// writes to the other, render pipeline samples cells via a small uniform grid.
if (!navigator.gpu) throw new Error('WebGPU not supported');
const adapter = await navigator.gpu.requestAdapter();
const device  = await adapter.requestDevice();
const context = canvas.getContext('webgpu');
const format  = navigator.gpu.getPreferredCanvasFormat
  ? navigator.gpu.getPreferredCanvasFormat()
  : 'bgra8unorm';
context.configure({ device, format, alphaMode: 'opaque' });

const GRID = 192;
const numCells = GRID * GRID;

// Two storage buffers of u32 cells (1 = alive, 0 = dead)
const cellBuffers = [0,1].map(() => device.createBuffer({
  size: numCells * 4,
  usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
}));
const seed = new Uint32Array(numCells);
for (let i = 0; i < numCells; i++) seed[i] = Math.random() < 0.30 ? 1 : 0;
device.queue.writeBuffer(cellBuffers[0], 0, seed);

// uniform: grid size
const sizeBuf = device.createBuffer({
  size: 16, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});
device.queue.writeBuffer(sizeBuf, 0, new Uint32Array([GRID, GRID, 0, 0]));

const compute = device.createShaderModule({ code: \`
struct Size { w: u32, h: u32 };
@group(0) @binding(0) var<uniform> size: Size;
@group(0) @binding(1) var<storage, read>       inCells:  array<u32>;
@group(0) @binding(2) var<storage, read_write> outCells: array<u32>;

fn cell(x: i32, y: i32) -> u32 {
  let w = i32(size.w); let h = i32(size.h);
  let xx = (x + w) % w; let yy = (y + h) % h;
  return inCells[u32(yy) * size.w + u32(xx)];
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  if (id.x >= size.w || id.y >= size.h) { return; }
  let x = i32(id.x); let y = i32(id.y);
  var n: u32 = 0u;
  for (var dy: i32 = -1; dy <= 1; dy = dy + 1) {
    for (var dx: i32 = -1; dx <= 1; dx = dx + 1) {
      if (dx == 0 && dy == 0) { continue; }
      n = n + cell(x + dx, y + dy);
    }
  }
  let alive = inCells[id.y * size.w + id.x] == 1u;
  var next: u32 = 0u;
  if (alive && (n == 2u || n == 3u)) { next = 1u; }
  if (!alive && n == 3u) { next = 1u; }
  outCells[id.y * size.w + id.x] = next;
}
\` });

const render = device.createShaderModule({ code: \`
struct Size { w: u32, h: u32 };
@group(0) @binding(0) var<uniform> size: Size;
@group(0) @binding(1) var<storage, read> cells: array<u32>;

@vertex
fn vs(@builtin(vertex_index) i: u32) -> @builtin(position) vec4<f32> {
  var p = array<vec2<f32>, 3>(vec2(-1.0,-1.0), vec2(3.0,-1.0), vec2(-1.0,3.0));
  return vec4<f32>(p[i], 0.0, 1.0);
}
@fragment
fn fs(@builtin(position) fc: vec4<f32>) -> @location(0) vec4<f32> {
  // Map screen-space frag coord to grid cell. We pass the resolution implicitly
  // by using fc.xy / canvasSize; instead, derive from size via dpdx? Easier to
  // pass cell density as a separate uniform — but for a square sample we just
  // tile by GRID / max(canvasSize, canvasSize). Here we sample using fc only.
  let cellSize = 4.0; // px per cell on-screen; cosmetic
  let gx = u32(fc.x / cellSize) % size.w;
  let gy = u32(fc.y / cellSize) % size.h;
  let v = cells[gy * size.w + gx];
  if (v == 1u) { return vec4<f32>(0.13, 0.83, 0.74, 1.0); }
  return vec4<f32>(0.01, 0.02, 0.06, 1.0);
}
\` });

const computePipeline = device.createComputePipeline({
  layout: 'auto',
  compute: { module: compute, entryPoint: 'main' },
});
const renderPipeline = device.createRenderPipeline({
  layout: 'auto',
  vertex:   { module: render, entryPoint: 'vs' },
  fragment: { module: render, entryPoint: 'fs', targets: [{ format }] },
  primitive: { topology: 'triangle-list' },
});

const cBG = [0,1].map(i => device.createBindGroup({
  layout: computePipeline.getBindGroupLayout(0),
  entries: [
    { binding: 0, resource: { buffer: sizeBuf } },
    { binding: 1, resource: { buffer: cellBuffers[i] } },
    { binding: 2, resource: { buffer: cellBuffers[(i + 1) % 2] } },
  ],
}));
const rBG = [0,1].map(i => device.createBindGroup({
  layout: renderPipeline.getBindGroupLayout(0),
  entries: [
    { binding: 0, resource: { buffer: sizeBuf } },
    { binding: 1, resource: { buffer: cellBuffers[i] } },
  ],
}));

// Step compute on a slower cadence than the display refresh.
let frameId = 0, raf;
function frame(){
  const enc = device.createCommandEncoder();

  // Step every other frame for a calmer simulation.
  const stepped = frameId % 2 === 0;
  if (stepped) {
    const cpass = enc.beginComputePass();
    cpass.setPipeline(computePipeline);
    cpass.setBindGroup(0, cBG[frameId % 2 ? 1 : 0]);
    cpass.dispatchWorkgroups(Math.ceil(GRID / 8), Math.ceil(GRID / 8));
    cpass.end();
  }

  const view = context.getCurrentTexture().createView();
  const rpass = enc.beginRenderPass({
    colorAttachments: [{ view, clearValue: { r: 0, g: 0, b: 0, a: 1 }, loadOp: 'clear', storeOp: 'store' }]
  });
  rpass.setPipeline(renderPipeline);
  // Display whichever buffer was written most recently
  rpass.setBindGroup(0, rBG[stepped ? 1 : 0]);
  rpass.draw(3);
  rpass.end();

  device.queue.submit([enc.finish()]);
  frameId++;
  raf = requestAnimationFrame(frame);
}
frame();
return () => cancelAnimationFrame(raf);
`
  },
  {
    id: 'webgpu-stripes',
    category: 'webgpu',
    contextType: 'webgpu',
    title: 'WebGPU Animated Stripes',
    code: `if (!navigator.gpu) throw new Error('WebGPU not supported');
const adapter = await navigator.gpu.requestAdapter();
const device  = await adapter.requestDevice();
const context = canvas.getContext('webgpu');
const format  = navigator.gpu.getPreferredCanvasFormat ? navigator.gpu.getPreferredCanvasFormat() : 'bgra8unorm';
context.configure({ device, format, alphaMode: 'opaque' });

const shader = device.createShaderModule({ code: \`
struct U { res: vec2<f32>, time: f32 };
@group(0) @binding(0) var<uniform> u: U;
@vertex
fn vs(@builtin(vertex_index) i: u32) -> @builtin(position) vec4<f32> {
  var p = array<vec2<f32>, 3>(vec2(-1.0,-1.0), vec2(3.0,-1.0), vec2(-1.0,3.0));
  return vec4<f32>(p[i], 0.0, 1.0);
}
@fragment
fn fs(@builtin(position) fc: vec4<f32>) -> @location(0) vec4<f32> {
  let uv = fc.xy / u.res;
  let s = sin((uv.x + uv.y) * 30.0 + u.time * 2.0);
  let a = vec3<f32>(0.13, 0.83, 0.74);
  let b = vec3<f32>(0.65, 0.33, 0.97);
  return vec4<f32>(mix(a, b, smoothstep(-0.1, 0.1, s)), 1.0);
}\` });

const pipeline = device.createRenderPipeline({
  layout: 'auto',
  vertex:   { module: shader, entryPoint: 'vs' },
  fragment: { module: shader, entryPoint: 'fs', targets: [{ format }] },
  primitive: { topology: 'triangle-list' },
});
const ubo = device.createBuffer({ size: 16, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
const ubData = new Float32Array(4);
const bindGroup = device.createBindGroup({ layout: pipeline.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: ubo } }] });
let t = 0, raf;
function frame(){
  t += 0.012;
  ubData[0] = canvas.width; ubData[1] = canvas.height; ubData[2] = t;
  device.queue.writeBuffer(ubo, 0, ubData.buffer, 0, 16);
  const enc = device.createCommandEncoder();
  const view = context.getCurrentTexture().createView();
  const pass = enc.beginRenderPass({ colorAttachments: [{ view, clearValue: { r:0,g:0,b:0,a:1 }, loadOp: 'clear', storeOp: 'store' }] });
  pass.setPipeline(pipeline); pass.setBindGroup(0, bindGroup); pass.draw(3); pass.end();
  device.queue.submit([enc.finish()]);
  raf = requestAnimationFrame(frame);
}
frame();
return () => cancelAnimationFrame(raf);
`
  },
  {
    id: 'webgpu-fbm',
    category: 'webgpu',
    contextType: 'webgpu',
    title: 'WebGPU FBM Noise Clouds',
    code: `if (!navigator.gpu) throw new Error('WebGPU not supported');
const adapter = await navigator.gpu.requestAdapter();
const device  = await adapter.requestDevice();
const context = canvas.getContext('webgpu');
const format  = navigator.gpu.getPreferredCanvasFormat ? navigator.gpu.getPreferredCanvasFormat() : 'bgra8unorm';
context.configure({ device, format, alphaMode: 'opaque' });

const shader = device.createShaderModule({ code: \`
struct U { res: vec2<f32>, time: f32 };
@group(0) @binding(0) var<uniform> u: U;

fn hash(p: vec2<f32>) -> f32 {
  return fract(sin(dot(p, vec2<f32>(127.1, 311.7))) * 43758.5453);
}
fn noise(p: vec2<f32>) -> f32 {
  let i = floor(p); let f = fract(p);
  let a = hash(i);
  let b = hash(i + vec2<f32>(1.0, 0.0));
  let c = hash(i + vec2<f32>(0.0, 1.0));
  let d = hash(i + vec2<f32>(1.0, 1.0));
  let uu = f * f * (3.0 - 2.0 * f);
  return mix(a, b, uu.x) + (c - a) * uu.y * (1.0 - uu.x) + (d - b) * uu.x * uu.y;
}
fn fbm(p_in: vec2<f32>) -> f32 {
  var v: f32 = 0.0; var a: f32 = 0.5; var p = p_in;
  for (var i: i32 = 0; i < 6; i = i + 1) { v = v + a * noise(p); p = p * 2.0; a = a * 0.5; }
  return v;
}

@vertex
fn vs(@builtin(vertex_index) i: u32) -> @builtin(position) vec4<f32> {
  var p = array<vec2<f32>, 3>(vec2(-1.0,-1.0), vec2(3.0,-1.0), vec2(-1.0,3.0));
  return vec4<f32>(p[i], 0.0, 1.0);
}
@fragment
fn fs(@builtin(position) fc: vec4<f32>) -> @location(0) vec4<f32> {
  var uv = fc.xy / u.res;
  uv.x = uv.x * (u.res.x / u.res.y);
  let n = fbm(uv * 3.0 + vec2<f32>(u.time * 0.1, 0.0));
  let col = mix(vec3<f32>(0.02,0.06,0.18), vec3<f32>(0.95,0.98,1.0), smoothstep(0.3, 0.8, n));
  return vec4<f32>(col, 1.0);
}\` });

const pipeline = device.createRenderPipeline({
  layout: 'auto',
  vertex:   { module: shader, entryPoint: 'vs' },
  fragment: { module: shader, entryPoint: 'fs', targets: [{ format }] },
  primitive: { topology: 'triangle-list' },
});
const ubo = device.createBuffer({ size: 16, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
const ubData = new Float32Array(4);
const bindGroup = device.createBindGroup({ layout: pipeline.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: ubo } }] });
let t = 0, raf;
function frame(){
  t += 0.012;
  ubData[0] = canvas.width; ubData[1] = canvas.height; ubData[2] = t;
  device.queue.writeBuffer(ubo, 0, ubData.buffer, 0, 16);
  const enc = device.createCommandEncoder();
  const view = context.getCurrentTexture().createView();
  const pass = enc.beginRenderPass({ colorAttachments: [{ view, clearValue: { r:0,g:0,b:0,a:1 }, loadOp: 'clear', storeOp: 'store' }] });
  pass.setPipeline(pipeline); pass.setBindGroup(0, bindGroup); pass.draw(3); pass.end();
  device.queue.submit([enc.finish()]);
  raf = requestAnimationFrame(frame);
}
frame();
return () => cancelAnimationFrame(raf);
`
  },
  {
    id: 'webgpu-voronoi',
    category: 'webgpu',
    contextType: 'webgpu',
    title: 'WebGPU Voronoi Cells',
    code: `if (!navigator.gpu) throw new Error('WebGPU not supported');
const adapter = await navigator.gpu.requestAdapter();
const device  = await adapter.requestDevice();
const context = canvas.getContext('webgpu');
const format  = navigator.gpu.getPreferredCanvasFormat ? navigator.gpu.getPreferredCanvasFormat() : 'bgra8unorm';
context.configure({ device, format, alphaMode: 'opaque' });

const shader = device.createShaderModule({ code: \`
struct U { res: vec2<f32>, time: f32 };
@group(0) @binding(0) var<uniform> u: U;

fn hash2(p_in: vec2<f32>) -> vec2<f32> {
  let p = vec2<f32>(dot(p_in, vec2<f32>(127.1, 311.7)), dot(p_in, vec2<f32>(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

@vertex
fn vs(@builtin(vertex_index) i: u32) -> @builtin(position) vec4<f32> {
  var p = array<vec2<f32>, 3>(vec2(-1.0,-1.0), vec2(3.0,-1.0), vec2(-1.0,3.0));
  return vec4<f32>(p[i], 0.0, 1.0);
}
@fragment
fn fs(@builtin(position) fc: vec4<f32>) -> @location(0) vec4<f32> {
  var uv = fc.xy / u.res;
  uv.x = uv.x * (u.res.x / u.res.y);
  let p  = uv * 8.0;
  let ip = floor(p); let fp = fract(p);
  var md: f32 = 8.0;
  for (var y: i32 = -1; y <= 1; y = y + 1) {
    for (var x: i32 = -1; x <= 1; x = x + 1) {
      let g = vec2<f32>(f32(x), f32(y));
      var o = hash2(ip + g);
      o = 0.5 + 0.5 * sin(u.time + 6.2831 * o);
      let d = length(g + o - fp);
      md = min(md, d);
    }
  }
  let col = 0.5 + 0.5 * cos(6.2831 * (md + vec3<f32>(0.0, 0.33, 0.66)));
  return vec4<f32>(col, 1.0);
}\` });

const pipeline = device.createRenderPipeline({
  layout: 'auto',
  vertex:   { module: shader, entryPoint: 'vs' },
  fragment: { module: shader, entryPoint: 'fs', targets: [{ format }] },
  primitive: { topology: 'triangle-list' },
});
const ubo = device.createBuffer({ size: 16, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
const ubData = new Float32Array(4);
const bindGroup = device.createBindGroup({ layout: pipeline.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: ubo } }] });
let t = 0, raf;
function frame(){
  t += 0.009;
  ubData[0] = canvas.width; ubData[1] = canvas.height; ubData[2] = t;
  device.queue.writeBuffer(ubo, 0, ubData.buffer, 0, 16);
  const enc = device.createCommandEncoder();
  const view = context.getCurrentTexture().createView();
  const pass = enc.beginRenderPass({ colorAttachments: [{ view, clearValue: { r:0,g:0,b:0,a:1 }, loadOp: 'clear', storeOp: 'store' }] });
  pass.setPipeline(pipeline); pass.setBindGroup(0, bindGroup); pass.draw(3); pass.end();
  device.queue.submit([enc.finish()]);
  raf = requestAnimationFrame(frame);
}
frame();
return () => cancelAnimationFrame(raf);
`
  },
  {
    id: 'webgpu-warp',
    category: 'webgpu',
    contextType: 'webgpu',
    title: 'WebGPU Domain Warping',
    code: `if (!navigator.gpu) throw new Error('WebGPU not supported');
const adapter = await navigator.gpu.requestAdapter();
const device  = await adapter.requestDevice();
const context = canvas.getContext('webgpu');
const format  = navigator.gpu.getPreferredCanvasFormat ? navigator.gpu.getPreferredCanvasFormat() : 'bgra8unorm';
context.configure({ device, format, alphaMode: 'opaque' });

const shader = device.createShaderModule({ code: \`
struct U { res: vec2<f32>, time: f32 };
@group(0) @binding(0) var<uniform> u: U;
fn hash(p: vec2<f32>) -> f32 { return fract(sin(dot(p, vec2<f32>(127.1, 311.7))) * 43758.5453); }
fn noise(p: vec2<f32>) -> f32 {
  let i = floor(p); let f = fract(p);
  let a = hash(i);
  let b = hash(i + vec2<f32>(1.0, 0.0));
  let c = hash(i + vec2<f32>(0.0, 1.0));
  let d = hash(i + vec2<f32>(1.0, 1.0));
  let uu = f * f * (3.0 - 2.0 * f);
  return mix(a, b, uu.x) + (c - a) * uu.y * (1.0 - uu.x) + (d - b) * uu.x * uu.y;
}
fn fbm(p_in: vec2<f32>) -> f32 {
  var v: f32 = 0.0; var a: f32 = 0.5; var p = p_in;
  for (var i: i32 = 0; i < 5; i = i + 1) { v = v + a * noise(p); p = p * 2.0; a = a * 0.5; }
  return v;
}

@vertex
fn vs(@builtin(vertex_index) i: u32) -> @builtin(position) vec4<f32> {
  var p = array<vec2<f32>, 3>(vec2(-1.0,-1.0), vec2(3.0,-1.0), vec2(-1.0,3.0));
  return vec4<f32>(p[i], 0.0, 1.0);
}
@fragment
fn fs(@builtin(position) fc: vec4<f32>) -> @location(0) vec4<f32> {
  var uv = fc.xy / u.res;
  uv.x = uv.x * (u.res.x / u.res.y);
  let q = vec2<f32>(fbm(uv + vec2<f32>(0.0, u.time * 0.05)), fbm(uv + vec2<f32>(5.2, 1.3)));
  let r = vec2<f32>(
    fbm(uv + 4.0 * q + vec2<f32>(1.7, 9.2)),
    fbm(uv + 4.0 * q + vec2<f32>(8.3, 2.8) + u.time * 0.10)
  );
  let v = fbm(uv + 4.0 * r);
  var col = mix(vec3<f32>(0.10,0.04,0.30), vec3<f32>(0.95,0.55,0.20), v);
  col = mix(col, vec3<f32>(0.20,0.78,0.92), length(q));
  return vec4<f32>(col, 1.0);
}\` });

const pipeline = device.createRenderPipeline({
  layout: 'auto',
  vertex:   { module: shader, entryPoint: 'vs' },
  fragment: { module: shader, entryPoint: 'fs', targets: [{ format }] },
  primitive: { topology: 'triangle-list' },
});
const ubo = device.createBuffer({ size: 16, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
const ubData = new Float32Array(4);
const bindGroup = device.createBindGroup({ layout: pipeline.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: ubo } }] });
let t = 0, raf;
function frame(){
  t += 0.009;
  ubData[0] = canvas.width; ubData[1] = canvas.height; ubData[2] = t;
  device.queue.writeBuffer(ubo, 0, ubData.buffer, 0, 16);
  const enc = device.createCommandEncoder();
  const view = context.getCurrentTexture().createView();
  const pass = enc.beginRenderPass({ colorAttachments: [{ view, clearValue: { r:0,g:0,b:0,a:1 }, loadOp: 'clear', storeOp: 'store' }] });
  pass.setPipeline(pipeline); pass.setBindGroup(0, bindGroup); pass.draw(3); pass.end();
  device.queue.submit([enc.finish()]);
  raf = requestAnimationFrame(frame);
}
frame();
return () => cancelAnimationFrame(raf);
`
  },
  // ---------- Three.js ----------
  // In NativeScript: install \`@nativescript/canvas\` + \`three\` and import three
  // from the package instead of esm.sh — the sample code is otherwise unchanged.
  {
    id: 'three-cube',
    category: 'three',
    contextType: 'webgl',
    title: 'Three.js Rotating Cube',
    code: `// Loads three.js from a CDN at runtime (works in any modern browser).
// In NativeScript, install \`three\` via npm and import it the usual way.
const THREE = await import('https://esm.sh/three@0.160.0');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(canvas.width, canvas.height, false);
renderer.setClearColor(0x010617, 1);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, canvas.width / canvas.height, 0.1, 100);
camera.position.set(0, 0, 3.2);

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({ color: 0x22d3ee, roughness: 0.35, metalness: 0.4 })
);
scene.add(cube);

const dir = new THREE.DirectionalLight(0xffffff, 1.0);
dir.position.set(3, 4, 5);
scene.add(dir);
scene.add(new THREE.AmbientLight(0xffffff, 0.35));

let raf;
function frame(){
  cube.rotation.x += 0.007;
  cube.rotation.y += 0.011;
  renderer.render(scene, camera);
  raf = requestAnimationFrame(frame);
}
frame();
return () => {
  cancelAnimationFrame(raf);
  cube.geometry.dispose();
  cube.material.dispose();
  renderer.dispose();
};
`
  },
  {
    id: 'three-particles',
    category: 'three',
    contextType: 'webgl',
    title: 'Three.js Particle Sphere',
    code: `const THREE = await import('https://esm.sh/three@0.160.0');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(canvas.width, canvas.height, false);
renderer.setClearColor(0x010617, 1);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, canvas.width / canvas.height, 0.1, 100);
camera.position.set(0, 0, 4);

const N = 6000;
const positions = new Float32Array(N * 3);
const colors    = new Float32Array(N * 3);
for (let i = 0; i < N; i++){
  const phi = Math.acos(2 * Math.random() - 1);
  const theta = Math.random() * Math.PI * 2;
  const r = 1.1 + Math.random() * 0.3;
  positions[i*3 + 0] = Math.sin(phi) * Math.cos(theta) * r;
  positions[i*3 + 1] = Math.sin(phi) * Math.sin(theta) * r;
  positions[i*3 + 2] = Math.cos(phi) * r;
  const c = new THREE.Color().setHSL((phi / Math.PI), 0.7, 0.6);
  colors[i*3 + 0] = c.r; colors[i*3 + 1] = c.g; colors[i*3 + 2] = c.b;
}

const geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geo.setAttribute('color',    new THREE.BufferAttribute(colors,    3));
const mat = new THREE.PointsMaterial({ size: 0.025, vertexColors: true });
const points = new THREE.Points(geo, mat);
scene.add(points);

let raf;
function frame(){
  points.rotation.y += 0.004;
  points.rotation.x += 0.0015;
  renderer.render(scene, camera);
  raf = requestAnimationFrame(frame);
}
frame();
return () => {
  cancelAnimationFrame(raf);
  geo.dispose();
  mat.dispose();
  renderer.dispose();
};
`
  },
  {
    id: 'three-torus-knot',
    category: 'three',
    contextType: 'webgl',
    title: 'Three.js Torus Knot',
    code: `const THREE = await import('https://esm.sh/three@0.160.0');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(canvas.width, canvas.height, false);
renderer.setClearColor(0x010617, 1);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, canvas.width / canvas.height, 0.1, 100);
camera.position.set(0, 0, 4);
const mat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.25, metalness: 0.6 });
const mesh = new THREE.Mesh(new THREE.TorusKnotGeometry(0.8, 0.28, 220, 32), mat);
scene.add(mesh);
const l1 = new THREE.DirectionalLight(0xffffff, 1.1); l1.position.set(3, 4, 5); scene.add(l1);
const l2 = new THREE.DirectionalLight(0x60a5fa, 0.6); l2.position.set(-4, -2, -3); scene.add(l2);
scene.add(new THREE.AmbientLight(0xffffff, 0.25));
let raf;
function frame(){
  mesh.rotation.x += 0.0035; mesh.rotation.y += 0.0065;
  renderer.render(scene, camera);
  raf = requestAnimationFrame(frame);
}
frame();
return () => { cancelAnimationFrame(raf); mesh.geometry.dispose(); mat.dispose(); renderer.dispose(); };
`
  },
  {
    id: 'three-wireframe',
    category: 'three',
    contextType: 'webgl',
    title: 'Three.js Wireframe Icosahedron',
    code: `const THREE = await import('https://esm.sh/three@0.160.0');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(canvas.width, canvas.height, false);
renderer.setClearColor(0x010617, 1);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, canvas.width / canvas.height, 0.1, 100);
camera.position.set(0, 0, 3);
const geom = new THREE.IcosahedronGeometry(1.0, 3);
const fill = new THREE.Mesh(geom, new THREE.MeshBasicMaterial({ color: 0x0b1428 }));
const wire = new THREE.LineSegments(new THREE.WireframeGeometry(geom), new THREE.LineBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.85 }));
scene.add(fill); scene.add(wire);
let raf;
function frame(){
  const dt = 0.008;
  fill.rotation.x += dt; fill.rotation.y += dt * 1.3;
  wire.rotation.copy(fill.rotation);
  renderer.render(scene, camera);
  raf = requestAnimationFrame(frame);
}
frame();
return () => { cancelAnimationFrame(raf); geom.dispose(); wire.geometry.dispose(); fill.material.dispose(); wire.material.dispose(); renderer.dispose(); };
`
  },
  {
    id: 'three-cluster',
    category: 'three',
    contextType: 'webgl',
    title: 'Three.js Orbiting Cubes Cluster',
    code: `const THREE = await import('https://esm.sh/three@0.160.0');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(canvas.width, canvas.height, false);
renderer.setClearColor(0x010617, 1);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, canvas.width / canvas.height, 0.1, 100);
camera.position.set(0, 1.5, 5);
camera.lookAt(0, 0, 0);
const group = new THREE.Group();
const N = 80;
const baseGeo = new THREE.BoxGeometry(0.18, 0.18, 0.18);
const cubes = [];
for (let i = 0; i < N; i++){
  const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(i / N, 0.7, 0.6) });
  const m = new THREE.Mesh(baseGeo, mat);
  const phi = Math.acos(2 * (i / N) - 1);
  const theta = Math.PI * 2 * i * 0.618;
  const r = 1.5;
  m.userData = { phi, theta, r };
  group.add(m); cubes.push(m);
}
scene.add(group);
scene.add(new THREE.DirectionalLight(0xffffff, 1.0).translateY(3).translateZ(4));
scene.add(new THREE.AmbientLight(0xffffff, 0.3));
let t = 0, raf;
function frame(){
  t += 0.01;
  for (const m of cubes){
    const { phi, theta, r } = m.userData;
    const rr = r + 0.25 * Math.sin(t + phi * 4);
    m.position.set(
      Math.sin(phi) * Math.cos(theta + t) * rr,
      Math.sin(phi) * Math.sin(theta + t) * rr,
      Math.cos(phi) * rr
    );
    m.rotation.x = t + phi; m.rotation.y = t * 0.7 + theta;
  }
  group.rotation.y = t * 0.2;
  renderer.render(scene, camera);
  raf = requestAnimationFrame(frame);
}
frame();
return () => {
  cancelAnimationFrame(raf);
  baseGeo.dispose();
  for (const m of cubes) m.material.dispose();
  renderer.dispose();
};
`
  },
  {
    id: 'three-orbit',
    category: 'three',
    contextType: 'webgl',
    title: 'Three.js Mouse-Orbit Camera',
    code: `// Drag to orbit, no OrbitControls dependency.
const THREE = await import('https://esm.sh/three@0.160.0');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(canvas.width, canvas.height, false);
renderer.setClearColor(0x010617, 1);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, canvas.width / canvas.height, 0.1, 100);
const mesh = new THREE.Mesh(
  new THREE.DodecahedronGeometry(1.0, 0),
  new THREE.MeshStandardMaterial({ color: 0x22d3ee, roughness: 0.3, metalness: 0.5, flatShading: true })
);
scene.add(mesh);
const dir = new THREE.DirectionalLight(0xffffff, 1.0); dir.position.set(3, 4, 5); scene.add(dir);
scene.add(new THREE.AmbientLight(0xffffff, 0.3));

let yaw = 0.6, pitch = 0.4, dist = 3.6;
let dragging = false, lx = 0, ly = 0;
function localPos(e){ const t = e.touches ? e.touches[0] : e; return { x: t.clientX, y: t.clientY }; }
function onDown(e){ dragging = true; const p = localPos(e); lx = p.x; ly = p.y; e.preventDefault && e.preventDefault(); }
function onMove(e){ if (!dragging) return; const p = localPos(e); yaw += (p.x - lx) * 0.01; pitch += (p.y - ly) * 0.01; pitch = Math.max(-1.4, Math.min(1.4, pitch)); lx = p.x; ly = p.y; e.preventDefault && e.preventDefault(); }
function onUp(){ dragging = false; }
canvas.addEventListener('mousedown', onDown);
canvas.addEventListener('mousemove', onMove);
canvas.addEventListener('mouseup', onUp);
canvas.addEventListener('mouseleave', onUp);
canvas.addEventListener('touchstart', onDown, { passive: false });
canvas.addEventListener('touchmove', onMove, { passive: false });
canvas.addEventListener('touchend', onUp);

let raf;
function frame(){
  camera.position.set(
    dist * Math.cos(pitch) * Math.sin(yaw),
    dist * Math.sin(pitch),
    dist * Math.cos(pitch) * Math.cos(yaw)
  );
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
  raf = requestAnimationFrame(frame);
}
frame();
return () => {
  cancelAnimationFrame(raf);
  canvas.removeEventListener('mousedown', onDown);
  canvas.removeEventListener('mousemove', onMove);
  canvas.removeEventListener('mouseup', onUp);
  canvas.removeEventListener('mouseleave', onUp);
  canvas.removeEventListener('touchstart', onDown);
  canvas.removeEventListener('touchmove', onMove);
  canvas.removeEventListener('touchend', onUp);
  mesh.geometry.dispose(); mesh.material.dispose(); renderer.dispose();
};
`
  },
  {
    id: 'three-instanced',
    category: 'three',
    contextType: 'webgl',
    title: 'Three.js Instanced Boxes (1000)',
    code: `const THREE = await import('https://esm.sh/three@0.160.0');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(canvas.width, canvas.height, false);
renderer.setClearColor(0x010617, 1);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, canvas.width / canvas.height, 0.1, 100);
camera.position.set(0, 0, 8);
const N = 1000;
const geo = new THREE.BoxGeometry(0.15, 0.15, 0.15);
const mat = new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.45, metalness: 0.2 });
const mesh = new THREE.InstancedMesh(geo, mat, N);
const dummy = new THREE.Object3D();
const seed = [];
for (let i = 0; i < N; i++) seed.push({ r: 1 + Math.random()*2.5, phi: Math.random()*Math.PI*2, theta: Math.random()*Math.PI*2, s: 0.5+Math.random() });
scene.add(mesh);
const dir = new THREE.DirectionalLight(0xffffff, 1); dir.position.set(2,5,3); scene.add(dir);
scene.add(new THREE.AmbientLight(0xffffff, 0.3));
let t = 0, raf;
function frame(){
  t += 0.005;
  for (let i = 0; i < N; i++){
    const s = seed[i];
    const r = s.r + 0.2 * Math.sin(t + i * 0.05);
    dummy.position.set(
      r * Math.cos(s.phi + t * s.s) * Math.sin(s.theta + t * 0.4),
      r * Math.sin(s.phi + t * s.s) * Math.sin(s.theta + t * 0.4),
      r * Math.cos(s.theta + t * 0.4)
    );
    dummy.rotation.set(t + i*0.001, t*0.7, t*0.5);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  renderer.render(scene, camera);
  raf = requestAnimationFrame(frame);
}
frame();
return () => { cancelAnimationFrame(raf); geo.dispose(); mat.dispose(); renderer.dispose(); };
`
  },
  {
    id: 'three-wave-plane',
    category: 'three',
    contextType: 'webgl',
    title: 'Three.js Animated Wave Plane',
    code: `const THREE = await import('https://esm.sh/three@0.160.0');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(canvas.width, canvas.height, false);
renderer.setClearColor(0x010617, 1);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, canvas.width / canvas.height, 0.1, 100);
camera.position.set(0, 1.6, 3.6);
camera.lookAt(0, 0, 0);
const SEG = 80;
const geo = new THREE.PlaneGeometry(4, 3, SEG, SEG);
geo.rotateX(-Math.PI / 2);
const mat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, flatShading: true, side: THREE.DoubleSide, roughness: 0.6 });
const mesh = new THREE.Mesh(geo, mat);
scene.add(mesh);
const dir = new THREE.DirectionalLight(0xffffff, 1); dir.position.set(3,4,2); scene.add(dir);
scene.add(new THREE.AmbientLight(0xffffff, 0.3));
const pos = geo.attributes.position;
const baseY = new Float32Array(pos.count);
for (let i = 0; i < pos.count; i++) baseY[i] = pos.getY(i);
let t = 0, raf;
function frame(){
  t += 0.024;
  for (let i = 0; i < pos.count; i++){
    const x = pos.getX(i), z = pos.getZ(i);
    pos.setY(i, baseY[i] + Math.sin(x * 2.5 + t) * 0.18 + Math.cos(z * 2.0 + t * 1.2) * 0.18);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  renderer.render(scene, camera);
  raf = requestAnimationFrame(frame);
}
frame();
return () => { cancelAnimationFrame(raf); geo.dispose(); mat.dispose(); renderer.dispose(); };
`
  },
  {
    id: 'three-shader-material',
    category: 'three',
    contextType: 'webgl',
    title: 'Three.js Custom Shader Material',
    code: `const THREE = await import('https://esm.sh/three@0.160.0');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(canvas.width, canvas.height, false);
renderer.setClearColor(0x010617, 1);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, canvas.width / canvas.height, 0.1, 100);
camera.position.set(0, 0, 3.2);
const mat = new THREE.ShaderMaterial({
  uniforms: { uTime: { value: 0 } },
  vertexShader: \`
    varying vec3 vN;
    varying vec3 vP;
    void main(){
      vN = normalize(normalMatrix * normal);
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vP = mv.xyz;
      gl_Position = projectionMatrix * mv;
    }
  \`,
  fragmentShader: \`
    uniform float uTime;
    varying vec3 vN;
    varying vec3 vP;
    void main(){
      vec3 L = normalize(vec3(sin(uTime), 0.6, cos(uTime)));
      float diff = max(dot(vN, L), 0.0);
      vec3 base = 0.5 + 0.5 * cos(uTime + vP.xyx * 1.5 + vec3(0.0, 2.0, 4.0));
      gl_FragColor = vec4(base * (0.2 + diff), 1.0);
    }
  \`,
});
const mesh = new THREE.Mesh(new THREE.SphereGeometry(1.0, 64, 32), mat);
scene.add(mesh);
let t = 0, raf;
function frame(){
  t += 0.012;
  mat.uniforms.uTime.value = t;
  mesh.rotation.y = t * 0.4;
  renderer.render(scene, camera);
  raf = requestAnimationFrame(frame);
}
frame();
return () => { cancelAnimationFrame(raf); mesh.geometry.dispose(); mat.dispose(); renderer.dispose(); };
`
  },
  {
    id: 'three-stars',
    category: 'three',
    contextType: 'webgl',
    title: 'Three.js Flying Through Stars',
    code: `const THREE = await import('https://esm.sh/three@0.160.0');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(canvas.width, canvas.height, false);
renderer.setClearColor(0x000000, 1);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, canvas.width / canvas.height, 0.1, 200);
const N = 5000;
const positions = new Float32Array(N * 3);
for (let i = 0; i < N; i++){
  positions[i*3 + 0] = (Math.random() - 0.5) * 60;
  positions[i*3 + 1] = (Math.random() - 0.5) * 60;
  positions[i*3 + 2] = -Math.random() * 200;
}
const geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.15 });
const stars = new THREE.Points(geo, mat);
scene.add(stars);
let raf;
function frame(){
  const arr = geo.attributes.position.array;
  for (let i = 2; i < arr.length; i += 3){
    arr[i] += 0.45;
    if (arr[i] > 1){ arr[i] = -200; arr[i-2] = (Math.random()-0.5)*60; arr[i-1] = (Math.random()-0.5)*60; }
  }
  geo.attributes.position.needsUpdate = true;
  renderer.render(scene, camera);
  raf = requestAnimationFrame(frame);
}
frame();
return () => { cancelAnimationFrame(raf); geo.dispose(); mat.dispose(); renderer.dispose(); };
`
  },
  // ---------- Pixi.js ----------
  {
    id: 'pixi-bounce',
    category: 'pixi',
    contextType: 'webgl',
    title: 'Pixi.js Bouncing Shapes',
    code: `// Loads Pixi.js v7 from a CDN. In NativeScript install \`pixi.js\` from npm.
const PIXI = await import('https://esm.sh/pixi.js@7.4.0');

const app = new PIXI.Application({
  view: canvas,
  width: canvas.width,
  height: canvas.height,
  background: 0x010617,
  antialias: true,
  autoStart: false,
});

const N = 80;
const shapes = [];
for (let i = 0; i < N; i++){
  const g = new PIXI.Graphics();
  const r = 8 + Math.random() * 22;
  g.beginFill((Math.random() * 0xffffff) | 0);
  g.drawCircle(0, 0, r);
  g.endFill();
  g.x = Math.random() * canvas.width;
  g.y = Math.random() * canvas.height;
  g.vx = (Math.random() - 0.5) * 3.2;
  g.vy = (Math.random() - 0.5) * 3.2;
  g.r = r;
  app.stage.addChild(g);
  shapes.push(g);
}

const tick = () => {
  for (const s of shapes){
    s.x += s.vx; s.y += s.vy;
    if (s.x < s.r){ s.x = s.r; s.vx *= -1; }
    if (s.x > canvas.width  - s.r){ s.x = canvas.width  - s.r; s.vx *= -1; }
    if (s.y < s.r){ s.y = s.r; s.vy *= -1; }
    if (s.y > canvas.height - s.r){ s.y = canvas.height - s.r; s.vy *= -1; }
  }
};
app.ticker.add(tick);
app.start();

return () => { app.ticker.remove(tick); app.destroy(false, { children: true, texture: true, baseTexture: true }); };
`
  },
  {
    id: 'pixi-particles',
    category: 'pixi',
    contextType: 'webgl',
    title: 'Pixi.js Particle Container (5k)',
    code: `// 5000 sprites animated via Pixi's ParticleContainer (fast batched rendering).
const PIXI = await import('https://esm.sh/pixi.js@7.4.0');

const app = new PIXI.Application({
  view: canvas,
  width: canvas.width,
  height: canvas.height,
  background: 0x010617,
  antialias: false,
  autoStart: false,
});

// Build a small radial-gradient texture once and reuse it.
const off = document.createElement('canvas');
off.width = 32; off.height = 32;
const octx = off.getContext('2d');
const grad = octx.createRadialGradient(16, 16, 0, 16, 16, 16);
grad.addColorStop(0, 'rgba(168,85,247,1)');
grad.addColorStop(1, 'rgba(168,85,247,0)');
octx.fillStyle = grad;
octx.fillRect(0, 0, 32, 32);
const tex = PIXI.Texture.from(off);

const N = 5000;
const container = new PIXI.ParticleContainer(N, { position: true, scale: true, alpha: true, tint: true });
app.stage.addChild(container);

const items = [];
for (let i = 0; i < N; i++){
  const s = new PIXI.Sprite(tex);
  s.anchor.set(0.5);
  s.x = Math.random() * canvas.width;
  s.y = Math.random() * canvas.height;
  s.scale.set(0.4 + Math.random() * 0.6);
  s.tint = Math.floor(Math.random() * 0xffffff);
  s.alpha = 0.7;
  s.vx = (Math.random() - 0.5) * 3;
  s.vy = (Math.random() - 0.5) * 3;
  container.addChild(s);
  items.push(s);
}

const tick = () => {
  for (const s of items){
    s.x += s.vx; s.y += s.vy;
    if (s.x < 0 || s.x > canvas.width)  s.vx *= -1;
    if (s.y < 0 || s.y > canvas.height) s.vy *= -1;
  }
};
app.ticker.add(tick);
app.start();

return () => {
  app.ticker.remove(tick);
  app.destroy(false, { children: true, texture: true, baseTexture: true });
  tex.destroy(true);
};
`
  },
  {
    id: 'pixi-text',
    category: 'pixi',
    contextType: 'webgl',
    title: 'Pixi.js Animated Text',
    code: `const PIXI = await import('https://esm.sh/pixi.js@7.4.0');
const app = new PIXI.Application({ view: canvas, width: canvas.width, height: canvas.height, background: 0x010617, antialias: true, autoStart: false });
const style = new PIXI.TextStyle({
  fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto',
  fontSize: 64, fontWeight: '800',
  fill: ['#22d3ee', '#a855f7'], stroke: '#0b1428', strokeThickness: 4,
  dropShadow: true, dropShadowBlur: 8, dropShadowColor: 0x0ea5e9, dropShadowDistance: 0,
});
const text = new PIXI.Text('Canvas Playground', style);
text.anchor.set(0.5);
text.x = canvas.width / 2; text.y = canvas.height / 2;
app.stage.addChild(text);
let t = 0;
const tick = () => {
  t += 0.028;
  text.scale.set(1 + 0.06 * Math.sin(t));
  text.rotation = 0.05 * Math.sin(t * 0.5);
};
app.ticker.add(tick); app.start();
return () => { app.ticker.remove(tick); app.destroy(false, { children: true, texture: true, baseTexture: true }); };
`
  },
  {
    id: 'pixi-bezier',
    category: 'pixi',
    contextType: 'webgl',
    title: 'Pixi.js Bezier Path',
    code: `const PIXI = await import('https://esm.sh/pixi.js@7.4.0');
const app = new PIXI.Application({ view: canvas, width: canvas.width, height: canvas.height, background: 0x010617, antialias: true, autoStart: false });
const g = new PIXI.Graphics();
app.stage.addChild(g);
let t = 0;
const tick = () => {
  t += 0.012;
  g.clear();
  g.lineStyle({ width: 2.5, color: 0x22d3ee, alpha: 0.9 });
  const w = canvas.width, h = canvas.height;
  g.moveTo(0, h * 0.5);
  for (let x = 0; x <= w; x += 14){
    const y = h*0.5 + Math.sin(x*0.012 + t)*60 + Math.sin(x*0.025 + t*1.7)*30;
    g.lineTo(x, y);
  }
  // Bezier flourish on top
  g.lineStyle({ width: 4, color: 0xa855f7, alpha: 0.85 });
  g.moveTo(40, h*0.8);
  g.bezierCurveTo(w*0.3, h*0.1 + 80*Math.sin(t), w*0.7, h*0.9 + 60*Math.cos(t*1.4), w-40, h*0.2);
};
app.ticker.add(tick); app.start();
return () => { app.ticker.remove(tick); app.destroy(false, { children: true, texture: true, baseTexture: true }); };
`
  },
  {
    id: 'pixi-drag',
    category: 'pixi',
    contextType: 'webgl',
    title: 'Pixi.js Drag & Drop',
    code: `const PIXI = await import('https://esm.sh/pixi.js@7.4.0');
const app = new PIXI.Application({ view: canvas, width: canvas.width, height: canvas.height, background: 0x010617, antialias: true });
app.stage.eventMode = 'static';
app.stage.hitArea = app.screen;

const COLORS = [0x22d3ee, 0xa855f7, 0xf472b6, 0x4ade80, 0xfb923c, 0xfacc15];
for (let i = 0; i < 16; i++){
  const g = new PIXI.Graphics();
  g.beginFill(COLORS[i % COLORS.length]);
  g.drawRoundedRect(-30, -30, 60, 60, 10);
  g.endFill();
  g.x = 80 + Math.random() * (canvas.width  - 160);
  g.y = 80 + Math.random() * (canvas.height - 160);
  g.eventMode = 'static'; g.cursor = 'grab';
  g.on('pointerdown', (ev) => {
    g.alpha = 0.7; g.cursor = 'grabbing'; g.zIndex = 1000;
    g.data = ev.data;
    g.dragging = true;
  });
  app.stage.addChild(g);
}
function endDrag(ev){
  for (const c of app.stage.children){
    if (c.dragging){ c.dragging = false; c.alpha = 1; c.cursor = 'grab'; }
  }
}
function move(ev){
  for (const c of app.stage.children){
    if (c.dragging){
      const p = ev.data.getLocalPosition(app.stage);
      c.x = p.x; c.y = p.y;
    }
  }
}
app.stage.on('pointermove', move);
app.stage.on('pointerup', endDrag);
app.stage.on('pointerupoutside', endDrag);
return () => { app.destroy(false, { children: true, texture: true, baseTexture: true }); };
`
  },
  {
    id: 'pixi-blur',
    category: 'pixi',
    contextType: 'webgl',
    title: 'Pixi.js Blur Filter',
    code: `const PIXI = await import('https://esm.sh/pixi.js@7.4.0');
const app = new PIXI.Application({ view: canvas, width: canvas.width, height: canvas.height, background: 0x010617, antialias: true, autoStart: false });
const container = new PIXI.Container();
app.stage.addChild(container);
const N = 30;
const sprites = [];
for (let i = 0; i < N; i++){
  const g = new PIXI.Graphics();
  g.beginFill(new PIXI.Color({ h: (i / N) * 360, s: 70, v: 90 }).toNumber());
  g.drawCircle(0, 0, 28 + Math.random() * 16);
  g.endFill();
  g.x = Math.random() * canvas.width; g.y = Math.random() * canvas.height;
  g.vx = (Math.random() - 0.5) * 4; g.vy = (Math.random() - 0.5) * 4;
  container.addChild(g); sprites.push(g);
}
const blur = new PIXI.BlurFilter(8, 6);
container.filters = [blur];
let t = 0;
const tick = () => {
  t += 0.012;
  blur.blur = 4 + 6 * (0.5 + 0.5 * Math.sin(t));
  for (const s of sprites){
    s.x += s.vx; s.y += s.vy;
    if (s.x < 0 || s.x > canvas.width) s.vx *= -1;
    if (s.y < 0 || s.y > canvas.height) s.vy *= -1;
  }
};
app.ticker.add(tick); app.start();
return () => { app.ticker.remove(tick); app.destroy(false, { children: true, texture: true, baseTexture: true }); };
`
  },
  {
    id: 'pixi-click-spawn',
    category: 'pixi',
    contextType: 'webgl',
    title: 'Pixi.js Click to Spawn',
    code: `const PIXI = await import('https://esm.sh/pixi.js@7.4.0');
const app = new PIXI.Application({ view: canvas, width: canvas.width, height: canvas.height, background: 0x010617, antialias: true, autoStart: false });
app.stage.eventMode = 'static';
app.stage.hitArea = app.screen;
const sparks = [];
function spawnAt(x, y){
  for (let i = 0; i < 28; i++){
    const g = new PIXI.Graphics();
    const c = new PIXI.Color({ h: Math.random()*360, s: 90, v: 100 }).toNumber();
    g.beginFill(c); g.drawCircle(0, 0, 2 + Math.random() * 3); g.endFill();
    g.x = x; g.y = y;
    const a = Math.random() * Math.PI * 2, sp = 2 + Math.random() * 4;
    g.vx = Math.cos(a) * sp; g.vy = Math.sin(a) * sp; g.life = 1;
    app.stage.addChild(g); sparks.push(g);
  }
}
app.stage.on('pointerdown', (ev) => { const p = ev.data.global; spawnAt(p.x, p.y); });
// Spawn one in the middle so users see something on first load.
spawnAt(canvas.width/2, canvas.height/2);
const hint = new PIXI.Text('Click anywhere', { fill: 0xcbd5e1, fontSize: 16 });
hint.x = 16; hint.y = 14; app.stage.addChild(hint);

const tick = () => {
  for (let i = sparks.length - 1; i >= 0; i--){
    const s = sparks[i];
    s.x += s.vx; s.y += s.vy; s.vy += 0.06; s.life -= 0.012; s.alpha = s.life;
    if (s.life <= 0){ app.stage.removeChild(s); s.destroy(); sparks.splice(i, 1); }
  }
};
app.ticker.add(tick); app.start();
return () => { app.ticker.remove(tick); app.destroy(false, { children: true, texture: true, baseTexture: true }); };
`
  },
  {
    id: 'pixi-constellation',
    category: 'pixi',
    contextType: 'webgl',
    title: 'Pixi.js Constellation',
    code: `const PIXI = await import('https://esm.sh/pixi.js@7.4.0');
const app = new PIXI.Application({ view: canvas, width: canvas.width, height: canvas.height, background: 0x010617, antialias: true, autoStart: false });
const N = 70;
const nodes = [];
const dot = new PIXI.Graphics(); dot.beginFill(0xffffff).drawCircle(0, 0, 2).endFill();
const tex = app.renderer.generateTexture(dot);
for (let i = 0; i < N; i++){
  const s = new PIXI.Sprite(tex); s.anchor.set(0.5);
  s.x = Math.random()*canvas.width; s.y = Math.random()*canvas.height;
  s.vx = (Math.random()-0.5)*0.8; s.vy = (Math.random()-0.5)*0.8;
  app.stage.addChild(s); nodes.push(s);
}
const lines = new PIXI.Graphics();
app.stage.addChild(lines);
const tick = () => {
  for (const n of nodes){
    n.x += n.vx; n.y += n.vy;
    if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
    if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
  }
  lines.clear();
  const R2 = 120 * 120;
  for (let i = 0; i < N; i++){
    for (let j = i + 1; j < N; j++){
      const a = nodes[i], b = nodes[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const d2 = dx*dx + dy*dy;
      if (d2 < R2){
        const alpha = 1 - d2 / R2;
        lines.lineStyle({ width: 1, color: 0x22d3ee, alpha: alpha * 0.6 });
        lines.moveTo(a.x, a.y); lines.lineTo(b.x, b.y);
      }
    }
  }
};
app.ticker.add(tick); app.start();
return () => { app.ticker.remove(tick); app.destroy(false, { children: true, texture: true, baseTexture: true }); tex.destroy(true); };
`
  },
  {
    id: 'pixi-gears',
    category: 'pixi',
    contextType: 'webgl',
    title: 'Pixi.js Spinning Gears',
    code: `const PIXI = await import('https://esm.sh/pixi.js@7.4.0');
const app = new PIXI.Application({ view: canvas, width: canvas.width, height: canvas.height, background: 0x010617, antialias: true, autoStart: false });
function makeGear(teeth, r, color){
  const g = new PIXI.Graphics();
  g.beginFill(color);
  const inner = r * 0.78, tooth = r * 1.0;
  const step = Math.PI * 2 / (teeth * 2);
  g.moveTo(tooth, 0);
  for (let i = 1; i <= teeth * 2; i++){
    const a = i * step;
    const rr = (i % 2 === 0) ? tooth : inner;
    g.lineTo(Math.cos(a)*rr, Math.sin(a)*rr);
  }
  g.endFill();
  g.beginFill(0x010617); g.drawCircle(0, 0, r * 0.25); g.endFill();
  return g;
}
const cx = canvas.width / 2, cy = canvas.height / 2;
const g1 = makeGear(18, 90, 0x22d3ee); g1.x = cx - 70; g1.y = cy;
const g2 = makeGear(14, 70, 0xa855f7); g2.x = cx + 80; g2.y = cy - 30;
const g3 = makeGear(10, 50, 0xf472b6); g3.x = cx + 30; g3.y = cy + 90;
app.stage.addChild(g1, g2, g3);
const tick = (delta) => {
  g1.rotation += 0.012 * delta;
  g2.rotation -= 0.012 * delta * (18 / 14);
  g3.rotation += 0.012 * delta * (18 / 10);
};
app.ticker.add(tick); app.start();
return () => { app.ticker.remove(tick); app.destroy(false, { children: true, texture: true, baseTexture: true }); };
`
  },
  {
    id: 'pixi-trail-cursor',
    category: 'pixi',
    contextType: 'webgl',
    title: 'Pixi.js Cursor Trail',
    code: `const PIXI = await import('https://esm.sh/pixi.js@7.4.0');
const app = new PIXI.Application({ view: canvas, width: canvas.width, height: canvas.height, background: 0x010617, antialias: true, autoStart: false });
app.stage.eventMode = 'static';
app.stage.hitArea = app.screen;
const trail = [];
const g = new PIXI.Graphics();
app.stage.addChild(g);
let mx = canvas.width/2, my = canvas.height/2;
app.stage.on('pointermove', (ev) => { const p = ev.data.global; mx = p.x; my = p.y; });
const hint = new PIXI.Text('Move the cursor', { fill: 0xcbd5e1, fontSize: 16 });
hint.x = 16; hint.y = 14; app.stage.addChild(hint);
const tick = () => {
  trail.push({ x: mx, y: my });
  if (trail.length > 60) trail.shift();
  g.clear();
  for (let i = 1; i < trail.length; i++){
    const t = i / trail.length;
    g.lineStyle({ width: 2 + 10 * t, color: 0x22d3ee, alpha: t });
    g.moveTo(trail[i-1].x, trail[i-1].y);
    g.lineTo(trail[i].x, trail[i].y);
  }
};
app.ticker.add(tick); app.start();
return () => { app.ticker.remove(tick); app.destroy(false, { children: true, texture: true, baseTexture: true }); };
`
  }
];

// ---------- state ----------
const currentExample = ref(examples[0]);
const code = ref(currentExample.value.code);
const categories = ['all', '2d', 'webgl', 'webgpu', 'three', 'pixi'];

const CATEGORY_LABELS = {
  all: 'All',
  '2d': '2D',
  webgl: 'WebGL',
  webgpu: 'WebGPU',
  three: 'Three.js',
  pixi: 'Pixi.js',
};
function categoryLabel(c){ return CATEGORY_LABELS[c] || c; }
function pillLabel(c){ return c === 'three' ? 'three' : c === 'pixi' ? 'pixi' : c; }
const selectedCategory = ref('all');
// Fixed category order used for grouping in the sidebar.
const CATEGORY_ORDER = ['2d', 'webgl', 'webgpu', 'three', 'pixi'];

// Group filtered examples by category in CATEGORY_ORDER. Within each group,
// items keep their declaration order from the `examples` array.
const groupedExamples = computed(() => {
  const filterCat = selectedCategory.value;
  const cats = filterCat === 'all' ? CATEGORY_ORDER : [filterCat];
  return cats
    .map(category => ({
      category,
      items: examples.filter(e => e.category === category),
    }))
    .filter(g => g.items.length > 0);
});
const filteredExamples = computed(() => groupedExamples.value.flatMap(g => g.items));
const canvas = ref(null);
const canvasKey = ref(0);
const codeEditor = ref(null);
const modalVisible = ref(false);
const exportFrameworks = ['Angular', 'React', 'Vue', 'Svelte', 'Solid'];
const EXPORT_FRAMEWORK_STORAGE_KEY = 'nativescript-docs-framework';
function getStoredExportFramework(){
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem(EXPORT_FRAMEWORK_STORAGE_KEY);
    if (exportFrameworks.includes(stored)) return stored;
  }
  return 'Angular';
}
const exportFramework = ref(getStoredExportFramework());
const exportTab = ref('');
const exportHighlightedHtml = ref('');
const runError = ref('');
const highlightedHtml = ref('');
const lineCount = computed(() => Math.max(1, (code.value.match(/\n/g)?.length ?? 0) + 1));
let currentCleanup = null;
let runToken = 0;
let highlighter = null;
let highlightTimer = null;
let exportHighlightTimer = null;
const EXAMPLE_QUERY_PARAM = 'example';
const isDarkMode = ref(typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));
const currentHighlightTheme = computed(() => (isDarkMode.value ? 'github-dark' : 'github-light'));
const exportFiles = computed(() => generateExportBundle(currentExample.value, exportFramework.value));
const activeExportFile = computed(() => exportFiles.value.find(file => file.id === exportTab.value) || exportFiles.value[0] || null);
const exportContent = computed(() => activeExportFile.value?.content || '');
const currentExportLanguage = computed(() => activeExportFile.value?.language || 'typescript');
const currentExportKind = computed(() => activeExportFile.value?.kind || 'Component file');
const currentExportNote = computed(() => activeExportFile.value?.note || 'Use this export as the starting point for your framework integration.');
const downloadLabel = computed(() => exportFiles.value.length > 1 ? 'Download all files' : 'Download file');
const exportFileCopy = computed(() => ({
  item: exportFiles.value.length > 1 ? 'these files' : 'this file',
  pronoun: exportFiles.value.length > 1 ? 'them' : 'it',
}));
let themeObserver = null;
let frameworkChangeHandler = null;

// AsyncFunction constructor — supports top-level await in user code.
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

function escapeHtml(value){
  return (value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function syncThemeMode(){
  if (typeof document === 'undefined') return;
  isDarkMode.value = document.documentElement.classList.contains('dark');
}

function setExportFramework(framework){
  if (!exportFrameworks.includes(framework) || exportFramework.value === framework) return;
  exportFramework.value = framework;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(EXPORT_FRAMEWORK_STORAGE_KEY, framework);
    window.dispatchEvent(new CustomEvent('framework-change', { detail: framework }));
  }
}

watch(exportFiles, (files) => {
  if (!files.length) {
    exportTab.value = '';
    return;
  }
  if (!files.some(file => file.id === exportTab.value)) {
    exportTab.value = files[0].id;
  }
}, { immediate: true });

// ---------- syntax highlighter ----------
async function ensureHighlighter(){
  if (highlighter) return highlighter;
  highlighter = await createHighlighter({
    themes: ['github-dark', 'github-light'],
    langs: ['javascript', 'typescript', 'xml', 'html', 'tsx', 'vue', 'svelte'],
  });
  return highlighter;
}

function renderHighlight(){
  if (!highlighter) {
    // Fallback: plain text inside a <pre> so widths still match the textarea
    // until the highlighter finishes loading.
    const esc = escapeHtml(code.value || '');
    highlightedHtml.value = `<pre><code>${esc}</code></pre>`;
    return;
  }
  // Append a trailing newline so the highlighted block grows with the
  // textarea when the user adds a newline at the very end.
  const src = (code.value || '') + '\n';
  highlightedHtml.value = highlighter.codeToHtml(src, {
    lang: 'javascript',
    theme: currentHighlightTheme.value,
  });
}

function renderExportHighlight(){
  if (!highlighter) {
    const esc = escapeHtml(exportContent.value || '');
    exportHighlightedHtml.value = `<pre><code>${esc}</code></pre>`;
    return;
  }
  const src = (exportContent.value || '') + '\n';
  exportHighlightedHtml.value = highlighter.codeToHtml(src, {
    lang: currentExportLanguage.value,
    theme: currentHighlightTheme.value,
  });
}

function scheduleHighlight(){
  if (highlightTimer) cancelAnimationFrame(highlightTimer);
  highlightTimer = requestAnimationFrame(renderHighlight);
}

function scheduleExportHighlight(){
  if (exportHighlightTimer) cancelAnimationFrame(exportHighlightTimer);
  exportHighlightTimer = requestAnimationFrame(renderExportHighlight);
}

watch([code, currentHighlightTheme], scheduleHighlight, { flush: 'post' });
watch([exportContent, currentExportLanguage, currentHighlightTheme], scheduleExportHighlight, { flush: 'post' });

// ---------- editor interactions ----------
function syncScroll(){
  const ta = codeEditor.value;
  const pre = highlightPre.value;
  const g = gutter.value;
  if (!ta) return;
  if (pre) {
    pre.scrollTop = ta.scrollTop;
    pre.scrollLeft = ta.scrollLeft;
  }
  if (g) g.style.transform = `translateY(${-ta.scrollTop}px)`;
}

function onTab(e){
  const ta = codeEditor.value;
  if (!ta) return;
  const start = ta.selectionStart;
  const end = ta.selectionEnd;
  const indent = '  ';
  // Shift+Tab → outdent if at line start
  if (e.shiftKey){
    const lineStart = code.value.lastIndexOf('\n', start - 1) + 1;
    const slice = code.value.slice(lineStart, lineStart + 2);
    if (slice === indent){
      code.value = code.value.slice(0, lineStart) + code.value.slice(lineStart + 2);
      nextTick(() => { ta.selectionStart = ta.selectionEnd = Math.max(lineStart, start - 2); });
    }
    return;
  }
  // Plain Tab → insert two spaces at the caret
  code.value = code.value.slice(0, start) + indent + code.value.slice(end);
  nextTick(() => { ta.selectionStart = ta.selectionEnd = start + indent.length; });
}

function findExample(id){
  return examples.find(e => e.id === id) || null;
}

function syncSelectedExampleToUrl(id, { replace = false } = {}){
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (url.searchParams.get(EXAMPLE_QUERY_PARAM) === id) return;
  url.searchParams.set(EXAMPLE_QUERY_PARAM, id);
  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  const method = replace ? 'replaceState' : 'pushState';
  window.history[method](window.history.state, '', nextUrl);
}

function resolveExampleFromUrl(){
  if (typeof window === 'undefined') return examples[0] || null;
  const id = new URL(window.location.href).searchParams.get(EXAMPLE_QUERY_PARAM);
  return findExample(id) || examples[0] || null;
}

function ensureExampleIsVisible(example){
  if (!example) return;
  if (selectedCategory.value !== 'all' && selectedCategory.value !== example.category) {
    selectedCategory.value = 'all';
  }
}

function selectExample(id, { syncUrl = true, replaceUrl = false } = {}){
  const ex = examples.find(e => e.id === id);
  if (!ex) return;
  ensureExampleIsVisible(ex);
  currentExample.value = ex;
  code.value = ex.code;
  if (syncUrl) syncSelectedExampleToUrl(ex.id, { replace: replaceUrl });
  nextTick(runSelected);
}

function resetCode(){
  code.value = currentExample.value.code;
  nextTick(runSelected);
}

watch(selectedCategory, () => {
  const list = filteredExamples.value;
  if (!list.length) return;
  if (list.some(ex => ex.id === currentExample.value.id)) return;
  selectExample(list[0].id);
});

function stopCurrent(){
  if (currentCleanup){
    try { currentCleanup(); } catch (e) { /* ignore */ }
    currentCleanup = null;
  }
}

function sizeCanvas(c){
  const dpr = window.devicePixelRatio || 1;
  const rect = c.getBoundingClientRect();
  const w = Math.max(1, Math.round((rect.width  || 600) * dpr));
  const h = Math.max(1, Math.round((rect.height || 400) * dpr));
  c.width = w; c.height = h;
  return dpr;
}

async function runSelected(){
  runError.value = '';
  stopCurrent();
  const myToken = ++runToken;

  // Force Vue to recreate the <canvas> element via :key so the next sample
  // can pick whatever context type it wants — a canvas can never switch
  // context type once it has one, so we always start from a virgin element.
  canvasKey.value++;
  await nextTick();
  // Wait one animation frame so the browser has actually laid out the new
  // <canvas>; otherwise getBoundingClientRect can return zero on first paint
  // and the sample draws into a 1x1 surface.
  await new Promise(r => requestAnimationFrame(r));

  const c = canvas.value;
  if (!c) return;
  const dpr = sizeCanvas(c);

  // Only create the 2D context up-front for 2D samples. WebGL/WebGPU samples
  // must call getContext themselves on a clean canvas.
  const ctx = currentExample.value.contextType === '2d' ? c.getContext('2d') : null;

  let fn;
  try {
    fn = new AsyncFunction('canvas', 'ctx', 'dpr', code.value || '');
  } catch (err){
    runError.value = 'Compile error: ' + (err && err.message ? err.message : String(err));
    return;
  }

  try {
    const result = await fn(c, ctx, dpr);
    if (myToken !== runToken) {
      // A newer run started while we awaited; cancel this one if it returned cleanup.
      if (typeof result === 'function'){ try { result(); } catch(e) {} }
      return;
    }
    if (typeof result === 'function') currentCleanup = result;
  } catch (err){
    runError.value = (err && err.message ? err.message : String(err));
    // eslint-disable-next-line no-console
    console.error('Playground sample error:', err);
  }
}

// ---------- NativeScript export ----------
function escapeBackticks(s){ return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${'); }

function toPascalCase(value){
  return String(value || '')
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function toKebabCase(value){
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'canvas-sample';
}

function mimeForLanguage(language){
  return {
    html: 'text/html',
    xml: 'application/xml',
    typescript: 'text/typescript',
    tsx: 'text/typescript',
    vue: 'text/plain',
    svelte: 'text/plain',
  }[language] || 'text/plain';
}

function buildExportHeader(example, framework, installNotes){
  return [
    '// Generated by the Canvas Playground.',
    `// Sample: ${example.title} (${example.category})`,
    `// Framework: ${framework}`,
    ...installNotes,
  ].join('\n');
}

function buildRunnerSource(userCode, ctxType){
  return `const USER_CODE = \`${escapeBackticks(userCode)}\`;

async function runCanvasSample(canvas: any) {
  if (!canvas) return null;
  const dpr = (globalThis as any).devicePixelRatio || 1;
  const ctx = ${JSON.stringify(ctxType)} === "2d" ? canvas.getContext("2d") : null;

  try {
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor as any;
    const fn = new AsyncFunction("canvas", "ctx", "dpr", USER_CODE);
    const result = await fn(canvas, ctx, dpr);
    return typeof result === "function" ? (result as () => void) : null;
  } catch (err) {
    console.log("Canvas sample error:", err);
    return null;
  }
}`;
}

function prepareExportAssets(example, framework){
  let userCode = example.code;
  const extraImports = [];
  const installNotes = [
    `// Ensure @nativescript/canvas is installed in your NativeScript ${framework} app.`,
  ];

  if (example.category === 'three') {
    userCode = userCode.replace(
      /await import\(['"]https:\/\/esm\.sh\/three[^'"]*['"]\)/g,
      'await import("three")'
    );
    extraImports.push('import "@nativescript/canvas-polyfill";');
    installNotes.push('// Also install three and @nativescript/canvas-polyfill before using this sample.');
  } else if (example.category === 'pixi') {
    userCode = userCode.replace(
      /await import\(['"]https:\/\/esm\.sh\/pixi\.js[^'"]*['"]\)/g,
      'await import("pixi.js")'
    );
    extraImports.push('import "@nativescript/canvas-pixi";');
    installNotes.push('// Also install pixi.js and @nativescript/canvas-pixi before using this sample.');
  }

  const slug = toKebabCase(example.id);
  const componentName = `${toPascalCase(example.id)}CanvasSample`;

  return {
    slug,
    componentName,
    extraImportsText: extraImports.join('\n'),
    header: buildExportHeader(example, framework, installNotes),
    runner: buildRunnerSource(userCode, example.contextType),
  };
}

function createAngularExport(example, assets){
  const templateFile = `${assets.slug}.component.html`;
  const scriptFile = `${assets.slug}.component.ts`;
  const extraImportsBlock = assets.extraImportsText ? `${assets.extraImportsText}\n` : '';
  const template = `<GridLayout rows="*">
  <Canvas #canvas row="0"></Canvas>
</GridLayout>
`;
  const script = `import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from "@angular/core";
import "@nativescript/canvas";
${extraImportsBlock}${assets.header}

${assets.runner}

@Component({
  selector: "ns-${assets.slug}-canvas-sample",
  templateUrl: "./${templateFile}",
})
export class ${assets.componentName}Component implements AfterViewInit, OnDestroy {
  @ViewChild("canvas", { static: false }) canvasRef?: ElementRef<any>;
  private cleanup: (() => void) | null = null;

  async ngAfterViewInit() {
    this.cleanup = await runCanvasSample(this.canvasRef?.nativeElement);
  }

  ngOnDestroy() {
    if (this.cleanup) { try { this.cleanup(); } catch (e) {} this.cleanup = null; }
  }
}
`;
  return [
    {
      id: templateFile,
      label: templateFile,
      filename: templateFile,
      language: 'html',
      kind: 'Component template',
      note: 'Use this Angular template alongside the component class in the same routed page.',
      mime: mimeForLanguage('html'),
      content: template,
    },
    {
      id: scriptFile,
      label: scriptFile,
      filename: scriptFile,
      language: 'typescript',
      kind: 'Component logic',
      note: 'Use this Angular component class with the template and declare it in the route or feature module where you want the sample to render.',
      mime: mimeForLanguage('typescript'),
      content: script,
    },
  ];
}

function createReactExport(example, assets){
  const filename = `${assets.slug}.react.tsx`;
  const extraImportsBlock = assets.extraImportsText ? `${assets.extraImportsText}\n` : '';
  const content = `import * as React from "react";
import "@nativescript/canvas";
${extraImportsBlock}${assets.header}

${assets.runner}

const GridLayout: any = "gridLayout";
const CanvasView: any = "Canvas";

export function ${assets.componentName}() {
  const canvasRef = React.useRef<any>(null);
  const cleanupRef = React.useRef<(() => void) | null>(null);

  React.useEffect(() => {
    let disposed = false;

    void (async () => {
      const cleanup = await runCanvasSample(canvasRef.current?.nativeView || canvasRef.current);
      if (disposed) {
        if (cleanup) { try { cleanup(); } catch (e) {} }
        return;
      }
      cleanupRef.current = cleanup;
    })();

    return () => {
      disposed = true;
      if (cleanupRef.current) { try { cleanupRef.current(); } catch (e) {} cleanupRef.current = null; }
    };
  }, []);

  return (
    <GridLayout rows="*">
      <CanvasView ref={canvasRef} row={0} />
    </GridLayout>
  );
}

export default ${assets.componentName};
`;
  return [{
    id: filename,
    label: filename,
    filename,
    language: 'tsx',
    kind: 'TSX component',
    note: 'Use this React NativeScript component inside the screen or route where you want the canvas sample to render.',
    mime: mimeForLanguage('tsx'),
    content,
  }];
}

function createVueExport(example, assets){
  const filename = `${assets.slug}.vue`;
  const extraImportsBlock = assets.extraImportsText ? `${assets.extraImportsText}\n` : '';
  const content = `<template>
  <GridLayout rows="*">
    <Canvas ref="canvasEl" row="0" />
  </GridLayout>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import "@nativescript/canvas";
${extraImportsBlock}${assets.header}

${assets.runner}

const canvasEl = ref<any>(null);
let cleanup: (() => void) | null = null;

onMounted(async () => {
  cleanup = await runCanvasSample(canvasEl.value?.nativeView || canvasEl.value);
});

onBeforeUnmount(() => {
  if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
});
<\/script>
`;
  return [{
    id: filename,
    label: filename,
    filename,
    language: 'vue',
    kind: 'Single-file component',
    note: 'Use this Vue single-file component in the routed page or view where you want the sample to render.',
    mime: mimeForLanguage('vue'),
    content,
  }];
}

function createSvelteExport(example, assets){
  const filename = `${assets.slug}.svelte`;
  const extraImportsBlock = assets.extraImportsText ? `${assets.extraImportsText}\n` : '';
  const content = `<script lang="ts">
  import { onMount } from "svelte";
  import "@nativescript/canvas";
  ${extraImportsBlock}${assets.header}

  ${assets.runner}

  let canvasEl: any;
  let cleanup: (() => void) | null = null;

  onMount(() => {
    let disposed = false;

    void (async () => {
      const nextCleanup = await runCanvasSample(canvasEl?.nativeView || canvasEl);
      if (disposed) {
        if (nextCleanup) { try { nextCleanup(); } catch (e) {} }
        return;
      }
      cleanup = nextCleanup;
    })();

    return () => {
      disposed = true;
      if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
    };
  });
<\/script>

<GridLayout rows="*">
  <Canvas bind:this={canvasEl} row="0" />
</GridLayout>
`;
  return [{
    id: filename,
    label: filename,
    filename,
    language: 'svelte',
    kind: 'Svelte component',
    note: 'Use this Svelte component in the route or page where you want the canvas sample to render.',
    mime: mimeForLanguage('svelte'),
    content,
  }];
}

function createSolidExport(example, assets){
  const filename = `${assets.slug}.solid.tsx`;
  const extraImportsBlock = assets.extraImportsText ? `${assets.extraImportsText}\n` : '';
  const content = `import { onCleanup, onMount } from "solid-js";
import "@nativescript/canvas";
${extraImportsBlock}${assets.header}

${assets.runner}

const GridLayout: any = "gridLayout";
const CanvasView: any = "Canvas";

export default function ${assets.componentName}() {
  let canvasEl: any;
  let cleanup: (() => void) | null = null;

  onMount(() => {
    void (async () => {
      cleanup = await runCanvasSample(canvasEl?.nativeView || canvasEl);
    })();
  });

  onCleanup(() => {
    if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
  });

  return (
    <GridLayout rows="*">
      <CanvasView ref={canvasEl} row={0} />
    </GridLayout>
  );
}
`;
  return [{
    id: filename,
    label: filename,
    filename,
    language: 'tsx',
    kind: 'TSX component',
    note: 'Use this Solid component in the route or page where you want the canvas sample to render.',
    mime: mimeForLanguage('tsx'),
    content,
  }];
}

function generateExportBundle(example, framework){
  const assets = prepareExportAssets(example, framework);
  switch (framework) {
    case 'React':
      return createReactExport(example, assets);
    case 'Vue':
      return createVueExport(example, assets);
    case 'Svelte':
      return createSvelteExport(example, assets);
    case 'Solid':
      return createSolidExport(example, assets);
    case 'Angular':
    default:
      return createAngularExport(example, assets);
  }
}

function openExport(){
  if (exportFiles.value.length && !exportFiles.value.some(file => file.id === exportTab.value)) {
    exportTab.value = exportFiles.value[0].id;
  }
  modalVisible.value = true;
}

function setExportTab(tab){
  exportTab.value = tab;
}

function copyExport(){
  const text = exportContent.value;
  if (navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(
      () => { /* could toast */ },
      () => { /* ignore */ }
    );
  }
}

function downloadExport(){
  const trigger = (data, name, mime) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([data], { type: mime }));
    a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  };
  exportFiles.value.forEach(file => {
    trigger(file.content, file.filename, file.mime || mimeForLanguage(file.language));
  });
}

function closeModal(){ modalVisible.value = false; }

// ---------- lifecycle ----------
let resizeObs = null;
let onPopState = null;
let resizeRerunFrame = null;

onMounted(async () => {
  // Mark the VPDoc as a landing page so we can use full-width layout.
  vpDocRoot = rootRef.value?.closest('.VPDoc');
  vpDocRoot?.classList.add('docs-landing-page');
  contentContainer = vpDocRoot?.querySelector('.content-container')
    || rootRef.value?.closest('.content-container');
  contentContainer?.classList.add('docs-landing-container');
  document.body.classList.add('canvas-playground-active');

  syncThemeMode();
  if (typeof MutationObserver !== 'undefined') {
    themeObserver = new MutationObserver(syncThemeMode);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }
  if (typeof window !== 'undefined') {
    frameworkChangeHandler = (event) => {
      const nextFramework = event?.detail;
      if (exportFrameworks.includes(nextFramework) && nextFramework !== exportFramework.value) {
        exportFramework.value = nextFramework;
      }
    };
    window.addEventListener('framework-change', frameworkChangeHandler);
  }

  // Render an immediate (unhighlighted) view, then upgrade once shiki loads.
  renderHighlight();
  renderExportHighlight();
  ensureHighlighter().then(() => {
    renderHighlight();
    renderExportHighlight();
  }).catch(() => { /* keep plain */ });

  const initialExample = resolveExampleFromUrl();
  if (initialExample) {
    selectExample(initialExample.id, { replaceUrl: true });
  }

  onPopState = () => {
    const nextExample = resolveExampleFromUrl();
    if (nextExample) {
      selectExample(nextExample.id, { syncUrl: false });
    }
  };
  window.addEventListener('popstate', onPopState);

  // Resize the backing store on container size changes, but only refit;
  // don't auto-restart the sample (that's annoying mid-edit).
  resizeObs = new ResizeObserver(() => {
    const c = canvas.value;
    if (!c) return;
    sizeCanvas(c);
    // Static samples draw once, so resizing the backing store clears them.
    // Re-run those samples after layout settles; animated samples repaint on
    // their next frame, so leave them alone.
    if (currentCleanup || resizeRerunFrame) return;
    resizeRerunFrame = requestAnimationFrame(() => {
      resizeRerunFrame = null;
      runSelected();
    });
  });
  if (canvasWrap.value) resizeObs.observe(canvasWrap.value);
});

onUnmounted(() => {
  stopCurrent();
  if (resizeObs) resizeObs.disconnect();
  if (onPopState) window.removeEventListener('popstate', onPopState);
  if (resizeRerunFrame) cancelAnimationFrame(resizeRerunFrame);
  if (exportHighlightTimer) cancelAnimationFrame(exportHighlightTimer);
  if (themeObserver) themeObserver.disconnect();
  if (frameworkChangeHandler) window.removeEventListener('framework-change', frameworkChangeHandler);
  contentContainer?.classList.remove('docs-landing-container');
  vpDocRoot?.classList.remove('docs-landing-page');
  document.body.classList.remove('canvas-playground-active');
});
</script>

<style scoped>
.canvas-playground {
  --playground-code-bg: #f6f8fa;
  --playground-code-gutter-bg: #ffffff;
  --playground-code-gutter-color: #8c959f;
  --playground-code-gutter-border: rgba(31,35,40,0.08);
  --playground-code-text: #24292f;
  --playground-code-caret: #24292f;
  --playground-code-selection: rgba(9,105,218,0.22);
  --playground-code-scrollbar-thumb: rgba(31,35,40,0.16);
  display: flex;
  /* Fill the page below VitePress's top nav. dvh accounts for dynamic UI
     (mobile address bar, etc.); fall back to vh for older browsers. */
  height: calc(100vh - var(--vp-nav-height, 64px));
  height: calc(100dvh - var(--vp-nav-height, 64px));
  min-height: 560px;
  /* Inherit the site's body background — including the radial gradient — so
     the playground reads as the page itself, not an embedded widget. */
  background: transparent;
  color: var(--vp-c-text-1);
  /* Clip any sub-pixel overflow so card corners stay rounded inside the viewport. */
  overflow: hidden;
  box-sizing: border-box;
}
.canvas-playground.is-dark {
  --playground-code-bg: #0d1117;
  --playground-code-gutter-bg: #0d1117;
  --playground-code-gutter-color: #6e7681;
  --playground-code-gutter-border: rgba(255,255,255,0.06);
  --playground-code-text: #e6edf3;
  --playground-code-caret: #e6edf3;
  --playground-code-selection: rgba(56,139,253,0.35);
  --playground-code-scrollbar-thumb: rgba(255,255,255,0.10);
}
.canvas-playground .sidebar {
  width: 280px; padding: 0;
  background: var(--vp-c-bg);
  border-right: 1px solid var(--vp-c-divider);
  display: flex; flex-direction: column;
}
.canvas-playground .sidebar-head { padding: 16px 16px 12px; border-bottom: 1px solid var(--vp-c-divider); }
.canvas-playground .sidebar-head .title-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.canvas-playground h2 {
  /* Override VitePress's default `.vp-doc h2` which adds a top border + padding. */
  margin: 0; padding: 0; border: 0;
  font-size: 16px; font-weight: 700; letter-spacing: -0.01em; color: var(--vp-c-text-1);
}
.canvas-playground .badge {
  font-size: 11px; font-weight: 600; padding: 2px 8px;
  background: var(--vp-c-brand-soft); color: var(--vp-c-brand-1); border-radius: 999px;
  font-variant-numeric: tabular-nums;
}
.canvas-playground .subtitle { margin: 6px 0 0; font-size: 12px; color: var(--vp-c-text-2); line-height: 1.5; }
.canvas-playground .examples { flex: 1; overflow: auto; padding: 4px 10px 10px; scrollbar-width: thin; }
.canvas-playground .examples::-webkit-scrollbar { width: 8px; }
.canvas-playground .examples::-webkit-scrollbar-thumb { background: var(--vp-c-divider); border-radius: 4px; }
.canvas-playground .examples::-webkit-scrollbar-track { background: transparent; }
.canvas-playground .group-header {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 6px 6px;
  position: sticky; top: 0;
  background: var(--vp-c-bg);
  z-index: 2;
}
.canvas-playground .group-header .group-label { font-size: 11px; color: var(--vp-c-text-2); font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }
.canvas-playground .group-header .group-count {
  margin-left: auto; font-size: 10px; color: var(--vp-c-text-3);
  background: var(--vp-c-default-soft); padding: 1px 7px; border-radius: 999px;
  font-variant-numeric: tabular-nums;
}
.canvas-playground .example-list { list-style: none; padding: 0; margin: 0 0 4px 0; }
.canvas-playground .example-list li {
  padding: 7px 10px; border-radius: 8px; margin-bottom: 2px; cursor: pointer;
  display: flex; align-items: center; gap: 8px; font-size: 13.5px;
  color: var(--vp-c-text-2);
  transition: background 100ms ease, color 100ms ease;
  border-left: 3px solid transparent;
}
.canvas-playground .example-list li .title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.canvas-playground .example-list li:hover { background: var(--vp-c-default-soft); color: var(--vp-c-text-1); }
.canvas-playground .example-list li.active {
  background: var(--vp-c-brand-soft);
  border-left-color: var(--vp-c-brand-1);
  color: var(--vp-c-text-1);
  padding-left: 7px;
}
.canvas-playground .pill {
  font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em;
  padding: 2px 6px; border-radius: 999px; background: rgba(255,255,255,0.06);
  color: #cbd5e1;
}
.canvas-playground .pill[data-cat="webgl"]  { background: rgba(244,114,182,0.15); color: #f9a8d4; }
.canvas-playground .pill[data-cat="webgpu"] { background: rgba(168,85,247,0.18);  color: #d8b4fe; }
.canvas-playground .pill[data-cat="2d"]     { background: rgba(34,211,238,0.15);  color: #67e8f9; }
.canvas-playground .pill[data-cat="three"]  { background: rgba(74,222,128,0.16);  color: #86efac; }
.canvas-playground .pill[data-cat="pixi"]   { background: rgba(251,146,60,0.16);  color: #fdba74; }
.canvas-playground .category-select { padding: 12px 14px 6px; }
.canvas-playground .category-select label {
  display: block; color: var(--vp-c-text-3); font-size: 11px; margin-bottom: 6px;
  text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600;
}
.canvas-playground .category-select select {
  width: 100%; padding: 8px 10px; border-radius: 8px;
  background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider); color: var(--vp-c-text-1);
  font-size: 13px; cursor: pointer;
}
.canvas-playground .category-select select:focus { outline: none; border-color: var(--vp-c-brand-1); }
.canvas-playground .main {
  flex: 1; display: flex; flex-direction: column;
  padding: 16px; gap: 16px;
  min-width: 0; min-height: 0;
}
.canvas-playground .canvas-wrap {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  background: var(--vp-c-bg-soft);
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  /* Equal padding on all four sides — the canvas inside sits with uniform
     breathing room top, right, bottom and left. */
  padding: 16px;
  overflow: hidden;
}
.canvas-playground canvas {
  width: 100%; height: 100%; border-radius: 10px;
  background: #010617;
  display: block;
}
.canvas-playground .error-banner {
  position: absolute; left: 20px; right: 20px; bottom: 20px;
  background: rgba(220,38,38,0.92); color: white;
  padding: 10px 12px; border-radius: 8px; font: 13px ui-monospace, Menlo, monospace;
  box-shadow: 0 10px 24px -10px rgba(0,0,0,0.6);
}
.canvas-playground .editor {
  flex: 0 0 44%;
  min-height: 180px;
  display: flex; flex-direction: column;
  border-radius: 12px; overflow: hidden;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
}
.canvas-playground .editor-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 12px;
  background: var(--vp-c-bg-alt); border-bottom: 1px solid var(--vp-c-divider);
}
.canvas-playground .file-tab { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--vp-c-text-1); }
.canvas-playground .file-tab .filename { font-family: ui-monospace, Menlo, monospace; }
.canvas-playground .file-tab .muted { color: var(--vp-c-text-2); font-size: 12px; }
.canvas-playground .file-tab .dot {
  width: 10px; height: 10px; border-radius: 999px;
  background: #22d3ee; box-shadow: 0 0 8px rgba(34,211,238,0.6);
}
.canvas-playground .file-tab .dot[data-cat="webgl"]  { background: #f472b6; box-shadow: 0 0 8px rgba(244,114,182,0.6); }
.canvas-playground .file-tab .dot[data-cat="webgpu"] { background: #a855f7; box-shadow: 0 0 8px rgba(168,85,247,0.6); }
.canvas-playground .file-tab .dot[data-cat="three"]  { background: #4ade80; box-shadow: 0 0 8px rgba(74,222,128,0.6); }
.canvas-playground .file-tab .dot[data-cat="pixi"]   { background: #fb923c; box-shadow: 0 0 8px rgba(251,146,60,0.6); }
.canvas-playground .editor-actions { display: flex; gap: 6px; }
.canvas-playground .editor-actions button.ghost {
  padding: 5px 12px; font-size: 12px; font-weight: 500;
  border: 1px solid var(--vp-c-divider); border-radius: 6px;
  background: transparent; color: var(--vp-c-text-2); cursor: pointer;
  display: inline-flex; align-items: center; gap: 5px;
  transition: all 120ms ease;
}
.canvas-playground .editor-actions button.ghost:hover {
  background: var(--vp-c-default-soft); color: var(--vp-c-text-1);
  border-color: var(--vp-c-divider);
}
.canvas-playground .editor-actions button.ghost.run {
  background: var(--vp-c-brand-1); color: white; border-color: transparent;
}
.canvas-playground .editor-actions button.ghost.run:hover {
  background: var(--vp-c-brand-2); color: white;
}
.canvas-playground .editor-actions button.ghost.export {
  border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1);
}
.canvas-playground .editor-actions button.ghost.export:hover {
  background: var(--vp-c-brand-soft); color: var(--vp-c-brand-1);
}

.canvas-playground .code-editor {
  flex: 1; display: flex; min-height: 0;
  background: var(--playground-code-bg);
  font-family: 'Fira Code', 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  line-height: 1.55;
  tab-size: 2;
}
.canvas-playground .gutter {
  width: 44px; flex-shrink: 0;
  color: var(--playground-code-gutter-color);
  background: var(--playground-code-gutter-bg);
  border-right: 1px solid var(--playground-code-gutter-border);
  overflow: hidden;
  user-select: none;
  font-variant-numeric: tabular-nums;
}
.canvas-playground .gutter-inner {
  padding: 12px 8px;
  text-align: right;
  will-change: transform;
}
.canvas-playground .gutter .ln { height: calc(1.55em); line-height: 1.55; }
.canvas-playground .code-area {
  position: relative; flex: 1; min-width: 0;
}
.canvas-playground .code-area .highlight,
.canvas-playground .code-area textarea {
  position: absolute; inset: 0;
  margin: 0; padding: 12px 14px;
  font: inherit;
  line-height: 1.55;
  white-space: pre;
  overflow: auto;
  box-sizing: border-box;
  tab-size: 2;
}
.canvas-playground .code-area .highlight {
  pointer-events: none;
  color: var(--playground-code-text);
  background: transparent;
  /* Hide the highlight's scrollbars; the textarea owns scrolling input. */
  scrollbar-width: none;
}
.canvas-playground .code-area .highlight::-webkit-scrollbar { display: none; }
.canvas-playground .code-area .highlight :deep(pre),
.canvas-playground .code-area .highlight :deep(code) {
  background: transparent !important;
  margin: 0; padding: 0;
  font-family: inherit; font-size: inherit; line-height: inherit;
}
.canvas-playground .code-area textarea {
  width: 100%; height: 100%;
  border: 0; resize: none;
  background: transparent;
  color: transparent;
  caret-color: var(--playground-code-caret);
  outline: none;
}
.canvas-playground .code-area textarea::selection { background: var(--playground-code-selection); color: transparent; }
.canvas-playground .code-area textarea::-webkit-scrollbar { width: 10px; height: 10px; }
.canvas-playground .code-area textarea::-webkit-scrollbar-thumb { background: var(--playground-code-scrollbar-thumb); border-radius: 5px; }
.canvas-playground .code-area textarea::-webkit-scrollbar-track { background: transparent; }
.canvas-playground .modal {
  position: fixed; inset: 0; display: flex; align-items: center; justify-content: center;
  padding: 24px;
  background: rgba(0,0,0,0.55); z-index: 50;
  backdrop-filter: blur(8px);
}
.canvas-playground .modal-content {
  display: grid;
  gap: 18px;
  background: var(--vp-c-bg); padding: 24px; border-radius: 18px;
  width: min(980px, 100%); max-height: min(88vh, 920px); overflow: auto;
  border: 1px solid var(--vp-c-divider);
  box-shadow: 0 24px 64px -28px rgba(0,0,0,0.55);
}
.canvas-playground .modal-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.canvas-playground .modal-copy { min-width: 0; }
.canvas-playground .modal-close {
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: transform 120ms ease, background 120ms ease, color 120ms ease, border-color 120ms ease;
}
.canvas-playground .modal-close:hover {
  transform: translateY(-1px);
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-1);
}
.canvas-playground .modal-content h3 {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: clamp(1.75rem, 2vw, 2.2rem);
  line-height: 1.05;
  letter-spacing: -0.02em;
}
.canvas-playground .modal-content .muted {
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 1.6;
  margin: 10px 0 0;
  max-width: 58ch;
}
.canvas-playground .framework-switcher {
  display: flex;
  gap: 0;
  overflow-x: auto;
  border-bottom: 1px solid var(--vp-c-divider);
  scrollbar-width: none;
}
.canvas-playground .framework-switcher::-webkit-scrollbar { display: none; }
.canvas-playground .framework-switcher-button {
  flex: 0 0 auto;
  padding: 0.625rem 1rem;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.2s ease, border-color 0.2s ease;
}
.canvas-playground .framework-switcher-button:hover {
  color: var(--vp-c-brand-1);
}
.canvas-playground .framework-switcher-button.active {
  color: var(--vp-c-brand-1);
  border-bottom-color: var(--vp-c-brand-1);
}
.canvas-playground .modal-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.canvas-playground .tabs {
  display: inline-flex;
  gap: 4px;
  margin: 0;
  padding: 4px;
  border-radius: 14px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
}
.canvas-playground .tabs button {
  min-height: 38px;
  padding: 0 16px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-weight: 600;
  transition: background 120ms ease, color 120ms ease, border-color 120ms ease, box-shadow 120ms ease;
}
.canvas-playground .tabs button:hover { background: var(--vp-c-default-soft); color: var(--vp-c-text-1); }
.canvas-playground .tabs button.active {
  background: var(--vp-c-brand-1);
  color: white;
  box-shadow: 0 14px 30px -20px rgba(247,89,48,0.75);
}
.canvas-playground .export-kind {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-2);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.canvas-playground .exportArea {
  background: var(--playground-code-bg); padding: 18px 20px; border-radius: 14px;
  border: 1px solid var(--playground-code-gutter-border);
  color: var(--playground-code-text); font-size: 12.5px;
  line-height: 1.6;
  font-family: 'Fira Code', 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  min-height: 220px;
  max-height: 50vh; overflow: auto;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
}
.canvas-playground .exportArea::-webkit-scrollbar { width: 10px; height: 10px; }
.canvas-playground .exportArea::-webkit-scrollbar-thumb { background: var(--playground-code-scrollbar-thumb); border-radius: 5px; }
.canvas-playground .exportArea::-webkit-scrollbar-track { background: transparent; }
.canvas-playground .exportArea :deep(pre),
.canvas-playground .exportArea :deep(code) {
  background: transparent !important;
  margin: 0; padding: 0;
  font-family: inherit; font-size: inherit; line-height: inherit;
}
.canvas-playground .modal-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 0;
  padding-top: 16px;
  border-top: 1px solid var(--vp-c-divider);
}
.canvas-playground .modal-note {
  margin: 0;
  max-width: 42ch;
  color: var(--vp-c-text-2);
  font-size: 12.5px;
  line-height: 1.6;
}
.canvas-playground .modal-action-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.canvas-playground .modal-actions button {
  min-height: 44px;
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid transparent;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: transform 120ms ease, background 120ms ease, border-color 120ms ease, color 120ms ease, box-shadow 120ms ease;
}
.canvas-playground .modal-actions button svg { flex-shrink: 0; }
.canvas-playground .modal-actions button:hover { transform: translateY(-1px); }
.canvas-playground .modal-actions button.secondary {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.canvas-playground .modal-actions button.secondary:hover {
  background: var(--vp-c-default-soft);
}
.canvas-playground .modal-actions button.primary {
  background: var(--vp-c-brand-1);
  color: white;
  box-shadow: 0 18px 32px -22px rgba(247,89,48,0.85);
}
.canvas-playground .modal-actions button.primary:hover {
  background: var(--vp-c-brand-2);
  box-shadow: 0 20px 34px -22px rgba(247,89,48,0.92);
}
.canvas-playground .modal-actions button.ghost {
  background: transparent;
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-2);
}
.canvas-playground .modal-actions button.ghost:hover {
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-1);
}

@media (max-width: 760px) {
  .canvas-playground .modal {
    padding: 16px;
    align-items: flex-end;
  }

  .canvas-playground .modal-content {
    width: 100%;
    padding: 20px;
    border-radius: 18px;
  }

  .canvas-playground .modal-header {
    gap: 12px;
  }

  .canvas-playground .framework-switcher {
    margin-inline: -4px;
    padding-inline: 4px;
  }

  .canvas-playground .modal-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .canvas-playground .modal-note {
    max-width: none;
  }

  .canvas-playground .modal-action-group {
    width: 100%;
  }

  .canvas-playground .modal-action-group button {
    flex: 1 1 calc(50% - 5px);
    justify-content: center;
  }
}
</style>
