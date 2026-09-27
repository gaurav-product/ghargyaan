/** Wordmark: a small roof-shaped tile holding "ज्ञ" (gya, from gyaan). */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className="shrink-0">
      <path d="M20 3 L37 15 V35 a2 2 0 0 1 -2 2 H5 a2 2 0 0 1 -2 -2 V15 Z" fill="rgb(var(--c-primary))" />
      <path d="M20 3 L37 15" stroke="rgb(var(--c-haldi))" strokeWidth="2.5" strokeLinecap="round" />
      <text
        x="20"
        y="31"
        textAnchor="middle"
        fontFamily="'Tiro Devanagari Hindi', 'Noto Serif Devanagari', serif"
        fontSize="17"
        fill="rgb(var(--c-on-primary))"
      >
        ज्ञ
      </text>
    </svg>
  );
}

export function Wordmark({ small = false }: { small?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark size={small ? 28 : 34} />
      <span className={`font-display leading-none text-ink ${small ? 'text-lg' : 'text-xl'}`}>
        Ghar<span className="text-primary">Gyaan</span>
      </span>
    </span>
  );
}
