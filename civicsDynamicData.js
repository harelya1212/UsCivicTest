// Dynamic civics answers for time-sensitive questions.
// Update this file when election outcomes or officeholders change.

export const DYNAMIC_CIVICS_DATA = {
  lastVerified: '2026-03-22',
  federal: {
    president: 'Donald J. Trump',
    vicePresident: 'J.D. Vance',
    speakerOfHouse: 'Mike Johnson',
    chiefJustice: 'John Roberts',
  },
  // Optional per-state live officeholders (governor/senators) for "your state" questions.
  // Example:
  // California: { governor: 'Gavin Newsom', senators: ['Alex Padilla', 'Adam Schiff'] }
  stateOfficeholders: {
    Alabama: { governor: 'Kay Ivey', senators: ['Tommy Tuberville', 'Katie Britt'] },
    Alaska: { governor: 'Mike Dunleavy', senators: ['Lisa Murkowski', 'Dan Sullivan'] },
    Arizona: { governor: 'Katie Hobbs', senators: ['Mark Kelly', 'Ruben Gallego'] },
    Arkansas: { governor: 'Sarah Huckabee Sanders', senators: ['John Boozman', 'Tom Cotton'] },
    California: { governor: 'Gavin Newsom', senators: ['Alex Padilla', 'Adam Schiff'] },
    Colorado: { governor: 'Jared Polis', senators: ['Michael Bennet', 'John Hickenlooper'] },
    Connecticut: { governor: 'Ned Lamont', senators: ['Richard Blumenthal', 'Chris Murphy'] },
    Delaware: { governor: 'Matt Meyer', senators: ['Chris Coons', 'Lisa Blunt Rochester'] },
    Florida: { governor: 'Ron DeSantis', senators: ['Rick Scott', 'Ashley Moody'] },
    Georgia: { governor: 'Brian Kemp', senators: ['Raphael Warnock', 'Jon Ossoff'] },
    Hawaii: { governor: 'Josh Green', senators: ['Brian Schatz', 'Mazie Hirono'] },
    Idaho: { governor: 'Brad Little', senators: ['Mike Crapo', 'Jim Risch'] },
    Illinois: { governor: 'JB Pritzker', senators: ['Dick Durbin', 'Tammy Duckworth'] },
    Indiana: { governor: 'Mike Braun', senators: ['Todd Young', 'Jim Banks'] },
    Iowa: { governor: 'Kim Reynolds', senators: ['Chuck Grassley', 'Joni Ernst'] },
    Kansas: { governor: 'Laura Kelly', senators: ['Jerry Moran', 'Roger Marshall'] },
    Kentucky: { governor: 'Andy Beshear', senators: ['Mitch McConnell', 'Rand Paul'] },
    Louisiana: { governor: 'Jeff Landry', senators: ['Bill Cassidy', 'John Kennedy'] },
    Maine: { governor: 'Janet Mills', senators: ['Susan Collins', 'Angus King'] },
    Maryland: { governor: 'Wes Moore', senators: ['Chris Van Hollen', 'Angela Alsobrooks'] },
    Massachusetts: { governor: 'Maura Healey', senators: ['Elizabeth Warren', 'Ed Markey'] },
    Michigan: { governor: 'Gretchen Whitmer', senators: ['Gary Peters', 'Elissa Slotkin'] },
    Minnesota: { governor: 'Tim Walz', senators: ['Amy Klobuchar', 'Tina Smith'] },
    Mississippi: { governor: 'Tate Reeves', senators: ['Roger Wicker', 'Cindy Hyde-Smith'] },
    Missouri: { governor: 'Mike Kehoe', senators: ['Eric Schmitt', 'Josh Hawley'] },
    Montana: { governor: 'Greg Gianforte', senators: ['Steve Daines', 'Tim Sheehy'] },
    Nebraska: { governor: 'Jim Pillen', senators: ['Deb Fischer', 'Pete Ricketts'] },
    Nevada: { governor: 'Joe Lombardo', senators: ['Catherine Cortez Masto', 'Jacky Rosen'] },
    'New Hampshire': { governor: 'Kelly Ayotte', senators: ['Jeanne Shaheen', 'Maggie Hassan'] },
    'New Jersey': { governor: 'Phil Murphy', senators: ['Cory Booker', 'Andy Kim'] },
    'New Mexico': { governor: 'Michelle Lujan Grisham', senators: ['Martin Heinrich', 'Ben Ray Lujan'] },
    'New York': { governor: 'Kathy Hochul', senators: ['Chuck Schumer', 'Kirsten Gillibrand'] },
    'North Carolina': { governor: 'Josh Stein', senators: ['Thom Tillis', 'Ted Budd'] },
    'North Dakota': { governor: 'Kelly Armstrong', senators: ['John Hoeven', 'Kevin Cramer'] },
    Ohio: { governor: 'Mike DeWine', senators: ['Bernie Moreno', 'Jon Husted'] },
    Oklahoma: { governor: 'Kevin Stitt', senators: ['James Lankford', 'Markwayne Mullin'] },
    Oregon: { governor: 'Tina Kotek', senators: ['Ron Wyden', 'Jeff Merkley'] },
    Pennsylvania: { governor: 'Josh Shapiro', senators: ['John Fetterman', 'Dave McCormick'] },
    'Rhode Island': { governor: 'Dan McKee', senators: ['Jack Reed', 'Sheldon Whitehouse'] },
    'South Carolina': { governor: 'Henry McMaster', senators: ['Lindsey Graham', 'Tim Scott'] },
    'South Dakota': { governor: 'Larry Rhoden', senators: ['Mike Rounds', 'John Thune'] },
    Tennessee: { governor: 'Bill Lee', senators: ['Marsha Blackburn', 'Bill Hagerty'] },
    Texas: { governor: 'Greg Abbott', senators: ['John Cornyn', 'Ted Cruz'] },
    Utah: { governor: 'Spencer Cox', senators: ['Mike Lee', 'John Curtis'] },
    Vermont: { governor: 'Phil Scott', senators: ['Bernie Sanders', 'Peter Welch'] },
    Virginia: { governor: 'Glenn Youngkin', senators: ['Mark Warner', 'Tim Kaine'] },
    Washington: { governor: 'Bob Ferguson', senators: ['Maria Cantwell', 'Patty Murray'] },
    'West Virginia': { governor: 'Patrick Morrisey', senators: ['Shelley Moore Capito', 'Jim Justice'] },
    Wisconsin: { governor: 'Tony Evers', senators: ['Tammy Baldwin', 'Ron Johnson'] },
    Wyoming: { governor: 'Mark Gordon', senators: ['John Barrasso', 'Cynthia Lummis'] },
  },
};

