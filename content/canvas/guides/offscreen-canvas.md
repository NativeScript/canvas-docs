---
title: OffscreenCanvas and Workers
description: Draw without a view using OffscreenCanvas, hand a view's drawing to it, and move it to a Worker so rendering runs on another JavaScript thread.
---

# OffscreenCanvas and Workers

`OffscreenCanvas` is a canvas with no view. It supports the same contexts as `Canvas`: `2d`, `bitmaprenderer`, `webgl`, `webgl2` and `webgpu`. You can use it in three ways:

- Draw off screen, then use the result as an image.
- Take over a view's drawing with `transferControlToOffscreen()`.
- Move it to a Worker, so a whole render loop runs on another JavaScript thread while its frames still show in the view.

## Drawing off screen

```ts
import { OffscreenCanvas } from '@nativescript/canvas';

const sprite = new OffscreenCanvas(64, 64);
const ctx = sprite.getContext('2d');
ctx.fillStyle = 'tomato';
ctx.fillRect(0, 0, 64, 64);

// Later, on a visible canvas:
visible.getContext('2d').drawImage(sprite, 0, 0);
```

An OffscreenCanvas works as an image source in every place that takes a `Canvas`: `drawImage`, `createPattern`, `createImageBitmap`, `texImage2D`, `texSubImage2D` and `copyExternalImageToTexture`.

To get a frame out of it:

```ts
const bitmap = sprite.transferToImageBitmap(); // hands the frame over and clears the canvas
const blob = await sprite.convertToBlob({ type: 'image/png' });
```

`OffscreenCanvas` and `OffscreenCanvasRenderingContext2D` are exported from `@nativescript/canvas`, and importing the package also installs them as globals.

## Taking over a view

`canvas.transferControlToOffscreen()` returns an OffscreenCanvas that draws into the view's own surface, so its frames appear in the view:

```ts
const offscreen = canvas.transferControlToOffscreen();
const ctx = offscreen.getContext('2d');
```

As on the web:

- The view must not have a context yet. Otherwise, and if it was already transferred, `transferControlToOffscreen()` throws `InvalidStateError`.
- Once transferred, the view's `getContext()` and its `width` and `height` setters throw. Resize through the OffscreenCanvas instead.
- `contextlost` and `contextrestored` from the view are forwarded to the OffscreenCanvas.

## Rendering in a Worker

A Worker that owns an OffscreenCanvas draws into it on its own thread. If the canvas came from a view, the view keeps showing the Worker's frames. This keeps a heavy render loop, and the JavaScript that drives it, off the UI thread.

Inside the Worker, import `@nativescript/canvas/worker` before anything else. It is the canvas API without the `Canvas` view, which a Worker cannot create.

### Sending the canvas

**On Android and iOS**, the runtime can't transfer an OffscreenCanvas through `postMessage` yet, so send a handle instead:

```ts
// Main thread
import { OffscreenCanvas } from '@nativescript/canvas';

const worker = new Worker('./render.worker.ts');
const offscreen = canvas.transferControlToOffscreen();
worker.postMessage({ canvas: OffscreenCanvas._toHandle(offscreen) });
```

```ts
// render.worker.ts
import { OffscreenCanvas } from '@nativescript/canvas/worker';

self.onmessage = ({ data }) => {
  const canvas = OffscreenCanvas._fromHandle(data.canvas);
  const ctx = canvas.getContext('2d');

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // ...
    requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
};
```

**On Windows**, it moves with a transfer list, as on the web:

```ts
// Main thread
const offscreen = canvas.transferControlToOffscreen();
worker.postMessage({ canvas: offscreen }, [offscreen]);
```

```ts
// render.worker.ts
import '@nativescript/canvas/worker';

self.onmessage = ({ data }) => {
  const canvas: OffscreenCanvas = data.canvas;
  const ctx = canvas.getContext('webgl2');
  // ...
};
```

To write one version for every platform, check whether the runtime can transfer, and send whichever form it supports:

```ts
// Main thread
const offscreen = canvas.transferControlToOffscreen();
const transferable = typeof (global as any).__nsRegisterTransferable === 'function';
if (transferable) {
  worker.postMessage({ canvas: offscreen }, [offscreen]);
} else {
  worker.postMessage({ handle: OffscreenCanvas._toHandle(offscreen) });
}
```

```ts
// render.worker.ts
import { OffscreenCanvas } from '@nativescript/canvas/worker';

self.onmessage = ({ data }) => {
  const canvas = data.canvas ?? OffscreenCanvas._fromHandle(data.handle);
  // ...
};
```

When Android and iOS add transfer support, this code takes the web path there without any change.

### Rules

- Sending a canvas, with a transfer list or `_toHandle`, detaches the OffscreenCanvas on the sending side. It must not have a context yet.
- A handle can be received only once. If nothing will receive a handle, release it with `OffscreenCanvas._releaseHandle(handle)`.
- All five context types work in a Worker.
- A Worker can create its own canvas with `new OffscreenCanvas(width, height)`, and can transfer it back to the main thread.
- Resizing the canvas in the Worker resizes the view on the UI thread a moment later.
- `requestAnimationFrame` in a Worker is paced by that Worker's own canvases. A canvas that falls behind holds back only the Worker that owns it.
- Terminating the Worker, or disposing of the view while the Worker is still drawing, is safe.

## Do I need a Worker?

Usually not. 2D and WebGL contexts already rasterize and present on their own threads by default (see [Performance](/canvas/performance#threaded-rendering)). That moves the GPU work off the UI thread, but your drawing code still runs there.

Move rendering to a Worker when the JavaScript itself is the bottleneck: physics, scene updates, or thousands of draw calls per frame.

## Related docs

- [Rendering Contexts](/canvas/rendering-contexts)
- [Images and ImageBitmap](/canvas/guides/images-and-bitmaps)
- [Performance](/canvas/performance)
- [Web API Compatibility](/canvas/compatibility)
