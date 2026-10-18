# Liyas Lounge – Website (DE / EN)

One-Page-Landing für Liyas Lounge, Olten – Medizinische Ästhetik & Beauty. Schwarz/Gold,
Schriften Cormorant Garamond + Jost (lokal gehostet), statisch generiert.

## Aufbau der Seite

Schwebende Navigation → Hero (Bogen-Bild) → Laufband → Philosophie → **Behandlungen** (hochformatige Karten,
seitlich wischen, Filter nach Kategorie; ein Klick öffnet ein Seitenpanel mit Details, Preisen und FAQ;
dazu „Komplette Preisliste“) → Ablauf → Studio → Über uns → Kundenstimmen → FAQ → Kontakt & Karte → Footer.

Rechtstexte (AGB, Datenschutz, Impressum) sind eigene Seiten, nur auf Deutsch.

## Inhalte bearbeiten

Nie die generierten `.html`-Dateien direkt bearbeiten – sie werden überschrieben. Stattdessen:

| Was | Datei |
| --- | --- |
| Kontaktdaten, Öffnungszeiten, Behandlungen & Preise (DE), Team, Bewertungen, FAQ, AGB, Bilder der Startseite | `scripts/content.mjs` |
| Englische Texte & Preise (gleiche Struktur, nach DE-Slug) | `scripts/content.en.mjs` |
| Abschnittstexte (Hero, Philosophie, Ablauf …), SEO, JSON-LD | `scripts/build.mjs` (`STR`) |
| Design | `assets/css/style.css` (Farben als Variablen in `:root`) |
| Interaktionen | `assets/js/main.js` |

Danach neu bauen:

```
node scripts/build.mjs
```

Der Build erzeugt `index.html`, `en/index.html`, die Rechtstexte, `404.html`, `sitemap.xml`, `robots.txt`
und `assets/css/style.min.css`.

## Sprachen & Links

- DE ist Standard (`lang="de-CH"`) unter `/`, EN (`lang="en"`) unter `/en`; `hreflang` de-CH / en / x-default (→ DE).
- Sprachumschalter DE | EN in der Navigation und im mobilen Menü, aktive Sprache mit feiner goldener Linie.
- Jede Behandlung ist direkt verlinkbar, z. B. `/#t-dermal-filler-olten` oder `/en#t-dermal-fillers-olten`
  (öffnet das Panel). Preisliste: `/#preisliste`, `/en#price-list`.
- Alte Unterseiten leiten per `vercel.json` auf die passenden Stellen der Landing weiter.
- Lokal testen z. B. mit `npx serve .` und einer `serve.json` mit `{ "cleanUrls": true }`.

## Bilder

```
python3 scripts/add-image.py <quelle.png> <name>
```

Erzeugt WebP in mehreren Breiten, JPG und Vorschau und trägt alles in `scripts/imgmeta.json` ein.
Optional: Fokuspunkt `fx`/`fy` (in %) in `imgmeta.json`.
Prompts für noch fehlende Bilder: `docs/bild-prompts.md`.

## Platzhalter – vor dem Livegang ausfüllen

Werte in eckigen Klammern gelten als „nicht gesetzt“ (z. B. wird die Telefonnummer dann ausgeblendet).

- Telefon + `phoneHref`, WhatsApp-Nummer, Strasse (`scripts/content.mjs → SITE`)
- Name & Foto der Inhaberin (`TEAM`), echte Kundenbewertungen (`REVIEWS`)
- Instagram/Facebook (leer = ausgeblendet)
- Datenschutz: Hosting-Anbieter, medizinisch verantwortliche Person, UID im Impressum, Gebühr in den AGB

## Rechtliche Hinweise (Schweiz) – bitte prüfen lassen

- Botulinum ist verschreibungspflichtig: Publikumswerbung mit Preisen ist heikel. Genannt wird nur der Wirkstoff, keine Marke
  („Faltenrelaxing“), die Preise sollten trotzdem rechtlich geprüft werden.
- Die Preisliste nennt Filler-Produktnamen (z. B. Belotero, Juvéderm) – ebenfalls prüfen lassen.
- Keine Wirkversprechen, keine Vorher/Nachher-Bilder.
- Zahnbleaching mit höheren Peroxid-Konzentrationen ist Zahnärzt:innen vorbehalten.