function touchLastVerified() {
  DYNAMIC_CIVICS_DATA.lastVerified = new Date().toISOString().slice(0, 10);
}

export const STATE_CAPITALS = {
  Alabama: 'Montgomery',
  Alaska: 'Juneau',
  Arizona: 'Phoenix',
  Arkansas: 'Little Rock',
  California: 'Sacramento',
  Colorado: 'Denver',
  Connecticut: 'Hartford',
  Delaware: 'Dover',
  Florida: 'Tallahassee',
  Georgia: 'Atlanta',
  Hawaii: 'Honolulu',
  Idaho: 'Boise',
  Illinois: 'Springfield',
  Indiana: 'Indianapolis',
  Iowa: 'Des Moines',
  Kansas: 'Topeka',
  Kentucky: 'Frankfort',
  Louisiana: 'Baton Rouge',
  Maine: 'Augusta',
  Maryland: 'Annapolis',
  Massachusetts: 'Boston',
  Michigan: 'Lansing',
  Minnesota: 'Saint Paul',
  Mississippi: 'Jackson',
  Missouri: 'Jefferson City',
  Montana: 'Helena',
  Nebraska: 'Lincoln',
  Nevada: 'Carson City',
  'New Hampshire': 'Concord',
  'New Jersey': 'Trenton',
  'New Mexico': 'Santa Fe',
  'New York': 'Albany',
  'North Carolina': 'Raleigh',
  'North Dakota': 'Bismarck',
  Ohio: 'Columbus',
  Oklahoma: 'Oklahoma City',
  Oregon: 'Salem',
  Pennsylvania: 'Harrisburg',
  'Rhode Island': 'Providence',
  'South Carolina': 'Columbia',
  'South Dakota': 'Pierre',
  Tennessee: 'Nashville',
  Texas: 'Austin',
  Utah: 'Salt Lake City',
  Vermont: 'Montpelier',
  Virginia: 'Richmond',
  Washington: 'Olympia',
  'West Virginia': 'Charleston',
  Wisconsin: 'Madison',
  Wyoming: 'Cheyenne',
  'District of Columbia': 'Washington, D.C.',
};

function normalizeForMatch(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function normalizeStateName(value) {
  const state = String(value || '').trim();
  if (!state) return '';

  const direct = Object.keys(STATE_CAPITALS).find(
    (name) => normalizeForMatch(name) === normalizeForMatch(state)
  );
  return direct || state;
}

export function setDynamicFederalAnswers(nextFederalAnswers) {
  DYNAMIC_CIVICS_DATA.federal = {
    ...DYNAMIC_CIVICS_DATA.federal,
    ...nextFederalAnswers,
  };
  touchLastVerified();
}

export function setStateOfficeholders(stateName, officeholders) {
  const state = normalizeStateName(stateName);
  if (!state) return;

  DYNAMIC_CIVICS_DATA.stateOfficeholders[state] = {
    ...DYNAMIC_CIVICS_DATA.stateOfficeholders[state],
    ...officeholders,
  };
  touchLastVerified();
}

export function setStateCapital(stateName, capital) {
  const state = normalizeStateName(stateName);
  const normalizedCapital = String(capital || '').trim();
  if (!state || !normalizedCapital) return;

  STATE_CAPITALS[state] = normalizedCapital;
  touchLastVerified();
}

export function getDynamicCivicsAnswer(question, fallbackAnswer, context = {}) {
  const q = normalizeForMatch(question);
  const selectedState = normalizeStateName(context.userState || context.state || '');
  const stateEntry = selectedState ? DYNAMIC_CIVICS_DATA.stateOfficeholders[selectedState] : null;

  if (q.includes('name of the president of the united states now')) {
    return DYNAMIC_CIVICS_DATA.federal.president;
  }

  if (q.includes('name of the vice president of the united states now')) {
    return DYNAMIC_CIVICS_DATA.federal.vicePresident;
  }

  if (q.includes('name of the speaker of the house of representatives now')) {
    return DYNAMIC_CIVICS_DATA.federal.speakerOfHouse;
  }

  if (q.includes('who is the chief justice of the united states now')) {
    return DYNAMIC_CIVICS_DATA.federal.chiefJustice;
  }

  if (q.includes('what is the capital of your state')) {
    return STATE_CAPITALS[selectedState] || fallbackAnswer;
  }

  if (q.includes('who is the governor of your state now')) {
    return stateEntry?.governor || fallbackAnswer;
  }

  if (q.includes('who is one of your state s u s senators now')) {
    if (stateEntry?.senators && stateEntry.senators.length > 0) {
      const idx = Math.floor(Math.random() * stateEntry.senators.length);
      return stateEntry.senators[idx];
    }
    return fallbackAnswer;
  }

  return fallbackAnswer;
}
