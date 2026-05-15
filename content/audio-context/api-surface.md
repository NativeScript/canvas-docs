---
title: Supported API Surface
description: Main classes, nodes, and lifecycle APIs in @nativescript/audio-context.
---

# Supported API Surface

## Main contexts

- [AudioContext](https://developer.mozilla.org/docs/Web/API/AudioContext)
- [OfflineAudioContext](https://developer.mozilla.org/docs/Web/API/OfflineAudioContext)

## Core graph primitives

- [AudioNode](https://developer.mozilla.org/docs/Web/API/AudioNode)
- [AudioParam](https://developer.mozilla.org/docs/Web/API/AudioParam)
- [AudioBuffer](https://developer.mozilla.org/docs/Web/API/AudioBuffer)

## Source and processing nodes

- [AudioBufferSourceNode](https://developer.mozilla.org/docs/Web/API/AudioBufferSourceNode)
- [MediaElementAudioSourceNode](https://developer.mozilla.org/docs/Web/API/MediaElementAudioSourceNode)
- [GainNode](https://developer.mozilla.org/docs/Web/API/GainNode)
- [BiquadFilterNode](https://developer.mozilla.org/docs/Web/API/BiquadFilterNode)
- [PannerNode](https://developer.mozilla.org/docs/Web/API/PannerNode)
- [StereoPannerNode](https://developer.mozilla.org/docs/Web/API/StereoPannerNode)
- [DelayNode](https://developer.mozilla.org/docs/Web/API/DelayNode)
- [ConstantSourceNode](https://developer.mozilla.org/docs/Web/API/ConstantSourceNode)
- [OscillatorNode](https://developer.mozilla.org/docs/Web/API/OscillatorNode)
- [AnalyserNode](https://developer.mozilla.org/docs/Web/API/AnalyserNode)
- [WaveShaperNode](https://developer.mozilla.org/docs/Web/API/WaveShaperNode)
- [IIRFilterNode](https://developer.mozilla.org/docs/Web/API/IIRFilterNode)
- [ConvolverNode](https://developer.mozilla.org/docs/Web/API/ConvolverNode)
- [DynamicsCompressorNode](https://developer.mozilla.org/docs/Web/API/DynamicsCompressorNode)
- [ChannelSplitterNode](https://developer.mozilla.org/docs/Web/API/ChannelSplitterNode)
- [ChannelMergerNode](https://developer.mozilla.org/docs/Web/API/ChannelMergerNode)
- [PeriodicWave](https://developer.mozilla.org/docs/Web/API/PeriodicWave)

Recent additions include [DynamicsCompressorNode](https://developer.mozilla.org/docs/Web/API/DynamicsCompressorNode) for compression workflows and channel routing helpers like [ChannelSplitterNode](https://developer.mozilla.org/docs/Web/API/ChannelSplitterNode) and [ChannelMergerNode](https://developer.mozilla.org/docs/Web/API/ChannelMergerNode).

## Lifecycle and routing

- [`resume()`](https://developer.mozilla.org/docs/Web/API/AudioContext/resume)
- [`suspend()`](https://developer.mozilla.org/docs/Web/API/AudioContext/suspend)
- [`close()`](https://developer.mozilla.org/docs/Web/API/AudioContext/close)
- [`state`](https://developer.mozilla.org/docs/Web/API/BaseAudioContext/state)
- [`onstatechange`](https://developer.mozilla.org/docs/Web/API/BaseAudioContext/statechange_event)
- [`sinkId`](https://developer.mozilla.org/docs/Web/API/AudioContext/sinkId)
- [`setSinkId(deviceId)`](https://developer.mozilla.org/docs/Web/API/AudioContext/setSinkId)

## Web-style factory method parity

```ts
import { AudioContext } from '@nativescript/audio-context';

const ctx = new AudioContext();

// Same creation flow web audio developers expect.
const gain = ctx.createGain();
const filter = ctx.createBiquadFilter();
const panner = ctx.createPanner();
const stereo = ctx.createStereoPanner();
const delay = ctx.createDelay();
const analyser = ctx.createAnalyser();
const shaper = ctx.createWaveShaper();
const convolver = ctx.createConvolver();
const compressor = ctx.createDynamicsCompressor();
const split = ctx.createChannelSplitter({ numberOfOutputs: 2 });
const merge = ctx.createChannelMerger({ numberOfInputs: 2 });

const osc = ctx.createOscillator();
const source = ctx.createBufferSource();

osc.connect(filter);
filter.connect(compressor);
compressor.connect(gain);
gain.connect(ctx.destination);
```

## Optional global polyfill integration

If your app also uses `@nativescript/canvas-polyfill`, browser-like audio globals can be registered for compatibility with libraries that expect them:

- [AudioContext](https://developer.mozilla.org/docs/Web/API/AudioContext)
- [webkitAudioContext](https://developer.mozilla.org/docs/Web/API/AudioContext)
- [OfflineAudioContext](https://developer.mozilla.org/docs/Web/API/OfflineAudioContext)
- Node constructors such as [GainNode](https://developer.mozilla.org/docs/Web/API/GainNode) and [PannerNode](https://developer.mozilla.org/docs/Web/API/PannerNode)

## Related docs

- [Quick Start](/audio-context/quick-start)
- [Web API Samples](/audio-context/guides/web-api-samples)
- [Dynamics Compression](/audio-context/guides/dynamics-compression)
- [Routing and Mixing](/audio-context/guides/routing-and-mixing)
- [Decode and Play Audio](/audio-context/guides/decode-and-play)
- [Offline Rendering](/audio-context/guides/offline-rendering)
