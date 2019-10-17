import React, {Suspense} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import {fetchBookPackage} from './helpers';


function BookPackage({
  bookId,
  classes,
  style,
}) 
{
  let _book;
  _book = fetchBookPackage(
    {username: 'unfoldingword', languageId:'en', bookId: bookId
  });
  console.log("bp _book:",_book)
  return (
    <Suspense fallback={<div>Loading...</div>}>
    <div>
      {JSON.stringify(_book)}
    </div>
    </Suspense>
  );

};

BookPackage.propTypes = {
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

export default withStyles(styles)(BookPackage);
