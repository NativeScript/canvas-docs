---
title: Images and ImageBitmap
description: Load images with ImageAsset, create ImageBitmaps from any source, and use canvases as image sources.
---

# Images and ImageBitmap

## Loading images with ImageAsset

`ImageAsset` is the canvas image type. Every loader comes in a synchronous version and a Promise version:

| Source | Sync | Async |
| --- | --- | --- |
| URL | `fromUrlSync(url)` | `fromUrl(url)` |
| File (`~/` for the app folder) | `fromFileSync(path)` | `fromFile(path)` |
| Encoded bytes (PNG, JPEG, ...) | `loadFromEncodedBytesSync(bytes)` | `loadFromEncodedBytes(bytes)` |
| Raw RGBA pixels | `loadFromBytesSync(w, h, bytes)` | `loadFromBytes(w, h, bytes)` |
| `UIImage` / `android.graphics.Bitmap` | `loadFromNativeSync(image)` | `loadFromNative(image)` |
| SVG (needs [`@nativescript/canvas-svg`](/canvas-svg/)) | `loadSvgSync(src, opts?)` | `loadSvg(src, opts?)` |

```ts
import { ImageAsset } from '@nativescript/canvas';

const asset = new ImageAsset();
await asset.fromFile('~/assets/sprite.png');
ctx.drawImage(asset, 0, 0);
```

To save an asset, use `save(path, ImageAssetSaveFormat.PNG)` or `saveSync`. The supported formats are `JPG`, `PNG`, `ICO`, `BMP` and `TIFF`.

## createImageBitmap

With [`@nativescript/canvas-polyfill`](/plugins/canvas-polyfill) installed, the global `createImageBitmap` works as it does on the web:

```ts
const bitmap = await createImageBitmap(asset);
const cropped = await createImageBitmap(asset, 0, 0, 64, 64);
const thumb = await createImageBitmap(asset, { resizeWidth: 128, resizeQuality: 'high' });
```

Without the polyfill, use the equivalent static methods:

```ts
import { ImageBitmap } from '@nativescript/canvas';

const bitmap = await ImageBitmap.createFrom(asset);
const cropped = await ImageBitmap.createFromRect(asset, 0, 0, 64, 64);
```

### Accepted sources

- `Canvas` (any context type)
- `ImageBitmap`, `ImageAsset` and `ImageData`
- `Blob`, `ArrayBuffer` or a typed array holding encoded image bytes
- The polyfill's `<img>` and `<canvas>` elements
- `Svg` views and SVG elements, when [`@nativescript/canvas-svg`](/canvas-svg/guides/canvas-integration) is installed

### Options

| Option | Values |
| --- | --- |
| `imageOrientation` | `'flipY'` |
| `premultiplyAlpha` | `'premultiply'`, `'none'` |
| `colorSpaceConversion` | `'none'` |
| `resizeWidth`, `resizeHeight` | number |
| `resizeQuality` | `'pixelated'`, `'low'` (default), `'medium'`, `'high'` |

Call `bitmap.close()` to release a bitmap early. After that, its `width` and `height` are `0`, and using it throws `InvalidStateError`.

To show a bitmap without copying it, present it with a [`bitmaprenderer`](/canvas/rendering-contexts#bitmaprenderer) context.

## Canvas as an image source

You can pass a canvas, or its context, anywhere an image is accepted: `drawImage`, `createPattern`, `createImageBitmap`, WebGL `texImage2D`, and WebGPU `copyExternalImageToTexture`. For example, you can render in WebGL and composite the result in 2D:

```ts
ctx2d.drawImage(glCanvas, 0, 0, 200, 200);
```

`drawImage` and `createPattern` also accept `@nativescript/core` `ImageSource` and `ImageAsset`, as well as a native `UIImage` or `android.graphics.Bitmap`.

## Exporting pixels

```ts
const png = canvas.toDataURL();                   // 'image/png'
const jpg = canvas.toDataURL('image/jpeg', 0.8);
const image = canvas.snapshot();                  // @nativescript/core ImageSource
```

For a canvas with zero width or height, `toDataURL` returns `'data:,'`, as it does on the web.
