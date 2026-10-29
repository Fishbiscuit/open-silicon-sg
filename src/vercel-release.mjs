import { readFileSync, mkdirSync, writeFileSync, cpSync, existsSync } from 'node:fs';
const raw = process.env.VERCEL_OBSERVABILITY_CLIENT_CONFIG;
if (!raw) throw new Error('Vercel observability configuration was not provided');
const config = JSON.parse(raw);
if (!config.analytics?.scriptSrc || !config.speedInsights?.scriptSrc) throw new Error('Vercel measurement paths are missing');
const attr = s => String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const absolute = value => /^(?:https?:)?\/\//.test(value) || value.startsWith('/') ? value : `/${value}`;
const a = config.analytics, s = config.speedInsights;
const snippet = `<script>window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};window.si=window.si||function(){(window.siq=window.siq||[]).push(arguments)};</script><script defer src="${attr(absolute(a.scriptSrc))}"${a.viewEndpoint ? ` data-view-endpoint="${attr(absolute(a.viewEndpoint))}"` : ''}${a.eventEndpoint ? ` data-event-endpoint="${attr(absolute(a.eventEndpoint))}"` : ''}></script><script defer src="${attr(absolute(s.scriptSrc))}"${s.endpoint ? ` data-endpoint="${attr(absolute(s.endpoint))}"` : ''}></script>`;
const html = readFileSync('index.html','utf8').replace('</body>',snippet+'</body>');
mkdirSync('public',{recursive:true});writeFileSync('public/index.html',html);
if (existsSync('ite3')) {
  cpSync('ite3', 'public/ite3', { recursive: true });
  // The carousel runs inside the hub page; count the hub once, not the iframe.
  const configText = JSON.stringify({analytics:a,speedInsights:s}).replaceAll('<','\\u003c');
  const companionSnippet = `<script>if(new URLSearchParams(location.search).get('embed')!=='carousel'){const c=${configText};window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};window.si=window.si||function(){(window.siq=window.siq||[]).push(arguments)};for(const [x,attrs] of [[c.analytics,['viewEndpoint','eventEndpoint']],[c.speedInsights,['endpoint']]]){const el=document.createElement('script');el.src=/^(?:https?:)?\\/\\//.test(x.scriptSrc)||x.scriptSrc.startsWith('/')?x.scriptSrc:'/'+x.scriptSrc;el.defer=true;for(const key of attrs)if(x[key])el.setAttribute('data-'+key.replace(/[A-Z]/g,m=>'-'+m.toLowerCase()),/^(?:https?:)?\\/\\//.test(x[key])||x[key].startsWith('/')?x[key]:'/'+x[key]);document.body.appendChild(el)}}</script>`;
  for (const file of ['public/ite3/index.html', 'public/ite3/aerolamp/index.html']) {
    writeFileSync(file, readFileSync(file, 'utf8').replace('</body>', companionSnippet + '</body>'));
  }
}
