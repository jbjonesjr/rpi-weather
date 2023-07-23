import { spawn } from 'child_process';
import rtl_process from './src/rtl_process.js';

const mode = 'weather';
const weatherModels = ["-R", "166", "-R", "175"];
const allModels = [];

var options = {
  stdio: ["ignore", "pipe", process.stderr]
};
if (mode == 'weather') {
  var child = spawn("rtl_433", ["-f", "915M", "-F", "csv"].concat(weatherModels), options);
} else {
  var child = spawn("rtl_433", ["-f", "915M", "-F", "csv"].concat(allModels), options);
}

rtl_process.echoReadable(child.stdout);

/*

inspired by https://github.com/Ax-LED/pimatic-rtl433/blob/master/rtl433.coffee
for reference: https://github.com/merbanan/rtl_433
used code/strategy from: https://stackoverflow.com/a/65475259/464990

*/