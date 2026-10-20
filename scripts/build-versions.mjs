// Zwei Design-Versionen zum Zeigen für die Kundin:
//   A = aktuelle Startseite (Schwarz & Gold)   → /
//   B = frühere Landing im Perfect-Shape-Stil  → /klassisch
// Schreibt /versionen (Auswahlseite) und fügt in beide Versionen einen kleinen A/B-Umschalter am rechten Rand ein.
// PREVIEW = true (Vorschau-Phase): Umschalter überall sichtbar, auf / beim ersten Besuch pro Sitzung eine Design-Auswahl.
// PREVIEW = false (Live-Betrieb): Umschalter auf / nur mit ?v, keine Auswahl beim Start; /klassisch und /versionen bleiben erreichbar.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PREVIEW = true;
const VERSIONS = [
  { id: 'a', name: 'Lounge Noir', text: 'Schwarz & Gold, elegant und luxuriös – die aktuelle Version.', href: '/' },
  { id: 'b', name: 'Klassisch hell', text: 'Hell, ruhig und modern – die erste Version im Perfect-Shape-Stil.', href: '/klassisch' },
];

const switcher = (cur, { always = PREVIEW, home = '/', pick = false } = {}) => `<!--vsw-->
<div class="vsw" id="vsw" hidden><span class="vsw__l">Version</span>${VERSIONS.map((v) => `<a href="${v.id === 'a' ? home : v.href}?v"${v.id === cur ? ' aria-current="page"' : ''} title="Version ${v.id.toUpperCase()} – ${v.name}">${v.id.toUpperCase()}</a>`).join('')}<a class="vsw__all" href="/versionen" title="Alle Versionen" aria-label="Alle Versionen"><i></i><i></i><i></i></a></div>
<style>.vsw{position:fixed;z-index:9999;right:0;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 7px 8px 9px;border-radius:16px 0 0 16px;background:rgba(10,10,10,.92);border:1px solid rgba(207,174,107,.35);border-right:0;box-shadow:0 14px 34px -14px rgba(0,0,0,.6);font:500 10px/1 Montserrat,system-ui,sans-serif;animation:vswIn .6s cubic-bezier(.16,1,.3,1) both}.vsw[hidden]{display:none}.vsw__l{font-size:7px;letter-spacing:.14em;text-transform:uppercase;color:rgba(236,214,166,.75);padding-bottom:2px}.vsw a{display:grid;place-items:center;width:34px;height:34px;border-radius:50%;color:#ecd6a6;font-size:12px;letter-spacing:0;text-decoration:none;border:1px solid rgba(207,174,107,.4);transition:background .3s,color .3s}.vsw a:hover{background:rgba(207,174,107,.18)}.vsw a[aria-current]{background:linear-gradient(120deg,#b48a45,#ecd6a6 50%,#c49a52);color:#0b0b0b;border-color:transparent}.vsw a.vsw__all{display:flex;gap:3px;justify-content:center;align-items:center;width:34px;height:22px;border:0}.vsw__all i{width:3px;height:3px;border-radius:50%;background:#cfae6b}@media (max-width:640px){.vsw{gap:5px;padding:7px 5px 6px 6px;border-radius:12px 0 0 12px;top:auto;bottom:34%;transform:none}.vsw__l{display:none}.vsw a{width:28px;height:28px;font-size:11px}.vsw a.vsw__all{width:28px;height:16px}@keyframes vswIn{from{opacity:0;transform:translateX(100%)}}}@keyframes vswIn{from{opacity:0;transform:translate(100%,-50%)}}${cur === 'b' ? '.lang{display:none!important}' : ''}</style>
<script>(function(){var el=document.getElementById('vsw'),on=${always ? 'true' : 'false'};try{if(/[?&]v(=|&|$)/.test(location.search))sessionStorage.setItem('ll-preview','1');if(sessionStorage.getItem('ll-preview'))on=true}catch(e){if(/[?&]v(=|&|$)/.test(location.search))on=true}if(on)el.hidden=false})();</script>${pick ? picker : ''}
<!--/vsw-->`;

