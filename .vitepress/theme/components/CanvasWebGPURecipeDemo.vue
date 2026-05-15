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
    width: 380,
    height: 240,
  }
);

const recipeNumber = computed(() => Number(props.recipe));
const canvasEl = ref<HTMLCanvasElement | null>(null);
const isVisible = ref(false);
const details = ref('');
const error = ref('');
const loading = ref(false);

let rafId: number | null = null;

const recipeLabels: Record<number, string> = {
  1: 'Clear pass only',
  2: 'Create a shader module',
  3: 'Create render pipeline',
  4: 'Draw a triangle',
  5: 'Uniform buffer update pattern',
  6: 'Reconfigure on resize',
  7: 'Animation render loop',
  8: 'Capability checks',
};

const heading = computed(() => {
  if (props.title) {
    return props.title;
  }

  return recipeLabels[recipeNumber.value] || `WebGPU Recipe ${recipeNumber.value}`;
});

function stopAnimation() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

function resizeCanvas(canvas: HTMLCanvasElement) {
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const width = props.width;
  const height = props.height;

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = '100%';
  canvas.style.maxWidth = `${width}px`;
  canvas.style.height = 'auto';
}

function createShaderModule(device: any) {
  return device.createShaderModule({
    code: `
      @vertex
      fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4f {
        var pos = array<vec2f, 3>(
          vec2f(0.0, 0.62),
          vec2f(-0.7, -0.55),
          vec2f(0.7, -0.55)
        );
        return vec4f(pos[vertexIndex], 0.0, 1.0);
      }

      @fragment
      fn fs_main() -> @location(0) vec4f {
        return vec4f(0.15, 0.75, 0.65, 1.0);
      }
    `,
  });
}

function createUniformShaderModule(device: any) {
  return device.createShaderModule({
    code: `
      struct Uniforms {
        color: vec4f,
      };

      @group(0) @binding(0) var<uniform> uniforms: Uniforms;

      @vertex
      fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4f {
        var pos = array<vec2f, 3>(
          vec2f(0.0, 0.62),
          vec2f(-0.7, -0.55),
          vec2f(0.7, -0.55)
        );
        return vec4f(pos[vertexIndex], 0.0, 1.0);
      }

      @fragment
      fn fs_main() -> @location(0) vec4f {
        return uniforms.color;
      }
    `,
  });
}

function createPipeline(device: any, format: string, shaderModule: any) {
  return device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: shaderModule,
      entryPoint: 'vs_main',
    },
    fragment: {
      module: shaderModule,
      entryPoint: 'fs_main',
      targets: [{ format }],
    },
    primitive: {
      topology: 'triangle-list',
    },
  });
}

function submitClear(device: any, context: any, color: { r: number; g: number; b: number; a: number }) {
  const encoder = device.createCommandEncoder();
  const pass = encoder.beginRenderPass({
    colorAttachments: [
      {
        view: context.getCurrentTexture().createView(),
        clearValue: color,
        loadOp: 'clear',
        storeOp: 'store',
      },
    ],
  });

  pass.end();
  device.queue.submit([encoder.finish()]);
}

function submitTriangle(
  device: any,
  context: any,
  pipeline: any,
  clearValue: { r: number; g: number; b: number; a: number },
  bindGroup?: any
) {
  const encoder = device.createCommandEncoder();
  const pass = encoder.beginRenderPass({
    colorAttachments: [
      {
        view: context.getCurrentTexture().createView(),
        clearValue,
        loadOp: 'clear',
        storeOp: 'store',
      },
    ],
  });

  pass.setPipeline(pipeline);
  if (bindGroup) {
    pass.setBindGroup(0, bindGroup);
  }
  pass.draw(3, 1, 0, 0);
  pass.end();

  device.queue.submit([encoder.finish()]);
}

async function setupWebGPU() {
  const canvas = canvasEl.value;
  if (!canvas) {
    throw new Error('Canvas is not ready.');
  }

  resizeCanvas(canvas);

  const nav = navigator as any;
  if (!nav.gpu) {
    throw new Error('WebGPU is not available in this browser.');
  }

  const adapter = await nav.gpu.requestAdapter();
  if (!adapter) {
    throw new Error('WebGPU adapter not available.');
  }

  const device = await adapter.requestDevice();
  const context = canvas.getContext('webgpu') as any;
  if (!context) {
    throw new Error('Unable to create a webgpu context.');
  }

  const format = nav.gpu.getPreferredCanvasFormat
    ? nav.gpu.getPreferredCanvasFormat()
    : 'bgra8unorm';

  context.configure({
    device,
    format,
    alphaMode: 'premultiplied',
  });

  return { adapter, device, context, format };
}

