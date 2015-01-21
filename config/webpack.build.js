var pack = require('reapp-pack');

module.exports = pack({
  entry: './app/app.js',
  devtool: 'source-map',
  target: 'web',
  errors: true
});