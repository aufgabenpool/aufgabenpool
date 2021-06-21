# ******************************************************************************
#  Moodle-XML Qustion Filter
#  (c) 2021 by TH Köln
#  Author: Andreas Schwenk, andreas.schwenk@th-koeln.de
# 
#  Version: 0.01
# ******************************************************************************

import os
import xml.etree.ElementTree as ET
import json
from datetime import datetime

# TODO: run puppeteer in batch (do NOT login for every question...)


# the following class code is taken from: https://dustinoprea.com/2019/01/22/python-parsing-xml-and-retaining-the-comments/
class _CommentedTreeBuilder(ET.TreeBuilder):
    def comment(self, data):
        self.start('!comment', {})
        self.data(data)
        self.end('!comment')


path_in = "../Rohdaten/quiz-pool-Differentialrechnung-20210617-1847.xml"  # TODO!!
path_out = "../Data/"

os.system("rm -rf " + path_out)
os.system("mkdir -p " + path_out)

metadata = {"exercises": [], "date": datetime.today().strftime('%Y-%m-%d %H:%M')}


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
        'importid': questionid,
        'id': questionIdx,
        'title': name,
        'tags': taglist,
        'category': current_category}
    )
    f = open(path_out + str(questionIdx) + ".xml", "w")
    questionStr = ET.tostring(question, encoding="unicode")
    f.write(questionStr)
    f.close()

    # get image
    moodleQuestionId = int(questionid[11:])
    cmd = 'node get_preview_img.js 2 ' + str(moodleQuestionId) + ' ' + '../Data/' + str(questionIdx) + '.png'
    os.system(cmd)

    questionIdx += 1

tagset.remove("")
metadata["tags-all"] = list(tagset)



with open("../Taxonomie/taxonomie.json") as f:
    tax = json.load(f)
    metadata["tags-maintopics"] = []
    metadata["tags-didactics"] = tax["didactics"]
    metadata["tags-content"] = tax["content"]
    metadata["tags-difficulty"] = tax["difficulty"]
    for maintopic in tax["maintopics"]:
        metadata["tags-maintopics"].append(maintopic)
        maintopic_tags = []
        for ex in metadata['exercises']:
            for tag in ex['tags']:
                if tag == maintopic:
                    continue
                if tag in tax['didactics']:
                    continue
                if tag in tax['content']:
                    continue
                if tag in tax['difficulty']:
                    continue
                if tag in tax['ignore']:
                    continue
                if tag not in maintopic_tags:
                    maintopic_tags.append(tag)
        metadata["tags-maintopic-" + maintopic] = maintopic_tags



metadata_json = json.dumps(metadata, indent=4)

print(metadata_json)

f = open(path_out + "meta.json", "w")
f.write(metadata_json)
f.close()

# remove image background
from shutil import which
if which('mogrify') is None:
    print("warning: imagemagick is not installed!")
else:
    os.system('cd ../Data/ && mogrify -format png -fill "#FFFFFF" -opaque "#E7F3F5" *.png')
