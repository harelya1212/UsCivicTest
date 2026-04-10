/**
 * Interview Scoring Engine Tests
 * Validates keyword-matching scoring with sample answers
 */

import { scoreAnswer, scoreAnswersBatch, calculateDistribution } from '../utils/interviewScoringEngine.js';

// Test rubrics (from civics_128.json)
const testRubrics = {
  q1: {
    question: 'What is the form of government of the United States?',
    A: 'Identifies as republic/federal republic AND explains representative nature',
    B: 'Identifies as republic or federal republic',
    C: 'Mentions government type but vague or partially correct',
    D: 'Incorrect or off-topic response',
  },
  q2: {
    question: 'What is the supreme law of the land?',
    A: 'Identifies Constitution with clear explanation of supremacy',
    B: 'Correctly identifies U.S. Constitution',
    C: 'Mentions Constitution but lacks clarity',
    D: 'Incorrect or no reference to Constitution',
  },
  q3: {
    question: 'Name one thing the U.S. Constitution does.',
    A: 'Names two or more correct functions with explanation',
    B: 'Names one correct function (forms government, defines powers, protects rights)',
    C: 'Attempts to describe function but incomplete',
    D: 'Incorrect or cannot name a function',
  },
};

const officialAnswers = {
  q1: ['Republic', 'Constitution-based federal republic', 'Representative democracy'],
  q2: ['(U.S.) Constitution'],
  q3: ['Forms the government', 'Defines powers of government', 'Protects the rights of the people'],
};

// Sample answers for testing
const testAnswers = {
  q1: [
    { answer: 'A federal republic with representative democracy that protects citizens', expectedGrade: 'A' },
    { answer: 'It is a republic', expectedGrade: 'B' },
    { answer: 'Some kind of democracy', expectedGrade: 'C' },
    { answer: 'A monarchy ruled by the president', expectedGrade: 'D' },
  ],
  q2: [
    { answer: 'The Constitution is the supreme law because it governs all other laws', expectedGrade: 'A' },
    { answer: 'The Constitution', expectedGrade: 'B' },
    { answer: 'The law is important', expectedGrade: 'C' },
    { answer: 'The President', expectedGrade: 'D' },
  ],
  q3: [
    { answer: 'The Constitution forms the government and defines its powers and protects citizen rights', expectedGrade: 'A' },
    { answer: 'It protects the rights of people', expectedGrade: 'B' },
    { answer: 'It is about government', expectedGrade: 'C' },
    { answer: 'I do not know', expectedGrade: 'D' },
  ],
};

/**
 * Run all tests
 */
function runTests() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   Interview Scoring Engine Test Suite');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let totalTests = 0;
  let passedTests = 0;

  // Test Q1
  console.log('📋 Question 1: Government Form\n');
  testAnswers.q1.forEach(({ answer, expectedGrade }, idx) => {
    const result = scoreAnswer(answer, testRubrics.q1, {
      debug: idx === 0,
      questionId: 'q1',
      expectedAnswers: officialAnswers.q1,
    });
    const passed = result.grade === expectedGrade;
    totalTests++;
    if (passed) passedTests++;

    console.log(`  ${passed ? '✅' : '❌'} Test 1.${idx + 1}`);
    console.log(`     Answer: "${answer}"`);
    console.log(`     Expected: ${expectedGrade}, Got: ${result.grade} (${(result.confidence * 100).toFixed(0)}% confidence)`);
    if (!passed && idx === 0) {
      console.log(`     Match counts: A=${result.details.matchCounts.A}/${Object.keys(testRubrics.q1).filter(k => k !== 'question').length}, B=${result.details.matchCounts.B}, C=${result.details.matchCounts.C}, D=${result.details.matchCounts.D}`);
      console.log(`     Percentages: A=${(result.details.percentages.A * 100).toFixed(0)}%, B=${(result.details.percentages.B * 100).toFixed(0)}%, C=${(result.details.percentages.C * 100).toFixed(0)}%, D=${(result.details.percentages.D * 100).toFixed(0)}%`);
    }
    console.log(`     Feedback: ${result.feedback}\n`);
  });

  // Test Q2
  console.log('📋 Question 2: Supreme Law\n');
  testAnswers.q2.forEach(({ answer, expectedGrade }, idx) => {
    const result = scoreAnswer(answer, testRubrics.q2, {
      debug: idx === 1,
      questionId: 'q2',
      expectedAnswers: officialAnswers.q2,
    });
    const passed = result.grade === expectedGrade;
    totalTests++;
    if (passed) passedTests++;

    console.log(`  ${passed ? '✅' : '❌'} Test 2.${idx + 1}`);
    console.log(`     Answer: "${answer}"`);
    console.log(`     Expected: ${expectedGrade}, Got: ${result.grade} (${(result.confidence * 100).toFixed(0)}% confidence)`);
    console.log(`     Feedback: ${result.feedback}\n`);
  });

  // Test Q3
  console.log('📋 Question 3: Constitution Functions\n');
  testAnswers.q3.forEach(({ answer, expectedGrade }, idx) => {
    const result = scoreAnswer(answer, testRubrics.q3, {
      questionId: 'q3',
      expectedAnswers: officialAnswers.q3,
    });
    const passed = result.grade === expectedGrade;
    totalTests++;
    if (passed) passedTests++;

    console.log(`  ${passed ? '✅' : '❌'} Test 3.${idx + 1}`);
    console.log(`     Answer: "${answer}"`);
    console.log(`     Expected: ${expectedGrade}, Got: ${result.grade} (${(result.confidence * 100).toFixed(0)}% confidence)`);
    console.log(`     Feedback: ${result.feedback}\n`);
  });

  // Summary
  const accuracy = ((passedTests / totalTests) * 100).toFixed(1);
  const status = accuracy >= 90 ? '✅ PASS' : accuracy >= 75 ? '🟡 PARTIAL' : '❌ FAIL';

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 Test Results: ${passedTests}/${totalTests} passed (${accuracy}%)`);
  console.log(`${status}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  return accuracy >= 90;
}

// Run tests
const success = runTests();
process.exit(success ? 0 : 1);
