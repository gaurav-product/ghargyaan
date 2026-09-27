import type { ReactNode } from 'react';
import { Ban, CheckCheck, Eye, Microscope, Siren, Sprout, Users } from 'lucide-react';
import type { Audience, KnowledgeItem } from '../kb/types';
import { useApp } from '../state/AppContext';
import { EvidenceBadge } from './Badges';

function Section({
  id,
  title,
  Icon,
  tone,
  children,
}: {
  id: string;
  title: string;
  Icon: typeof Ban;
  tone: 'ok' | 'danger' | 'trad' | 'science' | 'limited' | 'neutral';
  children: ReactNode;
}) {
  const toneCls = {
    ok: 'text-ok bg-okbg',
    danger: 'text-danger bg-dangerbg',
    trad: 'text-trad bg-tradbg',
    science: 'text-science bg-sunken',
    limited: 'text-limited bg-limitedbg',
    neutral: 'text-muted bg-sunken',
  }[tone];
  return (
    <section aria-labelledby={id} className="gg-rise">
      <h3 id={id} className="mb-2.5 flex items-center gap-2.5 text-lg font-semibold text-ink">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${toneCls}`}>
          <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
        </span>
        {title}
      </h3>
      <div className="pl-[2.6rem]">{children}</div>
    </section>
  );
}

function Bullets({ items, marker = 'dot' }: { items: string[]; marker?: 'dot' | 'num' }) {
  if (marker === 'num')
    return (
      <ol className="space-y-2.5">
        {items.map((s, i) => (
          <li key={s} className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-xs font-semibold text-on-primary tabular-nums">
              {i + 1}
            </span>
            <span className="prose-gg">{s}</span>
          </li>
        ))}
      </ol>
    );
  return (
    <ul className="space-y-1.5">
      {items.map((s) => (
        <li key={s} className="relative pl-4 prose-gg before:absolute before:left-0 before:top-[0.7em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-current before:opacity-50">
          {s}
        </li>
      ))}
    </ul>
  );
}

export function GuideBody({ item, audience, audienceNote }: { item: KnowledgeItem; audience?: Audience; audienceNote?: string }) {
  const { t, settings } = useApp();
  const hi = settings.lang === 'hi';
  const household = item.category === 'household' || item.category === 'food';
  const note = audienceNote ?? (audience ? item.audience_notes?.[audience] : undefined);

  return (
    <div className="space-y-7">
      {note && (
        <div className="flex gap-3 rounded-card border border-science/30 bg-sunken p-3.5">
          <Users className="mt-0.5 h-5 w-5 shrink-0 text-science" aria-hidden="true" />
          <p className="prose-gg text-ink">{note}</p>
        </div>
      )}

      <Section id={`${item.id}-do`} title={t('doNow')} Icon={CheckCheck} tone="ok">
        <Bullets items={item.how_to} marker="num" />
      </Section>

      {item.what_to_avoid.length > 0 && (
        <Section id={`${item.id}-avoid`} title={t('avoid')} Icon={Ban} tone="danger">
          <Bullets items={item.what_to_avoid} />
        </Section>
      )}

      {item.traditional_use && item.traditional_use.length > 0 && (
        <Section id={`${item.id}-trad`} title={t('tradPractice')} Icon={Sprout} tone="trad">
          <div className="space-y-3">
            {item.traditional_use.map((p) => (
              <article key={p.practice} className="rounded-card border border-line bg-surface p-3.5">
                <p className="font-semibold text-ink">{p.practice}</p>
                <div className="mt-2">
                  <span className="sr-only">Evidence: </span>
                  <EvidenceBadge level={p.evidence} hi={hi} size="sm" />
                </div>
                <p className="prose-gg mt-2 text-ink">{p.note}</p>
                <p className="prose-gg mt-1.5 text-sm text-muted">
                  <strong className="font-semibold text-ink">Safety: </strong>
                  {p.safety}
                </p>
              </article>
            ))}
          </div>
        </Section>
      )}

      <Section id={`${item.id}-evidence`} title={household ? 'Why this works' : t('evidenceSays')} Icon={Microscope} tone="science">
        <p className="prose-gg text-ink">{item.evidence_summary}</p>
      </Section>

      {item.watch_for.length > 0 && (
        <Section id={`${item.id}-watch`} title={t('watchFor')} Icon={Eye} tone="limited">
          <Bullets items={item.watch_for} />
        </Section>
      )}

      {(item.red_flags.length > 0 || item.when_to_seek_help.length > 0) && (
        <Section id={`${item.id}-help`} title={household ? 'Call a professional if' : t('getHelp')} Icon={Siren} tone="danger">
          {item.red_flags.length > 0 && (
            <div className="mb-3 rounded-lg border border-danger/30 bg-dangerbg p-3">
              <p className="mb-1.5 text-sm font-bold uppercase tracking-wide text-danger">Emergency: call 112</p>
              <Bullets items={item.red_flags} />
            </div>
          )}
          {item.when_to_seek_help.length > 0 && (
            <>
              <p className="mb-1.5 text-sm font-semibold text-muted">See a doctor or pharmacist soon</p>
              <Bullets items={item.when_to_seek_help} />
            </>
          )}
        </Section>
      )}
    </div>
  );
}
