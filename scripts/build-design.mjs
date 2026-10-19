// Design-Vorschau für die Kundin: zwei Landing-Varianten in EINER Seite (/design).
// Beim Laden wählt man «Version 1» oder «Version 2»; ein Umschalter unten links wechselt jederzeit.
// Inhalte kommen aus scripts/content.mjs (gleiche Texte, Preise, Bilder wie die Website).
// Aufruf: node scripts/build-design.mjs  → schreibt design.html
import { writeFileSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, CATEGORIES, TREATMENTS, TEAM, REVIEWS, HOME_FAQ, HOME } from './content.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const IMG = JSON.parse(readFileSync(join(ROOT, 'scripts/imgmeta.json'), 'utf8'));
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const chf = (n) => 'CHF ' + n;
const minPrice = (t) => Math.min(...t.prices.filter((p) => p.price).map((p) => p.price));
const catFrom = (id) => Math.min(...TREATMENTS.filter((t) => t.category === id).map(minPrice));
const wa = (text) => esc(`${SITE.whatsapp}?text=${encodeURIComponent(text)}`);
const WA_DEFAULT = 'Hallo Liyas Lounge, ich hätte gerne eine kostenlose Beratung.';
const WA_CAT = (n) => `Hallo Liyas Lounge, ich interessiere mich für ${n} und hätte gerne eine kostenlose Beratung.`;
const hours = `${SITE.hours.map((h) => `${h.de} ${h.opens}–${h.closes}`).join(', ')} · ${SITE.hoursNote.de}`;
const waNumber = '+41 79 509 06 60';
const igHandle = '@' + SITE.instagram.replace(/\/+$/, '').split('/').pop();

function pic(name, alt, { sizes = '100vw', eager = false, cls = '', pos = '' } = {}) {
  const m = IMG[name];
  if (!m) throw new Error('Bild fehlt: ' + name);
  const set = m.widths.map((w) => `/assets/img/${name}-${w}.webp ${w}w`).join(', ');
  const portrait = IMG[name + '-portrait'] ? `<source media="(orientation: portrait) and (max-width: 900px)" type="image/webp" srcset="${IMG[name + '-portrait'].widths.map((w) => `/assets/img/${name}-portrait-${w}.webp ${w}w`).join(', ')}" sizes="100vw">` : '';
  const style = [pos && `object-position:${pos}`, m.lqip && `background:url(${m.lqip}) center/cover`].filter(Boolean).join(';');
  return `<picture${cls ? ` class="${cls}"` : ''}>${portrait}<source type="image/webp" srcset="${set}" sizes="${sizes}"><img src="/assets/img/${name}.jpg" alt="${esc(alt)}" width="${m.w}" height="${m.h}" style="${style}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></picture>`;
}
const I = {
  arrow: '<path d="M7 17 17 7M8 7h9v9"/>',
  wa: '<path d="M3 21l1.7-5A8.5 8.5 0 1 1 8 19.4z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1.2-1.3-1.8-1-1 .8a4 4 0 0 1-2.2-2.2l.8-1-1-1.8z" fill="currentColor" stroke="none"/>',
  ig: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" fill="currentColor" stroke="none"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
};
const ico = (n) => `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]}</svg>`;
const stars = () => `<span class="stars" aria-label="5 von 5 Sternen">${ico('star').repeat(5)}</span>`;

// Logo nach Vorlage der Kundin: Serif-Versalien mit Gold-Glitter, überlappende Schreibschrift, gesperrte Zeile
const logo = (cls = '') => `<span class="lux ${cls}" role="img" aria-label="Liyas Lounge – Medical Aesthetic &amp; Beauty"><span class="lux__main" aria-hidden="true">LIYAS</span><span class="lux__script" aria-hidden="true">Lounge</span><span class="lux__tag" aria-hidden="true">Medical Aesthetic &amp; Beauty</span><i class="lux__spark s1"></i><i class="lux__spark s2"></i><i class="lux__spark s3"></i></span>`;

