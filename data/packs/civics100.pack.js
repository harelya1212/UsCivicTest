/**
 * civics-100 pack - Official 2008 USCIS 100 civics questions.
 *
 * The 100-question bank for N-400 applications filed before Oct 20, 2025,
 * and the basis of state high-school civics graduation tests (e.g. Arizona:
 * "100 questions on a civics test identical to the civics portion of the
 * naturalization test used by USCIS").
 *
 * Source: USCIS "100 Civics Questions and Answers" (rev. 01/19),
 * https://www.uscis.gov/sites/default/files/document/questions-and-answers/100q.txt
 * U.S. federal government work - public domain.
 * Verified 2026-10-16. Includes the official 65/20 special-consideration
 * flags (is_65_20) per USCIS 65-20q.txt.
 *
 * App-layer enrichment (curated distractors + explanations) lives in
 * civics100.enrichment.js and is merged below, keeping the verbatim
 * USCIS data file pristine.
 */
import { CIVICS_100_QUESTIONS } from './civics100.questions.js';
import { CIVICS_100_ENRICHMENT } from './civics100.enrichment.js';
import { CIVICS_100_IMAGES } from './civics100.images.js';
import { CIVICS_100_MNEMONICS } from './civics100.mnemonics.js';
import { createPack } from './packSchema.js';

const enrichedQuestions = CIVICS_100_QUESTIONS.map((q) => {
  const enrichment = CIVICS_100_ENRICHMENT[q.id];
  const imageUrl = CIVICS_100_IMAGES[q.id] || null;
  const mnemonic = CIVICS_100_MNEMONICS[q.id] || null;
  if (!enrichment && !imageUrl && !mnemonic) return q;
  return {
    ...q,
    ...(imageUrl ? { imageUrl } : {}),
    ...(mnemonic ? { mnemonic } : {}),
    ...(enrichment
      ? {
          wrongAnswers: {
            easy: [...enrichment.distractors],
            medium: [...enrichment.distractors],
            hard: [...enrichment.distractors],
          },
          whyThisAnswer: enrichment.why,
        }
      : {}),
  };
});

export const civics100Pack = createPack({
  id: 'civics-100',
  testType: 'naturalization100',
  title: 'USCIS Civics Test (2008) - 100 Questions',
  version: '2008.1',
  source: 'USCIS',
  sourceUrl: 'https://www.uscis.gov/sites/default/files/document/questions-and-answers/100q.txt',
  updatedAt: '2026-10-16',
  dynamicAnswerKinds: ['us-officeholder', 'state-officeholder', 'state-capital'],
  freshnessCheckDays: 90,
  questions: enrichedQuestions,
});
