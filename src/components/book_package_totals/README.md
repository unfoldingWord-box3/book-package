
### Example

**Do not use this as a stand-alone component! It only works as an inner component to the `BookPackageRollup` component.**

Once the book package components have all run and contributed their data, this component
will process the data and, in some cases, dedup the
counts (UTA and UTW) across the Books.

Finally it will display a "total word count" across all the books.

**NOTE! the components save their data to `indexedDB` and this is the data source for this component.**

This component takes two parameters:

- `delay` which defaults to 1000ms (1 second). This controls how often it queries `indexedDB`.
- `iterations` which defaults 1000. This controls how many retries it will make before timing out.

The default combination will wait for almost 17 minutes before timing out.

```js
<BookPackageTotals delay={1} iterations={1} />
```


