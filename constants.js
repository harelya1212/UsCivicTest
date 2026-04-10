export const PAUSED_SESSION_STORAGE_KEY = 'civics.pausedSession.v1';
export const AD_RUNTIME_STORAGE_KEY = 'civics.adRuntime.v1';
export const CASE_PROGRESS_STORAGE_PREFIX = 'civics.caseProgress.v1';
export const CASE_REMINDER_STORAGE_PREFIX = 'civics.caseReminder.v1';
export const MASTERY_MAP_STORAGE_KEY = 'civics.masteryMap.v1';
export const ALL_TOPICS_VALUE = '__all_topics__';
export const ALL_SUBTOPICS_VALUE = '__all_subtopics__';
export const DAILY_FREE_PACK_LIMIT = 1;
export const FREE_PACK_QUESTION_COUNT = 15;
export const FREE_PACK_COOLDOWN_MS = 60 * 60 * 1000;

export const AD_EVENT_NAMES = Object.freeze({
  REWARDED_ATTEMPT: 'rewarded_attempt',
  REWARDED_COMPLETED: 'rewarded_completed',
  REWARDED_FAILED_OR_CLOSED: 'rewarded_failed_or_closed',
  REWARDED_HOME_SPRINT_ATTEMPT: 'rewarded_home_sprint_attempt',
  REWARDED_SPRINT_UNLOCK: 'rewarded_sprint_unlock',
  REWARDED_REVIEW_BONUS_ATTEMPT: 'rewarded_review_bonus_attempt',
  REWARDED_BONUS_UNLOCK: 'rewarded_bonus_unlock',
  REWARDED_REVIEW_WEAK_ATTEMPT: 'rewarded_review_weak_attempt',
  REWARDED_REVIEW_WEAK_UNLOCK: 'rewarded_review_weak_unlock',
  WEAK_SCORE_UPSELL_ELIGIBLE: 'weak_score_upsell_eligible',
  WEAK_SCORE_UPSELL_SHOWN: 'weak_score_upsell_shown',
});

export const APP_EVENT_NAMES = Object.freeze({
  APP_OPEN: 'app_open',
  SCREEN_VIEW: 'screen_view',
  QUIZ_STARTED: 'quiz_started',
  QUESTION_ANSWERED: 'question_answered',
  QUIZ_TTS_PLAYED: 'quiz_tts_played',
  QUIZ_TTS_REPEATED: 'quiz_tts_repeated',
  QUIZ_TTS_SPEED_CHANGED: 'quiz_tts_speed_changed',
  INTERVIEW_STARTED: 'interview_started',
  INTERVIEW_PROMPT_PLAYED: 'interview_prompt_played',
  INTERVIEW_RECORDING_STARTED: 'interview_recording_started',
  INTERVIEW_RESPONSE_SUBMITTED: 'interview_response_submitted',
  INTERVIEW_SCORE_REVEALED: 'interview_score_revealed',
  INTERVIEW_FOLLOWUP_SHOWN: 'interview_followup_shown',
  INTERVIEW_FOLLOWUP_COMPLETED: 'interview_followup_completed',
  INTERVIEW_SESSION_COMPLETED: 'interview_session_completed',
  INTERVIEW_SESSION_EXITED: 'interview_session_exited',
  INTERVIEW_FOLLOWUP_SCORED: 'interview_followup_scored',
  INTERVIEW_COMPLETED: 'interview_completed',
  HOME_INTERVIEW_CTA_CLICKED: 'home_interview_cta_clicked',
  HOME_LISTEN_CTA_CLICKED: 'home_listen_cta_clicked',
  ADMIN_DEBUG_PING: 'admin_debug_ping',
});

export const CASE_PROGRESS_STAGES = [
  'Case Received',
  'Biometrics Scheduled',
  'Biometrics Completed',
  'Interview Scheduled',
  'Interview Completed',
  'Oath Scheduled',
  'Naturalized',
];

export const WEEKDAY_OPTIONS = [
  { label: 'Sunday', value: 1 },
  { label: 'Monday', value: 2 },
  { label: 'Tuesday', value: 3 },
  { label: 'Wednesday', value: 4 },
  { label: 'Thursday', value: 5 },
  { label: 'Friday', value: 6 },
  { label: 'Saturday', value: 7 },
];

