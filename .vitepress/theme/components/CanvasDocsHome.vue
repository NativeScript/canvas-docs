<script setup lang="ts">
import { ref } from 'vue';

const rootRef = ref<HTMLElement | null>(null);
</script>

<template>
  <div ref="rootRef" class="canvas-docs-home">
    <section class="canvas-docs-hero">
      <div class="canvas-docs-hero__copy">
        <p class="canvas-docs-kicker">Native rendering for serious UI, graphics, and GPU work</p>
        <h2>
          <span>@nativescript/canvas</span>
        </h2>
        <p class="canvas-docs-lede">
          Bring web-style canvas APIs to NativeScript with native-backed rendering for <code>2d</code>, <code>webgl</code>, <code>webgl2</code>, <code>webgpu</code> and <code>bitmaprenderer</code>.
        </p>

        <div class="canvas-docs-chip-row">
          <span>iOS, tvOS, visionOS + Android</span>
          <span>Skia-backed rendering</span>
          <span>GPU-ready workflows</span>
          <span>Web API muscle memory</span>
        </div>

        <div class="canvas-docs-actions">
          <a class="canvas-docs-button canvas-docs-button--primary" href="/canvas/quick-start">Start Building</a>
          <a class="canvas-docs-button canvas-docs-button--secondary" href="/canvas/guides/web-api-samples">Browse Samples</a>
        </div>
      </div>

      <div class="canvas-docs-hero__visual" aria-hidden="true">
        <div class="canvas-orbit canvas-orbit--large"></div>
        <div class="canvas-orbit canvas-orbit--small"></div>
        <CanvasHeroMiniDemo />
        <div class="canvas-render-card">
          <div class="canvas-render-card__header">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div class="canvas-render-card__body">
            <div class="canvas-render-card__gradient"></div>
            <div class="canvas-render-card__grid"></div>
            <div class="canvas-render-card__curve canvas-render-card__curve--one"></div>
            <div class="canvas-render-card__curve canvas-render-card__curve--two"></div>
            <div class="canvas-render-card__label">render()</div>
          </div>
        </div>
      </div>
    </section>

    <section>
      <h2>Start where your project is headed</h2>
      <div class="canvas-docs-link-grid">
        <a href="/canvas/upgrading">
          <strong>New in 3.0</strong>
          <span>Requirements, new features and behaviour changes when upgrading from 2.x.</span>
        </a>
        <a href="/canvas/installation">
          <strong>Installation</strong>
          <span>Get the package into your app and ready to render.</span>
        </a>
        <a href="/canvas/quick-start">
          <strong>Quick Start</strong>
          <span>Draw the first frame and wire up a canvas view.</span>
        </a>
        <a href="/canvas/guides/web-api-samples">
          <strong>Web API Samples</strong>
          <span>See browser-style examples adapted to NativeScript.</span>
        </a>
        <a href="/canvas/guides/canvas-2d-recipes">
          <strong>Canvas 2D Recipes</strong>
          <span>Reach for common 2D patterns without digging through API docs first.</span>
        </a>
        <a href="/canvas/guides/webgl-recipes">
          <strong>WebGL Recipes</strong>
          <span>Move from shaders and buffers to real scene rendering.</span>
        </a>
        <a href="/canvas/guides/webgpu-recipes">
          <strong>WebGPU Recipes</strong>
          <span>Explore newer GPU workflows and rendering experiments.</span>
        </a>
        <a href="/canvas/guides/images-and-bitmaps">
          <strong>Images and ImageBitmap</strong>
          <span>Load images, create bitmaps from any source, and composite canvases.</span>
        </a>
        <a href="/canvas/performance">
          <strong>Performance</strong>
          <span>Measured costs per operation, and the practices that keep frames fast.</span>
        </a>
        <a href="/canvas/rendering-contexts">
          <strong>Rendering Contexts</strong>
          <span>Compare the capabilities and tradeoffs of each mode.</span>
        </a>
        <a href="/canvas/api">
          <strong>API Overview</strong>
          <span>Find the core surface area quickly when you know what you need.</span>
        </a>
        <a href="/canvas/ecosystem">
          <strong>Ecosystem Packages</strong>
          <span>See how canvas connects with the broader NativeScript graphics stack.</span>
        </a>
        <a href="/canvas-svg/">
          <strong>@nativescript/canvas-svg</strong>
          <span>Animated, scriptable SVG rendered natively on the GPU.</span>
        </a>
        <a href="/audio-context/">
          <strong>@nativescript/audio-context</strong>
          <span>Pair visuals with a native-backed audio graph when your app needs sound too.</span>
        </a>
      </div>
    </section>
  </div>
</template>
