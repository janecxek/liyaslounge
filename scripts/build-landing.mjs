// Startseite Liyas Lounge – Schwarz & Gold (basiert auf «Version 2 · Lounge Noir»), zweisprachig.
// Schreibt index.html (DE, /) und en/index.html (EN, /en). Läuft am Ende von scripts/build.mjs.
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, CATEGORIES, TREATMENTS, TEAM, REVIEWS, HOME_FAQ, HOME } from './content.mjs';
import { EN_CATEGORIES, EN_REVIEW_TAGS, EN_REVIEW_TEXTS, EN_HOME_FAQ } from './content.en.mjs';
import { FR_CATEGORIES, FR_REVIEW_TAGS, FR_REVIEW_TEXTS, FR_HOME_FAQ } from './content.fr.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LANGS = ['de', 'en', 'fr'];
const IMG = JSON.parse(readFileSync(join(ROOT, 'scripts/imgmeta.json'), 'utf8'));
const VERSION = Date.now().toString(36);
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const minPrice = (t) => Math.min(...t.prices.filter((p) => p.price).map((p) => p.price));
const catFrom = (id) => Math.min(...TREATMENTS.filter((t) => t.category === id).map(minPrice));
const WA_NUM = '+41 79 509 06 60';
const IG = '@' + SITE.instagram.replace(/\/+$/, '').split('/').pop();

