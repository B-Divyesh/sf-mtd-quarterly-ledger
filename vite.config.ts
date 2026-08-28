import { defineConfig } from 'vite';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [{
    name: 'static-demo-route',
    closeBundle() {
      const output = resolve(process.cwd(), 'dist');
      mkdirSync(resolve(output, 'demo'), { recursive: true });
      const home = readFileSync(resolve(output, 'index.html'), 'utf8');
      const description = 'Try a populated quarterly income and expense ledger with isolated sample records.';
      const demo = home
        .replace('<title>Quarter sheet — quarterly income and expense ledger</title>', '<title>Demo — Quarter sheet</title>')
        .replace('content="Track quarterly income and expenses in your browser for UK sole traders using Making Tax Digital records."', `content="${description}"`)
        .replaceAll('content="Quarter sheet — quarterly income and expense ledger"', 'content="Demo — Quarter sheet"')
        .replaceAll('content="Track quarterly income and expenses in your browser for UK sole traders."', `content="${description}"`)
        .replaceAll('content="https://mtd-quarterly-ledger.sociobot.in/"', 'content="https://mtd-quarterly-ledger.sociobot.in/demo/"')
        .replace('href="https://mtd-quarterly-ledger.sociobot.in/"', 'href="https://mtd-quarterly-ledger.sociobot.in/demo/"');
      writeFileSync(resolve(output, 'demo/index.html'), demo);
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
