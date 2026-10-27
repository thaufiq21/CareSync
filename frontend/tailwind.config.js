/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#123047',
          50: '#e8eef4',
          100: '#c5d4e2',
          500: '#123047',
          700: '#0c2036',
          900: '#071524',
        },
        teal: {
          DEFAULT: '#0D9488',
          50: '#CCFBF1',
          100: '#99F6E4',
          500: '#0D9488',
          600: '#0f766e',
          700: '#115e59',
        },
        background: '#F7FAFC',
        'text-primary': '#172B3A',
        'text-secondary': '#526777',
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Noto Sans Tamil',
          'sans-serif',
        ],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(18,48,71,0.08), 0 1px 2px 0 rgba(18,48,71,0.06)',
        'card-hover': '0 4px 6px -1px rgba(18,48,71,0.1), 0 2px 4px -1px rgba(18,48,71,0.08)',
      },
    },
  },
  plugins: [],
}