/* ---------- Texte ---------- */
const T = {
  de: {
    lang: 'de-CH', path: '/', ogLocale: 'de_CH',
    title: 'Liyas Lounge Olten – Anti-Age, Face Balancing & apparative Kosmetik',
    desc: 'Liyas Lounge in Olten: Anti-Age, Face Balancing, apparative Kosmetik & Skin Care – Filler, Faltenbehandlung, HIFU, Morpheus8, Mesotherapie & mehr. Seit 2009, Beratung in 6 Sprachen.',
    nav: [['expertin', 'Über uns'], ['behandlungen', 'Behandlungen'], ['bewertungen', 'Bewertungen'], ['faq', 'FAQ'], ['kontakt', 'Kontakt']],
    cta: 'Termin anfragen', menu: 'Menü', skip: 'Zum Inhalt',
    wa: 'Hallo Liyas Lounge, ich interessiere mich für eine Behandlung und hätte gerne eine Beratung.',
    waCat: (n) => `Hallo Liyas Lounge, ich interessiere mich für ${n} und hätte gerne eine Beratung.`,
    tagline: 'Medical Aesthetic & Beauty · Olten',
    slogan: ['Shine bright,', 'age is just a number.'],
    heroBtn: 'Beratung anfragen', heroBtn2: 'Behandlungen entdecken', fabSub: 'Per WhatsApp · unverbindlich',
    trust: (r, n) => [`${r} · ${n} Google-Bewertungen`, 'Erfahrung seit 2009', 'Beratung in 6 Sprachen'],
    trustS: (r, n) => [`${r} · ${n} Google`, 'Seit 2009', '6 Sprachen'],
    scroll: 'Entdecken',
    exScript: 'Lernen Sie kennen', exH: 'Ihre Expertin',
    exP: 'Heilpraktikerin, Krankenpflegerin und medizinische Kosmetikerin – selbständig seit 2009 und mit langjähriger Erfahrung an der Seite plastischer Chirurgen. Sie sieht Schönheit mit den Augen einer Künstlerin. Ihr Ziel: dass Sie frischer aussehen, nicht verändert.',
    exCap: 'Jede Behandlung beginnt mit einer persönlichen Beratung – vor der Behandlung kostenlos.',
    values: [['Medizinisches Fachwissen', 'Zahlreiche Weiterbildungen in ästhetischer Medizin und medizinischer Assistenz.'], ['Ehrliche Beratung', 'Wir empfehlen nur, was wirklich zu Ihnen passt – in 6 Sprachen.'], ['Hygiene & Qualität', 'Saubere Abläufe und ausschliesslich zugelassene Produkte.']],
    trScript: 'Unsere', trH: 'Behandlungen', trLead: 'Drei Schwerpunkte, ein Anspruch: natürliche, typgerechte Ergebnisse.', from: 'ab', ask: 'Beratung anfragen',
    revScript: 'Kundinnen', revH: 'Bewertungen', revTitles: ['Ehrlich beraten', 'Ganz natürlich', 'Sehr diskret', 'Einfach top', 'Professionell', 'Perfekt dezent'], revG: 'Alle Bewertungen auf Google', stars: '5 von 5 Sternen',
    visScript: 'Ihr', visH: 'Besuch',
    policies: [['Beratung', 'Vor oder während Ihrer Behandlung kostenlos. Als separater Termin CHF 50.'], ['Termine', 'Am einfachsten per WhatsApp (nur Nachrichten). Wir melden uns schnellstmöglich.'], ['Absagen', 'Bitte spätestens 24 Stunden vor dem Termin absagen oder verschieben.'], ['Zahlung', `Direkt nach der Behandlung – ${SITE.payment.de}.`], ['Gesundheit', 'Bitte informieren Sie uns vorab über Allergien, Medikamente oder eine Schwangerschaft.'], ['Pünktlichkeit', 'Bei Verspätung kann sich die Behandlungszeit verkürzen.']],
    prepH: 'Vor Ihrem Termin', prep: ['Gerne ungeschminkt erscheinen', 'Fragen & Wünsche notieren', 'Medikamente & Allergien angeben', 'Etwas Zeit einplanen'],
    nudge: {
      ex: ['Lernen Sie mich persönlich kennen – vor Ihrer Behandlung ist die Beratung kostenlos.', 'Beratung vereinbaren', 'Hallo Liyas Lounge, ich würde Sie gerne bei einer Beratung kennenlernen.'],
      tr: ['Nicht sicher, was zu Ihnen passt? Schicken Sie uns ein Foto – wir sagen Ihnen ehrlich, was sinnvoll ist. Auch wenn es «nichts» ist.', 'Ehrliche Einschätzung holen', 'Hallo Liyas Lounge, ich bin unsicher, welche Behandlung zu mir passt. Können Sie mich ehrlich beraten?'],
      faq: ['Ihre Frage war nicht dabei? Fragen Sie einfach – wir antworten persönlich.', 'Frage per WhatsApp stellen', 'Hallo Liyas Lounge, ich habe eine Frage:'],
    },
    faqScript: 'Häufige', faqH: 'Fragen', faq: HOME_FAQ.slice(0, 7),
    ctScript: 'Ihr Termin.', ctH: 'Ihre Zeit.', ctP: 'Schreiben Sie uns per WhatsApp – gerne mit Foto und Ihren Wünschen. Wir beraten Sie persönlich und ehrlich, in 6 Sprachen.',
    ctBtn: 'Jetzt per WhatsApp schreiben', waNote: 'nur Nachrichten', addr: 'Adresse', hours: 'Öffnungszeiten', route: 'Route planen', follow: 'Folgen Sie uns',
    hoursTxt: `${SITE.hours.map((h) => `${h.de} ${h.opens}–${h.closes}`).join(', ')} · ${SITE.hoursNote.de}`,
    legal: [['/agb', 'AGB'], ['/datenschutz', 'Datenschutz'], ['/impressum', 'Impressum']], rights: 'Alle Rechte vorbehalten.',
    cats: CATEGORIES, reviews: REVIEWS.map((r) => ({ ...r })), langAria: 'Sprache wählen',
    ownerAlt: 'Die Inhaberin der Liyas Lounge im Beratungsgespräch', heroAlt: 'Die Inhaberin der Liyas Lounge in ihrem Studio in Olten',
  },
  en: {
    lang: 'en', path: '/en', ogLocale: 'en_GB',
    title: 'Liyas Lounge Olten – Anti-Age, Face Balancing & Device-based Treatments',
    desc: 'Liyas Lounge in Olten: anti-age, face balancing, device-based treatments & skin care – fillers, wrinkle treatment, HIFU, Morpheus8, mesotherapy & more. Since 2009, advice in 6 languages.',
    nav: [['expertin', 'About'], ['behandlungen', 'Treatments'], ['bewertungen', 'Reviews'], ['faq', 'FAQ'], ['kontakt', 'Contact']],
    cta: 'Book now', menu: 'Menu', skip: 'Skip to content',
    wa: 'Hello Liyas Lounge, I am interested in a treatment and would like a consultation.',
    waCat: (n) => `Hello Liyas Lounge, I am interested in ${n} and would like a consultation.`,
    tagline: 'Medical Aesthetics & Beauty · Olten',
    slogan: ['Shine bright,', 'age is just a number.'],
    heroBtn: 'Book a consultation', heroBtn2: 'Explore treatments', fabSub: 'Via WhatsApp · no obligation',
    trust: (r, n) => [`${r} · ${n} Google reviews`, 'Experience since 2009', 'Advice in 6 languages'],
    trustS: (r, n) => [`${r} · ${n} Google`, 'Since 2009', '6 languages'],
    scroll: 'Discover',
    exScript: 'Meet', exH: 'Your expert',
    exP: 'Naturopath (Heilpraktikerin), nurse and medical cosmetologist – self-employed since 2009, with many years of experience alongside plastic surgeons. She sees beauty through an artist’s eyes. Her aim: that you look refreshed, not changed.',
    exCap: 'Every treatment begins with a personal consultation – free of charge before your treatment.',
    values: [['Medical expertise', 'Extensive further training in aesthetic medicine and medical assistance.'], ['Honest advice', 'We only recommend what truly suits you – in 6 languages.'], ['Hygiene & quality', 'Clean processes and approved products only.']],
    trScript: 'Our', trH: 'Treatments', trLead: 'Three specialities, one standard: natural results that suit you.', from: 'from', ask: 'Request a consultation',
    revScript: 'Clients', revH: 'Reviews', revTitles: ['Honest advice', 'So natural', 'Very discreet', 'Simply great', 'Professional', 'Perfectly subtle'], revG: 'All reviews on Google', stars: '5 out of 5 stars',
    visScript: 'Your', visH: 'Visit',
    policies: [['Consultation', 'Free before or during your treatment. As a separate appointment CHF 50.'], ['Appointments', 'Easiest via WhatsApp (messages only). We reply as soon as possible.'], ['Cancellations', 'Please cancel or reschedule at least 24 hours in advance.'], ['Payment', `Directly after the treatment – ${SITE.payment.en}.`], ['Health', 'Please tell us in advance about allergies, medication or a pregnancy.'], ['Punctuality', 'If you arrive late, the treatment time may be shortened.']],
    prepH: 'Before your appointment', prep: ['Come without make-up if possible', 'Note your questions & wishes', 'Tell us about medication & allergies', 'Allow a little extra time'],
    nudge: {
      ex: ['Get to know me in person – the consultation is free before your treatment.', 'Arrange a consultation', 'Hello Liyas Lounge, I would like to get to know you in a consultation.'],
      tr: ['Not sure what suits you? Send us a photo – we will tell you honestly what makes sense. Even if that is “nothing”.', 'Get an honest opinion', 'Hello Liyas Lounge, I am not sure which treatment suits me. Could you give me honest advice?'],
      faq: ['Your question was not answered? Just ask – we reply personally.', 'Ask on WhatsApp', 'Hello Liyas Lounge, I have a question:'],
    },
    faqScript: 'Frequently', faqH: 'Asked', faq: EN_HOME_FAQ.slice(0, 7),
    ctScript: 'Your appointment.', ctH: 'Your time.', ctP: 'Send us a WhatsApp message – photos and wishes welcome. We advise you personally and honestly, in 6 languages.',
    ctBtn: 'Message us on WhatsApp', waNote: 'messages only', addr: 'Address', hours: 'Opening hours', route: 'Get directions', follow: 'Follow us',
    hoursTxt: `${SITE.hours.map((h) => `${h.en} ${h.opens}–${h.closes}`).join(', ')} · ${SITE.hoursNote.en}`,
    legal: [['/agb', 'Terms (DE)'], ['/datenschutz', 'Privacy (DE)'], ['/impressum', 'Legal notice (DE)']], rights: 'All rights reserved.',
    cats: CATEGORIES.map((c) => ({ ...c, ...EN_CATEGORIES[c.id] })), reviews: REVIEWS.map((r, i) => ({ ...r, tag: EN_REVIEW_TAGS[i], text: EN_REVIEW_TEXTS[i] || r.text })), langAria: 'Choose language',
    ownerAlt: 'The owner of Liyas Lounge during a consultation', heroAlt: 'The owner of Liyas Lounge in her studio in Olten',
  },
  fr: {
    lang: 'fr', path: '/fr', ogLocale: 'fr_CH',
    title: 'Liyas Lounge Olten – Anti-âge, Face Balancing & cosmétique appareillée',
    desc: 'Liyas Lounge à Olten : anti-âge, face balancing, cosmétique appareillée & skin care – fillers, traitement des rides, HIFU, Morpheus8, mésothérapie & plus. Depuis 2009, conseils en 6 langues.',
    nav: [['expertin', 'À propos'], ['behandlungen', 'Traitements'], ['bewertungen', 'Avis'], ['faq', 'FAQ'], ['kontakt', 'Contact']],
    cta: 'Prendre rendez-vous', menu: 'Menu', skip: 'Aller au contenu',
    wa: 'Bonjour Liyas Lounge, je suis intéressée par un traitement et j’aimerais une consultation.',
    waCat: (n) => `Bonjour Liyas Lounge, je suis intéressée par ${n} et j’aimerais une consultation.`,
    tagline: 'Médecine esthétique & beauté · Olten',
    slogan: ['Shine bright,', 'age is just a number.'],
    heroBtn: 'Demander une consultation', heroBtn2: 'Découvrir les traitements', fabSub: 'Par WhatsApp · sans engagement',
    trust: (r, n) => [`${r} · ${n} avis Google`, 'Expérience depuis 2009', 'Conseils en 6 langues'],
    trustS: (r, n) => [`${r} · ${n} Google`, 'Depuis 2009', '6 langues'],
    scroll: 'Découvrir',
    exScript: 'Faites connaissance', exH: 'Votre experte',
    exP: 'Naturopathe (Heilpraktikerin), infirmière et esthéticienne médicale – indépendante depuis 2009, avec une longue expérience aux côtés de chirurgiens plasticiens. Elle voit la beauté avec des yeux d’artiste. Son objectif : que vous paraissiez plus fraîche, pas changée.',
    exCap: 'Chaque traitement commence par une consultation personnelle – gratuite avant le traitement.',
    values: [['Savoir médical', 'De nombreuses formations continues en médecine esthétique et en assistance médicale.'], ['Conseils honnêtes', 'Nous ne recommandons que ce qui vous convient vraiment – en 6 langues.'], ['Hygiène & qualité', 'Des processus soignés et uniquement des produits autorisés.']],
    trScript: 'Nos', trH: 'Traitements', trLead: 'Trois spécialités, une exigence : des résultats naturels, adaptés à vous.', from: 'dès', ask: 'Demander une consultation',
    revScript: 'Clientes', revH: 'Avis', revG: 'Tous les avis sur Google', stars: '5 étoiles sur 5',
    visScript: 'Votre', visH: 'Visite',
    policies: [['Consultation', 'Gratuite avant ou pendant votre traitement. En rendez-vous séparé CHF 50.'], ['Rendez-vous', 'Le plus simple : par WhatsApp (messages uniquement). Nous répondons au plus vite.'], ['Annulations', 'Merci d’annuler ou de déplacer au moins 24 heures à l’avance.'], ['Paiement', 'Directement après le traitement – espèces, TWINT, carte.'], ['Santé', 'Merci de nous informer à l’avance d’allergies, de médicaments ou d’une grossesse.'], ['Ponctualité', 'En cas de retard, la durée du traitement peut être réduite.']],
    prepH: 'Avant votre rendez-vous', prep: ['Venir si possible sans maquillage', 'Noter vos questions & souhaits', 'Indiquer médicaments & allergies', 'Prévoir un peu de temps'],
    nudge: {
      ex: ['Faites ma connaissance – avant votre traitement, la consultation est gratuite.', 'Fixer une consultation', 'Bonjour Liyas Lounge, j’aimerais faire votre connaissance lors d’une consultation.'],
      tr: ['Vous ne savez pas ce qui vous convient ? Envoyez-nous une photo – nous vous dirons honnêtement ce qui a du sens. Même si c’est « rien ».', 'Obtenir un avis honnête', 'Bonjour Liyas Lounge, je ne sais pas quel traitement me convient. Pouvez-vous me conseiller honnêtement ?'],
      faq: ['Votre question n’y figure pas ? Demandez simplement – nous répondons personnellement.', 'Poser la question sur WhatsApp', 'Bonjour Liyas Lounge, j’ai une question :'],
    },
    faqScript: 'Questions', faqH: 'Fréquentes', faq: FR_HOME_FAQ.slice(0, 7),
    ctScript: 'Votre rendez-vous.', ctH: 'Votre temps.', ctP: 'Écrivez-nous sur WhatsApp – avec une photo et vos souhaits si vous le voulez. Nous vous conseillons personnellement et honnêtement, en 6 langues.',
    ctBtn: 'Écrire sur WhatsApp', waNote: 'messages uniquement', addr: 'Adresse', hours: 'Horaires', route: 'Itinéraire', follow: 'Suivez-nous',
    hoursTxt: 'Lu–Ve 10:00–19:00 · Sa sur rendez-vous',
    legal: [['/agb', 'CGV (DE)'], ['/datenschutz', 'Confidentialité (DE)'], ['/impressum', 'Mentions légales (DE)']], rights: 'Tous droits réservés.',
    cats: CATEGORIES.map((c) => ({ ...c, ...FR_CATEGORIES[c.id] })), reviews: REVIEWS.map((r, i) => ({ ...r, tag: FR_REVIEW_TAGS[i], text: FR_REVIEW_TEXTS[i] || r.text })), langAria: 'Choisir la langue',
    ownerAlt: 'La propriétaire de Liyas Lounge lors d’une consultation', heroAlt: 'La propriétaire de Liyas Lounge dans son studio à Olten',
  },
};

