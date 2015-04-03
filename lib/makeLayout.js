var fs = require('fs');

module.exports = function makeLayout(opts) {
  var base = '';

  // add hostname/port if needed
  if (opts.hostname || opts.port) {
    var hostname = opts.hostname || 'localhost';
    base = 'http://' + hostname + ':' + opts.port + '/';
  }

  if (opts.debug)
    console.log('Copying layout %s', opts.template);

  // read layout
  var layout;
  try {
    layout = fs.readFileSync(opts.template);
  }
  catch (e) {
    console.error("Couldn't find your template file, loading default".yellow, "\n");
    layout = fs.readFileSync(__dirname + '/../assets/index.html');
  }

  layout = layout.toString();

  if (opts.debug) {
    console.log('Layout:', layout);
    console.log('Making layout with scripts: ', opts.scripts);
  }

  var scripts = opts.scripts.map(function(key) {
    return '<script src="' + base + key + '.js"></script>';
  });

  var styles = (opts.styles || []).map(function(key) {
    return '<link rel="stylesheet" type="text/css" href="' + base + key + '" />';
  });

  var newLine = "\n";
  var result = layout
    .replace('<!-- SCRIPTS -->', scripts.join(newLine))
    .replace('<!-- STYLES -->', styles.join(newLine));

  return result;
}