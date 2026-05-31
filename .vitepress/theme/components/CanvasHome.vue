<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

const particleCanvas = ref<HTMLCanvasElement | null>(null);
const previewState = ref<'loading' | 'ready' | 'error'>('loading');

let frameId = 0;
let resizeObserver: ResizeObserver | null = null;
let disposePreview: (() => void) | null = null;
const pointer = { x: 0, y: 0 };

async function startParticlePreview() {
  const canvas = particleCanvas.value;
  if (!canvas || typeof window === 'undefined') {
    return;
  }

  try {
    const THREE = await import(/* @vite-ignore */ 'https://esm.sh/three@0.160.0');
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });

    renderer.setClearColor(0x020617, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(54, 1, 0.1, 100);
    camera.position.set(0, 0, 4.1);

    const count = 6200;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 1) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const radius = 1.08 + Math.random() * 0.38;
      const index = i * 3;
      positions[index] = Math.sin(phi) * Math.cos(theta) * radius;
      positions[index + 1] = Math.sin(phi) * Math.sin(theta) * radius;
      positions[index + 2] = Math.cos(phi) * radius;

      const color = new THREE.Color().setHSL(phi / Math.PI, 0.72, 0.58);
      colors[index] = color.r;
      colors[index + 1] = color.g;
      colors[index + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.024,
      vertexColors: true,
      transparent: true,
      opacity: 0.94,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    const resize = () => {
      const width = Math.max(1, canvas.clientWidth);
      const height = Math.max(1, canvas.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      material.size = width < 720 ? 0.03 : 0.024;
    };

    const render = (time: number) => {
      const drift = time * 0.00014;
      points.rotation.x += (pointer.y * 0.38 - points.rotation.x) * 0.03;
      points.rotation.y = drift + pointer.x * 0.28;
      points.rotation.z = Math.sin(time * 0.0002) * 0.08;
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(render);
    };

    canvas.addEventListener('pointermove', onPointerMove, { passive: true });
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();
    previewState.value = 'ready';
    frameId = window.requestAnimationFrame(render);

    disposePreview = () => {
      window.cancelAnimationFrame(frameId);
      canvas.removeEventListener('pointermove', onPointerMove);
      resizeObserver?.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  } catch (error) {
    previewState.value = 'error';
    console.error('Canvas homepage particle preview failed:', error);
  }
}

onMounted(startParticlePreview);

onBeforeUnmount(() => {
  disposePreview?.();
  disposePreview = null;
});
</script>

<template>
  <main class="canvas-home">
    <section class="canvas-home-hero" aria-labelledby="canvas-home-title">
      <canvas
        ref="particleCanvas"
        class="canvas-home-hero__canvas"
        aria-label="Three.js particle sphere canvas preview"
      />
      <div class="canvas-home-hero__shade" aria-hidden="true"></div>

      <div class="canvas-home-hero__inner">
        <!-- <p class="canvas-home-kicker">High performance</p> -->
        <h1 id="canvas-home-title">Canvas APIs for native apps.</h1>
        <p class="canvas-home-lede">
          Build 2D, WebGL, WebGPU, Three.js, and Pixi.js experiences in NativeScript with familiar browser-style rendering APIs.
        </p>

        <div class="canvas-home-actions" aria-label="Primary actions">
          <a class="canvas-home-button canvas-home-button--primary" href="/canvas-playground/?example=three-particles">
            Open Particle Playground
          </a>
          <a class="canvas-home-button canvas-home-button--secondary" href="/canvas/quick-start">
            Read Quick Start
          </a>
        </div>

        <div class="canvas-home-sample-bar" aria-label="Featured playground sample">
          <span class="canvas-home-sample-bar__status" :data-state="previewState"></span>
          <span>three-particles.js</span>
          <span>Three.js Particle Sphere</span>
          <a href="/canvas-playground/?example=three-particles">Explore sample</a>
        </div>
      </div>
    </section>

    <section class="canvas-home-next" aria-labelledby="canvas-home-next-title">
      <div class="canvas-home-section-copy">
        <p class="canvas-home-kicker">Start visually</p>
        <h2 id="canvas-home-next-title">Use the playground first, then follow the docs that match what you want to ship.</h2>
      </div>

      <div class="canvas-home-link-grid">
        <a href="/canvas-playground/" class="canvas-home-link-panel">
          <span>Playground</span>
          <strong>Run and edit visual examples across 2D, WebGL, WebGPU, Three.js, and Pixi.js.</strong>
        </a>
        <a href="/canvas/" class="canvas-home-link-panel">
          <span>Canvas Docs</span>
          <strong>Set up @nativescript/canvas and render with native iOS and Android surfaces.</strong>
        </a>
        <a href="/canvas/guides/webgl-recipes" class="canvas-home-link-panel">
          <span>Rendering Recipes</span>
          <strong>Move from the visual samples into concrete Canvas 2D, WebGL, and WebGPU patterns.</strong>
        </a>
      </div>
    </section>
  </main>
</template>

<style scoped>
:global(.canvas-home-page .VPDoc),
:global(.canvas-home-page .VPDoc > .container),
:global(.canvas-home-page .VPDoc > .container > .content),
:global(.canvas-home-page .VPDoc .content-container),
:global(.canvas-home-page .VPDoc .vp-doc),
:global(.canvas-home-page .VPDoc .vp-doc > div) {
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
  max-width: none !important;
}

:global(.canvas-home-page .VPDocFooter),
:global(.canvas-home-page .VPDocAside) {
  display: none !important;
}

.canvas-home {
  --home-bg: #f8fafc;
  --home-fg: #0f172a;
  --home-muted: #475569;
  --home-line: rgba(15, 23, 42, 0.12);
  --home-panel: #ffffff;
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  background: var(--home-bg);
  color: var(--home-fg);
}

:global(.dark) .canvas-home {
  --home-bg: #020617;
  --home-fg: #f8fafc;
  --home-muted: #cbd5e1;
  --home-line: rgba(148, 163, 184, 0.24);
  --home-panel: #0f172a;
}

.canvas-home-hero {
  position: relative;
  isolation: isolate;
  display: flex;
  min-height: calc(100svh - var(--vp-nav-height) - 132px);
  overflow: hidden;
  background: #020617;
}

.canvas-home-hero__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  touch-action: none;
}