/* ---------- Bausteine ---------- */
function pic(name, alt, { sizes = '100vw', eager = false, pos = '', cls = '' } = {}) {
  const m = IMG[name];
  if (!m) throw new Error('Bild fehlt: ' + name);
  const set = (n) => IMG[n].widths.map((w) => `/assets/img/${n}-${w}.webp ${w}w`).join(', ');
  const portrait = IMG[name + '-portrait'] ? `<source media="(orientation: portrait) and (max-width: 900px)" type="image/webp" srcset="${set(name + '-portrait')}" sizes="100vw">` : '';
  const style = [pos && `object-position:${pos}`, m.lqip && `background:url(${m.lqip}) center/cover`].filter(Boolean).join(';');
  return `<picture${cls ? ` class="${cls}"` : ''}>${portrait}<source type="image/webp" srcset="${set(name)}" sizes="${sizes}"><img src="/assets/img/${name}.jpg" alt="${esc(alt)}" width="${m.w}" height="${m.h}"${style ? ` style="${style}"` : ''} ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></picture>`;
}
const I = {
  arrow: '<path d="M7 17 17 7M8 7h9v9"/>', left: '<path d="M19 12H5M11 6l-6 6 6 6"/>', right: '<path d="M5 12h14M13 6l6 6-6 6"/>', down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  wa: '<path d="M3 21l1.7-5A8.5 8.5 0 1 1 8 19.4z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1.2-1.3-1.8-1-1 .8a4 4 0 0 1-2.2-2.2l.8-1-1-1.8z" fill="currentColor" stroke="none"/>',
  ig: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', check: '<path d="M20 6 9 17l-5-5"/>',
  star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" fill="currentColor" stroke="none"/>', plus: '<path d="M12 5v14M5 12h14"/>',
};
const ico = (n) => `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]}</svg>`;
const stars = (label) => `<span class="stars" role="img" aria-label="${label}">${ico('star').repeat(5)}</span>`;
const logo = (cls = '') => `<span class="logo ${cls}" role="img" aria-label="Liyas Lounge"><span class="logo__main" aria-hidden="true">LIYAS</span><span class="logo__script" aria-hidden="true">Lounge</span><span class="logo__tag" aria-hidden="true">Medical Aesthetic &amp; Beauty</span><i class="spark s1"></i><i class="spark s2"></i><i class="spark s3"></i></span>`;
const head = (script, h, cls = '') => `<header class="sh ${cls}" data-up><p class="sh__script">${esc(script)}</p><h2 class="sh__h">${esc(h)}</h2></header>`;

