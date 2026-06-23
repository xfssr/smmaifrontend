/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: "#030407",
          deep: "#010203",
        },
        surface: {
          DEFAULT: "#080a0f",
          deep: "#050608",
          panel: "rgba(10, 12, 16, 0.45)",
          'panel-strong': "rgba(16, 20, 26, 0.55)",
        },
        "surface-1": "rgba(255, 255, 255, 0.05)",
        "surface-2": "rgba(255, 255, 255, 0.1)",
        orange: {
          DEFAULT: "#D88A3D",
          glow: "rgba(216, 138, 61, 0.15)",
          soft: "rgba(216, 138, 61, 0.16)",
          line: "rgba(216, 138, 61, 0.32)",
        },
        amber: {
          DEFAULT: "#ffcc00",
          glow: "rgba(255, 204, 0, 0.15)",
        },
        silver: "#eaeef6",
        muted: "#8b95a5",
        green: {
          DEFAULT: "#00ff88",
          glow: "rgba(0, 255, 136, 0.15)",
        },
        red: {
          DEFAULT: "#ff3344",
          glow: "rgba(255, 51, 68, 0.15)",
        },
        "neon-green": "#00ff88",
      },
      borderRadius: {
        '3xl': '28px',
        '4xl': '32px',
        '5xl': '40px',
      },
      boxShadow: {
        'premium': '0 30px 60px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
        'neon-green': '0 0 20px rgba(0, 255, 136, 0.2)',
        'neon-orange': '0 0 20px rgba(255, 102, 0, 0.2)',
        'shadow-sm': '0 4px 12px rgba(0, 0, 0, 0.4)',
        'shadow-md': '0 12px 30px rgba(0, 0, 0, 0.6)',
        'shadow-lg': '0 30px 80px rgba(0, 0, 0, 0.8)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
        'scan': 'scanLine 3s linear infinite',
        'pulse-soft': 'pulseSoft 2s infinite',
      },
      keyframes: {
        fadeInUp: {
          'from': { opacity: '0', transform: 'translateY(15px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        slideUp: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          'from': { opacity: '0', transform: 'scale(0.95)' },
          'to': { opacity: '1', transform: 'scale(1)' },
        },
        scanLine: {
          '0%': { top: '-10%', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { top: '110%', opacity: '0' },
        },
        pulseSoft: {
          '0%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(0, 255, 136, 0.4)' },
          '70%': { transform: 'scale(1.02)', boxShadow: '0 0 0 10px rgba(0, 255, 136, 0)' },
          '100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(0, 255, 136, 0)' },
        }
      }
    },
  },
  plugins: [],
};
