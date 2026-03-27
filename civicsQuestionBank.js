// Complete USCIS Civics Test Questions
// Official 2026 USCIS 128 Civics Test Questions and Answers
// Source: https://www.uscis.gov/citizenship/civics-test-study-materials
// Enriched with imageUrl + topic + subTopic from civics-questions-2026-02-06.csv

// Define all 128 official USCIS civics questions
const civicsQuestions = [
  {
    id: 'CIVICS_001',
    question: 'What is the form of government of the United States?',
    correctAnswer: 'Republic',
    alternateAnswers: ["Constitution-based federal republic","Representative democracy"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/06371a259_generated_image.png',
    topic: 'American Government',
    subTopic: 'Principles',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_002',
    question: 'What is the supreme law of the land?',
    correctAnswer: '(U.S.) Constitution',
    alternateAnswers: [],
    category: '65/20 Special',
    is_65_20: true,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/3539a33f4_generated_image.png',
    topic: 'American Government',
    subTopic: 'Principles',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_003',
    question: 'Name one thing the U.S. Constitution does.',
    correctAnswer: 'Forms the government',
    alternateAnswers: ["Defines powers of government","Defines the parts of government","Protects the rights of the people"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/fc4df5b1e_generated_image.png',
    topic: 'American Government',
    subTopic: 'Principles',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_004',
    question: 'The U.S. Constitution starts with the words “We the People.” What does “We the People” mean?',
    correctAnswer: 'Self-government',
    alternateAnswers: ["Popular sovereignty","Consent of the governed","People should govern themselves","(Example of) social contract"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/2f69e1103_generated_image.png',
    topic: 'American Government',
    subTopic: 'Principles',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_005',
    question: 'How are changes made to the U.S. Constitution?',
    correctAnswer: 'Amendments',
    alternateAnswers: ["The amendment process"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/d266c1597_generated_image.png',
    topic: 'American Government',
    subTopic: 'Principles',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_006',
    question: 'What does the Bill of Rights protect?',
    correctAnswer: '(The basic) rights of people in the United States',
    alternateAnswers: ["(The basic) rights of people living in the United States"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/e7616352e_generated_image.png',
    topic: 'American Government',
    subTopic: 'Principles',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_007',
    question: 'How many amendments does the U.S. Constitution have?',
    correctAnswer: 'Twenty-seven (27)',
    alternateAnswers: [],
    category: '65/20 Special',
    is_65_20: true,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/c9ab1e478_generated_image.png',
    topic: 'American Government',
    subTopic: 'Principles',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_008',
    question: 'Why is the Declaration of Independence important?',
    correctAnswer: 'It says America is free from British control.',
    alternateAnswers: ["It says all people are created equal.","It identifies inherent rights.","It identifies individual freedoms."],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/76c83485e_generated_image.png',
    topic: 'American Government',
    subTopic: 'Principles',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_009',
    question: 'What founding document said the American colonies were free from Britain?',
    correctAnswer: 'Declaration of Independence',
    alternateAnswers: [],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/78cbe68a8_generated_image.png',
    topic: 'American Government',
    subTopic: 'Principles',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_010',
    question: 'Name two important ideas from the Declaration of Independence and the U.S. Constitution.',
    correctAnswer: 'Equality',
    alternateAnswers: ["Liberty","Social contract","Natural rights","Limited government","Self-government"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/071de79f6_generated_image.png',
    topic: 'American Government',
    subTopic: 'Principles',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_011',
    question: 'The words “Life, Liberty, and the pursuit of Happiness” are in what founding document?',
    correctAnswer: 'Declaration of Independence',
    alternateAnswers: [],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/583c3bfe5_generated_image.png',
    topic: 'American Government',
    subTopic: 'Principles',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_012',
    question: 'What is the economic system of the United States?',
    correctAnswer: 'Capitalism',
    alternateAnswers: ["Free market economy"],
    category: '65/20 Special',
    is_65_20: true,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/13ab54737_generated_image.png',
    topic: 'American Government',
    subTopic: 'Principles',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_013',
    question: 'What is the rule of law?',
    correctAnswer: 'Everyone must follow the law.',
    alternateAnswers: ["Leaders must obey the law.","Government must obey the law.","No one is above the law."],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/46da765cb_generated_image.png',
    topic: 'American Government',
    subTopic: 'Principles',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_014',
    question: 'Many documents influenced the U.S. Constitution. Name one.',
    correctAnswer: 'Declaration of Independence',
    alternateAnswers: ["Articles of Confederation","Federalist Papers","Anti-Federalist Papers","Virginia Declaration of Rights","Fundamental Orders of Connecticut","Mayflower Compact","Iroquois Great Law of Peace"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/cccff0f1a_generated_image.png',
    topic: 'American Government',
    subTopic: 'Principles',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_015',
    question: 'There are three branches of government. Why?',
    correctAnswer: 'So one part does not become too powerful',
    alternateAnswers: ["Checks and balances","Separation of powers"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/02779272f_generated_image.png',
    topic: 'American Government',
    subTopic: 'Principles',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_016',
    question: 'Name the three branches of government.',
    correctAnswer: 'Legislative, executive, and judicial',
    alternateAnswers: ["Congress, president, and the courts"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/3bdb913e8_generated_image.png',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_017',
    question: 'The President of the United States is in charge of which branch of government?',
    correctAnswer: 'Executive branch',
    alternateAnswers: [],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/918b9b626_generated_image.png',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_018',
    question: 'What part of the federal government writes laws?',
    correctAnswer: '(U.S.) Congress',
    alternateAnswers: ["(U.S. or national) legislature","Legislative branch"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/2152345ac_generated_image.png',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_019',
    question: 'What are the two parts of the U.S. Congress?',
    correctAnswer: 'Senate and House (of Representatives)',
    alternateAnswers: [],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/89a984b4c_generated_image.png',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_020',
    question: 'Name one power of the U.S. Congress.',
    correctAnswer: 'Writes laws',
    alternateAnswers: ["Declares war","Makes the federal budget"],
    category: '65/20 Special',
    is_65_20: true,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/aa36f134c_generated_image.png',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_021',
    question: 'How many U.S. senators are there?',
    correctAnswer: 'One hundred (100)',
    alternateAnswers: [],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/ec64bc34e_generated_image.png',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_022',
    question: 'How long is a term for a U.S. senator?',
    correctAnswer: 'Six (6) years',
    alternateAnswers: [],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/3b4bb7c0a_generated_image.png',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_023',
    question: 'Who is one of your state’s U.S. senators now?',
    correctAnswer: 'Answers will vary. [District of Columbia residents and residents of U.S. territories should answer that D.C. (or',
    alternateAnswers: [],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/3ab8143ce_generated_image.png',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_024',
    question: 'How many voting members are in the House of Representatives?',
    correctAnswer: 'Four hundred thirty-five (435)',
    alternateAnswers: [],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/31ea25bdd_generated_image.png',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_025',
    question: 'How long is a term for a member of the House of Representatives?',
    correctAnswer: 'Two (2) years',
    alternateAnswers: [],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/a95fcb55a_generated_image.png',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_026',
    question: 'Why do U.S. representatives serve shorter terms than U.S. senators?',
    correctAnswer: 'To more closely follow public opinion',
    alternateAnswers: [],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/ea535200f_generated_image.png',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_027',
    question: 'How many senators does each state have?',
    correctAnswer: 'Two (2)',
    alternateAnswers: [],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/f1e9671bd_generated_image.png',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_028',
    question: 'Why does each state have two senators?',
    correctAnswer: 'Equal representation (for small states)',
    alternateAnswers: ["The Great Compromise (Connecticut Compromise)"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/54f12b836_generated_image.png',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_029',
    question: 'Name your U.S. representative.',
    correctAnswer: 'Answers will vary. [Residents of territories with nonvoting Delegates or Resident Commissioners may provide',
    alternateAnswers: [],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/US_Capitol_Building_at_night_Jan_2006.jpg/480px-US_Capitol_Building_at_night_Jan_2006.jpg',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_030',
    question: 'What is the name of the Speaker of the House of Representatives now?',
    correctAnswer: 'Visit uscis.gov/citizenship/testupdates for the name of the Speaker of the House of Representatives.',
    alternateAnswers: [],
    category: '65/20 Special',
    is_65_20: true,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/US_Capitol_Building_at_night_Jan_2006.jpg/480px-US_Capitol_Building_at_night_Jan_2006.jpg',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_031',
    question: 'Who does a U.S. senator represent?',
    correctAnswer: 'People of their state',
    alternateAnswers: ["Citizens of their state"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/6e68c3c54_generated_image.png',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_032',
    question: 'Who elects U.S. senators?',
    correctAnswer: 'Citizens from their state',
    alternateAnswers: [],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/d9334ffa7_generated_image.png',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_033',
    question: 'Who does a member of the House of Representatives represent?',
    correctAnswer: 'Citizens in their (congressional) district',
    alternateAnswers: ["Citizens in their district","People from their (congressional) district","People in their district"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/af5305ba1_generated_image.png',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_034',
    question: 'Who elects members of the House of Representatives?',
    correctAnswer: 'Citizens from their (congressional) district',
    alternateAnswers: [],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/a1ce7d722_generated_image.png',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_035',
    question: 'Some states have more representatives than other states. Why?',
    correctAnswer: '(Because of) the state’s population',
    alternateAnswers: ["(Because) they have more people","(Because) some states have more people"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/89bcb57da_generated_image.png',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_036',
    question: 'The President of the United States is elected for how many years?',
    correctAnswer: 'Four (4) years',
    alternateAnswers: [],
    category: '65/20 Special',
    is_65_20: true,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/fa2e02e79_generated_image.png',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_037',
    question: 'The President of the United States can serve only two terms. Why?',
    correctAnswer: '(Because of) the 22nd Amendment',
    alternateAnswers: ["To keep the president from becoming too powerful"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/60b8be23a_generated_image.png',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_038',
    question: 'What is the name of the President of the United States now?',
    correctAnswer: 'Visit uscis.gov/citizenship/testupdates for the name of the President of the United States.',
    alternateAnswers: [],
    category: '65/20 Special',
    is_65_20: true,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/White_House_-_2006_-_during_snow.JPG/480px-White_House_-_2006_-_during_snow.JPG',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_039',
    question: 'What is the name of the Vice President of the United States now?',
    correctAnswer: 'Visit uscis.gov/citizenship/testupdates for the name of the Vice President of the United States.',
    alternateAnswers: [],
    category: '65/20 Special',
    is_65_20: true,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/White_House_-_2006_-_during_snow.JPG/480px-White_House_-_2006_-_during_snow.JPG',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_040',
    question: 'If the president can no longer serve, who becomes president?',
    correctAnswer: 'The Vice President (of the United States)',
    alternateAnswers: [],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/a44655572_generated_image.png',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_041',
    question: 'Name one power of the president.',
    correctAnswer: 'Signs bills into law',
    alternateAnswers: ["Vetoes bills","Enforces laws","Commander in Chief (of the military)","Chief diplomat","Appoints federal judges"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/e91b60641_generated_image.png',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_042',
    question: 'Who is Commander in Chief of the U.S. military?',
    correctAnswer: 'The President (of the United States)',
    alternateAnswers: [],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/cc8d66ebf_generated_image.png',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_043',
    question: 'Who signs bills to become laws?',
    correctAnswer: 'The President (of the United States)',
    alternateAnswers: [],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/96ca0623b_generated_image.png',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_044',
    question: 'Who vetoes bills?',
    correctAnswer: 'The President (of the United States)',
    alternateAnswers: [],
    category: '65/20 Special',
    is_65_20: true,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/cb514a06b_generated_image.png',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_045',
    question: 'Who appoints federal judges?',
    correctAnswer: 'The President (of the United States)',
    alternateAnswers: [],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/e691f1bc8_generated_image.png',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_046',
    question: 'The executive branch has many parts. Name one.',
    correctAnswer: 'President (of the United States)',
    alternateAnswers: ["Cabinet","Federal departments and agencies"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/White_House_-_2006_-_during_snow.JPG/480px-White_House_-_2006_-_during_snow.JPG',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_047',
    question: 'What does the President’s Cabinet do?',
    correctAnswer: 'Advises the President (of the United States)',
    alternateAnswers: [],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/White_House_-_2006_-_during_snow.JPG/480px-White_House_-_2006_-_during_snow.JPG',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_048',
    question: 'What are two Cabinet-level positions?',
    correctAnswer: 'Attorney General',
    alternateAnswers: ["Secretary of Agriculture","Secretary of Commerce","Secretary of Education","Secretary of Energy","Secretary of Health and Human Services","Secretary of Homeland Security","Secretary of Housing and Urban Development","Secretary of the Interior","Secretary of Labor","Secretary of State","Secretary of Transportation","Secretary of the Treasury","Secretary of Veterans Affairs","Secretary of War (Defense)","Vice-President","Administrator of the Environmental Protection Agency","Administrator of the Small Business Administration","Director of the Central Intelligence Agency","Director of the Office of Management and Budget","Director of National Intelligence","United States Trade Representative"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/White_House_-_2006_-_during_snow.JPG/480px-White_House_-_2006_-_during_snow.JPG',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_049',
    question: 'Why is the Electoral College important?',
    correctAnswer: 'It decides who is elected president.',
    alternateAnswers: ["It provides a compromise between the popular election of the president and congressional selection."],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/f23c4514f_generated_image.png',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_050',
    question: 'What is one part of the judicial branch?',
    correctAnswer: 'Supreme Court',
    alternateAnswers: ["Federal Courts"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/b3607fe0d_generated_image.png',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_051',
    question: 'What does the judicial branch do?',
    correctAnswer: 'Reviews laws',
    alternateAnswers: ["Explains laws","Resolves disputes (disagreements) about the law","Decides if a law goes against the (U.S.) Constitution"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/cd63a7409_generated_image.png',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_052',
    question: 'What is the highest court in the United States?',
    correctAnswer: 'Supreme Court',
    alternateAnswers: [],
    category: '65/20 Special',
    is_65_20: true,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/a70435959_generated_image.png',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_053',
    question: 'How many seats are on the Supreme Court?',
    correctAnswer: 'Nine (9)',
    alternateAnswers: [],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/7614f6e85_generated_image.png',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_054',
    question: 'How many Supreme Court justices are usually needed to decide a case?',
    correctAnswer: 'Five (5)',
    alternateAnswers: [],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/660b55b17_generated_image.png',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_055',
    question: 'How long do Supreme Court justices serve?',
    correctAnswer: '(For) life',
    alternateAnswers: ["Lifetime appointment","(Until) retirement"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/cfb757194_generated_image.png',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_056',
    question: 'Supreme Court justices serve for life. Why?',
    correctAnswer: 'To be independent (of politics)',
    alternateAnswers: ["To limit outside (political) influence"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/481a8d759_generated_image.png',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_057',
    question: 'Who is the Chief Justice of the United States now?',
    correctAnswer: 'Visit uscis.gov/citizenship/testupdates for the name of the Chief Justice of the United States.',
    alternateAnswers: [],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/55b0f7081_generated_image.png',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_058',
    question: 'Name one power that is only for the federal government.',
    correctAnswer: 'Print paper money',
    alternateAnswers: ["Mint coins","Declare war","Create an army","Make treaties","Set foreign policy"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/55ef20f94_generated_image.png',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_059',
    question: 'Name one power that is only for the states.',
    correctAnswer: 'Provide schooling and education',
    alternateAnswers: ["Provide protection (police)","Provide safety (fire departments)","Give a driver’s license","Approve zoning and land use"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/7f9f1b4fc_generated_image.png',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_060',
    question: 'What is the purpose of the 10th Amendment?',
    correctAnswer: '(It states that the) powers not given to the federal government belong to the states or to the people.',
    alternateAnswers: [],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/0c16b214c_generated_image.png',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_061',
    question: 'Who is the governor of your state now?',
    correctAnswer: 'Answers will vary. [District of Columbia residents should answer that D.C. does not have a governor.]',
    alternateAnswers: [],
    category: '65/20 Special',
    is_65_20: true,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/0dc029767_generated_image.png',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_062',
    question: 'What is the capital of your state?',
    correctAnswer: 'Answers will vary. [District of Columbia residents should answer that D.C. is not a state and does not have a',
    alternateAnswers: [],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/dbd112b34_generated_image.png',
    topic: 'American Government',
    subTopic: 'System of Government',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_063',
    question: 'There are four amendments to the U.S. Constitution about who can vote. Describe one of them.',
    correctAnswer: 'Citizens eighteen (18) and older (can vote).',
    alternateAnswers: ["You don’t have to pay (a poll tax) to vote.","Any citizen can vote. (Women and men can vote.)","A male citizen of any race (can vote)."],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/a71ac4057_generated_image.png',
    topic: 'American Government',
    subTopic: 'Rights & Responsibilities',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_064',
    question: 'Who can vote in federal elections, run for federal office, and serve on a jury in the United States?',
    correctAnswer: 'Citizens',
    alternateAnswers: ["Citizens of the United States","U.S. citizens"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/52a3f5ecc_generated_image.png',
    topic: 'American Government',
    subTopic: 'Rights & Responsibilities',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_065',
    question: 'What are three rights of everyone living in the United States?',
    correctAnswer: 'Freedom of expression',
    alternateAnswers: ["Freedom of speech","Freedom of assembly","Freedom to petition the government","Freedom of religion","The right to bear arms"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/edcde16f2_generated_image.png',
    topic: 'American Government',
    subTopic: 'Rights & Responsibilities',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_066',
    question: 'What do we show loyalty to when we say the Pledge of Allegiance?',
    correctAnswer: 'The United States',
    alternateAnswers: ["The flag"],
    category: '65/20 Special',
    is_65_20: true,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/df3c7030c_generated_image.png',
    topic: 'American Government',
    subTopic: 'Rights & Responsibilities',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_067',
    question: 'Name two promises that new citizens make in the Oath of Allegiance.',
    correctAnswer: 'Give up loyalty to other countries',
    alternateAnswers: ["Defend the (U.S.) Constitution","Obey the laws of the United States","Serve in the military (if needed)","Serve (help, do important work for) the nation (if needed)","Be loyal to the United States"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/b12ac54b7_generated_image.png',
    topic: 'American Government',
    subTopic: 'Rights & Responsibilities',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_068',
    question: 'How can people become United States citizens?',
    correctAnswer: 'Be born in the United States, under the conditions set by the 14th Amendment',
    alternateAnswers: ["Naturalize","Derive citizenship (under conditions set by Congress)"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/736cac0a1_generated_image.png',
    topic: 'American Government',
    subTopic: 'Rights & Responsibilities',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_069',
    question: 'What are two examples of civic participation in the United States?',
    correctAnswer: 'Vote',
    alternateAnswers: ["Run for office","Join a political party","Help with a campaign","Join a civic group","Join a community group","Give an elected official your opinion (on an issue)","Contact elected officials","Support or oppose an issue or policy","Write to a newspaper"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/f17d63992_generated_image.png',
    topic: 'American Government',
    subTopic: 'Rights & Responsibilities',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_070',
    question: 'What is one way Americans can serve their country?',
    correctAnswer: 'Vote',
    alternateAnswers: ["Pay taxes","Obey the law","Serve in the military","Run for office","Work for local, state, or federal government"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/c062db4f3_generated_image.png',
    topic: 'American Government',
    subTopic: 'Rights & Responsibilities',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_071',
    question: 'Why is it important to pay federal taxes?',
    correctAnswer: 'Required by law',
    alternateAnswers: ["All people pay to fund the federal government","Required by the (U.S.) Constitution (16th Amendment)","Civic duty"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/b3a87cd02_generated_image.png',
    topic: 'American Government',
    subTopic: 'Rights & Responsibilities',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_072',
    question: 'It is important for all men age 18 through 25 to register for the Selective Service. Name one reason why.',
    correctAnswer: 'Required by law',
    alternateAnswers: ["Civic duty","Makes the draft fair, if needed"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/e47f4b9d2_generated_image.png',
    topic: 'American Government',
    subTopic: 'Rights & Responsibilities',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_073',
    question: 'The colonists came to America for many reasons. Name one.',
    correctAnswer: 'Freedom',
    alternateAnswers: ["Political liberty","Religious freedom","Economic opportunity","Escape persecution"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/082a762f3_generated_image.png',
    topic: 'American History',
    subTopic: 'Colonial & Independence',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_074',
    question: 'Who lived in America before the Europeans arrived?',
    correctAnswer: 'American Indians',
    alternateAnswers: ["Native Americans"],
    category: '65/20 Special',
    is_65_20: true,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/60188b457_generated_image.png',
    topic: 'American History',
    subTopic: 'Colonial & Independence',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_075',
    question: 'What group of people was taken and sold as slaves?',
    correctAnswer: 'Africans',
    alternateAnswers: ["People from Africa"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/baef65074_generated_image.png',
    topic: 'American History',
    subTopic: 'Colonial & Independence',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_076',
    question: 'What war did the Americans fight to win independence from Britain?',
    correctAnswer: 'American Revolution',
    alternateAnswers: ["The (American) Revolutionary War","War for (American) Independence"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/d79b60ac4_generated_image.png',
    topic: 'American History',
    subTopic: 'Colonial & Independence',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_077',
    question: 'Name one reason why the Americans declared independence from Britain.',
    correctAnswer: 'High taxes',
    alternateAnswers: ["Taxation without representation","British soldiers stayed in Americans’ houses (boarding, quartering)","They did not have self-government","Boston Massacre","Boston Tea Party (Tea Act)","Stamp Act","Sugar Act","Townshend Acts","Intolerable (Coercive) Acts"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/d1965d839_generated_image.png',
    topic: 'American History',
    subTopic: 'Colonial & Independence',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_078',
    question: 'Who wrote the Declaration of Independence?',
    correctAnswer: '(Thomas) Jefferson',
    alternateAnswers: [],
    category: '65/20 Special',
    is_65_20: true,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/299b2dd19_generated_image.png',
    topic: 'American History',
    subTopic: 'Colonial & Independence',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_079',
    question: 'When was the Declaration of Independence adopted?',
    correctAnswer: 'July 4, 1776',
    alternateAnswers: [],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/8320a5e82_generated_image.png',
    topic: 'American History',
    subTopic: 'Colonial & Independence',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_080',
    question: 'The American Revolution had many important events. Name one.',
    correctAnswer: '(Battle of) Bunker Hill',
    alternateAnswers: ["Declaration of Independence","Washington Crossing the Delaware (Battle of Trenton)","(Battle of) Saratoga","Valley Forge (Encampment)","(Battle of) Yorktown (British surrender at Yorktown)"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/611c50e3e_generated_image.png',
    topic: 'American History',
    subTopic: 'Colonial & Independence',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_081',
    question: 'There were 13 original states. Name five.',
    correctAnswer: 'New Hampshire',
    alternateAnswers: ["Massachusetts","Rhode Island","Connecticut","New York","New Jersey","Pennsylvania","Delaware","Maryland","Virginia","North Carolina","South Carolina","Georgia"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/9e9ad75bd_generated_image.png',
    topic: 'American History',
    subTopic: 'Colonial & Independence',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_082',
    question: 'What founding document was written in 1787?',
    correctAnswer: '(U.S.) Constitution',
    alternateAnswers: [],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/08ef20c7b_generated_image.png',
    topic: 'American History',
    subTopic: 'Colonial & Independence',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_083',
    question: 'The Federalist Papers supported the passage of the U.S. Constitution. Name one of the writers.',
    correctAnswer: '(James) Madison',
    alternateAnswers: ["(Alexander) Hamilton","(John) Jay","Publius"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/44bfa55b1_generated_image.png',
    topic: 'American History',
    subTopic: 'Colonial & Independence',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_084',
    question: 'Why were the Federalist Papers important?',
    correctAnswer: 'They helped people understand the (U.S.) Constitution.',
    alternateAnswers: ["They supported passing the (U.S.) Constitution."],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/f76d6513c_generated_image.png',
    topic: 'American History',
    subTopic: 'Colonial & Independence',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_085',
    question: 'Benjamin Franklin is famous for many things. Name one.',
    correctAnswer: 'Founded the first free public libraries',
    alternateAnswers: ["First Postmaster General of the United States","Helped write the Declaration of Independence","Inventor","U.S. diplomat"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/41549ba13_generated_image.png',
    topic: 'American History',
    subTopic: 'Colonial & Independence',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_086',
    question: 'George Washington is famous for many things. Name one.',
    correctAnswer: '“Father of Our Country”',
    alternateAnswers: ["First president of the United States","General of the Continental Army","President of the Constitutional Convention"],
    category: '65/20 Special',
    is_65_20: true,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/fa0865957_generated_image.png',
    topic: 'American History',
    subTopic: 'Colonial & Independence',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_087',
    question: 'Thomas Jefferson is famous for many things. Name one.',
    correctAnswer: 'Writer of the Declaration of Independence',
    alternateAnswers: ["Third president of the United States","Doubled the size of the United States (Louisiana Purchase)","First Secretary of State","Founded the University of Virginia","Writer of the Virginia Statute on Religious Freedom"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/a079a54ce_generated_image.png',
    topic: 'American History',
    subTopic: 'Colonial & Independence',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_088',
    question: 'James Madison is famous for many things. Name one.',
    correctAnswer: '“Father of the Constitution”',
    alternateAnswers: ["Fourth president of the United States","President during the War of 1812","One of the writers of the Federalist Papers"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/12f60e0da_generated_image.png',
    topic: 'American History',
    subTopic: 'Colonial & Independence',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_089',
    question: 'Alexander Hamilton is famous for many things. Name one.',
    correctAnswer: 'First Secretary of the Treasury',
    alternateAnswers: ["One of the writers of the Federalist Papers","Helped establish the First Bank of the United States","Aide to General George Washington","Member of the Continental Congress"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/e397dd41e_generated_image.png',
    topic: 'American History',
    subTopic: 'Colonial & Independence',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_090',
    question: 'What territory did the United States buy from France in 1803?',
    correctAnswer: 'Louisiana Territory',
    alternateAnswers: ["Louisiana"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/375331634_generated_image.png',
    topic: 'American History',
    subTopic: '1800s',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_091',
    question: 'Name one war fought by the United States in the 1800s.',
    correctAnswer: 'War of 1812',
    alternateAnswers: ["Mexican-American War","Civil War","Spanish-American War"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/aefe4d251_generated_image.png',
    topic: 'American History',
    subTopic: '1800s',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_092',
    question: 'Name the U.S. war between the North and the South.',
    correctAnswer: 'The Civil War',
    alternateAnswers: [],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/4668ff7e3_generated_image.png',
    topic: 'American History',
    subTopic: '1800s',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_093',
    question: 'The Civil War had many important events. Name one.',
    correctAnswer: '(Battle of) Fort Sumter',
    alternateAnswers: ["Emancipation Proclamation","(Battle of) Vicksburg","(Battle of) Gettysburg","Sherman’s March","(Surrender at) Appomattox","(Battle of) Antietam/Sharpsburg","Lincoln was assassinated."],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/ea9daf299_generated_image.png',
    topic: 'American History',
    subTopic: '1800s',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_094',
    question: 'Abraham Lincoln is famous for many things. Name one.',
    correctAnswer: 'Freed the slaves (Emancipation Proclamation)',
    alternateAnswers: ["Saved (or preserved) the Union","Led the United States during the Civil War","16th president of the United States","Delivered the Gettysburg Address"],
    category: '65/20 Special',
    is_65_20: true,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/306f4d5df_generated_image.png',
    topic: 'American History',
    subTopic: '1800s',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_095',
    question: 'What did the Emancipation Proclamation do?',
    correctAnswer: 'Freed the slaves',
    alternateAnswers: ["Freed slaves in the Confederacy","Freed slaves in the Confederate states","Freed slaves in most Southern states"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/51cbe1069_generated_image.png',
    topic: 'American History',
    subTopic: '1800s',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_096',
    question: 'What U.S. war ended slavery?',
    correctAnswer: 'The Civil War',
    alternateAnswers: [],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/4d4cd71f3_generated_image.png',
    topic: 'American History',
    subTopic: '1800s',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_097',
    question: 'What amendment says all persons born or naturalized in the United States are U.S. citizens?',
    correctAnswer: '14th Amendment',
    alternateAnswers: [],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/17a1ce7bd_generated_image.png',
    topic: 'American History',
    subTopic: 'Recent History & Other',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_098',
    question: 'When did all men get the right to vote?',
    correctAnswer: 'With the 15th Amendment',
    alternateAnswers: ["After the Civil War","During Reconstruction","1870"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/42efd2952_generated_image.png',
    topic: 'American History',
    subTopic: 'Recent History & Other',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_099',
    question: 'Name one leader of the women’s rights movement in the 1800s.',
    correctAnswer: 'Susan B. Anthony',
    alternateAnswers: ["Elizabeth Cady Stanton","Sojourner Truth","Harriet Tubman","Lucretia Mott","Lucy Stone"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/e8b08c3a4_generated_image.png',
    topic: 'American History',
    subTopic: 'Recent History & Other',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_100',
    question: 'Name one war fought by the United States in the 1900s.',
    correctAnswer: 'World War I',
    alternateAnswers: ["World War II","Korean War","Vietnam War","(Persian) Gulf War"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/cb17c96a4_generated_image.png',
    topic: 'American History',
    subTopic: 'Recent History & Other',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_101',
    question: 'Why did the United States enter World War I?',
    correctAnswer: 'Because Germany attacked U.S. (civilian) ships',
    alternateAnswers: ["To support the Allied Powers (England, France, Italy, and Russia)","To oppose the Central Powers (Germany, Austria-Hungary, the Ottoman Empire, and Bulgaria)"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/469445221_generated_image.png',
    topic: 'American History',
    subTopic: 'Recent History & Other',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_102',
    question: 'When did all women get the right to vote?',
    correctAnswer: '1920',
    alternateAnswers: ["After World War I","(With the) 19th Amendment"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/ec1d03742_generated_image.png',
    topic: 'American History',
    subTopic: 'Recent History & Other',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_103',
    question: 'What was the Great Depression?',
    correctAnswer: 'Longest economic recession in modern history',
    alternateAnswers: [],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/2158d3381_generated_image.png',
    topic: 'American History',
    subTopic: 'Recent History & Other',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_104',
    question: 'When did the Great Depression start?',
    correctAnswer: 'The Great Crash (1929)',
    alternateAnswers: ["Stock market crash of 1929"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/29655bbd5_generated_image.png',
    topic: 'American History',
    subTopic: 'Recent History & Other',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_105',
    question: 'Who was president during the Great Depression and World War II?',
    correctAnswer: '(Franklin) Roosevelt',
    alternateAnswers: [],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/628cc59b6_generated_image.png',
    topic: 'American History',
    subTopic: 'Recent History & Other',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_106',
    question: 'Why did the United States enter World War II?',
    correctAnswer: '(Bombing of) Pearl Harbor',
    alternateAnswers: ["Japanese attacked Pearl Harbor","To support the Allied Powers (England, France, and Russia)","To oppose the Axis Powers (Germany, Italy, and Japan)"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/037beb25c_generated_image.png',
    topic: 'American History',
    subTopic: 'Recent History & Other',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_107',
    question: 'Dwight Eisenhower is famous for many things. Name one.',
    correctAnswer: 'General during World War II',
    alternateAnswers: ["President at the end of (during) the Korean War","34th president of the United States","Signed the Federal-Aid Highway Act of 1956 (Created the Interstate System)"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/063de1298_generated_image.png',
    topic: 'American History',
    subTopic: 'Recent History & Other',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_108',
    question: 'Who was the United States’ main rival during the Cold War?',
    correctAnswer: 'Soviet Union',
    alternateAnswers: ["USSR","Russia"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/d31e2a847_generated_image.png',
    topic: 'American History',
    subTopic: 'Recent History & Other',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_109',
    question: 'During the Cold War, what was one main concern of the United States?',
    correctAnswer: 'Communism',
    alternateAnswers: ["Nuclear war"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/9ccdc5c2a_generated_image.png',
    topic: 'American History',
    subTopic: 'Recent History & Other',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_110',
    question: 'Why did the United States enter the Korean War?',
    correctAnswer: 'To stop the spread of communism',
    alternateAnswers: [],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/cbb8b6b13_generated_image.png',
    topic: 'American History',
    subTopic: 'Recent History & Other',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_111',
    question: 'Why did the United States enter the Vietnam War?',
    correctAnswer: 'To stop the spread of communism',
    alternateAnswers: [],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/b35ccd4fa_generated_image.png',
    topic: 'American History',
    subTopic: 'Recent History & Other',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_112',
    question: 'What did the civil rights movement do?',
    correctAnswer: 'Fought to end racial discrimination',
    alternateAnswers: [],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/ad72319e3_generated_image.png',
    topic: 'American History',
    subTopic: 'Recent History & Other',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_113',
    question: 'Martin Luther King, Jr. is famous for many things. Name one.',
    correctAnswer: 'Fought for civil rights',
    alternateAnswers: ["Worked for equality for all Americans","Worked to ensure that people would “not be judged by the color of their skin, but by the content"],
    category: '65/20 Special',
    is_65_20: true,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/7454c7bd0_generated_image.png',
    topic: 'American History',
    subTopic: 'Recent History & Other',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_114',
    question: 'Why did the United States enter the Persian Gulf War?',
    correctAnswer: 'To force the Iraqi military from Kuwait',
    alternateAnswers: [],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/31f97ab57_generated_image.png',
    topic: 'American History',
    subTopic: 'Recent History & Other',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_115',
    question: 'What major event happened on September 11, 2001 in the United States?',
    correctAnswer: 'Terrorists attacked the United States',
    alternateAnswers: ["Terrorists took over two planes and crashed them into the World Trade Center in New York City","Terrorists took over a plane and crashed into the Pentagon in Arlington, Virginia","Terrorists took over a plane originally aimed at Washington, D.C., and crashed in a field in Pennsylvania"],
    category: '65/20 Special',
    is_65_20: true,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/a51eb401f_generated_image.png',
    topic: 'American History',
    subTopic: 'Recent History & Other',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_116',
    question: 'Name one U.S. military conflict after the September 11, 2001 attacks.',
    correctAnswer: '(Global) War on Terror',
    alternateAnswers: ["War in Afghanistan","War in Iraq"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/4a221a8d2_generated_image.png',
    topic: 'American History',
    subTopic: 'Recent History & Other',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_117',
    question: 'Name one American Indian tribe in the United States.',
    correctAnswer: 'Apache',
    alternateAnswers: ["Blackfeet","Cayuga","Cherokee","Cheyenne","Chippewa","Choctaw","Creek","Crow","Hopi","Huron","Inupiat","Lakota","Mohawk","Mohegan","Navajo","Oneida","Onondaga","Pueblo","Seminole","Seneca","Shawnee","Sioux","Teton","Tuscarora"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/35c588127_generated_image.png',
    topic: 'American History',
    subTopic: 'Recent History & Other',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_118',
    question: 'Name one example of an American innovation.',
    correctAnswer: 'Light bulb',
    alternateAnswers: ["Automobile (cars, internal combustion engine)","Skyscrapers","Airplane","Assembly line","Landing on the moon","Integrated circuit (IC)"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/8eec11482_generated_image.png',
    topic: 'American History',
    subTopic: 'Recent History & Other',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_119',
    question: 'What is the capital of the United States?',
    correctAnswer: 'Washington, D.C.',
    alternateAnswers: [],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/0ba70739f_generated_image.png',
    topic: 'Symbols & Holidays',
    subTopic: 'Symbols',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_120',
    question: 'Where is the Statue of Liberty?',
    correctAnswer: 'New York (Harbor)',
    alternateAnswers: ["Liberty Island [Also acceptable are New Jersey, near New York City, and on the Hudson (River).]"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/3fff15221_generated_image.png',
    topic: 'Symbols & Holidays',
    subTopic: 'Symbols',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_121',
    question: 'Why does the flag have 13 stripes?',
    correctAnswer: '(Because there were) 13 original colonies',
    alternateAnswers: ["(Because the stripes) represent the original colonies"],
    category: '65/20 Special',
    is_65_20: true,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/1c3341ef3_generated_image.png',
    topic: 'Symbols & Holidays',
    subTopic: 'Symbols',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_122',
    question: 'Why does the flag have 50 stars?',
    correctAnswer: '(Because there is) one star for each state',
    alternateAnswers: ["(Because) each star represents a state","(Because there are) 50 states"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/0596d86ce_generated_image.png',
    topic: 'Symbols & Holidays',
    subTopic: 'Symbols',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_123',
    question: 'What is the name of the national anthem?',
    correctAnswer: 'The Star-Spangled Banner',
    alternateAnswers: [],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/0fc936436_generated_image.png',
    topic: 'Symbols & Holidays',
    subTopic: 'Symbols',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_124',
    question: 'The Nation’s first motto was “E Pluribus Unum.” What does that mean?',
    correctAnswer: 'Out of many, one',
    alternateAnswers: ["We all become one"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/c6847f974_generated_image.png',
    topic: 'Symbols & Holidays',
    subTopic: 'Symbols',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_125',
    question: 'What is Independence Day?',
    correctAnswer: 'A holiday to celebrate U.S. independence (from Britain)',
    alternateAnswers: ["The country’s birthday"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/6ad95a5d5_generated_image.png',
    topic: 'Symbols & Holidays',
    subTopic: 'Holidays',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_126',
    question: 'Name three national U.S. holidays.',
    correctAnswer: 'New Year’s Day',
    alternateAnswers: ["Martin Luther King, Jr. Day","Presidents Day (Washington’s Birthday)","Memorial Day","Juneteenth","Independence Day","Labor Day","Columbus Day","Veterans Day","Thanksgiving Day","Christmas Day"],
    category: '65/20 Special',
    is_65_20: true,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/4c8398397_generated_image.png',
    topic: 'Symbols & Holidays',
    subTopic: 'Holidays',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_127',
    question: 'What is Memorial Day?',
    correctAnswer: 'A holiday to honor soldiers who died in military service',
    alternateAnswers: [],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/5253c2b7e_generated_image.png',
    topic: 'Symbols & Holidays',
    subTopic: 'Holidays',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'CIVICS_128',
    question: 'What is Veterans Day?',
    correctAnswer: 'A holiday to honor people in the (U.S.) military',
    alternateAnswers: ["A holiday to honor people who have served (in the U.S. military)"],
    category: 'Standard',
    is_65_20: false,
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69710272ce3bc6b1074e1740/77d0b5de4_generated_image.png',
    topic: 'Symbols & Holidays',
    subTopic: 'Holidays',
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  }
];

// Define high school civics curriculum questions
const highschoolQuestions = [
  {
    id: 'HS_001',
    question: 'What is the primary purpose of the U.S. Constitution?',
    correctAnswer: 'To establish a framework for government and protect individual rights',
    alternateAnswers: [],
    category: 'High School',
    is_65_20: false,
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'HS_002',
    question: 'What is federalism?',
    correctAnswer: 'Division of power between national and state governments',
    alternateAnswers: ['Power shared between federal and state levels'],
    category: 'High School',
    is_65_20: false,
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'HS_003',
    question: 'What is the difference between civil liberties and civil rights?',
    correctAnswer: 'Civil liberties protect freedoms from government; civil rights ensure equal treatment',
    alternateAnswers: [],
    category: 'High School',
    is_65_20: false,
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'HS_004',
    question: 'What is the role of the Supreme Court in constitutional interpretation?',
    correctAnswer: 'To interpret the Constitution and determine if laws are constitutional',
    alternateAnswers: ['To review laws for constitutionality'],
    category: 'High School',
    is_65_20: false,
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'HS_005',
    question: 'What is the purpose of checks and balances?',
    correctAnswer: 'To prevent any branch of government from becoming too powerful',
    alternateAnswers: ['To ensure separation of powers'],
    category: 'High School',
    is_65_20: false,
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'HS_006',
    question: 'What is the Electoral College?',
    correctAnswer: 'The system by which states elect the President through electors',
    alternateAnswers: ['Institution that decides presidential elections'],
    category: 'High School',
    is_65_20: false,
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'HS_007',
    question: 'What is the significance of the 14th Amendment?',
    correctAnswer: 'It guarantees equal protection and due process to all citizens',
    alternateAnswers: ['It abolished slavery and granted citizenship to freed slaves'],
    category: 'High School',
    is_65_20: false,
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'HS_008',
    question: 'What is the purpose of the Bill of Rights?',
    correctAnswer: 'To protect individual freedoms and rights from government interference',
    alternateAnswers: ['To list fundamental rights guaranteed to Americans'],
    category: 'High School',
    is_65_20: false,
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'HS_009',
    question: 'What is the difference between impeachment and removal from office?',
    correctAnswer: 'Impeachment is the charge; removal requires conviction by the Senate',
    alternateAnswers: [],
    category: 'High School',
    is_65_20: false,
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'HS_010',
    question: 'What is judicial review?',
    correctAnswer: 'The power of courts to determine if laws are constitutional',
    alternateAnswers: ['The ability to declare laws unconstitutional'],
    category: 'High School',
    is_65_20: false,
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'HS_011',
    question: 'What does "due process" mean?',
    correctAnswer: 'Fair procedures that government must follow when depriving citizens of rights',
    alternateAnswers: ['Fair legal procedures required by government'],
    category: 'High School',
    is_65_20: false,
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'HS_012',
    question: 'What is the purpose of political parties?',
    correctAnswer: 'To organize people with similar political beliefs to win elections and influence policy',
    alternateAnswers: [],
    category: 'High School',
    is_65_20: false,
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'HS_013',
    question: 'What is the role of the media in democracy?',
    correctAnswer: 'To inform citizens, monitor government, and provide a forum for debate',
    alternateAnswers: ['To report news and hold government accountable'],
    category: 'High School',
    is_65_20: false,
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'HS_014',
    question: 'What are the main causes of American Civil War?',
    correctAnswer: 'Disagreement over slavery and states\' rights',
    alternateAnswers: ['Sectional tensions over slavery expansion'],
    category: 'High School',
    is_65_20: false,
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'HS_015',
    question: 'What is the purpose of taxes in a democratic society?',
    correctAnswer: 'To fund government services and public goods that benefit all citizens',
    alternateAnswers: ['To provide revenue for government operations'],
    category: 'High School',
    is_65_20: false,
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'HS_016',
    question: 'What is the difference between a representative democracy and a direct democracy?',
    correctAnswer: 'Representatives make decisions in representative democracy; citizens vote directly in direct democracy',
    alternateAnswers: [],
    category: 'High School',
    is_65_20: false,
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'HS_017',
    question: 'What is the purpose of the United Nations?',
    correctAnswer: 'To maintain international peace and security and promote cooperation',
    alternateAnswers: ['To resolve conflicts between nations'],
    category: 'High School',
    is_65_20: false,
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'HS_018',
    question: 'What is the purpose of lobbying in government?',
    correctAnswer: 'To influence government decisions on behalf of special interests',
    alternateAnswers: ['To persuade legislators to support certain policies'],
    category: 'High School',
    is_65_20: false,
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'HS_019',
    question: 'What is the purpose of voter registration?',
    correctAnswer: 'To verify citizenship and eligibility before allowing someone to vote',
    alternateAnswers: ['To ensure only eligible citizens can vote'],
    category: 'High School',
    is_65_20: false,
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  },
  {
    id: 'HS_020',
    question: 'What is civic engagement?',
    correctAnswer: 'Active participation in community and government affairs',
    alternateAnswers: ['Involvement in the political process and community'],
    category: 'High School',
    is_65_20: false,
    wrongAnswers: {
      easy: [],
      medium: [],
      hard: []
    }
  }
];

// Export the question bank
export const CIVICS_QUESTION_BANK = {
  naturalization128: civicsQuestions,
  naturalization100: civicsQuestions.slice(0, 100),
  highschool: highschoolQuestions
};

export const generateQuestionWithDifficulty = (questionData, difficulty = 'easy') => {
  const wrongAnswers = questionData.wrongAnswers[difficulty] || questionData.wrongAnswers.easy;
  const allAnswers = [questionData.correctAnswer, ...wrongAnswers];
  const shuffledAnswers = allAnswers.sort(() => Math.random() - 0.5);
  const correctIndex = shuffledAnswers.indexOf(questionData.correctAnswer);

  return {
    ...questionData,
    options: shuffledAnswers,
    answer: shuffledAnswers[correctIndex],
    correctIndex: correctIndex,
    difficulty: difficulty
  };
};

export const getNextDifficulty = (currentDifficulty, performance) => {
  if (performance >= 80) {
    switch (currentDifficulty) {
      case 'easy': return 'medium';
      case 'medium': return 'hard';
      case 'hard': return 'hard';
      default: return 'easy';
    }
  } else if (performance <= 50) {
    switch (currentDifficulty) {
      case 'easy': return 'easy';
      case 'medium': return 'easy';
      case 'hard': return 'medium';
      default: return 'easy';
    }
  }
  return currentDifficulty;
};
