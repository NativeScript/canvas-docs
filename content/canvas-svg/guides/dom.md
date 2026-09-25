---
title: Building SVG with the DOM
description: Create and mutate SVG elements with browser DOM APIs using @nativescript/canvas-polyfill.
---

# Building SVG with the DOM

With [`@nativescript/canvas-polyfill`](/plugins/canvas-polyfill) installed, you can build and change an SVG the same way you would in a browser. Use the root `<svg>` element's `nativeElement` as the view you add to your layout.

```ts
import '@nativescript/canvas-polyfill';

const NS = 'http://www.w3.org/2000/svg';
const svg = document.createElementNS(NS, 'svg');
svg.setAttribute('width', '150');
svg.setAttribute('height', '150');

const circle = document.createElementNS(NS, 'circle');
circle.setAttribute('cx', '75');
circle.setAttribute('cy', '75');
circle.setAttribute('r', '40');
circle.setAttribute('fill', 'gold');
svg.appendChild(circle);

const label = document.createElementNS(NS, 'text');
label.setAttribute('x', '10');
label.setAttribute('y', '140');
label.textContent = 'Hello';
svg.appendChild(label);

layout.addChild(svg.nativeElement);
```

## Supported element APIs

- `setAttribute` and `getAttribute`
- `appendChild`, `append` and `removeChild`
- `textContent`

Attribute values are parsed by Skia's SVG parser, so they accept the same syntax as markup, including `style`, presentation attributes and transform lists.

## Updates are batched

However many changes you make in one frame, they produce a single redraw on the next frame:

```ts
circle.setAttribute('fill', 'orange');
circle.setAttribute('r', '50');
label.textContent = 'Updated';
// One redraw, not three.
```

## Animating from script

It also works to change attributes inside a `requestAnimationFrame` loop:

```ts
let start: number;

function tick(t: number) {
  start ??= t;
  const r = 40 + 10 * Math.sin((t - start) / 300);
  circle.setAttribute('r', r.toFixed(2));
  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);
```

For animations that can be expressed declaratively, SMIL or CSS in the markup is cheaper, because they run without calling into JavaScript on every frame. See [Animation](/canvas-svg/guides/animation).

::: tip
A document loaded through `src` cannot be scripted. If you need to change a document after loading it, build it through the DOM.
:::