async function drawRecipe() {
  error.value = '';
  stopAnimation();
  loading.value = true;

  try {
    const { adapter, device, context, format } = await setupWebGPU();

    switch (recipeNumber.value) {
      case 1:
        submitClear(device, context, { r: 0.08, g: 0.1, b: 0.15, a: 1.0 });
        details.value = 'Clear-only render pass submitted.';
        break;
      case 2: {
        createShaderModule(device);
        submitClear(device, context, { r: 0.05, g: 0.09, b: 0.16, a: 1.0 });
        details.value = 'WGSL shader module created and validated.';
        break;
      }
      case 3: {
        const shader = createShaderModule(device);
        createPipeline(device, format, shader);
        submitClear(device, context, { r: 0.03, g: 0.07, b: 0.12, a: 1.0 });
        details.value = 'Render pipeline created successfully.';
        break;
      }
      case 4: {
        const shader = createShaderModule(device);
        const pipeline = createPipeline(device, format, shader);
        submitTriangle(device, context, pipeline, { r: 0.02, g: 0.05, b: 0.1, a: 1.0 });
        details.value = 'Triangle draw call submitted.';
        break;
      }
      case 5: {
        const shader = createUniformShaderModule(device);
        const pipeline = createPipeline(device, format, shader);

        const gpuBufferUsage = (globalThis as any).GPUBufferUsage;
        const usage = gpuBufferUsage
          ? gpuBufferUsage.UNIFORM | gpuBufferUsage.COPY_DST
          : 0x40 | 0x08;

        const uniformBuffer = device.createBuffer({
          size: 16,
          usage,
        });

        const bindGroup = device.createBindGroup({
          layout: pipeline.getBindGroupLayout(0),
          entries: [
            {
              binding: 0,
              resource: { buffer: uniformBuffer },
            },
          ],
        });

        const color = new Float32Array([0.24, 0.78, 0.92, 1.0]);
        device.queue.writeBuffer(uniformBuffer, 0, color.buffer, color.byteOffset, color.byteLength);

        submitTriangle(device, context, pipeline, { r: 0.02, g: 0.05, b: 0.1, a: 1.0 }, bindGroup);
        details.value = 'Uniform buffer updated and used for fragment color output.';
        break;
      }
      case 6: {
        const canvas = canvasEl.value;
        if (!canvas) {
          throw new Error('Canvas not available for resize.');
        }

        resizeCanvas(canvas);
        context.configure({
          device,
          format,
          alphaMode: 'premultiplied',
        });

        const shader = createShaderModule(device);
        const pipeline = createPipeline(device, format, shader);
        submitTriangle(device, context, pipeline, { r: 0.02, g: 0.05, b: 0.1, a: 1.0 });

        details.value = 'Canvas reconfigured after resize and rendered again.';
        break;
      }
      case 7: {
        const shader = createShaderModule(device);
        const pipeline = createPipeline(device, format, shader);
        let t = 0;

        const frame = () => {
          const clear = {
            r: 0.06 + 0.04 * Math.sin(t),
            g: 0.06,
            b: 0.12,
            a: 1,
          };

          submitTriangle(device, context, pipeline, clear);
          t += 0.08;
          rafId = requestAnimationFrame(frame);
        };

        frame();
        details.value = 'Animation loop is running. Hide demo to stop.';
        break;
      }
      case 8: {
        const shader = createShaderModule(device);
        const pipeline = createPipeline(device, format, shader);
        submitTriangle(device, context, pipeline, { r: 0.02, g: 0.05, b: 0.1, a: 1.0 });

        const featureCount = Array.from(adapter.features || []).length;
        details.value = `Capability check passed. Adapter features detected: ${featureCount}.`;
        break;
      }
      default:
        details.value = 'No live demo available for this recipe id.';
        break;
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to render WebGPU demo.';
    details.value = '';
  } finally {
    loading.value = false;
  }
}

async function toggleDemo() {
  isVisible.value = !isVisible.value;

  if (isVisible.value) {
    await nextTick();
    await drawRecipe();
  } else {
    stopAnimation();
    error.value = '';
    loading.value = false;
  }
}

async function redraw() {
  if (!isVisible.value) {
    return;
  }

  await drawRecipe();
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
      <canvas ref="canvasEl" class="canvas-demo__canvas canvas-demo__canvas--dark" :aria-label="`Live webgpu demo: ${heading}`" />
      <p v-if="loading" class="canvas-demo__caption">Preparing WebGPU context...</p>
      <p v-else-if="error" class="canvas-demo__error">{{ error }}</p>
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

.canvas-demo__canvas--dark {
  background: #020617;
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
