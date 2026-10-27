import { createHash } from 'node:crypto';
// Startseite Liyas Lounge – Schwarz & Gold (basiert auf «Version 2 · Lounge Noir»), zweisprachig.
// Schreibt index.html (DE, /) und en/index.html (EN, /en). Läuft am Ende von scripts/build.mjs.
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, CATEGORIES, TREATMENTS, TEAM, REVIEWS, HOME_FAQ, HOME } from './content.mjs';
import { EN_CATEGORIES, EN_REVIEW_TAGS, EN_REVIEW_TEXTS, EN_HOME_FAQ, EN_TREATMENTS } from './content.en.mjs';
import { FR_TREATMENTS } from './content.fr.tr.mjs';
import { FR_CATEGORIES, FR_REVIEW_TAGS, FR_REVIEW_TEXTS, FR_HOME_FAQ } from './content.fr.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LANGS = ['de', 'en', 'fr'];
const LANG_NAMES = { de: 'Deutsch', en: 'English', fr: 'Français' };
const BOOK_PATH = { de: '/termin', en: '/en/booking', fr: '/fr/rendez-vous' };
// Behandlungsseiten: Übersicht + eine Seite pro Behandlung
const TR_BASE = { de: '/behandlungen', en: '/en/treatments', fr: '/fr/traitements' };
const TR_ORDER = ['dermal-filler-olten', 'faltenbehandlung-olten', 'filler-aufloesen-olten', 'fettwegspritze-olten', 'hifu-olten', 'radiofrequenz-olten', 'morpheus8-olten', 'laser-tattooentfernung-olten', 'mesotherapie-olten', 'zahnbleaching-olten'];
// Texte der Sprache L (DE = Basis, EN/FR überschreiben Texte; Zahlen, Bild, Kategorie und Verwandte bleiben)
const trData = (L, slug) => {
  const d = TREATMENTS.find((x) => x.slug === slug);
  if (!d) throw new Error('Behandlung fehlt: ' + slug);
  const ov = L === 'en' ? EN_TREATMENTS[slug] : L === 'fr' ? FR_TREATMENTS[slug] : null;
  if (!ov) return { ...d, urlSlug: d.slug };
  return { ...d, ...ov, slug: d.slug, urlSlug: ov.slug, image: d.image, category: d.category, related: d.related, prices: d.prices.map((p, i) => ({ ...p, ...(ov.prices[i] || {}), price: p.price })) };
};
const trUrl = (L, slug) => `${TR_BASE[L]}/${trData(L, slug).urlSlug}`;
const CAT_SLUG = { antiage: { de: 'anti-age', en: 'anti-age', fr: 'anti-age' }, apparativ: { de: 'apparative-kosmetik', en: 'device-based-treatments', fr: 'cosmetique-appareillee' }, skin: { de: 'skin-care', en: 'skin-care', fr: 'skin-care' } };
const CAT_HERO = { antiage: 'tr-faltenbehandlung-olten', apparativ: 'tr-hifu-olten', skin: 'tr-mesotherapie-olten' };
const catUrl = (L, id) => `${TR_BASE[L]}/${CAT_SLUG[id][L]}`;
const trFrom = (t) => { const ps = t.prices.filter((p) => p.price).map((p) => p.price); return ps.length ? Math.min(...ps) : null; };
// Beschriftungen der Behandlungsseiten, des Mini-Checks und neuer Startseiten-Bausteine
const TP = {
  de: {
    home: 'Start', all: 'Behandlungen', from: 'ab', onReq: 'Preis auf Anfrage', reqH: 'Ihr persönlicher Preis', reqP: 'Der Preis hängt von Zone, Ausgangslage und Anzahl Sitzungen ab. Schreiben Sie uns kurz – gerne mit Foto –, und Sie erhalten eine ehrliche Einschätzung und Ihren Preis, meist noch am selben Tag.', reqWa: 'Preis per WhatsApp anfragen', reqBook: 'Beratung buchen', reqMsg: (n) => `Hallo Liya, was würde ${n} bei mir ungefähr kosten?`, more: 'Mehr erfahren', cardMore: 'Behandlungen ansehen', catH: 'Wählen Sie Ihre Behandlung', catOther: 'Weitere Bereiche', contraQ: 'Wann ist die Behandlung nicht geeignet?', catTitle: (c) => `${c.name} in Olten – Behandlungen | Liyas Lounge`, catDesc: (c) => `${c.name} in Olten: ${c.short}. Alle Behandlungen mit Preisen – seit 2009.`,
    ovTitle: 'Behandlungen in Olten – Anti-Age, apparative Kosmetik & Skin Care | Liyas Lounge', ovDesc: 'Alle Behandlungen der Liyas Lounge in Olten: Filler, Faltenbehandlung, HIFU, Radiofrequenz, Morpheus8, Mesotherapie & mehr – mit Preisen.',
    ovScript: 'Unsere', ovH: 'Behandlungen', ovLead: 'Drei Schwerpunkte, ein Anspruch: natürliche, typgerechte Ergebnisse. Wählen Sie direkt – oder finden Sie in 30 Sekunden heraus, was zu Ihnen passt.',
    forYou: 'Ist das für Sie?', how: 'So läuft es ab', glance: 'Auf einen Blick', prices: 'Preise', priceSub: 'Transparent und ohne versteckte Kosten.', consult: 'Beratung vor oder während der Behandlung kostenlos · als separater Termin CHF 50.',
    notFor: 'Gut zu wissen', faq: 'Häufige Fragen', related: 'Passt gut dazu', ctaScript: 'Ihr Termin', ctaH: 'Bereit für Ihren Termin?', ctaP: 'Buchen Sie direkt online – oder stellen Sie uns vorab Ihre Fragen per WhatsApp.',
    ask: 'Frage per WhatsApp', micro: 'Sofort bestätigt · bis 24 h vorher verschiebbar',
    trust: (r, n) => [`${r} · ${n} Google-Bewertungen`, 'Selbständig seit 2009', 'Heilpraktikerin & Krankenpflegerin', 'Beratung in 6 Sprachen'],
    trustS: (r, n) => [`${r} · ${n} Google`, 'Seit 2009', 'Heilpraktikerin', '6 Sprachen'],
    waTr: (n) => `Hallo Liya, ich interessiere mich für ${n} und habe eine Frage:`,
    quote: 'Ich sehe Schönheit mit den Augen einer Künstlerin. Mein Ziel ist, dass Sie strahlen – nicht, dass man sieht, dass Sie etwas gemacht haben.', quoteBy: 'Liya, Inhaberin',
   
  },
  en: {
    home: 'Home', all: 'Treatments', from: 'from', onReq: 'Price on request', reqH: 'Your personal price', reqP: 'The price depends on the area, your starting point and the number of sessions. Send us a short message – a photo helps – and you will get an honest assessment and your price, usually the same day.', reqWa: 'Ask for a price on WhatsApp', reqBook: 'Book a consultation', reqMsg: (n) => `Hello Liya, roughly how much would ${n} cost for me?`, more: 'Learn more', cardMore: 'View treatments', catH: 'Choose your treatment', catOther: 'Other areas', contraQ: 'When is the treatment not suitable?', catTitle: (c) => `${c.name} in Olten – Treatments | Liyas Lounge`, catDesc: (c) => `${c.name} in Olten: ${c.short}. All treatments with prices – since 2009.`,
    ovTitle: 'Treatments in Olten – anti-age, device-based treatments & skin care | Liyas Lounge', ovDesc: 'All treatments at Liyas Lounge in Olten: fillers, wrinkle treatment, HIFU, radiofrequency, Morpheus8, mesotherapy & more – with prices.',
    ovScript: 'Our', ovH: 'Treatments', ovLead: 'Three specialities, one standard: natural results that suit you. Choose directly – or find out in 30 seconds what suits you.',
    forYou: 'Is this for you?', how: 'How it works', glance: 'At a glance', prices: 'Prices', priceSub: 'Transparent, with no hidden costs.', consult: 'Consultation free before or during your treatment · CHF 50 as a separate appointment.',
    notFor: 'Good to know', faq: 'Frequently asked', related: 'Goes well with', ctaScript: 'Your appointment', ctaH: 'Ready for your appointment?', ctaP: 'Book online right away – or send us your questions on WhatsApp first.',
    ask: 'Ask on WhatsApp', micro: 'Confirmed instantly · can be moved up to 24 h before',
    trust: (r, n) => [`${r} · ${n} Google reviews`, 'Self-employed since 2009', 'Naturopath & nurse', 'Advice in 6 languages'],
    trustS: (r, n) => [`${r} · ${n} Google`, 'Since 2009', 'Naturopath', '6 languages'],
    waTr: (n) => `Hello Liya, I am interested in ${n} and have a question:`,
    quote: 'I see beauty through an artist’s eyes. My aim is for you to shine – not for anyone to see that you have had something done.', quoteBy: 'Liya, owner',
   
  },
  fr: {
    home: 'Accueil', all: 'Traitements', from: 'dès', onReq: 'Prix sur demande', reqH: 'Votre prix personnel', reqP: 'Le prix dépend de la zone, de votre situation de départ et du nombre de séances. Écrivez-nous brièvement – une photo aide – et vous recevrez une évaluation honnête et votre prix, généralement le jour même.', reqWa: 'Demander le prix sur WhatsApp', reqBook: 'Réserver une consultation', reqMsg: (n) => `Bonjour Liya, combien coûterait environ ${n} pour moi ?`, more: 'En savoir plus', cardMore: 'Voir les traitements', catH: 'Choisissez votre traitement', catOther: 'Autres domaines', contraQ: 'Quand le traitement n’est-il pas indiqué ?', catTitle: (c) => `${c.name} à Olten – Traitements | Liyas Lounge`, catDesc: (c) => `${c.name} à Olten : ${c.short}. Tous les traitements et prix.`,
    ovTitle: 'Traitements à Olten – anti-âge, cosmétique appareillée & skin care | Liyas Lounge', ovDesc: 'Tous les traitements de Liyas Lounge à Olten : fillers, traitement des rides, HIFU, radiofréquence, Morpheus8, mésothérapie & plus – avec les prix.',
    ovScript: 'Nos', ovH: 'Traitements', ovLead: 'Trois spécialités, une exigence : des résultats naturels, adaptés à vous. Choisissez directement – ou découvrez en 30 secondes ce qui vous convient.',
    forYou: 'Est-ce pour vous ?', how: 'Le déroulement', glance: 'En un coup d’œil', prices: 'Prix', priceSub: 'Transparents et sans frais cachés.', consult: 'Consultation gratuite avant ou pendant le traitement · CHF 50 en rendez-vous séparé.',
    notFor: 'Bon à savoir', faq: 'Questions fréquentes', related: 'Se combine bien avec', ctaScript: 'Votre rendez-vous', ctaH: 'Prête pour votre rendez-vous ?', ctaP: 'Réservez directement en ligne – ou posez-nous d’abord vos questions sur WhatsApp.',
    ask: 'Question sur WhatsApp', micro: 'Confirmé immédiatement · déplaçable jusqu’à 24 h avant',
    trust: (r, n) => [`${r} · ${n} avis Google`, 'Indépendante depuis 2009', 'Naturopathe & infirmière', 'Conseils en 6 langues'],
    trustS: (r, n) => [`${r} · ${n} Google`, 'Depuis 2009', 'Naturopathe', '6 langues'],
    waTr: (n) => `Bonjour Liya, je suis intéressée par ${n} et j’ai une question :`,
    quote: 'Je vois la beauté avec des yeux d’artiste. Mon objectif : que vous rayonniez – pas que l’on voie que vous avez fait quelque chose.', quoteBy: 'Liya, propriétaire',
   
  },
};
// Bewertungen länger als das werden gekürzt angezeigt, mit Link zur ganzen Bewertung auf Google (r.url)
const REV_LONG = 260;
const IMG = JSON.parse(readFileSync(join(ROOT, 'scripts/imgmeta.json'), 'utf8'));
const VERSION = Date.now().toString(36);
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function heroTrust(L, attrs = '') { const r = String(SITE.googleRating).replace('.', L === 'en' ? '.' : ','), n = SITE.googleReviewCount, sm = TP[L].trustS(r, n); return `<ul class="hero__trust"${attrs}>${TP[L].trust(r, n).map((x, i) => `<li>${i ? ico('check') : `<span class="stars stars--sm" aria-hidden="true">${ico('star').repeat(5)}</span>`}<span class="t-lg">${esc(x)}</span><span class="t-sm">${esc(sm[i])}</span></li>`).join('')}</ul>`; }
const minPrice = (t) => Math.min(...t.prices.filter((p) => p.price).map((p) => p.price));
const catFrom = (id) => Math.min(...TREATMENTS.filter((t) => t.category === id).map(minPrice));
const WA_NUM = '+41 79 509 06 60';
const IG = '@' + SITE.instagram.replace(/\/+$/, '').split('/').pop();

