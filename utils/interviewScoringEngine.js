/**
 * Interview Scoring Engine
 * Grades student answers against rubric using normalized token/phrase matching
 * Returns grade (A/B/C/D) with feedback and confidence score
 */

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'to', 'of', 'as', 'on', 'at', 'by', 'is', 'was', 'are', 'be',
  'has', 'have', 'does', 'do', 'with', 'for', 'from', 'that', 'this', 'these', 'those', 'one', 'two', 'three',
  'identifies', 'identify', 'identified', 'identifying',
  'correctly', 'correct', 'mentions', 'mention', 'explains', 'explain', 'explained', 'explaining',
  'states', 'state', 'stated', 'stating', 'names', 'name', 'clear', 'clearly',
  'partially', 'partly', 'vague', 'response', 'incorrect',
  'criterion', 'criteria', 'level', 'advanced', 'proficient', 'developing', 'emerging', 'understanding',
  'nature', 'method', 'means', 'process', 'important',
  'off', 'topic', 'while', 'where', 'when', 'what', 'why', 'how', 'about', 'some', 'kind', 'thing', 'things',
  'people', 'person', 'citizen', 'citizens', 'american', 'americans',
  'identifi', 'correctli', 'explain', 'mention', 'state', 'name',
]);

const GENERIC_CIVICS_TERMS = new Set([
  'constitution', 'government', 'law', 'rights', 'right', 'freedom', 'freedoms', 'amendment', 'amendments',
  'independence', 'document', 'democracy', 'republic',
]);

const INCORRECT_SIGNAL_PATTERNS = [
  /\b(monarchy|kingdom|king|queen|dictator|dictatorship)\b/i,
  /\b(kingdom ruled|ruled by a king)\b/i,
  /\b(president is the supreme law|president decides .* constitution)\b/i,
  /\bpresident\b.*\babove\b.*\blaw\b/i,
  /\b(prevents? .* rights?|restricts? .* rights?|forbids? .* rights?)\b/i,
];

const GRADE_RANK = { D: 0, C: 1, B: 2, A: 3 };

const Q10_IDEA_TOKENS = [
  'equal', 'equality', 'liberty', 'freedom', 'right', 'rights', 'limited', 'government',
  'self', 'govern', 'social', 'contract', 'natural',
];

const QUESTION_FEATURES = {
  q4: {
    incorrectPatterns: [/\b(name|official name) of (the )?government\b/i],
  },
  q5: {
    incorrectPatterns: [/\bpresident decides\b/i, /\bpresident only\b/i],
  },
  q9: {
    incorrectPatterns: [/\bconstitution maybe\b/i],
  },
};

function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stemToken(token) {
  if (token.length <= 4) return token;
  return token
    .replace(/(ing|ed|ly|es|s)$/g, '')
    .trim();
}

function tokenize(text) {
  const normalized = normalizeText(text);
  if (!normalized) return [];

  return normalized
    .split(' ')
    .map((token) => stemToken(token.trim()))
    .map((token) => token.replace(/\.$/, ''))
    .filter((token) => token && token.length > 2 && !STOP_WORDS.has(token));
}

function extractSemanticUnits(criterionText) {
  const normalized = normalizeText(criterionText);
  if (!normalized) {
    return { phrases: [], tokens: [] };
  }

  const phraseCandidates = normalized
    .split(/\b(?:and|or)\b|,|\+|\//g)
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => part.length > 2);

  const phraseTokenSets = phraseCandidates
    .map((phrase) => {
      const tokens = tokenize(phrase);
      return {
        text: phrase,
        tokens,
      };
    })
    .filter((entry) => entry.tokens.length > 0);

  const tokenSet = new Set();
  phraseTokenSets.forEach(({ tokens }) => {
    tokens.forEach((token) => tokenSet.add(token));
  });

  return {
    phrases: phraseTokenSets,
    tokens: [...tokenSet],
  };
}

