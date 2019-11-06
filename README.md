# book-package 
[https://unfoldingWord-box3.github.io/book-package/](https://unfoldingWord-box3.github.io/book-package/)

Identifying resources needed to enable single piece workflow.

## Purpose

Given a book of the Bible and, optionally, a chapter, then return a all the resources needed for the book and chapter. **At this time, only English is supported.**

## Current constraints

These resources will exist in all gateway languages, but for now, only english is completed. This component only considers english language resources.

The resources shown include:
- Lexicon references as Strong's Numbers with counts and links
*Note Since each word in the original text has a Strong's number, then the number of words in the original text is the same as the number of Strong's entries.*
- Translation Words (tW) with counts and links 
- Translation Notes (tN) with counts and names of referenced tA articles
- Translation Questions (tQ) with counts. 
*Note: A count of the number of level one headings is used to count the number of questions.*

Resources not shown are:
- Literal Text (ULT)
- Simplifiex Text (UST)
- Translation Academy articles (UTA)

# Setup Notes

These notes are adapted from https://unfoldingword-box3.github.io/hello-world-react-component-library/ for convenience.

1. Ensure `node.js` and `yarn` are installed
1. Clone the repo and change directory to the cloned folder.
2. Install the npm dependencies with `yarn`. Just run in project folder. It can take a while to run!
3. Run and develop with `yarn start`; view at `localhost:6060`.
    - if dependencies are missing it will not compile and will report what is missing
    - to fix, add dependencies to `package.json` and rerun `yarn` to install them
4. See debug `console.log()` output in browser console -- in chrome, CTRL-SHIFT-J to open.
