import { useEffect, useId, useRef, useState } from 'react';
import { ArrowRight, Camera, ImageOff, Loader2, Mic, MicOff, X } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { useAsk } from '../state/AskContext';
import { startListening, speechInputSupported, type VoiceError, type VoiceSession } from '../lib/speech';
import { IMAGE_CONTEXT_OPTIONS, prepareImage, validateImage, type ImageError } from '../lib/image';
import { track } from '../lib/analytics';
import { getProvider } from '../engine/llm';
import { validateOutput } from '../engine/outputSafety';

const VOICE_MSG: Record<VoiceError, string> = {
  unsupported: 'Voice input isn’t available in this browser. You can type instead, or use your keyboard’s microphone button.',
  denied: 'Microphone access was blocked. Allow the microphone in your browser settings, or type instead.',
  no_speech: 'We didn’t hear anything. Tap the mic and try again, or type instead.',
  network: 'Voice recognition needs a network connection. Please type instead.',
  other: 'Voice input stopped unexpectedly. Please try again or type instead.',
};

const IMG_MSG: Record<ImageError, string> = {
  not_image: 'That file isn’t an image. Please choose a photo (JPG, PNG or HEIC).',
  too_large: 'That photo is larger than 10 MB. Please choose a smaller one.',
  unreadable: 'We couldn’t open that photo. Please try a different one.',
};

export function AskBox({ onSubmitted, autoFocus = false }: { onSubmitted?: () => void; autoFocus?: boolean }) {
  const { t, settings, isLive } = useApp();
  const { submit, image, setImage, loading } = useAsk();
  const [text, setText] = useState('');
  const [listening, setListening] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [imgBusy, setImgBusy] = useState(false);
  const [imgContext, setImgContext] = useState<string | null>(null);
  const voice = useRef<VoiceSession | null>(null);
  const usedVoice = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const noticeId = useId();
  const labelId = useId();

  useEffect(() => () => voice.current?.stop(), []);
  useEffect(() => {
    if (autoFocus) areaRef.current?.focus({ preventScroll: true });
  }, [autoFocus]);

  const toggleVoice = () => {
    setNotice(null);
    if (listening) {
      voice.current?.stop();
      return;
    }
    if (!speechInputSupported()) {
      setNotice(VOICE_MSG.unsupported);
      return;
    }
    track('voice_started', { language: settings.lang });
    setListening(true);
    voice.current = startListening(settings.lang === 'hi' ? 'hi-IN' : 'en-IN', {
      onPartial: (t) => setText(t),
      onFinal: (t) => {
        usedVoice.current = true;
        setText(t);
      },
      onError: (e) => {
        setNotice(VOICE_MSG[e]);
        setListening(false);
      },
      onEnd: () => setListening(false),
    });
    if (!voice.current) setListening(false);
  };

  const onFile = async (f: File | undefined) => {
    setNotice(null);
    if (!f) return;
    const err = validateImage(f);
    if (err) {
      setNotice(IMG_MSG[err]);
      return;
    }
    setImgBusy(true);
    try {
      const { dataUrl } = await prepareImage(f);
      setImage({ dataUrl, name: f.name });
      setImgContext(null);
      track('image_uploaded', { mode: isLive ? 'live' : 'demo' });
    } catch {
      setNotice(IMG_MSG.unreadable);
    } finally {
      setImgBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const go = async () => {
    setNotice(null);
    const q = text.trim();
    if (!q && !image) {
      setNotice('Tell us what happened, or add a photo, to get started.');
      areaRef.current?.focus();
      return;
    }
    if (image && !q && !imgContext) {
      setNotice('Please tell us what the photo shows, or describe it in a few words.');
      return;
    }
    let context = imgContext ?? undefined;
    if (image && isLive) {
      // Live mode: a vision model may describe visible context. Never a diagnosis;
      // the description is validated and only used to help find the right guide.
      try {
        const desc = await getProvider(false).describeImage?.(image.dataUrl);
        if (desc && validateOutput(desc).ok) context = [context, desc].filter(Boolean).join('. ');
      } catch {
        /* fall back to the user's own description */
      }
    }
    const query = q || (context ? `Photo of ${context}` : '');
    await submit(query, { method: image ? 'image' : usedVoice.current ? 'voice' : 'text', image, imageContext: q ? context : undefined });
    onSubmitted?.();
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void go();
      }}
      className="card p-3 shadow-[0_1px_0_rgb(var(--c-line)),0_8px_24px_-16px_rgb(var(--c-ink)/0.35)]"
      aria-labelledby={labelId}
    >
      <label htmlFor="ask-input" id={labelId} className="sr-only">
        {t('whatHappened')}
      </label>
      <textarea
        id="ask-input"
        ref={areaRef}
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, 1000))}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            void go();
          }
        }}
        rows={3}
        maxLength={1000}
        placeholder={t('askPlaceholder')}
        aria-describedby={notice ? noticeId : undefined}
        className="block w-full resize-none rounded-lg bg-transparent px-2 py-1.5 text-lg leading-relaxed text-ink placeholder:text-muted/80 focus:outline-none"
      />

      {image && (
        <div className="mt-2 rounded-lg border border-line bg-sunken p-2.5">
          <div className="flex items-start gap-3">
            <img src={image.dataUrl} alt="Your attached photo" className="h-16 w-16 rounded-md object-cover" />
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-semibold text-ink">Photo added</p>
              <p className="text-muted">
                I can’t reliably identify a medical condition from a photo alone. It stays on your device{isLive ? ' unless live AI is on' : ''}.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setImage(null);
                setImgContext(null);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-ink"
              aria-label="Remove photo"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <fieldset className="mt-2.5">
            <legend className="mb-1.5 text-sm font-semibold text-ink">What does the photo show?</legend>
            <div className="flex flex-wrap gap-1.5">
              {IMAGE_CONTEXT_OPTIONS.map((o) => (
                <button
                  type="button"
                  key={o.value}
                  aria-pressed={imgContext === o.value}
                  onClick={() => setImgContext(o.value)}
                  className={`min-h-[40px] rounded-full border px-3 text-sm font-medium ${
                    imgContext === o.value ? 'border-primary bg-primary text-on-primary' : 'border-line bg-surface text-ink hover:bg-sunken'
                  }`}
                >
                  {settings.lang === 'hi' ? o.label_hi : o.label}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      )}

      {notice && (
        <p id={noticeId} role="status" className="mt-2 flex items-start gap-2 rounded-lg bg-limitedbg px-3 py-2 text-sm text-ink">
          {notice.includes('Microphone') || notice.includes('Voice') ? <MicOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> : notice.includes('photo') ? <ImageOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> : null}
          {notice}
        </p>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={toggleVoice}
          aria-pressed={listening}
          className={`btn min-h-[44px] px-4 text-sm ${listening ? 'bg-dangerbg text-danger' : 'bg-sunken text-ink hover:bg-line/60'}`}
        >
          {listening ? <MicOff className="h-4 w-4" aria-hidden="true" /> : <Mic className="h-4 w-4" aria-hidden="true" />}
          {listening ? t('listening') : t('speak')}
        </button>
        <button type="button" onClick={() => fileRef.current?.click()} className="btn min-h-[44px] bg-sunken px-4 text-sm text-ink hover:bg-line/60" disabled={imgBusy}>
          {imgBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Camera className="h-4 w-4" aria-hidden="true" />}
          {t('showMe')}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => void onFile(e.target.files?.[0])}
        />
        <button type="submit" className="btn-primary ml-auto min-h-[44px] px-5 text-sm" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {t('ask')}
          {!loading && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
    </form>
  );
}
