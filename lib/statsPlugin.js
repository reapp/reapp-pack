var fs = require('fs');
var path = require('path');

module.exports = function(config) {
  return function() {
    var excludeFromStats = [
      /node_modules[\\\/]react(-router)?[\\\/]/
    ];

    this.plugin('done', function(stats) {
      var statsPath = path.join(config.dir, 'build', 'stats.json');
      fs.writeFileSync(statsPath, JSON.stringify(stats.toJson({
        chunkModules: true,
        exclude: excludeFromStats
      })));
    });
  };
};