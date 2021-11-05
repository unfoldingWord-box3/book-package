
### Example

This is a component that shows the resources for a single book of the Bible. Optionally, a chapter in the book may be specified or a comma delimited list for multiple chapters.

The book identifiers are per standards found at:
http://ubsicap.github.io/usfm/identification/books.html

```js
<BookPackageTa bookId='tit' chapter="" />
```

To count the words in OBS Translation Academy use lowercase "obs" for the bookId parameter.

```js
<BookPackageTa bookId='obs' chapter="" />
```
