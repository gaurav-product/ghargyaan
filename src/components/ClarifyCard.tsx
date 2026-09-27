import { useEffect, useRef } from 'react';
import { ChevronLeft } from 'lucide-react';
import type { ClarifyResult } from '../engine/types';
import { useApp } from '../state/AppContext';
import { useAsk } from '../state/AskContext';

const WHY: Record<string, string> = {
  audience: 'Guidance for babies, children and older adults can be different.',
  duration: 'How long something has lasted changes when you should see a doctor.',
  disambiguate: 'We want to be sure we show the right guide instead of guessing.',
};

export function ClarifyCard({ result }: { result: ClarifyResult }) {
  const { settings } = useApp();
  const { answer, loading, canGoBack, back } = useAsk();
  const hi = settings.lang === 'hi';
  const { step, progress, candidate } = result;
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    heading.current?.focus();
  }, [step.id]);

  const safetyQuestion = step.kind === 'item';

  return (
    <section className="gg-rise space-y-4" aria-labelledby="clarify-q">
      <div className="flex items-center justify-between gap-3">
        {canGoBack ? (
          <button type="button" onClick={back} className="-ml-2 inline-flex min-h-[44px] items-center gap-1 rounded-full px-2 text-sm font-medium text-muted hover:text-ink">
            <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Back
          </button>
        ) : (
          <span />
        )}
        {progress.total > 1 && (
          <div className="flex items-center gap-2" aria-label={`Question ${progress.index + 1} of ${progress.total}`}>
            <span className="font-mono text-xs tabular-nums text-muted">
              {progress.index + 1}/{progress.total}
            </span>
            <div className="flex gap-1" aria-hidden="true">
              {Array.from({ length: progress.total }).map((_, i) => (
                <span key={i} className={`h-1.5 w-5 rounded-full ${i <= progress.index ? 'bg-primary' : 'bg-line'}`} />
              ))}
            </div>
          </div>
        )}
      </div>

      {candidate && (
        <p className="text-sm text-muted">
          Looking at: <strong className="font-semibold text-ink">{candidate.title}</strong>
        </p>
      )}

      <div className="card p-5">
        {safetyQuestion && <p className="eyebrow mb-2 text-danger">Safety check</p>}
        <h2 id="clarify-q" ref={heading} tabIndex={-1} className="font-display text-2xl leading-snug text-ink focus:outline-none">
          {hi && step.text_hi ? step.text_hi : step.text}
        </h2>
        {hi && step.text_hi && <p className="mt-1 text-sm text-muted">{step.text}</p>}
        {WHY[step.kind] && <p className="mt-1.5 text-sm text-muted">{WHY[step.kind]}</p>}

        <div className="mt-4 grid gap-2" role="group" aria-labelledby="clarify-q">
          {step.options.map((o) => (
            <button
              key={o.value}
              type="button"
              disabled={loading}
              onClick={() => void answer(step, o.value)}
              className="flex min-h-[52px] w-full items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-left text-base font-medium text-ink transition-colors hover:border-primary hover:bg-sunken disabled:opacity-60"
            >
              <span>{hi && o.label_hi ? o.label_hi : o.label}</span>
              <span aria-hidden="true" className="text-muted">
                →
              </span>
            </button>
          ))}
        </div>
      </div>
      <p className="text-sm text-muted">We only ask what changes the advice. Your answers are not stored.</p>
    </section>
  );
}
