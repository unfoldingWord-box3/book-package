import { translationNotes } from '../../../core/helpers.js'
import * as gitApi from '../../../core/gitApi';
import * as wc from '../../../core/wordCounts';

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
    return result;
}