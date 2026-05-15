<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref } from 'vue';

const isVisible = ref(false);
const isReady = ref(false);
const status = ref('Audio context is not initialized yet.');
const error = ref('');
const masterLevel = ref(0.16);
const meterCanvas = ref<HTMLCanvasElement | null>(null);

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let analyser: AnalyserNode | null = null;
let meterRaf: number | null = null;
let activeSources = new Set<AudioScheduledSourceNode>();
let cleanupTimers: number[] = [];

type SynthKey = {
  label: string;
  note: string;
  midi: number;
  accidental?: boolean;
};

type InstrumentMode = 'retro-lead' | 'plucked-string';

const activeSynthNotes = ref<string[]>([]);
const instrumentMode = ref<InstrumentMode>('retro-lead');
const synthKeys: SynthKey[] = [
  { label: 'C', note: 'C4', midi: 60 },
  { label: 'C#', note: 'C#4', midi: 61, accidental: true },
  { label: 'D', note: 'D4', midi: 62 },
  { label: 'D#', note: 'D#4', midi: 63, accidental: true },
  { label: 'E', note: 'E4', midi: 64 },
  { label: 'F', note: 'F4', midi: 65 },
  { label: 'F#', note: 'F#4', midi: 66, accidental: true },
  { label: 'G', note: 'G4', midi: 67 },
  { label: 'G#', note: 'G#4', midi: 68, accidental: true },
  { label: 'A', note: 'A4', midi: 69 },
  { label: 'A#', note: 'A#4', midi: 70, accidental: true },
  { label: 'B', note: 'B4', midi: 71 },
  { label: 'C', note: 'C5', midi: 72 },
];

function clearCleanupTimers() {
  for (const id of cleanupTimers) {
    window.clearTimeout(id);
  }
  cleanupTimers = [];
}

function stopMeter() {
  if (meterRaf !== null) {
    cancelAnimationFrame(meterRaf);
    meterRaf = null;
  }
}

function startMeter() {
  if (meterRaf !== null) {
    return;
  }

  const canvas = meterCanvas.value;
  const analyserNode = analyser;

  if (!canvas || !analyserNode) {
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  const width = 540;
  const height = 120;

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = '100%';
  canvas.style.maxWidth = `${width}px`;
  canvas.style.height = '120px';

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const bins = new Uint8Array(analyserNode.frequencyBinCount);

  const draw = () => {
    const currentAnalyser = analyser;
    if (!currentAnalyser || !isVisible.value) {
      meterRaf = null;
      return;
    }

    currentAnalyser.getByteFrequencyData(bins);

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, width, height);

    const barCount = 56;
    const binStep = Math.max(1, Math.floor(bins.length / barCount));
    const barWidth = width / barCount;

    for (let i = 0; i < barCount; i += 1) {
      const sample = bins[i * binStep] || 0;
      const value = sample / 255;
      const barHeight = Math.max(2, value * (height - 10));
      const x = i * barWidth;
      const y = height - barHeight;

      const hue = 170 + i * 0.6;
      ctx.fillStyle = `hsl(${hue}, 85%, 58%)`;
      ctx.fillRect(x + 1, y, Math.max(2, barWidth - 2), barHeight);
    }

    meterRaf = requestAnimationFrame(draw);
  };

  draw();
}

function updateMasterLevel() {
  if (masterGain) {
    masterGain.gain.value = masterLevel.value;
  }
}

function releaseSource(source: AudioScheduledSourceNode) {
  activeSources.delete(source);
}

function trackSource(source: AudioScheduledSourceNode, maxLifetimeMs = 4000) {
  activeSources.add(source);

  const previousEnded = source.onended;
  source.onended = (event) => {
    releaseSource(source);
    if (typeof previousEnded === 'function') {
      previousEnded.call(source, event);
    }
  };

  const timer = window.setTimeout(() => {
    if (activeSources.has(source)) {
      try {
        source.stop();
      } catch {
        // Ignore if already stopped.
      }
      releaseSource(source);
    }
  }, maxLifetimeMs);

  cleanupTimers.push(timer);
}

function stopAllSources() {
  for (const source of activeSources) {
    try {
      source.stop();
    } catch {
      // Ignore if already stopped.
    }
  }

  activeSources.clear();
  clearCleanupTimers();
}

async function ensureAudioReady() {
  if (!audioCtx) {
    const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtor) {
      throw new Error('Web Audio API is not available in this browser.');
    }

    audioCtx = new AudioCtor();
    masterGain = audioCtx.createGain();
    analyser = audioCtx.createAnalyser();

    masterGain.gain.value = masterLevel.value;
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.85;

    masterGain.connect(analyser);
    analyser.connect(audioCtx.destination);
  }

  if (audioCtx.state !== 'running') {
    await audioCtx.resume();
  }

  isReady.value = true;
  startMeter();
}

