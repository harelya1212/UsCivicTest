import fs from 'node:fs';
import path from 'node:path';

const SAMPLE_RATE = 44100;
const soundsDir = path.resolve('assets/sounds');
fs.mkdirSync(soundsDir, { recursive: true });

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function mixLayers(lengthSec, layers) {
  const sampleCount = Math.floor(lengthSec * SAMPLE_RATE);
  const out = new Float32Array(sampleCount);

  for (let i = 0; i < sampleCount; i += 1) {
    const t = i / SAMPLE_RATE;
    let v = 0;
    for (const layer of layers) {
      v += layer(t, i);
    }
    out[i] = clamp(v, -1, 1);
  }

  return out;
}

function writeWav(name, floatData) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = SAMPLE_RATE * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const dataSize = floatData.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < floatData.length; i += 1) {
    const s = clamp(floatData[i], -1, 1);
    buffer.writeInt16LE(Math.floor(s * 32767), 44 + i * 2);
  }

  fs.writeFileSync(path.join(soundsDir, name), buffer);
}

function expEnv(t, attack, decay) {
  if (t < 0) return 0;
  if (t < attack) return t / attack;
  return Math.exp(-(t - attack) / decay);
}

function ping(freq, amp = 1) {
  return (t) => amp * Math.sin(2 * Math.PI * freq * t);
}

function noise(seed = 1) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return ((s / 0xffffffff) * 2 - 1);
  };
}

const crystal = mixLayers(0.38, [
  (t) => ping(1320, 0.22)(t) * expEnv(t, 0.003, 0.18),
  (t) => ping(1760, 0.12)(t) * expEnv(t, 0.005, 0.22),
  (t) => ping(880, 0.08)(t) * expEnv(t, 0.001, 0.28),
  (t) => ping(1320, 0.06)(Math.max(0, t - 0.06)) * expEnv(t - 0.06, 0.001, 0.22),
]);

const thudNoise = noise(7);
const thud = mixLayers(0.45, [
  (t) => ping(90, 0.24)(t) * expEnv(t, 0.001, 0.18),
  (t) => ping(56, 0.2)(t) * expEnv(t, 0.001, 0.24),
  (t) => thudNoise() * 0.06 * expEnv(t, 0.0005, 0.08),
]);

const rise = mixLayers(2.0, [
  (t) => {
    const f = 320 + (960 * (t / 2.0));
    return Math.sin(2 * Math.PI * f * t) * 0.12 * expEnv(t, 0.02, 1.3);
  },
  (t) => {
    const sparkle = Math.sin(2 * Math.PI * (1800 + 200 * Math.sin(t * 12)) * t);
    return sparkle * 0.05 * expEnv(t, 0.03, 0.7);
  },
  (t) => ping(1400, 0.08)(Math.max(0, t - 1.75)) * expEnv(t - 1.75, 0.001, 0.15),
]);

const knockNoise = noise(33);
const knock = mixLayers(0.38, [
  (t) => (ping(170, 0.2)(t) + knockNoise() * 0.05) * expEnv(t, 0.001, 0.045),
  (t) => {
    const dt = t - 0.14;
    return (ping(150, 0.2)(Math.max(0, dt)) + knockNoise() * 0.05) * expEnv(dt, 0.001, 0.05);
  },
]);

const logo = mixLayers(0.8, [
  (t) => ping(110, 0.2)(t) * expEnv(t, 0.03, 0.5),
  (t) => ping(165, 0.13)(t) * expEnv(t, 0.04, 0.45),
  (t) => ping(1320, 0.05)(Math.max(0, t - 0.32)) * expEnv(t - 0.32, 0.001, 0.2),
]);

const adStart = mixLayers(0.2, [
  (t) => ping(130, 0.05)(t) * expEnv(t, 0.001, 0.08),
]);

writeWav('correct_crystal.wav', crystal);
writeWav('wrong_thud.wav', thud);
writeWav('highscore_rise.wav', rise);
writeWav('invite_knock.wav', knock);
writeWav('logo_swell.wav', logo);
writeWav('ad_start_mute.wav', adStart);

console.log('Generated audio branding WAV files in assets/sounds');
