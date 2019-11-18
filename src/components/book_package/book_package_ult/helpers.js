import { fetchBook } from '../../../core/helpers.js'
import * as gitApi from '../../../core/gitApi';

function process_tags(val,summary_ult_map) {
    let lowerCaseVal = val.toLowerCase();
    let count = summary_ult_map.get(lowerCaseVal);
    if ( count === undefined ) count = 0;
    count = count + 1;
    summary_ult_map.set(lowerCaseVal,count);
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
    //console.log("_book ult",_book);
    var book_map = obj_to_map(_book);
    var summary_ult_map = new Map();
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
                        process_tags(thisword,summary_ult_map);
                    }
                    for ( var [k3,v3] of verse_obj_map.entries()) {
                        if ( k3 === "children" ) {
                            for (var j=0; j < v3.length; j++) {
                                let children_map = obj_to_map(v3[j]);
                                //console.log("chilren_map",children_map);
                                if ( children_map.get("type") === "word" ) {
                                    let thisword = children_map.get("text");
                                    process_tags(thisword,summary_ult_map);
                                    continue;
                                }
                                let childrenL2 = children_map.get("children");
                                if ( childrenL2 === undefined ) {
                                    continue
                                }
                                //console.log("L2 children",childrenL2);
                                for ( var l2=0; l2 < childrenL2.length; l2++ ) {
                                    let childrenL2_map = obj_to_map(childrenL2[l2]);
                                    if ( childrenL2_map.get("type") === "word" ) {
                                        let thisword = childrenL2_map.get("text");
                                        process_tags(thisword,summary_ult_map);
                                        continue;
                                    }
                                    let childrenL3 = childrenL2_map.get("children");
                                    if ( childrenL3 === undefined ) {
                                        continue
                                    }
                                    //console.log("L3 children",childrenL3);
                                    for ( var l3=0; l3 < childrenL3.length; l3++ ) {
                                        let childrenL3_map = obj_to_map(childrenL3[l3]);
                                        if ( childrenL3_map.get("type") === "word" ) {
                                            let thisword = childrenL3_map.get("text");
                                            process_tags(thisword,summary_ult_map);
                                            continue;
                                        }
                                        let childrenL4 = childrenL3_map.get("children");
                                        if ( childrenL4 === undefined ) {
                                            continue
                                        }
                                        //console.log("L4 children",childrenL4);
                                        for ( var l4=0; l4 < childrenL4.length; l4++ ) {
                                            let childrenL4_map = obj_to_map(childrenL4[l4]);
                                            if ( childrenL4_map.get("type") === "word" ) {
                                                let thisword = childrenL4_map.get("text");
                                                process_tags(thisword,summary_ult_map);
                                                continue;
                                            }
                                            let childrenL5 = childrenL4_map.get("children");
                                            if ( childrenL5 === undefined ) {
                                                continue
                                            }
                                            console.log("ULT L5 children",childrenL5);
                                            for ( var l5=0; l5 < childrenL5.length; l5++ ) {
                                                let childrenL5_map = obj_to_map(childrenL5[l5]);
                                                if ( childrenL5_map.get("type") === "word" ) {
                                                    let thisword = childrenL5_map.get("text");
                                                    process_tags(thisword,summary_ult_map);
                                                    continue;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
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
    localStorage.setItem('ult',JSON.stringify(results))
    return results;
  }