// Design-Auswahl beim ersten Besuch der Startseite (nur in der Vorschau-Phase). Wird erst per JS eingefügt,
// damit ohne Auswahl nichts zusätzlich geladen wird; die Hero-Animation wartet, bis gewählt wurde.
const picker = `
<style>.vsp{position:fixed;inset:0;z-index:10000;display:grid;place-items:center;overflow-y:auto;overscroll-behavior:contain;padding:28px 18px;background:rgba(7,7,7,.95);color:#f3eee4;font:300 15px/1.6 Montserrat,system-ui,sans-serif;animation:vspIn .7s cubic-bezier(.16,1,.3,1) both}.vsp.is-out{opacity:0;transition:opacity .55s cubic-bezier(.16,1,.3,1)}@keyframes vspIn{from{opacity:0}}.vsp__in{width:100%;max-width:980px;display:grid;gap:clamp(22px,4vw,40px);text-align:center}.vsp__logo{display:grid;justify-items:center;line-height:1}.vsp__logo b{font:500 clamp(2.2rem,6vw,3.4rem)/1.1 'Bodoni Moda',serif;letter-spacing:.08em;padding-left:.08em;color:transparent;background:linear-gradient(110deg,#b48a45,#f5e3b8 45%,#c49a52 70%,#ecd6a6);-webkit-background-clip:text;background-clip:text}.vsp__logo em{font:400 clamp(1.7rem,4.4vw,2.5rem)/1.1 'Great Vibes',cursive;font-style:normal;margin-top:-.15em;color:#ecd6a6}.vsp h2{margin-top:10px;font:400 clamp(1.2rem,2.8vw,1.7rem)/1.3 'Cormorant Garamond',serif;letter-spacing:.14em;text-transform:uppercase}.vsp__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(14px,2.4vw,26px)}.vsp__c{display:grid;gap:14px;padding:12px 12px 20px;border:1px solid rgba(207,174,107,.25);border-radius:20px;background:linear-gradient(150deg,rgba(207,174,107,.12),rgba(207,174,107,.02) 50%,rgba(207,174,107,.07)),#0d0d0d;color:inherit;text-decoration:none;cursor:pointer;font:inherit;text-align:center;transition:transform .5s cubic-bezier(.16,1,.3,1),border-color .4s}.vsp__c:hover{transform:translateY(-3px);border-color:rgba(207,174,107,.55)}.vsp__c img{display:block;width:100%;aspect-ratio:16/10;object-fit:cover;object-position:top;border-radius:12px;background:#151515}.vsp__t{font-size:.6rem;font-weight:500;letter-spacing:.3em;text-transform:uppercase;color:#cfae6b}.vsp__n{font:400 clamp(1.2rem,2.2vw,1.55rem)/1.2 'Cormorant Garamond',serif;letter-spacing:.1em;text-transform:uppercase}.vsp__b{justify-self:center;display:inline-flex;align-items:center;min-height:44px;padding:0 26px;border-radius:999px;border:1px solid #cfae6b;color:#ecd6a6;font-size:.64rem;font-weight:500;letter-spacing:.22em;text-transform:uppercase}.vsp__c--a .vsp__b{background:linear-gradient(110deg,#b48a45,#ecd6a6 45%,#c49a52);color:#0b0b0b;border-color:transparent}.vsp__note{font-size:.76rem;color:rgba(243,238,228,.55)}html.vsp-open{overflow:hidden}html.vsp-open .hero *,html.vsp-open .hero{animation-play-state:paused!important}.vsp__c:focus{outline:none}.vsp__c:focus-visible{outline:2px solid #cfae6b;outline-offset:3px}@media (max-width:640px){.vsp{place-items:start center;padding:22px 16px}.vsp__in{gap:18px}.vsp__grid{grid-template-columns:minmax(0,1fr);gap:12px}.vsp__c{gap:8px;padding:10px 10px 16px}.vsp__c img{aspect-ratio:2/1}.vsp__b{min-height:40px}}</style>
<script>(function(){var k='ll-picked',d=document;try{if(sessionStorage.getItem(k)||/[?&]v(=|&|$)/.test(location.search)){sessionStorage.setItem(k,'1');return}}catch(e){return}
var r=d.documentElement;r.classList.add('vsp-open');
var o=d.createElement('div');o.className='vsp';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-label','Design wählen');o.setAttribute('data-lenis-prevent','');
o.innerHTML='<div class="vsp__in"><div class="vsp__logo"><b>LIYAS</b><em>Lounge</em><h2>Welches Design möchten Sie ansehen?</h2></div><div class="vsp__grid">'+
${JSON.stringify(VERSIONS.map((v) => ({ id: v.id, name: v.name, href: v.href })))}.map(function(v){var A=v.id.toUpperCase();return (v.id==='a'?'<button type="button" class="vsp__c vsp__c--a" data-close>':'<a class="vsp__c vsp__c--b" href="'+v.href+'?v">')+'<img src="/assets/img/versionen/'+v.id+'-desktop.webp" alt="" width="1440" height="900"><span class="vsp__t">Version '+A+'</span><span class="vsp__n">'+v.name+'</span><span class="vsp__b">Ansehen</span>'+(v.id==='a'?'</button>':'</a>')}).join('')+
'</div><p class="vsp__note">Mit A / B am rechten Rand können Sie jederzeit wechseln.</p></div>';
d.body.appendChild(o);var b=o.querySelector('[data-close]');
function done(){try{sessionStorage.setItem(k,'1')}catch(e){}}
o.querySelector('.vsp__c--b').addEventListener('click',done);
b.addEventListener('click',function(){done();o.classList.add('is-out');r.classList.remove('vsp-open');setTimeout(function(){o.remove()},600)});
d.addEventListener('keydown',function e(ev){if(ev.key==='Escape'&&d.contains(o)){b.click();d.removeEventListener('keydown',e)}});})();</script>`;

