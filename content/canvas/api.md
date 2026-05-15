---
title: API Overview
description: API surface overview and compatibility notes for @nativescript/canvas.
---

# API Overview

`@nativescript/canvas` is designed to map closely to web Canvas APIs.

## Compatibility model

- 2D API is aligned with the Canvas 2D web specification.
- WebGL and WebGL2 are aligned with browser WebGL APIs.
- WebGPU is aligned with modern WebGPU APIs.

## Type imports

For typed usage in TypeScript:

```ts
import type {
  CanvasRenderingContext2D,
  WebGLRenderingContext,
  WebGL2RenderingContext,
  GPUAdapter,
  GPUDevice,
} from '@nativescript/canvas';
```

## Practical guidance

- Prefer `2d` for immediate-mode drawing and text/image composition.
- Prefer WebGL/WebGL2 for established 3D rendering stacks.
- Prefer WebGPU for modern graphics pipelines and long-term portability.

## Related docs

- [Quick Start](/canvas/quick-start)
- [Web API Samples](/canvas/guides/web-api-samples)
- [Canvas 2D Recipes](/canvas/guides/canvas-2d-recipes)
- [WebGL Recipes](/canvas/guides/webgl-recipes)
- [WebGPU Recipes](/canvas/guides/webgpu-recipes)
- [Rendering Contexts](/canvas/rendering-contexts)
- [Ecosystem Packages](/canvas/ecosystem)
