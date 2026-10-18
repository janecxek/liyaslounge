# Liyas Lounge – Website (DE / EN)

Statische, zweisprachige Website für Liyas Lounge, Olten – Medizinische Ästhetik & Beauty.
Aufbau, Design und Animationen basieren auf dem Perfect-Shape-System (Generator + editoriales Layout),
alle Texte, Preise, Bilder und Farben (Schwarz/Gold) sind neu für Liyas Lounge.

## Inhalte bearbeiten

Nie die generierten `.html`-Dateien direkt bearbeiten – sie werden überschrieben. Stattdessen:

| Was | Datei |
| --- | --- |
| Kontaktdaten, Öffnungszeiten, Adresse, Kategorien, Behandlungen & Preise (DE), Team, Bewertungen, FAQ, AGB | `scripts/content.mjs` |
| Englische Texte & Preise (gleiche Struktur, nach DE-Slug) | `scripts/content.en.mjs` |
| Seitenaufbau, UI-Texte, SEO, JSON-LD | `scripts/build.mjs` |
| Design | `assets/css/style.css` (Farben als Variablen in `:root`) |
| Interaktionen | `assets/js/main.js` |

Danach neu bauen:

```
node scripts/build.mjs
```

Der Build erzeugt alle Seiten, `sitemap.xml` (mit hreflang-Alternates), `robots.txt` und `assets/css/style.min.css`.

## Sprachen & URLs

- DE ist Standard (`lang="de-CH"`) unter `/`, EN (`lang="en"`) unter `/en/…`.
- Jede Seite hat `canonical` + `hreflang` de-CH / en / x-default (→ DE).
- Sprachumschalter DE | EN im Header und im mobilen Menü, aktive Sprache mit feiner goldener Linie;
  er verlinkt immer die entsprechende Seite der anderen Sprache.
- Behandlungen haben SEO-Slugs, z. B. `/dermal-filler-olten` ↔ `/en/dermal-fillers-olten`.
- Rechtstexte (AGB, Datenschutz, Impressum) gibt es nur auf Deutsch.
- Hosting: Vercel mit `cleanUrls` (`vercel.json`, inkl. Weiterleitungen der alten URLs).
  Lokal z. B. mit `npx serve .` und einer `serve.json` mit `{ "cleanUrls": true }` testen.

## Bilder

```
python3 scripts/add-image.py <quelle.png> <name>
```

Erzeugt WebP in mehreren Breiten, JPG und Vorschau und trägt alles in `scripts/imgmeta.json` ein.
Optional: `<name>-portrait` als Ausschnitt für Handys; Fokuspunkt `fx`/`fy` (in %) in `imgmeta.json`.
Prompts für noch fehlende Bilder: `docs/bild-prompts.md`.

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
