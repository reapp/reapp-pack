var fs = require('fs');
var path = require('path');

module.exports = function(opts, config) {
  return function() {
    if (config.prerender)
      return;

    this.plugin('done', function(stats) {
      var statsPath = path.join(opts.dir, 'build', 'stats.json');
      fs.writeFileSync(statsPath, JSON.stringify(stats.toJson({
        chunkModules: true,
        exclude: [(/node_modules[\\\/]react/)]
      })));
    });
  };
};