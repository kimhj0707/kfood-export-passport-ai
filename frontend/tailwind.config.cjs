/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // 다크모드 클래스 기반으로 활성화
  content: [
    "./index.html",
    "./*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx,svg}",
    "./contexts/**/*.{ts,tsx}",
    "./services/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--color-background) / <alpha-value>)',
        'text-primary': 'rgb(var(--color-text-primary) / <alpha-value>)',
        'text-secondary': 'rgb(var(--color-text-secondary) / <alpha-value>)',
        'text-muted': 'rgb(var(--color-text-muted) / <alpha-value>)',
        
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          hover: 'rgb(var(--color-primary-hover) / <alpha-value>)',
        },
        
        card: {
          DEFAULT: 'rgb(var(--color-card-background) / <alpha-value>)',
          border: 'rgb(var(--color-card-border) / <alpha-value>)',
          'sub-bg': 'rgb(var(--color-card-sub-bg) / <alpha-value>)',
        },
      },
      boxShadowColor: {
        DEFAULT: 'rgb(var(--shadow-color) / 0.1)',
      }
    },
  },
  plugins: [],
}