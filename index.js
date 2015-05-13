// config:
//   entry: entrypoint file
//   target: 'node' or 'client'
//   server: true/false for webpack-dev-server
//   devtool: specify webpack devtool
//   commonsChunk: split common files into commons.js chunk
//   longTermCaching: use hash name with files
//   minify: uglify and dedupe
//   debug (bool): output debug info
//   dir: (string): absolute path to app dir
//   hot: (bool): use hot reloading
//   port (number): webpack port

var colors = require('colors');
var path = require('path');
var webpack = require('webpack');
// var ReactStylePlugin = require('react-style-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var util = require('util');
var joinEntry = require('./lib/joinEntry');
var statsPlugin = require('./lib/statsPlugin');
var linkModules = require('./lib/linkModules');

function makeAll(configs) {
  if (Array.isArray(configs))
    return configs.map(make);
  else
    return make(configs);
}

// makes from a single config object
function make(config) {
  // defaults
  config.env = config.env || 'development';
  config.debug = process.env.DEBUG || config.debug;
  config.dir = process.env.DIR || config.dir;
  config.target = process.env.TARGET || config.target;
  config.hostname = config.hostname || 'localhost';
  config.platform = config.platform;

  // target
  var node = config.target === 'node';
  var web = config.target === 'web';

  if (config.debug)
    console.log("Making webpack config with:\n".bold.blue, config, "\n");

  if (config.linkModules)
    linkModules(config, config.dir + '/server_modules');

  // LOADERS
  var loaders = [
    { test: /\.json$/, loader: 'json-loader' },
    { test: /\.(png|jpg|jpeg|gif)$/, loader: 'url-loader?limit=10000&name=[name].[ext]' },
    { test: /\.svg$/, loader: 'raw-loader' },
    { test: /\.html$/, loader: 'file-loader?name=[name].[ext]' },
    { test: /\.worker\.js$/, loader: 'worker-loader?inline=true' }
  ]
  .concat(config.loaders || []);

  if (config.hot)
    loaders.push({ test: /\.jsx$/, loader: 'react-hot' });

  // if (node)
  //   loaders.push({ test: /\.jsx?$/, loader: ReactStylePlugin.loader() });

  try {
    var entry = require(config.dir + '/package.json')["main"];
    var entryDir = path.normalize(path.dirname(config.dir + '/' + entry));
  }
  catch (e) {}

  loaders.push({
    test: /\.jsx?$/,
    loader: 'babel-loader?{"stage": 0, "optional": ["bluebirdCoroutines"]}',
    include: entryDir || config.dir + '/app',
    exclude: /node_modules/
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

  var alias = config.alias || {};
  var aliasLoader = config.aliasLoader || {};
  var externals = config.externals || [];
  var modulesDirectories = config.modulesDirectories || [
    'node_modules',
    'web_modules',
    'server_modules',
    // this adds a shorthand so you can require anything in ./app
    // without using relative paths
    'app'
  ];

  var extensions = config.extensions || ['', '.web.js', '.js', '.jsx'];

  var root = config.root || [path.join(config.dir)];

  var fallback = (config.fallback || ['node_modules', 'server_modules']).map(function(moduleDir) {
    return config.dir + '/' + moduleDir
  })

  var output = {
    path: path.join(config.dir, 'build',
      node ? 'prerender' : config.platform || 'public'),

    filename: '[name].js' +
      (config.longTermCaching ? '?[chunkhash]' : ''),

    chunkFilename: (config.commonsChunk ? '[name].js' : '[id].js') +
      (config.longTermCaching ? '?[chunkhash]' : ''),

    publicPath: '/',
    sourceMapFilename: 'debugging/[file].map',
    libraryTarget: node ? 'commonjs2' : undefined,
    pathinfo: config.debug
  };


  // PLUGINS

  var plugins = [
    // set process.env for modules
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(config.env),
        TARGET: JSON.stringify(config.target),
        PLATFORM: JSON.stringify(config.platform || 'web'),
        DISABLE_RAF: JSON.stringify(config.disableRAFBatching)
      }
    })
  ];

  // prefetch
  var prefetches = config.prefetch ||
    ['react', 'react/lib/ReactComponentBrowserEnvironment'];

  prefetches.forEach(function(prefetch) {
    plugins.push(new webpack.PrefetchPlugin(prefetch));
  });

  // outputs build stats to ./build/stats.json
  if (config.debug)
    plugins.push(statsPlugin(config));

  // todo: awaiting new version of react-style
  // if (config.separateStylesheet)
  //   plugins.push(new ReactStylePlugin('bundle.css'));

  if (node) {
    aliasLoader['react-proxy$'] = 'react-proxy/unavailable';
    externals.push(/^react(\/.*)?$/);
    plugins.push(new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }));
  }

  if (config.hot) {
    plugins.push(new webpack.HotModuleReplacementPlugin());
    plugins.push(new webpack.NoErrorsPlugin());
    entry = joinEntry('webpack/hot/only-dev-server', entry);
  }

  if (config.commonsChunk)
    plugins.push(
      new webpack.optimize.CommonsChunkPlugin('commons', 'commons.js' +
        (config.longTermCaching && !node ? '?[chunkhash]' : '')));

  if (config.server && web)
    entry = joinEntry('webpack-dev-server/client?http://' + config.hostname + ':' + (config.port || 3011), entry);

  if (config.separateStylesheet)
    plugins.push(new ExtractTextPlugin('[name].css'));

  if (config.minify)
    plugins.push(
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      }),
      new webpack.optimize.DedupePlugin()
    );

  // globals will be in every module
  if (config.globals)
    plugins.push(new webpack.ProvidePlugin(config.globals));

  // user defined plugins
  if (config.plugins)
    plugins.push(config.plugins);

  // RETURN

  var webpackConfig = {
    hostname: config.hostname,
    entry: entry,
    output: output,
    target: config.target,
    module: Object.assign({
      loaders: loaders.concat(stylesheetLoaders)
    }, config.module),
    devtool: config.devtool || 'eval',
    debug: config.debug,
    resolveLoader: {
      root: config.linkModules ?
        path.join(config.dir, 'server_modules') :
        path.join(config.dir, 'node_modules'),
      alias: aliasLoader
    },
    externals: externals,
    resolve: {
      root: root,
      modulesDirectories: modulesDirectories,
      extensions: extensions,
      alias: alias,
      fallback: fallback
    },
    plugins: plugins
  };

  if (config.debug) {
    console.log('Webpack config:'.bold.blue);
    console.log(util.inspect(webpackConfig, { depth: 10 }));
    console.log();
  }

  return webpackConfig;
}

module.exports = makeAll;