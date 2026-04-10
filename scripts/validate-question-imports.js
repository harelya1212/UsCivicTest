#!/usr/bin/env node

/**
 * Sprint 1 data guardrail:
 * - only allow import from app/civics-questions-2026-02-06.csv
 * - block known placeholder dataset app/questions_ff_ready.csv
 * - require core columns and reject placeholder-like content
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const projectRoot = path.join(__dirname, '..');
const allowedCsv = path.join(projectRoot, 'app', 'civics-questions-2026-02-06.csv');
const blockedCsv = path.join(projectRoot, 'app', 'questions_ff_ready.csv');

const requiredHeaders = [
  'USCIS ID',
  'Question',
  'Official Answer',
  'Visual Memory Hook URL',
  'Why This Answer?',
  'Topic',
  'Sub-Topic',
];

function parseCSVLine(line) {
  const result = [];
  let inQuote = false;
  let cur = '';
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuote && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else {
        inQuote = !inQuote;
      }
    } else if (ch === ',' && !inQuote) {
      result.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result.map(v => v.trim());
}

function hasPlaceholderText(value) {
  const text = String(value || '').toLowerCase();
  if (!text) return false;
  return (
    text.includes('placeholder') ||
    text.includes('lorem ipsum') ||
    text.includes('sample answer') ||
    text.includes('sample question') ||
    text.includes('todo') ||
    text.includes('tbd')
  );
}

function validateAllowedCsv() {
  if (!fs.existsSync(allowedCsv)) {
    throw new Error(`Missing allowed source CSV: ${path.relative(projectRoot, allowedCsv)}`);
  }

  const raw = fs.readFileSync(allowedCsv, 'utf8').trim();
  const lines = raw.split('\n');
  if (lines.length < 2) {
    throw new Error('Allowed CSV has no data rows.');
  }

  const headers = parseCSVLine(lines[0]);
  const missing = requiredHeaders.filter(h => !headers.includes(h));
  if (missing.length) {
    throw new Error(`Allowed CSV missing required columns: ${missing.join(', ')}`);
  }

  const idxQuestion = headers.indexOf('Question');
  const idxOfficial = headers.indexOf('Official Answer');
  const idxWhy = headers.indexOf('Why This Answer?');

  let placeholderHits = 0;
  for (const line of lines.slice(1)) {
    const row = parseCSVLine(line);
    const valuesToCheck = [row[idxQuestion], row[idxOfficial], row[idxWhy]];
    if (valuesToCheck.some(hasPlaceholderText)) {
      placeholderHits += 1;
    }
  }

  if (placeholderHits > 0) {
    throw new Error(`Allowed CSV includes ${placeholderHits} placeholder-like rows; import blocked.`);
  }
}

function validateBlockedCsv() {
  if (!fs.existsSync(blockedCsv)) {
    return;
  }

  const raw = fs.readFileSync(blockedCsv, 'utf8').trim();
  const lines = raw.split('\n');
  if (lines.length <= 1) {
    return;
  }

  const headers = parseCSVLine(lines[0]);
  const idxQuestion = headers.indexOf('Question');
  const idxOfficial = headers.indexOf('Official Answer');
  const idxWhy = headers.indexOf('Why This Answer?');

  const rows = lines.slice(1);
  const placeholderRows = rows.filter(line => {
    const row = parseCSVLine(line);
    const q = idxQuestion >= 0 ? row[idxQuestion] : '';
    const a = idxOfficial >= 0 ? row[idxOfficial] : '';
    const w = idxWhy >= 0 ? row[idxWhy] : '';
    return [q, a, w].some(hasPlaceholderText);
  }).length;

  if (placeholderRows === 0) {
    console.warn('Warning: blocked CSV currently has no obvious placeholder markers. Keep policy in place until manually approved.');
  }

  console.log(`Blocked CSV policy active for ${path.relative(projectRoot, blockedCsv)} (${placeholderRows} placeholder-like rows detected).`);
}

try {
  validateAllowedCsv();
  validateBlockedCsv();
  console.log('Question import guardrails passed.');
} catch (error) {
  console.error(`Question import guardrails failed: ${error.message}`);
  process.exit(1);
}
