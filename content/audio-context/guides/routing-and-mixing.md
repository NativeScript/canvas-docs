---
title: Routing and Mixing
description: Web-style bus routing, split/merge, and send/return patterns.
---

# Routing and Mixing

This guide shows bus-style routing patterns similar to web-based DAW or game audio graphs.

## 1. Multi-source mix bus

```ts
import { AudioContext } from '@nativescript/audio-context';

const ctx = new AudioContext();
await ctx.resume();

const music = ctx.createBufferSource();
music.buffer = await ctx.decodeAudioData('~/assets/audio/music.wav');

const fx = ctx.createBufferSource();
fx.buffer = await ctx.decodeAudioData('~/assets/audio/fx.wav');

const musicGain = ctx.createGain({ gain: 0.6 });
const fxGain = ctx.createGain({ gain: 0.9 });
const master = ctx.createGain({ gain: 0.8 });

music.connect(musicGain);
fx.connect(fxGain);
musicGain.connect(master);
fxGain.connect(master);
master.connect(ctx.destination);

music.start();
fx.start();
```

## 2. Send/return reverb bus

```ts
import { AudioContext } from '@nativescript/audio-context';

const ctx = new AudioContext();
await ctx.resume();

const source = ctx.createBufferSource();
source.buffer = await ctx.decodeAudioData('~/assets/audio/snare.wav');

const dry = ctx.createGain({ gain: 0.9 });
const send = ctx.createGain({ gain: 0.25 });
const reverb = ctx.createConvolver();
reverb.buffer = await ctx.decodeAudioData('~/assets/audio/impulse.wav');

source.connect(dry);
source.connect(send);
send.connect(reverb);

dry.connect(ctx.destination);
reverb.connect(ctx.destination);

source.start();
```

## 3. Left/right independent processing

```ts
import { AudioContext } from '@nativescript/audio-context';

const ctx = new AudioContext();
await ctx.resume();

const source = ctx.createBufferSource();
source.buffer = await ctx.decodeAudioData('~/assets/audio/stereo-loop.wav');

const split = ctx.createChannelSplitter({ numberOfOutputs: 2 });
const merge = ctx.createChannelMerger({ numberOfInputs: 2 });

const leftFilter = ctx.createBiquadFilter({ type: 'lowpass', frequency: 800 });
const rightFilter = ctx.createBiquadFilter({ type: 'highpass', frequency: 1200 });

source.connect(split);
split.connect(leftFilter, 0);
split.connect(rightFilter, 1);

leftFilter.connect(merge, 0, 0);
rightFilter.connect(merge, 0, 1);

merge.connect(ctx.destination);
source.start();
```

## 4. Shared compressor bus for multiple sources

```ts
import { AudioContext } from '@nativescript/audio-context';

const ctx = new AudioContext();
await ctx.resume();

const a = ctx.createBufferSource();
const b = ctx.createBufferSource();
a.buffer = await ctx.decodeAudioData('~/assets/audio/drums.wav');
b.buffer = await ctx.decodeAudioData('~/assets/audio/bass.wav');

const bus = ctx.createGain({ gain: 1 });
const comp = ctx.createDynamicsCompressor({ threshold: -24, ratio: 4 });

const aGain = ctx.createGain({ gain: 0.8 });
const bGain = ctx.createGain({ gain: 0.8 });

a.connect(aGain);
b.connect(bGain);
aGain.connect(bus);
bGain.connect(bus);

bus.connect(comp);
comp.connect(ctx.destination);

a.start();
b.start();
```

## 5. Media element plus synth in one graph

```ts
import { AudioContext } from '@nativescript/audio-context';
import { Audio } from '@nativescript/canvas-media';

const ctx = new AudioContext();
await ctx.resume();

const media = new Audio();
media.src = '~/assets/audio/music.wav';

const mediaSource = ctx.createMediaElementSource(media);
const synth = ctx.createOscillator({ type: 'sine', frequency: 440 });
const synthGain = ctx.createGain({ gain: 0.05 });

const master = ctx.createGain({ gain: 0.85 });

mediaSource.connect(master);
synth.connect(synthGain);
synthGain.connect(master);
master.connect(ctx.destination);

await media.play();
synth.start();
```

## Routing checklist

- Build small reusable buses with gain nodes.
- Use splitter/merger for channel-specific logic.
- Keep dry/wet and send levels explicit with gain controls.
- Add analysis and compression at bus boundaries for predictable metering and loudness.
