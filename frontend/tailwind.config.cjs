/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#007BFF',
        secondary: '#F8F9FA',
        accent: '#28A745',
        'text-dark': '#212529',
        'text-light': '#F8F9FA',
        'bg-dark': '#212529',
        'bg-light': '#F8F9FA',
      },
    },
  },
  plugins: [],
}