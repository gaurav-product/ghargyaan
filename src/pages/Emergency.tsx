import { Helplines } from '../components/Helplines';

export function Emergency() {
  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-3xl text-ink">Emergency numbers (India)</h1>
        <p className="mt-1 text-muted">If someone is seriously hurt, can’t breathe, is unconscious, or may have been poisoned, call now. Don’t wait for an app.</p>
      </header>
      <Helplines keys={['emergency', 'ambulance', 'poison', 'mental', 'childline', 'gas']} />
      <section className="card p-4">
        <h2 className="font-semibold text-ink">When you call, tell them</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-ink">
          <li>Where you are: address and a nearby landmark</li>
          <li>What happened and when</li>
          <li>The person’s age and whether they are awake and breathing</li>
          <li>Any medicine, chemical or packet involved (keep it with you)</li>
        </ul>
      </section>
      <p className="text-sm text-muted">
        Numbers checked 26 Sep 2026: 112 (national emergency), 108 (ambulance in most states), AIIMS National Poisons Information Centre 1800 116 117, Tele-MANAS 14416, Childline
        1098, LPG emergency 1906. Local numbers may vary by state.
      </p>
    </div>
  );
}
