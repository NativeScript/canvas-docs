---
title: Quick Start
description: Render your first 2D, WebGL, or WebGPU output with @nativescript/canvas.
---

# Quick Start

This page shows minimal setup for each supported rendering mode.

## 2D example

```ts
let canvas;
let ctx;

export function canvasReady(args) {
  canvas = args.object;
  ctx = canvas.getContext('2d');

  ctx.fillStyle = '#22c55e';
  ctx.fillRect(10, 10, 150, 100);
}
```

## WebGL example

```ts
let canvas;
let gl;

export function canvasReady(args) {
  canvas = args.object;
  gl = canvas.getContext('webgl');

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clearColor(0.0, 0.5, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}
```

## WebGPU example

WebGPU requires newer platform support:

- Minimum iOS: 11
- Minimum Android: 27

```ts
import type { GPUAdapter, GPUDevice } from '@nativescript/canvas';
import { Screen } from '@nativescript/core';

let canvas;
let device: GPUDevice;

export async function canvasReady(args) {
  canvas = args.object;

  const adapter: GPUAdapter = (await navigator.gpu.requestAdapter()) as never;
  device = (await adapter.requestDevice()) as never;

  const devicePixelRatio = Screen.mainScreen.scale;
  canvas.width = canvas.clientWidth * devicePixelRatio;
  canvas.height = canvas.clientHeight * devicePixelRatio;

  const context = canvas.getContext('webgpu');

  // presentationFormat should be chosen based on your pipeline setup.
  context.configure({
    device,
    format: presentationFormat,
  });
}
```

## Continue

- [Web API Samples](/canvas/guides/web-api-samples)
- [Canvas 2D Recipes](/canvas/guides/canvas-2d-recipes)
- [WebGL Recipes](/canvas/guides/webgl-recipes)
- [WebGPU Recipes](/canvas/guides/webgpu-recipes)
- [Rendering Contexts](/canvas/rendering-contexts)
- [API Overview](/canvas/api)
