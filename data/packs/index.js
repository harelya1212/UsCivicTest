/**
 * Pack registry - the single entry point for question packs.
 *
 * The quiz engine and screens consume packs through getPack() /
 * getPackQuestions() / listPacks(). They accept either a pack id
 * ('civics-128') or a legacy test-type key ('naturalization128').
 *
 * Unknown ids fall back to the 128-question pack, matching the
 * historical behavior of quizHelpers.getQuestionBank().
 */
import { civics128Pack } from './civics128.pack.js';
import { civics100Pack } from './civics100.pack.js';
import { highschoolPack } from './highschool.pack.js';

const PACKS = [civics128Pack, civics100Pack, highschoolPack];

const BY_ID = Object.fromEntries(PACKS.map((p) => [p.id, p]));
const BY_TEST_TYPE = Object.fromEntries(PACKS.map((p) => [p.testType, p]));

const DEFAULT_PACK = civics128Pack;

export function listPacks() {
  return PACKS.map((p) => ({
    id: p.id,
    testType: p.testType,
    title: p.title,
    version: p.version,
    questionCount: p.questions.length,
    provisional: p.provisional,
    updatedAt: p.updatedAt,
    dynamicAnswerKinds: p.dynamicAnswerKinds,
    freshnessCheckDays: p.freshnessCheckDays,
  }));
}

export function getPack(idOrTestType) {
  return BY_ID[idOrTestType] || BY_TEST_TYPE[idOrTestType] || DEFAULT_PACK;
}

export function getPackQuestions(idOrTestType) {
  return getPack(idOrTestType).questions;
}
