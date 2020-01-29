import { translationNotes } from '../../../core/helpers.js'
import * as gitApi from '../../../core/gitApi';
import * as wc from 'uw-word-count';
import {bpstore} from '../../../core/setupBpDatabase';

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

    let allNotes = "";

    const chaparray = chapters.split(",");
    let total=0;

    // loop starts at 1, skipping the header row of the TSV file
    for (var i=1; i<_notes.length; i++) {
        let ch = _notes[i][1]
        if ( ch === undefined ) { 
            //console.log("row i=",i," has chapter value undefined");
            continue; 
        }
        if ( chapters !== "" ) {
            if ( ! chaparray.includes(ch) ) {
                continue;
            }
        }
        total = total + 1;
        let occurrenceNote = _notes[i][8];
        allNotes = allNotes + '\n' + occurrenceNote;
    }
    // count words in occurrence notes
    let wcounts = wc.wordCount(allNotes);
    let result = {};
    result["total"]   = total;
    result["totalNoteWords"] = wcounts.total;
    result["distinctNoteWords"] = wcounts.distinct;
    result["allwords"] = wcounts.allWords;
    result["wordFrequency"] = wcounts.wordFrequency;
    await bpstore.setItem('utn-'+bookId,JSON.stringify(wcounts));
    return result;
}