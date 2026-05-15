<script setup lang="ts">
import { ref } from 'vue';

const rootRef = ref<HTMLElement | null>(null);
</script>

<template>
  <div ref="rootRef" class="audio-docs-home">
    <section class="audio-docs-hero">
      <div class="audio-docs-hero__copy">
        <p class="audio-docs-kicker">Native audio graphs with a web-audio mental model</p>
        <h2>@nativescript/audio-context</h2>
        <p class="audio-docs-lede">
          Build playback, synthesis, effects, routing, and offline rendering pipelines on iOS and Android with a familiar <code>AudioContext</code>-style API.
        </p>

        <div class="audio-docs-chip-row">
          <span>Real-time nodes</span>
          <span>Offline rendering</span>
          <span>Effects + analysis</span>
          <span>Web Audio-style routing</span>
        </div>

        <div class="audio-docs-actions">
          <a class="audio-docs-button audio-docs-button--primary" href="/audio-context/quick-start">Patch Your First Graph</a>
          <a class="audio-docs-button audio-docs-button--secondary" href="/audio-context/guides/web-api-samples">Open Samples</a>
        </div>
      </div>

      <div class="audio-docs-hero__visual" aria-hidden="true">
        <div class="audio-node audio-node--input">Input</div>
        <div class="audio-node audio-node--fx">FX</div>
        <div class="audio-node audio-node--output">Output</div>
        <div class="audio-link audio-link--one"></div>
        <div class="audio-link audio-link--two"></div>
        <div class="audio-wave audio-wave--one"></div>
        <div class="audio-wave audio-wave--two"></div>
      </div>
    </section>

    <section class="audio-docs-stats">
      <div>
        <strong>2</strong>
        <span>core contexts for real-time and offline audio work</span>
      </div>
      <div>
        <strong>Many</strong>
        <span>common node types for generation, filtering, panning, dynamics, and timing</span>
      </div>
      <div>
        <strong>1</strong>
        <span>mental model if you already understand Web Audio graph construction</span>
      </div>
    </section>

    <section>
      <h2>What you can build</h2>
      <div class="audio-docs-feature-grid">
        <div class="feature-item audio-docs-feature-item">
          <div class="audio-docs-feature-icon audio-docs-feature-icon--rose">FX</div>
          <h3>Effects pipelines</h3>
          <p>Chain gain, compression, convolution, delay, panning, and filtering nodes into reusable audio flows.</p>
        </div>
        <div class="feature-item audio-docs-feature-item">
          <div class="audio-docs-feature-icon audio-docs-feature-icon--sky">OSC</div>
          <h3>Synthesis and interactive sound</h3>
          <p>Drive oscillators, envelopes, and event-based playback for apps, games, and instruments.</p>
        </div>
        <div class="feature-item audio-docs-feature-item">
          <div class="audio-docs-feature-icon audio-docs-feature-icon--emerald">OFF</div>
          <h3>Offline rendering and analysis</h3>
          <p>Render ahead of time, inspect output, and generate assets or previews without tying work to live playback.</p>
        </div>
      </div>
    </section>

    <section class="audio-docs-band">
      <div>
        <p class="audio-docs-kicker">Typical use cases</p>
        <h2>From synth apps to playback pipelines</h2>
        <p>
          The package fits interactive sound effects, music tools, audio visualization, and custom playback systems where the default media stack is too rigid.
        </p>
      </div>
      <ul class="audio-docs-stack">
        <li><strong>Music apps</strong><span>Sequencers, synths, and reactive instruments</span></li>
        <li><strong>Games</strong><span>Interactive sound design and event-driven playback</span></li>
        <li><strong>Media tools</strong><span>Analysis, effects processing, and render pipelines</span></li>
      </ul>
    </section>

    <section>
      <h2>Choose your next node</h2>
      <div class="audio-docs-link-grid">
        <a href="/audio-context/installation">
          <strong>Installation</strong>
          <span>Get the package installed and available in your app runtime.</span>
        </a>
        <a href="/audio-context/quick-start">
          <strong>Quick Start</strong>
          <span>Create a context and connect your first nodes.</span>
        </a>
        <a href="/audio-context/guides/web-api-samples">
          <strong>Web API Samples</strong>
          <span>See audio graph examples grounded in familiar browser patterns.</span>
        </a>
        <a href="/audio-context/guides/dynamics-compression">
          <strong>Dynamics Compression</strong>
          <span>Shape loudness and tame peaks with compression workflows.</span>
        </a>
        <a href="/audio-context/guides/routing-and-mixing">
          <strong>Routing and Mixing</strong>
          <span>Split, combine, and organize multi-node signal paths.</span>
        </a>
        <a href="/audio-context/guides/decode-and-play">
          <strong>Decode and Play</strong>
          <span>Load sources and push decoded audio through your graph.</span>
        </a>
        <a href="/audio-context/guides/media-element-source">
          <strong>Media Element Source</strong>
          <span>Bridge media playback into a processable node graph.</span>
        </a>
        <a href="/audio-context/guides/offline-rendering">
          <strong>Offline Rendering</strong>
          <span>Render audio in the background for assets, exports, and previews.</span>
        </a>
        <a href="/audio-context/api-surface">
          <strong>Supported API Surface</strong>
          <span>Find which Web Audio-style pieces are available today.</span>
        </a>
      </div>
    </section>
  </div>
</template>