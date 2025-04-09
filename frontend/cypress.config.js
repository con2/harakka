import { defineConfig } from 'cypress';

// Add exported default directly - avoid any intermediate variables
export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5180',
    setupNodeEvents(on, config) {
      return config;
    },
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
  video: false,
});