// sub: Unterseite (AGB, Datenschutz, Impressum, 404) im gleichen Look – { file, title, desc, robots, main }
function page(L, sub = null) {
  const t = T[L], other = L === 'de' ? 'en' : 'de';
  const base = sub ? t.path : ''; // auf Unterseiten führen die Menülinks zurück zu den Abschnitten der Startseite
  const wa = (text) => esc(`${SITE.whatsapp}?text=${encodeURIComponent(text)}`);
  // kurzer Hinweis + Button, passend zur Stelle auf der Seite
  const nudge = ([txt, btn, msg], cls = '') => `<div class="nudge ${cls}" data-up><p>${esc(txt)}</p><a class="btn btn--line" href="${wa(msg)}" target="_blank" rel="noopener">${ico('wa')}<span>${esc(btn)}</span></a></div>`;
  const rating = String(SITE.googleRating).replace('.', L === 'de' ? ',' : '.');
  const navHtml = t.nav.map(([id, l]) => `<a href="${base}#${id}">${l}</a>`).join('');
  const langSw = `<nav class="lang" aria-label="${t.langAria}">${LANGS.map((k) => `<a href="${T[k].path}" hreflang="${T[k].lang}" lang="${T[k].lang}"${L === k ? ' aria-current="true"' : ''}>${k.toUpperCase()}</a>`).join('')}</nav>`;
  const reviewsList = t.reviews.slice(0, 6);
  const schema = {
    '@context': 'https://schema.org', '@type': ['BeautySalon', 'MedicalBusiness'], '@id': SITE.url + '/#business', name: SITE.name, description: t.desc, url: SITE.url + t.path,
    image: [SITE.url + '/assets/img/og-image.jpg'], address: { '@type': 'PostalAddress', streetAddress: SITE.street, postalCode: SITE.zip, addressLocality: SITE.city, addressRegion: 'SO', addressCountry: 'CH' },
    openingHoursSpecification: SITE.hours.map((h) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: h.days.map((d) => 'https://schema.org/' + { Mo: 'Monday', Tu: 'Tuesday', We: 'Wednesday', Th: 'Thursday', Fr: 'Friday' }[d]), opens: h.opens, closes: h.closes })),
    sameAs: [SITE.instagram], priceRange: 'CHF 50 – CHF 1450', inLanguage: t.lang,
  };
  const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: t.lang, mainEntity: t.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) };

  const body = `
<a class="skip" href="#main">${t.skip}</a>
<header class="nav" data-nav>
  <a class="nav__logo" href="${t.path}" data-top aria-label="Liyas Lounge">${logo('logo--nav')}</a>
  <nav class="nav__links" aria-label="Navigation">${navHtml}</nav>
  <div class="nav__end">${langSw}<a class="btn btn--line btn--sm nav__cta" href="${wa(t.wa)}" target="_blank" rel="noopener">${t.cta}</a>
  <button class="burger" type="button" aria-controls="menu" aria-expanded="false" aria-label="${t.menu}"><span></span><span></span></button></div>
</header>
<div class="menu" id="menu" hidden>
  <nav class="menu__nav">${t.nav.map(([id, l], i) => `<a href="${base}#${id}"><small>0${i + 1}</small>${l}</a>`).join('')}</nav>
  <div class="menu__foot"><a class="btn btn--gold" href="${wa(t.wa)}" target="_blank" rel="noopener">${ico('wa')}<span>${t.cta}</span></a><p>${esc(SITE.street)}, ${SITE.zip} ${SITE.city} · ${esc(t.hoursTxt)}</p>${langSw}</div>
</div>

<main id="main">${sub ? sub.main : `
<section class="hero" aria-label="Liyas Lounge">
  <div class="hero__media" data-hero-img>${pic(HOME.heroImage, t.heroAlt, { eager: true, pos: '62% 24%' })}</div>
  <div class="hero__in">
    <h1 class="hero__logo" data-in>${logo('logo--hero')}<span class="sr">Liyas Lounge – ${esc(t.tagline)}</span></h1>
    <p class="hero__slogan" data-in style="--d:.35s">${esc(t.slogan[0])} <em>${esc(t.slogan[1])}</em></p>
    <div class="hero__ctas" data-in style="--d:.5s"><a class="btn btn--gold" href="${wa(t.wa)}" target="_blank" rel="noopener">${ico('wa')}<span>${t.heroBtn}</span></a><a class="btn btn--line" href="#behandlungen"><span>${t.heroBtn2}</span></a></div>
    <ul class="hero__trust" data-in style="--d:.65s">${t.trust(rating, SITE.googleReviewCount).map((x, i) => `<li>${i ? ico('check') : `<span class="stars stars--sm" aria-hidden="true">${ico('star').repeat(5)}</span>`}<span class="t-lg">${esc(x)}</span><span class="t-sm">${esc(t.trustS(rating, SITE.googleReviewCount)[i])}</span></li>`).join('')}</ul>
  </div>
  <a class="hero__scroll" href="#expertin" aria-label="${t.scroll}"><span>${t.scroll}</span><i></i></a>
