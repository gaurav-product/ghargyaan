import { AlertOctagon, CheckCircle2, CircleDot, FlaskConical, Leaf, ShieldAlert, ShieldCheck, Stethoscope, XCircle, FileQuestion } from 'lucide-react';
import type { EvidenceLevel, ReviewStatus, SafetyLevel } from '../kb/types';

export const EVIDENCE_META: Record<EvidenceLevel, { label: string; label_hi: string; short: string; cls: string; Icon: typeof CheckCircle2; step: number; explain: string }> = {
  supported: {
    label: 'Evidence-supported',
    label_hi: 'प्रमाण-समर्थित',
    short: 'Supported',
    cls: 'bg-okbg text-ok border-ok/30',
    Icon: CheckCircle2,
    step: 4,
    explain: 'Credible public-health or clinical sources support this for the stated use.',
  },
  limited: {
    label: 'Limited evidence',
    label_hi: 'सीमित प्रमाण',
    short: 'Limited',
    cls: 'bg-limitedbg text-limited border-limited/30',
    Icon: FlaskConical,
    step: 3,
    explain: 'Some evidence exists, but confidence is limited.',
  },
  traditional: {
    label: 'Traditional practice',
    label_hi: 'पारंपरिक तरीका',
    short: 'Traditional',
    cls: 'bg-tradbg text-trad border-trad/30',
    Icon: Leaf,
    step: 2,
    explain: 'Traditionally used, but evidence for the claimed benefit is insufficient or uncertain.',
  },
  not_recommended: {
    label: 'Not recommended',
    label_hi: 'सलाह नहीं',
    short: 'Not recommended',
    cls: 'bg-dangerbg text-danger border-danger/30',
    Icon: XCircle,
    step: 1,
    explain: 'May be ineffective, inappropriate, or harmful.',
  },
};

export function EvidenceBadge({ level, hi = false, size = 'md' }: { level: EvidenceLevel; hi?: boolean; size?: 'sm' | 'md' }) {
  const m = EVIDENCE_META[level];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${m.cls} ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}
    >
      <m.Icon aria-hidden="true" className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      {hi ? m.label_hi : m.label}
    </span>
  );
}

export const SAFETY_META: Record<SafetyLevel, { label: string; label_hi: string; cls: string; Icon: typeof ShieldCheck; line: string }> = {
  self_care: {
    label: 'Self-care information',
    label_hi: 'स्व-देखभाल जानकारी',
    cls: 'bg-okbg text-ok border-ok/30',
    Icon: ShieldCheck,
    line: 'This is usually safe to manage at home. Watch for the warning signs below.',
  },
  consider_advice: {
    label: 'Consider professional advice',
    label_hi: 'डॉक्टर की सलाह लें',
    cls: 'bg-limitedbg text-limited border-limited/30',
    Icon: Stethoscope,
    line: 'Based on your answers, it is sensible to speak to a doctor or pharmacist soon.',
  },
  urgent: {
    label: 'Seek urgent help',
    label_hi: 'तुरंत मदद लें',
    cls: 'bg-dangerbg text-danger border-danger/30',
    Icon: AlertOctagon,
    line: 'This needs urgent professional care.',
  },
};

export function SafetyBadge({ level, hi = false }: { level: SafetyLevel; hi?: boolean }) {
  const m = SAFETY_META[level];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${m.cls}`}>
      <m.Icon aria-hidden="true" className="h-4 w-4" />
      {hi ? m.label_hi : m.label}
    </span>
  );
}

export function ReviewBadge({ status }: { status: ReviewStatus }) {
  if (status === 'expert_reviewed')
    return (
      <span className="inline-flex items-center gap-1 font-mono text-xs text-ok">
        <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5" /> Expert reviewed
      </span>
    );
  if (status === 'needs_source')
    return (
      <span className="inline-flex items-center gap-1 font-mono text-xs text-trad">
        <FileQuestion aria-hidden="true" className="h-3.5 w-3.5" /> Needs a verified source
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 font-mono text-xs text-muted">
      <ShieldAlert aria-hidden="true" className="h-3.5 w-3.5" /> Prototype · awaiting expert review
    </span>
  );
}

/** The four-rung evidence ladder, with the current level marked. */
export function EvidenceLadder({ level, compact = false }: { level?: EvidenceLevel; compact?: boolean }) {
  const order: EvidenceLevel[] = ['not_recommended', 'traditional', 'limited', 'supported'];
  return (
    <div className={compact ? '' : 'space-y-2'}>
      <ol className="grid grid-cols-4 gap-1" aria-label="Evidence ladder">
        {order.map((l) => {
          const m = EVIDENCE_META[l];
          const active = l === level;
          return (
            <li
              key={l}
              aria-current={active ? 'true' : undefined}
              className={`relative flex min-h-[44px] flex-col items-center justify-center rounded-lg border px-1 py-1.5 text-center text-[0.7rem] font-semibold leading-tight ${
                active ? `${m.cls} ring-2 ring-offset-1 ring-offset-surface ring-current` : level ? 'border-line bg-sunken text-muted' : `${m.cls}`
              }`}
            >
              <m.Icon aria-hidden="true" className="mb-0.5 h-4 w-4" />
              {m.short}
              {active && <span className="sr-only"> (this guide)</span>}
            </li>
          );
        })}
      </ol>
      {!compact && (
        <div className="flex justify-between font-mono text-[0.65rem] uppercase tracking-wider text-muted">
          <span>Avoid</span>
          <span className="inline-flex items-center gap-1">
            <CircleDot aria-hidden="true" className="h-3 w-3" /> Stronger evidence
          </span>
        </div>
      )}
    </div>
  );
}
