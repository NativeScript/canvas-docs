---
title: '@nativescript/canvas-media'
description: Video and audio playback views that double as canvas image and texture sources.
---

# @nativescript/canvas-media

Native `Video` and `Audio` elements with a web-like API. A video can also act as a frame source for 2D, WebGL and WebGPU.

```bash
npm install @nativescript/canvas-media
```

## Video in a layout

```xml
<Page xmlns:ui="@nativescript/canvas-media" xmlns:video="@nativescript/canvas-media/video">
  <video:Video playsinline="true" autoplay="true" loop="true" height="300">
    <ui:Source src="https://example.com/flower.mp4" type="video/mp4" />
  </video:Video>
</Page>
```

A `src` beginning with `~/` resolves to the app folder. On iOS, `<Source>` entries of type `video/webm` are skipped.

### Properties

`src`, `controls`, `loop`, `autoplay`, `playsinline`, `muted`, `currentTime`, `duration` (read only), and `readyState` (`HAVE_NOTHING` through `HAVE_ENOUGH_DATA`).

### Methods

`play()` (returns a Promise), `pause()`, `load()`, `canPlayType()`, `requestVideoFrameCallback(cb)` and `cancelVideoFrameCallback()`.

### Events

`play`, `playing`, `pause`, `canplay`, `canplaythrough`, `timeupdate`, `durationchange`, `loadedmetadata` and `loadeddata`. `Audio` also fires `ended` and `error`.

```ts
video.addEventListener('loadeddata', () => console.log('first frame ready'));
```

## Video as a canvas source

The simplest way to get a video that works with every context is the polyfill's `<video>` element, which is backed by this package:

```ts
import '@nativescript/canvas-polyfill';

const video = document.createElement('video');
video.src = '~/assets/clip.mp4';
video.muted = true;
await video.play();
```

| Context | How |
| --- | --- |
| 2D | `ctx.drawImage(video, 0, 0, w, h)` |
| WebGL | `gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)` |
| WebGL2 | `texImage2D` and `texImage3D` |
| WebGPU | `device.queue.copyExternalImageToTexture({ source: video }, { texture }, [w, h])`. This is zero-copy on Apple platforms; Android support is limited. See the [WebGPU video recipe](/canvas/guides/webgpu-recipes#_10-video-frames-as-a-texture). |

WebGL `texImage2D` and WebGPU also accept a `Video` view directly.

::: tip Android
A video feeds one kind of consumer at a time. If you draw the same video with WebGL or 2D, its WebGPU path is released.
:::

## VideoFrame

`VideoFrame` follows the WebCodecs shape: `format`, `codedWidth`, `codedHeight`, `visibleRect`, `displayWidth`, `displayHeight`, `timestamp`, `duration`, `copyTo()`, `clone()` and `close()`.

```ts
import { VideoFrame } from '@nativescript/canvas-media';

video.addEventListener('loadeddata', () => {
  const frame = new VideoFrame(video);
  const rgba = frame.pixelData; // Uint8Array (non-standard)
  frame.close();
});
```

The frame is a CPU copy in RGBA. Canvas APIs don't accept a `VideoFrame` directly, so upload its pixels with `writeTexture` or `texImage2D`. Capturing a frame throws if the video is in the background or has no frame yet. Wait for `loadeddata` first.
