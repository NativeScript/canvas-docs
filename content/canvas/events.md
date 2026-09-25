---
title: Events and Input
description: Canvas lifecycle events, pointer and touch input, Android surface events and tvOS remote keys.
---

# Events and Input

## Lifecycle

| Event | Platforms | Fires when |
| --- | --- | --- |
| `ready` | All | The native surface exists and `getContext` can be called. |
| `surfaceCreated` | Android | The surface was created. Only in SurfaceView mode (`Canvas.useSurface = true`). |
| `surfaceResize` | Android | The surface changed size. The event carries `width` and `height`. |
| `surfaceDestroyed` | Android | The surface was destroyed, for example when the app goes to the background. |

```ts
canvas.on('ready', () => {
  const ctx = canvas.getContext('2d');
});

canvas.on('surfaceResize', (args) => {
  console.log(args.width, args.height);
});
```

## Pointer, touch and mouse

The canvas dispatches DOM-style events, and you listen for them with `addEventListener`:

- `pointerdown`, `pointermove`, `pointerup`, `pointercancel`, `pointerout`, `pointerleave`
- `touchstart`, `touchmove`, `touchend`, `touchcancel`
- `mousedown`, `mousemove`, `mouseup`, `mouseout`, `mousecancel`
- `wheel`

```ts
canvas.addEventListener('pointermove', (e) => {
  ctx.fillRect(e.clientX - 2, e.clientY - 2, 4, 4);
});

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault(); // stop the gesture from reaching parent views
});
```

To turn off input on a canvas, set `isUserInteractionEnabled="false"`.

## Keyboard and tvOS remote

On tvOS, presses from the Siri Remote and from game controllers arrive as `keydown` and `keyup` events, using standard DOM key names:

| Press | `key` |
| --- | --- |
| D-pad or swipe | `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight` |
| Select | `Enter` |
| Menu | `Escape` |
| Play/Pause | `MediaPlayPause` |

```ts
canvas.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') player.x -= 10;
  if (e.key === 'Enter') player.jump();
});
```

When the canvas is attached, it takes focus. Presses still continue up the responder chain afterwards, so the system behaviour stays intact: for example, Menu still returns to the home screen.
