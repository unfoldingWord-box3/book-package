import { translationNotes, tsvParse } from '../../../core/helpers.js'
import * as gitApi from '../../../core/gitApi';
import * as wc from 'uw-word-count';
import {bpstore} from '../../../core/setupBpDatabase';

export async function fetchBookPackageTn({
bookId,
chapters,
clearFlag,
languageId,
}) 
{
    let dbkey = 'utn-'+bookId;
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

    let errors = [];
    if ( _notes === null ) {
        errors.push("UTN Error: Cannot access:",bookId," -- error message not available")
    }

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
    // add one more UTN attribute, namely, the number of notes
    wcounts.totalNotes = total;
    await bpstore.setItem(dbkey,wcounts);
    if ( errors.length > 0 ) {
        await bpstore.setItem(dbkey+"-errors", errors);
    }
    return wcounts;
}

export async function fetchObsTn({
    bookId,
    clearFlag,
    }) 
    {
        let errors = [];
        let dbkey = 'utn-'+bookId;
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

        const uri = 'https://git.door43.org/unfoldingWord/en_translation-annotations/raw/branch/master/OBS/OBS_tn.tsv';
        let _content;
        try {
            _content = await gitApi.getURL({uri});    
        } catch(error) {
            const err = "UTN Error on:"+uri+" is:"+error;
            errors.push(err);
            console.log(err);
            throw new Error(err);
        }
    
        if ( _content === null ) {
            errors.push("UTN Error: Cannot access:",bookId," -- error message not available")
        }
    
        let allNotes = "";
    
        let _notes = tsvParse({tsv: _content});
        let total=0;
    
        // loop starts at 1, skipping the header row of the TSV file
        for (var i=1; i<_notes.length; i++) {
            total = total + 1;
            let annotation = _notes[i][6];
            allNotes = allNotes + '\n' + annotation;
        }
        // count words in occurrence notes
        let wcounts = wc.wordCount(allNotes);
        // add one more UTN attribute, namely, the number of notes
        wcounts.totalNotes = total;
        await bpstore.setItem(dbkey,wcounts);
        if ( errors.length > 0 ) {
            await bpstore.setItem(dbkey+"-errors", errors);
        }
        return wcounts;
    }
