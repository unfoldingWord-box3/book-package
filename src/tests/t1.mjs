let x = `<u>beautiful</u>`;

console.log(x);
console.log(x.replace(/<.*?>(.*?)<\/.*?>/g, '$1'))