/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    
    extend: {

    },
    
  },
  plugins: [require('tailwind-scrollbar-hide'),
    require('@tailwindcss/container-queries'),
  ]
}

