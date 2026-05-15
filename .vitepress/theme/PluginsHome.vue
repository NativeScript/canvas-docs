<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

const plugins = [
  {
    name: '@nativescript/canvas',
    title: 'Canvas',
    description: 'High-performance native Canvas APIs for 2D, WebGL, WebGL2, and WebGPU rendering in NativeScript.',
    icon: '🖼️',
    gradient: 'from-blue-500 to-cyan-500',
    href: '/canvas/',
    featured: true,
    stats: {
      contexts: '2D + WebGL + WebGPU',
      engine: 'Skia + WGPU',
      platforms: 'iOS & Android',
    },
  },
  {
    name: '@nativescript/audio-context',
    title: 'Audio Context',
    description: 'Web Audio API-style graphs for NativeScript with oscillator, filters, panners, and offline rendering.',
    icon: '🎛️',
    gradient: 'from-indigo-500 to-violet-500',
    href: '/audio-context/',
    featured: false,
  },
  {
    name: '@nativescript/canvas-polyfill',
    title: 'Canvas Polyfill',
    description: 'Browser-like DOM and Canvas polyfills for libraries that expect web globals.',
    icon: '🧩',
    gradient: 'from-teal-500 to-emerald-500',
    href: 'https://github.com/NativeScript/canvas/tree/master/packages/canvas-polyfill/README.md',
    featured: false,
  },
  {
    name: '@nativescript/canvas-media',
    title: 'Canvas Media',
    description: 'Media integration utilities for the NativeScript canvas stack.',
    icon: '🎬',
    gradient: 'from-rose-500 to-orange-500',
    href: 'https://github.com/NativeScript/canvas/tree/master/packages/canvas-media/README.md',
    featured: false,
  },
  {
    name: '@nativescript/canvas-three',
    title: 'Canvas Three',
    description: 'Three.js integration for rendering advanced 3D scenes with NativeScript canvas.',
    icon: '🧊',
    gradient: 'from-sky-500 to-blue-600',
    href: 'https://github.com/NativeScript/canvas/tree/master/packages/canvas-three/README.md',
    featured: false,
  },
  {
    name: '@nativescript/canvas-pixi',
    title: 'Canvas Pixi',
    description: 'PixiJS adapter for performant 2D graphics and animation pipelines.',
    icon: '✨',
    gradient: 'from-fuchsia-500 to-pink-500',
    href: 'https://github.com/NativeScript/canvas/tree/master/packages/canvas-pixi/README.md',
    featured: false,
  },
  {
    name: '@nativescript/canvas-phaser',
    title: 'Canvas Phaser',
    description: 'Phaser integration for building native 2D games in NativeScript.',
    icon: '🎮',
    gradient: 'from-amber-500 to-orange-500',
    href: 'https://github.com/NativeScript/canvas/tree/master/packages/canvas-phaser/README.md',
    featured: false,
  },
  {
    name: '@nativescript/canvas-phaser-ce',
    title: 'Canvas Phaser CE',
    description: 'Phaser CE support for legacy game projects on NativeScript canvas.',
    icon: '🕹️',
    gradient: 'from-slate-500 to-zinc-700',
    href: 'https://github.com/NativeScript/canvas/tree/master/packages/canvas-phaser-ce/README.md',
    featured: false,
  },
  {
    name: '@nativescript/canvas-svg',
    title: 'Canvas SVG',
    description: 'SVG rendering package built on top of NativeScript canvas APIs.',
    icon: '📐',
    gradient: 'from-cyan-500 to-sky-600',
    href: 'https://github.com/NativeScript/canvas/tree/master/packages/canvas-svg/README.md',
    featured: false,
  },
  {
    name: '@nativescript/canvas-chartjs',
    title: 'Canvas Chart.js',
    description: 'Chart.js adapter package for rendering charts through NativeScript canvas.',
    icon: '📊',
    gradient: 'from-lime-500 to-emerald-600',
    href: 'https://github.com/NativeScript/canvas/tree/master/packages/canvas-chartjs/README.md',
    featured: false,
  },
  {
    name: '@nativescript/canvas-babylon',
    title: 'Canvas Babylon',
    description: 'Babylon integration package for high-end 3D and scene workflows.',
    icon: '🌌',
    gradient: 'from-violet-500 to-indigo-600',
    href: 'https://github.com/NativeScript/canvas/tree/master/packages/canvas-babylon/README.md',
    featured: false,
  },
];

const featuredPlugin = plugins.find(p => p.featured);
const otherPlugins = plugins.filter(p => !p.featured);

const homeCanvas = ref<HTMLCanvasElement | null>(null);
let homeCanvasRaf: number | null = null;

