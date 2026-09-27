/**
 * Hybrid retrieval over the structured knowledge base.
 *
 *  1. Keyword retrieval: BM25 over title / keywords / problem text.
 *  2. Phrase retrieval: exact multi-word keyword hits ("jal gaya", "sore throat").
 *  3. Vector retrieval: character-trigram TF-IDF embeddings (hashed, 1024-d).
 *     These run fully offline and are robust to Hinglish spelling variants
 *     (khansi / khaansi / khasi). In live mode the same interface is backed by
 *     pgvector with model embeddings (see supabase/).
 *  4. Reciprocal-rank fusion + metadata filtering + evidence/review ranking.
 */
import type { Audience, Category, KnowledgeItem } from '../kb/types';
import { KNOWLEDGE } from '../kb';
import { clean, detectLanguage, tokenize } from './normalize';
import type { RetrievalHit, RetrievalResult } from './types';

const DIM = 1024;
const STOP = new Set([
  'the', 'a', 'an', 'is', 'are', 'my', 'me', 'i', 'to', 'of', 'on', 'in', 'and', 'or', 'it', 'this', 'that', 'what', 'how',
  'do', 'does', 'did', 'can', 'should', 'with', 'for', 'have', 'has', 'got', 'get', 'be', 'was', 'about', 'some', 'little',
  'bit', 'very', 'please', 'help', 'hai', 'ho', 'raha', 'rahi', 'mein', 'me', 'ko', 'ka', 'ki', 'ke', 'se', 'kya', 'mujhe',
  'mere', 'meri', 'mera', 'thoda', 'thodi', 'bahut', 'hain', 'bhi', 'aur', 'toh', 'to', 'yeh', 'ye', 'woh', 'wo', 'kaise',
  'karu', 'karein', 'kare', 'karna', 'chahiye', 'lagi', 'laga', 'lag', 'hua', 'hui', 'gaya', 'gayi', 'my', 'our', 'his', 'her',
  'son', 'daughter', 'child', 'kid', 'baby', 'babies', 'newborn', 'infant', 'navjaat', 'toddler', 'bachche', 'bacche', 'bachcha', 'feel', 'feeling', 'weird', 'strange', 'problem', 'issue', 'thing', 'something', 'happened', 'hua', 'ho', 'gaya', 'says', 'dadi', 'nani', 'grandmother', 'safe', 'correct', 'true', 'good', 'ok', 'okay', 'sahi',
]);

const GENERIC = new Set(['pain', 'painful', 'hurts', 'hurt', 'hurting', 'ache', 'aching', 'dard', 'takleef', 'taklif', 'pareshani', 'sick', 'unwell', 'ill', 'bimar', 'tabiyat', 'kharab', 'problem', 'issue']);

// ---------- vector embeddings (character trigrams, hashed) ----------
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % DIM;
}

function grams(text: string): string[] {
  const out: string[] = [];
  for (const w of tokenize(text)) {
    if (STOP.has(w)) continue;
    const padded = `#${w}#`;
    for (let i = 0; i < padded.length - 2; i++) out.push(padded.slice(i, i + 3));
    out.push(`w:${w}`);
  }
  return out;
}

function docText(k: KnowledgeItem): { strong: string; weak: string } {
  return {
    strong: [k.title, k.situation_label, ...k.keywords, ...k.keywords].join(' '),
    weak: [k.problem, k.myth?.claim ?? ''].join(' '),
  };
}

interface Index {
  items: KnowledgeItem[];
  vectors: Float32Array[];
  idf: Float32Array;
  bm25: { tf: Map<string, number>[]; len: number[]; avg: number; df: Map<string, number> };
  phrases: { item: number; phrase: string; words: number }[];
}

let INDEX: Index | null = null;

