
const fs = require('fs');
let rtl_process = require("../../src/rtl-publish/rtl_process.js");

console.log(__dirname);
fs.readFile(__dirname+'/../data/raw.input', 'utf8', function(err, data) {
    if (err) throw err;
    eval(data).forEach(function(item) {
        rtl_process.process_input(item);
    });
});
