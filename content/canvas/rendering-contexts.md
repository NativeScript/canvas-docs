---
title: Rendering Contexts
description: Understand when to use 2D, WebGL, WebGL2, or WebGPU in @nativescript/canvas.
---

# Rendering Contexts

`@nativescript/canvas` exposes multiple context types, each suited for different workloads.

| Context | Best for | API style |
| --- | --- | --- |
| `2d` | UI drawing, charts, image composition | Canvas 2D spec |
| `webgl` | Portable GPU rendering | WebGL 1 spec |
| `webgl2` | Modern GL features | WebGL 2 spec |
| `webgpu` | New GPU pipelines and compute-style workflows | WebGPU spec |

## Choosing a context

- Use `2d` for simple rendering and draw operations.
- Use `webgl` or `webgl2` for 3D scenes and shader-heavy visuals.
- Use `webgpu` when you need newer GPU capabilities and explicit pipeline control.

## Creating a context

```ts
const ctx2d = canvas.getContext('2d');
const gl = canvas.getContext('webgl');
const gl2 = canvas.getContext('webgl2');
const gpu = canvas.getContext('webgpu');
```

## Spec alignment

The package follows web API behavior where possible:

- Canvas 2D: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
- WebGL: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext
- WebGL2: https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext
- WebGPU: https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API

## Sample guides

- [Web API Samples](/canvas/guides/web-api-samples)
- [Canvas 2D Recipes](/canvas/guides/canvas-2d-recipes)
- [WebGL Recipes](/canvas/guides/webgl-recipes)
- [WebGPU Recipes](/canvas/guides/webgpu-recipes)
