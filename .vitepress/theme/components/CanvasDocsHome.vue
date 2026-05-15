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
          Bring web-style canvas APIs to NativeScript with native-backed rendering for <code>2d</code>, <code>webgl</code>, <code>webgl2</code>, and <code>webgpu</code>.
        </p>

        <div class="canvas-docs-chip-row">
          <span>iOS + Android</span>
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

    <section class="canvas-docs-stats">
      <div>
        <strong>4</strong>
        <span>rendering contexts in one package</span>
      </div>
      <div>
        <strong>1</strong>
        <span>API surface that feels familiar if you already know the web</span>
      </div>
      <div>
        <strong>0</strong>
        <span>need to split 2D, WebGL, and GPU docs across separate packages</span>
      </div>
    </section>

    <section>
      <h2>Why teams reach for it</h2>
      <div class="canvas-docs-feature-grid">
        <div class="feature-item canvas-docs-feature-item">
          <div class="canvas-docs-feature-icon canvas-docs-feature-icon--orange">2D</div>
          <h3>Immediate-mode UI drawing</h3>
          <p>Build charts, overlays, signatures, image editing tools, and custom controls with a fast 2D context.</p>
        </div>
        <div class="feature-item canvas-docs-feature-item">
          <div class="canvas-docs-feature-icon canvas-docs-feature-icon--blue">3D</div>
          <h3>WebGL workflows that transfer cleanly</h3>
          <p>Bring existing rendering knowledge across with WebGL and WebGL2 contexts that map to familiar browser patterns.</p>
        </div>
        <div class="feature-item canvas-docs-feature-item">
          <div class="canvas-docs-feature-icon canvas-docs-feature-icon--green">GPU</div>
          <h3>WebGPU when you need more headroom</h3>
          <p>Push into newer GPU-driven pipelines without abandoning the rest of the NativeScript canvas ecosystem.</p>
        </div>
      </div>
    </section>

    <section>
      <h2>Start where your project is headed</h2>
      <div class="canvas-docs-link-grid">
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
        <a href="/audio-context/">
          <strong>@nativescript/audio-context</strong>
          <span>Pair visuals with a native-backed audio graph when your app needs sound too.</span>
        </a>
      </div>
    </section>
  </div>
</template>