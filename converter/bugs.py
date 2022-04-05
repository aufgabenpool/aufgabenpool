from datetime import datetime

html = '''
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><title>digifellow Aufgabenpool</title></head>
<body>
	<h1>Gemeldete Fehler</h1>
	#CONTENT
</body>
</html>
'''

f = open('../bugs/bugs.txt')
lines = f.readlines()
f.close()

content = '<ul>'
for line in lines:
    if len(line) == 0:
        continue
    tokens = line.split('#')
    if len(tokens) != 5:
        continue
    timestamp = tokens[0]
    moodleId = tokens[1]
    bugType = tokens[2]
    desc = tokens[3]
    contact = tokens[4]

    content += '<li>'
    content += datetime.utcfromtimestamp(int(timestamp)//1000).strftime('%Y-%m-%d %H:%M:%S')
    content += ', <a href="https://aufgabenpool.f07-its.fh-koeln.de/moodle/question/question.php?&courseid=2&id=' + str(moodleId) + '">Link (Moodle)</a>, '
    content += ' Fehlerbeschreibung: "' + desc + '", '
    content += ' Kontaktdaten: "' + contact + '" '
    content += '</li>'

content += '</ul>'

html = html.replace('#CONTENT', content)

f = open('../bugs/bugs.html', 'w')
f.write(html)
f.close()
