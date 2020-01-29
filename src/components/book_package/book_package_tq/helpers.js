import * as gitApi from '../../../core/gitApi';
import * as wc from 'uw-word-count';
import {chaptersInBook} from '../../../core/chaptersAndVerses';
import Path from 'path';
import {bpstore} from '../../../core/setupBpDatabase';

export async function fetchBookPackageTq({
bookId,
chapters,
languageId,
}) 
{
    let sumtotals = {"distinct":0, "total":0, "l1count":0};
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
            const err = "contents Error on:"+uri+" is:"+error;
            throw new Error(err);
        }
        let _verses = await JSON.parse(JSON.stringify(data));

        for (var j = 0; j < _verses.length; j++) {
            let git_url = _verses[j].git_url;
            let _tq;
            try {
                _tq = await gitApi.getURL({uri: git_url});    
            } catch(error) {
                const err = "getURL() Error on:"+git_url+" is:"+error;
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
            sumtotals.l1count  = sumtotals.l1count + vcounts.l1count;           
            sumtotals.total    = sumtotals.total + vcounts.total;
        }
    }
    let vcounts = wc.wordCount(grandtext);
    // overwrite l1count with correct value
    vcounts.l1count = sumtotals.l1count;
    sumtotals.distinct = vcounts.distinct;
    sumtotals.wordFrequency = vcounts.wordFrequency;
    //.setItem('utq-'+bookId,JSON.stringify(vcounts.wordFrequency))
    await bpstore.setItem('utq-'+bookId,JSON.stringify(vcounts))
    return sumtotals;
}
