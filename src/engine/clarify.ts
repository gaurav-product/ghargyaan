import type { Audience, KnowledgeItem } from '../kb/types';
import type { Answers, ClarifyStep, DurationValue, Escalation, Session } from './types';

export const AUDIENCE_STEP: ClarifyStep = {
  id: 'audience',
  kind: 'audience',
  text: 'Who is this for?',
  text_hi: 'यह किसके लिए है?',
  options: [
    { label: 'Adult', label_hi: 'वयस्क', value: 'adult' },
    { label: 'Child (1–15 years)', label_hi: 'बच्चा (1–15 साल)', value: 'child' },
    { label: 'Baby (under 1 year)', label_hi: 'शिशु (1 साल से कम)', value: 'infant' },
    { label: 'Older adult (65+)', label_hi: 'बुज़ुर्ग (65+)', value: 'older_adult' },
  ],
};

export function durationStep(item: KnowledgeItem): ClarifyStep {
  const acute = item.category === 'first_aid';
  return {
    id: 'duration',
    kind: 'duration',
    text: acute ? 'When did it happen?' : 'How long has this been going on?',
    text_hi: acute ? 'यह कब हुआ?' : 'यह कितने समय से है?',
    options: acute
      ? [
          { label: 'Just now / today', label_hi: 'अभी / आज', value: 'now' },
          { label: '1–3 days ago', label_hi: '1–3 दिन पहले', value: 'days_1_3' },
          { label: 'Longer, and it is not healing', label_hi: 'ज़्यादा समय से, ठीक नहीं हो रहा', value: 'over_week' },
        ]
      : [
          { label: 'Started today', label_hi: 'आज से', value: 'now' },
          { label: '1–3 days', label_hi: '1–3 दिन', value: 'days_1_3' },
          { label: '4–7 days', label_hi: '4–7 दिन', value: 'days_4_7' },
          { label: 'More than a week', label_hi: 'एक हफ़्ते से ज़्यादा', value: 'over_week' },
          { label: 'More than 3 weeks', label_hi: '3 हफ़्ते से ज़्यादा', value: 'over_3_weeks' },
        ],
  };
}

/** Is this guide about a person's body (and so needs "who" and "how long")? */
export function isPersonal(item: KnowledgeItem): boolean {
  return !['household', 'food'].includes(item.category) && !(item.myth && item.category === 'traditional');
}

export function needsDuration(item: KnowledgeItem): boolean {
  // First-aid injuries are acute: "when did it happen" rarely changes the advice.
  return isPersonal(item) && item.category !== 'wellness' && item.category !== 'first_aid' && item.id !== 'se-monsoon-mosquitoes';
}

/** Build the list of clarification steps still to ask — only what we don't know yet. */
export function pendingSteps(item: KnowledgeItem, session: Session): ClarifyStep[] {
  const steps: ClarifyStep[] = [];
  const a = session.answers;
  const personal = isPersonal(item);
  // Audience matters for personal guides, and for myth checks written for mixed ages.
  const audienceMatters = personal || (item.myth && item.audience.length > 1 && !item.audience.every((x) => x === 'infant'));
  if (audienceMatters && !a.audience) steps.push(AUDIENCE_STEP);
  if (needsDuration(item) && !a.duration) steps.push(durationStep(item));
  for (const q of item.clarify ?? []) {
    if (a.item[q.id] === undefined) {
      steps.push({ id: q.id, kind: 'item', text: q.text, text_hi: q.text_hi, options: q.options.map((o) => ({ label: o.label, label_hi: o.label_hi, value: o.value })) });
    }
  }
  return steps;
}

export function totalSteps(item: KnowledgeItem, session: Session): number {
  const fresh: Session = { ...session, answers: { item: {}, audience: session.normalized.audienceHint, duration: session.normalized.durationHint } };
  return pendingSteps(item, fresh).length;
}

const LONG_DISCOMFORT: Record<string, DurationValue> = {
  'dc-mild-cough': 'over_3_weeks',
  'dc-common-cold': 'over_3_weeks',
  'dc-sore-throat': 'over_week',
  'dc-mild-headache': 'over_week',
  'dc-mild-nausea': 'days_4_7',
  'dc-indigestion': 'over_3_weeks',
  'dc-constipation': 'over_3_weeks',
  'dc-mild-dehydration': 'days_4_7',
  'dc-loose-motions': 'over_week',
  'dc-fatigue': 'over_3_weeks',
  'se-heat-rash': 'days_4_7',
  'se-winter-dry-skin': 'over_3_weeks',
};

const ORDER: DurationValue[] = ['now', 'days_1_3', 'days_4_7', 'over_week', 'over_3_weeks'];

/** Deterministic escalation rules from the answers. The LLM never decides this. */
export function escalationsFor(item: KnowledgeItem, answers: Answers): Escalation[] {
  const out: Escalation[] = [];
  if (answers.audience) {
    const nf = item.not_for?.find((n) => n.audience === answers.audience);
    if (nf) out.push({ level: nf.escalate, reason: nf.reason });
  }
  if (answers.duration) {
    const threshold = LONG_DISCOMFORT[item.id] ?? (item.category === 'first_aid' ? 'over_week' : 'over_week');
    if (isPersonal(item) && ORDER.indexOf(answers.duration) >= ORDER.indexOf(threshold)) {
      out.push({
        level: 'consider_advice',
        reason:
          item.category === 'first_aid'
            ? 'It has been a while and is not healing. Get it checked by a doctor or pharmacist.'
            : 'This has lasted longer than it usually should. Speak to a doctor or pharmacist.',
      });
    }
  }
  for (const q of item.clarify ?? []) {
    const v = answers.item[q.id];
    const opt = q.options.find((o) => o.value === v);
    if (opt?.escalate) out.push({ level: opt.escalate, reason: opt.reason ?? 'Your answer suggests this needs professional care.' });
  }
  const alreadyCoveredByNotFor = item.not_for?.some((n) => n.audience === 'infant');
  if (answers.audience === 'infant' && isPersonal(item) && !item.audience.includes('infant') && !alreadyCoveredByNotFor) {
    out.push({ level: 'consider_advice', reason: 'This guide is not written for babies. Speak to a doctor or health worker about a baby.' });
  }
  return out;
}

export function audienceNote(item: KnowledgeItem, audience?: Audience): string | undefined {
  if (!audience) return undefined;
  const note = item.audience_notes?.[audience];
  if (note) return note;
  if (!item.audience.includes(audience) && isPersonal(item)) {
    const who = { adult: 'adults', child: 'children', infant: 'babies', older_adult: 'older adults' }[audience];
    return `This guide was not written specifically for ${who}. Use it with care and ask a pharmacist or doctor if unsure.`;
  }
  return undefined;
}
