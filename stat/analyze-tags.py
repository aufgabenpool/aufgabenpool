# ******************************************************************************
#  Moodle-XML Question Filter
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

#if len(sys.argv) != 3:
#    print("usage: python3 conv.py INPUTPATH OUTPUTPATH")
#    sys.exit(-1)

warnings = ""

path_in = 'quiz-pool-AUFGABENPOOL-20220629-1500.xml'

parser = etree.XMLParser(strip_cdata=False)
tree = etree.parse(path_in, parser)
quiz = tree.getroot()

tagset = {""}
questionid = 0

num_questions = 0
num_hidden_questions = 0
num_te_1 = [0]*10
num_te_2 = [0]*10
num_te_3 = [0]*10

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

for i in range(1,20):
    id = 'type_' + str(i)
    tagset.add(id)

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

    num_questions += 1

    q_num_te_1 = 0
    q_num_te_2 = 0
    q_num_te_3 = 0

    print('')
    print('=== ' + name + ' ===')

    tested = False
    tags = question.find('tags')
    q_tagset = {""}
    if questionType == "stack":
        q_tagset.add('type_1')
    elif questionType == "truefalse":
        q_tagset.add('type_2')
    elif questionType == "multichoice":
        q_tagset.add('type_3')
    elif questionType == "stack-multichoice":
        q_tagset.add('type_4')
    elif questionType == "gapselect":
        q_tagset.add('type_5')
    else:
        warnings += "FRAGETYP '" + questionType + "' im Shopsystem noch nicht implementiert! "
    has_te_1_tag = False
    has_te_2_tag = False
    has_te_3_tag = False
    is_hidden = False
    if tags is not None:
        for tag in tags:
            tag_name = tag[0].text
            if "getestet" in tag_name:
                tested = True
            tag_formatted = format_tag(tag_name)

            if tag_formatted == "praxiserprobt":
                tag_formatted = "praxiserprobt_1"

            q_tagset.add(tag_formatted)
            tagset.add(tag_formatted)

            if tag_formatted.startswith("hidden"):
                tag_formatted = "hidden_1"
                is_hidden = True

            if tag_formatted.startswith("te_1_"):
                has_te_1_tag = True
                print(tag_formatted)
                q_num_te_1 += 1
            if tag_formatted.startswith("te_2_"):
                has_te_2_tag = True
                print(tag_formatted)
                q_num_te_2 += 1
            if tag_formatted.startswith("te_3_"):
                has_te_3_tag = True
                print(tag_formatted)
                q_num_te_3 += 1

    q_tagset.remove("")

    if is_hidden:
        print('*HIDDEN*')
        num_hidden_questions += 1

    num_te_1[q_num_te_1] += 1
    num_te_2[q_num_te_2] += 1
    num_te_3[q_num_te_3] += 1


print('\n')
print('\n')
print('ANZAHL AUFGABEN INSGESAMT:')
print(num_questions)
print('\n')
print('ANZAHL AUFGABEN VERSTECKT/HIDDEN:')
print(num_hidden_questions)
print('\n')
print('TE1:\n[Anzahl Aufgaben ohne TE1, Anzahl Aufgaben 1x TE1, Anzahl Aufgaben 2x TE1, ...]')
print(num_te_1)
print('')
print('TE2:\n[Anzahl Aufgaben ohne TE2, Anzahl Aufgaben 1x TE2, Anzahl Aufgaben 2x TE2, ...]')
print(num_te_2)
print('')
print('TE3:\n[Anzahl Aufgaben ohne TE3, Anzahl Aufgaben 1x TE3, Anzahl Aufgaben 2x TE3, ...]')
print(num_te_3)
print('')

tagset.remove("")
#metadata["tags"] = list(tagset)
