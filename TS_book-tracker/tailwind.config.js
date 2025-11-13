/** @type {import('tailwindcss').Config} */
module.exports = { // Utilisez `module.exports` pour Tailwind v3 (CommonJS)
  content: [
    "./views/**/*.pug", // Indique à Tailwind de scanner tous les fichiers Pug dans le dossier views
    "./src/**/*.ts" // Pour scanner les classes Tailwind utilisées directement dans le TS si applicable
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}