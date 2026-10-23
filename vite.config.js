import { defineConfig } from 'vite';
export default defineConfig({
  base: './',
  server: { port: 5190, host: '127.0.0.1' },
  build: {
    // three.js ayrı parça: site metni/kodu değişince ziyaretçi 3D motorunu yeniden indirmez
    rollupOptions: { output: { manualChunks: (id) => (id.includes('node_modules/three') ? 'three' : undefined) } },
    chunkSizeWarningLimit: 700,
  },
});
