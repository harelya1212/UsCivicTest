/**
 * Comprehensive Scoring Tests
 * Tests the scoring engine against real civics_128.json rubrics
 * Uses answers that are carefully aligned to rubric criteria
 */

import fs from 'fs';
import { scoreAnswer } from '../utils/interviewScoringEngine.js';

// Load real rubrics from civics_128.json
const civicsData = JSON.parse(fs.readFileSync('./civics_128.json', 'utf-8'));
const testData = civicsData.slice(0, 10);  // Q1-10

// Define test cases with answers aligned to actual rubrics
const testCases = [
  {
    qNum: 1,
    rubric: testData[0].rubric,
    cases: [
      {
        answer: 'The United States is a federal republic with representative democracy where citizens elect representatives',
        expectedGrade: 'A',
        reason: 'Contains both "republic" and "representative" keywords'
      },
      {
        answer: 'It is a republic where people vote',
        expectedGrade: 'B',
        reason: 'Contains "republic" (satisfies B criteria)'
      },
      {
        answer: 'Some kind of democracy government thing',
        expectedGrade: 'C',
        reason: 'Mentions government but vague'
      },
      {
        answer: 'I think it is a kingdom ruled by a president',
        expectedGrade: 'D',
        reason: 'Incorrect - kingdom is wrong term'
      }
    ]
  },
  {
    qNum: 2,
    rubric: testData[1].rubric,
    cases: [
      {
        answer: 'The U.S. Constitution is the supreme law of the land and it must be followed above all other laws and serves as the foundation for our government',
        expectedGrade: 'A',
        reason: 'Mentions Constitution, supreme, and explains why'
      },
      {
        answer: 'The U.S. Constitution',
        expectedGrade: 'B',
        reason: 'Correctly identifies the Constitution'
      },
      {
        answer: 'The law is really important for America',
        expectedGrade: 'C',
        reason: 'Mentions law but lacks clarity on what'
      },
      {
        answer: 'The President is the supreme law',
        expectedGrade: 'D',
        reason: 'Incorrect - president is not the supreme law'
      }
    ]
  },
  {
    qNum: 3,
    rubric: testData[2].rubric,
    cases: [
      {
        answer: 'The Constitution forms the government by creating three branches, defines powers for each branch, and protects the rights of citizens',
        expectedGrade: 'A',
        reason: 'Names two functions with explanation'
      },
      {
        answer: 'It protects the rights of people',
        expectedGrade: 'B',
        reason: 'Names one correct function (protects rights)'
      },
      {
        answer: 'It talks about what the government does',
        expectedGrade: 'C',
        reason: 'Incomplete understanding'
      },
      {
        answer: 'Uhhhh I am not really sure',
        expectedGrade: 'D',
        reason: 'Cannot name a function - content too brief'
      }
    ]
  },
  {
    qNum: 4,
    rubric: testData[3].rubric,
    cases: [
      {
        answer: 'It means popular sovereignty where the government has the consent of the governed - that power comes from the people',
        expectedGrade: 'A',
        reason: 'Explains sovereignty AND mentions consent'
      },
      {
        answer: 'Popular sovereignty - the power belongs to the people',
        expectedGrade: 'B',
        reason: 'Explains one key concept'
      },
      {
        answer: 'Something about people and freedom',
        expectedGrade: 'C',
        reason: 'Vague, partial understanding'
      },
      {
        answer: 'The name of the government',
        expectedGrade: 'D',
        reason: 'Incorrect understanding'
      }
    ]
  },
  {
    qNum: 5,
    rubric: testData[4].rubric,
    cases: [
      {
        answer: 'Changes are made through the amendment process which requires a proposal by two-thirds of Congress and ratification by three-fourths of the states',
        expectedGrade: 'A',
        reason: 'Names amendment AND explains both steps'
      },
      {
        answer: 'Amendments are how you change the Constitution',
        expectedGrade: 'B',
        reason: 'Correctly identifies amendments'
      },
      {
        answer: 'Congress can change it sometimes',
        expectedGrade: 'C',
        reason: 'Partial - mentions process but incomplete'
      },
      {
        answer: 'The President decides what changes',
        expectedGrade: 'D',
        reason: 'Incorrect - President alone cannot change Constitution'
      }
    ]
  },
  {
    qNum: 6,
    rubric: testData[5].rubric,
    cases: [
      {
        answer: 'The Bill of Rights protects basic freedoms including freedom of speech, freedom of religion, the right to vote, and the right to bear arms',
        expectedGrade: 'A',
        reason: 'Names basic rights AND specific examples'
      },
      {
        answer: 'It protects the rights of Americans',
        expectedGrade: 'B',
        reason: 'Correctly identifies basic rights'
      },
      {
        answer: 'It has some important stuff about people',
        expectedGrade: 'C',
        reason: 'Vague understanding'
      },
      {
        answer: 'It prevents people from doing things',
        expectedGrade: 'D',
        reason: 'Incorrect - it protects rights, not restricts'
      }
    ]
  },
  {
    qNum: 7,
    rubric: testData[6].rubric,
    cases: [
      {
        answer: 'There are 27 amendments',
        expectedGrade: 'A',
        reason: 'States 27 amendments with confidence'
      },
      {
        answer: 'I believe it is 27 amendments',
        expectedGrade: 'B',
        reason: 'States 27 amendments'
      },
      {
        answer: 'I think like 30 or so amendments',
        expectedGrade: 'C',
        reason: 'Close but incorrect number'
      },
      {
        answer: 'I do not know',
        expectedGrade: 'D',
        reason: 'No response'
      }
    ]
  },
  {
    qNum: 8,
    rubric: testData[7].rubric,
    cases: [
      {
        answer: 'The Declaration of Independence was important because it declared that the American colonies were free from Britain and it asserted that all people have inherent and universal rights',
        expectedGrade: 'A',
        reason: 'States freedom AND explains rights concept'
      },
      {
        answer: 'It said the colonies were free from British rule',
        expectedGrade: 'B',
        reason: 'States freedom from Britain'
      },
      {
        answer: 'It was about independence and stuff',
        expectedGrade: 'C',
        reason: 'Vague'
      },
      {
        answer: 'It was about the president',
        expectedGrade: 'D',
        reason: 'Incorrect'
      }
    ]
  },
  {
    qNum: 9,
    rubric: testData[8].rubric,
    cases: [
      {
        answer: 'The Declaration of Independence was the document that said the American colonies were free from British rule and it was written by the founding fathers in 1776',
        expectedGrade: 'A',
        reason: 'Identifies Declaration AND provides context'
      },
      {
        answer: 'The Declaration of Independence',
        expectedGrade: 'B',
        reason: 'Correctly identifies the document'
      },
      {
        answer: 'Some founding document about freedom',
        expectedGrade: 'C',
        reason: 'Partial - mentions document but vague'
      },
      {
        answer: 'The Constitution maybe',
        expectedGrade: 'D',
        reason: 'Wrong document'
      }
    ]
  },
  {
    qNum: 10,
    rubric: testData[9].rubric,
    cases: [
      {
        answer: 'From the Declaration: equality of all people and inherent rights. From the Constitution: limited government and self-government by the people',
        expectedGrade: 'A',
        reason: 'Names two ideas from each with explanation'
      },
      {
        answer: 'Equality, liberty, limited government',
        expectedGrade: 'B',
        reason: 'Names two correct ideas'
      },
      {
        answer: 'Freedom and laws',
        expectedGrade: 'C',
        reason: 'Vague ideas'
      },
      {
        answer: 'um I am not sure',
        expectedGrade: 'D',
        reason: 'Cannot name ideas - too brief'
      }
    ]
  }
];