/* ---------- Texte ---------- */
const T = {
  de: {
    lang: 'de-CH', path: '/', ogLocale: 'de_CH',
    title: 'Liyas Lounge Olten – Anti-Age, Filler & apparative Kosmetik',
    desc: 'Medical Aesthetic in Olten: Filler, Faltenbehandlung, HIFU, Morpheus8 & Mesotherapie – natürlich, ehrlich beraten. Seit 2009, Beratung in 6 Sprachen.',
    nav: [['expertin', 'Über uns'], ['behandlungen', 'Behandlungen'], ['bewertungen', 'Bewertungen'], ['faq', 'FAQ'], ['kontakt', 'Kontakt']],
    cta: 'Termin buchen', book: 'Termin online buchen', bookNote: 'online, rund um die Uhr', menu: 'Menü', skip: 'Zum Inhalt',
    wa: 'Hallo Liyas Lounge, ich interessiere mich für eine Behandlung und hätte gerne eine Beratung.',
    waCat: (n) => `Hallo Liyas Lounge, ich interessiere mich für ${n} und hätte gerne eine Beratung.`,
    tagline: 'Medical Aesthetic & Beauty · Olten',
    slogan: ['Shine bright,', 'age is just a number.'],
    heroBtn: 'Beratung anfragen', heroBtn2: 'Behandlungen entdecken', fabSub: 'Online · rund um die Uhr', fabBook: 'Termin buchen', fabWa: 'Frage per WhatsApp',
    trust: (r, n) => [`${r} · ${n} Google-Bewertungen`, 'Erfahrung seit 2009', 'Beratung in 6 Sprachen'],
    trustS: (r, n) => [`${r} · ${n} Google`, 'Seit 2009', '6 Sprachen'],
    scroll: 'Entdecken',
    exScript: 'Lernen Sie kennen', exH: 'Ihre Expertin',
    exP: 'Heilpraktikerin, Krankenpflegerin und medizinische Kosmetikerin – selbständig seit 2009, mit langjähriger Erfahrung an der Seite plastischer Chirurgen, in apparativer Kosmetik und in der Kundenberatung. Sie sieht Schönheit mit den Augen einer Künstlerin. Ihr Ziel: dass Sie frischer aussehen, nicht verändert.',
    exCap: 'Jede Behandlung beginnt mit einer persönlichen Beratung – vor der Behandlung kostenlos.',
    values: [['Medizinisches Fachwissen', 'Zahlreiche Weiterbildungen in ästhetischer Medizin, Visagistik, Psychologie und medizinischer Assistenz.'], ['Ehrliche Beratung', 'Wir empfehlen nur, was wirklich zu Ihnen passt – in 6 Sprachen.'], ['Hygiene & Qualität', 'Saubere Abläufe und ausschliesslich zugelassene Produkte.']],
    trScript: 'Unsere', trH: 'Behandlungen', trLead: 'Drei Schwerpunkte, ein Anspruch: natürliche, typgerechte Ergebnisse.', from: 'ab', ask: 'Beratung anfragen',
    revScript: 'Kundinnen', revH: 'Bewertungen', revTitles: ['Ehrlich beraten', 'Ganz natürlich', 'Sehr diskret', 'Einfach top', 'Professionell', 'Perfekt dezent'], revG: 'Alle Bewertungen auf Google', stars: '5 von 5 Sternen',
    visScript: 'Ihr', visH: 'Besuch',
    policies: [['Beratung', 'Vor oder während Ihrer Behandlung kostenlos. Als separater Termin CHF 50.'], ['Termine', 'Online buchen – rund um die Uhr. Oder per WhatsApp (nur Nachrichten).'], ['Absagen', 'Bitte spätestens 24 Stunden vor dem Termin absagen oder verschieben.'], ['Zahlung', `Direkt nach der Behandlung – ${SITE.payment.de}.`], ['Gesundheit', 'Bitte informieren Sie uns vorab über Allergien, Medikamente oder eine Schwangerschaft.'], ['Pünktlichkeit', 'Bei Verspätung kann sich die Behandlungszeit verkürzen.']],
    nudge: {
      ex: ['Lernen Sie mich persönlich kennen – vor Ihrer Behandlung ist die Beratung kostenlos.', 'Beratung vereinbaren', 'Hallo Liyas Lounge, ich würde Sie gerne bei einer Beratung kennenlernen.'],
      tr: ['Nicht sicher, was zu Ihnen passt? Schicken Sie uns ein Foto – wir sagen Ihnen ehrlich, was sinnvoll ist. Auch wenn es «nichts» ist.', 'Ehrliche Einschätzung holen', 'Hallo Liyas Lounge, ich bin unsicher, welche Behandlung zu mir passt. Können Sie mich ehrlich beraten?'],
      faq: ['Ihre Frage war nicht dabei? Fragen Sie einfach – wir antworten persönlich.', 'Frage per WhatsApp stellen', 'Hallo Liyas Lounge, ich habe eine Frage:'],
    },
    faqScript: 'Häufige', faqH: 'Fragen', faq: HOME_FAQ.slice(0, 7),
    ctScript: 'Ihr Termin.', ctH: 'Ihre Zeit.', ctP: 'Buchen Sie Ihren Termin direkt online oder schreiben Sie uns per WhatsApp – gerne mit Foto und Ihren Wünschen. Wir beraten Sie persönlich und ehrlich, in 6 Sprachen.',
    ctBtn: 'Per WhatsApp schreiben', bookLbl: 'Online-Buchung', bk: { priv: 'Der Kalender wird von SimplyBook.me bereitgestellt; dabei können technisch notwendige Cookies gesetzt werden.', privLink: 'Datenschutz', title: 'Termin buchen | Liyas Lounge Olten', desc: 'Termin bei Liyas Lounge in Olten online buchen – Behandlung und Zeit wählen, sofort bestätigt.', script: 'Ihr Termin', h: 'Online buchen', lead: 'Wählen Sie Behandlung, Tag und Uhrzeit – Sie erhalten sofort eine Bestätigung.', notes: ['Beratung vor oder während der Behandlung kostenlos – als separater Termin CHF 50', 'Absagen bitte bis 24 Stunden vorher', 'Hammerallee 23, 4600 Olten · 1. Untergeschoss'], loading: 'Kalender wird geladen …', fail: 'Der Kalender konnte nicht geladen werden.', open: 'Termin auf SimplyBook öffnen', q: 'Fragen vorab? Schreiben Sie uns gerne per WhatsApp.' }, floor: '1. Untergeschoss · Klingel «Liyas Lounge & Lala Lashes»', waNote: 'nur Nachrichten', addr: 'Adresse', hours: 'Öffnungszeiten', route: 'Route planen', follow: 'Folgen Sie uns',
    hoursTxt: `${SITE.hours.map((h) => `${h.de} ${h.opens}–${h.closes}`).join(', ')} · ${SITE.hoursNote.de}`,
    legal: [['/agb', 'AGB'], ['/datenschutz', 'Datenschutz'], ['/impressum', 'Impressum']], rights: 'Alle Rechte vorbehalten.',
    cats: CATEGORIES, reviews: REVIEWS.map((r) => ({ ...r })), revMore: 'Ganze Bewertung auf Google', langAria: 'Sprache wählen', prev: 'Vorherige Bewertung', next: 'Nächste Bewertung',
    ownerAlt: 'Die Inhaberin der Liyas Lounge im Beratungsgespräch', heroAlt: 'Die Inhaberin der Liyas Lounge in ihrem Studio in Olten',
  },
  en: {
    lang: 'en', path: '/en', ogLocale: 'en_GB',
    title: 'Liyas Lounge Olten – Anti-Age, Fillers & Skin Tightening',
    desc: 'Medical aesthetics in Olten: fillers, wrinkle treatment, HIFU, Morpheus8 & mesotherapy – natural results, honest advice. Since 2009, in 6 languages.',
    nav: [['expertin', 'About'], ['behandlungen', 'Treatments'], ['bewertungen', 'Reviews'], ['faq', 'FAQ'], ['kontakt', 'Contact']],
    cta: 'Book now', book: 'Book online', bookNote: 'online, around the clock', menu: 'Menu', skip: 'Skip to content',
    wa: 'Hello Liyas Lounge, I am interested in a treatment and would like a consultation.',
    waCat: (n) => `Hello Liyas Lounge, I am interested in ${n} and would like a consultation.`,
    tagline: 'Medical Aesthetics & Beauty · Olten',
    slogan: ['Shine bright,', 'age is just a number.'],
    heroBtn: 'Book a consultation', heroBtn2: 'Explore treatments', fabSub: 'Online · around the clock', fabBook: 'Book appointment', fabWa: 'Ask on WhatsApp',
    trust: (r, n) => [`${r} · ${n} Google reviews`, 'Experience since 2009', 'Advice in 6 languages'],
    trustS: (r, n) => [`${r} · ${n} Google`, 'Since 2009', '6 languages'],
    scroll: 'Discover',
    exScript: 'Meet', exH: 'Your expert',
    exP: 'Naturopath (Heilpraktikerin), nurse and medical cosmetologist – self-employed since 2009, with many years of experience alongside plastic surgeons, in device-based treatments and in client consultation. She sees beauty through an artist’s eyes. Her aim: that you look refreshed, not changed.',
    exCap: 'Every treatment begins with a personal consultation – free of charge before your treatment.',
    values: [['Medical expertise', 'Extensive further training in aesthetic medicine, make-up artistry, psychology and medical assistance.'], ['Honest advice', 'We only recommend what truly suits you – in 6 languages.'], ['Hygiene & quality', 'Clean processes and approved products only.']],
    trScript: 'Our', trH: 'Treatments', trLead: 'Three specialities, one standard: natural results that suit you.', from: 'from', ask: 'Request a consultation',
    revScript: 'Clients', revH: 'Reviews', revTitles: ['Honest advice', 'So natural', 'Very discreet', 'Simply great', 'Professional', 'Perfectly subtle'], revG: 'All reviews on Google', stars: '5 out of 5 stars',
    visScript: 'Your', visH: 'Visit',
    policies: [['Consultation', 'Free before or during your treatment. As a separate appointment CHF 50.'], ['Appointments', 'Book online – around the clock. Or via WhatsApp (messages only).'], ['Cancellations', 'Please cancel or reschedule at least 24 hours in advance.'], ['Payment', `Directly after the treatment – ${SITE.payment.en}.`], ['Health', 'Please tell us in advance about allergies, medication or a pregnancy.'], ['Punctuality', 'If you arrive late, the treatment time may be shortened.']],
    nudge: {
      ex: ['Get to know me in person – the consultation is free before your treatment.', 'Arrange a consultation', 'Hello Liyas Lounge, I would like to get to know you in a consultation.'],
      tr: ['Not sure what suits you? Send us a photo – we will tell you honestly what makes sense. Even if that is “nothing”.', 'Get an honest opinion', 'Hello Liyas Lounge, I am not sure which treatment suits me. Could you give me honest advice?'],
      faq: ['Your question was not answered? Just ask – we reply personally.', 'Ask on WhatsApp', 'Hello Liyas Lounge, I have a question:'],
    },
    faqScript: 'Frequently', faqH: 'Asked', faq: EN_HOME_FAQ.slice(0, 7),
    ctScript: 'Your appointment.', ctH: 'Your time.', ctP: 'Book your appointment online or send us a WhatsApp message – photos and wishes welcome. We advise you personally and honestly, in 6 languages.',
    ctBtn: 'Message us on WhatsApp', bookLbl: 'Online booking', bk: { priv: 'The calendar is provided by SimplyBook.me, which may set technically necessary cookies.', privLink: 'Privacy policy (German)', title: 'Book an appointment | Liyas Lounge Olten', desc: 'Book your appointment at Liyas Lounge in Olten online – choose treatment and time, confirmed instantly.', script: 'Your appointment', h: 'Book online', lead: 'Choose your treatment, day and time – you will receive a confirmation straight away.', notes: ['Consultation free before or during your treatment – CHF 50 as a separate appointment', 'Please cancel at least 24 hours in advance', 'Hammerallee 23, 4600 Olten · first lower floor'], loading: 'Loading calendar …', fail: 'The calendar could not be loaded.', open: 'Open booking on SimplyBook', q: 'Questions beforehand? Message us on WhatsApp.' }, floor: 'First lower floor · bell “Liyas Lounge & Lala Lashes”', waNote: 'messages only', addr: 'Address', hours: 'Opening hours', route: 'Get directions', follow: 'Follow us',
    hoursTxt: `${SITE.hours.map((h) => `${h.en} ${h.opens}–${h.closes}`).join(', ')} · ${SITE.hoursNote.en}`,
    legal: [['/agb', 'Terms (DE)'], ['/datenschutz', 'Privacy (DE)'], ['/impressum', 'Legal notice (DE)']], rights: 'All rights reserved.',
    cats: CATEGORIES.map((c) => ({ ...c, ...EN_CATEGORIES[c.id] })), reviews: REVIEWS.map((r, i) => ({ ...r, tag: EN_REVIEW_TAGS[i], text: EN_REVIEW_TEXTS[i] || r.text, tr: !!EN_REVIEW_TEXTS[i] })), revMore: 'Read the full review on Google', revTr: 'Translated from German', langAria: 'Choose language', prev: 'Previous review', next: 'Next review',
    ownerAlt: 'The owner of Liyas Lounge during a consultation', heroAlt: 'The owner of Liyas Lounge in her studio in Olten',
  },
  fr: {
    lang: 'fr', path: '/fr', ogLocale: 'fr_CH',
    title: 'Liyas Lounge Olten – Anti-âge, fillers & raffermissement',
    desc: 'Médecine esthétique à Olten : fillers, rides, HIFU, Morpheus8 & mésothérapie – naturel, conseils honnêtes. Depuis 2009, en 6 langues.',
    nav: [['expertin', 'À propos'], ['behandlungen', 'Traitements'], ['bewertungen', 'Avis'], ['faq', 'FAQ'], ['kontakt', 'Contact']],
    cta: 'Réserver', book: 'Réserver en ligne', bookNote: 'en ligne, 24 h/24', menu: 'Menu', skip: 'Aller au contenu',
    wa: 'Bonjour Liyas Lounge, je suis intéressée par un traitement et j’aimerais une consultation.',
    waCat: (n) => `Bonjour Liyas Lounge, je suis intéressée par ${n} et j’aimerais une consultation.`,
    tagline: 'Médecine esthétique & beauté · Olten',
    slogan: ['Shine bright,', 'age is just a number.'],
    heroBtn: 'Demander une consultation', heroBtn2: 'Découvrir les traitements', fabSub: 'En ligne · 24 h/24', fabBook: 'Prendre rendez-vous', fabWa: 'Question sur WhatsApp',
    trust: (r, n) => [`${r} · ${n} avis Google`, 'Expérience depuis 2009', 'Conseils en 6 langues'],
    trustS: (r, n) => [`${r} · ${n} Google`, 'Depuis 2009', '6 langues'],
    scroll: 'Découvrir',
    exScript: 'Faites connaissance', exH: 'Votre experte',
    exP: 'Naturopathe (Heilpraktikerin), infirmière et esthéticienne médicale – indépendante depuis 2009, avec une longue expérience aux côtés de chirurgiens plasticiens, en cosmétique appareillée et en conseil clientèle. Elle voit la beauté avec des yeux d’artiste. Son objectif : que vous paraissiez plus fraîche, pas changée.',
    exCap: 'Chaque traitement commence par une consultation personnelle – gratuite avant le traitement.',
    values: [['Savoir médical', 'De nombreuses formations continues en médecine esthétique, maquillage professionnel, psychologie et assistance médicale.'], ['Conseils honnêtes', 'Nous ne recommandons que ce qui vous convient vraiment – en 6 langues.'], ['Hygiène & qualité', 'Des processus soignés et uniquement des produits autorisés.']],
    trScript: 'Nos', trH: 'Traitements', trLead: 'Trois spécialités, une exigence : des résultats naturels, adaptés à vous.', from: 'dès', ask: 'Demander une consultation',
    revScript: 'Clientes', revH: 'Avis', revG: 'Tous les avis sur Google', stars: '5 étoiles sur 5',
    visScript: 'Votre', visH: 'Visite',
    policies: [['Consultation', 'Gratuite avant ou pendant votre traitement. En rendez-vous séparé CHF 50.'], ['Rendez-vous', 'Réservez en ligne – 24 h/24. Ou par WhatsApp (messages uniquement).'], ['Annulations', 'Merci d’annuler ou de déplacer au moins 24 heures à l’avance.'], ['Paiement', 'Directement après le traitement – espèces, TWINT, carte.'], ['Santé', 'Merci de nous informer à l’avance d’allergies, de médicaments ou d’une grossesse.'], ['Ponctualité', 'En cas de retard, la durée du traitement peut être réduite.']],
    nudge: {
      ex: ['Faites ma connaissance – avant votre traitement, la consultation est gratuite.', 'Fixer une consultation', 'Bonjour Liyas Lounge, j’aimerais faire votre connaissance lors d’une consultation.'],
      tr: ['Vous ne savez pas ce qui vous convient ? Envoyez-nous une photo – nous vous dirons honnêtement ce qui a du sens. Même si c’est « rien ».', 'Obtenir un avis honnête', 'Bonjour Liyas Lounge, je ne sais pas quel traitement me convient. Pouvez-vous me conseiller honnêtement ?'],
      faq: ['Votre question n’y figure pas ? Demandez simplement – nous répondons personnellement.', 'Poser la question sur WhatsApp', 'Bonjour Liyas Lounge, j’ai une question :'],
    },
    faqScript: 'Questions', faqH: 'Fréquentes', faq: FR_HOME_FAQ.slice(0, 7),
    ctScript: 'Votre rendez-vous.', ctH: 'Votre temps.', ctP: 'Réservez votre rendez-vous en ligne ou écrivez-nous sur WhatsApp – avec une photo et vos souhaits si vous le voulez. Nous vous conseillons personnellement et honnêtement, en 6 langues.',
    ctBtn: 'Écrire sur WhatsApp', bookLbl: 'Réservation en ligne', bk: { priv: 'Le calendrier est fourni par SimplyBook.me, qui peut déposer des cookies techniquement nécessaires.', privLink: 'Protection des données (allemand)', title: 'Prendre rendez-vous | Liyas Lounge Olten', desc: 'Réservez votre rendez-vous chez Liyas Lounge à Olten en ligne – choisissez le traitement et l’heure, confirmation immédiate.', script: 'Votre rendez-vous', h: 'Réserver en ligne', lead: 'Choisissez le traitement, le jour et l’heure – vous recevez immédiatement une confirmation.', notes: ['Consultation gratuite avant ou pendant le traitement – CHF 50 en rendez-vous séparé', 'Merci d’annuler au moins 24 heures à l’avance', 'Hammerallee 23, 4600 Olten · 1er sous-sol'], loading: 'Chargement du calendrier …', fail: 'Le calendrier n’a pas pu être chargé.', open: 'Ouvrir la réservation sur SimplyBook', q: 'Des questions avant ? Écrivez-nous sur WhatsApp.' }, floor: '1er sous-sol · sonnette « Liyas Lounge & Lala Lashes »', waNote: 'messages uniquement', addr: 'Adresse', hours: 'Horaires', route: 'Itinéraire', follow: 'Suivez-nous',
    hoursTxt: 'Lu–Ve 10:00–19:00 · Sa sur rendez-vous',
    legal: [['/agb', 'CGV (DE)'], ['/datenschutz', 'Confidentialité (DE)'], ['/impressum', 'Mentions légales (DE)']], rights: 'Tous droits réservés.',
    cats: CATEGORIES.map((c) => ({ ...c, ...FR_CATEGORIES[c.id] })), reviews: REVIEWS.map((r, i) => ({ ...r, tag: FR_REVIEW_TAGS[i], text: FR_REVIEW_TEXTS[i] || r.text, tr: !!FR_REVIEW_TEXTS[i] })), revMore: 'Lire l’avis complet sur Google', revTr: 'Traduit de l’allemand', langAria: 'Choisir la langue', prev: 'Avis précédent', next: 'Avis suivant',
    ownerAlt: 'La propriétaire de Liyas Lounge lors d’une consultation', heroAlt: 'La propriétaire de Liyas Lounge dans son studio à Olten',
  },
};

