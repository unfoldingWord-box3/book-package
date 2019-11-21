import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

async function bp_totals(bookId,delay,iterations,setVal) {
    // function to convert object to a map
    const obj_to_map = ( ob => {
      const mp = new Map();
      Object.keys ( ob ).forEach (k => { mp.set(k, ob[k]) });
      return mp;
  });

  const uta = 0;
  const utw = 1;
  const utq = 2;
  const utn = 3;
  const ult = 4;
  const ust = 5;

  let _iterations = iterations;
  let ucounts = [];
  await (async function theLoop (iterations) {
    setTimeout(function () {
      if (--iterations) {      // If i > 0, keep going
        // skip first iteration
        //console.log("iter",iterations);
        if ( (_iterations - iterations) > 1 ) {
          ucounts[uta] = localStorage.getItem('uta-'+bookId);
          ucounts[utw] = localStorage.getItem('utw-'+bookId);
          ucounts[utq] = localStorage.getItem('utq-'+bookId);
          ucounts[utn] = localStorage.getItem('utn-'+bookId);
          ucounts[ult] = localStorage.getItem('ult-'+bookId);
          ucounts[ust] = localStorage.getItem('ust-'+bookId);
          let allPresent = true;
          for ( let i = 0; i < ucounts.length; i++ ) {
            if ( ucounts[i] === null ) {
              allPresent = false;
              break;
            }
          }

          if ( allPresent ) {
            // sum over resources
            let all_map = new Map();
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
        }
        theLoop(iterations);   // Call the loop again, and pass it the current value of i
      } else {
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
  if ( _delay === undefined ) _delay = 500;
  if ( _iterations === undefined ) _iterations = 100;
  useEffect( () => {
    const fetchData = async () => {
      await bp_totals(bookId,_delay,_iterations,setVal);
      /*
      setVal(
        <Paper className={classes.paper} >
          <Typography variant="h5" gutterBottom>
            Package Totals for "{bookId.toUpperCase()}" <br/>
            {result}
          </Typography>
        </Paper>
      ); 
      */   
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