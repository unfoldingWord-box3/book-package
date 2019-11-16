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
import { Link, Collapse } from '@material-ui/core';

import {fetchBookPackageTw} from './helpers';
import {validateInputProperties} from './helpers';
import {convertRC2Link} from './helpers';

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
            Total Number of tW Articles: {totalWordCount} <br/>
            Unique Number of tW Articles: {gkeys.length} 
          </Typography>

          <Typography variant="body2" gutterBottom>
          Total Word Count: {result.totalTwArticleWords} <br/>
          Unique Words: {result.distinctTwArticleWords} <br/>
          </Typography>

          <Collapse in={open} component="details">
          <div id="details">
          <Table className={classes.table} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell>Translation Word</TableCell>
                <TableCell align="center">Reference Count</TableCell>
                <TableCell align="center">Total Word Count</TableCell>
                <TableCell align="center">Unique Words</TableCell>
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
                  <TableCell align="center">{result.summary_ByArticle_map[skey]['total']}</TableCell>
                  <TableCell align="center">{result.summary_ByArticle_map[skey]['distinct']}</TableCell>
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