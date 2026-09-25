---
title: Rendering and Performance
description: How @nativescript/canvas-svg rasterizes, threads and shares documents, and when to change the defaults.
---

# Rendering and Performance

The defaults suit most apps. This page explains what each one does, so you know when to change it.

## GPU rasterization (`gpu`)

SVG filters and masks are fragment-shader work, and they account for most of the cost of a CPU frame. By default the view rasterizes on the GPU instead:

| Platform | Backend order for `auto` |
| --- | --- |
| iOS, tvOS, visionOS | Metal |
| Android | Vulkan, then GL |

If no backend can create a context, the view draws on the CPU. If a context is lost at runtime, for example after a driver reset, the view tries to rebuild it. When the rebuild fails, the view emits `contextLost` and keeps drawing on the CPU.

Use `backend="gl"` (or `vulkan` or `metal`) only to work around a particular driver. Use `gpu="false"` to force CPU rasterization.

## Off-thread drawing (`threaded`)

The frame is recorded on the UI thread, then drawn on a render thread that every threaded view shares. A heavy SVG therefore does not hold up the rest of the UI.

## Shared sources (`shareSrc`)

Views with the same `src` share one parsed document, one animation clock and one recording per frame, the same way `<img>` tags that point at one file do on the web. For example, ten copies of an icon in a list are parsed once and animate in step.

Sharing saves parsing, memory and recording time. It does not save rasterization, because each view still rasterizes into its own surface. Set `shareSrc="false"` when one copy needs its own animation timeline.

## Android surface type (`surfaceType`)

| Value | Behaviour |
| --- | --- |
| `texture` (default) | Behaves like any other view: it can be transformed, clipped, animated and overlapped. |
| `surface` | Composites faster, but cannot be transformed or overlapped. Use it for large, static, full-screen content. |

## Only visible changes redraw

Animations and DOM mutations trigger a redraw only when the rendered result changes. Several DOM mutations made in the same frame are coalesced into a single redraw.
