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
      // 站内多处已使用但从未定义的工具类（animate-fade-in / animate-in / animate-fade-up / scale-98 / scale-175 / bg-radial）
      scale: {
        98: '0.98',
        175: '1.75',
      },
      backgroundImage: {
        radial: 'radial-gradient(circle, var(--tw-gradient-stops))',
      },
      keyframes: {
        'zen-fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'zen-in': {
          from: { opacity: '0', transform: 'scale(0.98)' },
          to: { opacity: '1', transform: 'none' },
        },
        'zen-fade-up': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-44px)' },
        },
      },
      animation: {
        'fade-in': 'zen-fade-in 0.35s ease-out both',
        in: 'zen-in 0.3s ease-out both',
        'fade-up': 'zen-fade-up 1.1s ease-out forwards',
      },
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
