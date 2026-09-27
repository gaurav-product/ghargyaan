/**
 * The GharGyaan pipeline:
 *
 *   input → input safety → normalisation → routing → hybrid retrieval
 *     → clarification (only what we still need) → red-flag escalation
 *     → grounded response (+ optional model framing) → output safety → result
 *
 * Every step is recorded in a trace that the "Why am I seeing this?" drawer shows.
 */
import { KNOWLEDGE, byId } from '../kb';
import type { KnowledgeItem, SafetyLevel } from '../kb/types';
import { audienceNote, escalationsFor, pendingSteps, totalSteps } from './clarify';
import { getProvider, mockProvider, type LLMProvider } from './llm';
import { normalizeQuery } from './normalize';
import { validateOutput } from './outputSafety';
import { retrieve } from './retrieval';
import { classifyIntent, routeHints } from './router';
import { BLOCK_MESSAGES, detectEmergencies, screenInput } from './safety';
import type {
  Answers,
  ClarifyStep,
  DurationValue,
  EmergencyResult,
  GuideResult,
  PipelineOutput,
  PipelineTrace,
  RetrievalResult,
  SafetyVerdict,
  Session,
} from './types';
import type { Audience } from '../kb/types';

export interface RunOptions {
  forceDemo?: boolean;
  provider?: LLMProvider;
}

const SAFETY_ORDER: SafetyLevel[] = ['self_care', 'consider_advice', 'urgent'];
const maxSafety = (a: SafetyLevel, b: SafetyLevel) => (SAFETY_ORDER.indexOf(a) >= SAFETY_ORDER.indexOf(b) ? a : b);

/** Gadgets and vehicles being broken is not a self-care question. */
const OUT_OF_SCOPE = /\b(phone|mobile|laptop|computer|tv|television|fridge compressor|car|bike|scooter|wifi|router|charger)\b.{0,25}\b(cracked|broken|not working|repair|fix|charging|screen broke|dead battery)\b/;

export const POPULAR_IDS = ['dc-sore-throat', 'fa-minor-burn', 'fa-minor-cut', 'fa-insect-bite', 'dc-mild-headache', 'tr-toothpaste-burn', 'hh-haldi-stain'];

function newTrace(session: Session, provider: LLMProvider): PipelineTrace {
  return {
    steps: [],
    intent: 'UNKNOWN',
    language: session.normalized.language,
    mode: provider.live ? 'live' : 'demo',
    llmUsed: false,
    outputSafety: 'not_applicable',
  };
}

export function createSession(query: string, extra: { imageAttached?: boolean; imageContext?: string } = {}): Session {
  const combined = [query, extra.imageContext].filter(Boolean).join('. ');
  const normalized = normalizeQuery(combined);
  return {
    query,
    normalized,
    answers: { item: {}, audience: normalized.audienceHint, duration: normalized.durationHint },
    imageAttached: !!extra.imageAttached,
    imageContext: extra.imageContext,
  };
}

function emergencyFromVerdict(v: SafetyVerdict, trace: PipelineTrace, related?: KnowledgeItem): EmergencyResult | null {
  if (v.kind === 'self_harm') {
    return {
      kind: 'emergency',
      title: 'You deserve support right now',
      reasons: ['What you shared suggests you may be thinking about harming yourself. You do not have to handle this alone.'],
      matches: [],
      selfHarm: true,
      trace,
    };
  }
  if (v.kind === 'emergency') {
    const clinicOnly = v.matches.every((m) => m.level === 'urgent_care');
    return {
      kind: 'emergency',
      title: clinicOnly ? 'Get medical care today' : 'This needs urgent help',
      reasons: v.matches.map((m) => m.label),
      matches: v.matches,
      selfHarm: false,
      relatedItem: related,
      trace,
    };
  }
  return null;
}

