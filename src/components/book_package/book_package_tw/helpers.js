import Path from 'path';
import { fetchOriginalBook } from '../../../core/helpers.js'
import * as gitApi from '../../../core/gitApi';
import * as cav from '../../../core/chaptersAndVerses';
import * as wc from 'uw-word-count';
import {bpstore} from '../../../core/setupBpDatabase';

async function process_tags(key,val,summary_tw_map,
    summary_twArticle_map,summary_ByArticle_map, errors) {
    if ( key !== "tw" ) {return;}
    //console.log("tw key,val=",key,val)
    // article count
    let count = summary_tw_map.get(val);
    if ( count === undefined ) count = 0;
    count = count + 1;
    summary_tw_map.set(val,count);

    if ( count > 1 ) {
        // already counted the words in this article
        return;
    }

    // word count in the articles
    let data = [];
    let repo_path = val.replace(/^rc.*dict(\/.*$)/, '$1.md');
    try {
        const uri = Path.join('unfoldingWord', 
            'en_tw', 'raw/branch', 'master', repo_path
        );
        data = await gitApi.get({uri});    
    } catch(error) {
        errors.push(""+error);
        data = " ";
    }
    let twcounts = wc.wordCount(""+data);
    for ( var i=0; i < twcounts.allWords.length; i++ ) {
        let thisword = twcounts.allWords[i];
        let count = summary_twArticle_map.get(thisword);
        if ( count === undefined ) {
            count = 0;
        }
        count = count + 1;
        summary_twArticle_map.set(thisword,count);
    }
    summary_ByArticle_map.set(val,twcounts);
}

export function convertRC2Link(lnk) {
    //console.log("link arg is:",lnk.skey);
    const path = 'https://git.door43.org/unfoldingWord/en_tw/src/branch/master';
    let s;
    s = lnk.skey;
    s = s.replace(/^rc.*dict(\/.*$)/, path+'$1.md');
    //console.log("tW link:",s);
    return s;
  }
  

export function validateInputProperties(bookId,chapters) {
  //console.log("validate bookId",bookId,", chapters:",chapters);
  if ( chapters === "" ) {
    let ref = {bookId: bookId, chapter: 1, verse: 1};
    //console.log("validate ref", ref);
    return cav.validateReference(ref);
  }
  const chaparray = chapters.split(",");
  for (var vip = 0; vip < chaparray.length; vip++ ) {
    let isValid = cav.validateReference(
      {bookId: bookId, chapter: chaparray[vip], verse: 1}
    );
    if ( isValid ) continue;
    return false
  }
  return true;
}



export async function fetchBookPackageTw({
    bookId,
    chapters,
    clearFlag,
    languageId,
  }) 
  {
    let dbkey = 'utw-'+bookId;

    if ( clearFlag === undefined ) { clearFlag = true }

    if ( clearFlag ) {
        await bpstore.removeItem(dbkey);
    } else { 
        // use the data already present
        let x = await bpstore.getItem(dbkey);
        if ( x !== null ) {
            return x;
        }
    }

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
    var summary_tw_map = new Map();
    var summary_twArticle_map = new Map();
    var summary_ByArticle_map = new Map();
    const chaparray = chapters.split(",");
    let errors = [];

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
                    for ( var [k3,v3] of verse_obj_map.entries()) {
                        await process_tags(k3,v3,summary_tw_map,
                            summary_twArticle_map,
                            summary_ByArticle_map, errors
                        );
                        if ( k3 === "children" ) {
                            for (var j=0; j < v3.length; j++) {
                                var children_map = obj_to_map(v3[j]);
                                for ( var [k4,v4] of children_map.entries()) {
                                    await process_tags(k4,v4,summary_tw_map,
                                        summary_twArticle_map,
                                        summary_ByArticle_map, errors
                                    );
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // aggregate all the words across all articles
    let wordAggregation = "";
    for ( var w of summary_ByArticle_map.values() ) {
        wordAggregation = wordAggregation + '\n' + w.allWords.join('\n');
    }

    let wcounts = wc.wordCount(wordAggregation);
    let results = {};
    results.summary_ref_map = map_to_obj(summary_tw_map);
    results.summary_article_map = map_to_obj(summary_twArticle_map);
    results.detail_article_map  = map_to_obj(summary_ByArticle_map);

    // count the total article references
    let x = 0;
    for (let v of summary_tw_map.values()) {
        x = x + v;
    }

    results.grandTotalWordCount    = wcounts.total;
    results.grandDistinctWordCount = wcounts.distinct;
    results.totalReferences        = x;
    results.distinctReferences     = summary_tw_map.size;
    //console.log("utw article counts", summary_ByArticle_map)
    for ( let k of summary_tw_map.keys() ) {
        if ( ! summary_ByArticle_map.has(k) ) {
            console.log("Key does not exist in by article map",k);
        }
    }

    await bpstore.setItem(dbkey,results);
    if ( errors.length > 0 ) {
        await bpstore.setItem(dbkey+"-errors", errors);
    }
    return results;
  }

  /*
  ## maps:
- summary_ref_map     - how many times is each article referenced; number of entries is distinct number of articles referenced
- summary_article_map - word frequency map across all articles
- detail_article_map  - word counts for each article 

## attributes:
- grandTotalWordCount = total across all articles
- grandDistinctWordCount = distinct words across all articles
- totalReferences - number of entries in summary_ref_map
- distinctReferences - distinct number of articles referenced
*/