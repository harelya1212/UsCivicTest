#!/usr/bin/env node
/**
 * Validates every registered question pack against the pack schema.
 * Usage: node scripts/validate-packs.mjs
 * Exit code 0 = all packs valid, 1 = any pack invalid.
 */
import { listPacks, getPack } from '../data/packs/index.js';
import { validatePack } from '../data/packs/packSchema.js';

let failed = false;
for (const summary of listPacks()) {
  const pack = getPack(summary.id);
  const { ok, errors } = validatePack(pack);
  if (ok) {
    console.log(
      `ok: ${pack.id} (${pack.questions.length} questions, v${pack.version}` +
        `${pack.provisional ? ', PROVISIONAL' : ''})`
    );
  } else {
    failed = true;
    console.error(`FAIL: ${pack.id}`);
    for (const e of errors) console.error(`  - ${e}`);
  }
}
if (failed) {
  console.error('pack validation failed');
  process.exit(1);
}
console.log('all packs valid');
