import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import {fetchBookPackageTw} from './helpers';

function BookPackageTw({
  bookId,
  chapter,
  classes,
  style,
}) 
{
  const [_book, setVal] = useState("Waiting");
  useEffect( () => {
    const fetchData = async () => {
      const result = await fetchBookPackageTw(
        {username: 'unfoldingword', languageId:'en', 
        bookId: bookId, chapters: chapter
      });
      let gkeys = Array.from(Object.keys(result));
      setVal(
        <Paper className={classes.paper}>
        <Table className={classes.table} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell>Translation Word</TableCell>
              <TableCell align="center">Count</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {gkeys.map(skey => (
              <TableRow key={skey}>
                <TableCell component="th" scope="row">
                  {skey}
                </TableCell>
                <TableCell align="center">{result[skey]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      );  
      // debugging
      Object.keys(result).forEach(skey => (
        console.log("tW:",skey,", val:",result[skey])
      ));
    
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