</section>

<section class="oval" id="expertin">
  <div class="oval__in">
    ${head(t.exScript, t.exH)}
    <p class="lead" data-up>${esc(t.exP)}</p>
    <figure class="photo" data-up>${pic('beratung-inhaberin-olten', t.ownerAlt, { sizes: '(max-width: 900px) 92vw, 680px', pos: '50% 35%' })}<figcaption>${esc(t.exCap)}</figcaption></figure>
    <ul class="values">${t.values.map(([a, b], i) => `<li data-up style="--d:${i * .1}s"><span>0${i + 1}</span><b>${esc(a)}</b><p>${esc(b)}</p></li>`).join('')}</ul>
    ${nudge(t.nudge.ex)}
  </div>
</section>

<div class="link" aria-hidden="true"><i></i></div>

<section class="tr" id="behandlungen" data-pin>
  <div class="tr__sticky">
    <div class="tr__box" data-box>
      ${pic('termin-liyas-lounge-olten', '', { cls: 'tr__bg', sizes: '100vw' })}
      <div class="tr__head">${head(t.trScript, t.trH, 'sh--center')}<p class="tr__lead">${esc(t.trLead)}</p></div>
      <ul class="tr__cats">${t.cats.map((c, i) => `<li style="--i:${i}"><a href="${wa(t.waCat(c.name))}" target="_blank" rel="noopener">
        ${pic(c.image, c.name, { sizes: '(max-width: 900px) 92vw, 33vw' })}
        <span class="tr__num">0${i + 1}</span>
        <span class="tr__txt"><b>${esc(c.name)}</b><em>${esc(c.claim || '')}</em><small>${esc(c.short)}</small><span class="tr__from">${t.from} CHF ${catFrom(c.id)}</span><span class="tr__ask">${t.ask} ${ico('arrow')}</span></span>
      </a></li>`).join('')}</ul>
    </div>
    ${nudge(t.nudge.tr, 'nudge--wide')}
  </div>
