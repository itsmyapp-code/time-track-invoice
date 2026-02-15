/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // This tells Tailwind to look in your src folder for JS/JSX/TS/TSX files
    "./public/index.html",      // Also good to include your main HTML file
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

