/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: { extend: {
    colors: { ink: '#030b2c', muted: '#596990', brand: '#0860ff' },
    fontFamily: {
      regular: ['Inter_400Regular'],
      semibold: ['Inter_600SemiBold'], bold: ['Inter_700Bold'], display: ['Inter_800ExtraBold'],
    },
  } },
  plugins: [],
};
