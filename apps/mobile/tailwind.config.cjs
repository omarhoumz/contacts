/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.ts",
    "./app-view.tsx",
    "./contacts-section.tsx",
    "./sign-in-screen.tsx",
    "./sign-up-screen.tsx",
    "./contact-editor-screen.tsx",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
