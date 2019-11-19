import { runWordCounts } from '../wordCountsTester.mjs';

const testinput = 'en_tn_42-MRK_occnotes.txt';
const ntotal = 2009;
const ndistinct = 581;

runWordCounts(testinput,ntotal,ndistinct);