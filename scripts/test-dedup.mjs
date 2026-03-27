// Quick test: CIVICS_002 should never produce "The Constitution" as a wrong answer
import { CIVICS_QUESTION_BANK } from '../civicsQuestionBank.js';
import { generateQuizQuestion } from '../quizHelpers.js';

const q2 = CIVICS_QUESTION_BANK.naturalization128[1]; // CIVICS_002
console.log('Q:', q2.question);
console.log('Correct:', q2.correctAnswer);

let foundDuplicate = false;
for (let i = 0; i < 50; i++) {
  const quiz = generateQuizQuestion(q2, 'easy');
  const opts = quiz.options;
  const bad = opts.filter(o =>
    o !== quiz.answer && o.toLowerCase().replace(/[^a-z]/g, '').includes('constitution')
  );
  if (bad.length > 0) {
    console.log(`Run ${i}: BAD options similar to answer:`, bad, '| All options:', opts);
    foundDuplicate = true;
  }
}
if (!foundDuplicate) {
  console.log('✅ No duplicate-looking options found in 50 runs');
} else {
  process.exit(1);
}
