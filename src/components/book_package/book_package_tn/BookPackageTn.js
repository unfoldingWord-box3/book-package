import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import {fetchBookPackageTn} from './helpers';

function BookPackageTn({
  bookId,
  classes,
  style,
}) 
{
  
  let _notes;
  let setVal;
  [_notes, setVal] = useState(0);
  useEffect( () => {
    fetchBookPackageTn(
      {username: 'unfoldingword', languageId:'en', 
      bookId: bookId
    }).then(setVal);
  });
  

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

BookPackageTn.propTypes = {
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

export default withStyles(styles)(BookPackageTn);

