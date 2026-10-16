/**
 * highschool-civics pack - high-school level civics questions.
 */
import { CIVICS_QUESTION_BANK } from '../../civicsQuestionBank.js';
import { createPack } from './packSchema.js';

export const highschoolPack = createPack({
  id: 'highschool-civics',
  testType: 'highschool',
  title: 'High School Civics',
  version: '1.0.0',
  source: 'App question bank',
  updatedAt: '2026-02-06',
  dynamicAnswerKinds: [],
  freshnessCheckDays: 180,
  questions: CIVICS_QUESTION_BANK.highschool,
});
