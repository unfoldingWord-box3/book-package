# book-package-rcl
[https://unfoldingWord.github.io/book-package-rcl/](https://unfoldingWord.github.io/book-package-rcl/)

Identifying resources needed to enable single piece workflow.

## Purpose

Given a book of the Bible and, optionally, a chapter, then return a all the resources needed for the book and chapter. **At this time, only English is supported.**

## Current constraints

These resources will exist in all gateway languages, but for now, only english is completed. This component only considers english language resources.

The resources shown include:
- Lexicon references as Strong's Numbers with counts and links
*Note: Since each word in the original text has a Strong's number, then the number of words in the original text is the same as the number of Strong's entries.*
- Translation Words (tW) with counts and links to articles
- Translation Notes (tN) with counts 
- Translation Academy (tA) with counts and links to tA articles
- Translation Questions (tQ) with counts. 
*Note: A count of the number of level one headings is used to count the number of questions.*

# Setup Notes

These notes are adapted from https://unfoldingword-box3.github.io/hello-world-react-component-library/ for convenience.

1. Ensure `node.js` and `yarn` are installed
1. Clone the repo and change directory to the cloned folder.
2. Install the npm dependencies with `yarn`. Just run in project folder. It can take a while to run!
3. Run and develop with `yarn start`; view at `localhost:6060`.
    - if dependencies are missing it will not compile and will report what is missing
    - to fix, add dependencies to `package.json` and rerun `yarn` to install them
4. See debug `console.log()` output in browser console -- in chrome, CTRL-SHIFT-J to open.

After changes tested:
1. Update package version (must valid semver, such as 1.5.0 with all three pieces)
2. Use git to commit/push
3. Use `yarn publish`

## Chromebook Linux Beta Notes

Must use `hostname -I` to get the host address. **Neither `localhost` nor `127.0.0.1` will work.

```
$ hostname -I
100.115.92.202 
$
```