export const CASE_STAGE_CHECKLISTS = {
  'Case Received': [
    'Save USCIS online account login details in a secure password manager.',
    'Keep receipt number copy (paper + screenshot).',
    'Create a folder for notices and civil documents.',
  ],
  'Biometrics Scheduled': [
    'Bring appointment notice and government-issued photo ID.',
    'Confirm Application Support Center location and parking/transit.',
    'Arrive 15-30 minutes early with notice barcode visible.',
  ],
  'Biometrics Completed': [
    'Save proof biometrics were completed.',
    'Monitor USCIS account weekly for next status.',
    'Update your address with USCIS if moved.',
  ],
  'Interview Scheduled': [
    'Review N-400 application for consistency and updates.',
    'Prepare originals of green card, passport, tax and travel records.',
    'Practice civics questions and reading/writing portions.',
  ],
  'Interview Completed': [
    'Save interview result notice and officer notes.',
    'If RFE issued, collect requests documents immediately.',
    'Track oath scheduling notice in USCIS account.',
  ],
  'Oath Scheduled': [
    'Review oath ceremony notice date, time, and location.',
    'Bring green card and required forms to surrender.',
    'Prepare name-change or travel documents if needed.',
  ],
  Naturalized: [
    'Apply for U.S. passport after certificate received.',
    'Update Social Security citizenship status.',
    'Update voter registration and state records.',
  ],
};

export const usStates = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
  'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
  'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
  'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
  'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
];

export const achievements = [
  { id: 'first_ten', name: 'First Steps', desc: 'Answer 10 questions correctly', icon: '🎓', unlocked: false },
  { id: 'week_warrior', name: 'Week Warrior', desc: 'Practice 7 days in a row', icon: '⚡', unlocked: false },
  { id: 'perfect', name: 'Perfect Practice', desc: 'Get 10 questions correct in a row', icon: '🔥', unlocked: false },
  { id: 'speed_demon', name: 'Speed Demon', desc: 'Answer 20 questions in under 5 minutes', icon: '🚀', unlocked: false },
  { id: 'sharing_king', name: 'Sharing King', desc: 'Invite 5 friends to practice', icon: '👑', unlocked: false },
];

// Minimal local question bank used for fallback / testing only
export const questionBank = {
  highschool: [
    { id: 'HS1', question: 'What is the supreme law of the land?', options: ['The Constitution', 'The President', 'The Senate', 'The Bill of Rights'], answer: 'The Constitution', topic: 'Foundations', hint: 'Think about the document that defines government powers.', dynamic: false, memoryHook: 'The Constitution is the boss document for all laws.', explanation: 'The Constitution defines U.S. government structure and is above all other laws.' },
    { id: 'HS2', question: 'What is one right or freedom from the First Amendment?', options: ['Free speech', 'Vote-only for women', 'Free health care', 'No taxes'], answer: 'Free speech', topic: 'Rights', hint: 'It begins with F and is how people express opinions.', dynamic: false, memoryHook: 'First Amendment = First freedom (speech, religion, press).', explanation: 'The First Amendment protects free speech, religion, press, assembly, and petition.' },
    { id: 'HS3', question: 'What is one responsibility of a U.S. citizen?', options: ['Vote', 'Own a car', 'Become rich', 'Travel abroad'], answer: 'Vote', topic: 'Civic Duty', hint: 'You do this in elections.', dynamic: false, memoryHook: 'Voting is civic duty, not optional when adult.', explanation: 'Voting is a function of citizenship; other options are not required responsibilities.' },
  ],
  naturalization100: [
    { id: 'N100_1', question: 'What is the capital of the United States?', options: ['New York', 'Washington, D.C.', 'Los Angeles', 'Chicago'], answer: 'Washington, D.C.', topic: 'Geography', hint: "It's not a state; it is a district.", dynamic: false, memoryHook: 'Washington D.C. is the capital, not a state city.', explanation: 'The capital of the United States is Washington, D.C., established by the Constitution.' },
    { id: 'N100_2', question: 'Name one branch or part of the government.', options: ['Legislative', 'Banking', 'Retail', 'Education'], answer: 'Legislative', topic: 'Structure', hint: 'It writes laws.', dynamic: false, memoryHook: 'Legislative makes laws, Executive enforces, Judicial judges.', explanation: 'The government has three branches: Legislative (Congress), Executive (President), Judicial (Supreme Court).' },
  ],
  naturalization128: [
    { id: 'N128_1', question: 'What are the two major political parties in the United States?', options: ['Democratic and Republican', 'Libertarian and Green', 'Socialist and Communist', 'Federalist and Anti-Federalist'], answer: 'Democratic and Republican', topic: 'Politics', hint: 'One is blue, one is red.', dynamic: false, memoryHook: 'Blue = Democrats, Red = Republicans.', explanation: 'The two major parties are Democratic and Republican; others are minor parties.' },
    { id: 'N128_2', question: 'What does the judicial branch do?', options: ['Reviews laws', 'Makes laws', 'Enforces laws', 'Votes for laws'], answer: 'Reviews laws', topic: 'Checks and Balances', hint: 'Judges and courts.', dynamic: true, memoryHook: 'Judicial judges the laws.', explanation: 'The judicial branch interprets and reviews laws to ensure they are constitutional.' },
  ],
};