</section>

<section class="visit">
  <picture class="visit__bg" aria-hidden="true"><source media="(max-width: 640px)" srcset="/assets/img/lounge-liyas-olten-bg-m.webp"><img src="/assets/img/lounge-liyas-olten-bg.webp" alt="" width="960" height="640" loading="lazy" decoding="async"></picture>
  <div class="visit__in">
    ${head(t.visScript, t.visH)}
    <ul class="pol">${t.policies.map(([a, b], i) => `<li data-up style="--d:${(i % 3) * .07}s"><b>${esc(a)}</b><p>${esc(b)}</p></li>`).join('')}</ul>
    <div class="prep" data-up><h3>${esc(t.prepH)}</h3><ul>${t.prep.map((x) => `<li>${ico('check')}${esc(x)}</li>`).join('')}</ul></div>
  </div>
</section>

<section class="rev" id="bewertungen">
  ${head(t.revScript, t.revH)}
  <a class="rev__score" href="${SITE.googleMaps}" target="_blank" rel="noopener" data-up><b>${rating}</b>${stars(t.stars)}<span>${SITE.googleReviewCount} Google</span></a>
  <div class="rs" data-slider data-up>
    <div class="rs__view"><ul class="rs__track" data-track>${reviewsList.map((r, i) => `<li class="rs__card" aria-roledescription="slide" aria-label="${i + 1} / ${reviewsList.length}"><figure>${stars(t.stars)}<blockquote>„${esc(r.text)}“</blockquote><figcaption><b>${esc(r.name)}</b>${r.tag ? `<span>${esc(r.tag)}</span>` : ''}</figcaption></figure></li>`).join('')}</ul></div>
    <div class="rs__nav"><button type="button" class="rs__btn" data-prev aria-label="${L === 'de' ? 'Vorherige Bewertung' : 'Previous review'}">${ico('left')}</button><span class="rs__count"><b data-cur>01</b> / ${String(reviewsList.length).padStart(2, '0')}</span><span class="rs__bar"><i data-bar></i></span><button type="button" class="rs__btn" data-next aria-label="${L === 'de' ? 'Nächste Bewertung' : 'Next review'}">${ico('right')}</button></div>
  </div>
  <a class="btn btn--line" href="${SITE.googleMaps}" target="_blank" rel="noopener" data-up><span>${t.revG}</span>${ico('arrow')}</a>
