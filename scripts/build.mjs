// Statischer Generator für liyaslounge.ch – One-Page-Landing (DE unter /, EN unter /en) + Rechtstexte (DE).
// Inhalte: scripts/content.mjs (DE) und scripts/content.en.mjs (EN). Aufruf: node scripts/build.mjs
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as DE from './content.mjs';
import { EN_CATEGORIES, EN_TREATMENTS, EN_TEAM, EN_REVIEW_TAGS, EN_REVIEW_TEXTS, EN_HOME_FAQ } from './content.en.mjs';

const { SITE, HOME, AGB } = DE;
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const IMG = JSON.parse(readFileSync(join(ROOT, 'scripts/imgmeta.json'), 'utf8'));
const TODAY = new Date().toISOString().slice(0, 10);
const VERSION = Date.now().toString(36);
const isSet = (v) => !!v && !String(v).includes('['); // Platzhalter in [eckigen Klammern] gelten als «nicht gesetzt»

/* ---------- Sprachdaten ---------- */
const DATA = {
  de: { TREATMENTS: DE.TREATMENTS, CATEGORIES: DE.CATEGORIES, TEAM: DE.TEAM, REVIEWS: DE.REVIEWS, FAQ: DE.HOME_FAQ },
  en: {
    TREATMENTS: DE.TREATMENTS.map((t) => {
      const e = EN_TREATMENTS[t.slug];
      if (!e) throw new Error('EN-Inhalt fehlt: ' + t.slug);
      return { ...t, ...e, prices: t.prices.map((p, i) => ({ ...p, priceText: undefined, ...e.prices[i] })) };
    }),
    CATEGORIES: DE.CATEGORIES.map((c) => ({ ...c, ...EN_CATEGORIES[c.id] })),
    TEAM: DE.TEAM.map((p, i) => ({ ...p, ...EN_TEAM[i] })),
    REVIEWS: DE.REVIEWS.map((r, i) => ({ ...r, tag: EN_REVIEW_TAGS[i], text: EN_REVIEW_TEXTS[i] || r.text })),
    FAQ: EN_HOME_FAQ,
  },
};