const NAV = [['#behandlungen', 'Behandlungen'], ['#ueber-uns', 'Über uns'], ['#bewertungen', 'Bewertungen'], ['#faq', 'FAQ'], ['#kontakt', 'Kontakt']];
const owner = TEAM[0];
const FAQ = HOME_FAQ.slice(0, 6);
const REV_TITLES = ['Ehrlich beraten', 'Ganz natürlich', 'Sehr diskret', 'Einfach top'];
const POLICIES = [
  ['Erstberatung', 'Kostenlos und unverbindlich – wir nehmen uns Zeit für Ihre Fragen.'],
  ['Termine', 'Am einfachsten per WhatsApp (nur Nachrichten). Wir melden uns schnellstmöglich.'],
  ['Absagen', 'Bitte spätestens 24 Stunden vor dem Termin absagen oder verschieben.'],
  ['Zahlung', `Direkt nach der Behandlung – ${SITE.payment.de}.`],
  ['Gesundheit', 'Bitte informieren Sie uns vorab über Allergien, Medikamente oder eine Schwangerschaft.'],
  ['Pünktlichkeit', 'Bei Verspätung kann sich die Behandlungszeit verkürzen.'],
];
const PREP = ['Gerne ungeschminkt erscheinen', 'Fragen und Wünsche notieren', 'Medikamente & Allergien angeben', 'Etwas Zeit einplanen'];
const navLinks = (cls) => NAV.map(([h, l]) => `<a class="${cls}" href="${h}">${l}</a>`).join('');
const menu = (v) => `<div class="mmenu" id="menu-${v}" hidden><nav>${NAV.map(([h, l], i) => `<a href="${h}" data-close-menu><small>0${i + 1}</small>${l}</a>`).join('')}</nav><a class="btn btn--wa" href="${wa(WA_DEFAULT)}" target="_blank" rel="noopener">${ico('wa')}<span>WhatsApp</span></a><p>${esc(SITE.street)}, ${SITE.zip} ${SITE.city}<br>${esc(hours)}</p></div>`;

