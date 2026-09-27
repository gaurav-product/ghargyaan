import { Link } from 'react-router-dom';
import { ArrowRight, BookCheck, Lock, MessageSquareText, Mic, Camera, ShieldAlert, Stethoscope, ListChecks } from 'lucide-react';
import { Wordmark } from '../components/Logo';
import { EvidenceBadge, EvidenceLadder, SafetyBadge } from '../components/Badges';
import { KNOWLEDGE } from '../kb';

const ASKS = [
  '“Mere haath par halka sa cut lag gaya.”',
  '“Gala kharab hai, 2 din se.”',
  '“Bacche ko mosquito bite ho gaya.”',
  '“Dadi says put toothpaste on a burn. Is this correct?”',
  '“Haldi ka daag on my white kurta.”',
  '“Loo lag gayi, chakkar aa raha hai.”',
];

const FAQ = [
  {
    q: 'Is GharGyaan a doctor?',
    a: 'No. It gives general, sourced information for common, low-risk situations and tells you when to get professional help. It does not diagnose, prescribe, or give medicine doses.',
  },
  {
    q: 'Where does the advice come from?',
    a: 'From a small, structured set of guides. Health guidance is drawn from public health bodies such as the NHS, WHO, NIH (NCCIH) and professional societies. Each guide shows its sources, evidence level and review status. Anything we could not source is marked as needing review.',
  },
  {
    q: 'Does it use AI?',
    a: 'Optionally, and in a narrow way. The steps, warnings and red flags always come from the reviewed guides. When live AI is switched on, it only writes a short opening line and helps match unusual phrasing, and its output is checked for diagnosis, dosing and “cure” claims before you see it. Without AI keys, the full experience still works in demo mode.',
  },
  {
    q: 'Does it work in Hindi?',
    a: 'You can type or speak in English, Hindi or Hinglish, and the screens are available in Hindi. Guide text is in English in this first version, because medical translations need expert review before release.',
  },
  {
    q: 'What happens in an emergency?',
    a: 'Warning signs such as difficulty breathing, chest pain, severe bleeding, poisoning, or thoughts of self-harm are checked first, before anything else. GharGyaan then shows emergency numbers and the few safe things to do while help arrives, and no home remedies.',
  },
  {
    q: 'What do you store about me?',
    a: 'Nothing that identifies you. There are no accounts. Saved guides and settings stay on your device, and you can delete them anytime. We never sell or advertise on health information.',
  },
];

