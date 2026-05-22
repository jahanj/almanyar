import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        vazir: ['Vazirmatn', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          500: '#667eea',
          600: '#5468d4',
          700: '#4c5cc0',
          800: '#3f4ba0',
          900: '#373f7d',
        },
      },
      boxShadow: {
        soft: '0 4px 24px -4px rgba(15, 23, 42, 0.08)',
        card: '0 1px 3px rgba(15, 23, 42, 0.06), 0 8px 24px -8px rgba(15, 23, 42, 0.1)',
        glow: '0 0 0 1px rgba(102, 126, 234, 0.15), 0 8px 32px -8px rgba(102, 126, 234, 0.25)',
      },
      backgroundImage: {
        'mesh-hero': 'radial-gradient(at 40% 20%, rgba(102, 126, 234, 0.12) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(118, 75, 162, 0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(102, 126, 234, 0.08) 0px, transparent 50%)',
        'grid-pattern': 'linear-gradient(to right, rgba(148, 163, 184, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.08) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '48px 48px',
      },
      animation: {
        'flag-wave': 'flagWave 10s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 2s infinite',
      },
      keyframes: {
        flagWave: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '25%': { backgroundPosition: '100% 50%' },
          '50%': { backgroundPosition: '0% 100%' },
          '75%': { backgroundPosition: '100% 0%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