async function frame(
  provider: LLMProvider,
  session: Session,
  item: KnowledgeItem,
  safety: SafetyLevel,
  trace: PipelineTrace,
): Promise<string> {
  const input = { query: session.query, item, audience: session.answers.audience, safety, language: session.normalized.language };
  const fallback = await mockProvider.summarize(input);
  if (!provider.live) {
    trace.steps.push({ name: 'Response', detail: 'Demo mode: framing written from a fixed template using the guide text.' });
    return fallback;
  }
  try {
    const text = await provider.summarize(input);
    trace.llmUsed = true;
    const check = validateOutput(text);
    if (!check.ok) {
      trace.outputSafety = 'replaced';
      trace.steps.push({ name: 'Output safety', detail: `Model text blocked (${check.violations.join(', ')}). Used the reviewed template instead.` });
      return fallback;
    }
    trace.outputSafety = 'passed';
    trace.steps.push({ name: 'Output safety', detail: 'Model framing checked for diagnosis, dosing, cure claims and delay-care language. Passed.' });
    return text;
  } catch (e) {
    trace.steps.push({ name: 'AI fallback', detail: `Live AI unavailable (${(e as Error).message || 'timeout'}). Used the reviewed template.` });
    return fallback;
  }
}

function disambiguationStep(r: RetrievalResult): ClarifyStep {
  return {
    id: 'disambiguate',
    kind: 'disambiguate',
    text: 'Which of these is closest to what’s happening?',
    text_hi: 'इनमें से कौन-सा आपकी स्थिति के सबसे क़रीब है?',
    options: [
      ...r.hits.slice(0, 3).map((h) => ({ label: h.item.title, label_hi: h.item.title_hi, value: h.item.id })),
      { label: 'None of these', label_hi: 'इनमें से कोई नहीं', value: 'none' },
    ],
  };
}