function createOutputGain(level = 0.14) {
  if (!audioCtx || !masterGain) {
    throw new Error('Audio context not ready.');
  }

  const node = audioCtx.createGain();
  node.gain.value = level;
  node.connect(masterGain);
  return node;
}

function maxByteValue(data: Uint8Array) {
  let peak = 0;
  for (let i = 0; i < data.length; i += 1) {
    if (data[i] > peak) {
      peak = data[i];
    }
  }
  return peak;
}

function makeDistortionCurve(amount = 50) {
  const n = 2048;
  const curve = new Float32Array(n);

  for (let i = 0; i < n; i += 1) {
    const x = (i * 2) / n - 1;
    curve[i] = ((3 + amount) * x * 20 * (Math.PI / 180)) / (Math.PI + amount * Math.abs(x));
  }

  return curve;
}

function createNoiseBuffer(ctx: AudioContext, durationSeconds: number, channels = 1) {
  const frames = Math.max(1, Math.floor(ctx.sampleRate * durationSeconds));
  const buffer = ctx.createBuffer(channels, frames, ctx.sampleRate);

  for (let channel = 0; channel < channels; channel += 1) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < frames; i += 1) {
      const decay = Math.pow(1 - i / frames, 2);
      data[i] = (Math.random() * 2 - 1) * decay;
    }
  }

  return buffer;
}

function createStereoTestBuffer(ctx: AudioContext, durationSeconds: number) {
  const frames = Math.max(1, Math.floor(ctx.sampleRate * durationSeconds));
  const buffer = ctx.createBuffer(2, frames, ctx.sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  for (let i = 0; i < frames; i += 1) {
    const t = i / ctx.sampleRate;
    const env = Math.exp(-t * 1.6);
    left[i] = Math.sin(2 * Math.PI * 220 * t) * env;
    right[i] = Math.sin(2 * Math.PI * 330 * t) * env;
  }

  return buffer;
}

function midiToFrequency(midi: number) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function markSynthNoteActive(note: string, durationMs = 260) {
  if (!activeSynthNotes.value.includes(note)) {
    activeSynthNotes.value = [...activeSynthNotes.value, note];
  }

  const timer = window.setTimeout(() => {
    activeSynthNotes.value = activeSynthNotes.value.filter((keyNote) => keyNote !== note);
  }, durationMs);

  cleanupTimers.push(timer);
}

async function playSynthVoice(midi: number, durationSeconds = 0.34, velocity = 1) {
  await ensureAudioReady();
  if (!audioCtx) {
    return;
  }

  const now = audioCtx.currentTime;
  const freq = midiToFrequency(midi);

  const oscA = audioCtx.createOscillator();
  const oscB = audioCtx.createOscillator();
  const filter = audioCtx.createBiquadFilter();
  const amp = audioCtx.createGain();

  oscA.type = 'sawtooth';
  oscB.type = 'square';
  oscA.frequency.setValueAtTime(freq, now);
  oscB.frequency.setValueAtTime(freq * 0.997, now);

  filter.type = 'lowpass';
  filter.Q.value = 7.5;
  filter.frequency.setValueAtTime(880, now);
  filter.frequency.exponentialRampToValueAtTime(2600, now + 0.08);
  filter.frequency.exponentialRampToValueAtTime(760, now + durationSeconds);

  amp.gain.setValueAtTime(0.0001, now);
  amp.gain.exponentialRampToValueAtTime(0.22 * velocity, now + 0.018);
  amp.gain.exponentialRampToValueAtTime(0.12 * velocity, now + 0.11);
  amp.gain.exponentialRampToValueAtTime(0.0001, now + durationSeconds);

  oscA.connect(filter);
  oscB.connect(filter);
  filter.connect(amp);
  amp.connect(createOutputGain(0.2));

  oscA.start(now);
  oscB.start(now);
  oscA.stop(now + durationSeconds + 0.03);
  oscB.stop(now + durationSeconds + 0.03);

  const lifetimeMs = Math.ceil((durationSeconds + 0.2) * 1000);
  trackSource(oscA, lifetimeMs);
  trackSource(oscB, lifetimeMs);
}

async function playPluckedStringVoice(midi: number, durationSeconds = 0.38, velocity = 1) {
  await ensureAudioReady();
  if (!audioCtx) {
    return;
  }

  const now = audioCtx.currentTime;
  const freq = midiToFrequency(midi);
  const ringLength = Math.max(0.28, durationSeconds * 1.4);
  const level = Math.min(1.0, Math.max(0.3, velocity));

  const out = createOutputGain(0.18);
  const stringBody = audioCtx.createGain();
  stringBody.gain.value = 1;
  stringBody.connect(out);

  const stringOsc = audioCtx.createOscillator();
  const stringGain = audioCtx.createGain();
  stringOsc.type = 'triangle';
  stringOsc.frequency.setValueAtTime(freq * 1.006, now);
  stringOsc.frequency.exponentialRampToValueAtTime(freq, now + 0.022);

  stringGain.gain.setValueAtTime(0.0001, now);
  stringGain.gain.exponentialRampToValueAtTime(0.28 * level, now + 0.005);
  stringGain.gain.exponentialRampToValueAtTime(0.0001, now + ringLength);

  const stringFilter = audioCtx.createBiquadFilter();
  stringFilter.type = 'lowpass';
  stringFilter.frequency.setValueAtTime(5400, now);
  stringFilter.Q.value = 2.1;

  stringOsc.connect(stringGain);
  stringGain.connect(stringFilter);
  stringFilter.connect(stringBody);

  const pluckNoise = audioCtx.createBufferSource();
  pluckNoise.buffer = createNoiseBuffer(audioCtx, 0.028);

  const pluckHp = audioCtx.createBiquadFilter();
  pluckHp.type = 'highpass';
  pluckHp.frequency.setValueAtTime(1200, now);

  const pluckBp = audioCtx.createBiquadFilter();
  pluckBp.type = 'bandpass';
  pluckBp.frequency.setValueAtTime(freq * 2.2, now);
  pluckBp.Q.value = 0.8;

  const pluckGain = audioCtx.createGain();
  pluckGain.gain.setValueAtTime(0.0001, now);
  pluckGain.gain.exponentialRampToValueAtTime(0.15 * level, now + 0.002);
  pluckGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.032);

  pluckNoise.connect(pluckHp);
  pluckHp.connect(pluckBp);
  pluckBp.connect(pluckGain);
  pluckGain.connect(stringBody);

  const decayFilter = audioCtx.createBiquadFilter();
  decayFilter.type = 'highpass';
  decayFilter.frequency.setValueAtTime(280, now);
  decayFilter.frequency.exponentialRampToValueAtTime(160, now + ringLength);

  stringFilter.disconnect();
  stringFilter.connect(decayFilter);
  decayFilter.connect(stringBody);

  stringOsc.start(now);
  stringOsc.stop(now + ringLength + 0.04);
  trackSource(stringOsc, Math.ceil((ringLength + 0.14) * 1000));

  pluckNoise.start(now);
  pluckNoise.stop(now + 0.04);
  trackSource(pluckNoise, 200);
}

