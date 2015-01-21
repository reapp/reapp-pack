var pack = require('reapp-pack');

// Default production config

module.exports = pack({
  entry: './app/app.js',
  devtool: 'source-map',
  target: 'web',
  errors: true
});