import { runWordCounts } from '../wordCountsTester.mjs';

const testinput = 'en_tn_42-MRK_occnotes.txt';
const ntotal = 32596;
const ndistinct = 2630;

runWordCounts(testinput,ntotal,ndistinct);