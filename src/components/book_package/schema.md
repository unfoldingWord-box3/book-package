# UTA, UTW, and LEX

NOTE: the term "word counts" refers to output from component `uw-word-count`.

## maps:
- summary_ref_map     - how many times is each article referenced; number of entries is distinct number of articles referenced
- summary_article_map - word frequency map across all articles
- detail_article_map  - word counts for each article 

## attributes:
- grandTotalWordCount = total across all articles
- grandDistinctWordCount = distinct words across all articles
- totalReferences - number of entries in summary_ref_map
- distinctReferences - distinct number of articles referenced



## UST, ULT, UTQ, UTN

- word counts output only

**NOTE 1**: output includes `l1count` which is the total number of questions for UTQ.

**NOTE 2**: attribute `totalNotes` added to capture total number of notes processed.
