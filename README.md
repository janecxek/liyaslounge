# Liyas Lounge – Website (DE / EN)

Statische, zweisprachige Website für Liyas Lounge, Olten – Medizinische Ästhetik & Beauty.
Kein Build-Schritt nötig: reines HTML/CSS/JS.

## Struktur

```
/index.html                          → DE  Startseite (Standard, lang="de-CH")
/behandlungen/dermal-filler.html     → DE  Behandlungsseite
/en/index.html                       → EN  Homepage (lang="en")
/en/treatments/dermal-filler.html    → EN  Treatment page
/assets/css/style.css                → gemeinsam für beide Sprachen
/assets/js/main.js                   → gemeinsam für beide Sprachen
/assets/img/                         → gemeinsame Bilder
```

## Sprache & Motiv

- Sprachumschalter „DE / EN“ im Header (neben dem Hell/Dunkel-Schalter), im mobilen Menü und in der Fusszeile.
  Aktive Sprache mit feiner goldener Linie. Er führt immer auf die **entsprechende** Seite der anderen Sprache.
- Das Motiv (hell/dunkel) bleibt beim Sprachwechsel erhalten: die Sprachlinks erhalten automatisch `?theme=…`,
  zusätzlich wird die Wahl in `localStorage` gespeichert.
- Priorität beim Laden: `?theme=light|dark` → gespeicherte Wahl → Systemeinstellung.

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
