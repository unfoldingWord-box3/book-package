import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import * as cav from '../../core/chaptersAndVerses';
import BookPackageStrongs from '../book_package/book_package_strongs';
import BookPackageTw from '../book_package/book_package_tw';
import BookPackageTn from '../book_package/book_package_tn';
import BookPackageTq from '../book_package/book_package_tq';
import BookPackageUlt from '../book_package/book_package_ult';
import BookPackageUst from '../book_package/book_package_ust';

async function validateInputProperties(bookId,chapters) {
  //console.log("validate bookId",bookId,", chapters:",chapters);
  if ( chapters === "" ) {
    let ref = {bookId: bookId, chapter: 1, verse: 1};
    //console.log("validate ref", ref);
    return cav.validateReference(ref);
  }
  const chaparray = chapters.split(",");
  for (var vip = 0; vip < chaparray.length; vip++ ) {
    let isValid = cav.validateReference(
      {bookId: bookId, chapter: chaparray[vip], verse: 1}
    );
    if ( isValid ) continue;
    return false
  }
  return true;
}

function BookPackageRollup({
  bookId,
  chapter,
  classes,
  style,
}) 
{
  const [_book, setVal] = useState("Waiting");
  useEffect( () => {
    const fetchData = async () => {
      const result = await validateInputProperties(bookId, chapter);
      let chlist = chapter ? chapter : "(ALL)";
      if ( result ) {
        setVal(
          <Paper className={classes.paper} >
            <Typography variant="h5" gutterBottom>
              Package Rollup for "{bookId.toUpperCase()}" 
              and Chapters {chlist}
            </Typography>
            <BookPackageStrongs bookId={bookId} chapter={chapter} />
            <BookPackageTw bookId={bookId} chapter={chapter} />
            <BookPackageTn bookId={bookId} chapter={chapter} />
            <BookPackageTq bookId={bookId} chapter={chapter} />
            <BookPackageUlt bookId={bookId} chapter={chapter} />
            <BookPackageUst bookId={bookId} chapter={chapter} />
          </Paper>
        );    
      } else {
        setVal(
          <Paper className={classes.paper} >
            <Typography variant="h5" gutterBottom>
              Invalid Book "{bookId.toUpperCase()}" 
              or Chapter(s) {chlist}
            </Typography> 
          </Paper>
        );
      }
    };
    fetchData();
    let strong = JSON.parse(localStorage.getItem('strong'))
    console.log('strong:',strong)
    let ult = JSON.parse(localStorage.getItem('ult'))
    console.log('ult:',ult)
    let ust = JSON.parse(localStorage.getItem('ust'))
    console.log('ust:',ust)
    let tn = JSON.parse(localStorage.getItem('tn'))
    console.log('tn:',tn)
    let tq = JSON.parse(localStorage.getItem('tq'))
    console.log('tq:',tq)
    let grandTotalWords = strong.totalWordCount +
                          ult.totalWordCount +
                          ust.totalWordCount +
                          tn.totalNoteWords +
                          tn.allArticlesTotal +
                          tq.total;
    console.log('Grand Total Word Count is ',grandTotalWords)
  }, []); 
  // the parameter [] allows the effect to skip if value unchanged
  // an empty [] will only update on mount of component

  return (
    <div className={classes.root}>
      {_book}
    </div>
  );
};

BookPackageRollup.propTypes = {
  /** @ignore */
  classes: PropTypes.object,
  /** The Book ID to package. */
  bookId: PropTypes.string.isRequired,
  /** Comma list of chapters to package. Default is empty string and returns all chapters of book*/
  chapter: PropTypes.string,
  /** The overriding CSS for this component */
  style: PropTypes.object,
};

const styles = theme => ({
  root: {
  },
});

export default withStyles(styles)(BookPackageRollup);