function drawHomeCanvas(frame: number) {
  const canvas = homeCanvas.value;
  if (!canvas) {
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const targetWidth = Math.max(1, Math.floor(width * dpr));
  const targetHeight = Math.max(1, Math.floor(height * dpr));

  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, 'rgba(37, 99, 235, 0.18)');
  bg.addColorStop(0.5, 'rgba(14, 116, 144, 0.12)');
  bg.addColorStop(1, 'rgba(16, 185, 129, 0.16)');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(226, 232, 240, 0.42)';
  ctx.lineWidth = 1;
  for (let i = 1; i <= 3; i += 1) {
    const y = (height / 4) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  const t = frame * 0.0015;
  const points = 7;
  const step = width / (points - 1);
  const pathPoints: Array<{ x: number; y: number }> = [];

  for (let i = 0; i < points; i += 1) {
    const x = step * i;
    const wave = Math.sin(t + i * 0.82) * 18;
    const drift = Math.cos(t * 0.64 + i * 0.45) * 10;
    const baseline = height * (0.57 - i * 0.025);
    const y = Math.max(20, Math.min(height - 20, baseline + wave + drift));
    pathPoints.push({ x, y });
  }

  const area = ctx.createLinearGradient(0, 0, 0, height);
  area.addColorStop(0, 'rgba(56, 189, 248, 0.38)');
  area.addColorStop(1, 'rgba(56, 189, 248, 0.03)');

  ctx.beginPath();
  ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
  for (let i = 1; i < pathPoints.length; i += 1) {
    const prev = pathPoints[i - 1];
    const curr = pathPoints[i];
    const cx = (prev.x + curr.x) / 2;
    const cy = (prev.y + curr.y) / 2;
    ctx.quadraticCurveTo(prev.x, prev.y, cx, cy);
  }
  const last = pathPoints[pathPoints.length - 1];
  ctx.lineTo(last.x, height);
  ctx.lineTo(pathPoints[0].x, height);
  ctx.closePath();
  ctx.fillStyle = area;
  ctx.fill();

  const line = ctx.createLinearGradient(0, 0, width, 0);
  line.addColorStop(0, '#3b82f6');
  line.addColorStop(0.5, '#06b6d4');
  line.addColorStop(1, '#10b981');

  ctx.beginPath();
  ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
  for (let i = 1; i < pathPoints.length; i += 1) {
    const prev = pathPoints[i - 1];
    const curr = pathPoints[i];
    const cx = (prev.x + curr.x) / 2;
    const cy = (prev.y + curr.y) / 2;
    ctx.quadraticCurveTo(prev.x, prev.y, cx, cy);
  }
  ctx.strokeStyle = line;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.stroke();

  const pulse = 0.5 + Math.sin(t * 2) * 0.5;
  [1, 3, 5].forEach((index, dot) => {
    const p = pathPoints[index];
    const colors = ['#3b82f6', '#06b6d4', '#10b981'];
    ctx.fillStyle = colors[dot] || '#3b82f6';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `${colors[dot] || '#3b82f6'}33`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 10 + pulse * 2, 0, Math.PI * 2);
    ctx.fill();
  });
}

function tickHomeCanvas(frame: number) {
  drawHomeCanvas(frame);
  homeCanvasRaf = window.requestAnimationFrame(tickHomeCanvas);
}

onMounted(() => {
  homeCanvasRaf = window.requestAnimationFrame(tickHomeCanvas);
});

onBeforeUnmount(() => {
  if (homeCanvasRaf !== null) {
    window.cancelAnimationFrame(homeCanvasRaf);
    homeCanvasRaf = null;
  }
});
</script>