</section>

<section class="faq" id="faq">
  ${head(t.faqScript, t.faqH)}
  <div class="acc" data-up>${t.faq.map(([q, a]) => `<details><summary>${esc(q)}${ico('plus')}</summary><div><p>${esc(a)}</p></div></details>`).join('')}</div>
  ${nudge(t.nudge.faq)}
</section>

<section class="ct" id="kontakt">
  <div class="ct__txt">
    <header class="sh sh--left" data-up><p class="sh__script">${esc(t.ctScript)}</p><h2 class="sh__h">${esc(t.ctH)}</h2></header>
    <p class="lead" data-up>${esc(t.ctP)}</p>
    <a class="btn btn--gold btn--lg" href="${wa(t.wa)}" target="_blank" rel="noopener" data-up>${ico('wa')}<span>${t.ctBtn}</span></a>
    <ul class="ct__list" data-up>
      <li>${ico('wa')}<span><small>WhatsApp (${t.waNote})</small><a href="${wa(t.wa)}" target="_blank" rel="noopener">${WA_NUM}</a></span></li>
      <li>${ico('pin')}<span><small>${t.addr}</small><a href="${SITE.route}" target="_blank" rel="noopener">${esc(SITE.street)}, ${SITE.zip} ${SITE.city}</a></span></li>
      <li>${ico('clock')}<span><small>${t.hours}</small>${esc(t.hoursTxt)}</span></li>
      <li>${ico('ig')}<span><small>Instagram</small><a href="${SITE.instagram}" target="_blank" rel="noopener">${IG}</a></span></li>
    </ul>
  </div>
  <a class="phone" href="${SITE.instagram}" target="_blank" rel="noopener" data-up aria-label="Instagram ${IG}"><span class="phone__screen">${pic('inhaberin-liyas-lounge-olten', '', { sizes: '300px', pos: '50% 18%' })}<span class="phone__ig">${ico('ig')} ${IG}</span><span class="phone__follow">${t.follow}</span></span></a>
</section>`}
</main>

<footer class="foot">
  ${logo('logo--foot')}
  <nav class="foot__nav">${navHtml}</nav>
  <p class="foot__legal">${t.legal.map(([h, l]) => `<a href="${h}"${L === 'en' ? ' hreflang="de-CH"' : ''}>${l}</a>`).join(' · ')}</p>
  <p class="foot__copy">© ${new Date().getFullYear()} Liyas Lounge · ${esc(SITE.street)}, ${SITE.zip} ${SITE.city} · ${t.rights}</p>
</footer>${sub ? '' : `
<a class="fab" href="${wa(t.wa)}" target="_blank" rel="noopener" data-fab><span class="fab__ico">${ico('wa')}</span><span class="fab__txt"><b>${t.heroBtn}</b><small>${t.fabSub}</small></span>${ico('arrow')}</a>`}`;

  const title = sub ? sub.title : t.title, desc = sub ? sub.desc : t.desc, url = SITE.url + (sub ? sub.url : t.path);
  return `<!doctype html>
<html lang="${t.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="${sub ? sub.robots : 'index, follow, max-image-preview:large'}">
${sub && !sub.url ? '' : `<link rel="canonical" href="${url}">
`}${sub ? '' : `${LANGS.map((k) => `<link rel="alternate" hreflang="${T[k].lang}" href="${SITE.url}${T[k].path}">`).join('\n')}
<link rel="alternate" hreflang="x-default" href="${SITE.url}/">`}
<meta name="theme-color" content="#0b0a09">
<meta property="og:type" content="website">
<meta property="og:locale" content="${t.ogLocale}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE.url}/assets/img/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/assets/fonts/cormorant-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/bodoni-moda-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/great-vibes.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/montserrat-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/landing.min.css?v=${VERSION}">
<script>document.documentElement.classList.add('js')</script>
${sub ? '' : `<script type="application/ld+json">${JSON.stringify(schema)}</script>
<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>`}
</head>
<body${sub ? ' class="sub"' : ''}>
${body}
<script src="/assets/js/lenis.min.js?v=${VERSION}" defer></script>
<script src="/assets/js/landing.js?v=${VERSION}" defer></script>
</body>
</html>
`;
}

