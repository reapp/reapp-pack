var colors = require('colors');

function webpackCallback(err, stats) {
  if (err) {
    console.log('Error:');
    console.log(err);
  }
  else {
    var statsObj = stats.toJson({ errorDetails: true });

    if (statsObj.warnings.length) {
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

function prettyArr(arr) {
  var newLines = "\n\n";

  arr.forEach(function(item) {
    if (Array.isArray(item))
      prettyArr(item);

    if (item)
      console.log(item, newLines);
  });
}

module.exports = webpackCallback;