<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <section class="relative overflow-hidden bg-gradient-to-br from-nstudio-navy via-slate-900 to-slate-800 px-6 py-20 md:py-32">
      <!-- Background decorations -->
      <div class="absolute inset-0 opacity-30">
        <div class="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-nstudio-orange blur-[100px]"></div>
        <div class="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-blue-500 blur-[100px]"></div>
      </div>

      <div class="relative mx-auto max-w-7xl">
        <div class="text-center">
          <!-- Logo -->
          <!-- <div class="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-3 backdrop-blur-sm">
            <span class="text-2xl">⚡</span>
            <span class="font-semibold text-white">NativeScript</span>
          </div> -->

          <h1 class="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            <span class="block bg-gradient-to-r from-nstudio-orange via-orange-400 to-amber-400 bg-clip-text text-transparent leading-[1.2]">
              NativeScript Canvas Ecosystem
            </span>
          </h1>

          <p class="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
            Native graphics and audio APIs.
            <br class="hidden sm:block" />
            Powered by @nativescript/canvas and @nativescript/audio-context.
            <!-- <br class="hidden sm:block" />
            Built by <a href="https://nativescript.org" class="text-nstudio-orange hover:underline">NativeScript</a> partners. -->
          </p>

          <div class="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="/canvas/"
              class="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-nstudio-orange to-orange-500 px-8 py-4 font-semibold text-white shadow-lg shadow-orange-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/40"
            >
              Explore Canvas
              <svg class="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <a
              href="https://github.com/NativeScript/canvas"
              target="_blank"
              class="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-white/10"
            >
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              View on GitHub
            </a>
          </div>

          <!-- Trust badges -->
          <div class="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-400">
            <div class="flex items-center gap-2">
              <div class="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></div>
              <span>TypeScript First</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
              <span>iOS & Android</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="h-2 w-2 animate-pulse rounded-full bg-orange-500"></div>
              <span>Native Performance</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Package: Canvas -->
    <section v-if="featuredPlugin" class="relative -mt-12 px-6">
      <div class="mx-auto max-w-7xl">
        <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800">
          <div class="grid gap-8 p-8 md:grid-cols-2 md:p-12">
            <div class="flex flex-col justify-center space-y-6">
              <div class="inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 px-4 py-2">
                <!-- <span class="text-2xl">🏆</span> -->
                <span class="font-medium text-blue-600 dark:text-blue-400">Featured</span>
              </div>

              <h2 class="text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">
                {{ featuredPlugin.title }}
              </h2>

              <p class="text-lg text-slate-600 dark:text-slate-300">
                {{ featuredPlugin.description }}
              </p>

              <div class="flex flex-wrap gap-4">
                <div v-for="(value, key) in featuredPlugin.stats" :key="key" class="rounded-xl bg-slate-100 px-4 py-2 dark:bg-slate-700">
                  <div class="text-lg font-bold text-slate-900 dark:text-white">{{ value }}</div>
                  <div class="text-xs text-slate-500 dark:text-slate-400 capitalize">{{ key }}</div>
                </div>
              </div>

              <a
                :href="featuredPlugin.href"
                class="group inline-flex w-fit items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
              >
                Learn More
                <svg class="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>

            <!-- Live Canvas Preview -->
            <div class="relative">
              <div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5"></div>
              <div class="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 dark:border-slate-600 dark:from-slate-700 dark:to-slate-800">
                <canvas
                  ref="homeCanvas"
                  class="h-64 w-full rounded-xl"
                  aria-label="Live canvas preview showing animated line rendering"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Other Packages -->
    <section class="px-6 py-20 md:py-32">
      <div class="mx-auto max-w-7xl">
        <div class="mb-12 text-center">
          <h2 class="text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">
            More Packages
          </h2>
          <p class="mt-4 text-lg text-slate-600 dark:text-slate-300">
            Explore the canvas ecosystem
          </p>
        </div>

        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <a
            v-for="plugin in otherPlugins"
            :key="plugin.name"
            :href="plugin.href"
            class="plugin-card group rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
          >
            <div :class="`inline-flex rounded-xl bg-gradient-to-br ${plugin.gradient} p-3 text-2xl text-white`">
              {{ plugin.icon }}
            </div>
            
            <h3 class="mt-4 text-xl font-bold text-slate-900 dark:text-white">
              {{ plugin.title }}
            </h3>
            
            <p class="mt-2 text-slate-600 dark:text-slate-300">
              {{ plugin.description }}
            </p>
            
            <div class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400">
              Learn more
              <svg class="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-gradient-to-br from-nstudio-navy to-slate-900 px-6 py-20 md:py-32">
      <div class="mx-auto max-w-4xl text-center">
        <h2 class="text-3xl font-bold text-white md:text-4xl">
          Build with Canvas Packages
        </h2>
        <p class="mt-4 text-lg text-slate-300">
          Explore the full NativeScript/canvas monorepo, package source, and demos.
          <br class="hidden sm:block" />
          Use this site for core package guides and jump to package READMEs for integrations.
        </p>
        <div class="mt-8 flex flex-wrap justify-center gap-4">
          <a
            href="https://github.com/NativeScript/canvas"
            class="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-white/10"
          >
            Open Repository
          </a>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-slate-200 bg-white px-6 py-12 dark:border-slate-700 dark:bg-slate-900">
      <div class="mx-auto max-w-7xl">
        <div class="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div class="flex items-center gap-3">
            <img class="rounded-full w-[30px] h-[30px]" src="/logo.svg" alt="">
            <span class="font-semibold text-slate-900 dark:text-white">NativeScript</span>
          </div>
          <!-- <p class="text-sm text-slate-500 dark:text-slate-400">
            Released under the MIT License.
          </p> -->
          <div class="flex gap-4">
            <a href="https://github.com/NativeScript/canvas" class="text-slate-500 transition-colors hover:text-slate-900 dark:hover:text-white">
              <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a href="https://nativescript.org" class="text-slate-500 transition-colors hover:text-slate-900 dark:hover:text-white">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
