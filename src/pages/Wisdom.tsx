import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { KNOWLEDGE } from '../kb';
import type { EvidenceLevel } from '../kb/types';
import { EVIDENCE_META, EvidenceBadge, EvidenceLadder } from '../components/Badges';
import { GuideCard } from '../components/GuideCard';
import { useAsk } from '../state/AskContext';
import { useApp } from '../state/AppContext';

const ORDER: EvidenceLevel[] = ['supported', 'limited', 'traditional', 'not_recommended'];

export function Wisdom() {
  const { settings } = useApp();
  const hi = settings.lang === 'hi';
  const { submit } = useAsk();
  const nav = useNavigate();
  const [claim, setClaim] = useState('');
  const [filter, setFilter] = useState<EvidenceLevel | 'all'>('all');
  const [showAll, setShowAll] = useState(false);

  const practices = useMemo(
    () =>
      KNOWLEDGE.flatMap((k) => (k.traditional_use ?? []).map((p) => ({ ...p, guide: k }))).filter(
        (p, i, arr) => arr.findIndex((x) => x.practice === p.practice) === i,
      ),
    [],
  );
  const myths = KNOWLEDGE.filter((k) => k.myth);
  const filtered = practices.filter((p) => filter === 'all' || p.evidence === filter);
  const shown = showAll ? filtered : filtered.slice(0, 6);

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="eyebrow">{hi ? 'ज्ञान' : 'Wisdom'}</p>
        <h1 className="font-display text-3xl leading-tight text-ink">Indian household wisdom, checked with care</h1>
        <p className="prose-gg text-ink">
          Much of what we know about looking after ourselves comes from parents, grandparents and community. Some of it is backed by good evidence, some is untested, and a
          little of it can cause harm. GharGyaan respects the tradition and tells you plainly which is which.
        </p>
        <div className="card p-4">
          <EvidenceLadder />
          <dl className="mt-3 grid gap-2 text-sm">
            {ORDER.map((l) => (
              <div key={l} className="flex gap-2">
                <dt className="w-40 shrink-0">
                  <EvidenceBadge level={l} size="sm" />
                </dt>
                <dd className="text-muted">{EVIDENCE_META[l].explain}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <section aria-labelledby="dadi-title" className="rounded-card border border-haldi/40 bg-surface p-5">
        <h2 id="dadi-title" className="font-display text-2xl text-ink">
          “Dadi says…”
        </h2>
        <p className="mt-1 text-muted">Type a remedy someone suggested. We’ll check it without judging it.</p>
        <form
          className="mt-3 flex flex-col gap-2 sm:flex-row"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!claim.trim()) return;
            nav('/ask');
            await submit(`Dadi says ${claim}. Is this safe?`, { method: 'text', image: null });
          }}
        >
          <label htmlFor="dadi-input" className="sr-only">
            Remedy to check
          </label>
          <input
            id="dadi-input"
            value={claim}
            onChange={(e) => setClaim(e.target.value.slice(0, 300))}
            placeholder="e.g. put oil in the ear for earache"
            className="min-h-[48px] flex-1 rounded-full border border-line bg-ground px-4 text-base text-ink placeholder:text-muted focus:border-primary focus:outline-none"
          />
          <button type="submit" className="btn-primary" disabled={!claim.trim()}>
            Check it <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>
      </section>

      <section id="myths" aria-labelledby="myths-title" className="scroll-mt-20">
        <h2 id="myths-title" className="eyebrow mb-3">
          Is this actually safe? Myth checks
        </h2>
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {myths.map((m) => (
            <li key={m.id}>
              <GuideCard item={m} showMyth />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="practices-title">
        <h2 id="practices-title" className="eyebrow mb-3">
          Practice index · {practices.length} traditional practices
        </h2>
        <div className="-mx-4 mb-3 overflow-x-auto px-4">
          <div className="flex w-max gap-2">
            {(['all', ...ORDER] as const).map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={filter === l}
                onClick={() => setFilter(l)}
                className={`chip ${filter === l ? 'border-primary bg-primary text-on-primary hover:bg-primary' : ''}`}
              >
                {l === 'all' ? 'All' : EVIDENCE_META[l].label}
              </button>
            ))}
          </div>
        </div>
        <ul className="space-y-2.5">
          {shown.map((p) => (
            <li key={p.practice} className="rounded-card border border-line bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="font-semibold text-ink">{p.practice}</p>
                <EvidenceBadge level={p.evidence} size="sm" />
              </div>
              <p className="prose-gg mt-1.5 text-ink">{p.note}</p>
              <p className="prose-gg mt-1 text-sm text-muted">
                <strong className="text-ink">Safety: </strong>
                {p.safety}
              </p>
              <Link to={`/guide/${p.guide.id}`} className="mt-2 inline-flex min-h-[44px] items-center gap-1 text-sm font-semibold text-primary">
                From the guide: {p.guide.title} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
        {filtered.length > shown.length && (
          <button type="button" className="btn-quiet mt-3 w-full" onClick={() => setShowAll(true)}>
            Show all {filtered.length} practices
          </button>
        )}
      </section>
    </div>
  );
}