const css = readFileSync(join(ROOT, 'assets/css/landing.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{};,>])\s*/g, '$1').replace(/;}/g, '}').trim();
writeFileSync(join(ROOT, 'assets/css/landing.min.css'), css);
writeFileSync(join(ROOT, 'index.html'), page('de'));
if (!existsSync(join(ROOT, 'en'))) mkdirSync(join(ROOT, 'en'));
writeFileSync(join(ROOT, 'en/index.html'), page('en'));
if (!existsSync(join(ROOT, 'fr'))) mkdirSync(join(ROOT, 'fr'));
writeFileSync(join(ROOT, 'fr/index.html'), page('fr'));
console.log('✓ Startseite (Schwarz & Gold): index.html + en/index.html + fr/index.html');

// Sitemap aus build.mjs (DE/EN) um die französische Startseite ergänzen
{
  const sp = join(ROOT, 'sitemap.xml');
  let sm = readFileSync(sp, 'utf8');
  if (!sm.includes(`<loc>${SITE.url}/fr</loc>`)) {
    const frLink = `<xhtml:link rel="alternate" hreflang="fr" href="${SITE.url}/fr"/>`;
    sm = sm.replace(new RegExp(`(\\n(\\s*)<xhtml:link rel="alternate" hreflang="en" href="${SITE.url}/en"/>)`, 'g'), `$1\n$2${frLink}`);
    const en = sm.match(new RegExp(`\\s*<url>\\s*<loc>${SITE.url}/en</loc>[\\s\\S]*?</url>`))[0];
    sm = sm.replace('</urlset>', en.replace(`<loc>${SITE.url}/en</loc>`, `<loc>${SITE.url}/fr</loc>`).replace(/^\n?/, '\n').trimEnd() + '\n</urlset>');
    writeFileSync(sp, sm);
  }
}

// Rechtliche Seiten: Inhalt kommt aus build.mjs, Layout wie die Startseite
for (const file of ['agb', 'datenschutz', 'impressum']) {
  const src = readFileSync(join(ROOT, file + '.html'), 'utf8');
  const get = (re) => (src.match(re) || [])[1] || '';
  const h1 = get(/<h1[^>]*>([\s\S]*?)<\/h1>/).replace(/<[^>]+>/g, '');
  const prose = get(/<div class="container prose">([\s\S]*?)<\/div><\/section>/);
  if (!prose) throw new Error('Inhalt fehlt: ' + file);
  const main = `
<section class="legal">
  <header class="sh"><p class="sh__script">Liyas Lounge</p><h1 class="sh__h">${h1}</h1></header>
  <div class="prose">${prose}</div>
</section>`;
  writeFileSync(join(ROOT, file + '.html'), page('de', { url: '/' + file, title: get(/<title>([\s\S]*?)<\/title>/), desc: get(/<meta name="description" content="([^"]*)"/), robots: get(/<meta name="robots" content="([^"]*)"/), main }));
}
writeFileSync(join(ROOT, '404.html'), page('de', { url: '', title: 'Seite nicht gefunden | Liyas Lounge Olten', desc: 'Die gesuchte Seite existiert nicht oder wurde verschoben.', robots: 'noindex, follow', main: `
<section class="legal nf">
  <p class="nf__code" aria-hidden="true">404</p>
  <header class="sh"><p class="sh__script">Oh nein</p><h1 class="sh__h">Seite nicht gefunden</h1></header>
  <p class="lead">Die gesuchte Seite existiert nicht oder wurde verschoben. · <span lang="en">The page you are looking for doesn’t exist.</span></p>
  <div class="nf__ctas"><a class="btn btn--gold" href="/"><span>Zur Startseite</span></a><a class="btn btn--line" href="/en" lang="en"><span>English</span></a></div>
</section>` }));
console.log('✓ AGB, Datenschutz, Impressum, 404 im Schwarz-Gold-Look');
