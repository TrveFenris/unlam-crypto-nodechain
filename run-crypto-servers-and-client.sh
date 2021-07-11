#!/bin/bash

location="/Users/cmorales/Repositories/unlam-crypto-nodechain"
client_location="packages/client"
ports="1337,1338,1339"

IFS=',';for port in $ports
do
    if netstat -anp tcp|grep -q $port
    then 
        echo "netstat -anp tcp|grep -q $port [TRUE]"
    else
        osascript -e 'tell application "Terminal" to do script "cd '$location' && yarn start '$port'" '
        #open -a Terminal "`pwd`"
        #terminal -e yarn start $port
    fi
done

IFS='|'
if netstat -anp tcp|grep -q "127.0.0.1:3000" 
then
    echo "netstat -anp tcp|grep -q '127.0.0.1:3000' [TRUE]" 
else 
   echo export default [$ports] > $client_location/src/config/ports.js && yarn client start
fi