.canvas-home-hero__shade {
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    linear-gradient(90deg, rgba(2, 6, 23, 0.92) 0%, rgba(2, 6, 23, 0.74) 40%, rgba(2, 6, 23, 0.22) 72%, rgba(2, 6, 23, 0.62) 100%),
    linear-gradient(0deg, rgba(2, 6, 23, 0.7) 0%, rgba(2, 6, 23, 0) 36%);
}

.canvas-home-hero__inner {
  position: relative;
  z-index: 2;
  display: flex;
  width: min(100%, 1240px);
  flex-direction: column;
  justify-content: center;
  margin: 0 auto;
  padding: clamp(3.5rem, 9vh, 6rem) 1.5rem clamp(4rem, 10vh, 6.5rem);
}

.canvas-home-kicker {
  margin: 0 0 1rem;
  color: #fb923c;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  line-height: 1.2;
  text-transform: uppercase;
}

.canvas-home-hero h1 {
  max-width: 11ch;
  margin: 0;
  color: #ffffff;
  font-size: clamp(3.2rem, 8vw, 7.4rem);
  font-weight: 850;
  letter-spacing: 0;
  line-height: 0.92;
  text-wrap: balance;
}

.canvas-home-lede {
  max-width: 43rem;
  margin: 1.45rem 0 0;
  color: rgba(226, 232, 240, 0.9);
  font-size: clamp(1.02rem, 1.7vw, 1.28rem);
  line-height: 1.7;
  text-wrap: pretty;
}

.canvas-home-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 2rem;
}

.canvas-home-button {
  display: inline-flex;
  min-height: 2.85rem;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  padding: 0.82rem 1.05rem;
  font-size: 0.95rem;
  font-weight: 750;
  text-decoration: none;
  transition: transform 160ms ease, border-color 160ms ease, background-color 160ms ease;
}

.canvas-home-button:hover {
  transform: translateY(-1px);
}

.canvas-home-button--primary {
  background: #f75930;
  color: #ffffff;
  box-shadow: 0 18px 50px -28px rgba(247, 89, 48, 0.9);
}

.canvas-home-button--secondary {
  border: 1px solid rgba(226, 232, 240, 0.28);
  background: rgba(15, 23, 42, 0.28);
  color: #f8fafc;
  backdrop-filter: blur(12px);
}

