import * as gitApi from '../../../core/gitApi';
import * as wc from 'uw-word-count';
import {chaptersInBook} from '../../../core/chaptersAndVerses';
import Path from 'path';
import {bpstore} from '../../../core/setupBpDatabase';
import { tsvParse } from '../../../core/helpers.js'


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


    let errors = [];
    let totalL1count = 0;
    let grandtext = "";
    const chaparray = chapters.split(",");
    // Create the path to the repo
    // begin with chapter 1 to get the plumbing working
    const repo = languageId + "_tq";
    const numchapters = chaptersInBook(bookId);
    const slash = "/";
    const baseURL = 'https://git.door43.org/';
    const owner   = 'unfoldingword';

    //console.log("Number of chapters in book:",numchapters.length);
    for (var i = 0; i < numchapters.length; i++) {
        let ch = ""+(i+1);
        if ( chapters === "" ) {
            chapters = "0";
        }
        if ( chapters !== "0" ) {
            if ( ! chaparray.includes(ch) ) {
                continue;
            }
        }
        if ( i+1 < 10 ) {
            ch = "0"+ch;
        } 
        //let numverses = numchapters[i];
        //console.log("Verses in chapter:",numverses);
        let data;
        let uri;
        try {
            let path = bookId+slash+ch;
            uri = baseURL+Path.join('api/v1/repos', owner, repo, 'contents', path);
            data = await gitApi.getURL({uri});    
        } catch(error) {
            const err = "UTQ Error on:"+uri+" is:"+error;
            errors.push(err);
            console.log(err);
            throw new Error(err);
        }
        let _verses = await JSON.parse(JSON.stringify(data));

        for (var j = 0; j < _verses.length; j++) {
            let git_url = _verses[j].git_url;
            let _tq;
            try {
                _tq = await gitApi.getURL({uri: git_url});    
            } catch(error) {
                const err = "UTQ Error on:"+git_url+" is:"+error;
                errors.push(err);
                console.log(err);
                throw new Error(err);
            }
            if ( _tq == null) {
                continue;
            }
            let blob = JSON.parse(JSON.stringify(_tq));
            let content;
            try {
                content = atob(blob.content);
            } catch(error) {
                const err = "atob() Error on:"+git_url+" is:"+error;
                throw new Error(err);
            }
    
            let vcounts = wc.wordCount(content);
            grandtext = grandtext + " " + vcounts.allWords.join(" ");
            totalL1count  = totalL1count + vcounts.l1count;           
        }
    }
    let vcounts = wc.wordCount(grandtext);
    // overwrite l1count with correct value
    vcounts.l1count = totalL1count;
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

