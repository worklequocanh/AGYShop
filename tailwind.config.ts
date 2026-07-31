import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:   "#111827",  /* gray-900  – main text */
        secondary: "#6B7280",  /* gray-500  – subtext   */
        accent:    "#2563EB",  /* blue-600  – CTA       */
        "accent-h":"#1D4ED8",  /* blue-700  – hover     */
        surface:   "#F9FAFB",  /* gray-50   – page bg   */
        card:      "#FFFFFF",
        border:    "#E5E7EB",  /* gray-200              */
        "border-s":"#D1D5DB",  /* gray-300  – strong    */
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to:   { opacity: "1", transform: "translateY(0)"    },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to:   { opacity: "1", transform: "scale(1)"    },
        },
      },
      animation: {
        "fade-up":  "fade-up 0.35s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in":  "fade-in 0.2s ease-out both",
        "scale-in": "scale-in 0.3s cubic-bezier(0.16,1,0.3,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
