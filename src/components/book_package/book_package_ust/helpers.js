import { fetchBook } from '../../../core/helpers.js'
import * as gitApi from '../../../core/gitApi';
import * as wc from 'uw-word-count';
import {bpstore} from '../../../core/setupBpDatabase';

// function to convert object to a map
const obj_to_map = ( ob => {
    const mp = new Map();
    Object.keys ( ob ).forEach (k => { mp.set(k, ob[k]) });
    return mp;
});

function process_tags(v3,alltext,level) {
    //if ( level > 4 ) console.log("UST Level:",level);
    for (var j=0; j < v3.length; j++) {
        let children_map = obj_to_map(v3[j]);
        //console.log("chilren_map",children_map);
        if ( children_map.get("type") === "word" ) {
            alltext.push(children_map.get("text").toLowerCase());
            continue;
        }
        let children = children_map.get("children");
        if ( children !== undefined ) {
            // Ok, we have a lower level list of children properties
            // we recurse to pick them up
            process_tags(children,alltext,level+1);
        }
    }
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

    var book_map = obj_to_map(_book);
    //var summary_ust_map = new Map();
    const chaparray = chapters.split(",");
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
        for (var v1 of verses_map.values()) {
            //if ( k1 === "front" ) continue;
            //console.log(". Working on verse:"+k1);
            // the value is a set of tags for each object in a verse
            var verse_map = obj_to_map(v1);
            for (var v2 of verse_map.values()) {
                //console.log(".. Working on v2:",v2);
                for (var i=0; i < v2.length; i++) {
                    var verse_obj_map = obj_to_map(v2[i]);
                    // unaligned text method
                    if ( verse_obj_map.has("text") ) {
                        alltext.push(verse_obj_map.get("text").toLowerCase());
                    }
                    // aligned text method
                    if ( verse_obj_map.get("type") === "word" ) {
                        alltext.push(verse_obj_map.get("text").toLowerCase());
                    }
                    for ( var [k3,v3] of verse_obj_map.entries()) {
                        if ( k3 === "children" ) {
                            process_tags(v3,alltext,1);
                        }
                    }
                }
            }
        }
    }

    let wcounts = wc.wordCount(alltext.join('\n'));
    await bpstore.setItem('ust-'+bookId,JSON.stringify(wcounts))
    return wcounts;
  }
