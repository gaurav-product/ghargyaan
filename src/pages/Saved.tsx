import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import { byId } from '../kb';
import { useApp } from '../state/AppContext';
import { GuideCard } from '../components/GuideCard';

export function Saved() {
  const { saved, settings, toggleSave } = useApp();
  const items = saved.map((id) => byId.get(id)).filter((x): x is NonNullable<typeof x> => !!x);
  const hi = settings.lang === 'hi';

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-3xl text-ink">{hi ? 'सहेजे गए गाइड' : 'Saved guides'}</h1>
        <p className="mt-1 text-muted">Saved on this device only. No account needed.</p>
      </header>
      {items.length ? (
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {items.map((k) => (
            <li key={k.id} className="relative">
              <GuideCard item={k} />
              <button
                type="button"
                onClick={() => toggleSave(k.id)}
                className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full text-primary hover:bg-sunken"
                aria-label={`Remove ${k.title} from saved`}
              >
                <Bookmark className="h-5 w-5 fill-current" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="card flex flex-col items-center gap-3 p-8 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sunken">
            <Bookmark className="h-6 w-6 text-muted" aria-hidden="true" />
          </span>
          <p className="font-semibold text-ink">Nothing saved yet</p>
          <p className="max-w-xs text-sm text-muted">Tap “Save guide” on any result to keep it here for next time, like a first-aid card for your home.</p>
          <Link to="/explore" className="btn-primary mt-1">
            Browse guides
          </Link>
        </div>
      )}
    </div>
  );
}
