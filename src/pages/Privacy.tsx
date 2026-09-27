export function Privacy() {
  const rows = [
    ['What you type, say or photograph', 'Processed on your device in demo mode and never stored. In live mode, only the text needed for a single answer (and a downscaled photo, if you add one) is sent to our AI service and not kept.'],
    ['Saved guides and settings', 'Stored in your browser on this device only. Delete anytime from Profile.'],
    ['Usage analytics', 'Anonymous events such as “result viewed: burn guide”. Never your words, photos, location or identity.'],
    ['Accounts', 'None. You never need to sign up.'],
    ['Location', 'Never requested.'],
    ['Advertising', 'None, and never based on health information.'],
    ['Selling data', 'Never.'],
  ];
  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-3xl text-ink">Privacy</h1>
        <p className="prose-gg mt-1 text-muted">Health questions are personal. GharGyaan is built to collect as little as possible.</p>
      </header>
      <dl className="card divide-y divide-line">
        {rows.map(([k, v]) => (
          <div key={k} className="grid gap-1 p-4 sm:grid-cols-[14rem_1fr] sm:gap-4">
            <dt className="font-semibold text-ink">{k}</dt>
            <dd className="text-ink">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="text-sm text-muted">
        This is a prototype. Before a public launch, this notice would be reviewed for India’s Digital Personal Data Protection Act, 2023, and a consent flow added for any data sent
        off-device.
      </p>
    </div>
  );
}
