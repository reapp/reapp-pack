module.exports = function(config) {
  // find modules to exclude from compilation
  var reappIncludeModules = [
      'reapp-ui',
      'reapp-routes',
      'reapp-component',
      'reapp-platform',
      'react-router'
    ].concat(config.parseModules || []);

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