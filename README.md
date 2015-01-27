## reapp-pack

A helper for generating webpack configs, along with some small helpers.
Includes `./webpackServer` for easy use of webpack-dev-server.

Based heavily on the official [webpack/react-starter](https://github.com/webpack/react-starter) repo.

Webpack is just an export of the version of webpack used in this repository.

### Usage

See required files in `./config`.

```js
var config = require('./config/webpack.run.js');
var webpackServer = require('reapp-pack/webpackServer');

webpackServer(config, {
  port: 3011,
  debug: true,
  hot: true
});
```

### Options

See `./index.js`.