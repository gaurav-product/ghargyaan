import { Link } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { useAsk } from '../state/AskContext';
import { useApp } from '../state/AppContext';
import { ClarifyCard } from '../components/ClarifyCard';
import { ResultView } from '../components/ResultView';
import { EmergencyView } from '../components/EmergencyView';
import { BlockedView, ErrorView, LoadingGuide, NoMatchView } from '../components/States';
import { AskBox } from '../components/AskBox';

export function Ask() {
  const { output, loading, error, session, reset, submit } = useAsk();
  const { t } = useApp();

  let body;
  if (loading && !output) body = <LoadingGuide />;
  else if (error) body = <ErrorView message={error} onRetry={session ? () => void submit(session.query) : undefined} />;
  else if (!output)
    body = (
      <div className="space-y-4">
        <h1 className="font-display text-3xl text-ink">{t('whatHappened')}</h1>
        <AskBox autoFocus />
      </div>
    );
  else
    switch (output.kind) {
      case 'clarify':
        body = <ClarifyCard key={output.step.id} result={output} />;
        break;
      case 'result':
        body = <ResultView result={output} />;
        break;
      case 'emergency':
        body = <EmergencyView result={output} />;
        break;
      case 'blocked':
        body = <BlockedView result={output} />;
        break;
      case 'no_match':
        body = <NoMatchView result={output} />;
        break;
      case 'input_error':
        body = (
          <div className="space-y-4">
            <p role="alert" className="rounded-lg bg-limitedbg p-3 text-ink">
              {output.message}
            </p>
            <AskBox autoFocus />
          </div>
        );
        break;
    }

  return (
    <div className="space-y-5">
      {session && output && output.kind !== 'input_error' && (
        <div className="flex items-start justify-between gap-3">
          <p className="min-w-0 flex-1 rounded-2xl rounded-tl-sm bg-sunken px-4 py-2.5 text-ink">
            <span className="sr-only">You asked: </span>
            {session.query}
          </p>
          <Link
            to="/app"
            onClick={reset}
            className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-sm font-medium text-ink hover:bg-sunken"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" /> {t('startOver')}
          </Link>
        </div>
      )}
      <div aria-busy={loading}>
        {loading && output ? <div className="opacity-60 transition-opacity">{body}</div> : body}
      </div>
    </div>
  );
}
