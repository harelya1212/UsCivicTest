#!/usr/bin/env node

/**
 * Add rubric metadata to civics question bank for Phase 2 Interview Mode
 * Enriches first 10 questions with 4-level rubric (A/B/C/D)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bankPath = path.join(__dirname, '../civics_128.json');

// Rubric definitions for first 10 questions
const rubrics = {
  1: {
    question: "What is the form of government of the United States?",
    rubric: {
      A: "Identifies as republic/federal republic AND explains representative nature",
      B: "Identifies as republic or federal republic",
      C: "Mentions government type but vague or partially correct",
      D: "Incorrect or off-topic response",
    },
  },
  2: {
    question: "What is the supreme law of the land?",
    rubric: {
      A: "Identifies Constitution with clear explanation of supremacy",
      B: "Correctly identifies U.S. Constitution",
      C: "Mentions Constitution but lacks clarity",
      D: "Incorrect or no reference to Constitution",
    },
  },
  3: {
    question: "Name one thing the U.S. Constitution does.",
    rubric: {
      A: "Names two or more correct functions with explanation",
      B: "Names one correct function (forms government, defines powers, protects rights)",
      C: "Attempts to describe function but incomplete",
      D: "Incorrect or cannot name a function",
    },
  },
  4: {
    question: 'The U.S. Constitution starts with the words "We the People." What does "We the People" mean?',
    rubric: {
      A: "Explains popular sovereignty/self-government AND mentions consent of governed",
      B: "Explains popular sovereignty, self-government, or consent of governed",
      C: "Partial explanation showing some understanding",
      D: "Incorrect definition or off-topic",
    },
  },
  5: {
    question: "How are changes made to the U.S. Constitution?",
    rubric: {
      A: "Identifies amendment process AND explains steps (proposal + ratification)",
      B: "Correctly identifies amendments as the method",
      C: "Mentions amendment but incomplete process description",
      D: "Incorrect or vague about amendment process",
    },
  },
  6: {
    question: "What does the Bill of Rights protect?",
    rubric: {
      A: "Identifies basic rights of people AND names specific rights (speech, religion, etc.)",
      B: "Correctly identifies basic rights of Americans/residents",
      C: "Mentions rights but vague or incomplete",
      D: "Incorrect or cannot answer",
    },
  },
  7: {
    question: "How many amendments does the U.S. Constitution have?",
    rubric: {
      A: "States 27 amendments with confidence",
      B: "States 27 amendments",
      C: "Attempt with approximate number or hesitation",
      D: "Incorrect number or no answer",
    },
  },
  8: {
    question: "Why is the Declaration of Independence important?",
    rubric: {
      A: "States freedom from Britain AND explains concept of universal/inherent rights",
      B: "States freedom from Britain OR explains rights/equality",
      C: "Partial understanding of significance",
      D: "Incorrect or off-topic",
    },
  },
  9: {
    question: "What founding document said the American colonies were free from Britain?",
    rubric: {
      A: "Identifies Declaration of Independence AND explains context",
      B: "Correctly identifies Declaration of Independence",
      C: "Approximate or hesitant answer",
      D: "Incorrect document or no answer",
    },
  },
  10: {
    question: "Name two important ideas from the Declaration of Independence and the U.S. Constitution.",
    rubric: {
      A: "Names two ideas from each document with explanation",
      B: "Names two correct ideas (equality, liberty, rights, limited govt, self-govt)",
      C: "Names one idea or vague concepts",
      D: "Cannot name ideas or incorrect",
    },
  },
};

async function enrichQuestionBank() {
  try {
    // Read existing question bank
    const data = fs.readFileSync(bankPath, 'utf8');
    const questions = JSON.parse(data);

    // Add rubrics to first 10 questions
    questions.forEach((q) => {
      if (rubrics[q.id]) {
        q.rubric = rubrics[q.id].rubric;
      }
    });

    // Write back
    fs.writeFileSync(bankPath, JSON.stringify(questions, null, 2));

    console.log(`✓ Rubric enrichment complete: Added rubrics to questions 1-10`);
    console.log(`  File: ${bankPath}`);
  } catch (error) {
    console.error('[Enrichment Error]', error.message);
    process.exit(1);
  }
}

enrichQuestionBank();
