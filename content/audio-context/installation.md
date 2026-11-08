---
title: Installation
description: Install @nativescript/audio-context and prepare your app.
---

# Installation

Install with NativeScript CLI:

```bash
ns plugin add @nativescript/audio-context
```

Or install with npm:

```bash
npm install @nativescript/audio-context
```

## Requirements

- `@nativescript/audio-context` 2.x requires **NativeScript 9.1 or later**. Pair it with `@nativescript/canvas` 3.x if you use both packages.
- Supported platforms: iOS, tvOS, visionOS, Android, Windows and Linux. The tvOS simulator build is arm64 only, so use an Apple silicon Mac to run it in the simulator.
- On Windows and Linux the graph is rendered by the [web-audio-api](https://github.com/orottier/web-audio-api-rs) engine, playing through WASAPI on Windows and ALSA on Linux (PulseAudio and PipeWire work through their ALSA plugins). `decodeAudioData` reads WAV, MP3, Ogg Vorbis, FLAC and AAC. A `WaveShaperNode` takes only one curve: assigning a second throws `InvalidStateError`.

## Verify setup

Create a context and log the initial state:

```ts
import { AudioContext } from '@nativescript/audio-context';

const ctx = new AudioContext();
console.log(ctx.state);
```

## Recommended next step

After installation, continue with [Quick Start](/audio-context/quick-start) to create your first signal chain.
