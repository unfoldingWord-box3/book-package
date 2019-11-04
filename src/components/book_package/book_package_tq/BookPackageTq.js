import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';


import {fetchBookPackageTq} from './helpers';

function BookPackageTq({
  bookId,
  chapter,
  classes,
  style,
}) 
{

  const [_tq, setVal] = useState("Waiting");
  useEffect( () => {
    const fetchData = async () => {
      const result = await fetchBookPackageTq(
        {username: 'unfoldingword', languageId:'en', 
        bookId: bookId, chapters: chapter}
      );
      let chlist = chapter ? chapter : "(ALL)";
      setVal(
        <Paper className={classes.paper}>
          <Typography variant="h6" gutterBottom>
            Translation Questions Information for "{bookId.toUpperCase()}" 
            and Chapters {chlist}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Distinct Number of Words {result.distinct}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Total Number of Words {result.total}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Total Number of Questions: {result.l1count}
          </Typography>
        </Paper>
      );  
    };
    fetchData();
  }, []); 
  // the parameter [] allows the effect to skip if value unchanged
  // an empty [] will only update on mount of component

  return (
    <div className={classes.root}>
      {_tq}
    </div>
  );
};


BookPackageTq.propTypes = {
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

export default withStyles(styles)(BookPackageTq);

