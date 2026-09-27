import { useEffect, useRef, useState } from 'react';
import { AlertOctagon, HeartHandshake, OctagonX } from 'lucide-react';
import type { EmergencyResult } from '../engine/types';
import { Helplines } from './Helplines';
import { SourceDrawer } from './SourceDrawer';
import { INDIA_HELPLINES } from '../kb/sources';

export function EmergencyView({ result }: { result: EmergencyResult }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => heading.current?.focus(), []);

  if (result.selfHarm) {
    return (
      <div className="space-y-5 gg-rise" role="region" aria-labelledby="sh-title">
        <div className="rounded-card border border-science/30 bg-surface p-5">
          <HeartHandshake className="h-8 w-8 text-science" aria-hidden="true" />
          <h2 id="sh-title" ref={heading} tabIndex={-1} className="mt-3 font-display text-2xl text-ink focus:outline-none">
            {result.title}
          </h2>
          <p className="prose-gg mt-2 text-ink">
            It sounds like things are really hard right now. You don’t have to go through this alone. Talking to someone trained to help can make a difference, and it’s free
            and confidential.
          </p>
        </div>
        <Helplines keys={['mental', 'emergency']} emphasisFirst />
        <div className="rounded-card border border-line bg-surface p-4">
          <h3 className="font-semibold text-ink">Right now, you could</h3>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-ink">
            <li>Call Tele-MANAS on {INDIA_HELPLINES.mental.number}. They speak Hindi, English and many Indian languages, 24×7.</li>
            <li>Reach out to someone you trust and tell them how you’re feeling.</li>
            <li>If you are in immediate danger, call 112 or go to the nearest hospital emergency.</li>
            <li>If you can, move away from anything you could use to hurt yourself.</li>
          </ul>
        </div>
        <p className="text-sm text-muted">GharGyaan is not able to provide counselling, but the people at these numbers can.</p>
      </div>
    );
  }

  const clinic = result.matches.length > 0 && result.matches.every((m) => m.level === 'urgent_care');
  const primaryKeys: (keyof typeof INDIA_HELPLINES)[] = result.matches.some((m) => m.callFirst === 'gas')
    ? ['gas', 'emergency']
    : result.matches.some((m) => m.callFirst === 'poison')
      ? ['poison', 'emergency', 'ambulance']
      : ['emergency', 'ambulance'];

  return (
    <div className="space-y-5 gg-rise" role="region" aria-labelledby="em-title">
      <div className={`rounded-card border-2 p-5 ${clinic ? 'border-limited/50 bg-limitedbg' : 'border-danger/60 bg-dangerbg'}`}>
        <p className={`inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider ${clinic ? 'text-limited' : 'text-danger'}`}>
          <AlertOctagon className="h-4 w-4" aria-hidden="true" /> {clinic ? 'Get seen today' : 'Seek urgent help'}
        </p>
        <h2 id="em-title" ref={heading} tabIndex={-1} className="mt-2 font-display text-3xl text-ink focus:outline-none">
          {result.title}
        </h2>
        <p className="mt-2 text-ink">
          {clinic
            ? 'This is not something to treat with home remedies. Please get medical care today.'
            : 'Please don’t rely on home remedies for this. Get professional help now.'}
        </p>
        <ul className="mt-3 space-y-1">
          {result.reasons.map((r) => (
            <li key={r} className="flex gap-2 font-semibold text-ink">
              <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-danger" />
              {r}
            </li>
          ))}
        </ul>
      </div>

      <Helplines keys={primaryKeys} emphasisFirst={!clinic} />

      {result.matches.map((m) => (
        <section key={m.id} className="rounded-card border border-line bg-surface p-4" aria-labelledby={`m-${m.id}`}>
          <h3 id={`m-${m.id}`} className="font-semibold text-ink">
            {m.label}: what to do while getting help
          </h3>
          <ol className="mt-2 space-y-1.5">
            {m.doNow.map((d, i) => (
              <li key={d} className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink font-mono text-xs text-surface">{i + 1}</span>
                <span className="text-ink">{d}</span>
              </li>
            ))}
          </ol>
          {m.dont && (
            <ul className="mt-3 space-y-1">
              {m.dont.map((d) => (
                <li key={d} className="flex gap-2 text-ink">
                  <OctagonX className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden="true" />
                  {d}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-muted">
            Based on:{' '}
            {m.sources.map((s, i) => (
              <span key={s.title}>
                {i > 0 && ', '}
                {s.url ? (
                  <a className="underline" href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.publisher.split(' (')[0]}: {s.title}
                  </a>
                ) : (
                  s.title
                )}
              </span>
            ))}
          </p>
        </section>
      ))}

      {result.matches.length === 0 && (
        <section className="rounded-card border border-line bg-surface p-4">
          <h3 className="font-semibold text-ink">While you get help</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-ink">
            <li>Stay with the person and keep them calm.</li>
            <li>Do not give food, drink or medicines unless a medical professional tells you to.</li>
            <li>If they become unresponsive, call 112 immediately.</li>
          </ul>
        </section>
      )}

      <details className="rounded-card border border-line bg-surface p-4 text-sm">
        <summary className="cursor-pointer font-semibold text-ink">How GharGyaan decided this</summary>
        <ol className="mt-2 space-y-1.5 border-l-2 border-line pl-3">
          {result.trace.steps.map((s, i) => (
            <li key={i}>
              <span className="font-semibold text-ink">{s.name}.</span> <span className="text-muted">{s.detail}</span>
            </li>
          ))}
        </ol>
        <p className="mt-2 text-muted">Warning signs are checked with fixed safety rules before any guide or AI is used. When in doubt, GharGyaan errs on the side of getting help.</p>
      </details>

      {result.relatedItem && result.matches.length === 0 && (
        <>
          <button type="button" onClick={() => setOpen(true)} className="text-sm font-semibold text-primary underline underline-offset-2">
            Why am I seeing this?
          </button>
          <SourceDrawer item={result.relatedItem} trace={result.trace} open={open} onClose={() => setOpen(false)} />
        </>
      )}
    </div>
  );
}
