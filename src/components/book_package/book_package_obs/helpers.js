import * as gitApi from '../../../core/gitApi';
import * as wc from 'uw-word-count';
import {bpstore} from '../../../core/setupBpDatabase';

export async function fetchBookPackageObs({bookId,clearFlag}) {
    let dbkey = 'obs-'+bookId;

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

    let errors = [];
    let allContent = "";

    // fetch the back/intro.md file 
    let uri = 'https://git.door43.org/unfoldingWord/en_obs/raw/branch/master/content/back/intro.md';
    let _content;
    try {
        _content = await gitApi.getURL({uri});    
    } catch(error) {
        const err = "OBS Error on:"+uri+" is:"+error;
        errors.push(err);
        console.log(err);
        throw new Error(err);
    }
    allContent = allContent + _content;

    // fetch the front/intro.md file 
    uri = 'https://git.door43.org/unfoldingWord/en_obs/raw/branch/master/content/front/intro.md';
    try {
        _content = await gitApi.getURL({uri});    
    } catch(error) {
        const err = "OBS Error on:"+uri+" is:"+error;
        errors.push(err);
        console.log(err);
        throw new Error(err);
    }
    allContent = allContent + _content;

    // fetch the front/title.md file 
    uri = 'https://git.door43.org/unfoldingWord/en_obs/raw/branch/master/content/front/title.md';
    try {
        _content = await gitApi.getURL({uri});    
    } catch(error) {
        const err = "OBS Error on:"+uri+" is:"+error;
        errors.push(err);
        console.log(err);
        throw new Error(err);
    }
    allContent = allContent + _content;

    const fiftyChapters = [
        '01','02','03','04','05','06','07','08','09','10',
        '11','12','13','14','15','16','17','18','19','20',
        '21','22','23','24','25','26','27','28','29','30',
        '31','32','33','34','35','36','37','38','39','40',
        '41','42','43','44','45','46','47','48','49','50',
    ];

    for ( let i=0; i<fiftyChapters.length; i++) {
        // fetch the front/title.md file 
        uri = 'https://git.door43.org/unfoldingWord/en_obs/raw/branch/master/content/'+fiftyChapters[i]+'.md';
        try {
            _content = await gitApi.getURL({uri});    
        } catch(error) {
            const err = "OBS Error on:"+uri+" is:"+error;
            errors.push(err);
            console.log(err);
            throw new Error(err);
        }
        allContent = allContent + _content;
    }

    let wcounts = wc.wordCount(allContent, 'markdown'); // markdown is default format

    let results = {};

    results.total    = wcounts.total;
    results.grandTotalWordCount    = wcounts.total;
    results.grandDistinctWordCount = wcounts.distinct;
    results.wordFrequency = wcounts.wordFrequency;

    await bpstore.setItem(dbkey,results);
    if ( errors.length > 0 ) {
        await bpstore.setItem(dbkey+"-errors", errors);
    }
    return results;
}
