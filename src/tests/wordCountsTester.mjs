import { readFile, writeFile } from 'fs';
import { wordCount } from './wordCounts.mjs';


export function runWordCounts(testinput,ntotal,ndistinct) {
    readFile(testinput, (err, data) => {
        if (err) throw err;
    
        let s = ""+data;
        let results = wordCount(s);
        if ( results.total === ntotal && results.distinct === ndistinct ) {
            console.log("Passed:",testinput," Total:",ntotal, " Distinct:",ndistinct);
        } else {
            console.log("Failed:",testinput);
            console.log("--- Expected total of "+ntotal+" and distinct of "+ndistinct);
            console.log("--- Found total of "+results.total+" and distinct of "+results.distinct);
            console.log("--- See word list found at "+testinput+".allwords.txt");
        }
        writeFile(testinput+".allwords.txt",results.allWords.join('\n'), 
            function(err) {
                if (err) {
                    return console.log(err);
                }
        });
    });
}
