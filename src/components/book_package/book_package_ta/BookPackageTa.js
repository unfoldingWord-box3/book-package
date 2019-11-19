import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import {fetchBookPackageTa} from './helpers';
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

function convertToLink(lnk) {
  const path = 'https://git.door43.org/unfoldingWord/en_ta/src/branch/master/translate/';
  return path+lnk;
}

function BookPackageTa({
  bookId,
  chapter,
  classes,
  style,
}) 
{
  const open = true; // for collapse to manage its state
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
      const result = await fetchBookPackageTa(
        {username: 'unfoldingword', languageId:'en', 
        bookId: bookId, chapters: chapter}
      );
      let tkeys = Array.from(result["tarticles"]);
      let uniqueAndSorted = [...new Set(tkeys)].sort() 

      console.log("tkeys",tkeys);
      setVal(
        <Paper className={classes.paper}>
          <Typography variant="h6" gutterBottom>
            Translation Academy for "{bookId.toUpperCase()}" 
            and Chapters {chlist}
          </Typography>

          <Typography variant="body2" gutterBottom>
            Total number of tA articles: {uniqueAndSorted.length}<br/>
            Total Word Count: {result["allArticlesTotal"]} <br/> 
            Unique words: {result["allArticlesDistinct"]} 
          </Typography>

          <Collapse in={open} component="details">
            <div id="details">
              <Table className={classes.table} size="small" aria-label="a dense table">
                <TableHead>
                  <TableRow>
                    <TableCell>Translation Academy</TableCell>
                    <TableCell align="center">Reference Count</TableCell>
                    <TableCell align="center">Total Word Count</TableCell>
                    <TableCell align="center">Unique Words</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {uniqueAndSorted.map(skey => (
                    <TableRow key={skey}>
                      <TableCell component="th" scope="row">
                        <Link href={convertToLink({skey})} target="_blank" rel="noopener" >
                        {skey}
                        </Link>
                      </TableCell>
                      <TableCell align="center">{result.summary_tarticles_map[skey]}</TableCell>
                      <TableCell align="center">{result.detail_tarticles_map[skey]['total']}</TableCell>
                      <TableCell align="center">{result.detail_tarticles_map[skey]['distinct']}</TableCell>
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
  
BookPackageTa.propTypes = {
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

export default withStyles(styles)(BookPackageTa);