function scoreLevel(answerNormalized, answerTokensSet, units) {
  if (!units.tokens.length && !units.phrases.length) {
    return {
      score: 0,
      tokenMatches: 0,
      tokenTotal: 0,
      tokenCoverage: 0,
      phraseMatches: 0,
      phraseCoverage: 0,
    };
  }

  const tokenMatches = units.tokens.filter((token) => answerTokensSet.has(token)).length;
  const tokenCoverage = units.tokens.length ? tokenMatches / units.tokens.length : 0;

  const phraseMatches = units.phrases.filter(({ text, tokens }) => {
    if (answerNormalized.includes(text)) return true;
    if (!tokens.length) return false;
    const matchedTokens = tokens.filter((token) => answerTokensSet.has(token)).length;
    return matchedTokens / tokens.length >= 0.75;
  }).length;
  const phraseCoverage = units.phrases.length ? phraseMatches / units.phrases.length : 0;

  // Phrase evidence carries more weight because rubric meaning is phrase-oriented.
  const score = (phraseCoverage * 0.65) + (tokenCoverage * 0.35);

  return {
    score,
    tokenMatches,
    tokenTotal: units.tokens.length,
    tokenCoverage,
    phraseMatches,
    phraseCoverage,
  };
}

function hasIncorrectSignal(answer) {
  const normalized = normalizeText(answer);
  return INCORRECT_SIGNAL_PATTERNS.some((pattern) => pattern.test(normalized));
}

function shouldFallbackToC(answerTokensSet, answerTokens, levelScores) {
  const hasAnyRubricSignal = levelScores.A.tokenMatches
    || levelScores.B.tokenMatches
    || levelScores.C.tokenMatches
    || levelScores.A.phraseMatches
    || levelScores.B.phraseMatches
    || levelScores.C.phraseMatches;

  if (hasAnyRubricSignal) return true;

  if (answerTokens.length <= 1) return false;

  const genericTermHits = [...answerTokensSet].filter((token) => GENERIC_CIVICS_TERMS.has(token)).length;
  return genericTermHits >= 1;
}

/**
 * Extract keywords from rubric criterion text
 * Breaks down rubric into individual keywords by splitting on connectors and common words
 * @param {string} criterionText - Rubric criterion (e.g., "Identifies main idea + two examples")
 * @returns {string[]} - Array of keywords to match
 */
function getRequiredMatches(tokenCount, level) {
  if (level === 'A') return Math.min(3, Math.max(2, Math.ceil(tokenCount * 0.4)));
  if (level === 'B') return Math.min(2, Math.max(1, Math.ceil(tokenCount * 0.35)));
  return 1;
}

function determineGrade(answer, answerTokens, answerTokensSet, levelScores) {
  if (hasIncorrectSignal(answer)) {
    return { grade: 'D', fromLevel: 'D' };
  }

  const aRequired = getRequiredMatches(levelScores.A.tokenTotal, 'A');
  const bRequired = getRequiredMatches(levelScores.B.tokenTotal, 'B');
  const cRequired = getRequiredMatches(levelScores.C.tokenTotal, 'C');

  const aQualifies = levelScores.A.tokenMatches >= aRequired;
  if (aQualifies) {
    return { grade: 'A', fromLevel: 'A' };
  }

  const bQualifies = levelScores.B.tokenMatches >= bRequired;
  if (bQualifies) {
    return { grade: 'B', fromLevel: 'B' };
  }

  const cQualifies = levelScores.C.tokenMatches >= cRequired || shouldFallbackToC(answerTokensSet, answerTokens, levelScores);
  if (cQualifies) {
    return { grade: 'C', fromLevel: 'C' };
  }

  return { grade: 'D', fromLevel: 'D' };
}

function normalizeQuestionId(questionId) {
  const normalized = String(questionId || '').toLowerCase().trim();
  if (!normalized) return '';
  const match = normalized.match(/q\d+/);
  return match ? match[0] : normalized;
}

function promoteToAtLeast(currentGrade, minimumGrade) {
  return GRADE_RANK[currentGrade] >= GRADE_RANK[minimumGrade] ? currentGrade : minimumGrade;
}

function countPhraseHits(normalizedAnswer, phrases = []) {
  return phrases.filter((phrase) => normalizedAnswer.includes(phrase)).length;
}

function countTokenHits(answerTokensSet, tokens = []) {
  return tokens.filter((token) => answerTokensSet.has(stemToken(token))).length;
}