export async function advance(session: Session, opts: RunOptions = {}): Promise<PipelineOutput> {
  const provider = opts.provider ?? getProvider(!!opts.forceDemo);
  const trace = newTrace(session, provider);
  const q = session.normalized;

  // 1. Input safety
  const verdict = screenInput([session.query, session.imageContext].filter(Boolean).join('. '));
  if (verdict.kind === 'empty') return { kind: 'input_error', message: 'Tell us a little about what happened, for example “small burn from a hot tawa”.' };
  if (verdict.kind === 'too_long') return { kind: 'input_error', message: 'That is a bit long. Please describe the main problem in a sentence or two.' };
  trace.steps.push({
    name: 'Input safety',
    detail:
      verdict.kind === 'ok'
        ? 'No emergency signs, self-harm, or unsafe requests found.'
        : verdict.kind === 'emergency'
          ? `Red flags found: ${verdict.matches.map((m) => m.label).join(', ')}.`
          : verdict.kind === 'blocked'
            ? `Request type limited: ${verdict.reason}.`
            : 'Self-harm language detected. Showing support resources.',
  });
  trace.steps.push({ name: 'Language', detail: `Detected ${q.language === 'hi' ? 'Hindi' : q.language === 'hinglish' ? 'Hinglish' : 'English'} input.` });

  if (verdict.kind === 'self_harm') {
    trace.intent = 'EMERGENCY';
    return emergencyFromVerdict(verdict, trace)!;
  }
  if (verdict.kind === 'blocked') {
    trace.intent = 'UNSAFE_REQUEST';
    const msg = BLOCK_MESSAGES[verdict.reason];
    let related: KnowledgeItem | undefined;
    if (verdict.reason === 'dosing' || verdict.reason === 'prescription') {
      // Offer the general guide for the underlying problem, never a dose.
      const r = retrieve(q.text, { excludeCategories: ['household', 'food', 'traditional'] });
      if (r.confidence === 'high') related = r.hits[0].item;
    }
    return { kind: 'blocked', reason: verdict.reason, message: msg.message, suggestion: msg.suggestion, related, trace };
  }

  // 2. Routing + retrieval
  if (session.candidateId === '__none__') {
    trace.steps.push({ name: 'Retrieval', detail: 'None of the suggested guides matched.' });
    return {
      kind: 'no_match',
      message: 'Thanks for telling us. We don’t have a reviewed guide that fits this yet, so we won’t guess.',
      suggestions: POPULAR_IDS.map((id) => byId.get(id)!).filter(Boolean),
      trace,
    };
  }
  if (OUT_OF_SCOPE.test(q.text)) {
    trace.intent = 'UNKNOWN';
    trace.steps.push({ name: 'Scope', detail: 'This looks like a device or repair question, which GharGyaan does not cover.' });
    return {
      kind: 'no_match',
      message: 'GharGyaan covers everyday self-care, first aid and household know-how. Device repairs are outside what we can help with.',
      suggestions: POPULAR_IDS.map((id) => byId.get(id)!).filter(Boolean),
      trace,
    };
  }
  const hints = routeHints(q);
  let retrieval: RetrievalResult;
  if (session.candidateId && byId.has(session.candidateId)) {
    const item = byId.get(session.candidateId)!;
    retrieval = { hits: [{ item, score: 1, keywordScore: 0, vectorScore: 0, phraseHits: [] }], confidence: 'high', ambiguous: false };
    trace.steps.push({ name: 'Retrieval', detail: `You chose “${item.title}”.` });
  } else {
    retrieval = retrieve(q.text, {
      audience: session.answers.audience,
      preferCategories: hints.prefer,
      excludeCategories: hints.exclude,
      mythCue: q.mythCue,
    });
    trace.retrieval = retrieval.hits.map((h) => ({
      id: h.item.id,
      title: h.item.title,
      score: +h.score.toFixed(3),
      keyword: +h.keywordScore.toFixed(2),
      vector: +h.vectorScore.toFixed(2),
    }));
    trace.steps.push({
      name: 'Retrieval',
      detail: retrieval.hits.length
        ? `Hybrid search (keyword + phrase + character-vector) over ${KNOWLEDGE.length} reviewed guides. Confidence: ${retrieval.confidence}.`
        : 'No matching guide found.',
    });
  }

  trace.intent = classifyIntent(q, verdict, retrieval, session.imageAttached);
  trace.steps.push({ name: 'Intent', detail: trace.intent });

  // 3. Emergencies found in the text take priority over everything else.
  if (verdict.kind === 'emergency') {
    return emergencyFromVerdict(verdict, trace, retrieval.hits[0]?.item)!;
  }

  // Live mode: let the model map unusual phrasing onto a known guide (never invent one).
  if ((retrieval.confidence === 'none' || retrieval.confidence === 'low') && provider.live && provider.mapToKnowledge && !session.candidateId) {
    try {
      const id = await provider.mapToKnowledge(q.raw, KNOWLEDGE.map((k) => ({ id: k.id, title: `${k.title} — ${k.problem}` })));
      if (id) {
        const item = byId.get(id)!;
        retrieval = { hits: [{ item, score: 1, keywordScore: 0, vectorScore: 0, phraseHits: [] }], confidence: 'medium', ambiguous: false };
        trace.llmUsed = true;
        trace.steps.push({ name: 'AI mapping', detail: `Model matched your words to “${item.title}” from the fixed list of guides.` });
      }
    } catch {
      trace.steps.push({ name: 'AI fallback', detail: 'Live AI mapping unavailable; used local retrieval only.' });
    }
  }

  const medicationNotice = q.medicationCue;

  if (!retrieval.hits.length || retrieval.confidence === 'none') {
    return {
      kind: 'no_match',
      message: session.imageAttached
        ? 'I can’t reliably identify what’s happening from this photo alone, and I don’t have a guide that matches your description yet.'
        : 'We don’t have a reviewed guide for this yet. GharGyaan only answers from guides that have sources, so we won’t guess.',
      suggestions: POPULAR_IDS.map((id) => byId.get(id)!).filter(Boolean),
      trace,
    };
  }

  // 4. Disambiguation when retrieval is unsure
  if (!session.candidateId && (retrieval.ambiguous || retrieval.confidence === 'low')) {
    session.disambiguation = retrieval.hits.slice(0, 3).map((h) => h.item.id);
    return { kind: 'clarify', step: disambiguationStep(retrieval), progress: { index: 0, total: 1 }, trace };
  }

  const item = retrieval.hits[0].item;
  session.candidateId = item.id;

  // 5. Clarification: ask only what we still need
  const pending = pendingSteps(item, session);
  if (pending.length) {
    const total = Math.max(totalSteps(item, session), pending.length);
    trace.steps.push({ name: 'Clarification', detail: `${pending.length} question(s) left before showing guidance.` });
    return { kind: 'clarify', step: pending[0], candidate: item, progress: { index: total - pending.length, total }, trace };
  }

  // 6. Red-flag escalation from answers (deterministic)
  const escalations = escalationsFor(item, session.answers);
  trace.steps.push({
    name: 'Red-flag screening',
    detail: escalations.length ? escalations.map((e) => `${e.level}: ${e.reason}`).join(' | ') : 'No red flags in your answers.',
  });
  const urgent = escalations.filter((e) => e.level === 'urgent');
  if (urgent.length) {
    trace.intent = 'EMERGENCY';
    return {
      kind: 'emergency',
      title: 'This needs urgent medical help',
      reasons: urgent.map((e) => e.reason),
      matches: detectEmergencies(session.query),
      selfHarm: false,
      relatedItem: item,
      trace,
    };
  }

  let safety: SafetyLevel = item.safety_level;
  for (const e of escalations) safety = maxSafety(safety, e.level);

  // 7. Grounded response + output safety
  const summary = await frame(provider, session, item, safety, trace);
  const result: GuideResult = {
    kind: 'result',
    item,
    safety,
    escalations,
    audience: session.answers.audience,
    audienceNote: audienceNote(item, session.answers.audience),
    summary,
    medicationNotice,
    alternatives: retrieval.hits.slice(1, 3).map((h) => h.item),
    trace,
    fromImage: session.imageAttached,
  };
  return result;
}

