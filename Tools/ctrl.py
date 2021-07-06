# ******************************************************************************
#  Moodle Question Extraction
#  (c) 2021 by TH Köln
#  Author: Andreas Schwenk, andreas.schwenk@th-koeln.de
# 
#  Version: 0.01
# ******************************************************************************

import os
import sys
import glob
from shutil import which

print('Moodle Question Extractor - Author: Andreas Schwenk / TH Köln')

# 1.) Download question pool as moodle-xml file
x = os.system('node download_pool.js')
if x != 0:
    print('ERROR: failed to get question pool as moodle-xml file. using old file!')
moodle_xml_files = glob.glob("../Rohdaten/*.xml")
moodle_xml_path = max(moodle_xml_files, key=os.path.getctime)  # get newest file

# 2.) create meta.json + an xml-file for each question
x = os.system('python3 conv.py ' + moodle_xml_path)
if x != 0:
    print('ERROR: failed to convert question pool')
    sys.exit(-1)

# 3.) create screenshots as preview
x = os.system('node get_preview_img_batch.js')
if x != 0:
    print('ERROR: failed to get preview images')

# 4.) postprocess screenshots (set background color transparent)
if which('mogrify') is None:
   print("warning: imagemagick is not installed!")
else:
   os.system('cd ../Data/ && mogrify -format png -fill "#FFFFFF" -opaque "#E7F3F5" *.png')

print('..extration finished')
