/**
 * highschool-civics pack - high-school level civics questions.
 */
import { CIVICS_QUESTION_BANK } from '../../civicsQuestionBank.js';
import { HIGHSCHOOL_MNEMONICS } from './highschool.mnemonics.js';
import { HIGHSCHOOL_IMAGES } from './highschool.images.js';
import { createPack } from './packSchema.js';

const enrichedQuestions = CIVICS_QUESTION_BANK.highschool.map((q) => {
  const mnemonic = HIGHSCHOOL_MNEMONICS[q.id];
  const imageUrl = HIGHSCHOOL_IMAGES[q.id] || null;
  if (!mnemonic && !imageUrl) return q;
  return {
    ...q,
    ...(mnemonic ? { mnemonic } : {}),
    ...(imageUrl ? { imageUrl } : {}),
  };
});

export const highschoolPack = createPack({
  id: 'highschool-civics',
  testType: 'highschool',
  title: 'High School Civics',
  version: '1.0.0',
  source: 'App question bank',
  updatedAt: '2026-02-06',
  dynamicAnswerKinds: [],
  freshnessCheckDays: 180,
  questions: enrichedQuestions,
});