/* ---------- Bausteine ---------- */
function pic(name, alt, { sizes = '100vw', eager = false, pos = '', cls = '' } = {}) {
  const m = IMG[name];
  if (!m) throw new Error('Bild fehlt: ' + name);
  const v = (n) => createHash('md5').update(IMG[n].lqip || String(IMG[n].w)).digest('hex').slice(0, 8);
  const set = (n) => IMG[n].widths.map((w) => `/assets/img/${n}-${w}.webp?v=${v(n)} ${w}w`).join(', ');
  const portrait = IMG[name + '-portrait'] ? `<source media="(orientation: portrait) and (max-width: 900px)" type="image/webp" srcset="${set(name + '-portrait')}" sizes="100vw">` : '';
  const style = pos ? `object-position:${pos}` : '';
  return `<picture${cls ? ` class="${cls}"` : ''}>${portrait}<source type="image/webp" srcset="${set(name)}" sizes="${sizes}"><img src="/assets/img/${name}.jpg?v=${v(name)}" alt="${esc(alt)}" width="${m.w}" height="${m.h}"${style ? ` style="${style}"` : ''} ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></picture>`;
}
const I = {
  arrow: '<path d="M7 17 17 7M8 7h9v9"/>', left: '<path d="M19 12H5M11 6l-6 6 6 6"/>', right: '<path d="M5 12h14M13 6l6 6-6 6"/>', down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
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

// Mini-Check «Was passt zu Ihnen?»: 1–2 Klicks → Empfehlung → WhatsApp mit vorbereiteter Nachricht

// sub: Unterseite (AGB, Datenschutz, Impressum, 404) im gleichen Look – { file, title, desc, robots, main }
function page(L, sub = null) {
  const t = T[L];
  const lhref = (k) => (sub && sub.alt ? sub.alt[k] : T[k].path);
  const base = sub ? t.path : ''; // auf Unterseiten führen die Menülinks zurück zu den Abschnitten der Startseite
  const wa = (text) => esc(`${SITE.whatsapp}?text=${encodeURIComponent(text)}`);
  const book = BOOK_PATH[L];
  // kurzer Hinweis + Button, passend zur Stelle auf der Seite
  const nudge = ([txt, btn, msg], cls = '') => `<div class="nudge ${cls}" data-up><p>${esc(txt)}</p><a class="btn btn--line" href="${wa(msg)}" target="_blank" rel="noopener">${ico('wa')}<span>${esc(btn)}</span></a></div>`;
  const rating = String(SITE.googleRating).replace('.', L === 'en' ? '.' : ',');
  const navHtml = t.nav.map(([id, l]) => `<a href="${base}#${id}">${l}</a>`).join('');
  const langSel = `<div class="lsel" data-lsel><button type="button" class="lsel__btn" aria-haspopup="true" aria-expanded="false" aria-label="${t.langAria}">${L.toUpperCase()}<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button><div class="lsel__list">${LANGS.map((k) => `<a href="${lhref(k)}" hreflang="${T[k].lang}" lang="${T[k].lang}"${L === k ? ' aria-current="true"' : ''}><b>${k.toUpperCase()}</b>${LANG_NAMES[k]}</a>`).join('')}</div></div>`;
  const langSw = `<nav class="lang" aria-label="${t.langAria}">${LANGS.map((k) => `<a href="${lhref(k)}" hreflang="${T[k].lang}" lang="${T[k].lang}"${L === k ? ' aria-current="true"' : ''}>${k.toUpperCase()}</a>`).join('')}</nav>`;
  const reviewsList = t.reviews.slice(0, 6);
  const schema = {
    '@context': 'https://schema.org', '@type': ['BeautySalon', 'MedicalBusiness'], '@id': SITE.url + '/#business', name: SITE.name, description: t.desc, url: SITE.url + t.path,
    image: [SITE.url + '/assets/img/og-image.jpg'], address: { '@type': 'PostalAddress', streetAddress: SITE.street, postalCode: SITE.zip, addressLocality: SITE.city, addressRegion: 'SO', addressCountry: 'CH' },
    openingHoursSpecification: SITE.hours.map((h) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: h.days.map((d) => 'https://schema.org/' + { Mo: 'Monday', Tu: 'Tuesday', We: 'Wednesday', Th: 'Thursday', Fr: 'Friday' }[d]), opens: h.opens, closes: h.closes })),
    sameAs: [SITE.instagram, SITE.googleMaps], hasMap: SITE.googleMaps, telephone: SITE.phoneHref.replace('tel:', ''), logo: SITE.url + '/icon-512.png',
    priceRange: 'CHF 50 – CHF 1200', currenciesAccepted: 'CHF', paymentAccepted: 'Cash, TWINT, Credit Card', areaServed: ['Olten', 'Kanton Solothurn', 'Aarau', 'Zofingen'], knowsLanguage: ['de', 'en', 'fr', 'it', 'ru', 'uk'], inLanguage: t.lang,
  };
  const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: t.lang, mainEntity: t.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) };

  const body = `
<div class="lx" aria-hidden="true"><div class="lx__in">${logo('logo--lx')}<span class="lx__bar"><i></i></span></div></div>
<a class="skip" href="#main">${t.skip}</a>
<header class="nav" data-nav>
  <a class="nav__logo" href="${t.path}" data-top aria-label="Liyas Lounge">${logo('logo--nav')}</a>
  <nav class="nav__links" aria-label="Navigation">${navHtml}</nav>
  <div class="nav__end">${langSel}${langSw}<a class="btn btn--line btn--sm nav__cta" href="${book}">${t.cta}</a>
  <button class="burger" type="button" aria-controls="menu" aria-expanded="false" aria-label="${t.menu}"><span></span><span></span></button></div>
</header>
<div class="menu" id="menu" hidden>
  <nav class="menu__nav">${t.nav.map(([id, l], i) => `<a href="${base}#${id}"><small>0${i + 1}</small>${l}</a>`).join('')}</nav>
  <div class="menu__foot"><a class="btn btn--gold" href="${book}">${ico('cal')}<span>${t.book}</span></a>${langSw}</div>
</div>

<main id="main">${sub ? sub.main : `
<section class="hero" aria-label="Liyas Lounge">
  <div class="hero__media" data-hero-img>${pic(HOME.heroImage, t.heroAlt, { eager: true, pos: '62% 24%' })}</div>
  <div class="hero__in">
    <h1 class="hero__logo" data-in>${logo('logo--hero')}<span class="sr">Liyas Lounge – ${esc(t.tagline)}</span></h1>
    <p class="hero__slogan" data-in style="--d:.35s">${esc(t.slogan[0])} <em>${esc(t.slogan[1])}</em></p>
    <div class="hero__ctas" data-in style="--d:.5s"><a class="btn btn--gold" href="${book}">${ico('cal')}<span>${t.book}</span></a><a class="btn btn--line" href="#behandlungen"><span>${t.heroBtn2}</span></a></div>
    ${heroTrust(L, ' data-in style="--d:.65s"')}
  </div>
  <a class="hero__scroll" href="#expertin" aria-label="${t.scroll}"><span>${t.scroll}</span><i></i></a>
