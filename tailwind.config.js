/** @type {import('tailwindcss').Config} */
module.exports = {
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
        serif: ['var(--font-noto-serif-sc)', '"Crimson Pro"', '"Songti SC"', '"STSong"', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', '"PingFang SC"', '"Microsoft YaHei"', '"Noto Sans SC"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
