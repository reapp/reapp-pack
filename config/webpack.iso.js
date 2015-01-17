// Not working! But this would be the config

var entry = './app/app.js';

module.exports = [
  // client
  {
    entry: entry,
    longTermCaching: true,
    separateStylesheet: true,
    minimize: true,
    devtool: 'source-map',
    target: 'client'
    // commonsChunk: true
  },

  // server
  {
    entry: entry,
    target: 'node'
  }
];