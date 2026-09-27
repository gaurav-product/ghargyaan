import { useMemo } from 'react';
import report from '../data/evalReport.json';
import { KNOWLEDGE } from '../kb';
import { getEvents } from '../lib/analytics';

type Cell = 'yes' | 'partial' | 'no' | 'varies' | 'unknown';

const COLS = ['Evidence labels', 'Safety triage', 'Indian context', 'Hindi / Hinglish', 'Voice', 'Photo', 'Traditional remedies'];

const ROWS: { name: string; cells: Cell[]; note: string }[] = [
  { name: 'Google search', cells: ['no', 'partial', 'varies', 'yes', 'yes', 'yes', 'varies'], note: 'Quality depends on which result you open.' },
  { name: 'YouTube', cells: ['no', 'no', 'yes', 'yes', 'yes', 'no', 'yes'], note: 'Rich regional content; no consistent evidence signal.' },
  { name: 'General AI assistants', cells: ['varies', 'partial', 'varies', 'yes', 'yes', 'yes', 'varies'], note: 'Fluent, but grounding and consistency are unknown per answer.' },
  { name: 'Health information websites', cells: ['partial', 'yes', 'varies', 'varies', 'no', 'no', 'no'], note: 'Strong on evidence; often not localised for India.' },
  { name: 'Ayurveda apps', cells: ['unknown', 'unknown', 'yes', 'varies', 'unknown', 'unknown', 'yes'], note: 'Not assessed in detail yet.' },
  { name: 'Home-remedy websites', cells: ['no', 'no', 'varies', 'varies', 'no', 'no', 'yes'], note: 'Tradition often presented as fact.' },
  { name: 'First-aid apps', cells: ['partial', 'yes', 'varies', 'varies', 'unknown', 'no', 'no'], note: 'Good for emergencies; not for everyday discomfort or tradition.' },
  { name: 'GharGyaan (this prototype)', cells: ['yes', 'yes', 'yes', 'partial', 'yes', 'partial', 'yes'], note: 'Hindi guide text and photo understanding are limited in V1.' },
];

const CELL: Record<Cell, { label: string; cls: string }> = {
  yes: { label: 'Yes', cls: 'bg-okbg text-ok' },
  partial: { label: 'Partial', cls: 'bg-limitedbg text-limited' },
  no: { label: 'No', cls: 'bg-dangerbg text-danger' },
  varies: { label: 'Varies', cls: 'bg-sunken text-muted' },
  unknown: { label: 'Unknown', cls: 'bg-sunken text-muted italic' },
};

interface Suite {
  name: string;
  total: number;
  passed: number;
  failures: { query: string; expected: string; got: string }[];
}