</section>

<section class="oval tex" id="expertin">
  <div class="oval__in">
    ${head(t.exScript, t.exH)}
    <p class="lead" data-up>${esc(t.exP)}</p>
    <figure class="photo" data-up>${pic('beratung-liya-olten', t.ownerAlt, { sizes: '(max-width: 900px) 92vw, 680px', pos: '50% 35%' })}<figcaption>${esc(t.exCap)}</figcaption></figure>
    <blockquote class="quote" data-up><p>„${esc(TP[L].quote)}“</p><cite>${esc(TP[L].quoteBy)}</cite></blockquote>
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
      <ul class="tr__cats">${t.cats.map((c, i) => `<li style="--i:${i}"><a href="${catUrl(L, c.id)}">
        ${pic(c.image, c.name, { sizes: '(max-width: 900px) 92vw, 33vw' })}
        <span class="tr__txt"><b>${esc(c.name)}</b><small>${esc(c.short)}</small><span class="tr__ask">${TP[L].cardMore} ${ico('arrow')}</span></span>
      </a></li>`).join('')}</ul>
    </div>
  </div>
</section>

<div class="vr">
<div class="vr__bg" aria-hidden="true">${pic('studio-raum-olten', '', { sizes: '100vw', pos: '50% 50%' })}</div>
<section class="visit">
  <div class="visit__in">
    ${head(t.visScript, t.visH)}
    <ul class="pol">${t.policies.map(([a, b], i) => `<li data-up style="--d:${(i % 3) * .07}s"><b>${esc(a)}</b><p>${esc(b)}</p></li>`).join('')}</ul>
  </div>
