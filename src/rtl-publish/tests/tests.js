
var LineByLineReader = require('line-by-line');
let rtl_process = require("../src/rtl_process.js");

console.log(__dirname);
lr = new LineByLineReader(__dirname+'/../data/raw.input');

lr.on('error', function (err) {
    // 'err' contains error object
  });
  
  lr.on('line', function (line) {
    // pause emitting of lines...
    lr.pause();
   
    rtl_process.process_input(line);

    setTimeout(function () {
  
        // ...and continue emitting lines.
        lr.resume();
    }, 2000);
  });
  
  lr.on('end', function () {
    // All lines are read, file is closed now.
  });
