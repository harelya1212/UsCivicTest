export const STATE_NAME_TO_CODE = Object.freeze({
  Alabama: 'AL',
  Alaska: 'AK',
  Arizona: 'AZ',
  Arkansas: 'AR',
  California: 'CA',
  Colorado: 'CO',
  Connecticut: 'CT',
  Delaware: 'DE',
  Florida: 'FL',
  Georgia: 'GA',
  Hawaii: 'HI',
  Idaho: 'ID',
  Illinois: 'IL',
  Indiana: 'IN',
  Iowa: 'IA',
  Kansas: 'KS',
  Kentucky: 'KY',
  Louisiana: 'LA',
  Maine: 'ME',
  Maryland: 'MD',
  Massachusetts: 'MA',
  Michigan: 'MI',
  Minnesota: 'MN',
  Mississippi: 'MS',
  Missouri: 'MO',
  Montana: 'MT',
  Nebraska: 'NE',
  Nevada: 'NV',
  'New Hampshire': 'NH',
  'New Jersey': 'NJ',
  'New Mexico': 'NM',
  'New York': 'NY',
  'North Carolina': 'NC',
  'North Dakota': 'ND',
  Ohio: 'OH',
  Oklahoma: 'OK',
  Oregon: 'OR',
  Pennsylvania: 'PA',
  'Rhode Island': 'RI',
  'South Carolina': 'SC',
  'South Dakota': 'SD',
  Tennessee: 'TN',
  Texas: 'TX',
  Utah: 'UT',
  Vermont: 'VT',
  Virginia: 'VA',
  Washington: 'WA',
  'West Virginia': 'WV',
  Wisconsin: 'WI',
  Wyoming: 'WY',
});

const WIKIMEDIA_FILE_OVERRIDES = Object.freeze({
  Georgia: 'Flag_of_Georgia_(U.S._state).svg',
});

const US_FLAG_FALLBACK =
  'https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/Flag_of_the_United_States.svg/160px-Flag_of_the_United_States.svg.png';

export function getStateCode(stateName = '') {
  return STATE_NAME_TO_CODE[String(stateName || '').trim()] || '';
}

export function getStateFlagImageUri(stateName = '', width = 120) {
  const normalized = String(stateName || '').trim();
  if (!normalized) return US_FLAG_FALLBACK;

  const fileName =
    WIKIMEDIA_FILE_OVERRIDES[normalized] ||
    `Flag_of_${normalized.replace(/\s+/g, '_')}.svg`;

  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=${Math.max(32, Number(width) || 120)}`;
}

export function getStateCodeAndFlag(stateName = '', width = 120) {
  return {
    code: getStateCode(stateName),
    flagUri: getStateFlagImageUri(stateName, width),
  };
}
