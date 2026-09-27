import { useState } from 'react';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { track } from '../lib/analytics';

const MISSING = [
  { value: 'not_my_situation', label: 'Not my situation' },
  { value: 'too_general', label: 'Too general' },
  { value: 'hard_to_understand', label: 'Hard to understand' },
  { value: 'want_hindi', label: 'Wanted it in Hindi' },
  { value: 'missing_remedy', label: 'A remedy I use is missing' },
  { value: 'other', label: 'Something else' },
];

export function Feedback({ itemId }: { itemId: string }) {
  const { t, addFeedback } = useApp();
  const [state, setState] = useState<'ask' | 'why' | 'done'>('ask');

  const send = (helpful: boolean, missing?: string) => {
    addFeedback({ itemId, helpful, missing });
    track('feedback_given', { item_id: itemId, helpful, missing_reason: missing });
  };

  if (state === 'done')
    return (
      <p role="status" className="rounded-card bg-sunken p-4 text-center text-ink">
        Thank you. Your feedback helps us decide which guides to improve and review next.
      </p>
    );

  return (
    <div className="rounded-card border border-line bg-surface p-4">
      {state === 'ask' ? (
        <fieldset>
          <legend className="font-semibold text-ink">{t('helpful')}</legend>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="btn-quiet flex-1"
              onClick={() => {
                send(true);
                setState('done');
              }}
            >
              <ThumbsUp className="h-4 w-4" aria-hidden="true" /> {t('yes')}
            </button>
            <button type="button" className="btn-quiet flex-1" onClick={() => setState('why')}>
              <ThumbsDown className="h-4 w-4" aria-hidden="true" /> {t('no')}
            </button>
          </div>
        </fieldset>
      ) : (
        <fieldset>
          <legend className="font-semibold text-ink">What was missing?</legend>
          <p className="mt-0.5 text-sm text-muted">Pick one. We don’t store any health details you typed.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {MISSING.map((m) => (
              <button
                key={m.value}
                type="button"
                className="chip"
                onClick={() => {
                  send(false, m.value);
                  setState('done');
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </fieldset>
      )}
    </div>
  );
}
