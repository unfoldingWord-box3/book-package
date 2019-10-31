import { translationNotes } from '../../../core/helpers.js'
import * as gitApi from '../../../core/gitApi';

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
    console.log("notes file:",_notes)
    let tacount = 0;
    let tarticles = [];
    console.log("Notes - Number of notes:"+_notes.length);
    const chaparray = chapters.split(",");
    let total=0;

    // loop starts at 1, skipping the header row of the TSV file
    for (var i=1; i<_notes.length; i++) {
        let ch = _notes[i][2]
        if ( chapters !== "0" ) {
            if ( ! chaparray.includes(ch) ) {
                continue;
            }
        }
        total = total + 1;
        console.log("Working on chapter:"+ch);
        console.log("row "+i+" val=",_notes[i]);
        let tarticle = _notes[i][4];
        if ( tarticle !== "" ) {
            tacount = tacount + 1;
            tarticles.push(tarticle);
            console.log("tA article:",_notes)
        }
    }
    console.log("Total tA Arcticles:",tacount)
    let result = {};
    result["total"]   = total;
    result["tatotal"] = tacount;
    result["tarticles"] = tarticles;
    return result;
}