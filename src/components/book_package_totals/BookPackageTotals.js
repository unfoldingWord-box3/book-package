import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';

import Paper from '@material-ui/core/Paper';
import { Collapse } from '@material-ui/core';

import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';
import MaterialTable from 'material-table';
import { forwardRef } from 'react';

import * as wc from 'uw-word-count';
import {bpstore} from '../../core/setupBpDatabase';

 
const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
};


async function bp_totals(delay,iterations,setVal) {
  const open = true; // for collapse component to manage its state
  // function to convert object to a map
  const obj_to_map = ( ob => {
    const mp = new Map();
    Object.keys ( ob ).forEach (k => { mp.set(k, ob[k]) });
    return mp;
  });

  let resourcePrefixes = ['uta-','utw-','utq-','utn-','ult-','ust-'];
  await (async function theLoop (iterations) {
    setTimeout( async function () {
      let tbid = await bpstore.getItem('bookid');
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
            let x = await bpstore.getItem(lsk);
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
              //let o = JSON.parse(v);
              let omap = obj_to_map(v.detail_article_map);
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
              //let o = JSON.parse(v);
              let omap = obj_to_map(v.detail_article_map);
              for ( let [x,y] of omap.entries() ) {
                // Key x is the utw article
                if ( utw_dedup.get(x) ) { continue; }
                utw_dedup.set(x,y.wordFrequency);
              }
            }
          }
          // add in utw contribution
          for ( let v of utw_dedup.values() ) {
            let y = obj_to_map(v);
            for ( let [m,n] of y.entries() ) {
              let z = all_map.get(m);
              if ( z === undefined ) z = 0;
              all_map.set(m, z + n);
            }
          }

          //console.log("Post UTA/W all_map",all_map)
          // sum over resources
          for ( let [k,v] of resource_map.entries() ) {
            if ( k.startsWith("uta") ) {
              continue;
            } else if ( k.startsWith("utw") ) {
              continue;
            } else {
              //let x = obj_to_map(JSON.parse(v));
              let x = obj_to_map(v);
              let y = obj_to_map(x.get('wordFrequency'));
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
        
          let wf = wc.map_to_obj(all_map);
          let mt = wc.wf_to_mt(wf);
          setVal(
            <Paper>
              <Typography variant="h6" gutterBottom>
                Total Word Count for "{tbid.toUpperCase()}" <strong>{totalPackcageWordCount}</strong>
              </Typography>
              <Collapse in={open} component="details">
                <div id="details">
                  <MaterialTable
                    icons={tableIcons}
                    title={mt.title}
                    columns={mt.columns}
                    data={mt.data}
                  />
                </div>
              </Collapse>
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
  const [_totals, setVal] = useState(<CircularProgress />);
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


/*

              <MaterialTable
                icons={tableIcons}
                title={mt.title}
                columns={mt.columns}
                data={mt.data}
                options={mt.options}
              />

*/