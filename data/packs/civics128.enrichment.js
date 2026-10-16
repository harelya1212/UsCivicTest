/**
 * civics128.enrichment.js - Curated distractors and explanations for the
 * USCIS 2025 civics 128-question pack.
 *
 * The question bank lives in civicsQuestionBank.js. This file adds the app
 * layer: plausible wrong answers for multiple-choice mode and short "why"
 * explanations. Same shape as civics100.enrichment.js (distractors + why),
 * merged by civics128.pack.js into wrongAnswers { easy, medium, hard }
 * and whyThisAnswer.
 */

export const CIVICS128_ENRICHMENT = {
  'CIVICS_001': {
    distractors: ['Monarchy', 'Dictatorship', 'Communism'],
    why: 'The United States is a republic - citizens elect representatives to govern under the Constitution.',
  },
  'CIVICS_002': {
    distractors: ['the Declaration of Independence', 'the Bill of Rights', 'the Articles of Confederation'],
    why: 'The Constitution is the supreme law of the land - no other law may contradict it.',
  },
  'CIVICS_003': {
    distractors: ['declares independence from Britain', 'elects the President', 'collects federal taxes'],
    why: 'The Constitution forms the government, defines its powers, and protects basic rights.',
  },
  'CIVICS_004': {
    distractors: ['rule by a king', 'government by the wealthy', 'military rule'],
    why: '"We the People" means political authority comes from the citizens themselves - self-government.',
  },
  'CIVICS_005': {
    distractors: ['executive orders', 'Supreme Court rulings', 'presidential vetoes'],
    why: 'The Constitution is changed through amendments - 27 have been ratified so far.',
  },
  'CIVICS_006': {
    distractors: ['the powers of the President', 'the right to a driver\'s license', 'states\' right to coin money'],
    why: 'The Bill of Rights (the first 10 amendments) protects basic freedoms like speech, religion, and due process.',
  },
  'CIVICS_007': {
    distractors: ['Twenty-five (25)', 'Thirty (30)', 'Twenty-three (23)'],
    why: 'The Constitution has 27 amendments, most recently ratified in 1992.',
  },
  'CIVICS_008': {
    distractors: ['it ended the Civil War', 'it freed the slaves', 'it created the Constitution'],
    why: 'The Declaration announced the colonies\' independence from Britain and proclaimed that all people are created equal.',
  },
  'CIVICS_009': {
    distractors: ['the Constitution', 'the Bill of Rights', 'the Articles of Confederation'],
    why: 'The Declaration of Independence (1776) announced the colonies\' break from Britain.',
  },
  'CIVICS_010': {
    distractors: ['monarchy', 'taxation without representation', 'divine right of kings'],
    why: 'Both documents rest on ideas like equality, liberty, natural rights, and limited government.',
  },
  'CIVICS_011': {
    distractors: ['the Constitution', 'the Bill of Rights', 'the Federalist Papers'],
    why: '"Life, Liberty, and the pursuit of Happiness" opens the Declaration\'s statement of unalienable rights.',
  },
  'CIVICS_012': {
    distractors: ['Communism', 'Socialism', 'Feudalism'],
    why: 'The U.S. has a capitalist (free-market) economy based on private ownership and competition.',
  },
  'CIVICS_013': {
    distractors: ['only citizens must follow the law', 'the President is above the law', 'laws apply only in wartime'],
    why: 'The rule of law means everyone - including leaders and government - must obey the law; no one is above it.',
  },
  'CIVICS_014': {
    distractors: ['the Emancipation Proclamation', 'the Gettysburg Address', 'the Monroe Doctrine'],
    why: 'Documents like the Declaration of Independence, Articles of Confederation, and Federalist Papers shaped the Constitution.',
  },
  'CIVICS_015': {
    distractors: ['to make laws pass faster', 'to give the President more power', 'to reduce the number of courts'],
    why: 'Three branches with checks and balances keep any one part of government from becoming too powerful.',
  },
  'CIVICS_016': {
    distractors: ['Senate, House, and Cabinet', 'federal, state, and local', 'Army, Navy, and Air Force'],
    why: 'The three branches are legislative (Congress), executive (President), and judicial (courts).',
  },
  'CIVICS_017': {
    distractors: ['legislative branch', 'judicial branch', 'the Federal Reserve'],
    why: 'The President heads the executive branch, which enforces the laws.',
  },
  'CIVICS_018': {
    distractors: ['the President', 'the Supreme Court', 'the Cabinet'],
    why: 'Congress (the legislative branch) writes federal laws.',
  },
  'CIVICS_019': {
    distractors: ['Senate and Cabinet', 'House and Supreme Court', 'President and Vice President'],
    why: 'Congress has two chambers: the Senate and the House of Representatives.',
  },
  'CIVICS_020': {
    distractors: ['vetoes bills', 'commands the military', 'appoints judges'],
    why: 'Congress writes laws, declares war, and controls federal spending - among other powers.',
  },
  'CIVICS_021': {
    distractors: ['Fifty (50)', 'Two hundred (200)', 'Four hundred thirty-five (435)'],
    why: 'There are 100 senators - two from each of the 50 states.',
  },
  'CIVICS_022': {
    distractors: ['Four (4) years', 'Two (2) years', 'Eight (8) years'],
    why: 'U.S. senators serve six-year terms.',
  },
  'CIVICS_023': {
    distractors: ['your state\'s governor', 'your U.S. representative', 'the Vice President'],
    why: 'Each state elects two U.S. senators - look up the current officeholders for your state.',
  },
  'CIVICS_024': {
    distractors: ['One hundred (100)', 'Five hundred (500)', 'Four hundred fifty (450)'],
    why: 'The House has 435 voting members, apportioned by state population.',
  },
  'CIVICS_025': {
    distractors: ['Four (4) years', 'Six (6) years', 'One (1) year'],
    why: 'House members serve two-year terms, so they face voters frequently.',
  },
  'CIVICS_026': {
    distractors: ['to save money on elections', 'because the House has more members', 'to give senators more power'],
    why: 'Short two-year terms keep representatives closely accountable to voters\' current opinions.',
  },
  'CIVICS_027': {
    distractors: ['One (1)', 'Three (3)', 'Four (4)'],
    why: 'Every state has two senators regardless of population.',
  },
  'CIVICS_028': {
    distractors: ['because of state population', 'because of the state\'s size', 'to match the House'],
    why: 'Equal Senate representation (two per state) was the Great Compromise, protecting small states.',
  },
  'CIVICS_029': {
    distractors: ['one of your U.S. senators', 'your state\'s governor', 'your mayor'],
    why: 'Your U.S. representative serves your congressional district in the House - look up your current one.',
  },
  'CIVICS_030': {
    distractors: ['the Senate Majority Leader', 'the Vice President', 'the House Minority Leader'],
    why: 'The Speaker of the House leads the House of Representatives - check uscis.gov for the current name.',
  },
  'CIVICS_031': {
    distractors: ['people of their district', 'people of their city', 'only their political party'],
    why: 'A senator represents all the people of their state.',
  },
  'CIVICS_032': {
    distractors: ['citizens from their district', 'the state legislature', 'the governor'],
    why: 'Since the 17th Amendment, senators are elected directly by the citizens of their state.',
  },
  'CIVICS_033': {
    distractors: ['citizens of their whole state', 'citizens of the nation', 'only registered party members'],
    why: 'House members represent the citizens of their congressional district.',
  },
  'CIVICS_034': {
    distractors: ['citizens of the whole state', 'the state governor', 'the U.S. senators'],
    why: 'House members are elected by voters in their congressional district.',
  },
  'CIVICS_035': {
    distractors: ['because of the state\'s size', 'because of the state\'s age', 'because of the number of senators'],
    why: 'House seats are apportioned by population - more people means more representatives.',
  },
  'CIVICS_036': {
    distractors: ['Two (2) years', 'Six (6) years', 'Eight (8) years'],
    why: 'The President serves a four-year term.',
  },
  'CIVICS_037': {
    distractors: ['because of the 12th Amendment', 'because of the 25th Amendment', 'because of a Supreme Court ruling'],
    why: 'The 22nd Amendment (1951) limits presidents to two terms.',
  },
  'CIVICS_038': {
    distractors: ['the Vice President', 'the Secretary of State', 'the Chief Justice'],
    why: 'Check uscis.gov/citizenship/testupdates for the current President\'s name.',
  },
  'CIVICS_039': {
    distractors: ['the First Lady', 'the Speaker of the House', 'the Secretary of Defense'],
    why: 'Check uscis.gov/citizenship/testupdates for the current Vice President\'s name.',
  },
  'CIVICS_040': {
    distractors: ['the Speaker of the House', 'the Secretary of State', 'the Chief Justice'],
    why: 'The Vice President is first in the line of presidential succession.',
  },
  'CIVICS_041': {
    distractors: ['declares war', 'writes federal laws', 'interprets the Constitution'],
    why: 'The President can sign or veto bills, enforce laws, command the military, and appoint federal judges.',
  },
  'CIVICS_042': {
    distractors: ['the Secretary of Defense', 'the highest-ranking general', 'the Secretary of State'],
    why: 'The President is Commander in Chief of the armed forces.',
  },
  'CIVICS_043': {
    distractors: ['the Speaker of the House', 'the Chief Justice', 'the Secretary of State'],
    why: 'Bills passed by Congress go to the President to be signed into law.',
  },
  'CIVICS_044': {
    distractors: ['the Supreme Court', 'the Speaker of the House', 'state governors'],
    why: 'The President can veto bills, sending them back to Congress.',
  },
  'CIVICS_045': {
    distractors: ['the Senate', 'the Chief Justice', 'state governors'],
    why: 'The President nominates federal judges, with Senate confirmation.',
  },
  'CIVICS_046': {
    distractors: ['the Senate', 'the Supreme Court', 'the House of Representatives'],
    why: 'The executive branch includes the President, the Cabinet, and federal departments and agencies.',
  },
  'CIVICS_047': {
    distractors: ['writes federal laws', 'decides court cases', 'elects the President'],
    why: 'The Cabinet - heads of the federal departments - advises the President.',
  },
  'CIVICS_048': {
    distractors: ['Senate Majority Leader', 'Chief Justice', 'Speaker of the House'],
    why: 'Cabinet posts include Secretary of State, Secretary of Defense, Attorney General, and other department heads.',
  },
  'CIVICS_049': {
    distractors: ['it elects members of Congress', 'it counts the national popular vote', 'it appoints Supreme Court justices'],
    why: 'The Electoral College formally elects the President - 270 electoral votes wins.',
  },
  'CIVICS_050': {
    distractors: ['the Senate', 'the Cabinet', 'the Electoral College'],
    why: 'The judicial branch includes the Supreme Court and the lower federal courts.',
  },
  'CIVICS_051': {
    distractors: ['writes new laws', 'enforces the laws', 'vetoes bills'],
    why: 'The judicial branch interprets laws and decides whether they conflict with the Constitution.',
  },
  'CIVICS_052': {
    distractors: ['Court of Appeals', 'District Court', 'Court of Claims'],
    why: 'The U.S. Supreme Court is the highest court in the land.',
  },
  'CIVICS_053': {
    distractors: ['Seven (7)', 'Eleven (11)', 'Twelve (12)'],
    why: 'The Supreme Court has nine justices.',
  },
  'CIVICS_054': {
    distractors: ['Three (3)', 'Seven (7)', 'Nine (9)'],
    why: 'Five votes make a majority on the nine-member Court.',
  },
  'CIVICS_055': {
    distractors: ['six years', 'ten years', 'four years'],
    why: 'Justices serve for life, unless they retire or are impeached.',
  },
  'CIVICS_056': {
    distractors: ['to earn a higher salary', 'to avoid paying taxes', 'to serve the President longer'],
    why: 'Life tenure keeps justices independent from political pressure.',
  },
  'CIVICS_057': {
    distractors: ['an Associate Justice', 'the Attorney General', 'the Senate Majority Leader'],
    why: 'Check uscis.gov/citizenship/testupdates for the current Chief Justice.',
  },
  'CIVICS_058': {
    distractors: ['provide police protection', 'issue driver\'s licenses', 'run public schools'],
    why: 'Only the federal government can print money, declare war, and make treaties.',
  },
  'CIVICS_059': {
    distractors: ['print paper money', 'declare war', 'make treaties with other countries'],
    why: 'States handle schools, police, driver\'s licenses, and other local matters.',
  },
  'CIVICS_060': {
    distractors: ['it gives all powers to the federal government', 'it abolished slavery', 'it guarantees free speech'],
    why: 'The 10th Amendment reserves powers not given to the federal government for the states (or the people).',
  },
  'CIVICS_061': {
    distractors: ['your state\'s lieutenant governor', 'one of your U.S. senators', 'your state\'s attorney general'],
    why: 'The governor is your state\'s chief executive - look up your current one.',
  },
  'CIVICS_062': {
    distractors: ['Washington, D.C.', 'your state\'s largest city', 'New York City'],
    why: 'Every state has its own capital city - look up yours.',
  },
  'CIVICS_063': {
    distractors: ['only property owners can vote', 'only men can vote', 'citizens must be 21 to vote'],
    why: 'Voting amendments lowered the voting age to 18, banned poll taxes, and extended the vote regardless of race or sex.',
  },
  'CIVICS_064': {
    distractors: ['permanent residents', 'anyone living in the United States', 'only people born in the U.S.'],
    why: 'Only U.S. citizens can vote in federal elections, run for federal office, and serve on federal juries.',
  },
  'CIVICS_065': {
    distractors: ['the right to vote in federal elections', 'the right to run for President', 'the right to a free college education'],
    why: 'Everyone in the U.S. - citizen or not - has basic rights like speech, religion, and assembly.',
  },
  'CIVICS_066': {
    distractors: ['the President', 'the Constitution', 'the military'],
    why: 'The Pledge of Allegiance expresses loyalty to the United States and its flag.',
  },
  'CIVICS_067': {
    distractors: ['pay higher taxes', 'serve in Congress', 'vote in every election'],
    why: 'New citizens promise loyalty to the U.S., to defend the Constitution, and to obey U.S. laws.',
  },
  'CIVICS_068': {
    distractors: ['by living here for one year', 'by marrying any U.S. resident', 'by buying property in the U.S.'],
    why: 'People become citizens by birth in the U.S., through naturalization, or by derivation through citizen parents.',
  },
  'CIVICS_069': {
    distractors: ['pay income taxes', 'obey traffic laws', 'watch the news'],
    why: 'Voting, joining a party, campaigning, and community groups are all civic participation.',
  },
  'CIVICS_070': {
    distractors: ['buy American products', 'fly the flag', 'learn a second language'],
    why: 'Voting, military service, paying taxes, and public service are ways to serve the country.',
  },
  'CIVICS_071': {
    distractors: ['it is optional for citizens', 'only businesses must pay', 'it funds state governments only'],
    why: 'Federal taxes are required by law (16th Amendment) and fund the federal government.',
  },
  'CIVICS_072': {
    distractors: ['to get a driver\'s license', 'to qualify for college', 'to vote in elections'],
    why: 'Registration is required by law and keeps any future draft fair.',
  },
  'CIVICS_073': {
    distractors: ['to find gold only', 'to build railroads', 'to escape the Civil War'],
    why: 'Colonists sought freedom, religious liberty, and economic opportunity.',
  },
  'CIVICS_074': {
    distractors: ['the Vikings', 'Spanish settlers', 'English colonists'],
    why: 'American Indians (Native Americans) lived here long before Europeans arrived.',
  },
  'CIVICS_075': {
    distractors: ['Europeans', 'Native Americans', 'Asian immigrants'],
    why: 'Millions of Africans were captured, transported, and sold into slavery.',
  },
  'CIVICS_076': {
    distractors: ['the Civil War', 'the War of 1812', 'World War I'],
    why: 'The American Revolution (1775-1783) won independence from Britain.',
  },
  'CIVICS_077': {
    distractors: ['to end slavery', 'to discover gold', 'to escape French rule'],
    why: 'Britain\'s high taxes, troops in colonists\' homes, and denial of self-government drove the colonies to declare independence.',
  },
  'CIVICS_078': {
    distractors: ['George Washington', 'Benjamin Franklin', 'John Adams'],
    why: 'Thomas Jefferson wrote the Declaration of Independence in 1776.',
  },
  'CIVICS_079': {
    distractors: ['July 4, 1789', 'December 25, 1776', 'July 4, 1787'],
    why: 'The Declaration of Independence was adopted on July 4, 1776.',
  },
  'CIVICS_080': {
    distractors: ['the Battle of Gettysburg', 'the attack on Pearl Harbor', 'the Louisiana Purchase'],
    why: 'Key Revolution events include Bunker Hill, Saratoga, Yorktown, and Washington\'s crossing of the Delaware.',
  },
  'CIVICS_081': {
    distractors: ['California', 'Texas', 'Florida'],
    why: 'The 13 original colonies became the first 13 states, from New Hampshire to Georgia.',
  },
  'CIVICS_082': {
    distractors: ['Declaration of Independence', 'Bill of Rights', 'Articles of Confederation'],
    why: 'The Constitution was written in Philadelphia in 1787.',
  },
  'CIVICS_083': {
    distractors: ['Thomas Jefferson', 'George Washington', 'Benjamin Franklin'],
    why: 'Madison, Hamilton, and Jay wrote the Federalist Papers as "Publius."',
  },
  'CIVICS_084': {
    distractors: ['they declared independence from Britain', 'they ended slavery', 'they wrote the Bill of Rights'],
    why: 'The Federalist Papers explained and promoted the new Constitution to win ratification.',
  },
  'CIVICS_085': {
    distractors: ['first President of the United States', 'invented the telephone', 'led the Confederate Army'],
    why: 'Franklin was a Founding Father - inventor, diplomat, writer, and the first Postmaster General.',
  },
  'CIVICS_086': {
    distractors: ['wrote the Declaration of Independence', 'invented the cotton gin', 'third President of the United States'],
    why: 'Washington led the Continental Army and became the first President.',
  },
  'CIVICS_087': {
    distractors: ['first President of the United States', 'Father of the Constitution', 'led the Union in the Civil War'],
    why: 'Jefferson wrote the Declaration and, as third President, bought Louisiana.',
  },
  'CIVICS_088': {
    distractors: ['first President of the United States', 'wrote the Declaration of Independence', 'invented the light bulb'],
    why: 'Madison is the "Father of the Constitution" and was the fourth President.',
  },
  'CIVICS_089': {
    distractors: ['second President of the United States', 'invented the steamboat', 'wrote the Bill of Rights'],
    why: 'Hamilton was the first Treasury Secretary and co-wrote the Federalist Papers.',
  },
  'CIVICS_090': {
    distractors: ['Alaska', 'Florida', 'Texas'],
    why: 'The Louisiana Purchase (1803) doubled the nation\'s size.',
  },
  'CIVICS_091': {
    distractors: ['World War I', 'the Vietnam War', 'the Korean War'],
    why: '1800s U.S. wars include the War of 1812, Mexican-American War, Civil War, and Spanish-American War.',
  },
  'CIVICS_092': {
    distractors: ['the Revolutionary War', 'the War of 1812', 'World War II'],
    why: 'The Civil War (1861-1865) was fought between the North (Union) and South (Confederacy).',
  },
  'CIVICS_093': {
    distractors: ['the Battle of Bunker Hill', 'the attack on Pearl Harbor', 'the storming of the Bastille'],
    why: 'Fort Sumter, Gettysburg, Vicksburg, and the Emancipation Proclamation were pivotal Civil War events.',
  },
  'CIVICS_094': {
    distractors: ['first President of the United States', 'wrote the Constitution', 'won World War II'],
    why: 'Lincoln preserved the Union and issued the Emancipation Proclamation.',
  },
  'CIVICS_095': {
    distractors: ['gave women the vote', 'ended the Revolutionary War', 'created the Constitution'],
    why: 'Lincoln\'s 1863 Emancipation Proclamation freed slaves in the Confederate states.',
  },
  'CIVICS_096': {
    distractors: ['the Revolutionary War', 'World War I', 'the Vietnam War'],
    why: 'The Civil War ended slavery, sealed by the 13th Amendment.',
  },
  'CIVICS_097': {
    distractors: ['13th Amendment', '15th Amendment', '19th Amendment'],
    why: 'The 14th Amendment guarantees citizenship to all born or naturalized in the U.S.',
  },
  'CIVICS_098': {
    distractors: ['with the 13th Amendment', 'with the 19th Amendment', 'in 1920'],
    why: 'The 15th Amendment (1870) prohibited denying the vote based on race.',
  },
  'CIVICS_099': {
    distractors: ['Clara Barton', 'Harriet Beecher Stowe', 'Dolley Madison'],
    why: 'Leaders like Susan B. Anthony and Elizabeth Cady Stanton fought for women\'s suffrage.',
  },
  'CIVICS_100': {
    distractors: ['the Civil War', 'the War of 1812', 'the Revolutionary War'],
    why: '1900s U.S. wars include both World Wars, Korea, Vietnam, and the Gulf War.',
  },
  'CIVICS_101': {
    distractors: ['the bombing of Pearl Harbor', 'the invasion of South Korea', 'the Cuban Missile Crisis'],
    why: 'Germany\'s unrestricted submarine warfare on U.S. ships drew America into WWI in 1917.',
  },
  'CIVICS_102': {
    distractors: ['1870', '1965', '1776'],
    why: 'The 19th Amendment (1920) gave women the vote nationwide.',
  },
  'CIVICS_103': {
    distractors: ['a period of rapid economic growth', 'a war in Europe', 'a political revolution'],
    why: 'The Great Depression was the longest and deepest economic downturn in modern history.',
  },
  'CIVICS_104': {
    distractors: ['1919 stock market crash', '1939 stock market crash', '1941 stock market crash'],
    why: 'The stock market crash of October 1929 triggered the Great Depression.',
  },
  'CIVICS_105': {
    distractors: ['Herbert Hoover', 'Harry Truman', 'Dwight Eisenhower'],
    why: 'Franklin D. Roosevelt led the U.S. through the Depression and most of WWII.',
  },
  'CIVICS_106': {
    distractors: ['the sinking of the Lusitania', 'the invasion of Poland alone', 'the bombing of London'],
    why: 'Japan\'s surprise attack on Pearl Harbor (Dec 7, 1941) brought the U.S. into WWII.',
  },
  'CIVICS_107': {
    distractors: ['led the Confederacy in the Civil War', 'invented the airplane', 'wrote the New Deal'],
    why: 'Eisenhower commanded Allied forces in WWII and later became the 34th President.',
  },
  'CIVICS_108': {
    distractors: ['China', 'Germany', 'Japan'],
    why: 'The Soviet Union (USSR) was America\'s main Cold War rival.',
  },
  'CIVICS_109': {
    distractors: ['the gold standard', 'immigration from Europe', 'the price of oil'],
    why: 'Containing communism - and the threat of nuclear war - dominated Cold War policy.',
  },
  'CIVICS_110': {
    distractors: ['to gain Korean territory', 'to support Japan\'s invasion', 'to control oil fields'],
    why: 'The U.S. intervened in Korea to stop communist expansion.',
  },
  'CIVICS_111': {
    distractors: ['to colonize Vietnam', 'to build military bases in Asia', 'to support French colonial rule'],
    why: 'Like Korea, Vietnam was fought to contain the spread of communism.',
  },
  'CIVICS_112': {
    distractors: ['fought to lower taxes', 'fought for women\'s suffrage', 'fought to end Prohibition'],
    why: 'The civil rights movement fought to end racial segregation and discrimination.',
  },
  'CIVICS_113': {
    distractors: ['first Black President', 'founded the NAACP', 'wrote the Emancipation Proclamation'],
    why: 'Dr. King led the nonviolent struggle for civil rights and equality.',
  },
  'CIVICS_114': {
    distractors: ['to overthrow the Iraqi government', 'to stop the spread of communism', 'to defend Israel from invasion'],
    why: 'The U.S.-led coalition expelled Iraq\'s army from Kuwait in 1991.',
  },
  'CIVICS_115': {
    distractors: ['a major earthquake hit California', 'the stock market crashed', 'a hurricane struck Florida'],
    why: 'On 9/11, terrorists hijacked planes and attacked the World Trade Center and the Pentagon.',
  },
  'CIVICS_116': {
    distractors: ['the Vietnam War', 'the Korean War', 'the Gulf War'],
    why: 'After 9/11 the U.S. fought in Afghanistan and Iraq as part of the War on Terror.',
  },
  'CIVICS_117': {
    distractors: ['Amish', 'Creole', 'Hawaiian'],
    why: 'Hundreds of tribes include the Apache, Cherokee, Navajo, Sioux, and many others.',
  },
  'CIVICS_118': {
    distractors: ['the printing press', 'gunpowder', 'the steam engine'],
    why: 'American innovations include the light bulb, airplane, assembly line, and the Moon landing.',
  },
  'CIVICS_119': {
    distractors: ['New York City', 'Philadelphia', 'Los Angeles'],
    why: 'Washington, D.C. is the nation\'s capital.',
  },
  'CIVICS_120': {
    distractors: ['Washington, D.C.', 'Boston Harbor', 'Philadelphia'],
    why: 'The Statue of Liberty stands in New York Harbor on Liberty Island.',
  },
  'CIVICS_121': {
    distractors: ['for the 13 presidents', 'for the 13 amendments', 'for the 13 wars'],
    why: 'The 13 stripes represent the 13 original colonies.',
  },
  'CIVICS_122': {
    distractors: ['for the 50 original colonies', 'for the 50 presidents', 'for the 50 amendments'],
    why: 'Each of the 50 stars represents one state.',
  },
  'CIVICS_123': {
    distractors: ['America the Beautiful', 'God Bless America', 'My Country \'Tis of Thee'],
    why: '"The Star-Spangled Banner" is the national anthem.',
  },
  'CIVICS_124': {
    distractors: ['In God we trust', 'liberty and justice', 'one nation under God'],
    why: '"E Pluribus Unum" is Latin for "Out of many, one."',
  },
  'CIVICS_125': {
    distractors: ['a holiday to honor veterans', 'a holiday to celebrate the Constitution', 'a holiday to honor the flag'],
    why: 'Independence Day (July 4th) celebrates the adoption of the Declaration of Independence.',
  },
  'CIVICS_126': {
    distractors: ['Valentine\'s Day', 'Halloween', 'St. Patrick\'s Day'],
    why: 'National holidays include Independence Day, Thanksgiving, Memorial Day, Veterans Day, and others.',
  },
  'CIVICS_127': {
    distractors: ['a holiday to honor all veterans', 'a holiday to celebrate independence', 'a holiday to honor the President'],
    why: 'Memorial Day honors military members who died in service.',
  },
  'CIVICS_128': {
    distractors: ['a holiday to honor fallen soldiers only', 'a holiday to celebrate the end of wars', 'a holiday to honor the President'],
    why: 'Veterans Day (Nov 11) honors everyone who has served in the U.S. military.',
  },
};