export function Landing() {
  const guides = KNOWLEDGE.length;
  const sourced = KNOWLEDGE.filter((k) => k.review_status !== 'needs_source').length;

  return (
    <div className="min-h-screen bg-ground">
      <header className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4">
        <Wordmark />
        <Link to="/app" className="btn-primary min-h-[44px] px-4 text-sm">
          Try GharGyaan
        </Link>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-5xl items-center gap-10 px-4 pb-14 pt-6 md:grid-cols-[1.1fr_1fr] md:pt-12">
          <div className="space-y-5">
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-haldi">Everyday self-care · Indian knowledge</p>
            <h1 className="font-display text-[2.6rem] leading-[1.05] text-ink sm:text-5xl">Everyday wisdom. Made useful.</h1>
            <p className="prose-gg text-lg text-ink">Practical, evidence-informed guidance for the everyday problems life throws at you.</p>
            <p className="prose-gg text-muted">
              Tell us what happened, in your own words. We’ll help you understand what you can safely do yourself, and when you shouldn’t.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link to="/app" className="btn-primary">
                Try GharGyaan <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link to="/wisdom" className="btn-quiet">
                Explore the wisdom
              </Link>
            </div>
          </div>

          {/* The product's thesis, shown not told: one tradition, checked. */}
          <figure className="card relative p-5 shadow-[0_20px_40px_-28px_rgb(var(--c-ink)/0.45)]" aria-label="Example answer">
            <p className="rounded-2xl rounded-tl-sm bg-sunken px-4 py-2.5 text-ink">Dadi bol rahi hain toothpaste burn par lagao. Is this correct?</p>
            <div className="mt-4 space-y-3">
              <p className="eyebrow">Myth check</p>
              <p className="font-display text-2xl leading-snug text-ink">Toothpaste on a burn</p>
              <div className="flex flex-wrap gap-2">
                <EvidenceBadge level="not_recommended" size="sm" />
                <SafetyBadge level="self_care" />
              </div>
              <p className="text-ink">
                Skip the toothpaste. Hold the burn under <strong>cool running water for 20 minutes</strong>, then cover it loosely.
              </p>
              <EvidenceLadder level="not_recommended" compact />
              <p className="font-mono text-xs text-muted">Source: NHS, Burns and scalds · checked 2026-09-26</p>
            </div>
          </figure>
        </section>

        {/* How it works */}
        <section className="border-y border-line bg-surface">
          <div className="mx-auto max-w-5xl px-4 py-12">
            <h2 className="font-display text-3xl text-ink">How it works</h2>
            <ol className="mt-6 grid gap-5 md:grid-cols-4">
              {[
                { Icon: MessageSquareText, t: 'Tell us what happened', d: 'Type, speak, or add a photo. Hinglish is fine.' },
                { Icon: ShieldAlert, t: 'Safety check first', d: 'Emergency warning signs are screened before anything else.' },
                { Icon: ListChecks, t: 'A few quick questions', d: 'Who it’s for, how long, and only the checks that change the advice.' },
                { Icon: BookCheck, t: 'A clear, sourced guide', d: 'What to do, what to avoid, what tradition says, and when to see a doctor.' },
              ].map((s, i) => (
                <li key={s.t} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted tabular-nums">Step {i + 1}</span>
                  </div>
                  <s.Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  <h3 className="font-semibold text-ink">{s.t}</h3>
                  <p className="text-sm text-muted">{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* What you can ask */}
        <section className="mx-auto max-w-5xl px-4 py-12">
          <h2 className="font-display text-3xl text-ink">What you can ask</h2>
          <p className="mt-2 max-w-[60ch] text-muted">
            Minor first aid, everyday discomfort, household problems, seasonal care, and the remedies your family swears by. {guides} guides in this first version.
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {ASKS.map((a) => (
              <li key={a} className="rounded-2xl rounded-tl-sm border border-line bg-surface px-4 py-2.5 text-ink">
                {a}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Mic className="h-4 w-4" aria-hidden="true" /> Voice in English or Hindi
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Camera className="h-4 w-4" aria-hidden="true" /> Photos for context, never diagnosis
            </span>
          </div>
        </section>

        {/* Wisdom + evidence */}
        <section className="border-y border-line bg-surface">
          <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 md:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl text-ink">Indian wisdom + modern evidence</h2>
              <p className="prose-gg mt-3 text-ink">
                Traditional knowledge is precious, and it isn’t automatically evidence-based. GharGyaan doesn’t mock a remedy, and it doesn’t present tradition as science. Every
                practice gets one of four plain labels.
              </p>
            </div>
            <div className="space-y-3">
              <EvidenceLadder />
              <p className="text-sm text-muted">
                A structured everyday self-care knowledge system that helps you tell useful traditional knowledge apart from unsafe or unsupported advice.
              </p>
            </div>
          </div>
        </section>

        {/* Safety, sources, privacy */}
        <section className="mx-auto grid max-w-5xl gap-8 px-4 py-12 md:grid-cols-3">
          <div className="space-y-2">
            <Stethoscope className="h-6 w-6 text-danger" aria-hidden="true" />
            <h2 className="font-display text-2xl text-ink">Safety first</h2>
            <p className="text-muted">
              No diagnosis. No prescriptions or doses. No home remedies for emergencies. Breathing trouble, chest pain, poisoning, serious burns, animal bites, warning signs in babies
              and thoughts of self-harm go straight to emergency help.
            </p>
          </div>
          <div className="space-y-2">
            <BookCheck className="h-6 w-6 text-science" aria-hidden="true" />
            <h2 className="font-display text-2xl text-ink">Sources you can open</h2>
            <p className="text-muted">
              {sourced} of {guides} guides cite a verified public-health or professional source; the rest are clearly marked “needs a verified source”. Tap “Why am I seeing this?” on any
              answer.
            </p>
          </div>
          <div className="space-y-2">
            <Lock className="h-6 w-6 text-primary" aria-hidden="true" />
            <h2 className="font-display text-2xl text-ink">Private by design</h2>
            <p className="text-muted">
              No account. No location. No advertising on health information, and no selling of data. Saved guides stay on your device.{' '}
              <Link to="/privacy" className="font-semibold text-primary underline underline-offset-2">
                Read the privacy notes
              </Link>
              .
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-line bg-surface">
          <div className="mx-auto max-w-3xl px-4 py-12">
            <h2 className="font-display text-3xl text-ink">Questions</h2>
            <div className="mt-5 divide-y divide-line border-y border-line">
              {FAQ.map((f) => (
                <details key={f.q} className="group py-1">
                  <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between gap-3 font-semibold text-ink">
                    {f.q}
                    <span aria-hidden="true" className="text-xl text-muted transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="prose-gg pb-4 text-ink">{f.a}</p>
                </details>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              <Link to="/app" className="btn-primary">
                Try GharGyaan <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link to="/emergency" className="btn-quiet">
                Emergency numbers
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-5xl px-4 py-8 text-sm text-muted">
        <p>
          GharGyaan is a prototype. It provides general information, not medical advice, and does not replace a doctor. In an emergency in India, call 112.
        </p>
      </footer>
    </div>
  );
}
