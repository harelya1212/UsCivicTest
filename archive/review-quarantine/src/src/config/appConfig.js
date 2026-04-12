export const DAILY_FREE_PACK_LIMIT = 1;
export const FREE_PACK_QUESTION_COUNT = 15;
export const FREE_PACK_COOLDOWN_MS = 60 * 60 * 1000;

export const ALL_TOPICS_VALUE = '__all_topics__';
export const ALL_SUBTOPICS_VALUE = '__all_subtopics__';

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
    'If RFE issued, collect requested documents immediately.',
    'Track oath scheduling notice in USCIS account.',
  ],
  'Oath Scheduled': [
    'Review oath ceremony notice date, time, and location.',
    'Bring green card and required forms to surrender.',
    'Prepare name-change or travel documents if needed.',
  ],
  'Naturalized': [
    'Apply for U.S. passport after certificate received.',
    'Update Social Security citizenship status.',
    'Update voter registration and state records.',
  ],
};

export const QUESTIONS_BY_TEST_TYPE = {
  highschool: 100,
  naturalization100: 100,
  naturalization128: 128,
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