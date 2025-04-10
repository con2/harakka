import { defineConfig } from 'cypress';

// Add exported default directly - avoid any intermediate variables
export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5180',
    video: true, // Enable video recording
    videoCompression: 0, // No compression for highest quality in demos
    videosFolder: 'cypress/videos', // Where videos are saved
    viewportWidth: 1280, // Wider viewport for demos
    viewportHeight: 800, // Taller viewport for demos
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
});
