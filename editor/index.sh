#!/bin/bash
until node index.js >> edit-log.txt; do
  echo "=====Crashed with exit code $?.=====" >> edit-log.txt
  sleep 5
done
