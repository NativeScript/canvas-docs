---
title: Performance
description: What canvas operations cost on a real device, and the practices that keep frames fast.
---

# Performance

3.0 binds every context directly to V8. Where V8 can JIT (Android), hot calls go through V8's fast API, which is about as cheap as calling a JavaScript function. iOS runs V8 without a JIT, so calls there take the regular path. For most of the API, the cost is now in the drawing itself, not in the binding. This page covers what is still expensive and how to avoid it.

All numbers below were measured on a Galaxy A53, a mid-range Android phone.

## What things cost

| Operation | Approx. cost |
| --- | --- |
| `beginPath`, `lineTo`, `translate` | 10 to 50 ns |
| `save()` + `restore()` | ~170 ns |
| `ctx.font = '...'` | ~380 ns |
| `fillRect` | ~0.8 µs |
| `fillText` (repeated string) | ~1.1 µs |
| `drawImage` | ~1.6 µs |
| WebGL `drawArrays` / `drawElements` | ~0.8 µs |
| WebGL `activeTexture`, `blendFunc`, `getError` | ~20 ns |
| `getImageData` (64x64, GPU canvas) | ~412 µs |
| WebGL `readPixels` (64x64) | ~188 µs |

For comparison, the device's own WebView pays about the same for `measureText` and draws the same heavy particle scene at the same frame time. The remaining cost is the drawing itself, not the binding.

## Reading pixels back

Pixel readback from a GPU surface stalls the GPU, so it is by far the most expensive thing you can do in a frame. If you read pixels often, ask for a CPU-backed canvas instead:

```ts
const ctx = canvas.getContext('2d', { willReadFrequently: true });
```

| | default (GPU) | `willReadFrequently: true` |
| --- | --- | --- |
| `getImageData` (64x64) | 412 µs | 3.8 µs |
| `putImageData` (64x64) | 156 µs | 0.5 µs |
| `fillText` | 1.1 µs | 6.3 µs |
| `strokeRect` | 0.65 µs | 2.7 µs |

Pixel access becomes two orders of magnitude faster, and ordinary drawing becomes several times slower. Turn it on for image processing, or for hit-testing against pixel data. Leave it off for normal drawing.

## Text

- The shaped layout of each string is cached. A string you draw every frame costs about 1 µs, but a string drawn for the first time costs about 45 µs. Avoid generating a unique string on every frame when you don't need to: for example, round a changing number before you print it.
- Parsed `font` strings are cached too, so switching between a few fonts is cheap.

## Draw less, not faster

The bottleneck in a slow scene is usually rasterization, not the number of calls. Some examples:

- Batch shapes that share a style into a single path, and call `fill()` or `stroke()` once.
- Cap particle counts. An array that grows on every touch event is the most common cause of a demo that "gets slower over time".
- Don't redraw from touch handlers when a `requestAnimationFrame` loop is already running. Update state in the handler, and draw in the loop.

## Size canvases in device pixels

For sharp output, set the backing size to the view size multiplied by the screen scale, then scale the context:

```ts
import { Screen } from '@nativescript/core';

const dpr = Screen.mainScreen.scale;
canvas.width = canvas.clientWidth * dpr;
canvas.height = canvas.clientHeight * dpr;
ctx.scale(dpr, dpr);
```

Layout code should then use `clientWidth` and `clientHeight` (CSS pixels), not `width` and `height`. The Chart.js and Pixi adapters do this for you in 3.0.
