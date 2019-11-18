import { runWordCounts } from '../wordCountsTester.mjs';

const testinput = 'en_tn_42-MRk_occnotes.txt';
const ntotal = 769;
const ndistinct = 222;

runWordCounts(testinput,ntotal,ndistinct);