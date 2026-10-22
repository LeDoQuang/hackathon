import { defineConfig } from 'vite';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

// Tide DPoP proof relay: served from the same origin where the browser's
// non-extractable DPoP private key is stored. Never replace this with the SPA.
const ROOT = process.cwd();
const RELAY = resolve(ROOT, 'public/tide_dpop_auth.html');
const ADAPTER = resolve(ROOT, 'public/tidecloak.json');
const route = /^\/tide_dpop\/iss\/([0-9a-f]+)\/aud\/([0-9a-f]+)\/tide_dpop_auth\.html\/?$/i;

function inlineCsp(html) {
  const parts = ["default-src 'self'"];
  for (const tag of ['script', 'style']) {
    const tags = [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi'))];
    const hashes = tags.map(match => 'sha256-' + createHash('sha256').update(match[1], 'utf8').digest('base64'));
    parts.push(`${tag === 'script' ? 'script-src' : 'style-src'} 'self' ${hashes.map(s=>`'${s}'`).join(' ')}`.trim());
  }
  return parts.join('; ');
}

function tideDpopRelay() {
  const serve = server => {
    server.middlewares.use((req, res, next) => {
    const pathname = (req.url || '').split('?')[0];
    if (!pathname.startsWith('/tide_dpop/')) return next();
    const m = route.exec(pathname);
    if (!m) { res.writeHead(404).end('DPoP route not found'); return; }
    if (!existsSync(RELAY) || !existsSync(ADAPTER)) {
      res.writeHead(503, {'Content-Type':'text/plain'}).end('Missing tide_dpop_auth.html or tidecloak.json. Run npm run setup:dpop.'); return;
    }
    let adapter;
    try { adapter = JSON.parse(readFileSync(ADAPTER,'utf8')); }
    catch { res.writeHead(500).end('Tide adapter unreadable'); return; }
    const issuer = `${adapter['auth-server-url'].replace(/\/+$/, '')}/realms/${adapter.realm}`;
    const audience = adapter.resource;
    let suppliedIssuer, suppliedAudience;
    try {
      suppliedIssuer = Buffer.from(m[1], 'hex').toString('utf8');
      suppliedAudience = Buffer.from(m[2], 'hex').toString('utf8');
    } catch { res.writeHead(400).end('Bad route'); return; }
    if (suppliedIssuer.replace(/\/+$/, '') !== issuer || suppliedAudience !== audience) {
      console.warn('[Tide DPoP] Reject unknown issuer/client relay request:', suppliedAudience);
      res.writeHead(403).end('Unrecognized Tide issuer or client'); return;
    }
    const html = readFileSync(RELAY,'utf8');
    res.writeHead(200, {
      'Content-Type':'text/html; charset=utf-8',
      'Content-Security-Policy':inlineCsp(html),
      'Allow-CSP-From':'*',
      'Cache-Control':'no-store',
      'X-Content-Type-Options':'nosniff'
    });
    res.end(html);
    });
  };
  return { name:'secondkey-tide-dpop-relay', configureServer:serve, configurePreviewServer:serve };
}

export default defineConfig({
  plugins: [tideDpopRelay()],
  server: {port:5173,strictPort:true,proxy:{'/api':{target:'http://127.0.0.1:8000',changeOrigin:true}}}
});
