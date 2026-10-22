import {writeFileSync, mkdirSync} from 'node:fs';
import {resolve} from 'node:path';

// Official source linked in https://docs.tide.org/Languages/React/tidecloak-react-how-to-guide
const url = 'https://raw.githubusercontent.com/tide-foundation/tidecloak-js/main/packages/tidecloak-js/tide_dpop_auth.html';
console.log('Downloading Tide official DPoP relay from:', url);
try {
  const response = await fetch(url, {signal:AbortSignal.timeout(20000)});
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const html = await response.text();
  if (html.length < 1000 || html.length > 200000 || !/<!doctype html|<html/i.test(html)) {
    throw new Error('File does not look like the official HTML relay. Nothing was overwritten.');
  }
  const folder = resolve('public');
  mkdirSync(folder,{recursive:true});
  writeFileSync(resolve(folder,'tide_dpop_auth.html'),html,'utf8');
  console.log(`Installed public/tide_dpop_auth.html (${Buffer.byteLength(html)} bytes)`);
  console.log('Next: npm.cmd run dev  |  npm.cmd run check:dpop');
} catch (err) {
  console.error('Cannot download Tide DPoP relay:',err.message);
  console.error('Manual fallback: download from the OFFICIAL URL above and save it as public/tide_dpop_auth.html.');
  process.exitCode = 1;
}