/**
 * Run all tests and report results
 */
function runTests() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   Comprehensive Scoring Algorithm Tests');
  console.log('   Testing against actual civics_128.json rubrics');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let totalTests = 0;
  let passedTests = 0;
  const resultsByGrade = { A: { passed: 0, total: 0 }, B: { passed: 0, total: 0 }, C: { passed: 0, total: 0 }, D: { passed: 0, total: 0 } };
  const failedCases = [];

  // Run all test cases
  testCases.forEach(({ qNum, rubric, cases }) => {
    console.log(`📋 Question ${qNum}: "${testData[qNum - 1].question.substring(0, 50)}..."\n`);

    cases.forEach(({ answer, expectedGrade, reason }) => {
      const result = scoreAnswer(answer, rubric, {
        questionId: `q${qNum}`,
        expectedAnswers: testData[qNum - 1]?.answers || [],
      });
      const passed = result.grade === expectedGrade;

      totalTests++;
      resultsByGrade[expectedGrade].total++;

      if (passed) {
        passedTests++;
        resultsByGrade[expectedGrade].passed++;
        console.log(`  ✅ ${expectedGrade}-grade test`);
      } else {
        resultsByGrade[expectedGrade].passed += 0;
        failedCases.push({
          qNum,
          expected: expectedGrade,
          got: result.grade,
          answer: answer.substring(0, 60),
          reason
        });
        console.log(`  ❌ ${expectedGrade}-grade test (got ${result.grade})`);
      }

      console.log(`     Expected: ${expectedGrade} | Got: ${result.grade} (${(result.confidence * 100).toFixed(0)}% confidence)`);
      console.log(`     Reason: ${reason}`);
      console.log(`     Feedback: "${result.feedback.substring(0, 60)}..."\n`);
    });
  });

  // Summary
  const overallAccuracy = ((passedTests / totalTests) * 100).toFixed(1);
  const status = overallAccuracy >= 85 ? '✅ PASS' : overallAccuracy >= 70 ? '🟡 PARTIAL' : '❌ NEEDS WORK';

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 OVERALL RESULTS: ${passedTests}/${totalTests} passed (${overallAccuracy}%)`);
  console.log(`${status}\n`);

  console.log('Grade Breakdown:');
  ['A', 'B', 'C', 'D'].forEach(grade => {
    const stats = resultsByGrade[grade];
    const accuracy = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(0) : 'N/A';
    console.log(`  ${grade}-grade: ${stats.passed}/${stats.total} (${accuracy}%)`);
  });

  if (failedCases.length > 0) {
    console.log('\n⚠️  Failed Cases:');
    failedCases.forEach(({ qNum, expected, got, answer, reason }) => {
      console.log(`  Q${qNum}: Expected ${expected}, got ${got}`);
      console.log(`    Answer: "${answer}..."`);
      console.log(`    Reason: ${reason}\n`);
    });
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  return overallAccuracy >= 85;
}

// Run tests
const success = runTests();
process.exit(success ? 0 : 1);
