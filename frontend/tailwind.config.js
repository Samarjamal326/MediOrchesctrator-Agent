/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f4f7f5',
          100: '#e5ece7',
          200: '#cbd8cf',
          300: '#a5bdae',
          400: '#7b9d88',
          500: '#5a8169',
          600: '#466753',
          700: '#385243',
          800: '#2f4337',
          900: '#27382f',
          950: '#141e19',
        },
        slatewarm: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#080d1a',
        },
        terracotta: {
          50: '#fdf6f3',
          100: '#fbebe4',
          200: '#f7d6c8',
          300: '#f0b59e',
          400: '#e6896c',
          500: '#d76442',
          600: '#c54e2f',
          700: '#a43d24',
          800: '#873521',
          900: '#713020',
        },
        ochre: {
          50: '#fefbf3',
          100: '#fbf4e2',
          200: '#f7e7c1',
          300: '#f1d394',
          400: '#e9ba63',
          500: '#dfa13d',
          600: '#c6832e',
          700: '#9f6126',
          800: '#814d25',
          900: '#6d4023',
        }
      },
      fontFamily: {
        serif: ['"Fraunces"', 'Charter', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
        'elevated': '0 8px 30px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.03)',
        'dark-elevated': '0 8px 30px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.2)',
      }
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
