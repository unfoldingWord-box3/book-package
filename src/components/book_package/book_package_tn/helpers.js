import { translationNotes } from '../../../core/helpers.js'
import * as gitApi from '../../../core/gitApi';

export async function fetchBookPackageTn({
bookId,
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
    console.log("Notes - Number of notes:"+_notes.size);
    for (var i=0; i<_notes.size; i++) {
        let tarticle = _notes[i][4];
        if ( tarticle !== "" ) {
            tacount = tacount + 1;
            console.log("tA article:",_notes)
        }
    }
    console.log("Total tA Arcticles:",tacount)
    return _notes;
}