---
title: '@nativescript/canvas-svg'
description: Native SVG rendering for NativeScript with SMIL and CSS animation, a scriptable DOM, and GPU rasterization.
---

# @nativescript/canvas-svg

`@nativescript/canvas-svg` renders SVG natively on iOS, tvOS, visionOS and Android with Skia. Version 3.0 is a ground-up rewrite.

- **Animation included.** SMIL (`<animate>`, `<animateTransform>`, `<animateMotion>`, `<set>`) and CSS `@keyframes` play without any extra code.
- **A real DOM.** When [`@nativescript/canvas-polyfill`](/plugins/canvas-polyfill) is installed, you can build and change an SVG with `document.createElementNS`, `setAttribute` and `appendChild`, as in a browser.
- **GPU rasterization.** Metal on Apple platforms, and Vulkan or GL on Android. Drawing happens off the UI thread, and the view falls back to the CPU automatically.
- **Works as a canvas image source.** You can pass an SVG to `drawImage`, `createPattern`, `createImageBitmap`, `texImage2D` and WebGPU's `copyExternalImageToTexture`.

## Installation

```bash
npm install @nativescript/canvas-svg
```

It needs the same NativeScript 9.1+ runtime as [`@nativescript/canvas`](/canvas/installation).

## Quick start

`src` accepts an app-relative path, an absolute path, a URL, or inline markup.

```xml
<Page xmlns:svg="@nativescript/canvas-svg">
  <svg:Svg src="~/assets/rocket.svg" width="100%" height="100%" />
</Page>
```

```ts
import { Svg } from '@nativescript/canvas-svg';

const view = new Svg();
view.src = '~/assets/rocket.svg';
```

Any animations in the source start once the view is loaded, and pause while it is off screen.

## Guides

- [Properties and Events](/canvas-svg/guides/properties-and-events)
- [Building SVG with the DOM](/canvas-svg/guides/dom)
- [Animation](/canvas-svg/guides/animation)
- [Drawing SVG into a Canvas](/canvas-svg/guides/canvas-integration)
- [Rendering and Performance](/canvas-svg/guides/performance)

## Limitations

- A document loaded from `src` cannot be scripted. This is what allows views to share it.
- For text elements in a document loaded from `src`, you can only read or replace text that was added through the DOM.
- `steps()` easing runs as linear.
- A SMIL `begin` that waits for an event (such as `click`) never starts on its own.
