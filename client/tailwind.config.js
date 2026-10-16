/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          bg: '#FAF9F6',
          card: '#FFFFFF',
          border: '#E7E5E4',
          subtle: '#F5F5F4',
        },
        ink: {
          primary: '#111827',
          secondary: '#4B5563',
          muted: '#9CA3AF',
        },
        status: {
          expired: {
            bg: '#FEF2F2',
            border: '#FCA5A5',
            text: '#991B1B',
            dot: '#DC2626',
          },
          critical: {
            bg: '#FFF7ED',
            border: '#FDBA74',
            text: '#C2410C',
            dot: '#EA580C',
          },
          urgent: {
            bg: '#FFFBEB',
            border: '#FCD34D',
            text: '#92400E',
            dot: '#D97706',
          },
          good: {
            bg: '#ECFDF5',
            border: '#6EE7B7',
            text: '#065F46',
            dot: '#059669',
          },
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        'paper-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        'paper-md': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'paper-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}
