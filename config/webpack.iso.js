// Not working! But this would be the config

var pack = require('reapp-pack');
var entry = './app/app.js';

module.exports = pack([
  // client
  {
    entry: entry,
    longTermCaching: true,
    separateStylesheet: true,
    minimize: true,
    devtool: 'source-map',
    target: 'client'
  },

  // server
  {
    entry: entry,
    target: 'node'
  }
]);