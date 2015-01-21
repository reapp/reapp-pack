var pack = require('reapp-pack');

module.exports = pack({
  entry: './app/app.js',
  devtool: 'eval',
  target: 'web',
  server: true,
  port: 3011,
  hot: true
});