import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import * as cav from '../../core/chaptersAndVerses';
import {bpstore} from '../../core/setupBpDatabase'
import BookPackageTotals from '../book_package_totals';
//import BookPackageStrongs from '../book_package/book_package_strongs';
import BookPackageTw from '../book_package/book_package_tw';
import BookPackageTn from '../book_package/book_package_tn';
import BookPackageTa from '../book_package/book_package_ta';
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
  clearFlag,
  classes,
  style,
}) 
{
  if ( clearFlag === undefined ) { clearFlag = true }

  const [_book, setVal] = useState("Waiting-BookPackageRollup");
  useEffect( () => {
    const fetchData = async () => {

      if ( clearFlag ) {
        await bpstore.clear(); // clear/reset local storage before starting components
      }

      let result;
      const bookarray = bookId.split(",");
      for ( let bi = 0; bi < bookarray.length; bi++ ) {
        result = await validateInputProperties(bookarray[bi], chapter);
        if ( !result ) {
          break;
        }
      }
     
      let chlist = chapter ? chapter : "(ALL)";
      if ( result ) {
        await bpstore.setItem('bookid',bookId);
        setVal(
          <Paper className={classes.paper} >
            <Typography variant="h5" gutterBottom>
              Package Rollup for "{bookId.toUpperCase()}" 
              and Chapters {chlist}
            </Typography>
            <BookPackageTotals bookId={bookId} />
            {bookarray.sort().map(skey => (
              <Paper>
              <BookPackageTw bookId={skey} chapter={chapter} clearFlag={clearFlag} />
              <BookPackageTn bookId={skey} chapter={chapter} clearFlag={clearFlag} />
              <BookPackageTa bookId={skey} chapter={chapter} clearFlag={clearFlag} />
              <BookPackageTq bookId={skey} chapter={chapter} clearFlag={clearFlag} />
              <BookPackageUlt bookId={skey} chapter={chapter} clearFlag={clearFlag} />
              <BookPackageUst bookId={skey} chapter={chapter} clearFlag={clearFlag} />
              </Paper>
              ))}
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
  /** Optional flag to clear and refetch all data. Default is true. */
  clearFlag: PropTypes.bool,
  /** The overriding CSS for this component */
  style: PropTypes.object,
};

const styles = theme => ({
  root: {
  },
});

export default withStyles(styles)(BookPackageRollup);