export function Research() {
  const events = getEvents();
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    events.forEach((e) => (c[e.name] = (c[e.name] ?? 0) + 1));
    return c;
  }, [events]);
  const r = report as { generatedAt: string | null; suites: Suite[]; total: number; passed: number; heldOutFirstRun?: { batch: string; passed: number; total: number; safetyMisses: string[] }[] };
  const byStatus = {
    reviewed: KNOWLEDGE.filter((k) => k.review_status === 'expert_reviewed').length,
    demo: KNOWLEDGE.filter((k) => k.review_status === 'demo_unreviewed').length,
    needs: KNOWLEDGE.filter((k) => k.review_status === 'needs_source').length,
  };

  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow">Internal · product research</p>
        <h1 className="mt-1 font-display text-3xl text-ink">Positioning, quality and metrics</h1>
        <p className="prose-gg mt-2 text-muted">For the product team. Everything marked “hypothesis” still needs user research.</p>
      </header>

      <section aria-labelledby="gap">
        <h2 id="gap" className="font-display text-2xl text-ink">
          Competitive landscape <span className="font-mono text-xs uppercase tracking-wider text-trad">Hypothesis</span>
        </h2>
        <p className="prose-gg mt-1 text-muted">
          Gap to validate: fragmented everyday knowledge, no evidence labelling, little safety context, weak Indian localisation, and poor multimodal experience. Ratings are by
          category, from desk review, not a feature audit of specific products. “Unknown” means not yet assessed.
        </p>
        <div className="mt-3 overflow-x-auto rounded-card border border-line" tabIndex={0} role="region" aria-label="Scrollable table">
          <table className="w-full min-w-[720px] border-collapse bg-surface text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="p-2.5 font-semibold">Where people go today</th>
                {COLS.map((c) => (
                  <th key={c} className="p-2.5 font-semibold">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.name} className={`border-b border-line last:border-0 ${row.name.startsWith('GharGyaan') ? 'bg-sunken' : ''}`}>
                  <th scope="row" className="p-2.5 text-left align-top font-medium">
                    {row.name}
                    <span className="block text-xs font-normal text-muted">{row.note}</span>
                  </th>
                  {row.cells.map((c, i) => (
                    <td key={i} className="p-2.5 align-top">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${CELL[c].cls}`}>{CELL[c].label}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="quality">
        <h2 id="quality" className="font-display text-2xl text-ink">
          Automated evaluation
        </h2>
        {r.generatedAt ? (
          <>
            <p className="mt-1 text-muted">
              Last run {new Date(r.generatedAt).toLocaleString('en-IN')}: <strong className="text-ink tabular-nums">{r.passed}</strong> of{' '}
              <strong className="text-ink tabular-nums">{r.total}</strong> test queries behaved as expected (routing, retrieval, escalation, and blocking), running the same engine as
              the app in demo mode.
            </p>
            <div className="mt-3 overflow-x-auto rounded-card border border-line" tabIndex={0} role="region" aria-label="Scrollable table">
              <table className="w-full min-w-[420px] bg-surface text-sm">
                <thead>
                  <tr className="border-b border-line text-left">
                    <th className="p-2.5">Suite</th>
                    <th className="p-2.5 text-right">Passed</th>
                    <th className="p-2.5 text-right">Rate</th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {r.suites.map((s) => (
                    <tr key={s.name} className="border-b border-line last:border-0">
                      <td className="p-2.5">{s.name}</td>
                      <td className="p-2.5 text-right font-mono">
                        {s.passed}/{s.total}
                      </td>
                      <td className="p-2.5 text-right font-mono">{Math.round((100 * s.passed) / s.total)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {r.heldOutFirstRun && (
              <div className="mt-4 rounded-card border border-limited/40 bg-limitedbg p-4">
                <p className="font-semibold text-ink">Honest check: unseen queries, first run</p>
                <p className="mt-1 text-sm text-ink">
                  The suites above were used while tuning, so they overstate quality. Two batches of new queries were written afterwards and scored before any fixes:
                </p>
                <ul className="mt-2 space-y-2 text-sm text-ink">
                  {r.heldOutFirstRun.map((h) => (
                    <li key={h.batch}>
                      <strong className="tabular-nums">
                        {h.batch}: {h.passed}/{h.total} ({Math.round((100 * h.passed) / h.total)}%)
                      </strong>
                      <ul className="mt-1 list-disc pl-5">
                        {h.safetyMisses.map((m) => (
                          <li key={m}>Safety miss: {m}</li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-sm text-ink">
                  All misses were fixed and added as regression tests. The lesson: rule-based red-flag detection has recall gaps on new phrasing. Before launch it needs a trained
                  classifier as a second layer and a clinician-led red-team.
                </p>
              </div>
            )}
            {r.suites.some((s) => s.failures.length) && (
              <details className="mt-3 rounded-card border border-line bg-surface p-3 text-sm">
                <summary className="cursor-pointer font-semibold">Known failures</summary>
                <ul className="mt-2 space-y-1">
                  {r.suites.flatMap((s) =>
                    s.failures.map((f) => (
                      <li key={s.name + f.query}>
                        <span className="text-muted">[{s.name}]</span> “{f.query}”: expected {f.expected}, got {f.got}
                      </li>
                    )),
                  )}
                </ul>
              </details>
            )}
          </>
        ) : (
          <p className="text-muted">Run <code>npm run eval</code> to generate the report.</p>
        )}
      </section>

      <section aria-labelledby="kb">
        <h2 id="kb" className="font-display text-2xl text-ink">
          Knowledge base status
        </h2>
        <dl className="mt-2 grid grid-cols-3 gap-2 text-center">
          {[
            ['Expert reviewed', byStatus.reviewed],
            ['Sourced, awaiting review', byStatus.demo],
            ['Needs a source', byStatus.needs],
          ].map(([k, v]) => (
            <div key={k as string} className="card p-3">
              <dd className="font-mono text-2xl tabular-nums text-ink">{v}</dd>
              <dt className="text-xs text-muted">{k}</dt>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="metrics">
        <h2 id="metrics" className="font-display text-2xl text-ink">
          North Star: Useful Self-Care Sessions
        </h2>
        <p className="prose-gg mt-1 text-muted">
          A session where someone receives a relevant, safe, actionable guide (result viewed, not escalated as a false alarm, not marked unhelpful). We deliberately do not optimise for
          time in app.
        </p>
        <p className="mt-3 text-sm font-semibold text-ink">Events on this device (anonymous)</p>
        <ul className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {['search_started', 'input_submitted', 'image_uploaded', 'voice_started', 'clarification_answered', 'result_viewed', 'source_opened', 'recommendation_saved', 'feedback_given', 'safety_escalation'].map(
            (e) => (
              <li key={e} className="flex items-center justify-between rounded-lg border border-line bg-surface px-3 py-2 text-sm">
                <span className="font-mono text-xs">{e}</span>
                <span className="font-mono tabular-nums">{counts[e] ?? 0}</span>
              </li>
            ),
          )}
        </ul>
      </section>
    </div>
  );
}
