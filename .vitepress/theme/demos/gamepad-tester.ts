// Uses only web APIs, so it runs unchanged in a browser and in NativeScript
// with @nativescript/canvas-polyfill and @nativescript/canvas-gamepad installed.

const WIDTH = 480;
const HEIGHT = 270;

const BACKGROUND = '#0f141c';
const IDLE = '#273142';
const OUTLINE = '#4b5563';
const TEXT = '#e5e7eb';
const MUTED = '#94a3b8';
const ACTIVE = '#f75930';

export function startGamepadTester(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d')!;
  let frame = 0;

  const onConnected = (e: GamepadEvent) => console.log(`gamepad ${e.gamepad.index} connected: ${e.gamepad.id}`);
  const onDisconnected = (e: GamepadEvent) => console.log(`gamepad ${e.gamepad.index} disconnected`);
  window.addEventListener('gamepadconnected', onConnected);
  window.addEventListener('gamepaddisconnected', onDisconnected);

  const draw = () => {
    // Fit a 480x270 layout into whatever size the canvas has.
    const scale = Math.min(canvas.width / WIDTH, canvas.height / HEIGHT);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = BACKGROUND;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(scale, 0, 0, scale, (canvas.width - WIDTH * scale) / 2, (canvas.height - HEIGHT * scale) / 2);

    // Poll every frame: this is how the Gamepad API is meant to be read.
    const pads = navigator.getGamepads().filter((pad): pad is Gamepad => pad !== null && pad.connected);
    if (pads.length > 0) {
      drawPad(ctx, pads[0], pads.length - 1);
    } else {
      drawWaiting(ctx);
    }

    frame = requestAnimationFrame(draw);
  };
  frame = requestAnimationFrame(draw);

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('gamepadconnected', onConnected);
    window.removeEventListener('gamepaddisconnected', onDisconnected);
  };
}

function drawWaiting(ctx: CanvasRenderingContext2D) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = TEXT;
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('Connect a controller and press any button', WIDTH / 2, HEIGHT / 2 - 10);
  ctx.fillStyle = MUTED;
  ctx.font = '12px sans-serif';
  ctx.fillText('navigator.getGamepads() has no connected pads yet', WIDTH / 2, HEIGHT / 2 + 16);
}

function drawPad(ctx: CanvasRenderingContext2D, pad: Gamepad, others: number) {
  const b = pad.buttons;

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = TEXT;
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText(pad.id.length > 60 ? pad.id.slice(0, 59) + '…' : pad.id, 16, 18);

  // Standard mapping: https://w3c.github.io/gamepad/#remapping
  trigger(ctx, b[6], 40, 40, 'LT');
  trigger(ctx, b[7], 320, 40, 'RT');
  shoulder(ctx, b[4], 40, 62, 'LB');
  shoulder(ctx, b[5], 320, 62, 'RB');

  stick(ctx, pad.axes[0], pad.axes[1], b[10], 110, 140, 'L');
  stick(ctx, pad.axes[2], pad.axes[3], b[11], 300, 188, 'R');

  dpad(ctx, b[12], b[13], b[14], b[15], 180, 192);

  button(ctx, b[3], 370, 110, 'Y');
  button(ctx, b[2], 345, 135, 'X');
  button(ctx, b[1], 395, 135, 'B');
  button(ctx, b[0], 370, 160, 'A');

  pill(ctx, b[8], 205, 110, 'Select');
  pill(ctx, b[9], 275, 110, 'Start');
  if (b.length > 16) {
    button(ctx, b[16], 240, 145, 'Home');
  }

  ctx.textAlign = 'left';
  ctx.fillStyle = MUTED;
  ctx.font = '11px sans-serif';
  const summary = `index ${pad.index} · mapping "${pad.mapping}" · ${pad.axes.length} axes · ${b.length} buttons`;
  ctx.fillText(others > 0 ? `${summary} · ${others} more connected` : summary, 16, HEIGHT - 14);
}

function trigger(ctx: CanvasRenderingContext2D, input: GamepadButton | undefined, x: number, y: number, label: string) {
  const value = input?.value ?? 0;
  ctx.fillStyle = IDLE;
  ctx.fillRect(x, y - 7, 100, 14);
  ctx.fillStyle = ACTIVE;
  ctx.fillRect(x, y - 7, 100 * value, 14);
  ctx.textAlign = 'left';
  ctx.fillStyle = TEXT;
  ctx.font = '11px sans-serif';
  ctx.fillText(`${label} ${value.toFixed(2)}`, x + 106, y);
}

function shoulder(ctx: CanvasRenderingContext2D, input: GamepadButton | undefined, x: number, y: number, label: string) {
  ctx.fillStyle = input?.pressed ? ACTIVE : IDLE;
  ctx.fillRect(x, y - 8, 100, 16);
  ctx.textAlign = 'center';
  ctx.fillStyle = TEXT;
  ctx.font = '11px sans-serif';
  ctx.fillText(label, x + 50, y);
}

function stick(ctx: CanvasRenderingContext2D, ax = 0, ay = 0, press: GamepadButton | undefined, x: number, y: number, label: string) {
  const radius = 34;
  ctx.fillStyle = IDLE;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = press?.pressed ? ACTIVE : OUTLINE;
  ctx.stroke();

  // Axes run from -1 to 1, with +y pointing down.
  ctx.fillStyle = ACTIVE;
  ctx.beginPath();
  ctx.arc(x + ax * (radius - 8), y + ay * (radius - 8), 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.fillStyle = MUTED;
  ctx.font = '10px sans-serif';
  ctx.fillText(`${label}  ${ax.toFixed(2)}, ${ay.toFixed(2)}`, x, y + radius + 12);
}

function dpad(
  ctx: CanvasRenderingContext2D,
  up: GamepadButton | undefined,
  down: GamepadButton | undefined,
  left: GamepadButton | undefined,
  right: GamepadButton | undefined,
  x: number,
  y: number,
) {
  const size = 18;
  const cells: [GamepadButton | undefined, number, number][] = [
    [up, 0, -1],
    [down, 0, 1],
    [left, -1, 0],
    [right, 1, 0],
  ];
  for (const [input, dx, dy] of cells) {
    ctx.fillStyle = input?.pressed ? ACTIVE : IDLE;
    ctx.fillRect(x + dx * size - size / 2, y + dy * size - size / 2, size, size);
  }
  ctx.fillStyle = IDLE;
  ctx.fillRect(x - size / 2, y - size / 2, size, size);
}

function button(ctx: CanvasRenderingContext2D, input: GamepadButton | undefined, x: number, y: number, label: string) {
  ctx.fillStyle = input?.pressed ? ACTIVE : IDLE;
  ctx.beginPath();
  ctx.arc(x, y, label.length > 1 ? 16 : 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.textAlign = 'center';
  ctx.fillStyle = TEXT;
  ctx.font = label.length > 1 ? '10px sans-serif' : 'bold 12px sans-serif';
  ctx.fillText(label, x, y);
}

function pill(ctx: CanvasRenderingContext2D, input: GamepadButton | undefined, x: number, y: number, label: string) {
  ctx.fillStyle = input?.pressed ? ACTIVE : IDLE;
  ctx.fillRect(x - 24, y - 8, 48, 16);
  ctx.textAlign = 'center';
  ctx.fillStyle = TEXT;
  ctx.font = '10px sans-serif';
  ctx.fillText(label, x, y);
}
