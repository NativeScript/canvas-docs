<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

const canvasRef = ref<HTMLCanvasElement | null>(null);

let animationFrame = 0;

const draw = (time: number) => {
  const canvas = canvasRef.value;

  if (!canvas) {
    return;
  }

  const context = canvas.getContext('2d');

  if (!context) {
    return;
  }

  const width = canvas.width;
  const height = canvas.height;
  const phase = time * 0.0012;

  context.clearRect(0, 0, width, height);

  const background = context.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, 'rgba(14, 23, 43, 1)');
  background.addColorStop(1, 'rgba(17, 40, 74, 1)');
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);

  context.save();
  context.globalCompositeOperation = 'screen';

  for (let index = 0; index < 4; index += 1) {
    const radius = 40 + index * 18 + Math.sin(phase + index) * 8;
    const x = width * (0.24 + index * 0.18);
    const y = height * (0.28 + Math.cos(phase * 0.7 + index) * 0.08);
    const glow = context.createRadialGradient(x, y, 0, x, y, radius);
    glow.addColorStop(0, `rgba(${index % 2 === 0 ? '247, 89, 48' : '59, 130, 246'}, 0.28)`);
    glow.addColorStop(1, 'rgba(15, 23, 42, 0)');
    context.fillStyle = glow;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }

  context.restore();

  context.lineWidth = 3;
  context.strokeStyle = 'rgba(248, 250, 252, 0.85)';
  context.beginPath();

  for (let step = 0; step <= 48; step += 1) {
    const x = (step / 48) * width;
    const y = height * 0.52 + Math.sin(step * 0.35 + phase) * 28 + Math.cos(step * 0.18 + phase * 1.6) * 18;

    if (step === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }

  context.stroke();

  context.strokeStyle = 'rgba(56, 189, 248, 0.75)';
  context.lineWidth = 2;
  context.beginPath();

  for (let step = 0; step <= 48; step += 1) {
    const x = (step / 48) * width;
    const y = height * 0.62 + Math.cos(step * 0.28 + phase * 1.1) * 16;

    if (step === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }

  context.stroke();

  const barWidth = width / 16;
  for (let index = 0; index < 14; index += 1) {
    const barHeight = 28 + (Math.sin(phase * 1.8 + index * 0.55) + 1) * 42;
    const x = 12 + index * barWidth;
    const y = height - barHeight - 14;
    const gradient = context.createLinearGradient(x, y, x, height);
    gradient.addColorStop(0, 'rgba(247, 89, 48, 0.95)');
    gradient.addColorStop(1, 'rgba(56, 189, 248, 0.55)');
    context.fillStyle = gradient;
    context.fillRect(x, y, barWidth - 8, barHeight);
  }

  animationFrame = window.requestAnimationFrame(draw);
};

const resizeCanvas = () => {
  const canvas = canvasRef.value;

  if (!canvas) {
    return;
  }

  const parent = canvas.parentElement;

  if (!parent) {
    return;
  }

  const scale = window.devicePixelRatio || 1;
  const width = parent.clientWidth;
  const height = parent.clientHeight;

  canvas.width = Math.max(1, Math.floor(width * scale));
  canvas.height = Math.max(1, Math.floor(height * scale));
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const context = canvas.getContext('2d');
  context?.setTransform(scale, 0, 0, scale, 0, 0);
};

onMounted(() => {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  animationFrame = window.requestAnimationFrame(draw);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCanvas);
  window.cancelAnimationFrame(animationFrame);
});
</script>

<template>
  <div class="canvas-hero-mini-demo">
    <canvas ref="canvasRef" aria-label="Animated canvas preview"></canvas>
  </div>
</template>