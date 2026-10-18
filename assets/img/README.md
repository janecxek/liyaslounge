# Bilder

Bilder werden mit `python3 scripts/add-image.py <quelle.png> <name>` hinzugefügt (WebP in mehreren Breiten, JPG,
Vorschau) und in `scripts/imgmeta.json` eingetragen. Welche Bilder wo erscheinen, steht in `scripts/content.mjs`
(`image` pro Behandlung, `HOME` für Hero, Studio und Kontakt). Prompts für fehlende Bilder: `docs/bild-prompts.md`.
