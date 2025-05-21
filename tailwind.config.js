/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f3f1ff',
          100: '#ebe5ff',
          200: '#d9ceff',
          300: '#bda4ff',
          400: '#9f75ff',
          500: '#8344ff',
          600: '#7122ff',
          700: '#6010ef',
          800: '#5211c7',
          900: '#42119d',
          950: '#280a67',
        },
        secondary: {
          50: '#f2fbf9',
          100: '#d3f4ee',
          200: '#a7e7dd',
          300: '#74d4c6',
          400: '#3db9a9',
          500: '#29a091',
          600: '#1d7d72',
          700: '#1b645c',
          800: '#1a504a',
          900: '#193e3a',
          950: '#0c2321',
        },
        accent: {
          50: '#fdf4e7',
          100: '#fbe8ce',
          200: '#f8cd9b',
          300: '#f4ac61',
          400: '#f18d34',
          500: '#ec6e15',
          600: '#dd4e0e',
          700: '#b6360f',
          800: '#922c14',
          900: '#762613',
          950: '#421107',
        },
        danger: '#d92525',
        success: '#2ab050',
        dark: '#1c1e22',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['"Cinzel Decorative"', 'serif'],
        fantasy: ['"Noto Sans JP"', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': "url('/images/background-pattern.png')",
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
    },
  },
  plugins: [],
} 