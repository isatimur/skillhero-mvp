import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3001,
      host: '0.0.0.0',
    },
    plugins: [react()],
    // NOTE: Do NOT add GEMINI_API_KEY here — it would be bundled into the client.
    // The AI quiz feature must be proxied through a server-side endpoint in production.
    define: {},
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) return 'react-vendor';
              if (id.includes('framer-motion')) return 'motion-vendor';
              if (id.includes('@supabase/supabase-js')) return 'supabase-vendor';
              if (id.includes('d3')) return 'd3-vendor';
              if (id.includes('lucide-react')) return 'icons-vendor';
            }
            return undefined;
          },
        },
      },
    }
  };
});
