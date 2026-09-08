/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['selector', '[data-theme="night"], .dark'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        zen: {
          bg: '#FAF9F6',
          paper: '#FFFFFF',
          dark: '#18181B',
          ink: '#09090B',
          accent: '#A16207',
          stone: '#71717A',
          amber: '#F59E0B',
        },
      },
      fontFamily: {
        serif: ['"Songti SC"', '"STSong"', '"SimSun"', '"Source Han Serif SC"', '"Noto Serif SC"', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"PingFang SC"', '"Microsoft YaHei"', '"Noto Sans SC"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
