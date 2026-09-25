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
- Supported platforms: iOS, tvOS, visionOS and Android. The tvOS simulator build is arm64 only, so use an Apple silicon Mac to run it in the simulator.

## Verify setup

Create a context and log the initial state:

```ts
import { AudioContext } from '@nativescript/audio-context';

const ctx = new AudioContext();
console.log(ctx.state);
```

## Recommended next step

After installation, continue with [Quick Start](/audio-context/quick-start) to create your first signal chain.
