# Using files to test work counts

In order to use command line JavaScript with node and modules, 
I copy the `src/core/wordCounts.js` to this folder with an `.mjs`
extension. Run `sh setup.sh` to do this.

If you make any changes to `wordCounts.mjs` and you want "install"
them, then copy the local copy back to `src/core/wordCounts.js`.
You can use `sh install.sh` to copy it back.

Given a test input file `h0835.md`, then the tester is named 
`h0835.mjs`. The tests are run from the shell script: `sh run.sh`.

A list of all words in the order found are written to `h0835.md.allwords.txt`. Each word is on a new line; so the number of lines is the number of words found in the raw text. This can be used to manually verify the counts. This is done by reading the list of words and comparing with the raw text input.

So if the input file is "x", then there will be three files:
- `x` being the test input file
- `x.mjs` being the test code
- `x.allwords.txt` being the list of words found in occurence order.

## Run the test script

Example:

```
$ sh run.sh
(node:7216) ExperimentalWarning: The ESM module loader is experimental.
Passed: h0835.md  Total: 50  Distinct: 43
(node:9152) ExperimentalWarning: The ESM module loader is experimental.
Failed: en_tn_19-PSA_occnotes.txt
--- Expected total of 769 and distinct of 223
--- Found total of 769 and distinct of 222
--- See word list found at en_tn_19-PSA_occnotes.txt.allwords.txt
$
```

## ULT and UST Tests

Steps:
- get the raw usfm text for the book: `tit_usfm.txt`
- run `node --experimental-modules tit_usfm.mjs`
- first output is the input converted to JSON: `tit_usfm.txt.json`
- this JSON is iterated over to get the `children` array of verse objects
- if the verse object has `type` property `word`, then the `text` property will contain the word needed to count.
