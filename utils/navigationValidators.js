/**
 * Navigation Parameter Validators
 * 
 * Utility functions to validate navigation parameters
 * and ensure runtime safety across navigation flows.
 * 
 * Usage:
 *   import { validateQuizParams, validateReviewParams } from './navigationValidators';
 *   
 *   useEffect(() => {
 *     const validParams = validateQuizParams(route.params);
 *     if (!validParams) {
 *       navigation.goBack();
 *       return;
 *     }
 *     // proceed with validated params
 *   }, [route.params]);
 */

export const validateQuizParams = (params) => {
  if (!params) return null;

  const { type, forceQuestionCount, focusMode, topicFilter, skipInterstitial } = params;

  const validTypes = ['highschool', 'naturalization100', 'naturalization128'];
  if (type && !validTypes.includes(type)) {
    console.warn(`Invalid quiz type: ${type}`);
    return null;
  }

  if (forceQuestionCount && (typeof forceQuestionCount !== 'number' || forceQuestionCount < 1)) {
    console.warn(`Invalid forceQuestionCount: ${forceQuestionCount}`);
    return null;
  }

  const validFocusMode = [null, 'minimal', 'adhd'];
  if (focusMode && !validFocusMode.includes(focusMode)) {
    console.warn(`Invalid focusMode: ${focusMode}`);
    return null;
  }

  if (topicFilter && typeof topicFilter !== 'string') {
    console.warn(`Invalid topicFilter: ${topicFilter}`);
    return null;
  }

  if (skipInterstitial && typeof skipInterstitial !== 'boolean') {
    console.warn(`Invalid skipInterstitial: ${skipInterstitial}`);
    return null;
  }

  return {
    type: type || 'naturalization128',
    forceQuestionCount: forceQuestionCount || null,
    focusMode: focusMode || null,
    topicFilter: topicFilter || null,
    skipInterstitial: skipInterstitial || false,
  };
};

export const validateReviewParams = (params) => {
  if (!params) return null;

  const { score, total, type, weak } = params;

  if (typeof score !== 'number' || score < 0) {
    console.warn(`Invalid score: ${score}`);
    return null;
  }

  if (typeof total !== 'number' || total < 1) {
    console.warn(`Invalid total: ${total}`);
    return null;
  }

  if (score > total) {
    console.warn(`Score ${score} exceeds total ${total}`);
    return null;
  }

  const validTypes = ['highschool', 'naturalization100', 'naturalization128'];
  if (type && !validTypes.includes(type)) {
    console.warn(`Invalid quiz type: ${type}`);
    return null;
  }

  if (!Array.isArray(weak)) {
    console.warn(`Invalid weak array: ${weak}`);
    return null;
  }

  return {
    score,
    total,
    type: type || 'naturalization128',
    weak: weak.filter((item) => item && typeof item.topic === 'string' && typeof item.ratio === 'number'),
  };
};

export const validateMasteryMapParams = (params) => {
  if (!params) return null;

  const { topicFilter, subtopicFilter } = params;

  if (topicFilter && typeof topicFilter !== 'string') {
    console.warn(`Invalid topicFilter: ${topicFilter}`);
    return null;
  }

  if (subtopicFilter && typeof subtopicFilter !== 'string') {
    console.warn(`Invalid subtopicFilter: ${subtopicFilter}`);
    return null;
  }

  return {
    topicFilter: topicFilter || null,
    subtopicFilter: subtopicFilter || null,
  };
};

export const validateFamilyParams = (params) => {
  if (!params) return null;

  const { familyId, mode } = params;

  if (familyId && typeof familyId !== 'string') {
    console.warn(`Invalid familyId: ${familyId}`);
    return null;
  }

  const validModes = ['view', 'edit', 'invite'];
  if (mode && !validModes.includes(mode)) {
    console.warn(`Invalid mode: ${mode}`);
    return null;
  }

  return {
    familyId: familyId || null,
    mode: mode || 'view',
  };
};
