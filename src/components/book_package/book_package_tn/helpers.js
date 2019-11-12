import { translationNotes } from '../../../core/helpers.js'
import * as gitApi from '../../../core/gitApi';
import * as wc from '../../../core/wordCounts';
import Path from 'path';

export async function fetchBookPackageTn({
bookId,
chapters,
languageId,
}) 
{
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

    let tacount = 0;
    let tarticles = [];
    let allNotes = "";

    const chaparray = chapters.split(",");
    let total=0;

    // loop starts at 1, skipping the header row of the TSV file
    for (var i=1; i<_notes.length; i++) {
        let ch = _notes[i][2]
        if ( chapters !== "" ) {
            if ( ! chaparray.includes(ch) ) {
                continue;
            }
        }
        total = total + 1;
        let tarticle = _notes[i][4];
        if ( tarticle !== "" ) {
            tacount = tacount + 1;
            tarticles.push(tarticle);
        }
        let occurrenceNote = _notes[i][8];
        allNotes = allNotes + occurrenceNote;
    }
    // count words in occurrence notes
    let wcounts = wc.wordCount(allNotes);
    let result = {};
    result["total"]   = total;
    result["tatotal"] = tacount;
    result["tarticles"] = tarticles;
    result["totalNoteWords"] = wcounts.total;
    result["distinctNoteWords"] = wcounts.distinct

    // Now process the tA articles. Each is in markdown format in a folder
    // with three files: title.md, sub-title.me, and 01.md.
    // loop thru all three files and concatenating the text
    // For each article, track distinct and total words; store in a map
    const repo = languageId + "_ta";
    const slash = "/";
    const base = 'translate/';
    const mdfiles = ["title.md","sub-title.md","01.md"];
    let articleWordCounts = [];
    let grandAllText = "";
    let uniqSorted = [...new Set(tarticles)].sort()
    for (var j=0; j < uniqSorted.length; j++) {
        let alltext = ""; // empty it out for each set
        for (var k=0; k < mdfiles.length; k++) {
            let repo_path = base + uniqSorted[j] + slash + mdfiles[k];
            let data = [];
            try {
                const uri = Path.join('unfoldingWord', 
                    repo, 'raw/branch', 'master', repo_path
                );
                data = await gitApi.get({uri});    
            } catch(error) {
                data = null;
                continue;
            }
            if ( data == null) {
                continue;
            } 
            alltext = alltext + '\n' + data;
        }
        grandAllText = grandAllText + '\n' + alltext;
        // now count the words for the article
        let tacounts = wc.wordCount(alltext);
        let article = {};
        article["name"] = uniqSorted[j];
        article["total"] = tacounts.total;
        article["distinct"] = tacounts.distinct
        articleWordCounts[j] = article;
    }
    result["articleWordCounts"] = articleWordCounts;
    // finally get the grand totals
    let x = wc.wordCount(grandAllText);
    result["allArticlesDistinct"] = x.distinct;
    result["allArticlesTotal"]    = x.total;
    localStorage.setItem('tn',JSON.stringify(result))
    return result;
}