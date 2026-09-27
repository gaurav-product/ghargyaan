import { Link } from 'react-router-dom';
import { Ban, SearchX, TriangleAlert } from 'lucide-react';
import type { BlockedResult, NoMatchResult } from '../engine/types';
import { GuideCard } from './GuideCard';

export function LoadingGuide() {
  return (
    <div className="space-y-4" role="status" aria-live="polite">
      <span className="sr-only">Checking safety and finding the right guide…</span>
      <div className="gg-skeleton h-4 w-28" />
      <div className="gg-skeleton h-9 w-3/4" />
      <div className="flex gap-2">
        <div className="gg-skeleton h-7 w-40 rounded-full" />
        <div className="gg-skeleton h-7 w-32 rounded-full" />
      </div>
      <div className="gg-skeleton h-24 w-full" />
      <div className="space-y-2">
        <div className="gg-skeleton h-4 w-full" />
        <div className="gg-skeleton h-4 w-5/6" />
        <div className="gg-skeleton h-4 w-4/6" />
      </div>
      <p className="font-mono text-xs text-muted" aria-hidden="true">
        safety check → matching guides → preparing steps
      </p>
    </div>
  );
}

export function NoMatchView({ result }: { result: NoMatchResult }) {
  return (
    <div className="space-y-5 gg-rise">
      <div className="card p-5">
        <SearchX className="h-7 w-7 text-muted" aria-hidden="true" />
        <h2 className="mt-3 font-display text-2xl text-ink">We don’t have a guide for that yet</h2>
        <p className="prose-gg mt-2 text-ink">{result.message}</p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-ink">
          <li>Try describing it differently, e.g. what happened and where on the body.</li>
          <li>If you’re worried, a pharmacist or doctor can help. If it’s serious, call 112.</li>
        </ul>
      </div>
      <section aria-labelledby="nm-popular">
        <h3 id="nm-popular" className="eyebrow mb-2">
          Popular guides
        </h3>
        <ul className="grid gap-2 sm:grid-cols-2">
          {result.suggestions.slice(0, 6).map((s) => (
            <li key={s.id}>
              <GuideCard item={s} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function BlockedView({ result }: { result: BlockedResult }) {
  const hard = ['sexual_minor', 'weapons', 'harm_others'].includes(result.reason);
  return (
    <div className="card space-y-3 p-5 gg-rise" role="region" aria-labelledby="blocked-title">
      {hard ? <Ban className="h-7 w-7 text-danger" aria-hidden="true" /> : <TriangleAlert className="h-7 w-7 text-limited" aria-hidden="true" />}
      <h2 id="blocked-title" className="font-display text-2xl text-ink">
        {hard ? 'We can’t help with this' : 'This needs a professional'}
      </h2>
      <p className="prose-gg text-ink">{result.message}</p>
      {result.suggestion && <p className="prose-gg rounded-lg bg-sunken p-3 text-ink">{result.suggestion}</p>}
      {result.related && (
        <Link to={`/guide/${result.related.id}`} className="flex min-h-[52px] items-center justify-between rounded-lg border border-line px-4 py-2 font-semibold text-ink hover:bg-sunken">
          General guide: {result.related.title} <span aria-hidden="true">→</span>
        </Link>
      )}
      {!hard && (
        <Link to="/explore" className="inline-block font-semibold text-primary underline underline-offset-2">
          Browse everyday guides
        </Link>
      )}
    </div>
  );
}

export function ErrorView({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="card space-y-3 p-5">
      <TriangleAlert className="h-7 w-7 text-limited" aria-hidden="true" />
      <p className="text-ink">{message}</p>
      {onRetry && (
        <button type="button" className="btn-primary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
