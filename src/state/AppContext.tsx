import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Lang, StringKey } from '../lib/i18n';
import { t as translate } from '../lib/i18n';
import { load, save, clearAll } from '../lib/storage';
import { clearEvents, track } from '../lib/analytics';
import { liveAvailable } from '../engine/llm';

export type Theme = 'system' | 'light' | 'dark';

export interface Settings {
  lang: Lang;
  theme: Theme;
  /** When true, never call live AI even if configured. */
  forceDemo: boolean;
}

interface FeedbackEntry {
  itemId: string;
  helpful: boolean;
  missing?: string;
  at: string;
}

interface AppState {
  settings: Settings;
  setSettings: (s: Partial<Settings>) => void;
  t: (k: StringKey) => string;
  saved: string[];
  isSaved: (id: string) => boolean;
  toggleSave: (id: string) => void;
  feedback: FeedbackEntry[];
  addFeedback: (f: Omit<FeedbackEntry, 'at'>) => void;
  deleteAllData: () => void;
  liveConfigured: boolean;
  isLive: boolean;
}

const Ctx = createContext<AppState | null>(null);

const DEFAULTS: Settings = { lang: 'en', theme: 'system', forceDemo: false };

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<Settings>(() => ({ ...DEFAULTS, ...load<Partial<Settings>>('settings', {}) }));
  const [saved, setSaved] = useState<string[]>(() => load<string[]>('saved', []));
  const [feedback, setFeedback] = useState<FeedbackEntry[]>(() => load<FeedbackEntry[]>('feedback', []));
  const liveConfigured = liveAvailable();

  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', settings.theme);
    root.lang = settings.lang === 'hi' ? 'hi' : 'en-IN';
  }, [settings.theme, settings.lang]);

  const setSettings = useCallback((s: Partial<Settings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...s };
      save('settings', next);
      return next;
    });
  }, []);

  const toggleSave = useCallback((id: string) => {
    setSaved((prev) => {
      const has = prev.includes(id);
      const next = has ? prev.filter((x) => x !== id) : [id, ...prev];
      save('saved', next);
      if (!has) track('recommendation_saved', { item_id: id });
      return next;
    });
  }, []);

  const addFeedback = useCallback((f: Omit<FeedbackEntry, 'at'>) => {
    setFeedback((prev) => {
      const next = [...prev, { ...f, at: new Date().toISOString() }].slice(-100);
      save('feedback', next);
      return next;
    });
  }, []);

  const deleteAllData = useCallback(() => {
    clearAll();
    clearEvents();
    setSaved([]);
    setFeedback([]);
    setSettingsState(DEFAULTS);
  }, []);

  const value = useMemo<AppState>(
    () => ({
      settings,
      setSettings,
      t: (k) => translate(k, settings.lang),
      saved,
      isSaved: (id) => saved.includes(id),
      toggleSave,
      feedback,
      addFeedback,
      deleteAllData,
      liveConfigured,
      isLive: liveConfigured && !settings.forceDemo,
    }),
    [settings, setSettings, saved, toggleSave, feedback, addFeedback, deleteAllData, liveConfigured],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside AppProvider');
  return v;
}
