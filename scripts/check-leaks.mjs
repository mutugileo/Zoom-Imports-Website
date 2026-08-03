#!/usr/bin/env node
/**
 * Guards the one rule the storefront must never break: the dealership's buying
 * position — what a car cost, what a part cost, what a car actually sold for —
 * may not reach the customer app.
 *
 *   node scripts/check-leaks.mjs
 *
 * costing.js has claimed since it was written that "a test asserts that". None
 * did. This is that test. It runs two ways, because either alone can be fooled:
 *
 *   1. Source: no file under website/src may import the internal modules.
 *      Catches the mistake at the moment someone makes it.
 *   2. Build: the shipped bundle may not contain the internal field names or
 *      storage keys. Catches it even if the value arrives by some route the
 *      import check cannot see — a re-export, a copied constant, a fixture.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Modules the customer app must never pull in. */
const FORBIDDEN_MODULES = ['lib/costing', 'lib/sales'];

/** Field names that only ever appear on an internal record. */
const FORBIDDEN_TOKENS = [
  'percentagePaid', 'agencyFees', 'deliveryOrder', 'ntsaCustoms', 'driverCharges',
  'costPrice', 'vehicle_costs', 'vehicle_sales', 'part_costs', 'order_costs',
];

const walk = async (dir, out = []) => {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, out);
    else if (/\.(jsx?|mjs)$/.test(entry.name)) out.push(full);
  }
  return out;
};

const failures = [];

/* ---- 1. source imports ---- */
const sources = await walk(path.join(ROOT, 'src'));
for (const file of sources) {
  const text = await fs.readFile(file, 'utf8');
  for (const mod of FORBIDDEN_MODULES) {
    if (new RegExp(`from\\s+['"][^'"]*${mod}`).test(text)) {
      failures.push(`${path.relative(ROOT, file)} imports ${mod} — internal only`);
    }
  }
}
console.log(`source: scanned ${sources.length} website files for forbidden imports`);

/* ---- 2. built bundle ---- */
const distDir = path.join(ROOT, 'dist/assets');
let bundles = [];
try {
  bundles = (await fs.readdir(distDir)).filter((f) => f.endsWith('.js'));
} catch {
  console.log('build: no website/dist — run `npm run build` first to check the bundle');
}

for (const file of bundles) {
  const text = await fs.readFile(path.join(distDir, file), 'utf8');
  for (const token of FORBIDDEN_TOKENS) {
    if (text.includes(token)) failures.push(`website bundle ${file} contains "${token}"`);
  }
}
if (bundles.length) {
  console.log(`build: scanned ${bundles.length} bundle(s) for ${FORBIDDEN_TOKENS.length} internal tokens`);
}

/* ---- verdict ---- */
if (failures.length) {
  console.error('\nLEAK — the buying position can reach the customer app:');
  for (const f of failures) console.error('  ✗ ' + f);
  process.exit(1);
}
console.log('\nOK — no cost, buy price or achieved sale price reaches the customer app.');
