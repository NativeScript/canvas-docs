<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from 'vue';

type GL = WebGLRenderingContext | WebGL2RenderingContext;

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

let rafId: number | null = null;

const recipeLabels: Record<number, string> = {
  1: 'Clear color and depth buffers',
  2: 'Compile shaders',
  3: 'Link program',
  4: 'Draw a triangle from a vertex buffer',
  5: 'Animated uniform value',
  6: 'Alpha blending setup',
  7: 'Depth testing for 3D scenes',
  8: 'Resize handling',
  9: 'WebGL2 context fallback pattern',
  10: 'Read pixels for debugging',
};

const heading = computed(() => {
  if (props.title) {
    return props.title;
  }

  return recipeLabels[recipeNumber.value] || `WebGL Recipe ${recipeNumber.value}`;
});

function stopAnimation() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

function setupGL(preferWebGL2 = false) {
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

  const gl2 = canvas.getContext('webgl2') as WebGL2RenderingContext | null;
  const webgl = canvas.getContext('webgl') as WebGLRenderingContext | null;

  let gl: GL | null = null;
  let mode = 'webgl';

  if (preferWebGL2 && gl2) {
    gl = gl2;
    mode = 'webgl2';
  } else {
    gl = webgl || gl2;
    mode = gl2 && !webgl ? 'webgl2' : 'webgl';
  }

  if (!gl) {
    return null;
  }

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

  return { gl, mode };
}

function compileShader(gl: GL, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error('Unable to create shader object.');
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) || 'Shader compilation failed.';
    gl.deleteShader(shader);
    throw new Error(message);
  }

  return shader;
}

function createProgram(gl: GL, vertexSource: string, fragmentSource: string) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    throw new Error('Unable to create program.');
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) || 'Program link failed.';
    gl.deleteProgram(program);
    throw new Error(message);
  }

  return program;
}

