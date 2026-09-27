import { useNavigate, Link } from 'react-router-dom';
import { Bandage, Bug, Flame, HelpCircle, Moon, ShieldQuestion, Sparkles, Thermometer, Wind, ArrowRight } from 'lucide-react';
import { AskBox } from '../components/AskBox';
import { useApp } from '../state/AppContext';
import { useAsk } from '../state/AskContext';
import { track } from '../lib/analytics';
import { useEffect } from 'react';

const CHIPS = [
  { label: 'Minor injury', label_hi: 'छोटी चोट', q: 'I got a small cut on my hand', Icon: Bandage },
  { label: 'Cold / cough', label_hi: 'सर्दी / खांसी', q: 'Khansi ho rahi hai', Icon: Wind },
  { label: 'Small burn', label_hi: 'हल्का जलना', q: 'Haath jal gaya thoda', Icon: Flame },
  { label: 'Sore throat', label_hi: 'गले में खराश', q: 'Gala kharab hai', Icon: Thermometer },
  { label: 'Insect bite', label_hi: 'कीड़े का काटना', q: 'Mosquito bite is very itchy', Icon: Bug },
  { label: 'Poor sleep', label_hi: 'नींद की दिक़्क़त', q: 'Neend nahi aati raat ko', Icon: Moon },
];

const DEMOS = [
  { label: 'Sore throat', q: 'Mere gale mein pain hai' },
  { label: 'Minor burn', q: 'Mere pair mein chhota sa burn ho gaya' },
  { label: 'Small cut', q: 'Mere haath par halka sa cut lag gaya' },
  { label: 'Mosquito bite', q: 'Bacche ko mosquito bite ho gaya' },
  { label: 'Toothpaste on a burn?', q: 'Dadi bol rahi hain toothpaste burn par lagao. Is this correct?' },
  { label: 'Mild headache', q: 'Mujhe headache hai' },
  { label: 'Haldi stain', q: 'Haldi ka daag on my white kurta' },
];

const WISDOM = [
  { label: '“Dadi says…”', blurb: 'Check a family remedy against evidence', to: '/wisdom', Icon: Sparkles },
  { label: 'Is this actually safe?', blurb: 'Common myths, checked', to: '/wisdom#myths', Icon: ShieldQuestion },
  { label: 'How do I handle this?', blurb: 'Browse every guide', to: '/explore', Icon: HelpCircle },
];

export function Home() {
  const { t, settings, isLive } = useApp();
  const { submit, reset } = useAsk();
  const nav = useNavigate();
  const hi = settings.lang === 'hi';

  useEffect(() => {
    reset();
    track('search_started', { language: settings.lang });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const quick = async (q: string) => {
    nav('/ask');
    await submit(q, { method: 'chip', image: null });
  };

  return (
    <div className="space-y-8">
      <section className="space-y-4 pt-2">
        <p className="font-display text-lg text-muted">{t('tagline')}</p>
        <h1 className="font-display text-4xl leading-[1.1] text-ink">{t('whatHappened')}</h1>
        <AskBox onSubmitted={() => nav('/ask')} />
        <p className="text-sm text-muted">
          Type in English, Hindi or Hinglish. For emergencies, call <strong className="text-danger">112</strong>.
        </p>
      </section>

      <section aria-labelledby="common-title">
        <h2 id="common-title" className="eyebrow mb-3">
          {t('common')}
        </h2>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CHIPS.map((c) => (
            <li key={c.label}>
              <button type="button" onClick={() => void quick(c.q)} className="flex min-h-[56px] w-full items-center gap-3 rounded-card border border-line bg-surface px-3.5 py-3 text-left font-medium text-ink transition-colors hover:border-primary/50 hover:bg-sunken">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sunken text-primary">
                  <c.Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                {hi ? c.label_hi : c.label}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="wisdom-title" className="space-y-3">
        <h2 id="wisdom-title" className="eyebrow">
          {t('exploreWisdom')}
        </h2>
        <ul className="space-y-2">
          {WISDOM.map((w) => (
            <li key={w.label}>
              <Link to={w.to} className="flex min-h-[64px] items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 hover:bg-sunken">
                <w.Icon className="h-5 w-5 shrink-0 text-haldi" aria-hidden="true" />
                <span className="flex-1">
                  <span className="block font-display text-lg text-ink">{w.label}</span>
                  <span className="block text-sm text-muted">{w.blurb}</span>
                </span>
                <ArrowRight className="h-4 w-4 text-muted" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {!isLive && (
        <section aria-labelledby="demo-title" className="rounded-card border border-dashed border-line p-4">
          <div className="flex items-baseline justify-between gap-2">
            <h2 id="demo-title" className="font-semibold text-ink">
              Try the demo
            </h2>
            <span className="font-mono text-[0.68rem] uppercase tracking-wider text-muted">Demo mode · no AI keys</span>
          </div>
          <p className="mt-1 text-sm text-muted">Each example runs the full flow: safety check, questions, and a sourced guide.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {DEMOS.map((d) => (
              <button key={d.label} type="button" className="chip" onClick={() => void quick(d.q)}>
                {d.label}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
