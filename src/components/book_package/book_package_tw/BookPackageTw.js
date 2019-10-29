import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
/*
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { Typography } from '@material-ui/core';
*/
import {fetchBookPackageTw} from './helpers';

function BookPackageTw({
  bookId,
  classes,
  style,
}) 
{
  //const classes = useStyles();
  let _book = {};
  let setVal;
  [_book, setVal] = useState(0);
  useEffect( () => {
    fetchBookPackageTw(
      {username: 'unfoldingword', languageId:'en', bookId: bookId
    }).then(setVal);
  });
  return (
    <div className={classes.root}>
      {_book}
    </div>
  )
  /*
  return (
    <div className={classes.root}>
    <Paper className={classes.paper}>
      <Table className={classes.table} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell>Translation Word</TableCell>
            <TableCell align="middle">Count</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.keys(_book).forEach(skey => (
            <TableRow key={skey}>
              <TableCell component="th" scope="row">
                {skey}
              </TableCell>
              <TableCell>{_book.skey}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
    </div>
  );

  */
};

BookPackageTw.propTypes = {
  /** @ignore */
  classes: PropTypes.object,
  /** The Book ID to package. */
  bookId: PropTypes.string.isRequired,
  /** The overriding CSS for this component */
  style: PropTypes.object,
};

const styles = theme => ({
  root: {
  },
});

export default withStyles(styles)(BookPackageTw);



/* Code Graveyard
    <div className={classes.root}>
      {_book}
    </div>

  return (
    <div>
      <Paper className={classes.paper}>
      {Object.keys({_book}).forEach(skey => ( 
        <div>
        <Typography>skey</Typography>
        <Typography>_book[skey]</Typography>   
        </div>
      ))}
      </Paper>
    </div>
  );


  return (
    <div className={classes.root}>
    <Paper className={classes.paper}>
      <Table className={classes.table} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell>Translation Word</TableCell>
            <TableCell align="middle">Count</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.keys(_book).forEach(skey => (
            <TableRow key={skey}>
              <TableCell component="th" scope="row">
                {skey}
              </TableCell>
              <TableCell>{_book.skey}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
    </div>
  );

Object.keys(obj).forEach(item => {
  console.log(item,obj[item]);
});


*/