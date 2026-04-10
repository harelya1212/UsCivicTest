#!/usr/bin/env node
/**
 * enriches civicsQuestionBank.js with imageUrl, topic, subTopic
 * from civics-questions-2026-02-06.csv and aligns answer wording
 * to the official 2026 USCIS text where the CSV is a better match.
 *
 * Run from civic-citizenship/:
 *   node scripts/enrich-question-bank.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ALLOWED_SOURCE_FILE = 'civics-questions-2026-02-06.csv';
const BLOCKED_SOURCE_FILE = 'questions_ff_ready.csv';

// ─── parse CSV ────────────────────────────────────────────────────────────────
// columns: USCIS ID,Question,Option A,Option B,Option C,Option D,
//          Correct Option,Official Answer,Visual Memory Hook URL,
//          Why This Answer?,Topic,Sub-Topic

function parseCSV(raw) {
  const lines = raw.trim().split('\n');
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map(line => {
    const vals = parseCSVLine(line);
    const row = {};
    headers.forEach((h, i) => { row[h.trim()] = (vals[i] || '').trim(); });
    return row;
  });
}

function parseCSVLine(line) {
  const result = [];
  let inQuote = false;
  let cur = '';
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
      else { inQuote = !inQuote; }
    } else if (ch === ',' && !inQuote) {
      result.push(cur); cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
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

function escapeJsString(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r?\n/g, ' ')
    .trim();
}

// ─── normalise text for fuzzy matching ───────────────────────────────────────
function norm(s) {
  return s.toLowerCase()
    .replace(/[""'']/g, '"') // smart quotes -> "
    .replace(/[–—]/g, '-')   // dashes
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── load CSV ─────────────────────────────────────────────────────────────────
const sourceArg = process.argv[2];
const resolvedSourcePath = sourceArg
  ? path.resolve(process.cwd(), sourceArg)
  : path.join(__dirname, `../app/${ALLOWED_SOURCE_FILE}`);

const sourceBasename = path.basename(resolvedSourcePath);
if (sourceBasename === BLOCKED_SOURCE_FILE) {
  throw new Error(`Blocked source file: ${BLOCKED_SOURCE_FILE}. Replace placeholders before import.`);
}

if (sourceBasename !== ALLOWED_SOURCE_FILE) {
  throw new Error(
    `Only ${ALLOWED_SOURCE_FILE} is allowed for enrichment. Received: ${sourceBasename}`
  );
}

const csvPath = resolvedSourcePath;
const csvRaw = fs.readFileSync(csvPath, 'utf8');
const csvRows = parseCSV(csvRaw);

const placeholderRowCount = csvRows.filter(row => {
  return hasPlaceholderText(row['Question'])
    || hasPlaceholderText(row['Official Answer'])
    || hasPlaceholderText(row['Why This Answer?']);
}).length;

if (placeholderRowCount > 0) {
  throw new Error(`Source CSV contains ${placeholderRowCount} placeholder-like rows; import aborted.`);
}

// Build two lookup maps:
//  1. by USCIS ID (integer)
//  2. by normalised question text (fallback)
const byId   = {};
const byText = {};

csvRows.forEach(row => {
  const id   = parseInt(row['USCIS ID'], 10);
  const qNorm = norm(row['Question'] || '');

  const enrichment = {
    uscisId:       id,
    officialQ:     row['Question'],
    officialA:     row['Official Answer'],
    whyThisAnswer: row['Why This Answer?'] || null,
    imageUrl:      row['Visual Memory Hook URL'] || null,
    topic:         row['Topic'] || null,
    subTopic:      row['Sub-Topic'] || null,
  };

  if (!isNaN(id)) byId[id] = enrichment;
  if (qNorm)      byText[qNorm] = enrichment;
});

console.log(`CSV loaded: ${csvRows.length} rows, ${Object.keys(byId).length} with numeric IDs`);

// ─── load current JS bank (as text for low-risk transformation) ───────────────
const bankPath = path.join(__dirname, '../civicsQuestionBank.js');
let bankText = fs.readFileSync(bankPath, 'utf8');

// ─── build enrichment map keyed by CIVICS_{NNN} ───────────────────────────────
// Sequential bank ID → USCIS ID mapping:
//   CIVICS_001–028  → USCIS 1–28
//   CIVICS_029–030  → no USCIS match (dynamic questions removed from 2026 test)
//   CIVICS_031–037  → USCIS 31–37
//   CIVICS_038–039  → no match
//   CIVICS_040–045  → USCIS 40–45
//   CIVICS_046–048  → no match
//   CIVICS_049–128  → USCIS 49–128

function getUscisId(seqNum) {
  if (seqNum <= 28) return seqNum;
  if (seqNum === 29 || seqNum === 30) return null;          // dynamic
  if (seqNum >= 31 && seqNum <= 37) return seqNum;
  if (seqNum === 38 || seqNum === 39) return null;           // dynamic
  if (seqNum >= 40 && seqNum <= 45) return seqNum;
  if (seqNum >= 46 && seqNum <= 48) return null;             // dynamic
  if (seqNum >= 49 && seqNum <= 128) return seqNum;
  return null;
}

// ─── fix: update specific question text to 2026 official wording ─────────────
// CIVICS_097 question is truncated in the bank
bankText = bankText.replace(
  `question: 'What amendment says all persons born or naturalized in the United States,'`,
  `question: 'What amendment says all persons born or naturalized in the United States are U.S. citizens?'`
);

// CIVICS_098: CSV says "With the 15th Amendment" – bank has "After the Civil War" as primary
// Keep bank answer, CSV answer is already an alternateAnswer

// ─── inject imageUrl / topic / subTopic / whyThisAnswer into each block ──────
// Strategy: find each block ending with `wrongAnswers: {` ... `}` and inject after is_65_20 line
// We'll do targeted injection per question using the id as anchor.

let matched = 0;
let noMatch = 0;

// Process each CIVICS id from 001 to 128
for (let seq = 1; seq <= 128; seq++) {
  const civicsId = `CIVICS_${String(seq).padStart(3, '0')}`;
  const uid = getUscisId(seq);
  const enrichment = uid ? byId[uid] : null;

  const imageUrl = enrichment?.imageUrl || null;
  const topic = enrichment?.topic || 'American Government';
  const subTopic = enrichment?.subTopic || 'System of Government';
  const whyThisAnswer = enrichment?.whyThisAnswer || null;

  if (enrichment) matched++; else noMatch++;

  // Build injection string
  const injection = `    imageUrl: ${imageUrl ? `'${escapeJsString(imageUrl)}'` : 'null'},\n    topic: '${escapeJsString(topic)}',\n    subTopic: '${escapeJsString(subTopic)}',\n    whyThisAnswer: ${whyThisAnswer ? `'${escapeJsString(whyThisAnswer)}'` : 'null'},\n`;

  // Find the anchor: "id: 'CIVICS_NNN'" followed (eventually) by "is_65_20: ..."
  // We inject the three new lines right after the is_65_20 line for this block.
  const idAnchor = `id: '${civicsId}'`;
  const idPos = bankText.indexOf(idAnchor);
  if (idPos === -1) {
    console.warn(`⚠️  Could not find ${civicsId} in bank text`);
    continue;
  }

  // From idPos, find the next "is_65_20:" and then the end of that line
  const searchFrom = idPos;
  const is65Pos = bankText.indexOf('is_65_20:', searchFrom);
  if (is65Pos === -1) continue;

  // Make sure this is65Pos is for THIS question (before the next id:)
  const nextIdPos = bankText.indexOf("id: 'CIVICS_", idPos + idAnchor.length);
  if (nextIdPos !== -1 && is65Pos > nextIdPos) {
    console.warn(`⚠️  is_65_20 for ${civicsId} found after next question`);
    continue;
  }

  // Find end of the is_65_20 line
  const eolPos = bankText.indexOf('\n', is65Pos);
  if (eolPos === -1) continue;

  // Check if imageUrl already injected and patch whyThisAnswer in-place.
  const nextLineStart = eolPos + 1;
  const nextLineEnd = bankText.indexOf('\n', nextLineStart);
  const nextLine = bankText.substring(nextLineStart, nextLineEnd);
  if (nextLine.includes('imageUrl:')) {
    const blockEndPos = bankText.indexOf('wrongAnswers:', idPos);
    if (blockEndPos === -1) {
      continue;
    }

    const blockText = bankText.substring(idPos, blockEndPos);
    const whyLine = `    whyThisAnswer: ${whyThisAnswer ? `'${escapeJsString(whyThisAnswer)}'` : 'null'},`;

    if (blockText.includes('whyThisAnswer:')) {
      const updatedBlock = blockText.replace(/\s{4}whyThisAnswer:\s.*?,\n/, `${whyLine}\n`);
      bankText = bankText.substring(0, idPos) + updatedBlock + bankText.substring(blockEndPos);
    } else if (blockText.includes('subTopic:')) {
      const updatedBlock = blockText.replace(/(\s{4}subTopic:\s.*?,\n)/, `$1${whyLine}\n`);
      bankText = bankText.substring(0, idPos) + updatedBlock + bankText.substring(blockEndPos);
    }

    continue;
  }

  // Inject after eolPos
  bankText = bankText.substring(0, eolPos + 1) + injection + bankText.substring(eolPos + 1);
}

console.log(`Matched: ${matched}, No match (dynamic): ${noMatch}`);

// ─── update specific answer wordings to match 2026 USCIS ─────────────────────

// CIVICS_006: bank "rights of Americans" → 2026 "rights of people in the United States"
bankText = bankText.replace(
  `id: 'CIVICS_006',\n    question: 'What does the Bill of Rights protect?',\n    correctAnswer: '(The basic) rights of Americans',`,
  `id: 'CIVICS_006',\n    question: 'What does the Bill of Rights protect?',\n    correctAnswer: '(The basic) rights of people in the United States',`
);

// CIVICS_031: bank "Citizens of their state" → 2026 "People of their state"
bankText = bankText.replace(
  `correctAnswer: 'Citizens of their state',\n    alternateAnswers: ["People of their state"],`,
  `correctAnswer: 'People of their state',\n    alternateAnswers: ["Citizens of their state"],`
);

// CIVICS_098: bank "After the Civil War" → 2026 "With the 15th Amendment"
bankText = bankText.replace(
  `correctAnswer: 'After the Civil War',\n    alternateAnswers: ["During Reconstruction","(With the) 15th Amendment","1870"],`,
  `correctAnswer: 'With the 15th Amendment',\n    alternateAnswers: ["After the Civil War","During Reconstruction","1870"],`
);

// ─── write updated file ───────────────────────────────────────────────────────
// Update the header comment
bankText = bankText.replace(
  '// Official 2025 USCIS 128 Civics Test Questions and Answers',
  '// Official 2026 USCIS 128 Civics Test Questions and Answers'
);
bankText = bankText.replace(
  '// Source: https://www.uscis.gov/citizenship/civics-test-study-materials',
  '// Source: https://www.uscis.gov/citizenship/civics-test-study-materials\n// Enriched with imageUrl + topic + subTopic from civics-questions-2026-02-06.csv'
);

fs.writeFileSync(bankPath, bankText, 'utf8');
console.log(`\n✅ Written to ${bankPath}`);
console.log(`   - 128 CIVICS questions now have imageUrl, topic, subTopic, whyThisAnswer fields`);
console.log(`   - ${matched} matched to CSV images, ${noMatch} dynamic (imageUrl: null)`);
