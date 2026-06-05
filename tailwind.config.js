module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-playfair)', '"Playfair Display"', 'serif'],
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
        jakarta: ['var(--font-jakarta)', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        primary: '#C68B59',
        'background-light': '#f8f6f7',
        'background-dark': '#211118',
        'surface-light': '#ffffff',
        'surface-dark': '#2d1b24',
        'text-main-light': '#181114',
        'text-main-dark': '#f4f0f2',
        'text-sec-light': '#886372',
        'text-sec-dark': '#bfafb6',
        brand: {
          bg: '#F9F5F1',
          dark: '#1A1A1A',
          accent: '#C68B59',
          gray: '#666666',
          light: '#FFFFFF',
        },
        skeleton: {
          base: '#e8e4e1',
          highlight: '#f5f2ef',
          'dark-base': '#3d2d34',
          'dark-highlight': '#4a3a42',
        },
      },
      boxShadow: {
        soft: '0 20px 40px -10px rgba(0, 0, 0, 0.05)',
        card: '0 4px 20px rgba(0, 0, 0, 0.03)',
      },
      borderRadius: {
        xl: '20px',
        '2xl': '24px',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        shimmer: 'shimmer 2s ease-in-out infinite',
        pulse: 'pulse 2s ease-in-out infinite',
        'skeleton-wave': 'skeletonWave 2.5s ease-in-out infinite',
        'skeleton-pulse-smooth': 'skeletonPulseSmooth 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        skeletonWave: {
          '0%': { backgroundPosition: '-100% 0', opacity: '0.8' },
          '50%': { opacity: '1' },
          '100%': { backgroundPosition: '100% 0', opacity: '0.8' },
        },
        skeletonPulseSmooth: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
};
