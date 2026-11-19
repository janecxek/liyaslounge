# Liyas Lounge – notatki projektu

Strona: DE `/`, EN `/en`, FR `/fr` · build: `node scripts/build.mjs` (generuje wszystkie strony) · branch: `claude/vibrant-clarke-bzxc09` · każda zmiana = osobny PR do `main`.
Użytkownik pisze po polsku – odpowiadaj po polsku. Wiadomości do Liyi: po niemiecku, na „du”, krótko, na luzie, z tłumaczeniem na polski, w Szwajcarii „ss” zamiast „ß”, bez wykrzykników i bez emotek (użytkownik to mężczyzna – ma brzmieć profesjonalnie).

## ⚠️ Stałe przypomnienia – podkreślaj je użytkownikowi ZAWSZE na pomarańczowo (🟠) przy podsumowaniu zmian

- 🟠 AGB: Ausfallgebühr bei kurzfristiger Absage/Nichterscheinen bez kwoty ("kann eine Ausfallgebühr verrechnet werden") – zapytać Liyę o kwotę.

## Opinie
- Prawdziwe opinie z Google są w `REVIEWS` (`scripts/content.mjs`), wiernie przepisane, z linkiem `url` do każdej. EN/FR to tłumaczenia (oznaczone na stronie). Nowe opinie podaje użytkownik (Claude nie ma dostępu do Google).
- Opinia Silvii R. pomija się celowo – wymienia imię „Natalya” zamiast „Liya” (do wyjaśnienia z użytkownikiem).

## Impressum
- Inhaberin + e-mail są w `SITE.owner` / `SITE.email` (`scripts/content.mjs`), na wyraźne życzenie Liyi tylko w Impressum/Datenschutz. UID: brak.

## Ustalenia z briefu Liyi (Nov 2026)
- Strona bezosobowa („wir”), bez imienia Liyi. Zdjęcie konsultacji z nią w „Über uns” – na jej prośbę; zdjęcia zabiegów z nią (maseczka) zostają. Teksty strony głównej: `scripts/content.home.mjs`.
- Liya nie odbiera telefonów – tylko WhatsApp, Sprachnachricht, Instagram, rezerwacja online.
- Partnerzy: Çelik i Pixl Clinic – strona + Instagram + konsultacja przez WhatsApp Liyi; Lala Lashes i Aevum Longevity bezpośrednio (jej prośba „ohne mein Kontakt”).

## SimplyBook (tylko wygląd)
- Wygląd SimplyBooka zmieniamy wyłącznie przez CSS: panel › Individuelle Funktionen › Benutzerdefiniertes CSS. `simplybook/booking-pages.css` → zakładka „Booking pages CSS” (liyas.simplybook.it/v2), `simplybook/widget.css` → zakładka „Widget CSS” (kalendarz na /termin). Kod wklejony na górze pola, nad pustym szablonem.
- Widget na stronie: motyw `concise` + kolory w `SB_THEME` (`scripts/build-landing.mjs`).
- Nie zmieniamy usług, cen, kategorii, tekstów ani ustawień pracy Liyi – tylko design.

## Zasady treści
- Szwajcarski zakaz reklamy leków na receptę: nie pisać „Botox/Botulinum/BTA/Hyaluronidase/Hylase” → „Faltenbehandlung”, „Filler-Korrektur”.
- Brak zdjęć przed/po; część zdjęć to symbolowe/AI (zaznaczone w Impressum).
