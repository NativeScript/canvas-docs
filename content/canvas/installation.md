---
title: Installation
description: Install and set up @nativescript/canvas in your NativeScript project.
---

# Installation

Install the package with either the NativeScript CLI or npm:

```bash
ns plugin add @nativescript/canvas
```

```bash
npm install @nativescript/canvas
```

## Requirements

`@nativescript/canvas` 3.x requires **NativeScript 9.1 or later** (`@nativescript/core`, `@nativescript/ios` and `@nativescript/android`). 3.x is built directly against the V8 engine in those runtimes, so older runtimes cannot load it. If you are on an older version, see [Upgrading to 3.0](/canvas/upgrading).

On iOS, tvOS and visionOS the native code is delivered through Swift Package Manager, and the plugin's own `nativescript.config.ts` sets this up. You don't need a Podfile, and your app doesn't need any extra configuration.

## Platform support

| Platform | Minimum | Notes |
| --- | --- | --- |
| iOS | 12.0 | |
| tvOS | 13.0 | New in 3.0 |
| visionOS | 1.0 | Metal only. `webgl` and `webgl2` are not available. |
| Android | API 21 | The Vulkan 2D backend needs API 24. |

### Context support per platform

| Context | iOS / tvOS | visionOS | Android |
| --- | --- | --- | --- |
| `2d` | Metal (GL with `Canvas.forceGL`) | Metal | Vulkan, or GL when Vulkan is unavailable |
| `webgl`, `webgl2` | Yes | No | Yes |
| `webgpu` | Yes (Metal) | Yes (Metal) | Yes (Vulkan, API 27+) |
| `bitmaprenderer` | Yes | Yes | Yes |

## Core (XML)

For NativeScript Core XML pages, add the Canvas namespace to the `Page` element:

```xml
<Page xmlns:canvas="@nativescript/canvas">
  <GridLayout>
    <canvas:Canvas id="canvas" width="100%" height="100%" ready="canvasReady" />
  </GridLayout>
</Page>
```

The `ready` callback gives you the Canvas view:

```ts
let canvas;

export function canvasReady(args) {
  canvas = args.object;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#16a34a';
  ctx.fillRect(10, 10, 150, 100);
}
```

## Angular

```ts
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptModule } from '@nativescript/angular';
import { CanvasModule } from '@nativescript/canvas/angular';

@NgModule({
  imports: [NativeScriptModule, CanvasModule],
  schemas: [NO_ERRORS_SCHEMA],
})
export class AppModule {}
```

```html
<Canvas width="100%" height="100%" (ready)="onReady($event)"></Canvas>
```

## Vue

```ts
import CanvasPlugin from '@nativescript/canvas/vue';

Vue.use(CanvasPlugin);
```

```html
<Canvas width="100%" height="100%" @ready="onReady" />
```

## React

Importing the React entry point registers the element:

```tsx
import '@nativescript/canvas/react';

<tnsCanvas width="100%" height="100%" onReady={onReady} />
```

## Svelte

```ts
import '@nativescript/canvas/svelte';
```

```html
<canvas width="100%" height="100%" on:ready={onReady} />
```

## Web globals

Some web APIs, including `navigator.gpu` for WebGPU, the global `createImageBitmap`, `document.fonts` and `document.createElement`, come from [`@nativescript/canvas-polyfill`](/plugins/canvas-polyfill). Import it once at app startup if you need them:

```ts
// app.ts
import '@nativescript/canvas-polyfill';
```

## Continue

- [Quick Start](/canvas/quick-start)
- [Rendering Contexts](/canvas/rendering-contexts)
- [Upgrading to 3.0](/canvas/upgrading)
