---
title: Rendering Contexts
description: Understand when to use 2D, WebGL, WebGL2, WebGPU or bitmaprenderer in @nativescript/canvas.
---

# Rendering Contexts

`@nativescript/canvas` provides several context types, each suited to a different kind of work.

| Context | Best for | API style |
| --- | --- | --- |
| `2d` | UI drawing, charts, image composition | Canvas 2D spec |
| `webgl` | Portable GPU rendering | WebGL 1 spec |
| `webgl2` | Modern GL features | WebGL 2 spec |
| `webgpu` | New GPU pipelines and compute workloads | WebGPU spec |
| `bitmaprenderer` | Displaying an `ImageBitmap` produced elsewhere | ImageBitmapRenderingContext spec |

## Choosing a context

- Use `2d` for simple rendering and draw operations.
- Use `webgl` or `webgl2` for 3D scenes and shader-heavy visuals.
- Use `webgpu` when you need newer GPU capabilities and explicit control over the pipeline.
- Use `bitmaprenderer` when a frame is produced once, off screen or in another canvas, and you only need to present it.

## Creating a context

```ts
const ctx2d = canvas.getContext('2d');
const gl = canvas.getContext('webgl');
const gl2 = canvas.getContext('webgl2');
const gpu = canvas.getContext('webgpu'); // needs navigator.gpu from @nativescript/canvas-polyfill
const bitmap = canvas.getContext('bitmaprenderer');
```

A canvas holds only one kind of context. As on the web, asking a canvas for a different type than it already has returns `null`.

## Context attributes

Pass attributes as the second argument, as you would on the web:

```ts
const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
const gl = canvas.getContext('webgl2', { antialias: false, preserveDrawingBuffer: true });
```

| Attribute | Default | Applies to |
| --- | --- | --- |
| `alpha` | `true` | all |
| `antialias` | `true` | WebGL |
| `depth` | `true` | WebGL |
| `stencil` | `false` | WebGL |
| `premultipliedAlpha` | `true` | WebGL |
| `preserveDrawingBuffer` | `false` | WebGL |
| `powerPreference` | `'default'` | WebGL (`'high-performance'` or `'low-power'`) |
| `failIfMajorPerformanceCaveat` | `false` | WebGL |
| `desynchronized` | `false` | 2D, WebGL |
| `willReadFrequently` | `false` | 2D. See [Performance](/canvas/performance#reading-pixels-back). |

## 2D backends

The 2D context is drawn by Skia on the GPU:

| Platform | Default | Fallback |
| --- | --- | --- |
| iOS, tvOS, visionOS | Metal | GL, if you set `Canvas.forceGL = true` before `getContext` (not on visionOS) |
| Android | Vulkan (API 24+ with a supported driver) | GL |

`willReadFrequently: true` switches that canvas to a CPU raster surface instead.

## bitmaprenderer

`bitmaprenderer` presents an `ImageBitmap` without copying it. `transferFromImageBitmap` resizes the canvas to fit the bitmap and detaches the bitmap. Passing `null` clears the canvas.

```ts
const bitmap = await createImageBitmap(sourceCanvas);
const ctx = canvas.getContext('bitmaprenderer');
ctx.transferFromImageBitmap(bitmap);
// bitmap.width is now 0: it has been handed to the canvas.
```

Only the `alpha` attribute applies. See [Images and ImageBitmap](/canvas/guides/images-and-bitmaps) for the sources you can create a bitmap from.

## Spec alignment

The package follows web API behavior where possible:

- Canvas 2D: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
- WebGL: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext
- WebGL2: https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext
- WebGPU: https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API
- ImageBitmapRenderingContext: https://developer.mozilla.org/en-US/docs/Web/API/ImageBitmapRenderingContext

## Sample guides

- [Web API Samples](/canvas/guides/web-api-samples)
- [Canvas 2D Recipes](/canvas/guides/canvas-2d-recipes)
- [WebGL Recipes](/canvas/guides/webgl-recipes)
- [WebGPU Recipes](/canvas/guides/webgpu-recipes)
- [Images and ImageBitmap](/canvas/guides/images-and-bitmaps)
