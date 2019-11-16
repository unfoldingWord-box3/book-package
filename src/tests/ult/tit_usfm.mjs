import usfmjs from 'usfm-js';
import { readFile, writeFile } from 'fs';

const obj_to_map = ( ob => {
    const mp = new Map();
    Object.keys ( ob ).forEach (k => { mp.set(k, ob[k]) });
    return mp;
});

let testinput = 'tit_usfm.txt';
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
    let allwords = [];
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
                if ( v2.children ) {
                    //console.log("k2,v2",k2,v2,v2.children)
                    let children = obj_to_map(v2.children);
                    for ( var [k3,v3] of children.entries()) {
                        //console.log("k3,v3",k3,v3);
                        if (v3.type === "word") {
                            //console.log(v3.text)
                            allwords.push(v3.text.toLowerCase());
                        }
                    }
                }
            }
        }
    }

    writeFile(testinput+".allwords.txt",allwords.join('\n'), 
        function(err) {
            if (err) {
                return console.log(err);
            }
        }
    );
});

