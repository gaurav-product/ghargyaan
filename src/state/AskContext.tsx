import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { advance, applyAnswer, createSession } from '../engine/pipeline';
import type { ClarifyStep, PipelineOutput, Session } from '../engine/types';
import { track } from '../lib/analytics';
import { getProvider } from '../engine/llm';
import { useApp } from './AppContext';

export interface AttachedImage {
  dataUrl: string;
  name: string;
}

interface AskState {
  session: Session | null;
  output: PipelineOutput | null;
  loading: boolean;
  error: string | null;
  image: AttachedImage | null;
  inputMethod: 'text' | 'voice' | 'chip' | 'image';
  /** Previous (session, output) pairs so the user can step back through questions. */
  canGoBack: boolean;
  submit: (text: string, opts?: { method?: AskState['inputMethod']; image?: AttachedImage | null; imageContext?: string }) => Promise<void>;
  answer: (step: ClarifyStep, value: string) => Promise<void>;
  startGuide: (itemId: string, title: string) => Promise<void>;
  back: () => void;
  reset: () => void;
  setImage: (img: AttachedImage | null) => void;
}

const Ctx = createContext<AskState | null>(null);

export function AskProvider({ children }: { children: ReactNode }) {
  const { settings } = useApp();
  const [session, setSession] = useState<Session | null>(null);
  const [output, setOutput] = useState<PipelineOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<AttachedImage | null>(null);
  const [inputMethod, setInputMethod] = useState<AskState['inputMethod']>('text');
  const history = useRef<{ session: Session; output: PipelineOutput }[]>([]);
  const [canGoBack, setCanGoBack] = useState(false);

  const runAdvance = useCallback(
    async (s: Session) => {
      setLoading(true);
      setError(null);
      try {
        const provider = getProvider(settings.forceDemo);
        // Small minimum delay so the loading state is perceivable and not a flash.
        const [out] = await Promise.all([advance(s, { provider }), new Promise((r) => setTimeout(r, 250))]);
        setSession(s);
        setOutput(out);
        if (out.kind === 'result') {
          track('result_viewed', { item_id: out.item.id, category: out.item.category, safety: out.safety, intent: out.trace.intent, language: out.trace.language, mode: out.trace.mode, has_image: out.fromImage });
        } else if (out.kind === 'emergency') {
          track('safety_escalation', { escalation_type: out.selfHarm ? 'self_harm' : out.matches[0]?.id ?? 'answer_escalation', intent: out.trace.intent });
        }
        return out;
      } catch (e) {
        setError('Something went wrong while preparing your guide. Please try again.');
        console.error(e);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [settings.forceDemo],
  );

  const submit: AskState['submit'] = useCallback(
    async (text, opts = {}) => {
      const method = opts.method ?? 'text';
      setInputMethod(method);
      const img = opts.image !== undefined ? opts.image : image;
      history.current = [];
      setCanGoBack(false);
      track('input_submitted', { input_method: method, has_image: !!img });
      const s = createSession(text, { imageAttached: !!img, imageContext: opts.imageContext });
      await runAdvance(s);
    },
    [image, runAdvance],
  );

  const startGuide: AskState['startGuide'] = useCallback(
    async (itemId, title) => {
      history.current = [];
      setCanGoBack(false);
      setImage(null);
      const s = createSession(title);
      s.candidateId = itemId;
      await runAdvance(s);
    },
    [runAdvance],
  );

  const answer: AskState['answer'] = useCallback(
    async (step, value) => {
      if (!session || !output) return;
      history.current.push({ session, output });
      setCanGoBack(true);
      track('clarification_answered', { step: step.kind });
      await runAdvance(applyAnswer(session, step, value));
    },
    [session, output, runAdvance],
  );

  const back = useCallback(() => {
    const prev = history.current.pop();
    if (prev) {
      setSession(prev.session);
      setOutput(prev.output);
    }
    setCanGoBack(history.current.length > 0);
  }, []);

  const reset = useCallback(() => {
    history.current = [];
    setCanGoBack(false);
    setSession(null);
    setOutput(null);
    setError(null);
    setImage(null);
  }, []);

  return (
    <Ctx.Provider value={{ session, output, loading, error, image, inputMethod, canGoBack, submit, answer, startGuide, back, reset, setImage }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAsk(): AskState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAsk must be used inside AskProvider');
  return v;
}
