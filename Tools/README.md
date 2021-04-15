
## Werkzeuge

In diesem Ordner befinden sich Werkzeuge zur Migration von dezentral gewarteten Fragensammlungen (Moodle und Ilias) in diesen Aufgabenpool.

# Workflow (geplant)

!!Der hier beschriebene Ablauf ist WIP!! Die Tools sind (noch) hochgradig experimentell und sollten nur mit Vorsicht eingesetzt werden. Updates folgen in Kürze.

- Die Arbeitsgruppen verwalten ihre Fragensammlungen wie bisher denzentral in den LMS Moodle und Ilias. Dies ist essentiell für eine weiterhin reibungslose Einbindung in die Lehrveranstaltungen. Der Workflow ist so gestaltet, dass möglichst wenige Anpassungen in den Fragenbeständen vorgenommen werden müssen. Weiterhin wird Wert darauf gelegt, dass die Taxonomie im Laufe des Projekts laufend angepasst werden kann, ohne dass die Fragensammlungen in den LMS berührt werden müssen.
- Bestehende Aufgaben werden in den LMS mit (noch zu definiernden) Tags angereichert. Dazu gehört zum Beispiel der Status der Qualitätssicherung (Tag "getestet"), die geschätzte Bearbeitungszeit für die Aufgabe durch Studierende, der Schwierigkeitsgrad usw. Die Wahl der konkreten Tagnamen soll je Fragensammlung konistent sein. Bei der Einspielung in den hiesigen Aufgabenpool können Tags systematisch (tabellengesteuert) substituiert werden.
- Die Fragensammlungen werden nach größeren Änderungen aus Moodle/Ilias im Format Moodle-XML exportiert und in das Verzeichnis "Rohdaten/" abgelegt. Bisherige Tests zeigen, dass dieses Austauschformat von den großen LMS recht stabil unterstützt wird. Um den manuellen Aufwand gering zu halten, darf der gesamte Fragenbestand als einzelne Datei gespeichert werden (dies sind bei 1000 Fragen ca. 10 MB).
- Für die Migration in den hiesigen Pool steht das Python-Skript "conv.py" bereit. Der XML-Fragenextrakt wird geparsed, die einzelnen Fragen gefiltert und in die taxonimisch passenden Unterverzeichnisse des Ordners STACK/ geschrieben. Das Mapping der Taxonomie kann mittels der Datei "config-mapping.txt" konfiguiert werden. Hier wird definiert, wie die Fragenkagegorie aus dem Quellsystem (Moodle, Ilias) in die Zieltaxonomie übersetzt wird. Es wird eine Warnung ausgegeben, wenn Einträge fehlen. Weiterhin kann über "config.json" eine Filterung der Tags vorgenommen werden, sowie Tagnamen ersetzt werden (aktuell noch im Aufbau!).
