/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {

    extend: {
      backgroundImage: {
        'custom-radial': `linear-gradient(135deg, rgba(199, 210, 254, 0.4) 0%, rgba(251, 207, 232, 0.4) 25%, rgba(187, 247, 208, 0.4) 50%, rgba(191, 219, 254, 0.4) 75%, rgba(199, 210, 254, 0.4) 100%) `,
        'dark-radial': `linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.15) 25%, rgba(34, 197, 94, 0.15) 50%, rgba(59, 130, 246, 0.15) 75%, rgba(139, 92, 246, 0.15) 100%)`,
      'grand-dark':'radial-gradient(ellipse at 20% 30%, rgba(139, 92, 246, 0.3) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(236, 72, 153, 0.3) 0%, transparent 50%), radial-gradient(ellipse at 50% 90%, rgba(34, 197, 94, 0.2) 0%, transparent 50%)',


      'grand':'radial-gradient(ellipse at 20% 30%, rgba(199, 210, 254, 0.5) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(251, 207, 232, 0.5) 0%, transparent 50%), radial-gradient(ellipse at 50% 90%, rgba(187, 247, 208, 0.4) 0%, transparent 50%)',
      'tab':'linear-gradient(135deg, rgba(199, 210, 254, 0.7) 0%, rgba(251, 207, 232, 0.7) 50%, rgba(187, 247, 208, 0.7) 100%)',
      'tab-dark':'linear-gradient(135deg, rgba(139, 92, 246, 0.5) 0%, rgba(236, 72, 153, 0.5) 50%, rgba(34, 197, 94, 0.5) 100%)'
      }
    },

  },
  plugins: [require('tailwind-scrollbar-hide'),
  require('@tailwindcss/container-queries'),
  ]
}

