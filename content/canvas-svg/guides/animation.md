---
title: Animation
description: SMIL and CSS keyframe animation support in @nativescript/canvas-svg.
---

# Animation

Skia's SVG renderer does not animate on its own, so `@nativescript/canvas-svg` includes its own animation engine. It supports both of the formats that SVG exporters commonly produce.

## SMIL

Supported elements: `<animate>`, `<animateTransform>`, `<animateMotion>` (including `rotate="auto"`) and `<set>`.

Supported attributes: `values`, `from`, `to` and `by`, `keyTimes`, `keySplines`, `calcMode`, `repeatCount`, `fill="freeze"`, `additive` and `accumulate`.

```xml
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="10" fill="#F75930">
    <animate attributeName="r" values="10;30;10" dur="1.5s" repeatCount="indefinite" />
  </circle>
</svg>
```

A `begin` that waits for an event (such as `click`) never starts on its own.

## CSS

`@keyframes` in a `<style>` block work, whether you apply them through the `animation` shorthand or through its longhands: duration, delay, iteration count, direction, fill mode and timing function.

```xml
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <style>
    @keyframes spin { to { transform: rotate(360deg); } }
    #blade { transform-origin: 50px 50px; animation: spin 2s linear infinite; }
  </style>
  <rect id="blade" x="45" y="10" width="10" height="40" fill="#0ea5e9" />
</svg>
```

- Keyword easings and `cubic-bezier()` are supported. `steps()` runs as linear.
- Only `#id` selectors are read, which is what SVG exporters produce.

## Playback

- Animations start once the view is loaded, and pause while it is off screen.
- A redraw happens only when a change is actually visible, so an animation that is holding still costs nothing.
- Views that share a `src` also share a clock, so they animate in step. Set `shareSrc="false"` to give a view its own timeline.
- `animationEnd` fires once every animation in the document has finished.
