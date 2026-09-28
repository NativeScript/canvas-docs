<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref } from 'vue';
import { startGamepadTester } from '../demos/gamepad-tester';

const props = withDefaults(
  defineProps<{
    title?: string;
  }>(),
  {
    title: 'Gamepad tester',
  }
);

const canvasEl = ref<HTMLCanvasElement | null>(null);
const isVisible = ref(false);
const status = ref('');
const error = ref('');

let stopTester: (() => void) | null = null;
let resizeObserver: ResizeObserver | null = null;

function updateStatus() {
  const pads = navigator.getGamepads().filter((pad) => pad !== null && pad.connected);
  status.value = pads.length
    ? `${pads.length} controller${pads.length > 1 ? 's' : ''} connected.`
    : 'No controller yet. Connect one and press a button: browsers only expose a pad after it is used on the page.';
}

function fitCanvas() {
  const canvas = canvasEl.value;
  if (!canvas) {
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(((width * 9) / 16) * dpr);
}

function stop() {
  stopTester?.();
  stopTester = null;
  resizeObserver?.disconnect();
  resizeObserver = null;
  window.removeEventListener('gamepadconnected', updateStatus);
  window.removeEventListener('gamepaddisconnected', updateStatus);
}

async function toggleDemo() {
  isVisible.value = !isVisible.value;

  if (!isVisible.value) {
    stop();
    return;
  }

  if (typeof navigator.getGamepads !== 'function') {
    error.value = 'This browser does not support the Gamepad API.';
    return;
  }

  error.value = '';
  await nextTick();

  const canvas = canvasEl.value;
  if (!canvas) {
    return;
  }

  fitCanvas();
  resizeObserver = new ResizeObserver(fitCanvas);
  resizeObserver.observe(canvas);

  window.addEventListener('gamepadconnected', updateStatus);
  window.addEventListener('gamepaddisconnected', updateStatus);
  updateStatus();

  stopTester = startGamepadTester(canvas);
}

onBeforeUnmount(stop);
</script>

<template>
  <div class="gamepad-demo">
    <div class="gamepad-demo__header">
      <strong>{{ props.title }}</strong>
      <button type="button" class="gamepad-demo__button" @click="toggleDemo">
        {{ isVisible ? 'Hide demo' : 'Show demo' }}
      </button>
    </div>

    <template v-if="isVisible">
      <p v-if="error" class="gamepad-demo__error">{{ error }}</p>
      <template v-else>
        <canvas ref="canvasEl" class="gamepad-demo__canvas" aria-label="Live gamepad tester" />
        <p class="gamepad-demo__caption">{{ status }}</p>
      </template>
    </template>

    <p v-else class="gamepad-demo__caption gamepad-demo__caption--hidden">
      Runs in this page with the browser's own Gamepad API. Connect a controller, then click Show demo.
    </p>
  </div>
</template>

<style scoped>
.gamepad-demo {
  margin: 0.9rem 0 1.1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  padding: 0.8rem;
  background: var(--vp-c-bg-soft);
}

.gamepad-demo__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.65rem;
  color: var(--vp-c-text-1);
}

.gamepad-demo__button {
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  border-radius: 8px;
  padding: 0.34rem 0.58rem;
  font-size: 0.82rem;
  cursor: pointer;
}

.gamepad-demo__button:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.gamepad-demo__canvas {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: #0f141c;
}

.gamepad-demo__caption {
  margin-top: 0.5rem;
  margin-bottom: 0;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
}

.gamepad-demo__caption--hidden {
  margin-top: 0;
}

.gamepad-demo__error {
  margin: 0;
  font-size: 0.82rem;
  color: #dc2626;
}
</style>
