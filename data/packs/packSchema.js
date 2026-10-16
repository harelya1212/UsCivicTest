/**
 * packSchema.js - Test Pack schema for the test-prep platform.
 *
 * A "pack" is a versioned, self-describing bundle of questions for one test
 * (e.g. USCIS 128-question civics test, a driving test, a high-school exam).
 * The quiz engine and UI consume packs through the registry in `./index.js`
 * and never reach into question-bank modules directly.
 *
 * Adding a new test = adding one `<id>.pack.js` file that calls createPack().
 * No engine or UI changes required.
 *
 * Pack shape:
 * {
 *   schemaVersion,      // pack schema version (currently 1)
 *   id,                 // stable pack id, e.g. 'civics-128'
 *   testType,           // legacy test-type key, e.g. 'naturalization128'
 *   title,              // human-readable title
 *   version,            // pack content version, e.g. '2025.1'
 *   source,             // e.g. 'USCIS'
 *   sourceUrl,          // where the questions came from
 *   updatedAt,          // ISO date the pack content was last verified
 *   provisional,        // true when the pack is a placeholder pending real content
 *   provisionalNote,    // explains what is provisional and what replaces it
 *   dynamicAnswerKinds,  // answer kinds that change over time and need
 *                       // periodic freshness checks, e.g. ['us-officeholder']
 *   freshnessCheckDays, // how often dynamic answers should be re-verified
 *   questions,          // array of question objects
 * }
 *
 * Question objects must at minimum carry: id, question, correctAnswer.
 * The civics packs additionally carry: alternateAnswers, category,
 * is_65_20, imageUrl, topic, subTopic, whyThisAnswer, wrongAnswers.
 */

export const PACK_SCHEMA_VERSION = 1;

export function createPack(def = {}) {
  return {
    schemaVersion: PACK_SCHEMA_VERSION,
    id: def.id,
    testType: def.testType || def.id,
    title: def.title || def.id,
    version: def.version || '1.0.0',
    source: def.source || '',
    sourceUrl: def.sourceUrl || '',
    updatedAt: def.updatedAt || null,
    provisional: Boolean(def.provisional),
    provisionalNote: def.provisionalNote || '',
    dynamicAnswerKinds: Array.isArray(def.dynamicAnswerKinds) ? def.dynamicAnswerKinds : [],
    freshnessCheckDays: Number.isFinite(def.freshnessCheckDays) ? def.freshnessCheckDays : 90,
    questions: Array.isArray(def.questions) ? def.questions : [],
  };
}

/**
 * Validates a pack. Returns { ok, errors[] }.
 * Run in CI / startup checks - never trust a pack blindly.
 */
export function validatePack(pack) {
  const errors = [];
  if (!pack || typeof pack !== 'object') {
    return { ok: false, errors: ['pack must be an object'] };
  }
  for (const field of ['id', 'title', 'questions']) {
    if (pack[field] == null || pack[field] === '') errors.push(`missing required field: ${field}`);
  }
  if (pack.schemaVersion !== PACK_SCHEMA_VERSION) {
    errors.push(`unsupported schemaVersion: ${pack.schemaVersion} (expected ${PACK_SCHEMA_VERSION})`);
  }
  if (!Array.isArray(pack.questions)) {
    errors.push('questions must be an array');
  } else if (pack.questions.length === 0) {
    errors.push('questions array is empty');
  } else {
    const seen = new Set();
    pack.questions.forEach((q, i) => {
      if (!q || typeof q !== 'object') {
        errors.push(`questions[${i}] is not an object`);
        return;
      }
      const qid = q.id != null ? String(q.id) : `index:${i}`;
      if (seen.has(qid)) errors.push(`duplicate question id: ${qid}`);
      seen.add(qid);
      if (!q.question) errors.push(`question ${qid} is missing text`);
      if (q.correctAnswer == null) errors.push(`question ${qid} is missing correctAnswer`);
    });
  }
  return { ok: errors.length === 0, errors };
}
