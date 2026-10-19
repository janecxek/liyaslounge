// Statischer Site-Generator für liyas-lounge.com (Deutsch = Hauptsprache unter /, Englisch unter /en)
// Basiert auf dem Generator von Perfect Shape Zürich – jede Sprache bekommt eigene, statische Seiten mit hreflang.
// Aufruf: node scripts/build.mjs  → schreibt alle HTML-Seiten, sitemap.xml und robots.txt ins Projekt-Root.
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
  de: { TREATMENTS: DE.TREATMENTS.map((t) => ({ ...t, deSlug: t.slug })), CATEGORIES: DE.CATEGORIES, TEAM: DE.TEAM, REVIEWS: DE.REVIEWS, HOME_FAQ: DE.HOME_FAQ },
  en: {
    TREATMENTS: DE.TREATMENTS.map((t) => {
      const e = EN_TREATMENTS[t.slug];
      if (!e) throw new Error('EN-Inhalt fehlt: ' + t.slug);
      return { ...t, ...e, deSlug: t.slug, prices: t.prices.map((p, i) => ({ ...p, priceText: undefined, ...e.prices[i] })) };
    }),
    CATEGORIES: DE.CATEGORIES.map((c) => ({ ...c, ...EN_CATEGORIES[c.id] })),
    TEAM: DE.TEAM.map((p, i) => ({ ...p, ...EN_TEAM[i] })),
    REVIEWS: DE.REVIEWS.map((r, i) => ({ ...r, tag: EN_REVIEW_TAGS[i], text: EN_REVIEW_TEXTS[i] || r.text })),
    HOME_FAQ: EN_HOME_FAQ,
  },
};

// Einzelseiten pro Behandlung (+ Übersicht). Vorerst aus: die Website zeigt nur die 3 Kategorien.
// Alle Inhalte bleiben in content.mjs / content.en.mjs erhalten – zum Ausbauen einfach auf true setzen.
const DETAIL_PAGES = false;
// Vorerst nur die Startseite (Landing): Preise, Über uns und Kontakt sind Abschnitte der Startseite,
// die Navigation scrollt dorthin. Rechtstexte bleiben eigene Seiten. Für Unterseiten auf false setzen.
const LANDING_ONLY = true;

// Seiten-Schlüssel → Pfade je Sprache (für hreflang & Sprachumschalter). Rechtliches nur auf Deutsch.
const PATHS = {
  home: { de: '/', en: '/en' },
  treatments: { de: '/behandlungen', en: '/en/treatments' },
  prices: { de: '/preise', en: '/en/prices' },
  about: { de: '/ueber-uns', en: '/en/about' },
  contact: { de: '/kontakt', en: '/en/contact' },
  agb: { de: '/agb' },
  privacy: { de: '/datenschutz' },
  imprint: { de: '/impressum' },
  notfound: { de: '/404' },
};
for (const t of DE.TREATMENTS) PATHS['t:' + t.slug] = { de: '/' + t.slug, en: '/en/' + EN_TREATMENTS[t.slug].slug };
if (!DETAIL_PAGES) PATHS.treatments = { de: '/#behandlungen', en: '/en#behandlungen' };
if (LANDING_ONLY) {
  const at = (id) => ({ de: '/#' + id, en: '/en#' + id });
  Object.assign(PATHS, { prices: at('behandlungen'), about: at('ueber-uns'), reviews: at('bewertungen'), faq: at('faq'), contact: at('kontakt') });
}
// Menüpunkte nach den Behandlungen (Header, mobiles Menü, Footer)
const NAV_KEYS = LANDING_ONLY ? ['about', 'reviews', 'faq', 'contact'] : ['prices', 'about', 'contact'];

/* ---------- UI-Texte ---------- */
const STR = {
  de: {
    htmlLang: 'de-CH', ogLocale: 'de_CH', ogAlt: 'en_GB', skip: 'Zum Inhalt springen', homeAria: 'Liyas Lounge Olten – Startseite', mainNav: 'Hauptnavigation',
    nav: { treatments: 'Behandlungen', prices: 'Preise', about: 'Über uns', reviews: 'Bewertungen', faq: 'FAQ', contact: 'Kontakt', home: 'Startseite' },
    book: 'Termin buchen', bookOnline: 'Termin anfragen', bookNow: 'Jetzt Termin anfragen', bookSecure: 'Termin anfragen', bookShort: 'Anfragen', consult: 'Kostenlose Beratung',
    megaTitle: 'Unsicher?', megaAccent: 'Wir beraten Sie.', megaText: 'Ehrlich und persönlich – wir raten auch ab, wenn etwas nicht zu Ihnen passt. Die Erstberatung ist kostenlos.',
    noticeText: 'Wir verwenden keine Cookies und kein Tracking. Gespeichert wird nur, dass Sie diesen Hinweis gelesen haben.', noticeLink: 'Datenschutzerklärung', noticeOk: 'Verstanden', noticeAria: 'Hinweis zum Datenschutz',
    contactBtn: 'Kontakt', sheetTitle: 'Wie möchten Sie', sheetAccent: 'uns erreichen?', sheetText: 'Schreiben Sie uns am einfachsten per WhatsApp – wir melden uns schnellstmöglich und finden gemeinsam einen Termin.', chWa: 'Nur Nachrichten – gerne auch mit Fotos', chIg: 'Direktnachricht an @', waMsg: 'Hallo Liyas Lounge, ich interessiere mich für {t} und hätte gerne einen Termin bzw. eine Beratung.', waDefault: 'Ihre Behandlungen', waConsult: 'Hallo Liyas Lounge, ich bin mir noch unsicher, welche Behandlung zu mir passt, und hätte gerne eine kostenlose Beratung.', sheetConsult: 'Schreiben Sie uns kurz, worum es geht – wir beraten Sie persönlich, ehrlich und kostenlos.',
    from: 'ab', call: 'Anrufen', allTreatments: 'Alle Behandlungen ansehen →', menuOpen: 'Menü öffnen', menuClose: 'Menü schliessen', mobileNav: 'Mobile Navigation', quick: 'Schnellkontakt',
    city: 'Olten',
    ctaEyebrow: 'Kostenlose Erstberatung', ctaTitle: 'Ihr Termin', ctaAccent: 'Ihre Zeit', ctaText: 'Schreiben Sie uns per WhatsApp oder rufen Sie an – wir nehmen uns Zeit für Ihre Fragen und finden gemeinsam die passende Behandlung.', ctaSmall: ['Erstberatung kostenlos', 'Bar, TWINT, Karte', 'In Olten'],
    ftrText: 'Medical Aesthetic &amp; Beauty in Olten – individuell geplant, ehrlich beraten, mit über 15 Jahren Erfahrung.', ftrPopular: 'Beliebte Behandlungen', ftrContact: 'Kontakt', ftrStudio: 'Lounge', ftrCopy: 'Medical Aesthetic &amp; Beauty',
    legal: [['agb', 'AGB'], ['privacy', 'Datenschutz'], ['imprint', 'Impressum']],
    close: 'Schliessen', crumbs: 'Breadcrumb', more: 'Mehr erfahren',
    visitEyebrow: 'Kontakt &amp; Anfahrt', visitTitle: 'In Kontakt', visitAccent: 'kommen', address: 'Adresse', phone: 'Telefon', email: 'E-Mail', appointments: 'Termine', hours: 'Öffnungszeiten', payment: 'Zahlung', whatsappText: 'Nachricht schreiben (nur Nachrichten)', route: 'Route planen',
    mapLoad: 'Karte laden', mapNote: 'Beim Laden der Karte werden Daten an Google übertragen.', privacy: 'Datenschutz', mapTitle: 'Google Maps – Liyas Lounge Olten', mapAria: 'Karte',
    langLabel: 'Sprache wählen',
  },
  en: {
    htmlLang: 'en', ogLocale: 'en_GB', ogAlt: 'de_CH', skip: 'Skip to content', homeAria: 'Liyas Lounge Olten – Home', mainNav: 'Main navigation',
    nav: { treatments: 'Treatments', prices: 'Prices', about: 'About', reviews: 'Reviews', faq: 'FAQ', contact: 'Contact', home: 'Home' },
    book: 'Book appointment', bookOnline: 'Request an appointment', bookNow: 'Request your appointment', bookSecure: 'Request an appointment', bookShort: 'Enquire', consult: 'Free consultation',
    megaTitle: 'Not sure?', megaAccent: 'We’ll advise you.', megaText: 'Honest and personal – we even advise against what doesn’t suit you. The initial consultation is free.',
    noticeText: 'We use no cookies and no tracking. We only store that you have read this notice.', noticeLink: 'Privacy policy (DE)', noticeOk: 'Got it', noticeAria: 'Privacy notice',
    contactBtn: 'Contact', sheetTitle: 'How would you like', sheetAccent: 'to reach us?', sheetText: 'The easiest way is WhatsApp – we’ll get back to you as soon as possible and find a time together.', chWa: 'Messages only – photos welcome', chIg: 'Direct message to @', waMsg: 'Hello Liyas Lounge, I’m interested in {t} and would like an appointment or a consultation.', waDefault: 'your treatments', waConsult: 'Hello Liyas Lounge, I’m not sure yet which treatment suits me and would like a free consultation.', sheetConsult: 'Send us a short message – we’ll advise you personally, honestly and free of charge.',
    from: 'from', call: 'Call', allTreatments: 'View all treatments →', menuOpen: 'Open menu', menuClose: 'Close menu', mobileNav: 'Mobile navigation', quick: 'Quick contact',
    city: 'Olten',
    ctaEyebrow: 'Free initial consultation', ctaTitle: 'Your appointment', ctaAccent: 'your time', ctaText: 'Send us a WhatsApp message or give us a call – we’ll take time for your questions and find the right treatment together.', ctaSmall: ['Free consultation', 'Cash, TWINT, card', 'In Olten'],
    ftrText: 'Medical aesthetics &amp; beauty in Olten – individually planned, honestly advised, with over 15 years of experience.', ftrPopular: 'Popular treatments', ftrContact: 'Contact', ftrStudio: 'Lounge', ftrCopy: 'Medical Aesthetics &amp; Beauty',
    legal: [['agb', 'Terms (DE)'], ['privacy', 'Privacy (DE)'], ['imprint', 'Imprint (DE)']],
    close: 'Close', crumbs: 'Breadcrumb', more: 'Learn more',
    visitEyebrow: 'Contact &amp; directions', visitTitle: 'Get in', visitAccent: 'touch', address: 'Address', phone: 'Phone', email: 'Email', appointments: 'Appointments', hours: 'Opening hours', payment: 'Payment', whatsappText: 'Send a message (messages only)', route: 'Get directions',
    mapLoad: 'Load map', mapNote: 'Loading the map transfers data to Google.', privacy: 'Privacy', mapTitle: 'Google Maps – Liyas Lounge Olten', mapAria: 'Map',
    langLabel: 'Choose language',
  },
};

/* ---------- Aktiver Sprachkontext ---------- */
let LANG = 'de';
let S = STR.de;
let D = DATA.de;
const P = (key) => (PATHS[key] && (PATHS[key][LANG] || PATHS[key].de)) || '/';
// ohne Einzelseiten führt jeder Behandlungs-Link zum passenden Abschnitt der Preisliste
const tPath = (t) => (DETAIL_PAGES ? P('t:' + t.deSlug) : LANDING_ONLY ? P('treatments') : `${P('prices')}#${t.deSlug}`);

