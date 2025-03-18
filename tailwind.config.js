module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      spacing: {
        'safe': 'max(env(safe-area-inset-top), 1rem)',
        'safe-bottom': 'max(env(safe-area-inset-bottom), 1rem)',
      },
    },
  },
  plugins: [],
};