/* ==================== Version 1 – «Soft Clinic» (hell, Creme & Taupe) ==================== */
const v1 = `<div class="v v1" data-v="1" hidden>
<header class="v1-nav" data-nav>
  <a class="v1-nav__logo" href="#top-1" aria-label="Liyas Lounge – nach oben">${logo('lux--light lux--sm')}</a>
  <nav class="v1-nav__links">${navLinks('')}</nav>
  <a class="v1-btn v1-btn--dark v1-nav__cta" href="${wa(WA_DEFAULT)}" target="_blank" rel="noopener">Termin anfragen</a>
  <button class="burger" type="button" aria-controls="menu-1" aria-expanded="false" aria-label="Menü"><span></span><span></span></button>
</header>
${menu(1)}
<main>
<section class="v1-hero" id="top-1">
  ${pic(HOME.heroImage, 'Die Inhaberin der Liyas Lounge in ihrem Studio in Olten', { eager: true, cls: 'v1-hero__img', pos: '62% 30%' })}
  <div class="v1-hero__in">
    <h1 class="v1-hero__word" data-up><span>LIYAS</span> <span>LOUNGE</span></h1>
    <p class="v1-hero__sub" data-up style="--d:.15s">Medical Aesthetic &amp; Beauty · Olten</p>
    <div class="v1-hero__ctas" data-up style="--d:.3s"><a class="v1-btn v1-btn--light" href="${wa(WA_DEFAULT)}" target="_blank" rel="noopener">Kostenlose Beratung</a><a class="v1-btn v1-btn--ghost" href="#behandlungen">Behandlungen</a></div>
  </div>
  <div class="v1-strip" aria-hidden="true"><div class="v1-strip__track"><span>${TREATMENTS.map((t) => esc(t.name)).join('<i>—</i>')}<i>—</i></span><span>${TREATMENTS.map((t) => esc(t.name)).join('<i>—</i>')}<i>—</i></span></div></div>
</section>

<section class="v1-intro">
  <p class="v1-kicker" data-up>Willkommen in der Liyas Lounge</p>
  <h2 class="v1-intro__h" data-up><em>Natürliche</em> Ästhetik,<br><em>ehrlich</em> beraten.</h2>
  <p class="v1-intro__p" data-up>${esc('Medizinische Ästhetik & Beauty in Olten – persönlich betreut, mit viel Feingefühl und dem Ziel, dass Sie frischer aussehen, nicht verändert.')}</p>
  <p class="v1-intro__note" data-up>Buchen Sie Ihre kostenlose Erstberatung – der erste Schritt zu Ihrem persönlichen Plan.</p>
</section>

<section class="v1-treat" id="behandlungen">
  <h2 class="v1-big" data-up>Behandlungen <em>für Gesicht, Haut &amp; Sie</em></h2>
  <ul class="v1-frames">${CATEGORIES.map((c, i) => `<li data-up style="--d:${i * .1}s"><a href="${wa(WA_CAT(c.name))}" target="_blank" rel="noopener"><span class="v1-frame">${pic(c.image, c.name, { sizes: '(max-width: 760px) 86vw, 30vw' })}</span><span class="v1-frames__name">${esc(c.name)}</span><span class="v1-frames__short">${esc(c.short)}</span><span class="v1-frames__from">ab ${chf(catFrom(c.id))}</span></a></li>`).join('')}</ul>
</section>

<section class="v1-split" id="ueber-uns">
  <div class="v1-split__img" data-up>${pic(owner.image, owner.alt, { sizes: '(max-width: 900px) 100vw, 50vw', pos: '50% 20%' })}</div>
  <div class="v1-split__txt">
    <p class="v1-kicker" data-up>Über uns</p>
    <h2 class="v1-h" data-up>Persönlich. <em>Mit Herz &amp; Sorgfalt.</em></h2>
    <p data-up>Hinter der Liyas Lounge steht eine Gastgeberin mit Leidenschaft für Ästhetik und Beauty, viel Feingefühl und dem Anspruch, dass Sie sich rundum wohlfühlen – von der ersten Nachricht bis zur Nachsorge.</p>
    <dl class="v1-list" data-up>
      <div><dt>Persönliche Betreuung</dt><dd>Wir nehmen uns Zeit für Sie und all Ihre Fragen – ohne Zeitdruck.</dd></div>
      <div><dt>Ehrliche Einschätzung</dt><dd>Wir empfehlen nur, was zu Ihnen passt – auch wenn das weniger ist.</dd></div>
      <div><dt>Hygiene &amp; Qualität</dt><dd>Saubere Abläufe und ausschliesslich zugelassene Produkte.</dd></div>
    </dl>
  </div>
</section>

<section class="v1-why">
  <h2 class="v1-big" data-up>Schön altern <em>– mit ein wenig Hilfe</em></h2>
  <ul class="v1-trio">${[['studio-liyas-lounge-behandlungsraum', 'Ruhiger Behandlungsraum'], ['faltenrelaxing-olten', 'Natürliche Ergebnisse'], ['studio-liyas-lounge-details', 'Hochwertige Produkte']].map(([n, l], i) => `<li data-up style="--d:${i * .1}s"><span class="v1-frame">${pic(n, l, { sizes: '(max-width: 760px) 86vw, 30vw' })}</span><span>${l}</span></li>`).join('')}</ul>
</section>

<section class="v1-love" id="bewertungen">
  ${pic('termin-liyas-lounge-olten', 'Calla-Lilien in der Liyas Lounge', { cls: 'v1-love__bg' })}
  <div class="v1-love__box" data-up>
    <h2 class="v1-love__h">Client <em>Love</em></h2>
    ${stars()}
    <div class="v1-quotes" data-quotes>${REVIEWS.map((r, i) => `<figure class="${i ? '' : 'is-on'}"><blockquote>„${esc(r.text)}“</blockquote><figcaption>${esc(r.name)} · ${esc(r.tag)}</figcaption></figure>`).join('')}</div>
    <a class="v1-love__g" href="${SITE.googleMaps}" target="_blank" rel="noopener">${String(SITE.googleRating).replace('.', ',')} ★ · ${SITE.googleReviewCount} Google-Bewertungen</a>
  </div>
</section>

<section class="v1-insta">
  <div class="v1-insta__head" data-up><h2 class="v1-h">Folgen Sie uns <em>auf Instagram</em></h2><a href="${SITE.instagram}" target="_blank" rel="noopener">${igHandle}</a></div>
  <ul class="v1-insta__row">${['inhaberin-liyas-lounge-olten', 'dermal-filler-olten', 'studio-liyas-lounge-empfang', 'facial-treatment-olten', 'beauty-wimpern-olten', 'hyaluron-produkt-olten'].map((n) => `<li><a href="${SITE.instagram}" target="_blank" rel="noopener">${pic(n, '', { sizes: '(max-width: 760px) 33vw, 16vw' })}</a></li>`).join('')}</ul>
</section>

<section class="v1-faq" id="faq">
  <h2 class="v1-big" data-up>Fragen <em>&amp; Antworten</em></h2>
  <div class="v1-acc" data-up>${FAQ.map(([q, a]) => `<details><summary>${esc(q)}${ico('plus')}</summary><p>${esc(a)}</p></details>`).join('')}</div>
</section>

<section class="v1-touch" id="kontakt">
  <div class="v1-touch__txt">
    <h2 class="v1-h" data-up>Get in <em>touch</em></h2>
    <p data-up>Ob Sie feine Linien glätten, Volumen zurückgewinnen oder Ihrer Haut etwas Gutes tun möchten – wir beraten Sie persönlich, ehrlich und kostenlos.</p>
    <dl data-up>
      <div><dt>WhatsApp (nur Nachrichten)</dt><dd><a href="${wa(WA_DEFAULT)}" target="_blank" rel="noopener">${waNumber}</a></dd></div>
      <div><dt>Adresse</dt><dd><a href="${SITE.route}" target="_blank" rel="noopener">${esc(SITE.street)}, ${SITE.zip} ${SITE.city}</a></dd></div>
      <div><dt>Öffnungszeiten</dt><dd>${esc(hours)}</dd></div>
      <div><dt>Instagram</dt><dd><a href="${SITE.instagram}" target="_blank" rel="noopener">${igHandle}</a></dd></div>
    </dl>
    <a class="v1-btn v1-btn--dark" href="${wa(WA_DEFAULT)}" target="_blank" rel="noopener" data-up>Termin per WhatsApp anfragen</a>
  </div>
  <div class="v1-touch__img">${pic('studio-liyas-lounge-eingang', 'Eingang der Liyas Lounge in Olten', { sizes: '(max-width: 900px) 100vw, 50vw' })}</div>
</section>
</main>
<footer class="v1-foot">${logo('lux--light')}<p>© ${new Date().getFullYear()} Liyas Lounge · ${esc(SITE.street)}, ${SITE.zip} ${SITE.city}</p><p><a href="/agb">AGB</a> · <a href="/datenschutz">Datenschutz</a> · <a href="/impressum">Impressum</a></p></footer>
</div>`;

