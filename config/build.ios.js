var pack = require('..');

require('reapp-object-assign');

module.exports = function(opts) {
  return pack(Object.assign({
    entry: './app/app.js',
    devtool: 'none',
    target: 'web',
    env: 'production',
    debug: true,
    separateStylesheet: true,
    minify: true
  }, opts));
}