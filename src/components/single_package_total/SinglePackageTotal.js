import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

import * as tw from '../../core/timeout-watcher';
import {bpstore} from '../../core/setupBpDatabase';

 


function SinglePackageTotal({
  interval,
  iterations,
  bookId,
  classes,
  style,
}) 
{
  const [_total, setVal] = useState(<CircularProgress />);
  let _interval = interval;
  let _iterations = iterations;
  if ( _interval === undefined ) _interval = 1000;
  if ( _iterations === undefined ) _iterations = 1000;

  const onIteration = async () => {
    let resourcePrefixes = ['uta-','utw-','utq-','utn-','ult-','ust-'];
    let obsResourePrefixes = ['utw-','utq-','utn-']
    let total    = 0;
    
    for ( let ri = 0; ri < resourcePrefixes.length; ri++ ) {
      if ( bookId === 'obs' ) {
        if ( resourcePrefixes[ri] === obsResourePrefixes[0] ||
             resourcePrefixes[ri] === obsResourePrefixes[1] ||
             resourcePrefixes[ri] === obsResourePrefixes[2]
        ) {
          // let it pass
        } else {
          continue; // skip it! obs only has the three resource types
        }
      }
      let lsk = resourcePrefixes[ri]+bookId;
      let x = await bpstore.getItem(lsk);
      if ( x === null ) { 
        console.log("Missing:", lsk);
        return false; 
      }
      console.log("Found:", lsk)
      total    = total    + (x.total    ? x.total    : x.grandTotalWordCount   );
    }
  
    setVal(<span> Book Package Word Count: {total.toLocaleString()} </span>);
    return true;
  }
  
  const onTimeout = () => {
    setVal(<span> TIMEOUT! </span>)
  }

  useEffect( () => {
    const fetchData = async () => {
      await tw.timeoutWatcher(_interval,_iterations,onIteration,onTimeout);
    };
    fetchData();
  }, []); 
  // the parameter [] allows the effect to skip if value unchanged
  // an empty [] will only update on mount of component
  return (
    <>{_total}</>
  );
};

SinglePackageTotal.propTypes = {
  /** @ignore */
  classes: PropTypes.object,
  /** milliseconds delay between iterations */
  interval: PropTypes.number,
  /** number of iterations before timing out */
  iterations: PropTypes.number,
  /** The overriding CSS for this component */
  style: PropTypes.object,
};

const styles = theme => ({
  root: {
  },
});

export default withStyles(styles)(SinglePackageTotal);


