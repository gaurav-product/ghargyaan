import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, BookmarkCheck, Camera, Info, Pill, Volume2, VolumeX } from 'lucide-react';
import type { GuideResult } from '../engine/types';
import { useApp } from '../state/AppContext';
import { EVIDENCE_META, EvidenceBadge, ReviewBadge, SAFETY_META, SafetyBadge } from './Badges';
import { GuideBody } from './GuideBody';
import { SourceDrawer } from './SourceDrawer';
import { Feedback } from './Feedback';
import { track } from '../lib/analytics';
import { speak, stopSpeaking, ttsSupported } from '../lib/speech';

const WHO_LABEL = { adult: 'Adult', child: 'Child', infant: 'Baby under 1', older_adult: 'Older adult' } as const;

export function ResultView({ result }: { result: GuideResult }) {
  const { t, settings, isSaved, toggleSave } = useApp();
  const { item } = result;
  const hi = settings.lang === 'hi';
  const [open, setOpen] = useState(false);
  const [reading, setReading] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const saved = isSaved(item.id);
  const sm = SAFETY_META[result.safety];

  useEffect(() => {
    heading.current?.focus();
    return () => stopSpeaking();
  }, [item.id]);

  const readAloud = () => {
    if (reading) {
      stopSpeaking();
      setReading(false);
      return;
    }
    const text = [item.situation_label, result.summary, 'What you can do now.', ...item.how_to, 'Get help if.', ...item.red_flags.slice(0, 3)].join(' ');
    if (speak(text, 'en-IN')) {
      setReading(true);
      const check = setInterval(() => {
        if (!window.speechSynthesis?.speaking) {
          setReading(false);
          clearInterval(check);
        }
      }, 500);
    }
  };

  return (
    <article className="space-y-6" aria-labelledby="result-title">
      <header className="space-y-3">
        <p className="eyebrow">{t('yourSituation')}</p>
        <h2 id="result-title" ref={heading} tabIndex={-1} className="font-display text-[2rem] leading-tight text-ink focus:outline-none">
          {item.situation_label}
        </h2>
        {hi && <p className="font-display text-lg text-muted">{item.title_hi}</p>}
        <div className="flex flex-wrap items-center gap-2">
          <SafetyBadge level={result.safety} hi={hi} />
          <EvidenceBadge level={item.evidence_level} hi={hi} />
          {result.audience && (
            <span className="inline-flex items-center rounded-full border border-line bg-surface px-3 py-1 text-sm font-medium text-ink">
              For: {WHO_LABEL[result.audience]}
            </span>
          )}
        </div>
      </header>

      {result.fromImage && (
        <div className="flex gap-3 rounded-card border border-line bg-sunken p-3.5 text-ink">
          <Camera className="mt-0.5 h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
          <p className="prose-gg">
            I can’t reliably identify a medical condition from this image alone. The guidance below is based on what you told us, not on the photo.
          </p>
        </div>
      )}

      <div className={`rounded-card border p-4 ${item.myth && item.category === 'traditional' && result.safety === 'self_care' ? EVIDENCE_META[item.evidence_level].cls : sm.cls}`}>
        <p className="prose-gg font-medium text-ink">{result.summary}</p>
        {result.safety !== 'self_care' && (
          <ul className="mt-2 space-y-1 text-ink">
            {result.escalations.map((e) => (
              <li key={e.reason} className="flex gap-2 text-[0.95rem]">
                <sm.Icon className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
                {e.reason}
              </li>
            ))}
          </ul>
        )}
      </div>

      {result.medicationNotice && (
        <div className="flex gap-3 rounded-card border border-limited/40 bg-limitedbg p-3.5">
          <Pill className="mt-0.5 h-5 w-5 shrink-0 text-limited" aria-hidden="true" />
          <p className="prose-gg text-ink">
            GharGyaan does not give medicine doses or recommend prescription medicines. Check the pack leaflet and ask a pharmacist or doctor, especially for children,
            pregnancy, or if you take other medicines.
          </p>
        </div>
      )}

      {hi && t('contentEnglish') && (
        <p className="flex gap-2 rounded-lg bg-sunken p-3 text-sm text-muted">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {t('contentEnglish')}
        </p>
      )}

      <GuideBody item={item} audience={result.audience} audienceNote={result.audienceNote} />

      <div className="flex flex-wrap gap-2 border-t border-line pt-5">
        <button
          type="button"
          className="btn-quiet"
          onClick={() => {
            setOpen(true);
            track('source_opened', { item_id: item.id });
          }}
        >
          <Info className="h-4 w-4" aria-hidden="true" /> {t('why')}
        </button>
        <button type="button" className="btn-quiet" aria-pressed={saved} onClick={() => toggleSave(item.id)}>
          {saved ? <BookmarkCheck className="h-4 w-4 text-primary" aria-hidden="true" /> : <Bookmark className="h-4 w-4" aria-hidden="true" />}
          {saved ? t('saved') : t('save')}
        </button>
        {ttsSupported() && (
          <button type="button" className="btn-quiet" onClick={readAloud} aria-pressed={reading}>
            {reading ? <VolumeX className="h-4 w-4" aria-hidden="true" /> : <Volume2 className="h-4 w-4" aria-hidden="true" />}
            {reading ? t('stopReading') : t('readAloud')}
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
        <ReviewBadge status={item.review_status} />
        <span className="font-mono text-xs tabular-nums">Last reviewed {item.last_reviewed}</span>
        <span className="font-mono text-xs">{item.source.map((s) => s.publisher.split(' (')[0]).filter((v, i, a) => a.indexOf(v) === i).join(' · ')}</span>
      </div>

      <Feedback key={item.id} itemId={item.id} />

      {result.alternatives.length > 0 && (
        <section aria-labelledby="alt-title">
          <h3 id="alt-title" className="eyebrow mb-2">
            Not quite right? Related guides
          </h3>
          <ul className="grid gap-2 sm:grid-cols-2">
            {result.alternatives.map((a) => (
              <li key={a.id}>
                <Link to={`/guide/${a.id}`} className="flex min-h-[56px] items-center justify-between gap-2 rounded-card border border-line bg-surface px-4 py-3 hover:bg-sunken">
                  <span className="font-medium text-ink">{a.title}</span>
                  <EvidenceBadge level={a.evidence_level} size="sm" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-sm text-muted">{t('disclaimer')}</p>

      <SourceDrawer item={item} trace={result.trace} open={open} onClose={() => setOpen(false)} />
    </article>
  );
}
