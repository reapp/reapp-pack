var WebpackDevServer = require('webpack-dev-server');
var webpack = require('webpack');

function setConfigBase(config, base) {
  config.output.publicPath = base;
}

function setConfigsBase(config, base) {
  if (Array.isArray(config))
    config.forEach(function(config) {
      setConfigBase(config, base);
    });
  else
    setConfigBase(config, base);
}

module.exports = function(config, opts, cb) {
  var hostname = opts.hostname || 'localhost';
  var base = 'http://' + hostname + ':' + opts.port + '/';

  // set publicPath to point to base path
  setConfigsBase(config, base);

  var webpackDevServerOpts = {
    contentBase: opts.dir,
    quiet: false,
    hot: opts.hot,
    progress: true,
    stats: {
      colors: true,
      timings: true
    }
  };

  if (opts.debug)
    console.log(
      'Webpack Dev Server Opts:'.blue.bold,
      "\n", webpackDevServerOpts, "\n"
    );

  console.log('Building with Webpack...');
  if (opts.debug)
    console.log('Webpack server on http://%s:%s', hostname, opts.port);

  var compiler = webpack(config);

  // done callback
  compiler.plugin('done', function(stats) {
    setTimeout(function() {
      var warnings = stats.compilation.warnings;
      var firstWarning = warnings && warnings.length && warnings[0];

      if (firstWarning.name === 'CriticalDependenciesWarning') {
        console.log();
        console.log('Note: you have a require warning on your routes, this is ok!'.green);
      }

      console.log();
      console.log('Build took %s seconds', (stats.endTime - stats.startTime) / 1000);

      if (cb)
        cb(stats);
    }, 50);
  });

  var webpackServer = new WebpackDevServer(compiler, webpackDevServerOpts);

  webpackServer.listen(opts.port, hostname);
};