// Quiz Helper Utilities for ADHD-Friendly Interaction
// Generates plausible wrong answers and manages quiz progression

import { listPacks, getPackQuestions } from './data/packs/index.js';
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

export function shuffleArray(values) {
  const arr = [...values];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Display a dynamic question with the user's actual state name instead of
 * "your state", so a wrong saved state is immediately visible.
 * "Who is the governor of your state now?" + Arizona ->
 * "Who is the governor of Arizona now?"
 * If no state is set, returns the question unchanged.
 */
export function displayQuestionWithState(questionText, userState) {
  const q = String(questionText || '');
  const state = String(userState || '').trim();
  if (!q || !state) return q;
  return q.replace(/your state/gi, state);
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

/**
 * Strips parenthetical qualifiers and leading articles so that
 * "(U.S.) Constitution" and "The Constitution" compare as equal.
 * Prevents near-duplicate options from appearing in the quiz.
 */
function stripQualifiers(value) {
  return normalizeText(value)
    .replace(/\(.*?\)/g, '')          // remove (parenthetical) chunks
    .replace(/^(the|a|an)\s+/g, '')  // strip leading articles
    .replace(/\s+/g, ' ')
    .trim();
}

function isTooSimilar(candidate, reference) {
  const cStripped = stripQualifiers(candidate);
  const rStripped = stripQualifiers(reference);
  if (!cStripped || !rStripped) return false;
  // Exact match after stripping
  if (cStripped === rStripped) return true;
  // One is a substring of the other (e.g. "constitution" inside "u.s. constitution")
  if (cStripped.includes(rStripped) || rStripped.includes(cStripped)) return true;
  return false;
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

const ALL_OFFICIAL_QUESTIONS = listPacks().flatMap((pack) => getPackQuestions(pack.id));

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
export function generateWrongAnswers(question, correctAnswer, alternateAnswers = [], presetWrongAnswers = null) {
  const topicKey = inferTopicKey(question, correctAnswer);
  const categoryType = getCategoryType(question);
  const templates = DISTRACTOR_TEMPLATES[categoryType] || DISTRACTOR_TEMPLATES['Government Structure'];
  const officialTopicPool = OFFICIAL_DISTRACTOR_POOLS[topicKey] || [];
  const excluded = new Set([
    normalizeText(correctAnswer),
    ...alternateAnswers.map(normalizeText)
  ]);
  // All reference answers we must not closely resemble
  const allCorrect = [correctAnswer, ...alternateAnswers];

  // Curated per-question distractors take priority when the pack provides them.
  const presetPool = [];
  if (presetWrongAnswers) {
    const buckets = Array.isArray(presetWrongAnswers)
      ? presetWrongAnswers
      : [
          ...(presetWrongAnswers.easy || []),
          ...(presetWrongAnswers.medium || []),
          ...(presetWrongAnswers.hard || []),
        ];
    presetPool.push(...buckets);
  }

  // Build a broad candidate pool so each difficulty can still produce 3 wrong answers.
  const allTemplateValues = Object.values(DISTRACTOR_TEMPLATES).flat();
  const candidatePool = uniqueByNormalized([
    ...presetPool,
    ...shuffleArray(officialTopicPool),
    ...templates,
    ...shuffleArray(templates),
    ...(topicKey === 'geography' ? GEOGRAPHY_CAPITALS : []),
    ...allTemplateValues,
    ...GLOBAL_FALLBACK_DISTRACTORS,
  ]).filter((item) => {
    if (excluded.has(normalizeText(item))) return false;
    // Reject candidates that look the same after stripping parens/articles
    if (allCorrect.some((ref) => isTooSimilar(item, ref))) return false;
    return true;
  });

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
  // Rephrase "name two / what are two" questions for single-select format
  let displayQuestion = questionData.question || '';
  const twoPattern = /^(what are (the )?two|name two)/i;
  if (twoPattern.test(displayQuestion)) {
    displayQuestion = displayQuestion.replace(twoPattern, (m) => {
      if (/^name two/i.test(m)) return 'Which one of these is a correct answer to: name two';
      return 'Which one of these is a correct answer to: ' + m.toLowerCase();
    });
    // Clean up: "Which one of these is a correct answer to: what are the two parts..."
    // -> better as "Which of these is one of the two parts..."
    displayQuestion = displayQuestion
      .replace('Which one of these is a correct answer to: what are the two', 'Choose one of the two:')
      .replace('Which one of these is a correct answer to: what are two', 'Choose one of the two:')
      .replace('Which one of these is a correct answer to: name two', 'Choose one of the two:');
  }
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
    alternateAnswers,
    questionData.wrongAnswers
  );

  const allAccepted = [resolvedCorrectAnswer, ...alternateAnswers];

  const isValidDistractor = (option) => {
    // Exact match
    if (normalizeText(option) === normalizeText(resolvedCorrectAnswer)) return false;
    // Exact match with any alternate
    if (alternateAnswers.some((alt) => normalizeText(alt) === normalizeText(option))) return false;
    // Fuzzy match — strip parens/articles before comparing
    if (allAccepted.some((ref) => isTooSimilar(option, ref))) return false;
    return true;
  };

  // Pack-provided curated distractors always win at EVERY difficulty.
  // (generateWrongAnswers puts presets only in the easy bucket, so at
  // medium/hard the generic pool would otherwise fill all 3 slots and the
  // user would see unrelated answers from other questions.)
  const presetDistractors = questionData.wrongAnswers
    ? uniqueByNormalized(
        Array.isArray(questionData.wrongAnswers)
          ? questionData.wrongAnswers
          : [
              ...(questionData.wrongAnswers.easy || []),
              ...(questionData.wrongAnswers.medium || []),
              ...(questionData.wrongAnswers.hard || []),
            ]
      )
    : [];

  // Curated per-question distractors (from the pack) always win: take up to 3
  // of them first, then fill any remaining slots from the generic pools.
  const curatedFirst = uniqueByNormalized([
    ...presetDistractors,
    ...(wrongAnswers[difficulty] || []),
    ...wrongAnswers.easy,
    ...wrongAnswers.medium,
    ...wrongAnswers.hard,
  ]).filter(isValidDistractor).slice(0, 3);

  // Build a unique wrong-answer pool across all difficulty levels, then pick 3.
  const wrongPool = uniqueByNormalized([
    ...wrongAnswers.easy,
    ...wrongAnswers.medium,
    ...wrongAnswers.hard,
    ...GLOBAL_FALLBACK_DISTRACTORS,
  ]).filter(isValidDistractor);

  const selectedWrong = [
    ...curatedFirst,
    ...shuffleArray(wrongPool.filter((o) => !curatedFirst.includes(o))).slice(0, Math.max(0, 3 - curatedFirst.length)),
  ].slice(0, 3);

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
    question: displayQuestion,
    displayQuestion,
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
// Per-state capitol photos for dynamic state-capital questions.
// All URLs verified live (HTTP 200, image/jpeg) Oct 28, 2026.
const STATE_CAPITOL_IMAGES = {
  'Alabama': 'https://commons.wikimedia.org/wiki/Special:FilePath/Alabama_State_Capitol,_Montgomery,_West_view_20160713_1.jpg?width=480',
  'Alaska': 'https://commons.wikimedia.org/wiki/Special:FilePath/210103_Snowy_capitol.jpg?width=480',
  'Arizona': 'https://commons.wikimedia.org/wiki/Special:FilePath/Arizona_State_Capitol,_Washington_Street_and_17th_Avenue,_Phoenix,_AZ_-_54441873193.jpg?width=480',
  'Arkansas': 'https://commons.wikimedia.org/wiki/Special:FilePath/Arkansas_State_Capitol.jpg?width=480',
  'California': 'https://commons.wikimedia.org/wiki/Special:FilePath/Sacramento,-California---State-Capitol.jpg?width=480',
  'Colorado': 'https://commons.wikimedia.org/wiki/Special:FilePath/Colorado_State_Capitol_building.jpg?width=480',
  'Connecticut': 'https://commons.wikimedia.org/wiki/Special:FilePath/Connecticut_State_Capitol_(55617356712).jpg?width=480',
  'Delaware': 'https://commons.wikimedia.org/wiki/Special:FilePath/2022-07-20_08_03_40_The_east_side_of_the_Delaware_Legislative_Hall_(Delaware_Capitol_Building)_in_Dover,_Kent_County,_Delaware.jpg?width=480',
  'Florida': 'https://commons.wikimedia.org/wiki/Special:FilePath/Old_and_New_Florida_State_Capitol,_Tallahassee,_East_view_20160711_1.jpg?width=480',
  'Georgia': 'https://commons.wikimedia.org/wiki/Special:FilePath/Georgia_State_Capitol,_Atlanta,_West_view_20160716_1.jpg?width=480',
  'Hawaii': 'https://commons.wikimedia.org/wiki/Special:FilePath/Hawaii_state_capitol_from_the_south-east.jpg?width=480',
  'Idaho': 'https://commons.wikimedia.org/wiki/Special:FilePath/Idaho_State_Capitol_building.jpg?width=480',
  'Illinois': 'https://commons.wikimedia.org/wiki/Special:FilePath/Illinois_State_Capitol_pano.jpg?width=480',
  'Indiana': 'https://commons.wikimedia.org/wiki/Special:FilePath/StateCapitolIndiana.jpg?width=480',
  'Iowa': 'https://commons.wikimedia.org/wiki/Special:FilePath/Capitol_building,_Des_Moines,_Iowa.jpg?width=480',
  'Kansas': 'https://commons.wikimedia.org/wiki/Special:FilePath/Kansas_State_Capitol_in_summer_2024.jpg?width=480',
  'Kentucky': 'https://commons.wikimedia.org/wiki/Special:FilePath/U.S._Route_60_Frankfort,_KY_(23892062134).jpg?width=480',
  'Louisiana': 'https://commons.wikimedia.org/wiki/Special:FilePath/Louisiana_State_Capitol_Building.jpg?width=480',
  'Maine': 'https://commons.wikimedia.org/wiki/Special:FilePath/Maine_State_House_exterior_view_(cropped).jpg?width=480',
  'Maryland': 'https://commons.wikimedia.org/wiki/Special:FilePath/Maryland_State_House_from_College_Ave.JPG?width=480',
  'Massachusetts': 'https://commons.wikimedia.org/wiki/Special:FilePath/Massachusetts_State_House_Boston_November_2016.jpg?width=480',
  'Michigan': 'https://commons.wikimedia.org/wiki/Special:FilePath/Michigan_State_Capitol_2024.jpg?width=480',
  'Minnesota': 'https://commons.wikimedia.org/wiki/Special:FilePath/State_Capitol_with_new_Minnesota_State_Flag_11.jpg?width=480',
  'Mississippi': 'https://commons.wikimedia.org/wiki/Special:FilePath/Mississippi_State_Capitol_(54893700836).jpg?width=480',
  'Missouri': 'https://commons.wikimedia.org/wiki/Special:FilePath/MissouriCapitol.jpg?width=480',
  'Montana': 'https://commons.wikimedia.org/wiki/Special:FilePath/MK01799_Montana_State_Capitol.jpg?width=480',
  'Nebraska': 'https://commons.wikimedia.org/wiki/Special:FilePath/Nebraska_State_Capitol,_July_2026.jpg?width=480',
  'Nevada': 'https://commons.wikimedia.org/wiki/Special:FilePath/Nevada_State_Capitol_Building_-_Carson_City.jpg?width=480',
  'New Hampshire': 'https://commons.wikimedia.org/wiki/Special:FilePath/New_Hampshire_State_House.jpg?width=480',
  'New Jersey': 'https://commons.wikimedia.org/wiki/Special:FilePath/New_Jersey_State_House_-_2_(55141979306).jpg?width=480',
  'New Mexico': 'https://commons.wikimedia.org/wiki/Special:FilePath/New_Mexico_State_Capitol.jpg?width=480',
  'New York': 'https://commons.wikimedia.org/wiki/Special:FilePath/NYSCapitolPanorama.jpg?width=480',
  'North Carolina': 'https://commons.wikimedia.org/wiki/Special:FilePath/2015_North_Carolina_State_Capitol.JPG?width=480',
  'North Dakota': 'https://commons.wikimedia.org/wiki/Special:FilePath/North_Dakota_State_Capitol.jpg?width=480',
  'Ohio': 'https://commons.wikimedia.org/wiki/Special:FilePath/Ohio_Statehouse_exterior.jpg?width=480',
  'Oklahoma': 'https://commons.wikimedia.org/wiki/Special:FilePath/North_fa%C3%A7ade_of_the_Oklahoma_State_Capitol.jpg?width=480',
  'Oregon': 'https://commons.wikimedia.org/wiki/Special:FilePath/Oregon_State_Capitol_1.jpg?width=480',
  'Pennsylvania': 'https://commons.wikimedia.org/wiki/Special:FilePath/Flying_the_Pride_Flag_over_the_Capitol_(50035197647).jpg?width=480',
  'Rhode Island': 'https://commons.wikimedia.org/wiki/Special:FilePath/2021_Rhode_Island_State_House_from_east.jpg?width=480',
  'South Carolina': 'https://commons.wikimedia.org/wiki/Special:FilePath/South_Carolina_State_House.JPG?width=480',
  'South Dakota': 'https://commons.wikimedia.org/wiki/Special:FilePath/South_Dakota_State_Capitol.jpg?width=480',
  'Tennessee': 'https://commons.wikimedia.org/wiki/Special:FilePath/Tennessee_State_Capitol,_Charlotte_Avenue,_Nashville,_TN_-_54385055916.jpg?width=480',
  'Texas': 'https://commons.wikimedia.org/wiki/Special:FilePath/TexasStateCapitol-2010-01.JPG?width=480',
  'Utah': 'https://commons.wikimedia.org/wiki/Special:FilePath/Utah_State_Capitol,_Salt_Lake_City_(7631480380)_(cropped).jpg?width=480',
  'Vermont': 'https://commons.wikimedia.org/wiki/Special:FilePath/The_Vermont_State_House_in_Montpelier_is_the_state_capitol_building_03.jpg?width=480',
  'Virginia': 'https://commons.wikimedia.org/wiki/Special:FilePath/MJK50147_Virginia_State_Capitol.jpg?width=480',
  'Washington': 'https://commons.wikimedia.org/wiki/Special:FilePath/MK03168_Washington_State_Capitol_(Olympia).jpg?width=480',
  'West Virginia': 'https://commons.wikimedia.org/wiki/Special:FilePath/West_Virginia_State_Capitol_building.jpg?width=480',
  'Wisconsin': 'https://commons.wikimedia.org/wiki/Special:FilePath/Wisconsin_State_Capitol_Building_6.jpg?width=480',
  'Wyoming': 'https://commons.wikimedia.org/wiki/Special:FilePath/DSCN5263_cheyennewyomingcapitolfront_e.jpg?width=480',
};
/**
 * State-specific memory image for dynamic state questions. Returns the user's
 * own state capitol photo for state-capital / governor questions when the
 * state is known, otherwise null (caller falls back to the pack image).
 */
export function getStateSpecificImage(question, answer, userState) {
  if (!userState || !STATE_CAPITOL_IMAGES[userState]) return null;
  const q = (question + ' ' + answer).toLowerCase();
  const stateLower = String(userState).toLowerCase();
  // Never for the U.S. capital question - only for the user's own state.
  if (q.includes('capital of the united states') || q.includes('capital of the u.s.')) return null;
  const isStateCapital = q.includes('capital of your state')
    || (q.includes('capital of') && q.includes(stateLower));
  const isGovernor = q.includes('governor') && (q.includes('your state') || q.includes(stateLower));
  if (isStateCapital || isGovernor) {
    return STATE_CAPITOL_IMAGES[userState];
  }
  return null;
}

export function getVisualImage(question, answer, userState) {
  const q = (question + ' ' + answer).toLowerCase();

  // U.S. Constitution / supreme law
  if (q.includes('constitution') || q.includes('supreme law') || q.includes('amendment') || q.includes('bill of rights'))
    return 'https://commons.wikimedia.org/wiki/Special:FilePath/Constitution_of_the_United_States,_page_1.jpg?width=480';

  // Declaration of Independence
  if (q.includes('declaration') || q.includes('independence') || q.includes('britain') || q.includes('british'))
    return 'https://commons.wikimedia.org/wiki/Special:FilePath/United_States_Declaration_of_Independence.jpg?width=480';

  // President / White House / Executive branch
  if (q.includes('president') || q.includes('white house') || q.includes('executive'))
    return 'https://commons.wikimedia.org/wiki/Special:FilePath/White_House_north_and_south_sides.jpg?width=480';

  // Congress / Capitol / Legislative (incl. senators: "senators" does not contain "senate")
  if (q.includes('congress') || q.includes('senate') || q.includes('senator') || q.includes('representative') || q.includes('legislative') || q.includes('capitol'))
    return 'https://commons.wikimedia.org/wiki/Special:FilePath/US_Capitol_Building_at_night_Jan_2006.jpg?width=480';

  // Governor (dynamic state question): the user's own state capitol as the
  // photographic anchor, not the generic flag.
  if (q.includes('governor'))
    return (userState && STATE_CAPITOL_IMAGES[userState]) ||
      'https://commons.wikimedia.org/wiki/Special:FilePath/AZCAPITOL_20121121.jpg?width=480';

  // Capital of the United States (federal). Must sit before the Washington
  // branch: the answer "Washington, D.C." contains "washington" and would
  // otherwise win the George Washington portrait.
  if (q.includes('capital of the united') || q.includes('capital of the u.s'))
    return 'https://commons.wikimedia.org/wiki/Special:FilePath/US_Capitol_east_side.JPG?width=480';

  // Supreme Court / Judicial
  if (q.includes('supreme court') || q.includes('judicial') || q.includes('judge'))
    return 'https://commons.wikimedia.org/wiki/Special:FilePath/US_Supreme_Court_Building.jpg?width=480';

  // Abraham Lincoln / Civil War
  if (q.includes('lincoln') || q.includes('civil war') || q.includes('slavery') || q.includes('emancipation'))
    return 'https://commons.wikimedia.org/wiki/Special:FilePath/Abraham_Lincoln_O-77_matte_collodion_print.jpg?width=480';

  // George Washington
  if (q.includes('washington') || q.includes('first president'))
    return 'https://commons.wikimedia.org/wiki/Special:FilePath/Gilbert_Stuart_Williamstown_Portrait_of_George_Washington.jpg?width=480';

  // Martin Luther King / Civil Rights
  if (q.includes('martin luther king') || q.includes('mlk') || q.includes('civil rights'))
    return 'https://commons.wikimedia.org/wiki/Special:FilePath/Martin_Luther_King,_Jr..jpg?width=480';

  // Statue of Liberty / Immigration / Freedom
  if (q.includes('statue of liberty') || q.includes('immigration') || q.includes('freedom') || q.includes('liberty'))
    return 'https://commons.wikimedia.org/wiki/Special:FilePath/Statue_of_Liberty_7.jpg?width=480';

  // U.S. Flag / National Anthem
  if (q.includes('flag') || q.includes('anthem') || q.includes('star-spangled') || q.includes('stripes'))
    return 'https://en.wikipedia.org/wiki/Special:FilePath/Flag_of_the_United_States.svg?width=480';

  // Voting / Elections / Democracy
  if (q.includes('vot') || q.includes('elect') || q.includes('ballot') || q.includes('democrat'))
    return 'https://commons.wikimedia.org/wiki/Special:FilePath/Wooden_ballot_box_-_Smithsonian.jpg?width=480';

  // World War I or II
  if (q.includes('world war') || q.includes('wwi') || q.includes('wwii') || q.includes('war ii') || q.includes('war i '))
    return 'https://commons.wikimedia.org/wiki/Special:FilePath/Raising_the_Flag_on_Iwo_Jima,_larger_-_edit1.jpg?width=480';

  // Native Americans / American Indians
  if (q.includes('native') || q.includes('american indian') || q.includes('indigenous'))
    return 'https://commons.wikimedia.org/wiki/Special:FilePath/Grand_Entry_Omaha.jpg?width=480';

  // 13 colonies
  if (q.includes('coloni') || q.includes('thirteen') || q.includes('13'))
    return 'https://commons.wikimedia.org/wiki/Special:FilePath/Map_Thirteen_Colonies_1775.svg?width=480';

  // Washington D.C. geography
  if (q.includes('washington, d.c.') || q.includes('capital city') || q.includes('district of columbia'))
    return 'https://commons.wikimedia.org/wiki/Special:FilePath/US_Capitol_east_side.JPG?width=480';

  // State capital (dynamic): the user's own state capitol photo; when the
  // state is unknown, fall back to the D.C. Capitol (generic case).
  if (q.includes('capital of'))
    return (userState && STATE_CAPITOL_IMAGES[userState]) ||
      'https://commons.wikimedia.org/wiki/Special:FilePath/US_Capitol_east_side.JPG?width=480';

  // Republic / government form
  if (q.includes('republic') || q.includes('form of government') || q.includes('self-government'))
    return 'https://commons.wikimedia.org/wiki/Special:FilePath/US_Capitol_Building_at_night_Jan_2006.jpg?width=480';

  // Default: American flag
  return 'https://en.wikipedia.org/wiki/Special:FilePath/Flag_of_the_United_States.svg?width=480';
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
  // Routed through the pack registry (data/packs). Accepts a pack id
  // ('civics-128') or a legacy test-type key ('naturalization128').
  return getPackQuestions(type);
}
