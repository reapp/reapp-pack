// this is a webpack config that takes a number of options
// to let you build different style bundles
// based on the webpack react example

var path = require('path');
var webpack = require('webpack');
var ReactStylePlugin = require('react-style-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var joinEntry = require('./lib/joinEntry');
var statsPlugin = require('./lib/statsPlugin');
var linkModules = require('./lib/linkModules');

// config:
//   entry: entrypoint file
//   target: 'node' or 'client'
//   devServer: true/false for webpack-dev-server
//   devtool: specify webpack devtool
//   hot: use react-hot-loader
//   vendorChunk: split node_modules into vendor.js chunk
//   commonsChunk: split common files into commons.js chunk
//   longTermCaching: use hash name with files
//   minimize: uglify and dedupe

var opts;

module.exports = {
  makeConfig: function(configs, _opts) {
    opts = _opts;

    if (opts.linkModules)
      linkModules(opts.dir);

    if (Array.isArray(configs))
      return configs.map(_makeConfig);
    else
      return _makeConfig(configs);
  },

  webpack: webpack
};

function _makeConfig(config) {
  var node = config.target === 'node';
  var client = config.target === 'client';

  if (opts.debug) {
    console.log("Making webpack config with:\n", config, "\n");
  }

  // LOADERS
  var loaders = [
    { test: /\.json$/, loader: 'json-loader' },
    { test: /\.png|jgp|jpeg|gif|svg$/, loader: 'url-loader?limit=10000' },
    { test: /\.html$/, loader: 'html-loader' }
  ];

  var jsTest = /\.jsx?$/;

  if (opts.hot) {
    loaders.push({ test: /\.jsx$/, loader: 'react-hot' });
  }

  if (node) {
    loaders.push({ test: jsTest, loader: ReactStylePlugin.loader() });
  }

  loaders.push({
    test: jsTest,
    loader: '6to5-loader?experimental=true&runtime=true',
    exclude: /socket\.io/
  });

  // style loaders
  var cssLoader = 'css-loader!autoprefixer-loader?browsers=last 2 version';
  var stylesheetLoaders = [
    { test: /\.css$/, loader: cssLoader },
    { test: /\.styl$/, loader: cssLoader + '!stylus-loader' }
  ];

  // various ways of handling stylesheet requires
  stylesheetLoaders.forEach(function(stylesheetLoader) {
    var loader = stylesheetLoader.loader;

    if (node)
      stylesheetLoader.loader = 'null-loader';
    else if (config.separateStylesheet)
      stylesheetLoader.loader = ExtractTextPlugin.extract('style-loader', loader);
    else
      stylesheetLoader.loader = 'style-loader!' + loader;
  });


  // WEBPACK CONFIG

  var entry = config.entry;

  // allow shorthand for single entry
  if (typeof entry === 'string') {
    entry = { main: entry };
  }

  if (config.vendorChunk)
    entry.vendor = Object.keys(require(opts.dir + '/package.json').dependencies);

  var alias = {};
  var aliasLoader = {};
  var externals = [];
  var modulesDirectories = [
    'web_modules',
    'node_modules',
    'server_modules',

    // this adds a shorthand so you can require stuff from your
    // app folder without needing all the relative path fragility
    'app'
  ];

  var extensions = ['', '.web.js', '.js', '.jsx'];
  var root = [path.join(opts.dir, 'app', 'app')];

  var output = {
    path: path.join(opts.dir, 'build',
      node ? 'prerender' : 'public'),

    filename: '[name].js' +
      (config.longTermCaching ? '?[chunkhash]' : ''),

    chunkFilename: (config.commonsChunk ? '[name].js' : '[id].js') +
      (config.longTermCaching ? '?[chunkhash]' : ''),

    publicPath: '/',
    sourceMapFilename: 'debugging/[file].map',
    libraryTarget: node ? 'commonjs2' : undefined,
    pathinfo: opts.debug
  };


  // PLUGINS

  var plugins = [
    // provides a single 6to5 runtime, works in combination with &runtime=true on 6to5 loader
    new webpack.ProvidePlugin({
       to5Runtime: "imports?global=>{}!exports-loader?global.to5Runtime!6to5/runtime"
     }),

    // trying the new watching plugin
    // new webpack.NewWatchingPlugin(),

    // optimize react building
    new webpack.PrefetchPlugin('react'),
    new webpack.PrefetchPlugin('react/lib/ReactComponentBrowserEnvironment'),

    // set process.env for modules
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(node ? 'production' : 'development')
      }
    })
  ];

  // outputs build stats to ./build/stats.json
  // if (node)
  //   plugins.push(statsPlugin(opts, config));

  // if (node)
  //   plugins.push(new ReactStylePlugin('bundle.css'));

  if (node) {
    aliasLoader['react-proxy$'] = 'react-proxy/unavailable';
    externals.push(/^react(\/.*)?$/);
    plugins.push(new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }));
  }

  if (opts.hot) {
    plugins.push(new webpack.HotModuleReplacementPlugin());
    plugins.push(new webpack.NoErrorsPlugin());

    entry = joinEntry('webpack/hot/only-dev-server', entry);
  }

  if (config.vendorChunk) {
    plugins.push(new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js'));
  }

  if (config.commonsChunk)
    plugins.push(
      new webpack.optimize.CommonsChunkPlugin('commons', 'commons.js' +
        (config.longTermCaching && !node ? '?[chunkhash]' : '')));

  if (config.devServer && client)
    entry = joinEntry('webpack-dev-server/client?http://localhost:' + opts.wport, entry);

  if (config.separateStylesheet)
    plugins.push(new ExtractTextPlugin('[name].css'));

  if (config.minimize)
    plugins.push(
      new webpack.optimize.UglifyJsPlugin(),
      new webpack.optimize.DedupePlugin()
    );


  // RETURN

  var webpackConfig = {
    entry: entry,
    output: output,
    target: node ? 'node' : 'web',
    module: {
      loaders: loaders.concat(stylesheetLoaders)
    },
    devtool: opts.devtool || config.devtool || 'eval',
    debug: opts.debug,
    resolveLoader: {
      root: [
        path.join(opts.dir, 'node_modules'),
        path.join(opts.dir, 'server_modules')
      ],
      alias: aliasLoader
    },
    externals: externals,
    resolve: {
      root: root,
      modulesDirectories: modulesDirectories,
      extensions: extensions,
      alias: alias,
    },
    plugins: plugins
  };

  if (opts.debug) {
    console.log('Webpack config:');
    console.log(webpackConfig);
    console.log();
  }

  return webpackConfig;
}