function setInstrument(mode: InstrumentMode) {
  instrumentMode.value = mode;
  error.value = '';

  if (mode === 'plucked-string') {
    status.value = 'Instrument switched to plucked string.';
  } else {
    status.value = 'Instrument switched to retro lead synth.';
  }
}

async function triggerSynthKey(key: SynthKey) {
  error.value = '';

  try {
    markSynthNoteActive(key.note, 320);

    if (instrumentMode.value === 'plucked-string') {
      await playPluckedStringVoice(key.midi, 0.48, 1.0);
      status.value = `Plucked string played ${key.note}.`;
    } else {
      await playSynthVoice(key.midi, 0.34, 0.95);
      status.value = `Retro lead synth played ${key.note}.`;
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to play instrument key.';
  }
}

async function playRetroSynthRiff() {
  error.value = '';

  try {
    await ensureAudioReady();
    if (!audioCtx) {
      return;
    }

    stopAllSources();

    const bpm = 126;
    const beatSeconds = 60 / bpm;
    const sequence = [
      { midi: 60, beats: 0.5, velocity: 1.08 },
      { midi: 67, beats: 0.25, velocity: 0.9 },
      { midi: 70, beats: 0.25, velocity: 0.96 },
      { midi: 72, beats: 0.5, velocity: 1.06 },
      { midi: 70, beats: 0.25, velocity: 0.92 },
      { midi: 67, beats: 0.25, velocity: 0.92 },
      { midi: 63, beats: 0.5, velocity: 0.98 },
      { midi: 67, beats: 0.5, velocity: 0.95 },

      { midi: 60, beats: 0.5, velocity: 1.08 },
      { midi: 65, beats: 0.25, velocity: 0.9 },
      { midi: 67, beats: 0.25, velocity: 0.96 },
      { midi: 70, beats: 0.5, velocity: 1.04 },
      { midi: 67, beats: 0.25, velocity: 0.92 },
      { midi: 65, beats: 0.25, velocity: 0.92 },
      { midi: 62, beats: 0.5, velocity: 0.98 },
      { midi: 65, beats: 0.5, velocity: 0.95 },

      { midi: 60, beats: 0.5, velocity: 1.08 },
      { midi: 63, beats: 0.5, velocity: 0.98 },
      { midi: 67, beats: 0.5, velocity: 1.02 },
      { midi: 72, beats: 0.5, velocity: 1.08 },
      { midi: 70, beats: 0.5, velocity: 0.96 },
      { midi: 67, beats: 0.5, velocity: 0.96 },
      { midi: 63, beats: 0.5, velocity: 0.94 },
      { midi: 60, beats: 0.5, velocity: 1.0 },
    ];

    let offsetMs = 0;
    for (const step of sequence) {
      const stepDuration = step.beats * beatSeconds;
      const timer = window.setTimeout(() => {
        const key = synthKeys.find((item) => item.midi === step.midi);
        if (key) {
          markSynthNoteActive(key.note, Math.max(180, stepDuration * 1000));
        }

        void playSynthVoice(step.midi, stepDuration * 0.9, step.velocity ?? 1.0);
      }, offsetMs);

      cleanupTimers.push(timer);
      offsetMs += stepDuration * 1000;
    }

    status.value = 'Played retro lead riff (original 80s-style sequence).';
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to play retro synth riff.';
  }
}

async function playSteelPanGroove() {
  error.value = '';

  try {
    await ensureAudioReady();
    if (!audioCtx) {
      return;
    }

    stopAllSources();
    instrumentMode.value = 'plucked-string';

    const bpm = 128;
    const beatSeconds = 60 / bpm;
    const sequence: Array<{ midi: number | null; beats: number; velocity?: number }> = [
      { midi: 67, beats: 0.25, velocity: 1.0 },
      { midi: 70, beats: 0.25, velocity: 0.92 },
      { midi: 72, beats: 0.25, velocity: 0.96 },
      { midi: 70, beats: 0.25, velocity: 0.9 },
      { midi: 67, beats: 0.5, velocity: 0.94 },
      { midi: null, beats: 0.25 },
      { midi: 65, beats: 0.25, velocity: 0.88 },
      { midi: 67, beats: 0.5, velocity: 0.92 },

      { midi: 69, beats: 0.25, velocity: 0.95 },
      { midi: 70, beats: 0.25, velocity: 0.9 },
      { midi: 69, beats: 0.25, velocity: 0.88 },
      { midi: 67, beats: 0.25, velocity: 0.9 },
      { midi: 65, beats: 0.5, velocity: 0.87 },
      { midi: null, beats: 0.25 },
      { midi: 64, beats: 0.25, velocity: 0.84 },
      { midi: 62, beats: 0.5, velocity: 0.9 },

      { midi: 67, beats: 0.25, velocity: 1.0 },
      { midi: 69, beats: 0.25, velocity: 0.92 },
      { midi: 70, beats: 0.25, velocity: 0.94 },
      { midi: 72, beats: 0.25, velocity: 0.98 },
      { midi: 70, beats: 0.5, velocity: 0.9 },
      { midi: 69, beats: 0.25, velocity: 0.88 },
      { midi: 67, beats: 0.25, velocity: 0.9 },
      { midi: 65, beats: 0.5, velocity: 0.87 },

      { midi: 64, beats: 0.25, velocity: 0.84 },
      { midi: 65, beats: 0.25, velocity: 0.86 },
      { midi: 67, beats: 0.25, velocity: 0.9 },
      { midi: 69, beats: 0.25, velocity: 0.93 },
      { midi: 67, beats: 0.5, velocity: 0.92 },
      { midi: 65, beats: 0.25, velocity: 0.87 },
      { midi: 64, beats: 0.25, velocity: 0.84 },
      { midi: 67, beats: 1.0, velocity: 1.0 },
    ];

    let offsetMs = 0;
    for (const step of sequence) {
      const stepDuration = step.beats * beatSeconds;
      const jitterMs = (Math.random() - 0.5) * 8;
      const stepTime = Math.max(0, offsetMs + jitterMs);
      const timer = window.setTimeout(() => {
        if (step.midi === null) {
          return;
        }

        const key = synthKeys.find((item) => item.midi === step.midi);
        if (key) {
          markSynthNoteActive(key.note, Math.max(170, stepDuration * 880));
        }

        const nextDuration = Math.max(0.25, stepDuration * 1.25);
        void playPluckedStringVoice(step.midi, nextDuration, step.velocity ?? 1.0);
      }, stepTime);

      cleanupTimers.push(timer);
      offsetMs += stepDuration * 1000;
    }

    status.value = 'Played plucked string groove.';
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to play plucked string groove.';
  }
}

async function startAudio() {
  error.value = '';

  try {
    await ensureAudioReady();
    status.value = 'Audio context running. Use a sample button to hear behavior.';
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to initialize audio context.';
  }
}

async function playBasicOscillator() {
  error.value = '';

  try {
    await ensureAudioReady();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const out = createOutputGain(0.12);

    osc.type = 'sine';
    osc.frequency.value = 440;
    osc.connect(out);

    const now = audioCtx.currentTime;
    osc.start(now);
    osc.stop(now + 0.9);

    trackSource(osc, 1600);
    status.value = 'Basic oscillator graph played (sine @ 440Hz).';
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to play oscillator sample.';
  }
}

async function playAdsrEnvelope() {
  error.value = '';

  try {
    await ensureAudioReady();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const amp = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.value = 220;

    amp.gain.value = 0.0001;
    amp.connect(createOutputGain(0.32));
    osc.connect(amp);

    const now = audioCtx.currentTime;
    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.exponentialRampToValueAtTime(0.95, now + 0.02);
    amp.gain.exponentialRampToValueAtTime(0.45, now + 0.2);
    amp.gain.setTargetAtTime(0.0001, now + 0.5, 0.08);

    osc.start(now);
    osc.stop(now + 1.2);

    trackSource(osc, 2200);
    status.value = 'ADSR envelope sample played (attack, decay, sustain, release).';
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to play ADSR sample.';
  }
}

async function playFilterSweep() {
  error.value = '';

  try {
    await ensureAudioReady();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();

    osc.type = 'square';
    osc.frequency.value = 110;

    filter.type = 'lowpass';
    filter.frequency.value = 200;
    filter.Q.value = 4;

    osc.connect(filter);
    filter.connect(createOutputGain(0.14));

    const now = audioCtx.currentTime;
    filter.frequency.setValueAtTime(200, now);
    filter.frequency.exponentialRampToValueAtTime(6000, now + 1.8);

    osc.start(now);
    osc.stop(now + 2);

    trackSource(osc, 3000);
    status.value = 'Lowpass filter sweep played (200Hz -> 6kHz).';
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to play filter sweep sample.';
  }
}

async function playStereoPanSweep() {
  error.value = '';

  try {
    await ensureAudioReady();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = 330;

    const out = createOutputGain(0.13);

    const supportsPanner = typeof audioCtx.createStereoPanner === 'function';
    const now = audioCtx.currentTime;

    if (supportsPanner) {
      const pan = audioCtx.createStereoPanner();
      pan.pan.setValueAtTime(-1, now);
      pan.pan.linearRampToValueAtTime(1, now + 1.8);

      osc.connect(pan);
      pan.connect(out);
      status.value = 'Stereo panner sweep played (left -> right).';
    } else {
      osc.connect(out);
      status.value = 'StereoPannerNode is unavailable in this browser; played center signal fallback.';
    }

    osc.start(now);
    osc.stop(now + 2);

    trackSource(osc, 3000);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to play panner sample.';
  }
}

async function playDelayFeedback() {
  error.value = '';

  try {
    await ensureAudioReady();
    if (!audioCtx) return;

    const source = audioCtx.createOscillator();
    source.type = 'square';
    source.frequency.value = 240;

    const sourceGain = audioCtx.createGain();
    sourceGain.gain.value = 0.5;

    const delay = audioCtx.createDelay(1.2);
    delay.delayTime.value = 0.34;

    const feedback = audioCtx.createGain();
    feedback.gain.value = 0.37;

    const dry = createOutputGain(0.1);
    const wet = createOutputGain(0.2);

    source.connect(sourceGain);
    sourceGain.connect(dry);
    sourceGain.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);

    const now = audioCtx.currentTime;
    source.start(now);
    source.stop(now + 0.12);

    trackSource(source, 3500);
    status.value = 'Delay feedback sample played (short pulse with echo tail).';
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to play delay sample.';
  }
}

