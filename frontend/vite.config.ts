import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [tailwindcss(), react()],
      css: {
        postcss: {
          plugins: []
        }
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      base: process.env.VITE_BASE_PATH || '/',
      build: {
        rollupOptions: {
          input: {
            main: path.resolve(__dirname, 'index.html'),
            waiter: path.resolve(__dirname, 'waiter.html'),
            admin: path.resolve(__dirname, 'admin.html'),
          }
        }
      }
    };
});
