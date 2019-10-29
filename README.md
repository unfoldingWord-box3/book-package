# book-package
[https://unfoldingWord-box3.github.io/book-package/]

Identifying resources needed to enable single piece workflow

## Purpose

Given a book of the Bible and, optionally, a chapter, then return a all the resources needed for the book and chapter.

## Current constraints

These resources will exist in all gateway languages, but for now, only english is completed. This component only considers english language resources.

The resources shown include:
- Translation Words (tW) 
- Translation Notes (tN)

Resources not shown are:
- Literal Text (ULT)
- Simplifiex Text (UST)
- Translation Academy articles (UTA)
- Translation Questions (UTQ)

# Setup Notes

These notes are copied from https://unfoldingword-box3.github.io/hello-world-react-component-library/ for convenience.

1. Ensure `node.js` and `yarn` are installed
2. Install the npm dependencies with `yarn`. Just run in project folder. It can take a while to run!
3. Run and develop with `yarn start`; view at `localhost:6060`.
    - if dependencies are missing it will not compile and will report what is missing
    - to fix, add dependencies to `package.json` and rerun `yarn` to install them
4. See debug `console.log()` output in browser console -- in chrome, CTRL-SHIFT-J to open.




*Note* cannot get the React component to render as a table. See this message:
```

index.js:1437 Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function.
    in BookPackageStrongs (created by WithStyles(BookPackageStrongs))
    in WithStyles(BookPackageStrongs) (created by FunctionComponentWrapper)
    in FunctionComponentWrapper (created by StateHolder)
    in StateHolder (created by ReactExample)
    in Wrapper (created by ReactExample)
    in ReactExample
```