import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { Collapse } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';

import {fetchBookPackageULT} from './helpers';
import * as cav from '../../../core/chaptersAndVerses';


function validateInputProperties(bookId,chapters) {
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


function BookPackageUlt({
  bookId,
  chapter,
  classes,
  style,
}) 
{
  const open = true; // for collapse component to manage its state
  const [_book, setVal] = useState("Waiting");
  useEffect( () => {
    const result = validateInputProperties(bookId, chapter);
    let chlist = chapter ? chapter : "(ALL)";
    if ( ! result ) {
      setVal(
        <Paper className={classes.paper} >
          <Typography variant="h5" gutterBottom>
            Invalid Book "{bookId.toUpperCase()}" 
            or Chapter(s) {chlist}
          </Typography> 
        </Paper>
      );
      return;
    }

    const fetchData = async () => {
      const result = await fetchBookPackageULT(
        {username: 'unfoldingword', languageId:'en', 
        bookId: bookId, chapters: chapter
      });
      let gkeys = Array.from(Object.keys(result.summary_ult_map));
      let totalWordCount = result.totalWordCount;
      setVal(
        <Paper className={classes.paper} >
          <Typography variant="h6" gutterBottom>
            Lexicon Entries for "{bookId.toUpperCase()}" 
            and Chapters {chlist}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Distinct Number of Entries: {gkeys.length}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Total Number of Entries: {totalWordCount}
          </Typography>

          <Collapse in={open} component="details">
          <div id="details">
          <Table className={classes.table} 
          size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell>Word</TableCell>
                <TableCell align="center">Count</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {gkeys.map(skey => (
                <TableRow key={skey}>
                  <TableCell component="th" scope="row">
                      {skey}
                  </TableCell>
                  <TableCell align="center">{result.summary_ult_map[skey]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
          </Collapse>

        </Paper>
      );  
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

BookPackageUlt.propTypes = {
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

export default withStyles(styles)(BookPackageUlt);