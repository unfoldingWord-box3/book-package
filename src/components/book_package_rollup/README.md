
### Example

This component simply includes all the Book Package components, 
except the Strongs Lexicon (see rationale below) onto 
one page. Furthermore, it includes the `BookPackageTotals` component, 
which detects when all the data has been processed and then:
- cycles thru all the processed results
- dedups across all books UTA and UTW articles
- aggregates all results 
- shows grand totals based on the list of books provided

It will validate `bookId` and `chapter`.

Optionally, a chapter in the book may be specified or a comma delimited list for multiple chapters.

The book identifiers are per standards found at:
http://ubsicap.github.io/usfm/identification/books.html

```js
<BookPackageRollup bookId='tit' chapter='' />
```

**Why are Lexicon results not included in the book package**

A book package is only meaningful in the context of translating a 
"Gateway Language" (GL) into an "Other Language" (OL). The Strongs Lexicon
is only used for the "mother" gateway language, namely, English.
All other GL to OL rely on the other resources to guide the 
translation effort.
