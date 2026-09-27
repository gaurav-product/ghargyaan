import type { Category, KnowledgeItem } from './types';
import { firstAid } from './data/firstAid';
import { discomfort } from './data/discomfort';
import { traditional } from './data/traditional';
import { household } from './data/household';
import { seasonal } from './data/seasonal';

export const KNOWLEDGE: KnowledgeItem[] = [...firstAid, ...discomfort, ...traditional, ...household, ...seasonal];

export const byId = new Map(KNOWLEDGE.map((k) => [k.id, k]));

export const CATEGORY_META: Record<Category, { label: string; label_hi: string; blurb: string }> = {
  first_aid: { label: 'First aid', label_hi: 'प्राथमिक उपचार', blurb: 'Cuts, burns, bites, sprains and nosebleeds.' },
  discomfort: { label: 'Everyday discomfort', label_hi: 'रोज़ की तकलीफ़ें', blurb: 'Sore throat, cough, acidity, headache.' },
  traditional: { label: 'Traditional wisdom', label_hi: 'पारंपरिक ज्ञान', blurb: '"Dadi says…" practices, checked against evidence.' },
  food: { label: 'Food & kitchen', label_hi: 'रसोई और भोजन', blurb: 'Washing produce and storing leftovers.' },
  wellness: { label: 'Wellness', label_hi: 'सेहत', blurb: 'Sleep, screens and desk-day stiffness.' },
  household: { label: 'Household', label_hi: 'घरेलू काम', blurb: 'Stains, smells, mould and burnt vessels.' },
  seasonal: { label: 'Seasonal', label_hi: 'मौसमी', blurb: 'Summer heat, monsoon mosquitoes, winter skin.' },
};

export const CATEGORY_ORDER: Category[] = ['first_aid', 'discomfort', 'traditional', 'food', 'wellness', 'household', 'seasonal'];

/** Runtime integrity checks; also used by the test suite. */
export function validateKnowledge(items: KnowledgeItem[] = KNOWLEDGE): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const k of items) {
    if (ids.has(k.id)) errors.push(`duplicate id ${k.id}`);
    ids.add(k.id);
    if (!k.how_to.length) errors.push(`${k.id}: empty how_to`);
    if (!k.source.length) errors.push(`${k.id}: no source`);
    if (!k.keywords.length) errors.push(`${k.id}: no keywords`);
    const hasUrl = k.source.some((s) => !!s.url);
    if (!hasUrl && k.review_status !== 'needs_source') errors.push(`${k.id}: no URL source but not marked needs_source`);
    if (k.category !== 'household' && k.category !== 'food' && !k.when_to_seek_help.length) errors.push(`${k.id}: no when_to_seek_help`);
  }
  return errors;
}
