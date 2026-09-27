import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { BookOpen, Bookmark, Compass, Home, Phone, UserRound } from 'lucide-react';
import { useEffect } from 'react';
import { Wordmark } from './Logo';
import { useApp } from '../state/AppContext';

export function AppShell() {
  const { t, settings, setSettings, isLive } = useApp();
  const { pathname } = useLocation();

  useEffect(() => {
    // Move to top on page change (keeps screen-reader + keyboard users oriented).
    window.scrollTo({ top: 0 });
  }, [pathname]);

  const nav = [
    { to: '/app', label: t('navHome'), Icon: Home, end: true },
    { to: '/explore', label: t('navExplore'), Icon: Compass },
    { to: '/wisdom', label: t('navWisdom'), Icon: BookOpen },
    { to: '/saved', label: t('navSaved'), Icon: Bookmark },
    { to: '/profile', label: t('navProfile'), Icon: UserRound },
  ];

  return (
    <div className="min-h-screen bg-ground">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-surface focus:px-4 focus:py-2">
        Skip to content
      </a>
      <header
        className="sticky z-30 border-b border-line bg-ground/95 backdrop-blur"
        style={{ top: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="mx-auto flex max-w-app items-center justify-between gap-3 px-4 py-2.5">
          <Link to="/app" aria-label="GharGyaan home" className="rounded-md">
            <Wordmark small />
          </Link>
          <div className="flex items-center gap-2">
            <span
              className={`hidden rounded-full border px-2.5 py-1 font-mono text-[0.68rem] uppercase tracking-wider sm:inline-flex ${
                isLive ? 'border-ok/40 text-ok' : 'border-line text-muted'
              }`}
              title={isLive ? 'Live AI framing enabled, answers still come from reviewed guides' : 'Works offline from reviewed guides; no AI keys needed'}
            >
              {isLive ? t('liveMode') : t('demoMode')}
            </span>
            <button
              type="button"
              onClick={() => setSettings({ lang: settings.lang === 'en' ? 'hi' : 'en' })}
              className="min-h-[40px] rounded-full border border-line bg-surface px-3 text-sm font-semibold text-ink hover:bg-sunken"
              aria-label={settings.lang === 'en' ? 'हिंदी में देखें' : 'Switch to English'}
            >
              {settings.lang === 'en' ? 'हिं' : 'EN'}
            </button>
            <Link
              to="/emergency"
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-dangerbg px-3 text-sm font-semibold text-danger hover:brightness-95"
            >
              <Phone aria-hidden="true" className="h-4 w-4" />
              <span>112</span>
              <span className="sr-only">Emergency numbers</span>
            </Link>
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-app px-4 pb-32 pt-4">
        <Outlet />
      </main>

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <ul className="mx-auto grid max-w-app grid-cols-5">
          {nav.map(({ to, label, Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex min-h-[60px] flex-col items-center justify-center gap-0.5 text-[0.72rem] font-medium transition-colors ${
                    isActive ? 'text-primary' : 'text-muted hover:text-ink'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`flex h-7 w-12 items-center justify-center rounded-full ${isActive ? 'bg-primary/12 bg-sunken' : ''}`}>
                      <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={isActive ? 2.4 : 1.8} />
                    </span>
                    {label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
