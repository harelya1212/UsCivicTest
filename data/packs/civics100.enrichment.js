/**
 * civics100.enrichment.js - Curated distractors and explanations for the
 * official 2008 USCIS 100-question pack.
 *
 * The question texts/answers live verbatim in civics100.questions.js (public
 * domain USCIS source). This file adds the app layer: plausible wrong
 * answers for multiple-choice mode and short "why" explanations.
 * Merged into the pack by civics100.pack.js.
 */

export const CIVICS_100_ENRICHMENT = {
  'CIVICS100_001': {
    distractors: ['the Declaration of Independence', 'the Bill of Rights', 'the Articles of Confederation'],
    why: 'The Constitution is the highest law in the United States - no federal or state law may contradict it.',
  },
  'CIVICS100_002': {
    distractors: ['declares independence from Great Britain', 'elects the President', 'collects federal taxes'],
    why: 'The Constitution creates the three branches of government, defines their powers, and guarantees basic rights.',
  },
  'CIVICS100_003': {
    distractors: ['In Order To', 'We Hold These', 'One Nation Under'],
    why: 'The Constitution opens with "We the People", establishing that government authority comes from the citizens.',
  },
  'CIVICS100_004': {
    distractors: ['a presidential veto', 'a Supreme Court ruling', 'a new federal law'],
    why: 'An amendment formally changes or adds to the Constitution - 27 have been ratified so far.',
  },
  'CIVICS100_005': {
    distractors: ['the Articles of Confederation', 'the Federalist Papers', 'the Emancipation Proclamation'],
    why: 'The first ten amendments, ratified in 1791, are known as the Bill of Rights.',
  },
  'CIVICS100_006': {
    distractors: ['bear arms', 'vote in elections', 'drive a car'],
    why: 'The First Amendment protects speech, religion, assembly, press, and petitioning the government.',
  },
  'CIVICS100_007': {
    distractors: ['ten (10)', 'thirteen (13)', 'fifty (50)'],
    why: 'The Constitution has been amended 27 times, most recently in 1992.',
  },
  'CIVICS100_008': {
    distractors: ['ended the Civil War', 'freed the slaves', 'created the Constitution'],
    why: 'Adopted July 4, 1776, the Declaration announced the colonies\' independence from Great Britain.',
  },
  'CIVICS100_009': {
    distractors: ['speech', 'religion', 'bear arms'],
    why: 'The Declaration names life, liberty, and the pursuit of happiness as unalienable rights.',
  },
  'CIVICS100_010': {
    distractors: ['Everyone must follow the same religion.', 'The government chooses the official religion.', 'Religion is not allowed in public.'],
    why: 'The First Amendment means you may practice any religion - or none at all - without government interference.',
  },
  'CIVICS100_011': {
    distractors: ['socialist economy', 'communist economy', 'barter economy'],
    why: 'The U.S. has a capitalist (market) economy based on private ownership and free markets.',
  },
  'CIVICS100_012': {
    distractors: ['Only citizens must follow the law', 'Leaders are above the law', 'Laws apply only in wartime'],
    why: 'The rule of law means everyone - including leaders and government - must follow the law.',
  },
  'CIVICS100_013': {
    distractors: ['the Federal Reserve', 'the United Nations', 'the Cabinet'],
    why: 'The three branches are Congress (legislative), the President (executive), and the courts (judicial).',
  },
  'CIVICS100_014': {
    distractors: ['the military', 'the Bill of Rights', 'the popular vote'],
    why: 'Checks and balances (separation of powers) let each branch limit the others\' power.',
  },
  'CIVICS100_015': {
    distractors: ['the Vice President', 'the Speaker of the House', 'the Chief Justice'],
    why: 'The President heads the executive branch, which enforces federal laws.',
  },
  'CIVICS100_016': {
    distractors: ['the President', 'the Supreme Court', 'the state governors'],
    why: 'Congress - the Senate and House of Representatives - makes federal laws.',
  },
  'CIVICS100_017': {
    distractors: ['the Cabinet and the courts', 'the President and Vice President', 'the states and the territories'],
    why: 'Congress has two parts: the Senate (100 members) and the House of Representatives (435 voting members).',
  },
  'CIVICS100_018': {
    distractors: ['fifty (50)', 'four hundred thirty-five (435)', 'nine (9)'],
    why: 'There are 100 Senators - two from each of the 50 states.',
  },
  'CIVICS100_019': {
    distractors: ['two (2)', 'four (4)', 'eight (8)'],
    why: 'Senators serve six-year terms, with about a third of seats up for election every two years.',
  },
  'CIVICS100_020': {
    distractors: ['the Governor', 'the Mayor', 'the Chief Justice'],
    why: 'Each state elects two U.S. Senators - check your state\'s current senators before your interview.',
  },
  'CIVICS100_021': {
    distractors: ['one hundred (100)', 'fifty (50)', 'nine (9)'],
    why: 'The House has 435 voting members, apportioned to states by population.',
  },
  'CIVICS100_022': {
    distractors: ['six (6)', 'four (4)', 'eight (8)'],
    why: 'House members serve two-year terms - the entire House is up for election every two years.',
  },
  'CIVICS100_023': {
    distractors: ['your U.S. Senator', 'your Governor', 'your Mayor'],
    why: 'Your Representative serves your congressional district - look it up before your interview.',
  },
  'CIVICS100_024': {
    distractors: ['only the people who voted for him or her', 'only their congressional district', 'only their political party'],
    why: 'Each Senator represents all the people of their entire state.',
  },
  'CIVICS100_025': {
    distractors: ['because they are older states', 'because they pay more taxes', 'because the President decides'],
    why: 'House seats are apportioned by population - more people means more Representatives.',
  },
  'CIVICS100_026': {
    distractors: ['two (2)', 'six (6)', 'eight (8)'],
    why: 'The President serves a four-year term and may be re-elected once.',
  },
  'CIVICS100_027': {
    distractors: ['January', 'July', 'March'],
    why: 'Federal elections are held in November - presidential elections every four years.',
  },
  'CIVICS100_028': {
    distractors: ['LeBron James', 'Tom Hanks', 'Taylor Swift'],
    why: 'This answer changes with elections - always check the current officeholder before your interview.',
  },
  'CIVICS100_029': {
    distractors: ['LeBron James', 'Tom Hanks', 'Taylor Swift'],,
    why: 'This answer changes with elections - always check the current officeholder before your interview.',
  },
  'CIVICS100_030': {
    distractors: ['the Speaker of the House', 'the Secretary of State', 'the Chief Justice'],
    why: 'The Vice President is first in the line of presidential succession.',
  },
  'CIVICS100_031': {
    distractors: ['the Vice President', 'the Secretary of State', 'the Secretary of Defense'],
    why: 'If both are unable to serve, the Speaker of the House becomes President.',
  },
  'CIVICS100_032': {
    distractors: ['the Secretary of Defense', 'the highest-ranking general', 'the Vice President'],
    why: 'The President is Commander in Chief of the U.S. armed forces.',
  },
  'CIVICS100_033': {
    distractors: ['the Vice President', 'the Speaker of the House', 'the Chief Justice'],
    why: 'A bill becomes law when the President signs it (or after 10 days without a signature).',
  },
  'CIVICS100_034': {
    distractors: ['the Vice President', 'Congress', 'the Supreme Court'],
    why: 'The President can veto (reject) a bill; Congress can override with a two-thirds vote.',
  },
  'CIVICS100_035': {
    distractors: ['writes new laws', 'commands the military', 'decides court cases'],
    why: 'The Cabinet is a group of top advisers who head executive departments and counsel the President.',
  },
  'CIVICS100_036': {
    distractors: ['Secretary of the Senate', 'Secretary of Congress', 'Secretary of the Supreme Court'],
    why: 'Cabinet-level positions head the major executive departments, such as State, Defense, and Treasury.',
  },
  'CIVICS100_037': {
    distractors: ['writes new laws', 'collects taxes', 'commands the army'],
    why: 'The judicial branch interprets laws, resolves disputes, and can strike down unconstitutional laws.',
  },
  'CIVICS100_038': {
    distractors: ['the Federal Court', 'the Court of Appeals', 'the District Court'],
    why: 'The Supreme Court is the highest court - its decisions are final.',
  },
  'CIVICS100_039': {
    distractors: ['seven (7)', 'twelve (12)', 'fifteen (15)'],
    why: 'The number of justices is set by Congress - check the current number before your interview.',
  },
  'CIVICS100_040': {
    distractors: ['the Attorney General', 'the Senate Majority Leader', 'the Vice President'],
    why: 'The Chief Justice leads the Supreme Court - check the current officeholder before your interview.',
  },
  'CIVICS100_041': {
    distractors: ['provide police departments', 'give driver\'s licenses', 'set up local governments'],
    why: 'Federal powers include printing money, declaring war, creating an army, and making treaties.',
  },
  'CIVICS100_042': {
    distractors: ['print money', 'declare war', 'create an army'],
    why: 'State powers include education, police and fire protection, driver\'s licenses, and zoning.',
  },
  'CIVICS100_043': {
    distractors: ['your U.S. Senator', 'your Mayor', 'the President'],
    why: 'The Governor leads your state\'s executive branch - check your state\'s current governor.',
  },
  'CIVICS100_044': {
    distractors: ['Washington, D.C.', 'New York City', 'your largest city'],
    why: 'Every state has its own capital - learn yours before your interview.',
  },
  'CIVICS100_045': {
    distractors: ['Libertarian and Green', 'Federalist and Whig', 'Labor and Conservative'],
    why: 'The two major U.S. parties are the Democratic Party and the Republican Party.',
  },
  'CIVICS100_046': {
    distractors: ['the Democratic Party always', 'the Republican Party always', 'no party at all'],
    why: 'The President\'s party can change with elections - check before your interview.',
  },
  'CIVICS100_047': {
    distractors: ['LeBron James', 'Tom Hanks', 'Taylor Swift'],,
    why: 'The Speaker leads the House of Representatives - check the current officeholder.',
  },
  'CIVICS100_048': {
    distractors: ['Only landowners can vote', 'Voting requires a college degree', 'Only men can vote'],
    why: 'Voting amendments include: age 18+, no poll tax, women\'s suffrage, and voting regardless of race.',
  },
  'CIVICS100_049': {
    distractors: ['pay taxes', 'obey the law', 'serve in the military'],
    why: 'Only citizens can serve on a federal jury or vote in federal elections.',
  },
  'CIVICS100_050': {
    distractors: ['freedom of speech', 'freedom of religion', 'the right to bear arms'],
    why: 'Only citizens may vote in federal elections and run for federal office.',
  },
  'CIVICS100_051': {
    distractors: ['vote in federal elections', 'serve on a jury', 'run for President'],
    why: 'Everyone in the U.S. has basic rights like free speech, assembly, and religion.',
  },
  'CIVICS100_052': {
    distractors: ['the President', 'the Constitution', 'the military'],
    why: 'The Pledge of Allegiance is a promise of loyalty to the United States and its flag.',
  },
  'CIVICS100_053': {
    distractors: ['pay higher taxes', 'give up your job', 'leave the country'],
    why: 'New citizens promise loyalty to the U.S., obedience to its laws, and defense of the Constitution.',
  },
  'CIVICS100_054': {
    distractors: ['sixteen (16) and older', 'twenty-one (21) and older', 'twenty-five (25) and older'],
    why: 'U.S. citizens may vote at 18 - set by the 26th Amendment.',
  },
  'CIVICS100_055': {
    distractors: ['pay taxes', 'obey traffic laws', 'serve in the army'],
    why: 'Americans participate by voting, joining parties or campaigns, and contacting elected officials.',
  },
  'CIVICS100_056': {
    distractors: ['January 1', 'July 4', 'December 31'],
    why: 'Federal income tax returns are due April 15 each year.',
  },
  'CIVICS100_057': {
    distractors: ['at age sixteen (16)', 'at age twenty-one (21)', 'only during wartime'],
    why: 'Men must register for Selective Service at 18 (between 18 and 26).',
  },
  'CIVICS100_058': {
    distractors: ['to find gold only', 'to build railroads', 'to escape the cold'],
    why: 'Colonists came seeking freedom, religious liberty, economic opportunity, and escape from persecution.',
  },
  'CIVICS100_059': {
    distractors: ['Europeans', 'Africans', 'Asians'],
    why: 'American Indians (Native Americans) lived in America long before Europeans arrived.',
  },
  'CIVICS100_060': {
    distractors: ['Europeans', 'Asians', 'Native Americans'],
    why: 'Millions of Africans were captured, transported, and sold as slaves in America.',
  },
  'CIVICS100_061': {
    distractors: ['because of religious differences', 'because of language barriers', 'because of bad weather'],
    why: 'Colonists fought over taxation without representation, British troops in homes, and lack of self-government.',
  },
  'CIVICS100_062': {
    distractors: ['(George) Washington', '(Benjamin) Franklin', '(John) Adams'],
    why: 'Thomas Jefferson was the principal author of the Declaration of Independence.',
  },
  'CIVICS100_063': {
    distractors: ['July 4, 1492', 'July 4, 1787', 'December 25, 1776'],
    why: 'The Declaration of Independence was adopted on July 4, 1776.',
  },
  'CIVICS100_064': {
    distractors: ['California', 'Texas', 'Florida'],
    why: 'The 13 original states include New Hampshire, Massachusetts, New York, Virginia, Georgia, and others.',
  },
  'CIVICS100_065': {
    distractors: ['The Bill of Rights was written.', 'The Declaration was signed.', 'The war ended.'],
    why: 'Delegates met in Philadelphia in 1787 and wrote the U.S. Constitution.',
  },
  'CIVICS100_066': {
    distractors: ['1776', '1791', '1803'],
    why: 'The Constitution was written in 1787 and ratified in 1788.',
  },
  'CIVICS100_067': {
    distractors: ['(Thomas) Jefferson', '(George) Washington', '(John) Adams'],
    why: 'Madison, Hamilton, and Jay wrote the Federalist Papers urging ratification of the Constitution.',
  },
  'CIVICS100_068': {
    distractors: ['He was the first President.', 'He wrote the Constitution.', 'He discovered electricity alone.'],
    why: 'Franklin was a diplomat, the oldest Constitutional Convention member, first Postmaster General, and writer.',
  },
  'CIVICS100_069': {
    distractors: ['(Thomas) Jefferson', '(Abraham) Lincoln', '(Benjamin) Franklin'],
    why: 'George Washington, first President and Revolutionary War commander, is called the Father of Our Country.',
  },
  'CIVICS100_070': {
    distractors: ['(Thomas) Jefferson', '(John) Adams', '(Abraham) Lincoln'],
    why: 'George Washington was unanimously elected as the first President in 1789.',
  },
  'CIVICS100_071': {
    distractors: ['Alaska', 'California', 'Texas'],
    why: 'The U.S. bought the Louisiana Territory from France in 1803, doubling the nation\'s size.',
  },
  'CIVICS100_072': {
    distractors: ['World War I', 'World War II', 'the Vietnam War'],
    why: '1800s U.S. wars include the War of 1812, Mexican-American War, Civil War, and Spanish-American War.',
  },
  'CIVICS100_073': {
    distractors: ['the Revolutionary War', 'World War I', 'the War of 1812'],
    why: 'The Civil War (1861-1865) was fought between the North (Union) and the South (Confederacy).',
  },
  'CIVICS100_074': {
    distractors: ['the gold rush', 'a trade dispute with Britain', 'a religious conflict'],
    why: 'Slavery, economic differences, and states\' rights led to the Civil War.',
  },
  'CIVICS100_075': {
    distractors: ['He wrote the Constitution.', 'He was the first President.', 'He discovered America.'],
    why: 'Lincoln freed the slaves (Emancipation Proclamation), preserved the Union, and led through the Civil War.',
  },
  'CIVICS100_076': {
    distractors: ['It ended the Revolutionary War.', 'It gave women the vote.', 'It created the Constitution.'],
    why: 'Lincoln\'s 1863 Emancipation Proclamation freed slaves in the Confederate states.',
  },
  'CIVICS100_077': {
    distractors: ['She was the first female President.', 'She wrote the Constitution.', 'She led the Civil War.'],
    why: 'Susan B. Anthony fought for women\'s rights and civil rights, including women\'s suffrage.',
  },
  'CIVICS100_078': {
    distractors: ['the Civil War', 'the Revolutionary War', 'the War of 1812'],
    why: '1900s U.S. wars include WWI, WWII, Korea, Vietnam, and the Persian Gulf War.',
  },
  'CIVICS100_079': {
    distractors: ['(Franklin) Roosevelt', '(Theodore) Roosevelt', '(Herbert) Hoover'],
    why: 'Woodrow Wilson was President during World War I (1914-1918).',
  },
  'CIVICS100_080': {
    distractors: ['(Woodrow) Wilson', '(Herbert) Hoover', '(Harry) Truman'],
    why: 'Franklin Roosevelt led the U.S. through the Great Depression and most of World War II.',
  },
  'CIVICS100_081': {
    distractors: ['Russia, China, and Korea', 'Britain, France, and Spain', 'Mexico, Canada, and Cuba'],
    why: 'In World War II the U.S. fought Japan, Germany, and Italy (the Axis powers).',
  },
  'CIVICS100_082': {
    distractors: ['World War I', 'the Korean War', 'the Vietnam War'],
    why: 'Eisenhower was Supreme Allied Commander in Europe during World War II before becoming President.',
  },
  'CIVICS100_083': {
    distractors: ['Terrorism', 'Immigration', 'Trade deficits'],
    why: 'During the Cold War (1945-1991), containing Communism was America\'s main concern.',
  },
  'CIVICS100_084': {
    distractors: ['the labor movement', 'the women\'s suffrage movement', 'the temperance movement'],
    why: 'The civil rights movement of the 1950s-60s fought to end racial discrimination.',
  },
  'CIVICS100_085': {
    distractors: ['He was the first Black President.', 'He wrote the Emancipation Proclamation.', 'He founded the NAACP.'],
    why: 'Martin Luther King, Jr. led the fight for civil rights and equality for all Americans.',
  },
  'CIVICS100_086': {
    distractors: ['A hurricane hit New York.', 'An earthquake hit California.', 'A volcano erupted in Hawaii.'],
    why: 'On September 11, 2001, terrorists attacked the United States, killing nearly 3,000 people.',
  },
  'CIVICS100_087': {
    distractors: ['Aztec', 'Maya', 'Inca'],
    why: 'Many tribes live in the U.S., including Cherokee, Navajo, Sioux, Apache, and Hopi.',
  },
  'CIVICS100_088': {
    distractors: ['Colorado (River)', 'Hudson (River)', 'Rio Grande'],
    why: 'The Missouri and Mississippi are the two longest rivers in the United States.',
  },
  'CIVICS100_089': {
    distractors: ['Atlantic (Ocean)', 'Indian (Ocean)', 'Arctic (Ocean)'],
    why: 'The Pacific Ocean borders the West Coast of the United States.',
  },
  'CIVICS100_090': {
    distractors: ['Pacific (Ocean)', 'Indian (Ocean)', 'Arctic (Ocean)'],
    why: 'The Atlantic Ocean borders the East Coast of the United States.',
  },
  'CIVICS100_091': {
    distractors: ['Hawaii', 'Alaska', 'Rhode Island'],
    why: 'U.S. territories include Puerto Rico, Guam, the U.S. Virgin Islands, American Samoa, and the Northern Mariana Islands.',
  },
  'CIVICS100_092': {
    distractors: ['California', 'Texas', 'Florida'],
    why: 'Many northern states border Canada, including Maine, New York, Michigan, Minnesota, and Washington.',
  },
  'CIVICS100_093': {
    distractors: ['Florida', 'Oregon', 'Nevada'],
    why: 'Four states border Mexico: California, Arizona, New Mexico, and Texas.',
  },
  'CIVICS100_094': {
    distractors: ['New York City', 'Philadelphia', 'Los Angeles'],
    why: 'Washington, D.C. has been the U.S. capital since 1800.',
  },
  'CIVICS100_095': {
    distractors: ['Washington, D.C.', 'Philadelphia', 'Boston Harbor'],
    why: 'The Statue of Liberty stands in New York Harbor on Liberty Island.',
  },
  'CIVICS100_096': {
    distractors: ['because there are 50 states', 'because there are 13 amendments', 'because of the 13 Presidents'],
    why: 'The 13 stripes represent the 13 original colonies.',
  },
  'CIVICS100_097': {
    distractors: ['because there were 50 colonies', 'because of the 50 amendments', 'because of 50 Presidents'],
    why: 'The 50 stars represent the 50 states - one star per state.',
  },
  'CIVICS100_098': {
    distractors: ['America the Beautiful', 'God Bless America', 'My Country, Tis of Thee'],
    why: 'The national anthem is "The Star-Spangled Banner," written during the War of 1812.',
  },
  'CIVICS100_099': {
    distractors: ['December 25', 'January 1', 'November 11'],
    why: 'Independence Day is celebrated on July 4, the anniversary of the Declaration\'s adoption in 1776.',
  },
  'CIVICS100_100': {
    distractors: ['Halloween', 'Valentine\'s Day', 'St. Patrick\'s Day'],
    why: 'National U.S. holidays include New Year\'s Day, Memorial Day, Independence Day, Thanksgiving, and Christmas.',
  },
};