/* ---------- Helpers ---------- */
const SMALL = new Set(['a', 'an', 'the', 'and', 'or', 'of', 'in', 'with', 'by', 'for', 'to', 'from', 'on', 'at', '&']);
const titleCase = (str) => str.split(' ').map((w, i) => (i > 0 && SMALL.has(w.toLowerCase()) ? w : w.charAt(0).toUpperCase() + w.slice(1))).join(' ');
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const chf = (n) => 'CHF ' + n.toLocaleString('de-CH').replace(/[’']/g, '’');
const minPrice = (t) => Math.min(...t.prices.filter((p) => p.price).map((p) => p.price));
const abs = (path) => SITE.url + (path === '/' ? '/' : path);
const imgUrl = (name) => `${SITE.url}/assets/img/${name}.jpg`;
const bySlug = () => Object.fromEntries(D.TREATMENTS.map((t) => [t.deSlug, t]));
const catById = () => Object.fromEntries(D.CATEGORIES.map((c) => [c.id, c]));
const addr = () => `${esc(SITE.street)}${SITE.floor ? ', ' + esc(SITE.floor) : ''}, ${SITE.zip} ${esc(S.city)}`;
const hoursText = () => [...SITE.hours.map((h) => `${esc(h[LANG])} ${h.opens}–${h.closes}`), esc(SITE.hoursNote[LANG])].join('<br>');

function srcset(name) {
  const m = IMG[name];
  if (!m) throw new Error('Bild fehlt: ' + name);
  return m.widths.map((w) => `/assets/img/${name}-${w}.webp ${w}w`).join(', ');
}
function pic(name, alt, { sizes = '100vw', eager = false } = {}) {
  const m = IMG[name];
  if (!m) throw new Error('Bild fehlt: ' + name);
  const fw = Math.min(1200, m.w);
  const fh = Math.round(m.h * (fw / m.w));
  // Optionaler Hochformat-Ausschnitt (<name>-portrait) – nur für bildschirmfüllende Bilder (Hero, CTA-Band)
  const portrait = IMG[name + '-portrait'] && (sizes === HERO_SIZES || sizes === '100vw') ? `<source media="(orientation: portrait)" type="image/webp" srcset="${srcset(name + '-portrait')}" sizes="${PORTRAIT_SIZES}">` : '';
  // Fokuspunkt (fx/fy in %) hält die Person auch in Miniaturen und schmalen Ausschnitten im Bild
  const pos = m.fx != null ? `${m.fx}% ${m.fy ?? 50}%` : '';
  const styles = [pos && `object-position:${pos}`, m.lqip && !/^\d+px$/.test(sizes) && `background:url(${m.lqip}) ${pos || '50% 50%'}/cover no-repeat`].filter(Boolean).join(';');
  const focus = styles ? ` style="${styles}"` : '';
  return `<picture>${portrait}<source type="image/webp" srcset="${srcset(name)}" sizes="${portrait ? '100vw' : sizes}"><img src="/assets/img/${name}.jpg" alt="${esc(alt)}" width="${fw}" height="${fh}"${focus} ${eager ? 'fetchpriority="high" loading="eager"' : 'loading="lazy"'} decoding="async"></picture>`;
}
const HERO_SIZES = '(orientation: portrait) 160vh, 100vw';
const PORTRAIT_SIZES = '(max-aspect-ratio: 9/16) 57vh, 100vw';
function preloadImg(name) {
  const link = (n, sizes, media) => `<link rel="preload" as="image" href="/assets/img/${n}-${IMG[n].widths[Math.min(2, IMG[n].widths.length - 1)]}.webp" imagesrcset="${srcset(n)}" imagesizes="${sizes}"${media ? ` media="${media}"` : ''} fetchpriority="high">`;
  if (IMG[name + '-portrait']) return link(name + '-portrait', PORTRAIT_SIZES, '(orientation: portrait)') + '\n' + link(name, '100vw', '(orientation: landscape)');
  return link(name, HERO_SIZES);
}

const ICONS = {
  arrow: '<path d="M7 17 17 7M8 7h9v9"/>',
  right: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  left: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.9A8 8 0 1 1 21 12z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M5 12v9h14v-9M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
  star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" fill="currentColor" stroke="none"/>',
  whatsapp: '<path d="M3 21l1.7-5A8.5 8.5 0 1 1 8 19.4z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1.2-1.3-1.8-1-1 .8a4 4 0 0 1-2.2-2.2l.8-1-1-1.8z" fill="currentColor" stroke="none"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/>',
  facebook: '<path d="M15 3h-2.5A4.5 4.5 0 0 0 8 7.5V10H5.5v4H8v7h4v-7h3l.5-4H12V7.8c0-.5.4-.8.8-.8H15z"/>',
};
const icon = (n) => `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;

// Kein Online-Buchungssystem: «Termin buchen» öffnet die Kontaktwege (WhatsApp zuerst)
const bookBtn = (label = S.book, cls = 'btn btn--dark') =>
  `<button type="button" class="${cls}" data-contact aria-haspopup="dialog" aria-controls="contact"><span>${label}</span>${icon('arrow')}</button>`;
const title = (main, accent, { tag = 'h2', cls = '', id = '' } = {}) =>
  `<${tag} class="title${cls ? ' ' + cls : ''}"${id ? ` id="${id}"` : ''} data-reveal>${esc(main)}${accent ? ` <em>${esc(accent)}</em>` : ''}</${tag}>`;

/* ---------- Strukturierte Daten ---------- */
const BUSINESS_ID = SITE.url + '/#business';
const businessSchema = () => ({
  '@context': 'https://schema.org',
  '@type': ['BeautySalon', 'MedicalBusiness'],
  '@id': BUSINESS_ID,
  name: SITE.name,
  alternateName: LANG === 'de' ? 'Liyas Lounge – Medical Aesthetic & Beauty Olten' : 'Liyas Lounge – Medical Aesthetics & Beauty Olten',
  description: LANG === 'de'
    ? 'Medical Aesthetic & Beauty in Olten: Dermal Filler, Faltenrelaxing, Mesotherapie, Fadenlifting, Facials, HIFU 5D, Morpheus8, Permanent Make-up, Wimpernverlängerung und IPL – individuell geplant, ehrlich beraten, mit über 15 Jahren Erfahrung.'
    : 'Medical aesthetics & beauty in Olten: dermal fillers, wrinkle relaxing, mesotherapy, thread lifts, facials, HIFU 5D, Morpheus8, permanent make-up, eyelash extensions and IPL – individually planned, honestly advised, with over 15 years of experience.',
  url: abs(P('home')),
  logo: SITE.url + '/icon-512.png',
  image: [SITE.url + '/assets/img/og-image.jpg', imgUrl(HOME.heroImage), ...HOME.studio.map(imgUrl)],
  ...(isSet(SITE.phone) ? { telephone: SITE.phoneHref.replace('tel:', '') } : {}),
  ...(SITE.email ? { email: SITE.email } : {}),
  priceRange: 'CHF 25 – CHF 1450',
  openingHoursSpecification: SITE.hours.map((h) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: h.days.map((d) => `https://schema.org/${{ Mo: 'Monday', Tu: 'Tuesday', We: 'Wednesday', Th: 'Thursday', Fr: 'Friday', Sa: 'Saturday', Su: 'Sunday' }[d]}`), opens: h.opens, closes: h.closes })),
  currenciesAccepted: 'CHF',
  paymentAccepted: LANG === 'de' ? 'Bargeld, TWINT, Karte' : 'Cash, TWINT, card',
  ...(SITE.geo ? { geo: { '@type': 'GeoCoordinates', latitude: SITE.geo.lat, longitude: SITE.geo.lng } } : {}),
  address: { '@type': 'PostalAddress', ...(isSet(SITE.street) ? { streetAddress: SITE.street } : {}), postalCode: SITE.zip, addressLocality: SITE.city, addressRegion: 'SO', addressCountry: 'CH' },
  hasMap: SITE.googleMaps,
  availableLanguage: ['de', 'en'],
  areaServed: [{ '@type': 'City', name: 'Olten' }, { '@type': 'State', name: 'Kanton Solothurn' }],
  sameAs: [SITE.instagram, SITE.facebook].filter(Boolean),
  knowsAbout: D.TREATMENTS.map((t) => t.navName),
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: S.nav.treatments,
    itemListElement: D.CATEGORIES.map((c) => ({
      '@type': 'OfferCatalog',
      name: c.name,
      itemListElement: D.TREATMENTS.filter((t) => t.category === c.id).map((t) => ({ '@type': 'Offer', priceCurrency: 'CHF', price: minPrice(t), url: abs(tPath(t)), itemOffered: { '@type': 'Service', name: t.navName } })),
    })),
  },
});
const websiteSchema = () => ({ '@context': 'https://schema.org', '@type': 'WebSite', '@id': SITE.url + '/#website', url: SITE.url + '/', name: SITE.name, alternateName: ['Liyas Lounge Olten', 'liyas-lounge.com'], inLanguage: ['de-CH', 'en'], publisher: { '@id': BUSINESS_ID } });
const breadcrumbSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [[S.nav.home, P('home')], ...items].map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(path) })),
});
const faqSchema = (faq) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: S.htmlLang, mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });

/* ---------- Layout ---------- */
const logoWord = () => `<span class="logo__word">Liyas <em>Lounge</em></span>`;

// Sprachumschalter: verlinkt immer auf die entsprechende Seite der anderen Sprache
function langSwitch(key) {
  const href = (l) => (PATHS[key] && PATHS[key][l]) || PATHS.home[l];
  const item = (l, label) => `<a href="${href(l)}" lang="${STR[l].htmlLang}" hreflang="${STR[l].htmlLang}"${l === LANG ? ' aria-current="true"' : ''} data-lang-link>${label}</a>`;
  return `<nav class="lang" data-active="${LANG}" aria-label="${S.langLabel}">${item('de', 'DE')}${item('en', 'EN')}</nav>`;
}

function header(active, key) {
  const a = (k) => (active === k ? ' aria-current="page"' : '');
  return `
<a class="skip" href="#main">${S.skip}</a>
<header class="hdr" id="top">
  <div class="container hdr__in">
    <a class="logo" href="${P('home')}" aria-label="${S.homeAria}" data-top>${logoWord()}</a>
    <nav class="nav" aria-label="${S.mainNav}">
      <ul class="nav__list">
        ${DETAIL_PAGES ? `<li class="nav__item has-mega"><a href="${P('treatments')}" class="nav__link"${a('treatments')} aria-haspopup="true" aria-expanded="false">${S.nav.treatments} ${icon('chevron')}</a>
          <div class="mega"><div class="mega__in">
            ${D.CATEGORIES.map((c) => `<div class="mega__col"><p class="mega__title">${esc(c.name)}</p><ul>${D.TREATMENTS.filter((t) => t.category === c.id).map((t) => `<li><a href="${tPath(t)}">${esc(t.navName)}</a></li>`).join('')}</ul></div>`).join('')}
            <div class="mega__cta"><p class="title">${esc(S.megaTitle)} <em>${esc(S.megaAccent)}</em></p><p>${esc(S.megaText)}</p><button type="button" class="btn btn--dark btn--sm" data-contact data-intent="consult" aria-haspopup="dialog" aria-controls="contact"><span>${S.consult}</span>${icon('arrow')}</button></div>
          </div></div>
        </li>` : `<li class="nav__item"><a href="${P('treatments')}" class="nav__link">${S.nav.treatments}</a></li>`}
        ${NAV_KEYS.map((k) => `<li class="nav__item"><a href="${P(k)}" class="nav__link"${a(k)}>${S.nav[k]}</a></li>`).join('')}
      </ul>
    </nav>
    <div class="hdr__actions">
      ${langSwitch(key)}
      ${isSet(SITE.phone) ? `<a class="hdr__phone" href="${SITE.phoneHref}" aria-label="${S.call}: ${esc(SITE.phone)}">${icon('phone')}<span>${esc(SITE.phone)}</span></a>` : ''}
      ${bookBtn(S.book, 'btn btn--dark hdr__cta')}
      <button class="burger" type="button" aria-label="${S.menuOpen}" data-label-open="${S.menuOpen}" data-label-close="${S.menuClose}" aria-expanded="false" aria-controls="mnav"><span></span><span></span></button>
    </div>
  </div>
</header>
<div class="mnav" id="mnav" hidden data-lenis-prevent>
  <div class="mnav__in">
    <nav aria-label="${S.mobileNav}">
      <ul class="mnav__list">
        <li><a href="${P('home')}">${S.nav.home}</a></li>
        ${DETAIL_PAGES ? `<li><details><summary>${S.nav.treatments} ${icon('plus')}</summary>
          ${D.CATEGORIES.map((c) => `<p class="mnav__cat">${esc(c.name)}</p><ul>${D.TREATMENTS.filter((t) => t.category === c.id).map((t) => `<li><a href="${tPath(t)}">${esc(t.navName)}</a></li>`).join('')}</ul>`).join('')}
          <p class="mnav__cat"><a href="${P('treatments')}">${S.allTreatments}</a></p>
        </details></li>` : `<li><a href="${P('treatments')}">${S.nav.treatments}</a></li>`}
        ${NAV_KEYS.map((k) => `<li><a href="${P(k)}">${S.nav[k]}</a></li>`).join('')}
      </ul>
    </nav>
    <div class="mnav__foot">
      <div class="mnav__lang">${langSwitch(key)}</div>
      ${bookBtn(S.bookOnline, 'btn btn--dark btn--lg btn--block')}
      <div class="mnav__row">${isSet(SITE.phone) ? `<a class="btn btn--line" href="${SITE.phoneHref}">${icon('phone')}<span>${S.call}</span></a>` : ''}<a class="btn btn--line" href="${SITE.whatsapp}" target="_blank" rel="noopener">${icon('whatsapp')}<span>WhatsApp</span></a></div>
      <p class="mnav__addr">${addr()}<br>${hoursText()}</p>
    </div>
  </div>
</div>`;
}

