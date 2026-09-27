/**
 * Voice input (Web Speech API) and read-aloud (speechSynthesis).
 * Both are progressive enhancements: if unsupported or permission is denied,
 * the UI explains why and the text box keeps working.
 */
type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
};

function getCtor(): (new () => Recognition) | null {
  const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function speechInputSupported(): boolean {
  return typeof window !== 'undefined' && !!getCtor();
}

export type VoiceError = 'unsupported' | 'denied' | 'no_speech' | 'network' | 'other';

export interface VoiceSession {
  stop(): void;
}

export function startListening(
  lang: 'en-IN' | 'hi-IN',
  handlers: { onPartial: (t: string) => void; onFinal: (t: string) => void; onError: (e: VoiceError) => void; onEnd: () => void },
): VoiceSession | null {
  const Ctor = getCtor();
  if (!Ctor) {
    handlers.onError('unsupported');
    return null;
  }
  let rec: Recognition;
  try {
    rec = new Ctor();
  } catch {
    handlers.onError('unsupported');
    return null;
  }
  rec.lang = lang;
  rec.interimResults = true;
  rec.continuous = false;
  rec.maxAlternatives = 1;
  let finalText = '';
  rec.onresult = (e) => {
    let interim = '';
    for (let i = 0; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) finalText += r[0].transcript;
      else interim += r[0].transcript;
    }
    handlers.onPartial((finalText + ' ' + interim).trim());
  };
  rec.onerror = (e) => {
    const map: Record<string, VoiceError> = {
      'not-allowed': 'denied',
      'service-not-allowed': 'denied',
      'no-speech': 'no_speech',
      network: 'network',
    };
    handlers.onError(map[e.error] ?? 'other');
  };
  rec.onend = () => {
    if (finalText.trim()) handlers.onFinal(finalText.trim());
    handlers.onEnd();
  };
  try {
    rec.start();
  } catch {
    handlers.onError('denied');
    return null;
  }
  return { stop: () => rec.stop() };
}

export function ttsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speak(text: string, lang: 'en-IN' | 'hi-IN'): boolean {
  if (!ttsSupported()) return false;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
    return true;
  } catch {
    return false;
  }
}

export function stopSpeaking(): void {
  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* ignore */
  }
}
