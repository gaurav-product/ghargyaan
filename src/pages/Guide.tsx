import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Bookmark, BookmarkCheck, ChevronLeft, Info } from 'lucide-react';
import { byId, CATEGORY_META } from '../kb';
import type { Audience } from '../kb/types';
import { useApp } from '../state/AppContext';
import { useAsk } from '../state/AskContext';
import { EvidenceBadge, ReviewBadge } from '../components/Badges';
import { GuideBody } from '../components/GuideBody';
import { SourceDrawer } from '../components/SourceDrawer';
import { Feedback } from '../components/Feedback';
import { track } from '../lib/analytics';
import { isPersonal } from '../engine/clarify';

const AUDIENCES: { value: Audience; label: string }[] = [
  { value: 'adult', label: 'Adult' },
  { value: 'child', label: 'Child' },
  { value: 'infant', label: 'Baby' },
  { value: 'older_adult', label: '65+' },
];

export function Guide() {
  const { id = '' } = useParams();
  const item = byId.get(id);
  const { settings, isSaved, toggleSave, t } = useApp();
  const { startGuide } = useAsk();
  const nav = useNavigate();
  const [audience, setAudience] = useState<Audience>('adult');
  const [open, setOpen] = useState(false);
  const hi = settings.lang === 'hi';

  useEffect(() => {
    if (item) document.title = `${item.title} · GharGyaan`;
    return () => {
      document.title = 'GharGyaan';
    };
  }, [item]);

  if (!item)
    return (
      <div className="card p-6">
        <h1 className="font-display text-2xl text-ink">Guide not found</h1>
        <p className="mt-2 text-muted">This guide may have been renamed or removed.</p>
        <Link to="/explore" className="mt-3 inline-block font-semibold text-primary underline">
          Browse all guides
        </Link>
      </div>
    );

  const saved = isSaved(item.id);
  const personal = isPersonal(item);

  return (
    <article className="space-y-6" aria-labelledby="guide-title">
      <button type="button" onClick={() => nav(-1)} className="-ml-2 inline-flex min-h-[44px] items-center gap-1 rounded-full px-2 text-sm font-medium text-muted hover:text-ink">
        <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Back
      </button>
      <header className="space-y-3">
        <Link to={`/explore?c=${item.category}`} className="eyebrow hover:text-ink">
          {CATEGORY_META[item.category].label}
        </Link>
        <h1 id="guide-title" className="font-display text-[2rem] leading-tight text-ink">
          {item.title}
        </h1>
        <p className="font-display text-lg text-muted">{item.title_hi}</p>
        <p className="prose-gg text-ink">{item.problem}</p>
        <div className="flex flex-wrap items-center gap-2">
          <EvidenceBadge level={item.evidence_level} hi={hi} />
          <ReviewBadge status={item.review_status} />
        </div>
      </header>

      {item.myth && (
        <div className="rounded-card border border-line bg-surface p-4">
          <p className="eyebrow">Myth check</p>
          <p className="mt-1 font-display text-xl text-ink">“{item.myth.claim}”</p>
          <p className="mt-1.5 font-semibold text-ink">{item.myth.verdict}</p>
        </div>
      )}

      <div className="rounded-card border border-line bg-surface p-4">
        <p className="prose-gg text-ink">{item.modern_guidance}</p>
      </div>

      {personal && (
        <div className="space-y-3">
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-ink">Show notes for</legend>
            <div className="grid grid-cols-4 gap-1 rounded-full border border-line bg-sunken p-1">
              {AUDIENCES.map((a) => (
                <button
                  key={a.value}
                  type="button"
                  aria-pressed={audience === a.value}
                  onClick={() => setAudience(a.value)}
                  className={`min-h-[40px] rounded-full text-sm font-medium ${audience === a.value ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'}`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </fieldset>
          {item.not_for?.find((n) => n.audience === audience) && (
            <p className="rounded-lg border border-limited/40 bg-limitedbg p-3 text-ink">{item.not_for.find((n) => n.audience === audience)!.reason}</p>
          )}
          <button
            type="button"
            className="btn-primary w-full"
            onClick={async () => {
              nav('/ask');
              await startGuide(item.id, item.title);
            }}
          >
            Check my situation with a few questions <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      <GuideBody item={item} audience={personal ? audience : undefined} />

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
      </div>
      <Feedback key={item.id} itemId={item.id} />
      <p className="text-sm text-muted">{t('disclaimer')}</p>
      <SourceDrawer item={item} open={open} onClose={() => setOpen(false)} />
    </article>
  );
}
