/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ios: {
          bg: {
            light: '#F2F2F7', // System Gray 6 Light
            dark: '#000000',  // Pure Black
          },
          card: {
            light: '#FFFFFF', // Pure White
            dark: '#1C1C1E',  // System Gray 6 Dark
          },
          surface: {
            light: '#FFFFFF',
            dark: '#2C2C2E',  // System Gray 5 Dark
          },
          separator: {
            light: '#C6C6C8', // System Gray 3 Light
            dark: '#38383A',  // System Gray 3 Dark
          },
          label: {
            primary: {
              light: '#000000',
              dark: '#FFFFFF',
            },
            secondary: {
              light: 'rgba(60, 60, 67, 0.6)', // Label Secondary Light
              dark: 'rgba(235, 235, 245, 0.6)', // Label Secondary Dark
            },
            tertiary: {
              light: 'rgba(60, 60, 67, 0.3)',
              dark: 'rgba(235, 235, 245, 0.3)',
            }
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
