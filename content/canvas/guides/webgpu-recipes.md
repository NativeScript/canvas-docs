---
title: WebGPU Recipes
description: WebGPU setup and rendering patterns with @nativescript/canvas.
---

# WebGPU Recipes

`@nativescript/canvas` supports `webgpu` context creation with web-style setup flow.

## Visual output preview

![Preview of WebGPU recipe output](/demo-previews/webgpu-recipes-preview.svg)

Expected flow: adapter and device initialization, context configuration, render pass setup, then triangle output with updates from uniforms and animation loops.

## Shared setup

```ts
import type { GPUAdapter, GPUDevice } from '@nativescript/canvas';
import { Screen } from '@nativescript/core';

let canvas;
let device: GPUDevice;
let context;
let format;

export async function canvasReady(args) {
  canvas = args.object;

  const dpr = Screen.mainScreen.scale;
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;

  const adapter: GPUAdapter = (await navigator.gpu.requestAdapter()) as never;
  device = (await adapter.requestDevice()) as never;

  context = canvas.getContext('webgpu');
  format = navigator.gpu.getPreferredCanvasFormat();

  context.configure({
    device,
    format,
    alphaMode: 'premultiplied',
  });
}
```

## 1. Clear pass only

```ts
const encoder = device.createCommandEncoder();

const pass = encoder.beginRenderPass({
  colorAttachments: [
    {
      view: context.getCurrentTexture().createView(),
      clearValue: { r: 0.08, g: 0.1, b: 0.15, a: 1 },
      loadOp: 'clear',
      storeOp: 'store',
    },
  ],
});

pass.end();
device.queue.submit([encoder.finish()]);
```

Live demo:

<CanvasWebGPURecipeDemo recipe="1" />

## 2. Create a shader module (WGSL)

```ts
const shader = device.createShaderModule({
  code: `
    @vertex
    fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4f {
      var pos = array<vec2f, 3>(
        vec2f(0.0, 0.5),
        vec2f(-0.5, -0.5),
        vec2f(0.5, -0.5)
      );
      return vec4f(pos[vertexIndex], 0.0, 1.0);
    }

    @fragment
    fn fs_main() -> @location(0) vec4f {
      return vec4f(0.15, 0.75, 0.65, 1.0);
    }
  `,
});
```

## 3. Create render pipeline

```ts
const pipeline = device.createRenderPipeline({
  layout: 'auto',
  vertex: {
    module: shader,
    entryPoint: 'vs_main',
  },
  fragment: {
    module: shader,
    entryPoint: 'fs_main',
    targets: [{ format }],
  },
  primitive: {
    topology: 'triangle-list',
  },
});
```

## 4. Draw a triangle

```ts
const encoder = device.createCommandEncoder();

const pass = encoder.beginRenderPass({
  colorAttachments: [
    {
      view: context.getCurrentTexture().createView(),
      clearValue: { r: 0.02, g: 0.04, b: 0.08, a: 1 },
      loadOp: 'clear',
      storeOp: 'store',
    },
  ],
});

pass.setPipeline(pipeline);
pass.draw(3, 1, 0, 0);
pass.end();

device.queue.submit([encoder.finish()]);
```

Live demo:

<CanvasWebGPURecipeDemo recipe="4" />

## 5. Uniform buffer update pattern

```ts
const uniformBuffer = device.createBuffer({
  size: 64,
  usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});

const mvp = new Float32Array(16);
// Fill with your transform matrix values

device.queue.writeBuffer(uniformBuffer, 0, mvp.buffer, mvp.byteOffset, mvp.byteLength);
```

## 6. Reconfigure on resize

```ts
function resizeWebGPU() {
  const dpr = Screen.mainScreen.scale;
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;

  context.configure({
    device,
    format,
    alphaMode: 'premultiplied',
  });
}
```

## 7. Animation render loop

```ts
let running = true;

function frame() {
  if (!running) return;

  const encoder = device.createCommandEncoder();
  const pass = encoder.beginRenderPass({
    colorAttachments: [
      {
        view: context.getCurrentTexture().createView(),
        clearValue: { r: Math.random() * 0.1, g: 0.06, b: 0.12, a: 1 },
        loadOp: 'clear',
        storeOp: 'store',
      },
    ],
  });

  pass.setPipeline(pipeline);
  pass.draw(3, 1, 0, 0);
  pass.end();

  device.queue.submit([encoder.finish()]);
  setTimeout(frame, 16);
}

frame();
```

Live demo:

<CanvasWebGPURecipeDemo recipe="7" />

## 8. Capability checks

```ts
const adapter = await navigator.gpu.requestAdapter();
if (!adapter) {
  throw new Error('WebGPU adapter not available');
}

const device = await adapter.requestDevice();
console.log('device ready', !!device);
```

## More guides

- [Web API Samples](/canvas/guides/web-api-samples)
- [Canvas 2D Recipes](/canvas/guides/canvas-2d-recipes)
- [WebGL Recipes](/canvas/guides/webgl-recipes)