</section>

<section class="rev" id="bewertungen">
  ${head(t.revScript, t.revH)}
  <a class="rev__score" href="${SITE.googleMaps}" target="_blank" rel="noopener" data-up><b>${rating}</b>${stars(t.stars)}<span>${SITE.googleReviewCount} Google</span></a>
  <div class="rs" data-slider data-up>
    <div class="rs__view"><ul class="rs__track" data-track>${reviewsList.map((r, i) => `<li class="rs__card" aria-roledescription="slide" aria-label="${i + 1} / ${reviewsList.length}"><figure>${stars(t.stars)}<blockquote${r.text.length > REV_LONG ? ' class="is-long"' : ''}>„${esc(r.text)}“</blockquote>${r.text.length > REV_LONG ? `<a class="rs__more" href="${esc(r.url || SITE.googleMaps)}" target="_blank" rel="noopener">${esc(t.revMore)} ${ico('arrow')}</a>` : ''}<figcaption><b>${esc(r.name)}</b>${r.tag ? `<span>${esc(r.tag)}</span>` : ''}${r.tr ? `<small>${esc(t.revTr)}</small>` : ''}</figcaption></figure></li>`).join('')}</ul></div>
    <div class="rs__nav"><button type="button" class="rs__btn" data-prev aria-label="${t.prev}">${ico('left')}</button><span class="rs__count"><b data-cur>01</b> / ${String(reviewsList.length).padStart(2, '0')}</span><span class="rs__bar"><i data-bar></i></span><button type="button" class="rs__btn" data-next aria-label="${t.next}">${ico('right')}</button></div>
  </div>
  <a class="btn btn--line" href="${SITE.googleMaps}" target="_blank" rel="noopener" data-up><span>${t.revG}</span>${ico('arrow')}</a>
