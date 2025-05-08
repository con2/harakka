// export default {
//   theme: {
//     extend: {
//       fontFamily: {
//         robotoSlab: ["Roboto Slab", "serif"],
//       },
//     },
//   },
//   plugins: [],
// };


// tailwind.config.js
import { defineConfig } from 'tailwindcss'

export default defineConfig({
  darkMode: ['class'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // Add other color variables as needed
      },
    },
  },
})