import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';


async function bp_totals(delay,iterations,setVal) {
  // function to convert object to a map
  const obj_to_map = ( ob => {
    const mp = new Map();
    Object.keys ( ob ).forEach (k => { mp.set(k, ob[k]) });
    return mp;
  });

  let resourcePrefixes = ['uta-','utw-','utq-','utn-','ult-','ust-'];
  await (async function theLoop (iterations) {
    setTimeout(function () {
      let tbid = localStorage.getItem('bookid');
      if ( tbid === null ) {
        setVal("Please run BookPackageRollup")
      } else if (--iterations) {      // If i > 0, keep going
        const bookarray = tbid.split(",");
        let all_map = new Map();
        let resource_map = new Map();
        let allPresent = true;

        for ( let ri = 0; ri < resourcePrefixes.length; ri++ ) {
          for ( let bi = 0; bi < bookarray.length; bi++ ) {
            let lsk = resourcePrefixes[ri]+bookarray[bi];
            let x = localStorage.getItem(lsk);
            if ( x === null ) {
              allPresent = false;
              console.log("iter",iterations,",missing:",lsk);
              break;
            }
            resource_map.set(lsk,x)
          }
        }

        if ( allPresent ) {
          console.log("All Present!");
          //
          // process uta: dedup first
          //
          let uta_dedup = new Map();
          for ( let [k,v] of resource_map.entries() ) {
            if ( k.startsWith("uta") ) {
              let o = JSON.parse(v);
              let omap = obj_to_map(o);
              for ( let [x,y] of omap.entries() ) {
                // Key x is the uta article
                if ( uta_dedup.get(x) ) { continue; }
                uta_dedup.set(x,y.wordFrequency);
              }
            }
          }
          // add in uta contribution
          for ( let v of uta_dedup.values() ) {
            let y = obj_to_map(v);
            for ( let [m,n] of y.entries() ) {
              let z = all_map.get(m);
              if ( z === undefined ) z = 0;
              all_map.set(m, z + n);
            }
          }
          //
          // process utw: dedup first
          //
          let utw_dedup = new Map();
          for ( let [k,v] of resource_map.entries() ) {
            if ( k.startsWith("utw") ) {
              let o = JSON.parse(v);
              let omap = obj_to_map(o);
              for ( let [x,y] of omap.entries() ) {
                // Key x is the utw article
                if ( utw_dedup.get(x) ) { continue; }
                utw_dedup.set(x,y.allWords);
              }
            }
          }
          // add in utw contribution
          for ( let v of utw_dedup.values() ) {
            for ( let i=0; i < v.length; i++ ) {
              let z = all_map.get(v[i]);
              if ( z === undefined ) z = 0;
              z++;
              all_map.set(v[i], z);
            }
          }
          // sum over resources
          for ( let [k,v] of resource_map.entries() ) {
            if ( k.startsWith("uta") ) {
              continue;
            } else if ( k.startsWith("utw") ) {
              continue;
            } else {
              let y = obj_to_map(JSON.parse(v));
              for ( let [m,n] of y.entries() ) {
                let z = all_map.get(m);
                if ( z === undefined ) z = 0;
                all_map.set(m, z + n);
              }
            }
          }

          let totalPackcageWordCount = 0;
          for ( let c of all_map.values() ) {
            totalPackcageWordCount = totalPackcageWordCount + c;
          }
          setVal(
            <Paper>
              <Typography variant="h6" gutterBottom>
                Total Word Count for "{tbid.toUpperCase()}" {totalPackcageWordCount}
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
  delay,
  iterations,
  classes,
  style,
}) 
{
  const [_totals, setVal] = useState("Waiting-BookPackageTotals");
  let _delay = delay;
  let _iterations = iterations;
  if ( _delay === undefined ) _delay = 1000;
  if ( _iterations === undefined ) _iterations = 1000;
  useEffect( () => {
    const fetchData = async () => {
      await bp_totals(_delay,_iterations,setVal);
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