function ctaBand() {
  return `
<section class="band band--cta" aria-labelledby="cta-title">
  <div class="band__media" data-parallax>${pic(HOME.ctaImage, LANG === 'de' ? HOME.ctaAlt : 'White calla lilies against a black background – appointment at Liyas Lounge Olten')}</div>
  <div class="container band__in">
    <p class="eyebrow eyebrow--light" data-reveal>${S.ctaEyebrow}</p>
    <h2 class="title title--lg title--light" id="cta-title" data-reveal>${esc(S.ctaTitle)} <em>${esc(S.ctaAccent)}</em></h2>
    <p data-reveal>${esc(S.ctaText)}</p>
    <div class="hero__ctas" data-reveal><a class="btn btn--light btn--lg" href="${SITE.whatsapp}" target="_blank" rel="noopener">${icon('whatsapp')}<span>WhatsApp</span></a>${bookBtn(S.consult, 'btn btn--line-light btn--lg')}</div>
    <p class="band__small" data-reveal>${S.ctaSmall.map((x) => `<span>${esc(x)}</span>`).join('')}</p>
  </div>
</section>`;
}

// Kontaktwege – im Pop-up und auf der Kontaktseite (WhatsApp zuerst, Telefon, E-Mail, Instagram falls vorhanden)
const IG_HANDLE = SITE.instagram ? SITE.instagram.replace(/\/+$/, '').split('/').pop() : '';
const waLink = (topic) => `${SITE.whatsapp}?text=${encodeURIComponent(S.waMsg.replace('{t}', topic || S.waDefault))}`;
const channels = (topic, cls = '') => `<ul class="channels${cls}">
  <li><a class="channel channel--primary channel--wa" href="${esc(waLink(topic))}" data-wa-consult="${esc(`${SITE.whatsapp}?text=${encodeURIComponent(S.waConsult)}`)}" target="_blank" rel="noopener"><span class="channel__ico">${icon('whatsapp')}</span><span class="channel__txt"><b>WhatsApp</b><small>${S.chWa}</small></span><span class="channel__go">${icon('arrow')}</span></a></li>
  ${isSet(SITE.phone) ? `<li><a class="channel" href="${SITE.phoneHref}"><span class="channel__ico">${icon('phone')}</span><span class="channel__txt"><b>${S.call}</b><small>${esc(SITE.phone)}</small></span><span class="channel__go">${icon('arrow')}</span></a></li>` : ''}
  ${SITE.email ? `<li><a class="channel" href="mailto:${SITE.email}"><span class="channel__ico">${icon('mail')}</span><span class="channel__txt"><b>${S.email}</b><small>${esc(SITE.email)}</small></span><span class="channel__go">${icon('arrow')}</span></a></li>` : ''}
  ${IG_HANDLE ? `<li><a class="channel" href="https://ig.me/m/${esc(IG_HANDLE)}" target="_blank" rel="noopener"><span class="channel__ico">${icon('instagram')}</span><span class="channel__txt"><b>Instagram</b><small>${S.chIg}${esc(IG_HANDLE)}</small></span><span class="channel__go">${icon('arrow')}</span></a></li>` : ''}
</ul>`;

// Footer: beliebteste Behandlungen (deutsche Slugs)
const FOOTER_TOP = ['dermal-filler-olten', 'faltenrelaxing-olten', 'facial-treatments-olten', 'hifu-olten', 'ipl-haarentfernung-olten'];

function footer({ cta = true, topic = '' } = {}) {
  const popular = FOOTER_TOP.map((slug) => D.TREATMENTS.find((t) => t.deSlug === slug)).filter(Boolean);
  const social = [[SITE.instagram, 'Instagram', 'instagram'], [SITE.facebook, 'Facebook', 'facebook'], [SITE.whatsapp, 'WhatsApp', 'whatsapp']].filter(([u]) => u);
  return `${cta ? ctaBand() : ''}
<footer class="ftr">
  <div class="container">
    <div class="ftr__top">
      <div class="ftr__brand">
        <a class="logo logo--light" href="${P('home')}" aria-label="${S.homeAria}" data-top>${logoWord()}</a>
        <p>${S.ftrText}</p>
        <div class="ftr__social">${social.map(([u, l, i]) => `<a href="${esc(u)}" target="_blank" rel="noopener" aria-label="${l}">${icon(i)}</a>`).join('')}</div>
      </div>
      ${DETAIL_PAGES ? `<nav aria-label="${S.ftrPopular}"><p class="ftr__title">${S.ftrPopular}</p><ul>${popular.map((t) => `<li><a href="${tPath(t)}">${esc(t.navName)}</a></li>`).join('')}<li><a class="ftr__more" href="${P('treatments')}">${S.allTreatments}</a></li></ul></nav>`
        : `<nav aria-label="${S.nav.treatments}"><p class="ftr__title">${S.nav.treatments}</p><ul>${D.CATEGORIES.map((c) => `<li><a href="${P('home')}#kat-${c.id}">${esc(c.name)}</a></li>`).join('')}</ul></nav>`}
      <nav aria-label="${S.ftrStudio}"><p class="ftr__title">${S.ftrStudio}</p><ul>${['treatments', ...NAV_KEYS].map((k) => `<li><a href="${P(k)}">${S.nav[k]}</a></li>`).join('')}</ul></nav>
      <div>
        <p class="ftr__title">${S.ftrContact}</p>
        <address>
          <a href="${SITE.route}" target="_blank" rel="noopener">${esc(SITE.street)}<br>${SITE.zip} ${esc(S.city)}</a>
          ${isSet(SITE.phone) ? `<a href="${SITE.phoneHref}">${esc(SITE.phone)}</a>` : ''}
          <a href="${SITE.whatsapp}" target="_blank" rel="noopener">WhatsApp ${LANG === 'de' ? '(nur Nachrichten)' : '(messages only)'}</a>
          ${SITE.email ? `<a href="mailto:${SITE.email}">${esc(SITE.email)}</a>` : ''}
          <span>${hoursText()}</span>
        </address>
        ${bookBtn(S.book, 'btn btn--light btn--sm ftr__book')}
      </div>
    </div>
  </div>
  <p class="ftr__word" aria-hidden="true">Liyas <em>Lounge</em></p>
  <div class="container ftr__bottom">
    <p>© <span data-year>${new Date().getFullYear()}</span> Liyas Lounge Olten · ${S.ftrCopy}</p>
    <ul class="ftr__inline">${S.legal.map(([k, l]) => `<li><a href="${P(k)}"${LANG !== 'de' ? ' hreflang="de-CH"' : ''}>${l}</a></li>`).join('')}</ul>
  </div>
</footer>
<nav class="mbar" aria-label="${S.quick}">
  <button type="button" class="mbar__btn" data-contact aria-haspopup="dialog" aria-controls="contact">${icon('chat')}<span>${S.contactBtn}</span></button>
  <a href="${esc(waLink(topic))}" class="mbar__btn mbar__btn--primary" target="_blank" rel="noopener">${icon('whatsapp')}<span>${S.book}</span></a>
</nav>
<div class="notice" role="region" aria-label="${S.noticeAria}" hidden data-notice>
  <p>${S.noticeText} <a href="${P('privacy')}">${S.noticeLink}</a></p>
  <button type="button" class="btn btn--dark btn--sm" data-notice-ok><span>${S.noticeOk}</span></button>
</div>
<button type="button" class="cfab" data-contact aria-haspopup="dialog" aria-controls="contact">${icon('chat')}<span>${S.contactBtn}</span></button>
<div class="csheet" id="contact" role="dialog" aria-modal="true" aria-labelledby="contact-title" hidden data-lenis-prevent>
  <div class="csheet__backdrop" data-cclose></div>
  <div class="csheet__box">
    <div class="csheet__head">
      <p class="csheet__title" id="contact-title">${S.sheetTitle} <em>${S.sheetAccent}</em></p>
      <button class="csheet__close" type="button" data-cclose aria-label="${S.close}">${icon('x')}</button>
    </div>
    <p class="csheet__text" data-consult-text="${esc(S.sheetConsult)}">${S.sheetText}</p>
    ${channels(topic)}
  </div>
</div>`;
}

function layout({ key, title: pageTitle, description, active = '', body, schemas = [], ogImage = '/assets/img/og-image.jpg', preload = '', noindex = false, hasHero = false, cta = true, topic = '' }) {
  return {
    title: pageTitle, description, ogImage, preload, noindex, hasHero,
    ld: [websiteSchema(), businessSchema(), ...schemas].map((x) => `<script type="application/ld+json">${JSON.stringify(x)}</script>`).join('\n'),
    inner: `${header(active, key)}\n<main id="main">\n${body}\n</main>\n${footer({ cta, topic })}`,
  };
}

// Weiche Trennstellen für lange Wörter in grossen Überschriften (kleine Smartphones)
const SHY = ['Meso|therapie', 'Meso|therapy', 'Behand|lungen', 'Wimpern|verlängerung', 'Haar|entfernung', 'Hyaluron|säure', 'Micro|needling', 'Faden|lifting', 'Falten|relaxing', 'Pigmen|tierung', 'Zahn|bleaching', 'Erfahrun|gen', 'Kontra|indikationen', 'Lipo|lyse', 'Treat|ments', 'Exten|sions'];
const SHY_RE = new RegExp(`(${SHY.map((w) => w.replace(/\|/g, '')).join('|')})`, 'g');
const SHY_MAP = Object.fromEntries(SHY.map((w) => [w.replace(/\|/g, ''), w.replace(/\|/g, '­')]));
const shyHeadings = (html) => html.replace(/(<h[12][^>]*>)([\s\S]*?)(<\/h[12]>)/g, (m, a, inner, z) => a + inner.replace(/(^|>)([^<]+)/g, (mm, gt, txt) => gt + txt.replace(SHY_RE, (w) => SHY_MAP[w])) + z);

// Eine Sprache pro Dokument – hreflang verbindet die Sprachversionen
function compose(key, page) {
  const canonical = abs(P(key));
  const alt = PATHS[key] || {};
  const hreflang = [alt.de && `<link rel="alternate" hreflang="de-CH" href="${abs(alt.de)}">`, alt.en && `<link rel="alternate" hreflang="en" href="${abs(alt.en)}">`, alt.de && `<link rel="alternate" hreflang="x-default" href="${abs(alt.de)}">`].filter(Boolean).join('\n');
  return `<!doctype html>
<html lang="${S.htmlLang}"${LANG === 'en' ? ' class="lang-en"' : ''}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<script>document.documentElement.classList.add('js');if(location.hash.length>1){window.__hash=location.hash;history.replaceState(null,'',location.pathname+location.search)}</script>
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
${page.noindex ? '<meta name="robots" content="noindex, follow">' : '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">'}
<link rel="canonical" href="${canonical}">
${page.noindex ? '' : hreflang}
<meta name="theme-color" content="#faf9f6">
<meta name="format-detection" content="telephone=no">
<meta name="geo.region" content="CH-SO">
<meta name="geo.placename" content="Olten">
<meta property="og:type" content="website">
<meta property="og:locale" content="${S.ogLocale}">
<meta property="og:locale:alternate" content="${S.ogAlt}">
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE.url}${page.ogImage}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(page.title)}">
<meta name="twitter:description" content="${esc(page.description)}">
<meta name="twitter:image" content="${SITE.url}${page.ogImage}">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/assets/fonts/inter-tight-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/instrument-serif-italic.woff2" as="font" type="font/woff2" crossorigin>
${page.preload}
<link rel="stylesheet" href="/assets/css/style.min.css?v=${VERSION}">
<script src="/assets/js/lenis.min.js?v=${VERSION}" defer></script>
<script src="/assets/js/main.js?v=${VERSION}" defer></script>
${page.ld}
<script type="speculationrules">{"prerender":[{"where":{"and":[{"href_matches":"/*"},{"not":{"selector_matches":"[target=_blank], [download]"}}]},"eagerness":"moderate"}]}</script>
</head>
<body${page.hasHero ? ' class="has-hero"' : ''}>
<div class="lp lp--${LANG}" data-pane="${LANG}" lang="${S.htmlLang}">
${page.inner}
</div>
</body>
</html>
`;
}

const crumbs = (items) => `<nav class="crumbs" aria-label="${S.crumbs}"><ol><li><a href="${P('home')}">${S.nav.home}</a></li>${items.map(([n, p], i) => (i === items.length - 1 ? `<li aria-current="page">${esc(n)}</li>` : `<li><a href="${p}">${esc(n)}</a></li>`)).join('')}</ol></nav>`;

const faqList = (faq) => `<div class="faq" data-reveal>${faq.map(([q, a]) => `<details class="faq__item"><summary><span>${esc(q)}</span><i aria-hidden="true"></i></summary><div class="faq__a"><p>${esc(a)}</p></div></details>`).join('')}</div>`;

