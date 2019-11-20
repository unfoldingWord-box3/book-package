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


  let _iterations = iterations;
  let uta_count;
  let utw_count;
  await (async function theLoop (iterations) {
    setTimeout(function () {
      console.log("bp_totals(), i=",iterations, delay);
      if (--iterations) {      // If i > 0, keep going
        // skip first iteration
        if ( (_iterations - iterations) > 4 ) {
          uta_count = localStorage.getItem('uta-'+bookId);
          utw_count = localStorage.getItem('utw-'+bookId);
          if ( uta_count !== null ) {
            if ( utw_count !== null ) {
              let uta1 = JSON.parse(uta_count);
              let utw1 = JSON.parse(utw_count);
              let uta1_map = obj_to_map(uta1);
              let utw1_map = obj_to_map(utw1);
              let all_map = new Map();
              for ( var [ka,va] of uta1_map.entries() ) {
                let x = all_map.get(ka);
                if ( x === undefined ) x = 0;
                all_map.set(ka, x + parseInt(va, 10));
              }
              for ( var [kw,vw] of utw1_map.entries() ) {
                let x = all_map.get(kw);
                if ( x === undefined ) x = 0;
                all_map.set(kw, x + parseInt(vw,10));
              }
              //console.log("all",all_map);
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
  if ( _delay === undefined ) _delay = 1000;
  if ( _iterations === undefined ) _iterations = 10;
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