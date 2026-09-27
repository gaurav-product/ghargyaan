/**
 * Knowledge model for GharGyaan.
 * Every health-related answer is assembled from these reviewed records —
 * the language model never invents the guidance itself.
 */

export type Category =
  | 'first_aid'
  | 'discomfort'
  | 'traditional'
  | 'food'
  | 'wellness'
  | 'household'
  | 'seasonal';

export type Audience = 'adult' | 'child' | 'older_adult' | 'infant';

/** 4-step evidence ladder. Never shown as colour alone. */
export type EvidenceLevel = 'supported' | 'limited' | 'traditional' | 'not_recommended';

/** 3-step safety state shown on every result. */
export type SafetyLevel = 'self_care' | 'consider_advice' | 'urgent';

export type ReviewStatus = 'demo_unreviewed' | 'needs_source' | 'expert_reviewed';

export type SourceType =
  | 'public_health_body'
  | 'clinical_reference'
  | 'government_regulator'
  | 'professional_society'
  | 'general_knowledge';

export interface Source {
  title: string;
  publisher: string;
  url?: string;
  /** What this source is actually cited for — keeps citations honest. */
  supports: string;
}

export interface TraditionalPractice {
  practice: string;
  evidence: EvidenceLevel;
  note: string;
  safety: string;
}

export interface ClarifyOption {
  label: string;
  label_hi?: string;
  value: string;
  /** Choosing this option escalates the result. */
  escalate?: Exclude<SafetyLevel, 'self_care'>;
  /** Explanation shown when this option escalates. */
  reason?: string;
}

export interface ClarifyQuestion {
  id: string;
  text: string;
  text_hi?: string;
  options: ClarifyOption[];
}

export interface KnowledgeItem {
  id: string;
  title: string;
  title_hi: string;
  category: Category;
  /** Plain description of the everyday problem. */
  problem: string;
  /** Who this guidance is written for. */
  audience: Audience[];
  age_range: string;
  /** Short situation label used on the result page ("Minor kitchen burn"). */
  situation_label: string;
  modern_guidance: string;
  evidence_level: EvidenceLevel;
  evidence_summary: string;
  how_to: string[];
  what_to_avoid: string[];
  watch_for: string[];
  contraindications: string[];
  red_flags: string[];
  when_to_seek_help: string[];
  traditional_use?: TraditionalPractice[];
  /** Extra caution shown when the person is a child / infant / older adult. */
  audience_notes?: Partial<Record<Audience, string>>;
  /** Audiences for which this guide must not be used as self-care at all. */
  not_for?: { audience: Audience; reason: string; escalate: Exclude<SafetyLevel, 'self_care'> }[];
  /** Item-specific screening questions asked after "who" and "how long". */
  clarify?: ClarifyQuestion[];
  /** For myth-check items: the claim and a one-line verdict. */
  myth?: { claim: string; verdict: string };
  safety_level: SafetyLevel;
  source: Source[];
  source_type: SourceType;
  last_reviewed: string;
  review_status: ReviewStatus;
  language: 'en';
  /** Retrieval vocabulary: English, Hinglish (Roman) and Hindi (Devanagari). */
  keywords: string[];
}
