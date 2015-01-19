## reapp-pack

Based heavily on the official [webpack/react-starter](https://github.com/webpack/react-starter) repo.

Exposes an object with `webpack` and `makeConfig`.

Webpack is just an export of the version of webpack used in this repository.

### makeConfig

Takes an array of, or a single config object. For now, I'm just pasting in the comments in code,
as this is changing fast!

```
config:
  entry: entrypoint file
  devtool: specify webpack devtool
  hot: use react-hot-loader
  prerender: compile bundle to ./build
  vendorChunk: split node_modules into vendor.js chunk
  commonsChunk: split common files into commons.js chunk
  longTermCaching: use hash name with files
  minimize: uglify and dedupe
```

Returns a valid webpack config.

### Todo

- generate the webpack.config.js to ./build

### MIT License