# ******************************************************************************
#  Moodle-XML Qustion Filter
#  (c) 2021 by TH Köln
#  Author: Andreas Schwenk, andreas.schwenk@th-koeln.de
# 
#  Version: 0.01
# ******************************************************************************

import sys
import os
import xml.etree.ElementTree as ET
import pprint

path_in = "Rohdaten/quiz- -top-20210408-0830.xml"
path_out = "STACK/"

mapping = dict()

mapping_path = "Tools/config-mapping.txt"
f_in = open(mapping_path, "r")
lines = f_in.readlines()
src = ''
for line in lines:
    line = line[:-1] # remove "\n"
    if line.startswith('#'):
        continue
    if len(line) == 0:
        continue
    if line.startswith('\t') == False and line.startswith('    ') == False:
        src = line.strip()
    else:
        mapping[src] = line.strip()
f_in.close()

pprint.pprint(mapping)


questionTypes = []

tree = ET.parse(path_in)
quiz = tree.getroot()

filtered = dict() # filtered by category; only contains tested questions
current_category = ''

for i, question in enumerate(quiz):
    t = question.attrib['type']
    if t not in questionTypes:
        questionTypes.append(t)
    if t == "category":
        current_category = question.find('category')[0].text
        continue
    name = question.find('name')[0].text
    tested = False
    tags = question.find('tags')
    if tags is not None:
        for tag in tags:
            tag_name = tag[0].text
            if "getestet" in tag_name:
                tested = True
    if not tested:
        continue

    print(current_category)
    print(name)

    if current_category not in filtered:
        filtered[current_category] = []
    filtered[current_category].append(question)

print(questionTypes)

for category, questions in filtered.items():
    if category not in mapping:
        print('Warning: no mapping defined for "' + category + '". CATEGORY IS NOT EXPORTED! Must update file "config-mapping.txt"')
        continue

    category_output = '<?xml version="1.0" encoding="UTF-8"?>\n<quiz>\n'
    for question in questions:
        s = ET.tostring(question, encoding='unicode', method='xml')
        category_output += s + '\n'
    category_output += '</quiz>\n'

    path_out += mapping[category] + '.xml'
    out_path_dir = os.path.dirname(path_out)
    os.system('mkdir -p ' + out_path_dir)
    f = open(path_out, "w")
    f.write(category_output)
    f.close()

