/**
 * civics-128 pack - USCIS Civics Test (2025), 128 questions.
 *
 * The full official 128-question bank with enrichments
 * (alternate answers, topics, images, leveled wrong answers).
 * Answers marked as dynamic (officeholders, capitals) change over time -
 * see dynamicAnswerKinds + freshnessCheckDays.
 */
import { CIVICS_QUESTION_BANK } from '../../civicsQuestionBank.js';
import { createPack } from './packSchema.js';

export const civics128Pack = createPack({
  id: 'civics-128',
  testType: 'naturalization128',
  title: 'USCIS Civics Test (2025) - 128 Questions',
  version: '2025.1',
  source: 'USCIS',
  sourceUrl: 'https://www.uscis.gov/citizenship/civics-test-study-materials',
  updatedAt: '2026-02-06',
  dynamicAnswerKinds: ['us-officeholder', 'state-officeholder', 'state-capital'],
  freshnessCheckDays: 90,
  questions: CIVICS_QUESTION_BANK.naturalization128,
});
