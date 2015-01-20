var fs = require('fs');
var path = require('path');

module.exports = function(opts, config) {
  return function() {
    var excludeFromStats = [
      /node_modules[\\\/]react(-router)?[\\\/]/,
      /node_modules[\\\/]items-store[\\\/]/
    ];

    this.plugin('done', function(stats) {
      var statsPath = path.join(opts.dir, 'build', 'stats.json');
      fs.writeFileSync(statsPath, JSON.stringify(stats.toJson({
        chunkModules: true,
        exclude: excludeFromStats
      })));
    });
  };
};