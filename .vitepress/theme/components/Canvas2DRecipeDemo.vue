<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    recipe: number | string;
    title?: string;
    width?: number;
    height?: number;
  }>(),
  {
    width: 360,
    height: 220,
  }
);

const recipeNumber = computed(() => Number(props.recipe));
const canvasEl = ref<HTMLCanvasElement | null>(null);
const isVisible = ref(false);
const details = ref('');
const error = ref('');

let rafId: number | null = null;

const recipeLabels: Record<number, string> = {
  1: 'Filled + stroked rectangles',
  2: 'Rounded rectangle path',
  3: 'Circle and arc drawing',
  4: 'Line caps and joins',
  5: 'Cubic and quadratic curves',
  6: 'Linear gradient fill',
  7: 'Radial gradient glow',
  8: 'Text rendering and metrics',
  9: 'Dashed strokes',
  10: 'Save/restore + transforms',
  11: 'Path2D reuse',
  12: 'Clipping region',
  13: 'Draw image equivalent',
  14: 'Pixel processing (ImageData)',
  15: 'Compositing modes',
  16: 'Shadows and blur effects',
  17: 'Stateful animation',
  18: 'Export PNG',
};

const heading = computed(() => {
  if (props.title) {
    return props.title;
  }

  return recipeLabels[recipeNumber.value] || `2D Recipe ${recipeNumber.value}`;
});

function stopAnimation() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.arcTo(x + width, y, x + width, y + r, r);
  ctx.lineTo(x + width, y + height - r);
  ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
  ctx.lineTo(x + r, y + height);
  ctx.arcTo(x, y + height, x, y + height - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function drawStarPath(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.moveTo(100, 20);
  ctx.lineTo(120, 80);
  ctx.lineTo(185, 80);
  ctx.lineTo(132, 118);
  ctx.lineTo(152, 180);
  ctx.lineTo(100, 140);
  ctx.lineTo(48, 180);
  ctx.lineTo(68, 118);
  ctx.lineTo(15, 80);
  ctx.lineTo(80, 80);
  ctx.closePath();
}

function setupContext() {
  const canvas = canvasEl.value;
  if (!canvas) {
    return null;
  }

  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const width = props.width;
  const height = props.height;

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = '100%';
  canvas.style.maxWidth = `${width}px`;
  canvas.style.height = 'auto';

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return null;
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, width, height);

  return { canvas, ctx, width, height };
}

