---
title: Offline Rendering
description: Render audio buffers without real-time playback.
---

# Offline Rendering

`OfflineAudioContext` lets you render audio output as a buffer without sending it to speakers in real time.

## Example

```ts
import { OfflineAudioContext } from '@nativescript/audio-context';

const sampleRate = 44100;
const seconds = 2;
const off = new OfflineAudioContext(1, sampleRate * seconds, sampleRate);

const osc = off.createOscillator({ type: 'sine', frequency: 440 });
const gain = off.createGain({ gain: 0.2 });

osc.connect(gain);
gain.connect(off.destination);
osc.start();

const rendered = await off.startRendering();
console.log(rendered.length, rendered.sampleRate, rendered.numberOfChannels);
```

## Offline render with compressor and filter

```ts
import { OfflineAudioContext } from '@nativescript/audio-context';

const sampleRate = 48000;
const off = new OfflineAudioContext(2, sampleRate * 3, sampleRate);

const osc = off.createOscillator({ type: 'sawtooth', frequency: 140 });
const filter = off.createBiquadFilter({ type: 'lowpass', frequency: 2200, Q: 0.9 });
const comp = off.createDynamicsCompressor({ threshold: -26, ratio: 4 });

osc.connect(filter);
filter.connect(comp);
comp.connect(off.destination);

osc.start();
const rendered = await off.startRendering();

console.log('offline duration', rendered.duration);
```

## Render from decoded source

```ts
import { OfflineAudioContext } from '@nativescript/audio-context';

const sampleRate = 44100;
const off = new OfflineAudioContext(2, sampleRate * 4, sampleRate);

const buffer = await off.decodeAudioData('~/assets/file-assets/audio/song.mp3');
const source = off.createBufferSource({ buffer });

const gain = off.createGain({ gain: 0.85 });
source.connect(gain);
gain.connect(off.destination);

source.start(0);
const rendered = await off.startRendering();

console.log('rendered frames', rendered.length);
```

## When to use offline rendering

- Precomputing waveforms and effects.
- Export and bounce workflows.
- Audio analysis pipelines that do not need immediate playback.