/* ==================== Version 2 – «Lounge Noir» (Taupe & Schwarz, Gold-Glitter-Logo) ==================== */
const v2 = `<div class="v v2" data-v="2" hidden>
<div class="v2-bar"><span>Liyas Lounge</span><em>Medical Aesthetic &amp; Beauty</em><span>${esc(SITE.hours[0].de)} ${SITE.hours[0].opens}–${SITE.hours[0].closes}</span><a href="${wa(WA_DEFAULT)}" target="_blank" rel="noopener">WhatsApp ${waNumber}</a></div>
<header class="v2-nav" data-nav>
  <nav class="v2-nav__links">${navLinks('')}</nav>
  <a class="v2-pill v2-nav__cta" href="${wa(WA_DEFAULT)}" target="_blank" rel="noopener">Termin anfragen</a>
  <button class="burger burger--light" type="button" aria-controls="menu-2" aria-expanded="false" aria-label="Menü"><span></span><span></span></button>
</header>
${menu(2)}
<main>
<section class="v2-hero" id="top-2">
  ${pic(HOME.heroImage, 'Die Inhaberin der Liyas Lounge in ihrem Studio in Olten', { eager: true, cls: 'v2-hero__img', pos: '62% 22%' })}
  <div class="v2-hero__logo" data-up>${logo('lux--xl')}</div>
</section>

<section class="v2-oval" id="ueber-uns">
  <div class="v2-oval__in">
    <p class="v2-script" data-up>Lernen Sie kennen</p>
    <h2 class="v2-h" data-up>Ihre Expertin</h2>
    <p class="v2-p" data-up>Hinter der Liyas Lounge steht eine Gastgeberin mit Leidenschaft für Ästhetik und Beauty – persönlich, ehrlich und mit viel Feingefühl. Jede Behandlung beginnt mit Zuhören und einer kostenlosen Beratung.</p>
    <figure class="v2-photo" data-up>${pic('beratung-inhaberin-olten', 'Persönliche Beratung in der Liyas Lounge Olten', { sizes: '(max-width: 900px) 92vw, 640px', pos: '50% 35%' })}<figcaption>Jede Behandlung beginnt mit einer persönlichen, kostenlosen Beratung.</figcaption></figure>
    <span class="v2-rule" aria-hidden="true"></span>
    <p class="v2-script" data-up>Kontakt</p>
    <h2 class="v2-h" data-up>Get in touch</h2>
    <ul class="v2-touch" data-up>
      <li>${ico('wa')}<a href="${wa(WA_DEFAULT)}" target="_blank" rel="noopener">${waNumber} <small>(nur Nachrichten)</small></a></li>
      <li>${ico('ig')}<a href="${SITE.instagram}" target="_blank" rel="noopener">${igHandle}</a></li>
      <li>${ico('pin')}<a href="${SITE.route}" target="_blank" rel="noopener">${esc(SITE.street)}, ${SITE.zip} ${SITE.city}</a></li>
      <li>${ico('clock')}<span>${esc(hours)}</span></li>
    </ul>
    <span class="v2-rule" aria-hidden="true"></span>
    <p class="v2-script" data-up id="behandlungen">Unsere</p>
    <h2 class="v2-h" data-up>Behandlungen</h2>
    <div class="v2-services" data-up>${CATEGORIES.map((c) => `<div><h3>${esc(c.name)}</h3><p>${esc(c.short)}</p><b>ab ${chf(catFrom(c.id))}</b></div>`).join('')}</div>
    <a class="v2-pill" href="${wa(WA_DEFAULT)}" target="_blank" rel="noopener" data-up>Termin per WhatsApp anfragen</a>
  </div>
</section>

<section class="v2-circles">
  <div class="v2-circles__txt" data-up><p class="v2-script v2-script--light">Was uns</p><h2 class="v2-h v2-h--light">auszeichnet</h2><p>Medizinische Ästhetik, Haut &amp; Gesicht und Beauty – typgerecht geplant, sorgfältig umgesetzt.</p></div>
  <ul>${CATEGORIES.map((c, i) => `<li data-up style="--d:${i * .12}s"><a href="${wa(WA_CAT(c.name))}" target="_blank" rel="noopener">${pic(c.image, c.name, { sizes: '260px' })}<span>${esc(c.name)}</span></a></li>`).join('')}</ul>
</section>

<section class="v2-reviews" id="bewertungen">
  <p class="v2-script v2-script--light" data-up>Kundinnen</p>
  <h2 class="v2-h v2-h--light" data-up>Bewertungen</h2>
  <ul>${REVIEWS.slice(0, 4).map((r, i) => `<li data-up style="--d:${i * .08}s">${stars()}<b>„${REV_TITLES[i]}“</b><p>${esc(r.text)}</p><small>– ${esc(r.name)}</small></li>`).join('')}</ul>
  <a class="v2-pill v2-pill--soft" href="${SITE.googleMaps}" target="_blank" rel="noopener">${String(SITE.googleRating).replace('.', ',')} ★ · ${SITE.googleReviewCount} Google-Bewertungen</a>
</section>

<section class="v2-policies">
  ${pic('lounge-liyas-olten', '', { cls: 'v2-policies__bg' })}
  <div class="v2-policies__in">
    <p class="v2-script v2-script--light" data-up>Gut zu</p>
    <h2 class="v2-h v2-h--light" data-up>Wissen</h2>
    <ul>${POLICIES.map(([t, d], i) => `<li data-up style="--d:${i * .06}s"><b>${t}</b><p>${esc(d)}</p></li>`).join('')}</ul>
  </div>
</section>

<section class="v2-prep">
  ${pic('beratung-liyas-lounge-olten', '', { cls: 'v2-prep__bg' })}
  <div class="v2-prep__in">
    <p class="v2-script" data-up>Vor Ihrem</p>
    <h2 class="v2-h v2-h--dark" data-up>Termin</h2>
    <ul>${PREP.map((p) => `<li data-up>${p}</li>`).join('')}</ul>
  </div>
</section>

<section class="v2-faq" id="faq">
  <p class="v2-script" data-up>Häufige</p>
  <h2 class="v2-h" data-up>Fragen</h2>
  <div class="v2-acc" data-up>${FAQ.map(([q, a]) => `<details><summary>${esc(q)}${ico('plus')}</summary><p>${esc(a)}</p></details>`).join('')}</div>
</section>

<section class="v2-follow" id="kontakt">
  <div class="v2-follow__txt">
    <h2 class="v2-h v2-h--light" data-up>Folgen Sie</h2>
    <p class="v2-script v2-script--light v2-script--under" data-up>uns für News</p>
    <ul data-up>
      <li><a href="${SITE.instagram}" target="_blank" rel="noopener">${ico('ig')}${igHandle}</a></li>
      <li><a href="${wa(WA_DEFAULT)}" target="_blank" rel="noopener">${ico('wa')}${waNumber}</a></li>
      <li><a href="${SITE.route}" target="_blank" rel="noopener">${ico('pin')}${esc(SITE.street)}, ${SITE.city}</a></li>
    </ul>
    <a class="v2-pill v2-pill--gold" href="${wa(WA_DEFAULT)}" target="_blank" rel="noopener" data-up>Jetzt Termin anfragen</a>
  </div>
  <div class="v2-phone" data-up><div class="v2-phone__screen">${pic(owner.image, owner.alt, { sizes: '280px', pos: '50% 18%' })}<span>${igHandle}</span></div></div>
</section>
</main>
<footer class="v2-foot">${logo()}<p><a href="/agb">AGB</a> · <a href="/datenschutz">Datenschutz</a> · <a href="/impressum">Impressum</a></p><div class="v2-bar v2-bar--foot"><span>© ${new Date().getFullYear()} Liyas Lounge</span><em>${esc(SITE.street)}, ${SITE.zip} ${SITE.city}</em><span>${esc(SITE.hours[0].de)} ${SITE.hours[0].opens}–${SITE.hours[0].closes}</span></div></footer>
</div>`;

