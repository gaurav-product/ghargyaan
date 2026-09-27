/**
 * AI provider abstraction.
 *
 * The model's job here is intentionally small:
 *   - write a short, warm one-paragraph framing of an already-selected guide
 *   - (live mode) map an unusual phrasing onto one of the known guide IDs
 *   - (live mode) describe what is visible in a photo, without diagnosing
 * It never writes the steps, warnings or red flags — those come from the
 * reviewed knowledge base — and every output passes the output validator.
 */
import type { Audience, KnowledgeItem, SafetyLevel } from '../kb/types';
import type { InputLanguage } from './types';

export interface SummaryInput {
  query: string;
  item: KnowledgeItem;
  audience?: Audience;
  safety: SafetyLevel;
  language: InputLanguage;
}

export interface LLMProvider {
  id: string;
  live: boolean;
  summarize(input: SummaryInput): Promise<string>;
  mapToKnowledge?(query: string, candidates: { id: string; title: string }[]): Promise<string | null>;
  describeImage?(dataUrl: string): Promise<string>;
}

const WHO: Record<Audience, string> = {
  adult: '',
  child: ' for a child',
  infant: ' for a baby',
  older_adult: ' for an older adult',
};

/** Deterministic, offline provider. Also the fallback for every live failure. */
export const mockProvider: LLMProvider = {
  id: 'demo-template',
  live: false,
  async summarize({ item, audience, safety }) {
    const who = audience ? WHO[audience] : '';
    if (item.myth && item.category === 'traditional') {
      return `${item.myth.verdict} Here is what the evidence says and what to do instead.`;
    }
    if (item.category === 'household' || item.category === 'food') {
      return `Here is a practical, safe way to handle this. ${item.modern_guidance}`;
    }
    const lead =
      safety === 'consider_advice'
        ? `Some of what you told us means it is worth speaking to a doctor or pharmacist. Meanwhile, here is general guidance${who}.`
        : `Here is general self-care guidance${who}.`;
    return `${lead} ${item.modern_guidance}`;
  },
};

export class HttpProvider implements LLMProvider {
  id = 'live-edge-function';
  live = true;
  private base: string;
  private key?: string;
  private timeoutMs: number;

  constructor(base: string, key?: string, timeoutMs = 12000) {
    this.base = base.replace(/\/$/, '');
    this.key = key;
    this.timeoutMs = timeoutMs;
  }

  private async call<T>(task: string, input: unknown): Promise<T> {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), this.timeoutMs);
    try {
      const res = await fetch(`${this.base}/functions/v1/ghargyaan-ai`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(this.key ? { apikey: this.key, authorization: `Bearer ${this.key}` } : {}),
        },
        body: JSON.stringify({ task, input }),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(`AI service returned ${res.status}`);
      return (await res.json()) as T;
    } finally {
      clearTimeout(t);
    }
  }

  async summarize(input: SummaryInput): Promise<string> {
    // Only the grounded fields are sent. No identity, no location.
    const { item } = input;
    const r = await this.call<{ text: string }>('summarize', {
      query: input.query.slice(0, 500),
      audience: input.audience,
      safety: input.safety,
      language: input.language,
      guide: {
        title: item.title,
        situation: item.situation_label,
        guidance: item.modern_guidance,
        evidence_level: item.evidence_level,
        myth: item.myth,
      },
    });
    return r.text;
  }

  async mapToKnowledge(query: string, candidates: { id: string; title: string }[]): Promise<string | null> {
    const r = await this.call<{ id: string | null }>('map', { query: query.slice(0, 500), candidates });
    return r.id && candidates.some((c) => c.id === r.id) ? r.id : null;
  }

  async describeImage(dataUrl: string): Promise<string> {
    const r = await this.call<{ text: string }>('describe_image', { image: dataUrl });
    return r.text;
  }
}

export interface AIConfig {
  base?: string;
  key?: string;
}

export function readConfig(): AIConfig {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};
  return { base: env.VITE_SUPABASE_URL || undefined, key: env.VITE_SUPABASE_ANON_KEY || undefined };
}

export function getProvider(forceDemo: boolean): LLMProvider {
  const cfg = readConfig();
  if (!forceDemo && cfg.base) return new HttpProvider(cfg.base, cfg.key);
  return mockProvider;
}

export function liveAvailable(): boolean {
  return !!readConfig().base;
}
