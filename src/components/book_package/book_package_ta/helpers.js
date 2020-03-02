import { translationNotes } from '../../../core/helpers.js'
import * as gitApi from '../../../core/gitApi';
import * as wc from 'uw-word-count';
import Path from 'path';
import {bpstore} from '../../../core/setupBpDatabase';

export async function fetchBookPackageTa({
bookId,
chapters,
clearFlag,
languageId,
}) 
{
    let dbkey = 'uta-'+bookId

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
    let _notes = [];
    const _manifests = await gitApi.fetchResourceManifests(
        {username: 'unfoldingword', 
        languageId: languageId
    });
    _notes = await translationNotes(
        {username: 'unfoldingword', 
        languageId: languageId, 
        bookId: bookId, 
        manifest: _manifests['tn']
    });

    // function to convert map to object
    const map_to_obj = ( mp => {
        const ob = {};
        mp.forEach((v,k) => {ob[k]=v});
        return ob;
    });
    
    let tacount = 0;
    let tarticles = [];
    let summary_tarticles_map = new Map();
    let detail_tarticles_map = new Map();

    const chaparray = chapters.split(",");

    // loop starts at 1, skipping the header row of the TSV file
    for (var i=1; i<_notes.length; i++) {
        let ch = _notes[i][1]
        if ( ch === undefined ) { continue; }
        if ( chapters !== "" ) {
            if ( ! chaparray.includes(ch) ) {
                continue;
            }
        }
        let tarticle = _notes[i][4];
        if ( tarticle === undefined ) { continue; }
        if ( tarticle !== "" ) {
            tacount = tacount + 1;
            tarticles.push(tarticle);

            let count = summary_tarticles_map.get(tarticle);
            if ( count === undefined ) count = 0;
            count = count + 1;
            summary_tarticles_map.set(tarticle,count);
        }
    }

    // Now process the tA articles. Each is in markdown format in a folder
    // with three files: title.md, sub-title.me, and 01.md.
    // loop thru all three files and concatenating the text
    // For each article, track distinct and total words; store in a map
    const repo = languageId + "_ta";
    const slash = "/";
    const base = 'translate/';
    const mdfiles = ["title.md","sub-title.md","01.md"];
    let grandAllText = "";
    let uniqSorted = [...new Set(tarticles)].sort()
    let errors = [];
    for (var j=0; j < uniqSorted.length; j++) {
        let alltext = ""; // empty it out for each set
        for (var k=0; k < mdfiles.length; k++) {
            let repo_path = base + uniqSorted[j] + slash + mdfiles[k];
            let data = [];
            let uri;
            try {
                uri = Path.join('unfoldingWord', 
                    repo, 'raw/branch', 'master', repo_path
                );
                data = await gitApi.get({uri});    
            } catch(error) {
                const err = "UTA Error on:"+uri+" is:"+error;
                errors.push(err);
                console.log(err);
                    data = null;
                continue;
            }
            if ( data == null) {
                continue;
            } 
            alltext = alltext + ' ' + data;
        }
        grandAllText = grandAllText + ' ' + alltext;
        // now count the words for the article
        let tacounts = wc.wordCount(alltext);
        detail_tarticles_map.set(uniqSorted[j],tacounts);
    }
    let result = {};
    result["summary_ref_map"] = map_to_obj(summary_tarticles_map);
    // the below has the count data arranged per article
    result["detail_article_map"] = map_to_obj(detail_tarticles_map);
    // finally get the grand totals
    let x = wc.wordCount(grandAllText);
    result["summary_article_map"]    = x.wordFrequency;
    result["grandDistinctWordCount"] = x.distinct;
    result["grandTotalWordCount"]    = x.total;

    result["totalReferences"] = tacount;
    result["distinctReferences"] = summary_tarticles_map.size;

    await bpstore.setItem(dbkey,result);
    if ( errors.length > 0 ) {
        await bpstore.setItem(dbkey+"-errors", errors);
    }
    return result;
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