// eindeutige IDs: Version 2 bekommt das Suffix «-2» (Anker und Menü-Links ebenso)
const SECTIONS = 'behandlungen|ueber-uns|bewertungen|faq|kontakt';
const v2u = v2.replace(new RegExp(`id="(${SECTIONS})"`, 'g'), 'id="$1-2"').replace(new RegExp(`href="#(${SECTIONS})"`, 'g'), 'href="#$1-2"');

/* ==================== Auswahl beim Laden + Umschalter ==================== */
const chooser = `<div class="pick" id="pick" role="dialog" aria-modal="true" aria-labelledby="pick-t">
  <div class="pick__head">${logo('lux--md')}<h1 id="pick-t">Design-Vorschau</h1><p>Zwei Varianten derselben Landingpage – wählen Sie eine Version.</p></div>
  <div class="pick__opts">
    <button type="button" class="pick__opt pick__opt--1" data-pick="1">${pic(HOME.heroImage, '', { sizes: '50vw', pos: '62% 30%' })}<span class="pick__lbl"><small>Version 1</small><b>Soft Clinic</b><em>Hell · Creme &amp; Taupe · gross, luftig, editorial</em><i>Ansehen →</i></span></button>
    <button type="button" class="pick__opt pick__opt--2" data-pick="2">${pic(owner.image, '', { sizes: '50vw', pos: '50% 20%' })}<span class="pick__lbl"><small>Version 2</small><b>Lounge Noir</b><em>Taupe &amp; Schwarz · Gold-Glitter-Logo · Oval</em><i>Ansehen →</i></span></button>
  </div>
</div>
<div class="switch" id="switch" hidden><button type="button" data-pick="1">Version 1</button><button type="button" data-pick="2">Version 2</button><button type="button" data-open-pick aria-label="Auswahl öffnen">⌂</button></div>`;

