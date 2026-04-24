/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.ts", "./app-view.tsx", "./auth-section.tsx", "./contacts-section.tsx"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
