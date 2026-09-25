---
title: Upgrading to 3.0
description: Requirements, breaking changes and behaviour changes when moving from @nativescript/canvas 2.x to 3.0.
---

# Upgrading to 3.0

## Requirements

- **NativeScript 9.1 or later.** 3.x is compiled against the V8 14 engine shipped in the 9.1 runtimes. It cannot load on older runtimes.
- **Upgrade every package together.** The canvas packages share native code and V8 headers, so mixing major versions leads to build or load failures.

| Package | Version |
| --- | --- |
| `@nativescript/canvas`, `canvas-svg`, `canvas-media`, `canvas-polyfill` | 3.x |
| `canvas-three`, `canvas-pixi`, `canvas-chartjs`, `canvas-phaser`, `canvas-phaser-ce`, `canvas-babylon` | 3.x |
| `@nativescript/audio-context` | 2.x |

```bash
ns clean
npm install @nativescript/core@~9.1 @nativescript/canvas@3 @nativescript/canvas-polyfill@3
npm install -D @nativescript/ios@~9.1 @nativescript/android@~9.1
```

## Build changes

- **No Podfile.** The iOS Podfile has been removed, and native code now arrives entirely through Swift Package Manager. If you copied the old `post_install` header-path hook into your app's Podfile, delete it.
- **C++20.** The plugin's `build.xcconfig` now sets `CLANG_CXX_LANGUAGE_STANDARD = c++20`, which V8 14 needs. Any other C++ code in your iOS app target is compiled as C++20 too.
- **Install into the app's own `node_modules`.** The iOS header and Swift package paths are resolved relative to the app. A copy of the plugin hoisted to a workspace root is not found yet.

## New in 3.0

- [tvOS support](/canvas/installation#platform-support), with Siri Remote presses delivered as [keyboard events](/canvas/events#keyboard-and-tvos-remote).
- The [`bitmaprenderer` context](/canvas/rendering-contexts#bitmaprenderer), and [`createImageBitmap`](/canvas/guides/images-and-bitmaps#createimagebitmap) from any image, canvas, blob or SVG source.
- Zero-copy [video frames in WebGPU](/canvas/guides/webgpu-recipes#_10-video-frames-as-a-texture) on iOS, tvOS and visionOS.
- [`@nativescript/canvas-svg`](/canvas-svg/), rewritten: a live DOM, SMIL and CSS animation, and GPU rendering.
- `ctx.reset()` and `ctx.getContextAttributes()` on the 2D context. `setTransform()` with no arguments resets the transform.
- Large reductions in per-call cost for 2D text, fonts, `save`/`restore` and WebGL. See [Performance](/canvas/performance).

## Behaviour changes

Most of these are spec fixes: the canvas now behaves like a browser where it previously did not. Check your app for each one.

### Canvas 2D

- **Invalid arguments now throw, as they do in browsers.** A negative radius in `arc`, `ellipse` or `createRadialGradient`, an `addColorStop` offset outside 0 to 1 or with an unparseable colour, and a zero-sized `getImageData` or `createImageData` all throw `IndexSizeError` or `SyntaxError`.
- **Invalid values are ignored instead of applied.** This covers non-finite transform and shadow values; a `lineWidth` or `miterLimit` that is zero or less, NaN or infinite; a non-finite `lineDashOffset`; dash lists with negative entries; and invalid `filter`, `letterSpacing`, `wordSpacing` or `direction` values.
- **Setting `canvas.width` or `canvas.height` resets the context.** It clears the pixels and restores every 2D state to its default (transform, styles, font, dashes and the save stack), as on the web. Changing the layout size does not reset.
- **`setLineDash`, `roundRect` with a radii array, and WebGL2 `drawBuffers` now work on iOS.** In 2.x they did nothing, so drawings that used them will look different.
- `isPointInStroke` now tests the stroked outline (in 2.x it always returned `false`), and `isPointInPath` uses device-space coordinates.
- `globalAlpha` is preserved when `fillStyle` is set later.
- Patterns and filters fade out at their edges instead of smearing.
- The `fillStyle` and `strokeStyle` getters return the same `CanvasGradient` or `CanvasPattern` object you set.
- `createPattern(img, null)` and `createPattern(img, '')` mean `'repeat'`.
- `measureText('')` returns a `TextMetrics` object instead of `undefined`.
- On iOS, `getContext('2d')` returns `null` once the canvas already has a WebGPU context. Android already behaved this way.

### WebGL

- `clear()` respects the scissor rectangle.
- `getFragDataLocation` returns `-1` rather than `null` for an unknown name. Update any `=== null` checks.
- `getParameter` returns values for WebGL2-only parameters, where it used to return an object.

### WebGPU

- Missing depth and stencil load/store ops are no longer filled in. Give the ops for each aspect your format has: depth-only formats such as `depth24plus` take only `depthLoadOp` and `depthStoreOp`. This fixes the blank canvas that 2.x showed for depth-only formats. See [recipe 9](/canvas/guides/webgpu-recipes#_9-depth-attachments).
- `setIndexBuffer` treats any format other than `'uint16'` as `'uint32'`.

### Images

- `createImageBitmap` rejects sources it does not recognise, instead of never resolving.
- `ImageBitmap.close()` detaches the bitmap, so its `width` and `height` become `0`.
- `resizeHeight` is honoured. In 2.x it was overwritten with `resizeWidth`.
- An `ImageAsset` is no longer kept alive forever once it has loaded. Hold a reference for as long as you need it.

### Framework adapters

- **Chart.js and Pixi size canvases in CSS pixels.** In 2.x the device pixel ratio was applied twice. Remove any workaround, such as `devicePixelRatio: 1` or dividing sizes by `Screen.mainScreen.scale`. With Pixi, pass `width: canvas.clientWidth`, `height: canvas.clientHeight` and `resolution: devicePixelRatio`.

### Polyfill

- `window.addEventListener`, `clearTimeout`, `clearInterval`, `matchMedia` and `devicePixelRatio`, as well as `document.hidden`, `document.visibilityState`, `element.dataset` and `style.setProperty`, are all installed now. You can remove any shims you wrote for them.
- On tvOS, `localStorage`, blobs and downloaded images are stored in `Library/Caches` instead of `Documents`.

### canvas-svg

- The package has been rewritten. See [canvas-svg](/canvas-svg/).
- `initialSVG` and the XMLSerializer-based internals have been removed.
- A document without a `viewBox` no longer gets `viewBox="0 0 100 100"` invented for it. Percentage sizes resolve against the view, and a document larger than its view is scaled down to fit.
- Views with the same `src` now share one document and one animation clock. Set `shareSrc="false"` on any view that needs its own copy.
