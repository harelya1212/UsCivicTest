// Quiz Helper Utilities for ADHD-Friendly Interaction
// Generates plausible wrong answers and manages quiz progression

import { CIVICS_QUESTION_BANK } from './civicsQuestionBank.js';
import { getDynamicCivicsAnswer, STATE_CAPITALS } from './civicsDynamicData.js';

/**
 * Generates plausible wrong answers (distractors) based on question category
 * These are common misconceptions and related concepts that test understanding
 */
const DISTRACTOR_TEMPLATES = {
  'Government Structure': [
    'The President alone',
    'The Senate',
    'The House of Representatives',
    'The Supreme Court',
    'Congress',
    'The Cabinet',
  ],
  'Rights and Freedoms': [
    'Freedom from taxes',
    'Freedom from physical labor',
    'The right to own weapons',
    'Freedom of movement',
    'Freedom from external judgment',
  ],
  'Constitutional': [
    'The Declaration of Independence',
    'The Bill of Rights',
    'The Magna Carta',
    'The Federalist Papers',
    'State Constitutions',
  ],
  'Historical': [
    'The Revolutionary War',
    'War of 1812',
    'Civil War',
    'World War II',
    'The Cold War',
  ],
  'Geography': [
    'New York',
    'Los Angeles',
    'Chicago',
    'Boston',
    'Atlanta',
    'San Francisco',
  ],
  'Civic Process': [
    'To make money',
    'To be famous',
    'To travel freely',
    'To avoid taxes',
    'To gain business advantages',
  ],
  'Number': [
    'Two',
    'Five',
    'Ten',
    'Fifty',
    'One hundred',
  ]
};

