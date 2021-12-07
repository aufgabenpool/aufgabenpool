from lxml import etree

file_name = "../Data/quiz-pool-AUFGABENPOOL-20210728-0755.xml"
parser = etree.XMLParser(strip_cdata=False)
tree = etree.parse(file_name, parser)
root = tree.getroot()

for i, question in enumerate(root):
    question_string = etree.tostring(question, pretty_print=True)
    bp = 1337
