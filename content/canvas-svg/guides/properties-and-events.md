---
title: Properties and Events
description: Svg view properties, events and static helpers in @nativescript/canvas-svg.
---

# Properties and Events

## Properties

| Property | Default | Description |
| --- | --- | --- |
| `src` | | The path, URL or inline markup to render. |
| `gpu` | `true` | Rasterize on the GPU (Metal on Apple platforms, Vulkan or GL on Android). If no GPU context can be created, the view falls back to the CPU. |
| `threaded` | `true` | Rasterize off the UI thread. See [Rendering and Performance](/canvas-svg/guides/performance). |
| `shareSrc` | `true` | Views with the same `src` share one parsed document, one animation clock and one recording per frame. |
| `backend` | `auto` | Force `gl`, `vulkan` or `metal`. You should only need this to work around a driver problem. |
| `activeBackend` | | Read only. The backend actually in use. |
| `surfaceType` | `texture` | Android only. `texture` behaves like a normal view. `surface` composites faster, but the view cannot be transformed or overlapped. |

```xml
<svg:Svg src="~/assets/chart.svg" gpu="false" shareSrc="false" />
```

## Events

| Event | Fires when |
| --- | --- |
| `animationEnd` | Every animation in the document has finished. It never fires for an animation that repeats forever. |
| `contextLost` | The GPU context could not be rebuilt, and drawing has moved to the CPU. |
| `contextRestored` | A lost GPU context was rebuilt, and GPU drawing has resumed. |

```ts
view.on('animationEnd', () => console.log('done'));
view.on('contextLost', () => console.log('now drawing on the CPU'));
```

## Rendering a source once

`Svg.fromSrc` (async) and `Svg.fromSrcSync` return an `SvgData` with `width`, `height` and premultiplied RGBA `data`.

```ts
import { Svg } from '@nativescript/canvas-svg';

const data = await Svg.fromSrc('~/assets/icon.svg');
console.log(data.width, data.height, data.data?.byteLength);
```

These use Skia's static renderer. They do not animate, and the markup must state its own size. [`ImageAsset.loadSvg`](/canvas-svg/guides/canvas-integration#loading-into-an-imageasset) has neither limitation, so you will usually want that instead.