const GLOBAL_FALLBACK_DISTRACTORS = [
  'The President',
  'Congress',
  'The Supreme Court',
  'The Constitution',
  'The Bill of Rights',
  'One hundred (100)',
  'Two (2)',
  'Four (4) years',
  'Washington, D.C.',
  'New York',
  'The Senate',
  'The House of Representatives'
];

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function shuffleArray(values) {
  const arr = [...values];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function uniqueByNormalized(values) {
  const seen = new Set();
  const unique = [];

  for (const value of values) {
    const key = normalizeText(value);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(value);
  }

  return unique;
}

function normalizeForMatch(value) {
  return normalizeText(value).replace(/[^a-z0-9]+/g, ' ').trim();
}

function inferTopicKey(question, answer = '') {
  const text = `${normalizeForMatch(question)} ${normalizeForMatch(answer)}`;

  if (text.includes('constitution') || text.includes('amendment') || text.includes('bill of rights') || text.includes('supreme law')) return 'constitutional';
  if (text.includes('branch') || text.includes('congress') || text.includes('senate') || text.includes('house of representatives') || text.includes('legislative')) return 'government';
  if (text.includes('president') || text.includes('vice president') || text.includes('cabinet') || text.includes('commander in chief') || text.includes('executive')) return 'executive';
  if (text.includes('supreme court') || text.includes('judicial') || text.includes('judge') || text.includes('court')) return 'judicial';
  if (text.includes('vote') || text.includes('election') || text.includes('electoral') || text.includes('party') || text.includes('democracy')) return 'elections';
  if (text.includes('capital') || text.includes('state') || text.includes('ocean') || text.includes('river') || text.includes('territory') || text.includes('border')) return 'geography';
  if (text.includes('how many') || text.includes('number') || text.includes('year') || text.includes('term') || text.includes('age') || text.includes('twenty') || text.includes('hundred')) return 'numbers';
  if (text.includes('independence') || text.includes('war') || text.includes('civil rights') || text.includes('slavery') || text.includes('revolution') || text.includes('cold war')) return 'history';
  if (text.includes('flag') || text.includes('anthem') || text.includes('holiday') || text.includes('july 4') || text.includes('memorial day') || text.includes('veterans day')) return 'symbols';
  if (text.includes('citizen') || text.includes('right') || text.includes('freedom') || text.includes('responsibility') || text.includes('oath')) return 'citizenship';
  if (text.includes('capitalism') || text.includes('economic')) return 'economy';

  return 'general';
}

const TOPIC_TO_TEMPLATE = {
  constitutional: 'Constitutional',
  government: 'Government Structure',
  executive: 'Government Structure',
  judicial: 'Government Structure',
  elections: 'Civic Process',
  geography: 'Geography',
  numbers: 'Number',
  history: 'Historical',
  symbols: 'Historical',
  citizenship: 'Rights and Freedoms',
  economy: 'Civic Process',
  general: 'Government Structure',
};

const ALL_OFFICIAL_QUESTIONS = [
  ...CIVICS_QUESTION_BANK.naturalization128,
  ...CIVICS_QUESTION_BANK.naturalization100,
  ...CIVICS_QUESTION_BANK.highschool,
];

const OFFICIAL_DISTRACTOR_POOLS = ALL_OFFICIAL_QUESTIONS.reduce((acc, item) => {
  const topicKey = inferTopicKey(item.question, item.correctAnswer);
  if (!acc[topicKey]) acc[topicKey] = [];

  const candidates = [item.correctAnswer, ...(item.alternateAnswers || [])]
    .filter(Boolean)
    .map((entry) => String(entry).trim())
    .filter((entry) => entry.length <= 90);

  acc[topicKey].push(...candidates);
  return acc;
}, {});

const GEOGRAPHY_CAPITALS = Object.values(STATE_CAPITALS);

/**
 * Categorizes a question to help generate relevant distractors
 */
function getCategoryType(question) {
  const topicKey = inferTopicKey(question);
  return TOPIC_TO_TEMPLATE[topicKey] || 'Government Structure';
}

/**
 * Generates plausible wrong answers for a question
 * Creates 3 distractors: easy, medium, hard difficulty levels
 */
export function generateWrongAnswers(question, correctAnswer, alternateAnswers = []) {
  const topicKey = inferTopicKey(question, correctAnswer);
  const categoryType = getCategoryType(question);
  const templates = DISTRACTOR_TEMPLATES[categoryType] || DISTRACTOR_TEMPLATES['Government Structure'];
  const officialTopicPool = OFFICIAL_DISTRACTOR_POOLS[topicKey] || [];
  const excluded = new Set([
    normalizeText(correctAnswer),
    ...alternateAnswers.map(normalizeText)
  ]);
  
  // Build a broad candidate pool so each difficulty can still produce 3 wrong answers.
  const allTemplateValues = Object.values(DISTRACTOR_TEMPLATES).flat();
  const candidatePool = uniqueByNormalized([
    ...shuffleArray(officialTopicPool),
    ...templates,
    ...shuffleArray(templates),
    ...(topicKey === 'geography' ? GEOGRAPHY_CAPITALS : []),
    ...allTemplateValues,
    ...GLOBAL_FALLBACK_DISTRACTORS,
  ]).filter((item) => !excluded.has(normalizeText(item)));

  // Guarantee 9 values total (3 for each difficulty bucket).
  const filled = [...candidatePool];
  for (const fallback of GLOBAL_FALLBACK_DISTRACTORS) {
    if (filled.length >= 9) break;
    const key = normalizeText(fallback);
    if (excluded.has(key)) continue;
    if (!filled.some((item) => normalizeText(item) === key)) {
      filled.push(fallback);
    }
  }

  while (filled.length < 9) {
    filled.push(`Option ${filled.length + 1}`);
  }

  return {
    easy: filled.slice(0, 3),
    medium: filled.slice(3, 6),
    hard: filled.slice(6, 9)
  };
}

/**
 * Generates a quiz question with 4 options (1 correct, 3 wrong)
 * Includes difficulty progression for distractors
 */
export function generateQuizQuestion(questionData, difficulty = 'easy', context = {}) {
  const baseCorrectAnswer = questionData.correctAnswer || questionData.answer || '';
  const resolvedCorrectAnswer = getDynamicCivicsAnswer(
    questionData.question,
    baseCorrectAnswer,
    context
  );
  const alternateAnswers = uniqueByNormalized(
    [
      ...(Array.isArray(questionData.alternateAnswers) ? questionData.alternateAnswers : []),
      baseCorrectAnswer,
    ].filter(Boolean)
  ).filter((entry) => normalizeText(entry) !== normalizeText(resolvedCorrectAnswer));

  const wrongAnswers = generateWrongAnswers(
    questionData.question,
    resolvedCorrectAnswer,
    alternateAnswers
  );

  // Build a unique wrong-answer pool across all difficulty levels, then pick 3.
  const wrongPool = uniqueByNormalized([
    ...(wrongAnswers[difficulty] || []),
    ...wrongAnswers.easy,
    ...wrongAnswers.medium,
    ...wrongAnswers.hard,
    ...GLOBAL_FALLBACK_DISTRACTORS,
  ]).filter((option) => {
    const normalizedOption = normalizeText(option);
    if (normalizedOption === normalizeText(resolvedCorrectAnswer)) return false;
    return !alternateAnswers.some((alt) => normalizeText(alt) === normalizedOption);
  });

  const selectedWrong = shuffleArray(wrongPool).slice(0, 3);

  // Safety net: never return fewer than 4 options.
  while (selectedWrong.length < 3) {
    const filler = `Option ${selectedWrong.length + 1}`;
    if (normalizeText(filler) !== normalizeText(resolvedCorrectAnswer)) {
      selectedWrong.push(filler);
    }
  }

  const shuffledOptions = shuffleArray([resolvedCorrectAnswer, ...selectedWrong]);
  
  return {
    ...questionData,
    options: shuffledOptions,
    answer: resolvedCorrectAnswer,
    correctAnswer: resolvedCorrectAnswer,
    dynamicAnswerResolved: normalizeText(resolvedCorrectAnswer) !== normalizeText(baseCorrectAnswer),
    difficulty: difficulty,
    wrongAnswerDifficulty: difficulty
  };
}

/**
 * Returns a relevant image URL for the question/answer.
 * All images are from Wikimedia Commons (public domain / free to use).
 */
export function getVisualImage(question, answer) {
  const q = (question + ' ' + answer).toLowerCase();

  // U.S. Constitution / supreme law
  if (q.includes('constitution') || q.includes('supreme law') || q.includes('amendment') || q.includes('bill of rights'))
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Constitution_of_the_United_States%2C_page_1.jpg/480px-Constitution_of_the_United_States%2C_page_1.jpg';

  // Declaration of Independence
  if (q.includes('declaration') || q.includes('independence') || q.includes('britain') || q.includes('british'))
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/US_Declaration_of_Independence_rotunda.jpg/480px-US_Declaration_of_Independence_rotunda.jpg';

  // President / White House / Executive branch
  if (q.includes('president') || q.includes('white house') || q.includes('executive'))
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/White_House_-_2006_-_during_snow.JPG/480px-White_House_-_2006_-_during_snow.JPG';

  // Congress / Capitol / Legislative
  if (q.includes('congress') || q.includes('senate') || q.includes('representative') || q.includes('legislative') || q.includes('capitol'))
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/US_Capitol_Building_at_night_Jan_2006.jpg/480px-US_Capitol_Building_at_night_Jan_2006.jpg';

  // Supreme Court / Judicial
  if (q.includes('supreme court') || q.includes('judicial') || q.includes('judge'))
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/US_Supreme_Court_Building.jpg/480px-US_Supreme_Court_Building.jpg';

  // Abraham Lincoln / Civil War
  if (q.includes('lincoln') || q.includes('civil war') || q.includes('slavery') || q.includes('emancipation'))
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Abraham_Lincoln_O-77_matte_collodion_print.jpg/480px-Abraham_Lincoln_O-77_matte_collodion_print.jpg';

  // George Washington
  if (q.includes('washington') || q.includes('first president'))
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Gilbert_Stuart_Williamstown_Portrait_of_George_Washington.jpg/480px-Gilbert_Stuart_Williamstown_Portrait_of_George_Washington.jpg';

  // Martin Luther King / Civil Rights
  if (q.includes('martin luther king') || q.includes('mlk') || q.includes('civil rights'))
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Martin_Luther_King%2C_Jr..jpg/480px-Martin_Luther_King%2C_Jr..jpg';

  // Statue of Liberty / Immigration / Freedom
  if (q.includes('statue of liberty') || q.includes('immigration') || q.includes('freedom') || q.includes('liberty'))
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Statue_of_Liberty_7.jpg/480px-Statue_of_Liberty_7.jpg';

  // U.S. Flag / National Anthem
  if (q.includes('flag') || q.includes('anthem') || q.includes('star-spangled') || q.includes('stripes'))
    return 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/Flag_of_the_United_States.svg/480px-Flag_of_the_United_States.svg.png';

  // Voting / Elections / Democracy
  if (q.includes('vot') || q.includes('elect') || q.includes('ballot') || q.includes('democrat'))
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Ballot_box_using_hand.jpg/480px-Ballot_box_using_hand.jpg';

  // World War I or II
  if (q.includes('world war') || q.includes('wwi') || q.includes('wwii') || q.includes('war ii') || q.includes('war i '))
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Raising_the_Flag_on_Iwo_Jima%2C_larger_-_edit2.jpg/480px-Raising_the_Flag_on_Iwo_Jima%2C_larger_-_edit2.jpg';

  // Native Americans / American Indians
  if (q.includes('native') || q.includes('american indian') || q.includes('indigenous'))
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/CrowFairMontana.jpg/480px-CrowFairMontana.jpg';

  // 13 colonies
  if (q.includes('coloni') || q.includes('thirteen') || q.includes('13'))
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/United_States_of_America_-_Consolidation_Map.png/480px-United_States_of_America_-_Consolidation_Map.png';

  // Washington D.C. geography
  if (q.includes('washington, d.c.') || q.includes('capital city') || q.includes('district of columbia'))
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/US_Capitol_east_side.JPG/480px-US_Capitol_east_side.JPG';

  // Republic / government form
  if (q.includes('republic') || q.includes('form of government') || q.includes('self-government'))
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/US_Capitol_Building_at_night_Jan_2006.jpg/480px-US_Capitol_Building_at_night_Jan_2006.jpg';

  // Default: American flag
  return 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/Flag_of_the_United_States.svg/480px-Flag_of_the_United_States.svg.png';
}

/**
 * Calculates performance for adaptive difficulty
 */
export function calculatePerformance(history) {
  if (history.length === 0) return 50;
  const recent = history.slice(-10); // Last 10 answers
  const correct = recent.filter(h => h.correct).length;
  return Math.round((correct / recent.length) * 100);
}

/**
 * Gets next difficulty level based on performance
 */
export function getAdaptiveDifficulty(currentDifficulty, performance) {
  if (performance >= 80) {
    // Doing well - increase difficulty
    switch (currentDifficulty) {
      case 'easy': return 'medium';
      case 'medium': return 'hard';
      case 'hard': return 'hard';
      default: return 'easy';
    }
  } else if (performance <= 50) {
    // Struggling - decrease difficulty
    switch (currentDifficulty) {
      case 'easy': return 'easy';
      case 'medium': return 'easy';
      case 'hard': return 'medium';
      default: return 'easy';
    }
  }
  // Performance 51-79% - keep current difficulty
  return currentDifficulty;
}

/**
 * Validates if answer is correct (handles alternates)
 */
export function isAnswerCorrect(selectedAnswer, question) {
  const selected = selectedAnswer.trim().toLowerCase();
  const correct = question.correctAnswer.trim().toLowerCase();
  
  // Check exact match
  if (selected === correct) return true;
  
  // Check alternate answers
  if (question.alternateAnswers && Array.isArray(question.alternateAnswers)) {
    return question.alternateAnswers.some(alt => 
      alt.trim().toLowerCase() === selected
    );
  }
  
  return false;
}

/**
 * Picks a random question from a question set
 */
export function getRandomQuestion(questionSet) {
  const randomIndex = Math.floor(Math.random() * questionSet.length);
  return questionSet[randomIndex];
}

/**
 * Gets a question bank by type
 */
export function getQuestionBank(type) {
  const banks = {
    'highschool': CIVICS_QUESTION_BANK.highschool,
    'naturalization100': CIVICS_QUESTION_BANK.naturalization100,
    'naturalization128': CIVICS_QUESTION_BANK.naturalization128,
  };
  
  return banks[type] || banks.naturalization128;
}
