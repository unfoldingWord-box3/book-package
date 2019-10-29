import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
/* uncomment to test table renderer
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
//*/
import {fetchBookPackageStrongs} from './helpers';

function BookPackageStrongs({
  bookId,
  classes,
  style,
}) 
{

  let _book = {};
  let setVal;
  [_book, setVal] = useState(0);
  useEffect( () => {
    fetchBookPackageStrongs(
      {username: 'unfoldingword', languageId:'en', bookId: bookId
    }).then(setVal);
  });

  // debugging
  Object.keys(_book).forEach(skey => (
    console.log("BP Strongs- skey:",skey,", val:",_book[skey])
  ));

  // comment the return below to test table renderer
  //*
  return (
    <div className={classes.root}>
      {_book}
    </div>
  )
  //*/
  /* Uncomment this return to test table renderer
  return _book ? (
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
              <TableCell>{_book[skey]}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
    </div>
  ) : (<div classname={classes.root}>{_book}</div>);
  //*/
};

BookPackageStrongs.propTypes = {
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

export default withStyles(styles)(BookPackageStrongs);



/* Code Graveyard

  useEffect( () => {
    fetchBookPackageStrongs(
      {username: 'unfoldingword', languageId:'en', bookId: bookId
    }).then(setVal);
  });

  useEffect( () => {
    fetchBookPackageStrongs({username: 'unfoldingword', languageId:'en', bookId: bookId})
    .then(_book => {
      setVal(_book);
    }).catch(console.log);
  }, [_book]);

  
  
  import React, { useRef, useEffect, useState } from 'react';

  const useIsMounted = () => {
    const isMounted = useRef(false);
    useEffect(() => {
      isMounted.current = true;
      return () => isMounted.current = false;
    }, []);
    return isMounted;
  };
  const isMounted = useIsMounted();
  useEffect( () => {
    fetchBookPackageStrongs(
      {username: 'unfoldingword', languageId:'en', bookId: bookId
    })
    .then(val => {
      if (isMounted.current) {
        setVal(val);
      }
    });
  }, [_book]);




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