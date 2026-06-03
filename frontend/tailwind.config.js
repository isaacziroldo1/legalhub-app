/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/views/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        legalhub: {
          primary: "#4A9FD8",
          dark: "#0A0A0A",
          accent: "#B3D9F0",
          success: "#DFE6E1",
          successText: "#004D1A",
          warning: "#E9E3D8",
          warningText: "#804200",
          error: "#E5DCDA",
          errorText: "#8C1C00",
        },
      },
    },
  },
  plugins: [],
}
