---
title: Drawing SVG into a Canvas
description: Use SVG views and markup as image sources in 2D, WebGL and WebGPU contexts.
---

# Drawing SVG into a Canvas

Once you import `@nativescript/canvas-svg`, `@nativescript/canvas` accepts an SVG anywhere it takes an image.

## A view as an image source

You can pass an `Svg` view, or the polyfill's `<svg>` element, to any of these:

- `drawImage` and `createPattern` (2D)
- `createImageBitmap`
- `texImage2D`, `texSubImage2D` and `texImage3D` (WebGL)
- `copyExternalImageToTexture` (WebGPU)

```ts
import '@nativescript/canvas-svg';

ctx.drawImage(svgView, 0, 0, 300, 300);
```

- You get the view's current frame, so drawing every frame follows its animation.
- Sizes are in the view's CSS pixels, as they are for an `<img>` of an SVG on the web.
- `drawImage` rasterizes at the size the image lands at, so it stays sharp when scaled.
- If the frame has not changed, it is not rasterized again.

## Loading into an ImageAsset

`loadSvg` (async) and `loadSvgSync` accept markup, an app-relative (`~/`) or absolute path, or a view. `loadSvg` also accepts a URL.

```ts
import { ImageAsset } from '@nativescript/canvas';
import '@nativescript/canvas-svg';
import { Screen } from '@nativescript/core';

const asset = new ImageAsset();
await asset.loadSvg('~/assets/icon.svg', { width: 48, scale: Screen.mainScreen.scale });
ctx.drawImage(asset, 0, 0);
```

| Option | Default | Description |
| --- | --- | --- |
| `width`, `height` | intrinsic size | The size in CSS pixels. Pass one of them and the aspect ratio is kept. |
| `scale` | `1` | Pixels per CSS pixel. |
| `time` | `0` | The point in the animation to capture, in seconds. |

An `<img>` whose `src` is an SVG goes through the same loader.
