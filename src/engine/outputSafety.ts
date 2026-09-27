/**
 * Output safety validator. Applied to every piece of model-generated text
 * before it reaches the user. If anything fails, the model text is discarded
 * and a deterministic template from the knowledge base is used instead.
 */
export interface OutputCheck {
  ok: boolean;
  violations: string[];
}

const RULES: { id: string; pattern: RegExp }[] = [
  // Diagnosis language
  { id: 'diagnosis', pattern: /\b(you|he|she|they|your (child|baby|son|daughter)) (have|has|are suffering from|definitely have|likely have|probably have)\b.{0,40}\b(infection|disease|eczema|psoriasis|dermatitis|dengue|malaria|typhoid|covid|pneumonia|cancer|diabetes|fracture|allergy|asthma|migraine|ulcer|condition|disorder|syndrome|meningitis|appendicitis)\b/i },
  { id: 'diagnosis', pattern: /\b(this (is|looks like|appears to be) (a |an )?(case of )?(infection|eczema|psoriasis|fungal|ringworm|cellulitis|melanoma|cancer|dengue|chickenpox|measles|scabies))\b/i },
  { id: 'diagnosis', pattern: /\bi (can )?(diagnose|confirm)\b/i },
  // Dosing / prescriptions
  { id: 'dose', pattern: /\b\d+(\.\d+)?\s?(mg|mcg|µg|milligrams?|ml|millilit(re|er)s?|tablets?|pills?|capsules?|drops|goli|goliyan)\b/i },
  { id: 'dose', pattern: /\b(take|give|use)\b.{0,20}\b(antibiotic|amoxicillin|azithromycin|steroid|prednisolone|codeine|tramadol|aspirin)\b/i },
  // Dangerous framing
  { id: 'stop_meds', pattern: /\b(stop|quit|skip)\b.{0,20}\b(your|the|prescribed)\b.{0,20}\b(medicine|medication|tablets|insulin)\b/i },
  { id: 'cure_claim', pattern: /\b(cures?|cured|guaranteed?|miracle|100% (safe|effective)|permanent(ly)? (fix|cure))\b/i },
  { id: 'no_doctor', pattern: /\b(no need (to|for) (see|a) (a )?doctor|don'?t (need to )?(see|go to) (a )?doctor|avoid (the )?(doctor|hospital)|instead of (seeing )?(a )?doctor)\b/i },
  { id: 'delay_care', pattern: /\b(wait (a few|several|some) (days|hours) before (calling|going|seeking))\b/i },
  { id: 'replace_professional', pattern: /\b(i am|i'm) (a |your )?(doctor|physician|nurse)\b/i },
];

export function validateOutput(text: string): OutputCheck {
  const violations = RULES.filter((r) => r.pattern.test(text)).map((r) => r.id);
  return { ok: violations.length === 0, violations: [...new Set(violations)] };
}
