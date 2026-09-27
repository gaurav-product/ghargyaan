import type { Audience, KnowledgeItem, SafetyLevel, Source } from '../kb/types';

export type Intent =
  | 'FIRST_AID'
  | 'COMMON_DISCOMFORT'
  | 'TRADITIONAL_REMEDY'
  | 'MYTH_CHECK'
  | 'HOUSEHOLD_DIY'
  | 'FOOD'
  | 'WELLNESS'
  | 'SEASONAL'
  | 'CHILD'
  | 'IMAGE_CONTEXT'
  | 'EMERGENCY'
  | 'UNSAFE_REQUEST'
  | 'UNKNOWN';

export type InputLanguage = 'en' | 'hi' | 'hinglish';

export interface NormalizedQuery {
  raw: string;
  text: string; // lowercased, cleaned
  tokens: string[];
  language: InputLanguage;
  audienceHint?: Audience;
  ageText?: string;
  durationHint?: DurationValue;
  mythCue: boolean;
  medicationCue: boolean;
}

export type DurationValue = 'now' | 'days_1_3' | 'days_4_7' | 'over_week' | 'over_3_weeks';

export interface EmergencyMatch {
  id: string;
  label: string;
  matched: string;
  /** Short, standard, safe actions while getting help. Never treatment. */
  doNow: string[];
  dont?: string[];
  callFirst: 'emergency' | 'poison' | 'mental' | 'clinic' | 'gas';
  /** 'emergency' = call 112 now; 'urgent_care' = get seen today. */
  level: 'emergency' | 'urgent_care';
  sources: Source[];
}

export type SafetyVerdict =
  | { kind: 'ok' }
  | { kind: 'self_harm'; matched: string }
  | { kind: 'emergency'; matches: EmergencyMatch[] }
  | { kind: 'blocked'; reason: BlockReason; matched: string }
  | { kind: 'empty' }
  | { kind: 'too_long' };

export type BlockReason =
  | 'sexual_minor'
  | 'sexual_content'
  | 'weapons'
  | 'dangerous_diy'
  | 'harm_others'
  | 'prescription'
  | 'dosing';

export interface RetrievalHit {
  item: KnowledgeItem;
  score: number;
  keywordScore: number;
  vectorScore: number;
  phraseHits: string[];
}

export interface RetrievalResult {
  hits: RetrievalHit[];
  confidence: 'high' | 'medium' | 'low' | 'none';
  ambiguous: boolean;
}

export interface Answers {
  audience?: Audience;
  duration?: DurationValue;
  /** itemQuestionId -> option value */
  item: Record<string, string>;
}

export interface ClarifyStep {
  id: string;
  kind: 'audience' | 'duration' | 'item' | 'disambiguate';
  text: string;
  text_hi?: string;
  options: { label: string; label_hi?: string; value: string }[];
}

export interface Escalation {
  level: Exclude<SafetyLevel, 'self_care'>;
  reason: string;
}

export interface PipelineTrace {
  steps: { name: string; detail: string }[];
  intent: Intent;
  language: InputLanguage;
  retrieval?: { id: string; title: string; score: number; keyword: number; vector: number }[];
  mode: 'demo' | 'live';
  llmUsed: boolean;
  outputSafety: 'passed' | 'replaced' | 'not_applicable';
}

export interface GuideResult {
  kind: 'result';
  item: KnowledgeItem;
  safety: SafetyLevel;
  escalations: Escalation[];
  audience?: Audience;
  audienceNote?: string;
  summary: string;
  medicationNotice: boolean;
  alternatives: KnowledgeItem[];
  trace: PipelineTrace;
  fromImage: boolean;
}

export interface EmergencyResult {
  kind: 'emergency';
  title: string;
  reasons: string[];
  matches: EmergencyMatch[];
  selfHarm: boolean;
  relatedItem?: KnowledgeItem;
  trace: PipelineTrace;
}

export interface BlockedResult {
  kind: 'blocked';
  reason: BlockReason;
  message: string;
  suggestion?: string;
  related?: KnowledgeItem;
  trace: PipelineTrace;
}

export interface ClarifyResult {
  kind: 'clarify';
  step: ClarifyStep;
  candidate?: KnowledgeItem;
  progress: { index: number; total: number };
  trace: PipelineTrace;
}

export interface NoMatchResult {
  kind: 'no_match';
  message: string;
  suggestions: KnowledgeItem[];
  trace: PipelineTrace;
}

export interface InputErrorResult {
  kind: 'input_error';
  message: string;
}

export type PipelineOutput =
  | GuideResult
  | EmergencyResult
  | BlockedResult
  | ClarifyResult
  | NoMatchResult
  | InputErrorResult;

export interface Session {
  query: string;
  normalized: NormalizedQuery;
  candidateId?: string;
  disambiguation?: string[];
  answers: Answers;
  imageAttached: boolean;
  imageContext?: string;
}
