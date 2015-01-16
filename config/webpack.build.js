// Sample production config

// splits into two bundles
// 1. common files only with source map
// 2. pre-rendered app

module.exports = [
  {
    entry: './app/app.js',
    commonsChunk: true,
    longTermCaching: true,
    separateStylesheet: false,
    minimize: true,
    devtool: 'source-map'
  },

  {
    entry: './app/app.js',
    prerender: true,
    minimize: true,
    devtool: 'source-map'
  }
];