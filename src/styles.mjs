// Page styles. Colours come only from design/schemes.mjs tokens.
export const PAGE_CSS = `
/* Layout: a framed stage for each motion study, then an editorial column with wide figure breaks. */
:root{
  --display:"Unbounded","ABC Areal","Helvetica Neue",Arial,sans-serif;
  --body:"ABC Areal","Helvetica Neue",Helvetica,Arial,sans-serif;
  --mono:ui-monospace,"SF Mono",Menlo,Consolas,monospace;
  --ease:cubic-bezier(.32,.72,0,1);
}
*{box-sizing:border-box}
html{background:var(--bg);-webkit-text-size-adjust:100%;text-size-adjust:100%}
body{background:var(--bg);color:var(--text);font:16px/1.62 var(--body);-webkit-font-smoothing:antialiased;overflow-x:hidden;transition:background-color .4s var(--ease),color .4s var(--ease)}
a{color:var(--accent)}
.gutter{padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
button{font:inherit;color:inherit}
:focus-visible{outline:2px solid var(--focus);outline-offset:3px}
.eyebrow{font:500 12px/1.2 var(--mono);letter-spacing:.16em;text-transform:uppercase;color:var(--accent);margin:0}
code{font:.88em var(--mono)}
/* top bar */
.topbar{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px 16px;padding-block:16px;border-bottom:1px solid var(--rule);position:relative;z-index:2}
.wordmark{font-family:var(--display);font-weight:500;font-size:18px;color:var(--text-strong);letter-spacing:.01em;white-space:nowrap}
.wordmark b{font-weight:500;color:var(--accent)}
.topbar nav{display:flex;gap:22px;flex-wrap:wrap;font-size:13px}
.topbar nav a{color:var(--muted);text-decoration:none;min-height:32px;display:inline-flex;align-items:center}
.topbar nav a:hover{color:var(--text-strong)}
.top-right{display:flex;align-items:center;gap:18px}
.doc-meta{font:12px/1.3 var(--mono);color:var(--muted);text-align:right}
.schemes{display:grid;place-items:center;flex:none;width:44px;height:44px;padding:0;border:0;background:transparent;cursor:pointer;color:var(--text)}
.schemes svg{display:none;width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.schemes:not([data-current]) [data-scheme-icon=""],.schemes[data-current=""] [data-scheme-icon=""],.schemes[data-current="paper"] [data-scheme-icon="paper"],.schemes[data-current="imagery"] [data-scheme-icon="imagery"]{display:block}
/* hero */
.hero{position:relative;overflow:hidden;padding-block:clamp(48px,6vw,88px) 56px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));background:var(--bg)}
.hero-grid{position:relative;display:grid;grid-template-columns:1fr;gap:clamp(24px,3vw,44px);max-width:1280px;margin:0 auto}
.hero-copy{min-width:0;text-align:center}
.hero h1{font-family:var(--body);font-weight:600;font-size:clamp(43px,6vw,86px);line-height:1.03;letter-spacing:-.035em;color:var(--text-strong);max-width:18ch;margin:0 auto .3em;text-wrap:balance}
.hero-emphasis{background-image:linear-gradient(transparent 60%,color-mix(in srgb,var(--accent) 22%,transparent) 60%);background-repeat:no-repeat;background-position:left bottom;background-size:0 100%;animation:highlight-word 1.1s var(--ease) .35s forwards}
@keyframes highlight-word{to{background-size:100% 100%}}
@media (prefers-reduced-motion:reduce){.hero-emphasis{animation:none;background-size:100% 100%}}
.lede{font-size:clamp(17px,1.45vw,20px);line-height:1.5;max-width:68ch;color:var(--text);margin:0 auto;text-wrap:balance}
.hero-note{font:12px/1.4 var(--mono);color:var(--muted);margin-top:28px;letter-spacing:.04em}
.stage-wrap{min-width:0;width:100%;max-width:960px;margin:0 auto}
.stage{position:relative;aspect-ratio:900/640;width:100%;background:radial-gradient(55% 55% at 55% 52%,var(--stage-glow),transparent 72%);overflow:hidden}
.hero .vignette,.hero .grain{display:none}
.stage .layer{position:absolute;inset:0;opacity:0;visibility:hidden;will-change:opacity,transform}
.stage .iso-svg,.fab-stage .iso-svg{width:100%;height:100%;overflow:hidden}
.iso-svg rect,.iso-svg circle{vector-effect:non-scaling-stroke}
.chip-glow{opacity:0;transition:opacity 1.2s var(--ease);mix-blend-mode:var(--fx-blend);pointer-events:none}
.layer.lit .chip-glow{opacity:1}
.rf{animation:rf 2.4s ease-in-out infinite;animation-delay:calc(var(--i) * .3s);opacity:.15}
@keyframes rf{0%,100%{opacity:.08}35%{opacity:.85}70%{opacity:.08}}
.rf-led{stroke-width:2.2px}
.sheen{mix-blend-mode:var(--sheen-blend)}
.sch{fill:none;stroke:var(--sch-line);stroke-width:1.5px;stroke-dasharray:1;stroke-dashoffset:1;stroke-linecap:round;stroke-linejoin:round}
.sch-n{fill:var(--sch-node);opacity:0}
.sch-b{fill:none;stroke:var(--sch-line);stroke-width:1.5px;opacity:0}
.sch-t{fill:var(--sch-line);font:600 20px var(--mono);opacity:0}
.cell-halo{opacity:0;filter:drop-shadow(0 0 5px var(--anatomy-lit))}
.corners,.fab-corners{position:absolute;inset:14px 16px;pointer-events:none;font:11px/1 var(--mono);letter-spacing:.06em;color:var(--muted)}
.corners>[data-corner]{position:absolute;white-space:nowrap}
[data-corner="fig"]{display:none}
[data-corner="title"]{top:0;right:0;text-transform:uppercase;letter-spacing:.12em}
[data-corner="scale"]{bottom:0;left:0;display:flex;align-items:center;gap:10px;color:var(--text)}
.scalebar i{display:block;height:6px;border:1px solid currentColor;border-top:0;width:0;transition:width .25s linear}
[data-corner="readout"]{bottom:0;right:0}
.caption{min-height:4.9em;margin:16px 0 0;font-size:clamp(15px,1.25vw,18px);line-height:1.5;color:var(--text-strong);max-width:62ch;opacity:0;transform:translateY(6px);transition:opacity .45s var(--ease),transform .45s var(--ease)}
.caption.on{opacity:1;transform:none}
.controls{display:flex;justify-content:space-between;align-items:center;gap:12px 20px;flex-wrap:wrap;margin-top:6px}
.chips{display:flex;gap:6px;flex-wrap:wrap}
.chip{position:relative;background:transparent;border:1px solid var(--rule);min-height:44px;flex:none;padding:8px 14px 10px;font-size:13px;color:var(--muted);cursor:pointer;overflow:hidden}
.chip i{position:absolute;left:0;bottom:0;height:2px;width:calc(var(--p,0) * 100%);background:var(--accent)}
.chip[aria-current]{color:var(--text-strong);border-color:var(--rule-strong)}
.chip:hover{color:var(--text-strong)}
.buttons{display:flex;gap:6px}
.btn{display:inline-flex;align-items:center;gap:8px;min-height:44px;text-decoration:none;padding:8px 14px;border:1px solid var(--rule);background:transparent;font-size:13px;cursor:pointer;color:var(--text)}
.btn svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round}
.btn:hover{border-color:var(--rule-strong)}
.btn.prime{background:var(--accent);border-color:var(--accent);color:var(--on-accent)}

/* open chip: shared die, the signed project */
.chip-art .frame{fill:none;stroke:var(--lay-metal);stroke-width:1.5px}
.chip-art .cells rect{fill:var(--lay-metal)}
.chip-art .g{font:500 6.6px var(--display);fill:var(--lay-poly)}
.chip-art .s{font:500 15px var(--display);fill:var(--lay-metal)}
.art-ring{stroke-width:1px}
.open-die.spot .proj:nth-child(7n+2) rect:first-child{animation:proj 1.6s ease-in-out infinite}
.open-die.spot .proj:nth-child(11n+5) rect:first-child{animation:proj 1.6s ease-in-out .5s infinite}
.open-die.spot .proj:nth-child(13n+9) rect:first-child{animation:proj 1.6s ease-in-out 1s infinite}
@keyframes proj{0%,100%{fill-opacity:1}50%{fill:var(--lay-poly);fill-opacity:.85}}
@media (prefers-reduced-motion:reduce){.open-die.spot .proj rect:first-child{animation:none}}
/* end card: crystal, tile, trace, name */
.layer.end .bonds{fill:none;stroke:var(--silver);stroke-width:1px}
.layer.end .atoms circle{fill:var(--text-strong)}
.layer.end .end-trace path{vector-effect:none}
.end-trace .tr{fill:none;stroke:var(--silver);stroke-width:14;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:1;opacity:.75}
.end-trace .sig{fill:none;stroke:var(--accent);stroke-width:3.5;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:1}
.end-trace .node{fill:var(--bg);stroke:var(--silver);stroke-width:7;opacity:0}
.end-trace .pad{fill:var(--silver);opacity:0}
.end-trace .pad-slot{fill:var(--bg);opacity:0}
.end-tile{opacity:0}
.end-tile .frame{fill:var(--bg);stroke:var(--text-strong);stroke-width:1.5px;vector-effect:non-scaling-stroke}
.end-tile .cells rect{fill:var(--text-strong);opacity:0}
.end-tile .g{font:500 6.6px var(--display);fill:var(--accent);letter-spacing:.02em;opacity:0}
.end-tile .s{font:500 15px var(--display);fill:var(--text-strong)}
.end-core{fill:var(--accent)}
.end-name{opacity:0}
.end-name .nm{font:500 40px var(--display);fill:var(--text-strong)}
.end-name .acc{fill:var(--accent)}
.end-name .sub{font:13px var(--mono);fill:var(--muted);letter-spacing:.04em}
/* cinematic layer: key light and beam behind the subject, dust, vignette and grain in front */
.keylight{position:absolute;inset:-12%;pointer-events:none;background:radial-gradient(38% 44% at 58% 52%,var(--key),transparent 72%),linear-gradient(112deg,transparent 32%,var(--beam) 45%,transparent 58%);mix-blend-mode:var(--key-blend);animation:keylight 16s ease-in-out infinite alternate}
@keyframes keylight{from{transform:translate(-2.5%,-1.5%) rotate(-1.2deg)}to{transform:translate(2.5%,1.5%) rotate(1.2deg)}}
.motes{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.fab-stage>.iso-svg{position:relative}
.vignette{position:absolute;inset:0;pointer-events:none;background:radial-gradient(80% 75% at 50% 50%,transparent 52%,var(--vignette) 100%)}
.grain{position:absolute;inset:-60%;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 1.4 -.2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:180px;opacity:var(--grain);mix-blend-mode:var(--grain-blend);animation:grain 1s steps(5) infinite}
@keyframes grain{0%{transform:translate(0,0)}20%{transform:translate(-4%,3%)}40%{transform:translate(3%,-4%)}60%{transform:translate(-2%,4%)}80%{transform:translate(4%,-2%)}100%{transform:translate(0,0)}}
.layer.lit .chip-glow{animation:breathe 3.8s ease-in-out infinite}
@keyframes breathe{0%,100%{opacity:.72}50%{opacity:1}}
.caption{filter:blur(5px)}
.caption.on{filter:none}
.caption{transition:opacity .55s var(--ease),transform .55s var(--ease),filter .55s var(--ease)}
@media (prefers-reduced-motion:reduce){.keylight,.grain,.layer.lit .chip-glow{animation:none}.caption{filter:none}}
/* events (generated from content/events) */
.ev-group{display:grid;grid-template-columns:200px minmax(0,1fr);gap:12px 32px;border-top:1px solid var(--rule);padding-block:18px}
.ev-group>h3{font:500 12px/1.2 var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin:6px 0 0}
.ev-list{list-style:none;margin:0;padding:0;display:grid;gap:0}
.ev-more summary{display:flex;align-items:center;gap:10px;min-height:44px;cursor:pointer;color:var(--accent);list-style:none}
.ev-more summary::-webkit-details-marker{display:none}
.ev-more summary span::before{content:'+';font-size:20px}
.ev-more[open] summary span::before{content:'−'}
.ev-more summary:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.ev{display:grid;grid-template-columns:190px minmax(0,1fr) auto;gap:6px 22px;padding:14px 0;border-bottom:1px solid var(--rule);align-items:baseline}
.ev:last-child{border-bottom:0}
.ev-when{font:13px/1.4 var(--mono);color:var(--text-strong)}
.ev-when small{display:block;color:var(--muted);font-size:11px}
.ev-tbc{color:var(--accent)}
.ev h4{margin:0 0 4px;font-size:17px;font-weight:500;color:var(--text-strong)}
.ev p{margin:0;color:var(--text);font-size:15px}
.ev-meta{font:12px/1.4 var(--mono);color:var(--muted);margin-top:6px}
.ev-kind{font:11px/1 var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--muted);border:1px solid var(--rule);padding:6px 8px;white-space:nowrap}
.ev-kind[data-kind="milestone"]{color:var(--accent);border-color:var(--accent)}
.ev-empty{color:var(--muted);margin:6px 0 0}
.ev-note{font-size:13px;color:var(--muted);margin-top:16px}

/* site: sticky header, sections, exhibition, about, footer (phone first) */
.wrap{max-width:1280px;margin:0 auto}
body::before{content:"";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top,0px);z-index:21;background:var(--bg)}
.site-head{position:sticky;top:env(safe-area-inset-top,0px);z-index:20;background:var(--bg);border-bottom:1px solid var(--rule)}
.head-row{max-width:1500px;margin:0 auto;display:flex;flex-wrap:wrap;align-items:center;gap:0 24px;min-height:60px}
.wordmark{text-decoration:none;min-height:44px;display:inline-flex;align-items:center;gap:10px}
.mark{flex:none;display:block}
.mark .frame{fill:var(--bg);stroke:var(--text-strong);stroke-width:1.25px;vector-effect:non-scaling-stroke}
.mark .cells rect{fill:var(--text-strong)}
.mark .s{font:500 15px var(--display);fill:var(--text-strong)}
.mark .g{font:500 6.6px var(--display);fill:var(--accent);letter-spacing:.02em}
.site-nav{display:flex;justify-content:flex-end;flex:none;margin-left:auto;gap:28px;font-size:14px}
.site-nav a{color:var(--text);text-decoration:none;min-width:44px;min-height:44px;display:inline-flex;align-items:center;white-space:nowrap}
.site-nav a:hover{color:var(--accent)}
.head-right{display:flex;align-items:center;gap:18px;margin-left:auto}
[id]{scroll-margin-top:76px}
.hero-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:28px}
.block{padding-block:80px;border-top:1px solid var(--rule)}
.s-head{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.25fr);gap:16px 56px;align-items:end;margin-bottom:34px}
.s-head h2{font-family:var(--display);font-weight:500;font-size:clamp(32px,4.2vw,58px);line-height:1;color:var(--text-strong);margin:.35em 0 0;text-wrap:balance}
.s-intro p{margin:0;max-width:60ch}
.s-meta{font:12px/1.4 var(--mono);color:var(--muted);margin:14px 0 12px;letter-spacing:.04em}
.ex-directions{display:flex;align-items:center;min-height:44px;width:fit-content;color:var(--accent)}
.ev-main{min-width:0}
.ev .ev-meta{font-size:12px}
.ev-signup{margin-top:10px}
.ex-carousel{display:block;width:100%;height:410px;border:0;background:var(--surface)}
.ex-areas{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:28px;margin-top:28px}
.ex-area{display:block;min-width:0;color:var(--text-strong);text-decoration:none}
.ex-area-image{display:block;aspect-ratio:16/9;background:var(--plate);overflow:hidden}
.ex-area-image img{display:block;width:100%;height:100%;object-fit:contain;padding:16px}
.ex-area-label{display:flex;justify-content:space-between;align-items:center;gap:12px;min-height:78px;padding:14px 0;border-bottom:1px solid var(--rule)}
.ex-area b,.ex-area small{display:block}.ex-area b{font-size:19px;font-weight:500}.ex-area small{margin-top:4px;font-size:14px;color:var(--muted)}
.ex-area:hover,.ex-all:hover{color:var(--accent)}
.ex-all{display:inline-flex;align-items:center;gap:10px;min-height:44px;margin-top:10px;color:var(--accent);text-decoration:none}
@media(max-width:760px){.ex-carousel{height:480px}.ex-areas{grid-template-columns:1fr}}
.ex-grid{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(212px,1fr));gap:14px}
.ex{display:flex;flex-direction:column;border:1px solid var(--rule);background:var(--surface);min-width:0}
.ex[data-kind="chip"]{--k:var(--accent)}.ex[data-kind="device"]{--k:var(--energy)}.ex[data-kind="material"]{--k:var(--heat)}
.ex-img{position:relative;margin:0;aspect-ratio:4/3;background:var(--plate);border-bottom:1px solid var(--rule);overflow:hidden}
.ex-img img{display:block;width:100%;height:100%;object-fit:contain;padding:14px 14px 30px}
.ex-img[data-fit="cover"] img{object-fit:cover;padding:0}
.ex-img figcaption{position:absolute;left:0;right:0;bottom:0;padding:6px 10px;font:10.5px/1.3 var(--mono);color:var(--plate-ink);background:linear-gradient(transparent,color-mix(in srgb,var(--plate) 92%,transparent) 40%)}
.ex-blank{aspect-ratio:4/3}
.ex-body{padding:16px 16px 6px;flex:1}
.ex-kind{font:500 11px/1 var(--mono);letter-spacing:.12em;text-transform:uppercase;color:var(--k)}
.ex h3{font-size:18px;line-height:1.3;font-weight:500;color:var(--text-strong);margin:10px 0 4px}
.ex-makers{margin:0 0 10px;font-size:13px;color:var(--muted)}
.ex-inv{margin:0 0 4px;font-size:15px;font-weight:500;color:var(--text-strong)}
.ex-sum{margin:0;font-size:15px;line-height:1.5}
.ex-links{display:flex;flex-wrap:wrap;gap:0 18px;padding:2px 16px 8px}
.ex-links a{font-size:13px;color:var(--accent);min-height:44px;display:inline-flex;align-items:center;text-decoration:none}
.ex-links a:hover{text-decoration:underline}
.aud-network{position:relative;max-width:1050px;margin:0 auto}
.aud{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:minmax(0,1fr) 200px minmax(0,1fr);grid-template-rows:repeat(2,minmax(140px,auto));gap:30px 0}
.aud li{min-width:0;align-self:center;max-width:300px}
.aud li:nth-child(1){grid-column:1;grid-row:1}.aud li:nth-child(2){grid-column:3;grid-row:1}
.aud li:nth-child(3){grid-column:1;grid-row:2}.aud li:nth-child(4){grid-column:3;grid-row:2}
.aud li:nth-child(odd){justify-self:end;text-align:right;padding-right:32px}
.aud li:nth-child(even){justify-self:start;padding-left:32px}
.aud h3{font-size:18px;font-weight:500;color:var(--text-strong);margin:0 0 6px}
.aud p{margin:0}
.aud-traces{position:absolute;top:0;bottom:0;left:50%;width:200px;height:100%;transform:translateX(-50%);overflow:visible;pointer-events:none}
.aud-traces path{fill:none;stroke:var(--accent);stroke-width:1;vector-effect:non-scaling-stroke;opacity:.65}
.aud-traces circle{fill:var(--accent)}
.aud-hub{position:absolute;z-index:1;left:50%;top:50%;transform:translate(-50%,-50%);display:grid;place-items:center;width:94px;height:94px;background:var(--bg);border:1px solid var(--rule);border-radius:50%}
.join-title{font-family:var(--display);font-weight:500;font-size:22px;color:var(--text-strong);margin:48px 0 14px}
.join{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.join a,.join div{display:block;height:100%;border:1px solid var(--rule);padding:16px;text-decoration:none;color:var(--text);background:var(--surface)}
.join a:hover{border-color:var(--accent)}
.join h4{margin:0 0 6px;font-size:16px;font-weight:500;color:var(--text-strong)}
.join p{margin:0;font-size:14px}
.site-foot{border-top:1px solid var(--rule);padding-block:40px 56px;background:var(--bg-raised)}
.site-foot .wrap{display:block}
.site-foot p{margin:10px 0 0;max-width:56ch;font-size:14px}
.site-github{display:inline-flex;align-items:center;gap:8px;min-height:44px;margin-top:12px;color:var(--accent);text-decoration:none}
.site-github:hover{text-decoration:underline}
@media (max-width:860px){
  .site-nav{order:3;flex:0 0 100%;justify-content:space-between;gap:8px;border-top:1px solid var(--rule)}
  .head-row>.schemes,.head-right{margin-left:auto}
  [id]{scroll-margin-top:112px}
  .block{padding-block:56px}
  .s-head{grid-template-columns:1fr;align-items:start;margin-bottom:26px}
  .join,.site-foot .wrap{grid-template-columns:1fr}
  .aud-network{padding:68px 0 0 48px}
  .aud-network::before{content:'';position:absolute;left:20px;top:52px;bottom:38px;border-left:1px solid var(--accent);opacity:.65}
  .aud{display:grid;grid-template-columns:1fr;grid-template-rows:none;gap:28px}
  .aud li:nth-child(n){grid-column:auto;grid-row:auto;justify-self:start;text-align:left;padding:0;max-width:100%;position:relative}
  .aud li::before{content:'';position:absolute;top:13px;left:-28px;width:20px;border-top:1px solid var(--accent);opacity:.65}
  .aud li::after{content:'';position:absolute;top:10px;left:-30px;width:6px;height:6px;background:var(--accent);border-radius:50%}
  .aud-traces{display:none}
  .aud-hub{top:0;left:0;transform:none;width:41px;height:41px;border:0;border-radius:0}
  .aud-hub .mark{width:41px;height:41px}
}
@media (max-width:520px){.end-name .sub{display:none}.site-head{position:static}.head-row{gap:0 10px;min-height:52px}.wordmark{font-size:15px;gap:8px}.wordmark .mark{width:34px;height:34px}.site-head .wordmark b{display:none}.schemes button{padding:4px 7px;font-size:11px}[id]{scroll-margin-top:12px}.chips{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;max-width:100%}.controls{align-items:stretch}.buttons{margin-left:auto}}
/* proposal */
.guide{border-top:1px solid var(--rule);border-bottom:1px solid var(--rule);background:var(--bg-raised)}
.guide-inner{max-width:1200px;margin:0 auto;padding-block:26px;display:grid;grid-template-columns:200px minmax(0,1fr);gap:12px 32px;align-items:start}
.guide ol{margin:0;padding-left:20px;display:grid;gap:8px;color:var(--text);max-width:80ch}
.guide b,.sec-body b{color:var(--text-strong);font-weight:500}
.doc{max-width:1200px;margin:0 auto;padding-block:88px 72px}
.doc-head{max-width:980px;margin:0 0 56px}
.doc-head h2{font-family:var(--display);font-weight:500;font-size:clamp(30px,3.6vw,52px);line-height:1.06;color:var(--text-strong);margin:.5em 0 .5em;text-wrap:balance}
.doc-sub{color:var(--muted);max-width:70ch;margin:0}
.sec{display:grid;grid-template-columns:200px minmax(0,1fr);gap:12px 32px;padding-block:44px;border-top:1px solid var(--rule)}
.sec-n{font:500 13px/1 var(--mono);color:var(--accent);letter-spacing:.08em;padding-top:10px}
.sec-body{min-width:0;max-width:72ch}
.sec-body h3{font-family:var(--display);font-weight:500;font-size:clamp(22px,2vw,28px);line-height:1.2;color:var(--text-strong);margin:0 0 18px;text-wrap:balance}
.sec-body p{margin:0 0 16px}
.sec-body ol,.sec-body ul{padding-left:22px;margin:0 0 18px;display:grid;gap:8px}
.lead p{font-size:clamp(20px,1.9vw,26px);line-height:1.38;color:var(--text-strong)}
.muted p{color:var(--muted)}
.claims{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:8px 0 22px}
.claims>div{border:1px solid var(--rule);border-top:2px solid var(--accent);padding:18px 18px 4px;background:var(--surface)}
.claims .eyebrow{margin-bottom:10px}
.aside{border-left:2px solid var(--accent);padding:4px 0 4px 20px;margin:24px 0}
.aside .eyebrow{margin-bottom:10px}
.map{display:grid;gap:10px;margin:22px 0 24px;font-size:13px;line-height:1.4}
.map b{display:block;color:var(--text-strong);font-weight:500;font-size:14px;margin-bottom:6px}
.map span{display:block;color:var(--muted)}
.map-home,.map-foot{border:1px solid var(--rule-strong);padding:14px 16px;background:var(--surface)}
.map-home b{color:var(--accent)}
.map-row{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}
.map-row>div{border:1px solid var(--rule);padding:12px 12px 14px;display:grid;gap:4px;align-content:start;background:var(--surface)}
.table-wrap{overflow-x:auto;margin:8px 0 18px}
table{border-collapse:collapse;width:100%;font-size:14px;min-width:560px}
th,td{text-align:left;vertical-align:top;padding:10px 12px;border-bottom:1px solid var(--rule)}
th{font:500 11px/1.2 var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
td:first-child{color:var(--text-strong);white-space:nowrap}
.swatches{list-style:none;padding:0;margin:14px 0 22px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.swatches li{display:grid;grid-template-columns:34px minmax(0,1fr);column-gap:12px;align-items:center;font-size:13px}
.swatches .sw{grid-row:span 3;width:34px;height:34px;border:1px solid var(--rule)}
.swatches b{color:var(--text-strong);font-weight:500}
.swatches code{color:var(--muted);font-size:12px}
.swatches li>span:last-child{color:var(--muted);font-size:12px}
.timeline{list-style:none!important;padding:0!important;margin:8px 0 18px;display:grid;gap:0!important}
.timeline li{display:grid;grid-template-columns:200px minmax(0,1fr);gap:8px 20px;padding:14px 0;border-top:1px solid var(--rule)}
.timeline .when{font:12px/1.4 var(--mono);color:var(--accent);letter-spacing:.04em}
.timeline p{margin:4px 0 0;color:var(--text)}
.doc-foot{border-top:1px solid var(--rule);padding-top:22px;margin-top:20px;font-size:13px;color:var(--muted);max-width:90ch}
@media (max-width:860px){
  .hero-grid{grid-template-columns:1fr}
  .hero h1{margin-top:.2em}
  .topbar nav,.doc-meta{display:none}
  .guide-inner,.sec,.events-head,.ev-group{grid-template-columns:1fr}
  .claims{grid-template-columns:1fr}
  .map-row{grid-template-columns:repeat(2,minmax(0,1fr))}
  .swatches{grid-template-columns:repeat(2,minmax(0,1fr))}
  .timeline li{grid-template-columns:1fr}
  .ev{grid-template-columns:minmax(0,1fr) auto}
  .ev-when{grid-column:1;grid-row:1}
  .ev-kind{grid-column:2;grid-row:1;align-self:start}
  .ev-main{grid-column:1/-1;grid-row:2}
}
@media (max-width:520px){.schemes button{padding:4px 8px;font-size:11px}.corners{inset:10px 10px;font-size:10px}[data-corner="readout"]{display:none}.caption{min-height:6.2em}.map-row,.swatches{grid-template-columns:1fr}}
`;
