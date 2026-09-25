---
title: '@nativescript/canvas-polyfill'
description: Browser globals (window, document, Image, createImageBitmap, navigator.gpu and more) for running web graphics code on NativeScript.
---

# @nativescript/canvas-polyfill

Web graphics libraries expect a browser: `window`, `document`, `Image`, `navigator.gpu`, `XMLHttpRequest` and so on. This package installs those globals, backed by `@nativescript/canvas`, `@nativescript/canvas-media` and `@nativescript/canvas-svg`.

```bash
npm install @nativescript/canvas-polyfill
```

Import it once, before anything that needs it:

```ts
// app.ts
import '@nativescript/canvas-polyfill';
```

The [framework adapters](/plugins/adapters) (Three.js, Pixi, Phaser, Babylon) import it for you.

## What it installs

| Area | Globals |
| --- | --- |
| Window | `window`, `self`, `devicePixelRatio`, `innerWidth`/`innerHeight` (updated on rotation), `screen.orientation`, `addEventListener`, `matchMedia`, `getComputedStyle`, `location`, `localStorage`, `sessionStorage` |
| Timers | `setTimeout`, `setInterval` and `requestAnimationFrame`, with their cancel functions, on `window` |
| Document | `document`, `document.fonts`, `document.createElement` (`canvas`, `img`, `video`, `audio`, `div`), `document.createElementNS` for SVG, `DOMParser`, `MutationObserver` |
| Elements | `HTMLCanvasElement`, `HTMLImageElement`/`Image`, `HTMLVideoElement`, `HTMLAudioElement`, and the `SVG*` element classes |
| Graphics | `navigator.gpu`, `createImageBitmap`, `ImageBitmap`, `ImageData`, `DOMPoint` |
| Data | `XMLHttpRequest` (supports `file://`, `~/`, `blob:` and `data:` URLs), `Blob`, `FileReader`, `URL.createObjectURL`, `TextEncoder`, `TextDecoder`, `AbortController` |
| Media | `VideoFrame`, `VideoColorSpace` |
| Audio | If [`@nativescript/audio-context`](/audio-context/) is installed: `AudioContext`, `OfflineAudioContext` and every node type |

`fetch` is not polyfilled here. It comes from `@nativescript/core`.

## Images

```ts
const img = new Image();
img.onload = () => ctx.drawImage(img, 0, 0);
img.src = '~/assets/photo.jpg';
```

An `<img>` whose `src` is an SVG is rasterized through [`@nativescript/canvas-svg`](/canvas-svg/guides/canvas-integration).

## Element sizes

Elements that are not backed by a real view report the window size, so libraries that measure `document.body` or `window` lay out full screen.

## Debugging

```ts
global.__debug_browser_polyfill_image = true; // log Image loading
```
