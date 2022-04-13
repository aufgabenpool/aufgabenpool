#!bin/bash
git pull
npm run build
./fix-chown.sh
