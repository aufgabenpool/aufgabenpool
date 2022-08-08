Start editor:
nohup ./index.sh &

Get process id of index.sh:
ps -e | grep index.sh

Get process id of index.js:
netstat -ltnp | grep -w ':3000'

Stop editor process (replace PID by process id number):
kill -9 PID_OF_INDEX_SH
kill -9 PID_OF_INDEX_JS
