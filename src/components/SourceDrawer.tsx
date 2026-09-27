import { ExternalLink } from 'lucide-react';
import type { KnowledgeItem } from '../kb/types';
import type { PipelineTrace } from '../engine/types';
import { EVIDENCE_META, EvidenceLadder, ReviewBadge } from './Badges';
import { Sheet } from './Sheet';

const SOURCE_TYPE: Record<KnowledgeItem['source_type'], string> = {
  public_health_body: 'Public health body',
  clinical_reference: 'Clinical reference',
  government_regulator: 'Government regulator',
  professional_society: 'Professional society',
  general_knowledge: 'General household knowledge',
};

export function SourceDrawer({ item, trace, open, onClose }: { item: KnowledgeItem; trace?: PipelineTrace; open: boolean; onClose: () => void }) {
  const ev = EVIDENCE_META[item.evidence_level];
  return (
    <Sheet open={open} onClose={onClose} title="Why am I seeing this?">
      <div className="space-y-5 text-[0.95rem]">
        <section aria-labelledby="sd-evidence">
          <h3 id="sd-evidence" className="eyebrow mb-2">Evidence level</h3>
          <EvidenceLadder level={item.evidence_level} />
          <p className="mt-2 text-muted">
            <strong className="text-ink">{ev.label}:</strong> {ev.explain}
          </p>
          <p className="mt-1.5 text-ink">{item.evidence_summary}</p>
        </section>

        <section aria-labelledby="sd-sources">
          <h3 id="sd-sources" className="eyebrow mb-2">Sources</h3>
          <ul className="space-y-2">
            {item.source.map((s) => (
              <li key={s.title + s.publisher} className="rounded-lg border border-line p-3">
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1.5 font-semibold text-primary underline-offset-2 hover:underline">
                    {s.title}
                    <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                ) : (
                  <p className="font-semibold text-ink">{s.title}</p>
                )}
                <p className="text-sm text-muted">{s.publisher}</p>
                <p className="mt-1 text-sm text-ink">
                  <span className="text-muted">Cited for: </span>
                  {s.supports}
                </p>
              </li>
            ))}
          </ul>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="text-muted">Source type</dt>
            <dd>{SOURCE_TYPE[item.source_type]}</dd>
            <dt className="text-muted">Last reviewed</dt>
            <dd className="font-mono tabular-nums">{item.last_reviewed}</dd>
            <dt className="text-muted">Review status</dt>
            <dd>
              <ReviewBadge status={item.review_status} />
            </dd>
          </dl>
        </section>

        {item.contraindications.length > 0 && (
          <section aria-labelledby="sd-safety">
            <h3 id="sd-safety" className="eyebrow mb-2">Safety considerations</h3>
            <ul className="list-disc space-y-1 pl-5">
              {item.contraindications.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </section>
        )}

        {trace && (
          <section aria-labelledby="sd-how">
            <h3 id="sd-how" className="eyebrow mb-2">How GharGyaan chose this guide</h3>
            <ol className="space-y-2 border-l-2 border-line pl-4">
              {trace.steps.map((s, i) => (
                <li key={i} className="text-sm">
                  <span className="font-semibold text-ink">{s.name}.</span> <span className="text-muted">{s.detail}</span>
                </li>
              ))}
            </ol>
            {trace.retrieval && trace.retrieval.length > 1 && (
              <div className="mt-3 overflow-x-auto" tabIndex={0} role="region" aria-label="Retrieval scores table">
                <table className="w-full min-w-[320px] text-left text-xs">
                  <caption className="sr-only">Retrieval scores</caption>
                  <thead className="text-muted">
                    <tr>
                      <th className="py-1 pr-2 font-medium">Candidate guide</th>
                      <th className="py-1 pr-2 font-medium">Keyword</th>
                      <th className="py-1 pr-2 font-medium">Vector</th>
                      <th className="py-1 font-medium">Fused</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono tabular-nums">
                    {trace.retrieval.slice(0, 4).map((r) => (
                      <tr key={r.id} className={r.id === item.id ? 'text-ink' : 'text-muted'}>
                        <td className="py-1 pr-2 font-sans">{r.title}</td>
                        <td className="py-1 pr-2">{r.keyword}</td>
                        <td className="py-1 pr-2">{r.vector}</td>
                        <td className="py-1">{r.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="mt-3 text-sm text-muted">
              Mode: <strong className="text-ink">{trace.mode === 'live' ? 'Live AI' : 'Demo (no AI keys)'}</strong>. The steps, warnings and red flags always come from the
              reviewed guide above{trace.llmUsed ? '; the AI only wrote the short opening line, which passed our output safety check' : ''}.
            </p>
          </section>
        )}
      </div>
    </Sheet>
  );
}