// Kategorien als aufklappbare Bildkarten → Behandlungen → Unterseite
function categoryList(list, { catTag = 'h3', itemTag = 'h4', open = -1 } = {}) {
  const de = LANG === 'de';
  const count = (n) => (de ? `${n} ${n === 1 ? 'Behandlung' : 'Behandlungen'}` : `${n} ${n === 1 ? 'treatment' : 'treatments'}`);
  return `<div class="cats" data-cats>${D.CATEGORIES.map((c, i) => {
    const items = list.filter((t) => t.category === c.id);
    if (!items.length) return '';
    const from = Math.min(...items.map(minPrice));
    const isOpen = i === open;
    return `<div class="cat${isOpen ? ' is-open' : ''}" data-reveal>
      <${catTag} class="cat__h"><button type="button" class="cat__btn" aria-expanded="${isOpen}" aria-controls="cat-${c.id}">
        <span class="cat__img">${pic(c.image, '', { sizes: '(max-width: 640px) 96px, 240px' })}</span>
        <span class="cat__num">${String(i + 1).padStart(2, '0')}</span>
        <span class="cat__body"><span class="cat__name">${esc(c.name)}</span><span class="cat__short">${esc(c.short)}</span></span>
        <span class="cat__meta"><span>${count(items.length)}</span><span>${S.from} ${chf(from)}</span></span>
        <span class="cat__plus" aria-hidden="true"></span>
      </button></${catTag}>
      <div class="cat__panel" id="cat-${c.id}" role="region" aria-label="${esc(c.name)}"><div class="cat__inner"><ul class="cat__list">${items.map((t) => `<li><a class="cat__item" href="${tPath(t)}">
        <span class="cat__thumb">${pic(t.image, '', { sizes: '80px' })}</span>
        <div class="cat__txt"><${itemTag} class="cat__iname">${esc(t.navName)}</${itemTag}><p class="cat__card">${esc(t.card)}</p></div>
        <span class="cat__price">${S.from} ${chf(minPrice(t))}</span>
        <span class="cat__arrow">${icon('arrow')}</span>
      </a></li>`).join('')}</ul></div></div>
    </div>`;
  }).join('')}</div>`;
}

// Startseite: Behandlungen nach Kategorie – je Kategorie eine Reihe hochformatiger Karten zum seitlichen Wischen
function treatRail(list) {
  const de = LANG === 'de';
  const count = (n) => (de ? `${n} ${n === 1 ? 'Behandlung' : 'Behandlungen'}` : `${n} ${n === 1 ? 'treatment' : 'treatments'}`);
  return `</div>${D.CATEGORIES.map((c, ci) => {
    const items = list.filter((t) => t.category === c.id);
    if (!items.length) return '';
    return `<div class="tcat" data-rail-wrap>
    <div class="container">
      <div class="tcat__head" data-reveal>
        <span class="tcat__num">${String(ci + 1).padStart(2, '0')}</span>
        <div class="tcat__title"><h3 class="tcat__name">${esc(c.name)}</h3><p class="tcat__short">${esc(c.short)}</p></div>
        <p class="tcat__meta"><span>${count(items.length)}</span><span>${S.from} ${chf(Math.min(...items.map(minPrice)))}</span></p>
        <div class="trail__arrows"><button type="button" class="arrow-circle" data-dir="-1" aria-label="${de ? 'Zurück' : 'Previous'}">${icon('left')}</button><button type="button" class="arrow-circle" data-dir="1" aria-label="${de ? 'Weiter' : 'Next'}">${icon('right')}</button></div>
      </div>
    </div>
    <div class="trail" data-rail>
      <ul class="trail__track">${items.map((t, i) => `<li class="tcard">
        <a class="tcard__link" href="${tPath(t)}">
          <span class="tcard__media">${pic(t.image, t.imageAlt, { sizes: '(max-width: 640px) 76vw, 330px' })}</span>
          <span class="tcard__top"><span>${String(i + 1).padStart(2, '0')}</span>${t.chips && t.chips[0] ? `<span>${esc(t.chips[0])}</span>` : ''}</span>
          <span class="tcard__body">
            <span class="tcard__name">${esc(t.name)}</span>
            <span class="tcard__text">${esc(t.card)}</span>
            <span class="tcard__foot"><span>${S.from} ${chf(minPrice(t))}</span>${icon('arrow')}</span>
          </span>
        </a>
      </li>`).join('')}</ul>
    </div>
    <div class="container"><div class="trail__bar" aria-hidden="true"><span data-progress></span></div></div>
  </div>`;
  }).join('')}
  <div class="container">`;
}

const priceRow = (p) => `<li class="prow">
  <div><p class="prow__name">${esc(p.name)}${p.detail ? ` <span>· ${esc(p.detail)}</span>` : ''}${p.featured ? `<b class="badge">${LANG === 'de' ? 'Beliebt' : 'Popular'}</b>` : ''}</p>${p.desc ? `<p class="prow__desc">${esc(p.desc)}</p>` : ''}${p.extra ? `<p class="prow__extra">${esc(p.extra)}</p>` : ''}</div>
  <div class="prow__side"><p class="prow__price">${p.priceText && p.price ? esc(p.priceText).replace(' · ', '<br>') : p.price ? `${p.from ? `<small>${S.from}</small> ` : ''}${chf(p.price)}` : esc(p.priceText)}</p>${bookBtn(S.bookShort, 'btn btn--line btn--xs')}</div>
</li>`;

function heroMedia(name, alt, pos = '50% 50%', posM = '') {
  return `<div class="hero__media" style="--pos:${pos};${posM ? `--pos-m:${posM}` : ''}"><div class="hero__parallax" data-hero-parallax>${pic(name, alt, { sizes: HERO_SIZES, eager: true })}</div></div>`;
}

const mapBox = () => `<div class="map" data-map="${esc(SITE.mapEmbed)}" data-map-title="${esc(S.mapTitle)}" data-reveal>
      <div class="map__ph">
        <span class="map__pin">${icon('pin')}</span>
        <p><b>Liyas Lounge</b><br>${esc(SITE.street)}, ${SITE.zip} ${esc(S.city)}</p>
        <button type="button" class="btn btn--dark btn--sm" data-map-load>${S.mapLoad}</button>
        <small>${S.mapNote} <a href="${P('privacy')}">${S.privacy}</a></small>
      </div>
    </div>`;

function visitBlock() {
  return `<section class="section" id="kontakt" aria-labelledby="visit-title">
  <div class="container visit">
    <div>
      <p class="eyebrow" data-reveal>${S.visitEyebrow}</p>
      ${title(S.visitTitle, S.visitAccent, { id: 'visit-title' })}
      <ul class="clist" data-reveal>
        <li><b>${S.address}</b><a href="${SITE.route}" target="_blank" rel="noopener">${addr()}</a></li>
        ${isSet(SITE.phone) ? `<li><b>${S.phone}</b><a href="${SITE.phoneHref}">${esc(SITE.phone)}</a></li>` : ''}
        <li><b>WhatsApp</b><a href="${SITE.whatsapp}" target="_blank" rel="noopener">${S.whatsappText}</a></li>
        ${SITE.email ? `<li><b>${S.email}</b><a href="mailto:${SITE.email}">${esc(SITE.email)}</a></li>` : ''}
        <li><b>${S.hours}</b><span>${hoursText()}</span></li>
        <li><b>${S.payment}</b><span>${esc(SITE.payment[LANG])}</span></li>
      </ul>
      <div class="visit__ctas" data-reveal>${bookBtn()}<a class="btn btn--line" href="${SITE.route}" target="_blank" rel="noopener"><span>${S.route}</span>${icon('arrow')}</a></div>
    </div>
    ${mapBox()}
  </div>
</section>`;
}

/* ---------- Seiten ---------- */
const PAGES = [];
const fileFor = (path) => (path === '/' ? 'index.html' : path === '/en' ? 'en/index.html' : path.slice(1) + '.html');
const add = (key, parts, { priority = '0.7', changefreq = 'monthly', sitemap = true, file } = {}) => {
  const path = P(key);
  // Rechtliche Seiten gibt es nur auf Deutsch – die englische Ebene verlinkt dorthin
  if (LANG !== 'de' && !(PATHS[key] && PATHS[key][LANG])) return;
  PAGES.push({ key, lang: LANG, path, file: file || fileFor(path), priority, changefreq, sitemap: sitemap && !parts.noindex, html: shyHeadings(compose(key, parts)) });
};

