import { runWordCounts } from '../wordCountsTester.mjs';

const testinput = 'en_tn_19-PSA_occnotes.txt';
const ntotal = 771;
const ndistinct = 220;

runWordCounts(testinput,ntotal,ndistinct);