import usfmjs from 'usfm-js';
import { readFile, writeFile } from 'fs';
import * as wc from '../wordCounts';

const obj_to_map = ( ob => {
    const mp = new Map();
    Object.keys ( ob ).forEach (k => { mp.set(k, ob[k]) });
    return mp;
});

let testinput = 'psa_usfm.txt';
let jsoninput;
let chapters;

readFile(testinput, (err, data) => {
    if (err) throw err;

    let s = ""+data;
    jsoninput = usfmjs.toJSON(s);
    chapters = jsoninput.chapters;
    writeFile(testinput+".json",JSON.stringify(chapters, undefined, 4), 
        function(err) {
            if (err) {
                return console.log(err);
            }
        }
    );

    // an array to keep the words we find
    let alltext = [];
    // convert the input into a map of chapters
    let chapter_map = obj_to_map(chapters);

    // loop over it
    for ( var [chnum,vnum] of chapter_map.entries()) {
        // get the verse objects (an array) for the chapter
        //console.log(chnum,vnum);
        // convert to a map
        let verse_map = obj_to_map(vnum);
        for ( var [k1,v1] of verse_map.entries()) {
            //console.log("k1,v1[",k1,"]",v1.verseObjects);
            // verseObjects is an array of verse bits
            let verseob = obj_to_map(v1.verseObjects);
            for ( var [k2,v2] of verseob.entries() ) {
                //console.log("k2,v2",k2,v2)
                if ( v2.text ) {
                    //console.log("k2,v2",k2,v2,v2.children)
                    alltext.push(v2.text.toLowerCase());
                }
            }
        }
    }

    let wcounts = wc.wordCount(alltext.join('\n'));
    console.log("Total:",wcounts.total," Distinct:",wcounts.distinct);

    writeFile(testinput+".alltext.txt",wcounts.allWords.join('\n'), 
        function(err) {
            if (err) {
                return console.log(err);
            }
        }
    );
    writeFile(testinput+".frequency.txt",JSON.stringify(wcounts.wordFrequency), 
        function(err) {
            if (err) {
                return console.log(err);
            }
        }
    );
});

