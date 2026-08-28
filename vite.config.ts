import { defineConfig } from 'vite';
import { copyFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [{
    name: 'static-demo-route',
    closeBundle() {
      const output = resolve(process.cwd(), 'dist');
      mkdirSync(resolve(output, 'demo'), { recursive: true });
      copyFileSync(resolve(output, 'index.html'), resolve(output, 'demo/index.html'));
    }
  }],
  build: {
    target: 'es2022',
    sourcemap: false,
    rollupOptions: {
      input: {
        app: 'index.html',
        privacy: 'privacy/index.html',
        terms: 'terms/index.html',
        notFound: '404.html'
      }
    }
  }
});
