import Path from 'path';
import { fetchOriginalBook } from '../../../core/helpers.js'
import * as gitApi from '../../../core/gitApi';
import * as cav from '../../../core/chaptersAndVerses';
import {bpstore} from '../../../core/setupBpDatabase';
import * as wc from 'uw-word-count';


async function process_tags(key,val,bookId,summary_strong_map,
    summary_article_map,detail_article_map) 
{
    if ( key !== 'strong' ) {return;}

    let count = summary_strong_map.get(val);
    if ( count === undefined ) count = 0;
    count = count + 1;
    summary_strong_map.set(val,count);
    if ( count > 1 ) {
        // already counted the words in this article
        return;
    }

    if ( bookId === undefined ) {return;} 
    
    // word count in the articles
    let repo;
    let repo_path;;
    const whichTestament = cav.testament(bookId);
    if ( whichTestament === 'old' ) {
        repo = 'en_uhal';
        repo_path = 'content/' + val + '.md';
    } else {
        repo = 'en_ugl';
        repo_path = 'content/' + val + '/01.md';
    }
    let data = [];
    try {
        const uri = Path.join('unfoldingWord', 
            repo, 'raw/branch', 'master', repo_path
        );
        data = await gitApi.get({uri});    
    } catch(error) {
        data = null;
        return;
    }
    let counts = wc.wordCount(""+data);
    for ( var i=0; i < counts.allWords.length; i++ ) {
        let thisword = counts.allWords[i];
        let count = summary_article_map.get(thisword);
        if ( count === undefined ) {
            count = 0;
        }
        count = count + 1;
        summary_article_map.set(thisword,count);
    }
    detail_article_map.set(val,counts);
}

export function convertToLink(lnk,bookId) {
    const ugl_path = 'https://git.door43.org/unfoldingWord/en_ugl/src/branch/master/content/';
    const uhal_path = 'https://git.door43.org/unfoldingWord/en_uhal/src/branch/master/content/';
    let s = lnk;
    const whichTestament = cav.testament(bookId);
    if ( whichTestament === 'old' ) {
        s = uhal_path+lnk+".md";
    } else {
        s = ugl_path+lnk+"/01.md";
    }
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
  
  
export async function fetchBookPackageStrongs({
    bookId,
    chapters,
    clearFlag,
    languageId,
  }) 
  {
    let dbkey   = 'lex-'+bookId;
    if ( clearFlag === undefined ) { clearFlag = true }

    if ( clearFlag ) {
        await bpstore.removeItem(dbkey)
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
    var summary_strong_map  = new Map();
    var summary_article_map = new Map();
    var detail_article_map  = new Map();
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
                        await process_tags(k3,v3,bookId,summary_strong_map,summary_article_map,detail_article_map);
                        if ( k3 === "children" ) {
                            for (var j=0; j < v3.length; j++) {
                                var children_map = obj_to_map(v3[j]);
                                for ( var [k4,v4] of children_map.entries()) {
                                    await process_tags(k4,v4,bookId,summary_strong_map,summary_article_map,detail_article_map);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    let totalWordCount = 0;
    for ( var v5 of summary_strong_map.values() ) {
        totalWordCount = totalWordCount + v5;
    }

    // count the number of words in the articles
    let totalStrongWordCount = 0;
    for ( var v6 of summary_article_map.values() ) {
        totalStrongWordCount = totalStrongWordCount + v6;
    }
    
    
    let results = {};
    results.summary_ref_map        = map_to_obj(summary_strong_map);
    results.summary_article_map    = map_to_obj(summary_article_map);
    results.detail_article_map     = map_to_obj(detail_article_map);
    results.grandTotalWordCount    = totalStrongWordCount;
    results.grandDistinctWordCount = summary_article_map.size;
    results.totalReferences        = totalWordCount; 
    results.distinctReferences     = summary_strong_map.size;
    // below is not words with counts; it is lex entries with counts
    await bpstore.setItem(dbkey,results);
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