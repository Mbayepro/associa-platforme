import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs pilotées par les variables CSS injectées dynamiquement
        // depuis organizations.color_primary / color_secondary (voir globals.css)
        brand: {
          primary: 'rgb(var(--brand-primary) / <alpha-value>)',
          secondary: 'rgb(var(--brand-secondary) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