async function playThreeDPanner() {
  error.value = '';

  try {
    await ensureAudioReady();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const amp = audioCtx.createGain();
    const panner = audioCtx.createPanner();

    osc.type = 'sawtooth';
    osc.frequency.value = 180;
    amp.gain.value = 0.14;

    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 1;
    panner.maxDistance = 24;
    panner.rolloffFactor = 1.2;
    panner.coneInnerAngle = 70;
    panner.coneOuterAngle = 200;
    panner.coneOuterGain = 0.25;

    const listener = audioCtx.listener;
    if ('positionX' in listener && listener.positionX) {
      const t = audioCtx.currentTime;
      listener.positionX.setValueAtTime(0, t);
      listener.positionY.setValueAtTime(0, t);
      listener.positionZ.setValueAtTime(0, t);

      if ('forwardX' in listener && listener.forwardX) {
        listener.forwardX.setValueAtTime(0, t);
        listener.forwardY.setValueAtTime(0, t);
        listener.forwardZ.setValueAtTime(-1, t);
        listener.upX.setValueAtTime(0, t);
        listener.upY.setValueAtTime(1, t);
        listener.upZ.setValueAtTime(0, t);
      }
    } else if (typeof listener.setPosition === 'function') {
      listener.setPosition(0, 0, 0);
    }

    const duration = 2.8;

    function setPannerPosition(x: number, y: number, z: number) {
      if ('positionX' in panner && panner.positionX) {
        const t = audioCtx.currentTime;
        panner.positionX.setValueAtTime(x, t);
        panner.positionY.setValueAtTime(y, t);
        panner.positionZ.setValueAtTime(z, t);
      } else if (typeof panner.setPosition === 'function') {
        panner.setPosition(x, y, z);
      }
    }

    const startedAt = performance.now();
    const timer = window.setInterval(() => {
      const elapsed = (performance.now() - startedAt) / 1000;
      const angle = elapsed * Math.PI * 1.7;
      const x = Math.cos(angle) * 1.4;
      const y = Math.sin(angle * 0.7) * 0.25;
      const z = -2.2 + Math.sin(angle * 1.3) * 0.9;

      setPannerPosition(x, y, z);

      if (elapsed >= duration) {
        window.clearInterval(timer);
      }
    }, 40);
    cleanupTimers.push(timer);

    osc.connect(panner);
    panner.connect(amp);
    amp.connect(createOutputGain(0.13));

    const now = audioCtx.currentTime;
    osc.start(now);
    osc.stop(now + duration + 0.12);

    trackSource(osc, 3200);
    status.value = '3D panner sample played (orbit + distance sweep around listener).';
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to play 3D panner sample.';
  }
}

