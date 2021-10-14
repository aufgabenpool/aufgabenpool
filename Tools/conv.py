# ******************************************************************************
#  Moodle-XML Qustion Filter
#  (c) 2021 by TH Köln
#  Author: Andreas Schwenk, andreas.schwenk@th-koeln.de
# 
#  Version: 0.01
# ******************************************************************************

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
#path_in = "../Data/quiz-pool-AUFGABENPOOL-20210728-0755.xml"
path_out = sys.argv[2]
#path_out = "../Data-tmp/"

if not os.path.isfile(path_in):
    print("error: input path does not exist")
    sys.exit(-1)

os.system("mkdir -p " + path_out)

metadata = {"exercises": [], "date": datetime.today().strftime('%Y-%m-%d %H:%M')}


parser = etree.XMLParser(strip_cdata=False)
tree = etree.parse(path_in, parser)
quiz = tree.getroot()


tagset = {""}

questionid = ''

questionIdx = 0

metadata["topic_hierarchy"] = {"":""}

for i, question in enumerate(quiz):
    if question.tag is etree.Comment:
        questionid = question.text
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
            q_tagset.add(tag_name.replace(":","_").lower())
            tagset.add(tag_name.replace(":","_").lower())
    q_tagset.remove("")

    te1 = ""
    te2 = ""
    te3 = ""
    for tag in tagset:
        if tag.startswith("te_1_"):
            te1 = tag
        elif tag.startswith("te_2_"):
            te2 = tag
        elif tag.startswith("te_3_"):
            te3 = tag
            #metadata["topic_hierarchy"][tag] = {"":""}
    
    xxx
    if len(te1) > 0 and te1 not in metadata["topic_hierarchy"]:
        metadata["topic_hierarchy"][te1] = {"":""}
        if len(te2) > 0 and te2 not in metadata["topic_hierarchy"][te1]:
            metadata["topic_hierarchy"][te1][te2] = {"":""}


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
metadata["tags-all"] = list(tagset)



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




metadata_json = json.dumps(metadata, indent=4)

#print(metadata_json)

f = open(path_out + "meta.json", "w")
f.write(metadata_json)
f.close()
