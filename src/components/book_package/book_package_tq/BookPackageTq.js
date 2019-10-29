import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

function BookPackageTq({
  bookId,
  classes,
  style,
}) 
{
  return (
    <div className={classes.root}>
<h1>For "{bookId}"</h1>
<p>
The naming convention is <strong>languageId</strong>_tq. 
The repo for english is &nbsp;
<a href="https://git.door43.org/unfoldingWord/en_tq">here</a>. 
</p>

<p>
The questions are stored in markdown format per verse, 
inside a chapter folder, inside a book folder. 
The book folder is named by the standard three character abbreviation in lowercase. 
Thus Titus is named “tit” and is &nbsp;
<a href="https://git.door43.org/unfoldingWord/en_tq/src/branch/master/tit">here</a>.
</p>

<p>Dependencies:</p>

<p>Must be able to construct the URL to the UTQ resource (only to the book folder level?)</p>

<p>Must be able to verify that the resources exists.</p>

<p>Result: the location of the translation questions and an indicator whether it actually exists or not.</p>

<p>NOTE: Should the checks go to the chapter level? To the verse level?</p>

    </div>
  )
}

BookPackageTq.propTypes = {
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

export default withStyles(styles)(BookPackageTq);

