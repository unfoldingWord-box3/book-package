
// Find words by searching for sequences of non-whitespace characters.
function getMdWords(str) {
    let s;
    // replace all markdown links with a space
    s = str.replace(/\[.*\]\(.*\)/g,' ');
    s = s.replace(/(\d+):(\d+)/g, '$1 $2'); // handle numbers with colons between them
    s = s.replace(/(\d+)-(\d+)/g, '$1 $2'); // handle numbers with dashes between them
    // WARNING: the below only works for decimal points (periods)
    s = s.replace(/(\d+)\.(\d+)/g, '$1_DECIMAL_$2'); // handle decimal numbers 
    s = s.replace(/[^\w\s]|_/g, ''); // remove all non-word and non-space characters
    s = s.replace(/\s+/g, ' '); // change all multiple sequences of space to single space
    // tN occurrence notes (tsv format) have markdown and 
    // use <br> to indicate line breaks.
    s = s.replace(/<br>/g, '\n'); // change <br> to new line character
    // discount the numerals used on an ordered list
    s = s.replace(/^\d+/g, '');
    return s.toLowerCase().match(/\S+/g) || [];
}

export function wordCount(str) {
    // return a object with two results: 
    // Total word count and distinct word count
    let counts = {};
    counts["total"] = getMdWords(str).length;
    counts["distinct"] = [...new Set(getMdWords(str))].length;
    let l1count = str.replace(/<br>/g, '\n').match(/^# |\n# /g) || [];
    counts["l1count"] = l1count.length;
    return counts;
}