async function playWaveShaperDistortion() {
  error.value = '';

  try {
    await ensureAudioReady();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const shaper = audioCtx.createWaveShaper();

    osc.type = 'sawtooth';
    osc.frequency.value = 125;

    shaper.curve = makeDistortionCurve(120);
    shaper.oversample = '4x';

    osc.connect(shaper);
    shaper.connect(createOutputGain(0.09));

    const now = audioCtx.currentTime;
    osc.start(now);
    osc.stop(now + 1.1);

    trackSource(osc, 2200);
    status.value = 'Waveshaper distortion sample played.';
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to play waveshaper sample.';
  }
}

async function playConvolverReverb() {
  error.value = '';

  try {
    await ensureAudioReady();
    if (!audioCtx) return;

    const source = audioCtx.createBufferSource();
    const convolver = audioCtx.createConvolver();

    source.buffer = createNoiseBuffer(audioCtx, 0.14, 1);
    convolver.buffer = createNoiseBuffer(audioCtx, 1.8, 2);

    const dry = createOutputGain(0.11);
    const wet = createOutputGain(0.26);

    source.connect(dry);
    source.connect(convolver);
    convolver.connect(wet);

    const now = audioCtx.currentTime;
    source.start(now);

    trackSource(source, 3200);
    status.value = 'Convolver reverb sample played (dry plus wet impulse response).';
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to play convolver sample.';
  }
}

