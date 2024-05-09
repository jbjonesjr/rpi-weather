// Importing necessary modules
var LineByLineReader = require('line-by-line');
let rtl_process = require("../src/rtl_process.js");
let db_mocks = require("./db_mocks.js"); // Importing the database mocks

console.log(__dirname);
lr = new LineByLineReader(__dirname+'/../data/raw.input');

lr.on('error', function (err) {
    // 'err' contains error object
  });
  
  lr.on('line', function (line) {
    // pause emitting of lines...
    lr.pause();
   
    // Using the mocked process_input function for testing
    db_mocks.process_input(line);

    setTimeout(function () {
  
        // ...and continue emitting lines.
        lr.resume();
    }, 2000);
  });
  
  lr.on('end', function () {
    // All lines are read, file is closed now.
  });
