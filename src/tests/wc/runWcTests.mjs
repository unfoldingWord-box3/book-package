import { readFile } from 'fs';
import { wordCount } from '../wordCounts.mjs';

function getDistinctWords(str) {
    return [...new Set(getMdWords(str))].sort();
}

function getTotalWords(str) {
    return [...getMdWords(str)].sort();
}

let tests = ["test1.txt", "test2.md", "test3.md", "test4.md", "test5.md", "test6.md"];
let expected_distinct = [11,7, 7, 3, 3, 17];
let expected_total = [13, 24, 16, 4, 4, 23];
let expected_l1counts = [0, 1, 1, 2, 1, 1];

for (var i=0; i < tests.length; i++) {
    let testnum = i;
    let ndistinct = expected_distinct[i];
    let ntotal    = expected_total[i];
    let nl1       = expected_l1counts[i];
    readFile(tests[i], (err, data) => {
        if (err) throw err;
        let s = ""+data;
        let results = wordCount(s);
        console.log("---");

        let t = results.distinct;
        if ( t === ndistinct ) {
            console.log("Distinct Test #",testnum," passed:",t);
        } else {
            console.log("Distinct Test #",testnum," failed:",t," - expected:",ndistinct);
            console.log("Words are:",results.distinct)
        }

        let u = results.total;
        if ( u === ntotal ) {
            console.log("Total Test #",testnum," passed:",u);
        } else {
            console.log("Total Test #",testnum," failed:",u," - expected:",ntotal);
            console.log("Words are:",results.allWords)
        }

        console.log("Word Frequency:\n",results.wordFrequency)

        let v = results.l1count;
        if ( v === nl1 ) {
            console.log("L1 Count Test #",testnum," passed:",v);
        } else {
            console.log("L1 Count Test #",testnum," failed:",v," - expected:",nl1);
        }

    });    
}


