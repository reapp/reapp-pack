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

module.exports = function(config, opts) {
  var hostname = opts.hostname || 'localhost';
  var base = 'http://' + hostname + ':' + opts.port + '/';

  // set publicPath to point to base path
  setConfigsBase(config, base);

  var webpackDevServerOpts = {
    contentBase: '../', //opts.dir,
    quiet: !opts.debug,
    lazy: true,
    hot: true, // todo: make dynamic
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

  var webpackServer = new WebpackDevServer(
    webpack(config), webpackDevServerOpts
  );

  console.log('Starting Webpack server on', hostname, opts.port, '...');
  webpackServer.listen(opts.port, hostname);
};