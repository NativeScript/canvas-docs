---
title: Performance
description: What canvas operations cost on a real device, and the practices that keep frames fast.
---

# Performance

3.0 binds every context directly to V8. Where V8 can JIT (Android), hot calls go through V8's fast API, which is about as cheap as calling a JavaScript function. iOS runs V8 without a JIT, so calls there take the regular path. For most of the API, the cost is now in the drawing itself, not in the binding. This page covers what is still expensive and how to avoid it.

All numbers below were measured on a Galaxy A53, a mid-range Android phone.

## Threaded rendering

On Android, iOS and Windows, 2D and WebGL contexts do their GPU work on a separate thread by default. Your drawing code still runs on the JavaScript thread, and still looks synchronous:

- **2D:** each call is recorded on the JavaScript thread. Once per frame the recording is handed to a shared render thread, which draws it with Skia on the GPU and presents it.
- **WebGL:** calls are queued to a shared WebGL thread, which runs them and presents.

Without threading, the GPU work of a busy 2D scene ran on the UI thread. In a test scene that drew 300 rotated rectangles with text, Skia's flush took about 6.3 ms of every frame on the UI thread. With threading, the hand-off takes about 0.19 ms. That scene went from 102 fps, with 77% of UI frames janky, to a steady 120 fps. The UI stays smooth even when the render thread can't keep up: frames are merged instead of blocking the UI thread.

A few calls must wait for the thread to catch up, because they need its result:

- 2D: `getImageData`, `toDataURL`, and using the canvas as an image source (`drawImage(canvas)`, `texImage2D(canvas)`, WebGPU copies).
- WebGL: anything that returns a value, such as `getError`, `getParameter`, `getUniformLocation`, `checkFramebufferStatus` or `readPixels`. Each costs a round trip to the WebGL thread, so don't call `getError` after every draw in production code. `getParameter` for the current bindings is answered without a round trip.

While any canvas has a frame that hasn't reached the screen yet, `requestAnimationFrame` holds back its callbacks by a frame, as a browser does when its compositor falls behind. This stops a slow scene from piling up frames.

### Turning it off

For one canvas, pass `threaded: false`:

```ts
const ctx = canvas.getContext('2d', { threaded: false });
const gl = canvas.getContext('webgl2', { threaded: false });
```

For every canvas, set the static defaults before you create any context:

```ts
import { Canvas } from '@nativescript/canvas';

Canvas.threaded2D = false;
Canvas.threadedWebGL = false;
```

Linux doesn't use threaded rendering yet. If your drawing code itself is the bottleneck, move it off the UI thread with an [OffscreenCanvas in a Worker](/canvas/guides/offscreen-canvas#rendering-in-a-worker).

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
| WebGL `activeTexture`, `blendFunc` | ~20 ns |
| `getImageData` (64x64, GPU canvas) | ~412 µs |
| WebGL `readPixels` (64x64) | ~188 µs |

These are JavaScript-side costs, measured before threaded rendering became the default. With threading, WebGL calls that return a value add a round trip to the WebGL thread (see above).

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

## Memory

- **Images stay encoded.** An `ImageAsset` loaded from a file, URL or encoded bytes keeps the compressed bytes, not the decoded pixels. 2D decodes it when uploading it to the GPU, and WebGL, WebGPU and `ImageBitmap` decode it for the call. Assets made from raw pixels keep their pixels.
- **The garbage collector sees image memory.** On Android and Apple platforms, `ImageAsset` and `ImageBitmap` report their native size to V8, so images you drop are collected promptly. You don't need to force a GC. Drop your references, or call `bitmap.close()` to free a bitmap right away.
- **GPU memory is trimmed.** A 2D canvas frees GPU resources it hasn't used for 5 seconds, such as a sprite sheet it no longer draws. Anything drawn every frame stays cached, so steady rendering pays nothing.

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
