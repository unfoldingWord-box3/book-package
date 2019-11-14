# Using files to test work counts

In order to use command line JavaScript with node and modules, 
I copy the `src/core/wordCounts.js` to this folder with an `.mjs`
extension. Run `sh setup.sh` to do this.

If you make any changes to `wordCounts.mjs` and you want "install"
them, then copy the local copy back to `src/core/wordCounts.js`.

Given a test input file `h0835.md`, then the tester is named 
`h0835.mjs`. The tests are run from the shell script: `sh run.sh`.

## Run the test script

Example:

```
$ sh run.sh
(node:8273) ExperimentalWarning: The ESM module loader is experimental.
Passed: h0835.md  Total: 57  Distinct: 49
$ 
```

## Run in debug mode

Example:

```
(node:8287) ExperimentalWarning: The ESM module loader is experimental.
Passed: h0835.md  Total: 57  Distinct: 49
Details:
total= 57
distinct= 49
allWords= [
  'status',    's2',        'needsedits',  'lexica',
  'used',      'for',       'edits',       'word',
  'data',      'strongs',   'h0835',       'twot',
  '183a',      'bdb',       'reference',   'bdb',
  'root',      'alternate', 'spellings',   'principal',
  'parts',     'part',      'of',          'speech',
  'noun',      'masculine', 'instances',   'in',
  'scripture', 'tbs',       'etymology',   'related',
  'language',  'glosses',   'time',        'period',
  'ancient',   'authors',   'related',     'words',
  'antonyms',  'for',       'all',         'senses',
  'synonyms',  'for',       'all',         'senses',
  'senses',    'sense',     '1decimal0',   'definition',
  'glosses',   'happiness', 'blessedness', 'explanation',
  'citations'
]
distinct= [
  '183a',        '1decimal0', 'all',         'alternate',
  'ancient',     'antonyms',  'authors',     'bdb',
  'blessedness', 'citations', 'data',        'definition',
  'edits',       'etymology', 'explanation', 'for',
  'glosses',     'h0835',     'happiness',   'in',
  'instances',   'language',  'lexica',      'masculine',
  'needsedits',  'noun',      'of',          'part',
  'parts',       'period',    'principal',   'reference',
  'related',     'root',      's2',          'scripture',
  'sense',       'senses',    'speech',      'spellings',
  'status',      'strongs',   'synonyms',    'tbs',
  'time',        'twot',      'used',        'word',
  'words'
]
$ 
```

## Failure output

In this example I temporarily gave false expected numbers in the script.

```
$ sh run.sh 
(node:8319) ExperimentalWarning: The ESM module loader is experimental.
Failed: h0835.md
Expected total of 57 and distinct of 48
Details:
total= 57
distinct= 49
allWords= [
  'status',    's2',        'needsedits',  'lexica',
  'used',      'for',       'edits',       'word',
  'data',      'strongs',   'h0835',       'twot',
  '183a',      'bdb',       'reference',   'bdb',
  'root',      'alternate', 'spellings',   'principal',
  'parts',     'part',      'of',          'speech',
  'noun',      'masculine', 'instances',   'in',
  'scripture', 'tbs',       'etymology',   'related',
  'language',  'glosses',   'time',        'period',
  'ancient',   'authors',   'related',     'words',
  'antonyms',  'for',       'all',         'senses',
  'synonyms',  'for',       'all',         'senses',
  'senses',    'sense',     '1decimal0',   'definition',
  'glosses',   'happiness', 'blessedness', 'explanation',
  'citations'
]
distinct= [
  '183a',        '1decimal0', 'all',         'alternate',
  'ancient',     'antonyms',  'authors',     'bdb',
  'blessedness', 'citations', 'data',        'definition',
  'edits',       'etymology', 'explanation', 'for',
  'glosses',     'h0835',     'happiness',   'in',
  'instances',   'language',  'lexica',      'masculine',
  'needsedits',  'noun',      'of',          'part',
  'parts',       'period',    'principal',   'reference',
  'related',     'root',      's2',          'scripture',
  'sense',       'senses',    'speech',      'spellings',
  'status',      'strongs',   'synonyms',    'tbs',
  'time',        'twot',      'used',        'word',
  'words'
]
$ 
```
