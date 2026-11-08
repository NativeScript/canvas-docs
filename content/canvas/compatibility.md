---
title: Web API Compatibility
description: Which web Canvas APIs @nativescript/canvas 3.0 supports, which are no-ops, and which are not available yet.
---

# Web API Compatibility

`@nativescript/canvas` 3.0 implements almost all of the modern Canvas API, so most web code runs without changes. This page lists every interface it provides and calls out anything that behaves differently from a browser.

Each entry has one of three statuses:

- **Supported**: behaves as on the web.
- **No-op**: the member exists so web code doesn't throw, but it does nothing.
- **Not yet**: not available in 3.0. Calling a missing method throws a `TypeError`. Assigning a missing property sets a plain JavaScript property that has no effect on drawing.

## Not available yet

Everything else on this page is supported. These are the exceptions:

| API | Status | Workaround |
| --- | --- | --- |
| `postMessage(…, [offscreen])` on Android and iOS | Not yet | Send `OffscreenCanvas._toHandle(offscreen)` instead (see [OffscreenCanvas and Workers](/canvas/guides/offscreen-canvas#rendering-in-a-worker)). Windows supports the transfer list. |
| A WebGPU canvas as a WebGL `texImage2D` / `texSubImage2D` source on iOS and Android | Not yet | Works on Windows and Linux. |
| `canvas.toBlob()` | Not yet | Use `canvas.toDataURL()`, or `OffscreenCanvas.convertToBlob()`. |
| 2D `fontKerning`, `fontStretch`, `fontVariantCaps`, `textRendering` | Not yet | Text is shaped with the font's default kerning and stretch. |
| 2D `lang` | Not yet | |
| 2D `isContextLost()` | Not yet | Listen for `contextlost` where the host fires it (see [Context loss](#context-loss)). |
| `contextlost` / `webglcontextlost` events on iOS and Android | Not yet | They fire on Windows only. WebGL's `isContextLost()` works on every platform. |
| `ImageData` `colorSpace` and `getImageData()` settings | Not yet | Pixel data is always `srgb`. |
| `DOMMatrix`: `inverse()`, `invertSelf()`, `transformPoint()`, `flipX()`, `flipY()`, `isIdentity`, instance `multiply()`, `rotateAxisAngle()`, `rotateFromVector()`, `fromMatrix()`, `fromFloat32Array()`, `fromFloat64Array()`, `toFloat32Array()`, `toFloat64Array()` | Not yet | Use the static `DOMMatrix.multiply(a, b)`, or do the matrix maths in JavaScript. |
| `DOMPoint`, `DOMMatrixReadOnly`, `DOMRect` | Not yet | |
| `canvas.captureStream()` | Not planned | NativeScript has no `MediaStream`. |

## Canvas element

| Member | Status |
| --- | --- |
| `width`, `height` | Supported. These are pixels. CSS `width` / `height` set on the view are in dip. |
| `getContext()` with `'2d'`, `'bitmaprenderer'`, `'webgl'`, `'experimental-webgl'`, `'webgl2'`, `'webgpu'` | Supported |
| `toDataURL(type?, quality?)` | Supported |
| `transferControlToOffscreen()` | Supported |
| `getBoundingClientRect()`, `clientWidth`, `clientHeight` | Supported |
| `addEventListener()`, `removeEventListener()`, `dispatchEvent()` | Supported. See [Events and Input](/canvas/events). |
| `setPointerCapture()`, `releasePointerCapture()` | Supported |
| `toBlob()` | Not yet |
| `captureStream()` | Not planned |

## CanvasRenderingContext2D

### State, styles and compositing

All supported:

- `save()`, `restore()` and `reset()`
- `fillStyle`, `strokeStyle`
- `globalAlpha`, `globalCompositeOperation`
- `filter`
- `imageSmoothingEnabled`, `imageSmoothingQuality`
- `shadowBlur`, `shadowColor`, `shadowOffsetX`, `shadowOffsetY`
- `lineWidth`, `lineCap`, `lineJoin`, `miterLimit`
- `setLineDash()`, `getLineDash()`, `lineDashOffset`
- `getContextAttributes()`, `canvas`

Colours accept every CSS colour syntax, including `hsl()`, `hwb()`, `lab()`, `lch()`, `oklab()`, `oklch()` and `color()`.

### Context attributes

`alpha`, `colorSpace`, `willReadFrequently` and `desynchronized` are supported. `threaded` is a NativeScript extra. See [Rendering Contexts](/canvas/rendering-contexts) and [Threaded rendering](/canvas/performance#threaded-rendering).

### Paths and drawing

All supported:

- `beginPath()`, `closePath()`, `moveTo()`, `lineTo()`
- `bezierCurveTo()`, `quadraticCurveTo()`
- `arc()`, `arcTo()`, `ellipse()`
- `rect()`, `roundRect()`
- `fill()`, `stroke()` and `clip()`, each with or without a `Path2D` and with a fill rule
- `isPointInPath()`, `isPointInStroke()`
- `fillRect()`, `strokeRect()`, `clearRect()`
- `drawImage()`, in all three forms

### Text

| Member | Status |
| --- | --- |
| `fillText()`, `strokeText()`, `measureText()` | Supported |
| `font`, `textAlign`, `textBaseline`, `direction` | Supported |
| `letterSpacing`, `wordSpacing` | Supported |
| `fontKerning`, `fontStretch`, `fontVariantCaps`, `textRendering` | Not yet |
| `lang` | Not yet |

`TextMetrics` returns every field: `width`, the `actualBoundingBox*` and `fontBoundingBox*` values, `emHeightAscent`, `emHeightDescent`, `hangingBaseline`, `alphabeticBaseline` and `ideographicBaseline`.

### Gradients, patterns and transforms

All supported:

- `createLinearGradient()`, `createRadialGradient()`, `createConicGradient()` and `CanvasGradient.addColorStop()`
- `createPattern()` and `CanvasPattern.setTransform()`
- `translate()`, `rotate()`, `scale()`, `transform()`
- `setTransform()`, `getTransform()`, `resetTransform()`

### Pixels

| Member | Status |
| --- | --- |
| `createImageData()`, `getImageData()`, `putImageData()` (including the dirty rect) | Supported |
| `new ImageData(width, height)`, `new ImageData(data, width, height?)` | Supported |
| `ImageData.colorSpace` and the `settings` argument | Not yet. Data is always `srgb`. |

### No-ops

| Member | Why |
| --- | --- |
| `drawFocusIfNeeded()`, `scrollPathIntoView()` | There is no DOM focus or scroll model. |
| `addHitRegion()`, `removeHitRegion()`, `clearHitRegions()` | Removed from the specification. They exist only so older code doesn't throw. |

### Context loss

| Member | Status |
| --- | --- |
| `isContextLost()` | Not yet |
| `contextlost` / `contextrestored` events | Windows only |

## Path2D

| Member | Status |
| --- | --- |
| `new Path2D()`, `new Path2D(path)`, `new Path2D(svgPathData)` | Supported |
| `addPath()`, `moveTo()`, `lineTo()`, `closePath()`, `bezierCurveTo()`, `quadraticCurveTo()`, `arc()`, `arcTo()`, `ellipse()`, `rect()`, `roundRect()` | Supported |

## DOMMatrix

| Member | Status |
| --- | --- |
| `a`–`f`, `m11`–`m44`, `is2D` | Supported |
| `translate()`, `scale()`, `scaleNonUniform()`, `rotate()`, `skewX()`, `skewY()` and their `*Self()` forms | Supported |
| `multiplySelf()`, `preMultiplySelf()`, `setIdentity()`, `clone()` | Supported |
| `toJSON()`, `toString()` | Supported |
| Static `multiply()`, `translation()`, `scaling()`, `rotationX()`, `rotationY()`, `rotationZ()` | Supported. These are NativeScript extras. |
| `inverse()`, `invertSelf()`, `transformPoint()`, `flipX()`, `flipY()`, `isIdentity`, `multiply()`, `rotateAxisAngle()`, `rotateFromVector()` | Not yet |
| `fromMatrix()`, `fromFloat32Array()`, `fromFloat64Array()`, `toFloat32Array()`, `toFloat64Array()` | Not yet |

## ImageBitmap

| Member | Status |
| --- | --- |
| `createImageBitmap()` with every `ImageBitmapOptions` field (`imageOrientation`, `premultiplyAlpha`, `colorSpaceConversion`, `resizeWidth`, `resizeHeight`, `resizeQuality`) | Supported. The global `createImageBitmap` comes from [`@nativescript/canvas-polyfill`](/plugins/canvas-polyfill). |
| `width`, `height`, `close()` | Supported |
| `ImageBitmapRenderingContext.transferFromImageBitmap()` | Supported. Only the `alpha` attribute applies. |

See [Images and ImageBitmap](/canvas/guides/images-and-bitmaps) for the sources you can create a bitmap from.

## OffscreenCanvas

| Member | Status |
| --- | --- |
| `new OffscreenCanvas(width, height)`, `width`, `height` | Supported |
| `getContext()` with `'2d'`, `'bitmaprenderer'`, `'webgl'`, `'webgl2'`, `'webgpu'` | Supported |
| `transferToImageBitmap()`, `convertToBlob()` | Supported |
| `contextlost` / `contextrestored` events | Supported where the host fires them |
| As an image source for `drawImage()`, `createPattern()`, `createImageBitmap()`, `texImage2D()`, `texSubImage2D()` and `copyExternalImageToTexture()` | Supported |
| Moving to a Worker | Supported, with every context type. On Android and iOS, send a handle from `OffscreenCanvas._toHandle()`; Windows also takes a `postMessage` transfer list. See [OffscreenCanvas and Workers](/canvas/guides/offscreen-canvas). |

## WebGL and WebGL 2

The full WebGL 1 and WebGL 2 APIs are supported, including `isContextLost()`. iOS, tvOS, Android, Windows and Linux all provide them. visionOS doesn't.

`getSupportedExtensions()` reports what the device offers. `getExtension()` returns an object for these:

`ANGLE_instanced_arrays`, `EXT_blend_minmax`, `EXT_color_buffer_float`, `EXT_color_buffer_half_float`, `EXT_disjoint_timer_query`, `EXT_sRGB`, `EXT_shader_texture_lod`, `EXT_texture_filter_anisotropic`, `OES_element_index_uint`, `OES_standard_derivatives`, `OES_texture_float`, `OES_texture_float_linear`, `OES_texture_half_float`, `OES_texture_half_float_linear`, `OES_vertex_array_object`, `WEBGL_color_buffer_float`, `WEBGL_compressed_texture_atc`, `WEBGL_compressed_texture_etc`, `WEBGL_compressed_texture_etc1`, `WEBGL_compressed_texture_pvrtc`, `WEBGL_compressed_texture_s3tc`, `WEBGL_depth_texture`, `WEBGL_draw_buffers`, `WEBGL_lose_context`

`EXT_disjoint_timer_query_webgl2` always returns `null`.

## WebGPU

The WebGPU API is supported through `navigator.gpu`, which comes from the polyfill: adapters, devices, buffers, textures, samplers, shader modules, render and compute pipelines, bind groups, command encoders, render bundles, query sets, `importExternalTexture()` and `copyExternalImageToTexture()`. It uses Metal on Apple platforms, Vulkan on Android (API 27+) and Linux, and Direct3D 12 on Windows. See [WebGPU Recipes](/canvas/guides/webgpu-recipes).

## Related docs

- [API Overview](/canvas/api)
- [Rendering Contexts](/canvas/rendering-contexts)
- [Images and ImageBitmap](/canvas/guides/images-and-bitmaps)
- [Events and Input](/canvas/events)
- [Upgrading to 3.0](/canvas/upgrading)
