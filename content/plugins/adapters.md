---
title: Framework Adapters
description: Use Three.js, Pixi, Chart.js, Phaser and Babylon.js with @nativescript/canvas.
---

# Framework Adapters

Each adapter package pins a version of its library and wires it up to `@nativescript/canvas`. They all depend on [`@nativescript/canvas-polyfill`](/plugins/canvas-polyfill).

::: tip Sizing
Most of these libraries apply `devicePixelRatio` themselves. Pass them the size in CSS pixels (`canvas.clientWidth` / `canvas.clientHeight`), **not** `canvas.width` / `canvas.height`, or the ratio is applied twice.
:::

## Three.js

`@nativescript/canvas-three` bundles `three` 0.184.

```ts
import * as THREE from '@nativescript/canvas-three';

export function onReady(args) {
  const canvas = args.object;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  // scene, camera, renderer.setAnimationLoop(...)
}
```

For `WebGPURenderer`, alias `three` to `three/build/three.webgpu.js` in your webpack config, then call `await renderer.init()` before rendering.

## Pixi

`@nativescript/canvas-pixi` bundles `pixi.js` 8, and registers a NativeScript `DOMAdapter` for it.

```ts
import '@nativescript/canvas-pixi';
import * as PIXI from 'pixi.js';

export async function onReady(args) {
  const canvas = args.object;
  const app = new PIXI.Application();
  await app.init({
    canvas,
    preference: 'webgpu', // or 'webgl'
    width: canvas.clientWidth,
    height: canvas.clientHeight,
    autoDensity: true,
    resolution: window.devicePixelRatio,
  });
}
```

## Chart.js

`@nativescript/canvas-chartjs` bundles `chart.js` 4, registers all of Chart.js's components, and provides a platform class. The chart resizes itself whenever the canvas layout changes.

```ts
import { NativeScriptPlatform } from '@nativescript/canvas-chartjs';
import { Chart } from 'chart.js';

export function onReady(args) {
  new Chart(args.object, {
    platform: NativeScriptPlatform,
    type: 'bar',
    data: {
      labels: ['Red', 'Blue', 'Yellow'],
      datasets: [{ label: 'Votes', data: [12, 19, 3] }],
    },
    options: { responsive: true },
  });
}
```

## Phaser

`@nativescript/canvas-phaser` bundles `phaser` 4 and installs the polyfill. Use Phaser as you would on the web, and pass it the canvas:

```ts
import '@nativescript/canvas-phaser';
import * as Phaser from 'phaser';

export function onReady(args) {
  new Phaser.Game({
    canvas: args.object,
    type: Phaser.WEBGL,
    scene: [MyScene],
    physics: { default: 'arcade' },
  });
}
```

## Phaser CE

`@nativescript/canvas-phaser-ce` bundles `phaser-ce` 2.20, and has a `Game` helper that sizes the game and runs the render loop.

```ts
import TNSPhaser from '@nativescript/canvas-phaser-ce';

export function onReady(args) {
  const game = TNSPhaser.Game({ canvas: args.object, state: { preload, create, update } });
}
```

`Game` options: `canvas`, `width`, `height`, `renderer` (default `2`, WebGL), `state`, `transparent`, `antialias`, `physicsConfig`, `preventLoop` and `onRender`.

## Babylon.js

`@nativescript/canvas-babylon` bundles `babylonjs` 9 and installs the polyfill.

```ts
import '@nativescript/canvas-babylon';
import * as BABYLON from 'babylonjs';

export function onReady(args) {
  const engine = new BABYLON.Engine(args.object, true, {
    preserveDrawingBuffer: false,
    stencil: true,
    antialias: false,
    adaptToDeviceRatio: true,
  });
  // create a scene, then engine.runRenderLoop(() => scene.render())
}
```