function extractNumber(normalizedAnswer) {
  const match = normalizedAnswer.match(/\b\d+\b/);
  return match ? Number(match[0]) : null;
}

function hasHesitationCue(normalizedAnswer) {
  return /\b(i think|i believe|maybe|not sure|about|around|like)\b/.test(normalizedAnswer);
}

function computeExpectedAnswerMatch(normalizedAnswer, answerTokensSet, expectedAnswers = []) {
  const candidates = (expectedAnswers || []).filter(Boolean);
  if (!candidates.length) {
    return { score: 0, exact: false };
  }

  let bestScore = 0;
  let exact = false;

  for (const candidate of candidates) {
    const normalizedCandidate = normalizeText(candidate);
    if (!normalizedCandidate) continue;

    if (normalizedAnswer.includes(normalizedCandidate)) {
      exact = true;
      bestScore = Math.max(bestScore, 1);
      continue;
    }

    const candidateTokens = tokenize(candidate);
    if (!candidateTokens.length) continue;
    const overlap = candidateTokens.filter((token) => answerTokensSet.has(token)).length;
    bestScore = Math.max(bestScore, overlap / candidateTokens.length);
  }

  return { score: bestScore, exact };
}

function applyQuestionAwareRules(initialGrade, studentAnswer, context = {}) {
  const normalizedAnswer = normalizeText(studentAnswer);
  const answerTokensSet = new Set(tokenize(studentAnswer));
  const baseQuestionId = normalizeQuestionId(context.questionId);
  const expectedMatch = computeExpectedAnswerMatch(
    normalizedAnswer,
    answerTokensSet,
    context.expectedAnswers
  );

  let grade = initialGrade;

  if (expectedMatch.exact || expectedMatch.score >= 0.7) {
    grade = promoteToAtLeast(grade, 'B');
  }

  const questionFeature = QUESTION_FEATURES[baseQuestionId];
  if (questionFeature?.incorrectPatterns?.some((pattern) => pattern.test(normalizedAnswer))) {
    return { grade: 'D', reason: `${baseQuestionId}:question_feature_contradiction`, expectedMatch };
  }

  switch (baseQuestionId) {
    case 'q1': {
      const hasRepublicSignal = /\b(republic|federal republic|representative democracy)\b/.test(normalizedAnswer);
      const hasVagueGovSignal = /\b(democracy|government|govern)\b/.test(normalizedAnswer);

      if (!hasRepublicSignal && hasVagueGovSignal) {
        grade = promoteToAtLeast(grade, 'C');
      }
      break;
    }
    case 'q2': {
      const hasConstitution = normalizedAnswer.includes('constitution');
      const hasSupremeLaw =
        (normalizedAnswer.includes('supreme') && normalizedAnswer.includes('law'))
        || normalizedAnswer.includes('highest law');
      const hasExplanationCue = /\b(because|above|foundation|governs?|highest|follow|follows|must follow)\b/.test(normalizedAnswer);
      if (hasConstitution && hasSupremeLaw && hasExplanationCue) {
        grade = 'A';
      } else if (!hasConstitution && /\b(law|supreme|highest)\b/.test(normalizedAnswer) && !/\bpresident\b/.test(normalizedAnswer)) {
        grade = promoteToAtLeast(grade, 'C');
      }
      break;
    }
    case 'q3': {
      const functionHits = [
        ['form', 'government'],
        ['creat', 'government'],
        ['create', 'government'],
        ['define', 'power'],
        ['protect', 'right'],
      ].filter((pair) => pair.every((token) => answerTokensSet.has(token))).length;

      if (functionHits >= 2) {
        grade = 'A';
      } else if (functionHits >= 1) {
        grade = promoteToAtLeast(grade, 'B');
      }
      break;
    }
    case 'q4': {
      const hasPopularOrSelfGov = /\b(popular sovereignty|self government|self govern|power comes from (the )?people|people run .* government)\b/.test(normalizedAnswer);
      const hasConsent = /\b(consent of the governed|consent)\b/.test(normalizedAnswer);
      if (hasPopularOrSelfGov && hasConsent) {
        grade = 'A';
      } else if (hasPopularOrSelfGov || hasConsent) {
        grade = promoteToAtLeast(grade, 'B');
      }
      break;
    }
    case 'q5': {
      const hasAmendment = /\bamendments?\b/.test(normalizedAnswer);
      const hasProposalRatification = /\b(proposal|propose|proposed|ratification|ratify|ratified|two thirds|three fourths|states?)\b/.test(normalizedAnswer);
      const hasCongressChange = /\bcongress\b/.test(normalizedAnswer) && /\b(change|changes|changed|modify)\b/.test(normalizedAnswer);

      if (hasAmendment && hasProposalRatification) {
        grade = 'A';
      } else if (hasAmendment) {
        grade = promoteToAtLeast(grade, 'B');
      } else if (hasCongressChange) {
        grade = promoteToAtLeast(grade, 'C');
      }
      break;
    }
    case 'q6': {
      const hasRestrictionClaim = /\b(prevent|prevents|restrict|restricts|forbid|forbids)\b/.test(normalizedAnswer);
      const specificRightsHits = countPhraseHits(normalizedAnswer, [
        'freedom of speech',
        'freedom of religion',
        'right to vote',
        'bear arms',
      ]);
      const hasSpeechReligionPair = /\bspeech\b/.test(normalizedAnswer) && /\b(religion|religious)\b/.test(normalizedAnswer);
      const hasRights = /\bright(s)?\b/.test(normalizedAnswer);
      const hasPeopleQualifier = /\b(american|americans|resident|residents|people)\b/.test(normalizedAnswer);

      if (hasRestrictionClaim) {
        grade = 'D';
      } else if ((hasRights && specificRightsHits >= 1) || hasSpeechReligionPair) {
        grade = 'A';
      } else if (hasRights && hasPeopleQualifier) {
        grade = promoteToAtLeast(grade, 'B');
      } else if (normalizedAnswer.includes('people')) {
        grade = promoteToAtLeast(grade, 'C');
      }
      break;
    }
    case 'q7': {
      const number = extractNumber(normalizedAnswer);
      const hasThirtyWord = /\b(thirty|thirty-ish|about thirty|around thirty)\b/.test(normalizedAnswer);
      if (number === 27) {
        grade = hasHesitationCue(normalizedAnswer) ? 'B' : 'A';
      } else if (hasThirtyWord) {
        grade = 'C';
      } else if (number !== null) {
        grade = promoteToAtLeast('D', 'C');
      }
      break;
    }
    case 'q8': {
      const freedomFromBritain = /\b(free from britain|free from british|british control|independence from britain|colonies .* free)\b/.test(normalizedAnswer);
      const rightsConcept = /\b(equal|equality|inherent rights|universal rights|individual freedoms?)\b/.test(normalizedAnswer);

      if (freedomFromBritain && rightsConcept) {
        grade = 'A';
      } else if (freedomFromBritain || rightsConcept) {
        grade = promoteToAtLeast(grade, 'B');
      } else if (normalizedAnswer.includes('independence')) {
        grade = promoteToAtLeast(grade, 'C');
      }
      break;
    }
    case 'q9': {
      const hasDeclaration = /\bdeclaration of independence\b/.test(normalizedAnswer);
      const hasContext = /\b(free from britain|british rule|colonies|1776|founding fathers)\b/.test(normalizedAnswer);
      const hasWrongDocument = /\bconstitution\b/.test(normalizedAnswer) && !hasDeclaration;

      if (hasWrongDocument) {
        grade = 'D';
      } else if (hasDeclaration && hasContext) {
        grade = 'A';
      } else if (hasDeclaration) {
        grade = 'B';
      }
      break;
    }
    case 'q10': {
      const ideaHits = countTokenHits(answerTokensSet, Q10_IDEA_TOKENS);
      const hasDualDocumentFraming = /\b(from the declaration|from declaration|from the constitution|and the constitution|and declaration|declaration ideas|constitution ideas)\b/.test(normalizedAnswer);

      if (ideaHits >= 4 && hasDualDocumentFraming) {
        grade = 'A';
      } else if (ideaHits >= 2) {
        grade = promoteToAtLeast(grade, 'B');
      } else if (ideaHits >= 1) {
        grade = promoteToAtLeast(grade, 'C');
      }
      break;
    }
    default:
      break;
  }

  return {
    grade,
    reason: grade !== initialGrade ? `${baseQuestionId || 'generic'}:question_aware_adjustment` : 'none',
    expectedMatch,
  };
}

