import type { Source } from './types';

/**
 * Every URL here was checked to resolve (HTTP 200) on 2026-09-26 and the
 * cited claim was checked against the page text. If a claim could not be
 * matched to a source, the item is marked `needs_source` instead of being
 * given an invented citation.
 */
const nhs = (slug: string, title: string, supports: string): Source => ({
  title,
  publisher: 'NHS (UK National Health Service)',
  url: `https://www.nhs.uk/conditions/${slug}/`,
  supports,
});

export const SRC = {
  cuts: nhs('cuts-and-grazes', 'Cuts and grazes', 'Stopping bleeding, cleaning and dressing small wounds; when to get help.'),
  burns: nhs('burns-and-scalds', 'Burns and scalds', 'Cool running water for 20 minutes; no creams, oils or butter; when to go to A&E.'),
  blisters: nhs('blisters', 'Blisters', 'Keeping blisters clean and covered; not bursting them; signs of infection.'),
  bites: nhs('insect-bites-and-stings', 'Insect bites and stings', 'Removing stings, cold compress, not scratching, allergic-reaction warning signs.'),
  sprains: nhs('sprains-and-strains', 'Sprains and strains', 'PRICE steps for the first 2–3 days and when to get help.'),
  nosebleed: nhs('nosebleed', 'Nosebleed', 'Lean forward, pinch the soft part of the nose for 10–15 minutes; when to go to A&E.'),
  soreThroat: nhs('sore-throat', 'Sore throat', 'Salt-water gargles for adults (not children), fluids, rest; emergency signs.'),
  cough: nhs('cough', 'Cough', 'Rest, fluids, lemon and honey (not under 1 year, limited evidence); when to see a doctor.'),
  cold: nhs('common-cold', 'Common cold', 'Rest, fluids; do not let children breathe steam from a bowl (scald risk); no honey under 12 months.'),
  headache: nhs('headaches', 'Headaches', 'Water, rest, avoiding screen strain; emergency headache warning signs.'),
  nausea: nhs('feeling-sick-nausea', 'Feeling sick (nausea)', 'Fresh air, sips of cold drinks, ginger or peppermint tea, small meals.'),
  indigestion: nhs('indigestion', 'Indigestion', 'Cutting down tea/coffee, not eating 3–4 hours before bed; warning symptoms.'),
  heartburn: nhs('heartburn-and-acid-reflux', 'Heartburn and acid reflux', 'Smaller meals, trigger foods, raising the head of the bed.'),
  constipation: nhs('constipation', 'Constipation', 'Fibre, fluids, toilet routine, activity.'),
  dehydration: nhs('dehydration', 'Dehydration', 'Symptoms, sipping fluids, oral rehydration solution, emergency signs.'),
  motion: nhs('motion-sickness', 'Motion sickness', 'Looking at the horizon, fresh air, not reading, ginger.'),
  fatigue: nhs('tiredness-and-fatigue', 'Tiredness and fatigue', 'Sleep routine, activity, when tiredness needs a GP.'),
  heat: nhs('heat-exhaustion-heatstroke', 'Heat exhaustion and heatstroke', 'Cooling steps, fluids, and heatstroke emergency signs.'),
  sunburn: nhs('sunburn', 'Sunburn', 'Cooling the skin; no ice or petroleum jelly; when to get help.'),
  neck: nhs('neck-pain', 'Neck pain', 'Keeping the neck moving, heat/cold packs, posture at a desk.'),
  foodPoisoning: nhs('food-poisoning', 'Food poisoning', 'Fluids and emergency signs after eating spoiled food.'),
  botulismNhs: nhs('botulism', 'Botulism', 'Infant botulism can be caused by honey.'),
  ear: nhs('ear-infections', 'Ear infections', 'Do not put anything inside your ear; most ear infections improve within 3 days; when to see a GP.'),
  heatRash: nhs('heat-rash-prickly-heat', 'Heat rash (prickly heat)', 'Keep skin cool, loose cotton, cold compress, pat instead of scratching; see a GP if not improving.'),
  animalBites: nhs('animal-and-human-bites', 'Animal and human bites', 'Clean the wound and get medical help for animal bites.'),
  poisoning: nhs('poisoning', 'Poisoning', 'What to do if someone may have swallowed something poisonous.'),
  anaphylaxis: nhs('anaphylaxis', 'Anaphylaxis', 'Signs of a severe allergic reaction and calling emergency services.'),
  stroke: { title: 'Stroke symptoms', publisher: 'NHS (UK National Health Service)', url: 'https://www.nhs.uk/conditions/stroke/symptoms/', supports: 'FAST: face, arms, speech, time to call emergency services.' },
  headInjury: nhs('head-injury-and-concussion', 'Head injury and concussion', 'Warning signs after a head injury that need emergency care.'),
  childRash: nhs('skin-rash-children', 'Rashes in babies and children', 'Rash that does not fade under a glass with fever needs emergency care.'),
  snake: nhs('snake-bites', 'Snake bites', 'Get emergency help; keep the bitten part still while waiting.'),
  eyeInjury: nhs('eye-injuries', 'Eye injuries', 'Wash with clean water if something is in the eye; do not rub or remove objects that pierced the eye.'),
  gas: { title: 'Emergency helpline (LPG)', publisher: 'Ministry of Petroleum and Natural Gas, Government of India', url: 'https://mopng.gov.in/en/marketing/emergency-helpline', supports: 'LPG emergency helpline 1906 for gas leaks.' },
  poisonCentre: { title: 'National Poisons Information Centre', publisher: 'AIIMS New Delhi', url: 'https://www.aiims.edu/index.php/hi/npic_intro', supports: 'Toll-free poison information line 1800 116 117.' },
  teleManas: { title: 'Tele MANAS', publisher: 'Ministry of Health and Family Welfare, Government of India', url: 'https://telemanas.mohfw.gov.in/', supports: 'Free 24×7 mental health support on 14416.' },
  heatwave: {
    title: 'Heatwave: how to cope in hot weather',
    publisher: 'NHS (UK National Health Service)',
    url: 'https://www.nhs.uk/live-well/seasonal-health/heatwave-how-to-cope-in-hot-weather/',
    supports: 'Staying out of the heat, keeping homes cool, checking on vulnerable people.',
  },
  sleep: {
    title: 'Sleep (Every Mind Matters)',
    publisher: 'NHS (UK National Health Service)',
    url: 'https://www.nhs.uk/every-mind-matters/mental-health-issues/sleep/',
    supports: 'Regular sleep routine and wind-down habits.',
  },
  infantBotulism: {
    title: 'Infant botulism',
    publisher: 'MedlinePlus (US National Library of Medicine)',
    url: 'https://medlineplus.gov/ency/article/001384.htm',
    supports: 'Honey should not be given to infants under 12 months.',
  },
  aapCough: {
    title: 'Coughs and Colds: Medicines or Home Remedies?',
    publisher: 'HealthyChildren.org (American Academy of Pediatrics)',
    url: 'https://www.healthychildren.org/English/health-issues/conditions/chest-lungs/Pages/Coughs-and-Colds-Medicines-or-Home-Remedies.aspx',
    supports: 'No honey under 1 year; honey may help cough in children aged 1 and older.',
  },
  bruises: {
    title: 'Bruises',
    publisher: 'MedlinePlus (US National Library of Medicine)',
    url: 'https://medlineplus.gov/bruises.html',
    supports: 'What bruises are and how they are usually managed.',
  },
  ginger: {
    title: 'Ginger: Usefulness and Safety',
    publisher: 'NCCIH (US National Institutes of Health)',
    url: 'https://www.nccih.nih.gov/health/ginger',
    supports: 'Evidence on ginger for nausea; possible side effects.',
  },
  turmeric: {
    title: 'Turmeric: Usefulness and Safety',
    publisher: 'NCCIH (US National Institutes of Health)',
    url: 'https://www.nccih.nih.gov/health/turmeric',
    supports: 'Turmeric evidence is mixed and hard to compare; some curcumin products may harm the liver.',
  },
  ayurveda: {
    title: 'Ayurvedic Medicine: In Depth',
    publisher: 'NCCIH (US National Institutes of Health)',
    url: 'https://www.nccih.nih.gov/health/ayurvedic-medicine-in-depth',
    supports: 'Some Ayurvedic preparations may contain toxic levels of lead, mercury or arsenic.',
  },
  lead: {
    title: 'Lead poisoning (fact sheet)',
    publisher: 'World Health Organization',
    url: 'https://www.who.int/news-room/fact-sheets/detail/lead-poisoning-and-health',
    supports: 'Some traditional cosmetics and medicines contain lead; young children are especially vulnerable.',
  },
  dengue: {
    title: 'Dengue and severe dengue (fact sheet)',
    publisher: 'World Health Organization',
    url: 'https://www.who.int/news-room/fact-sheets/detail/dengue-and-severe-dengue',
    supports: 'Covering skin, nets, repellents (DEET, picaridin, IR3535), emptying stored water weekly.',
  },
  rabies: {
    title: 'Rabies (fact sheet)',
    publisher: 'World Health Organization',
    url: 'https://www.who.int/news-room/fact-sheets/detail/rabies',
    supports: 'Wash animal bites/scratches with soap and water for 15 minutes and seek medical care.',
  },
  diarrhoea: {
    title: 'Diarrhoeal disease (fact sheet)',
    publisher: 'World Health Organization',
    url: 'https://www.who.int/news-room/fact-sheets/detail/diarrhoeal-disease',
    supports: 'Oral rehydration solution for fluid loss; safe water and hygiene.',
  },
  foodSafetyWho: {
    title: 'Food safety (fact sheet)',
    publisher: 'World Health Organization',
    url: 'https://www.who.int/news-room/fact-sheets/detail/food-safety',
    supports: 'Keeping food at safe temperatures and preventing contamination.',
  },
  fiveKeys: {
    title: 'Five keys to safer food manual',
    publisher: 'World Health Organization',
    url: 'https://www.who.int/publications/i/item/9789241594639',
    supports: 'Keep clean, separate raw and cooked, cook thoroughly, keep food at safe temperatures, use safe water.',
  },
  produce: {
    title: 'Selecting and Serving Produce Safely',
    publisher: 'US Food and Drug Administration',
    url: 'https://www.fda.gov/food/buy-store-serve-safe-food/selecting-and-serving-produce-safely',
    supports: 'Wash produce under running water; do not use soap or detergent on produce.',
  },
  chilling: {
    title: 'How to chill, freeze and defrost food safely',
    publisher: 'Food Standards Agency (UK)',
    url: 'https://www.food.gov.uk/safety-hygiene/chilling',
    supports: 'Cooling and refrigerating leftovers promptly.',
  },
  mouldEpa: {
    title: 'A Brief Guide to Mold, Moisture and Your Home',
    publisher: 'US Environmental Protection Agency',
    url: 'https://www.epa.gov/mold/brief-guide-mold-moisture-and-your-home',
    supports: 'Fix moisture, dry items within 24–48 hours; never mix bleach with ammonia.',
  },
  dryskin: {
    title: "Dermatologists' top tips for relieving dry skin",
    publisher: 'American Academy of Dermatology',
    url: 'https://www.aad.org/public/everyday-care/skin-care-basics/dry/dermatologists-tips-relieve-dry-skin',
    supports: 'Short warm showers, moisturise straight after, humidifier, gentle products.',
  },
  screens: {
    title: 'Computers, Digital Devices, and Eye Strain',
    publisher: 'American Academy of Ophthalmology',
    url: 'https://www.aao.org/eye-health/tips-prevention/computer-usage',
    supports: 'Blink more, look up and into the distance regularly, sit about an arm’s length from the screen, reduce glare.',
  },
  activity: {
    title: 'Physical activity guidelines for adults aged 19 to 64',
    publisher: 'NHS (UK National Health Service)',
    url: 'https://www.nhs.uk/live-well/exercise/exercise-guidelines/physical-activity-guidelines-for-adults-aged-19-to-64/',
    supports: 'Breaking up long periods of sitting; weekly activity targets.',
  },
  ashwagandha: {
    title: 'Ashwagandha: Usefulness and Safety',
    publisher: 'NCCIH (US National Institutes of Health)',
    url: 'https://www.nccih.nih.gov/health/ashwagandha',
    supports: 'Rare cases of liver injury linked to supplements; avoid in pregnancy and breastfeeding.',
  },
  peppermint: {
    title: 'Peppermint Oil: Usefulness and Safety',
    publisher: 'NCCIH (US National Institutes of Health)',
    url: 'https://www.nccih.nih.gov/health/peppermint-oil',
    supports: 'Only a small amount of research on peppermint oil; promoted for headaches among other uses.',
  },
  aloe: {
    title: 'Aloe Vera: Usefulness and Safety',
    publisher: 'NCCIH (US National Institutes of Health)',
    url: 'https://www.nccih.nih.gov/health/aloe-vera',
    supports: 'Topical aloe is promoted for burns; oral aloe may be unsafe in pregnancy.',
  },
  sja: {
    title: 'First aid advice',
    publisher: 'St John Ambulance',
    url: 'https://www.sja.org.uk/get-advice/first-aid-advice/',
    supports: 'General first-aid reference (bruises, splinters, sprains).',
  },
} satisfies Record<string, Source>;

/** Used when content is general household know-how with no clinical claim. */
export const GENERAL_HOUSEHOLD: Source = {
  title: 'General household practice',
  publisher: 'GharGyaan editorial draft',
  supports: 'Common cleaning practice. No health claim is made. Awaiting editorial review.',
};

export const INDIA_HELPLINES = {
  emergency: { label: 'Emergency (all services)', number: '112' },
  ambulance: { label: 'Ambulance (most states)', number: '108' },
  poison: { label: 'National Poisons Information Centre, AIIMS (toll-free)', number: '1800 116 117' },
  mental: { label: 'Tele-MANAS mental health helpline (24×7)', number: '14416' },
  gas: { label: 'LPG gas leak emergency', number: '1906' },
  childline: { label: 'Childline (children in distress)', number: '1098' },
};
