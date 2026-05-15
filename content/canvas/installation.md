---
title: Installation
description: Install and set up @nativescript/canvas in your NativeScript project.
---

# Installation

Install the package with either NativeScript CLI or npm:

```bash
ns plugin add @nativescript/canvas
```

```bash
npm install @nativescript/canvas
```

## Platform support

- Minimum iOS: 11
- Minimum Android: 21

## Namespace setup for XML templates

For NativeScript Core XML pages, include the Canvas namespace on the `Page` element:

```xml
<Page xmlns:canvas="@nativescript/canvas">
  <GridLayout>
    <canvas:Canvas id="canvas" width="100%" height="100%" ready="canvasReady" />
  </GridLayout>
</Page>
```

## Ready callback

In your page script, the ready callback gives you the Canvas view instance:

```ts
let canvas;

export function canvasReady(args) {
  canvas = args.object;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#16a34a';
  ctx.fillRect(10, 10, 150, 100);
}
```

## Continue

- [Quick Start](/canvas/quick-start)
- [Rendering Contexts](/canvas/rendering-contexts)
