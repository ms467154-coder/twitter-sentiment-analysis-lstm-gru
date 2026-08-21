export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        night: '#050912',
        surface: '#091020',
        panel: '#10172a',
        border: 'rgba(255,255,255,0.08)',
        muted: 'rgba(255,255,255,0.64)',
        accent: '#4f7dff',
        accentSoft: 'rgba(79,125,255,0.12)',
      },
      boxShadow: {
        glow: '0 30px 100px rgba(20, 87, 255, 0.18)',
        soft: '0 20px 70px rgba(0, 0, 0, 0.18)',
        card: '0 24px 60px rgba(0, 0, 0, 0.14)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        hero: 'radial-gradient(circle at top, rgba(79,125,255,0.18), transparent 30%), radial-gradient(circle at 20% 10%, rgba(255,255,255,0.08), transparent 18%)',
      },
    },
  },
  plugins: [],
};