/**
 * Generate feedback based on grade
 * @param {string} grade - A/B/C/D
 * @param {string} rubricText - Original rubric criterion
 * @param {object} rubrics - Full rubric object
 * @returns {string} - Feedback message
 */
function generateFeedback(grade, rubricText, rubrics) {
  const feedbackTemplates = {
    A: (criterion) =>
      `Excellent! ${criterion.charAt(0).toUpperCase() + criterion.slice(1)}. You demonstrated advanced understanding.`,
    B: (criterion) =>
      `Good work! ${criterion.charAt(0).toUpperCase() + criterion.slice(1)}. Next time, try to add more depth.`,
    C: (criterion) =>
      `Getting there. Your answer shows you're on the right track. To improve, focus on: ${criterion}`,
    D: () =>
      "Let's review this topic. Your answer suggests some confusion. We can work through it together.",
  };

  const template = feedbackTemplates[grade] || feedbackTemplates.D;
  return template(String(rubricText || rubrics?.D || '').toLowerCase());
}

/**
 * Check if answer has minimum substantive content
 * Rejects answers that are too brief or contain clear "I don't know" patterns
 * @param {string} answer - Student's answer
 * @returns {boolean} - true if has substantive content
 */
function hasSubstantiveContent(answer) {
  if (!answer) return false;
  const token = answer.trim().toLowerCase();

  // Allow short factual numeric answers (e.g., "27") for number-based questions.
  if (/^\d{1,3}\.?$/.test(token)) return true;
  
  // Check for minimum length
  if (token.length < 5) return false;
  
  // Reject common "don't know" patterns
  const rejectPatterns = [
    "i don't know",
    "i do not know",
    "no idea",
    "no ideas",
    "not sure",
    "skip",
    "pass",
    "...",
    "uhhh",
    "ummm",
    "err",
  ];
  
  for (const pattern of rejectPatterns) {
    if (token === pattern || token.includes(pattern + " ")) {
      return false;
    }
  }

  // Require at least 2 words for context
  const wordCount = token.split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount < 2) return false;
  
  return true;
}

