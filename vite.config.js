import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { handleApiRequest } from './server/apiRouter.js';

function apiDevMiddlewarePlugin() {
  return {
    name: 'api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/')) {
          try {
            const handled = await handleApiRequest(req, res);
            if (!handled) next();
          } catch (err) {
            console.error('[API Middleware Error]:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
          }
        } else {
          next();
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), apiDevMiddlewarePlugin()],
  css: {
    postcss: {},
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    target: 'esnext',
    sourcemap: false,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-animation': ['framer-motion', 'gsap', 'lenis'],
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
});
