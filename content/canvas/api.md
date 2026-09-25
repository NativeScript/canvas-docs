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
- `bitmaprenderer` follows the ImageBitmapRenderingContext spec.

## Globals

Importing `@nativescript/canvas` installs these as globals: `CanvasRenderingContext2D`, `WebGLRenderingContext`, `WebGL2RenderingContext`, `ImageBitmapRenderingContext`, `CanvasGradient`, `CanvasPattern`, `Path2D`, `DOMMatrix`, `ImageData`, `ImageBitmap`, `ImageAsset`, `TextEncoder`, `TextDecoder`, `FontFace`, `fonts`, `TouchEvent`, `PointerEvent`, `CustomEvent`, and the WebGPU flag enums (`GPUBufferUsage`, `GPUTextureUsage`, `GPUMapMode`, `GPUShaderStage`).

For `window`, `document`, `navigator.gpu`, `createImageBitmap` and `Image`, add [`@nativescript/canvas-polyfill`](/plugins/canvas-polyfill).

## Non-standard 2D extras

| Method | Description |
| --- | --- |
| `drawAtlas(image, xforms, rects, colors?, blendMode?)` | Draws many sprites from one image in a single call. `xforms` is `{ scos, ssin, tx, ty }[]`, and `rects` is `{ x, y, width, height }[]`. |
| `drawPoint(x, y)`, `drawPoints(mode, points)` | Draw points. `mode` is `'points'`, `'lines'` or `'polygon'`. |
| `drawPaint(color)` | Fills the whole clip with a colour. |
| `fillOval(x, y, w, h)`, `strokeOval(x, y, w, h)` | Oval shortcuts. |

## Canvas view extras

| Member | Description |
| --- | --- |
| `snapshot(flip?)` | Returns the current pixels as a `@nativescript/core` `ImageSource`. |
| `Canvas.forceGL` | Static. Use GL instead of Metal or Vulkan for 2D. Set it before calling `getContext`. |
| `Canvas.useSurface` | Static, Android only. Use a `SurfaceView` instead of a `TextureView`. |

## Type imports

For typed usage in TypeScript:

```ts
import type {
  CanvasRenderingContext2D,
  WebGLRenderingContext,
  WebGL2RenderingContext,
  ImageBitmapRenderingContext,
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
- [Images and ImageBitmap](/canvas/guides/images-and-bitmaps)
- [Events and Input](/canvas/events)
- [Ecosystem Packages](/canvas/ecosystem)
