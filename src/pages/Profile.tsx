import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Trash2 } from 'lucide-react';
import { useApp, type Theme } from '../state/AppContext';
import { getEvents } from '../lib/analytics';

function Row({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-2 border-b border-line py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold text-ink">{label}</p>
        {hint && <p className="text-sm text-muted">{hint}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-full border border-line bg-sunken p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`min-h-[40px] rounded-full px-4 text-sm font-medium ${value === o.value ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Profile() {
  const { settings, setSettings, deleteAllData, saved, feedback, liveConfigured } = useApp();
  const [confirming, setConfirming] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const events = getEvents();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl text-ink">Profile & settings</h1>
        <p className="mt-1 text-muted">No account, no sign-up. Everything below lives on this device.</p>
      </header>

      <section className="card px-4">
        <Row label="Language" hint="Screens and questions. Guide text is English for now.">
          <Segmented label="Language" value={settings.lang} onChange={(v) => setSettings({ lang: v })} options={[{ value: 'en', label: 'English' }, { value: 'hi', label: 'हिंदी' }]} />
        </Row>
        <Row label="Appearance">
          <Segmented<Theme>
            label="Appearance"
            value={settings.theme}
            onChange={(v) => setSettings({ theme: v })}
            options={[
              { value: 'system', label: 'Auto' },
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ]}
          />
        </Row>
        <Row
          label="AI mode"
          hint={
            liveConfigured
              ? 'Live AI writes a short opening line and helps match unusual phrasing. Guidance always comes from reviewed guides.'
              : 'Demo mode: the full experience runs offline from reviewed guides. No AI keys are configured.'
          }
        >
          {liveConfigured ? (
            <Segmented label="AI mode" value={settings.forceDemo ? 'demo' : 'live'} onChange={(v) => setSettings({ forceDemo: v === 'demo' })} options={[{ value: 'live', label: 'Live' }, { value: 'demo', label: 'Demo' }]} />
          ) : (
            <span className="rounded-full border border-line px-3 py-1 font-mono text-xs uppercase tracking-wider text-muted">Demo mode</span>
          )}
        </Row>
      </section>

      <section className="card space-y-3 p-4" aria-labelledby="data-title">
        <h2 id="data-title" className="font-semibold text-ink">
          Your data
        </h2>
        <dl className="grid grid-cols-[1fr_auto] gap-y-1.5 text-sm">
          <dt className="text-muted">Saved guides</dt>
          <dd className="font-mono tabular-nums">{saved.length}</dd>
          <dt className="text-muted">Feedback answers</dt>
          <dd className="font-mono tabular-nums">{feedback.length}</dd>
          <dt className="text-muted">Anonymous usage events</dt>
          <dd className="font-mono tabular-nums">{events.length}</dd>
        </dl>
        <p className="text-sm text-muted">We never store what you type, say or photograph. Usage events only record things like “a burn guide was viewed”.</p>
        {deleted ? (
          <p role="status" className="rounded-lg bg-okbg p-3 text-sm text-ok">
            Done. Everything GharGyaan stored on this device has been deleted.
          </p>
        ) : confirming ? (
          <div className="rounded-lg border border-danger/40 bg-dangerbg p-3">
            <p className="text-sm text-ink">Delete saved guides, feedback, settings and usage events from this device? This can’t be undone.</p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                className="btn min-h-[44px] bg-danger px-4 text-sm text-surface"
                onClick={() => {
                  deleteAllData();
                  setConfirming(false);
                  setDeleted(true);
                }}
              >
                Delete everything
              </button>
              <button type="button" className="btn-quiet min-h-[44px] px-4 text-sm" onClick={() => setConfirming(false)}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className="btn-quiet text-danger" onClick={() => setConfirming(true)}>
            <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete my data
          </button>
        )}
      </section>

      <nav aria-label="About" className="card divide-y divide-line">
        {[
          { to: '/', label: 'About GharGyaan' },
          { to: '/privacy', label: 'Privacy' },
          { to: '/emergency', label: 'Emergency numbers' },
          { to: '/research', label: 'Product research & metrics (internal)' },
        ].map((l) => (
          <Link key={l.to} to={l.to} className="flex min-h-[52px] items-center justify-between px-4 text-ink hover:bg-sunken">
            {l.label}
            <ChevronRight className="h-4 w-4 text-muted" aria-hidden="true" />
          </Link>
        ))}
      </nav>
      <p className="font-mono text-xs text-muted">GharGyaan v1 prototype · knowledge base drafted 2026-09-26 · not yet reviewed by clinicians</p>
    </div>
  );
}
