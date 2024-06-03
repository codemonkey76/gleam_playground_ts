/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        normal: ["Outfit"],
        title: ["Lexend"],
        code: ["JetBrainsMonoNerdFont", "monospace"],
      },
      colors: {
        dark: "#1e1e1e",
        light: "#fefefc",
        gleam: "rgb(255, 175, 243)",
        "underwater-blue": "#292d3e",
      },
    },
  },
  plugins: [],
};
