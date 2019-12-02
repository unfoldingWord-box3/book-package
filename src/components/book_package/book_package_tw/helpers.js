import Path from 'path';
import { fetchOriginalBook } from '../../../core/helpers.js'
import * as gitApi from '../../../core/gitApi';
import * as cav from '../../../core/chaptersAndVerses';
import * as wc from '../../../core/wordCounts';

async function process_tags(key,val,summary_tw_map,
    summary_twArticle_map,summary_ByArticle_map) {
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
    let articleCounts = {};
    articleCounts.total = twcounts.allWords.length;
    articleCounts.distinct = [...new Set(twcounts.allWords)].length;
    articleCounts.allWords = twcounts.allWords;
    summary_ByArticle_map.set(val,articleCounts);
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
    var summary_tw_map = new Map();
    var summary_twArticle_map = new Map();
    var summary_ByArticle_map = new Map();
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
                        await process_tags(k3,v3,summary_tw_map,
                            summary_twArticle_map,
                            summary_ByArticle_map
                        );
                        if ( k3 === "children" ) {
                            for (var j=0; j < v3.length; j++) {
                                var children_map = obj_to_map(v3[j]);
                                for ( var [k4,v4] of children_map.entries()) {
                                    await process_tags(k4,v4,summary_tw_map,
                                        summary_twArticle_map,
                                        summary_ByArticle_map
                                    );
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    // count the number of referenced articles (not distinct)
    let totalWordCount = 0;
    for ( var v5 of summary_tw_map.values() ) {
        totalWordCount = totalWordCount + v5;
    }

    // count the number of words in the tw articles
    let totalTwWordCount = 0;
    for ( var v6 of summary_twArticle_map.values() ) {
        totalTwWordCount = totalTwWordCount + v6;
    }

    // aggregate all the words across all articles
    let wordAggregation = "";
    for ( var w of summary_ByArticle_map.values() ) {
        wordAggregation = wordAggregation + '\n' + w.allWords.join('\n');
    }

    let results = {};
    results.summary_tw_map = map_to_obj(summary_tw_map);
    results.totalWordCount = totalWordCount;
    results.summary_twArticle_map = map_to_obj(summary_twArticle_map);
    results.distinctTwArticleWords = summary_twArticle_map.size;
    results.totalTwArticleWords    = totalTwWordCount;
    results.summary_ByArticle_map  = map_to_obj(summary_ByArticle_map);
    //console.log("utw article counts", summary_ByArticle_map)
    for ( let k of summary_tw_map.keys() ) {
        if ( ! summary_ByArticle_map.has(k) ) {
            console.log("Key does not exist in by article map",k);
        }
    }

    localStorage.setItem('utw-'+bookId,JSON.stringify(results.summary_ByArticle_map));
    return results;
  }