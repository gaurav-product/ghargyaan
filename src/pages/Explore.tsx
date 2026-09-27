import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { CATEGORY_META, CATEGORY_ORDER, KNOWLEDGE } from '../kb';
import type { Category } from '../kb/types';
import { GuideCard } from '../components/GuideCard';
import { useApp } from '../state/AppContext';
import { clean } from '../engine/normalize';

export function Explore() {
  const { settings } = useApp();
  const hi = settings.lang === 'hi';
  const [params, setParams] = useSearchParams();
  const active = (params.get('c') as Category | null) ?? null;
  const [q, setQ] = useState('');

  const items = useMemo(() => {
    const needle = clean(q);
    return KNOWLEDGE.filter((k) => (!active || k.category === active) && (!needle || clean([k.title, k.title_hi, k.problem, ...k.keywords].join(' ')).includes(needle)));
  }, [active, q]);

  const counts = useMemo(() => {
    const c: Partial<Record<Category, number>> = {};
    KNOWLEDGE.forEach((k) => (c[k.category] = (c[k.category] ?? 0) + 1));
    return c;
  }, []);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-3xl text-ink">{hi ? 'खोजें' : 'Explore'}</h1>
        <p className="mt-1 text-muted">
          {KNOWLEDGE.length} guides, each with an evidence label and sources. {hi && 'गाइड की सामग्री अभी अंग्रेज़ी में है।'}
        </p>
      </header>

      <div className="relative">
        <label htmlFor="explore-search" className="sr-only">
          Filter guides
        </label>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input
          id="explore-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter: burn, khansi, daag…"
          className="min-h-[48px] w-full rounded-full border border-line bg-surface pl-10 pr-4 text-base text-ink placeholder:text-muted focus:border-primary focus:outline-none"
        />
      </div>

      <div className="-mx-4 overflow-x-auto px-4" role="tablist" aria-label="Categories">
        <div className="flex w-max gap-2 pb-1">
          <button type="button" role="tab" aria-selected={!active} onClick={() => setParams({})} className={`chip ${!active ? 'border-primary bg-primary text-on-primary hover:bg-primary' : ''}`}>
            All
          </button>
          {CATEGORY_ORDER.map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={active === c}
              onClick={() => setParams({ c })}
              className={`chip ${active === c ? 'border-primary bg-primary text-on-primary hover:bg-primary' : ''}`}
            >
              {hi ? CATEGORY_META[c].label_hi : CATEGORY_META[c].label}
              <span className="font-mono text-xs opacity-70 tabular-nums">{counts[c]}</span>
            </button>
          ))}
        </div>
      </div>

      {active && <p className="text-muted">{CATEGORY_META[active].blurb}</p>}

      {items.length ? (
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {items.map((k) => (
            <li key={k.id}>
              <GuideCard item={k} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="card p-6 text-center">
          <p className="font-semibold text-ink">No guides match “{q}”.</p>
          <p className="mt-1 text-sm text-muted">Try another word, or describe your situation on the Home screen.</p>
        </div>
      )}
    </div>
  );
}
