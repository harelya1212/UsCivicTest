/**
 * highschool-civics pack - Arizona high-school civics graduation test.
 *
 * Per Arizona State Board of Education rule R7-2-302, the high-school
 * civics assessment is "identical to the civics portion of the
 * naturalization test used by USCIS" - i.e. the official 2008 100-question
 * set. This pack reuses the verified civics-100 questions (with curated
 * distractors, explanations, images and mnemonics) under high-school
 * assessment metadata.
 *
 * Assessment metadata (Arizona):
 * - Class of 2026 and later: 100 questions, pass at 70/100 (70%).
 * - This differs from naturalization (2008): up to 10 questions, pass at 6/10.
 * The quiz engine should use these thresholds when testType is 'highschool'.
 *
 * Source: USCIS "100 Civics Questions and Answers" (rev. 01/19),
 * https://www.uscis.gov/sites/default/files/document/questions-and-answers/100q.txt
 * U.S. federal government work - public domain.
 * Arizona rule: https://dev-az2-sbe.pantheonsite.io/sites/default/files/2023-08/R7-2-302%2520Civics%2520Test_0.pdf
 */
import { civics100Pack } from './civics100.pack.js';
import { createPack } from './packSchema.js';

export const highschoolPack = createPack({
  id: 'highschool-civics',
  testType: 'highschool',
  title: 'Arizona High School Civics Test',
  version: '2008.1-az1',
  source: 'USCIS (via Arizona State Board of Education R7-2-302)',
  sourceUrl: 'https://www.uscis.gov/sites/default/files/document/questions-and-answers/100q.txt',
  updatedAt: '2026-10-16',
  dynamicAnswerKinds: ['us-officeholder', 'state-officeholder', 'state-capital'],
  freshnessCheckDays: 90,
  questions: civics100Pack.questions,
});

// Arizona assessment metadata (not part of the pack schema, consumed by quiz logic)
export const HIGHSCHOOL_ASSESSMENT = {
  requiredQuestions: 100,
  passingScore: 70,
  passingPercent: 70,
  appliesTo: 'Arizona class of 2026 and later',
  rule: 'R7-2-302',
};
