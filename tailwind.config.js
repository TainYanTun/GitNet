/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/renderer/**/*.{js,ts,jsx,tsx,html}",
    "./src/renderer/index.html",
  ],
  theme: {
    extend: {
      colors: {
        // Git commit type colors (color-blind friendly)
        commit: {
          feat: '#10b981',      // green
          fix: '#ef4444',       // red
          docs: '#3b82f6',      // blue
          style: '#8b5cf6',     // purple
          refactor: '#f59e0b',  // amber
          perf: '#06b6d4',      // cyan
          test: '#84cc16',      // lime
          chore: '#6b7280',     // gray
          other: '#9ca3af',     // light gray
        },
        // Branch colors (Railway-style lanes)
        branch: {
          main: '#1f2937',      // dark gray
          develop: '#059669',   // emerald
          feature: '#2563eb',   // blue
          release: '#dc2626',   // red
          hotfix: '#ea580c',    // orange
          custom: '#7c3aed',    // violet
        },
        // UI colors
        background: {
          primary: '#ffffff',
          secondary: '#f9fafb',
          tertiary: '#f3f4f6',
        },
        text: {
          primary: '#111827',
          secondary: '#4b5563',
          tertiary: '#9ca3af',
        },
        border: {
          light: '#e5e7eb',
          medium: '#d1d5db',
          dark: '#9ca3af',
        }
      },
      fontFamily: {
        mono: ['SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      boxShadow: {
        'soft': '0 2px 8px 0 rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 12px 0 rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
  darkMode: 'class',
}
