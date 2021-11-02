import * as gitApi from '../../../core/gitApi';
import * as wc from 'uw-word-count';
import {bpstore} from '../../../core/setupBpDatabase';
import { tsvParse, translationQuestions } from '../../../core/helpers.js'


export async function fetchBookPackageTq({
bookId,
chapters,
clearFlag,
languageId,
}) 
{
    let dbkey = 'utq-'+bookId;
    if ( clearFlag === undefined ) { clearFlag = true }

    if ( clearFlag ) {
        await bpstore.removeItem(dbkey);
    } else { 
        // use the data already present
        let sumtotals = await bpstore.getItem(dbkey);
        if ( sumtotals !== null ) {
            return sumtotals;
        }
    }

    //New code
    let _questions = [];
    const _manifests = await gitApi.fetchResourceManifests(
        {username: 'unfoldingword', 
        languageId: languageId
    });
    _questions = await translationQuestions({
        username: 'unfoldingword',
        languageId: languageId, 
        bookId: bookId, 
        manifest: _manifests['tq']
    });
    
    let errors = [];
    if ( _questions === null ) {
        errors.push("UTQ Error: Cannot access:",bookId," -- error message not available")
    }

    const chaparray = chapters.split(",");
    let allQuestions = "";
    let total=0;

    // loop starts at 1, skipping the header row of the TSV file
    for (var i=1; i<_questions.length; i++) {
        let ch = _questions[i][0].split(":")[0];
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
        let question = _questions[i][5];
        let response = _questions[i][6];
        allQuestions = allQuestions + '\n' + question + '\n' + response;
    }

    let vcounts = wc.wordCount(allQuestions);
    // overwrite l1count with correct value
    vcounts.l1count = total;
    //.setItem('utq-'+bookId,JSON.stringify(vcounts.wordFrequency))
    await bpstore.setItem(dbkey, vcounts);
    if ( errors.length > 0 ) {
        await bpstore.setItem(dbkey+"-errors", errors);
    }
    return vcounts;
}

export async function fetchObsTq({
    bookId,
    clearFlag,
    }) 
    {
        let errors = [];
        let dbkey = 'utq-'+bookId;
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

        const uri = 'https://git.door43.org/unfoldingWord/en_translation-annotations/raw/branch/master/OBS/OBS_tq.tsv';
        let _content;
        try {
            _content = await gitApi.getURL({uri});    
        } catch(error) {
            const err = "UTQ Error on:"+uri+" is:"+error;
            errors.push(err);
            console.log(err);
            throw new Error(err);
        }
    
        if ( _content === null ) {
            errors.push("UTQ Error: Cannot access:",bookId," -- error message not available")
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
        allNotes = allNotes.replace(/\\n/g, "");

        let wcounts = wc.wordCount(allNotes);
        // add one more UTQ attribute, namely, the number of questions
        // currently the attribute is named "l1count" due to former use of 
        // markdown level 1 headings to count them.
        wcounts.l1count = _notes.length;

        await bpstore.setItem(dbkey,wcounts);
        if ( errors.length > 0 ) {
            await bpstore.setItem(dbkey+"-errors", errors);
        }
        return wcounts;
    }

