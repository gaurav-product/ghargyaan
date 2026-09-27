import type { Category } from '../kb/types';
import type { Intent, NormalizedQuery, RetrievalResult, SafetyVerdict } from './types';

const CATEGORY_INTENT: Record<Category, Intent> = {
  first_aid: 'FIRST_AID',
  discomfort: 'COMMON_DISCOMFORT',
  traditional: 'TRADITIONAL_REMEDY',
  food: 'FOOD',
  wellness: 'WELLNESS',
  household: 'HOUSEHOLD_DIY',
  seasonal: 'SEASONAL',
};

const HOUSEHOLD_CUE = /\b(stain|daag|dag|smell|badbu|odour|odor|clean|cleaning|saaf|wash (clothes|kapde)|kapde|kapda|fabric|shirt|towel|saree|sofa|grease|musty|kurta|uniform|fridge|drain|sink|vessel|bartan|kadhai|pan|pot|pateela|patila|utensil|cooker|mould|mold|fungus|seelan|cupboard|almari)\b/;
const HOUSEHOLD_HI = /दाग|कपड़|बदबू|फ्रिज|बर्तन|कड़ाही|सीलन|फफूंद|सिंक|नाली/;
/** Body words: "burnt my finger on the pan" is a skin burn, not a burnt pan. */
const BODY_CUE = /\b(finger|fingers|hand|hands|arm|wrist|skin|leg|foot|feet|face|palm|thumb|elbow|knee|ungli|haath|hath|pair|bazu|chehra)\b|उंगली|हाथ|पैर|त्वचा/;
const STAIN_CUE = /\b(stain|stains|daag|dag|kapde|kapda|fabric|shirt|kurta|saree|towel|sofa)\b|दाग|कपड़/;
const FOOD_HI = /सब्ज़ी|सब्जी|बासी|फल धो/;
const FOOD_CUE = /\b(leftover|leftovers|store food|basi|baasi|reheat|vegetable|vegetables|sabzi|sabji|fruit|fruits|phal)\b/;

/**
 * Pre-retrieval routing hints: which part of the knowledge base to prefer.
 * Health vs household is the most important split — "burn" on skin vs a
 * "burnt kadhai" must not be confused.
 */
export function routeHints(q: NormalizedQuery): { prefer: Category[]; exclude: Category[] } {
  const t = q.text;
  const bodyNotStain = BODY_CUE.test(t) && !STAIN_CUE.test(t);
  const household = !bodyNotStain && (HOUSEHOLD_CUE.test(t) || HOUSEHOLD_HI.test(t));
  const food = FOOD_CUE.test(t) || FOOD_HI.test(t);
  if (household || food) {
    const prefer: Category[] = [];
    if (household) prefer.push('household');
    if (food) prefer.push('food');
    return { prefer, exclude: [] };
  }
  if (q.mythCue) return { prefer: ['traditional'], exclude: ['household'] };
  return { prefer: [], exclude: ['household'] };
}

export function classifyIntent(
  q: NormalizedQuery,
  safety: SafetyVerdict,
  retrieval: RetrievalResult | null,
  hasImage: boolean,
): Intent {
  if (safety.kind === 'self_harm' || safety.kind === 'emergency') return 'EMERGENCY';
  if (safety.kind === 'blocked') return 'UNSAFE_REQUEST';
  const top = retrieval?.hits[0]?.item;
  if (!top || retrieval?.confidence === 'none') return hasImage ? 'IMAGE_CONTEXT' : 'UNKNOWN';
  if (q.mythCue && (top.myth || top.category === 'traditional')) return 'MYTH_CHECK';
  if (q.audienceHint === 'child' || q.audienceHint === 'infant') {
    if (top.category === 'first_aid' || top.category === 'discomfort') return 'CHILD';
  }
  if (hasImage) return 'IMAGE_CONTEXT';
  return CATEGORY_INTENT[top.category];
}
