
## Werkzeuge

In diesem Ordner befinden sich Werkzeuge zur Migration von dezentral gewarteten Fragensammlungen aus Moodle und Ilias in den Aufgabenpool.

# Workflow (geplant)

Hier hier beschriebene Ablauf ist WIP. 

- Die Arbeitsgruppen verwalten ihre Fragensammlungen wie bisher denzentral in den LMS Moodle und Ilias. Dies ist essentiell für die weiterhin reibungslose Nutzung in den Lehrveranstaltungen. Der Workflow ist so gestaltet, dass möglichst wenige Anpassungen im Fragenbestand vorgenommen werden müssen. Weiterhin wird Wert darauf gelegt, dass die Taxonomie im Laufe des Projekts anpasst werden kann, ohne dass die Fragensammlungen in den LMS berührt werden müssen.
- Bestehende Aufgaben werden in den LMS mit (noch zu definiernden) Tags angereichert. Dazu gehört zum Beispiel der Status der Qualitätssicherung (Tag "getestet"), die geschätzte Bearbeitungszeit für die Aufgabe, der Schwierigkeitsgrad usw. Die Wahl der konkreten Tagnamen soll je Fragensammlung in sich konistent sein. Bei Einspielung in den hiesigen Aufgabenpool können Tags systematisch (tabellengesteuert) substituiert werden.
- Die Fragensammlungen werden zyklisch (bzw. nach größeren Änderungen) im Format Moodle-XML extrahiert. Bisherige Tests zeigen, dass dieses Austauschformat von den großen LMS recht stabil unterstützt wird. Um den manuellen Aufwand gering zu halten, darf der gesamte Fragenbestand als einzelne Datei exportiert werden.
- Für die Migration in den hiesigen Pool steht das Python-Skript "conv.py" bereit. Der XML-Fragenextrakt wird geparsed, die einzelnen Fragen gefiltert und in die taxonimisch passenden Unterverzeichnisse des Ordners STACK/ geschrieben. Das Mapping der Taxonomie kann mittels der Datei "config-mapping.txt" konfiguiert werden. Hier wird definiert, wie die Fragenkagegorie aus dem Quellsystem (Moodle, Ilias) in die Zieltaxonomie übersetzt wird. Es wird eine Warnung ausgegeben, wenn Einträge fehlen. Weiterhin kann über "config.json" eine Filterung der Tags vorgenommen werden, sowie Tagnamen ersetzt werden (aktuell noch im Aufbau!).
