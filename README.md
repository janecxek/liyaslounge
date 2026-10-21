# Liyas Lounge – Website (DE / EN)

Statische, zweisprachige Website für Liyas Lounge, Olten – Medizinische Ästhetik & Beauty.
Design: Schwarz & Gold („Lounge Noir“) – Startseite sowie AGB, Datenschutz, Impressum und 404 im gleichen Look.

## Inhalte bearbeiten

Nie die generierten `.html`-Dateien direkt bearbeiten – sie werden überschrieben. Stattdessen:

| Was | Datei |
| --- | --- |
| Kontaktdaten, Öffnungszeiten, Adresse, Kategorien, Behandlungen & Preise (DE), Team, Bewertungen, FAQ, AGB | `scripts/content.mjs` |
| Englische Texte & Preise (gleiche Struktur, nach DE-Slug) | `scripts/content.en.mjs` |
| Französische Texte der Startseite (Kategorien, Bewertungen, FAQ) | `scripts/content.fr.mjs` |
| Startseite (DE/EN/FR): Aufbau, Texte, SEO, JSON-LD; Layout der Unterseiten | `scripts/build-landing.mjs` |
| Inhalte der rechtlichen Seiten, Sitemap, robots.txt | `scripts/build.mjs` |
| Design | `assets/css/landing.css` (Farben als Variablen in `:root`) |
| Interaktionen | `assets/js/landing.js` |

Danach neu bauen:

```
node scripts/build.mjs
```

Der Build erzeugt alle Seiten, `sitemap.xml` (mit hreflang-Alternates), `robots.txt` und `assets/css/landing.min.css`.

## Sprachen & URLs

- DE ist Standard (`lang="de-CH"`) unter `/`, EN (`lang="en"`) unter `/en`, FR (`lang="fr"`) unter `/fr`.
- Die Startseiten haben `canonical` + `hreflang` de-CH / en / fr / x-default (→ DE). Rechtliche Seiten nur DE.
- Sprachumschalter DE | EN im Header und im mobilen Menü, aktive Sprache mit feiner goldener Linie;
  er verlinkt immer die entsprechende Seite der anderen Sprache.
- Behandlungsseiten (nur mit `DETAIL_PAGES = true`) haben SEO-Slugs, z. B. `/dermal-filler-olten` ↔ `/en/dermal-fillers-olten`.
- Rechtstexte (AGB, Datenschutz, Impressum) gibt es nur auf Deutsch.
- Hosting: Vercel mit `cleanUrls` (`vercel.json`, inkl. Weiterleitungen der alten URLs).
  Lokal z. B. mit `npx serve .` und einer `serve.json` mit `{ "cleanUrls": true }` testen.

## Bilder

```
python3 scripts/add-image.py <quelle.png> <name>
```

Erzeugt WebP in mehreren Breiten, JPG und Vorschau und trägt alles in `scripts/imgmeta.json` ein.
Bis 4K (3840 px Breite), Qualität 90 – die Grösse des Originals ist die Obergrenze, deshalb Bilder möglichst in 4K liefern.
Optional: `<name>-portrait` als Ausschnitt für Handys; Fokuspunkt `fx`/`fy` (in %) in `imgmeta.json` (bleibt beim erneuten Import erhalten).
Prompts für noch fehlende Bilder: `docs/bild-prompts.md`.

## Vorerst nur die Startseite (Landing)

`LANDING_ONLY = true` in `scripts/build.mjs`: Es gibt nur die Startseite (DE `/`, EN `/en`) plus die Rechtstexte.
Die Navigation scrollt zu den Abschnitten Behandlungen, Über uns, Bewertungen, FAQ und Kontakt.
Preise-, Über-uns- und Kontaktseite werden nicht erzeugt (Inhalte bleiben im Code); die alten URLs leiten
vorübergehend (302) auf die passenden Abschnitte um. Für Unterseiten wieder auf `false` setzen und die
Weiterleitungen in `vercel.json` entfernen.

## Behandlungen: vorerst nur Kategorien

Die Website zeigt im Moment nur die 3 Kategorien (Startseite) und die Preisliste. Alle 13 Behandlungen mit
Texten, Ablauf, FAQ und Preisen sind in `scripts/content.mjs` / `content.en.mjs` gespeichert.
Für eigene Behandlungsseiten (+ Übersicht, Mega-Menü) in `scripts/build.mjs` `DETAIL_PAGES = true` setzen und
die vorübergehenden Weiterleitungen (302) der Behandlungs-URLs in `vercel.json` entfernen.

## ⚠ Demo-Inhalte – vor dem Livegang ersetzen

- **Bewertungen** (`REVIEWS` in `content.mjs`, `EN_REVIEW_TEXTS` in `content.en.mjs`) sind erfunden und nur zur
  Präsentation. Erfundene Bewertungen zu veröffentlichen ist irreführend (UWG) – durch echte ersetzen.
- **Google-Wertung** `googleReviewCount: 27` laut Profil; der Durchschnitt `googleRating: 4.9` ist noch zu prüfen – echte Werte eintragen
  oder auf `null` setzen (dann wird die Wertung ausgeblendet). Die Demo-Werte stehen nicht im JSON-LD.

## Platzhalter – vor dem Livegang ausfüllen

Werte in eckigen Klammern gelten als „nicht gesetzt“ (z. B. wird die Telefonnummer im Header dann ausgeblendet).

- Telefon + `phoneHref`, WhatsApp-Nummer, Strasse (`scripts/content.mjs → SITE`)
- Name & Foto der Inhaberin (`TEAM`), echte Kundenbewertungen (`REVIEWS`)
- Instagram/Facebook (leer = ausgeblendet)
- Datenschutz: Hosting-Anbieter, medizinisch verantwortliche Person, UID im Impressum, Gebühr in den AGB

## Rechtliche Hinweise (Schweiz) – bitte prüfen lassen

- Botulinum ist verschreibungspflichtig: Publikumswerbung mit Preisen ist heikel. Genannt wird nur der Wirkstoff, keine Marke
  („Faltenrelaxing“), die Preise sollten trotzdem rechtlich geprüft werden.
- Keine Markennamen von Fillern / Arzneimitteln, keine Wirkversprechen, keine Vorher/Nachher-Bilder.
- Zahnbleaching mit höheren Peroxid-Konzentrationen ist Zahnärzt:innen vorbehalten.
