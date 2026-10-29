// Stage the existing companion beneath /ite3 without changing its source or site.
import { cpSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

const source = path.resolve(process.argv[2] || '../ite3-companion-publish/dist');
const target = path.resolve('out/vercel-release/ite3');
const roots = new Set(readdirSync(source));
const marker = 'a09456cb4340';
// The scoped worker must see staging changes as a new generation even when
// the upstream companion itself has not changed.
const scopedBuild = `${marker}-${createHash('sha256').update(readFileSync(new URL(import.meta.url))).digest('hex').slice(0, 8)}`;
if (!readFileSync(path.join(source, 'index.html'), 'utf8').includes(`content="${marker}"`)) {
  throw new Error('Companion build changed: verify the public release before staging it.');
}
mkdirSync(target, { recursive: true });
cpSync(source, target, { recursive: true });
let edited = 0;
function visit(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) { visit(file); continue; }
    if (!/\.(?:html|js|css|json)$/.test(entry.name)) continue;
    let s = readFileSync(file, 'utf8').replaceAll(marker, scopedBuild);
    // Only rewrite root paths that actually belong to this companion.
    s = s.replace(/(["'`])\/([a-zA-Z0-9_.-]+)(?=[/"'`?#])/g, (all, quote, part) => roots.has(part) ? `${quote}/ite3/${part}` : all);
    s = s.replaceAll('href="/#', 'href="/ite3/#').replaceAll("href='/#", "href='/ite3/#");
    s = s.replaceAll('href="/"', 'href="/ite3/"');
    s = s.replaceAll('"scope":"/"', '"scope":"/ite3/"').replaceAll('"documents":["/",', '"documents":["/ite3/",');
    if (s.includes('ITE3_OFFLINE_CONFIG')) s = s.replaceAll('"/":', '"/ite3/":');
    // Generated inventory limits must accommodate the longer scoped paths.
    if (s.includes('ITE3_OFFLINE_CONFIG')) s = s.replace(/"bytes":(\d+)/g, (_, n) => `"bytes":${Number(n) + 4096}`);
    if (entry.name === 'sw.js') {
      s = s.replace("const PREFIX = 'ite3-'", "const PREFIX = 'ite3-scoped-'");
      s = s.replace("if (pathname === '/ite3/index.html') return '/';", "if (pathname === '/ite3/index.html' || pathname === '/ite3') return '/ite3/';");
    }
    if (file === path.join(target, 'index.html')) {
      // The hub embeds the actual companion carousel, with the surrounding
      // companion chrome omitted; exhibit links open in the top-level page.
      const embed = `<script>if(new URLSearchParams(location.search).get('embed')==='carousel')document.documentElement.dataset.osEmbed='carousel';</script><style>html[data-museum] .tt-further-links{display:none!important}html[data-os-embed] body{padding:0!important;min-height:0}html[data-os-embed] :is(.companion-header,body>footer,.editorial-home-intro,.editorial-overviews,.skip,dialog){display:none!important}html[data-os-embed] #main{padding:0!important;min-height:0}html[data-os-embed] .home-content{padding:0!important}html[data-os-embed] .exhibit-carousel{margin:0!important;padding:0!important}</style><script>if(document.documentElement.dataset.osEmbed){document.addEventListener('click',e=>{const a=e.target.closest?.('a[href]');if(!a)return;const u=new URL(a.href,location.href);if(u.origin===location.origin){u.searchParams.delete('embed');a.href=u.href;a.target='_top';e.stopPropagation();}},true);}</script>`;
      s = s.replace('</head>', embed + '</head>');
    }
    writeFileSync(file, s); edited++;
  }
}
visit(target);
console.log(`Staged companion ${marker} as ${scopedBuild}: ${edited} text files scoped to /ite3/`);
