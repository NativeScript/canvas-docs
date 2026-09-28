---
title: '@nativescript/canvas-gamepad'
description: The web Gamepad API (navigator.getGamepads, gamepadconnected and gamepaddisconnected) for game controllers on iOS, Android and Windows.
---

# @nativescript/canvas-gamepad

Game controller input through the web [Gamepad API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API): `navigator.getGamepads()`, plus the `gamepadconnected` and `gamepaddisconnected` events. Code written for the browser runs without changes.

```bash
npm install @nativescript/canvas-gamepad @nativescript/canvas-polyfill
```

Import the polyfill once, before anything that reads input:

```ts
// app.ts
import '@nativescript/canvas-polyfill';
```

When `@nativescript/canvas-gamepad` is installed, the [polyfill](/plugins/canvas-polyfill) backs `navigator.getGamepads()` and the window gamepad events with it. Without the package, `navigator.getGamepads()` returns an empty array.

## Live demo

The demo below runs in this page using your browser's Gamepad API. The same file runs unchanged in a NativeScript app.

<GamepadLiveDemo />

To run it on a device, put the file next to your page and start it when the canvas is ready:

```xml
<canvas:Canvas width="100%" height="100%" ready="canvasReady" unloaded="canvasUnloaded" />
```

```ts
import '@nativescript/canvas-polyfill';
import { startGamepadTester } from './gamepad-tester';

let stop: () => void;

export function canvasReady(args) {
  stop = startGamepadTester(args.object);
}

export function canvasUnloaded() {
  stop?.();
}
```

::: details gamepad-tester.ts
<<< ../../.vitepress/theme/demos/gamepad-tester.ts
:::

## Reading input

The Gamepad API is polled, not event driven. Read `navigator.getGamepads()` once per frame, usually from `requestAnimationFrame`:

```ts
function frame() {
  const pad = navigator.getGamepads()[0];
  if (pad) {
    player.x += pad.axes[0] * speed;
    player.y += pad.axes[1] * speed;
    if (pad.buttons[0].pressed) player.jump();
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
```

The array always has four slots. An empty slot is `null`, and a controller keeps its `index` for as long as it stays connected.

### Standard mapping

Every controller is reported with `mapping === 'standard'`, so button and axis indices mean the same thing on every platform and in every browser:

| Index | Button | | Index | Button |
| --- | --- | --- | --- | --- |
| 0 | A (bottom face) | | 9 | Start / Menu |
| 1 | B (right face) | | 10 | Left stick press |
| 2 | X (left face) | | 11 | Right stick press |
| 3 | Y (top face) | | 12 | D-pad up |
| 4 | Left bumper | | 13 | D-pad down |
| 5 | Right bumper | | 14 | D-pad left |
| 6 | Left trigger | | 15 | D-pad right |
| 7 | Right trigger | | 16 | Home / Guide (not on Windows) |
| 8 | Select / Back / Options | | | |

| Axis | Value |
| --- | --- |
| 0, 1 | Left stick x and y |
| 2, 3 | Right stick x and y |

Axes range from `-1` to `1`, with positive y pointing **down**. Triggers are buttons with an analog `value` from `0` to `1`. Each button has `pressed`, `touched` and `value`.

### Dead zones

Axis values are passed through raw, as in browsers. A stick at rest rarely reports exactly `0`, so apply your own dead zone:

```ts
function deadZone(value: number, threshold = 0.15) {
  return Math.abs(value) < threshold ? 0 : value;
}

const x = deadZone(pad.axes[0]);
const y = deadZone(pad.axes[1]);
```

### A press, not a hold

