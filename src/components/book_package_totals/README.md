
### Example

This component looks for and queries data from the other components.

In order to run, you must first define the book package using the `BookPackageRollup` component.
Once the components have all run and contributed their data, this component may 
be used to query the component data, then process it and, in some cases, deduping the
counts (UTA and UTW) across the Books.

Finally it will display a "total word count" across all the books.

**NOTE! the components save their data to `LocalStorage` and this is the source of queries.**

This component takes two parameters:

- `delay` which defaults to 1000ms (1 second). This controls how often it queries `LocalStorage`.
- `iterations` which defaults 1000. This controls how many retries it will make before timing out.

The default combination will wait for almost 17 minutes before timing out.

```js
<BookPackageTotals bookId='tit' delay={1000} iterations={1000} />
```


