import type { Audience } from '../kb/types';
import type { DurationValue, InputLanguage, NormalizedQuery } from './types';

const DEVANAGARI = /[ऀ-ॿ]/;

/** Common Roman-script Hindi function words: a strong Hinglish signal. */
const HINGLISH_MARKERS = new Set([
  'hai', 'hain', 'ho', 'raha', 'rahi', 'rahe', 'gaya', 'gayi', 'gaye', 'mein', 'me', 'mujhe', 'mere', 'meri', 'mera',
  'kya', 'nahi', 'nahin', 'kaise', 'kyu', 'kyun', 'bahut', 'thoda', 'thodi', 'ko', 'ka', 'ki', 'ke', 'se', 'par', 'pe',
  'bachche', 'bacche', 'bachcha', 'baccha', 'dadi', 'nani', 'kehti', 'bolti', 'bol', 'lagao', 'lag', 'lagi', 'karo', 'kar',
  'aur', 'bhi', 'abhi', 'kal', 'din', 'saal', 'mahine', 'sahi', 'galat', 'wala', 'wali',
]);

/**
 * Light cleanup that keeps Devanagari intact. Punctuation becomes space;
 * a few common spelling variants are folded together.
 */
export function clean(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFC')
    .replace(/[’'`]/g, "'")
    .replace(/[^a-z0-9ऀ-ॿ'\s-]/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenize(text: string): string[] {
  return clean(text)
    .split(' ')
    .filter((t) => t.length > 1 || DEVANAGARI.test(t));
}

export function detectLanguage(text: string): InputLanguage {
  if (DEVANAGARI.test(text)) return 'hi';
  const toks = tokenize(text);
  const hits = toks.filter((t) => HINGLISH_MARKERS.has(t)).length;
  return hits >= 1 && hits / Math.max(toks.length, 1) >= 0.12 ? 'hinglish' : 'en';
}

const INFANT = /\b(baby|babies|infant|newborn|new born|navjaat|shishu|(\d{1,2})\s*(month|months|mahine|mahina|mah)\s*(old|ka|ki|ke)?)\b|नवजात|शिशु|महीने/;
const CHILD = /\b(child|children|kid|kids|son|daughter|toddler|bachche|bacche|bachcha|baccha|bachchi|bacchi|beta|beti|munna|munni|school|nephew|niece|bitiya|ladka|ladki)\b|बच्च|बेटा|बेटी/;
const OLDER = /\b(grandfather|grandmother|grandpa|grandma|elderly|old man|old woman|senior|dadaji|dadiji|nanaji|naniji|budhe|buzurg)\b|बुज़ुर्ग|बुजुर्ग|दादाजी|दादीजी/;
const AGE_YEARS = /\b(\d{1,3})\s*(year|years|yr|yrs|saal|sal|varsh)\b/;

export function detectAudience(text: string): { audience?: Audience; ageText?: string } {
  const t = clean(text);
  const years = t.match(AGE_YEARS);
  if (years) {
    const n = parseInt(years[1], 10);
    if (n < 1) return { audience: 'infant', ageText: years[0] };
    if (n < 16) return { audience: 'child', ageText: years[0] };
    if (n >= 65) return { audience: 'older_adult', ageText: years[0] };
    return { audience: 'adult', ageText: years[0] };
  }
  const m = t.match(INFANT);
  if (m) {
    const months = m[2] ? parseInt(m[2], 10) : undefined;
    if (months !== undefined && months >= 12) return { audience: 'child', ageText: m[0] };
    return { audience: 'infant', ageText: m[0] };
  }
  // "dadi says…" is a myth cue, not the patient. Only treat as older adult when
  // they are the subject (e.g. "dadi ko", "my grandmother has").
  if (/\b(dadi|nani|dada|nana|grandmother|grandfather)\s+(ko|ke|ki|has|is|fell|gir)\b/.test(t) || OLDER.test(t)) {
    if (!/\b(says|said|kehti|kehte|bolti|bolte|told|suggests)\b/.test(t)) return { audience: 'older_adult' };
  }
  if (CHILD.test(t)) return { audience: 'child' };
  if (/\b(i|me|my|mujhe|mere|meri|mera|main)\b/.test(t)) return {};
  return {};
}

export function detectDuration(text: string): DurationValue | undefined {
  const t = clean(text);
  if (/\b(just now|abhi abhi|abhi|right now|few minutes|minutes ago|turant)\b/.test(t)) return 'now';
  const weeks = t.match(/\b(\d+)\s*(week|weeks|hafte|hafta|saptah)\b/);
  if (weeks) return parseInt(weeks[1], 10) >= 3 ? 'over_3_weeks' : 'over_week';
  if (/\b(a week|one week|ek hafte|ek hafta)\b/.test(t)) return 'over_week';
  if (/\b(a month|months|mahine se|mahino)\b/.test(t)) return 'over_3_weeks';
  const days = t.match(/\b(\d+)\s*(day|days|din)\b/);
  if (days) {
    const n = parseInt(days[1], 10);
    if (n <= 3) return 'days_1_3';
    if (n <= 7) return 'days_4_7';
    return n >= 21 ? 'over_3_weeks' : 'over_week';
  }
  if (/\b(today|since morning|aaj|subah se|yesterday|kal se|since yesterday)\b/.test(t)) return 'days_1_3';
  return undefined;
}

const MYTH_CUE =
  /\b(is it (true|safe|correct|okay|ok|good)|is this (true|safe|correct|right)|does .* (work|help)|myth|dadi|nani|grandma|grandmother|granny|mummy says|mom says|mother says|elders say|people say|kehti hai|kehte hai|bolti hai|bolte hai|sach hai|sahi hai kya|kya sahi|kya ye sahi|kya yeh sahi|should i (put|apply|use|give|drink)|can i (put|apply|use|give)|lagana chahiye|lagaye|lagau|safe hai)\b|सच है|सही है|दादी|नानी/;

const MEDICATION_CUE =
  /\b(mg|dose|dosage|how many (tablet|tablets|pills)|tablet|tablets|pill|pills|syrup|medicine|dawai|dawa|goli|capsule|paracetamol|ibuprofen|crocin|dolo|combiflam|antibiotic|azithromycin|amoxicillin|cetirizine|antacid)\b|दवा|दवाई|गोली/;

export function normalizeQuery(raw: string): NormalizedQuery {
  const text = clean(raw);
  const { audience, ageText } = detectAudience(raw);
  return {
    raw,
    text,
    tokens: tokenize(raw),
    language: detectLanguage(raw),
    audienceHint: audience,
    ageText,
    durationHint: detectDuration(raw),
    mythCue: MYTH_CUE.test(text),
    medicationCue: MEDICATION_CUE.test(text),
  };
}
