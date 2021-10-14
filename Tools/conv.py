# ******************************************************************************
#  Moodle-XML Qustion Filter
#  (c) 2021 by TH Köln
#  Author: Andreas Schwenk, andreas.schwenk@th-koeln.de
# 
#  Version: 0.01
# ******************************************************************************


# TODO: remove all unused taxonomy json files and other unused config files!!
# TODO: code doc of this file!


# dependencies:
#   pip3 install lxml

import os
import os.path
import json
import sys

from lxml import etree
from datetime import datetime

if len(sys.argv) != 3:
    print("usage: python3 conv.py INPUTPATH OUTPUTPATH")
    sys.exit(-1)

path_in = sys.argv[1]
path_out = sys.argv[2]

if not os.path.isfile(path_in):
    print("error: input path does not exist")
    sys.exit(-1)

os.system("mkdir -p " + path_out)

metadata = {
    "exercises": [], 
    "date": datetime.today().strftime('%Y-%m-%d %H:%M'),
    "topic_hierarchy": {"":""}
}

parser = etree.XMLParser(strip_cdata=False)
tree = etree.parse(path_in, parser)
quiz = tree.getroot()

tagset = {""}
questionid = ''
questionIdx = 0


class CriticalTag:
    def __init__(self):
        self.exerciseId = ""
        self.exerciseTitle = ""
        self.tag = ""
    def __str__(self):
        link = '<a href="https://sell.f07-its.fh-koeln.de/moodle/question/question.php?&courseid=2&id=' + str(self.exerciseId) + '" target="_blank">Link</a>'
        s = "Aufgabe: " + str(self.exerciseTitle) + " " + link + ", Tag: '" + str(self.tag) + "'"
        return s

criticalTags = []


def format_tag(tag):
    # replaces e.g. "TE:1:Differentialrechung" -> "te_1_Differentialrechnung"
    tag = tag.replace(":", "_")
    tag_tokens = tag.split("_")
    tag_new = ""
    for i, tk in enumerate(tag_tokens):
        if i < len(tag_tokens) - 1:
            tk = tk.lower()
        if len(tag_new) > 0:
            tag_new += "_"
        tag_new += tk
    return tag_new


for i, question in enumerate(quiz):
    if question.tag is etree.Comment:
        questionid = question.text
        questionid = int(questionid[11:].strip())
        continue
    t = question.attrib['type']
    if t == "category":
        current_category = question.find('category')[0].text
        continue
    questionStr = etree.tostring(question, encoding='unicode', pretty_print=True)
    questionStr = '<?xml version="1.0" encoding="UTF-8"?>\n<quiz>\n' + str(questionStr) + '\n</quiz>\n'
    questionType = question.attrib['type']
    if questionType == 'stack' and ('<type>checkbox</type>' in questionStr):
        questionType = 'stack-multichoice'
    #print(questionType)
    name = question.find('name')[0].text
    tested = False
    tags = question.find('tags')
    q_tagset = {""}
    if tags is not None:
        for tag in tags:
            tag_name = tag[0].text
            if "getestet" in tag_name:
                tested = True
            tag_formatted = format_tag(tag_name)
            q_tagset.add(tag_formatted)
            tagset.add(tag_formatted)

            # tag valid?
            if ("_" not in tag_formatted and tag_formatted not in ["getestet", "ungetestet"]) \
                or (tag_formatted.startswith("maier_") and tag_formatted.count("_") != 2) \
                or (tag_formatted.startswith("bloom_") and tag_formatted.count("_") != 1):
                ct = CriticalTag()
                ct.exerciseId = questionid
                ct.tag = tag_name
                criticalTags.append(ct)

    q_tagset.remove("")

    te1 = ""
    te2 = ""
    te3 = ""
    for tag in q_tagset:
        if tag.startswith("te_1_"):
            te1 = tag
        elif tag.startswith("te_2_"):
            te2 = tag
        elif tag.startswith("te_3_"):
            te3 = tag
    
    if len(te1) > 0:
        if te1 not in metadata["topic_hierarchy"]:
            metadata["topic_hierarchy"][te1] = {"":""}
        if len(te2) > 0:
            if te2 not in metadata["topic_hierarchy"][te1]:
                metadata["topic_hierarchy"][te1][te2] = {"":""}
            if len(te3) > 0:
                if te3 not in metadata["topic_hierarchy"][te1][te2]:
                    metadata["topic_hierarchy"][te1][te2][te3] = {}


    #if not tested:
    #    continue
    metadata['exercises'].append({
        'importid': questionid,
        'id': questionIdx,
        'title': name,
        'tags': list(q_tagset),
        'category': current_category,
        'type': questionType}
    )
    f = open(path_out + str(questionIdx) + ".xml", "w")
    f.write(questionStr)
    f.close()

    questionIdx += 1

tagset.remove("")
metadata["tags"] = list(tagset)


# remove empty tags
del metadata["topic_hierarchy"][""]
for t1 in metadata["topic_hierarchy"]:
    del metadata["topic_hierarchy"][t1][""]
    for t2 in metadata["topic_hierarchy"][t1]:
        del metadata["topic_hierarchy"][t1][t2][""]


# TODO: remove old src:
# with open("../Taxonomie/taxonomie.json") as f:
#     tax = json.load(f)
#     # TODO: crawl automatically from tax[..]
#     metadata["tags-maintopics"] = []
#     #metadata["tags-didactics"] = tax["didactics"]
#     #metadata["tags-content"] = tax["content"]
#     #metadata["tags-difficulty"] = tax["difficulty"]
#     #metadata["tags-status"] = tax["status"]
#     for maintopic in tax["maintopics"]:
#         metadata["tags-maintopics"].append(maintopic.lower())
#         maintopic_tags = []
#         for ex in metadata['exercises']:
#             for tag in ex['tags']:
#                 if tag == maintopic:
#                     continue
#                 if tag in tax['didactics']:  # TODO: crawl automatically from tax[..]
#                     continue
#                 if tag in tax['content']:
#                     continue
#                 if tag in tax['difficulty']:
#                     continue
#                 if tag in tax['ignore']:
#                     continue
#                 if tag not in maintopic_tags:
#                     maintopic_tags.append(tag.lower())
#         metadata["tags-maintopic-" + maintopic.lower()] = maintopic_tags



# write metadata to file
f = open(path_out + "meta.json", "w")
metadata_json = json.dumps(metadata, indent=4)
f.write(metadata_json)
f.close()

# write critical tags to file
f = open(path_out + "critical_tags.html", "w")
f.write("<!DOCTYPE html>\n")
f.write("<html>\n")
f.write("<head><meta charset=\"utf-8\"/><title>digifellow Aufgabenpool</title></head>\n")
f.write("<body>\n")
f.write("<h1>Potenziell fehlerhafte Tags</h1>\n")
f.write("Im Falle von fehlerhaften Auflistungen: ")
f.write("Mail an <a href=\"mailto:andreas.schwenk@th-koeln.de\">andreas.schwenk@th-koeln.de</a> senden!<br/><br/>\n")
f.write("ACHTUNG: Diese Liste wird automatisch nachts aktualisiert. ")
f.write(" In Moodle vorgenommene Änderungen werden also erst am <b>nächsten Tag</b> sichtbar!<br/>\n")
f.write("<ul>\n")
for ct in criticalTags:
    f.write("<li>")
    f.write(str(ct) + "<br/>\n")
    f.write("</li>")
f.write("</ul>\n")
f.write("</body>")
f.write("</html>")
f.close()
