module.exports = {
  content: [
    "./frontend/src/**/*.{html,js,css}", // Adjust this to match your file structure
    "./backend/**/*.php", // Include PHP files if Tailwind classes are dynamically rendered],
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          100: "#fffaf0",
          200: "#feebc8",
          300: "#fbd38d",
          400: "#f6ad55",
          500: "#ed8936",
          600: "#ff9b00",
          700: "#ff8e00",
          800: "#ff8200",
          900: "#ff6b00",
        },
        accent: {
          100: "#fff5f5",
          200: "#fed7d7",
          300: "#feb2b2",
          400: "#fc8181",
          500: "#f56565",
          600: "#e53e3e",
          700: "#c53030",
          800: "#9b2c2c",
          900: "#742a2a",
        },
      },
      animation: {
        "bounce-slow": "bounceSlow 1.5s ease-in-out infinite alternate",
      },
      keyframes: {
        bounceSlow: {
          "0%": { transform: "translateY(-5%)" },
          "50%": {
            transform: "translateY(5%)",
          },
          "100%": {
            transform: "translateY(0)",
            backgroundColor: "theme(colors.primary.700)",
          },
        },
      },
      boxShadow: {
        dark: "0 2px 5px rgba(0, 0, 0, 0.1)",
        light: "0 3px 5px rgba(255, 255, 255, 0.3)",
      },
    },
  },
  variants: {
    extend: {
      boxShadow: ["hover"],
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