</section>
</div>

<section class="faq" id="faq">
  ${head(t.faqScript, t.faqH)}
  <div class="acc" data-up>${t.faq.map(([q, a]) => `<details><summary>${esc(q)}${ico('plus')}</summary><div><p>${esc(a)}</p></div></details>`).join('')}</div>
  ${nudge(t.nudge.faq)}
</section>

<section class="ct" id="kontakt">
  <div class="ct__txt">
    <header class="sh sh--left" data-up><p class="sh__script">${esc(t.ctScript)}</p><h2 class="sh__h">${esc(t.ctH)}</h2></header>
    <p class="lead" data-up>${esc(t.ctP)}</p>
    <div class="ct__btns" data-up><a class="btn btn--gold btn--lg" href="${book}">${ico('cal')}<span>${t.book}</span></a><a class="btn btn--line btn--lg" href="${wa(t.wa)}" target="_blank" rel="noopener">${ico('wa')}<span>${t.ctBtn}</span></a></div>
    <p class="micro micro--left" data-up>${ico('check')}${esc(TP[L].micro)}</p>
    <ul class="ct__list" data-up>
      <li>${ico('wa')}<span><small>WhatsApp (${t.waNote})</small><a href="${wa(t.wa)}" target="_blank" rel="noopener">${WA_NUM}</a></span></li>
      <li>${ico('pin')}<span><small>${t.addr}</small><a href="${SITE.route}" target="_blank" rel="noopener">${esc(SITE.street)}, ${SITE.zip} ${SITE.city}</a>${SITE.floor ? `<em class="ct__floor">${t.floor}</em>` : ''}</span></li>
      <li>${ico('clock')}<span><small>${t.hours}</small>${esc(t.hoursTxt)}</span></li>
      <li>${ico('ig')}<span><small>Instagram</small><a href="${SITE.instagram}" target="_blank" rel="noopener">${IG}</a></span></li>
    </ul>
  </div>
  <a class="phone" href="${SITE.instagram}" target="_blank" rel="noopener" data-up aria-label="Instagram ${IG}"><span class="phone__screen">${pic('portrait-liya-olten', '', { sizes: '420px', pos: '50% 18%' })}<span class="phone__ig">${ico('ig')} ${IG}</span><span class="phone__follow">${t.follow}</span></span></a>
</section>`}
</main>

<footer class="foot">
  ${logo('logo--foot')}
  <nav class="foot__nav">${navHtml}</nav>
  <nav class="foot__tr" aria-label="${esc(TP[L].all)}">${TR_ORDER.map((sl) => `<a href="${trUrl(L, sl)}">${esc(trData(L, sl).name)}</a>`).join('')}</nav>
  <p class="foot__legal">${t.legal.map(([h, l]) => `<a href="${h}"${L !== 'de' ? ' hreflang="de-CH"' : ''}>${l}</a>`).join(' · ')}</p>
  <p class="foot__copy">© ${new Date().getFullYear()} Liyas Lounge · ${esc(SITE.street)}, ${SITE.zip} ${SITE.city} · ${t.rights}</p>
</footer>${sub && !sub.fab ? '' : `
<div class="fab" data-fab><a class="fab__ico" href="${wa(t.wa)}" target="_blank" rel="noopener" aria-label="${esc(t.fabWa)}">${ico('wa')}</a><a class="fab__main" href="${book}"><span class="fab__txt"><b>${esc(t.fabBook)}</b><small>${esc(t.fabSub)}</small></span>${ico('arrow')}</a></div>`}`;

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
`}${sub && !sub.alt ? '' : `${LANGS.map((k) => `<link rel="alternate" hreflang="${T[k].lang}" href="${SITE.url}${lhref(k)}">`).join('\n')}
<link rel="alternate" hreflang="x-default" href="${SITE.url}${lhref('de')}">`}
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
<script>document.documentElement.classList.add('js');document.addEventListener('load',function(e){if(e.target.tagName==='IMG')e.target.classList.add('is-ld')},true);document.addEventListener('error',function(e){if(e.target.tagName==='IMG')e.target.classList.add('is-ld')},true);try{if(sessionStorage.getItem('ll-lx')){document.documentElement.classList.add('lx-in');sessionStorage.removeItem('ll-lx')}if(sessionStorage.getItem('ll-pt')){document.documentElement.classList.add('pt-in');sessionStorage.removeItem('ll-pt')}}catch(e){}</script>
<script type="speculationrules">{"prerender":[{"where":{"and":[{"href_matches":"/*"},{"not":{"selector_matches":"[target=_blank]"}}]},"eagerness":"moderate"}],"prefetch":[{"where":{"and":[{"href_matches":"/*"},{"not":{"selector_matches":"[target=_blank]"}}]},"eagerness":"moderate"}]}</script>
${sub ? (sub.schemas || []).map((x) => `<script type="application/ld+json">${JSON.stringify(x)}</script>`).join('\n') : `<script type="application/ld+json">${JSON.stringify(schema)}</script>
<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>`}
</head>
<body${sub ? ` class="sub${sub.cls ? ' ' + sub.cls : ''}"` : ''}>
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

// Buchungsseite mit eingebettetem SimplyBook-Kalender (Farben passend zur Seite)
const SB_THEME = { timeline_hide_unavailable: '1', hide_past_days: '0', timeline_show_end_time: '0', timeline_modern_display: 'as_slots', sb_base_color: '#cfae6b', display_item_mode: 'block', booking_nav_bg_color: '#0b0b0b', body_bg_color: '#0d0d0d', sb_review_image: '', dark_font_color: '#f3eee4', light_font_color: '#0b0b0b', btn_color_1: '#cfae6b', sb_company_label_color: '#cfae6b', hide_img_mode: '0', sb_busy: '#3a3326', sb_available: '#cfae6b' };
for (const L of LANGS) {
  const t = T[L], k = t.bk, sbUrl = SITE.booking.replace(/\/v2\/?$/, '');
  const cfg = { widget_type: 'iframe', url: sbUrl, theme: 'default', theme_settings: SB_THEME, timeline: 'modern', datepicker: 'top_calendar', is_rtl: false, app_config: { clear_session: 0, allow_switch_to_ada: 0, predefined: [] }, container_id: 'sbw' };
  const main = `