function buildIndex(items: KnowledgeItem[]): Index {
  // IDF over hashed grams
  const gramDocs: string[][] = items.map((k) => {
    const d = docText(k);
    return [...grams(d.strong), ...grams(d.strong), ...grams(d.weak)];
  });
  const df = new Float32Array(DIM);
  for (const g of gramDocs) {
    const seen = new Set(g.map(hash));
    seen.forEach((h) => (df[h] += 1));
  }
  const idf = new Float32Array(DIM);
  for (let i = 0; i < DIM; i++) idf[i] = Math.log(1 + items.length / (1 + df[i]));

  const vectors = gramDocs.map((g) => embedGrams(g, idf));

  // BM25 over word tokens
  const tfs: Map<string, number>[] = [];
  const lens: number[] = [];
  const wdf = new Map<string, number>();
  for (const k of items) {
    const d = docText(k);
    const toks = [...tokenize(d.strong), ...tokenize(d.strong), ...tokenize(d.weak)].filter((t) => !STOP.has(t));
    const tf = new Map<string, number>();
    toks.forEach((t) => tf.set(t, (tf.get(t) ?? 0) + 1));
    tf.forEach((_, t) => wdf.set(t, (wdf.get(t) ?? 0) + 1));
    tfs.push(tf);
    lens.push(toks.length);
  }
  const avg = lens.reduce((a, b) => a + b, 0) / lens.length;

  const phrases: Index['phrases'] = [];
  items.forEach((k, i) => {
    for (const kw of [k.title, ...k.keywords]) {
      const p = clean(kw);
      if (!p) continue;
      const words = p.split(' ').length;
      // Single short words are handled by BM25; phrases (or Devanagari words) get a phrase boost.
      if (words >= 2 || /[ऀ-ॿ]/.test(p)) phrases.push({ item: i, phrase: p, words });
    }
  });

  return { items, vectors, idf, bm25: { tf: tfs, len: lens, avg, df: wdf }, phrases };
}

function embedGrams(g: string[], idf: Float32Array): Float32Array {
  const v = new Float32Array(DIM);
  for (const x of g) {
    const h = hash(x);
    v[h] += idf[h];
  }
  let n = 0;
  for (let i = 0; i < DIM; i++) n += v[i] * v[i];
  n = Math.sqrt(n) || 1;
  for (let i = 0; i < DIM; i++) v[i] /= n;
  return v;
}

export function embed(text: string): Float32Array {
  const idx = getIndex();
  return embedGrams(grams(text), idx.idf);
}

function cosine(a: Float32Array, b: Float32Array): number {
  let s = 0;
  for (let i = 0; i < DIM; i++) s += a[i] * b[i];
  return s;
}

export function getIndex(): Index {
  if (!INDEX) INDEX = buildIndex(KNOWLEDGE);
  return INDEX;
}

function bm25Scores(queryTokens: string[], idx: Index): number[] {
  const { tf, len, avg, df } = idx.bm25;
  const N = idx.items.length;
  const k1 = 1.2;
  const b = 0.6;
  return idx.items.map((_, i) => {
    let s = 0;
    for (const q of queryTokens) {
      const f = tf[i].get(q);
      if (!f) continue;
      const n = df.get(q) ?? 0;
      const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
      s += (idf * (f * (k1 + 1))) / (f + k1 * (1 - b + (b * len[i]) / avg));
    }
    return s;
  });
}

export interface RetrieveOptions {
  audience?: Audience;
  preferCategories?: Category[];
  excludeCategories?: Category[];
  mythCue?: boolean;
  limit?: number;
}

const EVIDENCE_WEIGHT = { supported: 1.0, limited: 0.97, traditional: 0.95, not_recommended: 0.97 };

