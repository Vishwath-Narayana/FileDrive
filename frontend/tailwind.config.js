/** @type {import('tailwindcss').Config} */
export default {
  corePlugins: {
    preflight: false, // Disable Tailwind's CSS reset to avoid conflicts with Bootstrap
  },
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
