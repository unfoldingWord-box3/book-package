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
import { Link } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';

import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';

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
  clearFlag,
  classes,
  style,
}) 
{
  const [_book, setVal] = useState(<CircularProgress />);
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
      let result;
      try {
        result = await fetchBookPackageTa(
          {username: 'unfoldingword', languageId:'en', 
          bookId: bookId, chapters: chapter, clearFlag: clearFlag}
        );
        } catch (error) {
        setVal(
          <div>
            fetchBookPackageTa() Error: {error.message}
          </div>
        )
        return;
      }

      let tkeys = Array.from(Object.keys(result.summary_ref_map));
      let uniqueAndSorted = [...new Set(tkeys)].sort() 

      let rootTitle = 'UTA Word Count: '+ result.grandTotalWordCount.toLocaleString();
      //let bodyTitle = 'Details'

      setVal(
        <Paper className={classes.paper}>
          <TreeView
            className={classes.root}
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpandIcon={<ChevronRightIcon />}
          >

            <TreeItem nodeId="1" label={rootTitle}>
              <Typography variant="body2" gutterBottom>
                <i>Linked entries:<b>{uniqueAndSorted.length} unique</b>, {result.totalReferences} total links</i>
              </Typography>
                <Table className={classes.table} size="small" aria-label="a dense table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Translation Academy</TableCell>
                      <TableCell align="center">Reference Count</TableCell>
                      <TableCell align="center">Word Count</TableCell>
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
                        <TableCell align="center">{result.summary_ref_map[skey]}</TableCell>
                        <TableCell align="center">{result.detail_article_map[skey]['total']}</TableCell>
                        <TableCell align="center">{result.detail_article_map[skey]['distinct']}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
            </TreeItem>
          </TreeView>
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
  /** Optional flag to clear and refetch all data. Default is true. */
  clearFlag: PropTypes.bool,
  /** The overriding CSS for this component */
  style: PropTypes.object,
};

const styles = theme => ({
  root: {
  },
});

export default withStyles(styles)(BookPackageTa);

