import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const repoRoot = fileURLToPath(new URL('..', import.meta.url));

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, repoRoot, ''), ...process.env };
  const host = ['0.0.0.0', '::'].includes(env.HOST) ? '127.0.0.1' : env.HOST || '127.0.0.1';
  const target = `http://${host.includes(':') ? `[${host}]` : host}:${env.PORT || 3000}`;
  return {
    root,
    plugins: [react()],
    esbuild: { tsconfigRaw: { compilerOptions: {} } },
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: true,
      proxy: { '/api': target, '/art': target, '/uploads': target },
    },
    build: { outDir: 'dist', emptyOutDir: true },
  };
});
