import {readFileSync} from 'node:fs';

const adapter = JSON.parse(readFileSync('public/tidecloak.json','utf8'));
const issuer = `${adapter['auth-server-url'].replace(/\/+$/, '')}/realms/${adapter.realm}`;
const aud = adapter.resource;
const hex = value=>Buffer.from(value,'utf8').toString('hex');
const url = `http://localhost:5173/tide_dpop/iss/${hex(issuer)}/aud/${hex(aud)}/tide_dpop_auth.html`;
console.log('Checking:',url);
try {
  const response=await fetch(url);
  const body=await response.text();
  const csp=response.headers.get('content-security-policy')||'';
  const allow=response.headers.get('allow-csp-from')||'';
  const good=response.status===200 && /<html|<!doctype/i.test(body) && !body.includes('secondkey-unlocked') && !!csp && allow==='*' && body.length>1000;
  console.log('Status:',response.status);
  console.log('Content-Type:',response.headers.get('content-type'));
  console.log('Content-Security-Policy:',csp ? 'PRESENT' : 'MISSING');
  console.log('Allow-CSP-From:',allow || 'MISSING');
  console.log('HTML bytes:',Buffer.byteLength(body));
  console.log(good?'PASS — Tide DPoP relay is being served':'FAIL — Tide DPoP relay is not correctly served');
  if (!good) process.exitCode=1;
} catch(err) {console.error('FAIL:',err.message,'— start npm.cmd run dev first'); process.exitCode=1;}
