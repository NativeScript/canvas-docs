---
title: Decode and Play Audio
description: Load audio into an AudioBuffer and play it through the graph.
---

# Decode and Play Audio

`decodeAudioData` supports:

- App-relative file paths (for example `~/...`)
- `file://` paths
- Other decoder-supported string sources
- `ArrayBuffer` and `ArrayBufferView`

## Example

```ts
import { AudioContext } from '@nativescript/audio-context';

const ctx = new AudioContext({ latencyHint: 'playback' });
await ctx.resume();

const buffer = await ctx.decodeAudioData('~/assets/file-assets/audio/sine441stereo.mp3');

const source = ctx.createBufferSource();
source.buffer = buffer;
source.connect(ctx.destination);
source.start();

source.onended = async () => {
  await ctx.close();
};
```

## Example with ArrayBuffer input

```ts
import { AudioContext } from '@nativescript/audio-context';

async function decodeFromBytes(bytes: Uint8Array) {
  const ctx = new AudioContext();
  await ctx.resume();

  const buffer = await ctx.decodeAudioData(bytes.buffer);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start();

  source.onended = async () => {
    await ctx.close();
  };
}
```

## Callback-style decode (web-like pattern)

```ts
import { AudioContext } from '@nativescript/audio-context';

const ctx = new AudioContext();
await ctx.resume();

ctx.decodeAudioData(
  '~/assets/file-assets/audio/sine441stereo.mp3',
  (buffer) => {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
  },
  (error) => {
    console.error('decode failed', error);
  }
);
```

## Tips

- Reuse decoded buffers when replaying the same sound.
- Use separate gain nodes for per-track volume control.
