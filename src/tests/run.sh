#!/bin/sh
NX="node --experimental-modules"

for d in Lexicon tN tQ
do
    echo $d Tests
    cd ./$d
    for i in `ls *mjs`
    do 
        $NX $i
    done
    cd ..
done
