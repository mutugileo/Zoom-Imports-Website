#!/usr/bin/env node
/**
 * Turns turntable footage (or a folder of stills) into the numbered frame set
 * the 360 viewer expects.
 *
 *   node scripts/extract-frames.mjs --video lot/axio.mp4 --slug toyota-axio-2015
 *   node scripts/extract-frames.mjs --images lot/axio/   --slug toyota-axio-2015
 *   node scripts/extract-frames.mjs --video lot/axio.mp4 --slug axio --count 24
 *
 * Output: website/public/media/360/<slug>/frame-01.webp … frame-NN.webp
 *
 * Shooting guide — either works:
 *   • Turntable: fix the camera, spin the car, record one clean revolution.
 *   • Walk-around: keep a constant radius and take evenly spaced photos.
 * Consistent exposure matters more than resolution; auto-exposure drift makes
 * the spin strobe.
 *
 * Requires: ffmpeg + ffprobe (brew install ffmpeg), cwebp (brew install webp)
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const exec = promisify(execFile);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

const args = process.argv.slice(2);
const flag = (name, fallback = null) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};

const video = flag('video');
const imagesDir = flag('images');
const slug = flag('slug');
const count = Number(flag('count', '12'));
const width = Number(flag('width', '1400'));
const quality = Number(flag('quality', '84'));

function usage(message) {
  if (message) console.error(`\n${message}`);
  console.error(`
Usage:
  --slug <name>     required — folder name under public/media/360/
  --video <file>    source video (one full revolution)
  --images <dir>    OR a folder of stills, sorted by filename
  --count <n>       frames to produce (default 12; 24 is smoother)
  --width <px>      output width (default 1400)
  --quality <1-100> WebP quality (default 84)
`);
  process.exit(1);
}

if (!slug) usage('Missing --slug');
if (!video && !imagesDir) usage('Provide either --video or --images');
if (!Number.isFinite(count) || count < 4) usage('--count must be at least 4');

const OUT = path.join(ROOT, 'public/media/360', slug);

async function requireTool(bin, hint) {
  try {
    await exec(bin, ['-version']);
  } catch {
    console.error(`${bin} not found. Install with: ${hint}`);
    process.exit(1);
  }
}

async function durationOf(file) {
  const { stdout } = await exec('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    file,
  ]);
  const d = parseFloat(stdout.trim());
  if (!Number.isFinite(d) || d <= 0) throw new Error(`Could not read duration of ${file}`);
  return d;
}

const pad = (n) => String(n).padStart(2, '0');

async function fromVideo() {
  const duration = await durationOf(video);
  console.log(`Video ${path.basename(video)} — ${duration.toFixed(2)}s, sampling ${count} frames\n`);

  for (let i = 0; i < count; i++) {
    // Sample across the revolution without landing on the final black frame.
    const t = (i * duration) / count;
    const out = path.join(OUT, `frame-${pad(i + 1)}.webp`);
    await exec('ffmpeg', [
      '-hide_banner', '-loglevel', 'error', '-y',
      '-ss', t.toFixed(3),
      '-i', video,
      '-frames:v', '1',
      '-vf', `scale=${width}:-2`,
      '-quality', String(quality),
      out,
    ]);
    process.stdout.write(`  frame-${pad(i + 1)}.webp  (t=${t.toFixed(2)}s)\n`);
  }
}

async function fromImages() {
  const entries = (await fs.readdir(imagesDir))
    .filter((f) => /\.(jpe?g|png|webp|tiff?)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  if (entries.length === 0) usage(`No images found in ${imagesDir}`);
  console.log(`Found ${entries.length} stills, resampling to ${count} frames\n`);

  for (let i = 0; i < count; i++) {
    // Even sampling, so 18 photos still produce a clean 12-frame set.
    const pick = entries[Math.round((i * entries.length) / count) % entries.length];
    const out = path.join(OUT, `frame-${pad(i + 1)}.webp`);
    await exec('cwebp', [
      '-quiet', '-q', String(quality),
      '-resize', String(width), '0',
      path.join(imagesDir, pick),
      '-o', out,
    ]);
    process.stdout.write(`  frame-${pad(i + 1)}.webp  ← ${pick}\n`);
  }
}

async function main() {
  if (video) await requireTool('ffmpeg', 'brew install ffmpeg');
  if (imagesDir) await requireTool('cwebp', 'brew install webp');

  await fs.mkdir(OUT, { recursive: true });
  if (video) await fromVideo();
  else await fromImages();

  const files = await fs.readdir(OUT);
  console.log(`\n${files.length} frames written to ${path.relative(ROOT, OUT)}`);
  console.log(`\nThe viewer picks these up automatically for slug "${slug}".`);
  console.log(`Make sure the vehicle's \`slug\` field in shared/data/mockData.js is "${slug}".`);
}

main().catch((err) => {
  console.error(`\n${err.message}`);
  process.exit(1);
});
