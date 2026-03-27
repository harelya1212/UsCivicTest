import { CIVICS_QUESTION_BANK } from '../civicsQuestionBank.js';
import { generateQuizQuestion } from '../quizHelpers.js';

const banks = ['naturalization128', 'naturalization100', 'highschool'];
const diffs = ['easy', 'medium', 'hard'];
let failures = [];
let total = 0;

for (const bankName of banks) {
  const bank = CIVICS_QUESTION_BANK[bankName] || [];
  for (const q of bank) {
    for (const d of diffs) {
      total++;
      const quiz = generateQuizQuestion(q, d);
      const opts = Array.isArray(quiz.options) ? quiz.options : [];
      const norm = opts.map(v => String(v).trim().toLowerCase());
      const unique = new Set(norm).size;
      const correctCount = norm.filter(v => v === String(quiz.answer).trim().toLowerCase()).length;
      if (opts.length !== 4 || unique !== 4 || correctCount !== 1) {
        failures.push({ id: q.id, bank: bankName, difficulty: d, optionsLength: opts.length, unique, correctCount });
      }
    }
  }
}

console.log('Checked combinations:', total);
if (failures.length) {
  console.log('FAILURES:', failures.length);
  console.log(JSON.stringify(failures.slice(0, 5), null, 2));
  process.exit(1);
}

// Verify new fields on a few questions
const q1 = CIVICS_QUESTION_BANK.naturalization128[0];
const q29 = CIVICS_QUESTION_BANK.naturalization128[28]; // CIVICS_029 dynamic
console.log('Q1 imageUrl:', q1.imageUrl ? q1.imageUrl.substring(0, 60) + '...' : 'null');
console.log('Q1 topic:', q1.topic, '/', q1.subTopic);
console.log('Q29 (dynamic) imageUrl:', q29.imageUrl);
console.log('Q29 topic:', q29.topic);
console.log('OK - all tests passed');
