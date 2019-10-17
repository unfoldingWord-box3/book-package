import langnames from './langnames.json';

export const getLanguage = (lc) => {
  let language;
  const langname = langnames.filter(object => object.lc === lc)[0];
  
  //console.log("input:"+lc+", found:"+langname)
  if (langname) {
    language = langname;
  }
  return language;
};

export const getLanguageDisplay = (lc, format) => {
  // pattern for uw format: (am) Amharic – አማርኛ (Africa Gateway)
  const lg = getLanguage(lc);
  let langdisplay;
  if (lg) {
    if (format === "lc-ang") {
      langdisplay = lg.lc + "-" + lg.ang;
    } else {
      // default
      langdisplay = "(" + lg.lc + ") " + lg.ang + " - " + lg.ln + " (" + lg.lr + ")"
    }
  } else {
    langdisplay = "UNK"
  }
  return langdisplay;
};

export const getLanguages = (format, filter, limit) => {
  //console.log('format:'+format);
  //console.log('filter:/'+filter+'/');
  //console.log('limit:'+limit);
  let langlist = [];
  var x;
  for (x of langnames) {
    var item;
    item = getLanguageDisplay(x.lc,format);
    if ( filter !== '' ) {
      if (item.indexOf(filter) > -1) {
        //console.log("(filtered)pushing:"+item)
        langlist.push(item);
      }  
    } else {
      //console.log("(unfiltered)pushing:"+item)
      langlist.push(item);
    }
    if ( langlist.length >= limit ) {
      break;
    }
  }
  //console.log("langlist.length="+langlist.length)
  //console.log("langlist array:"+langlist)
  return langlist;
}

/* Code graveyard
  const langname = langnames.filter(object => object.lc === languageId)[0];

  var i;
  for (i=0; i < langnames.length; i++) {
    console.log(langnames[i].lc+'\n')
    if ( i > 20 ) {
      break;
    }
  }
  console.log("input:"+languageId)
  
Finding! This does not work:
  export const getLanguage = ({languageId}) => {
Must be:
  export const getLanguage = (languageId) => {

*/