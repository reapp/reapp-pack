var pack = require('..');

require('reapp-object-assign');

module.exports = function(opts) {
  return pack(Object.assign({
    entry: './app/app.js',
    devtool: 'eval',
    target: 'web',
    hot: true,
    server: true,
    port: 3011,
    debug: true
  }, opts));
}