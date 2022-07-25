#!/bin/bash

# TODO: also check if node, python3, ... is installed
if ! command -v tsc &> /dev/null
then
	echo "Error: Typescript is not installed! Please run e.g.:"
	echo "sudo npm install -g typescript"
	exit -1
fi

cd Tools
npm install
pip3 install lxml
echo "if you like screenshots with white background color then run 'sudo apt install imagemagick' manually"
cd ..

npm install
npm run build
