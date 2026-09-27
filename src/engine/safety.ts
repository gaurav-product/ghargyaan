/**
 * Input safety + red-flag detection.
 *
 * Runs BEFORE retrieval and BEFORE any language model. Rules are deliberately
 * conservative: a false alarm costs the user a tap; a missed emergency could
 * cost far more. Patterns cover English, Hinglish (Roman Hindi) and Hindi.
 */
import { SRC } from '../kb/sources';
import type { Source } from '../kb/types';
import { clean } from './normalize';
import type { BlockReason, EmergencyMatch, SafetyVerdict } from './types';

export const MAX_INPUT = 1000;

interface Rule {
  id: string;
  label: string;
  patterns: RegExp[];
  doNow: string[];
  dont?: string[];
  callFirst: EmergencyMatch['callFirst'];
  level?: EmergencyMatch['level'];
  sources: Source[];
  /** Pattern already contains a negation word ("no urine"), so skip the negation guard. */
  skipNegation?: boolean;
  /** Suppress when these appear (e.g. "food poisoning" is not a poisoning emergency). */
  unless?: RegExp;
}

const CALL_112 = 'Call 112 now (or 108 for an ambulance).';

export const EMERGENCY_RULES: Rule[] = [
  {
    id: 'breathing',
    label: 'Difficulty breathing',
    patterns: [
      /\b(can'?t|cannot|can not|unable to|trouble|difficulty|difficult|hard to|struggling to|problem) (breathe|breathing)\b/,
      /\b(not|stopped|isn'?t) breathing\b/,
      /\b(shortness of breath|short of breath|gasping|choking|breathless(ness)?)\b/,
      /\bsaa?ns (nahi|nahin|ruk|phool|phul|lene (me|mein) (dikkat|takleef|taklif|problem|pareshani))/,
      /\bdam ghut/,
      /सांस (नहीं|रुक|फूल|लेने में)|साँस (नहीं|रुक|फूल|लेने में)|दम घुट/,
    ],
    doNow: [CALL_112, 'Help them sit upright and loosen tight clothing.', 'If they have their own prescribed inhaler or adrenaline pen, help them use it as prescribed.', 'Stay with them and follow the call handler’s instructions.'],
    callFirst: 'emergency',
    sources: [SRC.anaphylaxis],
  },
  {
    id: 'chest_pain',
    label: 'Chest pain',
    patterns: [
      /\bchest (pain|tightness|pressure|heaviness)\b/,
      /\bpain in (my|the|his|her) chest\b/,
      /\bheart attack\b/,
      /\b(seene|sine|chhati|chaati) (me|mein) (dard|bhaaripan|bharipan|jakdan|dabav)/,
      /सीने में (दर्द|भारीपन|जकड़न)|छाती में दर्द|दिल का दौरा/,
    ],
    doNow: [CALL_112, 'Sit down and rest. Do not walk around or drive yourself.', 'Stay with them until help arrives.'],
    callFirst: 'emergency',
    sources: [SRC.nausea],
  },
  {
    id: 'unconscious',
    label: 'Unconscious or not responding',
    patterns: [
      /\b(unconscious|unresponsive|passed out|fainted|not waking|won'?t wake|can'?t wake|not responding)\b/,
      /\b(behosh|hosh nahi|hosh me nahi|hosh mein nahi)\b/,
      /बेहोश|होश नहीं/,
    ],
    doNow: [CALL_112, 'If they are breathing, turn them on their side (recovery position).', 'If they are not breathing, start CPR if you know how, and follow the call handler.'],
    callFirst: 'emergency',
    sources: [SRC.poisoning, SRC.headInjury],
  },
  {
    id: 'severe_bleeding',
    label: 'Severe bleeding',
    patterns: [
      /\b(bleeding|blood) (a lot|heavily|won'?t stop|not stopping|doesn'?t stop|does not stop|nonstop|everywhere|is spurting|spurting|gushing)\b/,
      /\b(heavy|severe|lots of) (bleeding|blood)\b/,
      /\b(spurting|gushing) blood\b/,
      /\bkhoon (ruk nahi|nahi ruk|band nahi|bahut)|\bbahut (zyada |jyada )?khoon\b/,
      /बहुत खून|खून (नहीं रुक|रुक नहीं|बंद नहीं)/,
    ],
    doNow: [CALL_112, 'Press firmly on the wound with a clean cloth and keep pressing.', 'If something is stuck in the wound, do not pull it out. Press around it.', 'Raise the injured part if you can.'],
    callFirst: 'emergency',
    sources: [SRC.cuts],
  },
  {
    id: 'major_burn',
    label: 'Serious burn, electrical or chemical injury',
    patterns: [
      /\b(large|big|huge|serious|severe|major|deep|bad) burns?\b/,
      /\b(whole|entire) (arm|leg|hand|back|chest|body|face) (is )?(burn|burnt|burned|jal)/,
      /\bburn(ed|t|s)?\b.{0,15}\b(on|to) (the |my |his |her |their )?(face|chest|genitals|private)/,
      /\b(face|chehra|muh|munh) (jal|burn)/,
      /\b(electric (shock|burn)|electrocut|current (lag|laga|lagi)|bijli ka jhatka|shock laga)/,
      /\b(acid|tezaab|tezab|chemical) (attack|burn|fell|gir|pad|splash|se jal)/,
      /\bchemical burn\b/,
      /\b(burn|burnt|burned|burning|jal|jala|jali)\b.{0,20}\b(acid|tezaab|tezab|chemical|bleach|harpic|toilet cleaner|drain cleaner|caustic|chuna|lime)\b/,
      /\b(acid|tezaab|chemical|bleach|harpic|toilet cleaner|drain cleaner|caustic)\b.{0,25}\b(burn|burnt|burned|jal|fell on|splash|spilled|gir)\b/,
      /तेज़ाब|तेजाब|करंट/,
    ],
    doNow: [
      CALL_112,
      'For a heat burn: cool it under cool running water while you wait (up to 20 minutes). Do not use ice.',
      'For electric shock: do not touch the person until the power is switched off.',
      'For chemicals: rinse with plenty of running water and remove contaminated clothing carefully.',
      'Do not apply toothpaste, oil, butter or creams.',
    ],
    callFirst: 'emergency',
    sources: [SRC.burns],
  },
  {
    id: 'head_injury',
    label: 'Head injury with warning signs',
    patterns: [
      /\bhead injury\b/,
      /\b(hit|bumped|banged|injured|fell on) (his |her |my |their )?head\b.{0,40}\b(vomit|vomiting|unconscious|drowsy|sleepy|confus|fit|seizure|bleeding from (the )?ear|knocked out)/,
      /\b(sir|sar) (par|pe|me|mein) (chot|lagi|laga).{0,40}\b(ulti|behosh|neend|bleeding|khoon)/,
      /\bknocked out\b/,
    ],
    unless: /\b(no|not|without) (vomit|vomiting|drowsiness|confusion)\b/,
    doNow: [CALL_112, 'Keep them still and stay with them.', 'If they are unconscious but breathing, place them on their side.', 'Do not let them drive.'],
    callFirst: 'emergency',
    sources: [SRC.headInjury],
  },
  {
    id: 'poisoning',
    label: 'Possible poisoning or dangerous swallowing',
    patterns: [
      /\b(swallowed|swallow|drank|drunk|drink|ate|eaten|licked|kha liya|kha li|kha gaya|kha gayi|pi liya|pi li|pee liya|pee li|nigal (liya|li|gaya|gayi)|muh me dal)\b.{0,40}\b(bleach|phenyl|phenol|harpic|lizol|kerosene|mitti ka tel|petrol|diesel|pesticide|insecticide|rat poison|chuha maar|chuhe ki dawai|poison|zeher|zehar|detergent|surf|acid|tezaab|tablets|pills|medicine|medicines|dawai|dawa|goli|goliyan|battery|batteries|button cell|magnet|coin|sikka|mothball|naphthalene|keetnashak|thinner|cleaner|mosquito liquid|all out|good knight|hit spray|baygon|nail polish remover|perfume|sanitiser|sanitizer)\b/,
      /\b(bleach|phenyl|phenol|harpic|lizol|kerosene|mitti ka tel|petrol|diesel|pesticide|insecticide|rat poison|chuha maar|zeher|zehar|detergent|acid|tezaab|battery|button cell|mothball|naphthalene|keetnashak|thinner|toilet cleaner|mosquito liquid|baygon|sanitiser|sanitizer)\b.{0,20}\b(pi liya|pi li|pee liya|pee li|kha liya|kha li|nigal liya|nigal li|swallowed|drank|ate)\b/,
      /\b(poisoned|poisoning|zeher|zehar|jahar)\b/,
      /ज़हर|जहर|ज़हरीला/,
    ],
    unless: /\bfood poisoning\b/,
    doNow: [
      'Call the Poisons Information Centre on 1800 116 117, or 112 if they are unwell.',
      'Do not try to make them vomit.',
      'Keep the container or packet to show the doctor.',
      'If they are unconscious but breathing, place them on their side.',
    ],
    dont: ['Do not give salt water, milk, or oil to "wash it out" unless a medical professional tells you to.'],
    callFirst: 'poison',
    sources: [SRC.poisoning, SRC.poisonCentre],
  },
  {
    id: 'overdose',
    label: 'Possible overdose',
    patterns: [
      /\boverdose\b/,
      /\btoo many (pills|tablets|medicines)\b/,
      /\b(whole|entire|full) (strip|bottle|packet) of\b/,
      /\b(bahut saari|bahut sari|zyada|jyada) (goliyan|goli|dawai|tablets)\b/,
      /\bpoori strip\b/,
    ],
    doNow: ['Call 112 or the Poisons Information Centre on 1800 116 117 now.', 'Keep the medicine packet to show the doctor.', 'Do not try to make them vomit.'],
    callFirst: 'poison',
    sources: [SRC.poisoning, SRC.poisonCentre],
  },
  {
    id: 'anaphylaxis',
    label: 'Possible severe allergic reaction',
    patterns: [
      /\b(swelling|swollen|swell|sooj|soojan|sujan|sooja|suja)\b.{0,25}\b(lips?|tongue|throat|face|mouth|hont|honth|jeebh|jibh|gala|gale|chehra|chehre)\b/,
      /\b(lips?|tongue|throat|face|mouth|hont|honth|jeebh|gala|gale|chehra) (is |are |has )?(swelling|swollen|swell|sooj|sooja|suj)/,
      /\banaphyla/,
      /\bthroat (is )?(closing|tight)/,
      /\ballergic reaction\b.{0,30}\b(breath|swell|faint|dizzy)/,
      /होंठ.{0,10}सूज|गले में सूजन|चेहरे पर सूजन/,
    ],
    doNow: [CALL_112, 'If they have a prescribed adrenaline auto-injector, use it now.', 'Lie them down with legs raised, or sit up if breathing is hard.', 'Stay with them.'],
    callFirst: 'emergency',
    sources: [SRC.anaphylaxis],
  },
  {
    id: 'stroke',
    label: 'Possible stroke',
    patterns: [
      /\bface (is )?(droop|drooping|dropped|tedha)/,
      /\bslurred speech\b/,
      /\b(speech|speaking|words) (is |are |became |sounds )?(slurred|garbled|unclear)\b/,
      /\b(can'?t|cannot|unable to|not able to) (move|lift|feel) (his|her|my|their|the|one) (right |left )?(arm|leg|hand|side|face)\b/,
      /\b(one side|one arm|one leg|left side|right side|half (the )?body)\b.{0,15}\b(weak|numb|paraly|not moving)/,
      /\bsudden(ly)?\b.{0,20}\b(weakness|weak|numbness|numb|can'?t speak|cannot speak|confusion|confused|can'?t move|cannot move)\b/,
      /(?<!heat )(?<!sun )\bstroke\b/,
      /\b(lakwa|laqwa|muh tedha|munh tedha|zubaan ladkhada|zuban ladkhada)\b/,
      /लकवा|मुंह टेढ़ा|मुँह टेढ़ा/,
    ],
    doNow: [CALL_112 + ' Note the time symptoms started.', 'Do not give food, drink or medicine.', 'Stay with them.'],
    callFirst: 'emergency',
    sources: [SRC.stroke],
  },
  {
    id: 'seizure',
    label: 'Seizure (fit)',
    patterns: [
      /\b(seizure|seizures|convulsion|convulsions|convulsing)\b/,
      /\b(having|had|getting) (a )?fits?\b/,
      /\bfits? (aa|aaya|aaye|pad|pada|padi)\b/,
      /\b(mirgi|daura pada|daura pad|daura aaya|jhatke aa)/,
      /मिर्गी|दौरा (पड़|आया)|झटके/,
    ],
    doNow: [CALL_112, 'Move hard objects away. Do not hold them down.', 'Do not put anything in their mouth.', 'When the jerking stops, turn them on their side.'],
    callFirst: 'emergency',
    sources: [SRC.headache],
  },
  {
    id: 'severe_dehydration',
    label: 'Signs of severe dehydration',
    patterns: [
      /\b(no|not|hasn'?t|haven'?t) (peed|urinated|passed urine|wee(d)?|had a wet nappy|wet diaper)\b.{0,25}\b(all day|since|hours|12|24|today)/,
      /\bsunken (eyes|soft spot|fontanelle)\b/,
      /\b(peshab|pishab|susu) (nahi|nahin) (hua|aaya|aayi|kiya)\b/,
      /\bcan'?t keep (any )?(water|fluids|anything) down\b/,
    ],
    skipNegation: true,
    doNow: [CALL_112 + ' or get to a hospital now.', 'If they can swallow, give small sips of ORS while you get help.'],
    callFirst: 'emergency',
    sources: [SRC.dehydration],
  },
  {
    id: 'eye_injury',
    label: 'Eye injury',
    patterns: [
      /\b(chemical|acid|chuna|choona|lime|bleach|cement|chilli|chili|mirchi|hot oil|glass|metal|firecracker|cracker|pataka|phenyl|harpic)\b.{0,20}\b(in|into|mein|me|went in)\b.{0,8}\b(eye|eyes|aankh|aankhon|ankh)\b/,
      /\beye injury\b/,
      /\b(hit|poked|stabbed|struck) in the eye\b/,
      /\b(aankh|ankh) (me|mein) (chot|kuch chala gaya|ghus)/,
      /आँख में (चोट|केमिकल|चूना)|आंख में (चोट|केमिकल|चूना)/,
    ],
    doNow: ['Get urgent medical help (112 or the nearest eye casualty).', 'If a chemical got in, rinse the eye with plenty of clean running water while someone arranges help.', 'Do not rub the eye. Do not try to remove anything stuck in it.'],
    callFirst: 'emergency',
    sources: [SRC.eyeInjury],
  },
  {
    id: 'snake_bite',
    label: 'Snake or scorpion bite',
    patterns: [
      /\b(snake|saanp|sanp|saap|cobra|krait|viper|scorpion|bichhu|bicchu|bichchhu)\b/,
      /साँप|सांप|बिच्छू/,
    ],
    doNow: [CALL_112 + ' Get to a hospital with anti-venom as fast as possible.', 'Keep the bitten part still and the person calm.', 'Remove rings, bangles or tight items near the bite.'],
    dont: ['Do not cut the bite, suck it, or tie a tight tourniquet.', 'Do not use herbal or tantric treatments and delay hospital care.'],
    callFirst: 'emergency',
    sources: [SRC.snake],
  },
  {
    id: 'animal_bite',
    label: 'Animal bite or scratch (rabies risk)',
    patterns: [
      /\b(dog|puppy|cat|kitten|monkey|rat|bat|stray|kutta|kutte|kutiya|kutti|billi|bandar|chuha|jaanwar|janwar)\b.{0,25}\b(bite|bit|bitten|biting|kaat|kata|kaata|kaati|kaatna|scratch|scratched|nakhun|panja|pakad)/,
      /\b(bitten|bit|scratched) by (a |an |the |our )?(dog|puppy|cat|monkey|rat|bat|stray)/,
      /\b(dog|cat|monkey) bite\b/,
      /कुत्ते ने काट|कुत्ता काट|बंदर ने काट|बिल्ली ने/,
    ],
    doNow: [
      'Wash the wound under running water with soap for 15 minutes.',
      'Go to a hospital or clinic TODAY for rabies vaccine assessment, even for a small bite or scratch.',
      'Rabies is almost always fatal once symptoms start, but vaccination after a bite prevents it.',
    ],
    dont: ['Do not apply chilli, turmeric, lime or oil on the bite.', 'Do not wait to “see if the dog gets sick” before getting care.'],
    callFirst: 'clinic',
    level: 'urgent_care',
    sources: [SRC.rabies, SRC.animalBites],
  },
  {
    id: 'infant_danger',
    label: 'A baby with warning signs',
    patterns: [
      /\b(baby|infant|newborn|navjaat|shishu|\d{1,2} (month|months|mahine|mahina) (old|ka|ki|ke)?)\b.{0,50}\b(fever|temperature|bukhar|not feeding|won'?t feed|stopped feeding|doodh nahi|floppy|limp|blue|neela|breathing fast|fast breathing|very sleepy|won'?t wake|not waking|rash|high pitched cry|dehydrat)/,
      /(शिशु|नवजात).{0,30}(बुखार|दूध नहीं)/,
    ],
    doNow: ['Contact a doctor or go to a hospital now. For a baby under 3 months, a temperature of 38°C or more is an emergency.', 'Keep feeding if the baby will take it.', 'Call 112 if the baby is floppy, blue, or struggling to breathe.'],
    callFirst: 'clinic',
    level: 'urgent_care',
    sources: [SRC.cold, SRC.childRash],
  },
  {
    id: 'pregnancy',
    label: 'Pregnancy warning sign',
    patterns: [
      /\b(pregnant|pregnancy|garbh|garbhvati|garbhavastha|expecting|pet se)\b.{0,60}\b(bleeding|blood|khoon|pain|dard|fluid|leaking|water broke|paani gir|pani gir|not moving|movement|severe headache|swelling|dizzy|faint|fit|seizure|fever|bukhar)/,
      /\bwater (broke|has broken|broken)\b/,
      /गर्भ.{0,30}(खून|दर्द)/,
    ],
    doNow: ['Contact your maternity hospital, doctor or ASHA worker now, or call 112 / 102.', 'Do not take any medicine or home remedy without medical advice.'],
    callFirst: 'emergency',
    sources: [SRC.sja],
  },
  {
    id: 'worsening',
    label: 'Rapidly worsening symptoms',
    patterns: [/\b(getting|becoming|gets) (much )?worse (very )?(fast|quickly|rapidly)\b/, /\brapidly worsening\b/, /\b(tezi se|bahut tezi se) (badh|bigad)/],
    doNow: ['Get urgent medical help. Call 112 if the person is very unwell.'],
    callFirst: 'emergency',
    sources: [SRC.sja],
  },
  {
    id: 'meningitis_signs',
    label: 'Fever with warning signs',
    patterns: [
      /\b(fever|bukhar|temperature)\b.{0,50}\b(stiff neck|rash (that )?(does not|doesn'?t|won'?t) fade|confus|fit|seizure|unconscious|behosh|light hurts)/,
      /\brash (that )?(does not|doesn'?t|won'?t) fade\b/,
    ],
    skipNegation: true,
    doNow: [CALL_112, 'Stay with them and watch their breathing.'],
    callFirst: 'emergency',
    sources: [SRC.headache, SRC.childRash],
  },
  {
    id: 'drowning',
    label: 'Drowning',
    patterns: [/\b(drown|drowned|drowning|doob gaya|doob gayi|dooba|pani me doob)\b/, /डूब/],
    doNow: [CALL_112, 'If they are not breathing, start CPR if you know how and follow the call handler.'],
    callFirst: 'emergency',
    sources: [SRC.sja],
  },
  {
    id: 'gas_leak',
    label: 'Gas leak',
    patterns: [/\b(gas|lpg|cylinder|png) (leak|leaking|ki smell|ki badbu|ki gandh|smell|leak ho)/, /\b(smell of gas|gas smell|smell(ing)? (of )?(gas|lpg|cooking gas))\b/, /गैस (लीक|की गंध|की बदबू)/],
    doNow: [
      'Do not switch any lights, appliances or phones on or off near the leak. No flames or matches.',
      'Turn off the cylinder regulator if it is safe to reach.',
      'Open doors and windows, and get everyone out.',
      'From outside, call the LPG emergency helpline 1906, or 112.',
    ],
    callFirst: 'gas',
    sources: [SRC.gas],
  },
];

const SELF_HARM = [
  /\b(suicid\w*|kill (myself|me)|end (my life|it all)|want to die|wanna die|wish i (was|were) dead|don'?t want to (live|be alive)|self[ -]?harm|hurt(ing)? myself|harm(ing)? myself|take my (own )?life|no reason to live|better off dead)\b/,
  /\bcut(ting)? myself (on purpose|deliberately|again)\b/,
  /\b(better off without me|no point (in )?(living|going on|being alive)|can'?t go on (anymore|like this)?|want to disappear (forever)?|nothing to live for|tired of (living|life)|end it all|don'?t want to wake up)\b/,
  /\b(sab khatam kar (dunga|dungi|du)|jeene ka koi matlab nahi|mere bina sab|mar jaun|mar jaana behtar)\b/,
  /\b(lethal|fatal|deadly) (dose|amount)\b/,
  /\bhow (many|much) .{0,30}\b(to die|to kill|to end|would kill|is fatal|is lethal)\b/,
  /\b(khudkushi|khud kushi|aatmahatya|atmahatya|marna chahta|marna chahti|mar jana chahta|mar jana chahti|mar jaana chahta|jeena nahi chahta|jeena nahi chahti|jeene ka mann nahi|zindagi khatam|jaan de dunga|jaan de dungi)\b/,
  /आत्महत्या|मरना चाहता|मरना चाहती|जीना नहीं चाहता|जीना नहीं चाहती|ख़ुदकुशी|खुदकुशी/,
];

const SEXUAL = /\b(sex|sexual|sexually|nude|nudes|naked|porn|erotic|intercourse|orgasm|seduce|seducing|fondle|fondling|masturbat\w*|arous\w*|genitals?|private parts?)\b/;
const MINOR = /\b(child|children|kid|kids|minor|minors|underage|teen|teens|teenager|girl|boy|toddler|infant|baby|bachch\w*|bacch\w*|beta|beti|school ?girl|school ?boy|(1[0-7]|[1-9]) ?(yo|y\/o|year old|years old|saal))\b|बच्च/;
const ABUSE_DISCLOSURE = /\b(touched|abused|molested|hurt|harassed)\b/;

const BLOCKS: { reason: BlockReason; pattern: RegExp }[] = [
  { reason: 'weapons', pattern: /\b(bomb|explosive|explosives|gunpowder|detonat\w*|molotov|pipe bomb|make a gun|build a gun|nerve agent|ied)\b/ },
  { reason: 'harm_others', pattern: /\b(poison (someone|somebody|my|him|her|them|a person|husband|wife|neighbour|neighbor)|how to (make|create) (poison|toxic gas|chlorine gas)|kill (someone|somebody|him|her|them)|hurt (someone|somebody|him|her) (badly|without)|zeher (dena|de do|kaise de))\b/ },
  { reason: 'harm_others', pattern: /\bmix\b.{0,30}\b(bleach|ammonia|acid)\b.{0,30}\b(to make|make a|gas to|for gas|to hurt|toxic)\b/ },
  {
    reason: 'dangerous_diy',
    pattern: /\b(fix|repair|rewire|wire|install|open|change|replace|jod|theek)\w*\b.{0,30}\b(mains|main supply|house wiring|wiring|switchboard|mcb|electric panel|meter|transformer|high voltage|gas pipe|gas line|gas regulator|cylinder valve|lpg valve|geyser element)\b/,
  },
  { reason: 'dangerous_diy', pattern: /\b(structural|load bearing|load-bearing|pillar|beam|column)\b.{0,20}\b(remove|cut|break|tod|demolish)\b|\b(remove|cut|break|demolish)\b.{0,20}\b(load bearing|pillar|beam|column)\b/ },
  { reason: 'prescription', pattern: /\b(which|what|kaunsi|kaun si|konsi) (antibiotic|antibiotics|steroid|steroids)\b|\b(prescribe|prescription for)\b/ },
  { reason: 'prescription', pattern: /\b(stop|quit|skip|band)\b.{0,15}\b(taking )?(my|the|his|her|apni|apna)?\s?(insulin|bp|blood pressure|thyroid|sugar|diabetes|epilepsy|heart|psychiatric|depression|prescribed)\b.{0,10}\b(medicine|medicines|medication|tablets|pills|dawai|dawa|goli)\b|\bdawai band kar/ },
  {
    reason: 'dosing',
    pattern: /\b(how (much|many)|what dose|what dosage|dose of|dosage of|kitni|kitna|kitne)\b.{0,40}\b(mg|ml|tablet|tablets|pill|pills|paracetamol|ibuprofen|crocin|dolo|calpol|combiflam|antibiotic|syrup|medicine|dawai|dawa|goli|goliyan|cetirizine|azithromycin|amoxicillin|aspirin)\b/,
  },
];

function isNegated(text: string, index: number): boolean {
  const before = text.slice(Math.max(0, index - 30), index);
  const clause = before.split(/\b(but|and|however|lekin|par)\b|[.,;]/).pop() ?? before;
  return /\b(no|not|without|never|isn'?t|doesn'?t|don'?t|didn'?t|hasn'?t|haven'?t|nor|denies)\b[^]{0,20}$/.test(clause);
}

export function detectEmergencies(rawText: string): EmergencyMatch[] {
  const text = clean(rawText);
  const out: EmergencyMatch[] = [];
  for (const rule of EMERGENCY_RULES) {
    if (rule.unless && rule.unless.test(text)) {
      // "food poisoning" suppresses the generic word, but an explicit swallow still counts.
      const explicitSwallow = rule.id === 'poisoning' && /\b(swallowed|drank|kha liya|kha li|pi liya|pi li|nigal)\b/.test(text);
      if (!explicitSwallow) continue;
    }
    for (const p of rule.patterns) {
      const m = p.exec(text);
      if (!m) continue;
      if (!rule.skipNegation && isNegated(text, m.index)) continue;
      out.push({
        id: rule.id,
        label: rule.label,
        matched: m[0],
        doNow: rule.doNow,
        dont: rule.dont,
        callFirst: rule.callFirst,
        level: rule.level ?? 'emergency',
        sources: rule.sources,
      });
      break;
    }
  }
  return out;
}

export function detectSelfHarm(rawText: string): string | null {
  const text = clean(rawText);
  for (const p of SELF_HARM) {
    const m = p.exec(text);
    if (m && !isNegated(text, m.index)) return m[0];
  }
  return null;
}

export function detectBlock(rawText: string): { reason: BlockReason; matched: string } | null {
  const text = clean(rawText);
  if (SEXUAL.test(text) && MINOR.test(text)) return { reason: 'sexual_minor', matched: 'sexual+minor' };
  if (SEXUAL.test(text) && !ABUSE_DISCLOSURE.test(text)) return { reason: 'sexual_content', matched: 'sexual' };
  for (const b of BLOCKS) {
    const m = b.pattern.exec(text);
    if (m) return { reason: b.reason, matched: m[0] };
  }
  return null;
}

/** Full input screen. Order matters: self-harm first, then abuse/blocks, then emergencies. */
export function screenInput(rawText: string): SafetyVerdict {
  const trimmed = rawText.trim();
  if (!trimmed) return { kind: 'empty' };
  if (trimmed.length > MAX_INPUT) return { kind: 'too_long' };

  const sh = detectSelfHarm(trimmed);
  if (sh) return { kind: 'self_harm', matched: sh };

  const block = detectBlock(trimmed);
  const emergencies = detectEmergencies(trimmed);
  // Hard blocks first; for medicine questions an emergency in the same message wins.
  if (block && block.reason !== 'dosing' && block.reason !== 'prescription') return { kind: 'blocked', ...block };
  if (emergencies.length) return { kind: 'emergency', matches: emergencies };
  if (block) return { kind: 'blocked', ...block };
  return { kind: 'ok' };
}

export const BLOCK_MESSAGES: Record<BlockReason, { message: string; suggestion?: string }> = {
  sexual_minor: {
    message: 'GharGyaan cannot help with this. Content that sexualises children is never allowed.',
    suggestion: 'If a child is being harmed or is at risk, call Childline on 1098 or the police on 112.',
  },
  sexual_content: {
    message: 'This topic is outside what GharGyaan covers. We focus on everyday self-care, first aid and household knowledge.',
    suggestion: 'For sexual health questions, a doctor or a government health centre can help confidentially.',
  },
  weapons: {
    message: 'GharGyaan cannot help with weapons or explosives.',
  },
  harm_others: {
    message: 'GharGyaan cannot help with anything intended to harm someone.',
    suggestion: 'If someone is in danger right now, call 112.',
  },
  dangerous_diy: {
    message: 'Electrical wiring, gas lines, cylinders and structural work are dangerous to do yourself. GharGyaan does not give instructions for these.',
    suggestion: 'Please call a licensed electrician, your gas agency, or a qualified contractor. For a gas leak, call 1906.',
  },
  prescription: {
    message: 'GharGyaan does not recommend prescription medicines or advise stopping any medicine you have been prescribed.',
    suggestion: 'Speak to your doctor before changing any medicine. A pharmacist can also help with questions about your medicines.',
  },
  dosing: {
    message: 'GharGyaan does not give medicine doses. The right dose depends on age, weight, other medicines and health conditions.',
    suggestion: 'Check the leaflet in the pack, and ask a pharmacist or doctor, especially for children.',
  },
};
