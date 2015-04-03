// Not working! But this would be the config

var pack = require('reapp-pack');

module.exports = pack([
  // client
  {
    longTermCaching: true,
    separateStylesheet: true,
    minimize: true,
    devtool: 'source-map',
    target: 'client'
  },

  // server
  {
    target: 'node'
  }
]);