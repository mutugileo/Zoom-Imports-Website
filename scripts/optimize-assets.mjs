#!/usr/bin/env node
/**
 * Pulls every catalogue image local, encodes responsive WebP, and emits a
 * manifest with a blur placeholder for each one.
 *
 *   node scripts/optimize-assets.mjs            # fetch + encode everything
 *   node scripts/optimize-assets.mjs --force    # re-encode even if present
 *
 * Why: the catalogue currently hot-links Unsplash with ?w=500. That means no
 * control over uptime, no responsive sizes, no cache policy, and a visible
 * pop-in on every card. Local WebP plus a blur-up placeholder is most of the
 * difference between "wireframe with good bones" and something that feels
 * finished.
 *
 * Requires: cwebp (brew install webp)
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const exec = promisify(execFile);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const MEDIA = path.join(ROOT, 'public/media/catalogue');
const SOURCE = path.join(ROOT, '.asset-cache');
const MANIFEST = path.join(ROOT, 'src/data/imageManifest.json');

const WIDTHS = [480, 960, 1600];
const QUALITY = 80;
const PLACEHOLDER_WIDTH = 24;

// Cards and heroes both crop to landscape. Fetching the native portrait frame
// means encoding roughly twice the pixels that ever reach the screen, so ask
// the source for a 3:2 landscape crop up front.
const SOURCE_WIDTH = 2000;
const SOURCE_HEIGHT = 1333;

const force = process.argv.includes('--force');

const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

async function ensureTool() {
  try {
    await exec('cwebp', ['-version']);
  } catch {
    console.error('cwebp not found. Install it with:  brew install webp');
    process.exit(1);
  }
}

/** Collect { key, url } for every image referenced by the catalogue. */
async function collectImages() {
  const dataUrl = new URL('../shared/data/mockData.js', import.meta.url);
  const data = await import(dataUrl.href);
  const seen = new Map();

  const add = (url, hint) => {
    if (!url || !/^https?:\/\//.test(url)) return;
    const clean = url.split('?')[0];
    if (!seen.has(clean)) seen.set(clean, slugify(hint || path.basename(clean)));
  };

  for (const v of data.INITIAL_VEHICLES ?? []) add(v.img, `${v.make}-${v.name}-${v.year}`);
  for (const p of data.INITIAL_PARTS ?? []) add(p.img, `${p.brand}-${p.name}`);

  return [...seen.entries()].map(([url, key]) => ({ url, key }));
}

async function download(url, dest) {
  try {
    await fs.access(dest);
    if (!force) return true;
  } catch { /* not cached yet */ }

  // Ask Unsplash for a large landscape crop rather than the 500px thumbnail.
  const fetchUrl = url.includes('unsplash.com')
    ? `${url}?auto=format&fit=crop&crop=entropy&w=${SOURCE_WIDTH}&h=${SOURCE_HEIGHT}&q=88`
    : url;
  const res = await fetch(fetchUrl);
  if (!res.ok) {
    console.warn(`  ! ${res.status} ${url}`);
    return false;
  }
  await fs.writeFile(dest, Buffer.from(await res.arrayBuffer()));
  return true;
}

async function encode(src, key) {
  const outputs = {};
  for (const w of WIDTHS) {
    const out = path.join(MEDIA, `${key}-${w}.webp`);
    try {
      await fs.access(out);
      if (!force) { outputs[w] = `/media/catalogue/${key}-${w}.webp`; continue; }
    } catch { /* needs encoding */ }
    await exec('cwebp', ['-quiet', '-q', String(QUALITY), '-resize', String(w), '0', src, '-o', out]);
    outputs[w] = `/media/catalogue/${key}-${w}.webp`;
  }

  // Tiny blurred stand-in, inlined as a data URI so it paints instantly.
  const tmp = path.join(SOURCE, `${key}-tiny.webp`);
  await exec('cwebp', ['-quiet', '-q', '35', '-resize', String(PLACEHOLDER_WIDTH), '0', src, '-o', tmp]);
  const blur = `data:image/webp;base64,${(await fs.readFile(tmp)).toString('base64')}`;

  return { srcset: outputs, blur };
}

async function main() {
  await ensureTool();
  await fs.mkdir(MEDIA, { recursive: true });
  await fs.mkdir(SOURCE, { recursive: true });
  await fs.mkdir(path.dirname(MANIFEST), { recursive: true });

  const images = await collectImages();
  console.log(`Found ${images.length} catalogue images\n`);

  const manifest = {};
  let done = 0;
  let failed = 0;

  for (const { url, key } of images) {
    const cached = path.join(SOURCE, `${key}.jpg`);
    process.stdout.write(`  ${key} … `);
    const ok = await download(url, cached);
    if (!ok) { failed++; console.log('skipped'); continue; }
    try {
      manifest[url] = await encode(cached, key);
      done++;
      console.log('ok');
    } catch (err) {
      failed++;
      console.log(`failed (${err.message.split('\n')[0]})`);
    }
  }

  await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`\n${done} encoded, ${failed} skipped`);
  console.log(`Manifest: ${path.relative(ROOT, MANIFEST)}`);
  console.log('The <Img> component reads this automatically — no code changes needed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
