# Word Count from Markdown

## Limitations

### Reference Style Links

1. Does not handle reference style links, for either URLs or Images. For example:
```
Reference-style: 
![alt text][logo]

[logo]: https://github.com/adam-p/markdown-here/raw/master/src/common/images/icon48.png "Logo Title Text 2"

[I'm a reference-style link][Arbitrary case-insensitive reference text]


[arbitrary case-insensitive reference text]: https://www.mozilla.org
```

2. [**Fixed**] ~~In ordered lists, the numerals are counts as words to be translated. Thus in the below, the total word count is 4 and the distinct word is 2.~~ **Ordered lists will now discount the numbers** Thus in the below, the total word count will be 2 and the distinct word count will be 1.
```
1. test
1. test
```

I believe that in order to handle references, regular expressions will not suffice;
and that a AST Parser will be needed. For example, Github's own at:
https://github.com/commonmark/commonmark.js/.




### Decimal Points

See details here: https://en.wikipedia.org/wiki/Decimal_separator.

Only the decimal point (a period character) is supported.

## Supported Markdown Cases

In this folder are six test cases and all are passing. To run, `node.js` must be installed.

Here are the results when run:
```
$ ls
README.md  test1.txt  test2.md  test3.md  test4.md  test5.md  test6.md  wc.js
$ node wc.js
Test # 0  passed: 11
Test # 1  passed: 7
Test # 2  passed: 7
Test # 4  passed: 3
Test # 3  passed: 3
Test # 5  passed: 12
$ 
```
