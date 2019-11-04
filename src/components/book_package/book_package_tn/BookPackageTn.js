import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import {fetchBookPackageTn} from './helpers';

function BookPackageTn({
  bookId,
  chapter,
  classes,
  style,
}) 
{
  
  const [_book, setVal] = useState("Waiting");
  useEffect( () => {
    const fetchData = async () => {
      const result = await fetchBookPackageTn(
        {username: 'unfoldingword', languageId:'en', 
        bookId: bookId, chapters: chapter}
      );
      let tkeys = Array.from(result["tarticles"]);
      let uniqueAndSorted = [...new Set(tkeys)].sort() 

      //console.log("tkeys",tkeys);
      setVal(
        <Paper className={classes.paper}>
          <Typography variant="h6" gutterBottom>
            Translation Notes Information for "{bookId.toUpperCase()}" and Chapters {chapter}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Total number of notes: {result["total"]}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Total number of tA articles: {uniqueAndSorted.length-1}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Translation Articles are:
            </Typography>
          <div>
            <List dense={true}>
              {uniqueAndSorted.map( (val,index) => (
                <ListItem key={index}>
                  <ListItemText>{val}</ListItemText>
                </ListItem>
              ))}
            </List>
          </div>
        </Paper>
      );  
      /* debugging
      Object.keys(result).forEach(skey => (
        console.log("BP Strongs- skey:",skey,", val:",result[skey])
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
  );
};
  
BookPackageTn.propTypes = {
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

export default withStyles(styles)(BookPackageTn);

/* graveyard
  return (
    <div className={classes.root}>
<h1>For "{bookId}"</h1>

{_notes}
<p>The naming convention is <strong>languageId</strong>_tn. 
The repo for english is &nbsp;
<a href="https://git.door43.org/unfoldingWord/en_tn">here</a>. 
</p>

<p>
These are tab separated value (TSV) files. 
The resource naming convention is <strong>language_id</strong>_tn_{bookId}.tsv”. 
</p>

<p>
For example: Titus is “en_tn_57-TIT.tsv” and is located &nbsp;
<a href="https://git.door43.org/unfoldingWord/en_tn/src/branch/master/en_tn_57-TIT.tsv">
  here
</a>
</p>


<p>Dependencies:</p>

<p>Must be able to construct the URL to the UTN resource.</p>
<p>Must be able to verify that the resources exists</p>
<p>Result: the location of the translation notes and an indicator whether it actually exists or not.
NOTE: this resource must be read and parsed for Translation Academy articles (column E); see next step.
</p>
    </div>
  )
}
*/
