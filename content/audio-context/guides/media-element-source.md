---
title: Media Element Source
description: Route media element playback through the audio graph.
---

# Media Element Source

Use `createMediaElementSource` when you want a media element/player to flow through your audio graph.

## Example

```ts
import { AudioContext } from '@nativescript/audio-context';
import { Audio } from '@nativescript/canvas-media';

const ctx = new AudioContext();
await ctx.resume();

const media = new Audio();
media.src = '~/assets/file-assets/audio/gs-16b-1c-44100hz.wav';
media.loop = true;

const mediaSource = ctx.createMediaElementSource(media);
const panner = ctx.createPanner({ panningModel: 'equalpower' });

mediaSource.connect(panner);
panner.connect(ctx.destination);

await media.play();

// Cleanup when done.
media.pause();
await ctx.close();
```

## Common pattern

- Media source node -> effect chain -> destination

## Media source with filter and compressor

```ts
import { AudioContext } from '@nativescript/audio-context';
import { Audio } from '@nativescript/canvas-media';

const ctx = new AudioContext();
await ctx.resume();

const media = new Audio();
media.src = '~/assets/file-assets/audio/song.wav';

const source = ctx.createMediaElementSource(media);
const filter = ctx.createBiquadFilter({ type: 'lowshelf', frequency: 180, gain: 3 });
const compressor = ctx.createDynamicsCompressor({ threshold: -20, ratio: 2.5 });

source.connect(filter);
filter.connect(compressor);
compressor.connect(ctx.destination);

await media.play();
```

## Playback rate control

```ts
import { AudioContext } from '@nativescript/audio-context';
import { Audio } from '@nativescript/canvas-media';

const ctx = new AudioContext();
await ctx.resume();

const media = new Audio();
media.src = '~/assets/file-assets/audio/loop.wav';

const source = ctx.createMediaElementSource(media);
source.connect(ctx.destination);

if (source.playbackRate) {
	source.playbackRate.setValueAtTime(1.0, ctx.currentTime);
	source.playbackRate.linearRampToValueAtTime(1.25, ctx.currentTime + 2);
}

await media.play();
```