<section class="legal bk">
  <header class="sh"><p class="sh__script">${esc(k.script)}</p><h1 class="sh__h">${esc(k.h)}</h1></header>
  <p class="lead">${esc(k.lead)}</p>
  <ul class="bk__notes">${k.notes.map((n) => `<li>${ico('check')}<span>${esc(n)}</span></li>`).join('')}</ul>
  <div class="bk__cal" data-lenis-prevent>
    <div id="sbw"></div>
    <p class="bk__state" data-bk-loading>${esc(k.loading)}</p>
    <div class="bk__fail" data-bk-fail hidden><p>${esc(k.fail)}</p><a class="btn btn--gold" href="${esc(SITE.booking)}" target="_blank" rel="noopener">${ico('cal')}<span>${esc(k.open)}</span></a></div>
  </div>
  <p class="bk__q">${esc(k.q)} <a href="${esc(`${SITE.whatsapp}?text=${encodeURIComponent(t.wa)}`)}" target="_blank" rel="noopener">WhatsApp ${ico('arrow')}</a></p>
  <p class="bk__priv">${esc(k.priv)} <a href="/datenschutz">${esc(k.privLink)}</a></p>
</section>
<script src="https://widget.simplybook.it/v2/widget/widget.js" defer></script>
<script>
(function () {
  var tries = 0, cal = document.getElementById('sbw');
  function fail() { document.querySelector('[data-bk-loading]').hidden = true; document.querySelector('[data-bk-fail]').hidden = false; }
  function start() {
    if (typeof window.SimplybookWidget !== 'function') { if (++tries > 40) return fail(); return setTimeout(start, 250); }
    try { new window.SimplybookWidget(${JSON.stringify(cfg)}); } catch (e) { return fail(); }
    // Kalender da? (iframe vorhanden) – sonst Ersatz-Button zeigen
    setTimeout(function () { if (cal.querySelector('iframe')) document.querySelector('[data-bk-loading]').hidden = true; else fail(); }, 8000);
    var obs = new MutationObserver(function () { if (cal.querySelector('iframe')) { document.querySelector('[data-bk-loading]').hidden = true; obs.disconnect(); } });
    obs.observe(cal, { childList: true, subtree: true });
  }
  start();
})();
</script>`;
  const path = BOOK_PATH[L], file = path.slice(1) + '.html';
  if (path.split('/').length > 2) mkdirSync(join(ROOT, path.split('/')[1]), { recursive: true });
  writeFileSync(join(ROOT, file), page(L, { url: path, title: k.title, desc: k.desc, robots: 'index, follow', main, alt: BOOK_PATH }));
}
console.log('✓ Buchungsseiten: ' + Object.values(BOOK_PATH).join(', '));

// Sitemap: Buchungsseiten (DE/EN/FR) mit hreflang ergänzen
{
  const sp = join(ROOT, 'sitemap.xml');
  let sm = readFileSync(sp, 'utf8');
  if (!sm.includes(`<loc>${SITE.url}${BOOK_PATH.de}</loc>`)) {
    const alts = LANGS.map((k) => `    <xhtml:link rel="alternate" hreflang="${T[k].lang}" href="${SITE.url}${BOOK_PATH[k]}"/>`).join('\n') + `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE.url}${BOOK_PATH.de}"/>`;
    const day = new Date().toISOString().slice(0, 10);
    const urls = LANGS.map((k) => `  <url>\n    <loc>${SITE.url}${BOOK_PATH[k]}</loc>\n    <lastmod>${day}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n${alts}\n  </url>`).join('\n');
    writeFileSync(sp, sm.replace('</urlset>', urls + '\n</urlset>'));
  }
}

/* ---------- Behandlungen: Übersicht und eine Seite pro Behandlung (DE/EN/FR) ---------- */
const wa = (text) => esc(`${SITE.whatsapp}?text=${encodeURIComponent(text)}`);
const fmtPrice = (p) => p.priceText || (p.price ? `CHF ${p.price}` : '');
const trAlt = (sl) => Object.fromEntries(LANGS.map((k) => [k, trUrl(k, sl)]));
const crumbs = (L, items) => `<nav class="crumbs" aria-label="Breadcrumb"><ol>${items.map(([h, l], i) => `<li>${i < items.length - 1 ? `<a href="${h}">${esc(l)}</a>` : `<span aria-current="page">${esc(l)}</span>`}</li>`).join('')}</ol></nav>`;
const crumbSchema = (items) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([h, l], i) => ({ '@type': 'ListItem', position: i + 1, name: l, item: SITE.url + h })) });
const ctaBand = (L, waText) => { const p = TP[L]; return `
<section class="tp-cta" id="kontakt">
  <header class="sh"><p class="sh__script">${esc(p.ctaScript)}</p><h2 class="sh__h">${esc(p.ctaH)}</h2></header>
  <p class="lead">${esc(p.ctaP)}</p>
  <div class="tp-ctas"><a class="btn btn--gold btn--lg" href="${BOOK_PATH[L]}">${ico('cal')}<span>${T[L].book}</span></a><a class="btn btn--line btn--lg" href="${wa(waText)}" target="_blank" rel="noopener">${ico('wa')}<span>${esc(p.ask)}</span></a></div>
  <p class="micro">${ico('check')}${esc(p.micro)}</p>
</section>`; };

const tpHero = (L, { img, alt, items, h1, sub, from, ctas }) => `
<section class="hero hero--tp">
  <div class="hero__media" data-hero-img>${pic(img, alt, { eager: true, pos: "72% 40%", sizes: "(max-width: 900px) 660px, 100vw" })}</div>
  <div class="hero__in">
    ${crumbs(L, items)}
    <h1 class="tp-h1" data-in style="--d:.2s">${h1}</h1>
    <p class="hero__sub" data-in style="--d:.32s">${esc(sub)}</p>
    ${from ? `<p class="tp-from" data-in style="--d:.4s">${from}</p>` : ''}
    <div class="hero__ctas" data-in style="--d:.48s">${ctas}</div>
    ${heroTrust(L, ' data-in style="--d:.56s"')}
  </div>
</section>`;