async function runRealtimeAnalyserSample() {
  error.value = '';

  try {
    await ensureAudioReady();
    if (!audioCtx || !analyser) return;

    const osc = audioCtx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = 220;
    osc.connect(createOutputGain(0.1));

    const bins = new Uint8Array(analyser.frequencyBinCount);
    let peak = 0;

    const poll = window.setInterval(() => {
      if (!analyser) {
        return;
      }
      analyser.getByteFrequencyData(bins);
      peak = Math.max(peak, maxByteValue(bins));
    }, 80);
    cleanupTimers.push(poll);

    const done = window.setTimeout(() => {
      window.clearInterval(poll);
      status.value = `Analyser sample complete. Peak byte value observed: ${peak}.`;
    }, 1300);
    cleanupTimers.push(done);

    const now = audioCtx.currentTime;
    osc.start(now);
    osc.stop(now + 1.2);
    trackSource(osc, 2200);

    status.value = 'Real-time analyser sample is running.';
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to run analyser sample.';
  }
}

async function playChannelSplitMerge() {
  error.value = '';

  try {
    await ensureAudioReady();
    if (!audioCtx) return;

    const source = audioCtx.createBufferSource();
    source.buffer = createStereoTestBuffer(audioCtx, 1.5);

    const split = audioCtx.createChannelSplitter(2);
    const merge = audioCtx.createChannelMerger(2);

    const leftGain = audioCtx.createGain();
    const rightGain = audioCtx.createGain();
    leftGain.gain.value = 1.0;
    rightGain.gain.value = 0.65;

    source.connect(split);
    split.connect(leftGain, 0);
    split.connect(rightGain, 1);
    leftGain.connect(merge, 0, 0);
    rightGain.connect(merge, 0, 1);
    merge.connect(createOutputGain(0.22));

    source.start();
    trackSource(source, 3000);
    status.value = 'Channel split/merge sample played (left and right independently processed).';
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to play channel split/merge sample.';
  }
}