.canvas-home-button--secondary:hover {
  border-color: rgba(226, 232, 240, 0.5);
}

.canvas-home-sample-bar {
  display: flex;
  width: fit-content;
  max-width: min(100%, 48rem);
  align-items: center;
  gap: 0.7rem;
  margin-top: 2.1rem;
  border: 1px solid rgba(226, 232, 240, 0.18);
  border-radius: 8px;
  background: rgba(2, 6, 23, 0.48);
  padding: 0.65rem 0.75rem;
  color: rgba(248, 250, 252, 0.78);
  font-size: 0.82rem;
  line-height: 1.4;
  backdrop-filter: blur(12px);
}

.canvas-home-sample-bar__status {
  width: 0.55rem;
  height: 0.55rem;
  flex: 0 0 auto;
  border-radius: 999px;
  background: #f59e0b;
}

.canvas-home-sample-bar__status[data-state='ready'] {
  background: #22c55e;
}

.canvas-home-sample-bar__status[data-state='error'] {
  background: #ef4444;
}

.canvas-home-sample-bar span:nth-child(3) {
  color: #ffffff;
  font-weight: 700;
}

.canvas-home-sample-bar a {
  color: #fb923c;
  font-weight: 750;
  text-decoration: none;
}

.canvas-home-next {
  display: grid;
  width: min(100%, 1240px);
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.4fr);
  gap: 2rem;
  margin: 0 auto;
  padding: clamp(2rem, 6vw, 4.5rem) 1.5rem;
}

.canvas-home-section-copy h2 {
  max-width: 13ch;
  margin: 0;
  color: var(--home-fg);
  font-size: clamp(2rem, 4vw, 4rem);
  font-weight: 820;
  letter-spacing: 0;
  line-height: 0.98;
  text-wrap: balance;
}

.canvas-home-link-grid {
  display: grid;
  gap: 0.75rem;
  align-content: start;
}

.canvas-home-link-panel {
  display: grid;
  gap: 0.45rem;
  border: 1px solid var(--home-line);
  border-radius: 8px;
  background: var(--home-panel);
  padding: 1.05rem;
  text-decoration: none;
  transition: transform 160ms ease, border-color 160ms ease;
}

.canvas-home-link-panel:hover {
  border-color: rgba(247, 89, 48, 0.62);
  transform: translateY(-1px);
}

.canvas-home-link-panel span {
  color: #f75930;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.canvas-home-link-panel strong {
  color: var(--home-fg);
  font-size: 1.02rem;
  font-weight: 650;
  line-height: 1.55;
}

@media (max-width: 820px) {
  .canvas-home-hero {
    min-height: calc(100svh - var(--vp-nav-height) - 124px);
  }

  .canvas-home-hero__shade {
    background:
      linear-gradient(0deg, rgba(2, 6, 23, 0.92) 0%, rgba(2, 6, 23, 0.76) 44%, rgba(2, 6, 23, 0.25) 100%);
  }

  .canvas-home-hero__inner {
    justify-content: flex-end;
    padding: 2.4rem 1.1rem 1.15rem;
  }

  .canvas-home-hero h1 {
    max-width: 7.8ch;
    font-size: clamp(2.85rem, 13vw, 4rem);
    line-height: 0.96;
  }

  .canvas-home-lede {
    max-width: 21rem;
    font-size: 1rem;
    line-height: 1.62;
  }

  .canvas-home-actions {
    width: min(100%, 22rem);
    flex-direction: column;
    margin-top: 1.35rem;
  }

  .canvas-home-button {
    width: 100%;
  }

  .canvas-home-sample-bar {
    display: grid;
    width: min(100%, 22rem);
    grid-template-columns: auto minmax(0, 1fr);
    gap: 0.35rem 0.55rem;
    margin-top: 1.15rem;
  }

  .canvas-home-sample-bar span,
  .canvas-home-sample-bar a {
    min-width: 0;
  }

  .canvas-home-sample-bar span:nth-child(3),
  .canvas-home-sample-bar a {
    grid-column: 2;
  }

  .canvas-home-next {
    grid-template-columns: 1fr;
    padding: 2rem 1.1rem 4rem;
  }

  .canvas-home-section-copy h2 {
    max-width: 15ch;
  }
}
</style>
