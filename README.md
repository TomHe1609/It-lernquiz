# It-lernquiz

Mobile, installierbare Lern-App für die Weiterbildung zum Berufsspezialisten Softwareentwicklung.

- 25 unveränderte Lernkapitel und **375 Single-Choice-Fragen**, jeweils 15 pro Kapitel.
- 100 ursprüngliche Fragen plus 275 neue Fragen mit Lösung, Erklärung und Hinweis.
- Grundlagen, praktische Entscheidungen, Fehleranalyse und Prüfungsvorbereitung.
- Kapiteltraining, Wissenmix, neue Fragen, Fehlerwiederholung und 20-Fragen-Prüfungssimulation mit anschließender Auswertung.
- Offline-Nutzung nach dem ersten erfolgreichen Laden; Fortschritt und Einstellungen bleiben lokal auf dem jeweiligen Gerät.

## Kompatibilität und Aktualisierung

Die bisherigen Fragen `q001` bis `q100`, ihre Antworten und alle Lerntexte bleiben unverändert. Neue IDs haben das Format `ch01-extra-01`. Der Speicherschlüssel `bssw_quiz_v1` und das Export-/Importformat mit `version: 1` bleiben erhalten. Bestehende Antworten und Einstellungen werden nicht zurückgesetzt.

Die Fortschrittsanzeigen und Kapitel-Filter verwenden die tatsächliche Fragenzahl. Vier bereits bearbeitete Fragen eines Kapitels zählen nach der Erweiterung als **4 von 15**. Ein kleinerer Prozentwert bedeutet daher keinen Verlust von Antworten.

Der Service Worker verwendet `it-lernquiz-offline-v2-375`, lädt den vollständigen App-Shell einschließlich der eingebetteten Fragen und entfernt beim Aktivieren alte App-Caches. Beim nächsten Online-Aufruf wird die Aktualisierung geladen; gegebenenfalls die App anschließend erneut öffnen. Ein laufender Quizdurchgang wird nicht durch einen erzwungenen Seitenreload unterbrochen. Lernfortschritt im localStorage ist vom Cache unabhängig.

## Fachliche Orientierung

Die neuen Fragen sind Lernaufgaben, keine offiziellen Prüfungsaufgaben. Die Quiz-Prüfungssimulation bleibt ein Lernmodus; die tatsächliche Prüfung umfasst situationsbezogene Aufgaben sowie Präsentation und Fachgespräch.

Primärquellen zur Prüfung und Weiterarbeit (geprüft am 10.10.2026):

- [SEFPrV: schriftliche Prüfung, § 6](https://www.gesetze-im-internet.de/sefprv/__6.html) und [mündliche Prüfung, § 7](https://www.gesetze-im-internet.de/sefprv/__7.html).
- [Offizieller Scrum Guide](https://scrumguides.org/download.html) für Verantwortlichkeiten, Events und Definition of Done.
- [BSI-Standard 200-4](https://www.bsi.bund.de/SharedDocs/Downloads/DE/BSI/Grundschutz/BSI_Standards/standard_200_4.pdf?__blob=publicationFile&v=8) für Business Continuity Management.
- [W3C WCAG Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/) für Barrierefreiheit.
- [DSGVO, amtliche EU-Veröffentlichung](https://eur-lex.europa.eu/eli/reg/2016/679/oj/deu) insbesondere Artikel 5 und 25.
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) für Passwortspeicherung.
- [PostgreSQL: Transaktionsisolation](https://www.postgresql.org/docs/current/transaction-iso.html) für Transaktionen und konkurrierende Zugriffe; konkrete Details sind produktspezifisch.
- [MDN Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) für Offline-Cache und Aktualisierung.
- [HTTP-Semantik, RFC 9110](https://www.rfc-editor.org/rfc/rfc9110) als weiterführende Protokollreferenz.

## Überprüfung

Die App benötigt weiterhin keinen Build und keine externen Laufzeitbibliotheken. Für den optionalen Browsertest Node.js und Playwright in einer separaten Testumgebung bereitstellen, beispielsweise mit `npm install --no-save playwright` und `npx playwright install chromium`. Anschließend:

```text
node tests/verify.cjs
```

Optional bestimmt `BROWSER_EXECUTABLE` den Pfad eines installierten Chromium-Browsers. `TEST_BASE_REF` bezeichnet die ursprüngliche Version (Standard: `db53955`; die Git-Historie muss verfügbar sein). `SCREENSHOT_DIR` und `REPORT_FILE` speichern optional Ansichten und Prüfergebnisse.

Der Test prüft Erhalt der Lerntexte und ursprünglichen Fragen, eindeutige IDs und Fragetexte, 15 Fragen je Kapitel, alle 375 Lösungsanzeigen, Trainingsmodi und Auswertung, vollständigen Fortschritt, alte Exporte, Mobil- und Querformatansichten, Offline-Beantwortung sowie ein echtes Upgrade des ursprünglichen Service Workers mit erhaltenem Lernstand. Er ersetzt keine unabhängige fachliche Begutachtung oder einen Test auf einem physischen iPhone.