async function playPeriodicWaveSample() {
  error.value = '';

  try {
    await ensureAudioReady();
    if (!audioCtx) return;

    const real = new Float32Array([0, 0.8, 0.4, 0.2]);
    const imag = new Float32Array([0, 0.0, 0.0, 0.0]);

    const wave = audioCtx.createPeriodicWave(real, imag, { disableNormalization: false });
    const osc = audioCtx.createOscillator();
    osc.setPeriodicWave(wave);
    osc.frequency.value = 330;
    osc.connect(createOutputGain(0.1));

    const now = audioCtx.currentTime;
    osc.start(now);
    osc.stop(now + 1.0);

    trackSource(osc, 2000);
    status.value = 'PeriodicWave custom oscillator sample played.';
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to play periodic wave sample.';
  }
}

function stopAll() {
  stopAllSources();
  status.value = 'Stopped all active sources.';
  error.value = '';
}

async function toggleDemo() {
  isVisible.value = !isVisible.value;

  if (isVisible.value) {
    await nextTick();
    status.value = 'Use Start Audio first, then pick any sample or play the on-screen instruments below.';
    if (isReady.value) {
      startMeter();
    }
  } else {
    stopAllSources();
    stopMeter();
    status.value = 'Demo hidden.';
    error.value = '';
  }
}

onBeforeUnmount(() => {
  stopAllSources();
  stopMeter();

  if (audioCtx && audioCtx.state !== 'closed') {
    void audioCtx.close();
  }
});
</script>

<template>
  <div class="audio-demo">
    <div class="audio-demo__header">
      <strong>Interactive audio preview</strong>
      <button type="button" class="audio-demo__button" @click="toggleDemo">
        {{ isVisible ? 'Hide demo' : 'View demo' }}
      </button>
    </div>

    <p class="audio-demo__intro">
      This panel runs browser Web Audio graphs that mirror the guide samples so developers can hear expected behavior quickly.
    </p>

    <template v-if="isVisible">
      <div class="audio-demo__toolbar">
        <button type="button" class="audio-demo__button" @click="startAudio">Start Audio</button>
        <button type="button" class="audio-demo__button" @click="stopAll">Stop All</button>

        <label class="audio-demo__volume-label" for="audio-master-volume">Master volume</label>
        <input
          id="audio-master-volume"
          class="audio-demo__volume-slider"
          type="range"
          min="0"
          max="0.4"
          step="0.01"
          v-model.number="masterLevel"
          @input="updateMasterLevel"
        />
      </div>

      <div class="audio-demo__grid">
        <button type="button" class="audio-demo__sample" @click="playBasicOscillator">1. Basic oscillator</button>
        <button type="button" class="audio-demo__sample" @click="playAdsrEnvelope">2. ADSR envelope</button>
        <button type="button" class="audio-demo__sample" @click="playFilterSweep">3. Filter sweep</button>
        <button type="button" class="audio-demo__sample" @click="playStereoPanSweep">4. Stereo pan automation</button>
        <button type="button" class="audio-demo__sample" @click="playThreeDPanner">5. 3D panner</button>
        <button type="button" class="audio-demo__sample" @click="playDelayFeedback">6. Delay feedback loop</button>
        <button type="button" class="audio-demo__sample" @click="playWaveShaperDistortion">7. Waveshaper distortion</button>
        <button type="button" class="audio-demo__sample" @click="playConvolverReverb">8. Convolver reverb</button>
        <button type="button" class="audio-demo__sample" @click="runRealtimeAnalyserSample">9. Real-time analyser</button>
        <button type="button" class="audio-demo__sample" @click="playChannelSplitMerge">10. Channel split/merge</button>
        <button type="button" class="audio-demo__sample" @click="playPeriodicWaveSample">11. PeriodicWave shape</button>
      </div>

      <div class="audio-demo__synth">
        <div class="audio-demo__synth-header">
          <strong>On-screen instruments</strong>
          <div class="audio-demo__synth-actions">
            <button type="button" class="audio-demo__button" @click="playRetroSynthRiff">Play retro lead riff</button>
            <button type="button" class="audio-demo__button" @click="playSteelPanGroove">Play plucked string groove</button>
          </div>
        </div>

        <div class="audio-demo__instrument-picker">
          <button
            type="button"
            class="audio-demo__instrument"
            :class="instrumentMode === 'retro-lead' ? 'audio-demo__instrument--active' : ''"
            @click="setInstrument('retro-lead')"
          >
            Retro lead synth
          </button>
          <button
            type="button"
            class="audio-demo__instrument"
            :class="instrumentMode === 'plucked-string' ? 'audio-demo__instrument--active' : ''"
            @click="setInstrument('plucked-string')"
          >
            Plucked string
          </button>
        </div>

        <p class="audio-demo__synth-copy">
          Includes a retro lead synth and a bright plucked string voice with natural decay.
        </p>

        <div class="audio-demo__keyboard">
          <button
            v-for="key in synthKeys"
            :key="key.note"
            type="button"
            class="audio-demo__key"
            :class="[
              key.accidental ? 'audio-demo__key--accidental' : 'audio-demo__key--natural',
              activeSynthNotes.includes(key.note) ? 'audio-demo__key--active' : '',
            ]"
            @click="triggerSynthKey(key)"
          >
            <span class="audio-demo__key-label">{{ key.label }}</span>
            <span class="audio-demo__key-note">{{ key.note }}</span>
          </button>
        </div>
      </div>

      <canvas ref="meterCanvas" class="audio-demo__meter" aria-label="Audio analyser frequency bars" />

      <p v-if="error" class="audio-demo__error">{{ error }}</p>
      <p v-else class="audio-demo__status">{{ status }}</p>

      <p class="audio-demo__hint">
        Tip: browsers require a user interaction for audio playback. Use Start Audio first if no sound is heard.
      </p>
    </template>

    <p v-else class="audio-demo__status">Demo is hidden by default. Click View demo to open controls.</p>
  </div>
