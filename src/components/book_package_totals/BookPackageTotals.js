import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { all } from 'q';

async function bp_totals(bookId,delay,iterations,setVal) {
  // function to convert object to a map
  const obj_to_map = ( ob => {
    const mp = new Map();
    Object.keys ( ob ).forEach (k => { mp.set(k, ob[k]) });
    return mp;
  });

  let resourcePrefixes = ['uta-','utw-','utq-','utn-','ult-','ust-'];
  let ucounts = [];
  await (async function theLoop (iterations) {
    setTimeout(function () {
      if (--iterations) {      // If i > 0, keep going
        // skip first iteration
        console.log("iter",iterations);
        const bookarray = bookId.split(",");
        let all_map = new Map();
        let resource_map = new Map();
        let allPresent = true;

        for ( let ri = 0; ri < resourcePrefixes.length; ri++ ) {
          for ( let bi = 0; bi < bookarray.length; bi++ ) {
            let lsk = resourcePrefixes[ri]+bookarray[bi];
            let x = localStorage.getItem(lsk);
            if ( x === null ) {
              allPresent = false;
              break;
            }
            resource_map.set(lsk,x)
          }
        }

        if ( allPresent ) {
          console.log("All Present!");
          // sum over resources
          for ( let i = 0; i < ucounts.length; i++ ) {
            let umap = obj_to_map(JSON.parse(ucounts[i]));
            for ( let [k,v] of umap.entries() ) {
              let x = all_map.get(k);
              if ( x === undefined ) x = 0;
              all_map.set(k, x + v);
            }
          }
          let totalPackcageWordCount = 0;
          for ( let c of all_map.values() ) {
            totalPackcageWordCount = totalPackcageWordCount + c;
          }
          setVal(
            <Paper>
              <Typography variant="h6" gutterBottom>
                Total Word Count for "{bookId.toUpperCase()}" {totalPackcageWordCount}
              </Typography>
            </Paper>
          ); 
          return;
        }
        theLoop(iterations);   // Call the loop again, and pass it the current value of i
      } else {
        console.log("timeout on iter=",iterations)
        setVal("timeout")
      }
    }, delay);
  })(iterations);
}

function BookPackageTotals({
  bookId,
  delay,
  iterations,
  classes,
  style,
}) 
{
  const [_totals, setVal] = useState("Waiting");
  let _delay = delay;
  let _iterations = iterations;
  if ( _delay === undefined ) _delay = 1000;
  if ( _iterations === undefined ) _iterations = 1000;
  useEffect( () => {
    const fetchData = async () => {
      await bp_totals(bookId,_delay,_iterations,setVal);
    };
    fetchData();
  }, []); 
  // the parameter [] allows the effect to skip if value unchanged
  // an empty [] will only update on mount of component

  return (
    <div className={classes.root}>
      {_totals}
    </div>
  );
};

BookPackageTotals.propTypes = {
  /** @ignore */
  classes: PropTypes.object,
  /** The Book ID to package. */
  bookId: PropTypes.string.isRequired,
  /** milliseconds delay between iterations */
  delay: PropTypes.number,
  /** number of iterations before timing out */
  iterations: PropTypes.number,
  /** The overriding CSS for this component */
  style: PropTypes.object,
};

const styles = theme => ({
  root: {
  },
});

export default withStyles(styles)(BookPackageTotals);