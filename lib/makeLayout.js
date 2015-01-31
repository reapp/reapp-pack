var fs = require('fs');

module.exports = function makeLayout(opts) {
  var base = '/';

  // add hostname/port if needed
  if (opts.hostname || opts.port) {
    var hostname = opts.hostname || 'localhost';
    base = 'http://' + hostname + ':' + opts.port + '/';
  }

  var layout = fs.readFileSync(opts.template).toString();

  if (opts.debug)
    console.log('making layout with scripts: ', opts.scripts);

  var scripts = opts.scripts.map(function(key) {
    return '<script src="' + base + key + '.js"></script>';
  });

  var styles = (opts.styles || []).map(function(key) {
    return '<link rel="stylesheet" type="text/css" href="' + base + key + '" />';
  });

  var newLine = "\n";
  return layout
    .replace('<!-- SCRIPTS -->', scripts.join(newLine))
    .replace('<!-- STYLES -->', styles.join(newLine));
}