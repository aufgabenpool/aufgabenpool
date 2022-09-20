# ******************************************************************************
#  Moodle Question Extraction
#  (c) 2021 by TH Köln
#  Author: Andreas Schwenk, andreas.schwenk@th-koeln.de
#
#  Version: 0.01
# ******************************************************************************

# This file updates the pool database (source: Moodle 4), creates screenshots
# as preview images, ...

import os
import sys
import glob
import time
from shutil import which

print('Moodle Question Extractor - Author: Andreas Schwenk / TH Köln')

skip_screenshots = '-noscreenshots' in sys.argv

# 0.) Delete "../data-tmp/"
print("removing directory '../data-tmp/'")
os.system("rm -rf ../data-tmp/")
os.system("mkdir -p ../data-tmp/")

# 1.) Download question pool as moodle-xml file
print("downloading question pool from moodle")
x = os.system('node download_pool.js')
if x != 0:
    print('ERROR: failed to get question pool as moodle-xml file.')
    sys.exit(-1)
moodle_xml_files = glob.glob("../data-tmp/*.xml")
moodle_xml_path = max(moodle_xml_files, key=os.path.getctime)  # get newest file

# 2.) create meta.json + an xml-file for each question
print("extracting metadata from moodle-xml")
x = os.system('python3 conv.py ' + moodle_xml_path + ' ../data-tmp/')
if x != 0:
    print('ERROR: failed to convert question pool')
    sys.exit(-1)

# wait a second...
time.sleep(1)

# 3.) create screenshots as preview
print("creating screenshots")
if not skip_screenshots:
    x = os.system('node get_preview_img_batch.js')
    if x != 0:
        print('ERROR: failed to get preview images')
        sys.exit(-1)

# 4.) Replace current "../data/" directory. This is done only in case no error occurred. Otherwise, the old version remains
print("moving directory '../data-tmp' to '../data'")
os.system("rm -rf ../data/")
os.system("mv ../data-tmp ../data")

# Convert bug list to HTML
os.system('python3 bugs.py')

print('..extraction finished')