export function retrieve(query: string, opts: RetrieveOptions = {}): RetrievalResult {
  const idx = getIndex();
  const text = ` ${clean(query)} `;
  const qTokens = tokenize(query).filter((t) => !STOP.has(t));
  if (!qTokens.length && !/[ऀ-ॿ]/.test(text)) return { hits: [], confidence: 'none', ambiguous: false };

  const kw = bm25Scores(qTokens, idx);
  const qv = embed(query);
  const vec = idx.vectors.map((v) => cosine(qv, v));

  const phraseHits: string[][] = idx.items.map(() => []);
  const phraseScore = idx.items.map(() => 0);
  for (const p of idx.phrases) {
    if (text.includes(` ${p.phrase} `) || (/[ऀ-ॿ]/.test(p.phrase) && text.includes(p.phrase))) {
      phraseHits[p.item].push(p.phrase);
      phraseScore[p.item] += 1 + 0.5 * (p.words - 1);
    }
  }

  // Reciprocal rank fusion of the three signals
  const rank = (scores: number[]) => {
    const order = scores.map((s, i) => [s, i] as const).sort((a, b) => b[0] - a[0]);
    const r = new Array<number>(scores.length);
    order.forEach(([s, i], pos) => (r[i] = s > 0 ? pos + 1 : Infinity));
    return r;
  };
  const rk = rank(kw);
  const rv = rank(vec.map((v) => (v > 0.12 ? v : 0)));
  const rp = rank(phraseScore);
  const K = 20;

  const hits: RetrievalHit[] = idx.items.map((item, i) => {
    let s = 1 / (K + rk[i]) + 1 / (K + rv[i]) + 1.4 / (K + rp[i]);
    // Absolute evidence of a match matters too (RRF alone ranks everything).
    s += Math.min(phraseScore[i], 3) * 0.03 + Math.min(kw[i], 8) * 0.004 + Math.max(vec[i] - 0.15, 0) * 0.08;

    // Metadata filtering and preferences
    if (opts.excludeCategories?.includes(item.category)) s *= 0.2;
    if (opts.preferCategories?.includes(item.category)) s *= 1.25;
    if (opts.mythCue && (item.myth || item.category === 'traditional')) s *= 1.2;
    if (opts.audience && !item.audience.includes(opts.audience) && !item.not_for?.some((n) => n.audience === opts.audience)) {
      // Guide not written for this audience: still retrievable, but ranked lower.
      s *= opts.audience === 'infant' ? 0.85 : 0.92;
    }
    s *= EVIDENCE_WEIGHT[item.evidence_level];
    if (item.review_status === 'needs_source') s *= 0.97;
    return { item, score: s, keywordScore: kw[i], vectorScore: vec[i], phraseHits: phraseHits[i] };
  });

  // An item only counts as a real candidate if at least one signal found it.
  const real = hits.filter((h) => h.keywordScore > 0 || h.phraseHits.length > 0 || h.vectorScore > 0.22);
  real.sort((a, b) => b.score - a.score);
  const top = real.slice(0, opts.limit ?? 5);

  let confidence: RetrievalResult['confidence'] = 'none';
  if (top.length) {
    const t = top[0];
    if (t.phraseHits.length || t.keywordScore > 3 || t.vectorScore > 0.42) confidence = 'high';
    else if (t.keywordScore > 1.2 || t.vectorScore > 0.3) confidence = 'medium';
    else confidence = 'low';
    // Coverage guard (English only; Hinglish has many filler words): if most of
    // the query's content words are unknown to the top guide, we are guessing.
    const idxI = idx.items.indexOf(t.item);
    const covered = qTokens.filter((w) => idx.bm25.tf[idxI].has(w)).length;
    // Only generic words ("pain", "dard", "hurts") are not enough to pick a guide.
    if (qTokens.every((w) => GENERIC.has(w))) confidence = 'low';
    if (!t.phraseHits.length && detectLanguage(query) === 'en' && qTokens.length >= 3 && covered / qTokens.length < 0.5) confidence = 'low';
  }
  const ambiguous =
    top.length > 1 &&
    !top[0].phraseHits.length &&
    top[1].score / top[0].score > 0.8 &&
    top[1].keywordScore > 0 &&
    (confidence !== 'high' || qTokens.length <= 1);

  return { hits: top, confidence, ambiguous };
}
