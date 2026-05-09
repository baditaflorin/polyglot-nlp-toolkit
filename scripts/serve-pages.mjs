import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const port = Number(process.argv[2] || 4173);
const root = resolve(process.argv[3] || 'docs');
const base = '/polyglot-nlp-toolkit/';

const types = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.webmanifest', 'application/manifest+json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
]);

createServer((request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
  if (!url.pathname.startsWith(base)) {
    response.writeHead(404);
    response.end('not found');
    return;
  }

  const relative = decodeURIComponent(url.pathname.slice(base.length)) || 'index.html';
  const safeRelative = normalize(relative).replace(/^(\.\.(\/|\\|$))+/, '');
  const candidate = resolve(join(root, safeRelative));
  const filePath = candidate.startsWith(root) ? resolveDirectory(candidate) : join(root, '404.html');

  response.setHeader('Content-Type', types.get(extname(filePath)) || 'application/octet-stream');
  createReadStream(filePath)
    .on('error', () => {
      response.writeHead(404);
      response.end('not found');
    })
    .pipe(response);
}).listen(port, '127.0.0.1', () => {
  process.stdout.write(`Pages preview listening on http://127.0.0.1:${port}${base}\n`);
});

function resolveDirectory(filePath) {
  try {
    const stats = statSync(filePath);
    if (stats.isDirectory()) {
      return join(filePath, 'index.html');
    }
    return filePath;
  } catch {
    return join(root, '404.html');
  }
}
