#!/bin/bash
trap "exit" INT

echo "###########################################"
echo "##                AtomBot                ##"
echo "###########################################"

while true
do
node app.js
echo "AtomBot is crashed!"
echo "Rebooting in:"
for i in {3..1}
do
echo "$i..."
done
echo "##########################################"
echo "#       AtomBot is restarting now        #"
echo "##########################################"
done