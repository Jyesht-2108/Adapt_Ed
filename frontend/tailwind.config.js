/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#007bff',
          dark: '#0056b3',
        },
        success: '#4CAF50',
        warning: '#ff9800',
        error: '#dc3545',
      },
    },
  },
  plugins: [],
}
