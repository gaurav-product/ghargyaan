/**
 * Privacy-first product analytics.
 *
 * - Never records what the user typed, said, or photographed.
 * - Only whitelisted, non-identifying properties are kept (guide id, category,
 *   safety level, intent, language, mode).
 * - In this prototype events stay in memory + this browser only. A production
 *   sink would batch them to a first-party endpoint with no user identifiers.
 */
import { load, save } from './storage';

export type EventName =
  | 'search_started'
  | 'input_submitted'
  | 'image_uploaded'
  | 'voice_started'
  | 'clarification_answered'
  | 'result_viewed'
  | 'source_opened'
  | 'recommendation_saved'
  | 'feedback_given'
  | 'safety_escalation';

const ALLOWED_PROPS = new Set([
  'item_id',
  'category',
  'safety',
  'intent',
  'language',
  'mode',
  'step',
  'input_method',
  'helpful',
  'missing_reason',
  'escalation_type',
  'has_image',
  'result_kind',
]);

export interface AnalyticsEvent {
  name: EventName;
  at: string;
  props: Record<string, string | number | boolean>;
}

const MAX = 200;
let buffer: AnalyticsEvent[] = load<AnalyticsEvent[]>('events', []);
const listeners = new Set<() => void>();

export function track(name: EventName, props: Record<string, unknown> = {}): void {
  const clean: AnalyticsEvent['props'] = {};
  for (const [k, v] of Object.entries(props)) {
    if (!ALLOWED_PROPS.has(k)) continue;
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') clean[k] = typeof v === 'string' ? v.slice(0, 60) : v;
  }
  buffer = [...buffer, { name, at: new Date().toISOString(), props: clean }].slice(-MAX);
  save('events', buffer);
  listeners.forEach((l) => l());
}

export function getEvents(): AnalyticsEvent[] {
  return buffer;
}

export function clearEvents(): void {
  buffer = [];
  save('events', buffer);
  listeners.forEach((l) => l());
}

export function onEvents(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
