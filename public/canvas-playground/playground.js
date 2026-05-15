/* Canvas Playground JS
   - Provides examples
   - Runs samples in a canvas
   - Exports XML + TypeScript snippets for NativeScript
*/
(function(){
  const examples = [
    {
      id: 'hello',
      title: 'Hello World',
      code: `// Hello Canvas
ctx.setTransform(dpr,0,0,dpr,0,0);
const cw = canvas.width / dpr;
const ch = canvas.height / dpr;
let t = 0;
let raf;
function draw() {
  t += 0.03;
  ctx.clearRect(0,0,cw,ch);
  ctx.fillStyle = '#0ea5e9';
  ctx.font = '36px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Hello Canvas', cw/2, ch/2);
  ctx.save();
  ctx.translate(cw/2, ch/2);
  ctx.rotate(t);
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(-50, -50, 100, 100);
  ctx.restore();
  raf = requestAnimationFrame(draw);
}
draw();
return () => cancelAnimationFrame(raf);
`
    },
    {
      id: 'bouncing',
      title: 'Bouncing Balls',
      code: `// Bouncing balls
ctx.setTransform(dpr,0,0,dpr,0,0);
const cw = canvas.width / dpr;
const ch = canvas.height / dpr;
const balls = [];
for (let i=0;i<18;i++){
  balls.push({
    x: Math.random()*cw,
    y: Math.random()*ch,
    vx: (Math.random()-0.5)*6,
    vy: (Math.random()-0.5)*6,
    r: 6+Math.random()*18,
    color: 'hsl('+(Math.random()*360|0)+',80%,60%)'
  });
}
let raf;
function step(){
  ctx.clearRect(0,0,cw,ch);
  for(const b of balls){
    b.x += b.vx;
    b.y += b.vy;
    if(b.x < b.r){ b.x = b.r; b.vx *= -1; }
    if(b.x > cw - b.r){ b.x = cw - b.r; b.vx *= -1; }
    if(b.y < b.r){ b.y = b.r; b.vy *= -1; }
    if(b.y > ch - b.r){ b.y = ch - b.r; b.vy *= -1; }
    ctx.beginPath();
    ctx.fillStyle = b.color;
    ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
    ctx.fill();
  }
  raf = requestAnimationFrame(step);
}
step();
return () => cancelAnimationFrame(raf);
`
    },
    {
      id: 'particles',
      title: 'Particles',
      code: `// Interactive particles
ctx.setTransform(dpr,0,0,dpr,0,0);
const cw = canvas.width / dpr;
const ch = canvas.height / dpr;
const particles = [];
for(let i=0;i<120;i++){
  particles.push({x:Math.random()*cw,y:Math.random()*ch,vx:0,vy:0,size:1+Math.random()*3});
}
let mouse = {x:cw/2,y:ch/2};
canvas.addEventListener && canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect && canvas.getBoundingClientRect();
  if(rect){
    mouse.x = (e.clientX - rect.left) * (1/dpr);
    mouse.y = (e.clientY - rect.top) * (1/dpr);
  }
});
let raf;
function step(){
  ctx.clearRect(0,0,cw,ch);
  for(const p of particles){
    const dx = mouse.x - p.x;
    const dy = mouse.y - p.y;
    const dst = Math.hypot(dx,dy)+0.001;
    const f = Math.min(200/dst,2);
    p.vx += (dx/dst)*f*0.02;
    p.vy += (dy/dst)*f*0.02;
    p.vx *= 0.92;
    p.vy *= 0.92;
    p.x += p.vx;
    p.y += p.vy;
    ctx.fillStyle = 'rgba(14,165,233,0.9)';
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
    ctx.fill();
  }
  raf = requestAnimationFrame(step);
}
step();
return () => { cancelAnimationFrame(raf); };
`
    },
    {
      id: 'lissajous',
      title: 'Lissajous Curves',
      code: `// Lissajous curves
ctx.setTransform(dpr,0,0,dpr,0,0);
const cw = canvas.width / dpr;
const ch = canvas.height / dpr;
const cx = cw/2, cy = ch/2;
const R = Math.min(cw,ch)*0.45;
let t = 0;
let raf;
function draw(){
  t += 0.02;
  ctx.clearRect(0,0,cw,ch);
  ctx.beginPath();
  const a = 3, b=4, delta = t;
  for(let i=0;i<200;i++){
    const theta = i / 200 * Math.PI * 2;
    const x = cx + R * Math.sin(a*theta + delta);
    const y = cy + R * Math.sin(b*theta);
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2;
  ctx.stroke();
  raf = requestAnimationFrame(draw);
}
draw();
return () => cancelAnimationFrame(raf);
`
    },
    {
      id: 'waves',
      title: 'Gradient Waves',
      code: `// Gradient waves
ctx.setTransform(dpr,0,0,dpr,0,0);
const cw = canvas.width / dpr;
const ch = canvas.height / dpr;
let t = 0;
let raf;
function draw(){
  t += 0.02;
  ctx.clearRect(0,0,cw,ch);
  const g = ctx.createLinearGradient(0,0,cw, ch);
  g.addColorStop(0,'#ff7a18');
  g.addColorStop(0.5,'#af002d');
  g.addColorStop(1,'#319197');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,cw,ch);
  ctx.beginPath();
  for(let x=0;x<cw;x++){
    const y = ch/2 + Math.sin((x*0.02)+t)*40;
    if(x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 2;
  ctx.stroke();
  raf = requestAnimationFrame(draw);
}
draw();
return () => cancelAnimationFrame(raf);
`
    }
  ];

  // UI wiring
  let currentExample = null;
  let currentCleanup = null;

  function $(sel){ return document.querySelector(sel); }

  function populate(){
    const ul = $('#examplesList');
    examples.forEach(ex => {
      const li = document.createElement('li');
      li.textContent = ex.title;
      li.dataset.id = ex.id;
      li.addEventListener('click', ()=> selectExample(ex.id));
      ul.appendChild(li);
    });
    selectExample(examples[0].id);
  }

  function selectExample(id){
    currentExample = examples.find(e=>e.id===id);
    $('#codeEditor').value = currentExample.code;
    document.querySelectorAll('#examplesList li').forEach(li=>li.classList.toggle('active', li.dataset.id===id));
  }

  function stopCurrent(){
    if(currentCleanup){
      try{ currentCleanup(); }catch(e){}
      currentCleanup = null;
    }
  }

  function runSelected(){
    stopCurrent();
    const canvas = $('#playCanvas');
    const code = $('#codeEditor').value;
    const dpr = window.devicePixelRatio || 1;
    // ensure pixel sizing
    canvas.width = (canvas.clientWidth || canvas.offsetWidth || 600) * dpr;
    canvas.height = (canvas.clientHeight || canvas.offsetHeight || 400) * dpr;
    const ctx = canvas.getContext('2d');
    try{
      const fn = new Function('canvas','ctx','dpr', code);
      const maybe = fn(canvas, ctx, dpr);
      if(typeof maybe === 'function') currentCleanup = maybe;
      else currentCleanup = null;
    }catch(err){
      console.error(err);
      alert('Error running sample: ' + err.message);
    }
  }

  // Export helpers
  function escapeBackticks(s){ return s.replace(/`/g, '\\`'); }

  function generateExport(example){
    const xml = `<Page xmlns="http://schemas.nativescript.org/tns.xsd" loaded="onLoaded">\n  <GridLayout rows=\"*\">\n    <Canvas id=\"canvas\" row=\"0\" />\n  </GridLayout>\n</Page>`;
    const codeEsc = escapeBackticks(example.code);
    const ts = `import { EventData, Page } from "@nativescript/core";
import "@nativescript/canvas";

export function onLoaded(args: EventData) {
  const page = args.object as Page;
  const canvas: any = page.getViewById("canvas");
  const dpr = (global as any).devicePixelRatio || 1;
  const w = (canvas.getMeasuredWidth && canvas.getMeasuredWidth()) || (canvas.width || 300);
  const h = (canvas.getMeasuredHeight && canvas.getMeasuredHeight()) || (canvas.height || 150);

  // Attempt to set logical/pixel size depending on the canvas plugin API
  try {
    if (typeof canvas.setWidth === "function") {
      canvas.setWidth(w * dpr);
      canvas.setHeight(h * dpr);
    } else {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
  } catch(e){}

  const code = ` + "`" + `${codeEsc}` + "`" + `;

  let cleanup: any;
  // Prefer draw event from @nativescript/canvas if available
  if (canvas.on && typeof canvas.on === "function") {
    const handler = (ev: any) => {
      const ctx = ev.canvas || ev.context || (canvas.getContext && canvas.getContext("2d"));
      try {
        const fn = new Function("canvas","ctx","dpr", code);
        const maybe = fn(canvas, ctx, dpr);
        if (typeof maybe === "function") cleanup = maybe;
      } catch(e) { console.error(e); }
    };
    canvas.on("draw", handler);
    if (canvas.requestDraw) canvas.requestDraw();
    page.on("unloaded", () => {
      if (cleanup && typeof cleanup === "function") cleanup();
      canvas.off && canvas.off("draw", handler);
    });
  } else {
    const ctx = canvas.getContext && canvas.getContext("2d");
    try {
      const fn = new Function("canvas","ctx","dpr", code);
      const maybe = fn(canvas, ctx, dpr);
      if (typeof maybe === "function") cleanup = maybe;
    } catch(e) { console.error(e); }
    page.on("unloaded", () => { if (cleanup && typeof cleanup === "function") cleanup(); });
  }
}
`;

    return { xml, ts };
  }

  // Modal UI
  function openExport(){
    const modal = $('#exportModal');
    modal.classList.remove('hidden');
    const exportArea = $('#exportArea');
    const tabs = modal.querySelectorAll('.tabs button');
    tabs.forEach(b=>b.classList.remove('active'));
    tabs[0].classList.add('active');
    const ex = generateExport(currentExample);
    exportArea.textContent = ex.xml;

    modal.querySelector('.tabs').addEventListener('click', (ev)=>{
      const t = ev.target.closest('button');
      if(!t) return;
      modal.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('active', b===t));
      exportArea.textContent = (t.dataset.tab === 'xml') ? ex.xml : ex.ts;
    });

    $('#copyBtn').onclick = ()=>{
      const text = exportArea.textContent;
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(()=>alert('Copied to clipboard'));
      }else{
        alert('Clipboard not available');
      }
    };

    $('#downloadBtn').onclick = ()=>{
      // download both files
      const aXml = document.createElement('a');
      const blobXml = new Blob([ex.xml], {type:'text/xml'});
      aXml.href = URL.createObjectURL(blobXml);
      aXml.download = `${currentExample.id}.xml`;
      document.body.appendChild(aXml); aXml.click(); aXml.remove();
      const aTs = document.createElement('a');
      const blobTs = new Blob([ex.ts], {type:'text/plain'});
      aTs.href = URL.createObjectURL(blobTs);
      aTs.download = `${currentExample.id}.ts`;
      document.body.appendChild(aTs); aTs.click(); aTs.remove();
    };

    $('#closeModal').onclick = ()=>{ modal.classList.add('hidden'); };
  }

  // Wire UI
  window.addEventListener('load', ()=>{
    populate();
    $('#runBtn').addEventListener('click', runSelected);
    $('#exportBtn').addEventListener('click', ()=> openExport());
    window.addEventListener('resize', ()=>{ if(currentExample) runSelected(); });
  });

})();