for (const L of LANGS) {
  const t = T[L], p = TP[L], catName = Object.fromEntries(t.cats.map((c) => [c.id, c]));
  const tile = (sl) => { const x = trData(L, sl); return `<li><a class="tp-tile" href="${trUrl(L, sl)}">${pic(x.image, x.name, { sizes: '(max-width: 640px) 520px, 600px' })}<span class="tp-tile__txt"><b>${esc(x.name)}</b><small>${esc(x.card)}</small><span class="tr__ask">${p.more} ${ico('arrow')}</span></span></a></li>`; };
  const catTile = (c) => `<li><a class="tp-tile" href="${catUrl(L, c.id)}">${pic(c.image, c.name, { sizes: '(max-width: 640px) 92vw, 340px' })}<span class="tp-tile__txt"><b>${esc(c.name)}</b><small>${esc(c.short)}</small><span class="tr__ask">${p.cardMore} ${ico('arrow')}</span></span></a></li>`;
  const bookBtn = `<a class="btn btn--gold" href="${BOOK_PATH[L]}">${ico('cal')}<span>${t.book}</span></a>`;

  // eine Seite pro Kategorie
  for (const c of t.cats) {
    const items = [[t.path, p.home], [catUrl(L, c.id), c.name]];
    const main = `${tpHero(L, { img: CAT_HERO[c.id], alt: c.name, items, h1: `${esc(c.name)} <em>${esc(c.claim)}</em>`, sub: c.text, ctas: `${bookBtn}<a class="btn btn--line" href="#liste"><span>${esc(p.cardMore)}</span>${ico('arrow')}</a>` })}
<section class="tp-sec tp-sec--wide" id="liste">
  <header class="sh" data-up><p class="sh__script">${esc(p.all)}</p><h2 class="sh__h">${esc(p.catH)}</h2></header>
  <ul class="tp-tiles">${TR_ORDER.filter((sl) => trData(L, sl).category === c.id).map(tile).join('')}</ul>
</section>
<section class="tp-sec tp-sec--wide">
  <header class="sh" data-up><p class="sh__script">${esc(p.all)}</p><h2 class="sh__h">${esc(p.catOther)}</h2></header>
  <ul class="tp-tiles tp-tiles--rel">${t.cats.filter((o) => o.id !== c.id).map(catTile).join('')}</ul>
</section>
${ctaBand(L, t.wa)}`;
    const file = catUrl(L, c.id).slice(1) + '.html';
    mkdirSync(join(ROOT, dirname(file)), { recursive: true });
    writeFileSync(join(ROOT, file), page(L, { url: catUrl(L, c.id), title: p.catTitle(c), desc: p.catDesc(c), robots: 'index, follow, max-image-preview:large', main, alt: Object.fromEntries(LANGS.map((k) => [k, catUrl(k, c.id)])), fab: true, cls: 'tp', schemas: [crumbSchema(items)] }));
  }

  // eine Seite pro Behandlung
  for (const sl of TR_ORDER) {
    const x = trData(L, sl), f = trFrom(x), cat = catName[x.category];
    const items = [[t.path, p.home], [catUrl(L, x.category), cat.name], [trUrl(L, sl), x.name]];
    const faq = [
      [x.what.title, `<p>${esc(x.what.text)}</p>`],
      ...x.faq.map(([q, a]) => [q, `<p>${esc(a)}</p>`]),
      [x.results.title, `<ul class="tp-checks">${x.results.items.map((i) => `<li>${ico('check')}<span>${esc(i)}</span></li>`).join('')}</ul><p class="tp-note">${esc(x.results.note)}</p>`],
      [p.contraQ, `<ul class="tp-checks tp-checks--dot">${x.contra.items.map((i) => `<li><span>${esc(i)}</span></li>`).join('')}</ul>${x.contra.note ? `<p>${esc(x.contra.note)}</p>` : ''}`],
    ];
    const main = `${tpHero(L, { img: x.image, alt: x.imageAlt || x.name, items, h1: `${esc(x.h1)} <em>${esc(x.h1Accent)}</em>`, sub: x.lead, from: f ? `${p.from} <b>CHF ${f}</b>` : `<b>${esc(p.onReq)}</b>`, ctas: `${bookBtn}<a class="btn btn--line" href="${wa(p.waTr(x.name))}" target="_blank" rel="noopener">${ico('wa')}<span>${esc(p.ask)}</span></a>` })}
<section class="tp-sec tp-intro">
  <div data-up><header class="sh sh--left"><p class="sh__script">${esc(x.name)}</p><h2 class="sh__h">${esc(p.forYou)}</h2></header><p class="lead tp-intro__lead">${esc(x.intro)}</p></div>
  <div class="tp-card" data-up><h3>${esc(x.indications.title)}</h3><ul class="tp-checks">${x.indications.items.map((i) => `<li>${ico('check')}<span>${esc(i)}</span></li>`).join('')}</ul></div>
</section>
<section class="tp-sec tex tex--read" id="preise">
  <header class="sh" data-up><p class="sh__script">${esc(x.name)}</p><h2 class="sh__h">${esc(p.prices)}</h2></header>
  ${x.prices.length ? `<ul class="tp-prices" data-up>${x.prices.map((pr) => `<li${pr.featured ? ' class="is-top"' : ''}><span class="tp-prices__n"><b>${esc(pr.name)}</b>${pr.detail ? `<small>${esc(pr.detail)}</small>` : ''}${pr.desc ? `<em>${esc(pr.desc)}</em>` : ''}</span><span class="tp-prices__p">${esc(fmtPrice(pr))}</span></li>`).join('')}</ul>` : ''}
  ${x.prices.length ? (x.priceNote ? `<p class="tp-note tp-note--box" data-up>${esc(x.priceNote)}</p>` : '') : `<div class="tp-req" data-up><p class="tp-req__k">${esc(p.onReq)}</p><h3>${esc(p.reqH)}</h3><p>${esc(p.reqP)}</p><div class="tp-ctas"><a class="btn btn--gold" href="${wa(p.reqMsg(x.name))}" target="_blank" rel="noopener">${ico('wa')}<span>${esc(p.reqWa)}</span></a><a class="btn btn--line" href="${BOOK_PATH[L]}">${ico('cal')}<span>${esc(p.reqBook)}</span></a></div></div>`}
  <p class="tp-note">${esc(p.consult)}</p>
</section>
<section class="tp-sec">
  <header class="sh" data-up><p class="sh__script">${esc(x.name)}</p><h2 class="sh__h">${esc(p.how)}</h2></header>
  <ol class="rit" data-rit><i class="rit__line" aria-hidden="true"><i></i></i>${x.steps.map(([a, b], i) => `<li class="rit__step"><span class="rit__node" aria-hidden="true"></span><span class="rit__num" aria-hidden="true">${['I', 'II', 'III', 'IV', 'V', 'VI'][i]}</span><div class="rit__txt"><small>${String(i + 1).padStart(2, '0')}</small><b>${esc(a)}</b><p>${esc(b)}</p></div></li>`).join('')}</ol>
</section>
<section class="tp-sec faq">
  <header class="sh" data-up><p class="sh__script">${esc(x.name)}</p><h2 class="sh__h">${esc(p.faq)}</h2></header>
  <div class="acc" data-up>${faq.map(([q, a]) => `<details><summary>${esc(q)}${ico('plus')}</summary><div>${a}</div></details>`).join('')}</div>
</section>
<section class="tp-sec tp-sec--wide">
  <header class="sh" data-up><p class="sh__script">${esc(cat.name)}</p><h2 class="sh__h">${esc(p.related)}</h2></header>
  <ul class="tp-tiles tp-tiles--rel">${x.related.map(tile).join('')}</ul>
</section>
${ctaBand(L, p.waTr(x.name))}`;
    const schemas = [
      { '@context': 'https://schema.org', '@type': 'Service', name: x.name, serviceType: x.name, description: x.description, url: SITE.url + trUrl(L, sl), areaServed: 'Olten', provider: { '@id': SITE.url + '/#business', '@type': ['BeautySalon', 'MedicalBusiness'], name: SITE.name, address: { '@type': 'PostalAddress', streetAddress: SITE.street, postalCode: SITE.zip, addressLocality: SITE.city, addressCountry: 'CH' } }, ...(f ? { offers: { '@type': 'Offer', priceCurrency: 'CHF', price: f } } : {}) },
      { '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: t.lang, mainEntity: [[x.what.title, x.what.text], ...x.faq].map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
      crumbSchema(items),
    ];
    const file = trUrl(L, sl).slice(1) + '.html';
    mkdirSync(join(ROOT, dirname(file)), { recursive: true });
    writeFileSync(join(ROOT, file), page(L, { url: trUrl(L, sl), title: x.title, desc: x.description, robots: 'index, follow, max-image-preview:large', main, alt: trAlt(sl), fab: true, cls: 'tp', schemas }));
  }
}
console.log(`✓ Behandlungen: ${T.de.cats.length} Kategorien + ${TR_ORDER.length} Seiten je Sprache (${LANGS.join('/')})`);

// Sitemap: Übersicht und Behandlungsseiten (DE/EN/FR) mit hreflang
{
  const sp = join(ROOT, 'sitemap.xml');
  let sm = readFileSync(sp, 'utf8');
  const day = new Date().toISOString().slice(0, 10);
  const block = (alt, prio) => LANGS.map((k) => `  <url>\n    <loc>${SITE.url}${alt[k]}</loc>\n    <lastmod>${day}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${prio}</priority>\n${LANGS.map((j) => `    <xhtml:link rel="alternate" hreflang="${T[j].lang}" href="${SITE.url}${alt[j]}"/>`).join('\n')}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE.url}${alt.de}"/>\n  </url>`).join('\n');
  if (!sm.includes(`<loc>${SITE.url}${trUrl('de', TR_ORDER[0])}</loc>`)) {
    const urls = [...T.de.cats.map((c) => block(Object.fromEntries(LANGS.map((k) => [k, catUrl(k, c.id)])), '0.9')), ...TR_ORDER.map((sl) => block(trAlt(sl), '0.8'))].join('\n');
    writeFileSync(sp, sm.replace('</urlset>', urls + '\n</urlset>'));
  }
}