function drawRecipe() {
  error.value = '';
  stopAnimation();

  const setup = setupContext();
  if (!setup) {
    error.value = 'Unable to create 2D canvas context in this environment.';
    details.value = '';
    return;
  }

  const { canvas, ctx, width, height } = setup;

  try {
    switch (recipeNumber.value) {
      case 1:
        ctx.fillStyle = '#0ea5e9';
        ctx.fillRect(20, 20, 140, 80);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 3;
        ctx.strokeRect(20, 20, 140, 80);
        details.value = 'Filled rectangle with a dark stroke outline.';
        break;
      case 2:
        drawRoundedRectPath(ctx, 24, 24, 180, 100, 16);
        ctx.fillStyle = '#fde047';
        ctx.fill();
        details.value = 'Rounded rectangle path rendered with fill.';
        break;
      case 3:
        ctx.beginPath();
        ctx.arc(120, 110, 48, 0, Math.PI * 2);
        ctx.fillStyle = '#22c55e';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(120, 110, 66, 0, Math.PI);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 4;
        ctx.stroke();
        details.value = 'Circle fill plus arc stroke.';
        break;
      case 4:
        ctx.beginPath();
        ctx.moveTo(24, 26);
        ctx.lineTo(94, 96);
        ctx.lineTo(164, 26);
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#8b5cf6';
        ctx.stroke();
        details.value = 'Rounded line caps and joins.';
        break;
      case 5:
        ctx.beginPath();
        ctx.moveTo(30, 120);
        ctx.quadraticCurveTo(120, 18, 220, 120);
        ctx.strokeStyle = '#0f766e';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(30, 170);
        ctx.bezierCurveTo(80, 60, 180, 250, 240, 170);
        ctx.strokeStyle = '#b91c1c';
        ctx.lineWidth = 4;
        ctx.stroke();
        details.value = 'Quadratic and cubic bezier curves.';
        break;
      case 6: {
        const gradient = ctx.createLinearGradient(0, 0, 220, 0);
        gradient.addColorStop(0, '#0ea5e9');
        gradient.addColorStop(0.5, '#6366f1');
        gradient.addColorStop(1, '#ec4899');
        ctx.fillStyle = gradient;
        ctx.fillRect(20, 20, 220, 80);
        details.value = 'Linear gradient fill across three color stops.';
        break;
      }
      case 7: {
        const glow = ctx.createRadialGradient(140, 110, 10, 140, 110, 90);
        glow.addColorStop(0, 'rgba(255,255,255,0.95)');
        glow.addColorStop(1, 'rgba(59,130,246,0.07)');
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(20, 20, 240, 180);
        ctx.fillStyle = glow;
        ctx.fillRect(20, 20, 240, 180);
        details.value = 'Radial gradient glow on a dark background.';
        break;
      }
      case 8: {
        const baselineY = 80;
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(20, baselineY);
        ctx.lineTo(width - 20, baselineY);
        ctx.stroke();

        ctx.font = '600 22px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#0f172a';
        ctx.fillText('NativeScript Canvas', 20, baselineY);

        const m = ctx.measureText('NativeScript Canvas');
        details.value = `Measured text width: ${Math.round(m.width)}px.`;
        break;
      }
      case 9:
        ctx.setLineDash([10, 6]);
        ctx.lineDashOffset = 0;
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(20, 90);
        ctx.lineTo(width - 24, 90);
        ctx.stroke();
        ctx.setLineDash([]);
        details.value = 'Dashed stroke rendered using setLineDash.';
        break;
      case 10:
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.rotate(Math.PI / 6);
        ctx.scale(1.2, 0.8);
        ctx.fillStyle = '#e11d48';
        ctx.fillRect(-60, -40, 120, 80);
        ctx.restore();
        details.value = 'Transform stack with save and restore.';
        break;
      case 11:
        if (typeof Path2D !== 'undefined') {
          const star = new Path2D();
          star.moveTo(100, 20);
          star.lineTo(120, 80);
          star.lineTo(185, 80);
          star.lineTo(132, 118);
          star.lineTo(152, 180);
          star.lineTo(100, 140);
          star.lineTo(48, 180);
          star.lineTo(68, 118);
          star.lineTo(15, 80);
          star.lineTo(80, 80);
          star.closePath();
          ctx.fillStyle = '#f59e0b';
          ctx.fill(star);
        } else {
          drawStarPath(ctx);
          ctx.fillStyle = '#f59e0b';
          ctx.fill();
        }
        details.value = 'Star shape rendered from reusable path geometry.';
        break;
      case 12:
        ctx.save();
        ctx.beginPath();
        ctx.arc(140, 110, 80, 0, Math.PI * 2);
        ctx.clip();

        for (let i = 0; i < 10; i += 1) {
          ctx.fillStyle = i % 2 ? '#2563eb' : '#93c5fd';
          ctx.fillRect(i * 30, 0, 20, height);
        }

        ctx.restore();
        details.value = 'Circular clip mask applied to vertical bars.';
        break;
      case 13: {
        const source = document.createElement('canvas');
        source.width = 96;
        source.height = 96;
        const sourceCtx = source.getContext('2d');

        if (!sourceCtx) {
          throw new Error('Unable to create source canvas for drawImage sample.');
        }

        const g = sourceCtx.createLinearGradient(0, 0, 96, 96);
        g.addColorStop(0, '#38bdf8');
        g.addColorStop(1, '#22c55e');
        sourceCtx.fillStyle = g;
        sourceCtx.fillRect(0, 0, 96, 96);
        sourceCtx.fillStyle = '#0f172a';
        sourceCtx.beginPath();
        sourceCtx.arc(48, 48, 18, 0, Math.PI * 2);
        sourceCtx.fill();

        ctx.drawImage(source, 20, 20, 96, 96);
        details.value = 'drawImage with generated bitmap source (browser equivalent).';
        break;
      }
      case 14: {
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#0ea5e9');
        gradient.addColorStop(1, '#f97316');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          data[i] = 255 - data[i];
          data[i + 1] = 255 - data[i + 1];
          data[i + 2] = 255 - data[i + 2];
        }

        ctx.putImageData(imageData, 0, 0);
        details.value = 'ImageData inversion pass applied to all pixels.';
        break;
      }
      case 15:
        ctx.fillStyle = '#0ea5e9';
        ctx.fillRect(20, 20, 120, 120);

        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(80, 80, 120, 120);

        ctx.globalCompositeOperation = 'source-over';
        details.value = 'Multiply compositing mode on overlapping rectangles.';
        break;
      case 16:
        ctx.shadowColor = 'rgba(15,23,42,0.25)';
        ctx.shadowBlur = 18;
        ctx.shadowOffsetX = 6;
        ctx.shadowOffsetY = 8;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(32, 28, 200, 100);
        ctx.shadowColor = 'transparent';
        details.value = 'Drop shadow and blur on a foreground card.';
        break;
      case 17: {
        let t = 0;
        const frame = () => {
          ctx.clearRect(0, 0, width, height);
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(0, 0, width, height);

          const x = width / 2 + Math.cos(t) * width * 0.28;
          const y = height / 2 + Math.sin(t * 1.4) * height * 0.2;

          ctx.beginPath();
          ctx.arc(x, y, 14, 0, Math.PI * 2);
          ctx.fillStyle = '#10b981';
          ctx.fill();

          t += 0.03;
          rafId = requestAnimationFrame(frame);
        };

        frame();
        details.value = 'Animation is running. Hide demo to stop the render loop.';
        break;
      }
      case 18: {
        ctx.fillStyle = '#0ea5e9';
        ctx.fillRect(20, 20, 140, 80);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 3;
        ctx.strokeRect(20, 20, 140, 80);

        const dataUrl = canvas.toDataURL('image/png');
        const kb = Math.max(1, Math.round(dataUrl.length / 1024));
        details.value = `PNG export data URL generated (${kb} KB).`;
        break;
      }
      default:
        details.value = 'No live demo available for this recipe id.';
        break;
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to render this demo.';
    details.value = '';
  }
}

