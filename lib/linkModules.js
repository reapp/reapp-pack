var fs = require('fs');
var mkdirp = require('mkdirp');

function linkModules(toDir) {
  mkdirp.sync(toDir + '/server_modules');
  copyWebpackModules(toDir);
}

function copyWebpackModules(toDir) {
  var fromDir = __dirname + '/..';
  var modules = require(fromDir + '/package.json').dependencies;

  Object.keys(modules).forEach(function(packageName) {
    var srcModule = fromDir + '/node_modules/' + packageName;
    var destModule = toDir + '/server_modules/' + packageName;

    if (!fs.existsSync(destModule)) {
      fs.symlink(srcModule, destModule, 'dir');
    }
  });
}

module.exports = linkModules;