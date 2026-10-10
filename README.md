# IT-Lernquiz für den aktuellen Lehrgang

Mobile PWA zur Weiterbildung zum Berufsspezialisten Softwareentwicklung: **10 Kursmodule, 34 Lerneinheiten und 475 Fragen mit Lösungen, Erklärungen und Hinweisen**.

Die Gliederung und sichtbaren Unterrichtsminuten folgen den sechs bereitgestellten Kursübersichten. Module 4–9 waren nur als Überschriften sichtbar; ihre ergänzenden Lerntexte orientieren sich an den offiziellen Qualifikationsschwerpunkten. Der ausgearbeitete Betrieb „Mittelland Logistik“ ist ausdrücklich eine eigene fiktive Übungsfallstudie. Die App ersetzt keine Originalkursunterlagen oder offiziellen Prüfungsaufgaben.

| Modul | Schwerpunkt | Einheiten |
| --- | --- | ---: |
| 0 | Prüfungs-Kickoff | 1 |
| 1 | Lern- und Arbeitsmethodik | 3 |
| 2 | Analysieren und Planen der Softwarearchitektur | 13 |
| 3 | Entwickeln von Softwarearchitekturen | 11 |
| 4 | Produktqualität | 1 |
| 5 | Software- und Anwenderdokumentation | 1 |
| 6 | Übergabe und Einführung | 1 |
| 7 | Evaluation und kontinuierliche Verbesserung | 1 |
| 8 | Organisatorische und rechtliche Vorgaben | 1 |
| 9 | Projektunterstützung und Koordination | 1 |

Alle Einheiten enthalten Lernziele, fachliche Erläuterungen, ein Praxisbeispiel und einen offenen Selbstcheck mit möglicher Lösung. Ergänzungen betreffen insbesondere Anforderungsgespräche, Kundenbedarf, arc42, Plattformwahl, SOLID, TDD, UML und Entwurfsmuster. 100 neue Fragen ergänzen die 375 bestehenden; die Verteilung richtet sich nach Themenumfang und vorhandenen Aufgaben (5–26 Fragen je Einheit).

## Funktionen und vorhandene Inhalte

- Themenquiz mit allen Fragen einer Einheit und sofortigen Erklärungen.
- Training eines ganzen Moduls, Wissenmix, neue Fragen und Fehlerwiederholung.
- Prüfungssimulation mit 20 Fragen: je 2–3 Fragen aus allen acht Fachmodulen 2–9; Rückmeldung erst am Ende. Kickoff und Lernmethodik bleiben im normalen Training verfügbar.
- Alle bisherigen 25 Lerntexte bleiben unverändert in „Grundlagen und Vorlagen“ und als passende Vertiefung im neuen Lernheft verfügbar.
- Alle bisherigen 375 Fragen behalten IDs, Texte, Optionen, Lösungen und Erklärungen. Nur die Zuordnung zur neuen Kursgliederung ändert sich.
- Offline-Nutzung, PWA-Installation, Auswertung, Schriftgröße und Farbschema bleiben erhalten.

Die tatsächliche schriftliche Prüfung nutzt situationsbezogene Aufgaben. Der Quizmodus ergänzt die Vorbereitung; freie Selbstchecks trainieren zusätzlich das Begründen und Bewerten.

## Fortschritt und Browserwechsel

Der Speicherschlüssel `bssw_quiz_v1` und das Exportformat `version: 1` bleiben erhalten. Bereits beantwortete Fragen werden anhand ihrer stabilen IDs den passenden neuen Einheiten zugeordnet. **15 bisher beantwortete Fragen zählen weiter als 15, jetzt von insgesamt 475.** Der Prozentwert kann sich dadurch verringern. Kurs-Abschlussmarkierungen aus den Bildern werden nicht als Quizantworten übernommen.

Lokale Browserspeicher werden nicht automatisch zwischen Browsern geteilt. Unter **Fortschritt → Fortschritt verwalten → Fortschritt sichern** den Stand als JSON-Datei speichern; im anderen Browser mit **Fortschritt importieren** übernehmen. Der Import ersetzt nach Bestätigung den dort vorhandenen Stand. Es gibt keine Anmeldung oder Online-Synchronisierung.

## Offline-Aktualisierung

Der Service Worker verwendet `it-lernquiz-offline-v3-course`. Lerntexte und Fragen sind in `index.html` eingebettet und benötigen keine zusätzlichen Netzabfragen. Bei Aktivierung werden ältere App-Caches entfernt; der separate lokale Lernstand bleibt bestehen. Beim nächsten Online-Aufruf wird die neue Version geladen. Gegebenenfalls die App danach erneut öffnen. Ein laufendes Quiz wird nicht durch einen erzwungenen Reload unterbrochen.

## Inhalte bearbeiten und prüfen

Die veröffentlichte App läuft ohne externe Bibliotheken oder Build-Schritt im Browser. Für die redaktionelle Erstellung genügt Node.js:

```text
node build-course.cjs
node tests/verify.cjs
```

`content/course.cjs` enthält Gliederung und Lerntexte, `course-questions.txt` die neuen Fragen, `question-routing.cjs` die Zuordnung vorhandener Fragen und `course-ui.js` die Kursansicht. `original-data.json` bewahrt den Ausgangsbestand. Der Builder erzeugt den eingebetteten Datenbestand und ist wiederholbar.

Der Test prüft alle 475 Lösungen und Ergebnisanzeigen in einer isolierten JavaScript-Umgebung, den unveränderten Originalbestand, den Erhalt eines alten Lernstands mit 15 Antworten, sämtliche Themen- und Modultrainings, Filter, 100 ausgewogene Prüfungsdurchgänge, Export und Import einschließlich Abbruch, Cache-Lebenszyklus, Offline-Fallback und reproduzierbare Erstellung. Sichtbare Browser- und Mobilprüfungen werden getrennt durchgeführt. Diese Prüfungen sind keine unabhängige fachliche Begutachtung und kein Test auf einem physischen iPhone.

## Primärquellen

Prüfung und fachliche Orientierung, geprüft am 10.10.2026:

- [Qualifikationsschwerpunkte, § 4 SEFPrV](https://www.gesetze-im-internet.de/sefprv/__4.html), [schriftliche Prüfung, § 6](https://www.gesetze-im-internet.de/sefprv/__6.html) und [mündliche Prüfung, § 7](https://www.gesetze-im-internet.de/sefprv/__7.html).
- [arc42: offizielle Strukturübersicht](https://arc42.org/overview/).
- [Agile Alliance: Test Driven Development](https://agilealliance.org/glossary/tdd/).
- [OWASP Application Security Verification Standard](https://owasp.org/projects/asvs).
- [Offizieller Scrum Guide](https://scrumguides.org/download.html).
- [DSGVO: amtliche EU-Veröffentlichung](https://eur-lex.europa.eu/eli/reg/2016/679/oj/deu).
- [W3C WCAG Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/).
- [HTTP-Semantik: RFC 9110](https://www.rfc-editor.org/rfc/rfc9110).
