/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        maroon: {
          50: "#fbeef0",
          100: "#f5d6db",
          200: "#e9adb6",
          300: "#d9808e",
          400: "#c45468",
          500: "#a3334a",
          600: "#7f1f36", // primary brand color
          700: "#66182b",
          800: "#4d1220",
          900: "#330c15",
        },
        cream: {
          50: "#fffdf9",
          100: "#fdf6e9",
          200: "#f8ecd2",
          300: "#f1ddb0",
          400: "#e6c988",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Arial", "Helvetica", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 10px rgba(79, 18, 32, 0.08)",
        "card-hover": "0 6px 20px rgba(79, 18, 32, 0.15)",
      },
    },
  },
  plugins: [],
};
