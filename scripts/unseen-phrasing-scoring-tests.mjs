/**
 * Unseen Phrasing Scoring Tests
 * Stress-tests question-aware scoring with paraphrases that differ from rubric wording.
 * Goal: reduce overfitting risk before release.
 */

import fs from 'fs';
import { scoreAnswer } from '../utils/interviewScoringEngine.js';

const civicsData = JSON.parse(fs.readFileSync('./civics_128.json', 'utf-8'));
const testData = civicsData.slice(0, 10);

const unseenCases = [
  // Q1
  { qNum: 1, answer: 'Voters pick leaders in a representative democracy within a federal republic.', expectedGrade: 'A', reason: 'Paraphrased A with representative + republic signals' },
  { qNum: 1, answer: 'It is a democratic style government.', expectedGrade: 'C', reason: 'Vague government-type mention without republic specificity' },
  { qNum: 1, answer: 'A royal kingdom run by a king.', expectedGrade: 'D', reason: 'Directly incorrect system' },

  // Q2
  { qNum: 2, answer: 'The Constitution is the highest law, and every other law must follow it.', expectedGrade: 'A', reason: 'Paraphrased supremacy explanation' },
  { qNum: 2, answer: 'The U.S. Constitution.', expectedGrade: 'B', reason: 'Concise correct answer' },
  { qNum: 2, answer: 'The president is above all law.', expectedGrade: 'D', reason: 'Contradictory and incorrect' },

  // Q3
  { qNum: 3, answer: 'It creates the government and protects people\'s rights.', expectedGrade: 'A', reason: 'Two valid constitutional functions in paraphrase' },
  { qNum: 3, answer: 'It describes what government should do.', expectedGrade: 'C', reason: 'General and incomplete function description' },
  { qNum: 3, answer: 'It decides weather patterns for states.', expectedGrade: 'D', reason: 'Off-topic claim' },

  // Q4
  { qNum: 4, answer: 'Power comes from the people, with consent of the governed.', expectedGrade: 'A', reason: 'Paraphrased popular sovereignty + consent' },
  { qNum: 4, answer: 'It means people run their own government.', expectedGrade: 'B', reason: 'Self-government concept only' },
  { qNum: 4, answer: 'It is just the official name of government.', expectedGrade: 'D', reason: 'Known contradiction pattern' },

  // Q5
  { qNum: 5, answer: 'By amendments proposed and then ratified by the states.', expectedGrade: 'A', reason: 'Paraphrased proposal + ratification process' },
  { qNum: 5, answer: 'Through amendments to the Constitution.', expectedGrade: 'B', reason: 'Correct method with no process detail' },
  { qNum: 5, answer: 'Only the president can rewrite it.', expectedGrade: 'D', reason: 'Explicitly incorrect authority' },

  // Q6
  { qNum: 6, answer: 'It protects freedoms like speech and religion.', expectedGrade: 'A', reason: 'Specific rights example paraphrase' },
  { qNum: 6, answer: 'It protects rights of people in this country.', expectedGrade: 'B', reason: 'Correct general-rights statement' },
  { qNum: 6, answer: 'It restricts people\'s freedoms.', expectedGrade: 'D', reason: 'Contradiction to rights-protection meaning' },

  // Q7
  { qNum: 7, answer: '27.', expectedGrade: 'A', reason: 'Direct correct number with confidence' },
  { qNum: 7, answer: 'I think it is 27 amendments.', expectedGrade: 'B', reason: 'Correct number with hesitation cue' },
  { qNum: 7, answer: 'Probably around thirty amendments.', expectedGrade: 'C', reason: 'Approximate incorrect number' },

  // Q8
  { qNum: 8, answer: 'It declared independence from Britain and affirmed inherent rights.', expectedGrade: 'A', reason: 'Paraphrased freedom + rights concepts' },
  { qNum: 8, answer: 'It was key to independence from British control.', expectedGrade: 'B', reason: 'Freedom-from-Britain concept only' },
  { qNum: 8, answer: 'It created the office of president.', expectedGrade: 'D', reason: 'Incorrect historical claim' },

  // Q9
  { qNum: 9, answer: 'The Declaration of Independence, the 1776 break from Britain.', expectedGrade: 'A', reason: 'Correct document with context clue' },
  { qNum: 9, answer: 'The Declaration of Independence.', expectedGrade: 'B', reason: 'Correct document short form' },
  { qNum: 9, answer: 'The Constitution did that.', expectedGrade: 'D', reason: 'Known wrong document contradiction' },

  // Q10
  { qNum: 10, answer: 'Declaration ideas: equality and natural rights. Constitution ideas: limited government and self-rule.', expectedGrade: 'A', reason: 'Two ideas per document in paraphrased form' },
  { qNum: 10, answer: 'Equality, liberty, and limited government.', expectedGrade: 'B', reason: 'Multiple valid ideas without document mapping' },
  { qNum: 10, answer: 'No ideas come to mind.', expectedGrade: 'D', reason: 'No substantive content' },
];

function runTests() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   Unseen Phrasing Scoring Tests');
  console.log('   Paraphrase robustness and anti-overfitting pass');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let passed = 0;
  const failedCases = [];
  const byGrade = { A: { passed: 0, total: 0 }, B: { passed: 0, total: 0 }, C: { passed: 0, total: 0 }, D: { passed: 0, total: 0 } };

  unseenCases.forEach((testCase, index) => {
    const { qNum, answer, expectedGrade, reason } = testCase;
    const rubric = testData[qNum - 1].rubric;
    const expectedAnswers = testData[qNum - 1].answers || [];

    const result = scoreAnswer(answer, rubric, {
      questionId: `q${qNum}`,
      expectedAnswers,
    });

    const ok = result.grade === expectedGrade;
    byGrade[expectedGrade].total += 1;

    if (ok) {
      passed += 1;
      byGrade[expectedGrade].passed += 1;
      console.log(`✅ Case ${index + 1} (Q${qNum})`);
    } else {
      failedCases.push({
        index: index + 1,
        qNum,
        expected: expectedGrade,
        got: result.grade,
        answer,
        reason,
      });
      console.log(`❌ Case ${index + 1} (Q${qNum}) expected ${expectedGrade}, got ${result.grade}`);
    }

    console.log(`   Reason: ${reason}`);
    console.log(`   Feedback: ${result.feedback}`);
  });

  const total = unseenCases.length;
  const accuracy = ((passed / total) * 100).toFixed(1);
  const status = Number(accuracy) >= 90 ? '✅ PASS' : Number(accuracy) >= 80 ? '🟡 PARTIAL' : '❌ NEEDS WORK';

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 OVERALL RESULTS: ${passed}/${total} passed (${accuracy}%)`);
  console.log(`${status}`);

  console.log('\nGrade Breakdown:');
  ['A', 'B', 'C', 'D'].forEach((grade) => {
    const stats = byGrade[grade];
    const pct = stats.total ? ((stats.passed / stats.total) * 100).toFixed(0) : 'N/A';
    console.log(`  ${grade}-grade: ${stats.passed}/${stats.total} (${pct}%)`);
  });

  if (failedCases.length) {
    console.log('\n⚠️ Failed Cases:');
    failedCases.forEach((item) => {
      console.log(`  Case ${item.index} (Q${item.qNum}) expected ${item.expected}, got ${item.got}`);
      console.log(`    Answer: "${item.answer}"`);
      console.log(`    Reason: ${item.reason}`);
    });
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  return Number(accuracy) >= 90;
}

const success = runTests();
process.exit(success ? 0 : 1);
