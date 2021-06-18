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
import json


# https://dustinoprea.com/2019/01/22/python-parsing-xml-and-retaining-the-comments/
class _CommentedTreeBuilder(ET.TreeBuilder):
    def comment(self, data):
        self.start('!comment', {})
        self.data(data)
        self.end('!comment')


path_in = "Rohdaten/quiz-pool-Differentialrechnung-20210617-1847.xml"  # TODO!!
path_out = "Data/"

os.system("rm -rf " + path_out)
os.system("mkdir -p " + path_out)

metadata = {"exercises": []}


ctb = _CommentedTreeBuilder()
xp = ET.XMLParser(target=ctb)
tree = ET.parse(path_in, parser=xp)

quiz = tree.getroot()

tagset = {""}

questionid = ''

questionIdx = 0

for i, question in enumerate(quiz):

    if question.tag == '!comment':
        questionid = question.text
        continue

    t = question.attrib['type']
    if t == "category":
        current_category = question.find('category')[0].text
        continue
    name = question.find('name')[0].text
    tested = False
    tags = question.find('tags')
    taglist = []
    if tags is not None:
        for tag in tags:
            tag_name = tag[0].text
            if "getestet" in tag_name:
                tested = True
            taglist.append(tag_name)
            tagset.add(tag_name)
    if not tested:
        continue
    metadata['exercises'].append({
        'importid':questionid,
        'id':questionIdx,
        'title':name,
        'tags':taglist,
        'category':current_category}
    )

    f = open(path_out + str(questionIdx) + ".xml", "w")
    questionStr = ET.tostring(question, encoding="unicode")
    f.write(questionStr)
    f.close()

    questionIdx += 1

tagset.remove("")
metadata["tags"] = list(tagset)

metadata_json = json.dumps(metadata, indent=4)

print(metadata_json)

f = open(path_out + "meta.json", "w")
f.write(metadata_json)
f.close()
