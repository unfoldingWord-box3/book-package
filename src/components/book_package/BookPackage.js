import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import {fetchBookPackage} from './helpers';


function BookPackage({
  bookId,
  classes,
  style,
}) 
{
  const [_book, setVal] = useState(0);
  //let _book;
  useEffect( () => {
    fetchBookPackage(
      {username: 'unfoldingword', languageId:'en', bookId: bookId
    }).then(setVal);
  }); 
  console.log("bp _book:",_book)
  return (
    <div>
      {JSON.stringify(_book)}
    </div>
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
