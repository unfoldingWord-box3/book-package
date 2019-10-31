import { fetchOriginalBook } from '../../../core/helpers.js'
import * as gitApi from '../../../core/gitApi';

function process_tags(key,val,summary_strong_map) {
    if ( key === "strong" ) {
        let count = summary_strong_map.get(val);
        if ( count === undefined ) count = 0;
        count = count + 1;
        summary_strong_map.set(val,count);
    }
}

export async function fetchBookPackageStrongs({
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
    _book = await fetchOriginalBook(
        {username: 'unfoldingword', 
        languageId: languageId, 
        bookId: bookId, 
        uhbManifest: _manifests['uhb'], 
        ugntManifest: _manifests['ugnt']
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

    var book_map = obj_to_map(_book);
    var summary_strong_map = new Map();
    const chaparray = chapters.split(",");

    for (var [k,v] of book_map.entries()) {
        //console.log("Working on Chapter:"+k);
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
                for (var i=0; i < v2.length; i++) {
                    var verse_obj_map = obj_to_map(v2[i]);
                    for ( var [k3,v3] of verse_obj_map.entries()) {
                        process_tags(k3,v3,summary_strong_map);
                        if ( k3 === "children" ) {
                            for (var j=0; j < v3.length; j++) {
                                var children_map = obj_to_map(v3[j]);
                                for ( var [k4,v4] of children_map.entries()) {
                                    process_tags(k4,v4,summary_strong_map);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    console.log("Strongs Count=",summary_strong_map.size)
    return map_to_obj(summary_strong_map);
  }
