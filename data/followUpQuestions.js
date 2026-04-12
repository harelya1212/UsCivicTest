/**
 * Follow-Up Questions for Interview Mode
 * Used when student scores C or D on main question
 * Provides second attempt with simpler, diagnostic question
 */

const followUpQuestions = [
  {
    mainQuestionId: 'q1',
    mainQuestion: 'What is the form of government of the United States?',
    followUpQuestion: 'Is the United States a democracy, a monarchy, or a dictatorship?',
    followUpRubric: {
      A: 'Correctly identifies democracy',
      B: 'Correctly identifies democracy',
      C: 'Attempts to identify form of government',
      D: 'Incorrect or no response'
    },
    explanation: 'Follow-up focuses on multiple choice to help students identify the basic form'
  },
  {
    mainQuestionId: 'q2',
    mainQuestion: 'What is the supreme law of the land?',
    followUpQuestion: 'Is it the President, Congress, or the Constitution that is the highest law?',
    followUpRubric: {
      A: 'Correctly identifies Constitution',
      B: 'Correctly identifies Constitution',
      C: 'Attempts to identify a document or law',
      D: 'Incorrect or no response'
    },
    explanation: 'Follow-up provides multiple choice to clarify the concept'
  },
  {
    mainQuestionId: 'q3',
    mainQuestion: 'Name one thing the U.S. Constitution does.',
    followUpQuestion: 'Does the Constitution create the government, protect rights, or collect taxes?',
    followUpRubric: {
      A: 'Names any correct function',
      B: 'Names any correct function',
      C: 'Attempts to name a function',
      D: 'Incorrect or no response'
    },
    explanation: 'Follow-up offers choices to identify one main purpose'
  },
  {
    mainQuestionId: 'q4',
    mainQuestion: 'What does "We the People" mean?',
    followUpQuestion: 'Does "We the People" mean the power comes from the people, all people are equal, or people have freedom?',
    followUpRubric: {
      A: 'Identifies power from people',
      B: 'Identifies power from people',
      C: 'Attempts to explain concept',
      D: 'Incorrect or no response'
    },
    explanation: 'Follow-up uses multiple choice format for clarity'
  },
  {
    mainQuestionId: 'q5',
    mainQuestion: 'How are changes made to the U.S. Constitution?',
    followUpQuestion: 'Are changes made by the President only, by Congress only, or through a special amendment process?',
    followUpRubric: {
      A: 'Correctly identifies amendment process',
      B: 'Correctly identifies amendment process',
      C: 'Attempts to identify a process',
      D: 'Incorrect or no response'
    },
    explanation: 'Follow-up clarifies that it requires a special process, not just one branch'
  },
  {
    mainQuestionId: 'q6',
    mainQuestion: 'What does the Bill of Rights protect?',
    followUpQuestion: 'Does the Bill of Rights protect freedom of speech, the right to vote, or the right to own property?',
    followUpRubric: {
      A: 'Identifies correct right',
      B: 'Identifies correct right',
      C: 'Attempts to identify a right ',
      D: 'Incorrect or no response'
    },
    explanation: 'Follow-up uses concrete examples to help students recognize Bill of Rights protections'
  },
  {
    mainQuestionId: 'q7',
    mainQuestion: 'How many amendments does the U.S. Constitution have?',
    followUpQuestion: 'Is it 13, 27, or 50 amendments?',
    followUpRubric: {
      A: 'Correctly states 27',
      B: 'Correctly states 27',
      C: 'Attempts a number',
      D: 'Incorrect or no response'
    },
    explanation: 'Follow-up provides multiple choice for factual recall question'
  },
  {
    mainQuestionId: 'q8',
    mainQuestion: 'Why is the Declaration of Independence important?',
    followUpQuestion: 'Was the Declaration important because it declared independence from Britain, created a new government, or abolished slavery?',
    followUpRubric: {
      A: 'Identifies independence from Britain',
      B: 'Identifies independence from Britain',
      C: 'Identifies any reason',
      D: 'Incorrect or no response'
    },
    explanation: 'Follow-up offers options to identify primary significance'
  },
  {
    mainQuestionId: 'q9',
    mainQuestion: 'What founding document said the American colonies were free from Britain?',
    followUpQuestion: 'Was it the Constitution, the Declaration of Independence, or the Mayflower Compact?',
    followUpRubric: {
      A: 'Correctly identifies Declaration of Independence',
      B: 'Correctly identifies Declaration of Independence',
      C: 'Attempts to identify a document',
      D: 'Incorrect or no response'
    },
    explanation: 'Follow-up disambiguates from other founding documents'
  },
  {
    mainQuestionId: 'q10',
    mainQuestion: 'Name two important ideas from the Declaration of Independence and the U.S. Constitution.',
    followUpQuestion: 'Are freedom, equality, rights, and limited government all important ideas in these documents?',
    followUpRubric: {
      A: 'Correctly identifies two concepts',
      B: 'Correctly identifies two concepts',
      C: 'Identifies one concept',
      D: 'Cannot identify concepts'
    },
    explanation: 'Follow-up offers guided reflection with specific concept list'
  }
];

export { followUpQuestions };
