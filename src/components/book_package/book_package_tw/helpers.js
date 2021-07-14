import Path from 'path';
import { tsvParse } from '../../../core/helpers.js'
import * as gitApi from '../../../core/gitApi';
import * as cav from '../../../core/chaptersAndVerses';
import * as wc from 'uw-word-count';
import {bpstore} from '../../../core/setupBpDatabase';


export function convertRC2Link(lnk) {
    const path = 'https://git.door43.org/unfoldingWord/en_tw/src/branch/master';
    let s;
    s = lnk.skey;
    s = s.replace(/^rc.*dict(\/.*$)/, path+'$1.md');
    return s;
  }
  

export function validateInputProperties(bookId,chapters) {
  if ( chapters === "" ) {
    let ref = {bookId: bookId, chapter: 1, verse: 1};
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

    const chaparray = chapters.split(",");
    let errors = [];

    // function to convert map to object
    const map_to_obj = ( mp => {
        const ob = {};
        mp.forEach((v,k) => {ob[k]=v});
        return ob;
    });

    // fetch the tWL TSV file 
    // https://git.door43.org/unfoldingWord/en_twl/raw/branch/master/twl_3JN.tsv
    const uri = `https://git.door43.org/unfoldingWord/en_twl/raw/branch/master/twl_${bookId.toUpperCase()}.tsv`;
    let _content;
    try {
        _content = await gitApi.getURL({uri});    
    } catch(error) {
        const err = "UTN Error on:"+uri+" is:"+error;
        errors.push(err);
        console.log(err);
        throw new Error(err);
    }

    // now parse it to get the column with the rc container URI
    let _rcContainerLinks = [];
    let _tsv = tsvParse({tsv: _content});

    // loop starts at 1, skipping the header row of the TSV file
    for (var i=1; i<_tsv.length; i++) {
        let ref = _tsv[i][0];
        let chapter = ref.split(':')[0];
        if ( chapters === "" ) {
            chapters = "0";
        }
        if ( chapters !== "0" ) {
            if ( ! chaparray.includes(chapter) ) {
                continue;
            }
        }

        _rcContainerLinks.push(_tsv[i][5])
    }

    // set up some maps to use to collect the counts
    var summary_tw_map = new Map();
    var summary_twArticle_map = new Map();
    var summary_ByArticle_map = new Map();

    for (let i=0; i<_rcContainerLinks.length; i++) {
        // a resource link looks like: rc://*/tw/dict/bible/kt/god
        // this maps to repo and filepath:
        // - repo    : https://git.door43.org/unfoldingWord/en_tw/
        // - filepath: bible/kt/god.md

        await process_rcLink(_rcContainerLinks[i],summary_tw_map,
            summary_twArticle_map,summary_ByArticle_map, errors)
    }

    // aggregate all the words across all articles
    let wordAggregation = "";
    for ( var w of summary_ByArticle_map.values() ) {
        wordAggregation = wordAggregation + '\n' + w.allWords.join('\n');
    }

    let wcounts = wc.wordCount(wordAggregation);
    /*
    - summary_ref_map     - how many times is each article referenced; number of entries is distinct number of articles referenced
    - summary_article_map - word frequency map across all articles
    - detail_article_map  - word counts for each article 
    */
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

export async function fetchObsTw({bookId,clearFlag}) {
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

    let errors = [];

    // function to convert map to object
    const map_to_obj = ( mp => {
        const ob = {};
        mp.forEach((v,k) => {ob[k]=v});
        return ob;
    });

    // fetch the tWL TSV file 
    // https://git.door43.org/unfoldingWord/en_obs-twl/raw/branch/master/twl_OBS.tsv
    const uri = 'https://git.door43.org/unfoldingWord/en_obs-twl/raw/branch/master/twl_OBS.tsv';
    let _content;
    try {
        _content = await gitApi.getURL({uri});    
    } catch(error) {
        const err = "UTN Error on:"+uri+" is:"+error;
        errors.push(err);
        console.log(err);
        throw new Error(err);
    }

    // now parse it to get the column with the rc container URI
    let _rcContainerLinks = [];
    let _tsv = tsvParse({tsv: _content});

    // loop starts at 1, skipping the header row of the TSV file
    for (var i=1; i<_tsv.length; i++) {
        _rcContainerLinks.push(_tsv[i][5])
    }

    // set up some maps to use to collect the counts
    var summary_tw_map = new Map();
    var summary_twArticle_map = new Map();
    var summary_ByArticle_map = new Map();

    for (let i=0; i<_rcContainerLinks.length; i++) {
        // a resource link looks like: rc://*/tw/dict/bible/kt/god
        // this maps to repo and filepath:
        // - repo    : https://git.door43.org/unfoldingWord/en_tw/
        // - filepath: bible/kt/god.md

        await process_rcLink(_rcContainerLinks[i],summary_tw_map,
            summary_twArticle_map,summary_ByArticle_map, errors)
    }

    // aggregate all the words across all articles
    let wordAggregation = "";
    for ( var w of summary_ByArticle_map.values() ) {
        wordAggregation = wordAggregation + '\n' + w.allWords.join('\n');
    }

    let wcounts = wc.wordCount(wordAggregation);
    /*
    - summary_ref_map     - how many times is each article referenced; number of entries is distinct number of articles referenced
    - summary_article_map - word frequency map across all articles
    - detail_article_map  - word counts for each article 
    */
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

async function process_rcLink(link,summary_tw_map,
    summary_twArticle_map,summary_ByArticle_map, errors) 
{
    let count = summary_tw_map.get(link);
    if ( count === undefined ) count = 0;
    count = count + 1;
    summary_tw_map.set(link,count);

    if ( count > 1 ) {
        // already counted the words in this article
        return;
    }

    // word count in the articles
    let data = [];
    let repo_path = link.replace(/^rc.*dict(\/.*$)/, '$1.md');
    let uri;
    try {
        uri = Path.join('unfoldingWord', 
            'en_tw', 'raw/branch', 'master', repo_path
        );
        data = await gitApi.get({uri});  
    } catch(error) {
        const err = "UTW Error on:"+uri+" is:"+error;
        errors.push(err);
        console.log(err);
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
    summary_ByArticle_map.set(link,twcounts);
}

