## getLanguage = ({languageId})

This non-component function can also have a playground to test it out.

```js
import {getLanguage} from '../core/langnames.js'

const languageId = "kn";
const value = getLanguage(languageId);

<span>Language with ID "{languageId}" is {value.ln} ({value.ang})</ span>
```
