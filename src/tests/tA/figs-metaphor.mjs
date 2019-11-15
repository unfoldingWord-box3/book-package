import { runWordCounts } from '../wordCountsTester.mjs';

const testinput = 'figs-metaphor.txt';
const ntotal = 2960;
const ndistinct = 594;

runWordCounts(testinput,ntotal,ndistinct);