function drawStaticTriangle(gl: GL, color = [0.11, 0.78, 0.64, 1.0], offset = [0, 0]) {
  const program = createProgram(
    gl,
    `
      attribute vec2 aPos;
      uniform vec2 uOffset;
      void main() {
        gl_Position = vec4(aPos + uOffset, 0.0, 1.0);
      }
    `,
    `
      precision mediump float;
      uniform vec4 uColor;
      void main() {
        gl_FragColor = uColor;
      }
    `
  );

  const vertices = new Float32Array([
    0.0, 0.74,
    -0.7, -0.58,
    0.7, -0.58,
  ]);

  const buffer = gl.createBuffer();
  if (!buffer) {
    gl.deleteProgram(program);
    throw new Error('Unable to create vertex buffer.');
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  gl.useProgram(program);

  const aPos = gl.getAttribLocation(program, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uColor = gl.getUniformLocation(program, 'uColor');
  const uOffset = gl.getUniformLocation(program, 'uOffset');

  gl.uniform4f(uColor, color[0], color[1], color[2], color[3]);
  gl.uniform2f(uOffset, offset[0], offset[1]);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  gl.disableVertexAttribArray(aPos);
  gl.deleteBuffer(buffer);
  gl.deleteProgram(program);
}

function drawRecipe() {
  error.value = '';
  stopAnimation();

  const setup = setupGL(recipeNumber.value === 9);
  if (!setup) {
    error.value = 'WebGL context is not available in this browser.';
    details.value = '';
    return;
  }

  const { gl, mode } = setup;

  try {
    switch (recipeNumber.value) {
      case 1:
        gl.clearColor(0.08, 0.1, 0.14, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        details.value = 'Cleared color and depth buffers.';
        break;
      case 2: {
        const vertexSource = `
          attribute vec2 aPos;
          void main() {
            gl_Position = vec4(aPos, 0.0, 1.0);
          }
        `;

        const fragmentSource = `
          precision mediump float;
          void main() {
            gl_FragColor = vec4(0.11, 0.78, 0.64, 1.0);
          }
        `;

        compileShader(gl, gl.VERTEX_SHADER, vertexSource);
        compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

        gl.clearColor(0.03, 0.06, 0.1, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        drawStaticTriangle(gl);
        details.value = 'Shaders compiled successfully and triangle rendered.';
        break;
      }
      case 3: {
        const program = createProgram(
          gl,
          `
            attribute vec2 aPos;
            void main() {
              gl_Position = vec4(aPos, 0.0, 1.0);
            }
          `,
          `
            precision mediump float;
            void main() {
              gl_FragColor = vec4(0.24, 0.71, 0.9, 1.0);
            }
          `
        );

        gl.clearColor(0.02, 0.05, 0.08, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);
        drawStaticTriangle(gl, [0.24, 0.71, 0.9, 1.0]);
        gl.deleteProgram(program);

        details.value = 'Program linked and used for rendering.';
        break;
      }
      case 4:
        gl.clearColor(0.02, 0.04, 0.08, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        drawStaticTriangle(gl, [0.15, 0.75, 0.65, 1.0]);
        details.value = 'Triangle drawn from a vertex buffer.';
        break;
      case 5: {
        const program = createProgram(
          gl,
          `
            attribute vec2 aPos;
            void main() {
              gl_Position = vec4(aPos, 0.0, 1.0);
            }
          `,
          `
            precision mediump float;
            uniform float uTime;
            void main() {
              float v = 0.5 + 0.5 * sin(uTime * 2.0);
              gl_FragColor = vec4(v, 0.3, 1.0 - v, 1.0);
            }
          `
        );

        const vertices = new Float32Array([
          0.0, 0.74,
          -0.7, -0.58,
          0.7, -0.58,
        ]);

        const buffer = gl.createBuffer();
        if (!buffer) {
          gl.deleteProgram(program);
          throw new Error('Unable to create vertex buffer.');
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        gl.useProgram(program);
        const aPos = gl.getAttribLocation(program, 'aPos');
        const uTime = gl.getUniformLocation(program, 'uTime');

        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

        let t = 0;
        const frame = () => {
          gl.clearColor(0.02, 0.04, 0.08, 1.0);
          gl.clear(gl.COLOR_BUFFER_BIT);
          t += 0.016;
          gl.uniform1f(uTime, t);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
          rafId = requestAnimationFrame(frame);
        };

        frame();
        details.value = 'Uniform animation is running. Hide demo to stop.';
        break;
      }
      case 6:
        gl.clearColor(0.04, 0.06, 0.1, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        drawStaticTriangle(gl, [0.2, 0.9, 0.8, 0.62], [-0.16, 0.0]);
        drawStaticTriangle(gl, [0.95, 0.3, 0.45, 0.62], [0.16, 0.0]);
        gl.disable(gl.BLEND);
        details.value = 'Alpha blending applied to overlapping geometry.';
        break;
      case 7: {
        const program = createProgram(
          gl,
          `
            attribute vec3 aPos;
            void main() {
              gl_Position = vec4(aPos, 1.0);
            }
          `,
          `
            precision mediump float;
            uniform vec4 uColor;
            void main() {
              gl_FragColor = uColor;
            }
          `
        );

        const vertices = new Float32Array([
          0.0, 0.6, 0.5,
          -0.8, -0.55, 0.5,
          0.8, -0.55, 0.5,
          0.0, 0.4, 0.0,
          -0.6, -0.4, 0.0,
          0.6, -0.4, 0.0,
        ]);

        const buffer = gl.createBuffer();
        if (!buffer) {
          gl.deleteProgram(program);
          throw new Error('Unable to create depth-test buffer.');
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clearColor(0.02, 0.03, 0.08, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(program);
        const aPos = gl.getAttribLocation(program, 'aPos');
        const uColor = gl.getUniformLocation(program, 'uColor');

        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);

        gl.uniform4f(uColor, 0.2, 0.85, 0.9, 1.0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        gl.uniform4f(uColor, 0.95, 0.35, 0.45, 1.0);
        gl.drawArrays(gl.TRIANGLES, 3, 3);

        gl.disable(gl.DEPTH_TEST);
        gl.disableVertexAttribArray(aPos);
        gl.deleteBuffer(buffer);
        gl.deleteProgram(program);

        details.value = 'Depth testing enabled with near/far geometry overlap.';
        break;
      }
      case 8:
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.clearColor(0.02, 0.06, 0.1, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        drawStaticTriangle(gl, [0.17, 0.74, 0.64, 1.0]);
        details.value = 'Viewport resized to current drawingBuffer dimensions.';
        break;
      case 9:
        gl.clearColor(0.04, 0.06, 0.11, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        drawStaticTriangle(gl, [0.45, 0.73, 0.99, 1.0]);
        details.value = `Context fallback active: using ${mode}.`;
        break;
      case 10: {
        gl.clearColor(0.02, 0.04, 0.08, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        drawStaticTriangle(gl, [0.14, 0.75, 0.65, 1.0]);

        const pixel = new Uint8Array(4);
        const px = Math.floor(gl.drawingBufferWidth / 2);
        const py = Math.floor(gl.drawingBufferHeight / 2);
        gl.readPixels(px, py, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

        details.value = `Center pixel RGBA: ${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3]}.`;
        break;
      }
      default:
        details.value = 'No live demo available for this recipe id.';
        break;
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to render WebGL demo.';
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
      <canvas ref="canvasEl" class="canvas-demo__canvas canvas-demo__canvas--dark" :aria-label="`Live webgl demo: ${heading}`" />
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
