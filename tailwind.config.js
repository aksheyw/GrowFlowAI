/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        luxury: {
          paper: {
            light: '#FDFDFD', // Porcelain
            dark: '#000000',  // OLED Black
          },
          surface: {
            light: 'rgba(255, 255, 255, 0.8)',
            dark: 'rgba(18, 18, 18, 0.8)',
          },
          glass: {
            light: 'rgba(255, 255, 255, 0.7)',
            dark: 'rgba(0, 0, 0, 0.6)',
          },
          border: {
            light: 'rgba(0, 0, 0, 0.05)',
            dark: 'rgba(255, 255, 255, 0.1)',
          }
        }
      },
      spacing: {
        'safe': 'env(safe-area-inset-bottom)',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      padding: {
        'safe': 'env(safe-area-inset-bottom)',
        'safe-top': 'env(safe-area-inset-top)',
      },
    },
  },
  plugins: [],
};