const css = readFileSync(join(ROOT, 'assets/css/design.css'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{};,>])\s*/g, '$1').replace(/;}/g, '}').trim();
const js = readFileSync(join(ROOT, 'assets/js/design.js'), 'utf8');

const html = `<!doctype html>
<html lang="de-CH">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Design-Vorschau – Liyas Lounge Olten</title>
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#0d0c0b">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/fonts/bodoni-moda-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/great-vibes.woff2" as="font" type="font/woff2" crossorigin>
<style>${css}</style>
<script>document.documentElement.classList.add('js')</script>
</head>
<body>
${chooser}
${v1}
${v2u}
<script>${js}</script>
</body>
</html>
`;
writeFileSync(join(ROOT, 'design.html'), html);
// Die Auswahl ist auch die Startseite (/), solange die Kundin zwischen den Versionen wählt.
// Die bisherige Landing bleibt unter /en (Englisch) bzw. kann über START_PAGE = false wiederhergestellt werden.
export const START_PAGE = false; // Startseite kommt jetzt aus build-landing.mjs
if (START_PAGE) {
  // Bisherige Landing (Perfect-Shape-Stil, von build.mjs erzeugt) als /klassisch sichern – zum Zeigen für die Kundin
  const classic = readFileSync(join(ROOT, 'index.html'), 'utf8');
  if (!classic.includes('id="pick"')) writeFileSync(join(ROOT, 'klassisch.html'), classic.replace(/<meta name="robots"[^>]*>/, '<meta name="robots" content="noindex, nofollow">').replace(/<link rel="canonical"[^>]*>\n?/, '').replace(/<link rel="alternate" hreflang[^>]*>\n?/g, ''));
  // Startseite: nur Version 2 (ohne Auswahl und Umschalter)
  const onlyV2 = `<!doctype html>` + html.slice('<!doctype html>'.length)
    .replace(/<div class="pick"[\s\S]*?<div class="switch"[^>]*>[\s\S]*?<\/div>/, '')
    .replace(/<div class="v v1"[\s\S]*?<\/footer>\n<\/div>/, '')
    .replace('<div class="v v2" data-v="2" hidden>', '<div class="v v2" data-v="2">');
  const home = onlyV2
    .replace('<meta name="robots" content="noindex, nofollow">', `<meta name="robots" content="index, follow">\n<meta name="description" content="Liyas Lounge Olten – Medical Aesthetic &amp; Beauty an der Hammerallee 23. Persönlich betreut, ehrlich beraten. Kostenlose Beratung per WhatsApp.">\n<link rel="canonical" href="${SITE.url}/">`)
    .replace('<title>Design-Vorschau – Liyas Lounge Olten</title>', '<title>Liyas Lounge Olten – Medical Aesthetic &amp; Beauty</title>');
  writeFileSync(join(ROOT, 'index.html'), home);
}
console.log('✓ design.html' + (START_PAGE ? ' + index.html (Startseite = Versionsauswahl)' : '') + ' (' + Math.round(html.length / 1024) + ' KB)');
