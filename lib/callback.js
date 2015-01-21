var colors = require('colors');

function webpackCallback(opts) {
  return function(err, stats) {
    if (err) {
      console.log('Error:');
      console.log(err);
    }
    else {
      var statsObj = stats.toJson({ errorDetails: true });

      if (opts.debug && statsObj.warnings.length) {
        console.log('Had warnings:'.yellow.bold);
        console.log(prettyArr(statsObj.warnings), "\n\n");
      }

      if (statsObj.errors.length) {
        console.log('Had errors:'.red.bold);
        console.log(prettyArr(statsObj.errors), "\n\n");
      }

      console.log('Build complete'.green.bold);
    }
  }
}

var newLines = "\n\n";

function prettyArr(arr) {
  arr.forEach(function(item) {
    if (Array.isArray(item))
      prettyArr(item);

    if (item)
      console.log(item, newLines);
  });

  console.log();
}

module.exports = webpackCallback;