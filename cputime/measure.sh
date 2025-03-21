#!/bin/bash

CONV_PATHS=../converters/*
HERE=$(pwd)
OUTFILE=$HERE/output.txt

for CONV_PATH in $CONV_PATHS
do
    echo "Testing $CONV_PATH"
    docker build -t conv $CONV_PATH
    docker compose rm -f
    docker compose up -d

    cd ../test
    sleep 5
    echo $CONV_PATH >> $OUTFILE
    npx tsx $HERE/fetch.ts >> $OUTFILE
    npm start 2>> $OUTFILE
    npx tsx $HERE/fetch.ts >> $OUTFILE
    cd -

    docker compose kill
done