const inject = (file, html) => {
  const p = join(ROOT, file);
  if (!existsSync(p)) return false;
  let s = readFileSync(p, 'utf8').replace(/<!--vsw-->[\s\S]*?<!--\/vsw-->\n?/, '');
  s = s.replace('</body>', html + '\n</body>');
  writeFileSync(p, s);
  return true;
};

inject('index.html', switcher('a', { pick: PREVIEW }));
inject('en/index.html', switcher('a', { home: '/en' }));

// Version B: Links bleiben in Version B, keine Erfahrungs-Angabe, die wir nicht belegen können
const kp = join(ROOT, 'klassisch.html');
if (existsSync(kp)) {
  let k = readFileSync(kp, 'utf8')
    .replace(/href="\/"/g, 'href="/klassisch"')
    .replace(/, mit über 15 Jahren Erfahrung\./g, '.');
  writeFileSync(kp, k);
  inject('klassisch.html', switcher('b', { always: true }));
}

// Auswahlseite /versionen
const page = `<!doctype html>
<html lang="de-CH">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Liyas Lounge – Design-Versionen</title>
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#0b0b0b">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/fonts/cormorant-var.woff2" as="font" type="font/woff2" crossorigin>
<style>
@font-face{font-family:'Bodoni Moda';src:url('/assets/fonts/bodoni-moda-var.woff2') format('woff2');font-weight:400 700;font-display:swap}
@font-face{font-family:'Cormorant Garamond';src:url('/assets/fonts/cormorant-var.woff2') format('woff2');font-weight:300 600;font-display:swap}
@font-face{font-family:'Cormorant Garamond';src:url('/assets/fonts/cormorant-italic-var.woff2') format('woff2');font-weight:300 600;font-style:italic;font-display:swap}
@font-face{font-family:'Great Vibes';src:url('/assets/fonts/great-vibes.woff2') format('woff2');font-display:swap}
@font-face{font-family:'Montserrat';src:url('/assets/fonts/montserrat-var.woff2') format('woff2');font-weight:300 600;font-display:swap}
:root{--k0:#070707;--k1:#0d0d0d;--gold:#cfae6b;--gold-l:#ecd6a6;--txt:#f3eee4;--txt2:rgba(243,238,228,.62);--hair:rgba(207,174,107,.22);--ease:cubic-bezier(.16,1,.3,1)}
*{box-sizing:border-box;margin:0;padding:0}
html{-webkit-text-size-adjust:100%}
body{min-height:100vh;min-height:100svh;background:radial-gradient(120% 70% at 50% 0,#17130c 0,var(--k0) 60%);color:var(--txt);font:300 15px/1.6 Montserrat,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}
.wrap{max-width:1180px;margin:0 auto;padding:clamp(44px,7vw,90px) 20px clamp(40px,6vw,70px);display:grid;gap:clamp(36px,5vw,60px)}
.top{display:grid;justify-items:center;gap:14px;text-align:center}
.logo{display:grid;justify-items:center;line-height:1}
.logo b{font:500 clamp(2.6rem,7vw,4.2rem)/1.1 'Bodoni Moda',serif;letter-spacing:.08em;padding-left:.08em;color:transparent;background:linear-gradient(110deg,#b48a45,#f5e3b8 45%,#c49a52 70%,#ecd6a6);-webkit-background-clip:text;background-clip:text}
.logo em{font:400 clamp(2rem,5vw,3rem)/1.1 'Great Vibes',cursive;font-style:normal;margin-top:-.15em;color:var(--gold-l)}
h1{margin-top:14px;font:400 clamp(1.5rem,3.4vw,2.2rem)/1.25 'Cormorant Garamond',serif;letter-spacing:.14em;text-transform:uppercase}
.top p{max-width:520px;color:var(--txt2)}
.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(20px,3vw,36px)}
.card{position:relative;display:grid;gap:22px;padding:clamp(14px,1.6vw,20px) clamp(14px,1.6vw,20px) clamp(24px,2.6vw,32px);border:1px solid var(--hair);border-radius:24px;background:linear-gradient(150deg,rgba(207,174,107,.12),rgba(207,174,107,.02) 50%,rgba(207,174,107,.07)),var(--k1);transition:transform .6s var(--ease),border-color .4s,box-shadow .6s var(--ease)}
.card:hover{transform:translateY(-4px);border-color:rgba(207,174,107,.5);box-shadow:0 30px 60px -36px rgba(207,174,107,.35)}
.shot{position:relative;aspect-ratio:16/10;border-radius:14px;overflow:hidden;background:#111}
.shot img{display:block;width:100%;height:100%;object-fit:cover;object-position:top;transition:transform 1.2s var(--ease)}
.card:hover .shot>img{transform:scale(1.03)}
.phone{position:absolute;right:4%;bottom:-4%;width:24%;aspect-ratio:9/19.5;border-radius:16px;overflow:hidden;border:3px solid #1b1b1b;box-shadow:0 18px 40px -10px rgba(0,0,0,.8),0 0 0 1px rgba(207,174,107,.35)}
.phone img{display:block;width:100%;height:100%;object-fit:cover;object-position:top}
.meta{display:grid;gap:8px;padding:0 6px;text-align:center;justify-items:center}
.tag{font-size:.62rem;font-weight:500;letter-spacing:.3em;text-transform:uppercase;color:var(--gold)}
h2{font:400 clamp(1.6rem,2.6vw,2rem)/1.2 'Cormorant Garamond',serif;letter-spacing:.1em;text-transform:uppercase}
.meta p{color:var(--txt2);font-size:.9rem;max-width:360px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:50px;margin-top:10px;padding:0 30px;border-radius:999px;font-size:.7rem;font-weight:500;letter-spacing:.22em;text-transform:uppercase;border:1px solid var(--gold);color:var(--gold-l);transition:background .4s,color .4s}
.card:hover .btn,.btn:focus-visible{background:var(--gold);color:#0b0b0b}
.card--a .btn{background:linear-gradient(110deg,#b48a45,#ecd6a6 45%,#c49a52);color:#0b0b0b;border-color:transparent}
.card>a.cover{position:absolute;inset:0;z-index:1;border-radius:inherit}
.note{text-align:center;color:var(--txt2);font-size:.8rem;letter-spacing:.04em}
.note b{display:inline-grid;place-items:center;width:22px;height:22px;margin:0 2px;border-radius:50%;border:1px solid rgba(207,174,107,.5);color:var(--gold-l);font-weight:500;font-size:.7rem}
@media (max-width:760px){.grid{grid-template-columns:minmax(0,1fr)}.phone{width:26%}}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>
</head>
<body>
<main class="wrap">
  <header class="top">
    <div class="logo" aria-label="Liyas Lounge"><b>LIYAS</b><em>Lounge</em></div>
    <h1>Zwei Designs zur Auswahl</h1>
    <p>Beide Versionen sind voll funktionsfähig und für Handy, Tablet und Computer optimiert. Einfach öffnen, durchscrollen und vergleichen.</p>
  </header>
  <div class="grid">
${VERSIONS.map((v) => `    <article class="card card--${v.id}">
      <a class="cover" href="${v.href}?v" aria-label="Version ${v.id.toUpperCase()} – ${v.name} ansehen"></a>
      <div class="shot"><img src="/assets/img/versionen/${v.id}-desktop.webp" alt="Version ${v.id.toUpperCase()} auf dem Computer" width="1440" height="900" loading="eager"><span class="phone"><img src="/assets/img/versionen/${v.id}-mobile.webp" alt="Version ${v.id.toUpperCase()} auf dem Handy" width="390" height="844"></span></div>
      <div class="meta"><span class="tag">Version ${v.id.toUpperCase()}</span><h2>${v.name}</h2><p>${v.text}</p><span class="btn">Ansehen</span></div>
    </article>`).join('\n')}
  </div>
  <p class="note">Tipp: Mit <b>A</b> <b>B</b> am rechten Bildschirmrand jederzeit zwischen den Versionen wechseln.</p>
</main>
</body>
</html>
`;
writeFileSync(join(ROOT, 'versionen.html'), page);
console.log('✓ versionen.html + A/B-Umschalter (/, /en, /klassisch)');
