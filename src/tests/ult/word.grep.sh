#!/bin/sh
echo Grep for type words with line numbers
grep -n type\": tit_usfm.txt.json | grep word > word.grep.txt
echo Count: `wc -l word.grep.txt`