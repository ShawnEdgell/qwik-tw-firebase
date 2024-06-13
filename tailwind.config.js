/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  daisyui: {
    themes: ["dracula"],
  },
  plugins: [require("daisyui"), require("@tailwindcss/typography")],
};