</template>

<style scoped>
.audio-demo {
  margin: 0.95rem 0 1.2rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  padding: 0.85rem;
  background: var(--vp-c-bg-soft);
}

.audio-demo__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  color: var(--vp-c-text-1);
}

.audio-demo__intro {
  margin-top: 0;
  margin-bottom: 0.65rem;
  color: var(--vp-c-text-2);
  font-size: 0.88rem;
}

.audio-demo__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem 0.6rem;
  margin-bottom: 0.7rem;
}

.audio-demo__button,
.audio-demo__sample {
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  border-radius: 8px;
  padding: 0.35rem 0.6rem;
  font-size: 0.82rem;
  cursor: pointer;
}

.audio-demo__button:hover,
.audio-demo__sample:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.audio-demo__volume-label {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}

.audio-demo__volume-slider {
  width: 120px;
}

.audio-demo__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 0.45rem;
  margin-bottom: 0.7rem;
}

.audio-demo__sample {
  text-align: left;
}

.audio-demo__synth {
  margin-bottom: 0.75rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 0.65rem;
  background: rgba(15, 23, 42, 0.04);
}

.audio-demo__synth-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
}

.audio-demo__synth-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.audio-demo__instrument-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 0.55rem;
  margin-bottom: 0.2rem;
}

.audio-demo__instrument {
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  border-radius: 999px;
  padding: 0.28rem 0.72rem;
  font-size: 0.76rem;
  cursor: pointer;
}

.audio-demo__instrument:hover {
  border-color: var(--vp-c-brand-1);
}

.audio-demo__instrument--active {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft) inset;
  color: var(--vp-c-brand-1);
}

.audio-demo__synth-copy {
  margin-top: 0.45rem;
  margin-bottom: 0.55rem;
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
}

.audio-demo__keyboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  gap: 0.4rem;
}

.audio-demo__key {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.45rem 0.3rem;
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease;
}

.audio-demo__key--natural {
  background: #f8fafc;
  color: #0f172a;
}

.audio-demo__key--accidental {
  background: #0f172a;
  color: #e2e8f0;
  border-color: #334155;
}

.audio-demo__key--active {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft) inset;
  transform: translateY(1px);
}

.audio-demo__key-label {
  display: block;
  font-size: 0.76rem;
  font-weight: 700;
}

.audio-demo__key-note {
  display: block;
  margin-top: 0.1rem;
  font-size: 0.68rem;
  opacity: 0.8;
}

.audio-demo__meter {
  display: block;
  width: 100%;
  max-width: 540px;
  height: 120px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: #020617;
}

.audio-demo__status {
  margin-top: 0.55rem;
  margin-bottom: 0;
  font-size: 0.84rem;
  color: var(--vp-c-text-2);
}

.audio-demo__error {
  margin-top: 0.55rem;
  margin-bottom: 0;
  font-size: 0.84rem;
  color: #dc2626;
}

.audio-demo__hint {
  margin-top: 0.42rem;
  margin-bottom: 0;
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
}
</style>
