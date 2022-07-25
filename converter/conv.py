# ******************************************************************************
#  Moodle-XML Question Filter
#  (c) 2021-2022 by TH Köln
#  Author: Andreas Schwenk, andreas.schwenk@th-koeln.de
#  Dependencies: pip3 install lxml
#  Version: 0.02
# ******************************************************************************

# This file converters the Moodle question database (format Moodle-XML)
# into a JSON file that contains all metadata to be displayed on the website.

# Also a Moodle-XML file is written for each question (including questions that
# are currently hidden).

# 2022-07-08: This file does NOT check, if data is semantically valid
# (e.g. if tags are valid). Checking is now done in the tag-editor.

import os
import os.path
import json
import sys

from lxml import etree
from datetime import datetime

# read arguments: INPUT_PATH := moodle XML file, OUTPUT_PATH := directory where
# "meta.json" and moodle-XML files (one for each exercises) are written.
if len(sys.argv) != 3:
    print("usage: python3 conv.py INPUT_PATH OUTPUT_PATH")
    sys.exit(-1)

# get input and output path from arguments
path_in = sys.argv[1]
if not os.path.isfile(path_in):
    print("error: input path does not exist")
    sys.exit(-1)
path_out = sys.argv[2]

# create output path (if not exists)
os.system("mkdir -p " + path_out)

# warning string (displayed after conversion)
warnings = ""

# contents of output JSON-file
metadata = {
    # list of questions
    "exercises": [],
    # current date-time
    "date": datetime.today().strftime('%Y-%m-%d %H:%M'),
    # tree representation of topic level 1, 2, 3
    "topic_hierarchy": {"":""},
    # number of occurrences for each tag
    "tag_count": {},
    # textual description for each taxonomy entry
    "taxonomy_desc": {},
    # all question IDs, including currently unused
    "all_exercise_ids": []
}

# initialize XML-parser
parser = etree.XMLParser(strip_cdata=False)
tree = etree.parse(path_in, parser)
quiz = tree.getroot()

# format tag
def format_tag(tag):
    # replaces e.g. "TE:1:Differentialrechung" -> "te_1_Differentialrechnung"
    tag = tag.replace(":", "_")
    tag_tokens = tag.split("_")
    tag_new = ""
    for i, tk in enumerate(tag_tokens):
        if i < len(tag_tokens) - 1:
            tk = tk.lower()
        elif tag.startswith("te_"):
            tk = tk.capitalize()
        if len(tag_new) > 0:
            tag_new += "_"
        tag_new += tk
    return tag_new

# initialize set that contains all tags
tagset = {""}
for i in range(1,20):
    id = 'type_' + str(i)
    tagset.add(id)
    metadata["tag_count"][id] = 0

# convert all questions
questionid = 0
category = ''

