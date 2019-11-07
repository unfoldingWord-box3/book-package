import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import {fetchBookPackageTw} from './helpers';
import { Link, Collapse } from '@material-ui/core';
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

function convertRC2Link(lnk) {
  //console.log("link arg is:",lnk.skey);
  const path = 'https://git.door43.org/unfoldingWord/en_tw/src/branch/master';
  let s;
  s = lnk.skey;
  s = s.replace(/^rc.*dict(\/.*$)/, path+'$1.md');
  //console.log("tW link:",s);
  return s;
}

function BookPackageTw({
  bookId,
  chapter,
  classes,
  style,
}) 
{
  const open = true;

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
      const result = await fetchBookPackageTw(
        {username: 'unfoldingword', languageId:'en', 
        bookId: bookId, chapters: chapter
      });
      let gkeys = Array.from(Object.keys(result.summary_tw_map));
      let totalWordCount = result.totalWordCount;
      setVal(
        <Paper className={classes.paper}>
          <Typography variant="h6" gutterBottom>
            Translation Words for "{bookId.toUpperCase()}" 
            and Chapters {chlist}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Distinct Number of Translation Words: {gkeys.length}
          </Typography>

          <Typography variant="body2" gutterBottom>
            Total Number of Entries: {totalWordCount}
          </Typography>

          <Collapse in={open} component="details">
          <div id="details">
          <Table className={classes.table} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell>Translation Word</TableCell>
                <TableCell align="center">Count</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {gkeys.sort().map(skey => (
                <TableRow key={skey}>
                  <TableCell component="th" scope="row">
                    <Link href={convertRC2Link({skey})} target="_blank" rel="noopener" >
                    {skey}
                    </Link>
                  </TableCell>
                  <TableCell align="center">{result.summary_tw_map[skey]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
          </Collapse>

        </Paper>
      );  
      /* debugging
      Object.keys(result).forEach(skey => (
        console.log("tW:",skey,", val:",result[skey])
      ));
      */
    };
    fetchData();
  }, []); 
  // the parameter [] allows the effect to skip if value unchanged
  // an empty [] will only update on mount of component

  return (
    <div className={classes.root}>
      {_book}
    </div>
  )
};

BookPackageTw.propTypes = {
  /** @ignore */
  classes: PropTypes.object,
  /** The Book ID to package. */
  bookId: PropTypes.string.isRequired,
  /** Comma list of chapters to package. Default is zero and returns all chapters of book*/
  chapter: PropTypes.string,
  /** The overriding CSS for this component */
  style: PropTypes.object,
};

const styles = theme => ({
  root: {
  },
});

export default withStyles(styles)(BookPackageTw);
