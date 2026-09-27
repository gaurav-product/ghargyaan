import { useState } from 'react';
import { Check, Copy, Phone } from 'lucide-react';
import { INDIA_HELPLINES } from '../kb/sources';

type Key = keyof typeof INDIA_HELPLINES;

export function HelplineRow({ k, emphasis = false }: { k: Key; emphasis?: boolean }) {
  const h = INDIA_HELPLINES[k];
  const [copied, setCopied] = useState(false);
  const tel = h.number.replace(/\s/g, '');
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(tel);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };
  return (
    <li
      className={`flex items-center gap-3 rounded-card border p-3 ${
        emphasis ? (k === 'mental' ? 'border-science/40 bg-sunken' : 'border-danger/40 bg-dangerbg') : 'border-line bg-surface'
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className={`font-mono font-semibold tabular-nums ${h.number.length > 6 ? 'text-lg' : 'text-2xl tracking-wide'} ${emphasis ? (k === 'mental' ? 'text-science' : 'text-danger') : 'text-ink'}`}>
          <span className="select-all">{h.number}</span>
        </p>
        <p className="text-sm text-muted">{h.label}</p>
      </div>
      <a
        href={`tel:${tel}`}
        className={`inline-flex min-h-[48px] items-center gap-2 rounded-full px-4 font-semibold ${
          emphasis && k !== 'mental' ? 'bg-danger text-surface' : 'bg-primary text-on-primary'
        }`}
        aria-label={`Call ${h.label}, ${h.number}`}
      >
        <Phone className="h-4 w-4" aria-hidden="true" /> Call
      </a>
      <button
        type="button"
        onClick={copy}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-surface text-muted hover:text-ink"
        aria-label={`Copy number ${h.number}`}
      >
        {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
      </button>
    </li>
  );
}

export function Helplines({ keys, emphasisFirst = true }: { keys: Key[]; emphasisFirst?: boolean }) {
  return (
    <ul className="space-y-2">
      {keys.map((k, i) => (
        <HelplineRow key={k} k={k} emphasis={emphasisFirst && i === 0} />
      ))}
    </ul>
  );
}
