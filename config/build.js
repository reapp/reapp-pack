module.exports = {
  entry: './app/app.js',
  devtool: 'source-map',
  target: 'web',
  env: 'production',
  linkModules: true,
  debug: true,
  separateStylesheet: true,
  minify: true
};