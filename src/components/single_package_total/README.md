
### Example

**Do not use this as a stand-alone component! It only works as an inner component.**

Once the book package component has run, this will sum up all the resources for the book
and return a total word count and a distinct word count for the book package.

**NOTE! the components save their data to `indexedDB` and this is the data source for this component.**

This component takes three parameters:

- `bookId` such as `tit`
- `interval` which defaults to 1000ms (1 second). This controls how often it queries `indexedDB`.
- `iterations` which defaults 1000. This controls how many retries it will make before timing out.

The default combination will wait for almost 17 minutes before timing out.

```js
<SinglePackageTotal bookId='tit' interval={1} iterations={10}/>
```


