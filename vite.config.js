import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    // Ensure global context is available for legacy libraries (d3-celestial compatibility)
    // Aliases `global` to `globalThis` for libraries expecting Node.js-style globals
    global: 'globalThis',
  },
  build: {
    rollupOptions: {
      external: id =>
        id.includes('cdn.jsdelivr.net/gh/ofrohn/d3-celestial/data/')
    }
  },
  optimizeDeps: { 
    exclude: ['d3-celestial'], // Exclude from optimization to preserve non-strict mode
    esbuildOptions: {
      // Handle legacy UMD/CommonJS modules
      define: {
        global: 'globalThis',
      },
    }
  },
  server: {
    port: 5173,
    open: true
  },
  assetsInclude: ['**/*.min.js'] // Treat minified JS as assets
});