/** Apply one clarification answer, returning an updated session. */
export function applyAnswer(session: Session, step: ClarifyStep, value: string): Session {
  const answers: Answers = { ...session.answers, item: { ...session.answers.item } };
  const next: Session = { ...session, answers };
  switch (step.kind) {
    case 'audience':
      answers.audience = value as Audience;
      break;
    case 'duration':
      answers.duration = value as DurationValue;
      break;
    case 'item':
      answers.item[step.id] = value;
      break;
    case 'disambiguate':
      if (value !== 'none') next.candidateId = value;
      else next.candidateId = '__none__';
      break;
  }
  return next;
}

export async function run(query: string, opts: RunOptions & { imageAttached?: boolean; imageContext?: string } = {}) {
  const session = createSession(query, opts);
  const output = await advance(session, opts);
  return { session, output };
}

/** Test helper: answer every question with the first ("safe") option. */
export async function runToResult(
  query: string,
  choose: (step: ClarifyStep) => string = (s) => s.options[0].value,
  opts: RunOptions & { imageAttached?: boolean; imageContext?: string } = {},
) {
  let session = createSession(query, opts);
  let output = await advance(session, opts);
  let guard = 0;
  while (output.kind === 'clarify' && guard++ < 10) {
    session = applyAnswer(session, output.step, choose(output.step));
    if (session.candidateId === '__none__') {
      return { session, output: { kind: 'no_match', message: 'none', suggestions: [], trace: output.trace } as PipelineOutput };
    }
    output = await advance(session, opts);
  }
  return { session, output };
}
