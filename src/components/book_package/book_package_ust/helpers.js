import { fetchBook } from '../../../core/helpers.js'
import * as gitApi from '../../../core/gitApi';

function process_tags(val,summary_ust_map) {
    let lowerCaseVal = val.toLowerCase();
    let count = summary_ust_map.get(lowerCaseVal);
    if ( count === undefined ) count = 0;
    count = count + 1;
    summary_ust_map.set(lowerCaseVal,count);
}

export async function fetchBookPackageUST({
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
        resourceId: 'ust',
        bookId: bookId, 
        manifest: _manifests['ust'], 
    });

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
    //console.log("_book ust",_book);
    var book_map = obj_to_map(_book);
    var summary_ust_map = new Map();
    const chaparray = chapters.split(",");

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
        for (var [k1,v1] of verses_map.entries()) {
            if ( k1 === "front" ) continue;
            //console.log(". Working on verse:"+k1);
            // the value is a set of tags for each object in a verse
            var verse_map = obj_to_map(v1);
            for (var v2 of verse_map.values()) {
                //console.log(".. Working on v2:",v2);
                for (var i=0; i < v2.length; i++) {
                    var verse_obj_map = obj_to_map(v2[i]);
                    if ( verse_obj_map.get("type") === "word" ) {
                        let thisword = verse_obj_map.get("text");
                        process_tags(thisword,summary_ust_map);
                    }
                    for ( var [k3,v3] of verse_obj_map.entries()) {
                        //console.log("... Working on k3,v3:",k3,v3);
                        if ( k3 === "children" ) {
                            for (var j=0; j < v3.length; j++) {
                                var children_map = obj_to_map(v3[j]);
                                if ( children_map.get("type") === "word" ) {
                                    let thisword = children_map.get("text");
                                    process_tags(thisword,summary_ust_map);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    let totalWordCount = 0;
    for ( var v5 of summary_ust_map.values() ) {
        totalWordCount = totalWordCount + v5;
    }
    let results = {};
    results.summary_ust_map = map_to_obj(summary_ust_map);
    results.totalWordCount = totalWordCount;
    localStorage.setItem('ust',JSON.stringify(results))
    return results;
  }
