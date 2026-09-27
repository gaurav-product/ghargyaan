import { Link } from 'react-router-dom';
import type { KnowledgeItem } from '../kb/types';
import { EvidenceBadge } from './Badges';
import { useApp } from '../state/AppContext';

export function GuideCard({ item, showMyth = false }: { item: KnowledgeItem; showMyth?: boolean }) {
  const { settings } = useApp();
  const hi = settings.lang === 'hi';
  return (
    <Link
      to={`/guide/${item.id}`}
      className="flex h-full flex-col gap-2 rounded-card border border-line bg-surface p-4 transition-colors hover:border-primary/50 hover:bg-sunken"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold leading-snug text-ink">{showMyth && item.myth ? `“${item.myth.claim}”` : item.title}</p>
          {hi && <p className="text-sm text-muted">{item.title_hi}</p>}
        </div>
      </div>
      <p className="line-clamp-2 text-sm text-muted">{showMyth && item.myth ? item.myth.verdict : item.problem}</p>
      <div className="mt-auto pt-1">
        <EvidenceBadge level={item.evidence_level} hi={hi} size="sm" />
      </div>
    </Link>
  );
}
