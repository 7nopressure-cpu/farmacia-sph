/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0B2B64',
          'navy-dark': '#001E49',
          'navy-light': '#163E82',
          cyan: '#00A3E0',
          'cyan-hover': '#008EC4',
          'cyan-light': '#EBF7FC',
          clinical: '#F4F6F8',
          border: '#E2E8F0',
          emerald: '#10B981',
          'emerald-light': '#ECFDF5',
          urgency: '#EF4444',
          'urgency-light': '#FEF2F2',
          warning: '#F59E0B',
          'warning-light': '#FFFBEB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px -2px rgba(11, 43, 100, 0.08), 0 1px 4px -1px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 12px 24px -6px rgba(11, 43, 100, 0.15), 0 4px 8px -2px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
};