/* ---------- Texte ---------- */
const STR = {
  de: {
    htmlLang: 'de-CH', ogLocale: 'de_CH', ogAlt: 'en_GB', home: '/',
    title: 'Liyas Lounge Olten – Medical Aesthetic & Beauty | Filler, Facials, HIFU',
    description: 'Medizinische Ästhetik & Beauty in Olten: Dermal Filler, Faltenrelaxing, Facials, HIFU 5D, Permanent Make-up & mehr – individuell geplant, ehrlich beraten. Kostenlose Erstberatung.',
    skip: 'Zum Inhalt springen', homeAria: 'Liyas Lounge Olten – zum Seitenanfang', langAria: 'Sprache wählen', menu: 'Menü öffnen', menuClose: 'Menü schliessen',
    ids: { treatments: 'behandlungen', process: 'ablauf', studio: 'studio', about: 'ueber-uns', faq: 'faq', contact: 'kontakt', prices: 'preisliste' },
    nav: { treatments: 'Behandlungen', process: 'Ablauf', studio: 'Studio', about: 'Über uns', faq: 'FAQ', contact: 'Kontakt' },
    book: 'Termin buchen', consult: 'Kostenlose Beratung',
    waConsult: 'Hallo Liyas Lounge, ich interessiere mich für eine kostenlose Beratung.',
    waTreat: (n) => `Hallo Liyas Lounge, ich interessiere mich für ${n}. Wann hätten Sie einen Termin frei?`,
    hero: {
      eyebrow: 'Medical Aesthetic & Beauty · Olten', l1: 'Natürliche', l2: 'Balance.', l3: 'Einfach Sie.',
      lead: 'Medizinische Ästhetik & Beauty in Olten – individuell geplant, ehrlich beraten, mit über 15 Jahren Erfahrung.',
      facts: (n) => [['15+', 'Jahre Erfahrung'], [String(n), 'Behandlungen'], ['1:1', 'Persönliche Beratung']],
      scroll: 'Entdecken', alt: 'Frau mit natürlich strahlender Haut in der Liyas Lounge Olten',
    },
    intro: {
      eyebrow: 'Philosophie', statement: ['Schönheit, die nach', 'Ihnen', 'aussieht – nicht nach einer Behandlung.'],
      text: 'In der Liyas Lounge in Olten nehmen wir uns Zeit. Wir hören zu, beraten ehrlich und planen jede Behandlung so, dass sie zu Ihrem Gesicht, Ihrer Haut und Ihrem Alltag passt.',
      items: [
        ['Individuell geplant', 'Kein Standardprogramm: Jede Behandlung wird auf Ihre Wünsche, Ihre Haut und Ihre Proportionen abgestimmt.'],
        ['Ehrlich beraten', 'Wir sagen offen, was realistisch ist – und auch, wenn wir von einer Behandlung abraten.'],
        ['Über 15 Jahre Erfahrung', 'Fachwissen und Sorgfalt in Ästhetik und Beauty – von der Beratung bis zur Nachsorge.'],
      ],
    },
    tr: {
      eyebrow: 'Behandlungen', title: 'Unsere', accent: 'Behandlungen',
      text: 'Von Dermal Filler bis Wimpernverlängerung – wählen Sie eine Behandlung für Details und Preise.',
      all: 'Alle', from: 'ab', more: 'Details & Preise', prev: 'Zurück', next: 'Weiter', filter: 'Nach Kategorie filtern',
      allPrices: 'Komplette Preisliste', hint: 'Seitlich wischen',
      details: 'Über die Behandlung', areas: 'Anwendungsbereiche', prices: 'Preise', faq: 'Häufige Fragen', notFor: 'Nicht geeignet bei',
      ask: 'Per WhatsApp anfragen', close: 'Schliessen', popular: 'Beliebt',
      pricesTitle: 'Preisliste', pricesLead: 'Alle Preise in CHF. Die genauen Kosten besprechen wir in der kostenlosen Beratung.',
    },
    process: {
      eyebrow: 'Ablauf', title: 'In vier Schritten', accent: 'zu Ihrem Termin',
      steps: [
        ['Kostenlose Beratung', 'Wir sprechen über Ihre Wünsche, Ihre Gesundheit und realistische Möglichkeiten – unverbindlich.'],
        ['Ihr persönlicher Plan', 'Behandlung, Ablauf und Kosten legen wir gemeinsam und transparent fest.'],
        ['Behandlung', 'In ruhiger Atmosphäre, sorgfältig und ohne Zeitdruck.'],
        ['Nachsorge', 'Klare Pflegehinweise und ein offenes Ohr – auch nach Ihrem Termin.'],
      ],
    },
    studio: {
      eyebrow: 'Die Lounge', title: 'Ihr Rückzugsort', accent: 'in Olten',
      text: 'Ruhig, persönlich und diskret: Unsere Lounge ist ein Ort zum Ankommen – mit Zeit für Ihre Fragen und einer Atmosphäre, in der Sie sich wohlfühlen.',
      captions: ['Empfang', 'Behandlungsraum', 'Details'], alts: ['Empfang der Liyas Lounge in Olten', 'Behandlungsraum der Liyas Lounge Olten', 'Details im Studio der Liyas Lounge'],
      route: 'Route planen',
    },
    about: { eyebrow: 'Über uns', title: 'In erfahrenen', accent: 'Händen' },
    reviews: { eyebrow: 'Kundenstimmen', title: 'Was Kundinnen', accent: 'sagen', google: 'Bewertungen auf Google' },
    faq: { eyebrow: 'FAQ', title: 'Häufige', accent: 'Fragen', text: 'Ihre Frage ist nicht dabei? Schreiben Sie uns per WhatsApp – wir helfen gerne.' },
    contact: {
      eyebrow: 'Kontakt', title: 'Ihr Termin.', accent: 'Ihre Zeit.',
      text: 'Schreiben Sie uns per WhatsApp oder rufen Sie an – wir nehmen uns Zeit für Ihre Fragen und finden gemeinsam die passende Behandlung.',
      address: 'Adresse', hours: 'Öffnungszeiten', phone: 'Telefon', email: 'E-Mail', wa: 'WhatsApp', waNote: 'nur Nachrichten', payment: 'Zahlung',
      map: 'Karte laden', mapNote: 'Beim Laden der Karte werden Daten an Google übertragen.', privacy: 'Datenschutz', mapTitle: 'Karte: Liyas Lounge Olten',
    },
    footer: { tagline: 'Medical Aesthetic & Beauty in Olten – individuell geplant, ehrlich beraten.', nav: 'Navigation', legal: 'Rechtliches', agb: 'AGB', privacy: 'Datenschutz', imprint: 'Impressum', rights: 'Alle Rechte vorbehalten.' },
    legalBack: 'Zurück zur Startseite',
  },
  en: {
    htmlLang: 'en', ogLocale: 'en_GB', ogAlt: 'de_CH', home: '/en',
    title: 'Liyas Lounge Olten – Medical Aesthetics & Beauty | Fillers, Facials, HIFU',
    description: 'Medical aesthetics & beauty in Olten: dermal fillers, wrinkle relaxing, facials, HIFU 5D, permanent make-up & more – individually planned, honestly advised. Free consultation.',
    skip: 'Skip to content', homeAria: 'Liyas Lounge Olten – back to top', langAria: 'Choose language', menu: 'Open menu', menuClose: 'Close menu',
    ids: { treatments: 'treatments', process: 'process', studio: 'studio', about: 'about', faq: 'faq', contact: 'contact', prices: 'price-list' },
    nav: { treatments: 'Treatments', process: 'Process', studio: 'Studio', about: 'About', faq: 'FAQ', contact: 'Contact' },
    book: 'Book appointment', consult: 'Free consultation',
    waConsult: 'Hello Liyas Lounge, I would like to arrange a free consultation.',
    waTreat: (n) => `Hello Liyas Lounge, I am interested in ${n}. When would you have an appointment available?`,
    hero: {
      eyebrow: 'Medical Aesthetics & Beauty · Olten', l1: 'Natural', l2: 'Balance.', l3: 'Simply you.',
      lead: 'Medical aesthetics & beauty in Olten – individually planned, honestly advised, with over 15 years of experience.',
      facts: (n) => [['15+', 'Years of experience'], [String(n), 'Treatments'], ['1:1', 'Personal advice']],
      scroll: 'Discover', alt: 'Woman with naturally radiant skin at Liyas Lounge Olten',
    },
    intro: {
      eyebrow: 'Philosophy', statement: ['Beauty that looks like', 'you', '– not like a treatment.'],
      text: 'At Liyas Lounge in Olten, we take our time. We listen, advise honestly and plan every treatment to suit your face, your skin and your everyday life.',
      items: [
        ['Individually planned', 'No standard programme: every treatment is tailored to your wishes, your skin and your proportions.'],
        ['Honestly advised', 'We are open about what is realistic – and we will tell you if we would advise against a treatment.'],
        ['Over 15 years of experience', 'Expertise and care in aesthetics and beauty – from consultation to aftercare.'],
      ],
    },
    tr: {
      eyebrow: 'Treatments', title: 'Our', accent: 'Treatments',
      text: 'From dermal fillers to eyelash extensions – choose a treatment for details and prices.',
      all: 'All', from: 'from', more: 'Details & prices', prev: 'Previous', next: 'Next', filter: 'Filter by category',
      allPrices: 'Full price list', hint: 'Swipe sideways',
      details: 'About the treatment', areas: 'Areas of treatment', prices: 'Prices', faq: 'Frequently asked', notFor: 'Not suitable for',
      ask: 'Enquire via WhatsApp', close: 'Close', popular: 'Popular',
      pricesTitle: 'Price list', pricesLead: 'All prices in CHF. We confirm the exact cost in your free consultation.',
    },
    process: {
      eyebrow: 'Process', title: 'Four steps', accent: 'to your appointment',
      steps: [
        ['Free consultation', 'We talk about your wishes, your health and what is realistic – without obligation.'],
        ['Your personal plan', 'Together we agree on the treatment, process and costs – transparently.'],
        ['Treatment', 'In a calm atmosphere, carefully and never in a rush.'],
        ['Aftercare', 'Clear aftercare advice and a listening ear – even after your appointment.'],
      ],
    },
    studio: {
      eyebrow: 'The Lounge', title: 'Your retreat', accent: 'in Olten',
      text: 'Calm, personal and discreet: our lounge is a place to unwind – with time for your questions and an atmosphere in which you feel at ease.',
      captions: ['Reception', 'Treatment room', 'Details'], alts: ['Reception at Liyas Lounge in Olten', 'Treatment room at Liyas Lounge Olten', 'Details in the Liyas Lounge studio'],
      route: 'Get directions',
    },
    about: { eyebrow: 'About', title: 'In experienced', accent: 'hands' },
    reviews: { eyebrow: 'Reviews', title: 'What clients', accent: 'say', google: 'Reviews on Google' },
    faq: { eyebrow: 'FAQ', title: 'Frequently asked', accent: 'questions', text: 'Can’t find your question? Send us a WhatsApp message – we are happy to help.' },
    contact: {
      eyebrow: 'Contact', title: 'Your appointment.', accent: 'Your time.',
      text: 'Send us a WhatsApp message or give us a call – we take time for your questions and find the right treatment together.',
      address: 'Address', hours: 'Opening hours', phone: 'Phone', email: 'Email', wa: 'WhatsApp', waNote: 'messages only', payment: 'Payment',
      map: 'Load map', mapNote: 'Loading the map transfers data to Google.', privacy: 'Privacy policy (DE)', mapTitle: 'Map: Liyas Lounge Olten',
    },
    footer: { tagline: 'Medical aesthetics & beauty in Olten – individually planned, honestly advised.', nav: 'Navigation', legal: 'Legal (German)', agb: 'Terms', privacy: 'Privacy policy', imprint: 'Legal notice', rights: 'All rights reserved.' },
    legalBack: 'Back to the homepage',
  },
};