async function toggleDemo() {
  isVisible.value = !isVisible.value;

  if (isVisible.value) {
    await nextTick();
    drawRecipe();
  } else {
    stopAnimation();
    error.value = '';
  }
}

function redraw() {
  if (!isVisible.value) {
    return;
  }

  drawRecipe();
}

onBeforeUnmount(() => {
  stopAnimation();
});
</script>

<template>
  <div class="canvas-demo">
    <div class="canvas-demo__header">
      <strong>{{ heading }}</strong>
      <div class="canvas-demo__actions">
        <button type="button" class="canvas-demo__button" @click="toggleDemo">
          {{ isVisible ? 'Hide demo' : 'Show demo' }}
        </button>
        <button v-if="isVisible" type="button" class="canvas-demo__button" @click="redraw">
          Redraw
        </button>
      </div>
    </div>

    <template v-if="isVisible">
      <canvas ref="canvasEl" class="canvas-demo__canvas" :aria-label="`Live canvas demo: ${heading}`" />
      <p v-if="error" class="canvas-demo__error">{{ error }}</p>
      <p v-else class="canvas-demo__caption">{{ details }}</p>
    </template>

    <p v-else class="canvas-demo__caption canvas-demo__caption--hidden">
      Demo is hidden by default. Click Show demo to render this recipe.
    </p>
  </div>
</template>

<style scoped>
.canvas-demo {
  margin: 0.9rem 0 1.1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  padding: 0.8rem;
  background: var(--vp-c-bg-soft);
}

.canvas-demo__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.65rem;
  color: var(--vp-c-text-1);
}

.canvas-demo__actions {
  display: flex;
  gap: 0.45rem;
}

.canvas-demo__button {
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  border-radius: 8px;
  padding: 0.34rem 0.58rem;
  font-size: 0.82rem;
  cursor: pointer;
}

.canvas-demo__button:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.canvas-demo__canvas {
  display: block;
  width: 100%;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: #f8fafc;
}

.canvas-demo__caption {
  margin-top: 0.5rem;
  margin-bottom: 0;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
}

.canvas-demo__caption--hidden {
  margin-top: 0;
}

.canvas-demo__error {
  margin-top: 0.5rem;
  margin-bottom: 0;
  font-size: 0.82rem;
  color: #dc2626;
}
</style>
