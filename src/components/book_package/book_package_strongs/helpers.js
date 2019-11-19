import Path from 'path';
import { fetchOriginalBook } from '../../../core/helpers.js'
import * as gitApi from '../../../core/gitApi';
import * as cav from '../../../core/chaptersAndVerses';
import * as wc from '../../../core/wordCounts';

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
    let articleCounts = {};
    articleCounts.total = counts.allWords.length;
    articleCounts.distinct = [...new Set(counts.allWords)].length;
    detail_article_map.set(val,articleCounts);
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
        for (var [k1,v1] of verses_map.entries()) {
            if ( k1 === "front" ) continue;
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

    // count the number of words in the tw articles
    let totalStrongWordCount = 0;
    for ( var v6 of summary_article_map.values() ) {
        totalStrongWordCount = totalStrongWordCount + v6;
    }
    
    
    let results = {};
    results.summary_strong_map   = map_to_obj(summary_strong_map);
    results.totalWordCount       = totalWordCount;
    results.summary_article_map  = map_to_obj(summary_article_map);
    results.distinctArticleWords = summary_article_map.size;
    results.totalArticleWords = totalStrongWordCount;
    results.detail_article_map   = map_to_obj(detail_article_map);
    localStorage.removeItem('strong-summary_'+bookId);
    localStorage.setItem('strong-summary_'+bookId,JSON.stringify(results.summary_strong_map));
    localStorage.removeItem('strong-detail_'+bookId);
    localStorage.setItem('strong-detail_'+bookId,JSON.stringify(results.detail_article_map));
    return results;
  }
