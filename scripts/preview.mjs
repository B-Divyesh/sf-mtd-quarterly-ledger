import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve(process.cwd(), 'dist');
const port = Number(process.env.PORT || 4173);
const types = {
  '.avif': 'image/avif', '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json',
  '.webp': 'image/webp', '.woff2': 'font/woff2', '.xml': 'application/xml; charset=utf-8'
};
const headers = {
  'Content-Security-Policy': "default-src 'self'; base-uri 'self'; connect-src 'self' https://api.sociobot.in; font-src 'self'; form-action 'self'; frame-ancestors 'none'; img-src 'self' blob:; manifest-src 'self'; object-src 'none'; script-src 'self'; style-src 'self'; worker-src 'self'; upgrade-insecure-requests",
  'Permissions-Policy': 'accelerometer=(), autoplay=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), browsing-topics=()',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY'
};

createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url || '/', `http://${request.headers.host}`).pathname);
  const relative = normalize(pathname).replace(/^[/\\]+/, '');
  let file = join(root, relative);
  let notFound = false;
  if (!file.startsWith(root) || !existsSync(file)) { file = join(root, '404.html'); notFound = true; }
  else if (statSync(file).isDirectory()) {
    file = join(file, 'index.html');
    if (!existsSync(file)) { file = join(root, '404.html'); notFound = true; }
  }
  const body = readFileSync(file);
  response.writeHead(notFound ? 404 : 200, { ...headers, 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Content-Length': body.length });
  response.end(request.method === 'HEAD' ? undefined : body);
}).listen(port, '127.0.0.1', () => process.stdout.write(`Quarter sheet preview: http://127.0.0.1:${port}\n`));
