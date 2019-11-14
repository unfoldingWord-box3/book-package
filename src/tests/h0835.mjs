import { readFile } from 'fs';
import { wordCount } from './wordCounts.mjs';

let DEBUG = false;
if ( process.argv[2] && process.argv[2] === '-debug' ) {
    DEBUG = true;
}

const testinput = 'h0835.md';
const ntotal = 57;
const ndistinct = 49;

readFile(testinput, (err, data) => {
    if (err) throw err;

    let s = ""+data;
    let results = wordCount(s);
    if ( results.total === ntotal && results.distinct === ndistinct ) {
        console.log("Passed:",testinput," Total:",ntotal, " Distinct:",ndistinct);
        if ( ! DEBUG ) { return; };
    } else {
        console.log("Failed:",testinput);
        console.log("Expected total of "+ntotal+" and distinct of "+ndistinct);
    }
    console.log("Details:");
    console.log("total=",results.total);
    console.log("distinct=",results.distinct);
    console.log("allWords=",results.allWords);
    console.log("distinct=",[...new Set(results.allWords)].sort())
});