for i, question in enumerate(quiz):
    if question.tag is etree.Comment:
        questionid = question.text
        questionid = int(questionid[11:].strip())
        continue
    if question.attrib['type'] == "category":
        category = question.find('category')[0].text
        continue

    metadata["all_exercise_ids"].append(questionid)

    # get question string = Moodle-XML data of question as string
    questionStr = etree.tostring(question, encoding='unicode', pretty_print=True)
    questionStr = '<?xml version="1.0" encoding="UTF-8"?>\n<quiz>\n' + str(questionStr) + '\n</quiz>\n'

    # write question file (Moodle-XML) - this is also done for exercises that are
    # currently NOT active, so that preview-screenshots are taken
    f = open(path_out + str(questionid) + ".xml", "w")
    f.write(questionStr)
    f.close()

    # get question type (e.g. "stack", ...)
    questionType = question.attrib['type']
    if questionType == 'stack' and ('<type>checkbox</type>' in questionStr):
        questionType = 'stack-multichoice'

    # get question title
    questionTitle = question.find('name')[0].text
    questionTags = question.find('tags')

    outputTags = {""}

    if questionType == "stack":
        outputTags.add('type_1')
    elif questionType == "truefalse":
        outputTags.add('type_2')
    elif questionType == "multichoice":
        outputTags.add('type_3')
    elif questionType == "stack-multichoice":
        outputTags.add('type_4')
    elif questionType == "gapselect":
        outputTags.add('type_5')
    else:
        warnings += "FRAGE-TYP '" + questionType + "' im Shopsystem noch nicht implementiert! "

    has_te_1_tag = False
    has_te_2_tag = False
    has_te_3_tag = False

    has_bloom = False
    has_maier = [False, False, False, False, False, False, False]

    is_hidden = False

    if questionTags is not None:
        for tag in questionTags:
            tag_name = tag[0].text

            tag_formatted = format_tag(tag_name)

            if tag_formatted == "praxiserprobt":
                tag_formatted = "praxiserprobt_1"

            outputTags.add(tag_formatted)

            if tag_formatted.startswith("hidden"):
                tag_formatted = "hidden_1"
                is_hidden = True

            if tag_formatted.startswith("te_1_"):
                has_te_1_tag = True
            if tag_formatted.startswith("te_2_"):
                has_te_2_tag = True
            if tag_formatted.startswith("te_3_"):
                has_te_3_tag = True

            for kk in range(0, 6):
                if tag_formatted.startswith("bloom_" + str(kk+1)):
                    has_bloom = True
            for kk in range(0, 7):
                if tag_formatted.startswith("maier_" + str(kk+1) + "_"):
                    has_maier[kk] = True

    # remove empty tag (if present)
    outputTags.remove("")

    # skip question if it is not tagged correctly.
    # also skip, if the question is "hidden"
    if is_hidden or has_te_1_tag == False:
        continue
    if has_bloom == False:
        continue
    for kk in range(0, 7):
        if has_maier[kk] == False:
            continue

    # get topic hierarchy tags for each level 1, 2, 3
    te1 = '' # there is exactly one tag of topic level 1
    te2 = '' # there is exactly one tag of topic level 2
    te3 = [] # there is at least one tag of topic level 3
    for tag in outputTags:
        if tag.startswith("te_1_"):
            te1 = tag
        elif tag.startswith("te_2_"):
            te2 = tag
        elif tag.startswith("te_3_"):
            te3.append(tag)

    # Reconstruct topic hierarchy. This is unambiguously,
    # since there is exactly one tag of topic level 1 and only one tag of topic level 2
    if te1 not in metadata["topic_hierarchy"]:
        metadata["topic_hierarchy"][te1] = {"":""}
    if te2 not in metadata["topic_hierarchy"][te1]:
        metadata["topic_hierarchy"][te1][te2] = {"":""}
    for te3_ in te3:
        if te3_ not in metadata["topic_hierarchy"][te1][te2]:
            metadata["topic_hierarchy"][te1][te2][te3_] = {}

    # add question to meta data
    metadata['exercises'].append({
        'id': questionid,
        'title': questionTitle,
        'tags': list(outputTags),
        'category': category,
        'type': questionType}
    )

    # add question tags to global tagset
    for tag in outputTags:
        tagset.add(tag)
        if tag not in metadata["tag_count"]:
            metadata["tag_count"][tag] = 0
        metadata["tag_count"][tag] += 1

# remove empty tag of taglist (if present)
tagset.remove("")

# remove empty tags
del metadata["topic_hierarchy"][""]
for t1 in metadata["topic_hierarchy"]:
    del metadata["topic_hierarchy"][t1][""]
    for t2 in metadata["topic_hierarchy"][t1]:
        del metadata["topic_hierarchy"][t1][t2][""]

# import taxonomy
f = open("../taxonomy/taxonomy.json", "r")
tax_json = json.load(f)
metadata["taxonomy"] = tax_json["taxonomy"]
metadata["taxonomy_urls"] = tax_json["taxonomy_urls"]
f.close()

# parse taxonomy descriptions
f = open("../taxonomy/taxonomy-desc.txt", "r")
lines = f.readlines()
f.close()
tag = ""
for line in lines:
    line = line[:-1] # remove "\n"
    if line.startswith("#") or len(line) == 0:
        continue
    elif line.startswith("@"):
        tokens = line.split("#")
        tag = tokens[0][1:].strip().lower().replace(":","_")
    else:
        tag_desc = line
        metadata["taxonomy_desc"][tag] = tag_desc

# write metadata to file
f = open(path_out + "meta.json", "w")
metadata["all_exercise_ids"].sort()
metadata_json = json.dumps(metadata, indent=4)
f.write(metadata_json)
f.close()
