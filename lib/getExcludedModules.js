// selectively include modules for babel parsing in your node_modules

module.exports = function(config) {
  // find modules to exclude from compilation
  var reappIncludeModules = config.parseModules || [];

  if (!reappIncludeModules.length)
    return /node_modules/;

  var userModules = Object.keys(require(config.dir + '/package.json').dependencies);
  var excludeModules = userModules.filter(function(dep) {
    return reappIncludeModules.indexOf(dep) === -1;
  }).map(function(name) {
    return escapeRegExp('node_modules/' + name + '/');
  });

  excludeModules = excludeModules.concat(
    config.excludeModules || [],
    'socket\\.io'
  );

  if (config.debug)
    console.log('Not running babel on modules...', excludeModules.join(', '), "\n");

  return new RegExp(excludeModules.join('|'))
}

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}