function buildLang(lang) {
  LANG = lang; S = STR[lang]; D = DATA[lang];
  const de = lang === 'de';
  const B = bySlug();
  const CAT = catById();
  const TR = D.TREATMENTS;

  /* Texte der gemeinsamen Bausteine */
  const H = de ? {
    l1: 'Ihre Schönheit.', l2: 'Meine Leidenschaft.',
    heroLead: 'Medical Aesthetic &amp; Beauty in Olten – persönlich betreut, ehrlich beraten und mit Blick für natürliche, typgerechte Ergebnisse.',
    second: 'Kostenlose Beratung',
    aTitle: 'Ihre Lounge', aAccent: 'für Ästhetik &amp; Beauty',
    aText: 'Ruhig, persönlich und ohne Zeitdruck: In der Liyas Lounge in Olten nehmen wir uns Zeit für Sie. Wir hören zu, beraten ehrlich und planen jede Behandlung so, dass sie zu Ihnen passt – heute und langfristig.',
    aLink: 'Über uns',
    tEyebrow: 'Behandlungen', tTitle: 'Unsere', tAccent: 'Behandlungen', tText: 'Dermal Filler, Faltenrelaxing, Facials, HIFU 5D, Permanent Make-up &amp; mehr – individuell geplant und ehrlich beraten, in der Liyas Lounge in Olten.', allPrices: 'Alle Preise',
    sEyebrow: 'Liyas Lounge · Olten', route: 'Route planen',
    g: ['Empfang der Liyas Lounge in Olten', 'Behandlungsraum der Liyas Lounge in Olten', 'Details: Ampullen, Handtücher und Orchideen in der Liyas Lounge'],
    teamEyebrow: 'Über uns', teamTitle: 'Persönlich.', teamAccent: 'Mit Herz & Sorgfalt.', teamText: 'Hinter der Liyas Lounge steht eine Gastgeberin mit Leidenschaft für Ästhetik und Beauty, viel Feingefühl und dem Anspruch, dass Sie sich rundum wohlfühlen – von der ersten Nachricht bis zur Nachsorge.', teamLink: 'Mehr über uns',
    values: [['Persönliche Betreuung', 'Wir nehmen uns Zeit für Sie und all Ihre Fragen – ohne Zeitdruck.'], ['Ehrliche Einschätzung', 'Wir empfehlen nur, was zu Ihnen passt – auch wenn das weniger ist.'], ['Hygiene & Qualität', 'Saubere Abläufe und ausschliesslich zugelassene Produkte.']],
    revEyebrow: 'Kundenstimmen', revTitle: 'Echte', revAccent: 'Erfahrungen', stars: '5 von 5 Sternen', prev: 'Vorherige Bewertung', next: 'Nächste Bewertung', google: 'Bewertungen auf Google',
    fTitle: 'Häufige', fAccent: 'Fragen', fText: 'Ihre Frage ist nicht dabei? Schreiben Sie uns per WhatsApp oder rufen Sie an – wir helfen gerne.', fLink: 'Kontakt aufnehmen',
    title: 'Liyas Lounge | Medizinische Ästhetik & Beauty in Olten', description: 'Medizinische Ästhetik & Beauty in Olten: Dermal Filler, Faltenrelaxing, Facials, HIFU, Permanent Make-up & IPL – ehrlich beraten. Kostenlose Erstberatung.',
    heroAlt: HOME.heroAlt,
    trustEyebrow: 'Echte Erfahrungen', trustTitle: 'In besten', trustAccent: 'Händen', cnEyebrow: 'Kostenlose Beratung', cnText: 'Sie wissen noch nicht, welche Behandlung zu Ihnen passt? Schreiben Sie uns kurz per WhatsApp – gerne mit Foto – oder rufen Sie an. Wir beraten Sie ehrlich und kostenlos und empfehlen nur, was wirklich sinnvoll ist.', cnWa: 'Per WhatsApp fragen',
    gReviews: 'Google-Bewertungen', studioNav: ['Empfang', 'Behandlungsraum', 'Details'], studioShow: 'Bild anzeigen:',
  } : {
    l1: 'Your beauty.', l2: 'My passion.',
    heroLead: 'Medical aesthetics &amp; beauty in Olten – personally looked after, honestly advised, with an eye for natural results that suit you.',
    second: 'Free consultation',
    aTitle: 'Your lounge', aAccent: 'for aesthetics &amp; beauty',
    aText: 'Calm, personal and never rushed: at Liyas Lounge in Olten we take time for you. We listen, advise honestly and plan every treatment to suit you – today and in the long term.',
    aLink: 'About us',
    tEyebrow: 'Treatments', tTitle: 'Our', tAccent: 'Treatments', tText: 'Dermal fillers, wrinkle relaxing, facials, HIFU 5D, permanent make-up &amp; more – individually planned and honestly advised, at Liyas Lounge in Olten.', allPrices: 'All prices',
    sEyebrow: 'Liyas Lounge · Olten', route: 'Get directions',
    g: ['Reception of Liyas Lounge in Olten', 'Treatment room at Liyas Lounge in Olten', 'Details: ampoules, towels and orchids at Liyas Lounge'],
    teamEyebrow: 'About us', teamTitle: 'Personal.', teamAccent: 'With heart & care.', teamText: 'Behind Liyas Lounge is a host with a passion for aesthetics and beauty, a fine touch and one aim: that you feel completely at ease – from your first message to aftercare.', teamLink: 'More about us',
    values: [['Personal care', 'We take time for you and all your questions – never in a rush.'], ['Honest assessment', 'We only recommend what suits you – even if that means less.'], ['Hygiene & quality', 'Clean processes and approved products only.']],
    revEyebrow: 'Client reviews', revTitle: 'Real', revAccent: 'Experiences', stars: '5 out of 5 stars', prev: 'Previous review', next: 'Next review', google: 'Reviews on Google',
    fTitle: 'Frequent', fAccent: 'Questions', fText: 'Your question isn’t listed? Send us a WhatsApp message or give us a call – we’re happy to help.', fLink: 'Get in touch',
    title: 'Liyas Lounge | Medical Aesthetics & Beauty in Olten', description: 'Medical aesthetics & beauty in Olten: dermal fillers, wrinkle relaxing, facials, HIFU, permanent make-up & IPL – honest advice. Free initial consultation.',
    heroAlt: 'The owner of Liyas Lounge in her studio in Olten',
    trustEyebrow: 'Real experiences', trustTitle: 'In the best', trustAccent: 'hands', cnEyebrow: 'Free consultation', cnText: 'Not sure which treatment is right for you? Send us a short WhatsApp message – photos welcome – or give us a call. We’ll advise you honestly and free of charge, and only recommend what truly makes sense.', cnWa: 'Ask on WhatsApp',
    gReviews: 'Google reviews', studioNav: ['Reception', 'Treatment room', 'Details'], studioShow: 'Show image:',
  };

  /* ---------- Gemeinsame Bausteine (Startseite & Unterseiten) ---------- */
  const studioBand = ({ aboutLink = true, titleTag = 'h2', main = H.aTitle, accent = H.aAccent, text = H.aText } = {}) => `<section class="studio" id="lounge" aria-labelledby="about-title" data-studio>
  <div class="studio__media">
    ${HOME.studio.map((img, i) => `<figure class="studio__slide${i === 0 ? ' is-active' : ''}" data-slide>${pic(img, H.g[i], { sizes: '100vw' })}</figure>`).join('')}
  </div>
  <div class="container studio__in">
    <div class="studio__text">
      <p class="eyebrow eyebrow--light" data-reveal>${H.sEyebrow}</p>
      <${titleTag} class="title title--light" id="about-title" data-reveal>${main} <em>${accent}</em></${titleTag}>
      <p data-reveal>${text}</p>
      <div class="studio__links">${aboutLink ? `<a class="link link--light" href="${P('about')}">${H.aLink} ${icon('right')}</a>` : ''}<a class="link link--light" href="${SITE.route}" target="_blank" rel="noopener">${H.route} ${icon('arrow')}</a></div>
    </div>
    <div class="studio__nav">${H.studioNav.map((n, i) => `<button type="button" class="studio__dot${i === 0 ? ' is-active' : ''}" data-dot="${i}" aria-label="${H.studioShow} ${n}" aria-pressed="${i === 0}"><i></i><span>${n}</span></button>`).join('')}</div>
  </div>
</section>`;
  const expertRows = (nameTag = 'h3') => `<ul class="experts">
      ${D.TEAM.map((p, i) => `<li data-reveal${i ? ` style="--d:120ms"` : ''}><a class="expert" href="${P('about')}#team">
        <span class="expert__img">${pic(p.image, p.alt, { sizes: '160px' })}</span>
        <div class="expert__txt"><span class="expert__num">0${i + 1}</span><${nameTag} class="expert__name">${esc(p.name)}</${nameTag}><span class="expert__role">${esc(p.role)}</span></div>
        <span class="arrow-circle">${icon('arrow')}</span>
      </a></li>`).join('')}
    </ul>`;
  // Startseite: Inhaberin – Text links, grosses Porträt rechts
  const ownerSection = () => {
    const p = D.TEAM[0];
    return `<section class="section owner" id="ueber-uns" aria-labelledby="team-title">
  <div class="container owner__grid">
    <div class="owner__text">
      <p class="eyebrow" data-reveal>${H.teamEyebrow}</p>
      ${title(H.teamTitle, H.teamAccent, { id: 'team-title' })}
      <p class="owner__lead" data-reveal>${esc(H.teamText)}</p>
      <ul class="owner__values">${H.values.map(([t, d], i) => `<li data-reveal style="--d:${i * 90}ms"><span>0${i + 1}</span><div><b>${esc(t)}</b><p>${esc(d)}</p></div></li>`).join('')}</ul>
      <div class="owner__ctas" data-reveal>${bookBtn()}${LANDING_ONLY ? '' : `<a class="link" href="${P('about')}">${H.teamLink} ${icon('right')}</a>`}</div>
    </div>
    <div class="owner__media" data-reveal>
      <figure class="owner__main">${pic(p.image, p.alt, { sizes: '(max-width: 900px) 92vw, 48vw' })}</figure>
    </div>
  </div>
</section>`;
  };
  const googleLink = () => `<a class="link" href="${SITE.googleMaps}" target="_blank" rel="noopener">${SITE.googleRating && SITE.googleReviewCount ? `${String(SITE.googleRating).replace('.', de ? ',' : '.')} / 5 · ${SITE.googleReviewCount} ${H.gReviews}` : H.google} ${icon('arrow')}</a>`;
  const reviewSlider = (first = 0) => {
    const list = D.REVIEWS.map((r, i) => [r, i]);
    const ordered = [...list.slice(first), ...list.slice(0, first)];
    return `<div class="slider" data-slider data-reveal>
      <div class="stars" role="img" aria-label="${H.stars}">${icon('star').repeat(5)}</div>
      <div class="slider__viewport">
        ${ordered.map(([r], k) => `<figure class="review${k === 0 ? ' is-active' : ''}" aria-hidden="${k === 0 ? 'false' : 'true'}">
          <blockquote><p>„${esc(r.text)}“</p></blockquote>
          <figcaption><b>${esc(r.name)}</b> <span>· ${esc(r.tag)}</span></figcaption>
        </figure>`).join('')}
      </div>
      <div class="slider__nav">
        <button type="button" class="arrow-circle" data-prev aria-label="${H.prev}">${icon('left')}</button>
        <span class="slider__count" aria-live="polite"><b data-current>1</b> / ${D.REVIEWS.length}</span>
        <button type="button" class="arrow-circle" data-next aria-label="${H.next}">${icon('right')}</button>
      </div>
    </div>`;
  };
  const reviewsSection = ({ alt = true } = {}) => `<section class="section${alt ? ' section--alt' : ''}" aria-labelledby="reviews-title">
  <div class="container reviews">
    <p class="eyebrow" data-reveal>${H.revEyebrow}</p>
    ${title(H.revTitle, H.revAccent, { id: 'reviews-title' })}
    <div class="reviews__slider">${reviewSlider()}</div>
    <p class="reviews__google" data-reveal>${googleLink()}</p>
  </div>
</section>`;
  const trustSection = ({ first = 0, alt = false } = {}) => `<section class="section${alt ? ' section--alt' : ''}" aria-labelledby="trust-title">
  <div class="container">
    <div class="head">
      <div><p class="eyebrow" data-reveal>${H.trustEyebrow}</p>${title(H.trustTitle, H.trustAccent, { id: 'trust-title' })}</div>
      <div class="head__text" data-reveal><p>${H.teamText}</p></div>
    </div>
    <div class="trust-grid">
      <div class="trust-grid__reviews">${reviewSlider(first)}<p class="reviews__google" data-reveal>${googleLink()}</p></div>
      <div class="trust-grid__team">${expertRows()}</div>
    </div>
  </div>
</section>`;
  const consultSection = ({ alt = false } = {}) => `<section class="section${alt ? ' section--alt' : ''}" aria-labelledby="consult-title">
  <div class="container consult" data-reveal>
    <div class="consult__text">
      <p class="eyebrow">${H.cnEyebrow}</p>
      ${title(S.megaTitle, S.megaAccent, { id: 'consult-title' })}
      <p>${H.cnText}</p>
    </div>
    <div class="consult__actions">
      <a class="btn btn--dark btn--lg" href="${esc(`${SITE.whatsapp}?text=${encodeURIComponent(S.waConsult)}`)}" target="_blank" rel="noopener">${icon('whatsapp')}<span>${H.cnWa}</span></a>
      ${isSet(SITE.phone) ? `<a class="btn btn--line btn--lg" href="${SITE.phoneHref}">${icon('phone')}<span>${esc(SITE.phone)}</span></a>` : ''}
    </div>
  </div>
</section>`;
  const faqSection = (items, { alt = false, eyebrow = 'FAQ', id = 'faq' } = {}) => `<section class="section${alt ? ' section--alt' : ''}" id="${id}" aria-labelledby="${id}-title">
  <div class="container faq-grid">
    <div class="faq-grid__head">
      <p class="eyebrow" data-reveal>${eyebrow}</p>
      ${title(H.fTitle, H.fAccent, { id: id + '-title' })}
      <p data-reveal>${H.fText}</p>
      <p data-reveal><a class="link" href="${SITE.whatsapp}" target="_blank" rel="noopener">WhatsApp ${icon('right')}</a></p>
    </div>
    ${faqList(items)}
  </div>
</section>`;
  const treatmentRows = (list, itemTag = 'h3') => `<ul class="cat__list cat__list--flat">${list.map((t) => `<li data-reveal><a class="cat__item" href="${tPath(t)}">
        <span class="cat__thumb">${pic(t.image, '', { sizes: '80px' })}</span>
        <div class="cat__txt"><${itemTag} class="cat__iname">${esc(t.navName)}</${itemTag}><p class="cat__card">${esc(t.card)}</p></div>
        <span class="cat__price">${S.from} ${chf(minPrice(t))}</span>
        <span class="cat__arrow">${icon('arrow')}</span>
      </a></li>`).join('')}</ul>`;

  /* Startseite – Versprechen & Vertrauen → Angebot → einfacher Weg → Lounge & Team → Beweis → Einwände → Abschluss */
  {
    const C = de ? {
      trustReviews: 'Google-Bewertungen', trustYears: 'Persönliche Betreuung', trustFree: 'Erstberatung kostenlos', trustShort: ['Google', 'Persönlich betreut', 'Gratis-Beratung'],
      kEyebrow: 'Behandlungen', kTitle: 'Was dürfen wir', kAccent: 'für Sie tun?', kText: 'Drei Bereiche, ein Anspruch: natürliche, typgerechte Ergebnisse. Welche Behandlung zu Ihnen passt, finden wir gemeinsam in der kostenlosen Beratung heraus.',
      rEyebrow: 'Kundenstimmen', rTitle: 'Was unsere Kundinnen', rAccent: 'sagen', rFrom: (n) => `aus ${n} Google-Bewertungen`, rAll: 'Alle Bewertungen auf Google',
    } : {
      trustReviews: 'Google reviews', trustYears: 'Personal care', trustFree: 'Free consultation', trustShort: ['Google', 'Personal care', 'Free consultation'],
      kEyebrow: 'Treatments', kTitle: 'How can we', kAccent: 'help you?', kText: 'Three areas, one standard: natural results that suit you. Which treatment is right for you is something we work out together in your free consultation.',
      rEyebrow: 'Client reviews', rTitle: 'What our clients', rAccent: 'say', rFrom: (n) => `from ${n} Google reviews`, rAll: 'All reviews on Google',
    };
    const rating = SITE.googleRating && SITE.googleReviewCount;
    const ratingTxt = rating ? String(SITE.googleRating).replace('.', de ? ',' : '.') : '';
    const waTo = (text) => esc(`${SITE.whatsapp}?text=${encodeURIComponent(text)}`);
    const firstOf = (c) => TR.find((t) => t.category === c.id);
    // langer Text ab Tablet, kurzer auf dem Handy – damit die Vertrauenszeile immer einzeilig bleibt
    const dual = (long, short) => (long === short ? long : `<span class="t-lg">${long}</span><span class="t-sm">${short}</span>`);
    const body = `
<section class="hero hero--home" aria-labelledby="hero-title">
  ${heroMedia(HOME.heroImage, H.heroAlt, HOME.heroPos, HOME.heroPosMobile)}
  <div class="container hero__content">
    <div class="hero__grid">
      <h1 class="title title--xl title--light hero__title hero__title--wide" id="hero-title"><span class="ln"><span>${H.l1}</span></span><span class="ln"><span><em>${H.l2}</em></span></span></h1>
      <div class="hero__side">
        <p class="hero__lead fade-up d1">${H.heroLead}</p>
        <div class="hero__ctas fade-up d2">${bookBtn(S.book, 'btn btn--light btn--lg')}<a class="btn btn--line-light btn--lg" href="${waTo(S.waConsult)}" target="_blank" rel="noopener"><span>${H.second}</span></a></div>
      </div>
      <ul class="hero__proof fade-up d3">
        ${rating ? `<li><a href="${SITE.googleMaps}" target="_blank" rel="noopener"><span class="hero__stars" aria-hidden="true">${icon('star').repeat(5)}</span><b>${ratingTxt}</b> · ${SITE.googleReviewCount} ${dual(C.trustReviews, C.trustShort[0])}</a></li>` : ''}
        <li>${icon('check')}${dual(C.trustYears, C.trustShort[1])}</li><li>${icon('check')}${dual(C.trustFree, C.trustShort[2])}</li>
      </ul>
    </div>
  </div>
</section>

<section class="section section--alt" id="behandlungen" aria-labelledby="treat-title">
  <div class="container">
    <div class="head">
      <div><p class="eyebrow" data-reveal>${C.kEyebrow}</p>${title(C.kTitle, C.kAccent, { id: 'treat-title' })}</div>
      <div class="head__text" data-reveal><p>${C.kText}</p></div>
    </div>
  </div>
  <div class="kats" data-kats>
    <ul class="kats__track">${D.CATEGORIES.map((c, i) => {
      const items = TR.filter((t) => t.category === c.id);
      return `<li class="kat" id="kat-${c.id}" data-reveal style="--d:${i * 100}ms">
      <a class="kat__link" href="${LANDING_ONLY ? waTo(S.waMsg.replace('{t}', c.name)) : `${P('prices')}#${firstOf(c).deSlug}`}"${LANDING_ONLY ? ' target="_blank" rel="noopener"' : ''}>
        ${pic(c.image, c.name, { sizes: '(max-width: 900px) 80vw, 31vw' })}
        <span class="kat__cap"><span class="kat__name">${esc(c.name)}</span><span class="kat__from">${S.from} ${chf(Math.min(...items.map(minPrice)))} ${icon('arrow')}</span></span>
      </a>
    </li>`;
    }).join('')}</ul>
  </div>
</section>

${studioBand()}

${ownerSection()}

<section class="section section--alt" id="bewertungen" aria-labelledby="rev-title">
  <div class="container">
    <div class="rhead">
      <div><p class="eyebrow" data-reveal>${C.rEyebrow}</p>${title(C.rTitle, C.rAccent, { id: 'rev-title' })}</div>
      ${rating ? `<a class="rscore" href="${SITE.googleMaps}" target="_blank" rel="noopener" data-reveal><b>${ratingTxt}</b><span class="rscore__stars" aria-hidden="true">${icon('star').repeat(5)}</span><span>${C.rFrom(SITE.googleReviewCount)}</span></a>` : ''}
    </div>
  </div>
  <div data-rail-wrap>
    <div class="trail" data-rail>
      <ul class="trail__track">${D.REVIEWS.map((rv) => `<li class="rcard">
        <figure>
          <div class="rcard__stars" aria-label="${H.stars}">${icon('star').repeat(5)}</div>
          <blockquote><p>${de ? '„' : '“'}${esc(rv.text)}${de ? '“' : '”'}</p></blockquote>
          <figcaption><span class="rcard__avatar" aria-hidden="true">${esc(rv.name.charAt(0))}</span><span><b>${esc(rv.name)}</b>${rv.place ? `<small>${esc(rv.place)} · ${esc(rv.tag)}</small>` : `<small>${esc(rv.tag)}</small>`}</span></figcaption>
        </figure>
      </li>`).join('')}</ul>
    </div>
    <div class="container rfoot"><div class="trail__bar" aria-hidden="true"><span data-progress></span></div><div class="trail__arrows"><button type="button" class="arrow-circle" data-dir="-1" aria-label="${H.prev}">${icon('left')}</button><button type="button" class="arrow-circle" data-dir="1" aria-label="${H.next}">${icon('right')}</button></div></div>
    ${rating ? '' : `<div class="container"><p class="reviews__google" data-reveal>${googleLink()}</p></div>`}
  </div>
</section>

<section class="section" id="faq" aria-labelledby="faq-title">
  <div class="container faq-grid">
    <div class="faq-grid__head">
      <p class="eyebrow" data-reveal>FAQ</p>
      ${title(H.fTitle, H.fAccent, { id: 'faq-title' })}
      <p data-reveal>${H.fText}</p>
      <p data-reveal><a class="link" href="${P('contact')}">${H.fLink} ${icon('right')}</a></p>
    </div>
    ${faqList(D.HOME_FAQ)}
  </div>
</section>

${ctaBand()}

${visitBlock()}
`;
    add('home', layout({ key: 'home', title: H.title, description: H.description, body, hasHero: true, cta: false, schemas: [faqSchema(D.HOME_FAQ)], preload: preloadImg(HOME.heroImage) }), { priority: '1.0', changefreq: 'weekly' });
  }

  /* Behandlungsseiten */
  const TP = de ? {
    prices: 'Preise', toc: ['Methode', 'Ablauf', 'Ergebnisse', 'Preise', 'FAQ'], tocAria: 'Auf dieser Seite',
    forWhom: 'Für wen', plus: 'Ihr Plus', goodToKnow: 'Gut zu wissen', process: 'Ablauf', pTitle: 'Schritt', pAccent: 'für Schritt', pText: 'Transparent von der kostenlosen Beratung bis zur Nachsorge – damit Sie genau wissen, was Sie erwartet.',
    expect: 'Was Sie erwarten können', pricesOf: 'Preise', prTitle: 'Transparente', prAccent: 'Preise', prText: 'Preise pro Behandlung in CHF. Die finalen Kosten besprechen wir in der kostenlosen Beratung – ehrlich und ohne versteckte Kosten.', allPrices: 'Alle Preise',
    faqOf: 'FAQ', fTitle: 'Häufige', fAccent: 'Fragen', fText: 'Noch Fragen? Wir beraten Sie gerne persönlich – per WhatsApp, telefonisch oder direkt in der Lounge.',
    relEyebrow: 'Passt gut dazu', relTitle: 'Weitere', relAccent: 'Behandlungen', allT: 'Alle Behandlungen', and: 'und',
  } : {
    prices: 'Prices', toc: ['Method', 'Process', 'Results', 'Prices', 'FAQ'], tocAria: 'On this page',
    forWhom: 'Who it’s for', plus: 'Your benefits', goodToKnow: 'Good to know', process: 'Process', pTitle: 'Step', pAccent: 'by Step', pText: 'Transparent from the free consultation to aftercare – so you know exactly what to expect.',
    expect: 'What to expect', pricesOf: 'Prices', prTitle: 'Transparent', prAccent: 'Prices', prText: 'Prices per treatment in CHF. We confirm the final cost in your free consultation – honest and without hidden costs.', allPrices: 'All prices',
    faqOf: 'FAQ', fTitle: 'Frequent', fAccent: 'Questions', fText: 'Any questions? We’re happy to advise you personally – via WhatsApp, by phone or in the lounge.',
    relEyebrow: 'Goes well with', relTitle: 'More', relAccent: 'Treatments', allT: 'All treatments', and: 'and',
  };
  if (DETAIL_PAGES) for (const t of TR) {
    const cat = CAT[t.category];
    const key = 't:' + t.deSlug;
    const path = tPath(t);
    const from = minPrice(t);
    const related = t.related.map((s) => B[s]);
    const words = t.what.title.replace(/\?$/, '').split(' ');
    const whatMain = words.slice(0, 2).join(' ');
    const whatAccent = words.slice(2).join(' ') + '?';
    const accent = de ? t.h1Accent : titleCase(t.h1Accent);
    const body = `
<section class="hero hero--page" aria-labelledby="t-title">
  ${heroMedia(t.image, t.imageAlt)}
  <div class="container hero__content">
    ${crumbs([[S.nav.treatments, P('treatments')], [t.navName, path]])}
    <div class="hero__grid">
      <h1 class="title title--lg title--light hero__title" id="t-title"><span class="ln"><span>${esc(t.h1)}</span></span><span class="ln"><span><em>${esc(accent)}</em></span></span></h1>
      <div class="hero__side">
        <p class="price-tag fade-up d1"><span>${S.from}</span><b>${chf(from)}</b></p>
        <div class="hero__ctas fade-up d2">${bookBtn(S.book, 'btn btn--light btn--lg')}<a class="btn btn--line-light btn--lg" href="#preise"><span>${TP.prices}</span></a></div>
      </div>
    </div>
  </div>
</section>

<nav class="toc" aria-label="${TP.tocAria}">
  <div class="container toc__in">
    <a href="#was">${TP.toc[0]}</a><a href="#indikationen">${esc(t.indications.title)}</a><a href="#ablauf">${TP.toc[1]}</a><a href="#ergebnisse">${TP.toc[2]}</a><a href="#preise">${TP.toc[3]}</a><a href="#faq">${TP.toc[4]}</a>
    ${bookBtn(S.book, 'btn btn--dark btn--xs toc__cta')}
  </div>
</nav>

<section class="section" id="was" aria-labelledby="was-title">
  <div class="container split">
    <div class="split__head">
      <p class="eyebrow" data-reveal>${esc(t.keyword)}</p>
      ${title(whatMain, whatAccent, { id: 'was-title' })}
    </div>
    <div class="split__body">
      <p class="lead" data-reveal>${esc(t.lead)}</p>
      <p data-reveal>${esc(t.intro)}</p>
      <p data-reveal>${esc(t.what.text)}</p>
      <ul class="checks" data-reveal>${t.what.bullets.map((b) => `<li>${icon('check')}<span>${esc(b)}</span></li>`).join('')}</ul>
    </div>
  </div>
</section>

<section class="section section--alt" id="indikationen" aria-label="${esc(t.indications.title)} ${TP.and} ${esc(t.contra.title)}">
  <div class="container duo">
    <div data-reveal>
      <p class="eyebrow">${TP.forWhom}</p>
      <h2>${esc(t.indications.title)}</h2>
      <ul class="checks">${t.indications.items.map((b) => `<li>${icon('check')}<span>${esc(b)}</span></li>`).join('')}</ul>
    </div>
    <div data-reveal style="--d:120ms">
      <p class="eyebrow">${t.contra.positive ? TP.plus : TP.goodToKnow}</p>
      <h2>${esc(t.contra.title)}</h2>
      <ul class="checks ${t.contra.positive ? '' : 'checks--x'}">${t.contra.items.map((b) => `<li>${icon(t.contra.positive ? 'check' : 'x')}<span>${esc(b)}</span></li>`).join('')}</ul>
      <p class="note">${esc(t.contra.note)}</p>
    </div>
  </div>
</section>

<section class="section" id="ablauf" aria-labelledby="ablauf-title">
  <div class="container">
    <div class="head">
      <div><p class="eyebrow" data-reveal>${TP.process}</p>${title(TP.pTitle, TP.pAccent, { id: 'ablauf-title' })}</div>
      <div class="head__text" data-reveal><p>${TP.pText}</p></div>
    </div>
    <ol class="steps steps--${t.steps.length === 3 ? 3 : 4}">
      ${t.steps.map(([h, d], i) => `<li data-reveal style="--d:${i * 100}ms"><span class="steps__n">0${i + 1}</span><h3>${esc(h)}</h3><p>${esc(d)}</p></li>`).join('')}
    </ol>
  </div>
</section>

<section class="section section--dark" id="ergebnisse" aria-labelledby="erg-title">
  <div class="container results">
    <div>
      <p class="eyebrow eyebrow--light" data-reveal>${TP.expect}</p>
      ${title(t.results.title.split(' & ')[0], t.results.title.includes(' & ') ? '& ' + t.results.title.split(' & ')[1] : '', { id: 'erg-title', cls: 'title--light' })}
      <ul class="checks checks--light" data-reveal>${t.results.items.map((b) => `<li>${icon('check')}<span>${esc(b)}</span></li>`).join('')}</ul>
      <p class="note" style="color:rgba(255,255,255,.62)" data-reveal>${esc(t.results.note)}</p>
    </div>
    <div>${t.results.stats.map(([v, l], i) => `<div class="rstat" data-reveal style="--d:${i * 120}ms"><b>${esc(v)}</b><span>${esc(l)}</span></div>`).join('')}</div>
  </div>
</section>

<section class="section" id="preise" aria-labelledby="preise-title">
  <div class="container prices">
    <div class="prices__head">
      <p class="eyebrow" data-reveal>${TP.pricesOf} ${esc(t.navName)}</p>
      ${title(TP.prTitle, TP.prAccent, { id: 'preise-title' })}
      <p data-reveal>${TP.prText}</p>
      <div class="prices__cta" data-reveal>${bookBtn(S.bookSecure)}<a class="link" href="${P('prices')}">${TP.allPrices} ${icon('right')}</a></div>
    </div>
    <div data-reveal>
      <ul class="plist">${t.prices.map(priceRow).join('')}</ul>
      ${t.priceNote ? `<p class="note">${esc(t.priceNote)}</p>` : ''}
    </div>
  </div>
</section>

${trustSection({ first: 0, alt: true })}

<section class="section" id="faq" aria-labelledby="faq-title">
  <div class="container faq-grid">
    <div class="faq-grid__head">
      <p class="eyebrow" data-reveal>${TP.faqOf} ${esc(t.navName)}</p>
      ${title(TP.fTitle, TP.fAccent, { id: 'faq-title' })}
      <p data-reveal>${TP.fText}</p>
      <p data-reveal><a class="link" href="${SITE.whatsapp}" target="_blank" rel="noopener">WhatsApp ${icon('right')}</a></p>
    </div>
    ${faqList(t.faq)}
  </div>
</section>

<section class="section section--alt" aria-labelledby="rel-title">
  <div class="container">
    <div class="head">
      <div><p class="eyebrow" data-reveal>${TP.relEyebrow}</p>${title(TP.relTitle, TP.relAccent, { id: 'rel-title' })}</div>
      <div class="head__text" data-reveal><a class="link" href="${P('treatments')}">${TP.allT} ${icon('right')}</a></div>
    </div>
    ${treatmentRows(related)}
  </div>
</section>
`;
    const serviceSchema = {
      '@context': 'https://schema.org', '@type': 'Service', '@id': abs(path) + '#service',
      name: t.navName + ' in Olten', serviceType: t.navName, category: cat.name, description: t.description,
      url: abs(path), image: imgUrl(t.image), provider: { '@id': BUSINESS_ID }, areaServed: { '@type': 'City', name: 'Olten' }, inLanguage: S.htmlLang,
      offers: t.prices.filter((p) => p.price).map((p) => ({ '@type': 'Offer', name: p.name + (p.detail ? ` (${p.detail})` : ''), price: p.price, priceCurrency: 'CHF', url: abs(path) + '#preise', availability: 'https://schema.org/InStock' })),
    };
    add(key, layout({
      key, title: t.title, description: t.description, active: 'treatments', body, hasHero: true, topic: t.navName,
      schemas: [serviceSchema, faqSchema(t.faq), breadcrumbSchema([[S.nav.treatments, P('treatments')], [t.navName, path]])],
      ogImage: `/assets/img/${t.image}.jpg`, preload: preloadImg(t.image),
    }), { priority: de ? '0.9' : '0.8' });
  }

  /* Behandlungen Übersicht */
  if (DETAIL_PAGES) {
    const n = TR.length;
    const T = de
      ? { l1: 'Behandlungen', l2: 'in Olten', eyebrow: `${n} Behandlungen · ${D.CATEGORIES.length} Kategorien`, h2: 'Finden Sie', h2a: 'Ihre Behandlung', text: `Medical Aesthetic, Haut &amp; Gesicht und Beauty – alle ${n} Behandlungen der Liyas Lounge in Olten im Überblick.`, alt: 'Lounge der Liyas Lounge in Olten', title: 'Alle Behandlungen – Ästhetik & Beauty Olten | Liyas Lounge', description: 'Alle Behandlungen im Überblick: Dermal Filler, Faltenrelaxing, Mesotherapie, Fadenlifting, Facials, HIFU, Morpheus8, Permanent Make-up, Lashes & IPL in Olten.' }
      : { l1: 'Treatments', l2: 'in Olten', eyebrow: `${n} treatments · ${D.CATEGORIES.length} categories`, h2: 'Find', h2a: 'your treatment', text: `Medical aesthetics, skin &amp; face and beauty – all ${n} treatments at Liyas Lounge in Olten at a glance.`, alt: 'The lounge at Liyas Lounge in Olten', title: 'All Treatments – Aesthetics & Beauty Olten | Liyas Lounge', description: 'All treatments at a glance: dermal fillers, wrinkle relaxing, mesotherapy, thread lifts, facials, HIFU, Morpheus8, permanent make-up, lashes & IPL in Olten.' };
    const body = `
<section class="hero hero--page" aria-labelledby="b-title">
  ${heroMedia(HOME.treatmentsHero, T.alt)}
  <div class="container hero__content">
    ${crumbs([[S.nav.treatments, P('treatments')]])}
    <div class="hero__grid">
      <h1 class="title title--lg title--light hero__title" id="b-title"><span class="ln"><span>${T.l1}</span></span><span class="ln"><span><em>${T.l2}</em></span></span></h1>
      <div class="hero__side"><div class="hero__ctas fade-up d1">${bookBtn(S.book, 'btn btn--light btn--lg')}<a class="btn btn--line-light btn--lg" href="${P('prices')}"><span>${S.nav.prices}</span></a></div></div>
    </div>
  </div>
</section>
<section class="section" aria-labelledby="bl-title">
  <div class="container">
    <div class="head">
      <div><p class="eyebrow" data-reveal>${T.eyebrow}</p>${title(T.h2, T.h2a, { id: 'bl-title' })}</div>
      <div class="head__text" data-reveal><p>${T.text}</p></div>
    </div>
    ${categoryList(TR, { catTag: 'h3', itemTag: 'h4', open: 0 })}
  </div>
</section>
${consultSection({ alt: true })}
${reviewsSection({ alt: false })}
`;
    add('treatments', layout({
      key: 'treatments', title: T.title, description: T.description, active: 'treatments', body, hasHero: true, preload: preloadImg(HOME.treatmentsHero),
      schemas: [breadcrumbSchema([[S.nav.treatments, P('treatments')]]), { '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: TR.map((t, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(tPath(t)), name: t.navName })) }],
    }), { priority: de ? '0.9' : '0.8' });
  }

  /* Preise */
  if (!LANDING_ONLY) {
    const PRICE_FAQ = D.HOME_FAQ.filter(([q]) => /kostet|cost|bezahlen|pay|kostenlos|free/i.test(q));
    const T = de
      ? { l1: 'Preise', l2: 'transparent &amp; fair', text: 'Alle Preise pro Behandlung in CHF. Die finalen Kosten besprechen wir in der kostenlosen Beratung – ehrlich und ohne versteckte Kosten.', toc: 'Preiskategorien', to: 'Zur Behandlung', note: 'Alle Preise in Schweizer Franken (CHF). Preisänderungen vorbehalten. Zahlung bar, mit TWINT oder per Karte. Es gelten unsere', terms: 'AGB', title: 'Preise – Ästhetik & Beauty Olten | Liyas Lounge', description: 'Alle Preise der Liyas Lounge in Olten: IPL ab CHF 49, Dermal Filler ab CHF 130, Faltenrelaxing ab CHF 130, Facials ab CHF 150, HIFU ab CHF 150.' }
      : { l1: 'Prices', l2: 'transparent &amp; fair', text: 'All prices per treatment in CHF. We confirm the final cost in your free consultation – honest and without hidden costs.', toc: 'Price categories', to: 'View treatment', note: 'All prices in Swiss francs (CHF). Prices subject to change. Payment in cash, with TWINT or by card. Our', terms: 'terms (German) apply', title: 'Prices – Aesthetics & Beauty Olten | Liyas Lounge', description: 'All prices at Liyas Lounge in Olten: IPL from CHF 49, dermal fillers from CHF 130, wrinkle relaxing from CHF 130, facials from CHF 150, HIFU from CHF 150.' };
    const body = `
<section class="phead">
  <div class="container">
    ${crumbs([[S.nav.prices, P('prices')]])}
    <div class="phead__row">
      <h1 class="title title--lg hero__title"><span class="ln"><span>${T.l1}</span></span><span class="ln"><span><em>${T.l2}</em></span></span></h1>
      <div><p class="lead fade-up d1">${T.text}</p><div class="hero__ctas fade-up d2" style="margin-top:24px">${bookBtn(S.bookSecure)}</div></div>
    </div>
  </div>
</section>
<nav class="toc" aria-label="${T.toc}">
  <div class="container toc__in">${TR.map((t) => `<a href="#${t.deSlug}">${esc(t.navName)}</a>`).join('')}</div>
</nav>
<section class="section section--tight">
  <div class="container">
    ${TR.map((t) => `<article class="pgroup" id="${t.deSlug}" aria-labelledby="pg-${t.deSlug}">
      <div class="pgroup__head" data-reveal>
        <div class="pgroup__img">${pic(t.image, t.imageAlt, { sizes: '(max-width: 900px) 92vw, 26vw' })}</div>
        <p class="eyebrow">${esc(CAT[t.category].name)}</p>
        <h2 id="pg-${t.deSlug}">${esc(t.navName)}</h2>
        ${DETAIL_PAGES ? `<a class="link" href="${tPath(t)}">${T.to} ${icon('right')}</a>` : ''}
      </div>
      <div data-reveal><ul class="plist">${t.prices.map(priceRow).join('')}</ul>${t.priceNote ? `<p class="note">${esc(t.priceNote)}</p>` : ''}</div>
    </article>`).join('')}
    <p class="note">${T.note} <a href="${P('agb')}" style="text-decoration:underline">${T.terms}</a>.</p>
  </div>
</section>
${consultSection({ alt: true })}
${faqSection(PRICE_FAQ)}
`;
    add('prices', layout({ key: 'prices', title: T.title, description: T.description, active: 'prices', body, schemas: [breadcrumbSchema([[S.nav.prices, P('prices')]]), faqSchema(PRICE_FAQ)] }), { priority: de ? '0.9' : '0.8' });
  }

  /* Über uns */
  if (!LANDING_ONLY) {
    const T = de
      ? { l1: 'Ihre Lounge', l2: 'in Olten', text: 'Ehrliche Beratung, Sorgfalt und viel Feingefühl – in ruhiger, persönlicher Atmosphäre.', team: 'Team', alt: 'Empfang der Liyas Lounge in Olten', eyebrow: 'Über Liyas Lounge', intro: 'Wir verändern nicht, wer Sie sind – wir unterstützen, was Sie ausmacht. Jede Behandlung in der Liyas Lounge beginnt mit Zuhören, einer ehrlichen Einschätzung und einem Plan, der zu Ihrem Gesicht und Ihrem Alltag passt. <em>Natürlich</em>, persönlich und ohne Zeitdruck.', tEyebrow: 'Ihre Expertin', tTitle: 'Das', tAccent: 'Team', sTitle: 'Unsere', sAccent: 'Lounge', sText: 'Ruhig, hell und diskret – ein Ort zum Ankommen, mitten in Olten.', title: 'Über uns – Liyas Lounge Olten | Ästhetik & Beauty', description: 'Liyas Lounge in Olten: Leidenschaft für Ästhetik und Beauty, ehrliche Beratung und natürliche Ergebnisse – persönlich und ohne Zeitdruck.' }
      : { l1: 'Your lounge', l2: 'in Olten', text: 'Honest advice, care and a fine touch – in a calm, personal setting.', team: 'Team', alt: 'Reception of Liyas Lounge in Olten', eyebrow: 'About Liyas Lounge', intro: 'We don’t set out to change who you are – we enhance what makes you, you. Every treatment at Liyas Lounge begins with listening, an honest assessment and a plan that suits your features and your everyday life. <em>Natural</em>, personal and never rushed.', tEyebrow: 'Your expert', tTitle: 'The', tAccent: 'Team', sTitle: 'Our', sAccent: 'Lounge', sText: 'Calm, bright and discreet – a place to arrive, in the heart of Olten.', title: 'About Us – Liyas Lounge Olten | Aesthetics & Beauty', description: 'Liyas Lounge in Olten: a passion for aesthetics and beauty, honest advice and natural results – personal and never rushed.' };
    const body = `
<section class="hero hero--page" aria-labelledby="u-title">
  ${heroMedia(HOME.aboutHero, T.alt)}
  <div class="container hero__content">
    ${crumbs([[S.nav.about, P('about')]])}
    <div class="hero__grid">
      <h1 class="title title--lg title--light hero__title" id="u-title"><span class="ln"><span>${T.l1}</span></span><span class="ln"><span><em>${T.l2}</em></span></span></h1>
      <div class="hero__side"><div class="hero__ctas fade-up d1">${bookBtn(S.book, 'btn btn--light btn--lg')}<a class="btn btn--line-light btn--lg" href="#team"><span>${T.team}</span></a></div></div>
    </div>
  </div>
</section>
<section class="section"><div class="container"><p class="eyebrow" data-reveal>${T.eyebrow}</p><p class="intro__text words" data-words>${T.intro}</p></div></section>
<section class="section section--alt" id="team" aria-labelledby="team-title">
  <div class="container">
    <div class="head"><div><p class="eyebrow" data-reveal>${T.tEyebrow}</p>${title(T.tTitle, T.tAccent, { id: 'team-title' })}</div></div>
    ${D.TEAM.map((p) => `<article class="bio">
      <div class="bio__img" data-reveal="img">${pic(p.image, p.alt, { sizes: '(max-width: 900px) 92vw, 36vw' })}</div>
      <div class="bio__text">
        <p class="eyebrow" data-reveal>${esc(p.roleShort)}</p>
        ${title(p.name, '', { tag: 'h3', cls: 'title--md' })}
        <p class="bio__role" data-reveal>${esc(p.role)}</p>
        ${p.bio.map((b) => `<p data-reveal>${esc(b)}</p>`).join('')}
        <ul class="checks" data-reveal>${p.facts.map((f) => `<li>${icon('check')}<span>${esc(f)}</span></li>`).join('')}</ul>
      </div>
    </article>`).join('')}
  </div>
</section>
${studioBand({ aboutLink: false, main: T.sTitle, accent: T.sAccent, text: T.sText })}
${reviewsSection({ alt: true })}
${visitBlock()}
`;
    add('about', layout({
      key: 'about', title: T.title, description: T.description, active: 'about', body, hasHero: true, preload: preloadImg(HOME.aboutHero),
      schemas: [breadcrumbSchema([[S.nav.about, P('about')]])],
    }), { priority: de ? '0.8' : '0.7' });
  }

  /* Kontakt */
  if (!LANDING_ONLY) {
    const CONTACT_FAQ = D.HOME_FAQ.filter(([q]) => !/natürlich|natural|schmerz|painful|gesellschaft|go out/i.test(q));
    const T = de
      ? { l1: 'Kontakt', l2: '&amp; Termin', text: 'Am schnellsten per WhatsApp (nur Nachrichten) – oder rufen Sie uns an. Wir melden uns schnellstmöglich und finden gemeinsam einen Termin.', direct: 'Direkt erreichen', title: 'Kontakt & Termin – Liyas Lounge Olten', description: 'Kontakt zur Liyas Lounge in Olten: WhatsApp (nur Nachrichten), Telefon & E-Mail. Mo–Fr 10–19 Uhr, Sa nach Vereinbarung. Kostenlose Erstberatung.' }
      : { l1: 'Contact', l2: '&amp; booking', text: 'Fastest via WhatsApp (messages only) – or give us a call. We’ll get back to you as soon as possible and find a time together.', direct: 'Reach us directly', title: 'Contact & Booking – Liyas Lounge Olten', description: 'Contact Liyas Lounge in Olten: WhatsApp (messages only), phone & email. Mon–Fri 10am–7pm, Sat by appointment. Free initial consultation.' };
    const body = `
<section class="phead">
  <div class="container">
    ${crumbs([[S.nav.contact, P('contact')]])}
    <div class="phead__row">
      <h1 class="title title--lg hero__title"><span class="ln"><span>${T.l1}</span></span><span class="ln"><span><em>${T.l2}</em></span></span></h1>
      <p class="lead fade-up d1">${T.text}</p>
    </div>
  </div>
</section>
<section class="section section--tight" aria-label="${T.direct}">
  <div class="container" data-reveal>${channels('', ' channels--page')}</div>
</section>
${visitBlock()}
${faqSection(CONTACT_FAQ, { alt: true })}
`;
    add('contact', layout({
      key: 'contact', title: T.title, description: T.description, active: 'contact', body, cta: false,
      schemas: [breadcrumbSchema([[S.nav.contact, P('contact')]]), faqSchema(CONTACT_FAQ), { '@context': 'https://schema.org', '@type': 'ContactPage', url: abs(P('contact')), name: T.title, about: { '@id': BUSINESS_ID } }],
    }), { priority: de ? '0.8' : '0.7' });
  }

  /* Rechtliches (Inhalt nur auf Deutsch – rechtlich verbindlich) */
  if (de) {
    const stand = new Date().toLocaleDateString('de-CH', { month: 'long', year: 'numeric' });
    const legal = (key, pageTitle, h1, description, content) => {
      const body = `
<section class="phead"><div class="container">${crumbs([[h1, P(key)]])}<h1 class="title title--lg">${esc(h1)}</h1></div></section>
<section class="section section--tight"><div class="container prose">${content}</div></section>`;
      add(key, layout({ key, title: pageTitle, description, body, cta: false, schemas: [breadcrumbSchema([[h1, P(key)]])] }), { priority: '0.3', changefreq: 'yearly' });
    };
    legal('agb', 'AGB – Allgemeine Geschäftsbedingungen | Liyas Lounge Olten', 'AGB',
      'Allgemeine Geschäftsbedingungen der Liyas Lounge in Olten: Terminvereinbarung, Absagen, Preise, Zahlung, Haftung und Datenschutz.',
      `<p class="note">Entwurf – bitte vor der Veröffentlichung prüfen und ergänzen.</p>` + AGB.map(([h, p]) => `<h2>${esc(h)}</h2><p>${esc(p)}</p>`).join('') + `<p class="note">Stand: ${stand}</p>`);
    legal('privacy', 'Datenschutzerklärung | Liyas Lounge Olten', 'Datenschutz',
      'Datenschutzerklärung der Liyas Lounge in Olten gemäss Schweizer Datenschutzgesetz (DSG): welche Daten wir bearbeiten, wofür und welche Rechte Sie haben.',
      `<p class="note">Entwurf – bitte vor der Veröffentlichung prüfen und ergänzen.</p>
<p>Der Schutz Ihrer Personendaten ist uns wichtig. In dieser Datenschutzerklärung informieren wir Sie darüber, welche Personendaten wir im Zusammenhang mit unserer Website und unseren Dienstleistungen bearbeiten. Massgebend ist das Schweizer Bundesgesetz über den Datenschutz (DSG).</p>
<h2>1. Verantwortliche Stelle</h2>
<p>Liyas Lounge<br>${esc(SITE.street)}<br>${SITE.zip} ${esc(SITE.city)}, Schweiz<br>E-Mail: ${SITE.email ? `<a href="mailto:${SITE.email}">${esc(SITE.email)}</a>` : '[E-Mail folgt]'}${isSet(SITE.phone) ? `<br>Telefon: <a href="${SITE.phoneHref}">${esc(SITE.phone)}</a>` : ''}</p>
<h2>2. Besuch der Website</h2>
<p>Beim Aufruf unserer Website werden durch unseren Hosting-Anbieter technisch notwendige Daten (z. B. IP-Adresse, Datum und Uhrzeit, aufgerufene Seite, Browsertyp) in Server-Logfiles verarbeitet. Diese Daten dienen ausschliesslich dem sicheren und stabilen Betrieb der Website. [Hosting-Anbieter ergänzen, z. B. Vercel Inc., USA – dabei kann eine Übermittlung von Daten in die USA erfolgen, abgesichert durch geeignete Garantien wie Standardvertragsklauseln.]</p>
<p>Wir verwenden keine Analyse-, Tracking- oder Marketing-Tools. Schriftarten werden lokal von unserem Server geladen – es findet keine Verbindung zu Google Fonts statt.</p>
<h2>3. Cookies und lokale Speicherung</h2>
<p>Unsere Website setzt keine Cookies. Lokal in Ihrem Browser (localStorage) speichern wir einzig, dass Sie den Datenschutz-Hinweis bestätigt haben. Diese Information wird nicht an uns übermittelt und lässt sich jederzeit über die Einstellungen Ihres Browsers löschen.</p>
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
<p>Sie haben das Recht, Auskunft über Ihre bei uns gespeicherten Personendaten zu verlangen sowie deren Berichtigung, Löschung oder Herausgabe zu beantragen. Wenden Sie sich dazu an ${SITE.email ? `<a href="mailto:${SITE.email}">${esc(SITE.email)}</a>` : '[E-Mail folgt]'}. Zudem können Sie sich an den Eidgenössischen Datenschutz- und Öffentlichkeitsbeauftragten (EDÖB) wenden.</p>
<h2>10. Änderungen</h2>
<p>Wir können diese Datenschutzerklärung jederzeit anpassen. Es gilt die jeweils aktuelle, auf dieser Website veröffentlichte Fassung.</p>
<p class="note">Stand: ${stand}</p>`);
    legal('imprint', 'Impressum | Liyas Lounge Olten', 'Impressum',
      'Impressum der Liyas Lounge in Olten – Medical Aesthetic & Beauty: Kontakt, Haftung und Urheberrecht.',
      `<h2>Kontaktadresse</h2>
<p>Liyas Lounge<br>Medical Aesthetic &amp; Beauty<br>Inhaberin: [Name folgt]<br>${esc(SITE.street)}<br>${SITE.zip} ${esc(SITE.city)}<br>Schweiz</p>
<p>${isSet(SITE.phone) ? `Telefon: <a href="${SITE.phoneHref}">${esc(SITE.phone)}</a><br>` : ''}E-Mail: ${SITE.email ? `<a href="mailto:${SITE.email}">${esc(SITE.email)}</a>` : '[E-Mail folgt]'}<br>[UID-Nummer, falls vorhanden]</p>
<h2>Ärztliche Verantwortung</h2>
<p>[Angaben zur ärztlichen Verantwortung für medizinisch-ästhetische Behandlungen ergänzen]</p>
<h2>Haftungsausschluss</h2>
<p>Die Inhalte dieser Website wurden mit grösster Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Die Informationen auf dieser Website ersetzen keine persönliche Beratung. Ergebnisse von Behandlungen sind individuell und können nicht garantiert werden.</p>
<h2>Haftung für Links</h2>
<p>Verweise und Links auf Websites Dritter liegen ausserhalb unseres Verantwortungsbereichs. Für deren Inhalte sind ausschliesslich die jeweiligen Betreiber verantwortlich.</p>
<h2>Urheberrechte</h2>
<p>Die Urheber- und alle anderen Rechte an Inhalten, Bildern, Fotos oder anderen Dateien auf dieser Website gehören der Liyas Lounge oder den speziell genannten Rechteinhabern. Für die Reproduktion jeglicher Elemente ist die schriftliche Zustimmung im Voraus einzuholen.</p>`);

    /* 404 */
    add('notfound', layout({
      key: 'notfound', title: 'Seite nicht gefunden | Liyas Lounge Olten', description: 'Diese Seite existiert leider nicht. Entdecken Sie unsere Behandlungen für Ästhetik & Beauty in Olten.', noindex: true, cta: false,
      body: `<section class="phead"><div class="container">
    <p class="nf__code">404</p>
    <h1 class="title title--lg">Seite <em>nicht gefunden</em></h1>
    <p class="lead" style="margin:24px 0 30px;max-width:560px">Die gesuchte Seite existiert nicht oder wurde verschoben. · <span lang="en">The page you are looking for doesn’t exist.</span></p>
    <div class="hero__ctas"><a class="btn btn--dark btn--lg" href="/"><span>Zur Startseite</span></a><a class="btn btn--line btn--lg" href="/en"><span lang="en">English</span></a></div>
  </div></section>
<section class="section section--alt" aria-labelledby="nf-cats"><div class="container"><div class="head"><div>${title('Beliebte', 'Behandlungen', { id: 'nf-cats' })}</div></div>${categoryList(TR, { catTag: 'h3', itemTag: 'h4' })}</div></section>`,
    }), { sitemap: false, file: '404.html' });
  }
}

buildLang('de');
buildLang('en');

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

// Sitemap mit Sprachalternativen (xhtml:link) und Bildern
const imgsFor = (key) => {
  const t = key.startsWith('t:') ? DE.TREATMENTS.find((x) => 't:' + x.slug === key) : null;
  if (t) return [t.image];
  return { home: [HOME.heroImage, ...HOME.studio], about: [HOME.aboutHero, ...HOME.studio], treatments: [HOME.treatmentsHero, ...DE.CATEGORIES.map((c) => c.image)] }[key] || [];
};
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${PAGES.filter((p) => p.sitemap).map((p) => {
  const alt = PATHS[p.key] || {};
  const links = alt.en ? [['de-CH', alt.de], ['en', alt.en], ['x-default', alt.de]].map(([l, h]) => `
    <xhtml:link rel="alternate" hreflang="${l}" href="${abs(h)}"/>`).join('') : '';
  return `  <url>
    <loc>${abs(p.path)}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>${links}${[...new Set(imgsFor(p.key))].map((n) => `
    <image:image><image:loc>${imgUrl(n)}</image:loc></image:image>`).join('')}
  </url>`;
}).join('\n')}
</urlset>
`;
writeFileSync(join(ROOT, 'sitemap.xml'), sitemap);
writeFileSync(join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /scripts/\n\nSitemap: ${SITE.url}/sitemap.xml\n`);

console.log(`✓ ${PAGES.length} Seiten generiert (${PAGES.filter((p) => p.lang === 'de').length} DE + ${PAGES.filter((p) => p.lang === 'en').length} EN)`);

// Design-Vorschau (Version 1 / 2) zuletzt bauen – sie ersetzt aktuell die Startseite
await import('./build-design.mjs');
