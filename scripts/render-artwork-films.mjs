// Rebuild original vCraft films. No database or downloaded video is used.
// Optional: npm install --prefix .local/media-tools --no-save playwright
// Run: node scripts/render-artwork-films.mjs [scene-key ...]
import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { artworkScenes } from './media/artwork-scenes.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
let chromium;
for (const moduleName of ['playwright', path.join(root, '.local/media-tools/node_modules/playwright'), path.join(root, '.local/map-check-tools/node_modules/playwright')]) {
  try { ({ chromium } = require(moduleName)); break; } catch (error) { if (error.code !== 'MODULE_NOT_FOUND') throw error; }
}
if (!chromium) throw new Error('Install the optional renderer first: npm install --prefix .local/media-tools --no-save playwright');
const selected = process.argv.slice(2);
for (const key of selected) if (!artworkScenes.some(scene => scene.key === key)) throw new Error('Unknown scene: ' + key);
const scenes = selected.length ? artworkScenes.filter(scene => selected.includes(scene.key)) : artworkScenes;
const output = path.join(root, 'frontend/public/films');
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.setContent('<style>body{margin:0}canvas{display:block}</style><canvas width="1280" height="720"></canvas>');
  for (const scene of scenes) {
    // Generate deterministic frames outside the browser. This also keeps the SVG
    // sources usable for future posters or higher resolution exports.
    const frames = Array.from({ length: 360 }, (_, frame) => scene.render(frame / 30));
    const encoded = await page.evaluate(async frames => {
      const canvas = document.querySelector('canvas'), ctx = canvas.getContext('2d', { alpha: false });
      const mimeType = 'video/mp4;codecs=avc1.42001F';
      if (!MediaRecorder.isTypeSupported(mimeType)) throw new Error('This Chrome build cannot encode H.264/MP4.');
      const draw = async svg => {
        const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
        try {
          const image = new Image(); image.src = url; await image.decode();
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        } finally { URL.revokeObjectURL(url); }
      };
      await draw(frames[0]);
      const stream = canvas.captureStream(30), chunks = [];
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 2800000 });
      const finished = new Promise((resolve, reject) => {
        recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
        recorder.onstop = resolve;
        recorder.onerror = event => reject(new Error(event.error?.message || 'Video encoding failed'));
      });
      try {
        recorder.start();
        const start = performance.now();
        for (let frame = 0; frame < frames.length; frame++) {
          await draw(frames[frame]);
          const delay = start + (frame + 1) * 1000 / 30 - performance.now();
          if (delay > 0) await new Promise(resolve => setTimeout(resolve, delay));
        }
        recorder.stop(); await finished;
        return Array.from(new Uint8Array(await new Blob(chunks, { type: 'video/mp4' }).arrayBuffer()));
      } finally { stream.getTracks().forEach(track => track.stop()); }
    }, frames);
    await fs.writeFile(path.join(output, scene.key + '-poster.svg'), frames[0]);
    await fs.writeFile(path.join(output, scene.key + '.mp4'), Buffer.from(encoded));
    console.log(JSON.stringify({ key: scene.key, bytes: encoded.length, width: 1280, height: 720, fps: 30, audio: false }));
  }
} finally { await browser.close(); }
