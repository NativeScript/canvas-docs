---
title: Canvas Playground
---

Open the interactive Canvas Playground to explore examples and export them to NativeScript.

- Live playground: [/canvas-playground/](canvas-playground/index.md)

Examples include 2D demos (bouncing balls, particles, waves), and 3D samples using WebGL and WebGPU.

Behavior
- Tap any example to auto-play it — the sample runs immediately when selected.
- The editor shows a syntax-highlighted preview of the current sample.

- Usage
- Open `/canvas-playground/` in your browser (or serve the site) and choose an example.
- Click "Export to NativeScript" to copy an XML and TypeScript snippet you can paste into a NativeScript page.

Notes
 - The exported TypeScript wraps the sample as a `new Function('canvas','ctx','dpr', code)` invocation so it runs with the provided `canvas` and `ctx`.
 - The export is tailored for `@nativescript/canvas`.

Install
```bash
npm install @nativescript/canvas
```

- The generated TypeScript attempts to use the plugin's `draw` event when available, or falls back to `canvas.getContext('2d')` if supported.
