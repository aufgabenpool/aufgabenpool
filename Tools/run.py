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

skip_screenshots = '-noscreenshots' in sys.argv

# 0.) Delete "../Data-tmp/"
print("removing directory '../Data-tmp/'")
os.system("rm -rf ../Data-tmp/")
os.system("mkdir -p ../Data-tmp/")

# 1.) Download question pool as moodle-xml file
print("downloading question pool from moodle")
x = os.system('node download_pool.js')
if x != 0:
    print('ERROR: failed to get question pool as moodle-xml file.')
    sys.exit(-1)
moodle_xml_files = glob.glob("../Data-tmp/*.xml")
moodle_xml_path = max(moodle_xml_files, key=os.path.getctime)  # get newest file

# 2.) create meta.json + an xml-file for each question
print("extracting metadata from moodle-xml")
x = os.system('python3 conv.py ' + moodle_xml_path + ' ../Data-tmp/')
if x != 0:
    print('ERROR: failed to convert question pool')
    sys.exit(-1)

# 3.) create screenshots as preview
print("creating screenshots")
if not skip_screenshots:
    x = os.system('node get_preview_img_batch.js')
    if x != 0:
        print('ERROR: failed to get preview images')
        sys.exit(-1)

# 4.) postprocess screenshots (set background color transparent)
#print("postprocessing screenshots")
#if not skip_screenshots:
#    if which('mogrify') is None:
#        print("warning: imagemagick is not installed!")
#    else:
#        os.system('cd ../Data-tmp/ && mogrify -format png -fill "#FFFFFF" -opaque "#E7F3F5" *.png')

# 5.) Replace current "../Data/" directory. This is done only in case no error occourred. Otherwise, the old version remains
print("moving directoy '../Data-tmp' to '../Data'")
os.system("rm -rf ../Data/")
os.system("mv ../Data-tmp ../Data")

print('..extraction finished')
