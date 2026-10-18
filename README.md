# Liyas Lounge – Website (DE / EN)

Statische, zweisprachige Website für Liyas Lounge, Olten – Medizinische Ästhetik & Beauty.
Kein Build-Schritt nötig: reines HTML/CSS/JS.

## Struktur

```
/index.html                          → DE  Startseite (Standard, lang="de-CH")
/behandlungen/dermal-filler.html     → DE  Behandlungsseite
/en/index.html                       → EN  Homepage (lang="en")
/en/treatments/dermal-filler.html    → EN  Treatment page
/preise.html                         → DE  Preisliste (aus der Preisliste der Kundin, Okt. 2026)
/en/prices.html                      → EN  Price list
/docs/bild-prompts.md                → fertige ChatGPT-Prompts für alle Bilder
/assets/css/style.css                → gemeinsam für beide Sprachen
/assets/js/main.js                   → gemeinsam für beide Sprachen
/assets/img/                         → gemeinsame Bilder
```

## Design & Animationen

- Optik 1:1 nach dem Salon-Template: *Kaushan Script* für Headlines, Navigation und Footer-Links, *Manrope* 500
  für Text (18 px / 1.7), *Manrope* 700 für Pill-Buttons, *Inter* für kleine Labels.
- Farben: weisser Grund, Navy-Text `#19154e`, Espresso `#5b3a28` für Headlines, Karten und Footer.
- Transparenter Header mit weisser Schrift über dem Hero-Bild, beim Scrollen weiss.
- Aufbau: grosses Hero-Bild, Split-Sektion, Espresso-Karten (Bild bündig), Zickzack-Ablauf mit Linie,
  Kundenstimmen auf Foto, Galerie-Mosaik, Buchungs-CTA, Footer mit grossem Verlaufs-Schriftzug.
  Code komplett neu geschrieben, keine Template-Assets.
- Hero: Bild gleitet ein (100px, Fade) und zoomt von 1.2 auf 1; Headline wächst von 50 % und steigt auf (2 s).
- Parallax auf Bildern, Scroll-Reveal (100px), Ablauf-Linie füllt sich beim Scrollen, Header blendet beim Runterscrollen aus.
- `prefers-reduced-motion` schaltet alle Bewegungen ab. Kein Framework, keine externen Skripte.
- Schriften/Farben/Grössen zentral als CSS-Variablen in `assets/css/style.css`; Breakpoints wie im Template (1200 / 810).

## Sprache & Motiv

- Sprachumschalter „DE / EN“ im Header (neben dem Hell/Dunkel-Schalter), im mobilen Menü und in der Fusszeile.
  Aktive Sprache mit feiner goldener Linie. Er führt immer auf die **entsprechende** Seite der anderen Sprache.
- Das Motiv (hell/dunkel) bleibt beim Sprachwechsel erhalten: die Sprachlinks erhalten automatisch `?theme=…`,
  zusätzlich wird die Wahl in `localStorage` gespeichert.
- Priorität beim Laden: `?theme=light|dark` → gespeicherte Wahl → hell (Standard). Dunkel nur über den Schalter.
- Schriften liegen lokal in `assets/fonts` (keine Anfrage an Google, DSG/DSGVO-freundlich).

## Farbvarianten (Vorschau für die Kundin)

Unten links auf jeder Seite: Auswahl „Farbvariante“ zum direkten Vergleichen. Die Wahl bleibt beim Sprach- und
Seitenwechsel erhalten (wie das Hell/Dunkel-Motiv). Direktlinks: `?palette=noir` (Standard), `?palette=espresso`, `?palette=gold`, `?palette=rose`.

| Variante | Grund | Akzent / Karten & Footer |
|---|---|---|
| Espresso (Template) | Weiss `#ffffff`, Text Navy `#19154e` | Espresso `#5b3a28` |
| Gold & Creme | Creme `#f8f4ee`, Text `#2e2621` | Gold `#b08d57`, Karten `#2e2621` |
| **Schwarz & Gold (Standard, Logo-Farben)** | Weiss, Text `#1c1c1c` | Schwarz `#141414`, Gold `#c5a467` |
| Nude & Rosé | Nude `#fcf7f4`, Text `#3b2b2a` | Rosé-Braun `#8c5d56`, Akzent `#c9a27e` |
| Dunkel | `#120e0b` | Espresso `#3a2519`, Sand `#e8cfb6` |

Farben je Variante stehen in `assets/css/style.css` (Abschnitt „Colour variants“). Nach der Entscheidung:
gewünschte Werte als Standard in `:root` übernehmen und in `assets/js/main.js` `SHOW_PALETTE_PICKER = false` setzen.

## Bilder

Jeder Bildplatz hat einen eigenen Dateinamen in `assets/img/` (z. B. `hero.jpg`, `kategorie-medical.jpg`, `ablauf-1-beratung.jpg`).
Neues Bild unter dem gleichen Namen speichern – fertig. Prompts: `docs/bild-prompts.md`.

## SEO

- `hreflang` auf jeder Seite: `de-CH`, `en`, `x-default` (→ DE).
- Eigene Title/Description je Sprache, JSON-LD (`HealthAndBeautyBusiness`, `Service`, `BreadcrumbList`, `FAQPage`) in beiden Sprachen.
- Domain in `canonical`/`hreflang`/JSON-LD ist als `https://www.liyaslounge.ch` angenommen – vor dem Livegang prüfen.

## Vorschau

```
python3 -m http.server 8000
```

- http://localhost:8000/index.html?theme=light
- http://localhost:8000/index.html?theme=dark
- http://localhost:8000/en/index.html?theme=light
- http://localhost:8000/en/index.html?theme=dark
- http://localhost:8000/behandlungen/dermal-filler.html
- http://localhost:8000/en/treatments/dermal-filler.html

## Platzhalter (vor dem Livegang ersetzen)

Alle Platzhalter sind sichtbar gestrichelt-gold markiert (`class="ph"` bzw. `ph-img`) und in eckigen Klammern:

| DE | EN |
|---|---|
| `[Preis folgt]` | `[Price to follow]` |
| `[Platzhalter – echte Kundenstimme folgt]` | `[Placeholder – genuine review to follow]` |
| `[Bild folgt]`, `[Portrait folgt]`, `[Karte folgt]` | `[Image to follow]`, `[Portrait to follow]`, `[Map to follow]` |
| `[Name folgt]`, `[Strasse folgt]`, `[Telefon folgt]`, `[E-Mail folgt]` | `[Name to follow]`, `[Street to follow]`, … |
| `[Angaben zur ärztlichen Verantwortung ergänzen]` | `[Add details of medical responsibility]` |

Ausserdem: `tel:+41000000000`, `wa.me/41000000000`, `info@liyaslounge.ch`, Impressum/Datenschutz-Links und die JSON-LD-Felder in GROSSBUCHSTABEN.

## Inhaltliche Regeln

- Keine Wirkversprechen; Hinweis „Ergebnisse sind individuell“ bei medizinischen Behandlungen.
- Kein Markenname „Botox“ – DE: „Faltenrelaxing (Botulinum-Behandlung)“, EN: „Wrinkle relaxing (botulinum treatment)“.
- Beide Sprachversionen haben identischen Aufbau; neue Sektionen immer in beiden Dateien ergänzen.
