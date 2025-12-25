/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/renderer/**/*.{js,ts,jsx,tsx,html}",
    "./src/renderer/index.html",
  ],
  theme: {
    extend: {
      colors: {
        // Zed-Inspired Palette (One Dark / One Light)

        // Git Semantic Colors (One Dark Pastel)
        commit: {
          feat: "#98c379", // green
          fix: "#e06c75", // red
          docs: "#61afef", // blue
          style: "#c678dd", // purple
          refactor: "#e5c07b", // yellow
          perf: "#56b6c2", // cyan
          test: "#d19a66", // orange
          chore: "#abb2bf", // gray
          other: "#5c6370", // muted
        },
        // Branch Colors
        branch: {
          main: "#abb2bf",
          develop: "#98c379",
          feature: "#61afef",
          release: "#e06c75",
          hotfix: "#d19a66",
          custom: "#c678dd",
        },
        // UI Palette
        // Usage: bg-zed-bg dark:bg-zed-dark-bg
        zed: {
          // Light Mode
          bg: "#ffffff",
          surface: "#f7f7f7",
          element: "#ebecf0",
          border: "#d1d5da",
          text: "#24292e",
          muted: "#6a737d",
          accent: "#3b82f6", // Blue

          // Dark Mode (One Dark)
          dark: {
            bg: "#181a1f", // Main background
            surface: "#21252b", // Panel/Sidebar
            element: "#282c34", // Hover/Input
            border: "#30363d", // Borders
            text: "#abb2bf", // Primary Text
            muted: "#636d83", // Secondary Text
            accent: "#61afef", // Blue
          },
        },
        // Legacy/Generic mappings for compatibility (using Light mode as default)
        background: {
          primary: "#ffffff",
          secondary: "#f7f7f7",
          tertiary: "#ebecf0",
        },
        text: {
          primary: "#24292e",
          secondary: "#6a737d",
          tertiary: "#959da5",
        },
        border: {
          light: "#d1d5da",
          medium: "#959da5",
          dark: "#444d56",
        },
      },
      fontFamily: {
        mono: [
          "SF Mono",
          "Monaco",
          "Inconsolata",
          "Roboto Mono",
          "Consolas",
          "monospace",
        ],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-in": "slideIn 0.2s ease-out",
        "pulse-soft": "pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
      boxShadow: {
        soft: "0 2px 8px 0 rgba(0, 0, 0, 0.08)",
        medium: "0 4px 12px 0 rgba(0, 0, 0, 0.12)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
  darkMode: "class",
};
