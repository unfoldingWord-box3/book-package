import { fetchBook } from '../../../core/helpers.js'
import * as gitApi from '../../../core/gitApi';
import * as wc from 'uw-word-count';

// function to convert object to a map
const obj_to_map = ( ob => {
    const mp = new Map();
    Object.keys ( ob ).forEach (k => { mp.set(k, ob[k]) });
    return mp;
});

// function to convert map to object
const map_to_obj = ( mp => {
    const ob = {};
    mp.forEach((v,k) => {ob[k]=v});
    return ob;
});

function process_tags(v3,summary_ult_map,level) {
    //if ( level > 4 ) console.log("ULT Level:",level);
    for (var j=0; j < v3.length; j++) {
        let children_map = obj_to_map(v3[j]);
        //console.log("chilren_map",children_map);
        if ( children_map.get("type") === "word" ) {
            let thisword = children_map.get("text");
            let lowerCaseVal = thisword.toLowerCase();
            let count = summary_ult_map.get(lowerCaseVal);
            if ( count === undefined ) count = 0;
            count = count + 1;
            summary_ult_map.set(lowerCaseVal,count);
            continue;
        }
        let children = children_map.get("children");
        if ( children !== undefined ) {
            // Ok, we have a lower level list of children properties
            // we recurse to pick them up
            process_tags(children,summary_ult_map,level+1);
        }
    }
}

export async function fetchBookPackageULT({
    bookId,
    chapters,
    languageId,
  }) 
  {
    let _book;
    const _manifests = await gitApi.fetchResourceManifests(
        {username: 'unfoldingword', 
        languageId: languageId
    });
    _book = await fetchBook(
        {username: 'unfoldingword', 
        languageId: languageId, 
        resourceId: 'ult',
        bookId: bookId, 
        manifest: _manifests['ult'], 
    });

    //console.log("_book ult",_book);
    var book_map = obj_to_map(_book);
    var summary_ult_map = new Map();
    const chaparray = chapters.split(",");
    // an array to keep the unaligned text we find
    let alltext = [];

    for (var [k,v] of book_map.entries()) {
        //console.log("Working on Chapter:"+k);
        if ( chapters === "" ) {
            chapters = "0";
        }
        if ( chapters !== "0" ) {
            if ( ! chaparray.includes(k) ) {
                continue;
            }
        }
        // the value is a verses object where key is verse number
        // and value is an array of verse objects
        var verses_map = obj_to_map(v);
        //for (var [k1,v1] of verses_map.entries()) {
        for (var v1 of verses_map.values()) {
                //if ( k1 === "front" ) continue;
            //console.log(". Working on verse:"+k1);
            // the value is a set of tags for each object in a verse
            var verse_map = obj_to_map(v1);
            for (var v2 of verse_map.values()) {
                for (var i=0; i < v2.length; i++) {
                    var verse_obj_map = obj_to_map(v2[i]);
                    // unaligned text method
                    if ( verse_obj_map.has("text") ) {
                        alltext.push(verse_obj_map.get("text").toLowerCase());
                    }
                    // aligned text method
                    if ( verse_obj_map.get("type") === "word" ) {
                        let thisword = verse_obj_map.get("text");
                        let lowerCaseVal = thisword.toLowerCase();
                        let count = summary_ult_map.get(lowerCaseVal);
                        if ( count === undefined ) count = 0;
                        count = count + 1;
                        summary_ult_map.set(lowerCaseVal,count);
                    }
                    for ( var [k3,v3] of verse_obj_map.entries()) {
                        if ( k3 === "children" ) {
                            process_tags(v3,summary_ult_map,1);
                        }
                    }
                }
            }
        }
    }

    // first process unaligned text
    let wcounts = wc.wordCount(alltext.join('\n'));
    if ( wcounts.total !== 0 ) {
        //console.log("wcounts for unaligned text:",wcounts.wordFrequency);
        let x = obj_to_map(wcounts.wordFrequency);
        for ( let [k,v] of x.entries() ) {
            if ( summary_ult_map.has(k) ) { 
                summary_ult_map.set(k, summary_ult_map.get(k) + v );
            } else {
                summary_ult_map.set(k,v);
            }
        }
    }

    let totalWordCount = 0;
    for ( var v5 of summary_ult_map.values() ) {
        totalWordCount = totalWordCount + v5;
    }
    let results = {};
    results.summary_ult_map = map_to_obj(summary_ult_map);
    results.totalWordCount = totalWordCount;
    localStorage.setItem('ult-'+bookId,JSON.stringify(results.summary_ult_map))
    return results;
  }
