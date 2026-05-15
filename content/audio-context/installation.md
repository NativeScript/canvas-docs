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

## Verify setup

Create a context and log the initial state:

```ts
import { AudioContext } from '@nativescript/audio-context';

const ctx = new AudioContext();
console.log(ctx.state);
```

## Recommended next step

After installation, continue with [Quick Start](/audio-context/quick-start) to create your first signal chain.
