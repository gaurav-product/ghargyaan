/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        ground: v('ground'),
        surface: v('surface'),
        sunken: v('sunken'),
        line: v('line'),
        ink: v('ink'),
        muted: v('muted'),
        primary: v('primary'),
        'on-primary': v('on-primary'),
        haldi: v('haldi'),
        science: v('science'),
        ok: v('ok'),
        okbg: v('okbg'),
        limited: v('limited'),
        limitedbg: v('limitedbg'),
        trad: v('trad'),
        tradbg: v('tradbg'),
        danger: v('danger'),
        dangerbg: v('dangerbg'),
      },
      fontFamily: {
        display: ['"Tiro Devanagari Hindi"', 'Georgia', '"Noto Serif Devanagari"', 'serif'],
        sans: ['Mukta', '"Noto Sans Devanagari"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        // A deliberate, limited scale (1.2 ratio from 16px)
        xs: ['0.75rem', { lineHeight: '1.1rem' }],
        sm: ['0.875rem', { lineHeight: '1.35rem' }],
        base: ['1rem', { lineHeight: '1.6rem' }],
        lg: ['1.2rem', { lineHeight: '1.75rem' }],
        xl: ['1.44rem', { lineHeight: '1.95rem' }],
        '2xl': ['1.73rem', { lineHeight: '2.2rem' }],
        '3xl': ['2.07rem', { lineHeight: '2.5rem' }],
        '4xl': ['2.6rem', { lineHeight: '3rem' }],
      },
      borderRadius: {
        card: '14px',
      },
      maxWidth: {
        app: '40rem',
      },
    },
  },
  plugins: [],
};