`buttons[i].pressed` is true for as long as the button is held. To act once per press, compare against the previous frame. `Gamepad` objects are updated in place (like Firefox, and unlike Chrome's snapshots), so keep plain booleans instead of the old objects:

```ts
const previous: boolean[][] = [];

function justPressed(pad: Gamepad, button: number) {
  const last = (previous[pad.index] ??= []);
  const now = pad.buttons[button].pressed;
  const result = now && !last[button];
  last[button] = now;
  return result;
}

if (justPressed(pad, 9)) togglePause();
```

This pattern works in every browser and on every platform.

## Connection events

```ts
window.addEventListener('gamepadconnected', (e) => {
  console.log(`controller ${e.gamepad.index} connected: ${e.gamepad.id}`);
});

window.addEventListener('gamepaddisconnected', (e) => {
  console.log(`controller ${e.gamepad.index} disconnected`);
});
```

Use the events as notifications, for example to show a "controller connected" message or to pause when a controller drops. Use `navigator.getGamepads()` as the source of truth. Monitoring starts with the first gamepad listener or `getGamepads()` call, and at that point every controller that is already connected is reported. As in browsers, each connection is announced once: a listener added later is not told about controllers that are already connected.

## Without the polyfill

If you don't want `window`, `document` and the other browser globals, import the package directly. It has the same `Gamepad` objects, just not hung off `navigator`:

| With the polyfill | Without |
| --- | --- |
| `navigator.getGamepads()` | `getGamepads()` |
| `window.addEventListener('gamepadconnected', fn)` | `gamepads.addListener(fn)`, then check `e.type` |
| `window.removeEventListener(...)` | `gamepads.removeListener(fn)` |

Native monitoring starts on the first `getGamepads()` call or `addListener()`, not on import.

### Example: move a dot with the left stick

This uses only `@nativescript/core` and `@nativescript/canvas`. The left stick moves the dot, A changes its colour, and the connection listener updates a label:

```xml
<Page xmlns="http://schemas.nativescript.org/tns.xsd" xmlns:canvas="@nativescript/canvas" unloaded="onUnloaded">
  <GridLayout rows="auto, *">
    <Label id="status" text="Connect a controller" class="p-4" />
    <canvas:Canvas row="1" width="100%" height="100%" ready="canvasReady" />
  </GridLayout>
</Page>
```

```ts
import type { EventData, Label } from '@nativescript/core';
import type { Canvas } from '@nativescript/canvas';
import { gamepads, getGamepads, type GamepadEvent } from '@nativescript/canvas-gamepad';

const COLORS = ['#f75930', '#22c55e', '#3b82f6', '#eab308'];

let frame = 0;
let status: Label;

function deadZone(value: number, threshold = 0.15) {
  return Math.abs(value) < threshold ? 0 : value;
}

function onConnection(e: GamepadEvent) {
  const connected = getGamepads().filter((pad) => pad !== null).length;
  status.text = e.type === 'gamepadconnected'
    ? `${e.gamepad.id} connected`
    : connected > 0 ? `${connected} controller(s) connected` : 'Connect a controller';
}

export function canvasReady(args: EventData) {
  const canvas = args.object as Canvas;
  status = canvas.page.getViewById<Label>('status');
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  const dot = { x: canvas.width / 2, y: canvas.height / 2, color: 0 };
  let wasPressed = false;

  gamepads.addListener(onConnection);

  const draw = () => {
    const pad = getGamepads().find((p) => p !== null);

    if (pad) {
      const speed = canvas.width / 100;
      dot.x = Math.min(canvas.width, Math.max(0, dot.x + deadZone(pad.axes[0]) * speed));
      dot.y = Math.min(canvas.height, Math.max(0, dot.y + deadZone(pad.axes[1]) * speed));

      // Act on the press, not on every frame the button is held.
      const pressed = pad.buttons[0].pressed;
      if (pressed && !wasPressed) {
        dot.color = (dot.color + 1) % COLORS.length;
      }
      wasPressed = pressed;
    }

    ctx.fillStyle = '#0f141c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = COLORS[dot.color];
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, canvas.width / 20, 0, Math.PI * 2);
    ctx.fill();

    frame = requestAnimationFrame(draw);
  };
  frame = requestAnimationFrame(draw);
}

export function onUnloaded() {
  cancelAnimationFrame(frame);
  gamepads.removeListener(onConnection);
}
```

`requestAnimationFrame` here is the global from `@nativescript/core`, so the loop needs nothing from the polyfill.

## Platform notes

| Platform | Source | Notes |
| --- | --- | --- |
| iOS, tvOS, visionOS | GameController (`GCExtendedGamepad`) | The package sets `valueChangedHandler` on each controller, replacing any handler your own code set. |
| Android | Gamepad and joystick `KeyEvent` / `MotionEvent` | Input from connected controllers is consumed at the activity window, so B no longer triggers Back while the API is in use. |
| Windows | `Windows.Gaming.Input.Gamepad` | 16 buttons: there is no Guide button. |

On tvOS the Siri Remote is not a gamepad. It keeps sending `keydown` and `keyup` events, as described in [Events and Input](/canvas/events#keyboard-and-tvos-remote).

## Differences from browsers

- **No button press required.** Browsers hide controllers until one is used on the page. Here a connected controller is reported immediately.
- **Live objects.** Each slot holds the same `Gamepad` object between calls, updated in place. Copy `axes` or `buttons` if you need to compare frames.
- **`timestamp`** is the `performance.now()` value at the first `getGamepads()` call after the controller's state changed.
- **No rumble.** `vibrationActuator` is `null` and `hapticActuators` is empty.
- **Up to four controllers**, all using the standard mapping.
- **`id` format** differs by platform, for example `Xbox Wireless Controller (STANDARD GAMEPAD)` on iOS. Show it to users, but don't parse it.
