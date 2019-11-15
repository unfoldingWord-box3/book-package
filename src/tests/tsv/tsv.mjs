import * as fs from 'fs';


let testinput = "./input.tsv";

const tsvParse = (tsv) => {
  try {
    return tsv.split('\n').map(row => row.trim().split('\t'));
  } catch(error) {
    return null;
  }
};
const tsvParse1 = (tsv) => {
  try {
    let x = tsv.split('\n').map(row => row.trim().split('\t'));
    return x.slice(0,x.length-1)
  } catch(error) {
    return null;
  }
};

fs.readFile(testinput, (err, data) => {
    if (err) throw err;
    data = ""+data;
    const rows1 = tsvParse(data)
    console.log(rows1.length);
    const rows2 = tsvParse1(data)
    console.log(rows2.length);
});
