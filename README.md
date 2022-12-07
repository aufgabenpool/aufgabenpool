# Digitaler Aufgabenpool Mathematik

> gefördert durch "Fellowships für Innovationen in der digitalen Hochschullehre (digiFellow)"

In diesem Repository wird die Implementierung des unter [https://aufgabenpool.th-koeln.de](https://aufgabenpool.th-koeln.de) abrufbaren Aufgabenpools gehostet.
Grundsätzlich lässt sich die Umsetzung des Aufgabenpools auch in anderen Kontexten einsetzen. Am Ende dieser Reademe-Datei findet man dazu einige Hinweise.

## Team an der TH Köln

-   Fakultät 04: Prof. Dr. Jan-Philipp Schmidt
-   Fakultät 07: Prof. Dr. Heiko Knospe, Wiss. Mitarbeiter\*innen Patricia Graf, M.Sc. und Andreas Schwenk, M.Sc.
-   Fakultät 09: Prof. Dr. Angela Schmitz, Wiss. Mitarbeiter Jan Reißner, M.Sc.

## Über dieses Repository

Die folgende Tabelle gibt eine Übersicht über die Inhalte dieses Repositories.
In einigen Unterverzeichnissen findet man Reademe-Dateien mit weiteren Informationen.

Als Entwicklungsumgebung wird `Visual Studio Code (VS Code)` verwendet. Konfigurationsdateien, sowie zur Installation empfohlene Extensions stehen für diese IDE in diesem Repository zur Verfügung. Für die Kompilation der Sourcen ist jedoch keine Entwickldungsumgebung nötig (kommandozeilenbasiert).

| Pfad                 | Beschreibung                                                 |
| -------------------- | ------------------------------------------------------------ |
| `.vscode`            | Visual Studio Code Konfigurationsdateien                     |
| `bugs/`              | Melden User Bugs im Shop, so werden diese hier               |
|                      | (stündlich aktualisiert) als HTML-Datei ausgegeben           |
| `build/`             | JavaScript Clientcode für den Shop (kompiliert)              |
| `converter/`         | Skripte zur Aktualisierung der Shop-Aufgabendatenbank        |
|                      | inklusive der Erstellung von Vorschaubildern                 |
| `doc/`               | In der Webseite eingebunden Dokumente                        |
| `editor/`            | Tagging-Editor                                               |
| `help/`              | Anleitung zur Nutzung des Pools / Hinzufügen neuer Fragen    |
| `img/`               | Bilddateien (Logo, Icons, ...)                               |
| `node_modules/`      | NPM-Abhängigkeiten (nicht synchronisiert)                    |
| `src/`               | TypeScript Clientcode                                        |
| `taxonomy/`          | Taxonomiebeschreibungstexte zur Darstellung auf der Webseite |
| `testdata/`          | Testdaten                                                    |
| `*.php`              | Aufgabenshop Webseite                                        |
| `build.js`           | Skript zur Übersetzung des JavaScript Client Codes des       |
|                      | Aufgabenshops                                                |
| `build.sh`           | Bash-Skript zum Start von `build.js`                         |
| `package.json`       | `npm` Konfigurationsdatei                                    |
| `update-repo.sh`     | Skript zum Pullen des hiesigen Repos inkl.                   |
|                      | Update der Berechtigungungen auf den User `www-data`         |
| `update-database.sh` | Aktualisiert die Fragendatenbank des Shops.                  |
| `tsconfig.json`      | TypeScript Konfigurationsdatei                               |
| `.prettierrc`        | Konfigurationsdatei zur Codeformatierung                     |

## Abhängigkeiten

Die folgenden Abhängigkeiten müssen installiert sein. Die Instanz unter [https://aufgabenpool.th-koeln.de](https://aufgabenpool.th-koeln.de) nutzt Debian 11 als Betriebssystem.

-   Moodle 4 (Moodle 3 wird _nicht_ unterstützt!)
-   Apache 2 (oder ein anderer Webserver)
-   Python 3
-   Node JS (Achtung: Debian installiert per Default alte Version)

Das Skript `install.sh` installiert die NPM-Pakete für die Unterverzeichnisse `/`, `/editor/` und `/converter/`.

## Services

Das Skript `update-repo.sh` sollte (mit Root-Rechten) regelmäßig aufgerufen werden, um die Fragendatenbank des Pool zu aktualisieren.

> Beispiel mit `crontab`:

```
0 * * * * cd /var/www/html/pool && ./update-database.sh > /root/pool-update-log.txt
```
