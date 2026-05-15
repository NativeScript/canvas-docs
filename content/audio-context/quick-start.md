---
title: Quick Start
description: Build your first oscillator and gain graph with @nativescript/audio-context.
---

# Quick Start

This is the minimal graph to synthesize a tone:

```ts
import { AudioContext } from '@nativescript/audio-context';

const ctx = new AudioContext({ latencyHint: 'interactive' });

const osc = ctx.createOscillator({ type: 'sine', frequency: 440 });
const gain = ctx.createGain({ gain: 0.12 });

osc.connect(gain);
gain.connect(ctx.destination);

await ctx.resume();
osc.start();

setTimeout(async () => {
  osc.stop();
  await ctx.close();
}, 1200);
```

## Lifecycle notes

- Call `resume()` before playback.
- Stop sources when done.
- Call `close()` to release resources.

## Next guides

- [Web API Samples](/audio-context/guides/web-api-samples)
- [Dynamics Compression](/audio-context/guides/dynamics-compression)
- [Routing and Mixing](/audio-context/guides/routing-and-mixing)
- [Decode and Play Audio](/audio-context/guides/decode-and-play)
- [Media Element Source](/audio-context/guides/media-element-source)
- [Offline Rendering](/audio-context/guides/offline-rendering)