/**
 * Score student answer against rubric
 * @param {string} studentAnswer - Recorded/transcribed student response
 * @param {object} rubric - Rubric object {A: "", B: "", C: "", D: ""}
 * @param {object} options - Configuration
 *   - minContentLength: minimum answer length (default 3)
 *   - debug: log scoring details (default false)
 * @returns {object}
 *   {
 *     grade: 'A'|'B'|'C'|'D',
 *     feedback: string,
 *     confidence: 0-1,
 *     details: {
 *       matchCounts: {A, B, C, D},
 *       percentages: {A, B, C, D},
 *       reasoningGradeFrom: 'A'|'B'|'C'|'D'
 *     }
 *   }
 */
export function scoreAnswer(studentAnswer, rubric, options = {}) {
  const {
    debug = false,
    questionId = '',
    expectedAnswers = [],
  } = options;

  // Input validation
  if (!studentAnswer || !rubric) {
    if (debug) console.log('[Scoring] Missing input: answer or rubric');
    return {
      grade: 'D',
      feedback: 'No response provided. Please try again.',
      confidence: 0,
      details: {
        matchCounts: { A: 0, B: 0, C: 0, D: 0 },
        percentages: { A: 0, B: 0, C: 0, D: 0 },
        reasoningGradeFrom: 'D',
      },
    };
  }

  // Check for minimum content
  if (!hasSubstantiveContent(studentAnswer)) {
    if (debug) console.log('[Scoring] Insufficient content length');
    return {
      grade: 'D',
      feedback: 'Your response was too brief. Please provide more detail.',
      confidence: 1,
      details: {
        matchCounts: { A: 0, B: 0, C: 0, D: 0 },
        percentages: { A: 0, B: 0, C: 0, D: 0 },
        reasoningGradeFrom: 'D',
      },
    };
  }

  const normalizedAnswer = normalizeText(studentAnswer);
  const answerTokens = tokenize(studentAnswer);
  const answerTokensSet = new Set(answerTokens);

  // Extract semantic units for each rubric level.
  const unitsByLevel = {
    A: extractSemanticUnits(rubric.A),
    B: extractSemanticUnits(rubric.B),
    C: extractSemanticUnits(rubric.C),
    // D remains fallback/incorrect signal handling; keep units for details only.
    D: extractSemanticUnits(rubric.D || 'incorrect off topic'),
  };

  if (debug) {
    console.log('[Scoring] Semantic units extracted:', unitsByLevel);
  }

  const levelScores = {
    A: scoreLevel(normalizedAnswer, answerTokensSet, unitsByLevel.A),
    B: scoreLevel(normalizedAnswer, answerTokensSet, unitsByLevel.B),
    C: scoreLevel(normalizedAnswer, answerTokensSet, unitsByLevel.C),
    D: scoreLevel(normalizedAnswer, answerTokensSet, unitsByLevel.D),
  };

  if (debug) {
    console.log('[Scoring] Level scores:', levelScores);
  }

  const matchCounts = {
    A: levelScores.A.tokenMatches + levelScores.A.phraseMatches,
    B: levelScores.B.tokenMatches + levelScores.B.phraseMatches,
    C: levelScores.C.tokenMatches + levelScores.C.phraseMatches,
    D: levelScores.D.tokenMatches + levelScores.D.phraseMatches,
  };

  const percentages = {
    A: levelScores.A.score,
    B: levelScores.B.score,
    C: levelScores.C.score,
    D: levelScores.D.score,
  };

  if (debug) {
    console.log('[Scoring] Match percentages:', percentages);
  }

  // Determine grade
  const { grade, fromLevel } = determineGrade(studentAnswer, answerTokens, answerTokensSet, levelScores);
  const questionAware = applyQuestionAwareRules(grade, studentAnswer, {
    questionId,
    expectedAnswers,
  });
  const finalGrade = questionAware.grade;

  if (debug) {
    console.log(`[Scoring] Grade determined: ${grade} (from ${fromLevel} level)`);
    console.log('[Scoring] Question-aware adjustment:', questionAware);
  }

  // Generate feedback
  const rubricCriterion = rubric[finalGrade];
  const feedback = generateFeedback(finalGrade, rubricCriterion, rubric);

  // Calculate confidence based on selected level score with floor for deterministic D outcomes.
  const confidence = finalGrade === 'D'
    ? Math.max(0.7, levelScores.D.score)
    : Math.max(percentages[finalGrade], 0.5);

  return {
    grade: finalGrade,
    feedback,
    confidence,
    details: {
      matchCounts,
      percentages,
      reasoningGradeFrom: fromLevel,
      questionAwareReason: questionAware.reason,
      expectedAnswerMatchScore: questionAware.expectedMatch.score,
      expectedAnswerExactMatch: questionAware.expectedMatch.exact,
    },
  };
}

/**
 * Batch score multiple answers
 * Useful for testing or bulk processing
 * @param {array} answers - Array of {answer: string, rubric: object}
 * @param {object} options - Scoring options
 * @returns {array} - Array of scoring results
 */
export function scoreAnswersBatch(answers, options = {}) {
  return answers.map(({ answer, rubric }) => scoreAnswer(answer, rubric, options));
}

/**
 * Calculate grade distribution for sample answers
 * Useful for validating scoring algorithm
 * @param {array} results - Array of scoring results
 * @returns {object} - {A: count, B: count, C: count, D: count, distribution: {}}
 */
export function calculateDistribution(results) {
  const distribution = { A: 0, B: 0, C: 0, D: 0 };

  results.forEach((result) => {
    distribution[result.grade]++;
  });

  return {
    ...distribution,
    distribution: {
      A: `${((distribution.A / results.length) * 100).toFixed(1)}%`,
      B: `${((distribution.B / results.length) * 100).toFixed(1)}%`,
      C: `${((distribution.C / results.length) * 100).toFixed(1)}%`,
      D: `${((distribution.D / results.length) * 100).toFixed(1)}%`,
    },
  };
}

export default {
  scoreAnswer,
  scoreAnswersBatch,
  calculateDistribution,
};