/* ---------- Hilfsfunktionen ---------- */
let LANG = 'de', S = STR.de, D = DATA.de;
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const chf = (n) => 'CHF ' + n.toLocaleString('de-CH').replace(/[’']/g, '’');
const minPrice = (t) => Math.min(...t.prices.filter((p) => p.price).map((p) => p.price));
const abs = (path) => SITE.url + (path === '/' ? '/' : path);
const imgUrl = (name) => `${SITE.url}/assets/img/${name}.jpg`;
const wa = (text) => `${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
const tid = (t) => 't-' + t.slug;
const hoursHtml = () => [...SITE.hours.map((h) => `${esc(h[LANG])} ${h.opens}–${h.closes}`), esc(SITE.hoursNote[LANG])].join('<br>');
const addrHtml = () => `${esc(SITE.street)}${SITE.floor ? ', ' + esc(SITE.floor) : ''}<br>${SITE.zip} ${esc(SITE.city)}`;
const H = (main, accent, { tag = 'h2', id = '', cls = '' } = {}) =>
  `<${tag} class="h${cls ? ' ' + cls : ''}"${id ? ` id="${id}"` : ''} data-reveal>${esc(main)}${accent ? ` <em>${esc(accent)}</em>` : ''}</${tag}>`;
const eyebrow = (t) => `<p class="eyebrow" data-reveal>${esc(t)}</p>`;

function srcset(name) {
  const m = IMG[name];
  if (!m) throw new Error('Bild fehlt: ' + name);
  return m.widths.map((w) => `/assets/img/${name}-${w}.webp ${w}w`).join(', ');
}
function pic(name, alt, { sizes = '100vw', eager = false, pos = '' } = {}) {
  const m = IMG[name];
  if (!m) throw new Error('Bild fehlt: ' + name);
  const fw = Math.min(1200, m.w);
  const fh = Math.round(m.h * (fw / m.w));
  const p = pos || (m.fx != null ? `${m.fx}% ${m.fy ?? 50}%` : '');
  const style = [p && `object-position:${p}`, m.lqip && `background:url(${m.lqip}) ${p || '50% 50%'}/cover no-repeat`].filter(Boolean).join(';');
  return `<picture><source type="image/webp" srcset="${srcset(name)}" sizes="${sizes}"><img src="/assets/img/${name}.jpg" alt="${esc(alt)}" width="${fw}" height="${fh}"${style ? ` style="${style}"` : ''} ${eager ? 'fetchpriority="high" loading="eager"' : 'loading="lazy"'} decoding="async"></picture>`;
}

const ICONS = {
  arrow: '<path d="M7 17 17 7M8 7h9v9"/>',
  right: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  left: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
  star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" fill="currentColor" stroke="none"/>',
  whatsapp: '<path d="M3 21l1.7-5A8.5 8.5 0 1 1 8 19.4z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1.2-1.3-1.8-1-1 .8a4 4 0 0 1-2.2-2.2l.8-1-1-1.8z" fill="currentColor" stroke="none"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/>',
};
const icon = (n) => `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;
const waBtn = (label, text, cls = 'btn btn--gold') => `<a class="${cls}" href="${esc(wa(text))}" target="_blank" rel="noopener">${icon('whatsapp')}<span>${esc(label)}</span></a>`;

/* ---------- Strukturierte Daten ---------- */
const BUSINESS_ID = SITE.url + '/#business';
const businessSchema = () => ({
  '@context': 'https://schema.org',
  '@type': ['BeautySalon', 'MedicalBusiness'],
  '@id': BUSINESS_ID,
  name: SITE.name,
  description: S.description,
  url: abs(S.home),
  inLanguage: S.htmlLang,
  logo: SITE.url + '/icon-512.png',
  image: [SITE.url + '/assets/img/og-image.jpg', imgUrl(HOME.heroImage), ...HOME.studio.map(imgUrl)],
  ...(isSet(SITE.phone) ? { telephone: SITE.phoneHref.replace('tel:', '') } : {}),
  email: SITE.email,
  priceRange: 'CHF 25 – CHF 1450',
  openingHoursSpecification: SITE.hours.map((h) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: h.days.map((d) => `https://schema.org/${{ Mo: 'Monday', Tu: 'Tuesday', We: 'Wednesday', Th: 'Thursday', Fr: 'Friday', Sa: 'Saturday', Su: 'Sunday' }[d]}`), opens: h.opens, closes: h.closes })),
  currenciesAccepted: 'CHF',
  paymentAccepted: SITE.payment[LANG],
  geo: { '@type': 'GeoCoordinates', latitude: SITE.geo.lat, longitude: SITE.geo.lng },
  address: { '@type': 'PostalAddress', ...(isSet(SITE.street) ? { streetAddress: SITE.street } : {}), postalCode: SITE.zip, addressLocality: SITE.city, addressRegion: 'SO', addressCountry: 'CH' },
  hasMap: SITE.googleMaps,
  availableLanguage: ['de', 'en'],
  areaServed: [{ '@type': 'City', name: 'Olten' }, { '@type': 'State', name: 'Kanton Solothurn' }],
  sameAs: [SITE.instagram, SITE.facebook].filter(Boolean),
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: S.nav.treatments,
    itemListElement: D.CATEGORIES.map((c) => ({
      '@type': 'OfferCatalog',
      name: c.name,
      itemListElement: D.TREATMENTS.filter((t) => t.category === c.id).map((t) => ({ '@type': 'Offer', priceCurrency: 'CHF', price: minPrice(t), url: abs(S.home) + '#' + tid(t), itemOffered: { '@type': 'Service', name: t.navName, description: t.card } })),
    })),
  },
});
const websiteSchema = () => ({ '@context': 'https://schema.org', '@type': 'WebSite', '@id': SITE.url + '/#website', url: SITE.url + '/', name: SITE.name, inLanguage: ['de-CH', 'en'], publisher: { '@id': BUSINESS_ID } });
const faqSchema = () => ({ '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: S.htmlLang, mainEntity: D.FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });

/* ---------- Bausteine ---------- */
const logo = (href) => `<a class="logo" href="${href}" aria-label="${S.homeAria}" data-top><span class="logo__mark" aria-hidden="true">LL</span><span class="logo__word">Liyas <em>Lounge</em></span></a>`;
const langSwitch = (dePath, enPath) => `<nav class="lang" aria-label="${S.langAria}">${[['de', 'de-CH', dePath], ['en', 'en', enPath]].map(([l, hl, href]) =>
  `<a href="${href}" lang="${hl}" hreflang="${hl}"${l === LANG ? ' aria-current="true"' : ''}>${l.toUpperCase()}</a>`).join('')}</nav>`;
const navItems = (base) => ['treatments', 'process', 'studio', 'about', 'faq', 'contact'].map((k) => [S.nav[k], `${base}#${S.ids[k]}`]);

function header({ dePath, enPath, landing }) {
  const base = landing ? '' : S.home;
  const items = navItems(base);
  return `<a class="skip" href="#main">${S.skip}</a>
<header class="nav${landing ? ' nav--over' : ''}" data-nav>
  <div class="nav__bar">
    ${logo(S.home)}
    <ul class="nav__links">${items.slice(0, 5).map(([l, h]) => `<li><a href="${h}">${esc(l)}</a></li>`).join('')}</ul>
    <div class="nav__end">
      ${langSwitch(dePath, enPath)}
      <a class="btn btn--sm btn--gold nav__cta" href="${base}#${S.ids.contact}"><span>${S.book}</span></a>
      <button type="button" class="burger" aria-controls="menu" aria-expanded="false" aria-label="${S.menu}" data-open-label="${S.menu}" data-close-label="${S.menuClose}"><span></span><span></span></button>
    </div>
  </div>
</header>
<div class="menu" id="menu" data-menu hidden>
  <nav class="menu__in" aria-label="${S.nav.treatments}">
    <ol class="menu__links">${items.map(([l, h], i) => `<li><a href="${h}" data-menu-link><small>0${i + 1}</small>${esc(l)}</a></li>`).join('')}</ol>
    <div class="menu__foot">
      ${waBtn('WhatsApp', S.waConsult)}
      <p>${hoursHtml()}</p>
      ${langSwitch(dePath, enPath)}
    </div>
  </nav>
</div>`;
}

function footer({ landing }) {
  const base = landing ? '' : S.home;
  return `<footer class="foot">
  <div class="wrap foot__grid">
    <div class="foot__brand">${logo(S.home)}<p>${esc(S.footer.tagline)}</p>${SITE.instagram ? `<a class="foot__social" href="${SITE.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${icon('instagram')}</a>` : ''}</div>
    <div><p class="foot__h">${S.footer.nav}</p><ul>${navItems(base).map(([l, h]) => `<li><a href="${h}">${esc(l)}</a></li>`).join('')}</ul></div>
    <div><p class="foot__h">${S.contact.eyebrow}</p><ul>
      <li>${addrHtml()}</li>
      ${isSet(SITE.phone) ? `<li><a href="${SITE.phoneHref}">${esc(SITE.phone)}</a></li>` : ''}
      <li><a href="${esc(SITE.whatsapp)}" target="_blank" rel="noopener">WhatsApp (${S.contact.waNote})</a></li>
      <li><a href="mailto:${SITE.email}">${esc(SITE.email)}</a></li>
      <li>${hoursHtml()}</li>
    </ul></div>
    <div><p class="foot__h">${S.footer.legal}</p><ul><li><a href="/agb">${S.footer.agb}</a></li><li><a href="/datenschutz">${S.footer.privacy}</a></li><li><a href="/impressum">${S.footer.imprint}</a></li></ul></div>
  </div>
  <div class="wrap foot__base"><p>© <span data-year>${new Date().getFullYear()}</span> Liyas Lounge, Olten. ${S.footer.rights}</p><p class="foot__word" aria-hidden="true">Liyas <em>Lounge</em></p></div>
</footer>`;
}

/* Preiszeilen (für Behandlungs-Panel und Preisliste) */
const priceRows = (t) => `<ul class="prices">${t.prices.map((p) => `<li class="prices__row">
  <div><p class="prices__name">${esc(p.name)}${p.detail ? ` <span>· ${esc(p.detail)}</span>` : ''}${p.featured ? ` <b class="badge">${S.tr.popular}</b>` : ''}</p>${p.desc ? `<p class="prices__desc">${esc(p.desc)}</p>` : ''}</div>
  <p class="prices__val">${esc(p.priceText || chf(p.price))}</p>
</li>`).join('')}</ul>${t.priceNote ? `<p class="small">${esc(t.priceNote)}</p>` : ''}`;

function card(t, i) {
  const cat = D.CATEGORIES.find((c) => c.id === t.category);
  return `<li class="card" data-cat="${t.category}" data-reveal style="--i:${i % 4}">
  <button type="button" class="card__btn" data-open="${tid(t)}" aria-haspopup="dialog" aria-controls="${tid(t)}">
    <span class="card__media">${pic(t.image, t.imageAlt, { sizes: '(max-width: 700px) 78vw, 340px' })}</span>
    <span class="card__top"><span>${String(i + 1).padStart(2, '0')} · ${esc(cat.name)}</span></span>
    <span class="card__body">
      <span class="card__name">${esc(t.name)}</span>
      <span class="card__text">${esc(t.card)}</span>
      <span class="card__foot"><span class="card__price">${S.tr.from} ${chf(minPrice(t))}</span><span class="card__more">${S.tr.more} ${icon('plus')}</span></span>
    </span>
  </button>
</li>`;
}

function drawer(t) {
  const cat = D.CATEGORIES.find((c) => c.id === t.category);
  const id = tid(t);
  return `<div class="drawer" id="${id}" role="dialog" aria-modal="true" aria-labelledby="${id}-t" data-drawer hidden>
  <div class="drawer__scrim" data-close></div>
  <article class="drawer__panel" data-lenis-prevent tabindex="-1">
    <button type="button" class="drawer__x" data-close aria-label="${S.tr.close}">${icon('x')}</button>
    <div class="drawer__media">${pic(t.image, t.imageAlt, { sizes: '(max-width: 700px) 100vw, 560px' })}</div>
    <div class="drawer__body">
      <p class="eyebrow">${esc(cat.name)}</p>
      <h3 class="h h--md" id="${id}-t">${esc(t.h1)} <em>${esc(t.h1Accent || '')}</em></h3>
      <p class="drawer__lead">${esc(t.lead)}</p>
      ${t.chips ? `<ul class="chips">${t.chips.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>` : ''}
      <div class="drawer__cta">${waBtn(S.tr.ask, S.waTreat(t.name))}</div>
      <h4 class="drawer__h">${S.tr.details}</h4>
      <p>${esc(t.what.text)}</p>
      ${t.indications ? `<h4 class="drawer__h">${esc(t.indications.title || S.tr.areas)}</h4><ul class="ticks">${t.indications.items.map((x) => `<li>${icon('check')}${esc(x)}</li>`).join('')}</ul>` : ''}
      <h4 class="drawer__h">${S.tr.prices}</h4>
      ${priceRows(t)}
      ${t.contra ? `<h4 class="drawer__h">${esc(t.contra.title || S.tr.notFor)}</h4><ul class="dashes">${t.contra.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul><p class="small">${esc(t.contra.note || '')}</p>` : ''}
      ${t.faq && t.faq.length ? `<h4 class="drawer__h">${S.tr.faq}</h4><div class="acc acc--sm">${t.faq.map(([q, a]) => `<details><summary>${esc(q)}${icon('plus')}</summary><p>${esc(a)}</p></details>`).join('')}</div>` : ''}
      ${t.results && t.results.note ? `<p class="small">${esc(t.results.note)}</p>` : ''}
    </div>
  </article>
</div>`;
}

function priceDrawer() {
  const id = S.ids.prices;
  return `<div class="drawer drawer--wide" id="${id}" role="dialog" aria-modal="true" aria-labelledby="${id}-t" data-drawer hidden>
  <div class="drawer__scrim" data-close></div>
  <article class="drawer__panel" data-lenis-prevent tabindex="-1">
    <button type="button" class="drawer__x" data-close aria-label="${S.tr.close}">${icon('x')}</button>
    <div class="drawer__body">
      <p class="eyebrow">Liyas Lounge · Olten</p>
      <h3 class="h h--md" id="${id}-t">${S.tr.pricesTitle}</h3>
      <p class="drawer__lead">${S.tr.pricesLead}</p>
      ${D.CATEGORIES.map((c) => `<section class="plist"><h4 class="plist__cat">${esc(c.name)}</h4>${D.TREATMENTS.filter((t) => t.category === c.id).map((t) => `<div class="plist__t"><h5><button type="button" data-open="${tid(t)}">${esc(t.name)} ${icon('arrow')}</button></h5>${priceRows(t)}</div>`).join('')}</section>`).join('')}
      <div class="drawer__cta">${waBtn(S.book, S.waConsult)}</div>
    </div>
  </article>
</div>`;
}

/* ---------- Dokument ---------- */
function doc({ title, description, path, alternates, body, schemas = [], noindex = false, landing = false, preload = '' }) {
  const canonical = abs(path);
  return `<!doctype html>
<html lang="${S.htmlLang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex, follow">' : '<meta name="robots" content="index, follow, max-image-preview:large">'}
<link rel="canonical" href="${canonical}">
${alternates ? `<link rel="alternate" hreflang="de-CH" href="${abs(alternates.de)}">
<link rel="alternate" hreflang="en" href="${abs(alternates.en)}">
<link rel="alternate" hreflang="x-default" href="${abs(alternates.de)}">` : ''}
<meta name="theme-color" content="#0d0c0b">
<meta name="geo.region" content="CH-SO">
<meta name="geo.placename" content="Olten">
<meta property="og:type" content="website">
<meta property="og:locale" content="${S.ogLocale}">
<meta property="og:locale:alternate" content="${S.ogAlt}">
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE.url}/assets/img/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/assets/fonts/cormorant-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/cormorant-italic-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/jost-var.woff2" as="font" type="font/woff2" crossorigin>
${preload}
<link rel="stylesheet" href="/assets/css/style.min.css?v=${VERSION}">
<script>document.documentElement.classList.add('js')</script>
${schemas.map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n')}
</head>
<body class="${landing ? 'is-landing' : 'is-sub'}">
${body}
<script src="/assets/js/lenis.min.js?v=${VERSION}" defer></script>
<script src="/assets/js/main.js?v=${VERSION}" defer></script>
</body>
</html>
`;
}

/* ---------- Landing ---------- */
function landing() {
  const T = D.TREATMENTS, ids = S.ids, h = S.hero, owner = D.TEAM[0];
  const heroPre = `<link rel="preload" as="image" href="/assets/img/${HOME.heroImage}-800.webp" imagesrcset="${srcset(HOME.heroImage)}" imagesizes="(max-width: 900px) 100vw, 46vw" fetchpriority="high">`;
  const marquee = T.map((t) => `<span>${esc(t.name)}</span>`).join('<i aria-hidden="true">✦</i>');
  const body = `${header({ dePath: '/', enPath: '/en', landing: true })}
<main id="main">

<section class="hero" aria-labelledby="hero-t">
  <div class="wrap hero__grid">
    <div class="hero__text">
      <p class="eyebrow hero__in" style="--d:.1s">${esc(h.eyebrow)}</p>
      <h1 class="hero__h" id="hero-t"><span class="ln"><span>${esc(h.l1)}</span></span><span class="ln"><em>${esc(h.l2)}</em></span><span class="ln"><span>${esc(h.l3)}</span></span></h1>
      <p class="hero__lead hero__in" style="--d:.7s">${esc(h.lead)}</p>
      <div class="hero__cta hero__in" style="--d:.85s"><a class="btn btn--gold" href="#${ids.contact}"><span>${S.book}</span>${icon('arrow')}</a>${waBtn(S.consult, S.waConsult, 'btn btn--line')}</div>
    </div>
    <figure class="hero__arch">
      <div class="hero__img" data-hero-img>${pic(HOME.heroImage, h.alt, { sizes: '(max-width: 900px) 100vw, 46vw', eager: true, pos: '58% 28%' })}</div>
      <figcaption class="hero__badge"><span>Olten</span><b>Liyas Lounge</b></figcaption>
    </figure>
  </div>
  <div class="wrap hero__facts">
    <ul>${h.facts(T.length).map(([n, l], i) => `<li class="hero__in" style="--d:${1 + i * .1}s"><b>${esc(n)}</b><span>${esc(l)}</span></li>`).join('')}</ul>
    <a class="hero__scroll" href="#${ids.treatments}"><i></i>${esc(h.scroll)}</a>
  </div>
</section>

<div class="marquee" aria-hidden="true"><div class="marquee__track"><div>${marquee}<i>✦</i></div><div>${marquee}<i>✦</i></div></div></div>

<section class="intro" aria-labelledby="intro-t">
  <div class="wrap">
    ${eyebrow(S.intro.eyebrow)}
    <h2 class="intro__statement" id="intro-t" data-reveal>${esc(S.intro.statement[0])} <em>${esc(S.intro.statement[1])}</em> ${esc(S.intro.statement[2])}</h2>
    <div class="intro__grid">
      <p class="intro__text" data-reveal>${esc(S.intro.text)}</p>
      <ol class="pillars">${S.intro.items.map(([t, p], i) => `<li data-reveal style="--i:${i}"><span class="pillars__n">${['I', 'II', 'III'][i]}</span><h3>${esc(t)}</h3><p>${esc(p)}</p></li>`).join('')}</ol>
    </div>
  </div>
</section>

<section class="treat" id="${ids.treatments}" aria-labelledby="treat-t">
  <div class="wrap treat__head">
    <div>${eyebrow(S.tr.eyebrow)}${H(S.tr.title, S.tr.accent, { id: 'treat-t' })}<p class="treat__text" data-reveal>${esc(S.tr.text)}</p></div>
    <div class="treat__tools" data-reveal>
      <div class="filters" role="group" aria-label="${S.tr.filter}">
        <button type="button" aria-pressed="true" data-filter="all">${S.tr.all} <sup>${T.length}</sup></button>
        ${D.CATEGORIES.map((c) => `<button type="button" aria-pressed="false" data-filter="${c.id}">${esc(c.name)} <sup>${T.filter((t) => t.category === c.id).length}</sup></button>`).join('')}
      </div>
      <div class="arrows"><button type="button" class="arrow" data-dir="-1" aria-label="${S.tr.prev}">${icon('left')}</button><button type="button" class="arrow" data-dir="1" aria-label="${S.tr.next}">${icon('right')}</button></div>
    </div>
  </div>
  <div class="rail" data-rail>
    <ul class="rail__track" data-track>${T.map(card).join('')}</ul>
  </div>
  <div class="wrap treat__foot">
    <div class="progress" aria-hidden="true"><span data-progress></span></div>
    <p class="treat__hint">${S.tr.hint}</p>
    <button type="button" class="btn btn--line-dark" data-open="${ids.prices}" aria-haspopup="dialog" aria-controls="${ids.prices}"><span>${S.tr.allPrices}</span>${icon('arrow')}</button>
  </div>
</section>

<section class="process" id="${ids.process}" aria-labelledby="proc-t">
  <div class="wrap">
    <div class="process__head">${eyebrow(S.process.eyebrow)}${H(S.process.title, S.process.accent, { id: 'proc-t', cls: 'h--light' })}</div>
    <ol class="steps">${S.process.steps.map(([t, p], i) => `<li data-reveal style="--i:${i}"><span class="steps__n">0${i + 1}</span><h3>${esc(t)}</h3><p>${esc(p)}</p></li>`).join('')}</ol>
    <div class="process__cta" data-reveal>${waBtn(S.consult, S.waConsult)}</div>
  </div>
</section>

<section class="studio" id="${ids.studio}" aria-labelledby="studio-t">
  <div class="wrap studio__grid">
    <div class="studio__text">
      ${eyebrow(S.studio.eyebrow)}${H(S.studio.title, S.studio.accent, { id: 'studio-t' })}
      <p data-reveal>${esc(S.studio.text)}</p>
      <p class="studio__addr" data-reveal>${icon('pin')}<span>${addrHtml()}</span></p>
      <a class="link" href="${SITE.route}" target="_blank" rel="noopener" data-reveal>${S.studio.route} ${icon('arrow')}</a>
    </div>
    ${HOME.studio.map((n, i) => `<figure class="studio__f studio__f--${i + 1}" data-reveal><div class="studio__img" data-parallax>${pic(n, S.studio.alts[i], { sizes: i === 1 ? '(max-width: 900px) 60vw, 30vw' : '(max-width: 900px) 100vw, 40vw' })}</div><figcaption>${esc(S.studio.captions[i])}</figcaption></figure>`).join('')}
  </div>
</section>

<section class="about" id="${ids.about}" aria-labelledby="about-t">
  <div class="wrap about__grid">
    <figure class="about__arch" data-reveal>${pic(owner.image, owner.alt, { sizes: '(max-width: 900px) 80vw, 34vw' })}</figure>
    <div class="about__text">
      ${eyebrow(S.about.eyebrow)}${H(S.about.title, S.about.accent, { id: 'about-t' })}
      <p class="about__name" data-reveal>${esc(owner.name)} <span>${esc(owner.roleShort)}</span></p>
      ${owner.bio.map((p) => `<p data-reveal>${esc(p)}</p>`).join('')}
      <ul class="ticks" data-reveal>${owner.facts.map((f) => `<li>${icon('check')}${esc(f)}</li>`).join('')}</ul>
    </div>
  </div>
</section>

<section class="reviews" aria-labelledby="rev-t">
  <div class="wrap">
    <div class="reviews__head">${eyebrow(S.reviews.eyebrow)}${H(S.reviews.title, S.reviews.accent, { id: 'rev-t' })}</div>
    <div class="reviews__grid">${D.REVIEWS.map((r, i) => `<figure class="quote" data-reveal style="--i:${i}"><div class="quote__stars" aria-hidden="true">${icon('star').repeat(5)}</div><blockquote>${esc(r.text)}</blockquote><figcaption><b>${esc(r.name)}</b> · ${esc(r.tag)}</figcaption></figure>`).join('')}</div>
    <a class="link" href="${SITE.googleMaps}" target="_blank" rel="noopener" data-reveal>${S.reviews.google} ${icon('arrow')}</a>
  </div>
</section>

<section class="faq" id="${ids.faq}" aria-labelledby="faq-t">
  <div class="wrap faq__grid">
    <div>${eyebrow(S.faq.eyebrow)}${H(S.faq.title, S.faq.accent, { id: 'faq-t' })}<p data-reveal>${esc(S.faq.text)}</p><div data-reveal>${waBtn('WhatsApp', S.waConsult, 'btn btn--line-dark')}</div></div>
    <div class="acc" data-reveal>${D.FAQ.map(([q, a]) => `<details><summary>${esc(q)}${icon('plus')}</summary><p>${esc(a)}</p></details>`).join('')}</div>
  </div>
</section>

<section class="contact" id="${ids.contact}" aria-labelledby="contact-t">
  <div class="contact__bg">${pic(HOME.ctaImage, HOME.ctaAlt, { sizes: '100vw' })}</div>
  <div class="wrap contact__grid">
    <div class="contact__main">
      ${eyebrow(S.contact.eyebrow)}${H(S.contact.title, S.contact.accent, { id: 'contact-t', cls: 'h--light h--lg' })}
      <p data-reveal>${esc(S.contact.text)}</p>
      <div class="contact__cta" data-reveal>${waBtn(`WhatsApp · ${S.contact.waNote}`, S.waConsult)}${isSet(SITE.phone) ? `<a class="btn btn--line" href="${SITE.phoneHref}">${icon('phone')}<span>${esc(SITE.phone)}</span></a>` : ''}</div>
    </div>
    <dl class="contact__info" data-reveal>
      <div><dt>${icon('pin')}${S.contact.address}</dt><dd>${addrHtml()}<br><a href="${SITE.route}" target="_blank" rel="noopener">${S.studio.route}</a></dd></div>
      <div><dt>${icon('clock')}${S.contact.hours}</dt><dd>${hoursHtml()}</dd></div>
      <div><dt>${icon('whatsapp')}${S.contact.wa}</dt><dd><a href="${esc(SITE.whatsapp)}" target="_blank" rel="noopener">${S.contact.waNote}</a></dd></div>
      ${isSet(SITE.phone) ? `<div><dt>${icon('phone')}${S.contact.phone}</dt><dd><a href="${SITE.phoneHref}">${esc(SITE.phone)}</a></dd></div>` : ''}
      <div><dt>${icon('mail')}${S.contact.email}</dt><dd><a href="mailto:${SITE.email}">${esc(SITE.email)}</a></dd></div>
      <div><dt>${icon('card')}${S.contact.payment}</dt><dd>${esc(SITE.payment[LANG])}</dd></div>
    </dl>
    <div class="map" data-map data-src="${esc(SITE.mapEmbed)}" data-title="${esc(S.contact.mapTitle)}" data-reveal>
      <div class="map__ph"><span>${icon('pin')}</span><p><b>Liyas Lounge</b><br>${SITE.zip} ${esc(SITE.city)}</p><button type="button" class="btn btn--sm btn--line" data-map-load><span>${S.contact.map}</span></button><small>${S.contact.mapNote} <a href="/datenschutz">${S.contact.privacy}</a></small></div>
    </div>
  </div>
</section>

</main>
${footer({ landing: true })}
<a class="fab" href="${esc(wa(S.waConsult))}" target="_blank" rel="noopener" aria-label="WhatsApp" data-fab>${icon('whatsapp')}</a>
${T.map(drawer).join('\n')}
${priceDrawer()}`;
  return doc({ title: S.title, description: S.description, path: S.home, alternates: { de: '/', en: '/en' }, body, landing: true, preload: heroPre, schemas: [businessSchema(), websiteSchema(), faqSchema()] });
}

/* ---------- Rechtstexte (nur DE) ---------- */
function legalPage(path, title, h1, description, content, { noindex = false } = {}) {
  const body = `${header({ dePath: '/', enPath: '/en', landing: false })}
<main id="main" class="legal">
  <div class="wrap wrap--narrow">
    <p class="eyebrow">Liyas Lounge · Olten</p>
    <h1 class="h h--lg">${h1}</h1>
    <div class="prose">${content}</div>
    <p><a class="link" href="/">${S.legalBack} ${icon('arrow')}</a></p>
  </div>
</main>
${footer({ landing: false })}`;
  return doc({ title, description, path, body, noindex });
}

const PAGES = [];
const add = (file, path, html, { sitemap = true, priority = '0.3', alternates = null } = {}) => PAGES.push({ file, path, html, sitemap, priority, alternates });

for (const l of ['de', 'en']) {
  LANG = l; S = STR[l]; D = DATA[l];
  add(l === 'de' ? 'index.html' : 'en/index.html', S.home, landing(), { priority: l === 'de' ? '1.0' : '0.9', alternates: { de: '/', en: '/en' } });
}

LANG = 'de'; S = STR.de; D = DATA.de;
const stand = new Date().toLocaleDateString('de-CH', { month: 'long', year: 'numeric' });
const DRAFT = '<p class="note">Entwurf – bitte vor der Veröffentlichung prüfen und ergänzen.</p>';
add('agb.html', '/agb', legalPage('/agb', 'AGB – Allgemeine Geschäftsbedingungen | Liyas Lounge Olten', 'AGB',
  'Allgemeine Geschäftsbedingungen der Liyas Lounge in Olten: Terminvereinbarung, Absagen, Preise, Zahlung, Haftung und Datenschutz.',
  DRAFT + AGB.map(([hh, p]) => `<h2>${esc(hh)}</h2><p>${esc(p)}</p>`).join('') + `<p class="note">Stand: ${stand}</p>`));
add('datenschutz.html', '/datenschutz', legalPage('/datenschutz', 'Datenschutzerklärung | Liyas Lounge Olten', 'Datenschutz',
  'Datenschutzerklärung der Liyas Lounge in Olten gemäss Schweizer Datenschutzgesetz (DSG): welche Daten wir bearbeiten, wofür und welche Rechte Sie haben.',
  `${DRAFT}
<p>Der Schutz Ihrer Personendaten ist uns wichtig. In dieser Datenschutzerklärung informieren wir Sie darüber, welche Personendaten wir im Zusammenhang mit unserer Website und unseren Dienstleistungen bearbeiten. Massgebend ist das Schweizer Bundesgesetz über den Datenschutz (DSG).</p>
<h2>1. Verantwortliche Stelle</h2>
<p>Liyas Lounge<br>${addrHtml()}, Schweiz<br>E-Mail: <a href="mailto:${SITE.email}">${esc(SITE.email)}</a>${isSet(SITE.phone) ? `<br>Telefon: <a href="${SITE.phoneHref}">${esc(SITE.phone)}</a>` : ''}</p>
<h2>2. Besuch der Website</h2>
<p>Beim Aufruf unserer Website werden durch unseren Hosting-Anbieter technisch notwendige Daten (z. B. IP-Adresse, Datum und Uhrzeit, aufgerufene Seite, Browsertyp) in Server-Logfiles verarbeitet. Diese Daten dienen ausschliesslich dem sicheren und stabilen Betrieb der Website. [Hosting-Anbieter ergänzen, z. B. Vercel Inc., USA – dabei kann eine Übermittlung von Daten in die USA erfolgen, abgesichert durch geeignete Garantien wie Standardvertragsklauseln.]</p>
<p>Wir verwenden keine Analyse-, Tracking- oder Marketing-Tools. Schriftarten werden lokal von unserem Server geladen – es findet keine Verbindung zu Google Fonts statt.</p>
<h2>3. Cookies und lokale Speicherung</h2>
<p>Unsere Website setzt keine Cookies und speichert keine Daten in Ihrem Browser.</p>
<h2>4. Kontaktaufnahme</h2>
<p>Wenn Sie uns per E-Mail, Telefon oder WhatsApp kontaktieren, bearbeiten wir Ihre Angaben (z. B. Name, Telefonnummer, Nachricht) ausschliesslich zur Beantwortung Ihrer Anfrage und zur Terminvereinbarung. Bei Nutzung von WhatsApp gelten zusätzlich die Datenschutzbestimmungen von WhatsApp/Meta.</p>
<h2>5. Google Maps</h2>
<p>Auf unserer Website können Sie eine Karte von Google Maps (Google Ireland Ltd. / Google LLC) einblenden. Die Karte wird erst nach Ihrem Klick auf «Karte laden» geladen. Dabei werden Daten (insbesondere Ihre IP-Adresse) an Google übertragen, möglicherweise auch in die USA.</p>
<h2>6. Messenger und Links</h2>
<p>Auf unserer Website verlinken wir auf WhatsApp (teilweise mit einem vorausgefüllten Nachrichtentext, den Sie vor dem Senden ändern können). Es handelt sich um einfache Links; Daten werden erst übertragen, wenn Sie den Links folgen.</p>
<h2>7. Kundendaten &amp; Gesundheitsdaten</h2>
<p>Im Rahmen von Beratungen und Behandlungen bearbeiten wir auch besonders schützenswerte Personendaten (Gesundheitsdaten), soweit dies für eine sichere Behandlung erforderlich ist. Diese Daten behandeln wir streng vertraulich und geben sie nicht ohne Ihre ausdrückliche Einwilligung an Dritte weiter, sofern keine gesetzliche Pflicht besteht.</p>
<h2>8. Aufbewahrung</h2>
<p>Wir speichern Personendaten nur so lange, wie es für den jeweiligen Zweck erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen.</p>
<h2>9. Ihre Rechte</h2>
<p>Sie haben das Recht, Auskunft über Ihre bei uns gespeicherten Personendaten zu verlangen sowie deren Berichtigung, Löschung oder Herausgabe zu beantragen. Wenden Sie sich dazu an <a href="mailto:${SITE.email}">${esc(SITE.email)}</a>. Zudem können Sie sich an den Eidgenössischen Datenschutz- und Öffentlichkeitsbeauftragten (EDÖB) wenden.</p>
<h2>10. Änderungen</h2>
<p>Wir können diese Datenschutzerklärung jederzeit anpassen. Es gilt die jeweils aktuelle, auf dieser Website veröffentlichte Fassung.</p>
<p class="note">Stand: ${stand}</p>`));
add('impressum.html', '/impressum', legalPage('/impressum', 'Impressum | Liyas Lounge Olten', 'Impressum',
  'Impressum der Liyas Lounge in Olten – Medical Aesthetic & Beauty: Kontakt, Haftung und Urheberrecht.',
  `<h2>Kontaktadresse</h2>
<p>Liyas Lounge<br>Medical Aesthetic &amp; Beauty<br>Inhaberin: [Name folgt]<br>${addrHtml()}<br>Schweiz</p>
<p>${isSet(SITE.phone) ? `Telefon: <a href="${SITE.phoneHref}">${esc(SITE.phone)}</a><br>` : 'Telefon: [folgt]<br>'}E-Mail: <a href="mailto:${SITE.email}">${esc(SITE.email)}</a><br>[UID-Nummer, falls vorhanden]</p>
<h2>Ärztliche Verantwortung</h2>
<p>[Angaben zur ärztlichen Verantwortung für medizinisch-ästhetische Behandlungen ergänzen]</p>
<h2>Haftungsausschluss</h2>
<p>Die Inhalte dieser Website wurden mit grösster Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Die Informationen auf dieser Website ersetzen keine persönliche Beratung. Ergebnisse von Behandlungen sind individuell und können nicht garantiert werden.</p>
<h2>Haftung für Links</h2>
<p>Verweise und Links auf Websites Dritter liegen ausserhalb unseres Verantwortungsbereichs. Für deren Inhalte sind ausschliesslich die jeweiligen Betreiber verantwortlich.</p>
<h2>Urheberrechte</h2>
<p>Die Urheber- und alle anderen Rechte an Inhalten, Bildern, Fotos oder anderen Dateien auf dieser Website gehören der Liyas Lounge oder den speziell genannten Rechteinhabern. Für die Reproduktion jeglicher Elemente ist die schriftliche Zustimmung im Voraus einzuholen.</p>`));
add('404.html', '/404', legalPage('/404', 'Seite nicht gefunden | Liyas Lounge Olten', 'Seite <em>nicht gefunden</em>',
  'Diese Seite existiert leider nicht.',
  `<p>Die gesuchte Seite existiert nicht oder wurde verschoben. · <span lang="en">The page you are looking for doesn’t exist – <a href="/en">English homepage</a>.</span></p>`, { noindex: true }), { sitemap: false });

/* ---------- CSS minifizieren ---------- */
const css = readFileSync(join(ROOT, 'assets/css/style.css'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\s+/g, ' ')
  .replace(/\s*([{};,>])\s*/g, '$1')
  .replace(/;}/g, '}')
  .trim();
writeFileSync(join(ROOT, 'assets/css/style.min.css'), css);

/* ---------- Schreiben ---------- */
for (const p of PAGES) {
  mkdirSync(dirname(join(ROOT, p.file)), { recursive: true });
  writeFileSync(join(ROOT, p.file), p.html);
}
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${PAGES.filter((p) => p.sitemap).map((p) => `  <url>
    <loc>${abs(p.path)}</loc>
    <lastmod>${TODAY}</lastmod>
    <priority>${p.priority}</priority>${p.alternates ? [['de-CH', p.alternates.de], ['en', p.alternates.en], ['x-default', p.alternates.de]].map(([l, hh]) => `
    <xhtml:link rel="alternate" hreflang="${l}" href="${abs(hh)}"/>`).join('') + [HOME.heroImage, ...HOME.studio].map((n) => `
    <image:image><image:loc>${imgUrl(n)}</image:loc></image:image>`).join('') : ''}
  </url>`).join('\n')}
</urlset>
`;
writeFileSync(join(ROOT, 'sitemap.xml'), sitemap);
writeFileSync(join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /scripts/\n\nSitemap: ${SITE.url}/sitemap.xml\n`);
console.log(`✓ ${PAGES.length} Seiten generiert: ${PAGES.map((p) => p.file).join(', ')}`);
