---
title: WebGL Recipes
description: Browser-style WebGL usage patterns with @nativescript/canvas.
---

# WebGL Recipes

These examples use familiar browser WebGL patterns on top of `@nativescript/canvas`.

## Visual output preview

![Preview of WebGL recipe output](/demo-previews/webgl-recipes-preview.svg)

The baseline expected output is a stable triangle render, then iterative improvements through shader changes, uniforms, blending, depth testing, and viewport-resize handling.

## Shared setup

```ts
let canvas;
let gl;

export function canvasReady(args) {
  canvas = args.object;
  gl = canvas.getContext('webgl');

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
}
```

## 1. Clear color and depth buffers

```ts
gl.clearColor(0.08, 0.1, 0.14, 1.0);
gl.clearDepth(1.0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
```

Live demo:

<CanvasWebGLRecipeDemo recipe="1" />

## 2. Compile shaders

```ts
function compileShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) || 'shader compile failed');
  }

  return shader;
}

const vs = compileShader(
  gl.VERTEX_SHADER,
  `
  attribute vec2 aPos;
  void main() {
    gl_Position = vec4(aPos, 0.0, 1.0);
  }
`
);

const fs = compileShader(
  gl.FRAGMENT_SHADER,
  `
  precision mediump float;
  void main() {
    gl_FragColor = vec4(0.11, 0.78, 0.64, 1.0);
  }
`
);
```

## 3. Link program

```ts
const program = gl.createProgram();
gl.attachShader(program, vs);
gl.attachShader(program, fs);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  throw new Error(gl.getProgramInfoLog(program) || 'program link failed');
}

gl.useProgram(program);
```

## 4. Draw a triangle from a vertex buffer

```ts
const vertices = new Float32Array([
  0.0, 0.7,
  -0.7, -0.6,
  0.7, -0.6,
]);

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const aPos = gl.getAttribLocation(program, 'aPos');
gl.enableVertexAttribArray(aPos);
gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

gl.drawArrays(gl.TRIANGLES, 0, 3);
```

Live demo:

<CanvasWebGLRecipeDemo recipe="4" />

## 5. Animated uniform value (time)

```ts
const animatedProgram = createProgram(
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

// Reuse the buffer + attribute setup from recipe 4, then use animatedProgram.
gl.useProgram(animatedProgram);

let t = 0;
const uTime = gl.getUniformLocation(animatedProgram, 'uTime');

const timer = setInterval(() => {
  t += 0.016;
  gl.uniform1f(uTime, t);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}, 16);

setTimeout(() => clearInterval(timer), 3000);
```

Live demo:

<CanvasWebGLRecipeDemo recipe="5" />

## 6. Alpha blending setup

```ts
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
```

## 7. Depth testing for 3D scenes

```ts
gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);
```

## 8. Resize handling

```ts
function resize() {
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
}

resize();
```

## 9. WebGL2 context fallback pattern

```ts
const gl2 = canvas.getContext('webgl2') || canvas.getContext('webgl');
if (!gl2) {
  throw new Error('No GL context available');
}
```

## 10. Read pixels for debugging

```ts
const pixels = new Uint8Array(4 * 16 * 16);
gl.readPixels(0, 0, 16, 16, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
console.log('sample pixel RGBA', pixels[0], pixels[1], pixels[2], pixels[3]);
```

## More guides

- [Web API Samples](/canvas/guides/web-api-samples)
- [Canvas 2D Recipes](/canvas/guides/canvas-2d-recipes)
- [WebGPU Recipes](/canvas/guides/webgpu-recipes)
